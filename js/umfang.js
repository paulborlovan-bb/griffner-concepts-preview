/* Services Leistungsumfang (Runde 49): die Teile der Seite als Funktionen, damit Framer sie je Sektion einzeln starten kann
   (framer/src/umfang-entry.js). Die Seite selbst startet sie in js/leistungsumfang.js. */
import { loop, $, $$, reduce } from './core.js';
import { initFolge } from './svc-ui.js';
import { ACHT } from '../data/leistungen.js';

/* lädt, sobald der Bereich 900 px vor dem Bild ist */
export function near(el, fn, margin = '900px 0px') {
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); fn(); } }, { rootMargin: margin });
  io.observe(el);
}

/* ---------- 01 Acht Dinge: Bildfolge, das Muster wechselt mit, der Vergleich liegt über dem Muster ---------- */
export function initAcht() {
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
export function initInb() {
  const el = $('[data-inb]'); if (!el) return;
  const sec = el.closest('.inb') || el;
  if (reduce) { sec.classList.add('is-on'); return; }
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { sec.classList.add('is-on'); io.disconnect(); } }, { threshold: .55 });
  io.observe(el);
}

/* ---------- 03 Ausbaustufen (Runde 48): drei Teile, alle Positionen offen. Links bleibt das Haus stehen: große Nummer, Name der Stufe,
   die Leiste füllt sich beim Lesen. Die Stufe wechselt, wenn ihr Kopf die Bildmitte erreicht, das Haus baut sich mit.
   Der Bereich auf Höhe der Bildmitte wird im Haus hell (Wand, Dach, Fenster ...), die Zeilen laufen beim Hereinscrollen ein. ---------- */
export function initStufen() {
  const box = $('[data-sts]'); if (!box) return;
  const arts = $$('[data-stx]', box), heads = arts.map(a => $('[data-stx-head]', a)), segs = $$('[data-sts-seg]', box), names = $$('[data-sts-name]', box);
  const groups = arts.map(a => $$('[data-stg]', a)), all = groups.flat(), nr = $('[data-sts-nr]', box), now = $('[data-sts-now]', box), stage = $('[data-st-stage]', box);
  let api = null, n = 0, teil, label = '', curG = null;
  if (reduce) $$('[data-stg],[data-stx-head]', box).forEach(g => g.classList.add('is-in'));
  else {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px' });
    $$('[data-stg],[data-stx-head]', box).forEach(g => io.observe(g));
  }
  const setStage = k => {
    if (k === n) return; n = k;
    names.forEach((x, i) => x.classList.toggle('is-on', i === k - 1));
    if (nr) { nr.textContent = String(k).padStart(2, '0'); if (!reduce) { nr.classList.remove('is-new'); void nr.offsetWidth; nr.classList.add('is-new'); } }
    if (api) api.stage(k);
  };
  loop.add({ tick() {
    const r = box.getBoundingClientRect(), vh = innerHeight;
    if (r.bottom < -vh * .2 || r.top > vh * 1.2) return;
    const mid = vh * .52;
    let k = 1;
    heads.forEach((h, i) => { if (h.getBoundingClientRect().top < mid) k = i + 1; });
    setStage(k);
    /* Leiste: was du von jeder Stufe schon gelesen hast */
    arts.forEach((a, i) => {
      const q = a.getBoundingClientRect(), f = Math.min(1, Math.max(0, (mid - q.top) / Math.max(1, q.height)));
      segs[i].style.setProperty('--f', f.toFixed(4));
      segs[i].classList.toggle('is-cur', i === k - 1); segs[i].classList.toggle('is-done', i < k - 1);
    });
    /* der Bereich auf Höhe der Bildmitte */
    let g = null;
    groups[k - 1].forEach(x => { const q = x.getBoundingClientRect(); if (q.top < mid && q.bottom > mid - 40) g = x; });
    if (g !== curG) { if (curG) curG.classList.remove('is-cur'); if (g) g.classList.add('is-cur'); curG = g; }
    const t = g ? g.dataset.teil || null : null, lb = g ? g.dataset.name : names[k - 1].textContent;
    if (lb !== label) { label = lb; if (now) now.textContent = lb; }
    if (t !== teil) { teil = t; if (api) api.focus(t); }
  } });
  void all;
  near(stage, () => import('./schnitthaus.js').then(m => m.createSchnitthaus(stage, { mode: 'stufen', items: [], bg: 0xffffff })).then(a => {
    api = a; stage.classList.add('is-live'); api.stage(n || 1); api.focus(teil || null);
  }).catch(e => { console.warn('Haus im Schnitt nicht geladen', e); stage.classList.add('is-fallback'); }));
}

/* ---------- 04 Dazu kommt (Runde 47): jeder Punkt läuft Wort für Wort herein, sobald er ins Bild kommt.
   Hell ist der Punkt, der der Bildmitte am nächsten ist, die große Zahl links zählt mit. ---------- */
export function initDazu() {
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
