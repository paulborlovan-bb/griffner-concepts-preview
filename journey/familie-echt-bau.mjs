// Baut familie-echt.bin (und .gz für Framer): das Paar aus echten Menschen-Modellen.
// Quelle: Microsoft Rocketbox Avatar Library, MIT License (Copyright (c) 2020 Microsoft), github.com/microsoft/Microsoft-Rocketbox
//   Mann  Adults/Male_Adult_08   (Hemd hellblau → Sand, Jeans → Anthrazit; heruntergeladen am 2026-11-20)
//   Frau  Adults/Female_Adult_17 (Shirt grün → warmes Weiß, Jeans → Anthrazit)
// Runde 8 (2026-11-20, Kundenwunsch): ohne Kinder, zwei weiße Erwachsene, die sich an der Hand halten.
// Haare: Farbe und Deckkraft aus *_opacity_color.tga (RGBA), nicht mehr aus der Kopf-Textur.
// Aufruf: node familie-echt-bau.mjs <Ordner>   (im Ordner je Figur ein Unterordner <Name>/ mit <Name>.fbx und den *_color.tga)
//   Runde 9 (2026-11-20, schnell laden auf dem Telefon): Texturen als WebP. Zwei Dateien:
//   SIZE=512 OUT=familie-echt   node familie-echt-bau.mjs <Ordner>   (Desktop und Tablet)
//   SIZE=256 OUT=familie-echt-s node familie-echt-bau.mjs <Ordner>   (Telefon: das Paar ist dort kleiner im Bild, halbe Texturgröße reicht)
//   Umgefärbt wird immer auf 512 px, erst die Ausgabe wird verkleinert (gleiche Farben in beiden Dateien).
// Läuft in Chrome (playwright): FBX lesen (three FBXLoader), Punkte zusammenfassen und packen, Texturen verkleinern, umfärben, als JPEG/PNG.
// Die Lizenz (familie-echt-LIZENZ.txt, MIT) steht im Kopf der Datei (license).
// Format GJR1: 'GJR1', u32 Länge JSON, JSON, dann Binärblöcke (4-Byte ausgerichtet). Siehe familie-echt.js.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
const require = createRequire('/Users/paulborlovan/Claude/griffner-monitor/package.json');
const { chromium } = require('playwright');

const DL = process.argv[2];
if (!DL) { console.error('Aufruf: node familie-echt-bau.mjs <Ordner mit den Rocketbox-Dateien>'); process.exit(1); }
const here = new URL('.', import.meta.url).pathname;
const SIZE = +(process.env.SIZE || 512), OUT = process.env.OUT || 'familie-echt', MIME = process.env.MIME || 'image/webp', QUAL = +(process.env.QUAL || .85);

/* Wer: Datei, Texturkürzel, Umfärben (hue: Farbton-Bereich in Grad, sat: Mindestsättigung oder chroma: [ab, voll] in 0..255, maxL: hellere Punkte nicht,
   to: Zielfarbe, area: Bereich in UV 0..1 [x0,y0,x1,y1] (ohne hue und sat: alles im Bereich), lr: feste Bezugshelligkeit statt Median,
   k: wie stark die Helligkeitsunterschiede bleiben (Falten, Aufdruck)) */
