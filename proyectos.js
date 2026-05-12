const slider = document.getElementById('slider');
const scrollHint = document.querySelector('.scroll-hint');
const mediaViewer = document.getElementById('media-viewer');
const mediaBackdrop = document.getElementById('media-backdrop');
const mediaClose = document.getElementById('media-close');
const mediaStage = document.getElementById('media-stage');
const mediaTriggers = document.querySelectorAll('.js-open-media');

const isMobile = () => window.innerWidth <= 768;

let targetX = 0;
let currentX = 0;
let rafId = null;

function clampTarget() {
  targetX = Math.max(0, Math.min(targetX, slider.scrollWidth - slider.clientWidth));
}

function syncFromScroll() {
  currentX = slider.scrollLeft;
  targetX = slider.scrollLeft;
  updateScrollHint();
}

function updateScrollHint() {
  if (!scrollHint) return;
  const maxScroll = slider.scrollWidth - slider.clientWidth;
  scrollHint.style.opacity = targetX > Math.max(60, maxScroll * 0.08) ? '0' : '1';
}

function animate() {
  currentX += (targetX - currentX) * 0.07;
  slider.scrollLeft = currentX;
  updateScrollHint();
  if (Math.abs(targetX - currentX) > 0.5) {
    rafId = requestAnimationFrame(animate);
  } else {
    currentX = targetX;
    slider.scrollLeft = currentX;
    updateScrollHint();
    rafId = null;
  }
}

function openMedia(type, src) {
  if (!mediaViewer || !mediaStage) return;
  if (type === 'video') {
    mediaStage.innerHTML = `
      <div class="media-video-wrap">
        <video id="project-video" controls playsinline preload="metadata">
          <source src="${src}" type="video/mp4">
        </video>
      </div>`;
    const video = document.getElementById('project-video');
    if (video) video.load();
  }
  if (type === 'youtube') {
    mediaStage.innerHTML = `
      <iframe
        src="${src}?autoplay=1&rel=0&modestbranding=1"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowfullscreen
        referrerpolicy="strict-origin-when-cross-origin">
      </iframe>`;
  }
  mediaViewer.classList.add('open');
  mediaViewer.setAttribute('aria-hidden', 'false');
  document.body.classList.add('viewer-open');
}

function closeMedia() {
  if (!mediaViewer || !mediaStage) return;
  mediaViewer.classList.remove('open');
  mediaViewer.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('viewer-open');
  mediaStage.innerHTML = '';
}

function openCardMedia(card) {
  if (!card) return;
  const type = card.dataset.type;
  const src = card.dataset.src;
  if (!type || !src) return;
  openMedia(type, src);
}

// ── DESKTOP: rueda y touch con inercia ──
window.addEventListener('wheel', (e) => {
  if (isMobile()) return;
  if (document.body.classList.contains('viewer-open')) return;
  e.preventDefault();
  targetX += e.deltaY * 2;
  clampTarget();
  if (!rafId) animate();
}, { passive: false });

let touchStartX = 0;
let touchCurrentX = 0;
let touchStartY = 0;
let touchMoved = false;

window.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchCurrentX = touchStartX;
  touchStartY = e.touches[0].clientY;
  touchMoved = false;
}, { passive: true });

window.addEventListener('touchmove', (e) => {
  touchCurrentX = e.touches[0].clientX;
  const diffX = Math.abs(touchStartX - touchCurrentX);
  const diffY = Math.abs(touchStartY - e.touches[0].clientY);
  if (diffX > 8 || diffY > 8) touchMoved = true;
}, { passive: true });

window.addEventListener('touchend', (e) => {
  if (document.body.classList.contains('viewer-open')) return;
  if (isMobile()) return; // En móvil el scroll es nativo
  const diff = touchStartX - touchCurrentX;
  if (Math.abs(diff) > 40) {
    targetX += diff * 2.4;
    clampTarget();
    if (!rafId) animate();
  }
});

slider.addEventListener('scroll', () => {
  if (!rafId) syncFromScroll();
}, { passive: true });

window.addEventListener('resize', () => {
  clampTarget();
  currentX = Math.max(0, Math.min(currentX, slider.scrollWidth - slider.clientWidth));
  slider.scrollLeft = currentX;
  updateScrollHint();
});

window.addEventListener('load', () => { syncFromScroll(); });

// ── VISOR: cierre ──
if (mediaClose) mediaClose.addEventListener('click', closeMedia);
if (mediaBackdrop) mediaBackdrop.addEventListener('click', closeMedia);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMedia(); });

mediaTriggers.forEach(trigger => {
  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openCardMedia(trigger.closest('.card'));
  });
});

// ══════════════════════════════════════
// MÓVIL — tarjetas con tap
// ══════════════════════════════════════
let activeCard = null;

document.querySelectorAll('.card[data-type]').forEach(card => {

  // Usamos touchend en lugar de click para evitar que el scroll lo cancele
  card.addEventListener('touchend', (e) => {
    if (!isMobile()) return;
    if (document.body.classList.contains('viewer-open')) return;

    // Si hubo movimiento real → era scroll, ignorar
    if (touchMoved) return;

    const playBtn = card.querySelector('.card-play');

    // Toque en el botón play → abrir visor
    if (playBtn && (e.target === playBtn || playBtn.contains(e.target))) {
      e.preventDefault();
      openCardMedia(card);
      return;
    }

    // Toque en tarjeta ya activa → nada
    if (card.classList.contains('active')) return;

    // Desactivar tarjeta anterior
    if (activeCard && activeCard !== card) {
      activeCard.classList.remove('active');
    }

    // Activar esta tarjeta
    e.preventDefault();
    card.classList.add('active');
    activeCard = card;
  }, { passive: false });
});

// Toque fuera → desactivar tarjeta
document.addEventListener('touchend', (e) => {
  if (!isMobile()) return;
  if (touchMoved) return;
  if (activeCard && !activeCard.contains(e.target)) {
    activeCard.classList.remove('active');
    activeCard = null;
  }
}, { passive: true });

// ── HAMBURGUESA DEL HEADER ──
const headerHamburger = document.getElementById('header-hamburger');
const mobileMenuOverlay = document.getElementById('menu-overlay');

if (headerHamburger && mobileMenuOverlay) {
  headerHamburger.addEventListener('click', () => {
    headerHamburger.classList.toggle('open');
    mobileMenuOverlay.classList.toggle('open');
  });
  mobileMenuOverlay.addEventListener('click', (e) => {
    if (e.target === mobileMenuOverlay) {
      headerHamburger.classList.remove('open');
      mobileMenuOverlay.classList.remove('open');
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      headerHamburger.classList.remove('open');
      mobileMenuOverlay.classList.remove('open');
    }
  });
}