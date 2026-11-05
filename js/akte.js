/* AKTE. Je Haus ein Akt, nach stillform.homes und dem Video des Kunden (2026-11-05, zweite Fassung). Markup aus js/akte-html.js.
   Alles in einem gepinnten Bild und nur über das Scrollen, ohne Sprung:
   1. Name des Hauses, lose Bilder darum, in der Mitte die Bildfolge als kleine Karte mit Pfeilen
   2. die Karte wächst zur Bildfolge (70 bis 75 % breit, nie Vollbild), beim Scrollen schieben sich zwei Bilder darüber
   3. beim dritten Bild schrumpft die Bildfolge und landet als kleines Bild am Anfang des großen Satzes,
      der Satz läuft Wort für Wort herein, dann Linie und großer Aufruf zur Seite des Hauses.
   Pfeile und Wischen blättern zusätzlich. Links zeigt die Liste, wo du bist, und springt zu jedem Haus.
   Nur transform, opacity und (beim Schrumpfen) clip-path. Genutzt von concepts.js (vier Häuser) und wald.js (Nächstes Concept). */
import { $, $$, E, lerp, clamp, seg, loop, reduce } from './core.js';

/* Ablauf in Bildschirmhöhen, ab dem Moment, in dem der Akt oben anliegt */
const T = {
  grow: [.3, 1],                                  // davor stehen Name und lose Bilder
  wipes: [[.62, 1], [1.16, 1.52], [1.66, 2]],    // drei Bildwechsel, der letzte während des Schrumpfens
  shrink: [1.66, 2.3],                            // Bildfolge wird zum kleinen Bild im Satz
  words: [1.98, 2.52],                            // Satz Wort für Wort
  rule: [2.4, 2.66], row: [2.5, 2.76],
  L: 2.98                                         // danach löst sich der Akt und scrollt weg
};
/* Plätze der Karten: x in % der Spalte, y in % der Höhe, Breite in % der Spalte, Seitenverhältnis, Drehung, Tiefe */
const SLOTS = [
  [6, 64, 26, 4 / 3, -3, 1.1], [80, 22, 21, 4 / 3, -2.5, .7], [99, 56, 25, 4 / 3, 4, 1.25],
  [10, 104, 22, 4 / 3, 2, .9], [46, 112, 24, 4 / 3, -1.5, 1], [94, 102, 20, 4 / 5, -3, 1.3]
];
const SLOTS_M = [[6, 46, 40, 4 / 5, -4, 1], [96, 42, 38, 4 / 5, 3.5, 1.1], [12, 96, 46, 4 / 3, 2.5, .9], [90, 98, 42, 4 / 3, -3, 1.2]];
const NN = n => String(n).padStart(2, '0');
/* Weich hinein und heraus, für alles, was am Scrollen hängt (Wachsen, Bildwechsel, Schrumpfen) */
const io = t => t < .5 ? 2 * t * t : 1 - (2 - 2 * t) * (2 - 2 * t) / 2;
/* Mit reduzierter Bewegung springen die Zustände in der Mitte jeder Strecke um */
const S = (u, a, b) => reduce ? (u >= (a + b) / 2 ? 1 : 0) : E(u, a, b);
const I = (u, a, b) => reduce ? (u >= (a + b) / 2 ? 1 : 0) : io(seg(u, a, b));

