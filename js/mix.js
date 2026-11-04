/* 04 MISCHEN. Ein Arbeitsmodell in three.js, gebaut aus Eigenschaften verschiedener Concepts. Ziehen dreht das Modell. */
import { $, $$, ease, clamp, lerp, store, h, loop, reduce } from './core.js';
import { MIX, MIX_PARAMS, DEFAULT_MIX, CONCEPTS } from '../data/content.js';

const NAME = Object.fromEntries(CONCEPTS.map(c => [c.id, c.name]));
let M, S, house, cur, tw = null, az = -.62, el = .3, stage, say, rows, visible = false, touched = false;

const mixState = () => ({ ...DEFAULT_MIX, ...(store.get().mix || {}) });
const params = m => Object.assign({ slope: 0 }, ...MIX.map(r => MIX_PARAMS[r.key][m[r.key]]));

export function initMix() {
  stage = $('[data-mix-stage]'); say = $('[data-mix-say]'); rows = $('[data-mix-rows]');
  MIX.forEach(r => {
    const row = h('div', { class: 'row' });
    row.innerHTML = `<span class="info">${r.label}</span>`;
    const opts = h('div', { class: 'opts', role: 'group', 'aria-label': r.label });
    Object.entries(r.opts).forEach(([cid, label]) => {
      const b = h('button', { type: 'button', class: 'opt', 'data-k': r.key, 'data-v': cid, 'aria-pressed': 'false' }, `<b>${NAME[cid]}</b>${label}`);
      b.addEventListener('click', () => { touched = true; store.set({ mix: { ...mixState(), [r.key]: cid }, mixTouched: true }); });
      opts.appendChild(b);
    });
    row.appendChild(opts); rows.appendChild(row);
  });
  $('[data-mix-reset]').addEventListener('click', () => { touched = true; store.set({ mix: { ...DEFAULT_MIX }, mixTouched: true }); });
  $('[data-mix-rand]').addEventListener('click', () => {
    touched = true; const ids = CONCEPTS.map(c => c.id), m = {};
    MIX.forEach(r => { m[r.key] = ids[Math.floor(Math.random() * ids.length)]; });
    store.set({ mix: m, mixTouched: true });
  });
  paint();
  store.on((s, patch) => { if ('mix' in patch) { paint(); go(); } });
  new IntersectionObserver(es => es.forEach(e => {
    visible = e.isIntersecting;
    if (visible && !S) boot();
    if (visible) render();
  }), { rootMargin: '200px 0px' }).observe(stage);
}

function paint() {
  const m = mixState();
  $$('.opt', rows).forEach(b => b.setAttribute('aria-pressed', String(m[b.dataset.k] === b.dataset.v)));
  const same = MIX.every(r => m[r.key] === m[MIX[0].key]);
  say.textContent = same
    ? `Ganz ${NAME[m[MIX[0].key]]}. Auch gut. Angepasst wird trotzdem, an dich und deinen Ort.`
    : MIX.map(r => `${r.label} von ${NAME[m[r.key]]}`).join(', ') + '.';
}

async function boot() {
  try { M = await import('./house3d.js'); } catch (e) { console.warn('3D nicht geladen', e); $('[data-mix-tag]').textContent = '3D Modell konnte nicht laden'; return; }
  S = M.createStage($('[data-mix-gl]'), { bg: 0xCFC3B3, fov: 26, shadow: .28, key: 2.1, hemi: .95, fogNear: 140, fogFar: 420 });
  house = S.house({ hill: 0xE4DCD1, hillLine: 0xB7AC9D, line: 0x8b8378, toned: true });
  cur = { ...M.CONCEPTS.block, ...params(mixState()) };
  house.set(cur); house.build = reduce ? 1 : 0;
  S.onResize = render;
  let sx = 0, a0 = 0, drag = false;
  stage.addEventListener('pointerdown', e => { drag = true; sx = e.clientX; a0 = az; stage.setPointerCapture(e.pointerId); });
  stage.addEventListener('pointermove', e => { if (!drag) return; az = a0 - (e.clientX - sx) / 260; touched = true; render(); });
  stage.addEventListener('pointerup', () => { drag = false; });
  stage.addEventListener('pointercancel', () => { drag = false; });
  /* Aufbau beim ersten Sehen, dann zeigt das Modell von selbst ein paar Mischungen, bis du eingreifst */
  const t0 = performance.now();
  const build = () => { house.build = ease(clamp((performance.now() - t0) / 2200)); render(); if (house.build < 1) requestAnimationFrame(build); };
  if (!reduce) { build(); demo(); } else render();
  loop.add({ tick: () => { if (visible && S) render(); } });
}

function demo() {
  const seq = [
    { koerper: 'wald', dach: 'duene', licht: 'wald', fassade: 'wald' },
    { koerper: 'duene', dach: 'summer', licht: 'summer', fassade: 'duene' },
    { koerper: 'summer', dach: 'summer', licht: 'summer', fassade: 'summer' },
    { ...DEFAULT_MIX }
  ];
  seq.forEach((m, i) => setTimeout(() => { if (!touched && !store.get().mixTouched) store.set({ mix: m }); }, 2600 + i * 2400));
}

function go() {
  if (!S) return;
  const to = { ...M.CONCEPTS.block, ...params(mixState()) }, from = { ...cur }, t0 = performance.now(), dur = reduce ? 0 : 1100;
  const id = tw = {};
  const step = () => {
    if (tw !== id) return;
    const k = dur ? ease(clamp((performance.now() - t0) / dur)) : 1;
    Object.keys(to).forEach(key => { cur[key] = lerp(from[key] ?? to[key], to[key], k); });
    house.set(cur); render();
    if (k < 1) requestAnimationFrame(step);
  };
  step();
}

function render() {
  if (!S) return;
  const r = stage.getBoundingClientRect(), vh = innerHeight;
  const drift = clamp((vh - r.top) / (vh + r.height)) - .5;
  const len = Math.max(cur.L0, cur.L1 * cur.up);
  const dist = 32 + len * 1.2;
  S.orbit(az + drift * .5, el, dist, .8, 3.4, 0);
  S.render();
}
