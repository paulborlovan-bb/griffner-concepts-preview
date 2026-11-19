// Baut gang-daten.js: ein echter menschlicher Gang (Bewegungsaufnahme) als Richtungen der Körperteile, für die eigenen Figuren der Familie.
// Quelle: Quaternius, Universal Animation Library [Standard], Clip Walk_Loop (oder CLIP=...), CC0 1.0 (gemeinfrei, kommerziell frei).
// Aufruf: node gang-bau.mjs <UAL1_Standard.glb>        (heruntergeladen am 2026-11-19 von quaternius.itch.io)
// Ergebnis: je Bild (30 fps, eine Gangrunde = zwei Schritte) die Richtungen von Oberschenkel, Unterschenkel, Fuß, Oberarm, Unterarm (links, rechts),
// die Lage von Becken und Brust (rechts- und oben-Vektor) und die Kopfrichtung, im Körper (vorne = −z, rechts = +x, oben = +y).
// Längen werden nicht übernommen: die Figuren haben eigene Maße. Dazu die Schrittlänge je Beinlänge (damit nichts rutscht).
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = process.argv[2], CLIP = process.env.CLIP || 'Walk_Loop';
if (!FILE) { console.error('Aufruf: node gang-bau.mjs <UAL1_Standard.glb>'); process.exit(1); }
const b = readFileSync(FILE), jl = b.readUInt32LE(12), j = JSON.parse(b.subarray(20, 20 + jl).toString('utf8'));
const bo = 20 + jl, bin = b.subarray(bo + 8, bo + 8 + b.readUInt32LE(bo));
const read = i => {
  const a = j.accessors[i], bv = j.bufferViews[a.bufferView], n = { SCALAR: 1, VEC3: 3, VEC4: 4 }[a.type];
  if (a.componentType !== 5126) throw 'nur float: ' + a.componentType;
  const off = (bv.byteOffset || 0) + (a.byteOffset || 0), st = bv.byteStride || n * 4, out = new Float64Array(a.count * n);
  for (let k = 0; k < a.count; k++) for (let c = 0; c < n; c++) out[k * n + c] = bin.readFloatLE(off + k * st + c * 4);
  return out;
};

/* Mathematik: Quaternion [x,y,z,w], Matrix spaltenweise 4x4 */
const qmul = (a, b) => [a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1], a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0], a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3], a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]];
const qrot = (q, v) => { const p = qmul(qmul(q, [v[0], v[1], v[2], 0]), [-q[0], -q[1], -q[2], q[3]]); return [p[0], p[1], p[2]]; };
const sub = (a, c) => a.map((x, i) => x - c[i]), len = v => Math.hypot(...v), nrm = v => { const l = len(v) || 1; return v.map(x => x / l); };
const cross = (a, c) => [a[1] * c[2] - a[2] * c[1], a[2] * c[0] - a[0] * c[2], a[0] * c[1] - a[1] * c[0]];

const parent = {}; j.nodes.forEach((n, i) => (n.children || []).forEach(c => { parent[c] = i; }));
const idx = nm => { const i = j.nodes.findIndex(n => n.name === nm); if (i < 0) throw 'Knochen fehlt: ' + nm; return i; };
const anim = j.animations.find(a => a.name === CLIP); if (!anim) throw 'Clip fehlt: ' + CLIP;
const ch = {}; let dur = 0;
anim.channels.forEach(c => { const s = anim.samplers[c.sampler], t = read(s.input); dur = Math.max(dur, t[t.length - 1]); (ch[c.target.node] ||= {})[c.target.path] = { t, v: read(s.output) }; });
const sample = (c, time, n) => {
  const { t, v } = c; let i = 0; while (i < t.length - 2 && t[i + 1] < time) i++;
  const k = t[i + 1] > t[i] ? Math.min(1, Math.max(0, (time - t[i]) / (t[i + 1] - t[i]))) : 0;
  const A = [...v.slice(i * n, i * n + n)], B = [...v.slice((i + 1) * n, (i + 1) * n + n)];
  if (n === 4) { if (A[0] * B[0] + A[1] * B[1] + A[2] * B[2] + A[3] * B[3] < 0) B.forEach((x, c2) => { B[c2] = -x; }); const r = A.map((x, c2) => x + (B[c2] - x) * k), l = Math.hypot(...r); return r.map(x => x / l); }
  return A.map((x, c2) => x + (B[c2] - x) * k);
};
/* Welt-Lage eines Knotens zur Zeit time (Skalen der Knoten werden mitgenommen) */
function world(i, time, memo) {
  if (memo[i]) return memo[i];
  const n = j.nodes[i], c = ch[i] || {};
  const r = c.rotation ? sample(c.rotation, time, 4) : n.rotation || [0, 0, 0, 1];
  const t = c.translation ? sample(c.translation, time, 3) : n.translation || [0, 0, 0];
  const s = c.scale ? sample(c.scale, time, 3) : n.scale || [1, 1, 1];
  let w;
  if (parent[i] === undefined) w = { r, t, s };
  else { const p = world(parent[i], time, memo); w = { r: qmul(p.r, r), t: qrot(p.r, t.map((x, k) => x * p.s[k])).map((x, k) => x + p.t[k]), s: s.map((x, k) => x * p.s[k]) }; }
  return (memo[i] = w);
}
/* glTF: oben +y, Figur schaut nach +z. Unsere Figuren schauen nach −z: um 180° um y drehen */
const P = (nm, time, memo) => { const p = world(idx(nm), time, memo).t; return [-p[0], p[1], -p[2]]; };

