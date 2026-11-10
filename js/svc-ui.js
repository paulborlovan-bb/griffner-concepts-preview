/* Services (Runde 46): gemeinsame Bausteine beider Seiten.
   initFolge: Bildfolge nach den Akten der Concepts Seite (js/akte.js), gepinnt und nur über das Scrollen. Zwischen zwei Schritten
     schiebt sich das nächste Bild von rechts über das aktuelle, das Bild darin läuft gegenläufig nach, das aktuelle wandert 32 % nach links
     und wird dunkler. Der Satz wechselt Wort für Wort durch Masken, Zählung und Linie zeigen, wo du bist.
   initMore: „Weiterlesen“ bei langen Texten.  initAcc: Gruppen zum Aufklappen (Ausbaustufen). */
import { $, $$, clamp, seg, loop, reduce, vhs } from './core.js';

const io = t => (t < .5 ? 2 * t * t : 1 - (2 - 2 * t) * (2 - 2 * t) / 2);
const NN = n => String(n).padStart(2, '0');
/* Ablauf je Schritt in Bildschirmhöhen: der Wechsel beginnt bei A und dauert W, danach steht das Bild */
const A = .28, W = .6;

export function initFolge(box, { onStep } = {}) {
  if (!box) return null;
  const sl = $$('[data-fo-sl]', box), its = $$('[data-fo-it]', box), n = sl.length;
  const imgs = sl.map(f => $('img', f)), nr = $('[data-fo-nr]', box), bar = $('[data-fo-bar]', box);
  let cur = -1;
  const set = k => {
    if (k === cur) return; cur = k;
    its.forEach((it, i) => {
      const on = i === k;
      it.classList.toggle('is-on', on); it.classList.toggle('is-past', i < k);
      it.setAttribute('aria-hidden', on ? 'false' : 'true');
      $$('a,button', it).forEach(b => { if (!b.closest('[data-vs]')) b.tabIndex = on ? 0 : -1; });
    });
    sl.forEach((f, i) => f.setAttribute('aria-hidden', i === k ? 'false' : 'true'));
    if (nr) nr.textContent = NN(k + 1);
    if (onStep) onStep(k);
  };
  /* Sprung zu einem Schritt (Anker, Tastatur): Mitte der Standzeit */
  const yOf = k => box.getBoundingClientRect().top + scrollY + Math.max(0, (k - 1) + A + W + .12) * vhs();
  loop.add({ tick() {
    const r = box.getBoundingClientRect(), vh = vhs();
    if (r.bottom < -vh * .2 || r.top > vh * 1.2) return;
    const u = -r.top / vh;
    const e = sl.map((_, i) => (i ? (reduce ? (u >= i - 1 + A + W / 2 ? 1 : 0) : io(seg(u, i - 1 + A, i - 1 + A + W))) : 1));
    sl.forEach((f, i) => {
      const inn = 1 - e[i], out = i + 1 < n ? e[i + 1] : 0;
      if (inn >= 1) { if (f.style.visibility !== 'hidden') f.style.visibility = 'hidden'; return; }
      if (f.style.visibility !== 'visible') f.style.visibility = 'visible';
      const x = reduce ? 0 : inn * 100 - out * 32;
      f.style.transform = `translate3d(${x.toFixed(3)}%,0,0)`;
      f.style.setProperty('--d', (out * .55).toFixed(3));
      if (imgs[i] && !reduce) imgs[i].style.transform = `translate3d(${(-inn * 62).toFixed(3)}%,0,0) scale(${(1 + inn * .1).toFixed(4)})`;
    });
    let k = 0; e.forEach((v, i) => { if (i && v > .5) k = i; });
    set(k);
    if (bar) bar.style.transform = `scaleX(${clamp(u / (n - 1 + A + W)).toFixed(4)})`;
  } });
  return { go(k) { scrollTo({ top: yOf(k), behavior: reduce ? 'auto' : 'smooth' }); }, get step() { return cur; } };
}

export function initMore(root = document) {
  $$('[data-more]', root).forEach(m => {
    const b = $('[data-more-btn]', m), rest = $('.more__rest', m);
    if (!b || !rest) return;
    b.addEventListener('click', () => {
      const open = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      rest.hidden = !open; m.classList.toggle('is-open', open);
      loop.poke();
    });
  });
}

export function initAcc(root = document) {
  $$('[data-acc]', root).forEach(b => {
    const body = document.getElementById(b.getAttribute('aria-controls'));
    if (!body) return;
    b.addEventListener('click', () => {
      const open = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      body.hidden = !open; b.closest('.acc__it').classList.toggle('is-open', open);
      loop.poke();
    });
  });
}
