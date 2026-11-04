/* EIN TAG IM WALD. Grundrisse und Ausprobieren in einem Modell.
   Ansicht Grundriss: kein fertiger Plan, sondern eine Idee davon, wie das Haus lebt. Das Obergeschoß schwebt über dem Erdgeschoß,
   die Räume sind Zonen, und die Sonne zeigt, welche Zone gerade Licht bekommt. Ansicht Haus: das Arbeitsmodell zwischen den Bäumen.
   Größe und Obergeschoß verändern beides. Sonne für Griffen (46,7° Nord), gerundet: Juni Aufgang 5:10, Untergang 20:55, höchster Stand 67°,
   Dezember Aufgang 7:40, Untergang 16:25, höchster Stand 20°. Der Garten mit den großen Fenstern schaut nach Süden (+z), Osten ist +x. */
import { $, $$, ease, clamp, lerp, store, h, loop, reduce } from './core.js';
import { WALD_SPIEL, WALD_SPIEL_DEFAULT } from '../data/content.js';

const SIZE = { kompakt: .865, original: 1, gross: 1.146 };
const OG = { auskragend: { L1: 15, sx: -2.4 }, buendig: { L1: 17, sx: 0 }, kuerzer: { L1: 10.5, sx: 3.25 } };
const SUN = { juni: { rise: 5.17, set: 20.92, A: 126, top: 67 }, dezember: { rise: 7.67, set: 16.42, A: 56, top: 20 } };
const LIFT = 5.2, RAD = Math.PI / 180;
/* Zonen als Anteile des Geschoßes: [Name, x0, x1 (West nach Ost), z0, z1 (Nord nach Süd), Blickrichtung x, z] */
const ZONES_EG = [
  ['Wohnen', 0, .38, 0, 1, -.6, 1], ['Essen', .38, .66, .42, 1, 0, 1], ['Kern', .38, .66, 0, .42, 0, -1],
  ['Kochen', .66, 1, .45, 1, .8, .6], ['Ankommen', .66, 1, 0, .45, 1, -.4]
];
const ZONES_OG = [
  ['Kind', 0, .3, 0, .5, -1, -.3], ['Kind', 0, .3, .5, 1, -.8, .6], ['Galerie', .3, .64, .45, 1, 0, 1],
  ['Bad', .3, .64, 0, .45, 0, -1], ['Eltern', .64, 1, 0, 1, 1, .3]
];
/* Was der Tag im Haus bedeutet, nach Uhrzeit */
const NOTES = [[5, 10.5, 'Frühstück in der Morgensonne.'], [10.5, 15.5, 'Mittags Licht bis tief in den Raum.'], [15.5, 22, 'Der Abend gehört der Terrasse.']];

let M, S, house, D, st, cur, tw = null, az = -.62, el = .34, visible = false, touched = false, trees = [], grow = 1, fading = false;
let pv = 1, Z = null, play = null;

