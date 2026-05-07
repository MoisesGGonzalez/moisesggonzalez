// Scroll horizontal con rueda del ratón
const slider = document.getElementById('exp-slider');

if (slider) {
  slider.addEventListener('wheel', (e) => {
    e.preventDefault();
    slider.scrollLeft += e.deltaY * 1.2;
  }, { passive: false });
}

