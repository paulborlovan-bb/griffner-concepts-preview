/* Services Leistungsumfang (leistungsumfang.html, Runde 45, Runde 46). Der Unterschied in acht Dingen als Bildfolge (gepinnt):
   links das Bild, rechts das Muster in 3D und der Satz, der Vergleich auf Wunsch → „Aufpreis“ wird durchgestrichen
   → drei Ausbaustufen untereinander, die gewählte offen, Concept Bold im Schnitt baut sich mit (Runde 47) → was dazu kommt, Punkt für Punkt → Katalog. */
import { loop, reveal, $, $$, reduce } from './core.js';
import { initChrome, frame } from './chrome.js';
import { initPlan } from './svc-plan.js';
import { initFolge, initMore, initAcc } from './svc-ui.js';
import { ACHT } from '../data/leistungen.js';

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
run('dazu', initDazu);
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

/* ---------- 03 Ausbaustufen (Runde 47): die drei Stufen untereinander, die gewählte ist offen und zeigt, was dazukommt.
   Das Haus links bleibt stehen und baut sich mit, die Leiste darunter füllt sich bis zur gewählten Stufe. ---------- */
function initStufen() {
  const box = $('[data-st]'); if (!box) return;
  const its = $$('[data-stp]', box), segs = $$('[data-st-seg]', box), stage = $('[data-st-stage]', box);
  let api = null, n = 1;
  const set = (k, from) => {
    if (k === n) return;
    n = k;
    its.forEach(it => {
      const on = +it.dataset.stp === k;
      it.classList.toggle('is-on', on);
      $('.stp__body', it).hidden = !on;
      if (!on) { const al = $('[data-stp-all]', it); al.setAttribute('aria-expanded', 'false'); $('.stp__more', it).hidden = true; }
      $('[data-st-tab]', it).setAttribute('aria-expanded', on ? 'true' : 'false');
    });
    segs.forEach(sg => { const v = +sg.dataset.stSeg; sg.classList.toggle('is-on', v <= k); sg.classList.toggle('is-cur', v === k); });
    /* geht darüber eine lange, offene Liste zu, rutscht die gewählte Zeile nach oben: dann zurück ins Bild holen */
    if (from) { const t = from.getBoundingClientRect().top; if (t < 110) scrollBy({ top: t - 140, behavior: 'instant' }); }
    if (api) api.stage(k);
    loop.poke();
  };
  $$('[data-st-tab]', box).forEach(b => b.addEventListener('click', () => set(+b.dataset.stTab, b)));
  /* „Alle Positionen ansehen“: die Bereiche der offenen Stufe zum Aufklappen */
  $$('[data-stp-all]', box).forEach(b => b.addEventListener('click', () => {
    const open = b.getAttribute('aria-expanded') !== 'true';
    b.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.getElementById(b.getAttribute('aria-controls')).hidden = !open;
    loop.poke();
  }));
  /* die Leiste unter dem Haus wählt auch; die Zeile der Stufe kommt ins Bild, wenn sie weit weg ist */
  segs.forEach(sg => sg.addEventListener('click', () => {
    const k = +sg.dataset.stSeg, b = $(`[data-st-tab="${k}"]`, box);
    set(k, b);
    const r = b.getBoundingClientRect();
    if (r.top > innerHeight * .8) scrollBy({ top: r.top - innerHeight * .3, behavior: reduce ? 'auto' : 'smooth' });
  }));
  near(stage, () => import('./schnitthaus.js').then(m => m.createSchnitthaus(stage, { mode: 'stufen', items: [], bg: 0xffffff })).then(a => {
    api = a; stage.classList.add('is-live'); api.stage(n);
  }).catch(e => { console.warn('Haus im Schnitt nicht geladen', e); stage.classList.add('is-fallback'); }));
}

/* ---------- 04 Dazu kommt (Runde 47): jeder Punkt läuft Wort für Wort herein, sobald er ins Bild kommt.
   Hell ist der Punkt, der der Bildmitte am nächsten ist, die große Zahl links zählt mit. ---------- */
function initDazu() {
  const box = $('[data-dz]'); if (!box) return;
  const its = $$('[data-dz-it]', box), nr = $('[data-dz-nr]', box);
  let cur = 0;
  if (reduce) its.forEach(it => it.classList.add('is-in'));
  loop.add({ tick() {
    const r = box.getBoundingClientRect(), vh = innerHeight;
    if (r.bottom < -vh * .2 || r.top > vh * 1.2) return;
    let best = 0, bd = Infinity;
    its.forEach((it, i) => {
      const q = it.getBoundingClientRect();
      if (q.top < vh * .86 && !it.classList.contains('is-in')) it.classList.add('is-in');
      const d = Math.abs(q.top + q.height / 2 - vh * .5);
      if (d < bd) { bd = d; best = i; }
    });
    if (best === cur) return;
    its[cur].classList.remove('is-cur'); its[best].classList.add('is-cur'); cur = best;
    if (nr) { nr.textContent = String(best + 1).padStart(2, '0'); if (!reduce) { nr.classList.remove('is-new'); void nr.offsetWidth; nr.classList.add('is-new'); } }
  } });
}
