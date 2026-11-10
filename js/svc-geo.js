/* Services (Runde 45): Bausteine für das Haus im Schnitt (js/schnitthaus.js) und die Muster (js/muster3d.js).
   prism(): ein ebenes Vieleck (mit Löchern) entlang einer Achse ausgezogen, mit Normalen nach außen und UVs in Metern:
   Stirnflächen (u, v) = die beiden Koordinaten des Vielecks, Seitenflächen u = Achse, v = Höhe (senkrecht) oder Länge entlang der Kante.
   Dazu Oberflächen, im Browser gemalt (fester Zufall, jedes Laden gleich). */
import * as T from 'three';
import { larchCanvas, woodLightCanvas, tileRoofCanvas, gravelCanvas, rng } from './grundriss-tex.js';

/* 2D Koordinaten (p, q) → 3D je Achse: x: (a, q, p) also p = z, q = y; y: (p, a, q) also p = x, q = z; z: (p, q, a) also p = x, q = y */
const to3 = { x: (p, q, a) => [a, q, p], y: (p, q, a) => [p, a, q], z: (p, q, a) => [p, q, a] };
const axisN = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };
const area = pts => { let s = 0; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; };

export function prism(axis, poly, a0, a1, holes = []) {
  const P = [], N = [], U = [], idx = [];
  const map = to3[axis], an = axisN[axis];
  let outer = area(poly) < 0 ? poly.slice().reverse() : poly.slice();
  const hs = holes.map(h => (area(h) > 0 ? h.slice().reverse() : h.slice()));
  /* Stirnflächen */
  const tris = T.ShapeUtils.triangulateShape(outer.map(p => new T.Vector2(p[0], p[1])), hs.map(h => h.map(p => new T.Vector2(p[0], p[1]))));
  const all = outer.concat(...hs);
  const push = (v, n, uv) => { P.push(...v); N.push(...n); U.push(...uv); return P.length / 3 - 1; };
  const face = (ids, n) => {
    /* Wicklung passend zur Normalen */
    const p = i => P.slice(i * 3, i * 3 + 3);
    const [A, B, C] = ids.map(p);
    const cr = [(B[1] - A[1]) * (C[2] - A[2]) - (B[2] - A[2]) * (C[1] - A[1]), (B[2] - A[2]) * (C[0] - A[0]) - (B[0] - A[0]) * (C[2] - A[2]), (B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0])];
    if (cr[0] * n[0] + cr[1] * n[1] + cr[2] * n[2] < 0) idx.push(ids[0], ids[2], ids[1]); else idx.push(...ids);
  };
  [[a0, -1], [a1, 1]].forEach(([a, s]) => {
    const n = an.map(v => v * s), base = P.length / 3;
    all.forEach(p => push(map(p[0], p[1], a), n, [p[0], p[1]]));
    tris.forEach(t => face([base + t[0], base + t[1], base + t[2]], n));
  });
  /* Seitenflächen */
  const sides = ring => ring.forEach((p, i) => {
    const q = ring[(i + 1) % ring.length], dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy);
    if (L < 1e-6) return;
    const n2 = [dy / L, -dx / L], n = map(n2[0], n2[1], 0).map((v, k) => (an[k] ? 0 : v));
    /* v: bei senkrechten Kanten (Achse x, z) die Höhe, sonst die Länge entlang der Kante, durchgehend über benachbarte Teile */
    let vp, vq;
    if (axis !== 'y' && Math.abs(dx) < 1e-6) { vp = p[1]; vq = q[1]; }
    else { const ux = dx / L, uy = dy / L; vp = p[0] * ux + p[1] * uy; vq = q[0] * ux + q[1] * uy; }
    const uvA = axis === 'y' ? (v, a) => [v, a] : (v, a) => [a, v];
    const i0 = push(map(p[0], p[1], a0), n, uvA(vp, a0)), i1 = push(map(q[0], q[1], a0), n, uvA(vq, a0));
    const i2 = push(map(q[0], q[1], a1), n, uvA(vq, a1)), i3 = push(map(p[0], p[1], a1), n, uvA(vp, a1));
    face([i0, i1, i2], n); face([i0, i2, i3], n);
  });
  sides(outer); hs.forEach(sides);
  const g = new T.BufferGeometry();
  g.setAttribute('position', new T.Float32BufferAttribute(P, 3));
  g.setAttribute('normal', new T.Float32BufferAttribute(N, 3));
  g.setAttribute('uv', new T.Float32BufferAttribute(U, 2));
  g.setIndex(idx);
  g.computeBoundingSphere();
  return g;
}
/* Quader von (x0, y0, z0) bis (x1, y1, z1) */
export const cube = (x0, y0, z0, x1, y1, z1) => prism('x', [[z0, y0], [z1, y0], [z1, y1], [z0, y1]], x0, x1);

