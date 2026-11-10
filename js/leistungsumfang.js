/* Services Leistungsumfang (leistungsumfang.html, Runde 45). Der Unterschied in acht Dingen: links Text und Bild, rechts das Muster in 3D,
   das beim Scrollen wechselt → „Aufpreis“ wird durchgestrichen, „inbegriffen“ → drei Ausbaustufen, das Haus im Schnitt baut sich auf
   → was dazu kommt → Katalog. */
import { loop, reveal, $, $$, reduce } from './core.js';
import { initChrome, frame } from './chrome.js';
import { initPlan } from './svc-plan.js';
import { ACHT, STUFEN_MODELL } from '../data/leistungen.js';

const run = (name, fn) => { try { fn(); } catch (e) { console.error(name, e); } };
run('chrome', initChrome);
reveal(document);
loop.start(frame);
if (document.fonts) document.fonts.ready.then(() => loop.poke());
addEventListener('load', () => loop.poke());
run('plan', () => initPlan(document));
run('acht', initAcht);
run('inbegriffen', initInb);
run('stufen', initStufen);

/* lädt, sobald der Bereich 900 px vor dem Bild ist */
function near(el, fn, margin = '900px 0px') {
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); fn(); } }, { rootMargin: margin });
  io.observe(el);
}

/* ---------- 01 Acht Dinge, das Muster wechselt mit ---------- */
function initAcht() {
  const box = $('[data-ac]'); if (!box) return;
  const its = $$('[data-ac-it]', box), st = $('[data-muster]', box), labs = $('[data-muster-labs]', box);
  const nr = $('[data-muster-nr]', box), name = $('[data-muster-name]', box);
  let api = null, cur = null;
  const set = k => {
    if (k === cur) return; cur = k;
    const a = ACHT.find(x => x.key === k);
    nr.textContent = a.nr; name.textContent = a.kurz;
    its.forEach(it => it.classList.toggle('is-on', it.dataset.acIt === k));
    if (api) api.show(k);
  };
  loop.add({ tick() {
    const r = box.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
    let k = its[0].dataset.acIt;
    its.forEach(it => { if (it.getBoundingClientRect().top < innerHeight * .5) k = it.dataset.acIt; });
    set(k);
  } });
  near(box, () => import('./muster3d.js').then(m => m.createMuster(st, labs)).then(a => { api = a; api.show(cur || ACHT[0].key); })
    .catch(e => { console.warn('Muster nicht geladen', e); box.classList.add('is-fallback'); }));
}

/* ---------- 02 Aufpreis, durchgestrichen ---------- */
function initInb() {
  const el = $('[data-inb]'); if (!el) return;
  const sec = el.closest('.inb') || el;
  if (reduce) { sec.classList.add('is-on'); return; }
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { sec.classList.add('is-on'); io.disconnect(); } }, { threshold: .55 });
  io.observe(el);
}

/* ---------- 03 Ausbaustufen, das Haus baut sich auf ---------- */
function initStufen() {
  const box = $('[data-st]'); if (!box) return;
  const tabs = $$('[data-st-tab]', box), grps = $$('[data-st-grp]', box), stage = $('[data-st-stage]', box), cap = $('[data-st-cap]', box);
  const panel = $('#st-panel', box);
  let api = null, n = 1;
  const set = (k, focus) => {
    n = k;
    tabs.forEach(t => { const on = +t.dataset.stTab === k; t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1; if (on && focus) t.focus(); });
    grps.forEach(g => { const on = +g.dataset.stGrp === k; g.hidden = !on; g.classList.toggle('is-new', on); });
    panel.setAttribute('aria-labelledby', 'st-tab-' + k);
    cap.textContent = STUFEN_MODELL[k - 1];
    if (api) api.stage(k);
  };
  tabs.forEach((t, i) => {
    t.tabIndex = i ? -1 : 0;
    t.addEventListener('click', () => set(+t.dataset.stTab));
    t.addEventListener('keydown', e => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return;
      e.preventDefault(); set(((n - 1 + d + 3) % 3) + 1, true);
    });
  });
  near(stage, () => import('./schnitthaus.js').then(m => m.createSchnitthaus(stage, { mode: 'stufen', items: [], bg: 0xffffff })).then(a => {
    api = a; stage.classList.add('is-live'); api.stage(n);
  }).catch(e => { console.warn('Haus im Schnitt nicht geladen', e); stage.classList.add('is-fallback'); }));
}
