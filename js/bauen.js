/* 06 BAUEN. Die Schritte fahren seitlich durch, während du nach unten scrollst. Bilder bewegen sich leicht gegen die Fahrt. */
import { $, $$, seg, prog, loop } from './core.js';

let D;
export function initBauen() {
  D = { pin: $('[data-b-pin]'), track: $('[data-b-track]'), bar: $('[data-b-prog]'), imgs: $$('[data-b-track] .step__img img'), dock: $('[data-b-dock]') };
  loop.add({ tick });
}
function tick() {
  if (innerWidth < 820) { D.dock.dataset.dockHide = '1'; return; }
  const { p, on } = prog(D.pin); if (!on) return;
  const max = Math.max(0, D.track.scrollWidth - innerWidth);
  const k = seg(p, .04, .96);
  D.track.style.transform = `translate3d(${(-max * k).toFixed(1)}px,0,0)`;
  D.bar.style.transform = `scaleX(${k.toFixed(4)})`;
  D.imgs.forEach(im => {
    const r = im.parentElement.getBoundingClientRect();
    const c = (r.left + r.width / 2) / innerWidth - .5;
    im.style.transform = `scale(1.12) translate3d(${(c * -6).toFixed(2)}%,0,0)`;
  });
  if (k > .9) delete D.dock.dataset.dockHide; else D.dock.dataset.dockHide = '1';
}
