/* 01 KENNENLERNEN in 3D. Aus dem Raumprogramm wird ein Arbeitsmodell, das sich Element für Element aufbaut:
   Bodenplatte, Wandelemente am Kran, Decke, Obergeschoß, Dach. Ändern sich die Antworten, werden Räume ausgehoben,
   neue eingehoben, alle anderen rücken nach. "Räume" stellt das Obergeschoß mit dem Kran neben das Erdgeschoß,
   damit beide Ebenen offen lesbar sind. "Haus" stapelt es zurück und setzt das Dach auf.
   Jede Antwort zeigt sich im Modell: neue und veränderte Räume leuchten kurz auf, eine Zeile sagt, was sich geändert hat,
   und die Wünsche bekommen Gestalt (Tisch für zehn, Luftraum, Bücherwand, Terrasse mit Bäumen, Morgenlicht von Osten). */
import { $, $$, h, ease, clamp, lerp, seg, reduce, loop, through } from './core.js';

const UP = new Set(['Schlafen', 'Ankleide', 'Kinderzimmer', 'Zweites Bad', 'Zimmer', 'Bad', 'Gästezimmer', 'Leseplatz']);
const NOWIN = new Set(['WC', 'Technik und Hauswirtschaft', 'Ankleide', 'Eingang und Garderobe']);
const HW = 2.75, SLAB = .3, DECK = .3, ROOF = .34, TW = .12, IN = .07, SIDE = 2.8, DROP = 30, ARC = 6;
const TALL = 2 * HW + DECK;
const WALL = 0xF4F1EB, HOT = 0xCFC3B3;
/* Kurze Namen fürs Modell, die Liste darunter behält die langen */
const SHORT = { 'Wohnen, Essen, Kochen': 'Wohnen', 'Eingang und Garderobe': 'Eingang', 'Technik und Hauswirtschaft': 'Technik', 'Eigener Bereich mit Bad': 'Eigener Bereich', 'Zweites Bad': 'Bad 2', 'Kinderzimmer': 'Kinder' };
/* Was die Wünsche im Modell auslösen, für die Änderungszeile */
const FEAT = {
  garten: ['Terrasse und Bäume', 'Terrasse'], weite: ['Luftraum über dem Wohnen', 'Luftraum'], buecher: ['Bücherwand', 'Bücherwand'],
  kochen: ['Tisch für zehn', 'Tisch für zehn'], morgen: ['Morgenlicht von Osten', 'Morgenlicht']
};
const KEYS = ['x', 'y', 'z', 'sx', 'sy', 'sz'];
const PHASES = ['slab', 'eg', 'decke', 'og', 'roof'];
const easeIn = x => x * x * x;
const smooth = x => x * x * (3 - 2 * x);
const sum = a => a.reduce((s, r) => s + r.m2, 0);
const now = () => performance.now();
const pick = b => Object.fromEntries(KEYS.map(k => [k, b[k]]));

let M, T, S, stage, host, labelsBox, phaseEl, newsEl, G, MAT, ray, floorLbl = [];
let L = null, mode = 'raeume', hot = null, built = false, seen = false, visible = false;
let cam = null, az = -.62, drag = false, raf = 0, timers = [], sayT = 0, newsT = 0, sun = 0;
const els = new Map(), labels = new Map(), roomMats = new Map(), flash = new Map();

/* Quadratische Aufteilung der Fläche (squarified treemap): Räume bleiben möglichst kompakt */
function squarify(items, x, y, w, hh) {
  const k = w * hh / sum(items);
  const list = items.map(r => ({ ...r, a: r.m2 * k })).sort((a, b) => b.a - a.a);
  const out = [];
  const worst = (row, side) => { const s = row.reduce((t, r) => t + r.a, 0); return Math.max(...row.map(r => Math.max(side * side * r.a / (s * s), s * s / (side * side * r.a)))); };
  const place = row => {
    const s = row.reduce((t, r) => t + r.a, 0);
    if (w >= hh) { const rw = s / hh; let yy = y; row.forEach(r => { const d = r.a / rw; out.push({ ...r, x, z: yy, w: rw, d }); yy += d; }); x += rw; w -= rw; }
    else { const rd = s / w; let xx = x; row.forEach(r => { const rw = r.a / rd; out.push({ ...r, x: xx, z: y, w: rw, d: rd }); xx += rw; }); y += rd; hh -= rd; }
  };
  let row = [];
  while (list.length) {
    const side = Math.min(w, hh), c = list[0];
    if (!row.length || worst([...row, c], side) <= worst(row, side)) { row.push(c); list.shift(); }
    else { place(row); row = []; }
  }
  if (row.length) place(row);
  return out;
}

