// proyectos.js
const slider = document.getElementById('slider');

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
  if (Math.abs(targetX - currentX) > 0.5) {
    rafId = requestAnimationFrame(animate);
  } else {
    currentX = targetX;
    slider.scrollLeft = currentX;
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