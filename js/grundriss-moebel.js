/* Runde 35: Möbel und Ausstattung für den realistischen Grundriss (js/grundriss.js). Jede Art baut ein Modell in Metern,
   Breite entlang x, Tiefe entlang z, die Vorderseite zeigt nach +z, der Boden liegt bei y = 0. js/grundriss.js dreht es
   in die Richtung aus den Daten und stellt es an seinen Platz. Weiche Kanten mit RoundedBoxGeometry, keine Linien. */
import * as T from 'three';
import { RoundedBoxGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/geometries/RoundedBoxGeometry.js';

const std = (color, o = {}) => new T.MeshStandardMaterial({ color, roughness: .85, metalness: 0, ...o });
export const M = {
  wall: std(0xF2F0EB, { roughness: .95 }),
  /* Wandkrone schwarz wie auf einem Verkaufsplan; Rand des Sockels hell, damit das Haus auf Schwarz seine Kante hat */
  cap: std(0x141413, { roughness: .9 }),
  edge: std(0xD9D5CD, { roughness: .95 }),
  door: std(0x86613f, { roughness: .5 }),
  base: std(0xE2DFD8, { roughness: 1 }),
  oak: std(0xB88C5F, { roughness: .62 }),
  oakL: std(0xCBA77D, { roughness: .6 }),
  spruce: std(0xE3C99C, { roughness: .75 }),
  teak: std(0x8E6A48, { roughness: .7 }),
  white: std(0xF5F4F1, { roughness: .45 }),
  ceramic: std(0xFBFBFA, { roughness: .12 }),
  inner: std(0xE4E9EB, { roughness: .1 }),
  stoneTop: std(0xEDECE8, { roughness: .25 }),
  black: std(0x1d1d1c, { roughness: .5 }),
  blackGlass: std(0x0f0f10, { roughness: .08, metalness: .2 }),
  anthrazit: std(0x444442, { roughness: .55, metalness: .1 }),
  steel: std(0xbfc0bf, { roughness: .28, metalness: .85 }),
  mirror: std(0xdfe5e8, { roughness: .03, metalness: 1 }),
  linen: std(0xF1EEE8, { roughness: .95 }),
  sheet: std(0xFAF9F6, { roughness: .9 }),
  kalk: std(0xCFCCC6, { roughness: 1 }),
  sand: std(0xCFC3B3, { roughness: 1 }),
  salbei: std(0x8B907C, { roughness: 1 }),
  kupfer: std(0x887254, { roughness: .9 }),
  dark: std(0x5b5955, { roughness: 1 }),
  outdoor: std(0xDAD6CE, { roughness: 1 }),
  leaf: std(0x56703c, { roughness: .8, flatShading: true }),
  leaf2: std(0x6f8a4c, { roughness: .8, flatShading: true }),
  pot: std(0x3d3c3a, { roughness: .7 }),
  soil: std(0x3a2e24, { roughness: 1 }),
  stones: std(0x77746f, { roughness: .9, flatShading: true }),
  glass: new T.MeshStandardMaterial({ color: 0xa9bcc4, roughness: .04, metalness: .1, transparent: true, opacity: .26, depthWrite: false }),
  glow: new T.MeshStandardMaterial({ color: 0xfff3dc, emissive: 0xffe2b0, emissiveIntensity: .9, roughness: 1 }),
  tyre: std(0x161616, { roughness: .9 }),
  rim: std(0xb9b9b6, { roughness: .35, metalness: .7 }),
  carGlass: std(0x1b1f22, { roughness: .08, metalness: .5 })
};
/* Stoffe etwas dunkler als die Markenfarben, sonst verschwinden Sofa und Betten im hellen Licht */
const FAB = { kalk: std(0xA8A39A, { roughness: 1 }), sand: std(0xBBA98F, { roughness: 1 }), salbei: std(0x7F8670, { roughness: 1 }), dark: M.dark, kupfer: M.kupfer };

const UBOX = new T.BoxGeometry(1, 1, 1).translate(0, .5, 0);
const UCYL = new T.CylinderGeometry(.5, .5, 1, 28).translate(0, .5, 0);
const RB = new Map();
const rbox = (w, h, d, r) => {
  const key = [w, h, d, r].map(v => Math.round(v * 200)).join(',');
  if (!RB.has(key)) RB.set(key, new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2 - .001, h / 2 - .001, d / 2 - .001)).translate(0, h / 2, 0));
  return RB.get(key);
};
const add = (g, m, x, y, z, cast = true) => { m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; g.add(m); return m; };
/* Quader: Breite, Höhe, Tiefe, Material, Mitte unten bei x, y, z */
export const B = (g, w, h, d, mat, x = 0, y = 0, z = 0) => { const m = new T.Mesh(UBOX, mat); m.scale.set(w, h, d); return add(g, m, x, y, z); };
const R = (g, w, h, d, r, mat, x = 0, y = 0, z = 0) => add(g, new T.Mesh(rbox(w, h, d, r), mat), x, y, z);
const C = (g, r, h, mat, x = 0, y = 0, z = 0) => { const m = new T.Mesh(UCYL, mat); m.scale.set(r * 2, h, r * 2); return add(g, m, x, y, z); };
const legs4 = (g, w, d, h, s, mat, inset = .06) => [-1, 1].forEach(a => [-1, 1].forEach(b => B(g, s, h, s, mat, a * (w / 2 - inset), 0, b * (d / 2 - inset))));