/* Aus dem Raumprogramm ein Haus: bis 120 m² ebenerdig, darüber zwei Geschoße mit den privaten Räumen oben */
export function roomKeys(rooms) { return rooms.map((r, i) => r.room + '#' + rooms.slice(0, i).filter(x => x.room === r.room).length); }
function plan(P, a) {
  const keys = roomKeys(P.rooms);
  const rooms = P.rooms.map((r, i) => ({ ...r, key: keys[i] }));
  const two = P.total > 120;
  const eg = rooms.filter(r => !two || !UP.has(r.room)), og = two ? rooms.filter(r => UP.has(r.room)) : [];
  const A0 = sum(eg), A1 = sum(og);
  const D = clamp(Math.sqrt(Math.max(A0, A1) / 1.55), 7.6, 10.4);
  const W0 = A0 / D, W1 = A1 / D, x0 = -W0 / 2;
  const R0 = squarify(eg, x0, -D / 2, W0, D).map(r => ({ ...r, lv: 0 }));
  const live = R0.find(r => r.room.startsWith('Wohnen'));
  const feat = Object.fromEntries(Object.keys(FEAT).map(k => [k, a.love.includes(k)]));
  /* Luftraum: das Wohnen geht über zwei Geschoße, das Obergeschoß rückt daneben */
  const lw = !!(feat.weite && live && live.d > D - .1 && live.x < x0 + .05);
  let ox = W0 / 2 - W1;
  if (lw && two) ox = Math.max(ox, live.x + live.w);
  const R1 = og.length ? squarify(og, ox, -D / 2, W1, D).map(r => ({ ...r, lv: 1 })) : [];
  return { two, D, W0, W1, x0, ox, minX: two ? Math.min(x0, ox) : x0, maxX: two ? Math.max(W0 / 2, ox + W1) : W0 / 2, rooms: [...R0, ...R1], live, lw, feat, garten: feat.garten };
}

/* Zielzustand aller Bauteile für Grundriss und Ansicht */
function targets(md) {
  const out = [], open = md === 'raeume', side = open && L.two;
  const y0 = SLAB, y1 = SLAB + HW + DECK, live = L.live;
  /* Obergeschoß daneben: auf den Boden gestellt, rechts vom Erdgeschoß */
  const dx = side ? L.W0 / 2 + SIDE - L.ox : 0, dy = side ? -(SLAB + HW) : 0;
  const put = (key, kind, phase, s, extra = {}) => out.push({ key: key + '|' + kind, kind, phase, ry: 0, ...s, ...extra });
  put('slab', 'slab', 'slab', { x: 0, y: SLAB / 2, z: 0, sx: L.W0 + .5, sy: SLAB, sz: L.D + .5 });
  if (L.garten && live) {
    put('terr', 'deck', 'slab', { x: live.x + live.w / 2, y: .11, z: L.D / 2 + .25 + 1.7, sx: live.w, sy: .22, sz: 3.4 });
    [[live.x - 2.3, L.D / 2 + 1.4, 5.6], [live.x + live.w + 1.5, L.D / 2 + 3.3, 6.6], [live.x - 2.8, -L.D / 2 + 1.2, 4.8]]
      .forEach(([x, z, s], i) => put('baum' + i, 'tree', 'slab', { x, y: 0, z, sx: s, sy: s, sz: s }));
  }
  L.rooms.forEach(r => {
    const tall = L.lw && r.key === live.key, hh = tall ? TALL : HW;
    const y = (r.lv ? y1 + dy : y0) + hh / 2, ox = r.lv ? dx : 0;
    const fx0 = r.lv ? L.ox : L.x0, fx1 = r.lv ? L.ox + L.W1 : L.W0 / 2;
    const ext = { n: r.z < -L.D / 2 + .05, s: r.z + r.d > L.D / 2 - .05, w: r.x < fx0 + .05, e: r.x + r.w > fx1 - .05 };
    const isLive = r.room.startsWith('Wohnen');
    const kind = side => isLive && ext[side] && (side === 's' || side === 'w') ? 'glass' : ext[side] && !isLive && !NOWIN.has(r.room) ? 'win' : 'wall';
    const wall = (side, s, ry) => put(r.key + '|' + side, kind(side), r.lv ? 'og' : 'eg', { ...s, y, sy: hh }, { ry, room: r.key, side });
    wall('n', { x: ox + r.x + r.w / 2, z: r.z + IN, sx: r.w - .02, sz: TW }, 0);
    wall('s', { x: ox + r.x + r.w / 2, z: r.z + r.d - IN, sx: r.w - .02, sz: TW }, 0);
    wall('w', { x: ox + r.x + IN, z: r.z + r.d / 2, sx: Math.max(.2, r.d - .26), sz: TW }, Math.PI / 2);
    wall('e', { x: ox + r.x + r.w - IN, z: r.z + r.d / 2, sx: Math.max(.2, r.d - .26), sz: TW }, Math.PI / 2);
  });
  /* Wünsche im Wohnen: ein langer Tisch, eine Bücherwand */
  if (live && L.feat.kochen) put('tisch', 'table', 'eg', { x: live.x + live.w / 2, y: y0 + .38, z: live.z + live.d / 2 + .4, sx: Math.min(live.w - 1.6, 4.6), sy: .76, sz: 1.05 }, { room: live.key });
  if (live && L.feat.buecher) {
    const sh = (L.lw ? TALL : HW) - .5;
    put('buch', 'shelf', 'eg', { x: live.x + live.w / 2, y: y0 + sh / 2, z: live.z + IN + TW / 2 + .2, sx: live.w - .9, sy: sh, sz: .34 }, { room: live.key });
  }
  if (L.two) {
    const dx0 = L.lw ? live.x + live.w : L.minX;
    put('decke', 'decke', 'decke', side
      ? { x: dx + L.ox + L.W1 / 2, y: DECK / 2, z: 0, sx: L.W1 + .3, sy: DECK, sz: L.D + .3 }
      : { x: (dx0 + L.maxX) / 2 + (L.lw ? .075 : 0), y: SLAB + HW + DECK / 2, z: 0, sx: L.maxX - dx0 + (L.lw ? .15 : .3), sy: DECK, sz: L.D + .3 });
  }
  if (!open) {
    const span = (a, b, y) => ({ x: (a + b) / 2, sx: b - a, y, z: 0, sy: ROOF, sz: L.D + .5 });
    if (L.two) put('roof', 'roof', 'roof', span(L.ox - .25, L.ox + L.W1 + .25, y1 + HW + ROOF / 2));
    else put('roof', 'roof', 'roof', span(L.lw ? live.x + live.w : L.x0 - .25, L.W0 / 2 + .25, y0 + HW + ROOF / 2));
    if (L.lw) put('roof2', 'roof', 'roof', span(live.x - .25, L.two ? Math.min(live.x + live.w + .25, L.ox - .25) : live.x + live.w + .25, y0 + TALL + ROOF / 2));
  }
  return out;
}

