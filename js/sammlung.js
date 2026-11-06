/* DIE SAMMLUNG WÄCHST. Zehn Plätze auf Anthrazit, die Kamera geht beim Scrollen die Reihe ab.
   01 bis 04 sind offen, verlinkt und stehen als weiße Volumenmodelle. 05 bis 10 kommen noch: dort steht ein Schnurgerüst
   (abgestecktes Grundstück, house3d.js Stake) mit "Coming soon". Jeder Platz baut sich auf, wenn die Kamera ankommt,
   der Zähler zählt mit. Daten kommen aus SAMMLUNG in data/content.js. */
import { $, E, lerp, clamp, seg, ease, prog, loop, reduce, hex, mix, css } from './core.js';
import { SAMMLUNG } from '../data/content.js';

const OPEN = SAMMLUNG.filter(s => !s.ph).length;

const GAP = 34;
let M, S, D, H = [], LABS = [], visible = false, booting = false, RA = null, RB = null, rl = '';

export function initSammlung() {
  D = { el: $('#k-sammlung'), gl: $('[data-sm-gl]'), labs: $('[data-sm-labs]'), cnt: $('[data-sm-cnt]'), dock: $('[data-sm-dock]'), hint: $('.sammlung__hint') };
  if (!D.el) return;
  /* Beschriftungen gibt es auch ohne 3D, damit die Links immer da sind */
  LABS = SAMMLUNG.map(s => {
    const open = !s.ph && s.href;
    const el = document.createElement(open ? 'a' : 'div');
    el.className = 'sm-lab info' + (open ? ' is-open' : '');
    if (open) { el.href = s.href; el.setAttribute('aria-label', `Concept ${s.nr} ${s.name} ansehen`); }
    el.innerHTML = `<span>${s.nr}<span class="sm-lab__nm"> / ${s.name}</span></span><span class="sm-lab__state">${open ? 'Offen, ansehen' : s.state}</span>`;
    D.labs.appendChild(el);
    return el;
  });
  new IntersectionObserver(es => es.forEach(e => { visible = e.isIntersecting; if (visible) boot(); loop.poke(); }), { rootMargin: '600px 0px' }).observe(D.el);
  loop.add({ tick });
}

async function boot() {
  if (S || booting) return; booting = true;
  try { M = await import('./house3d.js'); } catch (e) { console.warn('3D nicht geladen', e); D.el.classList.add('is-flat'); return; }
  S = M.createStage(D.gl, { bg: 0x444442, fov: 24, shadow: .32, key: 2, hemi: .85, fogNear: 120, fogFar: 380 });
  /* Schatten breit genug für den Blick auf die ganze Reihe am Ende */
  Object.assign(S.key.shadow.camera, { left: -210, right: 210, top: 130, bottom: -130, far: 420 }); S.key.shadow.camera.updateProjectionMatrix();
  H = SAMMLUNG.map((s, i) => {
    const h = s.ph ? S.stake({}).set({ L0: s.plot[0], D: s.plot[1] }) : S.house({ hill: 0x5c5c5a, hillLine: 0x6c6c6a, line: 0xCACACA }).set(M.CONCEPTS[s.form]);
    h.x = i * GAP; h.build = 0;
    return h;
  });
  S.cam.far = 1600; S.cam.updateProjectionMatrix();
  S.onResize = () => { loop.poke(); };
  loop.poke();
}

