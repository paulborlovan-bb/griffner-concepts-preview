// Baut familie.bin (und familie.bin.gz): die Familie (Mutter, Vater, zwei Kinder) für Vorschlag 1 Gehen.
// Quelle: Quaternius, Universal Base Characters [Standard] und Universal Animation Library [Standard], beide CC0 1.0
// (gemeinfrei, kommerziell frei, ohne Namensnennung). Heruntergeladen am 2026-11-19 von quaternius.itch.io.
// Aufruf: node familie-bau.mjs <Ordner "Universal Base Characters[Standard]"> <Datei UAL1_Standard.glb>
// Behalten wird nur: zwei Körper (Mann, Frau, ohne Augen, Brauen, Texturen), vier Frisuren am Kopfknochen,
// das Skelett (65 Knochen), der Clip Walk_Loop (nur Drehungen, dazu die Beckenbewegung) und ein ruhiges Stehen (Mittel des Gangs).
// Format (klein, ohne Lader-Bibliothek): 'GJF1', u32 JSON-Länge, JSON, Binärteil (4-Byte-ausgerichtet). Dazu familie.bin.gz (gzip).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, dirname } from 'node:path';

const [UBC, UAL] = process.argv.slice(2);
if (!UBC || !UAL) { console.error('Aufruf: node familie-bau.mjs <UBC-Ordner> <UAL1_Standard.glb>'); process.exit(1); }
const OUT = new URL('./familie.bin', import.meta.url).pathname;

const TA = { 5120: Int8Array, 5121: Uint8Array, 5122: Int16Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array };
const NC = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
function load(f) {
  let j, bin;
  if (f.endsWith('.glb')) {
    const b = readFileSync(f), jl = b.readUInt32LE(12);
    j = JSON.parse(b.subarray(20, 20 + jl).toString('utf8'));
    const o = 20 + jl, bl = b.readUInt32LE(o); bin = b.subarray(o + 8, o + 8 + bl);
  } else { j = JSON.parse(readFileSync(f, 'utf8')); bin = readFileSync(join(dirname(f), j.buffers[0].uri)); }
  const read = i => {
    const a = j.accessors[i], bv = j.bufferViews[a.bufferView], C = TA[a.componentType], n = NC[a.type], sz = C.BYTES_PER_ELEMENT;
    const off = (bv.byteOffset || 0) + (a.byteOffset || 0), st = bv.byteStride || n * sz, out = new C(a.count * n);
    const dv = new DataView(bin.buffer, bin.byteOffset);
    const get = { 1: (p) => C === Int8Array ? dv.getInt8(p) : dv.getUint8(p), 2: (p) => C === Int16Array ? dv.getInt16(p, true) : dv.getUint16(p, true), 4: (p) => C === Float32Array ? dv.getFloat32(p, true) : dv.getUint32(p, true) }[sz];
    for (let k = 0; k < a.count; k++) for (let c = 0; c < n; c++) out[k * n + c] = get(off + k * st + c * sz);
    return out;
  };
  return { j, read };
}

/* ---------- kleine Mathematik ---------- */
const qmul = (a, b) => [a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1], a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0], a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3], a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]];
const qrot = (q, v) => { const p = qmul(qmul(q, [v[0], v[1], v[2], 0]), [-q[0], -q[1], -q[2], q[3]]); return [p[0], p[1], p[2]]; };
const m4apply = (m, v) => [m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12], m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13], m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14]];
const m4dir = (m, v) => [m[0] * v[0] + m[4] * v[1] + m[8] * v[2], m[1] * v[0] + m[5] * v[1] + m[9] * v[2], m[2] * v[0] + m[6] * v[1] + m[10] * v[2]];

/* ---------- Skelett ---------- */
const male = load(join(UBC, 'Base Characters/Godot - UE/Superhero_Male_FullBody.gltf'));
const female = load(join(UBC, 'Base Characters/Godot - UE/Superhero_Female_FullBody.gltf'));
const ual = load(UAL);
const NAMES = male.j.skins[0].joints.map(i => male.j.nodes[i].name);
function rig(src) {
  const { j, read } = src, sk = j.skins[0], names = sk.joints.map(i => j.nodes[i].name);
  const parentOf = {}; j.nodes.forEach((n, i) => (n.children || []).forEach(c => { parentOf[c] = i; }));
  const ib = read(sk.inverseBindMatrices);
  return NAMES.map(nm => {
    const k = names.indexOf(nm); if (k < 0) throw 'Knochen fehlt: ' + nm;
    const ni = sk.joints[k], n = j.nodes[ni], pn = j.nodes[parentOf[ni]]?.name;
    return { n: nm, p: NAMES.indexOf(pn), t: n.translation || [0, 0, 0], r: n.rotation || [0, 0, 0, 1], ib: [...ib.slice(k * 16, k * 16 + 16)] };
  });
}
const RIG = { m: rig(male), f: rig(female) };

