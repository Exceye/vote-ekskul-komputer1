// ============================================================
// effects.js — Ripple, tilt, confetti, counter, navbar scroll
// ============================================================

// ---------- 1. Navbar scroll shadow ----------
const navbar = document.querySelector('.navbar');
if (navbar) {
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ---------- 2. Ripple effect pada semua .btn ----------
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn');
  if (!btn || btn.disabled) return;

  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
  ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

  // Pastikan tombol relatif terhadap posisi
  if (getComputedStyle(btn).position === 'static') {
    btn.style.position = 'relative';
  }
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 700);
});

// ---------- 3. 3D tilt pada candidate-card (delegated) ----------
let lastTiltedCard = null;
document.addEventListener('mousemove', (e) => {
  const card = e.target.closest?.('.candidate-card');
  if (card !== lastTiltedCard && lastTiltedCard) {
    lastTiltedCard.style.setProperty('--rx', '0deg');
    lastTiltedCard.style.setProperty('--ry', '0deg');
  }
  lastTiltedCard = card;
  if (!card) return;

  const rect = card.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width - 0.5;
  const y = (e.clientY - rect.top) / rect.height - 0.5;
  card.style.setProperty('--rx', `${(-y * 6).toFixed(2)}deg`);
  card.style.setProperty('--ry', `${(x * 6).toFixed(2)}deg`);
});

// ---------- 4. Confetti saat vote sukses ----------
function fireConfetti() {
  const layer = document.getElementById('confetti-layer');
  if (!layer) return;

  const colors = ['#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e'];

  for (let i = 0; i < 80; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';

    const isCircle = Math.random() > 0.6;
    if (isCircle) {
      piece.style.width = '10px';
      piece.style.height = '10px';
      piece.style.borderRadius = '50%';
    }

    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.setProperty('--dur', `${2 + Math.random() * 2.2}s`);
    piece.style.setProperty('--delay', `${Math.random() * 0.6}s`);
    piece.style.setProperty('--rot', `${Math.random() * 360}deg`);
    piece.style.setProperty('--rot-end', `${Math.random() * 900 + 360}deg`);

    layer.appendChild(piece);
    setTimeout(() => piece.remove(), 5200);
  }
}

// Pantau success-view: saat hidden hilang, tembak confetti
const successView = document.getElementById('success-view');
if (successView) {
  const obs = new MutationObserver(() => {
    if (!successView.classList.contains('hidden')) {
      fireConfetti();
    }
  });
  obs.observe(successView, { attributes: true, attributeFilter: ['class'] });
}

// ---------- 5. Counter animation untuk admin ----------
function animateNumber(el, target) {
  const start = parseInt(el.textContent, 10) || 0;
  const end = parseInt(target, 10) || 0;
  if (start === end) return;

  const duration = 700;
  const t0 = performance.now();

  const step = (now) => {
    const p = Math.min((now - t0) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(start + (end - start) * eased);
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = end;
  };
  requestAnimationFrame(step);
}

const totalSuaraEl = document.getElementById('total-suara');
if (totalSuaraEl) {
  const numObserver = new MutationObserver(() => {
    const newVal = totalSuaraEl.textContent;
    // Hentikan observer sementara agar tidak looping
    numObserver.disconnect();
    animateNumber(totalSuaraEl, newVal);
    numObserver.observe(totalSuaraEl, { childList: true, characterData: true, subtree: true });
  });
  numObserver.observe(totalSuaraEl, { childList: true, characterData: true, subtree: true });
}