/* ---------- Wohnen ---------- */
function sofa(w, d, o) {
  const g = new T.Group(), fab = FAB[o.c] || M.kalk, out = o.out;
  const arms = o.arms || 'b', al = arms === 'b' || arms === 'l', ar = arms === 'b' || arms === 'r', aw = .17;
  B(g, w - .06, .07, d - .08, M.black, 0, 0, 0);
  R(g, w, .22, d, .03, out ? M.outdoor : fab, 0, .07, 0);
  R(g, w, .5, .2, .05, out ? M.outdoor : fab, 0, .26, -d / 2 + .1);
  if (al) R(g, aw, .36, d, .06, fab, -w / 2 + aw / 2, .26, 0);
  if (ar) R(g, aw, .36, d, .06, fab, w / 2 - aw / 2, .26, 0);
  const x0 = -w / 2 + (al ? aw : 0), x1 = w / 2 - (ar ? aw : 0), n = Math.max(1, Math.round((x1 - x0) / .72)), cw = (x1 - x0) / n;
  for (let i = 0; i < n; i++) {
    const cx = x0 + cw * (i + .5);
    R(g, cw - .02, .14, d - .24, .05, fab, cx, .29, .1);
    const bk = R(g, cw - .04, .4, .16, .07, fab, cx, .34, -d / 2 + .27); bk.rotation.x = -.14;
  }
  if (!out && n > 1) { const p = R(g, .42, .4, .13, .07, o.c === 'sand' ? M.kalk : M.sand, x0 + .32, .4, -d / 2 + .4); p.rotation.set(-.25, .3, 0); }
  return g;
}
function coffee(w, d) {
  const g = new T.Group();
  B(g, w - .12, .3, d - .12, M.oak, 0, 0, 0); B(g, w, .05, d, M.oakL, 0, .3, 0);
  C(g, .06, .2, M.white, -w * .15, .35, -d * .2);
  B(g, .2, .04, .28, M.kupfer, w * .12, .35, d * .18); B(g, .18, .03, .25, M.sheet, w * .12, .39, d * .18);
  return g;
}
function lowboard(w, d, o) {
  const g = new T.Group(), h = o.h || .45;
  B(g, w - .04, .08, d - .06, M.black, 0, 0, 0); B(g, w, h - .08, d, M.oak, 0, .08, 0);
  for (let i = 1; i < 4; i++) B(g, .006, h - .14, .004, M.dark, -w / 2 + w * i / 4, .1, d / 2);
  if (h < .6) {
    const tw = Math.min(w - .3, 1.65);
    B(g, tw, .93, .04, M.blackGlass, 0, 1.05, -d / 2 + .02);
    C(g, .07, .26, M.white, w * .38, h, 0); B(g, .3, .05, .22, M.kupfer, -w * .3, h, 0);
  }
  return g;
}
function table(w, d, o) {
  const g = new T.Group(), out = o.out, top = out ? M.teak : M.oakL;
  B(g, w, .045, d, top, 0, .71, 0); legs4(g, w, d, .71, .055, out ? M.anthrazit : M.oak, .1);
  if (!out) { C(g, .11, .14, M.white, 0, .755, 0); plantTop(g, 0, .87, 0, .16); }
  return g;
}
function chair(w, d, o) {
  const g = new T.Group(), out = o.out, lounge = o.lounge;
  if (lounge) {
    B(g, w - .06, .06, d - .06, M.teak, 0, .02, 0);
    R(g, w, .16, d, .04, M.outdoor, 0, .1, 0);
    const bk = R(g, w, .5, .14, .06, M.outdoor, 0, .2, -d / 2 + .1); bk.rotation.x = -.2;
    R(g, .1, .32, d, .04, M.teak, -w / 2 + .05, .1, 0); R(g, .1, .32, d, .04, M.teak, w / 2 - .05, .1, 0);
    return g;
  }
  const fr = out ? M.anthrazit : M.oak;
  legs4(g, w * .86, d * .82, .44, .03, fr, .03);
  R(g, w * .9, .05, d * .84, .015, fr, 0, .43, .02);
  R(g, w * .82, .04, d * .7, .02, out ? M.outdoor : M.sand, 0, .48, .03);
  B(g, w * .86, .38, .03, fr, 0, .48, -d * .42);
  return g;
}
function stool(w) {
  const g = new T.Group(), r = w / 2 * .82;
  C(g, r * .9, .02, M.black, 0, 0, 0); C(g, .025, .62, M.black, 0, .02, 0);
  R(g, r * 2, .06, r * 2, r * .9, M.oak, 0, .62, 0);
  return g;
}
function pendant(top) {
  const g = new T.Group(), y = 1.62;
  B(g, .008, top - y - .2, .008, M.black, 0, y + .2, 0);
  const s = new T.Mesh(new T.CylinderGeometry(.06, .17, .2, 28, 1, true), M.black); s.material.side = T.DoubleSide; add(g, s, 0, y + .1, 0, false);
  C(g, .15, .01, M.glow, 0, y + .01, 0).castShadow = false;
  return g;
}
export function plantTop(g, x, y, z, s = .25) {
  for (let i = 0; i < 4; i++) { const m = new T.Mesh(new T.IcosahedronGeometry(s * (.55 + Math.random() * .3), 0), i % 2 ? M.leaf2 : M.leaf); add(g, m, x + (Math.random() - .5) * s, y + Math.random() * s * .5, z + (Math.random() - .5) * s); m.rotation.set(Math.random() * 3, Math.random() * 3, 0); }
}
function plant(w, d, o) {
  const g = new T.Group(), r = Math.min(w, d) / 2, big = o.big;
  const pot = new T.Mesh(new T.CylinderGeometry(r * .82, r * .62, big ? .5 : .38, 24).translate(0, big ? .25 : .19, 0), M.pot); add(g, pot, 0, 0, 0);
  C(g, r * .76, .02, M.soil, 0, big ? .48 : .36, 0);
  const h0 = big ? .5 : .38;
  if (big) { C(g, .025, .9, M.teak, 0, h0, 0); }
  const n = big ? 9 : 5, top = big ? 1.25 : .55, sp = big ? .34 : .22;
  for (let i = 0; i < n; i++) {
    const m = new T.Mesh(new T.IcosahedronGeometry((big ? .2 : .13) * (.7 + Math.random() * .5), 1), i % 3 ? M.leaf : M.leaf2);
    const a = Math.random() * Math.PI * 2, rr = Math.random() * sp;
    add(g, m, Math.cos(a) * rr, h0 + top * (.45 + Math.random() * .55), Math.sin(a) * rr);
    m.rotation.set(Math.random() * 3, Math.random() * 3, 0); m.scale.y = .8 + Math.random() * .4;
  }
  return g;
}

