/* ÜBERGANG „Auf den Punkt“ zwischen Grundstück und Inspiration (Runde 15, Export „ueberleitung-auf-den-punkt“ des Kunden).
   Sektion 400vh, Bühne sticky 100vh, Weiß. Unter einer weißen Fläche liegt das erste Haus (scale 1.16 → 1).
   In der Fläche ist „CONCEPT.“ ausgestanzt (SVG-Maske), durch die Buchstaben sieht man das Haus.
   p .02–.14  „Daraus entsteht dein“ steigt über dem Wort ein
   p .06–.32  „CONCEPT.“ sperrt sich per textLength auf die volle Satzbreite
   p .34–.46  „Wie das aussehen kann?“ steigt unter dem Wort ein
   p .56–.63  beide Zeilen blenden aus
   p .60–.95  Zoom in den Punkt, exponentiell, der Punkt wandert dabei in die Bildmitte. Am Ende füllt das Haus den Screen.
   Anders als im Export ist der Punkt beim Zoom ein Kreis (gleiche Lage und Größe wie das Zeichen): stark vergrößerte Schrift
   zeichnet Chrome nicht mehr, dann wurde der Screen kurz weiß. Die Buchstaben gehen weg, sobald sie links aus dem Bild sind,
   die Maske, sobald der Kreis den Screen deckt. Kein Gelb. Mit reduzierter Bewegung: Endzustand ohne Zoom, ohne Strecke. */
import { $, clamp, seg, lerp, loop, reduce, prog } from './core.js';

const eo = t => 1 - Math.pow(1 - t, 3);
const eio = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
let B = null, bm = null, lw = 0, lh = 0;