/* ---------- Geometrie ---------- */
const parts = [], blobs = [];
let off = 0;
const push = (ta) => { const b = Buffer.from(ta.buffer, ta.byteOffset, ta.byteLength), o = off; blobs.push(b); off += b.length; const pad = (4 - off % 4) % 4; if (pad) { blobs.push(Buffer.alloc(pad)); off += pad; } return o; };

/* Körper: nur Position, Normale, Knochen, Gewichte. Nähte (UV) werden verschweißt.
   o.smooth: Taubin-Glättung (Durchgänge), nimmt Muskeldetails weg, ohne zu schrumpfen (ruhige Modellfiguren, Kinderkörper).
   o.flat: Gesäß flacher (Kundenwunsch von der ersten Figur: keine Gesäßform von hinten). Danach Normalen neu. */
function body(src, meshName, key, o = {}) {
  const { j, read } = src, m = j.meshes.find(x => x.name === meshName), p = m.primitives[0];
  const P0 = read(p.attributes.POSITION), J = read(p.attributes.JOINTS_0), W = read(p.attributes.WEIGHTS_0), I = read(p.indices);
  const names = j.skins[0].joints.map(i => j.nodes[i].name), remap = names.map(n => NAMES.indexOf(n));
  /* Punkte gleicher Lage zusammenlegen (Nähte), Nachbarn sammeln */
  const map = new Map(), keep = [], vmap = new Uint32Array(P0.length / 3);
  for (let v = 0; v < P0.length / 3; v++) {
    const k = [0, 1, 2].map(c => Math.round(P0[v * 3 + c] * 1e4)).join(',');
    if (!map.has(k)) { map.set(k, keep.length); keep.push(v); }
    vmap[v] = map.get(k);
  }
  const n = keep.length, P = new Float32Array(n * 3);
  keep.forEach((v, k) => P.set(P0.subarray(v * 3, v * 3 + 3), k * 3));
  const qi = new Uint16Array(I.length); for (let i = 0; i < I.length; i++) qi[i] = vmap[I[i]];
  const nb = Array.from({ length: n }, () => new Set());
  for (let t = 0; t < qi.length; t += 3) for (let a = 0; a < 3; a++) { const x = qi[t + a], y = qi[t + (a + 1) % 3]; if (x !== y) { nb[x].add(y); nb[y].add(x); } }
  const NBA = nb.map(s => [...s]);
  /* Flächen beruhigen: in Zonen (Höhe y0 bis y1, nur Rumpf |x| < 0,22) die Wölbung über zc hinaus auf den Anteil k zurücknehmen.
     side −1: hinten (Gesäß), +1: vorne (Brust). Weicher Übergang an den Zonenrändern. */
  for (const [y0, y1, zc, k, side] of o.flat || []) {
    for (let v = 0; v < n; v++) {
      const x = Math.abs(P[v * 3]), y = P[v * 3 + 1], z = P[v * 3 + 2];
      const w = Math.min(1, Math.max(0, (y - y0) / .05)) * Math.min(1, Math.max(0, (y1 - y) / .05)) * Math.min(1, Math.max(0, (.24 - x) / .05));
      if (w > 0 && (z - zc) * side > 0) P[v * 3 + 2] = zc + (z - zc) * (1 - (1 - k) * w);
    }
  }
  const step = f => { const Q = new Float32Array(P); for (let v = 0; v < n; v++) { const a = NBA[v]; if (!a.length) continue; for (let c = 0; c < 3; c++) { let s = 0; for (const u of a) s += Q[u * 3 + c]; P[v * 3 + c] = Q[v * 3 + c] + f * (s / a.length - Q[v * 3 + c]); } } };
  for (let it = 0; it < (o.smooth || 0); it++) { step(.5); step(-.53); }
  /* Normalen aus den Flächen, gewichtet nach Fläche */
  const Nn = new Float32Array(n * 3);
  for (let t = 0; t < qi.length; t += 3) {
    const [a, b, c] = [qi[t], qi[t + 1], qi[t + 2]];
    const e1 = [0, 1, 2].map(i => P[b * 3 + i] - P[a * 3 + i]), e2 = [0, 1, 2].map(i => P[c * 3 + i] - P[a * 3 + i]);
    const cr = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
    for (const x of [a, b, c]) for (let i = 0; i < 3; i++) Nn[x * 3 + i] += cr[i];
  }
  for (let v = 0; v < n; v++) { const l = Math.hypot(Nn[v * 3], Nn[v * 3 + 1], Nn[v * 3 + 2]) || 1; for (let i = 0; i < 3; i++) Nn[v * 3 + i] /= l; }
  const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
  for (let v = 0; v < n; v++) for (let c = 0; c < 3; c++) { lo[c] = Math.min(lo[c], P[v * 3 + c]); hi[c] = Math.max(hi[c], P[v * 3 + c]); }
  const sc = hi.map((h, c) => (h - lo[c]) / 65535 || 1);
  const qp = new Uint16Array(n * 3), qn = new Int8Array(n * 4), qj = new Uint8Array(n * 4), qw = new Uint8Array(n * 4);
  keep.forEach((v, k) => {
    for (let c = 0; c < 3; c++) { qp[k * 3 + c] = Math.round((P[k * 3 + c] - lo[c]) / sc[c]); qn[k * 4 + c] = Math.round(Nn[k * 3 + c] * 127); }
    let ws = [0, 1, 2, 3].map(c => W[v * 4 + c] * (W instanceof Float32Array ? 1 : 1 / 255)); const s = ws.reduce((a, b) => a + b, 0) || 1; ws = ws.map(x => x / s);
    const q = ws.map(x => Math.round(x * 255)); q[q.indexOf(Math.max(...q))] += 255 - q.reduce((a, b) => a + b, 0);
    for (let c = 0; c < 4; c++) { qj[k * 4 + c] = q[c] ? remap[J[v * 4 + c]] : 0; qw[k * 4 + c] = q[c]; }
  });
  /* o.share: gleiche Topologie wie ein schon geschriebener Körper (Kinderkörper aus dem Männerkörper): Knochen, Gewichte, Dreiecke von dort */
  const sh = o.share && parts.find(x => x.key === o.share);
  parts.push({ key, kind: 'body', n, tri: I.length, lo, sc, pos: push(qp), nor: push(qn), ...(sh ? { jnt: sh.jnt, wgt: sh.wgt, idx: sh.idx } : { jnt: push(qj), wgt: push(qw), idx: push(qi) }) });
  console.log('Körper', key, P0.length / 3, '→', n, 'Punkte,', I.length / 3, 'Dreiecke, Höhe', (hi[1] - lo[1]).toFixed(3));
}
const OPT = JSON.parse(process.env.FAM_OPT || '{}');
/* Zonen aus dem Seitenprofil (journey: Profil je 3 cm gemessen): Gesäß hinten, Brust vorne */
const SEAT_M = [.88, 1.1, -.12, .3, -1], SEAT_F = [.84, 1.08, -.112, .25, -1];
body(male, 'Sphere.005_Retopology.004', 'm', { smooth: 12, flat: [SEAT_M, [1.22, 1.38, .108, .5, 1]], ...OPT.m });
body(female, 'Superhero_Female', 'f', { smooth: 8, flat: [SEAT_F, [1.22, 1.4, .1, .2, 1]], ...OPT.f });
/* Kinderkörper: aus dem Männerkörper, stark geglättet (keine Muskeln); schmalere Schultern und kürzere Beine kommen aus dem Skelett */
body(male, 'Sphere.005_Retopology.004', 'k', { share: 'm', smooth: 18, flat: [SEAT_M, [1.22, 1.38, .1, .3, 1]], ...OPT.k });

