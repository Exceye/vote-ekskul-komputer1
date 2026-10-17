// ============================================================
// admin.js — Login admin + dashboard realtime
// ============================================================
import { db } from "./firebase.js";
import {
  collection, onSnapshot, doc, getDoc,
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

import { FIREBASE, PASLON, CHART_COLORS } from "./config.js";

const $ = (id) => document.getElementById(id);
const show = (el) => el.classList.remove("hidden");
const hide = (el) => el.classList.add("hidden");

// ---------- Elemen ----------
const loginAdminArea   = $("login-admin");
const dashboardAdminArea = $("dashboard-admin");
const inputKey         = $("input-key");
const btnLoginAdmin    = $("btn-login-admin");
const btnLogoutAdmin   = $("btn-logout-admin");
const errorKey         = $("error-key");
const totalSuaraEl     = $("total-suara");
const totalPaslonEl    = $("total-paslon");
const summaryEl        = $("vote-summary");

let voteChart = null;
let unsubscribeVotes = null;

// ---------- Chart ----------
function buildChart() {
  const canvas = $("voteChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  if (voteChart) voteChart.destroy();

  voteChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: PASLON.map((p) => `Paslon ${p.nomor}`),
      datasets: [{
        data: PASLON.map(() => 0),
        backgroundColor: PASLON.map((p, i) => p.warna || CHART_COLORS[i % CHART_COLORS.length]),
        borderColor: "#faf9f6",
        borderWidth: 3,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { position: "bottom", labels: { padding: 16, font: { size: 13 } } },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const val = ctx.parsed || 0;
              const pct = total ? ((val / total) * 100).toFixed(1) : "0.0";
              return ` ${ctx.label}: ${val} suara (${pct}%)`;
            },
          },
        },
      },
    },
  });

  totalPaslonEl.textContent = PASLON.length;
}

// ---------- Render ringkasan ----------
function renderSummary(counts, total) {
  summaryEl.innerHTML = PASLON.map((p, i) => {
    const val = counts[p.id] || 0;
    const pct = total ? ((val / total) * 100).toFixed(1) : "0.0";
    return `
      <div class="summary-row">
        <span class="summary-dot" style="background:${p.warna || CHART_COLORS[i % CHART_COLORS.length]}"></span>
        <span class="summary-label">Paslon ${p.nomor}</span>
        <span class="summary-value">${val} suara</span>
        <span class="summary-pct">${pct}%</span>
      </div>`;
  }).join("");
}

// ---------- Realtime listener ----------
function mulaiTarikData() {
  if (unsubscribeVotes) unsubscribeVotes();

  unsubscribeVotes = onSnapshot(
    collection(db, FIREBASE.votesCollection),
    (snapshot) => {
      const counts = {};
      PASLON.forEach((p) => (counts[p.id] = 0));

      snapshot.forEach((d) => {
        const id = String(d.data().paslon ?? "");
        if (id in counts) counts[id] += 1;
      });

      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      totalSuaraEl.textContent = total;

      if (voteChart) {
        voteChart.data.datasets[0].data = PASLON.map((p) => counts[p.id]);
        voteChart.update();
      }
      renderSummary(counts, total);
    },
    (error) => {
      console.error("onSnapshot error:", error);
      summaryEl.innerHTML = `<p class="error-msg">Gagal memuat data realtime. Periksa koneksi / Firestore rules.</p>`;
    }
  );
}

// ---------- Login admin ----------
btnLoginAdmin.addEventListener("click", async () => {
  const keyMasuk = inputKey.value.trim();
  hide(errorKey);

  if (!keyMasuk) {
    errorKey.textContent = "Kunci rahasia tidak boleh kosong!";
    show(errorKey);
    return;
  }

  btnLoginAdmin.disabled = true;
  btnLoginAdmin.textContent = "Memeriksa…";

  try {
    const { collection: coll, doc: docId, adminKeyField } = FIREBASE.settings;
    const docSnap = await getDoc(doc(db, coll, docId));

    if (!docSnap.exists()) {
      errorKey.textContent = "Sistem error: konfigurasi admin belum dibuat di Firebase.";
      show(errorKey);
      return;
    }

    const adminKeyFirebase = docSnap.data()?.[adminKeyField];
    if (!adminKeyFirebase) {
      errorKey.textContent = "Field adminKey belum diatur di Firestore.";
      show(errorKey);
      return;
    }

    if (keyMasuk !== adminKeyFirebase) {
      errorKey.textContent = "Kunci yang kamu masukkan salah!";
      show(errorKey);
      return;
    }

    // Sukses
    inputKey.value = "";
    hide(loginAdminArea);
    show(dashboardAdminArea);

    buildChart();
    mulaiTarikData();
  } catch (err) {
    console.error("Login admin error:", err);
    errorKey.textContent = "Gagal terhubung ke database. Cek koneksi internet.";
    show(errorKey);
  } finally {
    btnLoginAdmin.disabled = false;
    btnLoginAdmin.textContent = "Buka Dashboard";
  }
});

inputKey.addEventListener("keydown", (e) => {
  if (e.key === "Enter") btnLoginAdmin.click();
});

// ---------- Logout ----------
btnLogoutAdmin.addEventListener("click", () => {
  if (unsubscribeVotes) { unsubscribeVotes(); unsubscribeVotes = null; }
  if (voteChart) { voteChart.destroy(); voteChart = null; }
  hide(dashboardAdminArea);
  show(loginAdminArea);
  totalSuaraEl.textContent = "0";
  summaryEl.innerHTML = "";
});