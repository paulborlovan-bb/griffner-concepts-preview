/* GRIFFNER Journey, Der Stapel (Runde 10, 2026-11-23): nach den 14 Tagen ein schwarzer Bildschirm mit allen Tagen als Raster
   (zwei Reihen zu sieben: Besser planen, Besser bauen; am Telefon zwei Spalten). Beim Scrollen brechen die Felder auf, ihre Stichworte
   kommen heraus und fallen alle zu einem Stapel zusammen. Darüber steht „Um den Rest kümmern wir uns.“ mit dem Feld
   (auf der Website dockt dort das gelbe Feld an). Die Tage und Stichworte kommen aus derselben Liste wie die Szene (inhalt.js).
   Runde 11: der Satz steht mitten im Bild (Telefon und Desktop), der Stapel liegt darunter und wird so klein, dass er nie in den Satz ragt.
   Zwei Halte für schritte(): das Raster, dann der fertige Stapel mit dem Satz (dazwischen spielt das Aufbrechen und Fallen). */
import { clamp, lerp, E, esc, nr2, stichworte, words, chip } from './basis.js';
import { TAGE, STAPEL, SZENE } from './inhalt.js';

export const DEF = { h: STAPEL.h, steps: TAGE, tag: SZENE.tag };
const str = v => String(v ?? '').trim();
export function clean(c = {}) {
  const src = Array.isArray(c.steps) && c.steps.length ? c.steps : DEF.steps;
  let steps = src.map(s => ({ t: str(s?.t), k: stichworte(s?.k), ph: str(s?.ph) })).filter(s => s.t);
  if (!steps.length) steps = DEF.steps.map(s => ({ t: s.t, k: stichworte(s.k), ph: s.ph || '' }));
  return { h: str(c.h) || DEF.h, steps, tag: str(c.tag) || DEF.tag };
}
/* Scrollweg der Sektion (vh), darin klebt die Bühne */
export const HOEHE = 320;

export function markup(c0) {
  const c = clean(c0);
  const cells = c.steps.map((s, i) => `${s.ph ? `<p class="info st__ph">${esc(s.ph)}</p>` : ''}<div class="st__box" style="--i:${i}"><p class="info st__n">${esc(c.tag)} <em>${nr2(i + 1)}</em></p><p class="st__t">${esc(s.t)}</p></div>`).join('');
  const chips = c.steps.map((s, i) => s.k.map(k => chip(k, 'st__k', `--b:${i}`)).join('')).join('');
  return `<section class="st" aria-label="${esc(c.h)}" style="height:${HOEHE}vh"><div class="st__stage">
<div class="st__grid">${cells}</div>
<div class="st__ks" aria-hidden="true">${chips}</div>
<div class="st__kopf"><i class="jf st__f" aria-hidden="true"></i><h2 class="st__h">${words(c.h)}</h2></div>
</div></section>`;
}

/* feste Zufallszahlen (gleiches Bild bei jedem Laden) */
const rnd = seed => { let x = seed * 9301 + 49297; return () => { x = (x * 9301 + 49297) % 233280; return x / 233280; }; };

