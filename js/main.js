/* GRIFFNER Concepts, Prototyp. Startet alle Kapitel und den gemeinsamen Takt. */
import { loop, reveal } from './core.js';
import { initChrome, frame, tickRail } from './chrome.js';
import { initHero } from './hero.js';
import { initHaltung } from './haltung.js';
import { initKennen } from './kennen.js';
import { initGrund } from './grund.js';
import { initConcepts } from './concepts.js';
import { initSammlung } from './sammlung.js';
import { initWeg } from './weg.js';
import { initFilm } from './film.js';
import { initCta } from './cta.js';

const run = (name, fn) => { try { fn(); } catch (e) { console.error(name, e); } };
run('chrome', initChrome);
run('hero', initHero);
run('haltung', initHaltung);
run('kennen', initKennen);
run('grund', initGrund);
run('concepts', initConcepts);
run('sammlung', initSammlung);
run('weg', initWeg);
run('film', initFilm);
run('cta', initCta);
reveal(document);
loop.add({ tick: tickRail });
loop.start(frame);
if (document.fonts) document.fonts.ready.then(() => loop.poke());
addEventListener('load', () => loop.poke());