/* Frisur: ganz am Kopfknochen, darum als festes Mesh im Raum des Kopfknochens (inverse Bindung des Kopfs angewandt) */
function hair(file, key) {
  const src = load(join(UBC, 'Hairstyles/Rigged to Head Bone/glTF (Godot -Unreal)', file + '.gltf')), { j, read } = src;
  const p = j.meshes[0].primitives[0], P = read(p.attributes.POSITION), Nn = read(p.attributes.NORMAL), I = read(p.indices);
  const names = j.skins[0].joints.map(i => j.nodes[i].name), k = names.indexOf('Head'), IB = read(j.skins[0].inverseBindMatrices), ib = [...IB.slice(k * 16, k * 16 + 16)];
  const n = P.length / 3, L = new Float32Array(n * 3), NL = new Float32Array(n * 3);
  for (let v = 0; v < n; v++) { const a = m4apply(ib, [P[v * 3], P[v * 3 + 1], P[v * 3 + 2]]), d = m4dir(ib, [Nn[v * 3], Nn[v * 3 + 1], Nn[v * 3 + 2]]), l = Math.hypot(...d) || 1; L.set(a, v * 3); NL.set(d.map(x => x / l), v * 3); }
  const lo = [0, 1, 2].map(c => Math.min(...Array.from({ length: n }, (_, v) => L[v * 3 + c]))), hi = [0, 1, 2].map(c => Math.max(...Array.from({ length: n }, (_, v) => L[v * 3 + c])));
  const sc = hi.map((h, c) => (h - lo[c]) / 65535 || 1), qp = new Uint16Array(n * 3), qn = new Int8Array(n * 4);
  for (let v = 0; v < n; v++) for (let c = 0; c < 3; c++) { qp[v * 3 + c] = Math.round((L[v * 3 + c] - lo[c]) / sc[c]); qn[v * 4 + c] = Math.round(NL[v * 3 + c] * 127); }
  parts.push({ key, kind: 'hair', n, tri: I.length, lo, sc, pos: push(qp), nor: push(qn), idx: push(new Uint16Array(I)) });
  console.log('Frisur', key, n, 'Punkte');
}
hair('Hair_SimpleParted', 'vater'); hair('Hair_Long', 'mutter'); hair('Hair_Buns', 'tochter'); hair('Hair_Buzzed', 'sohn');

