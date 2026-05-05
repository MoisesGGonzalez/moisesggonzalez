// transicion.js
const style = document.createElement('style');
style.textContent = `
  .banda {
    position: fixed;
    left: 0;
    width: 100%;
    height: 33.4vh;
    background: #000;
    z-index: 9999;
    transform: translateX(100%);
    will-change: transform;
  }
  .banda-1 { top: 0; }
  .banda-2 { top: 33.3vh; }
  .banda-3 { top: 66.6vh; }
  #logo-transicion {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 10000;
    opacity: 0;
    pointer-events: none;
    width: clamp(80px, 12vw, 160px);
    transition: opacity 0.4s ease;
  }
`;
document.head.appendChild(style);

const wrapper = document.createElement('div');
wrapper.innerHTML = `
  <div class="banda banda-1"></div>
  <div class="banda banda-2"></div>
  <div class="banda banda-3"></div>
`;
document.body.appendChild(wrapper);

const logo = document.createElement('img');
logo.id  = 'logo-transicion';
logo.src = 'logo.png';
logo.alt = '';
document.body.appendChild(logo);

const banda1 = document.querySelector('.banda-1');
const banda2 = document.querySelector('.banda-2');
const banda3 = document.querySelector('.banda-3');

const DUR   = 0.45;
const DELAY = 0.12;
const TOTAL_ENTRADA = (DUR + DELAY * 2) * 1000;

function quitarPageBlock() {
  const pageBlock = document.getElementById('page-block');
  if (pageBlock) pageBlock.remove();
}

function transicionSalida(href) {
  [banda1, banda2, banda3].forEach(b => {
    b.style.transition = 'none';
    b.style.transform  = 'translateX(100%)';
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      [banda1, banda2, banda3].forEach((b, i) => {
        b.style.transition = `transform ${DUR}s cubic-bezier(0.77,0,0.175,1) ${i * DELAY}s`;
        b.style.transform  = 'translateX(0)';
      });
    });
  });

  setTimeout(() => { logo.style.opacity = '1'; }, TOTAL_ENTRADA);
  setTimeout(() => {
    sessionStorage.setItem('transicion', 'entrada');
    window.location.href = href;
  }, TOTAL_ENTRADA + 500);
}

function transicionEntrada() {
  if (sessionStorage.getItem('transicion') !== 'entrada') {
    quitarPageBlock();
    document.body.style.visibility = 'visible';
    return;
  }

  sessionStorage.removeItem('transicion');

  [banda1, banda2, banda3].forEach(b => {
    b.style.transition = 'none';
    b.style.transform  = 'translateX(0)';
  });
  logo.style.transition = 'none';
  logo.style.opacity    = '1';

  banda1.getBoundingClientRect();

  quitarPageBlock();
  document.body.style.visibility = 'visible';

  setTimeout(() => {
    logo.style.transition = 'opacity 0.3s ease';
    logo.style.opacity    = '0';
    setTimeout(() => {
      [banda1, banda2, banda3].forEach((b, i) => {
        b.style.transition = `transform ${DUR}s cubic-bezier(0.77,0,0.175,1) ${i * DELAY}s`;
        b.style.transform  = 'translateX(-100%)';
      });
    }, 300);
  }, 400);
}

document.addEventListener('click', (e) => {
  const link = e.target.closest('a');
  if (!link) return;
  const href = link.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('http') || link.target === '_blank') return;
  e.preventDefault();
  transicionSalida(href);
});

window.addEventListener('DOMContentLoaded', transicionEntrada);