function tick() {
  if (!D || !D.el) return;
  const { p, on } = prog(D.el);
  if (!on) return;
  const vw = innerWidth, vh = innerHeight, mob = vw < 760, last = (H.length || SAMMLUNG.length) - 1;
  /* Kamera: sanft anfahren, die Reihe entlang, am Ende zurücktreten, bis alle zehn in einer Reihe stehen */
  const tk = seg(p, .05, .78), tx = last * GAP * tk * tk * (3 - 2 * tk);
  const ov = reduce ? 1 : E(p, .8, .95);
  /* Aufbau: die offenen gleich zu Beginn, der Rest, wenn die Kamera ankommt */
  const built = SAMMLUNG.map((s, i) => {
    if (reduce) return 1;
    if (i < OPEN) return E(p, .01 + i * .03, .08 + i * .03);
    return ease(clamp((tx - (i * GAP - 58)) / 30));
  });
  const n = built.filter(b => b > .55).length;
  /* Runde 28: der Zähler oben rechts ist entfernt, darum nur, falls es ihn gibt */
  if (D.cnt) D.cnt.textContent = String(Math.max(OPEN, n)).padStart(2, '0');
  if (D.hint) D.hint.style.opacity = (1 - E(p, .04, .1)).toFixed(3);
  if (!S || !visible) return;
  /* Am Ende rücken die Häuser zu einem Raster zusammen: 5 x 2 am Desktop, 2 x 5 am Telefon, 01 hinten links */
  const cols = mob ? 2 : 5, rows = Math.ceil(H.length / cols), mid = last * GAP / 2, CG = mob ? 30 : 36, RG = mob ? 34 : 60;
  H.forEach((h, i) => {
    h.build = built[i];
    const c = i % cols, r = Math.floor(i / cols);
    h.x = lerp(i * GAP, mid + (c - (cols - 1) / 2) * CG, ov);
    h.z = lerp(0, (r - (rows - 1) / 2) * RG, ov);
  });
  S.scene.fog.near = lerp(120, 300, ov); S.scene.fog.far = lerp(380, 800, ov);
  const cx = lerp(tx + (mob ? 4 : 12), mid, ov);
  S.orbit(lerp(lerp(.55, .35, seg(p, 0, .78)), mob ? .18 : .08, ov), lerp(.12, mob ? .62 : .42, ov), lerp(mob ? 136 : 104, mob ? 450 : 300, ov), cx, lerp(15, mob ? 15 : 26, ov), 0);
  /* Raumwechsel: solange die Oberkante vom unteren zum oberen Bildrand steigt, kommt die Bühne aus dem Schwarz der Concepts.
     Gleiche Rechnung wie die Raumfarben (chrome.js colorAt, in Framer KonzeptKit), so entsteht keine Kante */
  if (!RA) { const cs = getComputedStyle(D.el); RA = hex(cs.getPropertyValue('--room-k-concepts').trim() || '#000000'); RB = hex(cs.getPropertyValue('--room-k-sammlung').trim() || '#444442'); }
  const rc = css(mix(RA, RB, clamp((vh - D.el.getBoundingClientRect().top) / vh)));
  if (rc !== rl) { rl = rc; S.scene.background.set(rc); S.scene.fog.color.set(rc); }
  S.render();
  const floor = vh - (mob ? 56 : 72);
  H.forEach((h, i) => {
    const lab = LABS[i];
    const q = S.project(h.x - h.p.L0 / 2, -.2, (h.z || 0) + h.p.D / 2 + 3);
    const inView = q.z < 1 && q.x > -240 && q.x < vw + 20;
    const y = Math.min(q.y + 14, floor - lab.offsetHeight);
    lab.style.transform = `translate3d(${q.x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
    const o = inView ? E(built[i], .35, .8) * (SAMMLUNG[i].ph ? .72 : 1) : 0;
    lab.style.opacity = o.toFixed(3);
    lab.style.visibility = o > .02 ? 'visible' : 'hidden';
    lab.classList.toggle('is-short', mob && ov > .5);
  });
  /* Connector: steht an der vorderen rechten Ecke des jüngsten offenen Concepts (04), solange es gut im Bild steht.
     Auf den Schnurgerüsten steht er nicht, dort gibt es noch kein Haus. Links unten steht die Beschriftung. */
  const roof = h => { const P = h.p; return S.project(h.x + Math.max(P.L0 / 2, P.sx * P.up + P.L1 * P.up / 2), 0, (h.z || 0) + P.D / 2); };
  let qd = null;
  const hn = H[OPEN - 1];
  if (hn && built[OPEN - 1] >= .9) { const q = roof(hn); if (q.x > vw * .12 && q.x < vw * .88) qd = q; }
  if (qd) { D.dock.style.left = qd.x.toFixed(1) + 'px'; D.dock.style.top = qd.y.toFixed(1) + 'px'; }
  if (qd && p > .12 && p < .78) delete D.dock.dataset.dockHide; else D.dock.dataset.dockHide = '1';
}