const area = s => { const f = SIZE[s.size], eg = 101.44 * f, og = 69.55 * f * OG[s.og].L1 / 15; return { eg, og, all: eg + og }; };
const params = s => { const f = SIZE[s.size], o = OG[s.og]; return { ...M.CONCEPTS.wald, L0: 17 * f, L1: o.L1 * f, sx: o.sx * f, slope: 0 }; };
const hhmm = t => { const m = Math.round(t * 60); return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
const m2 = v => Math.round(v).toLocaleString('de-AT');
const join = l => l.length > 1 ? l.slice(0, -1).join(', ') + ' und ' + l[l.length - 1] : l[0];

function sun(season, t) {
  const s = SUN[season], u = (t - s.rise) / (s.set - s.rise);
  if (u <= 0 || u >= 1) return { up: false, u, psi: (u <= 0 ? s.A : -s.A) * RAD, alt: 0 };
  return { up: true, u, psi: lerp(s.A, -s.A, u) * RAD, alt: s.top * Math.sin(Math.PI * u) * RAD };
}
/* Wie viel Sonne eine Zone bekommt: Blickrichtung gegen die Sonne, bei tiefer Sonne weniger */
const shine = (z, o) => {
  if (!o.up) return 0;
  const sx = Math.sin(o.psi), sz = Math.cos(o.psi), n = Math.hypot(z[5], z[6]);
  return clamp((z[5] * sx + z[6] * sz) / n) * clamp(o.alt / (12 * RAD));
};
function sunSay(o) {
  if (!o.up) return o.u <= 0 ? 'Die Sonne ist noch nicht aufgegangen.' : 'Die Sonne ist schon untergegangen.';
  const n = NOTES.find(([a, b]) => st.time >= a && st.time < b);
  if (st.view !== 'plan') {
    const d = o.psi / RAD;
    if (d > 40) return 'Morgensonne von Osten, durch die Bäume.';
    if (d < -40) return 'Abendsonne von Westen, lange Schatten der Bäume.';
    return st.season === 'dezember' ? 'Die Wintersonne steht tief und reicht weit ins Haus.' : 'Mittags steht die Sonne hoch über dem Garten.';
  }
  const lit = [...new Set([...ZONES_EG, ...ZONES_OG, ['Terrasse', 0, 0, 0, 0, 0, 1]].map(z => [z[0], shine(z, o)]).filter(([, g]) => g > .45).sort((a, b) => b[1] - a[1]).map(([nm]) => nm))].slice(0, 3);
  return `${n ? n[2] : ''}${lit.length ? ` Jetzt in der Sonne: ${join(lit)}.` : ''}`.trim();
}
function say(s) {
  const p = [];
  if (s.size !== 'original') p.push(s.size === 'kompakt' ? 'kompakt' : 'großzügig');
  if (s.og !== 'auskragend') p.push(s.og === 'buendig' ? 'Obergeschoß bündig' : 'Obergeschoß kürzer');
  if (!p.length) return 'Concept Wald, wie gezeichnet.';
  const t = p.join(', '); return t.charAt(0).toUpperCase() + t.slice(1) + '.';
}

export function initWald3d() {
  D = {
    stage: $('[data-ws-stage]'), gl: $('[data-ws-gl]'), labs: $('[data-ws-labs]'), rows: $('[data-ws-rows]'),
    when: $('[data-ws-when]'), sun: $('[data-ws-sun]'), time: $('[data-ws-time]'), timeOut: $('[data-ws-time-out]'), play: $('[data-ws-play]'),
    total: $('[data-ws-total]'), split: $('[data-ws-split]'), say: $('[data-ws-say]'), tag: $('[data-ws-tag]'), hint: $('.ws__hint')
  };
  if (!D.stage) return;
  st = { ...WALD_SPIEL_DEFAULT, ...(store.get().wald2 || {}) };
  pv = st.view === 'plan' ? 1 : 0;
  WALD_SPIEL.forEach(r => {
    const row = h('div', { class: 'row' });
    row.innerHTML = `<span class="info">${r.label}</span>`;
    const opts = h('div', { class: 'opts' + (r.opts.length === 2 ? ' opts--2' : ''), role: 'group', 'aria-label': r.label });
    r.opts.forEach(([v, title, sub]) => {
      const b = h('button', { type: 'button', class: 'opt', 'data-k': r.key, 'data-v': v, 'aria-pressed': 'false' }, `<b>${title}</b>${sub}`);
      b.addEventListener('click', () => set({ [r.key]: v }));
      opts.appendChild(b);
    });
    row.appendChild(opts); D.rows.appendChild(row);
  });
  $$('[data-ws-season] button').forEach(b => b.addEventListener('click', () => set({ season: b.dataset.v })));
  D.time.addEventListener('input', () => { stop(); set({ time: parseFloat(D.time.value) }); });
  D.play.addEventListener('click', () => (play ? stop() : day()));
  $('[data-ws-reset]').addEventListener('click', () => { stop(); set({ ...WALD_SPIEL_DEFAULT }); });
  paint();
  new IntersectionObserver(es => es.forEach(e => { visible = e.isIntersecting; if (visible && !S) boot(); if (visible) render(); else stop(); }), { rootMargin: '300px 0px' }).observe(D.stage);
}

function set(patch, quiet) {
  if (!quiet) touched = true;
  const geo = ['size', 'og', 'view'].some(k => k in patch && patch[k] !== st[k]);
  st = { ...st, ...patch };
  if (!quiet) store.set({ wald2: st, waldTouched: true });
  paint();
  if (geo) go(); else render();
}

/* Die Sonne läuft einmal über den Tag */
function day() {
  const s = SUN[st.season], a = Math.max(5, s.rise + .25), b = Math.min(21, s.set - .75), t0 = performance.now(), dur = reduce ? 0 : 9000;
  const from = st.time >= b - .3 ? a : Math.max(a, st.time);
  play = {}; const id = play; D.play.textContent = 'Anhalten';
  const step = () => {
    if (play !== id) return;
    const k = dur ? clamp((performance.now() - t0) / (dur * (b - from) / (b - a))) : 1;
    set({ time: Math.round(lerp(from, b, k) * 12) / 12 }, true);
    if (k < 1) requestAnimationFrame(step); else stop();
  };
  step();
}
function stop() { play = null; if (D.play) D.play.textContent = 'Tag abspielen'; }

function paint() {
  $$('.opt', D.rows).forEach(b => b.setAttribute('aria-pressed', String(st[b.dataset.k] === b.dataset.v)));
  $$('[data-ws-season] button').forEach(b => b.setAttribute('aria-pressed', String(st.season === b.dataset.v)));
  if (Math.abs(parseFloat(D.time.value) - st.time) > .01) D.time.value = st.time;
  D.timeOut.textContent = hhmm(st.time);
  D.when.textContent = `${st.season === 'juni' ? 'Juni' : 'Dezember'} / ${hhmm(st.time)}`;
  D.sun.textContent = sunSay(sun(st.season, st.time));
  D.say.textContent = say(st);
  D.tag.textContent = st.view === 'plan' ? 'Idee / kein Maßstab' : 'Arbeitsmodell / kein Maßstab';
  if (!S) { const a = area(st); D.total.textContent = m2(a.all); D.split.textContent = `Erdgeschoß ${m2(a.eg)} m² / Obergeschoß ${m2(a.og)} m²`; }
}

/* Bäume wie im Architekturmodell: meist Fichten aus drei gestapelten Kegeln, dazwischen ein paar runde Laubbäume.
   Rund um das Haus, vor dem Garten im Süden bleibt eine Lichtung. */
function plant() {
  const T = M.T;
  let seed = 11; const r = () => (seed = seed * 16807 % 2147483647) / 2147483647;
  const trunkG = new T.CylinderGeometry(.14, .24, 1, 6); trunkG.translate(0, .5, 0);
  const coneG = new T.ConeGeometry(1, 1, 9); coneG.translate(0, .5, 0);
  const ballG = new T.IcosahedronGeometry(1, 1);
  const trunkE = new T.EdgesGeometry(trunkG, 40), coneE = new T.EdgesGeometry(coneG, 40), ballE = new T.EdgesGeometry(ballG, 24);
  const part = (geo, edges, mat, lm) => { const m = new T.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; m.add(new T.LineSegments(edges, lm)); return m; };
  let tries = 0;
  while (trees.length < 30 && tries++ < 1600) {
    const a = r() * Math.PI * 2, d = 18 + r() * 34, x = Math.cos(a) * d, z = Math.sin(a) * d;
    if (Math.abs(x) < 19 && Math.abs(z) < 13) continue;
    if (z > 3 && Math.abs(x) < 26) continue;
    if (trees.some(t => Math.hypot(t.x - x, t.z - z) < 5.2)) continue;
    const laub = r() < .28;
    const mat = new T.MeshStandardMaterial({ color: laub ? 0xEAE4DA : 0xE3DCD1, roughness: .95, metalness: 0, flatShading: true, transparent: true });
    const lm = new T.LineBasicMaterial({ color: 0xA89D8E, transparent: true, opacity: .45 });
    const g = new T.Group();
    if (laub) {
      const rad = 2 + r() * 1.1, stem = 3 + r() * 1.4;
      const trunk = part(trunkG, trunkE, mat, lm); trunk.scale.set(1.2, stem + rad * .5, 1.2);
      const crown = part(ballG, ballE, mat, lm); crown.scale.set(rad, rad * (.92 + r() * .16), rad * (.9 + r() * .2)); crown.position.y = stem + rad * .78; crown.rotation.y = r() * 3;
      g.add(trunk, crown);
    } else {
      const ht = 8.5 + r() * 6.5, rad = ht * (.2 + r() * .04), stem = .9 + r() * .7, C = ht - stem;
      const trunk = part(trunkG, trunkE, mat, lm); trunk.scale.set(1, stem + .5, 1);
      g.add(trunk);
      [[0, .58, 1], [.27, .48, .74], [.52, .48, .48]].forEach(([y0, hh, rr]) => {
        const c = part(coneG, coneE, mat, lm); c.scale.set(rad * rr, C * hh, rad * rr); c.position.y = stem + C * y0; c.rotation.y = r() * 3; g.add(c);
      });
    }
    g.position.set(x, 0, z); S.scene.add(g);
    trees.push({ g, x, z, mat, lm, o: 1, d: r() });
  }
}

/* Der ideale Plan: zwei Bodenplatten, darauf Zonen als flache Felder mit Abstand, Terrasse davor, dazu Sonnenbahn und Sonne */
function zones() {
  const T = M.T, box = new T.BoxGeometry(1, 1, 1), edge = new T.EdgesGeometry(box);
  const plateM = new T.MeshStandardMaterial({ color: 0xFFFFFF, roughness: .95, transparent: true });
  const plateL = new T.LineBasicMaterial({ color: 0x444442, transparent: true });
  const mk = (mat, lm) => { const m = new T.Mesh(box, mat); m.castShadow = true; m.receiveShadow = true; if (lm) m.add(new T.LineSegments(edge, lm)); S.scene.add(m); return m; };
  Z = { plates: [mk(plateM, plateL), mk(plateM, plateL)], plateM, plateL, list: [] };
  const zone = (z, floor) => {
    const mat = new T.MeshStandardMaterial({ color: 0xEDE7DE, roughness: .9, emissive: 0xFFB200, emissiveIntensity: 0, transparent: true });
    const lm = new T.LineBasicMaterial({ color: 0x8b8378, transparent: true });
    const lab = h('div', { class: 'wp__lab' }, `<b>${z[0]}</b>`); D.labs.appendChild(lab);
    Z.list.push({ z, floor, m: mk(mat, lm), mat, lm, lab, g: 0 });
  };
  ZONES_EG.forEach(z => zone(z, 0)); ZONES_OG.forEach(z => zone(z, 1));
  zone(['Terrasse', 0, .62, 1, 1.4, 0, 1], 2);
  /* Sonnenbahn gestrichelt, Sonne als gelbe Kugel */
  Z.arcM = new T.LineDashedMaterial({ color: 0x444442, dashSize: .9, gapSize: .9, transparent: true, opacity: .55 });
  Z.arc = new T.Line(new T.BufferGeometry(), Z.arcM); S.scene.add(Z.arc);
  Z.sun = new T.Mesh(new T.SphereGeometry(1.1, 24, 16), new T.MeshBasicMaterial({ color: 0xFFB200 })); S.scene.add(Z.sun);
  Z.season = '';
}
const R = () => 12 + Math.max(cur.L0, cur.L1) * .75;
const sunPos = o => { const r = R(), alt = Math.max(o.alt, 0); return [Math.sin(o.psi) * Math.cos(alt) * r, Math.sin(alt) * r, Math.cos(o.psi) * Math.cos(alt) * r]; };
function arc() {
  const s = SUN[st.season], pts = [];
  for (let i = 0; i <= 64; i++) { const o = sun(st.season, lerp(s.rise + .001, s.set - .001, i / 64)), p = sunPos(o); pts.push(new M.T.Vector3(p[0], p[1], p[2])); }
  Z.arc.geometry.dispose(); Z.arc.geometry = new M.T.BufferGeometry().setFromPoints(pts); Z.arc.computeLineDistances();
}

async function boot() {
  try { M = await import('./house3d.js'); } catch (e) { console.warn('3D nicht geladen', e); D.tag.textContent = '3D Modell konnte nicht laden'; return; }
  S = M.createStage(D.gl, { bg: 0xCFC3B3, fov: 26, shadow: .3, key: 2.1, hemi: .95, fogNear: 170, fogFar: 520 });
  S.hemi.groundColor.setHex(0x9a9286);
  Object.assign(S.key.shadow.camera, { left: -80, right: 80, top: 80, bottom: -80, far: 340 }); S.key.shadow.camera.updateProjectionMatrix();
  house = S.house({ line: 0x444442, toned: true });
  cur = params(st); house.set(cur);
  plant(); zones();
  S.onResize = render;
  let sx = 0, sy = 0, a0 = 0, e0 = 0, drag = false, touch = false;
  D.stage.addEventListener('pointerdown', e => { drag = true; if (D.hint) D.hint.classList.add('is-gone'); touch = e.pointerType === 'touch'; sx = e.clientX; sy = e.clientY; a0 = az; e0 = el; D.stage.setPointerCapture(e.pointerId); });
  D.stage.addEventListener('pointermove', e => {
    if (!drag) return; touched = true;
    az = a0 - (e.clientX - sx) / 240;
    if (!touch) el = clamp(e0 + (e.clientY - sy) / 320, .08, .9);
    render();
  });
  const up = () => { drag = false; };
  D.stage.addEventListener('pointerup', up); D.stage.addEventListener('pointercancel', up);
  /* Beim ersten Sehen: Haus und Bäume wachsen, dann öffnet sich das Haus zum Grundriss, dann läuft die Sonne über den Tag */
  const wantPlan = st.view === 'plan';
  if (reduce) { house.build = 1; grow = 1; render(); }
  else {
    house.build = 0; grow = 0; pv = 0; render();
    new IntersectionObserver((es, io) => es.forEach(e => {
      if (!e.isIntersecting) return; io.disconnect();
      const t0 = performance.now();
      const step = () => {
        const k = (performance.now() - t0) / 1000;
        house.build = ease(clamp(k / 2)); grow = clamp(k / 2.4);
        if (wantPlan && tw === null) pv = ease(clamp((k - 2.3) / 1.6));
        render();
        if (k < 4) requestAnimationFrame(step);
        else if (!touched && !store.get().waldTouched) day();
      };
      step();
    }), { threshold: .45 }).observe(D.stage);
  }
  loop.add({ tick: () => { if (visible && S) render(); } });
}

/* Form gleitet zum neuen Zustand, die Fläche zählt mit */
function go() {
  if (!S) { paint(); return; }
  const to = params(st), from = { ...cur }, p0 = pv, p1 = st.view === 'plan' ? 1 : 0, t0 = performance.now(), dur = reduce ? 0 : 1300;
  const a0 = parseFloat(D.total.textContent.replace(/\./g, '')) || 171, a1 = area(st);
  const id = tw = {};
  const step = () => {
    if (tw !== id) return;
    const k = dur ? ease(clamp((performance.now() - t0) / dur)) : 1;
    Object.keys(to).forEach(key => { cur[key] = lerp(from[key] ?? to[key], to[key], k); });
    pv = lerp(p0, p1, k);
    D.total.textContent = m2(lerp(a0, a1.all, k));
    D.split.textContent = `Erdgeschoß ${m2(a1.eg)} m² / Obergeschoß ${m2(a1.og)} m²`;
    render();
    if (k < 1) requestAnimationFrame(step);
  };
  step();
}

function render() {
  if (!S || !cur) return;
  const r = D.stage.getBoundingClientRect(), vh = innerHeight;
  const drift = clamp((vh - r.top) / (vh + r.height)) - .5;
  const len = Math.max(cur.L0, cur.L1), narrow = r.width < 520, lift = LIFT * ease(pv);
  const dist = (36 + len * 1.55) * (narrow ? 1.24 : 1) * lerp(1, 1.06, pv);
  const ty = 3.2 + lift * .5;
  S.orbit(az + drift * .3, clamp(el + pv * .22, .08, .95), dist, 0, ty, 0);
  /* Sonne: nach orbit setzen, orbit stellt das Licht sonst neben die Kamera */
  const o = sun(st.season, st.time), alt = Math.max(o.alt, 3 * RAD);
  const dir = [Math.sin(o.psi) * Math.cos(alt), Math.sin(alt), Math.cos(o.psi) * Math.cos(alt)];
  S.key.position.set(dir[0] * 150, dir[1] * 150, dir[2] * 150);
  S.key.target.position.set(0, 0, 0); S.key.target.updateMatrixWorld();
  S.key.intensity = o.up ? 2.1 * clamp(o.alt / (10 * RAD)) : 0;
  S.hemi.intensity = lerp(.55, .95, clamp(o.alt / (25 * RAD)));
  /* Haus: im Grundriss nur noch Kanten, das Obergeschoß hebt ab */
  house.set(cur); house.lift = lift; house.ghost = pv;
  const P = cur, H1 = P.H1, x1 = P.sx * P.up;
  /* Bodenplatten */
  const pk = clamp(pv * 1.4);
  Z.plates[0].scale.set(P.L0, .22, P.D); Z.plates[0].position.set(0, -.11 + .02, 0);
  Z.plates[1].scale.set(P.L1, .22, P.D); Z.plates[1].position.set(x1, H1 + lift - .11, 0);
  Z.plates.forEach(m => { m.visible = pk > .01; }); Z.plateM.opacity = pk; Z.plateL.opacity = pk * .7;
  /* Zonen mit Abstand zueinander, Sonne färbt sie warm */
  const gap = .26, labs = pv > .55;
  Z.list.forEach(q => {
    const [, a, b, c, d] = q.z, L = q.floor === 1 ? P.L1 : P.L0, x0 = q.floor === 1 ? x1 - L / 2 : -L / 2;
    const y = q.floor === 1 ? H1 + lift + .06 : q.floor === 2 ? .03 : .06;
    const zz0 = -P.D / 2 + c * P.D, zz1 = -P.D / 2 + d * P.D;
    const w = (b - a) * L - gap * 2, dz = (zz1 - zz0) - gap * 2;
    q.m.scale.set(Math.max(.01, w), q.floor === 2 ? .1 : .16, Math.max(.01, dz));
    q.m.position.set(x0 + (a + b) / 2 * L, y + .08, (zz0 + zz1) / 2);
    const g = shine(q.z, o); q.g = lerp(q.g, g, .35);
    q.mat.color.setHex(q.floor === 2 ? 0xD8CBB6 : 0xEDE7DE).lerp(new M.T.Color(0xFFD27A), q.g * .85);
    q.mat.emissiveIntensity = q.g * .22;
    q.mat.opacity = pv; q.lm.opacity = pv * .8; q.m.visible = pv > .01;
    const t = S.project(q.m.position.x, y + .3, q.m.position.z);
    q.lab.style.transform = `translate3d(${t.x.toFixed(1)}px,${t.y.toFixed(1)}px,0) translate(-50%,-50%)`;
    q.lab.style.opacity = labs ? '1' : '0';
    q.lab.classList.toggle('is-sun', q.g > .45);
  });
  /* Sonnenbahn und Sonne */
  if (Z.season !== st.season + Math.round(R())) { Z.season = st.season + Math.round(R()); arc(); }
  const sp = sunPos(o);
  Z.sun.position.set(sp[0], sp[1], sp[2]); Z.sun.visible = o.up;
  Z.arcM.opacity = .55 * lerp(.5, 1, pv);
  /* Bäume zwischen Kamera und Haus werden durchsichtig, im Grundriss treten alle zurück */
  const c = S.cam.position, cl2 = c.x * c.x + c.z * c.z;
  trees.forEach(t => {
    const k = (t.x * c.x + t.z * c.z) / cl2, px = t.x - k * c.x, pz = t.z - k * c.z;
    const block = (k > .12 && Math.hypot(px, pz) < 7.5) || Math.hypot(t.x - c.x, t.z - c.z) < 34;
    t.to = (block ? .1 : 1) * lerp(1, .32, pv); t.o = lerp(t.o, t.to, .25);
    t.mat.opacity = t.o; t.lm.opacity = t.o * .6; t.mat.depthWrite = t.o > .6;
    const gk = ease(clamp(grow * 1.6 - t.d * .6));
    t.g.scale.set(1, Math.max(.001, gk), 1); t.g.visible = gk > .01;
  });
  S.render();
  if (!fading && trees.some(t => Math.abs(t.o - t.to) > .01)) { fading = true; requestAnimationFrame(() => { fading = false; render(); }); }
}
