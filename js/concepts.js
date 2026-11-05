/* 03 INSPIRATION. Vier Lebensgefühle, vier Concepts, präsentiert wie stillform.homes (Kundenwunsch 2026-11-05):
   lose Bilder um die Überschrift, die mittlere Karte wächst zum Rahmen (75 %), darin schieben sich die Häuser durch.
   Die Bühne selbst ist js/buehne.js. Alles kommt aus CONCEPTS in data/content.js: ein neues Concept braucht nur einen Eintrag. */
import { $ } from './core.js';
import { CONCEPTS } from '../data/content.js';
import { answers } from './kennen.js';
import { initBuehne, cardsFor } from './buehne.js';

const WHY = {
  who: { allein: 'allein wohnst', zwei: 'zu zweit wohnst', kinder: 'mit Kindern wohnst', generationen: 'mit mehreren Generationen wohnst' },
  live: { arbeiten: 'zuhause arbeitest', gaeste: 'gerne Gäste hast', sport: 'Platz für Sport brauchst', draussen: 'am liebsten draußen bist' },
  wichtig: { offen: 'einen offenen Raum willst', rueckzug: 'Rückzugsorte für alle willst', ebene: 'alles auf einer Ebene willst', licht: 'viel Licht willst' }
};
export function fit(c, a = answers()) {
  const r = [];
  if (c.fits.who.includes(a.who)) r.push(WHY.who[a.who]);
  (a.live || []).filter(k => c.fits.live.includes(k)).forEach(k => r.push(WHY.live[k]));
  if (c.fits.wichtig.includes(a.wichtig)) r.push(WHY.wichtig[a.wichtig]);
  return { score: r.length, reasons: r.slice(0, 2) };
}
export const best = () => { const a = answers(); return CONCEPTS.map(c => ({ c, ...fit(c, a) })).sort((x, y) => y.score - x.score)[0]; };

export function initConcepts() {
  const root = $('#k-concepts [data-bu]');
  if (!root) return;
  const n = CONCEPTS.length;
  initBuehne(root, {
    houses: CONCEPTS, cards: cardsFor(CONCEPTS),
    count: i => `Concept ${CONCEPTS[i].nr} / ${String(n).padStart(2, '0')}`
  });
}
