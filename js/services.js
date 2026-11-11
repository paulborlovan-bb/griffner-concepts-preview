/* Services Übersicht (leistungen.html, Runde 49, Design v2): ein gepinnter Film über Concept Free in 3D (js/svc-film.js),
   danach das gelbe Feld „Starte mit dem Projektcheck“. Kopf, Menü und Footer wie die übrigen Seiten (js/chrome.js). */
import { loop, reveal } from './core.js';
import { initChrome, frame } from './chrome.js';
import { initServicesFilm } from './svc-film.js';

const run = (name, fn) => { try { fn(); } catch (e) { console.error(name, e); } };
run('chrome', initChrome);
reveal(document);
loop.start(frame);
if (document.fonts) document.fonts.ready.then(() => loop.poke());
addEventListener('load', () => loop.poke());
run('film', initServicesFilm);
