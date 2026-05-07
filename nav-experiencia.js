const hamburger = document.getElementById('hamburger');
const menuOverlay = document.getElementById('menu-overlay');

if (hamburger && menuOverlay) {
  hamburger.addEventListener('click', function () {
    hamburger.classList.toggle('open');
    menuOverlay.classList.toggle('open');
  });

  menuOverlay.addEventListener('click', function (e) {
    if (e.target === menuOverlay) {
      hamburger.classList.remove('open');
      menuOverlay.classList.remove('open');
    }
  });
}