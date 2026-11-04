/* EIN TAG IM WALD. Neu nach der Referenz hausbaugehtbesser.com ("frag nicht, was extra kostet"): ein dunkles Feld,
   oben Reiter, in der Mitte eine Axonometrie als Strichzeichnung, unten vier Kennzahlen.
   Die Reiter sind Tageszeiten (WALD_TAG in data/content.js). Die Sonne wandert auf ihrer Bahn, durch die Fenster fällt
   ihr Licht als gelbe Fläche auf den Boden, die Zonen in der Sonne leuchten. Das Obergeschoß schwebt über dem
   Erdgeschoß, damit man in beide hineinsieht. Kein Plan, eine Idee.
   Reines SVG statt WebGL: gezeichnet wird nur, wenn sich etwas bewegt. Das hält die Seite leicht.
   Sonne für Griffen (46,7° Nord), gerundet: Juni Aufgang 5:10, Untergang 20:55, höchster Stand 67°,
   Dezember Aufgang 7:40, Untergang 16:25, höchster Stand 20°. Süden ist +z (Garten), Osten ist +x. */
import { $, $$, E, ease, clamp, lerp, reduce, h } from './core.js';
import { WALD_TAG } from '../data/content.js';

const SUN = { juni: { rise: 5.17, set: 20.92, A: 126, top: 67 }, dezember: { rise: 7.67, set: 16.42, A: 56, top: 20 } };
const RAD = Math.PI / 180;
/* Concept Wald: Erdgeschoß 17 x 9 m, Obergeschoß 15 m lang und 2,4 m nach Westen versetzt.
   y ist die Höhe in der Zeichnung (das Obergeschoß schwebt höher als in echt), cut die Schnitthöhe der Wände. */
const DD = 9, TH = .32;
const FL = [{ x0: -8.5, x1: 8.5, y: 0, cut: 1.1 }, { x0: -9.9, x1: 5.1, y: 6.3, cut: .9 }];
/* Zonen als Anteile des Geschoßes: [Name, x0, x1 (West nach Ost), z0, z1 (Nord nach Süd), Blickrichtung x, z] */
const ZONES = [
  [['Wohnen', 0, .38, 0, 1, -.6, 1], ['Essen', .38, .66, .42, 1, 0, 1], ['Kern', .38, .66, 0, .42, 0, -1], ['Kochen', .66, 1, .45, 1, .8, .6], ['Ankommen', .66, 1, 0, .45, 1, -.4]],
  [['Kind', 0, .3, 0, .5, -1, -.3], ['Kind', 0, .3, .5, 1, -.8, .6], ['Galerie', .3, .64, .45, 1, 0, 1], ['Bad', .3, .64, 0, .45, 0, -1], ['Eltern', .64, 1, 0, 1, 1, .3]]
];
/* Terrasse vor Wohnen und Essen, offen nach Süden und Westen */
const TERR = ['Terrasse', 0, .62, 1, 1.42, -.7, .7];
/* Fenster: [Geschoß, Seite (s, n, o, w), von, bis (Anteile der Seite), Brüstung, Sturz]. Unten zum Garten ganz Glas. */
const WIN = [
  [0, 's', 0, 1, 0, 2.6], [0, 'w', .15, .85, .45, 2.4], [0, 'o', .55, .92, .45, 2.4], [0, 'o', .1, .38, 0, 2.3],
  [1, 's', 0, .64, .5, 2.3], [1, 'w', .1, .9, .5, 2.3], [1, 'o', .2, .8, .5, 2.3], [1, 'n', .36, .6, 1.2, 2.2]
];
/* Bäume: x, z, Höhe (0 = Laubbaum). Hinter und neben dem Haus, der Garten im Süden bleibt frei. */
const TREES = [
  [-12, -8.5, 7.5], [-15, -2.5, 6.5], [-8, -11.5, 8], [-1.5, -12, 0], [4.5, -11.5, 8.5], [10, -9.5, 7.5], [13.5, -5, 6.5],
  [16, -9.5, 0], [-16.5, -8.5, 0], [-12.5, -13, 8], [15.5, 1, 6.5], [-16, 2, 6.5]
];
/* Blick von Südwesten, leicht von oben */
const AZ = -.52, EL = .56, ca = Math.cos(AZ), sa = Math.sin(AZ), ce = Math.cos(EL), se = Math.sin(EL);
const rx = (x, z) => x * ca - z * sa, ry = (x, y, z) => se * (x * sa + z * ca) - y * ce;
const dep = (x, z) => x * sa + z * ca;