/* ---------- Kochen ---------- */
function island(w, d, o, P) {
  const g = new T.Group();
  const ov = .28, seat = o.seat === 'n' ? -1 : 1;
  B(g, w - .04, .1, d - .1, M.black, 0, 0, 0);
  B(g, w, .76, d, M.white, 0, .1, 0);
  for (let i = 1; i < 5; i++) B(g, .005, .7, .004, M.kalk, -w / 2 + w * i / 5, .13, -seat * d / 2);
  B(g, w + .02, .04, d + ov, M.stoneTop, 0, .86, seat * ov / 2);
  if (o.cook) { const [x, y, cw, cd] = o.cook; const p = P(x + cw / 2, y + cd / 2); B(g, cw / P.K, .006, cd / P.K, M.blackGlass, p[0], .9, p[1]); }
  if (o.sink) {
    const [x, y, sw, sd] = o.sink; const p = P(x + sw / 2, y + sd / 2);
    B(g, sw / P.K, .006, sd / P.K, M.steel, p[0], .9, p[1]); B(g, sw / P.K - .06, .007, sd / P.K - .06, M.dark, p[0], .9, p[1]);
    C(g, .015, .3, M.steel, p[0], .9, p[1] + sd / P.K / 2 + .04); B(g, .02, .02, .18, M.steel, p[0], 1.18, p[1] + sd / P.K / 2 - .04);
  }
  return g;
}
function tall(w, d, o) {
  const g = new T.Group(), h = 2.05;
  B(g, w - .02, .08, d - .04, M.black, 0, 0, 0); B(g, w, h - .08, d, M.white, 0, .08, 0);
  const n = Math.max(1, Math.round(w / .6));
  for (let i = 1; i < n; i++) B(g, .005, h - .12, .004, M.kalk, -w / 2 + w * i / n, .1, d / 2);
  B(g, w, .004, .004, M.kalk, 0, 1.2, d / 2);
  if (o.oven) { const ow = w / n; B(g, ow - .06, .58, .01, M.blackGlass, -w / 2 + ow * 1.5, .9, d / 2); B(g, ow - .06, .45, .01, M.blackGlass, -w / 2 + ow * 1.5, 1.52, d / 2); }
  return g;
}
const JARS = [0xd9cbb5, 0xb5a088, 0x8b907c, 0xe8e4dc, 0x9a8f80, 0x6e6a64];
function shelf(w, d, o) {
  const g = new T.Group(), h = o.towels ? 1.9 : 2.0, n = 5;
  B(g, w, h, .02, M.oakL, 0, 0, -d / 2 + .01);
  B(g, .025, h, d, M.oakL, -w / 2 + .012, 0, 0); B(g, .025, h, d, M.oakL, w / 2 - .012, 0, 0);
  for (let i = 0; i < n; i++) {
    const y = .08 + i * (h - .1) / (n - 1); B(g, w, .025, d, M.oakL, 0, y, 0);
    if (i === n - 1) break;
    let x = -w / 2 + .06;
    while (x < w / 2 - .12) {
      const iw = o.towels ? .28 : .07 + Math.random() * .14, ih = o.towels ? .16 : .1 + Math.random() * .18;
      if (Math.random() < .8) B(g, iw, ih, Math.min(d - .08, o.towels ? .3 : .12 + Math.random() * .1), o.towels ? (Math.random() < .5 ? M.linen : M.sand) : std(JARS[(Math.random() * JARS.length) | 0], { roughness: .7 }), x + iw / 2, y + .025, 0);
      x += iw + .03;
    }
  }
  return g;
}
function counter(w, d, o) {
  const g = new T.Group();
  B(g, w - .02, .1, d - .05, M.black, 0, 0, 0); B(g, w, .76, d, M.white, 0, .1, 0); B(g, w, .04, d + .01, M.stoneTop, 0, .86, 0);
  for (let i = 1; i < 3; i++) B(g, .005, .7, .004, M.kalk, -w / 2 + w * i / 3, .13, d / 2);
  if (o.sink) { B(g, .45, .006, .36, M.steel, w * .2, .9, 0); C(g, .015, .28, M.steel, w * .2, .9, -d / 2 + .06); }
  return g;
}

