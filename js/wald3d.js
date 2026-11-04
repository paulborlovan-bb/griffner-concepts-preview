/* WALD ZUM AUSPROBIEREN. Concept Wald als Arbeitsmodell zwischen Bäumen.
   Größe, Obergeschoß, Lage und Ansicht verändern das Modell, Jahreszeit und Uhrzeit lassen die Sonne wandern.
   Sonne für Griffen (46,7° Nord), gerundet: Juni Aufgang 5:10, Untergang 20:55, höchster Stand 67°,
   Dezember Aufgang 7:40, Untergang 16:25, höchster Stand 20°. Der Garten mit den großen Fenstern schaut nach Süden. */
import { $, $$, ease, clamp, lerp, store, h, loop, reduce } from './core.js';
import { WALD_SPIEL, WALD_SPIEL_DEFAULT } from '../data/content.js';

const SIZE = { kompakt: .865, original: 1, gross: 1.146 };
const OG = { auskragend: { L1: 15, sx: -2.4 }, buendig: { L1: 17, sx: 0 }, kuerzer: { L1: 10.5, sx: 3.25 } };
const SUN = { juni: { rise: 5.17, set: 20.92, A: 126, top: 67 }, dezember: { rise: 7.67, set: 16.42, A: 56, top: 20 } };
const LIFT = 4.6, RAD = Math.PI / 180;

let M, S, house, D, st, cur, lift = 0, tw = null, az = -.62, el = .3, visible = false, touched = false, trees = [], grow = 1, fading = false;