let D, S = { t: 7, m: 0 }, tab = 0, k = reduce ? 1 : 0, B = null, tw = null, play = null, raf = 0, F = null, narrow = false, sayNow = '', LIT = [];

const hhmm = t => { const m = Math.round(t * 60); return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
const f1 = v => v.toFixed(1);
const season = m => { const a = SUN.juni, b = SUN.dezember; return { rise: lerp(a.rise, b.rise, m), set: lerp(a.set, b.set, m), A: lerp(a.A, b.A, m), top: lerp(a.top, b.top, m) }; };
function sun(t, m) {
  const s = season(m), u = (t - s.rise) / (s.set - s.rise);
  if (u <= 0 || u >= 1) return { up: false, u, psi: (u <= 0 ? s.A : -s.A) * RAD, alt: 0 };
  return { up: true, u, psi: lerp(s.A, -s.A, u) * RAD, alt: s.top * Math.sin(Math.PI * u) * RAD };
}
/* Wie viel Sonne eine Zone bekommt: Blickrichtung gegen die Sonne, bei tiefer Sonne weniger */
const shine = (z, o) => {
  if (!o.up) return 0;
  const sx = Math.sin(o.psi), sz = Math.cos(o.psi), n = Math.hypot(z[5], z[6]);
  return clamp((z[5] * sx + z[6] * sz) / n) * clamp(o.alt / (12 * RAD));
};
/* Sonnenbahn um die Hausmitte, etwas angehoben, damit die Mittagssonne über dem Obergeschoß steht und nicht darauf.
   Die Bahn ist breiter als hoch, so steht die tiefe Wintersonne vor dem Haus im Garten und nicht auf dem Dach. */
const sunAt = (o, R) => [Math.sin(o.psi) * Math.cos(o.alt) * R[0], 2.5 + Math.sin(o.alt) * R[1], Math.cos(o.psi) * Math.cos(o.alt) * R[0]];

export function initWaldTag() {
  D = {
    box: $('[data-wt]'), stage: $('[data-wt-stage]'), svg: $('[data-wt-svg]'), tabs: $('[data-wt-tabs]'), play: $('[data-wt-play]'), say: $('[data-wt-say]'),
    time: $('[data-wt-time]'), when: $('[data-wt-when]'), litN: $('[data-wt-lit]'), day: $('[data-wt-day]'), dayL: $('[data-wt-day-l]')
  };
  if (!D.box) return;
  D.btn = WALD_TAG.map((T, i) => {
    const b = h('button', { type: 'button', class: 'wt__chip info', 'aria-pressed': String(i === tab) }, T.label);
    b.addEventListener('click', () => { stopPlay(); pick(i); });
    D.tabs.appendChild(b); return b;
  });
  D.play.addEventListener('click', () => (play ? stopPlay() : startPlay()));
  const T = WALD_TAG[0]; S = { t: T.time, m: T.season === 'dezember' ? 1 : 0 };
  new ResizeObserver(() => { fit(); draw(); }).observe(D.stage);
  /* Beim ersten Sehen baut sich die Zeichnung auf: Boden, Wände, Zonen, Obergeschoß, Bäume, Sonne */
  if (!reduce) new IntersectionObserver((es, io) => es.forEach(e => {
    if (!e.isIntersecting) return; io.disconnect(); B = { t0: performance.now() }; run();
  }), { threshold: .3 }).observe(D.stage);
  fit(); draw(); ui();
}

function pick(i) {
  tab = i; const T = WALD_TAG[i];
  tw = { a: { ...S }, b: { t: T.time, m: T.season === 'dezember' ? 1 : 0 }, t0: performance.now(), dur: reduce ? 0 : 1300 };
  run();
}
/* Tag abspielen: die Junisonne läuft vom Morgen bis zum Abend, die Reiter gehen mit */
function startPlay() {
  const s = SUN.juni;
  tw = null; play = { t0: performance.now(), dur: reduce ? 0 : 9000, a: s.rise + .35, b: s.set - .35, m0: S.m, from: S.t };
  D.play.textContent = 'Anhalten'; D.play.setAttribute('aria-pressed', 'true'); run();
}
function stopPlay() { if (!play) return; play = null; D.play.textContent = 'Tag abspielen'; D.play.setAttribute('aria-pressed', 'false'); }

function run() { if (!raf) raf = requestAnimationFrame(frame); }
function frame(now) {
  raf = 0; let more = false;
  if (B) { k = clamp((now - B.t0) / 2800); if (k < 1) more = true; else B = null; }
  if (tw) {
    const q = tw.dur ? ease(clamp((now - tw.t0) / tw.dur)) : 1;
    S = { t: lerp(tw.a.t, tw.b.t, q), m: lerp(tw.a.m, tw.b.m, q) };
    if (q < 1) more = true; else tw = null;
  }
  if (play) {
    const q = play.dur ? clamp((now - play.t0) / play.dur) : 1;
    /* kurz zum Morgen zurück, dann gleichmäßig durch den Tag */
    const g = ease(clamp(q * 7));
    S = { t: lerp(lerp(play.from, play.a, g), play.b, clamp((q - 1 / 7) / (6 / 7))), m: lerp(play.m0, 0, g) };
    const i = S.t < 10.5 ? 0 : S.t < 15.5 ? 1 : 2;
    if (i !== tab) tab = i;
    if (q < 1) more = true; else stopPlay();
  }
  draw(); ui();
  if (more) run();
}

/* Maßstab: Haus, beide Sonnenbahnen und auf breiten Flächen die Bäume passen hinein, unabhängig vom Reiter */
function fit() {
  const W = D.stage.clientWidth, H = D.stage.clientHeight; if (!W || !H) return;
  narrow = W < 560;
  /* Telefon: das Haus füllt die Breite, die Sonnenbahn darf über den Rand laufen, die Sonne selbst bleibt im Bild */
  const R = narrow ? [19, 19] : [19, 15], P = [];
  FL.forEach(f => [f.x0, f.x1].forEach(x => [-DD / 2, DD / 2].forEach(z => { P.push([x, f.y - .3, z], [x, f.y + f.cut, z]); })));
  P.push([FL[0].x0, 0, DD / 2 + .42 * DD], [FL[0].x0 + .62 * 17, 0, DD / 2 + .42 * DD]);
  /* Bäume nur auf breiten Flächen ganz im Bild, am Telefon dürfen sie angeschnitten sein */
  if (!narrow) TREES.forEach(([x, z, ht]) => { const r = ht ? ht * .21 : 2.1; P.push([x - r, 0, z], [x + r, 0, z], [x, ht || 6.9, z]); });
  if (!narrow) ['juni', 'dezember'].forEach((sn, j) => { const s = SUN[sn]; for (let i = 1; i < 40; i++) P.push(sunAt(sun(lerp(s.rise, s.set, i / 40), j), R)); });
  P.push([-3, 0, DD / 2 + .42 * DD + 2.4]);
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  P.forEach(([x, y, z]) => { const a = rx(x, z), b = ry(x, y, z); x0 = Math.min(x0, a); x1 = Math.max(x1, a); y0 = Math.min(y0, b); y1 = Math.max(y1, b); });
  const pl = narrow ? 14 : 30, pr = pl, pt = narrow ? 72 : 26, pb = narrow ? 60 : 70;
  const s = Math.min((W - pl - pr) / (x1 - x0), (H - pt - pb) / (y1 - y0));
  F = { W, H, s, R, ox: pl + (W - pl - pr - (x1 - x0) * s) / 2 - x0 * s, oy: pt + (H - pt - pb - (y1 - y0) * s) / 2 - y0 * s };
}
const pr = (x, y, z) => [F.ox + rx(x, z) * F.s, F.oy + ry(x, y, z) * F.s];
const pts = l => l.map(([x, y, z]) => pr(x, y, z).map(f1).join(',')).join(' ');
const poly = (l, a) => `<polygon points="${pts(l)}" ${a}/>`;
const line = (p, q, a) => { const A = pr(...p), Bq = pr(...q); return `<line x1="${f1(A[0])}" y1="${f1(A[1])}" x2="${f1(Bq[0])}" y2="${f1(Bq[1])}" ${a}/>`; };

/* Quader, sichtbar sind Oberseite, Südseite und Westseite (Blick von Südwesten) */
function cube(x0, x1, z0, z1, y0, y1, c) {
  if (y1 - y0 < .01) return '';
  return poly([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], `fill="${c[1]}" stroke="${c[3]}" stroke-width=".6"`) +
    poly([[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], `fill="${c[2]}" stroke="${c[3]}" stroke-width=".6"`) +
    poly([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], `fill="${c[0]}" stroke="${c[3]}" stroke-width=".6"`);
}
const WALL = ['#CFC3B3', '#9b9284', '#77706a', 'rgba(0,0,0,.35)'];

/* Seitenlinie eines Geschoßes zwischen zwei Anteilen, mit Außennormale */
function side(f, sd, a, b) {
  const L = f.x1 - f.x0, z0 = -DD / 2, z1 = DD / 2;
  if (sd === 's') return { p: [f.x0 + a * L, z1], q: [f.x0 + b * L, z1], n: [0, 1] };
  if (sd === 'n') return { p: [f.x0 + a * L, z0], q: [f.x0 + b * L, z0], n: [0, -1] };
  if (sd === 'o') return { p: [f.x1, z0 + a * DD], q: [f.x1, z0 + b * DD], n: [1, 0] };
  return { p: [f.x0, z0 + a * DD], q: [f.x0, z0 + b * DD], n: [-1, 0] };
}
/* Wandstück als Quader nach innen */
function wallBox(f, sd, a, b, y0, y1) {
  const { p, q } = side(f, sd, a, b), xa = Math.min(p[0], q[0]), xb = Math.max(p[0], q[0]), za = Math.min(p[1], q[1]), zb = Math.max(p[1], q[1]);
  if (sd === 's') return [xa, xb, zb - TH, zb, y0, y1];
  if (sd === 'n') return [xa, xb, za, za + TH, y0, y1];
  if (sd === 'o') return [xb - TH, xb, za, zb, y0, y1];
  return [xa, xa + TH, za, zb, y0, y1];
}
/* Polygon an einem Rechteck abschneiden (Sutherland Hodgman), Punkte als [x, z] */
function clipRect(P, x0, x1, z0, z1) {
  const cut = (L, inside, hit) => { const out = []; L.forEach((c, i) => { const p = L[(i + L.length - 1) % L.length], ci = inside(c), pi = inside(p); if (ci) { if (!pi) out.push(hit(p, c)); out.push(c); } else if (pi) out.push(hit(p, c)); }); return out; };
  const at = (p, c, t) => [lerp(p[0], c[0], t), lerp(p[1], c[1], t)];
  let L = P;
  L = cut(L, c => c[0] >= x0, (p, c) => at(p, c, (x0 - p[0]) / (c[0] - p[0]))); if (!L.length) return L;
  L = cut(L, c => c[0] <= x1, (p, c) => at(p, c, (x1 - p[0]) / (c[0] - p[0]))); if (!L.length) return L;
  L = cut(L, c => c[1] >= z0, (p, c) => at(p, c, (z0 - p[1]) / (c[1] - p[1]))); if (!L.length) return L;
  return cut(L, c => c[1] <= z1, (p, c) => at(p, c, (z1 - p[1]) / (c[1] - p[1])));
}

/* Kegel als Umriss: Spitze, zwei Tangenten, vordere Ellipsenhälfte */
function cone(x, y, z, r, hh) {
  const [bx, by] = pr(x, y, z), a = r * F.s, b = r * se * F.s, H = hh * ce * F.s;
  if (H <= b + 1) return `<ellipse cx="${f1(bx)}" cy="${f1(by)}" rx="${f1(a)}" ry="${f1(b)}"/>`;
  const st = b / H, xt = a * Math.sqrt(1 - st * st), yt = -b * st;
  return `<path d="M${f1(bx)},${f1(by - H)}L${f1(bx + xt)},${f1(by + yt)}A${f1(a)},${f1(b)} 0 1 1 ${f1(bx - xt)},${f1(by + yt)}Z"/>`;
}
function tree([x, z, ht], g) {
  if (g < .01) return '';
  let o = `<g class="wt__tree" opacity="${f1(g)}">`;
  if (ht) {
    const hh = ht * g, rad = ht * .21, stem = 1 * g, C = hh - stem;
    o += line([x, 0, z], [x, stem + .3, z], '');
    [[0, .58, 1], [.27, .48, .74], [.52, .48, .48]].forEach(([y0, q, rr]) => { o += cone(x, stem + C * y0, z, rad * rr, C * q); });
  } else {
    const rad = 2.1, stem = 3.1 * g, [cx, cy] = pr(x, stem + rad * .8 * g, z);
    o += line([x, 0, z], [x, stem, z], '') + `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(rad * F.s * g)}"/>`;
  }
  return o + '</g>';
}

function floor(fi, o, yOff, wk) {
  const f = FL[fi], y = f.y + yOff, L = f.x1 - f.x0, z0 = -DD / 2, z1 = DD / 2, g = [], labs = [];
  let s = '';
  /* Platte */
  const slab = fi ? ['rgba(16,16,15,.86)', 'rgba(12,12,12,.92)', 'rgba(9,9,9,.92)', 'rgba(255,255,255,.45)'] : ['#151514', '#101010', '#0c0c0c', 'rgba(255,255,255,.3)'];
  s += cube(f.x0, f.x1, z0, z1, y - (fi ? .22 : .3), y, slab);
  /* Raster nur im Erdgeschoß */
  if (!fi) { for (let x = Math.ceil(f.x0) + .5; x < f.x1; x += 1) s += line([x, y, z0], [x, y, z1], 'class="wt__grid"'); for (let zz = z0 + 1; zz < z1; zz += 1) s += line([f.x0, y, zz], [f.x1, y, zz], 'class="wt__grid"'); }
  /* Zonen, die Sonne färbt sie warm */
  const zone = (q, x0, x1, za, zb, yy, deck) => {
    const v = shine(q, o), gap = .22;
    const P = [[x0 + gap, yy, za + gap], [x1 - gap, yy, za + gap], [x1 - gap, yy, zb - gap], [x0 + gap, yy, zb - gap]];
    s += poly(P, `fill="${v > .02 ? `rgba(255,178,0,${(.03 + v * .07).toFixed(3)})` : deck ? 'rgba(207,195,179,.08)' : 'rgba(255,255,255,.035)'}" stroke="${deck ? 'rgba(207,195,179,.38)' : 'rgba(255,255,255,.17)'}" stroke-width="1"`);
    if (deck) for (let zz = za + .7; zz < zb - .3; zz += .6) s += line([x0 + gap, yy, zz], [x1 - gap, yy, zz], 'stroke="rgba(207,195,179,.16)"');
    const c = pr((x0 + x1) / 2, yy, (za + zb) / 2);
    labs.push({ c, t: q[0], on: v > .45 });
    return v;
  };
  const lit = ZONES[fi].map(q => zone(q, f.x0 + q[1] * L, f.x0 + q[2] * L, z0 + q[3] * DD, z0 + q[4] * DD, y + .01));
  if (!fi) lit.push(zone(TERR, f.x0 + TERR[1] * L, f.x0 + TERR[2] * L, z0 + TERR[3] * DD, z0 + TERR[4] * DD, .02, true));
  /* Licht durch die Fenster auf den Boden: Brüstung und Sturz, entlang der Sonnenrichtung verschoben, am Raum abgeschnitten */
  if (o.up && o.alt > 2 * RAD) {
    const hx = Math.sin(o.psi), hz = Math.cos(o.psi), kk = 1 / Math.tan(o.alt), a = clamp(o.alt / (10 * RAD));
    WIN.filter(w => w[0] === fi).forEach(([, sd, wa, wb, sill, head]) => {
      const { p, q, n } = side(f, sd, wa, wb), face = n[0] * hx + n[1] * hz;
      if (face < .05) return;
      const sh = hh => [-hh * kk * hx, -hh * kk * hz];
      const A = sh(sill), Bv = sh(head);
      const P = clipRect([[p[0] + A[0], p[1] + A[1]], [q[0] + A[0], q[1] + A[1]], [q[0] + Bv[0], q[1] + Bv[1]], [p[0] + Bv[0], p[1] + Bv[1]]], f.x0 + TH, f.x1 - TH, z0 + TH, z1 - TH);
      if (P.length > 2) s += poly(P.map(([x, z]) => [x, y + .02, z]), `fill="rgba(255,178,0,${f1(.18 + .3 * a * Math.min(1, face * 1.4))})" stroke="rgba(255,178,0,.55)" stroke-width=".75"`);
    });
  }
  /* Wände im Schnitt, Fenster als Glas mit Pfosten */
  const items = [];
  ['n', 'o', 's', 'w'].forEach(sd => {
    const ws = WIN.filter(w => w[0] === fi && w[1] === sd).sort((p, q) => p[2] - q[2]);
    let a = 0;
    const solid = (wa, wb) => { if (wb - wa > .001) { const c = wallBox(f, sd, wa, wb, y, y + f.cut * wk); items.push({ d: dep((c[0] + c[1]) / 2, (c[2] + c[3]) / 2), s: cube(...c, WALL) }); } };
    ws.forEach(([, , wa, wb, sill]) => {
      solid(a, wa); a = wb;
      const sl = Math.min(sill, f.cut) * wk, top = y + f.cut * wk;
      const c = wallBox(f, sd, wa, wb, y, y + sl), d = dep((c[0] + c[1]) / 2, (c[2] + c[3]) / 2);
      if (sl > .01) items.push({ d, s: cube(...c, WALL) });
      /* Glas außen bündig: Scheibe, obere Kante, Pfosten */
      const { p, q } = side(f, sd, wa, wb), len = Math.hypot(q[0] - p[0], q[1] - p[1]), nm = Math.max(1, Math.round(len / 2.1));
      let g2 = poly([[p[0], y + sl, p[1]], [q[0], y + sl, q[1]], [q[0], top, q[1]], [p[0], top, p[1]]], 'class="wt__glass"');
      g2 += line([p[0], top, p[1]], [q[0], top, q[1]], 'class="wt__mull"');
      for (let i = 0; i <= nm; i++) { const t = i / nm, x = lerp(p[0], q[0], t), z = lerp(p[1], q[1], t); g2 += line([x, y + sl, z], [x, top, z], 'class="wt__mull"'); }
      items.push({ d: d + .01, s: g2 });
    });
    solid(a, 1);
  });
  items.sort((p, q) => p.d - q.d).forEach(it => { s += it.s; });
  return { s, labs, lit };
}

function draw() {
  if (!F) return;
  const o = sun(S.t, S.m), W = F.W, H = F.H;
  let s = '';
  /* Grundstück und Garten */
  const gk = E(k, 0, .2);
  s += `<g opacity="${f1(gk)}">` + poly([[-23, 0, -17], [23, 0, -17], [23, 0, 12], [-23, 0, 12]], 'class="wt__plot"') + '</g>';
  /* Bäume hinter dem Haus zuerst */
  const tg = t => E(k, .08 + clamp((Math.hypot(t[0], t[1]) - 12) / 12) * .25, .38 + clamp((Math.hypot(t[0], t[1]) - 12) / 12) * .25);
  const back = TREES.filter(t => dep(t[0], t[1]) < dep(0, -DD / 2)).sort((p, q) => dep(p[0], p[1]) - dep(q[0], q[1]));
  const front = TREES.filter(t => !back.includes(t));
  back.forEach(t => { s += tree(t, tg(t)); });
  /* Erdgeschoß */
  const e0 = E(k, .02, .2), eg = floor(0, o, 0, E(k, .12, .42));
  s += `<g opacity="${f1(e0)}">${eg.s}</g>`;
  /* Obergeschoß schwebt von oben ein, gestrichelte Lote zeigen, wo es sitzt */
  const ok = E(k, .4, .7), og = floor(1, o, (1 - ok) * 4, E(k, .56, .78));
  const f1g = FL[1], yo = f1g.y + (1 - ok) * 4 - .22;
  let gd = '';
  [[f1g.x0, -DD / 2], [f1g.x1, -DD / 2], [f1g.x0, DD / 2], [f1g.x1, DD / 2]].forEach(([x, z]) => { gd += line([x, 0, z], [x, yo, z], 'class="wt__guide"'); });
  s += `<g opacity="${f1(E(k, .5, .7))}">${gd}</g><g opacity="${f1(E(k, .4, .58))}">${og.s}</g>`;
  front.forEach(t => { s += tree(t, tg(t)); });
  /* Sonnenbahn, Strahl, Sonne */
  const sk = E(k, .7, .95), R = F.R, sn = season(S.m), arc = [];
  for (let i = 1; i < 64; i++) arc.push(sunAt(sun(lerp(sn.rise, sn.set, i / 64), S.m), R));
  const n = Math.max(2, Math.round(arc.length * sk));
  s += `<polyline class="wt__arc" points="${pts(arc.slice(0, n))}"/>`;
  if (o.up && sk > .98) {
    const sp = sunAt(o, R), q = pr(...sp), sx = clamp(q[0], 20, W - 20), sy = clamp(q[1], 20, H - 70), [cx, cy] = pr(0, 2, 0), right = W - sx > sx;
    s += `<line class="wt__ray" x1="${f1(sx)}" y1="${f1(sy)}" x2="${f1(cx)}" y2="${f1(cy)}"/>`;
    s += `<circle class="wt__ring" cx="${f1(sx)}" cy="${f1(sy)}" r="13"/><circle class="wt__sun" cx="${f1(sx)}" cy="${f1(sy)}" r="6.5"/>`;
    /* Am Telefon steht die Uhrzeit nur unten in den Kennzahlen, sonst liegt der Text auf dem Haus */
    if (!narrow) s += `<text class="wt__sunlab" x="${f1(sx + (right ? 22 : -22))}" y="${f1(sy + 4)}" text-anchor="${right ? 'start' : 'end'}">Sonne ${hhmm(S.t)}</text>`;
  }
  /* Beschriftungen auf der Zeichnung, ohne Kästen */
  const lk = E(k, .6, .82);
  let L = '';
  eg.labs.concat(og.labs).forEach(l => { L += `<text class="wt__lab${l.on ? ' is-sun' : ''}" x="${f1(l.c[0])}" y="${f1(l.c[1] + 3.5)}" text-anchor="middle">${l.t}</text>`; });
  const gp = pr(-3, 0, DD / 2 + .42 * DD + 2.4);
  L += `<text class="wt__ground" x="${f1(gp[0])}" y="${f1(gp[1])}" text-anchor="middle">Garten / Süden</text>`;
  s += `<g opacity="${f1(lk)}">${L}</g>`;
  D.svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  D.svg.innerHTML = s;
  LIT = eg.lit.concat(og.lit);
}

function ui() {
  const o = sun(S.t, S.m), T = WALD_TAG[tab];
  D.btn.forEach((b, i) => b.setAttribute('aria-pressed', String(i === tab)));
  const say = !o.up ? (o.u <= 0 ? 'Die Sonne ist noch nicht aufgegangen.' : 'Die Sonne ist schon untergegangen.') : T.say;
  if (say !== sayNow) { sayNow = say; D.say.textContent = say; }
  D.time.textContent = hhmm(S.t);
  D.when.textContent = `${S.m < .5 ? 'Juni' : 'Dezember'} / Uhrzeit`;
  D.litN.textContent = String(LIT.filter(v => v > .45).length);
  const sn = season(S.m);
  D.day.textContent = (sn.set - sn.rise).toFixed(1).replace('.', ',') + ' h';
  D.dayL.textContent = `Tageslicht im ${S.m < .5 ? 'Juni' : 'Dezember'}`;
}