const PEOPLE = [
  /* GRIFFNER Farben: Sand #CFC3B3, Anthrazit #444442, Gelb #FFB200, Salbei #8B907C, Weiß */
  { key: 'vater', file: 'Male_Adult_08', tex: 'm014', recolor: [
    /* Hemd → Sand: Mittelteil (bis über den Schuhen) und Ärmel, nur bläuliche, nicht ganz dunkle Punkte (Haut, Knöpfe, Schuhe bleiben) */
    ...[[.3, 0, .7, .86], [0, .43, .3, .74], [.7, .43, 1, .74]].map(area => ({ hue: [170, 250], sat: .05, minL: 40, to: [207, 195, 179], k: .62, area })),
    /* Kragen (Streifen unten in der Mitte, neben den Schuhen nur die obere Kante) → Sand */
    ...[[.42, .86, .58, .9], [.32, .84, .42, .905], [.58, .84, .68, .905]].map(area => ({ hue: [170, 250], sat: .05, minL: 40, to: [207, 195, 179], k: .62, lr: .62, area })),
    /* darunter, im Ausschnitt sichtbar: ein Shirt in warmem Weiß */
    { to: [236, 232, 224], k: .5, minL: 40, area: [.43, .9, .57, .99] },
    /* Jeans → Anthrazit */
    ...[[0, 0, .3, .43], [.7, 0, 1, .43]].map(area => ({ to: [74, 74, 72], k: .35, area }))
  ], opacity: true },
  { key: 'mutter', file: 'Female_Adult_17', tex: 'f006', recolor: [
    { hue: [95, 185], sat: .14, to: [236, 232, 224], k: .75 },
    /* Jeans → Anthrazit */
    ...[[0, .55, .34, 1], [.66, .55, 1, 1]].map(area => ({ to: [70, 70, 68], k: .35, area })),
    /* Ballerinas: sie sind hautfarben (Ferse und Rist) mit hellem Rand, von hinten sehen die Füße nackt aus. Ferse, Rist und Rand → dunkles Taupe wie die Sohle */
    ...[[.185, .17, .305, .29], [.695, .17, .815, .29]].map(area => ({ hue: [0, 50], sat: .1, to: [84, 72, 66], k: .35, lr: .62, area })),
    ...[[.16, 0, .33, .33], [.67, 0, .84, .33]].map(area => ({ maxS: .2, minL: 105, to: [84, 72, 66], k: .3, lr: .78, area }))
  ], opacity: true }
];

