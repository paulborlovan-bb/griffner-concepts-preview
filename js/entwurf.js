/* 05 ENTWURF. Der echte CAD Grundriss von Concept Wald zeichnet sich Linie für Linie, schräg von links oben.
   Danach Raumnamen und Notizen, die sich nach deinen Antworten richten. Schriftfeld des Plans ist entfernt. */
import { $, $$, E, ease, clamp, prog, loop, store, h, reduce } from './core.js';
import { PLAN } from '../data/content.js';
import { answers } from './kennen.js';

let D, floor = 'eg', svg = null, lastP = -1, swT = -1e9;
const cache = {};

export function initEntwurf() {
  D = { pin: $('[data-e-pin]'), plan: $('[data-e-plan]'), host: $('[data-e-svg]'), labels: $('[data-e-labels]'), notes: $('[data-e-notes]'), sum: $('[data-e-sum]'), who: $('[data-e-who]'), legend: $('[data-e-legend]') };
  $$('[data-e-tab]').forEach(b => b.addEventListener('click', () => setFloor(b.dataset.eTab)));
  setFloor('eg', true);
  store.on((s, patch) => { if ('answers' in patch) { notes(); place(); } });
  addEventListener('resize', () => requestAnimationFrame(place));
  loop.add({ tick });
}

async function load(f) {
  if (!cache[f]) cache[f] = fetch(PLAN[f].src).then(r => r.text());
  return cache[f];
}

async function setFloor(f, first) {
  floor = f;
  $$('[data-e-tab]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.eTab === f)));
  D.sum.textContent = `Concept Wald / ${PLAN[f].label} / ${PLAN[f].sum}`;
  const txt = await load(f);
  if (floor !== f) return;
  D.host.innerHTML = txt;
  svg = $('svg', D.host);
  svg.removeAttribute('width'); svg.removeAttribute('height');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', `Grundriss ${PLAN[f].label}, Concept Wald`);
  /* Am Telefon zeigt der Plan nur Nummern, die Namen stehen darunter in der Legende */
  D.labels.innerHTML = PLAN[f].rooms.map((r, i) => `<div class="plab"><i>${i + 1}</i><b>${r.n}</b>${r.m ? `<span>${r.m}</span>` : ''}</div>`).join('');
  if (D.legend) D.legend.innerHTML = PLAN[f].rooms.map((r, i) => `<li><i>${i + 1}</i><b>${r.n}</b><span>${r.m || ''}</span></li>`).join('');
  notes();
  lastP = -1;
  if (!first) { swT = performance.now(); const spin = () => { loop.poke(); if (performance.now() - swT < 2200) requestAnimationFrame(spin); }; spin(); }
  requestAnimationFrame(() => { place(); loop.poke(); });
}

function notes() {
  const a = answers();
  const on = {
    kochen: a.love.includes('kochen'), work: a.work !== 'buero', garten: a.love.includes('garten'),
    familie: a.who === 'familie', weite: a.love.includes('weite')
  };
  D.notes.innerHTML = PLAN[floor].notes.map(n => `<div class="pnote"><s></s><i></i><span><em>${on[n.key] ? 'Für dich' : 'Idee'}</em>${on[n.key] ? n.on : n.off}</span></div>`).join('');
  const here = !!document.getElementById('k-kennen');
  D.who.textContent = store.get().touched ? 'Notizen nach deinen Antworten aus Kapitel 01' : here ? 'Notizen für dich, sobald du Kapitel 01 ausfüllst' : 'Notizen für dich, sobald du uns auf der Concepts Seite von dir erzählst';
}

/* SVG Koordinaten in Pixel innerhalb von .plan */
function toPx(x, y) {
  const pt = svg.createSVGPoint(); pt.x = x; pt.y = y;
  const m = svg.getScreenCTM(); if (!m) return [0, 0];
  const q = pt.matrixTransform(m), r = D.plan.getBoundingClientRect();
  return [q.x - r.left, q.y - r.top];
}
function place() {
  if (!svg) return;
  const R = PLAN[floor].rooms, labs = $$('.plab', D.labels);
  R.forEach((r, i) => { const [x, y] = toPx(r.x, r.y); labs[i].style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-50%)`; });
  /* Notiz: Punkt im Raum, Linie hinaus in den freien Rand, dort der Text */
  $$('.pnote', D.notes).forEach((el, i) => {
    const n = PLAN[floor].notes[i], [x, y] = toPx(n.at[0], n.at[1]), [tx, ty] = toPx(n.to[0], n.to[1]);
    const dx = tx - x, dy = ty - y;
    el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
    const s = el.querySelector('s'), sp = el.querySelector('span');
    s.style.width = Math.hypot(dx, dy).toFixed(1) + 'px'; s.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
    sp.style.transform = `translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px) translate(${n.align === 'r' ? '-100%' : '0'},-50%)`;
    sp.style.textAlign = n.align === 'r' ? 'right' : 'left';
  });
}

function tick() {
  if (!svg) return;
  const narrow = innerWidth < 820;
  let { p, on } = prog(D.pin); if (!on && !narrow) return;
  if (narrow) p = 1;
  let P = E(p, .02, .56);
  if (!reduce && performance.now() - swT < 2200 && p > .5) P = Math.min(P, ease(clamp((performance.now() - swT) / 1900)));
  if (Math.abs(P - lastP) > .002 || (P === 1 && lastP !== 1)) { D.plan.style.setProperty('--p', P.toFixed(4)); lastP = P; }
  $$('.plab', D.labels).forEach((l, i) => l.classList.toggle('is-on', P > .96 && p > .58 + i * .015));
  $$('.pnote', D.notes).forEach((n, i) => {
    const k = P > .98 && p > .7 + i * .04;
    n.classList.toggle('is-on', k);
    n.querySelector('s').style.transform = n.querySelector('s').style.transform.replace(/scaleX\([^)]*\)/, '') + (k ? ' scaleX(1)' : ' scaleX(0)');
  });
}
