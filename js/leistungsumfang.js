/* Services Leistungsumfang (leistungsumfang.html, Runde 45, Runde 46). Der Unterschied in acht Dingen als Bildfolge (gepinnt):
   links das Bild, rechts das Muster in 3D und der Satz, der Vergleich auf Wunsch → „Aufpreis“ wird durchgestrichen
   → drei Ausbaustufen als Geschichte, alle Positionen offen, Concept Bold im Schnitt baut sich mit und zeigt den Bereich, den du liest (Runde 48)
   → rund ums Haus als Plan (Runde 48) → Kontakt. Runde 53: „Was in keiner Liste steht“ entfernt (Kunde). */
import { loop, reveal } from './core.js';
import { initChrome, frame } from './chrome.js';
import { initMore, initAcc } from './svc-ui.js';
import { initAuftakt, initAcht, initStufen, initRund } from './umfang.js';

const run = (name, fn) => { try { fn(); } catch (e) { console.error(name, e); } };
run('chrome', initChrome);
reveal(document);
loop.start(frame);
if (document.fonts) document.fonts.ready.then(() => loop.poke());
addEventListener('load', () => loop.poke());
run('auftakt', initAuftakt);
run('mehr-text', () => initMore(document));
run('acht', initAcht);
run('stufen', initStufen);
run('rund', initRund);  // Runde 69: Über schlüsselfertig hinaus statt Linienplan
run('acc', () => initAcc(document));

