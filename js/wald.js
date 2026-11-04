/* Seite Concept Wald. Erste Einzelseite eines Concepts: Ankommen, Eckdaten, Grundrisse, Ausprobieren, Raum und Licht, Weiter.
   Header, Menü und Footer kommen wie auf der Concepts Seite aus chrome.js. */
import { $, $$, E, lerp, clamp, through, loop, reveal, reduce } from './core.js';
import { initChrome, frame } from './chrome.js';
import { initEntwurf } from './entwurf.js';
import { initWald3d } from './wald3d.js';

const run = (name, fn) => { try { fn(); } catch (e) { console.error(name, e); } };

/* Vollbild zieht beim Scrollen leicht zurück, der Name hebt sich ab */
function initHero() {
  const sec = $('#w-hero'), im = $('[data-w-img] img'), name = $('.wh__name'), dock = $('.wh__dock');
  loop.add({ tick() {
    const r = sec.getBoundingClientRect();
    /* Connector an der Unterkante nur, solange die Kante gut im Bild ist, sonst säße er unter Contact */
    if (r.bottom < innerHeight * .4) dock.dataset.dockHide = '1'; else delete dock.dataset.dockHide;
    if (r.bottom < 0) return;
    const p = clamp(-r.top / Math.max(1, r.height));
    const intro = reduce ? 1 : E(Math.min(1, (performance.now() - t0) / 1600), 0, 1);
    im.style.transform = `scale(${lerp(1.08, 1, intro) + p * .06}) translate3d(0,${(p * 8).toFixed(2)}%,0)`;
    name.style.transform = `translate3d(0,${(-p * 40).toFixed(1)}px,0)`;
    if (intro < 1) loop.poke();
  } });
  const t0 = performance.now();
}

/* Zahlen zählen einmal hoch, wenn sie ins Bild kommen */
function initCount() {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; io.unobserve(e.target);
    const el = e.target, to = parseFloat(el.dataset.count), t0 = performance.now(), dur = reduce ? 0 : 1400;
    const step = () => { const k = dur ? E(Math.min(1, (performance.now() - t0) / dur), 0, 1) : 1; el.textContent = String(Math.round(to * k)); if (k < 1) requestAnimationFrame(step); };
    step();
  }), { threshold: .6 });
  $$('[data-count]').forEach(el => { el.textContent = '0'; io.observe(el); });
}

/* Bilder in Raum und Licht wandern leicht gegen den Scroll */
function initPar() {
  const ims = $$('img[data-par]');
  loop.add({ tick() { if (reduce) return; ims.forEach(im => { const t = through(im.parentElement, 1, 0); im.style.transform = `scale(1.1) translate3d(0,${((.5 - t) * 6).toFixed(2)}%,0)`; }); } });
}

run('chrome', initChrome);
run('hero', initHero);
run('count', initCount);
run('entwurf', initEntwurf);
run('wald3d', initWald3d);
run('par', initPar);
reveal(document);
loop.start(frame);
if (document.fonts) document.fonts.ready.then(() => loop.poke());
addEventListener('load', () => loop.poke());
