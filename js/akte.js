/* AKTE. Je Haus ein Akt, nach stillform.homes (Kundenwunsch 2026-11-05), Markup aus js/akte-html.js.
   Beim Hereinscrollen liegen lose Bilder um den Namen des Hauses. Dann fliegen sie weg, die mittlere Karte
   wächst zur Bildfolge (70 bis 75 % breit, nie Vollbild), mit Pfeilen und Wischen. Danach läuft der große Satz
   mit dem Aufruf zur Seite herein. Links zeigt die Liste, wo du bist, und springt zu jedem Haus.
   Nur transform und opacity. Genutzt von concepts.js (vier Häuser) und wald.js (Nächstes Concept). */
import { $, $$, E, lerp, clamp, loop, reduce } from './core.js';

/* Längen in Bildschirmhöhen: Karten stehen lassen, Wachsen, Bildfolge halten */
const HOLD = .38, GROW = .8, SLIDE = .5, L = HOLD + GROW + SLIDE;
/* Plätze der Karten: x in % der Spalte, y in % der Höhe, Breite in % der Spalte, Seitenverhältnis, Drehung, Tiefe */
const SLOTS = [
  [6, 64, 26, 4 / 3, -3, 1.1], [80, 22, 21, 4 / 3, -2.5, .7], [99, 56, 25, 4 / 3, 4, 1.25],
  [10, 104, 22, 4 / 3, 2, .9], [46, 112, 24, 4 / 3, -1.5, 1], [94, 102, 20, 4 / 5, -3, 1.3]
];
const SLOTS_M = [[6, 46, 40, 4 / 5, -4, 1], [96, 42, 38, 4 / 5, 3.5, 1.1], [12, 96, 46, 4 / 3, 2.5, .9], [90, 98, 42, 4 / 3, -3, 1.2]];
const NN = n => String(n).padStart(2, '0');