const area = s => { const f = SIZE[s.size], eg = 101.44 * f, og = 69.55 * f * OG[s.og].L1 / 15; return { eg, og, all: eg + og }; };
const params = s => {
  const f = SIZE[s.size], o = OG[s.og];
  return { ...M.CONCEPTS.wald, L0: 17 * f, L1: o.L1 * f, sx: o.sx * f, slope: s.lage === 'hang' ? 1 : 0 };
};
const hhmm = t => { const m = Math.round(t * 60); return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
const m2 = v => Math.round(v).toLocaleString('de-AT');

function sun(season, t) {
  const s = SUN[season], u = (t - s.rise) / (s.set - s.rise);
  if (u <= 0 || u >= 1) return { up: false, u, psi: (u <= 0 ? s.A : -s.A) * RAD, alt: 0 };
  return { up: true, u, psi: lerp(s.A, -s.A, u) * RAD, alt: s.top * Math.sin(Math.PI * u) * RAD };
}
function sunSay(o, season) {
  if (!o.up) return o.u <= 0 ? 'Die Sonne ist noch nicht aufgegangen.' : 'Die Sonne ist schon untergegangen.';
  const d = o.psi / RAD;
  if (d > 40) return 'Morgensonne von Osten, durch die Bäume.';
  if (d < -40) return 'Abendsonne von Westen, lange Schatten der Bäume.';
  return season === 'dezember' ? 'Die Wintersonne steht tief und reicht weit ins Haus.' : 'Mittags steht die Sonne hoch über dem Garten.';
}
function say(s) {
  const p = [];
  if (s.size !== 'original') p.push(s.size === 'kompakt' ? 'kompakt' : 'großzügig');
  if (s.og !== 'auskragend') p.push(s.og === 'buendig' ? 'Obergeschoß bündig' : 'Obergeschoß kürzer');
  if (s.lage === 'hang') p.push('am Hang');
  if (!p.length) return 'Concept Wald, wie gezeichnet.';
  const t = p.join(', '); return t.charAt(0).toUpperCase() + t.slice(1) + '.';
}

export function initWald3d() {
  D = {
    stage: $('[data-ws-stage]'), gl: $('[data-ws-gl]'), labs: $('[data-ws-labs]'), rows: $('[data-ws-rows]'),
    when: $('[data-ws-when]'), sun: $('[data-ws-sun]'), time: $('[data-ws-time]'), timeOut: $('[data-ws-time-out]'),
    total: $('[data-ws-total]'), split: $('[data-ws-split]'), say: $('[data-ws-say]'), tag: $('[data-ws-tag]'), hint: $('.ws__hint')
  };
  if (!D.stage) return;
  st = { ...WALD_SPIEL_DEFAULT, ...(store.get().wald || {}) };
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
  D.time.addEventListener('input', () => set({ time: parseFloat(D.time.value) }));
  $('[data-ws-reset]').addEventListener('click', () => set({ ...WALD_SPIEL_DEFAULT }));
  D.labs.innerHTML = '<div class="ws__lab" data-l="og"><b>Obergeschoß</b><span></span></div><div class="ws__lab" data-l="eg"><b>Erdgeschoß</b><span></span></div>';
  paint();
  new IntersectionObserver(es => es.forEach(e => { visible = e.isIntersecting; if (visible && !S) boot(); if (visible) render(); }), { rootMargin: '300px 0px' }).observe(D.stage);
}

function set(patch, quiet) {
  if (!quiet) touched = true;
  const geo = ['size', 'og', 'lage', 'view'].some(k => k in patch && patch[k] !== st[k]);
  st = { ...st, ...patch };
  if (!quiet) store.set({ wald: st, waldTouched: true });
  paint();
  if (geo) go(); else render();
}

function paint() {
  $$('.opt', D.rows).forEach(b => b.setAttribute('aria-pressed', String(st[b.dataset.k] === b.dataset.v)));
  $$('[data-ws-season] button').forEach(b => b.setAttribute('aria-pressed', String(st.season === b.dataset.v)));
  if (parseFloat(D.time.value) !== st.time) D.time.value = st.time;
  D.timeOut.textContent = hhmm(st.time);
  D.when.textContent = `${st.season === 'juni' ? 'Juni' : 'Dezember'} / ${hhmm(st.time)}`;
  D.sun.textContent = sunSay(sun(st.season, st.time), st.season);
  D.say.textContent = say(st);
  if (!S) { const a = area(st); D.total.textContent = m2(a.all); D.split.textContent = `Erdgeschoß ${m2(a.eg)} m² / Obergeschoß ${m2(a.og)} m²`; }
}

/* Bäume wie im Architekturmodell: meist Fichten aus drei gestapelten Kegeln, dazwischen ein paar runde Laubbäume.
   8 bis 15 m hoch, das Haus hat rund 7 m. Rund um das Haus, vor dem Garten im Süden bleibt eine Lichtung. */
function plant() {
  const T = M.T;
  let seed = 11; const r = () => (seed = seed * 16807 % 2147483647) / 2147483647;
  const trunkG = new T.CylinderGeometry(.14, .24, 1, 6); trunkG.translate(0, .5, 0);
  const coneG = new T.ConeGeometry(1, 1, 9); coneG.translate(0, .5, 0);
  const ballG = new T.IcosahedronGeometry(1, 1);
  const trunkE = new T.EdgesGeometry(trunkG, 40), coneE = new T.EdgesGeometry(coneG, 40), ballE = new T.EdgesGeometry(ballG, 24);
  const part = (geo, edges, mat, lm) => { const m = new T.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; m.add(new T.LineSegments(edges, lm)); return m; };
  let tries = 0;
  while (trees.length < 34 && tries++ < 1600) {
    const a = r() * Math.PI * 2, d = 16 + r() * 34, x = Math.cos(a) * d, z = Math.sin(a) * d;
    if (Math.abs(x) < 18 && Math.abs(z) < 12) continue;
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

async function boot() {
  try { M = await import('./house3d.js'); } catch (e) { console.warn('3D nicht geladen', e); D.tag.textContent = '3D Modell konnte nicht laden'; return; }
  S = M.createStage(D.gl, { bg: 0xCFC3B3, fov: 26, shadow: .3, key: 2.1, hemi: .95, fogNear: 150, fogFar: 460 });
  S.hemi.groundColor.setHex(0x9a9286);
  Object.assign(S.key.shadow.camera, { left: -80, right: 80, top: 80, bottom: -80, far: 320 }); S.key.shadow.camera.updateProjectionMatrix();
  house = S.house({ hill: 0xE4DCD1, hillLine: 0xB7AC9D, line: 0x8b8378, toned: true });
  cur = params(st); house.set(cur);
  lift = st.view === 'ebenen' ? LIFT : 0;
  plant();
  S.onResize = render;
  let sx = 0, sy = 0, a0 = 0, e0 = 0, drag = false, touch = false;
  D.stage.addEventListener('pointerdown', e => { drag = true; if (D.hint) D.hint.classList.add('is-gone'); touch = e.pointerType === 'touch'; sx = e.clientX; sy = e.clientY; a0 = az; e0 = el; D.stage.setPointerCapture(e.pointerId); });
  D.stage.addEventListener('pointermove', e => {
    if (!drag) return; touched = true;
    az = a0 - (e.clientX - sx) / 240;
    if (!touch) el = clamp(e0 + (e.clientY - sy) / 320, .08, .95);
    render();
  });
  const up = () => { drag = false; };
  D.stage.addEventListener('pointerup', up); D.stage.addEventListener('pointercancel', up);
  /* Beim ersten Sehen: Haus und Bäume wachsen, dann läuft die Sonne einmal über den Tag, bis du eingreifst */
  if (reduce) { house.build = 1; grow = 1; render(); }
  else {
    house.build = 0; grow = 0; render();
    new IntersectionObserver((es, io) => es.forEach(e => {
      if (!e.isIntersecting) return; io.disconnect();
      const t0 = performance.now();
      const step = () => {
        const k = (performance.now() - t0) / 1000;
        house.build = ease(clamp(k / 2.2)); grow = clamp(k / 2.6);
        if (!touched && !store.get().waldTouched && k > 2) { const u = ease(clamp((k - 2) / 5.5)); set({ time: Math.round(lerp(6.5, 17, u) * 4) / 4 }, true); }
        render();
        if (k < 7.6) requestAnimationFrame(step);
      };
      step();
    }), { threshold: .45 }).observe(D.stage);
  }
  loop.add({ tick: () => { if (visible && S) render(); } });
}

/* Form gleitet zum neuen Zustand, die Fläche zählt mit */
function go() {
  if (!S) { paint(); return; }
  const to = params(st), from = { ...cur }, l0 = lift, l1 = st.view === 'ebenen' ? LIFT : 0, t0 = performance.now(), dur = reduce ? 0 : 1100;
  const a0 = parseFloat(D.total.textContent.replace(/\./g, '')) || 171, a1 = area(st);
  const id = tw = {};
  const step = () => {
    if (tw !== id) return;
    const k = dur ? ease(clamp((performance.now() - t0) / dur)) : 1;
    Object.keys(to).forEach(key => { cur[key] = lerp(from[key] ?? to[key], to[key], k); });
    lift = lerp(l0, l1, k);
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
  const len = Math.max(cur.L0, cur.L1), narrow = r.width < 520;
  const dist = (54 + len * 1.6) * (narrow ? 1.12 : 1);
  const ty = 5 + cur.slope * 1.2 + lift * .35;
  S.orbit(az + drift * .35, el, dist, 0, ty, 0);
  /* Sonne: nach orbit setzen, orbit stellt das Licht sonst neben die Kamera */
  const o = sun(st.season, st.time), alt = Math.max(o.alt, 3 * RAD);
  const dir = [Math.sin(o.psi) * Math.cos(alt), Math.sin(alt), Math.cos(o.psi) * Math.cos(alt)];
  S.key.position.set(dir[0] * 150, dir[1] * 150, dir[2] * 150);
  S.key.target.position.set(0, 0, 0); S.key.target.updateMatrixWorld();
  S.key.intensity = o.up ? 2.1 * clamp(o.alt / (10 * RAD)) : 0;
  S.hemi.intensity = lerp(.6, .95, clamp(o.alt / (25 * RAD)));
  house.set(cur); house.lift = lift;
  /* Bäume zwischen Kamera und Haus werden durchsichtig, damit der Blick frei bleibt */
  const c = S.cam.position, cl2 = c.x * c.x + c.z * c.z;
  trees.forEach(t => {
    const k = (t.x * c.x + t.z * c.z) / cl2, px = t.x - k * c.x, pz = t.z - k * c.z;
    const block = (k > .12 && Math.hypot(px, pz) < 7.5) || Math.hypot(t.x - c.x, t.z - c.z) < 34;
    t.to = block ? .1 : 1; t.o = lerp(t.o, t.to, .25);
    t.mat.opacity = t.o; t.lm.opacity = t.o * .6; t.mat.depthWrite = t.o > .6;
    const gk = ease(clamp(grow * 1.6 - t.d * .6));
    t.g.scale.set(1, Math.max(.001, gk), 1); t.g.visible = gk > .01;
  });
  S.render();
  if (!fading && trees.some(t => Math.abs(t.o - t.to) > .01)) { fading = true; requestAnimationFrame(() => { fading = false; render(); }); }
  /* Beschriftungen der Ebenen, nur wenn das Obergeschoß abgehoben ist */
  const ext = cur.slope * 1.86, P = cur, show = lift > LIFT * .6;
  const put = (el2, x, y, z) => { const q = S.project(x, y, z); el2.style.transform = `translate3d(${(q.x + 24).toFixed(1)}px,${q.y.toFixed(1)}px,0) translate(0,-50%)`; el2.style.opacity = show ? '1' : '0'; };
  const a = area(st), lo = $('[data-l="og"]', D.labs), le = $('[data-l="eg"]', D.labs);
  lo.lastElementChild.textContent = `rund ${m2(a.og)} m²`; le.lastElementChild.textContent = `rund ${m2(a.eg)} m²`;
  put(lo, P.sx * P.up + P.L1 / 2, ext + P.H1 + P.H2 + lift - .3, P.D / 2);
  put(le, P.L0 / 2, ext + P.H1 - .3, P.D / 2);
}
