/* GRIFFNER Journey, Einstieg (Runde 10, 2026-11-23): wie der Anfang von Über uns. Schwarz, ohne 3D und ohne Film:
   die Headline, dann die Sätze als Zeilen, die beim Scrollen hell werden (wie withULit: ab 82 % der Fensterhöhe bis 32 %),
   am Ende bleibt das Feld mit einem Satz stehen (wie „Wir finden: Hausbau geht besser.“). Auf der Website dockt dort das gelbe Feld an. */
import { clamp, E, esc } from './basis.js';
import { EINSTIEG } from './inhalt.js';

export const DEF = EINSTIEG;
const str = v => String(v ?? '').trim();
export function clean(c = {}) {
  const z = (Array.isArray(c.zeilen) ? c.zeilen : DEF.zeilen).map(str).filter(Boolean);
  return { h: str(c.h) || DEF.h, zeilen: z.length ? z : DEF.zeilen, satzA: c.satzA == null ? DEF.satzA : str(c.satzA), satzB: c.satzB == null ? DEF.satzB : str(c.satzB) };
}

export function markup(c0) {
  const c = clean(c0);
  return `<section class="je" aria-label="Journey">
<div class="je__kopf"><h1 class="h-xl je__h">${esc(c.h)}</h1></div>
<div class="je__zeilen">${c.zeilen.map(z => `<p class="je__z">${esc(z)}</p>`).join('')}</div>
<div class="je__ende"><div class="je__buehne"><i class="jf je__f" aria-hidden="true"></i><p class="je__satz">${c.satzA ? `<span class="je__a je__z">${esc(c.satzA)}</span> ` : ''}<span class="je__b je__z">${esc(c.satzB)}</span></p></div></div>
</section>`;
}

/* deps: { reduce, still } → { feld, feldOn(), dispose } */
export function mount(root, c0, deps = {}) {
  const Z = [...root.querySelectorAll('.je__z')], feld = root.querySelector('.je__f');
  const handle = { root, feld, feldOn: () => { const r = feld.getBoundingClientRect(); return r.top < innerHeight * .62 && r.bottom > 0; }, dispose };
  if (deps.reduce || deps.still) { root.classList.add('is-static'); return handle; }
  let raf = 0;
  const run = () => {
    raf = 0; const vh = innerHeight;
    Z.forEach(z => {
      const r = z.getBoundingClientRect(), k = E(clamp((vh * .82 - r.top) / (vh * .5)), 0, 1), o = (.14 + .86 * k).toFixed(3);
      if (z.dataset.o !== o) { z.dataset.o = o; z.style.opacity = o; }
    });
  };
  const on = () => { if (!raf) raf = requestAnimationFrame(run); };
  addEventListener('scroll', on, { passive: true }); addEventListener('resize', on);
  run();
  function dispose() { removeEventListener('scroll', on); removeEventListener('resize', on); raf && cancelAnimationFrame(raf); }
  return handle;
}