export function initAkte(root) {
  const box = root && $('[data-aks]', root);
  if (!box) return;
  box.style.setProperty('--ak-l', L.toFixed(3));
  const acts = $$('[data-ak]', box), links = $$('[data-ak-link]', box);
  const jump = el => {
    const y = el.getBoundingClientRect().top + scrollY + 2;
    if (window.__griffnerJump) window.__griffnerJump(y); else scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
  };
  links.forEach(a => a.addEventListener('click', e => {
    const t = acts.find(x => x.dataset.ak === a.dataset.akLink);
    if (t) { e.preventDefault(); jump(t); }
  }));
  let mx = 0, my = 0;
  if (!reduce && matchMedia('(pointer:fine)').matches) addEventListener('pointermove', e => { mx = e.clientX / innerWidth * 2 - 1; my = e.clientY / innerHeight * 2 - 1; loop.poke(); }, { passive: true });
  const A = acts.map(el => akt(el, () => [mx, my]));
  let cur = -1;
  loop.add({ tick() {
    const r = box.getBoundingClientRect(), vh = innerHeight;
    if (r.bottom < -vh * .2 || r.top > vh * 1.2) return;
    /* Telefon: hinter dem Kopf ein Streifen Sand, erst wenn die Leiste oben steht */
    const stuck = r.top < 53 && r.bottom > 100;
    if (box.classList.contains('is-stuck') !== stuck) box.classList.toggle('is-stuck', stuck);
    A.forEach(a => a.tick());
    if (!links.length) return;
    /* Liste: welches Haus gerade in der Mitte steht, und wie weit du darin bist */
    const mid = vh * .5; let k = 0;
    acts.forEach((el, i) => { if (el.getBoundingClientRect().top < mid) k = i; });
    links.forEach((l, i) => {
      const ar = acts[i].getBoundingClientRect();
      l.style.setProperty('--p', clamp((mid - ar.top) / Math.max(1, ar.height)).toFixed(3));
    });
    if (k !== cur) {
      cur = k;
      links.forEach((l, i) => { l.classList.toggle('is-cur', i === k); if (i === k) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current'); });
      /* Telefon: die Leiste schiebt das aktuelle Haus ins Bild */
      const bar = links[k].closest('.aks__list');
      if (bar && bar.scrollWidth > bar.clientWidth + 2) bar.scrollTo({ left: links[k].parentNode.offsetLeft - 16, behavior: reduce ? 'auto' : 'smooth' });
    }
  } });
}

function akt(el, mouse) {
  const stage = $('[data-ak-stage]', el), sticky = $('.ak__sticky', el), title = $('[data-ak-title]', el);
  const fr = $('[data-ak-frame]', el), slidesEl = $('[data-ak-slides]', el), ui = $('[data-ak-ui]', el), count = $('[data-ak-count]', el);
  const slides = $$('[data-ak-slide]', el), prev = $('[data-ak-prev]', el), next = $('[data-ak-next]', el);
  const cardsEl = $$('[data-ak-card]', el), about = $('.ak__about', el);
  const N = slides.length;
  let si = 0, lw = 0, lh = 0, W = 0, H = 0, X = 0, Y = 0, mob = false, on = [], uc = null, live = false, cx0 = 0, cy0 = 0, s0 = .5;

  /* Bildfolge: Streifen, das gewählte Bild in der Mitte, rundherum weiter */
  const show = k => {
    si = (k + N) % N;
    slides.forEach((s, j) => {
      let d = j - si;
      if (d > N / 2) d -= N; if (d < -N / 2) d += N;
      s.style.transform = `translate3d(${d * 100}%,0,0)`;
      s.style.visibility = Math.abs(d) > 1 ? 'hidden' : '';
      s.setAttribute('aria-hidden', String(j !== si));
      if (Math.abs(d) <= 1) { const im = $('img', s); if (im && im.loading === 'lazy') im.loading = 'eager'; }
    });
    count.textContent = `${NN(si + 1)} / ${NN(N)}`;
  };
  prev.addEventListener('click', () => show(si - 1));
  next.addEventListener('click', () => show(si + 1));
  let tx = 0, ty = 0;
  fr.addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  fr.addEventListener('touchend', e => {
    if (!live) return;
    const t = e.changedTouches[0], dx = t.clientX - tx, dy = t.clientY - ty;
    if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.3) show(si + (dx < 0 ? 1 : -1));
  }, { passive: true });
  show(0);

  /* Größen: Rahmen über die Spalte bis zum Seitenrand (Telefon: volle Breite mit Rand, unter der Leiste) */
  const layout = (cw, vh) => {
    mob = innerWidth < 760;
    const pm = about ? parseFloat(getComputedStyle(about).paddingRight) || 32 : 32;
    if (mob) {
      const top = 108, bot = 18;
      W = cw - 32; H = Math.round(Math.min(vh - top - bot, W * 1.32)); X = 16; Y = Math.round(top + (vh - top - bot - H) / 2);
      cx0 = cw * .5; cy0 = vh * .7; s0 = .56;
    } else {
      W = Math.round(cw - pm); H = Math.round(Math.min(vh * .74, W * .62)); X = 0; Y = Math.round((vh - H) / 2 + Math.min(30, vh * .03));
      cx0 = cw * .54; cy0 = vh * .66; s0 = .5;
    }
    Object.assign(fr.style, { width: W + 'px', height: H + 'px', left: X + 'px', top: Y + 'px' });
    const sl = mob ? SLOTS_M : SLOTS;
    on = cardsEl.map((f, i) => {
      const s = sl[i];
      if (!s) { f.style.display = 'none'; return null; }
      f.style.display = '';
      Object.assign(f.style, { width: (s[2] * cw / 100) + 'px', aspectRatio: String(s[3]), left: s[0] + '%', top: s[1] + '%' });
      return { f, s, x: s[0] / 100 * cw, y: s[1] / 100 * vh };
    });
  };

  return { tick() {
    const r = stage.getBoundingClientRect(), vh = innerHeight;
    if (r.bottom < -vh * .3 || r.top > vh * 1.3) return;
    const cw = sticky.clientWidth;
    if (cw !== lw || vh !== lh) { lw = cw; lh = vh; layout(cw, vh); }
    const [mx, my] = mouse();
    /* Fortschritt in Bildschirmhöhen, geglättet */
    const ut = -r.top / vh;
    uc = uc == null || reduce ? ut : uc + (ut - uc) * .2;
    if (Math.abs(ut - uc) > .0008) loop.poke(); else uc = ut;
    const u = uc, pre = clamp(1 + u);
    const g = reduce ? 1 : E(u, HOLD, HOLD + GROW);
    const drift = clamp(u, 0, HOLD + GROW) * vh * .08;

    /* Name: kommt mit, steht, geht beim Wachsen nach oben weg */
    const tIn = reduce ? 1 : E(pre, .35, .9);
    title.style.opacity = (tIn * (1 - E(g, .12, .5))).toFixed(3);
    title.style.transform = `translate3d(0,${((1 - tIn) * 60 - g * 80 - drift * .5).toFixed(1)}px,0)`;
    title.style.visibility = g > .99 ? 'hidden' : '';

    /* Karten: steigen von unten auf, schweben mit eigener Tiefe, fliegen beim Wachsen nach außen */
    const cw2 = cw / 2;
    on.forEach((k, i) => {
      if (!k) return;
      const [, , , , rot, dp] = k.s;
      const a = reduce ? 0 : E(pre, .15 + i * .05, .75 + i * .03), out = E(g, .04, .8);
      const x = (k.x - cw2) * out * 1.05 + mx * 14 * dp;
      const y = (1 - a) * vh * .5 * dp + (k.y - vh / 2) * out * 1.05 - drift * dp + my * 9 * dp;
      k.f.style.transform = `translate3d(-50%,-50%,0) translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${(rot * (1 + out)).toFixed(2)}deg)`;
      const op = a * (1 - E(g, .15, .65));
      k.f.style.opacity = op.toFixed(3);
      k.f.style.visibility = op < .005 ? 'hidden' : '';
    });

    /* Rahmen: als Karte unter dem Namen, wächst zur Bildfolge */
    const aF = reduce ? 1 : E(pre, .25, .9);
    const cx = X + W / 2, cy = Y + H / 2, s = lerp(s0, 1, g);
    const dx = lerp(cx0 - cx, 0, g) + mx * 10 * (1 - g), dy = lerp(cy0 - cy, 0, g) + (1 - aF) * vh * .4 - drift * (1 - g) + my * 7 * (1 - g);
    fr.style.transform = `translate3d(${dx.toFixed(1)}px,${dy.toFixed(1)}px,0) scale(${s.toFixed(4)})`;
    fr.style.opacity = aF.toFixed(3);
    slidesEl.style.transform = `scale(${lerp(1.16, 1, g).toFixed(4)})`;

    /* Pfeile und Zähler, sobald der Rahmen steht */
    const ready = E(g, .82, 1);
    ui.style.opacity = ready.toFixed(3);
    const nowLive = ready > .5;
    if (nowLive !== live) {
      live = nowLive; ui.classList.toggle('is-on', live);
      [prev, next].forEach(b => b.setAttribute('tabindex', live ? '0' : '-1'));
    }
    /* Gelbes Feld dockt am Rahmen, solange er steht */
    if (g > .97 && u < L + .25) delete fr.dataset.dockHide; else fr.dataset.dockHide = '1';
  } };
}
