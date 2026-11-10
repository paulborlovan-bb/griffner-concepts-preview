/* Services Übersicht (leistungen.html, Runde 45). Die Geschichte in sechs Schritten:
   Hero „Der Plan“ → das Übliche wird durchgestrichen → drei Versprechen → 01 Open Space Grundriss (Wände wandern, selbst zeichnen)
   → 02 zehn Monate auf einer Linie (der Connector ist der Punkt) → 03 Haus im Schnitt mit den acht Dingen → Leistungsumfang → Katalog. */
import { loop, reveal, $, $$, prog, clamp, seg, E, reduce } from './core.js';
import { initChrome, frame } from './chrome.js';
import { initPlan } from './svc-plan.js';
import { ACHT, UEBERSICHT as U, WAHL, DETAIL } from '../data/leistungen.js';

/* Kurze Beschriftung der Nummern am Haus */
const MARK = { openspace: 'Open Space', wand: 'Wand 42,25 cm', dach: 'Offener First', fenster: 'Holz-Alu, dreifach', decke: 'Massivholzdecke', parkett: 'Eiche, 21,5 cm', raumhoehe: '2,72 m', fassade: 'Lärche oder Putz' };
const run = (name, fn) => { try { fn(); } catch (e) { console.error(name, e); } };
run('chrome', initChrome);
reveal(document);
loop.start(frame);
if (document.fonts) document.fonts.ready.then(() => loop.poke());
addEventListener('load', () => loop.poke());
run('plan', () => initPlan(document));
run('gewohnt', initGewohnt);
run('drei', initDrei);
run('openspace', initOpenSpace);
run('zeit', initZeit);
run('haus', initHaus);
run('mehr', () => { const r = $('[data-mehr]'); if (!r) return; const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { r.classList.add('is-in'); io.disconnect(); } }, { rootMargin: '0px 0px -12% 0px' }); io.observe(r); });

/* ---------- Das Übliche, durchgestrichen ---------- */
function initGewohnt() {
  const el = $('[data-gw]'); if (!el) return;
  const words = $$('[data-gw-h] span', el), items = $$('[data-gw-i]', el), end = $('[data-gw-end]', el);
  const strikes = items.map(i => $('.strk', i));
  loop.add({ tick() {
    const { p, on } = prog(el); if (!on) return;
    words.forEach((w, i) => { w.style.opacity = (.12 + .88 * E(p, i / words.length * .14, i / words.length * .14 + .05)).toFixed(3); });
    const fade = 1 - .72 * E(p, .74, .82);
    items.forEach((it, i) => {
      const a = .17 + i * .13;
      const k = E(p, a, a + .05);
      it.style.opacity = ((.12 + .88 * k) * fade).toFixed(3);
      it.style.transform = `translateY(${((1 - k) * 18).toFixed(1)}px)`;
      strikes[i].style.backgroundSize = (E(p, a + .06, a + .14) * 100).toFixed(2) + '% 2px';
    });
    const e = E(p, .8, .9);
    end.style.opacity = e.toFixed(3); end.style.transform = `translateY(${((1 - e) * 24).toFixed(1)}px)`;
  } });
}

/* ---------- Drei Versprechen: Hilfslinie an der Unterkante der Felder ---------- */
function initDrei() {
  const row = $('.drei__row'); if (!row) return;
  const pf = $('.pf', row);
  const set = () => row.style.setProperty('--pf-h', pf.offsetHeight + 'px');
  new ResizeObserver(set).observe(pf); set();
}