/* ---------- Clips ---------- */
const UR = rig(ual);
function clip(name) {
  const { j, read } = ual, a = j.animations.find(x => x.name === name);
  const tr = {}; let dur = 0, frames = 0;
  a.channels.forEach(c => {
    const nm = j.nodes[c.target.node].name, s = a.samplers[c.sampler], t = read(s.input), v = read(s.output);
    dur = Math.max(dur, t[t.length - 1]); frames = Math.max(frames, t.length);
    (tr[nm] ||= {})[c.target.path] = { t, v };
  });
  /* Zeitraster 30 fps; Schleife: letzter Rahmen = erster */
  const F = Math.round(dur * 30), q = new Int16Array(F * NAMES.length * 4), pel = new Float32Array(F * 3);
  const sample = (ch, time, n) => {
    const { t, v } = ch; let i = 0; while (i < t.length - 2 && t[i + 1] < time) i++;
    const k = t[i + 1] > t[i] ? Math.min(1, Math.max(0, (time - t[i]) / (t[i + 1] - t[i]))) : 0;
    const A = [...v.slice(i * n, i * n + n)], B = [...v.slice((i + 1) * n, (i + 1) * n + n)];
    if (n === 4) { let d = A[0] * B[0] + A[1] * B[1] + A[2] * B[2] + A[3] * B[3]; if (d < 0) B.forEach((x, c) => { B[c] = -x; }); const r = A.map((x, c) => x + (B[c] - x) * k), l = Math.hypot(...r); return r.map(x => x / l); }
    return A.map((x, c) => x + (B[c] - x) * k);
  };
  for (let f = 0; f < F; f++) {
    const time = f / F * dur;
    NAMES.forEach((nm, b) => {
      const r = tr[nm]?.rotation ? sample(tr[nm].rotation, time, 4) : UR[b].r;
      for (let c = 0; c < 4; c++) q[(f * NAMES.length + b) * 4 + c] = Math.round(r[c] * 32767);
    });
    const pt = tr.pelvis?.translation ? sample(tr.pelvis.translation, time, 3) : UR[1].t;
    pel.set(pt, f * 3);
  }
  /* Schrittlänge: im Standbein bewegt sich der Fuß gegenüber dem Körper mit Gehtempo nach hinten.
     Vorwärtskinematik des Mannequins, Fußballen links, Geschwindigkeit in den tiefsten 35 % der Rahmen. */
  let stride = 0;
  if (name.startsWith('Walk')) {
    const ball = NAMES.indexOf('ball_l'), pos = [];
    for (let f = 0; f < F; f++) {
      const W = [];
      NAMES.forEach((nm, b) => {
        const r = Array.from(q.slice((f * NAMES.length + b) * 4, (f * NAMES.length + b) * 4 + 4), x => x / 32767), t = b === 1 ? [...pel.slice(f * 3, f * 3 + 3)] : UR[b].t, p = UR[b].p;
        W[b] = p < 0 ? { r: [...r], t } : { r: qmul(W[p].r, [...r]), t: qrot(W[p].r, t).map((x, c) => x + W[p].t[c]) };
      });
      pos.push(W[ball].t);
    }
    /* Welt (glTF): oben = y, vorne = +z (die Wurzel dreht schon um −90° um x) */
    const hs = pos.map(p => p[1]).slice().sort((a, b) => a - b), lim = hs[Math.floor(F * .35)];
    let sum = 0, cnt = 0;
    for (let f = 0; f < F; f++) { const g = (f + 1) % F; if (pos[f][1] <= lim && pos[g][1] <= lim) { sum += pos[f][2] - pos[g][2]; cnt++; } }
    const v = Math.abs(sum / cnt) * 30; stride = v * dur;
    console.log('Clip', name, 'Fußtempo', v.toFixed(3), 'm/s, Doppelschritt', stride.toFixed(3), 'm');
  }
  return { name, dur, F, rot: push(q), pel: push(pel), stride };
}
const walk = clip('Walk_Loop');
/* Stehen: die Idle-Clips der Bibliothek sind Spielhaltungen (breite Beine, Hände vor der Brust).
   Ruhiges Stehen ist der Mittelwert des Gangs je Knochen: Arme hängen, Füße beieinander. Atmen kommt zur Laufzeit dazu. */
