/* Runde 39: Seite mit allen Grundrissen (grundrisse.html, erzeugt von tools/grundrisse-seite.mjs).
   Header, Menü und Footer wie die übrigen Seiten (chrome.js). Das 3D Modell (js/grundriss.js mit three.js) lädt erst,
   wenn die erste Karte näher kommt; bis dahin zeigt jede Karte ihr Bild (Poster). Runde 43: Start in js/grundriss-start.js,
   den auch die Seiten der Concepts nutzen. */
import { loop, reveal } from './core.js';
import { initChrome, frame } from './chrome.js';
import { startGrundriss } from './grundriss-start.js';

const run = (name, fn) => { try { fn(); } catch (e) { console.error(name, e); } };
run('chrome', initChrome);
reveal(document);
loop.start(frame);
if (document.fonts) document.fonts.ready.then(() => loop.poke());
addEventListener('load', () => loop.poke());
run('grundriss', startGrundriss);