/* ---------- Arbeiten, Schlafen, Schränke ---------- */
function desk(w, d) {
  const g = new T.Group();
  B(g, w, .03, d, M.oakL, 0, .72, 0);
  [-1, 1].forEach(a => B(g, .03, .72, d - .06, M.black, a * (w / 2 - .05), 0, 0));
  B(g, .34, .012, .24, M.steel, -w * .12, .75, .04);
  const sc = B(g, .34, .23, .008, M.blackGlass, -w * .12, .76, -.08); sc.rotation.x = -.22;
  C(g, .06, .02, M.black, w * .33, .75, -.12); B(g, .012, .4, .012, M.black, w * .33, .77, -.12); B(g, .12, .05, .12, M.black, w * .33, 1.16, -.07);
  return g;
}
function ochair(w, d, o) {
  if (o.out) return chair(w, d, o);
  const g = new T.Group();
  for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2, s = B(g, .3, .025, .04, M.black, Math.cos(a) * .13, .03, Math.sin(a) * .13); s.rotation.y = -a; }
  C(g, .025, .38, M.steel, 0, .05, 0);
  R(g, .48, .08, .46, .04, M.dark, 0, .43, .02);
  const bk = R(g, .44, .48, .06, .03, M.dark, 0, .55, -.22); bk.rotation.x = -.1;
  return g;
}
function wardrobe(w, d) {
  const g = new T.Group(), h = 2.05;
  B(g, w - .02, .06, d - .03, M.black, 0, 0, 0); B(g, w, h - .06, d, M.white, 0, .06, 0);
  const n = Math.max(1, Math.round(w / .55));
  for (let i = 1; i < n; i++) B(g, .005, h - .1, .004, M.kalk, -w / 2 + w * i / n, .08, d / 2);
  return g;
}
function bed(w, d, o) {
  const g = new T.Group(), fab = FAB[o.c] || M.sand, single = o.single;
  R(g, w, .3, d, .04, fab, 0, .04, 0);
  R(g, w + .12, single ? .7 : .95, .08, .03, fab, 0, .04, -d / 2 - .03);
  R(g, w - .08, .2, d - .1, .06, M.sheet, 0, .3, .02);
  R(g, w + .02, .08, d * .66, .04, M.linen, 0, .46, d * .17);
  R(g, w + .04, .03, .38, .015, single ? M.kalk : M.dark, 0, .54, d / 2 - .3);
  const pw = single ? w * .62 : w / 2 - .08;
  (single ? [0] : [-1, 1]).forEach(s => { const p = R(g, pw, .13, .4, .06, M.sheet, s * (w / 4), .5, -d / 2 + .28); p.rotation.x = -.12; });
  return g;
}
function night(w, d) {
  const g = new T.Group();
  B(g, w, .5, d, M.oak, 0, 0, 0);
  C(g, .06, .02, M.black, 0, .5, 0); C(g, .012, .28, M.black, 0, .52, 0);
  const s = new T.Mesh(new T.CylinderGeometry(.1, .13, .18, 24).translate(0, .09, 0), M.linen); add(g, s, 0, .78, 0, false);
  return g;
}

