// ============================================================
// ui.js — Visual enhancement layer
// ------------------------------------------------------------
// Semua efek visual HANYA ada di file ini. Tidak ada logika
// voting/admin di sini. Jika file ini dihapus, aplikasi tetap
// berjalan (hanya kehilangan carousel control, ripple, confetti).
// ============================================================

// ---------- 1. Navbar scroll shadow ----------
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ---------- 2. Ripple effect pada semua .btn ----------
(function initRipple() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn, .card-cta, .btn-vote-modal, .carousel-btn');
    if (!btn || btn.disabled) return;

    if (getComputedStyle(btn).position === 'static') {
      btn.style.position = 'relative';
    }
    if (getComputedStyle(btn).overflow !== 'hidden') {
      btn.style.overflow = 'hidden';
    }

    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top  = `${e.clientY - rect.top  - size / 2}px`;

    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  });
})();

// ---------- 3. Carousel controller ----------
(function initCarousel() {
  const track = document.getElementById('candidate-grid');
  const carousel = document.getElementById('carousel');
  const dotsContainer = document.getElementById('carousel-dots');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');

  if (!track || !carousel || !dotsContainer) return;

  let currentPages = 0;

  function getStep() {
    const first = track.querySelector('.candidate-card');
    if (!first) return 0;
    const gap = parseFloat(getComputedStyle(track).columnGap) ||
                parseFloat(getComputedStyle(track).gap) || 20;
    return first.offsetWidth + gap;
  }

  function getPageCount() {
    const step = getStep();
    if (!step) return 1;
    const maxScroll = track.scrollWidth - track.clientWidth;
    if (maxScroll <= 4) return 1;
    return Math.ceil(maxScroll / step) + 1;
  }

  function rebuild() {
    const cards = track.querySelectorAll('.candidate-card');
    dotsContainer.innerHTML = '';

    if (cards.length === 0) {
      currentPages = 0;
      return;
    }

    currentPages = getPageCount();
    carousel.classList.toggle('is-static', currentPages <= 1);

    if (currentPages <= 1) return;

    for (let i = 0; i < currentPages; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', `Ke halaman ${i + 1}`);
      dot.dataset.index = i;
      dot.addEventListener('click', () => {
        const step = getStep();
        track.scrollTo({ left: i * step, behavior: 'smooth' });
      });
      dotsContainer.appendChild(dot);
    }

    updateState();
  }

  function updateState() {
    if (currentPages <= 1) return;
    const step = getStep();
    if (!step) return;

    const scrollLeft = track.scrollLeft;
    const maxScroll = track.scrollWidth - track.clientWidth;
    const idx = Math.min(
      Math.round(scrollLeft / step),
      currentPages - 1
    );

    dotsContainer.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('active', i === idx);
    });

    if (prevBtn) prevBtn.disabled = scrollLeft <= 4;
    if (nextBtn) nextBtn.disabled = scrollLeft >= maxScroll - 4;
  }

  function scrollByPage(dir) {
    const step = getStep();
    if (!step) return;
    track.scrollBy({ left: dir * step, behavior: 'smooth' });
  }

  prevBtn?.addEventListener('click', () => scrollByPage(-1));
  nextBtn?.addEventListener('click', () => scrollByPage(1));

  track.addEventListener('scroll', updateState, { passive: true });
  window.addEventListener('resize', rebuild);

  // Rebuild kapan pun voter.js render ulang cards
  new MutationObserver(() => {
    clearTimeout(window.__carouselRebuildT);
    window.__carouselRebuildT = setTimeout(rebuild, 60);
  }).observe(track, { childList: true });
})();

// ---------- 4. Confetti saat sukses ----------
(function initConfetti() {
  const successView = document.getElementById('success-view');
  const layer = document.getElementById('confetti-layer');
  if (!successView || !layer) return;

  const COLORS = ['#0f766e', '#14b8a6', '#1e293b', '#f5f2ec', '#0d9488'];

  function fire() {
    for (let i = 0; i < 36; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';

      if (Math.random() > 0.6) {
        piece.style.width = '8px';
        piece.style.height = '8px';
        piece.style.borderRadius = '50%';
      }

      piece.style.left = `${Math.random() * 100}vw`;
      piece.style.background = COLORS[Math.floor(Math.random() * COLORS.length)];
      piece.style.setProperty('--dur', `${1.6 + Math.random() * 1.4}s`);
      piece.style.setProperty('--delay', `${Math.random() * 0.4}s`);
      piece.style.setProperty('--rot', `${Math.random() * 360}deg`);
      piece.style.setProperty('--rot-end', `${360 + Math.random() * 540}deg`);

      layer.appendChild(piece);
      setTimeout(() => piece.remove(), 3500);
    }
  }

  new MutationObserver(() => {
    if (!successView.classList.contains('hidden')) fire();
  }).observe(successView, { attributes: true, attributeFilter: ['class'] });
})();

// ---------- 5. Counter animation (admin) ----------
(function initCounter() {
  const el = document.getElementById('total-suara');
  if (!el) return;

  function animate(target) {
    const start = parseInt(el.textContent, 10) || 0;
    const end = parseInt(target, 10) || 0;
    if (start === end) return;

    const duration = 600;
    const t0 = performance.now();

    (function step(now) {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(start + (end - start) * eased);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = end;
    })(performance.now());
  }

  let lastValue = el.textContent;
  new MutationObserver(() => {
    const current = el.textContent;
    if (current === lastValue) return;
    lastValue = current;
    animate(current);
  }).observe(el, { childList: true, characterData: true, subtree: true });
})();