/* ---------- Oberflächen ---------- */
const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const hsl = (h, s, l, a = 1) => `hsla(${h.toFixed(1)},${s.toFixed(1)}%,${l.toFixed(1)}%,${a})`;
function noise(base, n, col, seed, size = 256, r0 = .6, r1 = 2.2) {
  const c = canvas(size, size), x = c.getContext('2d'), R = rng(seed);
  x.fillStyle = base; x.fillRect(0, 0, size, size);
  for (let i = 0; i < n; i++) { x.fillStyle = col(R); const r = r0 + R() * (r1 - r0); x.fillRect(R() * size, R() * size, r, r * (.5 + R())); }
  return c;
}
/* OSB: große Späne in Lagen */
function osbCanvas() {
  const N = 256, c = canvas(N, N), x = c.getContext('2d'), R = rng(41);
  x.fillStyle = '#c9a774'; x.fillRect(0, 0, N, N);
  for (let i = 0; i < 520; i++) {
    x.save(); x.translate(R() * N, R() * N); x.rotate((R() - .5) * .9);
    x.fillStyle = hsl(32 + R() * 8, 40 + R() * 16, 50 + R() * 22, .85); x.fillRect(-14 - R() * 10, -3 - R() * 3, 28 + R() * 20, 6 + R() * 5);
    x.restore();
  }
  return c;
}
/* Zellulose: graue, faserige Flocken */
const celluloseCanvas = () => noise('#c4bcae', 9000, R => (R() < .5 ? `rgba(120,112,100,${.18 + R() * .2})` : `rgba(240,236,228,${.2 + R() * .2})`), 43, 256, .6, 2.6);
/* Holzfaser: braun, fein */
const fibreCanvas = () => noise('#8e6c4b', 7000, R => (R() < .55 ? `rgba(70,50,32,${.15 + R() * .2})` : `rgba(180,140,100,${.15 + R() * .2})`), 45, 256, .5, 1.8);
/* Beton und Estrich */
const concreteCanvas = (base = '#a8a6a1', seed = 47) => noise(base, 5000, R => (R() < .5 ? `rgba(70,70,68,${R() * .14})` : `rgba(240,240,236,${R() * .16})`), seed, 256, .8, 3);
/* Putz: fein gekörnt, fast weiß */
const plasterCanvas = () => noise('#efece6', 9000, R => (R() < .5 ? `rgba(150,145,135,${R() * .1})` : `rgba(255,255,255,${R() * .3})`), 49, 256, .5, 1.6);
/* Gipsfaser roh: hell, Plattenfugen alle 1,25 m (Kachel 2,5 m) */
function gipsRawCanvas() {
  const c = noise('#dedbd4', 3000, R => `rgba(120,115,105,${R() * .08})`, 51, 256, .6, 2);
  const x = c.getContext('2d'); x.fillStyle = 'rgba(150,140,125,.55)'; x.fillRect(0, 0, 2, 256); x.fillRect(128, 0, 2, 256); x.fillRect(0, 0, 256, 2);
  for (let i = 0; i < 40; i++) { x.fillStyle = 'rgba(140,130,115,.6)'; x.fillRect((i % 2 ? 128 : 0) + 6, 10 + i * 6, 3, 2); }
  return c;
}
/* Eichendielen, längs u, 2 × 2 m */
function oakCanvas(seed = 53, light = 0) {
  const N = 512, c = canvas(N, N), x = c.getContext('2d'), R = rng(seed), px = N / 2, pw = .19 * px;
  for (let py = 0; py < N; py += pw) {
    let xx = -R() * px;
    while (xx < N) {
      const len = (1.4 + R() * 1.4) * px, l = 50 + R() * 7 + light, s = 30 + R() * 10, hu = 30 + R() * 5;
      x.fillStyle = hsl(hu, s, l); x.fillRect(xx, py, len, pw);
      for (let g = 0; g < 8; g++) { x.strokeStyle = hsl(hu - 4, s + 4, l - 16, .06 + R() * .08); x.lineWidth = .6 + R(); x.beginPath(); const gy = py + 1 + R() * (pw - 2); x.moveTo(xx, gy); x.lineTo(xx + len, gy + (R() - .5) * 2); x.stroke(); }
      x.fillStyle = 'rgba(50,32,18,.35)'; x.fillRect(xx, py, 1.2, pw);
      xx += len;
    }
    x.fillStyle = 'rgba(50,32,18,.3)'; x.fillRect(0, py, N, 1);
  }
  return c;
}
/* Massivholzdecke, Lamellen 12 cm, längs u */
function slabWoodCanvas(white) {
  const N = 256, c = canvas(N, N), x = c.getContext('2d'), R = rng(white ? 57 : 55), bw = .12 * N;
  for (let py = 0; py < N; py += bw) {
    const l = white ? 88 + R() * 4 : 66 + R() * 6, s = white ? 10 + R() * 6 : 34 + R() * 10, hu = white ? 38 : 34 + R() * 4;
    x.fillStyle = hsl(hu, s, l); x.fillRect(0, py, N, bw);
    for (let g = 0; g < 7; g++) { x.fillStyle = hsl(hu - 3, s + 6, l - (white ? 8 : 14), .1 + R() * .1); x.fillRect(0, py + 2 + R() * (bw - 4), N, .8 + R()); }
    x.fillStyle = white ? 'rgba(150,135,110,.35)' : 'rgba(90,62,36,.45)'; x.fillRect(0, py, N, 1.4);
  }
  return c;
}
/* Concept Bold (Runde 46): senkrechte Lärchenlatten 4,25 cm, dazwischen 2 cm dunkle Fuge, 16 Latten je Meter (Kachel 1 m) */
function slatsCanvas() {
  const N = 512, c = canvas(N, N), x = c.getContext('2d'), R = rng(71), P = N / 16, sw = P * .68;
  x.fillStyle = '#2a2622'; x.fillRect(0, 0, N, N);
  for (let px = 0; px < N; px += P) {
    const l = 56 + R() * 9, s = 30 + R() * 10, hu = 29 + R() * 6;
    x.fillStyle = hsl(hu, s, l); x.fillRect(px, 0, sw, N);
    for (let g = 0; g < 5; g++) { x.fillStyle = hsl(hu - 3, s + 4, l - 14, .1 + R() * .12); x.fillRect(px + 1 + R() * (sw - 2), 0, .7 + R(), N); }
    x.fillStyle = 'rgba(255,240,215,.16)'; x.fillRect(px, 0, 1.2, N);
    x.fillStyle = 'rgba(30,20,12,.35)'; x.fillRect(px + sw - 1.4, 0, 1.4, N);
  }
  return c;
}
/* Rasen, gedämpft */
const grassCanvas = () => noise('#7d8466', 14000, R => (R() < .5 ? `rgba(60,70,44,${.2 + R() * .3})` : `rgba(160,166,128,${.18 + R() * .25})`), 59, 256, .5, 1.8);
/* Erde im Schnitt */
const earthCanvas = () => noise('#5a4a3c', 6000, R => (R() < .5 ? `rgba(40,30,22,${.2 + R() * .3})` : `rgba(140,120,96,${.15 + R() * .2})`), 61, 256, .8, 3);