/* deps: { reduce, still } → { feld, feldOn(), dispose } */
export function mount(root, c0, deps = {}) {
  const el = root.querySelector('.st'), stage = root.querySelector('.st__stage'), grid = root.querySelector('.st__grid');
  const BOX = [...root.querySelectorAll('.st__box')], PHL = [...root.querySelectorAll('.st__ph')], CH = [...root.querySelectorAll('.st__k')], kopf = root.querySelector('.st__kopf'), feld = root.querySelector('.st__f');
  let p = 0, alive = true;
  const handle = { root, feld, feldOn: () => { const r = el.getBoundingClientRect(); return p > .68 && r.bottom > innerHeight * .4 && r.top < innerHeight * .5; }, dispose,
    /* Halte (Seiten-Y): Raster ganz da, Stapel fertig */
    stops: () => { if (root.classList.contains('is-static')) return []; const r = el.getBoundingClientRect(), top = r.top + scrollY, span = Math.max(1, el.offsetHeight - innerHeight); return [top + span * .03, top + span * .93]; } };
  if (deps.reduce || deps.still) { root.classList.add('is-static'); grid.classList.add('is-in'); kopf.classList.add('is-in'); return handle; }

  /* Geometrie: Felder im Raster, Streuung um jedes Feld, Plätze im Stapel (Reihen von unten, gefüllt bis zur Breite) */
  let G = null;
  function measure() {
    const s0 = stage.getBoundingClientRect(), W = s0.width, H = s0.height, phone = W < 810;
    const R = rnd(7), SW = Math.min(W - (phone ? 24 : 120), 1240);
    let sS = phone ? .44 : W < 1200 ? .54 : .58;
    const boxes = BOX.map(b => { const r = b.getBoundingClientRect(); return { cx: r.left - s0.left + r.width / 2, cy: r.top - s0.top + r.height / 2, w: r.width, h: r.height }; });
    const it = CH.map((e, n) => ({ e, b: +e.style.getPropertyValue('--b'), w: e.offsetWidth, h: e.offsetHeight, n }));
    /* Streuung: jedes Stichwort springt aus seinem Feld ein Stück nach außen */
    const per = {}; it.forEach(c => { per[c.b] = (per[c.b] || 0) + 1; });
    const idx = {}; it.forEach(c => {
      const B = boxes[c.b], j = idx[c.b] = (idx[c.b] || 0) + 1, a = (j / per[c.b]) * Math.PI * 2 + c.b * 1.3, rr = (phone ? .35 : .55) * B.w + R() * (phone ? 12 : 30);
      c.sx = B.cx + Math.cos(a) * rr; c.sy = B.cy + Math.sin(a) * rr * (phone ? .6 : .9); c.r0 = (R() - .5) * 24;
    });
    /* Stapel: gemischte Reihenfolge, Reihen von unten, zur Spitze hin schmaler (ein Stapel, keine Wand) */
    const order = it.slice().sort(() => R() - .5), hMax = Math.max(...it.map(c => c.h));
    /* Platz unter dem Satz (er steht mitten im Bild) */
    const hb = kopf.querySelector('.st__h').getBoundingClientRect(), bottom = H - (phone ? 28 : 48), room = bottom - (hb.bottom - s0.top) - (phone ? 22 : 34);
    let rows = [], rh = 0;
    for (let tries = 0; tries < 12; tries++) {
      rows = []; let row = [], rw = 0;
      order.forEach(c => { const w = c.w * sS + 4, cap = SW * (phone ? Math.max(.8, 1 - rows.length * .018) : Math.max(.56, 1 - rows.length * .05)); if (row.length && rw + w > cap) { rows.push({ row, rw }); row = []; rw = 0; } row.push(c); rw += w; });
      if (row.length) rows.push({ row, rw });
      rh = hMax * sS * .9;
      if (rows.length * rh <= room || sS < .26) break;
      sS *= .92;
    }
    rows.forEach(({ row, rw }, ri) => {
      let x = (W - rw) / 2;
      row.forEach(c => { const w = c.w * sS + 4; c.tx = x + w / 2 + (R() - .5) * 6; c.ty = bottom - rh * (ri + .5) + (R() - .5) * 3; c.r1 = (R() - .5) * 5; c.ri = ri; x += w; });
    });
    G = { it, boxes, sS, nr: rows.length, W, H, phone };
  }

  let raf = 0, gridIn = false, kopfIn = false;
  const run = () => {
    raf = 0; if (!alive) return;
    const r = el.getBoundingClientRect(), vh = innerHeight;
    if (r.bottom < -vh * .2 || r.top > vh * 1.2) return;
    if (!G) measure();
    p = clamp(-r.top / Math.max(1, r.height - vh));
    const gi = r.top < vh * .55; if (gi !== gridIn) { gridIn = gi; grid.classList.toggle('is-in', gi); }
    /* Aufbrechen: die Felder lösen sich nacheinander auf (p .1 bis .36) */
    const NB = G.boxes.length;
    const pl = (1 - E(p, .1, .2)).toFixed(3); PHL.forEach(e => { if (e.dataset.o !== pl) { e.dataset.o = pl; e.style.setProperty('--k', pl); } });
    BOX.forEach((b, i) => {
      const k = E(p, .1 + i / NB * .12, .2 + i / NB * .12), o = (1 - k).toFixed(3);
      if (b.dataset.o !== o) { b.dataset.o = o; b.style.setProperty('--k', o); }
    });
    /* Stichworte: aus dem Feld heraus (Streuung), dann fallen sie in den Stapel, die unteren Reihen zuerst (p .4 bis .74) */
    G.it.forEach(c => {
      const kb = E(p, .12 + c.b / NB * .12, .24 + c.b / NB * .12);
      const f0 = .4 + (c.ri / Math.max(1, G.nr - 1)) * .2 + (c.n % 5) * .006, kf = clamp((p - f0) / .14);
      const g = kf < .82 ? Math.pow(kf / .82, 2) : 1 - Math.sin((kf - .82) / .18 * Math.PI) * .035;
      const B = G.boxes[c.b];
      const x0 = lerp(B.cx, c.sx, kb), y0 = lerp(B.cy, c.sy, kb);
      const x = lerp(x0, c.tx, E(kf, 0, 1)), y = lerp(y0, c.ty, g), rot = lerp(lerp(0, c.r0, kb), c.r1, E(kf, 0, 1)), sc = lerp(lerp(.6, G.phone ? .78 : .92, kb), G.sS, E(kf, 0, 1));
      const o = Math.min(kb, 1) * (1 - .4 * E(p, .72, .86));
      const t = `translate3d(${(x - c.w / 2).toFixed(1)}px,${(y - c.h / 2).toFixed(1)}px,0) rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
      if (t !== c.t) { c.t = t; c.e.style.transform = t; }
      const os = o.toFixed(3); if (os !== c.o) { c.o = os; c.e.style.opacity = os; }
    });
    const ki = p > .7; if (ki !== kopfIn) { kopfIn = ki; kopf.classList.toggle('is-in', ki); }
  };
  const on = () => { if (!raf) raf = requestAnimationFrame(run); };
  const onResize = () => { G = null; CH.forEach(c => { c.style.transform = ''; }); on(); };
  addEventListener('scroll', on, { passive: true }); addEventListener('resize', onResize);
  /* Schrift geladen: neu messen (Breiten der Stichworte) */
  document.fonts && document.fonts.ready.then(() => { if (alive) onResize(); });
  run();
  function dispose() { alive = false; removeEventListener('scroll', on); removeEventListener('resize', onResize); raf && cancelAnimationFrame(raf); }
  return handle;
}
