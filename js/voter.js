// ============================================================
// voter.js — Logika halaman voting
// ============================================================
import { db } from "./firebase.js";
import {
  collection, query, where, getDocs, doc, updateDoc, addDoc, serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

import { SITE, FIREBASE, PASLON } from "./config.js";

// ---------- Helper ----------
const $ = (id) => document.getElementById(id);
const show = (el) => el.classList.remove("hidden");
const hide = (el) => el.classList.add("hidden");

// ---------- Elemen ----------
const loginView    = $("login-view");
const voteView     = $("vote-view");
const successView  = $("success-view");
const loginForm    = $("login-form");
const inputNama    = $("input-nama");
const inputToken   = $("input-token");
const btnLogin     = $("btn-login");
const loginError   = $("login-error");
const profileChip  = $("profile-chip");
const profileAvatar= $("profile-avatar");
const profileName  = $("profile-name");
const navLogout    = $("nav-logout");
const btnLogout    = $("btn-logout");
const candidateGrid= $("candidate-grid");
const modalOverlay = $("candidate-modal");
const modalBody    = $("modal-body");
const modalClose   = $("modal-close");
const successPaslon= $("success-paslon");
const btnFinish    = $("btn-finish");
const alreadyVotedView = $("already-voted-view");

// ---------- Penanda "perangkat ini sudah vote" (Browser Storage) ----------
// Ganti angka tahun jika nanti ada pemilihan baru, supaya penanda lama tidak berlaku.
const VOTED_KEY = "ekskul2026_sudah_vote";

function hasVotedOnDevice() {
  try { return localStorage.getItem(VOTED_KEY) === "1"; }
  catch (e) { return false; } // storage diblokir -> anggap belum vote
}
function markVotedOnDevice() {
  try { localStorage.setItem(VOTED_KEY, "1"); } catch (e) { /* abaikan */ }
}
function showAlreadyVoted() {
  sessionStorage.removeItem("tokenId");
  sessionStorage.removeItem("voterName");
  hideProfile();
  hide(loginView);
  hide(voteView);
  hide(successView);
  show(alreadyVotedView);
}

// ---------- Inisialisasi Site ----------
$("nav-title").textContent = SITE.title;
$("site-footer").textContent = SITE.footer;
document.title = SITE.title;

// ---------- Util ----------
function initials(name) {
  return name.trim().split(/\s+/).slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "").join("");
}

function showLoginError(msg) {
  loginError.textContent = msg;
  show(loginError);
}
function clearLoginError() { hide(loginError); }

function setProfile(name) {
  profileName.textContent = name;
  profileAvatar.textContent = initials(name);
  show(profileChip);
}
function hideProfile() { hide(profileChip); }

// ---------- Render kandidat ----------
function renderCandidates() {
  candidateGrid.innerHTML = "";
  PASLON.forEach((p) => {
    const num = String(p.nomor).padStart(2, "0");
    const card = document.createElement("article");
    card.className = "candidate-card";
    card.dataset.id = p.id;
    card.innerHTML = `
      <div class="card-media">
        <div class="card-photo">
          <img src="${p.ketua.foto}" alt="Foto ketua paslon ${p.nomor}" loading="lazy"
               onerror="this.style.background='#f5f2ec'" />
          <span class="role-tag">Ketua</span>
        </div>
        <div class="card-photo">
          <img src="${p.wakil.foto}" alt="Foto wakil paslon ${p.nomor}" loading="lazy"
               onerror="this.style.background='#f5f2ec'" />
          <span class="role-tag">Wakil</span>
        </div>
      </div>
      <div class="card-body">
        <div class="card-number">№ ${num}</div>
        <h3 class="card-name">${p.ketua.nama} <span class="amp">&</span> ${p.wakil.nama}</h3>
        <p class="card-label">Calon Ketua &amp; Wakil</p>
        <div class="card-divider"></div>
        <p class="card-visi">${p.visi}</p>
        <button class="card-cta" data-id="${p.id}" type="button">
          <span>Lihat Detail</span>
          <span class="arrow" aria-hidden="true">→</span>
        </button>
      </div>
    `;
    candidateGrid.appendChild(card);
  });
}

// Tambahkan juga di openModal — modal markup mengikuti desain baru:
function openModal(paslonId) {
  const p = PASLON.find((x) => x.id === paslonId);
  if (!p) return;

  modalBody.innerHTML = `
    <div class="modal-media">
      <div class="modal-photo">
        <img src="${p.ketua.foto}" alt="Foto ketua" />
        <div class="modal-photo-label">
          <span class="role-tag">Ketua</span>
          <strong>${p.ketua.nama}</strong>
        </div>
      </div>
      <div class="modal-photo">
        <img src="${p.wakil.foto}" alt="Foto wakil" />
        <div class="modal-photo-label">
          <span class="role-tag">Wakil</span>
          <strong>${p.wakil.nama}</strong>
        </div>
      </div>
    </div>
    <div class="modal-content">
      <div class="modal-number">№ ${String(p.nomor).padStart(2, "0")}</div>
      <h2 id="modal-title" class="modal-name">
        ${p.ketua.nama} <span class="amp">&</span> ${p.wakil.nama}
      </h2>
      <p class="modal-subtitle">Calon Ketua &amp; Wakil Ketua Ekskul Komputer</p>

      <section class="modal-section">
        <h3>Visi</h3>
        <p>${p.visi}</p>
      </section>
      <section class="modal-section">
        <h3>Misi</h3>
        <ol>${p.misi.map((m) => `<li>${m}</li>`).join("")}</ol>
      </section>

      <button class="btn-vote-modal" data-id="${p.id}" type="button">
        Vote Paslon ${p.nomor}
      </button>
    </div>
  `;

  show(modalOverlay);
  document.body.classList.add("modal-open");
}