export function initAkte(root) {
  const box = root && $('[data-aks]', root);
  if (!box) return;
  box.style.setProperty('--ak-l', T.L.toFixed(3));
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
  /* Schriften verschieben den Satz: danach das kleine Bild neu vermessen */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { A.forEach(a => a.relayout()); loop.poke(); });
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
      l.style.setProperty('--p', clamp((mid - ar.top) / Math.max(1, ar.height - vh * .5)).toFixed(3));
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
  el.classList.add('is-js');
  const stage = $('[data-ak-stage]', el), sticky = $('.ak__sticky', el), title = $('[data-ak-title]', el);
  const fr = $('[data-ak-frame]', el), slidesEl = $('[data-ak-slides]', el), ui = $('[data-ak-ui]', el), count = $('[data-ak-count]', el);
  const slides = $$('[data-ak-slide]', el), prev = $('[data-ak-prev]', el), next = $('[data-ak-next]', el), arrows = $('[data-ak-arrows]', el);
  const cardsEl = $$('[data-ak-card]', el), about = $('[data-ak-about]', el), thumb = $('[data-ak-thumb]', el);
  const kap = $('[data-ak-kap]', el), rule = $('[data-ak-rule]', el), row = $('[data-ak-row]', el);
  const words = $$('.ak__w > span', el), wl = words.map(() => -1);
  const N = slides.length;
  let lw = 0, lh = 0, W = 0, H = 0, X = 0, Y = 0, on = [], uc = null, live = false, cx0 = 0, cy0 = 0, s0 = .5;
  let tcx = 0, tcy = 0, kT = .1, ixT = 0, iyT = 0, man = 0, manC = 0, lastK = -1;
  const sv = slides.map(() => -9);

  /* Bildfolge als Streifen: das nächste Bild schiebt sich von rechts über das aktuelle, das aktuelle weicht etwas nach links */
  const place = pos => {
    slides.forEach((s, j) => {
      let d = ((j - pos) % N + N) % N; if (d > N / 2) d -= N;
      const v = d > -1 && d < 1 ? Math.round(d * 1000) / 1000 : 9;
      if (v === sv[j]) return; sv[j] = v;
      if (v === 9) { s.style.visibility = 'hidden'; return; }
      s.style.visibility = '';
      s.style.zIndex = v > 0 ? 2 : 1;
      s.style.transform = `translate3d(${(v > 0 ? v * 100 : v * 32).toFixed(2)}%,0,0)`;
      const im = $('img', s); if (im && im.loading === 'lazy') im.loading = 'eager';
    });
    const k = ((Math.round(pos) % N) + N) % N;
    if (k !== lastK) {
      lastK = k; count.textContent = `${NN(k + 1)} / ${NN(N)}`;
      slides.forEach((s, j) => s.setAttribute('aria-hidden', String(j !== k)));
    }
  };
  const step = d => { man += d; loop.poke(); };
  prev.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  let tx = 0, ty = 0;
  fr.addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  fr.addEventListener('touchend', e => {
    if (!live) return;
    const t = e.changedTouches[0], dx = t.clientX - tx, dy = t.clientY - ty;
    if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.3) step(dx < 0 ? 1 : -1);
  }, { passive: true });
  place(0);

  /* Größen: Rahmen über die Spalte bis zum Seitenrand (Telefon: volle Breite mit Rand, unter der Leiste),
     Ziel beim Schrumpfen ist das kleine Bild im Satz */
  const layout = (cw, vh) => {
    const mob = innerWidth < 760;
    const pm = Math.max(16, cw - about.offsetLeft - about.offsetWidth);
    if (mob) {
      const top = 108, bot = 18;
      W = cw - 32; H = Math.round(Math.min(vh - top - bot, W * 1.32)); X = 16; Y = Math.round(top + (vh - top - bot - H) / 2);
      cx0 = cw * .5; cy0 = vh * .7; s0 = .56;
    } else {
      W = Math.round(cw - pm); H = Math.round(Math.min(vh * .74, W * .62)); X = 0; Y = Math.round((vh - H) / 2 + Math.min(30, vh * .03));
      cx0 = cw * .54; cy0 = vh * .66; s0 = .5;
    }
    Object.assign(fr.style, { width: W + 'px', height: H + 'px', left: X + 'px', top: Y + 'px' });
    const sr = sticky.getBoundingClientRect(), tr = thumb.getBoundingClientRect();
    const tw = Math.max(8, tr.width), th = Math.max(6, tr.height);
    tcx = tr.left - sr.left + tw / 2; tcy = tr.top - sr.top + th / 2;
    /* Gleichmäßig verkleinern, das Seitenverhältnis gleicht ein Ausschnitt aus (kein Verzerren) */
    if (tw / th >= W / H) { kT = tw / W; ixT = 0; iyT = (H - th / kT) / 2; } else { kT = th / H; iyT = 0; ixT = (W - tw / kT) / 2; }
    const sl = mob ? SLOTS_M : SLOTS;
    on = cardsEl.map((f, i) => {
      const s = sl[i];
      if (!s) { f.style.display = 'none'; return null; }
      f.style.display = '';
      Object.assign(f.style, { width: (s[2] * cw / 100) + 'px', aspectRatio: String(s[3]), left: s[0] + '%', top: s[1] + '%' });
      return { f, s, x: s[0] / 100 * cw, y: s[1] / 100 * vh };
    });
  };

  return {
    relayout() { lw = 0; },
    tick() {
      const r = stage.getBoundingClientRect(), vh = innerHeight;
      if (r.bottom < -vh * .3 || r.top > vh * 1.3) return;
      const cw = sticky.clientWidth;
      if (cw !== lw || vh !== lh) { lw = cw; lh = vh; layout(cw, vh); }
      const [mx, my] = mouse();
      /* Fortschritt in Bildschirmhöhen, geglättet */
      const ut = -r.top / vh;
      uc = uc == null || reduce ? ut : uc + (ut - uc) * .2;
      if (Math.abs(ut - uc) > .0008) loop.poke(); else uc = ut;
      manC = reduce ? man : manC + (man - manC) * .16;
      if (Math.abs(man - manC) > .001) loop.poke(); else manC = man;
      const u = uc, pre = clamp(1 + u);
      const g = I(u, ...T.grow), q = I(u, ...T.shrink);
      const drift = clamp(u, 0, T.grow[1]) * vh * .08;

      /* Name: kommt mit, steht, geht beim Wachsen nach oben weg */
      const tIn = S(pre, .35, .9);
      title.style.opacity = (tIn * (1 - S(g, .12, .5))).toFixed(3);
      title.style.transform = `translate3d(0,${((1 - tIn) * 60 - g * 80 - drift * .5).toFixed(1)}px,0)`;
      title.style.visibility = g > .99 ? 'hidden' : '';

      /* Karten: steigen von unten auf, schweben mit eigener Tiefe, fliegen beim Wachsen nach außen */
      const cw2 = cw / 2;
      on.forEach((k, i) => {
        if (!k) return;
        const [, , , , rot, dp] = k.s;
        const a = S(pre, .15 + i * .05, .75 + i * .03), out = E(g, .04, .8);
        const x = (k.x - cw2) * out * 1.05 + mx * 14 * dp;
        const y = (1 - a) * vh * .5 * dp + (k.y - vh / 2) * out * 1.05 - drift * dp + my * 9 * dp;
        k.f.style.transform = `translate3d(-50%,-50%,0) translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${(rot * (1 + out)).toFixed(2)}deg)`;
        const op = a * (1 - E(g, .15, .65));
        k.f.style.opacity = op.toFixed(3);
        k.f.style.visibility = op < .005 ? 'hidden' : '';
      });

      /* Bildfolge: drei Wechsel beim Scrollen, Pfeile kommen dazu */
      const sp = T.wipes.reduce((a, w) => a + I(u, w[0], w[1]), 0);
      place(sp + manC);

      /* Rahmen: kleine Karte unter dem Namen, wächst zur Bildfolge, schrumpft ins kleine Bild im Satz */
      const aF = S(pre, .25, .9), fcx = X + W / 2, fcy = Y + H / 2;
      if (q <= 0) {
        const s = lerp(s0, 1, g);
        const dx = lerp(cx0 - fcx, 0, g) + mx * 10 * (1 - g), dy = lerp(cy0 - fcy, 0, g) + (1 - aF) * vh * .4 - drift * (1 - g) + my * 7 * (1 - g);
        fr.style.transform = `translate3d(${dx.toFixed(1)}px,${dy.toFixed(1)}px,0) scale(${s.toFixed(4)})`;
        fr.style.clipPath = '';
        fr.style.opacity = aF.toFixed(3);
      } else {
        const s = Math.exp(Math.log(kT) * q);
        fr.style.transform = `translate3d(${((tcx - fcx) * q).toFixed(1)}px,${((tcy - fcy) * q).toFixed(1)}px,0) scale(${s.toFixed(4)})`;
        fr.style.clipPath = `inset(${(iyT * q).toFixed(1)}px ${(ixT * q).toFixed(1)}px)`;
        fr.style.opacity = '1';
      }
      slidesEl.style.transform = `scale(${lerp(1.16, 1, g).toFixed(4)})`;

      /* Zähler und Bildschutz nur in voller Größe, Pfeile schon auf der Karte, beim Schrumpfen gehen beide */
      const gone = S(q, 0, .2);
      ui.style.opacity = (E(g, .82, 1) * (1 - gone)).toFixed(3);
      arrows.style.opacity = (aF * (1 - gone)).toFixed(3);
      fr.style.setProperty('--ak-shade', (1 - gone).toFixed(3));
      const nowLive = aF > .5 && q < .05;
      if (nowLive !== live) {
        live = nowLive; arrows.classList.toggle('is-on', live);
        [prev, next].forEach(b => b.setAttribute('tabindex', live ? '0' : '-1'));
      }
      /* Gelbes Feld dockt am Rahmen, solange er in voller Größe steht */
      if (g > .97 && q < .02) delete fr.dataset.dockHide; else fr.dataset.dockHide = '1';

      /* Satz: Kennzeile, Wörter von unten aus der Zeile, Linie, Aufruf */
      kap.style.opacity = S(u, T.words[0] - .04, T.words[0] + .18).toFixed(3);
      const n = words.length, [wa, wb] = T.words, wd = .14;
      words.forEach((w, i) => {
        const a = wa + (wb - wa - wd) * i / Math.max(1, n - 1);
        const p = Math.round(S(u, a, a + wd) * 1000) / 1000;
        if (p === wl[i]) return; wl[i] = p;
        w.style.transform = p >= 1 ? '' : `translate3d(0,${((1 - p) * 112).toFixed(1)}%,0)`;
      });
      rule.style.transform = `scaleX(${S(u, ...T.rule).toFixed(4)})`;
      const pr = S(u, ...T.row);
      row.style.opacity = pr.toFixed(3);
      row.style.transform = `translate3d(0,${((1 - pr) * 24).toFixed(1)}px,0)`;
      row.style.visibility = pr < .01 ? 'hidden' : '';
    }
  };
}