function setup() {
  const std = c => new T.MeshStandardMaterial({ color: c, roughness: .92, metalness: 0, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
  const line = (c, o) => new T.LineBasicMaterial({ color: c, transparent: true, opacity: o });
  const geo = p => new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute(p, 3));
  const box = new T.BoxGeometry(1, 1, 1);
  const slats = []; for (let i = 1; i < 22; i++) { const z = -.5 + i / 22; slats.push(-.5, .5, z, .5, .5, z); }
  const shelf = []; for (let i = 1; i < 6; i++) { const y = -.5 + i / 6; shelf.push(-.5, y, .5, .5, y, .5); } for (let i = 1; i < 4; i++) { const x = -.5 + i / 4; shelf.push(x, -.5, .5, x, .5, .5); }
  /* Modellbaum: zwei gekreuzte Kartonscheiben, Föhrenform */
  const tp = [[-.03, 0], [.03, 0], [.03, .14], [.22, .14], [0, 1], [-.22, .14], [-.03, .14]];
  const ts = new T.Shape(); tp.forEach(([x, y], i) => i ? ts.lineTo(x, y) : ts.moveTo(x, y)); ts.closePath();
  const tree = new T.ShapeGeometry(ts);
  G = {
    box, edge: new T.EdgesGeometry(box), studs: new Map(), slats: geo(slats), shelf: geo(shelf), tree, treeEdge: new T.EdgesGeometry(tree),
    sling: geo([0, 1.4, 0, -.5, 0, -.5, 0, 1.4, 0, .5, 0, -.5, 0, 1.4, 0, -.5, 0, .5, 0, 1.4, 0, .5, 0, .5]),
    cable: geo([0, 1.4, 0, 0, 90, 0])
  };
  MAT = {
    slab: std(0xD5D2CC), decke: std(0xE8DFD0), deck: std(0xCDB89A), roof: std(0x444442),
    table: std(0x887254), shelf: std(0x6B5A44),
    tree: new T.MeshStandardMaterial({ color: 0xEDEAE3, roughness: .95, side: T.DoubleSide }),
    glass: Object.assign(std(0x2c3338), { transparent: true, opacity: .42, roughness: .18 }),
    pane: std(0x2a2e31),
    edge: line(0x444442, .5), edgeLight: line(0x9a9a97, .7), stud: line(0xBCA98B, .7), slat: line(0xA38D6D, .6), shelfLine: line(0xD8CBB6, .8), cable: line(0x000000, .72)
  };
  ray = new T.Raycaster();
}
function studs(n) {
  if (!G.studs.has(n)) {
    const p = []; for (let i = 1; i < n; i++) { const x = -.5 + i / n; p.push(x, -.5, .5, x, .5, .5, x, -.5, -.5, x, .5, -.5); }
    G.studs.set(n, new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute(p, 3)));
  }
  return G.studs.get(n);
}
function roomMat(k) {
  if (!roomMats.has(k)) roomMats.set(k, new T.MeshStandardMaterial({ color: WALL, roughness: .92, metalness: 0, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }));
  return roomMats.get(k);
}