const F = Math.round(dur * 30), r3 = v => v.map(x => Math.round(x * 1000) / 1000);
const D = { thL: [], shL: [], ftL: [], thR: [], shR: [], ftR: [], uaL: [], faL: [], uaR: [], faR: [], pr: [], pu: [], cr: [], cu: [], hd: [] };
const ballZ = [], ballY = [];
let legLen = 0;
for (let f = 0; f < F; f++) {
  const time = f / F * dur, m = {}, p = nm => P(nm, time, m);
  const hipL = p('thigh_l'), kneeL = p('calf_l'), ankL = p('foot_l'), balL = p('ball_l');
  const hipR = p('thigh_r'), kneeR = p('calf_r'), ankR = p('foot_r'), balR = p('ball_r');
  const shL = p('upperarm_l'), elL = p('lowerarm_l'), wrL = p('hand_l'), shR = p('upperarm_r'), elR = p('lowerarm_r'), wrR = p('hand_r');
  const pel = p('pelvis'), sp1 = p('spine_01'), sp3 = p('spine_03'), nk = p('neck_01'), hd = p('Head');
  if (!f) legLen = len(sub(kneeL, hipL)) + len(sub(ankL, kneeL));
  D.thL.push(nrm(sub(kneeL, hipL))); D.shL.push(nrm(sub(ankL, kneeL))); D.ftL.push(nrm(sub(balL, ankL)));
  D.thR.push(nrm(sub(kneeR, hipR))); D.shR.push(nrm(sub(ankR, kneeR))); D.ftR.push(nrm(sub(balR, ankR)));
  D.uaL.push(nrm(sub(elL, shL))); D.faL.push(nrm(sub(wrL, elL))); D.uaR.push(nrm(sub(elR, shR))); D.faR.push(nrm(sub(wrR, elR)));
  /* Becken: rechts = Hüfte rechts minus links, oben = Becken zur Brust; Brust: rechts = Schulter rechts minus links, oben = Brust zum Hals */
  const pr = nrm(sub(hipR, hipL)), pu = nrm(sub(sp3, pel)), cr = nrm(sub(shR, shL)), cu = nrm(sub(nk, sp1));
  D.pr.push(pr); D.pu.push(nrm(cross(cross(pr, pu), pr))); D.cr.push(cr); D.cu.push(nrm(cross(cross(cr, cu), cr)));
  D.hd.push(nrm(sub(hd, nk)));
  ballZ.push(balL[2]); ballY.push(balL[1]);
}
/* Oben-Vektoren zeigen nach oben (Vorzeichen prüfen) */
['pu', 'cu'].forEach(k => D[k].forEach((v, i) => { if (v[1] < 0) D[k][i] = v.map(x => -x); }));
/* Schrittlänge: im Stand bewegt sich der Fußballen relativ zum Körper mit Gehtempo nach hinten (+z) */
const hs = ballY.slice().sort((a, c) => a - c), lim = hs[Math.floor(F * .35)];
let sum = 0, cnt = 0;
for (let f = 0; f < F; f++) { const g = (f + 1) % F; if (ballY[f] <= lim && ballY[g] <= lim) { sum += ballZ[g] - ballZ[f]; cnt++; } }
const stride = Math.abs(sum / cnt) * F;
console.log(CLIP, 'Bilder', F, 'Dauer', dur.toFixed(3), 's, Beinlänge', legLen.toFixed(3), ', Doppelschritt', stride.toFixed(3), '=', (stride / legLen).toFixed(3), 'Beinlängen');

const out = `/* ERZEUGT von gang-bau.mjs aus Quaternius Universal Animation Library [Standard], Clip ${CLIP}, CC0 1.0 (gemeinfrei). Nicht von Hand ändern.
   Je Bild (30 fps, eine Gangrunde) Richtungen der Körperteile im Körper (vorne −z, rechts +x, oben +y), flach: x,y,z je Bild.
   th Oberschenkel, sh Unterschenkel, ft Fuß (Knöchel zum Ballen), ua Oberarm, fa Unterarm; L links, R rechts.
   pr/pu Becken rechts/oben, cr/cu Brust rechts/oben, hd Hals zum Kopf. stride: Doppelschritt in Beinlängen. */
export const GANG = ${JSON.stringify({ F, dur: Math.round(dur * 1000) / 1000, stride: Math.round(stride / legLen * 1000) / 1000, ...Object.fromEntries(Object.entries(D).map(([k, v]) => [k, v.flatMap(r3)])) })};
`;
writeFileSync(new URL('./gang-daten.js', import.meta.url), out);
console.log('geschrieben gang-daten.js', (out.length / 1024).toFixed(1), 'KB');