const LIZENZ = readFileSync(here + 'familie-echt-LIZENZ.txt', 'utf8');
/* Probe: REC_<key>='[...]' ersetzt die Umfärbe-Regeln einer Figur (zum Ausprobieren von Bereichen) */
PEOPLE.forEach(P => { const e = process.env['REC_' + P.key]; if (e) P.recolor = JSON.parse(e); });
const PAGE = `<!doctype html><script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"}}</script>
<script type="module">
import * as T from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { TGALoader } from 'three/addons/loaders/TGALoader.js';
const PEOPLE = ${JSON.stringify(PEOPLE)};
const mgr = new T.LoadingManager(); mgr.setURLModifier(u => /\\.(tga|png|jpg)$/i.test(u) ? 'data:image/gif;base64,R0lGODlhAQABAAAAACw=' : u);
const chunks = []; let off = 0;
const put = (u8) => { const o = off; chunks.push(u8); off += u8.byteLength; const pad = (4 - off % 4) % 4; if (pad) { chunks.push(new Uint8Array(pad)); off += pad; } return o; };
const tga = new TGALoader();
const OUTSZ = ${SIZE}, MIME = ${JSON.stringify(MIME)}, QL = ${QUAL};
/* Ausgabe: auf OUTSZ verkleinern (hohe Glättung) und als MIME kodieren (WebP: rund ein Drittel kleiner als JPEG bei gleichem Bild) */
const enc = async cv => { let c = cv; if (c.width > OUTSZ) { const d = document.createElement('canvas'); d.width = d.height = OUTSZ; const x = d.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(c, 0, 0, OUTSZ, OUTSZ); c = d; } return new Uint8Array(await (await new Promise(res => c.toBlob(res, MIME, QL))).arrayBuffer()); };

/* Textur: TGA lesen, auf size verkleinern (zweistufig, weich), umfärben, als JPEG (oder PNG mit Alpha) */
async function texture(url, size, recolor = [], alphaUrl = null) {
  const t = await tga.loadAsync(url), { data, width, height } = t.image;
  const c = document.createElement('canvas'); c.width = width; c.height = height;
  c.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(data.buffer, data.byteOffset, data.length), width, height), 0, 0);
  let src = c, w = width;
  while (w / 2 >= size) { const d = document.createElement('canvas'); d.width = d.height = w / 2; const x = d.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(src, 0, 0, w / 2, w / 2); src = d; w /= 2; }
  const ctx = src.getContext('2d'), img = ctx.getImageData(0, 0, size, size), p = img.data;
  for (const r of recolor) {
    /* Maske: Farbton im Bereich, Sättigung über der Schwelle, im UV-Bereich; weicher Rand über die Sättigung */
    const m = new Float32Array(size * size), L = [];
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const i = y * size + x, R = p[i * 4] / 255, G = p[i * 4 + 1] / 255, B = p[i * 4 + 2] / 255;
      if (r.area) { const u = x / size, v = y / size; if (u < r.area[0] || u > r.area[2] || v < r.area[1] || v > r.area[3]) continue; }
      const mx = Math.max(R, G, B), mn = Math.min(R, G, B), s = mx ? (mx - mn) / mx : 0;
      if (r.maxL && mx * 255 > r.maxL) continue;
      if (r.minL && mx * 255 < r.minL) continue;
      let k = 1;
      if (r.hue) {
        if (mx - mn < 1e-3) continue;
        let h = mx === R ? (G - B) / (mx - mn) : mx === G ? 2 + (B - R) / (mx - mn) : 4 + (R - G) / (mx - mn); h = (h * 60 + 360) % 360;
        if (h < r.hue[0] || h > r.hue[1]) continue;
      } else if (mx < 8 / 255) continue;
      if (r.chroma) k = Math.min(1, Math.max(0, ((mx - mn) * 255 - r.chroma[0]) / (r.chroma[1] - r.chroma[0])));
      else if (r.sat !== undefined) k = Math.min(1, Math.max(0, (s - r.sat) / .08));
      if (r.maxS !== undefined) k = Math.min(k, Math.max(0, (r.maxS - s) / .06));
      if (k <= 0) continue;
      m[i] = k; L.push(.299 * R + .587 * G + .114 * B);
    }
    if (!L.length) continue;
    L.sort((a, b) => a - b); const Lr = r.lr || L[Math.floor(L.length / 2)];
    for (let i = 0; i < size * size; i++) if (m[i] > 0) {
      const R = p[i * 4] / 255, G = p[i * 4 + 1] / 255, B = p[i * 4 + 2] / 255, l = .299 * R + .587 * G + .114 * B;
      const f = (Lr + (l - Lr) * r.k) / Lr;
      for (let c2 = 0; c2 < 3; c2++) p[i * 4 + c2] = p[i * 4 + c2] + (Math.min(255, r.to[c2] * f) - p[i * 4 + c2]) * m[i];
    }
  }
  if (alphaUrl === 'self') {
    /* eigene Deckkraft (RGBA-Textur): zwei JPEG, Farbe und Deckkraft (kleiner als ein PNG mit Alpha). Durchsichtige Stellen bekommen
       die mittlere Haarfarbe (sonst dunkle Ränder an den Strähnen), die Deckkraft wird ein Graubild (familie-echt.js: alphaMap) */
    let mr = 0, mg = 0, mb = 0, mn = 0;
    for (let i = 0; i < size * size; i++) if (p[i * 4 + 3] > 200) { mr += p[i * 4]; mg += p[i * 4 + 1]; mb += p[i * 4 + 2]; mn++; }
    mn = mn || 1; mr /= mn; mg /= mn; mb /= mn;
    const A = new Uint8ClampedArray(size * size * 4);
    for (let i = 0; i < size * size; i++) {
      const a = p[i * 4 + 3] / 255;
      p[i * 4] = p[i * 4] * a + mr * (1 - a); p[i * 4 + 1] = p[i * 4 + 1] * a + mg * (1 - a); p[i * 4 + 2] = p[i * 4 + 2] * a + mb * (1 - a); p[i * 4 + 3] = 255;
      A[i * 4] = A[i * 4 + 1] = A[i * 4 + 2] = a * 255; A[i * 4 + 3] = 255;
    }
    const jpg = async im => { const c2 = document.createElement('canvas'); c2.width = c2.height = size; c2.getContext('2d').putImageData(im, 0, 0); return enc(c2); };
    return { color: await jpg(img), alpha: await jpg(new ImageData(A, size, size)) };
  } else if (alphaUrl) {
    const a = await tga.loadAsync(alphaUrl), ad = a.image.data, aw = a.image.width;
    const ac = document.createElement('canvas'); ac.width = ac.height = aw;
    ac.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(ad.buffer, ad.byteOffset, ad.length), aw, aw), 0, 0);
    const d = document.createElement('canvas'); d.width = d.height = size; const x = d.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(ac, 0, 0, size, size);
    const A = x.getImageData(0, 0, size, size).data; for (let i = 0; i < size * size; i++) p[i * 4 + 3] = A[i * 4];
  }
  ctx.putImageData(img, 0, 0);
  const out = document.createElement('canvas'); out.width = out.height = size; out.getContext('2d').drawImage(src, 0, 0);
  if (!alphaUrl) return enc(out);
  const blob = await new Promise(res => out.toBlob(res, 'image/png'));
  return new Uint8Array(await blob.arrayBuffer());
}

const head = { license: ${JSON.stringify(LIZENZ)}, people: [], tex: [] };
for (const P of PEOPLE) {
  const o = await new FBXLoader(mgr).loadAsync('http://rb.local/dl/' + P.file + '/' + P.file + '.fbx');
  o.updateMatrixWorld(true);
  let sm = null; o.traverse(c => { if (c.isSkinnedMesh && !sm) sm = c; });
  const sk = sm.skeleton, bones = sk.bones, NB = bones.length;
  /* Pose beim Laden = Bindungspose? (inverse Bindung mal Welt = Einheit) */
  let dev = 0; bones.forEach((b, i) => { const m = new T.Matrix4().multiplyMatrices(b.matrixWorld, sk.boneInverses[i]); const e = m.elements; [0,5,10,15].forEach(j => dev = Math.max(dev, Math.abs(e[j] - 1))); [12,13,14].forEach(j => dev = Math.max(dev, Math.abs(e[j]) / 100)); });
  const g = sm.geometry, pos = g.attributes.position, nor = g.attributes.normal, uv = g.attributes.uv, si = g.attributes.skinIndex, sw = g.attributes.skinWeight;
  const mats = [].concat(sm.material);
  /* Punkte zusammenfassen (je Material in Reihenfolge), Gewichte auf 4 Byte */
  const keyOf = v => [pos.getX(v).toFixed(3), pos.getY(v).toFixed(3), pos.getZ(v).toFixed(3), nor.getX(v).toFixed(2), nor.getY(v).toFixed(2), nor.getZ(v).toFixed(2), uv.getX(v).toFixed(4), uv.getY(v).toFixed(4)].join(',');
  const map = new Map(), verts = [], idx = [], groups = [];
  for (let mi = 0; mi < mats.length; mi++) {
    const start = idx.length;
    g.groups.filter(gr => gr.materialIndex === mi).forEach(gr => { for (let v = gr.start; v < gr.start + gr.count; v++) { const k = keyOf(v); let n = map.get(k); if (n === undefined) { n = verts.length; map.set(k, n); verts.push(v); } idx.push(n); } });
    if (idx.length > start) groups.push([start, idx.length - start, mi]);
  }
  const n = verts.length, lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9], ulo = [1e9, 1e9], uhi = [-1e9, -1e9];
  verts.forEach(v => { [pos.getX(v), pos.getY(v), pos.getZ(v)].forEach((x, c) => { lo[c] = Math.min(lo[c], x); hi[c] = Math.max(hi[c], x); }); [uv.getX(v), uv.getY(v)].forEach((x, c) => { ulo[c] = Math.min(ulo[c], x); uhi[c] = Math.max(uhi[c], x); }); });
  const sc = lo.map((l, c) => (hi[c] - l) / 65535 || 1), usc = ulo.map((l, c) => (uhi[c] - l) / 65535 || 1);
  const QP = new Uint16Array(n * 3), QN = new Int8Array(n * 4), QU = new Uint16Array(n * 2), J = new Uint8Array(n * 4), W = new Uint8Array(n * 4);
  verts.forEach((v, i) => {
    [pos.getX(v), pos.getY(v), pos.getZ(v)].forEach((x, c) => { QP[i * 3 + c] = Math.round((x - lo[c]) / sc[c]); });
    const nn = new T.Vector3(nor.getX(v), nor.getY(v), nor.getZ(v)).normalize(); QN[i * 4] = Math.round(nn.x * 127); QN[i * 4 + 1] = Math.round(nn.y * 127); QN[i * 4 + 2] = Math.round(nn.z * 127);
    [uv.getX(v), uv.getY(v)].forEach((x, c) => { QU[i * 2 + c] = Math.round((x - ulo[c]) / usc[c]); });
    const ws = [0, 1, 2, 3].map(c => [si.getComponent(v, c), sw.getComponent(v, c)]).sort((a, b) => b[1] - a[1]);
    const tot = ws.reduce((s, x) => s + x[1], 0) || 1; let acc = 0;
    ws.forEach(([j, w], c) => { J[i * 4 + c] = j; const q = c < 3 ? Math.round(w / tot * 255) : 255 - acc; W[i * 4 + c] = Math.max(0, q); acc += W[i * 4 + c]; });
  });
  const I = n < 65536 ? new Uint16Array(idx) : new Uint32Array(idx);
  /* Knochen: Name ohne BipNN_, Eltern (Index, -1 = Wurzel), Lage in der Bindungspose als Welt-Lage (Position, Drehung, Maßstab) im Modell,
     inverse Bindung. Lokale Lagen rechnet familie-echt.js daraus (die Wurzeln der vier Dateien hängen verschieden). */
  const name = b => b.name.replace(/^Bip0\\d_?/, '') || 'Root';
  const parents = bones.map(b => bones.indexOf(b.parent));
  const ib = new Float32Array(NB * 16); sk.boneInverses.forEach((m, i) => ib.set(m.elements, i * 16));
  const t = [], r = [], s = [];
  bones.forEach(b => { const P3 = new T.Vector3(), Q = new T.Quaternion(), S3 = new T.Vector3(); b.matrixWorld.decompose(P3, Q, S3); t.push(P3.toArray().map(x => +x.toFixed(4))); r.push(Q.toArray().map(x => +x.toFixed(6))); s.push(S3.toArray().map(x => +x.toFixed(5))); });
  const meshM = sm.matrixWorld.toArray(), bindM = sm.bindMatrix.toArray();
  /* Texturen */
  const texIdx = [];
  for (const part of ['body', 'head']) {
    const u8 = await texture('http://rb.local/dl/' + P.file + '/' + P.tex + '_' + part + '_color.tga', part === 'body' ? 512 : 512, part === 'body' ? P.recolor : []);
    texIdx.push(head.tex.length); head.tex.push({ off: put(u8), len: u8.byteLength, type: MIME });
  }
  if (P.opacity) {
    /* Haare, Wimpern, Brauen: Farbe und Deckkraft aus der eigenen RGBA-Textur */
    const { color, alpha } = await texture('http://rb.local/dl/' + P.file + '/' + P.tex + '_opacity_color.tga', 512, [], 'self');
    texIdx.push(head.tex.length); head.tex.push({ off: put(color), len: color.byteLength, type: MIME });
    texIdx.push(head.tex.length); head.tex.push({ off: put(alpha), len: alpha.byteLength, type: MIME, linear: true });
  }
  const matInfo = mats.map(m => ({ name: m.name, tex: /head/.test(m.name) ? texIdx[1] : /opacity/.test(m.name) ? texIdx[2] : texIdx[0], alpha: /opacity/.test(m.name), ...(/opacity/.test(m.name) ? { amap: texIdx[3] } : {}) }));
  console.log(P.key, 'Punkte', n, 'Dreiecke', idx.length / 3, 'Knochen', NB, 'Bindung', dev.toFixed(4), 'Materialien', JSON.stringify(matInfo), 'Maßstab', JSON.stringify([...new Set(s.flat().map(x=>x.toFixed(2)))]), 'Netz', JSON.stringify(meshM.map(x => +x.toFixed(3))), 'Bind', JSON.stringify(bindM.map(x => +x.toFixed(3))));
  head.people.push({ key: P.key, n, tri: idx.length / 3, lo, sc, ulo, usc, groups, mats: matInfo, bones: bones.map(name), parents, t, r, s, meshM, bindM,
    pos: put(new Uint8Array(QP.buffer)), nor: put(new Uint8Array(QN.buffer)), uv: put(new Uint8Array(QU.buffer)), jnt: put(J), wgt: put(W), idx: put(new Uint8Array(I.buffer)), i32: I.BYTES_PER_ELEMENT === 4, ib: put(new Uint8Array(ib.buffer)) });
}
const js = new TextEncoder().encode(JSON.stringify(head)), jl = js.byteLength + (4 - js.byteLength % 4) % 4;
const out = new Uint8Array(8 + jl + off); out.set([71, 74, 82, 49]); new DataView(out.buffer).setUint32(4, jl, true); out.set(js, 8); out.fill(32, 8 + js.byteLength, 8 + jl);
let o2 = 8 + jl; chunks.forEach(c => { out.set(c, o2); o2 += c.byteLength; });
await fetch('http://rb.local/out/familie-echt.bin', { method: 'POST', body: out });
window.__done = 1;
</script>`;

