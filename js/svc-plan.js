/* Services (Runde 45): „Der Plan“ im Hero, nach dem Preloader der Startseite (framer-code/Preloader.tsx).
   Hilfslinien durch die Kanten des Felds über die ganze Fläche, gepunktete Mitte, vier Eckstriche, die schräg gezeichnet werden
   und sich dann gerade ziehen. Das Feld selbst bleibt leer: sobald du scrollst, gleitet der gelbe Connector hinein (data-dock). */
import { $, $$, reduce, reveal } from './core.js';

const SV = 'http://www.w3.org/2000/svg';
const ln = (cls, x1, y1, x2, y2) => { const l = document.createElementNS(SV, 'line'); l.setAttribute('class', cls); [['x1', x1], ['y1', y1], ['x2', x2], ['y2', y2]].forEach(([k, v]) => l.setAttribute(k, v.toFixed(1))); return l; };
const eio = x => (x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
const eo = x => 1 - Math.pow(1 - x, 3);
const cl = x => Math.max(0, Math.min(1, x));

export function initPlan(scope = document) {
  const sec = $('.svh', scope); if (!sec) return;
  const svg = $('[data-plan]', sec), field = $('[data-plan-field]', sec);
  const R = (() => { let s = 11; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();
  const jit = [0, 1, 2, 3].map(() => ({ r: (R() - .5) * 5.2, x: (R() - .5) * 14, y: (R() - .5) * 14 }));
  let geo = null, t0 = 0, done = reduce;

  function layout() {
    const W = sec.clientWidth, H = sec.clientHeight, phone = W < 810;
    let fw, cx, cy;
    if (!phone) { fw = Math.min(W * .2, H * .3); cx = W * .735; cy = H * .43; }
    else {
      /* Telefon: zwischen Einleitung und Fuß, nur wenn Platz ist */
      const a = ($('.svh__sub', sec) || $('.svh__h', sec)).getBoundingClientRect(), b = $('.svh__foot', sec).getBoundingClientRect(), top = sec.getBoundingClientRect().top;
      const gap = b.top - a.bottom; fw = Math.min(W * .34, (gap - 40) / .8); cx = W * .72; cy = (a.bottom + b.top) / 2 - top;
      if (fw < 60) fw = 0;
    }
    const fh = fw * .8, l = cx - fw / 2, t = cy - fh / 2;
    geo = { W, H, l, t, r: l + fw, b: t + fh, fw, fh, ov: Math.max(14, fw * .09) };
    Object.assign(field.style, { left: l + 'px', top: t + 'px', width: fw + 'px', height: fh + 'px', display: fw ? '' : 'none' });
    draw();
  }
  function draw() {
    const { W, H, l, t, r, b, fw, ov } = geo;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.textContent = '';
    if (!fw) return;
    const g = [ln('g', 0, t, W, t), ln('g', W, b, 0, b), ln('g', l, H, l, 0), ln('g', r, 0, r, H), ln('g dot', 0, (t + b) / 2, W, (t + b) / 2)];
    const s = [ln('s', l - ov, t, r + ov, t), ln('s', r, t - ov, r, b + ov), ln('s', r + ov, b, l - ov, b), ln('s', l, b + ov, l, t - ov)];
    [...g, ...s].forEach(e => svg.appendChild(e));
    geo.g = g; geo.s = s;
    [...g, ...s].forEach(e => { const L = Math.hypot(e.x2.baseVal.value - e.x1.baseVal.value, e.y2.baseVal.value - e.y1.baseVal.value); e._L = L; if (!e.classList.contains('dot')) e.style.strokeDasharray = L; });
    paint(done ? 99 : (performance.now() - t0) / 1000);
  }
  /* Zeitlinie wie im Preloader: Hilfslinien 0.1 bis 1.2 s, Striche ab 0.55 s, gerade ab 1.75 s */
  function paint(T) {
    if (!geo || !geo.g) return;
    geo.g.forEach((e, i) => {
      const k = eio(cl((T - .1 - i * .12) / 1.1));
      if (e.classList.contains('dot')) { e.style.opacity = k; return; }
      e.style.strokeDashoffset = (e._L * (1 - k)).toFixed(1);
    });
    geo.s.forEach((e, i) => {
      const k = eo(cl((T - .55 - i * .14) / .9)), st = eio(cl((T - 1.75) / .8)), j = jit[i];
      e.style.strokeDashoffset = (e._L * (1 - k)).toFixed(1);
      const cx = (e.x1.baseVal.value + e.x2.baseVal.value) / 2, cy = (e.y1.baseVal.value + e.y2.baseVal.value) / 2;
      e.setAttribute('transform', `translate(${(j.x * (1 - st)).toFixed(2)} ${(j.y * (1 - st)).toFixed(2)}) rotate(${(j.r * (1 - st)).toFixed(3)} ${cx.toFixed(1)} ${cy.toFixed(1)})`);
    });
  }
  function run() {
    const T = (performance.now() - t0) / 1000;
    paint(T);
    if (T < 2.7) requestAnimationFrame(run); else done = true;
  }
  new ResizeObserver(layout).observe(sec);
  layout();
  if (!done) { t0 = performance.now() + 250; requestAnimationFrame(run); }
  /* Text im Hero kommt mit dem Plan, nicht erst beim Scrollen (die Fakten liegen sonst unter der Reveal Kante) */
  $$('[data-reveal]', sec).forEach(el => {
    if (reveal.io) reveal.io.unobserve(el);
    el.dataset.rv = '1';
    const d = reduce ? 0 : 450 + (parseFloat(el.dataset.reveal) || 0);
    setTimeout(() => { el.style.transitionDelay = '0ms'; el.classList.add('is-in'); }, d);
  });
}
