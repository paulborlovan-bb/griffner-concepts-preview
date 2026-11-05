/* Seite eines Concepts (bold.html, calm.html, light.html, free.html, erzeugt von tools/pages.mjs).
   Ankommen, Eckdaten, Die Idee, Film oder Bildband, Raum und Licht, Grundriss (Bold, Calm, Light), Nächstes Concept, Kontakt.
   Welches Concept, steht als data-concept an jeder Sektion. Header, Menü und Footer kommen aus chrome.js. */
import { $, $$, E, lerp, clamp, ease, loop, reveal, reduce, store } from './core.js';
import { CONCEPTS } from '../data/content.js';
import { initAkte } from './akte.js';
import { initChrome, frame } from './chrome.js';
import { initIdee } from './idee.js';
import { initPlan3d } from './plan3d.js';
import { initKontakt } from './kontakt.js';

const run = (name, fn) => { try { fn(); } catch (e) { console.error(name, e); } };
const concept = () => { const el = $('[data-concept]'); return CONCEPTS.find(c => el && c.id === el.dataset.concept) || CONCEPTS[0]; };

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

/* Film: ein breites Band, nicht bildschirmhoch. Es öffnet sich beim Hereinscrollen und läuft stumm, solange es im Bild ist */
function initFilm() {
  /* Film, oder ein Bild als Band, solange es für das Concept keinen Film gibt */
  const box = $('[data-wf-box]'), v = $('[data-wf-video]') || $('[data-wf-img]');
  if (!box || !v) return;
  if (v.tagName === 'VIDEO') {
    new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting && !reduce) v.play().catch(() => {}); else v.pause(); }), { threshold: .2 }).observe(box);
    if (reduce) v.controls = true;
  }
  if (reduce) return;
  loop.add({ tick() {
    const r = box.getBoundingClientRect(), vh = innerHeight; if (r.top > vh || r.bottom < 0) return;
    /* offen, sobald die Mitte des Bands die Mitte des Bildschirms erreicht */
    const t = clamp((vh - r.top) / (vh / 2 + r.height / 2)), o = t * t * (3 - 2 * t), iy = lerp(16, 0, o), ix = lerp(22, 0, o);
    /* immer als Inline Wert setzen: ein leerer Wert ließe die geschlossene Startform aus dem CSS zurückspringen */
    box.style.clipPath = `inset(${iy.toFixed(2)}% ${ix.toFixed(2)}%)`;
    v.style.transform = `scale(${lerp(1.16, 1, o).toFixed(4)})`;
  } });
}

/* Raum und Licht: jedes Bild öffnet sich einmal von unten und zieht dann leicht nach (Parallaxe im Bild) */
function initLicht() {
  const figs = $$('[data-wl]').map(f => ({ f, box: $('.wl__box', f), im: $('img', f), k: 0 }));
  if (reduce) return;
  loop.add({ tick() {
    const vh = innerHeight;
    figs.forEach(o => {
      const r = o.box.getBoundingClientRect();
      if (r.top > vh * 1.1 || r.bottom < -vh * .1) return;
      /* einmal geöffnet, bleibt offen */
      o.k = Math.max(o.k, ease(clamp((vh - r.top) / (vh * .55))));
      const c = clamp((r.top + r.height / 2) / vh) - .5;
      o.box.style.clipPath = o.k < .999 ? `inset(${((1 - o.k) * 100).toFixed(2)}% 0 0 0)` : '';
      o.im.style.transform = `translate3d(0,${(c * 9).toFixed(2)}%,0) scale(${lerp(1.14, 1, o.k).toFixed(4)})`;
    });
  } });
}

/* Nächstes Concept: derselbe Akt wie auf der Concepts Seite (stillform.homes), für das nächste Haus */
function initNext() {
  initAkte($('#w-next'));
}

/* Kontakt: Nachricht kennt schon das Concept */
function initForm() {
  const message = () => `Ich interessiere mich für Concept ${concept().name}.`;
  const kf = initKontakt($('#w-kontakt [data-kf-host]'), { prefill: message, say: '' });
  store.on(() => kf && kf.refresh());
}

run('chrome', initChrome);
run('hero', initHero);
run('count', initCount);
run('idee', initIdee);
run('film', initFilm);
run('plan3d', initPlan3d);
run('licht', initLicht);
run('next', initNext);
run('form', initForm);
reveal(document);
loop.start(frame);
if (document.fonts) document.fonts.ready.then(() => loop.poke());
addEventListener('load', () => loop.poke());
