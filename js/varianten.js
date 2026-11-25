/* Gemeinsam für die Variantenseiten der Startseite (journey-home.html, gregor-home.html, 2026-11-25).
   sw(): Sprungleiste der Varianten, nur zwischen Einstieg und Fußzeile sichtbar, die aktuelle hervorgehoben.
   Am Telefon nur beim Zurückscrollen und nie über einer stehenden Bühne (data-pin), damit sie nichts verdeckt. */
import { loop, $, $$ } from './core.js';

export const esc = v => String(v == null ? '' : v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
export const pad2 = n => String(n).padStart(2, '0');
export const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const sm = t => { t = cl(t); return t * t * (3 - 2 * t); };
export const run = (name, fn) => { try { fn(); } catch (e) { console.error(name, e); } };
/* Fortschritt einer stehenden Bühne: 0, wenn der Lauf oben am Fenster ankommt, 1, wenn sein Ende unten ankommt */
export const runP = el => { const r = el.getBoundingClientRect(), span = r.height - innerHeight; return span > 0 ? cl(-r.top / span) : (r.top < 0 ? 1 : 0); };

export function sw() {
  const nav = $('[data-vxsw]'), start = $('[data-vx-start]'), foot = $('[data-footer]');
  if (!nav || !start) return;
  const ids = $$('a', nav).map(a => a.getAttribute('href').slice(1));
  const wide = matchMedia('(min-width:900px)'), pins = $$('[data-pin]'); let y0 = scrollY, up = false;
  loop.add({ tick() {
    const y = scrollY; if (Math.abs(y - y0) > 6) { up = y < y0; y0 = y; }
    const pinned = pins.some(p => { const r = p.getBoundingClientRect(); return r.top <= 1 && r.bottom >= innerHeight - 1; });
    const ft = foot ? foot.getBoundingClientRect().top : Infinity;
    const on = start.getBoundingClientRect().bottom < innerHeight * .5 && ft > innerHeight * .8 && (wide.matches || (up && !pinned));
    nav.classList.toggle('is-on', on);
    let cur = 0; ids.forEach((id, k) => { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < innerHeight * .5) cur = k; });
    $$('a', nav).forEach((a, k) => a.classList.toggle('is-cur', k === cur));
  } });
}
