const hamburger = document.getElementById('hamburger');
const menuOverlay = document.getElementById('menu-overlay');

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

// Cerrar al hacer clic en el backdrop oscuro
menuOverlay.addEventListener('click', (e) => {
  if (e.target === menuOverlay) {
    hamburger.classList.remove('open');
    menuOverlay.classList.remove('open');
  }
});