/* ---------- 01 Open Space: Grundriss mit zwei Ableitungspunkten ---------- */
function initOpenSpace() {
  const box = $('[data-os]'); if (!box) return;
  const svg = $('[data-os-svg]', box), hint = $('[data-os-hint]', box), clear = $('[data-os-clear]', box);
  const SVN = 'http://www.w3.org/2000/svg';
  const mk = (tag, a = {}, parent = svg) => { const e = document.createElementNS(SVN, tag); Object.entries(a).forEach(([k, v]) => e.setAttribute(k, v)); parent.appendChild(e); return e; };
  /* Innenmaß 12,00 × 9,80 m, Wand 42,25 cm; 52 px je m */
  const S = 52, WI = 12, DI = 9.8, WT = .4225, X0 = 210, Y0 = 52;
  const px = x => X0 + x * S, py = z => Y0 + z * S;
  /* Telefon: nur der Grundriss, ohne die Ränder der Hilfslinien, damit er groß genug ist */
  const fitVB = () => svg.setAttribute('viewBox', innerWidth < 810 ? '120 18 752 580' : '0 0 1000 640');
  fitVB(); addEventListener('resize', fitVB);
  const P = [[6 - 1.635, 4.9], [6 + 1.635, 4.9]];
  /* Raster, Hilfslinien durch die Punkte */
  const grid = mk('g');
  for (let x = 0; x <= WI + .01; x += 1) mk('line', { class: 'grid', x1: px(x), y1: py(0), x2: px(x), y2: py(DI) }, grid);
  for (let z = 0; z <= DI + .01; z += 1) mk('line', { class: 'grid', x1: px(0), y1: py(z), x2: px(WI), y2: py(z) }, grid);
  mk('line', { class: 'guide dot', x1: 0, y1: py(4.9), x2: 1000, y2: py(4.9) });
  P.forEach(([x]) => mk('line', { class: 'guide', x1: px(x), y1: 0, x2: px(x), y2: 640 }));
  /* Außenwand mit Fenstern */
  const ow = mk('path', { class: 'ow', 'fill-rule': 'evenodd', d: `M${px(-WT)} ${py(-WT)}H${px(WI + WT)}V${py(DI + WT)}H${px(-WT)}Z M${px(0)} ${py(0)}V${py(DI)}H${px(WI)}V${py(0)}Z` });
  void ow;
  const win = (x0, z0, x1, z1) => mk('rect', { class: 'win', x: Math.min(px(x0), px(x1)), y: Math.min(py(z0), py(z1)), width: Math.abs(px(x1) - px(x0)), height: Math.abs(py(z1) - py(z0)) });
  [[1, 3.8], [7.6, 11]].forEach(([a, b]) => win(a, DI, b, DI + WT));
  [[1.8, 4.6], [8.2, 10.8]].forEach(([a, b]) => win(a, -WT, b, 0));
  win(-WT, 2.6, 0, 6.8); win(WI, 2.2, WI + WT, 7.4);
  /* Bemaßung */
  const dimG = mk('g');
  const dx = px(-WT) - 34;
  mk('path', { class: 'dim', d: `M${dx} ${py(0)}V${py(DI)} M${dx - 6} ${py(0)}H${dx + 6} M${dx - 6} ${py(DI)}H${dx + 6}` }, dimG);
  const t1 = mk('text', { class: 'dimt', x: dx - 12, y: py(DI / 2), 'text-anchor': 'middle', transform: `rotate(-90 ${dx - 12} ${py(DI / 2)})` }, dimG); t1.textContent = '9,80 M OHNE WAND';
  const dy = py(4.9) - 34;
  mk('path', { class: 'dim', d: `M${px(P[0][0])} ${dy}H${px(P[1][0])} M${px(P[0][0])} ${dy - 6}V${dy + 6} M${px(P[1][0])} ${dy - 6}V${dy + 6}` }, dimG);
  const t2 = mk('text', { class: 'dimt', x: (px(P[0][0]) + px(P[1][0])) / 2, y: dy - 10, 'text-anchor': 'middle' }, dimG); t2.textContent = '3,27 M';
  /* Wände und Raumnamen */
  const wallsG = mk('g'), labG = mk('g');
  P.forEach(([x, z]) => { mk('rect', { class: 'ptring', x: px(x) - 14, y: py(z) - 14, width: 28, height: 28 }); mk('rect', { class: 'pt', x: px(x) - 7, y: py(z) - 7, width: 14, height: 14 }); });
  const pen = mk('rect', { class: 'pen', x: -20, y: -20, width: 15, height: 12, opacity: 0 });
  const ghost = mk('line', { class: 'ghost', x1: 0, y1: 0, x2: 0, y2: 0, opacity: 0 });
  const TECH = [[0, 7.0, 2.8, 7.0], [2.8, 7.0, 2.8, 8.4], [2.8, 9.3, 2.8, 9.8]];
  const L = {
    wohnen: { w: [...TECH], l: [[6.6, 2.6, 'Wohnen, Kochen, Essen'], [1.4, 8.45, 'Technik']] },
    arbeiten: { w: [...TECH, [8.8, 0, 8.8, 3.8], [8.8, 3.8, 10.6, 3.8]], l: [[4.6, 2.6, 'Wohnen, Kochen, Essen'], [10.4, 1.9, 'Arbeiten'], [1.4, 8.45, 'Technik']] },
    bewegung: { w: [...TECH, [8.2, 6.0, 12, 6.0], [8.2, 6.0, 8.2, 7.0], [8.2, 8.6, 8.2, 9.8]], l: [[5.4, 2.6, 'Wohnen, Kochen, Essen'], [10.1, 7.9, 'Bewegung'], [1.4, 8.45, 'Technik']] },
    kinder: { w: [...TECH, [8.4, 0, 8.4, 3.7], [8.4, 6.1, 8.4, 9.8], [8.4, 4.9, 12, 4.9], [8.4, 4.5, 8.4, 4.9]], l: [[4.4, 2.6, 'Wohnen, Kochen, Essen'], [10.2, 2.4, 'Kind'], [10.2, 7.4, 'Kind'], [1.4, 8.45, 'Technik']] },
    stift: { w: [], l: [] }
  };
  let cur = [], mode = 'wohnen', own = [];
  const key = w => w.map(v => v.toFixed(2)).join(',');
  const lineEl = (w, cls = 'iw') => { const e = mk('line', { class: cls, x1: px(w[0]), y1: py(w[1]), x2: px(w[2]), y2: py(w[3]), pathLength: 1 }, wallsG); e.style.strokeDasharray = '1'; e.dataset.k = key(w); return e; };
  let anim = null;
  function show(name) {
    mode = name;
    const target = name === 'stift' ? own : L[name].w;
    const want = new Map(target.map(w => [key(w), w]));
    /* weg, was nicht bleibt */
    const out = cur.filter(e => !want.has(e.dataset.k));
    const keep = cur.filter(e => want.has(e.dataset.k));
    const add = [...want.entries()].filter(([k]) => !keep.some(e => e.dataset.k === k)).map(([, w]) => { const e = lineEl(w); e.style.strokeDashoffset = '1'; e._w = w; return e; });
    cur = [...keep, ...add];
    $$('text', labG).forEach(t => { t.style.opacity = 0; setTimeout(() => t.remove(), 500); });
    const labels = name === 'stift' ? [] : L[name].l;
    const t0 = performance.now(), outD = 380, step = 260, dur = 520;
    if (anim) cancelAnimationFrame(anim);
    const lab = labels.map(([x, z, s]) => { const t = mk('text', { class: 'rl', x: px(x), y: py(z) + 4, 'text-anchor': 'middle' }, labG); t.textContent = s; t.style.opacity = 0; return t; });
    const tick = now => {
      const T = now - t0;
      out.forEach(e => { e.style.strokeDashoffset = Math.min(1, T / outD).toFixed(3); });
      let penOn = false;
      add.forEach((e, i) => {
        const k = clamp((T - outD * .6 - i * step) / dur), ke = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        e.style.strokeDashoffset = (1 - ke).toFixed(3);
        if (k > 0 && k < 1) { const w = e._w; pen.setAttribute('x', px(w[0] + (w[2] - w[0]) * ke) - 7.5); pen.setAttribute('y', py(w[1] + (w[3] - w[1]) * ke) - 6); penOn = true; }
      });
      pen.setAttribute('opacity', penOn ? 1 : 0);
      const tl = outD * .6 + add.length * step + dur;
      lab.forEach((t, i) => { t.style.opacity = clamp((T - tl * .55 - i * 90) / 400).toFixed(3); });
      if (T < tl + 600) anim = requestAnimationFrame(tick); else { anim = null; out.forEach(e => e.remove()); pen.setAttribute('opacity', 0); }
    };
    if (reduce) { out.forEach(e => e.remove()); add.forEach(e => e.style.strokeDashoffset = 0); lab.forEach(t => t.style.opacity = 1); return; }
    anim = requestAnimationFrame(tick);
  }
  /* Reiter */
  const tabs = $$('[data-os-tab]', box);
  tabs.forEach(b => b.addEventListener('click', () => {
    tabs.forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
    const draw = b.dataset.osTab === 'stift';
    box.classList.toggle('is-draw', draw); hint.hidden = !draw; clear.hidden = !draw;
    show(b.dataset.osTab);
  }));
  clear.addEventListener('click', () => { own = []; show('stift'); });
  /* Selbst zeichnen: gerade Wände im 20 cm Raster */
  const toM = e => { const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const q = pt.matrixTransform(svg.getScreenCTM().inverse()); return [clamp((q.x - X0) / S, 0, WI), clamp((q.y - Y0) / S, 0, DI)]; };
  const snap = v => Math.round(v / .2) * .2;
  /* Fängt Enden anderer Wände und die Außenwand, damit Ecken sauber schließen */
  const SN = .45;
  const near = (x, z) => {
    let p = [snap(x), snap(z)], bd = SN;
    own.forEach(w => [[w[0], w[1]], [w[2], w[3]]].forEach(([a, b]) => { const d = Math.hypot(a - x, b - z); if (d < bd) { bd = d; p = [a, b]; } }));
    if (x < SN) p[0] = 0; if (x > WI - SN) p[0] = WI; if (z < SN) p[1] = 0; if (z > DI - SN) p[1] = DI;
    return p;
  };
  /* T Stoß: das freie Ende rastet an einer quer laufenden eigenen Wand ein (ax 0 = Ende in x, 1 = Ende in z) */
  const tee = (v, o, ax) => {
    let best = v, bd = SN;
    own.forEach(w => {
      const along = ax === 0 ? w[0] === w[2] : w[1] === w[3]; if (!along) return;
      const at = ax === 0 ? w[0] : w[1], lo = Math.min(ax === 0 ? w[1] : w[0], ax === 0 ? w[3] : w[2]), hi = Math.max(ax === 0 ? w[1] : w[0], ax === 0 ? w[3] : w[2]);
      if (o >= lo - .01 && o <= hi + .01 && Math.abs(at - v) < bd) { bd = Math.abs(at - v); best = at; }
    });
    return best;
  };
  let d0 = null;
  svg.addEventListener('pointerdown', e => {
    if (mode !== 'stift') return;
    e.preventDefault(); svg.setPointerCapture(e.pointerId);
    const [x, z] = toM(e); d0 = near(x, z);
  });
  svg.addEventListener('pointermove', e => {
    if (!d0) return;
    const [x, z] = toM(e); let [x1, z1] = near(x, z);
    if (Math.abs(x1 - d0[0]) > Math.abs(z1 - d0[1])) { z1 = d0[1]; x1 = tee(x1, z1, 0); } else { x1 = d0[0]; z1 = tee(z1, x1, 1); }
    Object.entries({ x1: px(d0[0]), y1: py(d0[1]), x2: px(x1), y2: py(z1) }).forEach(([k, v]) => ghost.setAttribute(k, v));
    ghost.setAttribute('opacity', 1); ghost._w = [d0[0], d0[1], x1, z1];
  });
  const up = () => {
    if (!d0) return;
    const w = ghost._w; ghost.setAttribute('opacity', 0); d0 = null; ghost._w = null;
    if (!w || Math.hypot(w[2] - w[0], w[3] - w[1]) < .6) return;
    own.push(w.map(v => Math.round(v * 100) / 100)); if (own.length > 12) own.shift();
    const e = lineEl(own[own.length - 1]); e.style.strokeDashoffset = 0; cur.push(e);
  };
  svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
  show('wohnen');
}