const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage();
p.on('console', m => { const t = m.text(); if (!/TGA loader not found/.test(t)) console.log(t); });
p.on('pageerror', e => console.log('[Fehler]', e.message));
let bin = null;
await p.route('http://rb.local/**', async r => {
  const path = decodeURIComponent(new URL(r.request().url()).pathname);
  if (r.request().method() === 'POST') { bin = r.request().postDataBuffer(); return r.fulfill({ status: 200, body: 'ok' }); }
  if (path === '/bau.html') return r.fulfill({ status: 200, body: PAGE, contentType: 'text/html' });
  try { r.fulfill({ status: 200, body: readFileSync(DL + '/' + path.replace(/^\/dl\//, '')), contentType: 'application/octet-stream' }); } catch { r.fulfill({ status: 404, body: '' }); }
});
await p.goto('http://rb.local/bau.html');
await p.waitForFunction(() => window.__done, null, { timeout: 300000 });
await b.close();
writeFileSync(here + OUT + '.bin', bin);
/* DUMP=<Ordner>: Texturen zum Ansehen ablegen */
if (process.env.DUMP) { const dv = new DataView(bin.buffer, bin.byteOffset), jl = dv.getUint32(4, true), H = JSON.parse(bin.subarray(8, 8 + jl).toString()); H.tex.forEach((t, i) => writeFileSync(process.env.DUMP + '/tex' + i + (t.linear ? 'a' : '') + ('.' + t.type.split('/')[1].replace('jpeg', 'jpg')), bin.subarray(8 + jl + t.off, 8 + jl + t.off + t.len))); }
const gz = gzipSync(bin, { level: 9 }); writeFileSync(here + OUT + '.bin.gz', gz);
console.log('geschrieben ' + OUT + '.bin', (bin.length / 1024).toFixed(0), 'KB, gepackt', (gz.length / 1024).toFixed(0), 'KB');
