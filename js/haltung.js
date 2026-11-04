/* HALTUNG. "Wir planen jedes Haus individuell." füllt sich Wort für Wort, dann zieht ein Strich mit dem Connector an der Spitze.
   Darunter der Weg in sechs Kapiteln, aus RAIL gebaut. */
import { $, $$, E, prog, loop, reduce } from './core.js';
import { RAIL } from '../data/content.js';

const LINES = {
  'k-kennen': 'Wir hören zu, bevor wir zeichnen.',
  'k-grund': 'Wir lesen deinen Ort.',
  'k-concepts': 'Drei Concepts zum Weiterdenken.',
  'k-mix': 'Du nimmst, was dir gefällt.',
  'k-bauen': 'Vorgefertigt in Griffen.',
  'k-einzug': 'Und dann wohnst du.'
};

let S;
export function initHaltung() {
  S = { pin: $('[data-st-pin]'), words: $$('[data-st-words] span'), line: $('[data-st-line]'), dock: $('[data-st-dock]') };
  const go = (e, id) => { e.preventDefault(); const t = document.getElementById(id); t && scrollTo({ top: t.getBoundingClientRect().top + scrollY, behavior: reduce ? 'auto' : 'smooth' }); };
  const weg = $('[data-weg]');
  RAIL.forEach(([id, nr, name], i) => {
    const li = document.createElement('li'); li.dataset.reveal = String(i * 60);
    li.innerHTML = `<a href="#${id}"><span class="info">${nr}</span><span class="weg__name">${name}.</span><span class="txt">${LINES[id] || ''}</span><span class="info weg__go">Ansehen</span></a>`;
    li.firstElementChild.addEventListener('click', e => go(e, id));
    weg.appendChild(li);
  });
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
