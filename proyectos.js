const slider = document.getElementById('slider');
const scrollHint = document.querySelector('.scroll-hint');

const mediaViewer = document.getElementById('media-viewer');
const mediaBackdrop = document.getElementById('media-backdrop');
const mediaClose = document.getElementById('media-close');
const mediaStage = document.getElementById('media-stage');
const mediaCards = document.querySelectorAll('.card[data-type]');
const mediaTriggers = document.querySelectorAll('.js-open-media');

let targetX = 0;
let currentX = 0;
let rafId = null;
let touchStartX = 0;
let touchCurrentX = 0;

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
      </div>
    `;
  }

  if (type === 'youtube') {
    mediaStage.innerHTML = `
      <iframe
        src="${src}?autoplay=1&rel=0&modestbranding=1"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowfullscreen
        referrerpolicy="strict-origin-when-cross-origin">
      </iframe>
    `;
  }

  mediaViewer.classList.add('open');
  mediaViewer.setAttribute('aria-hidden', 'false');
  document.body.classList.add('viewer-open');

  if (type === 'video') {
    const video = document.getElementById('project-video');

    if (video) {
      video.load();

      video.addEventListener('loadeddata', () => {
        console.log('Vídeo cargado correctamente:', src);
      });

      video.addEventListener('error', () => {
        console.error('Error cargando vídeo:', src, video.error);
      });
    }
  }
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

window.addEventListener('wheel', (e) => {
  if (document.body.classList.contains('viewer-open')) return;

  e.preventDefault();
  targetX += e.deltaY * 2;
  clampTarget();

  if (!rafId) animate();
}, { passive: false });

window.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchCurrentX = touchStartX;
}, { passive: true });

window.addEventListener('touchmove', (e) => {
  touchCurrentX = e.touches[0].clientX;
}, { passive: true });

window.addEventListener('touchend', () => {
  if (document.body.classList.contains('viewer-open')) return;

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

window.addEventListener('load', () => {
  syncFromScroll();
});

mediaCards.forEach(card => {
  card.addEventListener('click', (e) => {
    if (e.target.closest('.card-titulo')) return;
    openCardMedia(card);
  });
});

mediaTriggers.forEach(trigger => {
  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const card = trigger.closest('.card');
    openCardMedia(card);
  });
});

if (mediaClose) {
  mediaClose.addEventListener('click', closeMedia);
}

if (mediaBackdrop) {
  mediaBackdrop.addEventListener('click', closeMedia);
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMedia();
});