/* ---------- Bäder, Waschen, Sauna, Technik ---------- */
function toilet(w, d) {
  const g = new T.Group();
  R(g, .37, .3, .55, .13, M.ceramic, 0, .12, -d / 2 + .3);
  B(g, .37, .02, .5, M.ceramic, 0, .42, -d / 2 + .3);
  B(g, .22, .15, .012, M.white, 0, 1.0, -d / 2 + .005);
  return g;
}
function basin(w, d, o) {
  const g = new T.Group();
  R(g, w, .14, d, .04, M.ceramic, 0, .72, 0); R(g, w - .1, .02, d - .1, .03, M.inner, 0, .845, .02);
  C(g, .012, .16, M.steel, 0, .86, -d / 2 + .05);
  B(g, Math.max(.4, w - .04), .6, .012, M.mirror, 0, 1.12, -d / 2 + .006);
  return g;
}
function vanity(w, d, o) {
  const g = new T.Group(), n = o.n || 1;
  B(g, w, .45, d - .02, M.oak, 0, .35, 0); B(g, w + .02, .04, d, M.stoneTop, 0, .8, 0);
  for (let i = 0; i < n; i++) {
    const x = -w / 2 + w * (i + .5) / n;
    R(g, .46, .14, .36, .07, M.ceramic, x, .84, .02); R(g, .38, .01, .28, .06, M.inner, x, .975, .02);
    C(g, .013, .2, M.steel, x, .84, -d / 2 + .06); B(g, .02, .02, .1, M.steel, x, 1.02, -d / 2 + .1);
  }
  if (o.mirror) B(g, w - .1, .75, .012, M.mirror, 0, 1.12, -d / 2 + .006);
  return g;
}
function tub(w, d, o) {
  const g = new T.Group(), free = o.free, h = .56;
  if (free) {
    R(g, w, h, d, Math.min(w, d) * .38, M.ceramic, 0, 0, 0);
    R(g, w - .12, .02, d - .12, Math.min(w, d) * .32, M.inner, 0, h - .03, 0);
    C(g, .015, .95, M.steel, w / 2 + .1, 0, 0); B(g, .2, .025, .025, M.steel, w / 2, .93, 0);
  } else {
    B(g, w, h, d, M.ceramic, 0, 0, 0);
    R(g, w - .14, .02, d - .14, .14, M.inner, 0, h - .015, 0);
    C(g, .015, .12, M.steel, w / 2 - .12, h, 0);
  }
  return g;
}
function shower(w, d) {
  const g = new T.Group();
  B(g, Math.min(w, d) * .9, .008, Math.min(w, d) * .9, M.anthrazit, 0, 0, 0);
  C(g, .03, .004, M.steel, 0, .009, 0);
  return g;
}
function glass(w, d) {
  const g = new T.Group(), m = B(g, w, 2.0, d, M.glass, 0, 0, 0); m.castShadow = false;
  B(g, Math.max(w, .02), .02, Math.max(d, .02), M.steel, 0, 2.0, 0);
  return g;
}
function cab(w, d) { const g = new T.Group(); B(g, w, .55, d, M.white, 0, .25, 0); return g; }
function washer(w, d) {
  const g = new T.Group();
  B(g, w, .85, d, M.white, 0, 0, 0);
  const door = new T.Mesh(new T.CylinderGeometry(.17, .17, .02, 32).rotateX(Math.PI / 2), M.blackGlass); add(g, door, 0, .45, d / 2 + .005, false);
  const ring = new T.Mesh(new T.TorusGeometry(.18, .02, 10, 32), M.steel); add(g, ring, 0, .45, d / 2 + .012, false);
  B(g, w * .8, .06, .01, M.kalk, 0, .74, d / 2);
  return g;
}
function tech(w, d) {
  const g = new T.Group(), n = Math.max(1, Math.round(w / .7));
  for (let i = 0; i < n; i++) {
    const x = -w / 2 + w * (i + .5) / n;
    B(g, w / n - .06, 1.85, d - .05, M.white, x, 0, 0);
    B(g, w / n - .2, .2, .01, M.kalk, x, 1.4, d / 2);
    C(g, .025, .12, M.steel, x - .1, 1.85, 0); C(g, .025, .12, M.steel, x + .1, 1.85, 0);
  }
  return g;
}
function bench(w, d) {
  const g = new T.Group(), lo = d * .45;
  /* untere Bank vorne, obere hinten, Lehnenbretter an der Wand */
  for (let i = 0; i < 4; i++) B(g, w, .035, lo / 4 - .015, M.spruce, 0, .44, d / 2 - lo + (i + .5) * lo / 4);
  for (let i = 0; i < 5; i++) B(g, w, .035, (d - lo) / 5 - .015, M.spruce, 0, .88, -d / 2 + (i + .5) * (d - lo) / 5);
  B(g, w, .44, .03, M.spruce, 0, 0, d / 2 - lo); B(g, w, .88, .03, M.spruce, 0, 0, -d / 2 + .02);
  for (let i = 0; i < 3; i++) B(g, w, .07, .02, M.spruce, 0, 1.05 + i * .14, -d / 2 + .01);
  return g;
}
function stove(w, d) {
  const g = new T.Group();
  B(g, w * .85, .62, d * .85, M.black, 0, 0, 0);
  for (let i = 0; i < 10; i++) { const s = new T.Mesh(new T.DodecahedronGeometry(.05 + Math.random() * .03, 0), M.stones); add(g, s, (Math.random() - .5) * w * .6, .64 + Math.random() * .08, (Math.random() - .5) * d * .6); }
  return g;
}
function rail(w, d) {
  const g = new T.Group(), m = B(g, w, 1.0, d, M.glass, 0, 0, 0); m.castShadow = false;
  B(g, Math.max(w, .04), .04, Math.max(d, .04), M.anthrazit, 0, 1.0, 0);
  return g;
}
function osofa(w, d, o) { return sofa(w, d, { ...o, out: 1, arms: 'b', c: 'kalk' }); }
function otable(w, d, o) {
  const g = new T.Group(), h = o.h || .4;
  if (o.round) { C(g, Math.min(w, d) / 2, .04, M.teak, 0, h - .04, 0); C(g, .04, h - .04, M.anthrazit, 0, 0, 0); C(g, .18, .02, M.anthrazit, 0, 0, 0); }
  else { B(g, w, .04, d, M.teak, 0, h - .04, 0); legs4(g, w, d, h - .04, .05, M.teak, .06); }
  C(g, .07, .14, M.white, 0, h, 0);
  return g;
}