const TEX = new Map();
function tex(name, make, size) {
  if (!TEX.has(name)) {
    const t = new T.CanvasTexture(make()); t.colorSpace = T.SRGBColorSpace; t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = 8;
    t.repeat.set(1 / size, 1 / size); TEX.set(name, t);
  }
  return TEX.get(name);
}
const std = (o) => new T.MeshStandardMaterial({ roughness: .9, metalness: 0, ...o });
/* Neue Materialien je Aufruf (jedes Teil dimmt für sich), Bilder werden geteilt */
export const MAT = {
  larch: () => std({ map: tex('larch', larchCanvas, 1), roughness: .82 }),
  slats: () => std({ map: tex('slats', slatsCanvas, 1), roughness: .8 }),
  frame: () => std({ color: 0x2e2e2c, roughness: .72 }),
  putz: () => std({ map: tex('putz', plasterCanvas, 1.2), roughness: .95 }),
  gap: () => std({ color: 0x24211e, roughness: 1 }),
  membrane: () => std({ color: 0x33363a, roughness: .7 }),
  fibre: () => std({ map: tex('fibre', fibreCanvas, .8), roughness: 1 }),
  cellulose: () => std({ map: tex('cell', celluloseCanvas, .6), roughness: 1 }),
  osb: () => std({ map: tex('osb', osbCanvas, 1.2), roughness: .85 }),
  install: () => std({ color: 0xd6c3a0, roughness: .95 }),
  gipsRaw: () => std({ map: tex('gips', gipsRawCanvas, 2.5), roughness: .95 }),
  paint: () => std({ color: 0xf5f3ef, roughness: .95 }),
  concrete: () => std({ map: tex('concrete', concreteCanvas, 1.5), roughness: .95 }),
  screed: () => std({ map: tex('screed', () => concreteCanvas('#bdbab3', 63), 1.5), roughness: .9 }),
  insul: () => std({ color: 0xe8e4d6, roughness: 1 }),
  fill: () => std({ map: tex('fill', () => noise('#9b9488', 9000, R => `rgba(${R() < .5 ? '60,56,50' : '220,214,204'},${.2 + R() * .3})`, 65, 256, .8, 2.6), .6), roughness: 1 }),
  step: () => std({ color: 0xcfc5b4, roughness: 1 }),
  oak: () => std({ map: tex('oak', oakCanvas, 2), roughness: .6 }),
  slab: () => std({ map: tex('slab', () => slabWoodCanvas(false), 1), roughness: .7 }),
  slabWhite: () => std({ map: tex('slabW', () => slabWoodCanvas(true), 1), roughness: .7 }),
  board: () => std({ map: tex('board', woodLightCanvas, 1), roughness: .75 }),
  spruce: () => std({ color: 0xe0c99f, roughness: .8 }),
  tiles: () => std({ map: tex('tiles', tileRoofCanvas, 2), roughness: .8, metalness: .05 }),
  alu: () => std({ color: 0x3c3c3b, roughness: .45, metalness: .35 }),
  steel: () => std({ color: 0xc5c6c4, roughness: .3, metalness: .85 }),
  frameNatur: () => std({ color: 0xc19a6b, roughness: .55 }),
  glass: () => new T.MeshStandardMaterial({ color: 0xb7c8cf, roughness: .05, metalness: .1, transparent: true, opacity: .2, depthWrite: false }),
  grass: () => std({ map: tex('grass', grassCanvas, 1.5), roughness: 1 }),
  gravel: () => std({ map: tex('gravel', gravelCanvas, 1), roughness: 1 }),
  earth: () => std({ map: tex('earth', earthCanvas, 1.5), roughness: 1 }),
  pipe: () => std({ color: 0xd2662c, roughness: .5 }),
  white: () => std({ color: 0xf7f6f3, roughness: .5 }),
  dark: () => std({ color: 0x2b2b2a, roughness: .6 })
};
/* Innenseite der Fenster (Leistungsumfang: Natur lasiert, Weiß lasiert oder Schwarz) */
export const FRAME_COL = { natur: 0xc19a6b, weiss: 0xf1eee8, schwarz: 0x232322 };