/* Ein Bauteil: Körper, Kanten, Ständer (Holzrahmenbau), dazu Kranseil und Anschlagseile, solange es schwebt */
function make(t) {
  const g = new T.Group(), wallish = t.kind === 'wall' || t.kind === 'win';
  let mesh, st = null;
  if (t.kind === 'tree') {
    mesh = new T.Mesh(G.tree, MAT.tree); const m2 = new T.Mesh(G.tree, MAT.tree); m2.rotation.y = Math.PI / 2;
    [mesh, m2].forEach(m => { m.castShadow = true; m.receiveShadow = true; m.add(new T.LineSegments(G.treeEdge, MAT.edge)); g.add(m); });
  } else {
    mesh = new T.Mesh(G.box, wallish ? roomMat(t.room) : MAT[t.kind]);
    mesh.castShadow = true; mesh.receiveShadow = true; g.add(mesh);
    g.add(new T.LineSegments(G.edge, t.kind === 'roof' ? MAT.edgeLight : MAT.edge));
  }
  if (wallish) { st = new T.LineSegments(studs(2), MAT.stud); g.add(st); }
  if (t.kind === 'win') { const p = new T.Mesh(G.box, MAT.pane); p.position.set(0, .08, 0); p.scale.set(.46, .52, 1.08); p.add(new T.LineSegments(G.edge, MAT.edge)); g.add(p); }
  if (t.kind === 'glass') g.add(new T.LineSegments(studs(Math.max(2, Math.round(t.sx / 1.3))), MAT.edge));
  if (t.kind === 'deck') g.add(new T.LineSegments(G.slats, MAT.slat));
  if (t.kind === 'shelf') g.add(new T.LineSegments(G.shelf, MAT.shelfLine));
  g.rotation.y = t.ry; S.scene.add(g);
  const crane = new T.Group(); crane.add(new T.LineSegments(G.sling, MAT.cable)); crane.add(new T.Line(G.cable, MAT.cable));
  crane.rotation.y = t.ry; crane.visible = false; S.scene.add(crane);
  return { key: t.key, kind: t.kind, room: t.room, side: t.side, phase: t.phase, g, mesh, st, crane, n: 0, s: null, a: null, b: null, t0: 0, dur: 0, delay: 0, x: 1, mode: 'move', dead: false };
}

function go(el, b, md, dur, delay) {
  el.a = { ...el.s }; el.b = pick(b); el.t0 = now(); el.dur = reduce ? 0 : dur; el.delay = reduce ? 0 : delay; el.mode = md; el.x = 0;
  if (el.st) { const n = Math.max(2, Math.round(b.sx / .625)); if (n !== el.n) { el.n = n; el.st.geometry = studs(n); } }
}
function appear(el, b, delay) {
  if (el.kind === 'tree') { el.s = { ...pick(b), sx: .001, sy: .001, sz: .001 }; go(el, b, 'rise', 1100, delay); }
  else if (el.kind === 'slab' || el.kind === 'deck') { el.s = { ...pick(b), y: b.y - b.sy / 2, sy: .001 }; go(el, b, 'rise', 800, delay); }
  else { el.s = { ...pick(b), y: b.y + DROP }; go(el, b, 'drop', 1000, delay); }
}
function lift(el, delay) {
  el.dead = true;
  if (el.kind === 'tree') go(el, { ...el.s, sx: .001, sy: .001, sz: .001 }, 'lift', 700, delay);
  else go(el, { ...el.s, y: el.s.y + DROP }, 'lift', 950, delay);
}