/* ---------- 02 Zehn Monate ---------- */
function initZeit() {
  const el = $('[data-tl]'); if (!el) return;
  el.id = el.id || 's-bauen-tl';
  const track = $('[data-tl-track]', el), items = $$('[data-tl-s]', el), mark = $('[data-tl-mark]', el);
  const fill = $('[data-tl-fill]', el), num = $('[data-tl-n]', el), end = $('[data-tl-end]', el);
  mark.dataset.dockTrigger = el.id;
  let last = -1;
  loop.add({ tick() {
    const { p, on } = prog(el); if (!on) return;
    const n = items.length, w = items[0].offsetWidth, phone = innerWidth < 810;
    const mx = innerWidth * (phone ? .16 : .3);
    /* jede Station bleibt eine Weile stehen, dazwischen gleitet die Linie weiter */
    const raw = clamp(seg(p, .02, .86)) * (n - 1), i0 = Math.floor(raw), f = clamp((raw - i0 - .3) / .4);
    const pos = Math.min(n - 1, i0 + f * f * (3 - 2 * f));
    track.style.transform = `translate3d(${(mx - pos * w).toFixed(1)}px,0,0)`;
    mark.style.left = mx + 'px';
    fill.style.transform = `scaleX(${(pos / n).toFixed(4)})`;
    const i = Math.round(pos);
    if (i !== last) { last = i; num.textContent = String(i); items.forEach((it, k) => { it.classList.toggle('is-on', k === i); it.classList.toggle('is-past', k < i); }); }
    const e = E(p, .89, .97);
    end.style.opacity = e.toFixed(3); end.style.transform = `translateY(${((1 - e) * 24).toFixed(1)}px)`;
    track.style.opacity = (1 - e).toFixed(3); track.style.visibility = e > .99 ? 'hidden' : ''; $('[data-tl-big]', el).style.opacity = (1 - e).toFixed(3);
    mark.dataset.dockHide = e > .5 ? '1' : '';
    if (!mark.dataset.dockHide) delete mark.dataset.dockHide;
  } });
}

