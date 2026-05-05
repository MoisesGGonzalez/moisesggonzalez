const slider       = document.getElementById('slider');
const hamburger    = document.getElementById('hamburger');
const menuOverlay  = document.getElementById('menu-overlay');
const sideNav      = document.querySelector('.side-nav');

const navLabels = Array.from(sideNav.querySelectorAll('.nav-label'));

const HAMB_TOP   = 36 + 18;
const HAMB_LEFT  = 48;
const HAMB_WIDTH = 36;
const ANIM_END   = window.innerWidth;

let targetX  = 0;
let currentX = 0;
let rafId    = null;

window.addEventListener('wheel', (e) => {
  e.preventDefault();
  targetX += e.deltaY * 2;
  targetX = Math.max(0, Math.min(targetX, slider.scrollWidth - slider.clientWidth));
  if (!rafId) animate();
}, { passive: false });

function animate() {
  currentX += (targetX - currentX) * 0.07;
  slider.scrollLeft = currentX;
  updateMenuAnimation(currentX);

  if (Math.abs(targetX - currentX) > 0.5) {
    rafId = requestAnimationFrame(animate);
  } else {
    currentX = targetX;
    slider.scrollLeft = currentX;
    updateMenuAnimation(currentX);
    rafId = null;
  }
}

let touchStartX = 0;
window.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; });
window.addEventListener('touchend', (e) => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) {
    targetX += diff * 3;
    targetX = Math.max(0, Math.min(targetX, slider.scrollWidth - slider.clientWidth));
    if (!rafId) animate();
  }
});

function updateMenuAnimation(scrollX) {
  const progress = Math.min(Math.max(scrollX / ANIM_END, 0), 1);
  const animComplete = progress >= 0.98;

  // Hamburguesa: visible solo cuando la animación está completa
  if (animComplete) {
    hamburger.style.opacity = '1';
    hamburger.style.pointerEvents = 'all';
    hamburger.classList.add('visible');
  } else {
    hamburger.style.opacity = '0';
    hamburger.style.pointerEvents = 'none';
    hamburger.classList.remove('visible');
    // Cerrar overlay si estaba abierto
    if (progress < 0.5) {
      menuOverlay.classList.remove('open');
      hamburger.classList.remove('open');
    }
  }

  navLabels.forEach((label, i) => {
    const itemEl = label.closest('.menu-item') || label.parentElement;
    const rect   = itemEl.getBoundingClientRect();

    if (i < 3) {
      if (animComplete) {
        // Ocultar labels — la hamburguesa real toma el relevo
        label.style.opacity        = '0';
        label.style.pointerEvents  = 'none';
        return;
      }

      const rayaOffsets  = [-7, 0, 7];
      const targetY      = HAMB_TOP + rayaOffsets[i];
      const targetXpos   = HAMB_LEFT;
      const originX      = 60;
      const originY      = rect.top + rect.height / 2;

      const currentY    = originY    + (targetY    - originY)    * progress;
      const currentXpos = originX    + (targetXpos - originX)    * progress;
      const scaleY      = 1 - (0.93  * progress);
      const scaleX      = 1 - ((1 - HAMB_WIDTH / Math.max(rect.width, 1)) * progress);
      const ls          = 4 * (1 - progress);
      const opacity     = 0.65 + (0.10 * progress);

      label.style.transform     = `translateX(${currentXpos - originX}px) translateY(${currentY - originY}px) scaleY(${scaleY}) scaleX(${scaleX})`;
      label.style.letterSpacing = `${ls}px`;
      label.style.opacity       = opacity;
      label.style.color         = `rgba(255,255,255,${opacity})`;
      label.style.pointerEvents = progress > 0.1 ? 'none' : 'all';

      const sub = itemEl.querySelector('.side-submenu');
      if (sub) sub.style.display = progress > 0.05 ? 'none' : '';

    } else {
      // Palabras extra: suben y desaparecen
      const fadeProgress = Math.min(Math.max((progress - 0.2) / 0.5, 0), 1);
      const riseY        = -60 * fadeProgress;
      label.style.transform     = `translateY(${riseY}px)`;
      label.style.opacity       = `${(1 - fadeProgress) * 0.65}`;
      label.style.letterSpacing = `${4 * (1 - fadeProgress)}px`;
      label.style.pointerEvents = progress > 0.5 ? 'none' : 'all';
    }
  });

  // Reseteo completo al volver al inicio
  if (progress < 0.02) {
    navLabels.forEach(label => {
      label.style.transform     = '';
      label.style.opacity       = '';
      label.style.letterSpacing = '';
      label.style.color         = '';
      label.style.pointerEvents = '';
    });
    sideNav.querySelectorAll('.side-submenu').forEach(s => s.style.display = '');
  }
}

// ── HAMBURGUESA ──
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  menuOverlay.classList.toggle('open');
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    hamburger.classList.remove('open');
    menuOverlay.classList.remove('open');
  }
});

// ── ANIMACIONES DE ENTRADA ──
const animatedEls = document.querySelectorAll('.bio-inner, .content-proyecto');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
    else entry.target.classList.remove('visible');
  });
}, { root: slider, threshold: 0.3 });

animatedEls.forEach(el => observer.observe(el));