/* Abgleich: ausheben, was wegfällt, verschieben, was bleibt, einheben, was neu ist */
function sync(md, opt = {}) {
  const list = targets(md), keys = new Set(list.map(t => t.key));
  let li = 0;
  els.forEach(el => { if (!keys.has(el.key) && !el.dead) lift(el, li++ * 35); });
  const base = li ? 380 : 0, marks = {};
  const far = b => { const el = els.get(b.key); return el && !el.dead && el.s && Math.abs(el.s.x - b.x) > 1.5; };
  const crane = !opt.build && list.some(far);
  let t = 0, grp = '', prev = '', i = 0, ni = 0;
  list.forEach(b => {
    if (opt.build) {
      const g = b.phase + (b.room || b.key);
      if (g !== grp) { t += !grp ? 0 : b.phase !== prev ? 620 : 150; grp = g; i = 0; }
      if (b.phase !== prev) { marks[b.phase] = t; prev = b.phase; }
    }
    const delay = opt.build ? t + i++ * 50 : base + ni * 70 + (b.phase === 'roof' ? (crane ? 1500 : 450) : 0);
    let el = els.get(b.key);
    if (!el) { el = make(b); els.set(b.key, el); appear(el, b, delay); ni++; }
    else if (el.dead) { el.dead = false; if (el.kind === 'tree') go(el, b, 'rise', 900, delay); else go(el, b, 'drop', 1000, delay); ni++; }
    else if (far(b)) go(el, b, 'crane', 2000, li ? 250 : 0);
    else go(el, b, 'move', opt.dur || 1100, li ? 200 : 0);
  });
  return { marks, end: t + 1100 };
}

function syncLabels() {
  const keys = new Set(L.rooms.map(r => r.key));
  L.rooms.forEach(r => {
    let lb = labels.get(r.key);
    if (!lb) { lb = h('div', { class: 'bau__lbl' }, '<b></b><em></em>'); labelsBox.appendChild(lb); labels.set(r.key, lb); }
    lb.firstChild.textContent = SHORT[r.room] || r.room; lb.lastChild.textContent = r.m2 + ' m²'; lb._m2 = r.m2; lb._w = 0;
    lb.classList.toggle('is-hot', r.key === hot);
  });
  labels.forEach((lb, k) => { if (!keys.has(k)) { lb.remove(); labels.delete(k); } });
}

function occluded(p, k) {
  const o = S.cam.position, dir = p.clone().sub(o), d = dir.length();
  ray.set(o, dir.normalize()); ray.far = d - .15;
  const meshes = []; els.forEach(el => { if (!el.dead && el.room !== k && el.g.visible && el.kind !== 'tree') meshes.push(el.mesh); });
  return ray.intersectObjects(meshes, false).length > 0;
}

/* Wie stark ein Raum gerade aufleuchtet: einblenden, halten, ausklingen */
function flashLevel(k, t) {
  const f = flash.get(k); if (!f) return 0;
  if (t > f.t1) { flash.delete(k); return 0; }
  return Math.min(clamp((t - f.t0) / 350), clamp((f.t1 - t) / 900));
}

