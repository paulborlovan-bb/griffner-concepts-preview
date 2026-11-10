/* Services Leistungsumfang (leistungsumfang.html, Runde 45, Runde 46). Der Unterschied in acht Dingen als Bildfolge (gepinnt):
   links das Bild, rechts das Muster in 3D und der Satz, der Vergleich auf Wunsch → „Aufpreis“ wird durchgestrichen
   → drei Ausbaustufen, Concept Bold im Schnitt baut sich auf, die Positionen je Gruppe zum Aufklappen → was dazu kommt → Katalog. */
import { loop, reveal, $, $$, reduce } from './core.js';
import { initChrome, frame } from './chrome.js';
import { initPlan } from './svc-plan.js';
import { initFolge, initMore, initAcc } from './svc-ui.js';
import { ACHT, STUFEN, STUFEN_MODELL } from '../data/leistungen.js';

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
run('acc', () => initAcc(document));

/* lädt, sobald der Bereich 900 px vor dem Bild ist */
function near(el, fn, margin = '900px 0px') {
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); fn(); } }, { rootMargin: margin });
  io.observe(el);
}

/* ---------- 01 Acht Dinge: Bildfolge, das Muster wechselt mit, der Vergleich liegt über dem Muster ---------- */
function initAcht() {
  const box = $('[data-ac]'); if (!box) return;
  const st = $('[data-muster]', box), labs = $('[data-muster-labs]', box);
  let api = null, cur = 0;
  const closeVs = () => $$('[data-vs]', box).forEach(v => {
    if (v.hidden) return;
    v.hidden = true; box.classList.remove('vs-open');
    const b = $(`[aria-controls="${v.id}"]`, box); if (b) b.setAttribute('aria-expanded', 'false');
  });
  initFolge(box, { onStep(k) { cur = k; closeVs(); if (api) api.show(ACHT[k].key); } });
  $$('[data-vs-open]', box).forEach(b => b.addEventListener('click', () => {
    const v = document.getElementById(b.getAttribute('aria-controls')), open = v.hidden;
    closeVs();
    if (open) { box.style.setProperty('--vs-top', st.offsetTop + 'px'); v.hidden = false; box.classList.add('vs-open'); b.setAttribute('aria-expanded', 'true'); $('[data-vs-close]', v).focus({ preventScroll: true }); }
  }));
  $$('[data-vs-close]', box).forEach(b => b.addEventListener('click', () => {
    const it = b.closest('[data-fo-it]'); closeVs();
    const o = it && $('[data-vs-open]', it); if (o) o.focus({ preventScroll: true });
  }));
  addEventListener('keydown', e => { if (e.key === 'Escape' && box.classList.contains('vs-open')) closeVs(); });
  near(box, () => import('./muster3d.js').then(m => m.createMuster(st, labs)).then(a => { api = a; api.show(ACHT[cur].key); })
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
  const tabs = $$('[data-st-tab]', box), grps = $$('[data-st-grp]', box), stage = $('[data-st-stage]', box);
  const cap = $('[data-st-cap]', box), sub = $('[data-st-sub]', box), panel = $('#st-panel', box);
  let api = null, n = 1;
  const set = (k, focus) => {
    n = k;
    tabs.forEach(t => { const on = +t.dataset.stTab === k; t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1; if (on && focus) t.focus(); });
    grps.forEach(g => { const on = +g.dataset.stGrp === k; g.hidden = !on; g.classList.toggle('is-new', on); });
    panel.setAttribute('aria-labelledby', 'st-tab-' + k);
    cap.textContent = STUFEN_MODELL[k - 1]; sub.textContent = STUFEN[k - 1].sub;
    [cap, sub].forEach(e => { e.classList.remove('is-new'); void e.offsetWidth; e.classList.add('is-new'); });
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
