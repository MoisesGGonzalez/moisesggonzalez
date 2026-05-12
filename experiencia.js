// ── Scroll horizontal con rueda del ratón (desktop) ──
const slider = document.getElementById('exp-slider');

if (slider) {
  slider.addEventListener('wheel', (e) => {
    e.preventDefault();
    slider.scrollLeft += e.deltaY * 1.2;
  }, { passive: false });
}

// ── MÓVIL ──
(function () {
  if (window.innerWidth > 768) return;

  const panel     = document.getElementById('exp-panel');
  const backBtn   = document.getElementById('mobile-back-btn');
  const swipeHint = document.getElementById('mobile-swipe-hint');

  function mostrarMosaico() {
    if (panel)   panel.classList.add('panel-hidden');
    if (backBtn) backBtn.classList.add('visible');
  }

  function mostrarPanel() {
    if (panel)   panel.classList.remove('panel-hidden');
    if (backBtn) backBtn.classList.remove('visible');
    if (slider)  slider.scrollLeft = 0;
  }

  if (swipeHint) swipeHint.addEventListener('click', mostrarMosaico);
  if (backBtn)   backBtn.addEventListener('click', mostrarPanel);

  let startXPanel = 0;
  if (panel) {
    panel.addEventListener('touchstart', (e) => {
      startXPanel = e.touches[0].clientX;
    }, { passive: true });
    panel.addEventListener('touchend', (e) => {
      const diff = startXPanel - e.changedTouches[0].clientX;
      if (diff > 60) mostrarMosaico();
    }, { passive: true });
  }

  let startXSlider = 0;
  if (slider) {
    slider.addEventListener('touchstart', (e) => {
      startXSlider = e.touches[0].clientX;
    }, { passive: true });
    slider.addEventListener('touchend', (e) => {
      const diff = e.changedTouches[0].clientX - startXSlider;
      if (slider.scrollLeft <= 5 && diff > 60) mostrarPanel();
    }, { passive: true });
  }
})();