/* Ein Auto als einfaches Modell: Karosserie im Profil, Glas, Dach, vier Räder. Länge entlang z, Schnauze nach +z. */
export function car(L, W, paint) {
  const g = new T.Group(), inner = new T.Group(); inner.rotation.y = -Math.PI / 2; g.add(inner);
  const body = new T.MeshPhysicalMaterial({ color: paint, roughness: .3, metalness: .45, clearcoat: 1, clearcoatRoughness: .08 });
  const s = L / 4.7, P = (pts, w, m) => {
    const sh = new T.Shape(pts.map(([u, v]) => new T.Vector2(u * s - L / 2, v)));
    const geo = new T.ExtrudeGeometry(sh, { depth: w, bevelEnabled: true, bevelThickness: .04, bevelSize: .04, bevelSegments: 3 }); geo.translate(0, 0, -w / 2);
    const o = new T.Mesh(geo, m); o.castShadow = true; o.receiveShadow = true; inner.add(o); return o;
  };
  P([[.04, .3], [0, .5], [.05, .86], [.32, .96], [3.3, .99], [4.42, .87], [4.66, .68], [4.7, .44], [4.6, .3]], W - .08, body);
  P([[.26, .93], [.6, 1.4], [2.95, 1.43], [3.52, .96]], W - .22, M.carGlass);
  P([[.5, 1.36], [.66, 1.47], [2.88, 1.48], [3.02, 1.37]], W - .18, body);
  const wg = new T.CylinderGeometry(.34, .34, .24, 28).rotateX(Math.PI / 2), hg = new T.CylinderGeometry(.21, .21, .25, 20).rotateX(Math.PI / 2);
  [.86, 3.75].forEach(u => [-1, 1].forEach(sd => {
    const t = new T.Mesh(wg, M.tyre), r = new T.Mesh(hg, M.rim), x = u * s - L / 2, z = sd * (W / 2 - .12);
    t.position.set(x, .34, z); r.position.set(x, .34, z + sd * .005); t.castShadow = true; inner.add(t, r);
  }));
  return g;
}

export const BUILD = { sofa, coffee, lowboard, table, chair, stool, plant, island, tall, shelf, counter, desk, ochair, wardrobe, bed, night, toilet, basin, vanity, tub, shower, glass, cab, washer, tech, bench, stove, rail, osofa, otable };
export { pendant };
