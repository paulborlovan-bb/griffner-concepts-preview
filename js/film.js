/* 07 EINZUG. Der Film läuft stumm, sobald er im Bild ist. Die großen Untertitel folgen der Filmzeit, jeder ist auch ein Sprungpunkt. */
import { $, h, reduce } from './core.js';
import { FILM } from '../data/content.js';

let V, cap, bar, btn, items, cur = -1, userPaused = false;
export function initFilm() {
  V = $('[data-f-video]'); cap = $('[data-f-cap]'); bar = $('[data-f-bar]'); btn = $('[data-f-btn]');
  const list = $('[data-f-list]');
  items = FILM.map(([a, , t], i) => {
    const li = h('li'), b = h('button', { type: 'button', class: 'info' }, t.replace(/\.$/, ''));
    b.addEventListener('click', () => { V.currentTime = a + .05; if (V.paused && !userPaused) V.play().catch(() => {}); show(i); });
    li.appendChild(b); list.appendChild(li); return b;
  });
  btn.addEventListener('click', () => {
    if (V.paused) { userPaused = false; V.play().catch(() => {}); } else { userPaused = true; V.pause(); }
  });
  V.addEventListener('play', () => { btn.textContent = 'Pause'; });
  V.addEventListener('pause', () => { btn.textContent = 'Abspielen'; });
  V.addEventListener('timeupdate', sync);
  const raf = () => { if (!V.paused) sync(); requestAnimationFrame(raf); }; raf();
  new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting && !userPaused && !reduce) V.play().catch(() => { btn.textContent = 'Abspielen'; });
    else if (!e.isIntersecting) V.pause();
  }), { threshold: .35 }).observe(V);
  if (reduce) btn.textContent = 'Abspielen';
  show(0);
}
function sync() {
  const t = V.currentTime, d = V.duration || 30;
  bar.style.transform = `scaleX(${(t / d).toFixed(4)})`;
  const i = FILM.findIndex(([a, b]) => t >= a && t < b);
  if (i !== -1 && i !== cur) show(i);
}
function show(i) {
  if (i === cur) return; cur = i;
  items.forEach((b, j) => b.classList.toggle('is-cur', j === i));
  cap.classList.add('is-out');
  setTimeout(() => { cap.textContent = FILM[i][2]; cap.classList.remove('is-out'); }, reduce ? 0 : 260);
}
