/* Runde 35: Oberflächen für den realistischen Grundriss (js/grundriss.js), alles im Browser gemalt, nichts zu laden.
   Bodenbild je Geschoß: Eichendielen, Fliesen, Estrich, Terrassenplatten, Holzdeck, Teppiche, dazu weiche Schatten an den
   Wandfüßen und unter den Möbeln (wie Umgebungsverdeckung, nur einmal gemalt). Dazu kachelnde Bilder für Stein- und
   Lärchenfassade, Blechdach und Kies. Zufall mit festem Samen: jedes Laden sieht gleich aus. */

/* Runde 39: am Telefon weniger Pixel je Meter (Speicher), sonst 100 */
export let PPM = 100;
export const setPPM = v => { PPM = v; };

export function rng(seed = 7) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const hsl = (h, s, l, a = 1) => `hsla(${h.toFixed(1)},${s.toFixed(1)}%,${l.toFixed(1)}%,${a})`;
const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; };

/* ---------- Böden ---------- */

/* Eichendielen, längs nach Norden; w, h in px, Breite einer Diele 19 cm */
function oak(x, R, X0, Y0, W, H, light = 0) {
  const pw = .21 * PPM;
  for (let px = X0 - (X0 % pw); px < X0 + W; px += pw) {
    let py = Y0 - R() * 2.2 * PPM;
    while (py < Y0 + H) {
      const len = (1.6 + R() * 1.6) * PPM;
      const l = 42 + R() * 6 + light, s = 20 + R() * 8, hu = 27 + R() * 5;
      x.fillStyle = hsl(hu, s, l); x.fillRect(px, py, pw, len);
      /* Maserung */
      for (let g = 0; g < 7; g++) {
        const gx = px + 1 + R() * (pw - 2), a = .05 + R() * .08;
        x.strokeStyle = hsl(hu - 4, s + 6, l - 18, a); x.lineWidth = .6 + R() * .9;
        x.beginPath(); x.moveTo(gx, py);
        const k = 3 + Math.floor(R() * 3);
        for (let i = 1; i <= k; i++) x.lineTo(gx + (R() - .5) * 2.2, py + len * i / k);
        x.stroke();
      }
      if (R() < .12) { x.fillStyle = hsl(hu - 6, s + 10, l - 26, .28); x.beginPath(); x.ellipse(px + pw * (.3 + R() * .4), py + len * R(), 1.6, 3.2, 0, 0, Math.PI * 2); x.fill(); }
      x.fillStyle = 'rgba(40,26,14,.38)'; x.fillRect(px, py, pw, 1.1);
      py += len;
    }
    x.fillStyle = 'rgba(40,26,14,.32)'; x.fillRect(px, Y0, 1.1, H);
  }
}
/* Fichte (Sauna): schmal und hell */
function spruce(x, R, X0, Y0, W, H) {
  const pw = .1 * PPM;
  for (let px = X0; px < X0 + W; px += pw) {
    x.fillStyle = hsl(38 + R() * 4, 48 + R() * 8, 78 + R() * 5); x.fillRect(px, Y0, pw, H);
    x.fillStyle = 'rgba(120,90,50,.25)'; x.fillRect(px, Y0, 1, H);
    for (let g = 0; g < 3; g++) { x.fillStyle = 'rgba(150,110,60,.08)'; x.fillRect(px + R() * pw, Y0, .8, H); }
  }
}
/* Großformatige Fliesen 60 cm, hell */
function tiles(x, R, X0, Y0, W, H, size = .6) {
  const t = size * PPM;
  for (let py = Y0 - (Y0 % t); py < Y0 + H; py += t) for (let px = X0 - (X0 % t); px < X0 + W; px += t) {
    x.fillStyle = hsl(35, 4 + R() * 3, 60 + R() * 5); x.fillRect(px, py, t, t);
    for (let i = 0; i < 14; i++) { x.fillStyle = `rgba(${R() < .5 ? '255,255,255' : '90,85,78'},${.05 + R() * .06})`; x.fillRect(px + R() * t, py + R() * t, 2 + R() * 6, 2 + R() * 6); }
  }
  x.fillStyle = 'rgba(70,66,60,.7)';
  for (let py = Y0 - (Y0 % t); py < Y0 + H; py += t) x.fillRect(X0, py - .7, W, 1.4);
  for (let px = X0 - (X0 % t); px < X0 + W; px += t) x.fillRect(px - .7, Y0, 1.4, H);
}
/* Estrich, geschliffen (Garage, Technik, Abstellraum) */
function concrete(x, R, X0, Y0, W, H) {
  x.fillStyle = '#8f8c86'; x.fillRect(X0, Y0, W, H);
  for (let i = 0; i < W * H / 900; i++) {
    const r = 12 + R() * 70; const cx = X0 + R() * W, cy = Y0 + R() * H;
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
    const d = R() < .5; g.addColorStop(0, d ? 'rgba(90,86,80,.07)' : 'rgba(255,255,255,.08)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  for (let i = 0; i < W * H / 60; i++) { x.fillStyle = `rgba(${R() < .5 ? '60,58,55' : '250,250,248'},${.05 + R() * .07})`; x.fillRect(X0 + R() * W, Y0 + R() * H, 1 + R() * 1.6, 1 + R() * 1.6); }
  x.strokeStyle = 'rgba(80,76,70,.22)'; x.lineWidth = 1.2;
  for (let px = X0 + 3 * PPM; px < X0 + W; px += 3 * PPM) { x.beginPath(); x.moveTo(px, Y0); x.lineTo(px, Y0 + H); x.stroke(); }
}
/* Terrassenplatten 60 × 120, im Verband */
function slabs(x, R, X0, Y0, W, H) {
  const a = 1.2 * PPM, b = .6 * PPM;
  let row = 0;
  for (let py = Y0; py < Y0 + H; py += b, row++) for (let px = X0 - (row % 2 ? a / 2 : 0); px < X0 + W; px += a) {
    x.fillStyle = hsl(34 + R() * 6, 5 + R() * 4, 54 + R() * 6); x.fillRect(px, py, a, b);
    for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(${R() < .5 ? '70,66,60' : '245,242,236'},${.06 + R() * .08})`; x.fillRect(px + R() * a, py + R() * b, 1 + R() * 2.4, 1 + R() * 2.4); }
    x.fillStyle = 'rgba(95,90,82,.7)'; x.fillRect(px, py, a, 2); x.fillRect(px, py, 2, b);
  }
}
/* Holzdeck (Loggia): Lärche, leicht vergraut, quer */
function deck(x, R, X0, Y0, W, H) {
  const bw = .14 * PPM, gap = 3;
  for (let py = Y0; py < Y0 + H; py += bw) {
    let px = X0 - R() * 2 * PPM;
    while (px < X0 + W) {
      const len = (2 + R() * 2) * PPM, l = 44 + R() * 9;
      x.fillStyle = hsl(32 + R() * 5, 20 + R() * 8, l); x.fillRect(px, py, len, bw - gap);
      for (let g = 0; g < 4; g++) { x.fillStyle = hsl(28, 20, l - 16, .12); x.fillRect(px, py + 1 + R() * (bw - gap - 2), len, .8); }
      x.fillStyle = 'rgba(60,50,40,.35)'; x.fillRect(px, py, 1.2, bw - gap);
      px += len;
    }
    x.fillStyle = '#5d554b'; x.fillRect(X0, py + bw - gap, W, gap);
  }
}
/* Teppiche in Taupe und Grau wie auf einem Verkaufsplan */
const RUG = { sand: [32, 12, 66], kalk: [30, 4, 72], salbei: [70, 7, 52] };
function rug(x, R, X0, Y0, W, H, c = 'sand') {
  const [hu, s, l] = RUG[c] || RUG.sand;
  x.fillStyle = hsl(hu, s, l); x.fillRect(X0, Y0, W, H);
  for (let i = 0; i < W * H / 6; i++) { x.fillStyle = hsl(hu, s, l + (R() - .5) * 14, .35); x.fillRect(X0 + R() * W, Y0 + R() * H, 1.3, 1.3); }
  const bd = .06 * PPM; x.strokeStyle = hsl(hu, s + 4, l - 12, .8); x.lineWidth = 2; x.strokeRect(X0 + bd, Y0 + bd, W - bd * 2, H - bd * 2);
}
/* Runde 39: helle Eiche (Calm, Light oben), Kalkstein in großen Platten (Light unten), Fischgrät (Bold) */
function oakLight(x, R, X0, Y0, W, H) { oak(x, R, X0, Y0, W, H, 14); }
function limestone(x, R, X0, Y0, W, H) {
  const a = 1.2 * PPM, b = .6 * PPM;
  let row = 0;
  for (let py = Y0 - (Y0 % b); py < Y0 + H; py += b, row++) for (let px = X0 - (X0 % a) - (row % 2 ? a / 2 : 0); px < X0 + W; px += a) {
    x.fillStyle = hsl(38 + R() * 5, 16 + R() * 6, 80 + R() * 4); x.fillRect(px, py, a, b);
    for (let i = 0; i < 26; i++) { x.fillStyle = `rgba(${R() < .5 ? '150,130,100' : '255,252,245'},${.05 + R() * .07})`; const r = 2 + R() * 9; x.fillRect(px + R() * a, py + R() * b, r, r * .6); }
    x.fillStyle = 'rgba(140,125,100,.55)'; x.fillRect(px, py, a, 1.2); x.fillRect(px, py, 1.2, b);
  }
}
function herring(x, R, X0, Y0, W, H) {
  const L = .6 * PPM, w = .1 * PPM, k = Math.SQRT1_2;
  const cx = X0 + W / 2, cy = Y0 + H / 2, D = (W + H) * k / 2 + L;
  x.save(); x.translate(cx, cy); x.rotate(Math.PI / 4);
  const plank = (px, py, pw, ph, along) => {
    const l = 31 + R() * 7, hu = 24 + R() * 5, s = 34 + R() * 10;
    x.fillStyle = hsl(hu, s, l); x.fillRect(px, py, pw, ph);
    for (let g = 0; g < 3; g++) {
      x.fillStyle = hsl(hu - 3, s + 6, l - 12, .16 + R() * .1);
      if (along) x.fillRect(px, py + 1 + R() * (ph - 2), pw, .7); else x.fillRect(px + 1 + R() * (pw - 2), py, .7, ph);
    }
    x.strokeStyle = 'rgba(30,18,10,.42)'; x.lineWidth = .9; x.strokeRect(px, py, pw, ph);
  };
  /* Treppe aus waagrechten und senkrechten Dielen, alle 2 L nach unten wiederholt, dann um 45 Grad gedreht */
  for (let i = Math.floor(-D / w) - 6; i <= D / w; i++) {
    const b0 = Math.floor((-D - i * w - L) / (2 * L)), b1 = Math.ceil((D - i * w) / (2 * L));
    for (let bb = b0; bb <= b1; bb++) {
      const oy = i * w + 2 * L * bb;
      plank(i * w, oy, L, w, true);
      plank(i * w, oy + w, w, L, false);
    }
  }
  x.restore();
}
const FLOOR = { eiche: oak, eichehell: oakLight, stein: limestone, fischgrat: herring, fliese: tiles, beton: concrete, platten: slabs, deck, fichte: spruce };

/* Schatten nur als Schein: die Form weit links zeichnen, den Schatten zurückschieben */
function halo(x, path, blur, color) {
  x.save(); x.shadowColor = color; x.shadowBlur = blur; x.shadowOffsetX = 20000; x.translate(-20000, 0); x.fillStyle = '#000'; path(); x.fill(); x.restore();
}

/* Bodenbild eines Geschoßes. F: Daten des Geschoßes, walls: Wandpolygone aus plan-geo, foot: Grundflächen der Möbel [x, y, w, d, stärke],
   steps: Stufen von oben gesehen [[pts], Tiefe 0..1] (Treppenauge im Obergeschoß). Koordinaten in Plan pt. */
export function floorCanvas(F, K, walls, foot, steps) {
  const [cx0, cy0, cx1, cy1] = F.crop, S = PPM / K;
  const c = canvas((cx1 - cx0) * S, (cy1 - cy0) * S), x = c.getContext('2d');
  const R = rng((F.key === 'eg' ? 11 : 23) + (F.seed || 0));
  const X = v => (v - cx0) * S, Y = v => (v - cy0) * S;
  const rectPath = r => x.rect(X(r[0]), Y(r[1]), (r[2] - r[0]) * S, (r[3] - r[1]) * S);
  /* Grund: überall der Boden des Hauses (Runde 39: def, sonst Eiche), wo Sockel ist */
  const def = F.floor || 'eiche';
  x.save(); x.beginPath(); F.base.forEach(rectPath); x.clip();
  const bb = F.base.reduce((a, r) => [Math.min(a[0], r[0]), Math.min(a[1], r[1]), Math.max(a[2], r[2]), Math.max(a[3], r[3])], [1e9, 1e9, -1e9, -1e9]);
  FLOOR[def](x, R, X(bb[0]), Y(bb[1]), (bb[2] - bb[0]) * S, (bb[3] - bb[1]) * S);
  x.restore();
  /* Räume mit eigenem Boden */
  for (const rm of F.rooms) {
    if (!rm.f || rm.f === def || !rm.r || !FLOOR[rm.f]) continue;
    x.save(); x.beginPath(); rm.r.forEach(rectPath); x.clip();
    const b = rm.r.reduce((a, r) => [Math.min(a[0], r[0]), Math.min(a[1], r[1]), Math.max(a[2], r[2]), Math.max(a[3], r[3])], [1e9, 1e9, -1e9, -1e9]);
    FLOOR[rm.f](x, R, X(b[0]), Y(b[1]), (b[2] - b[0]) * S, (b[3] - b[1]) * S);
    x.restore();
  }
  /* Teppiche mit weicher Kante */
  for (const [rx, ry, rw, rd, col] of F.rugs || []) {
    halo(x, () => { x.beginPath(); x.rect(X(rx), Y(ry), rw * S, rd * S); }, 6, 'rgba(40,30,20,.35)');
    rug(x, R, X(rx), Y(ry), rw * S, rd * S, col);
  }
  /* Treppenauge (Obergeschoß): die Stufen darunter, je tiefer, desto dunkler */
  if (steps && steps.length) {
    /* Runde 39: nur im Treppenauge, was außerhalb liegt, ist unter dem Boden des Obergeschoßes */
    x.save(); if (F.void) { x.beginPath(); rectPath(F.void); x.clip(); }
    for (const [pts, d] of steps) {
      x.beginPath(); pts.forEach(([px, py], i) => (i ? x.lineTo : x.moveTo).call(x, X(px), Y(py))); x.closePath();
      x.fillStyle = hsl(31, 30 - d * 12, 62 - d * 44); x.fill();
      x.strokeStyle = `rgba(20,14,8,${.35 + d * .3})`; x.lineWidth = 1.4; x.stroke();
    }
    x.restore();
  }
  /* Schatten an den Wandfüßen: zwei Lagen, weit und weich, eng und dunkler */
  const wallPath = () => { x.beginPath(); for (const n of walls) { for (let i = 0; i + 1 < n.length; i += 2) (i ? x.lineTo : x.moveTo).call(x, X(n[i]), Y(n[i + 1])); x.closePath(); } };
  x.save(); x.beginPath(); F.base.forEach(rectPath); x.clip();
  halo(x, wallPath, .55 * PPM, 'rgba(25,16,8,.5)');
  halo(x, wallPath, .12 * PPM, 'rgba(18,12,6,.55)');
  /* unter den Möbeln */
  for (const [fx, fy, fw, fd, k] of foot) halo(x, () => { x.beginPath(); x.rect(X(fx), Y(fy), fw * S, fd * S); }, (.08 + k * .1) * PPM, `rgba(35,25,15,${.22 + k * .2})`);
  x.restore();
  return c;
}

/* ---------- Fassaden, Dach, Kies (kachelnd) ---------- */

/* Naturstein in Lagen, grau bis braun, 2 × 2 m */
export function stoneCanvas() {
  const N = 512, c = canvas(N, N), x = c.getContext('2d'), R = rng(5), px = N / 2;
  x.fillStyle = '#58534d'; x.fillRect(0, 0, N, N);
  let y = 0;
  while (y < N) {
    const rh = Math.min(N - y, (.09 + R() * .14) * px);
    let xx = -R() * .4 * px;
    while (xx < N) {
      const sw = (.22 + R() * .4) * px, l = 44 + R() * 20, h = 26 + R() * 14, s = 6 + R() * 9;
      const draw = ox => {
        x.fillStyle = hsl(h, s, l); x.beginPath();
        const j = () => (R() - .5) * 3;
        x.moveTo(ox + xx + 2 + j(), y + 2 + j()); x.lineTo(ox + xx + sw - 2 + j(), y + 2 + j()); x.lineTo(ox + xx + sw - 2 + j(), y + rh - 2 + j()); x.lineTo(ox + xx + 2 + j(), y + rh - 2 + j()); x.closePath(); x.fill();
        for (let i = 0; i < 26; i++) { x.fillStyle = `rgba(${R() < .5 ? '30,28,25' : '235,230,220'},${.05 + R() * .08})`; x.fillRect(ox + xx + R() * sw, y + R() * rh, 2 + R() * 5, 1 + R() * 3); }
        x.fillStyle = 'rgba(255,255,255,.09)'; x.fillRect(ox + xx + 3, y + 3, sw - 6, 2);
      };
      draw(0); if (xx + sw > N) draw(-N); if (xx < 0) draw(N);
      xx += sw;
    }
    y += rh;
  }
  return c;
}
/* Lärche, senkrechte Bretter mit Fugen, 1 × 1 m */
export function larchCanvas() {
  const N = 256, c = canvas(N, N), x = c.getContext('2d'), R = rng(9), bw = .12 * N;
  for (let px = 0; px < N; px += bw) {
    const l = 66 + R() * 7; x.fillStyle = hsl(33 + R() * 4, 30 + R() * 8, l); x.fillRect(px, 0, bw, N);
    for (let g = 0; g < 6; g++) { x.fillStyle = hsl(30, 30, l - 15, .12 + R() * .1); x.fillRect(px + 2 + R() * (bw - 4), 0, .8 + R(), N); }
    x.fillStyle = 'rgba(60,45,30,.55)'; x.fillRect(px, 0, 2, N);
  }
  return c;
}
/* Stehfalzblech, anthrazit, Falz alle 50 cm, 2 × 2 m */
export function roofCanvas() {
  const N = 256, c = canvas(N, N), x = c.getContext('2d'), R = rng(3);
  x.fillStyle = '#3d3d3c'; x.fillRect(0, 0, N, N);
  for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(255,255,255,${R() * .025})`; x.fillRect(R() * N, R() * N, 2, 2); }
  for (let px = 0; px < N; px += N / 4) { x.fillStyle = 'rgba(0,0,0,.5)'; x.fillRect(px, 0, 2, N); x.fillStyle = 'rgba(255,255,255,.16)'; x.fillRect(px + 2, 0, 2, N); }
  return c;
}
/* Kies auf dem Flachdach, 1 × 1 m */
export function gravelCanvas() {
  const N = 256, c = canvas(N, N), x = c.getContext('2d'), R = rng(4);
  x.fillStyle = '#b4b0a8'; x.fillRect(0, 0, N, N);
  for (let i = 0; i < 5000; i++) { const l = 52 + R() * 34; x.fillStyle = hsl(35, 5, l, .8); const r = .8 + R() * 1.8; x.beginPath(); x.arc(R() * N, R() * N, r, 0, Math.PI * 2); x.fill(); }
  return c;
}
/* weicher Schatten unter dem Sockel (Bodenebene), Rechtecke in m relativ zur Mitte */
export function contactCanvas(rects, pad = 1.6) {
  const b = rects.reduce((a, r) => [Math.min(a[0], r[0]), Math.min(a[1], r[1]), Math.max(a[2], r[2]), Math.max(a[3], r[3])], [1e9, 1e9, -1e9, -1e9]);
  const S = 40, w = (b[2] - b[0] + pad * 2) * S, h = (b[3] - b[1] + pad * 2) * S, c = canvas(w, h), x = c.getContext('2d');
  halo(x, () => { x.beginPath(); rects.forEach(r => x.rect((r[0] - b[0] + pad) * S, (r[1] - b[1] + pad) * S, (r[2] - r[0]) * S, (r[3] - r[1]) * S)); }, .7 * S, 'rgba(0,0,0,.55)');
  return { c, x0: b[0] - pad, z0: b[1] - pad, w: w / S, d: h / S };
}

/* ---------- Runde 39: Fassaden der anderen Concepts (kachelnd) ---------- */

/* Kalkstein in Lagen, hell und cremefarben, gespaltene Kante (Light unten), 2 × 2 m */
export function limeCanvas() {
  const N = 512, c = canvas(N, N), x = c.getContext('2d'), R = rng(15), px = N / 2;
  x.fillStyle = '#cfc4ae'; x.fillRect(0, 0, N, N);
  let y = 0;
  while (y < N) {
    const rh = Math.min(N - y, (.06 + R() * .07) * px);
    let xx = -R() * .5 * px;
    while (xx < N) {
      const sw = (.3 + R() * .5) * px, l = 80 + R() * 8, h = 38 + R() * 6, s = 18 + R() * 10;
      const draw = ox => {
        x.fillStyle = hsl(h, s, l); x.fillRect(ox + xx + 1, y + 1, sw - 2, rh - 2);
        for (let i = 0; i < 22; i++) { x.fillStyle = `rgba(${R() < .55 ? '140,120,90' : '255,252,244'},${.07 + R() * .1})`; x.fillRect(ox + xx + R() * sw, y + R() * rh, 3 + R() * 9, 1 + R() * 2); }
        x.fillStyle = 'rgba(255,255,250,.22)'; x.fillRect(ox + xx + 1, y + 1, sw - 2, 1.5);
        x.fillStyle = 'rgba(110,95,70,.25)'; x.fillRect(ox + xx + 1, y + rh - 2.5, sw - 2, 1.5);
      };
      draw(0); if (xx + sw > N) draw(-N); if (xx < 0) draw(N);
      xx += sw;
    }
    y += rh;
  }
  return c;
}
/* helles Holz, senkrechte Bretter mit feiner Fuge (Calm, Light oben), 1 × 1 m */
export function woodLightCanvas() {
  const N = 256, c = canvas(N, N), x = c.getContext('2d'), R = rng(19), bw = .14 * N;
  for (let px = 0; px < N; px += bw) {
    const l = 74 + R() * 6; x.fillStyle = hsl(35 + R() * 4, 26 + R() * 8, l); x.fillRect(px, 0, bw, N);
    for (let g = 0; g < 7; g++) { x.fillStyle = hsl(32, 24, l - 14, .1 + R() * .1); x.fillRect(px + 2 + R() * (bw - 4), 0, .8 + R(), N); }
    x.fillStyle = 'rgba(90,70,50,.45)'; x.fillRect(px, 0, 1.6, N);
  }
  return c;
}
/* Latten vor dunklem Grund (Bold), warmes Holz, 1 × 1 m */
export function battenCanvas() {
  const N = 256, c = canvas(N, N), x = c.getContext('2d'), R = rng(21), p = .06 * N, bw = p * .72;
  x.fillStyle = '#231d18'; x.fillRect(0, 0, N, N);
  for (let px = 0; px < N; px += p) {
    const l = 50 + R() * 8; x.fillStyle = hsl(29 + R() * 4, 44 + R() * 8, l); x.fillRect(px, 0, bw, N);
    for (let g = 0; g < 3; g++) { x.fillStyle = hsl(26, 40, l - 14, .14 + R() * .1); x.fillRect(px + 1 + R() * (bw - 2), 0, .8, N); }
    x.fillStyle = 'rgba(255,235,205,.16)'; x.fillRect(px, 0, 1.2, N);
    x.fillStyle = 'rgba(0,0,0,.28)'; x.fillRect(px + bw - 1.4, 0, 1.4, N);
  }
  return c;
}
/* heller Klinker, sandfarben, im Verband (Calm), 1 × 1 m */
export function brickCanvas() {
  const N = 256, c = canvas(N, N), x = c.getContext('2d'), R = rng(25), bh = .065 * N, bl = .24 * N;
  x.fillStyle = '#d8cfbf'; x.fillRect(0, 0, N, N);
  let row = 0;
  for (let py = 0; py < N; py += bh, row++) for (let px = -(row % 2 ? bl / 2 : 0); px < N; px += bl) {
    x.fillStyle = hsl(36 + R() * 6, 24 + R() * 10, 66 + R() * 9); x.fillRect(px + 1, py + 1, bl - 2, bh - 2);
    for (let i = 0; i < 8; i++) { x.fillStyle = `rgba(${R() < .5 ? '120,100,75' : '250,245,232'},${.08 + R() * .1})`; x.fillRect(px + 1 + R() * (bl - 3), py + 1 + R() * (bh - 3), 1 + R() * 3, 1 + R() * 2); }
  }
  return c;
}
/* dunkle Fläche, matt mit leichtem Korn (Bold Rahmen, Kanten), 1 × 1 m */
export function darkCanvas() {
  const N = 128, c = canvas(N, N), x = c.getContext('2d'), R = rng(27);
  x.fillStyle = '#34312e'; x.fillRect(0, 0, N, N);
  for (let i = 0; i < 1600; i++) { x.fillStyle = `rgba(${R() < .5 ? '0,0,0' : '255,255,255'},${R() * .05})`; x.fillRect(R() * N, R() * N, 1 + R() * 2, 1 + R() * 2); }
  return c;
}
/* Dachziegel, flach, anthrazit (Calm), Reihen quer zum Gefälle, 2 × 2 m */
export function tileRoofCanvas() {
  const N = 256, c = canvas(N, N), x = c.getContext('2d'), R = rng(29), th = N / 2 / 3.2, tw = N / 2 / 3;
  x.fillStyle = '#2f2e2d'; x.fillRect(0, 0, N, N);
  let row = 0;
  for (let py = 0; py < N; py += th, row++) for (let px = -(row % 2 ? tw / 2 : 0); px < N; px += tw) {
    x.fillStyle = hsl(30, 3, 20 + R() * 6); x.fillRect(px + 1, py, tw - 2, th - 1);
    x.fillStyle = 'rgba(255,255,255,.07)'; x.fillRect(px + 1, py, tw - 2, 2);
    x.fillStyle = 'rgba(0,0,0,.45)'; x.fillRect(px, py + th - 2.5, tw, 2.5);
  }
  return c;
}
