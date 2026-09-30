const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

const finePointer = matchMedia('(hover:hover) and (pointer:fine)').matches;
const isSmall     = matchMedia('(max-width:860px)').matches;

/* ============================================================
   1. PESTAÑAS  (todo se cambia en la misma página)
   ============================================================ */
const panels  = $$('.tab-panel');
const navBtns = $$('.menu .btn-nav');
let currentTab = null;

function setHash(id){
  try { history.replaceState(null, '', '#' + id); } catch (_) { /* file:// */ }
}

/* Reinicia las animaciones de entrada del hero */
function replayHero(){
  $$('.d1,.d2,.d3,.d4,.d5').forEach(el => {
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
  });
}

/* Revela los elementos .reveal de la pestaña abierta */
function revealPanel(panel){
  $$('.reveal', panel).forEach(el => {
    if (el.classList.contains('show')) return;
    el.classList.add('show');
    const delay = parseFloat(el.style.getPropertyValue('--d')) || 0;
    setTimeout(() => el.classList.add('done'), (delay + 1) * 1000);
  });
}

function openTab(id, { silent = false } = {}){
  const panel = document.getElementById(id);
  if (!panel || !panel.classList.contains('tab-panel')) return;

  currentTab = id;

  panels.forEach(p => p.classList.toggle('active', p === panel));

  navBtns.forEach(b => {
    const on = b.getAttribute('href') === '#' + id;
    b.classList.toggle('active', on);
    b.setAttribute('aria-selected', on ? 'true' : 'false');
  });

  if (id === 'inicio') replayHero();

  /* doble rAF: deja pintar el estado oculto y luego anima */
  requestAnimationFrame(() => requestAnimationFrame(() => revealPanel(panel)));

  setHash(id);

  if (!silent) window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* Cualquier enlace interno (#algo) abre su pestaña */
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = decodeURIComponent(a.getAttribute('href').slice(1));
  if (!id || !document.getElementById(id)) return;
  e.preventDefault();
  if (id === currentTab){
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  openTab(id);
});

/* Pestaña inicial (respeta el # del enlace) */
(function initTab(){
  const hash = decodeURIComponent(location.hash.slice(1));
  const target = document.getElementById(hash);
  openTab(target && target.classList.contains('tab-panel') ? hash : 'inicio', { silent: true });
})();

/* ============================================================
   2. CURSOR CORAZÓN + ESTELA  (solo escritorio)
   ============================================================ */
const cursor = $('#cursor');
let lastTrail = 0;

if (finePointer){
  addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';

    const now = Date.now();
    if (now - lastTrail > 70){
      lastTrail = now;
      const t = document.createElement('span');
      t.className = 'trail';
      t.textContent = '♥';
      t.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;font-size:${8 + Math.random() * 10}px`;
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 1000);
    }
  });

  document.addEventListener('mouseover', e => {
    cursor.classList.toggle('big', !!e.target.closest('a,button,img'));
  });
}

/* Explosión de corazones */
function heartBurst(x, y, n = 10){
  for (let i = 0; i < n; i++){
    const h = document.createElement('span');
    h.className = 'burst';
    h.textContent = ['♥', '💗', '💖'][i % 3];
    const a = Math.random() * Math.PI * 2;
    const d = 40 + Math.random() * 90;
    h.style.cssText = `left:${x}px;top:${y}px;font-size:${14 + Math.random() * 14}px;margin:-0.5em 0 0 -0.5em`;
    document.body.appendChild(h);
    requestAnimationFrame(() => {
      h.style.transform = `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d}px) scale(.35)`;
      h.style.opacity = '0';
    });
    setTimeout(() => h.remove(), 1000);
  }
}

/* Clic en cualquier parte = pequeños corazones */
addEventListener('click', e => heartBurst(e.clientX, e.clientY, finePointer ? 8 : 5));

/* ============================================================
   3. CORAZONES FLOTANTES DE FONDO
   ============================================================ */
const fl = $('#floaters');
const totalFloaters = isSmall ? 12 : 22;

for (let i = 0; i < totalFloaters; i++){
  const s = document.createElement('span');
  s.textContent = '♥';
  s.style.cssText =
    `left:${Math.random() * 100}%;` +
    `font-size:${12 + Math.random() * 28}px;` +
    `animation-duration:${10 + Math.random() * 14}s;` +
    `animation-delay:${-Math.random() * 20}s`;
  fl.appendChild(s);
}

/* ============================================================
   4. CUENTA REGRESIVA Y TIEMPO DE NOVIOS
   ============================================================ */
const box = (n, l) => `<div><b>${n}</b><small>${l}</small></div>`;

function tick(){
  const now  = new Date();
  const bday = new Date(2026, 9, 1);           // 1 de octubre de 2026
  const cd   = $('#countdown');

  if (now >= bday){
    cd.innerHTML = '<p class="birthday-msg">¡Hoy es tu día! 🎂💗</p>';
  } else {
    const d = bday - now;
    cd.innerHTML =
      box(Math.floor(d / 864e5), 'días') +
      box(Math.floor(d / 36e5) % 24, 'horas') +
      box(Math.floor(d / 6e4) % 60, 'min') +
      box(Math.floor(d / 1e3) % 60, 'seg');
  }

  /* Tiempo desde el 11 de junio de 2022 */
  const start = new Date(2022, 5, 11);
  let y  = now.getFullYear() - 2022;
  let m  = now.getMonth() - 5;
  let dd = now.getDate() - 11;

  if (dd < 0){ m--; dd += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
  if (m < 0){ y--; m += 12; }

  $('#timer').innerHTML =
    box(y, 'años') + box(m, 'meses') + box(dd, 'días') +
    box(now.getHours(), 'horas') + box(now.getMinutes(), 'min') + box(now.getSeconds(), 'seg');
}

tick();
setInterval(tick, 1000);

/* ============================================================
   5. FRASES
   ============================================================ */
const frases = [
  'Contigo aprendí que el amor no hace ruido: se queda, cuida y sostiene.',
  'Gracias por ser mi hogar cuando el mundo se siente lejos.',
  'Mi lugar favorito del mundo es donde tú estás.',
  'Veinte años de tu vida y cada uno merecía ser celebrado.',
  'Si Dios escribe nuestra historia, sé que lo mejor de ella eres tú.',
  'Te elegí el 11 de junio de 2022 y te sigo eligiendo cada día.'
];

let qi = 0, qTimer;
const q = $('#quote'), dots = $('#dots');

frases.forEach(() => dots.appendChild(document.createElement('i')));

function showQuote(i){
  qi = (i + frases.length) % frases.length;
  q.classList.add('out');

  setTimeout(() => {
    q.textContent = '“' + frases[qi] + '”';
    q.classList.remove('out');
    $$('i', dots).forEach((d, k) => d.classList.toggle('on', k === qi));
  }, 350);

  clearInterval(qTimer);
  qTimer = setInterval(() => showQuote(qi + 1), 7000);
}

$('#prev').onclick = () => showQuote(qi - 1);
$('#next').onclick = () => showQuote(qi + 1);
showQuote(0);

/* ============================================================
   6. CARTA CON EFECTO MÁQUINA DE ESCRIBIR
   ============================================================ */
const carta = `Mi Johana:

Hoy cumples 20 años y quiero que sepas lo afortunado que me siento de caminar a tu lado. Desde aquel 11 de junio de 2022 has hecho mis días más bonitos, mis viajes más felices y mi fe más fuerte.

Gracias por tu sonrisa, tu paciencia y tu forma de amar, Ha sido un camino duro, no fue sencillo pero fue increible, todo ha valido la pena, las peleas, los regaños y los abrazos que nos hemos negado, tu familia ya es una parte importante de mi vida, por eso le agradezco a Dios por tu vida y por estos 4 años junto a ti. Que Dios te bendiga en esta nueva etapa y me permita seguir celebrándote muchos años más.

Feliz cumpleaños, mi amor.

Con todo mi corazón,
Ervin Arrieta 💗`;

let typing = false;

$('#open-letter').onclick = e => {
  if (typing) return;
  typing = true;

  const p = $('#letter-text');
  p.textContent = '';

  let i = 0;
  const speed = isSmall ? 28 : 35;

  const w = setInterval(() => {
    p.textContent += carta[i++];
    if (i >= carta.length){
      clearInterval(w);
      typing = false;
      const r = e.target.getBoundingClientRect();
      heartBurst(r.left + r.width / 2, r.top, 18);
    }
  }, speed);
};

/* ============================================================
   7. LIGHTBOX
   ============================================================ */
const lb = $('#lightbox');
const lbImg = $('img', lb);

document.addEventListener('click', e => {
  const img = e.target.closest('[data-zoom]');
  if (img){
    lbImg.src = img.src;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  } else if (e.target.closest('#lightbox')){
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }
});

addEventListener('keydown', e => {
  if (e.key === 'Escape' && lb.classList.contains('open')){
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }
});

/* ============================================================
   8. LLUVIA DE CORAZONES 💗
   ============================================================ */
let bursting = false;

$('#burst').addEventListener('click', () => {
  if (bursting) return;
  bursting = true;

  const drops = isSmall ? 26 : 40;
  const step  = isSmall ? 70 : 60;

  for (let i = 0; i < drops; i++){
    setTimeout(() => {
      heartBurst(
        Math.random() * window.innerWidth,
        Math.random() * window.innerHeight * 0.75,
        3
      );
    }, i * step);
  }

  setTimeout(() => { bursting = false; }, drops * step + 1200);
});