/* Neun Schichten der GRIFFNER Wand von außen nach innen, gesamt 42,25 cm (Quelle: neunschichtig, Holzwerkstoffplatten in der Mehrzahl). Schichtfolge und Dicken im Modell schematisch
   (Quelle nennt: dreischalig, hinterlüftet, 42,25 cm, Holz, Holzwerkstoffplatten, Holzfaser, Zellulose, Gipsfaserplatte,
   eigene Installationsebene, Fassadenbahn). Namen ohne Maße in der Oberfläche. */
export const WALL = [
  { k: 'fassade', d: .03, m: 'larch', name: 'Fassade, Lärche oder Putz' },
  { k: 'luft', d: .03, m: 'gap', name: 'Hinterlüftung' },
  { k: 'bahn', d: .005, m: 'membrane', name: 'Fassadenbahn' },
  { k: 'holzfaser', d: .06, m: 'fibre', name: 'Holzfaser' },
  { k: 'zellulose', d: .22, m: 'cellulose', name: 'Holz und Zellulose' },
  { k: 'osb', d: .015, m: 'osb', name: 'Holzwerkstoffplatte' },
  { k: 'install', d: .035, m: 'install', name: 'Installationsebene' },
  { k: 'osb2', d: .015, m: 'osb', name: 'Holzwerkstoffplatte' },
  { k: 'gips', d: .0125, m: 'gipsRaw', name: 'Gipsfaserplatte' }
];
/* Dach von innen nach außen (Quelle: Sparren-Pfettendach bis zum First offen, Holzfaser und Zellulose, Betondachstein) */
export const ROOF = [
  { k: 'schalung', d: .024, m: 'board', name: 'Holz innen, sichtbar' },
  { k: 'zellulose', d: .24, m: 'cellulose', name: 'Sparren mit Holzfaser und Zellulose' },
  { k: 'holzfaser', d: .06, m: 'fibre', name: 'Holzfaser' },
  { k: 'luft', d: .05, m: 'gap', name: 'Hinterlüftung' },
  { k: 'lattung', d: .03, m: 'spruce', name: 'Lattung' },
  { k: 'ziegel', d: .026, m: 'tiles', name: 'Betondachstein' }
];
/* Flachdach von innen nach außen (Quelle: Flachdach in Massivholz, Wärmedämmung beim Flachdach, Attikaverblechung). Nur im Haus, ohne Beschriftung */
export const ROOF_FLAT = [
  { k: 'massiv', d: .2, m: 'slab', name: 'Massivholz, sichtbar' },
  { k: 'daemmung', d: .28, m: 'fibre', name: 'Wärmedämmung' },
  { k: 'abdichtung', d: .012, m: 'membrane', name: 'Abdichtung' }
];
/* Fußboden von unten nach oben, 21,5 cm in fünf Ebenen (Quelle) */
export const FLOOR = [
  { k: 'schuettung', d: .07, m: 'fill', name: 'Schüttung mit Haustechnik' },
  { k: 'waerme', d: .04, m: 'insul', name: 'Wärmedämmung' },
  { k: 'tritt', d: .03, m: 'insul', name: 'Trittschalldämmung' },
  { k: 'estrich', d: .06, m: 'screed', name: 'Massiv-Estrich mit Heizung' },
  { k: 'parkett', d: .015, m: 'oak', name: 'Eichenparkett' }
];