function stand(w) {
  const NBn = NAMES.length, q = new Int16Array(NBn * 4), pel = new Float32Array(3);
  const src = new Int16Array(Uint8Array.from(blobsAt(w.rot, w.F * NBn * 4 * 2)).buffer), ps = new Float32Array(Uint8Array.from(blobsAt(w.pel, w.F * 3 * 4)).buffer);
  for (let b = 0; b < NBn; b++) {
    const ref = [0, 1, 2, 3].map(c => src[b * 4 + c] / 32767), acc = [0, 0, 0, 0];
    for (let f = 0; f < w.F; f++) { const o = (f * NBn + b) * 4, x = [0, 1, 2, 3].map(c => src[o + c] / 32767), sg = x.reduce((a, v, c) => a + v * ref[c], 0) < 0 ? -1 : 1; x.forEach((v, c) => { acc[c] += v * sg; }); }
    const l = Math.hypot(...acc); for (let c = 0; c < 4; c++) q[b * 4 + c] = Math.round(acc[c] / l * 32767);
  }
  for (let f = 0; f < w.F; f++) for (let c = 0; c < 3; c++) pel[c] += ps[f * 3 + c] / w.F;
  return { name: 'Stand', dur: 1, F: 1, rot: push(q), pel: push(pel), stride: 0 };
}
/* liest zurück, was push() schon in die Blobs geschrieben hat */
function blobsAt(o, len) { const all = Buffer.concat(blobs); return all.subarray(o, o + len); }
const CL = { walk, idle: process.env.FAM_IDLE ? clip(process.env.FAM_IDLE) : stand(walk) };

const head = {
  v: 1, src: 'Quaternius, Universal Base Characters + Universal Animation Library, CC0 1.0',
  bones: NAMES, parents: RIG.m.map(b => b.p),
  rigs: Object.fromEntries(Object.entries(RIG).map(([k, r]) => [k, { t: r.map(b => b.t), r: r.map(b => b.r), ib: r.map(b => b.ib) }])),
  ualPelvis: UR[1].t, parts, clips: CL
};
const js = Buffer.from(JSON.stringify(head)), jpad = (4 - js.length % 4) % 4;
const hdr = Buffer.alloc(8); hdr.write('GJF1', 0, 'ascii'); hdr.writeUInt32LE(js.length + jpad, 4);
const out = Buffer.concat([hdr, js, Buffer.alloc(jpad, 32), ...blobs]);
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, out);
/* Für die Website gepackt: framerusercontent liefert .bin ohne Kompression, der Browser entpackt mit DecompressionStream */
const gz = gzipSync(out, { level: 9 });
writeFileSync(OUT + '.gz', gz);
console.log('geschrieben', OUT, (out.length / 1024).toFixed(0) + ' KB, gepackt', (gz.length / 1024).toFixed(0) + ' KB');
