/* Runde 55: „Das ganze Projekt im Detail“ (Entwurf s-weiter). Beim Hereinkommen zieht sich die Linie über jede Karte und das Zeichen
   zeichnet sich Strich für Strich; beim Hover wird die Linie weiß, der Pfeil länger und das Zeichen zeichnet sich neu. In Framer
   übernimmt das der Code „Zeichen“ (native Sektion). */
import { $, $$, reduce } from './core.js';

const E = 'cubic-bezier(.2,.7,.2,1)';
const draw = (svg, on, delay) => svg && $$('path,circle', svg).forEach((p, j) => {
  p.style.strokeDasharray = '1'; p.style.transition = 'stroke-dashoffset 900ms ' + E + ' ' + (delay + j * 140) + 'ms'; p.style.strokeDashoffset = on ? '0' : '1';
});
export function initWeiter() {
  const sec = $('[data-svw]'); if (!sec) return;
  const rows = $$('[data-wrow]', sec);
  rows.forEach(a => draw($('[data-wglyph]', a), false, 0));
  const show = () => { sec.classList.add('is-in'); rows.forEach((a, i) => draw($('[data-wglyph]', a), true, 300 + i * 160)); };
  if (reduce || !window.IntersectionObserver) show();
  else { const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { show(); io.disconnect(); } }, { threshold: .25 }); io.observe(sec); }
  if (!matchMedia('(hover: hover)').matches) return;
  rows.filter(a => a.tagName === 'A').forEach(a => { const g = $('[data-wglyph]', a);
    a.addEventListener('pointerenter', () => { draw(g, false, 0); requestAnimationFrame(() => requestAnimationFrame(() => draw(g, true, 80))); }); });
}