/* Beschriftungen über den Räumen. Verdeckte und überlappende blenden aus, große und gerade geänderte Räume haben Vorrang. */
function placeLabels(t) {
  const by = new Map();
  els.forEach(el => { if (el.room && el.side && !el.dead) { const o = by.get(el.room) || {}; o[el.side] = el; by.set(el.room, o); } });
  const W = host.clientWidth, H = host.clientHeight, hr = host.getBoundingClientRect();
  /* Freihalten: Ansichtsumschalter, Bauabschnitt, Änderungszeilen, Etikett und Hinweis */
  const placed = $$('.bau__tabs, .bau__phase, .bau__news li.is-on, .tag, .bau__hint', stage).map(e => e.getBoundingClientRect()).filter(r => r.width)
    .map(r => ({ x0: r.left - hr.left - 4, x1: r.right - hr.left + 4, y0: r.top - hr.top - 4, y1: r.bottom - hr.top + 4 }));
  const hit = r => placed.some(p => r.x0 < p.x1 && r.x1 > p.x0 && r.y0 < p.y1 && r.y1 > p.y0);
  /* Geschoßnamen unter den beiden Ebenen, nur wenn sie nebeneinander stehen */
  const dk = els.get('decke|decke'), sideOn = mode === 'raeume' && L.two && dk && !dk.dead && dk.x > .92;
  floorLbl.forEach((lb, i) => {
    let on = false;
    if (sideOn) {
      const x = i ? dk.s.x : 0, z = L.D / 2 + (i === 0 && L.garten ? 3.9 : .7);
      const q = new T.Vector3(x, 0, z).project(S.cam), px = (q.x + 1) / 2 * W, py = (1 - q.y) / 2 * H;
      const w = lb._w || (lb._w = lb.offsetWidth), r = { x0: px - w / 2 - 3, x1: px + w / 2 + 3, y0: py, y1: py + 20 };
      on = r.x0 > 0 && r.x1 < W && r.y1 < H && !hit(r);
      if (on) { lb.style.transform = `translate(${px.toFixed(1)}px,${py.toFixed(1)}px) translate(-50%,0)`; placed.push(r); }
    }
    lb.classList.toggle('is-on', on);
  });
  const pri = k => (k === hot ? 2 : 0) + (flashLevel(k, t) > 0 ? 1 : 0);
  [...labels.entries()].sort((a, b) => pri(b[0]) - pri(a[0]) || b[1]._m2 - a[1]._m2).forEach(([k, lb]) => {
    const o = by.get(k) || {};
    let show = false, x = 0, y = 0;
    const walls = [o.n, o.s, o.w, o.e];
    if (mode === 'raeume' && walls.every(e => e && e.s && (e.mode === 'move' || e.x > .92))) {
      const p = new T.Vector3(o.n.s.x, o.n.s.y + o.n.s.sy / 2 + .25, o.w.s.z), q = p.clone().project(S.cam);
      x = (q.x + 1) / 2 * W; y = (1 - q.y) / 2 * H;
      show = q.z < 1 && x > 10 && x < W - 10 && y > 30 && y < H - 20 && !occluded(p, k);
      if (show) {
        const w = lb._w || (lb._w = lb.offsetWidth), hh = lb._h || (lb._h = lb.offsetHeight);
        x = clamp(x, w / 2 + 6, W - w / 2 - 6);
        /* Bei Überlappung erst eine Zeile höher oder tiefer versuchen, dann ausblenden */
        const dy = [0, -(hh + 2), hh + 2].find(d => !hit({ x0: x - w / 2 - 3, x1: x + w / 2 + 3, y0: y + d - hh - 2, y1: y + d + 1 }));
        if (dy === undefined) show = false;
        else { y += dy; placed.push({ x0: x - w / 2 - 3, x1: x + w / 2 + 3, y0: y - hh - 2, y1: y + 1 }); }
      }
    }
    if (show) lb.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-100%)`;
    lb.classList.toggle('is-on', show);
    lb.classList.toggle('is-flash', flashLevel(k, t) > .5);
  });
}

/* Kamera: Blickwinkel je Ansicht, Abstand so, dass die ganze Box des Modells mit Rand ins Bild passt */
function view(azNow) {
  const open = mode === 'raeume', side = open && L.two;
  const x0 = (side ? L.x0 : L.minX) - .3 - (L.garten ? 3.4 : 0), x1 = (side ? L.W0 / 2 + SIDE + L.W1 : L.maxX) + .3;
  const z0 = -L.D / 2 - .3, z1 = L.D / 2 + .3 + Math.max(L.garten ? 3.8 : 0, side ? 1.2 : 0);
  const y1 = Math.max(L.two && !open ? SLAB + 2 * HW + DECK + ROOF : SLAB + HW + (open ? 0 : ROOF), L.lw ? SLAB + TALL : 0, L.garten ? 5.4 : 0) + .3;
  const el = open ? .74 : .44, c = [(x0 + x1) / 2, y1 / 2, (z0 + z1) / 2];
  const f = [-Math.sin(azNow) * Math.cos(el), -Math.sin(el), -Math.cos(azNow) * Math.cos(el)];
  const rl = Math.hypot(f[0], f[2]), r = [-f[2] / rl, 0, f[0] / rl];
  const u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
  const W = host.clientWidth || 1, H = host.clientHeight || 1;
  const tv = Math.tan(12 * Math.PI / 180) * (1 - 2 * 40 / H), th = Math.tan(12 * Math.PI / 180) * W / H * (1 - 2 * 20 / W);
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const pts = []; [x0, x1].forEach(x => [0, y1].forEach(y => [z0, z1].forEach(z => pts.push([x, y, z]))));
  const fit = () => { let d = 0; pts.forEach(p => { const q = [p[0] - c[0], p[1] - c[1], p[2] - c[2]], zf = dot(q, f); d = Math.max(d, Math.abs(dot(q, r)) / th - zf, Math.abs(dot(q, u)) / tv - zf); }); return d; };
  let d = fit();
  /* In der Perspektive liegt die Box nicht mittig: Ziel um den Versatz der Bildkanten verschieben, dann neu einpassen */
  let ax = [Infinity, -Infinity], ay = [Infinity, -Infinity];
  pts.forEach(p => { const q = [p[0] - c[0], p[1] - c[1], p[2] - c[2]], dep = dot(q, f) + d, px = dot(q, r) / dep, py = dot(q, u) / dep; ax = [Math.min(ax[0], px), Math.max(ax[1], px)]; ay = [Math.min(ay[0], py), Math.max(ay[1], py)]; });
  const sx = (ax[0] + ax[1]) / 2 * d, sy = (ay[0] + ay[1]) / 2 * d;
  for (let i = 0; i < 3; i++) c[i] += r[i] * sx + u[i] * sy;
  d = fit();
  return { tx: c[0], ty: c[1], tz: c[2], dist: d, el };
}

const WARM = [1, .86, .7];
function frame() {
  raf = 0;
  if (!S || !L) return;
  const t = now();
  let busy = false;
  els.forEach(el => {
    const x = el.dur ? clamp((t - el.t0 - el.delay) / el.dur) : 1, k = el.mode === 'lift' ? easeIn(x) : ease(x);
    el.x = x; if (x < 1) busy = true;
    const s = el.s = {}; KEYS.forEach(q => { s[q] = lerp(el.a[q], el.b[q], k); });
    if (el.mode === 'crane') {
      /* Kranweg: erst anheben, dann schwenken, dann absetzen */
      const u = smooth(x), kh = smooth(seg(u, .18, .82));
      KEYS.forEach(q => { s[q] = lerp(el.a[q], el.b[q], u); });
      s.x = lerp(el.a.x, el.b.x, kh); s.z = lerp(el.a.z, el.b.z, kh);
      s.y = lerp(el.a.y, el.b.y, u) + Math.sin(Math.PI * u) * ARC;
    }
    el.g.visible = !((el.mode === 'drop' || el.mode === 'rise') && x <= 0);
    el.g.position.set(s.x, s.y, s.z);
    el.g.scale.set(Math.max(.001, s.sx), Math.max(.001, s.sy), Math.max(.001, s.sz));
    const fly = el.kind !== 'tree' && (el.mode === 'drop' || el.mode === 'lift' || el.mode === 'crane') && x > 0 && x < 1;
    el.crane.visible = fly;
    if (fly) { el.crane.position.set(s.x, s.y + s.sy / 2, s.z); el.crane.children[0].scale.set(s.sx * .9, 1, s.sz * .9); }
    if (el.dead && x >= 1) { S.scene.remove(el.g); S.scene.remove(el.crane); els.delete(el.key); }
  });
  /* Aufleuchten neuer und veränderter Räume, Hover aus der Liste */
  const hc = G.hot || (G.hot = new T.Color(HOT));
  roomMats.forEach((m, k) => { const v = k === hot ? 1 : flashLevel(k, t); if (flash.has(k)) busy = true; m.color.setHex(WALL).lerp(hc, v); });
  const azNow = az + (through(stage, 1, 0) - .5) * .4, v = view(azNow), c = cam || (cam = { ...v });
  let moving = false;
  Object.keys(v).forEach(q => { const d = v[q] - c[q]; if (Math.abs(d) > .002 && !reduce) { c[q] += d * .07; moving = true; } else c[q] = v[q]; });
  /* Morgenlicht: die Sonne kommt flach von Osten und färbt warm */
  const st = L.feat.morgen ? 1 : 0;
  if (Math.abs(st - sun) > .002 && !reduce) { sun += (st - sun) * .05; moving = true; } else sun = st;
  S.orbit(azNow, c.el, c.dist, c.tx, c.ty, c.tz);
  S.key.position.set(c.tx + lerp(-34, 70, sun), lerp(60, 20, sun), c.tz + lerp(46, 6, sun));
  S.key.color.setRGB(1, lerp(1, WARM[1], sun), lerp(1, WARM[2], sun));
  S.render();
  placeLabels(t);
  if ((busy || moving || drag) && visible) raf = requestAnimationFrame(frame);
}
function kick() { if (!raf && S && L && visible) raf = requestAnimationFrame(frame); }

function say(text, ms) {
  clearTimeout(sayT);
  phaseEl.textContent = text;
  if (ms) sayT = setTimeout(() => { phaseEl.textContent = mode === 'raeume' ? 'Deine Räume' : 'Dein Haus'; }, ms);
}
const later = (ms, fn) => timers.push(setTimeout(fn, reduce ? 0 : ms));
function setTabs(m) { $$('[data-bau-mode]', stage).forEach(b => b.setAttribute('aria-selected', String(b.dataset.bauMode === m))); }

function setMode(m, user) {
  if (user) { timers.forEach(clearTimeout); timers = []; }
  if (m === mode && built) return;
  mode = m; setTabs(m);
  if (!built || !L) return;
  sync(m, { dur: 1300 });
  say(m === 'raeume' ? 'Deine Räume' : 'Dein Haus');
  kick();
}

/* Erster Aufbau, sobald das Modell gut im Bild ist */
function start() {
  if (built || !S || !L || !seen) return;
  built = true; mode = 'haus'; setTabs('haus'); syncLabels();
  const { marks, end } = sync('haus', { build: true });
  const names = { slab: 'Bodenplatte', eg: L.two ? 'Wände Erdgeschoß' : 'Wände', decke: 'Decke', og: 'Wände Obergeschoß', roof: 'Dach' };
  let n = 0;
  PHASES.forEach(p => { if (p in marks) { const t = `0${++n} / ${names[p]}`; later(marks[p], () => say(t)); } });
  later(end + 200, () => say('Dein Haus'));
  later(end + 1500, () => setMode('raeume'));
  kick();
}

async function boot() {
  if (M) return;
  try { M = await import('./house3d.js'); } catch (e) { M = null; console.warn('3D nicht geladen', e); $('.tag', stage).textContent = '3D Modell konnte nicht laden'; return; }
  T = M.T;
  S = M.createStage(host, { bg: 0xFFFFFF, fov: 24, shadow: .15, key: 1.7, hemi: 1.05, fill: .5, fogNear: 260, fogFar: 700 });
  S.onResize = () => { labels.forEach(lb => { lb._w = 0; lb._h = 0; }); kick(); };
  setup();
  start(); kick();
}

export function initBau() {
  stage = $('[data-bau]'); if (!stage) return;
  host = $('[data-bau-gl]', stage); labelsBox = $('[data-bau-labels]', stage); phaseEl = $('[data-bau-phase]', stage); newsEl = $('[data-bau-news]', stage);
  floorLbl = ['Erdgeschoß', 'Obergeschoß'].map(t => { const lb = h('span', { class: 'info bau__floor' }, t); labelsBox.appendChild(lb); return lb; });
  $$('[data-bau-mode]', stage).forEach(b => b.addEventListener('click', () => setMode(b.dataset.bauMode, true)));
  new IntersectionObserver(es => es.forEach(e => { visible = e.isIntersecting; if (visible) boot(); kick(); }), { rootMargin: '300px 0px' }).observe(stage);
  new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { seen = true; start(); } }), { threshold: .5 }).observe(stage);
  let sx = 0, a0 = 0;
  stage.addEventListener('pointerdown', e => { if (e.target.closest('button')) return; drag = true; sx = e.clientX; a0 = az; stage.setPointerCapture(e.pointerId); kick(); });
  stage.addEventListener('pointermove', e => { if (!drag) return; az = a0 - (e.clientX - sx) / 260; kick(); });
  ['pointerup', 'pointercancel'].forEach(t => stage.addEventListener(t, () => { drag = false; }));
  loop.add({ tick: () => { if (visible) kick(); } });
}

/* Was hat sich geändert? Daraus werden die Zeilen im Modell und das Aufleuchten */
function diff(A, B) {
  const lines = [], lit = new Set();
  const old = new Map(A.rooms.map(r => [r.key, r])), neu = new Map(B.rooms.map(r => [r.key, r]));
  if (A.two !== B.two) lines.push(['Jetzt', B.two ? 'Zwei Geschoße' : 'Ebenerdig, alles auf einer Ebene']);
  B.rooms.forEach(r => { if (!old.has(r.key)) { lines.push(['Neu', `${r.room}, ${r.m2} m²`]); lit.add(r.key); } });
  A.rooms.forEach(r => { if (!neu.has(r.key)) lines.push(['Weg', r.room]); });
  B.rooms.forEach(r => { const o = old.get(r.key); if (o && o.m2 !== r.m2) { lines.push([r.m2 > o.m2 ? 'Größer' : 'Kleiner', `${SHORT[r.room] || r.room}, ${o.m2} auf ${r.m2} m²`]); lit.add(r.key); } });
  Object.keys(FEAT).forEach(k => {
    if (A.feat[k] === B.feat[k]) return;
    lines.push([B.feat[k] ? 'Neu' : 'Weg', FEAT[k][B.feat[k] ? 0 : 1]]);
    if (B.live) lit.add(B.live.key);
  });
  return { lines: lines.slice(0, 4), lit };
}
function news(lines) {
  clearTimeout(newsT);
  newsEl.innerHTML = lines.map(([a, b]) => `<li><span class="info">${a}</span><span>${b}</span></li>`).join('');
  const items = $$('li', newsEl);
  requestAnimationFrame(() => items.forEach((li, i) => setTimeout(() => li.classList.add('is-on'), reduce ? 0 : 120 * i)));
  newsT = setTimeout(() => items.forEach(li => li.classList.remove('is-on')), reduce ? 6000 : 5200);
}

/* Neue Antworten: Modell klappt auf und baut um */
export function bauUpdate(P, a) {
  const prev = L;
  L = plan(P, a);
  if (!built) return;
  syncLabels();
  timers.forEach(clearTimeout); timers = [];
  if (mode !== 'raeume') { mode = 'raeume'; setTabs('raeume'); }
  sync('raeume');
  if (prev) {
    const d = diff(prev, L), t = now();
    d.lit.forEach(k => flash.set(k, { t0: t + (reduce ? 0 : 700), t1: t + (reduce ? 3000 : 4600) }));
    if (d.lines.length) news(d.lines);
  }
  say('Umbau', 1800);
  kick();
}

export function bauHot(key) {
  if (hot === key) return;
  hot = key;
  labels.forEach((lb, k) => lb.classList.toggle('is-hot', k === key));
  kick();
}