function closeModal() {
  hide(modalOverlay);
  document.body.classList.remove("modal-open");
  modalBody.innerHTML = "";
}

modalClose.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modalOverlay.classList.contains("hidden")) closeModal();
});

// ---------- Aksi vote ----------
async function submitVote(paslonId) {
  // Cek penanda perangkat (misal vote sudah dilakukan di tab lain)
  if (hasVotedOnDevice()) {
    closeModal();
    showAlreadyVoted();
    return;
  }

  const tokenId = sessionStorage.getItem("tokenId");
  const voterName = sessionStorage.getItem("voterName");

  if (!tokenId || !voterName) {
    closeModal();
    alert("Sesi kamu sudah berakhir. Silakan login ulang.");
    window.location.reload();
    return;
  }

  // Konfirmasi via dialog native (sederhana, tidak bergantung CSS)
  if (!confirm(`Yakin ingin memilih Paslon ${paslonId}? Suara tidak dapat diubah.`)) {
    return;
  }

  // Nonaktifkan semua tombol vote
  document.querySelectorAll(".btn-vote-modal, .btn-detail").forEach((b) => (b.disabled = true));

  try {
    // 1. Simpan suara
    await addDoc(collection(db, FIREBASE.votesCollection), {
      paslon: paslonId,
      voter: voterName,
      waktu: serverTimestamp(),
    });

    // Tandai perangkat ini sudah vote (langsung setelah suara tersimpan)
    markVotedOnDevice();

    // 2. Tandai token terpakai
    await updateDoc(doc(db, FIREBASE.tokensCollection, tokenId), {
      [FIREBASE.tokenFields.used]: true,
    });

    // 3. Tampilkan layar sukses
    closeModal();
    hide(voteView);
    hide(loginView);
    const p = PASLON.find((x) => x.id === paslonId);
    successPaslon.textContent = `Paslon ${p?.nomor ?? paslonId}`;
    show(successView);

    // Bersihkan sesi
    sessionStorage.removeItem("tokenId");
    sessionStorage.removeItem("voterName");
    hideProfile();
  } catch (err) {
    console.error("Gagal vote:", err);
    // Jika suara sudah tersimpan tapi langkah berikutnya gagal, jangan izinkan vote ulang
    if (hasVotedOnDevice()) {
      closeModal();
      showAlreadyVoted();
      return;
    }
    alert("Gagal mengirim suara. Periksa koneksi internet lalu coba lagi.");
    document.querySelectorAll(".btn-vote-modal, .btn-detail").forEach((b) => (b.disabled = false));
  }
}

// ---------- Event delegation ----------
candidateGrid.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-detail");
  const card = e.target.closest(".candidate-card");
  if (btn) openModal(btn.dataset.id);
  else if (card) openModal(card.dataset.id);
});

modalBody.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-vote-modal");
  if (btn) submitVote(btn.dataset.id);
});

// ---------- Login ----------
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearLoginError();

  if (hasVotedOnDevice()) {
    showAlreadyVoted();
    return;
  }

  const nama = inputNama.value.trim();
  const token = inputToken.value.trim();

  if (!nama || !token) {
    showLoginError("Nama dan token wajib diisi!");
    return;
  }

  btnLogin.disabled = true;
  btnLogin.textContent = "Memeriksa token…";

  try {
    const q = query(
      collection(db, FIREBASE.tokensCollection),
      where(FIREBASE.tokenFields.code, "==", token)
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      showLoginError("Token tidak ditemukan atau salah.");
      return;
    }

    let tokenDoc = null;
    snap.forEach((d) => (tokenDoc = { id: d.id, ...d.data() }));

    if (tokenDoc[FIREBASE.tokenFields.used]) {
      showLoginError("Token ini sudah digunakan untuk memilih.");
      return;
    }

    // Sukses
    sessionStorage.setItem("voterName", nama);
    sessionStorage.setItem("tokenId", tokenDoc.id);
    enterVoteView(nama);
  } catch (err) {
    console.error(err);
    showLoginError("Gagal terhubung ke database. Coba lagi.");
  } finally {
    btnLogin.disabled = false;
    btnLogin.textContent = "Masuk & Mulai Vote";
  }
});

// ---------- Navigasi view ----------
function enterVoteView(name) {
  hide(loginView);
  hide(successView);
  show(voteView);
  setProfile(name);
  renderCandidates();
}

function logout() {
  sessionStorage.removeItem("tokenId");
  sessionStorage.removeItem("voterName");
  hideProfile();
  hide(voteView);
  hide(successView);
  show(loginView);
  loginForm.reset();
  clearLoginError();
}

navLogout.addEventListener("click", logout);
btnLogout.addEventListener("click", logout);
btnFinish.addEventListener("click", () => window.location.reload());

// ---------- Restore sesi saat refresh ----------
(function restoreSession() {
  if (hasVotedOnDevice()) {
    showAlreadyVoted();
    return;
  }
  const name = sessionStorage.getItem("voterName");
  const tokenId = sessionStorage.getItem("tokenId");
  if (name && tokenId) {
    enterVoteView(name);
  }
})();