export function initUebergang() {
  const sec = $('#k-uebergang');
  if (!sec || !$('[data-p-svg]', sec)) return;
  B = {
    sec, st: $('.punkt__st', sec), img: $('[data-p-img]', sec), svg: $('[data-p-svg]', sec), g: $('[data-p-g]', sec), word: $('[data-p-word]', sec),
    dot: $('[data-p-dot]', sec), circ: $('[data-p-circle]', sec), meas: $('[data-p-meas]', sec), l1: $('[data-p-l1]', sec), l2: $('[data-p-l2]', sec)
  };
  /* Vorleser: eine Zeile „Daraus entsteht dein Concept.“, das Wort in der Maske ist nur Bild */
  B.l1.setAttribute('aria-label', `${B.l1.textContent.trim()} Concept.`);
  if (reduce) sec.classList.add('is-still');
  const again = () => { lw = 0; loop.poke(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(again);
  addEventListener('load', again);
  loop.add({ tick });
}

/* Maße aus der Schrift: Wortgröße 80 % der Satzbreite (höchstens 46 % der Höhe), Lage des Punkts, Zeilen über und unter dem Wort */
function build() {
  const W = innerWidth, H = innerHeight, m = B.l1.offsetLeft || W / 12;
  const t = B.meas;
  t.removeAttribute('textLength'); t.setAttribute('font-size', 100);
  const w100 = t.getComputedTextLength() || 520, avail = W - 2 * m;
  const fs = Math.min(avail / w100 * 100 * .8, H * .46), nat = w100 * fs / 100;
  const cv = document.createElement('canvas').getContext('2d');
  cv.font = `300 ${fs}px ${getComputedStyle(t).fontFamily}`;
  const cap = cv.measureText('C').actualBoundingBoxAscent || fs * .7, dot = cv.measureText('.');
  const base = H * .5 + cap / 2;
  t.setAttribute('font-size', fs); t.setAttribute('textLength', avail); t.setAttribute('lengthAdjust', 'spacing'); t.setAttribute('x', m); t.setAttribute('y', -9999);
  const dl = dot.actualBoundingBoxLeft || 0, dr = dot.actualBoundingBoxRight || fs * .1;
  const asc = dot.actualBoundingBoxAscent || fs * .1, desc = dot.actualBoundingBoxDescent || 0;
  const pw = (dl + dr) || fs * .1, ph = (asc + desc) || fs * .1;
  let cx = m + avail - fs * .1, tr = cx - fs * .3;
  try {
    const e = t.getExtentOfChar(7); cx = e.x + (dr - dl) / 2;
    const e6 = t.getExtentOfChar(6); tr = e6.x + e6.width;
  } catch (er) { /* ohne Maße bleibt die Schätzung */ }
  const w = B.word;
  w.setAttribute('font-size', fs); w.setAttribute('x', m); w.setAttribute('y', base); w.setAttribute('lengthAdjust', 'spacing');
  const cy = base - (asc - desc) / 2, r = Math.min(pw, ph) / 2;
  B.circ.setAttribute('cx', cx.toFixed(2)); B.circ.setAttribute('cy', cy.toFixed(2)); B.circ.setAttribute('r', r.toFixed(2));
  const gap = Math.max(16, H * .03);
  B.l1.style.top = (base - cap - gap - B.l1.offsetHeight) + 'px';
  B.l2.style.top = (base + fs * .14 + gap) + 'px';
  bm = { W, H, nat, avail, pc: [cx, cy], r, tr, S: Math.hypot(W, H) / Math.min(pw, ph) * 1.2 };
}

function tick() {
  if (!B) return;
  const { p: pr, on } = prog(B.sec);
  if (!on) return;
  if (innerWidth !== lw || innerHeight !== lh) { lw = innerWidth; lh = innerHeight; build(); }
  const p = reduce ? .5 : pr;
  B.word.setAttribute('textLength', lerp(bm.nat, bm.avail, eio(seg(p, .06, .32))).toFixed(1));
  const r1 = eo(seg(p, .02, .14)), r2 = eo(seg(p, .34, .46)), out = reduce ? 0 : eo(seg(p, .56, .63));
  B.l1.style.opacity = (r1 * (1 - out)).toFixed(3); B.l1.style.transform = `translate3d(0,${((1 - r1) * 24 - out * 24).toFixed(1)}px,0)`;
  B.l2.style.opacity = (r2 * (1 - out)).toFixed(3); B.l2.style.transform = `translate3d(0,${((1 - r2) * 24 - out * 24).toFixed(1)}px,0)`;
  /* Zoom in den Punkt */
  const z = reduce ? 0 : eio(seg(p, .6, .95)), s = Math.exp(Math.log(bm.S) * z), mv = eio(seg(z, 0, .5));
  const tx = lerp(bm.pc[0], bm.W / 2, mv), ty = lerp(bm.pc[1], bm.H / 2, mv);
  B.g.setAttribute('transform', z > 0 ? `translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${s.toFixed(4)}) translate(${(-bm.pc[0]).toFixed(2)} ${(-bm.pc[1]).toFixed(2)})` : '');
  /* Ab dem ersten Zoomschritt trägt der Kreis den Punkt, das Zeichen geht in der Fläche auf */
  const zoom = z > 0;
  B.dot.setAttribute('fill', zoom ? '#FFFFFF' : '#000000');
  B.circ.style.display = zoom ? '' : 'none';
  /* Buchstaben weg, sobald der letzte (T) links aus dem Bild ist; Maske weg, sobald der Kreis den ganzen Screen deckt */
  B.word.style.visibility = zoom && tx + (bm.tr - bm.pc[0]) * s < 0 ? 'hidden' : '';
  const far = Math.max(Math.hypot(tx, ty), Math.hypot(bm.W - tx, ty), Math.hypot(tx, bm.H - ty), Math.hypot(bm.W - tx, bm.H - ty));
  const covered = z >= 1 || bm.r * s > far + 2;
  B.svg.style.visibility = covered ? 'hidden' : '';
  /* Prototyp: Header dunkel, solange die weiße Fläche steht (in Framer regelt das der Differenz-Modus des Headers) */
  if (B.st) { if (covered) delete B.st.dataset.inkBg; else B.st.dataset.inkBg = '#FFFFFF'; }
  B.img.style.transform = `scale(${(1.16 - .16 * eo(seg(reduce ? 1 : p, .55, 1))).toFixed(4)})`;
}
