/* Seite Concept Wald. Ankommen, Eckdaten, Die Idee, Vom Volumen zum Haus, Film, Ein Tag im Wald, Raum und Licht, Nächstes Concept, Kontakt.
   Header, Menü und Footer kommen wie auf der Concepts Seite aus chrome.js. */
import { $, $$, E, lerp, clamp, ease, loop, reveal, reduce, store } from './core.js';
import { initChrome, frame } from './chrome.js';
import { initIdee } from './idee.js';
import { initWaldTag } from './waldtag.js';
import { initKontakt } from './kontakt.js';

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

/* Film: kleines Fenster in der Mitte öffnet sich zum Vollbild, läuft stumm, solange er im Bild ist */
function initFilm() {
  const sec = $('#w-film'), box = $('[data-wf-box]'), v = $('[data-wf-video]');
  if (!sec) return;
  new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting && !reduce) v.play().catch(() => {}); else v.pause(); }), { threshold: .2 }).observe(box);
  if (reduce) { v.controls = true; return; }
  loop.add({ tick() {
    const r = sec.getBoundingClientRect(), vh = innerHeight; if (r.top > vh || r.bottom < 0) return;
    /* öffnet sich gleichmäßig, vom Hereinkommen bis etwas nach dem Andocken */
    const t = clamp((vh - r.top) / (vh * 1.5)), o = t * t * (3 - 2 * t), iy = lerp(18, 0, o), ix = lerp(26, 0, o);
    box.style.clipPath = `inset(${iy.toFixed(2)}% ${ix.toFixed(2)}%)`;
    v.style.transform = `scale(${lerp(1.18, 1, o).toFixed(4)})`;
  } });
}

/* Raum und Licht: jedes Bild öffnet sich einmal von unten, danach zieht es mit eigenem Tempo (data-sp), so wirkt die Doppelseite tief */
function initLicht() {
  const figs = $$('[data-wl]').map(f => ({ f, box: $('.wl__box', f), im: $('img', f), cap: $('figcaption', f), sp: parseFloat(f.dataset.sp) || 1, k: 0 }));
  if (reduce) return;
  loop.add({ tick() {
    const vh = innerHeight, narrow = innerWidth < 820;
    figs.forEach(o => {
      const r = o.box.getBoundingClientRect();
      if (r.top > vh * 1.1 || r.bottom < -vh * .1) return;
      /* einmal geöffnet, bleibt offen */
      o.k = Math.max(o.k, ease(clamp((vh - r.top) / (vh * .55))));
      const c = clamp((r.top + r.height / 2) / vh) - .5;
      o.box.style.clipPath = o.k < .999 ? `inset(${((1 - o.k) * 100).toFixed(2)}% 0 0 0)` : '';
      o.im.style.transform = `translate3d(0,${(c * 9 * o.sp).toFixed(2)}%,0) scale(${lerp(1.14, 1, o.k).toFixed(4)})`;
      o.f.style.transform = narrow ? '' : `translate3d(0,${(c * -40 * (o.sp - 1)).toFixed(1)}px,0)`;
      o.cap.style.opacity = o.k.toFixed(3);
    });
  } });
}

/* Nächstes Concept: das Bild setzt sich beim Hereinscrollen, der Name kommt von unten */
function initNext() {
  const st = $('#w-next .wn__stage'), im = $('[data-wn-fig] img'), row = $('[data-wn-row]');
  if (!st || reduce) return;
  loop.add({ tick() {
    const r = st.getBoundingClientRect(), vh = innerHeight;
    if (r.top > vh || r.bottom < 0) return;
    const k = ease(clamp((vh - r.top) / (vh * .95)));
    im.style.transform = `scale(${lerp(1.2, 1.02, k).toFixed(4)}) translate3d(0,${((1 - k) * -6).toFixed(2)}%,0)`;
    row.style.transform = `translate3d(0,${((1 - k) * 60).toFixed(1)}px,0)`;
    row.style.opacity = E(k, .35, 1).toFixed(3);
  } });
}

/* Kontakt: Nachricht kennt schon Concept Wald */
function initForm() {
  const message = () => 'Ich interessiere mich für Concept Wald.';
  const kf = initKontakt($('#w-kontakt [data-kf-host]'), { prefill: message, say: 'Lass uns über Wald reden.' });
  store.on(() => kf && kf.refresh());
}

run('chrome', initChrome);
run('hero', initHero);
run('count', initCount);
run('idee', initIdee);
run('film', initFilm);
run('waldtag', initWaldTag);
run('licht', initLicht);
run('next', initNext);
run('form', initForm);
reveal(document);
loop.start(frame);
if (document.fonts) document.fonts.ready.then(() => loop.poke());
addEventListener('load', () => loop.poke());
