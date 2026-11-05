/* 03 INSPIRATION. Vier Lebensgefühle, vier Concepts, präsentiert wie stillform.homes (Kundenwunsch 2026-11-05, zweite Runde):
   je Haus ein Akt mit Name und losen Bildern, Bildfolge in einem Rahmen von 70 bis 75 %, dann großer Satz und Aufruf.
   Markup aus js/akte-html.js (von tools/pages.mjs in index.html geschrieben), Bewegung in js/akte.js.
   Alles kommt aus CONCEPTS in data/content.js: ein neues Concept braucht nur einen Eintrag und einen Lauf von tools/pages.mjs. */
import { $ } from './core.js';
import { CONCEPTS } from '../data/content.js';
import { answers } from './kennen.js';
import { initAkte } from './akte.js';

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
  initAkte($('#k-concepts'));
}
