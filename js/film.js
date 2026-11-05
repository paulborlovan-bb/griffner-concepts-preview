/* 07 EINZUG. Der Film läuft stumm, sobald er im Bild ist. Die großen Untertitel folgen der Filmzeit, jeder ist auch ein Sprungpunkt. */
import { $, h, reduce } from './core.js';
import { FILM } from '../data/content.js';

let V, cap, bar, btn, items, now, cur = -1, userPaused = false;
const NN = n => String(n).padStart(2, '0');
/* Zu einem Moment springen: Liste, Pfeile (Telefon) und Wischen über den Film */
function go(i) {
  i = (i + FILM.length) % FILM.length;
  V.currentTime = FILM[i][0] + .05;
  if (V.paused && !userPaused) V.play().catch(() => {});
  show(i);
}
export function initFilm() {
  V = $('[data-f-video]'); cap = $('[data-f-cap]'); bar = $('[data-f-bar]'); btn = $('[data-f-btn]');
  const list = $('[data-f-list]');
  items = FILM.map(([a, , t], i) => {
    const li = h('li'), b = h('button', { type: 'button', class: 'info' }, t.replace(/\.$/, ''));
    b.addEventListener('click', () => go(i));
    li.appendChild(b); list.appendChild(li); return b;
  });
  now = $('[data-f-now]');
  const pv = $('[data-f-prev]'), nx = $('[data-f-next]');
  if (pv) pv.addEventListener('click', () => go(cur - 1));
  if (nx) nx.addEventListener('click', () => go(cur + 1));
  let tx = 0, ty = 0;
  V.parentNode.addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  V.parentNode.addEventListener('touchend', e => {
    const t = e.changedTouches[0], dx = t.clientX - tx, dy = t.clientY - ty;
    if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.3) go(cur + (dx < 0 ? 1 : -1));
  }, { passive: true });
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
  if (now) now.textContent = `${NN(i + 1)} / ${NN(FILM.length)} ${FILM[i][2].replace(/\.$/, '')}`;
  cap.classList.add('is-out');
  setTimeout(() => { cap.textContent = FILM[i][2]; cap.classList.remove('is-out'); }, reduce ? 0 : 260);
}
