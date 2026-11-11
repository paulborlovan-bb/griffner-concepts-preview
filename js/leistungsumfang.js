/* Services Leistungsumfang (leistungsumfang.html, Runde 45, Runde 46). Der Unterschied in acht Dingen als Bildfolge (gepinnt):
   links das Bild, rechts das Muster in 3D und der Satz, der Vergleich auf Wunsch → „Aufpreis“ wird durchgestrichen
   → drei Ausbaustufen als Geschichte, alle Positionen offen, Concept Bold im Schnitt baut sich mit und zeigt den Bereich, den du liest (Runde 48)
   → rund ums Haus als Plan (Runde 48) → was dazu kommt, Punkt für Punkt → Katalog. */
import { loop, reveal } from './core.js';
import { initChrome, frame } from './chrome.js';
import { initPlan } from './svc-plan.js';
import { initMore, initAcc } from './svc-ui.js';
import { initGrundplan } from './svc-grundplan.js';
import { initAcht, initInb, initStufen, initDazu } from './umfang.js';

const run = (name, fn) => { try { fn(); } catch (e) { console.error(name, e); } };
run('chrome', initChrome);
reveal(document);
loop.start(frame);
if (document.fonts) document.fonts.ready.then(() => loop.poke());
addEventListener('load', () => loop.poke());
run('plan', () => initPlan(document));
run('mehr-text', () => initMore(document));
run('acht', initAcht);
run('inbegriffen', initInb);
run('stufen', initStufen);
run('rund', () => initGrundplan(document.querySelector('[data-rp]')));
run('dazu', initDazu);
run('acc', () => initAcc(document));

