/* HALTUNG. "Wir planen jedes Haus individuell." füllt sich Wort für Wort, dann zieht ein Strich mit dem Connector an der Spitze.
   Danach geht es direkt weiter zu Kapitel 01. Die sechs Schritte stehen jetzt in Kapitel 04 (js/weg.js). */
import { $, $$, E, prog, loop } from './core.js';

let S;
export function initHaltung() {
  S = { pin: $('[data-st-pin]'), words: $$('[data-st-words] span'), line: $('[data-st-line]'), dock: $('[data-st-dock]') };
  loop.add({ tick });
}

function tick() {
  const { p, on } = prog(S.pin); if (!on) return;
  const n = S.words.length;
  S.words.forEach((w, i) => { w.style.opacity = (.12 + .88 * E(p, i / n * .5, i / n * .5 + .14)).toFixed(3); });
  const lw = S.line.parentElement.clientWidth * E(p, .5, .92);
  S.line.style.width = lw.toFixed(1) + 'px';
  S.dock.style.left = lw.toFixed(1) + 'px';
}
