/* Übergang zwischen Grundstück und Inspiration (Runde 13), wie der Manifest-Abschnitt auf griffner.com/about:
   jede Zeile leuchtet beim Scrollen auf (Deckkraft .14 bis 1, solange ihre Oberkante von 82 % auf 50 % der Bildhöhe steigt),
   danach eine kurze Pause, dann steht der Satz mit dem gelben Feld darüber still. In Framer ist der Abschnitt nativ
   (withULit auf den Zeilen, withUManDock auf dem Feld), hier nur nachgebaut. */
import { $$, clamp, loop, reduce } from './core.js';

const io = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // power2InOut wie UE() in GriffnerMotion
let L = [];

export function initUebergang() {
  L = $$('#k-uebergang [data-lit]').map(el => ({ el, o: reduce ? 1 : .14 }));
  if (!L.length) return;
  if (reduce) { L.forEach(l => { l.el.style.opacity = '1'; }); return; }
  loop.add({ tick });
}

function tick() {
  let busy = false;
  for (const l of L) {
    const p = clamp((innerHeight * .82 - l.el.getBoundingClientRect().top) / (innerHeight * .32));
    const want = .14 + .86 * io(p);
    l.o += (want - l.o) * .18;
    if (Math.abs(want - l.o) > .002) busy = true; else l.o = want;
    l.el.style.opacity = l.o.toFixed(3);
  }
  if (busy) loop.poke();
}