/* ---------- 03 Haus im Schnitt ---------- */
function initHaus() {
  const box = $('[data-sh]'); if (!box) return;
  const stage = $('[data-sh-stage]', box), intro = $('[data-sh-intro]', box), det = $('[data-sh-det]', box), home = $('[data-sh-home]', box);
  let api = null, wanted = null, loading = false;
  const items = ACHT.map(a => ({ ...a, mark: MARK[a.key] }));
  const go = () => {
    if (loading) return; loading = true;
    import('./schnitthaus.js').then(m => m.createSchnitthaus(stage, { mode: 'erkunden', items, onSelect: render })).then(a => {
      api = a; stage.classList.add('is-live'); const p = $('.sh__poster', stage); if (p) p.remove();
      if (wanted) api.select(wanted);
    }).catch(e => { console.warn('Haus im Schnitt nicht geladen', e); stage.classList.add('is-fallback'); });
  };
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { go(); io.disconnect(); } }, { rootMargin: '900px 0px' });
  io.observe(box);
  const pick = k => { if (api) api.select(k); else { wanted = k; render(k); go(); } };
  $$('[data-sh-item]', box).forEach(b => b.addEventListener('click', () => pick(b.dataset.shItem)));
  home.addEventListener('click', () => pick(null));
  function render(k) {
    home.hidden = !k;
    if (!k) { det.hidden = true; intro.hidden = false; return; }
    const i = ACHT.findIndex(a => a.key === k), a = ACHT[i], wahl = WAHL[k], st = api ? api.wahl : {};
    const prev = ACHT[(i + 7) % 8], next = ACHT[(i + 1) % 8];
    const group = (name, opts, curv) => `<div class="tabs" role="group" aria-label="${name}">${opts.map(([v, l]) => `<button type="button" class="tab info" data-w="${name}" data-v="${v}" aria-pressed="${curv === v}">${l}</button>`).join('')}</div>`;
    det.innerHTML = `
      <div class="sh__top"><span class="info">${a.nr} / 08</span><button type="button" class="sh__back info" data-back>Alle acht</button></div>
      <h3 class="h-l">${a.name}.</h3>
      <p class="sh__claim">${a.claim}</p>
      ${DETAIL[k] ? `<p class="sh__p">${DETAIL[k]}</p>` : ''}
      <ul class="sh__fk">${a.fakten.map(f => `<li class="info">${f}</li>`).join('')}</ul>
      ${wahl ? `<div class="sh__wahl"><span class="info">${wahl.label}</span>${group(k === 'decke' ? 'decke' : k, wahl.opts, st[k === 'decke' ? 'decke' : k] || wahl.opts[0][0])}${wahl.opts2 ? group('farbe', wahl.opts2, st.farbe || 'natur') : ''}</div>` : ''}
      <dl class="vs"><div><dt class="info">GRIFFNER</dt><dd>${a.griffner}</dd></div><div><dt class="info">Üblich</dt><dd>${a.ueblich}</dd></div></dl>
      <div class="sh__nav"><button type="button" class="info" data-go="${prev.key}">${prev.nr} ${prev.kurz}</button><button type="button" class="info" data-go="${next.key}">${next.nr} ${next.kurz}</button></div>`;
    det.hidden = false; intro.hidden = true;
    $('[data-back]', det).addEventListener('click', () => pick(null));
    $$('[data-go]', det).forEach(b => b.addEventListener('click', () => pick(b.dataset.go)));
    $$('[data-w]', det).forEach(b => b.addEventListener('click', () => {
      $$(`[data-w="${b.dataset.w}"]`, det).forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
      api && api.set(b.dataset.w, b.dataset.v);
    }));
    /* Telefon: Panel liegt unter dem Haus, dorthin mitnehmen, wenn es aus dem Bild ist */
    if (innerWidth < 1100) { const r = det.getBoundingClientRect(); if (r.top > innerHeight * .85) det.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' }); }
  }
}
void U;
