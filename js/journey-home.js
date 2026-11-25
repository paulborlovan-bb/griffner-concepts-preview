/* Journey auf der Startseite (journey-home.html), Runde 2, 2026-11-25. Kunde: „for journey I like v5 and do 5 variants in that feel
   also keep the feel from the actual page“. Alle fünf zeigen die gezeichnete Welt der Seite /journey (js/jh-welt.js, Momente aus weg.js).
   Texte wörtlich aus journey/weg.js (DEF, vom Kunden freigegeben).
   01 Fahrt     wie die Fahrt aus Runde 1: Text links, die Kamera fährt hinter dem Weg her (camAt wie /journey), am Ende das Haus
   02 Flug      randlos wie /journey im Kleinen: Brett baut sich auf, Kamera taucht ein, Start und Zwischenziel, am Ziel das Haus und der Knopf
   03 Brett     das ganze Brett von oben, baut sich beim Scrollen auf, danach hebt sich Tag für Tag mit Moment; Maus oder Finger wählen
   04 Moment    ohne stehende Bühne: die Kamera kreist um das aktuelle Feld und fährt alle 4,6 s weiter; Leiste zum Wählen, Anhalten
   05 Panorama  auf Weiß, breites Band, die Kamera gleitet seitlich am Weg entlang; darunter Tag, Satz, Knopf und Etappe
   Ohne Bewegung (prefers-reduced-motion): kein Selbstlauf, kein Kreisen, die Kamera folgt dem Scrollen ohne Gleiten. */
import { loop, reveal, $, $$, reduce } from './core.js';
import { initChrome, frame } from './chrome.js';
import { esc, pad2, run, runP, sw } from './varianten.js';
import { Welt, WEG, umlauf, misch, cl, rp, sm, eo, io, lerp } from './jh-welt.js';

const TAGE = [
  ['Architekturkonzept', 'Wir lernen deinen Alltag und deine Wünsche kennen und entwickeln daraus die architektonische Idee für dein Haus.'],
  ['Machbarkeitsanalyse', 'Vor Ort prüfen wir Baurecht, Gelände und Erschließung und zeigen, wie sich dein Haus am besten in das Grundstück fügt.'],
  ['Budgetanalyse', 'Wir erfassen die Gesamtkosten deines Projekts vom Haus bis zu den Außenanlagen und setzen gemeinsam mit dir die Prioritäten.'],
  ['Varianten', 'Wir entwickeln mehrere Varianten als Skizze und 3D-Modell. Du wählst die Grundlage für deinen Entwurf.'],
  ['Entwurfsplanung', 'Aus der gewählten Variante entsteht dein Entwurf, mit Fassade, Dach und Fenstern sowie der Planung der Außenanlagen.'],
  ['Innenarchitektur', 'Ein guter Entwurf endet nicht an der Fassade. Deshalb denken wir Einrichtung, Materialien und Farben schon in der Planung mit.'],
  ['Beauftragung', 'Bei deinem Besuch in Griffen legen wir gemeinsam Leistungsumfang, Gesamtinvestition und Terminrahmen fest.'],
  ['Projektstart', 'Wir bringen alle Projektbeteiligten an einen Tisch und legen den Zeitplan bis zur Übergabe fest.'],
  ['Einreichung', 'Wir legen vor Ort die exakte Lage deines Hauses fest, reichen die Pläne ein und begleiten das Bewilligungsverfahren.'],
  ['Detailplanung', 'Parallel zum Verfahren planen wir Küche, Bad, Beleuchtung und Haustechnik im Detail und bereiten den Design Day vor.'],
  ['Design Day', 'In Griffen wählst du Böden, Fliesen, Türen und Sanitär im Zusammenspiel, mit voller Kostentransparenz bei jeder Auswahl.'],
  ['Freigabe', 'Wir prüfen mit dir die finale Ausführungsplanung. Mit deiner Freigabe beginnt die Fertigung in unserer Manufaktur.'],
  ['Montage', 'Nach der Abnahme des Fundaments fertigen wir dein Haus in unserer Manufaktur und montieren es auf deinem Grundstück.'],
  ['Übergabe', 'Wir gehen gemeinsam durch dein Haus, erklären die Haustechnik und übergeben alle Unterlagen. Dann schließt du selbst auf.']
].map(([t, d], i) => ({ i, t, d }));
const LEBEN = { h: 'Besser leben.', lead: 'Mit dem Schlüssel endet dein Projekt, aber nicht unsere Begleitung.' };
const PHASEN = [
  { name: 'Besser planen.', range: 'Tag 01 bis 07', desc: 'Vom ersten Gespräch bis zum Auftrag.' },
  { name: 'Besser bauen.', range: 'Tag 08 bis 14', desc: 'Vom Projektstart bis zur Übergabe.' },
  { name: 'Besser leben.', range: 'Ab Tag 15', desc: 'Vom Einzug an, ein Leben lang.' }
];
const ALLE = [...TAGE, { i: 14, t: LEBEN.h, d: LEBEN.lead, ziel: true }];
const titel = e => e.ziel ? e.t : e.t + '.';
const tagK = i => i < 14 ? `Tag ${pad2(i + 1)} / 14` : 'Ab Tag 15';
const phaseOf = i => i < 7 ? 0 : i < 14 ? 1 : 2;
const stack = (cls, f) => ALLE.map(e => `<p class="${cls}" data-t="${e.i}">${esc(f(e))}</p>`).join('');
const setStack = (root, cur) => $$('[data-t]', root).forEach(el => { const k = +el.dataset.t; el.classList.toggle('is-on', k === cur); el.classList.toggle('is-up', k < cur); });
const mm = (v, a, b) => Math.max(a, Math.min(b, v));
const PI = Math.PI;

/* ---------- Gemeinsam ---------- */
const WELTEN = [];
function buehne(can, o) {
  const w = new Welt(can, { red: reduce, ...o }); WELTEN.push(w);
  const fit = () => { w.size(innerWidth < 900); w.dirty = true; loop.poke(); };
  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(can); else addEventListener('resize', fit);
  fit(); return w;
}
const sicht = el => { const r = el.getBoundingClientRect(); return r.bottom > -40 && r.top < innerHeight + 40; };
/* Scrollwert sanft nachziehen (wie die Fahrt), ohne Bewegung sofort */
const glatt = () => { let v = null; return (t, k = .16) => { if (v == null || reduce) v = t; else { v += (t - v) * k; if (Math.abs(t - v) > .002) loop.poke(); else v = t; } return v; }; };
/* nur neu zeichnen, wenn sich etwas geändert hat */
const zeichne = (w, key, f) => { if (!w.W) return; if (key !== w.lastKey || w.dirty) { w.lastKey = key; w.dirty = false; f(); } };
function leiste(el) {
  el.innerHTML = PHASEN.map((p, j) => `<div class="jx-p"><span class="jx-pt"><span class="jx-pno">${pad2(j + 1)}</span><span class="jx-pn">${esc(p.name.replace('.', ''))}</span></span><span class="jx-pl"><i></i></span></div>`).join('');
  const PF = $$('.jx-pl i', el), PP = $$('.jx-p', el);
  return (f, c) => {
    PF[0].style.transform = `scaleX(${cl((f + .5) / 7).toFixed(3)})`; PF[1].style.transform = `scaleX(${cl((f + .5 - 7) / 7).toFixed(3)})`; PF[2].style.transform = `scaleX(${cl((f - 13.5) / .8).toFixed(3)})`;
    PP.forEach((p, q) => p.classList.toggle('is-cur', q === phaseOf(c)));
  };
}
const zeige = (el, a, tf) => { a = Math.round(a * 1000) / 1000; if (el._a !== a) { el._a = a; el.style.opacity = a; el.style.visibility = a > .01 ? 'visible' : 'hidden'; } if (tf != null && el._t !== tf) { el._t = tf; el.style.transform = tf; } };

/* ---------- 01 Fahrt ---------- */
function v1() {
  const runEl = $('[data-jx1-run]'); if (!runEl) return;
  const can = $('[data-jx1-can]'), k = $('[data-jx1-k]'), ts = $('[data-jx1-ts]'), xs = $('[data-jx1-xs]'), txt = $('[data-jx1-txt]'), barEl = $('[data-jx1-bar]');
  ts.innerHTML = stack('jx-t', titel); xs.innerHTML = stack('jx-x', e => e.d);
  const fill = leiste(barEl), w = buehne(can), g = glatt();
  let cur = -1;
  loop.add({ tick() {
    if (!sicht(runEl)) return;
    const pos = g(-.5 + cl(runP(runEl) * 1.05) * 15.9), c = mm(Math.floor(pos + .5), 0, 14);
    fill(pos, c);
    if (c !== cur) { cur = c; setStack(ts, c); setStack(xs, c); k.textContent = tagK(c); }
    zeichne(w, pos.toFixed(4), () => {
      const mob = w.mob, u = rp(pos, 13.1, 14.8), h = w.haus();
      const cam = misch(w.camAt(mm(pos, 0, 13.6)), umlauf(h.m, -PI / 2 - (mob ? .35 : .75), mob ? .62 : .48, mob ? 3900 : 3300), u);
      cam.cx = w.W * (mob ? .5 : lerp(.67, .66, io(u))); cam.cy = w.H * (mob ? lerp(.36, .4, io(u)) : lerp(.23, .4, io(u)));
      const top = can.getBoundingClientRect().top, clipY = (mob ? txt.getBoundingClientRect().top : barEl.getBoundingClientRect().top) - top - 18;
      w.draw(pos, cam, { netz: 1, linien: 1, haus: rp(pos, 12.4, 14.2), licht: rp(pos, 14.4, 15.2), clipY });
    });
  } });
}

/* ---------- 02 Flug ---------- */
function v2() {
  const runEl = $('[data-jx2-run]'); if (!runEl) return;
  const can = $('[data-jx2-can]'), hero = $('[data-jx2-hero]'), L = $$('[data-jx2-l]'), MK = $$('[data-jx2-mk]'), day = $('[data-jx2-day]'), k = $('[data-jx2-k]'), ts = $('[data-jx2-ts]'), ziel = $('[data-jx2-ziel]');
  ts.innerHTML = stack('jx-t', titel);
  const w = buehne(can), g = glatt();
  let cur = -1, fk = '', ov = null;
  /* Übersicht: das ganze Brett, am Rechner quer (Start links), am Telefon in die Tiefe (Start unten) */
  const over = () => {
    const key = w.W + 'x' + w.H; if (fk === key && ov) return ov; fk = key;
    const b = w.box, T = { x: (b.x0 + b.x1) / 2, y: 0, z: (b.z0 + b.z1) / 2 }, cam = w.mob ? umlauf(T, -PI / 2, 1.16, 32000) : umlauf(T, 0, .98, 32000);
    const hb = hero.getBoundingClientRect(), sb = can.getBoundingClientRect(), m = w.mob ? 16 : Math.max(24, w.W * .04);
    const pad = w.mob ? { l: m, r: m, t: hb.bottom - sb.top + 24, b: 40 } : { l: m, r: m, t: 110, b: sb.bottom - hb.top + 36 };
    ov = Object.assign(cam, w.passend([cam], w.huelle(G2b), pad)); return ov;
  };
  const G2b = 200;
  loop.add({ tick() {
    if (!sicht(runEl)) return;
    const pos = g(-3.2 + cl(runP(runEl) * 1.04) * 19.2);
    /* Texte */
    const ha = 1 - rp(pos, -1.8, -1.35);
    zeige(hero, ha, `translate3d(0,${(-rp(pos, -1.8, -1.35) * 24).toFixed(1)}px,0)`);
    const mk0 = pos > -.7 ? sm(1 - Math.abs(pos - .15) / (pos > .15 ? .75 : .6)) : 0, mk1 = sm(1 - Math.abs(pos - 7) / .8);
    zeige(MK[0], mk0, `translate3d(0,${((1 - mk0) * 20 - (pos - .15) * 12).toFixed(1)}px,0)`); zeige(MK[1], mk1, `translate3d(0,${((1 - mk1) * 20 - (pos - 7) * 12).toFixed(1)}px,0)`);
    const da = rp(pos, .5, .9) * (1 - rp(pos, 13.15, 13.55)) * (1 - Math.max(mk0, mk1) * .95);
    zeige(day, da);
    const c = mm(Math.round(pos), 0, 13);
    if (c !== cur) { cur = c; setStack(ts, c); k.textContent = tagK(c); }
    const za = rp(pos, 14.3, 14.9); zeige(ziel, za, `translate(-50%,${((1 - za) * 20).toFixed(1)}px)`);
    zeichne(w, pos.toFixed(4), () => {
      const mob = w.mob, O = over(), head = -.7 + 14.9 * rp(pos, -3.05, -1.75), dive = rp(pos, -1.1, 0), end = rp(pos, 13.05, 14.9);
      const rideC = { ...w.camAt(mm(pos, 0, 13.6)), F: w.F, cx: w.W * (mob ? .5 : .67), cy: w.H * (mob ? .36 : .23) };
      let cam;
      if (pos < -1.1) cam = O;
      else if (pos < 0) { const m = misch(O, w.camAt(0), dive), e = io(dive); cam = { ...m, F: lerp(O.F, rideC.F, e), cx: lerp(O.cx, rideC.cx, e), cy: lerp(O.cy, rideC.cy, e) }; }
      else if (pos < 13.05) cam = rideC;
      else { const h = w.haus(), z = umlauf(h.m, -PI / 2 - (mob ? .3 : .55), mob ? .5 : .42, mob ? 4600 : 3500), e = io(end); cam = { ...misch(rideC, z, end), F: w.F, cx: lerp(rideC.cx, w.W * .5, e), cy: lerp(rideC.cy, w.H * (mob ? .4 : .36), e) }; }
      const sb = can.getBoundingClientRect(), clipY = mob ? Math.min(da > .01 ? day.getBoundingClientRect().top - sb.top - 18 : 1e9, za > .01 ? ziel.getBoundingClientRect().top - sb.top - 18 : 1e9) : null;
      const intro = pos < -.45, introT = c => eo(rp(head + 1.1, c.ar - .25, c.ar + .55)), rideT = c => eo(rp(Math.min(pos, 13) + 1.1, c.ar - .25, c.ar + .55));
      w.draw(pos, cam, {
        netz: rp(pos, -1, -.1), linien: rp(pos, -.8, -.2), nebel: [lerp(42000, 1800, io(dive)), lerp(30000, 12500, io(dive))],
        kachel: c => Math.max(introT(c) * (1 - rp(pos, -.4, .9)), rideT(c)),
        weg: intro ? [-.6, Math.min(14.35, head)] : [-.6, 14.35], punkt: pos < -1.4 && head > -.6 && head < 13.9 ? head : null,
        tag: intro ? (k => ({ u: rp(head, k - .06, k + .34), flat: true, a: 1 - rp(pos, -1.1, -.45) })) : (k => ({ u: rp(pos, k - .4, k + .02), hot: cl(1 - Math.abs(pos - k) * 1.25), m: pos, ra: rp(pos, -.6, -.2) })),
        zahl: intro ? 0 : 1, haus: Math.max(intro ? rp(head, 13.3, 14.2) : 0, rp(pos, 12.4, 14)), licht: rp(pos, 14.5, 15.3), clipY
      });
    });
  } });
}

/* ---------- 03 Brett ---------- */
function v3() {
  const runEl = $('[data-jx3-run]'); if (!runEl) return;
  const can = $('[data-jx3-can]'), foot = $('[data-jx3-foot]'), phs = $('[data-jx3-phs]');
  phs.innerHTML = PHASEN.map(p => `<div class="jx3__ph"><p class="jx3__pn">${esc(p.name)}</p><p class="info jx3__pr">${p.range}</p><p class="jx3__pd">${esc(p.desc)}</p></div>`).join('');
  const PH = $$('.jx3__ph', phs), w = buehne(can, { pts: WEG(800) }), g = glatt();
  const LIFT = TAGE.map(() => 0);
  let fk = '', fit = null, hov = -1, hold = 0, auto = -1, nextA = 0, head = -1;
  const cam = (p, t) => {
    const b = w.box, T = { x: (b.x0 + b.x1) / 2, y: 0, z: (b.z0 + b.z1) / 2 }, s = reduce ? 0 : .06 * Math.sin(t / 6500);
    return w.mob ? umlauf(T, -PI / 2 + .16 * (p - .5) + s, .98 - .1 * p, 32000) : umlauf(T, .5 - .24 * (p - .5) + s, .84 - .1 * p, 32000);
  };
  const passt = () => {
    const key = w.W + 'x' + w.H; if (fk === key && fit) return fit; fk = key;
    const fb = foot.getBoundingClientRect(), sb = can.getBoundingClientRect(), m = w.mob ? 16 : Math.max(24, w.W * .04);
    fit = w.passend([cam(0, 0), cam(.5, 0), cam(1, 0)], w.huelle(-120), { l: m, r: m, t: w.mob ? 84 : 104, b: sb.bottom - fb.top + (w.mob ? 34 : 46) }); return fit;
  };
  const pick = (e) => {
    if (!w.W) return -1; const r = can.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top; let best = -1, bd = w.mob ? 34 : 40;
    TAGE.forEach((t, k) => { if (rp(head, k - .06, k + .34) <= 0) return; const q = w.feld(k, 24 + 640 * io(LIFT[k])); if (!q) return; const d = Math.hypot(q[0] - px, q[1] - py); if (d < bd) { bd = d; best = k; } });
    return best;
  };
  can.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse') return; const k = pick(e); hov = k; can.classList.toggle('is-hand', k >= 0); loop.poke(); });
  can.addEventListener('pointerleave', () => { if (hov >= 0) { hov = -1; hold = performance.now() + 1500; can.classList.remove('is-hand'); loop.poke(); } });
  can.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse') return; const k = pick(e); if (k >= 0) { auto = k; nextA = performance.now() + 6000; loop.poke(); } });
  loop.add({ tick() {
    if (!sicht(runEl)) return;
    const now = performance.now(), p = g(cl(runP(runEl) * 1.05));
    head = -.6 + 15.6 * rp(p, .05, .8);
    /* nach dem Aufbau hebt sich ein Tag nach dem anderen (alle 2,6 s), die Maus oder der Finger wählen selbst */
    const fertig = head > 14.4;
    if (!fertig) auto = -1;
    else if (!reduce && hov < 0 && now > hold && now > nextA) { auto = (auto + 1) % 14; nextA = now + 2600; }
    const sel = hov >= 0 ? hov : auto;
    let moving = false;
    LIFT.forEach((v, k) => { const t = k === sel ? 1 : 0, n = reduce ? t : v + (t - v) * .085; LIFT[k] = Math.abs(t - n) < .002 ? t : n; if (LIFT[k] !== t) moving = true; });
    if (moving || (!reduce && fertig)) loop.poke();
    const ph = sel >= 0 ? phaseOf(sel) : phaseOf(mm(Math.floor(head), 0, 14));
    PH.forEach((e, j) => e.classList.toggle('is-cur', j === ph));
    zeichne(w, p.toFixed(4) + '|' + LIFT.map(v => v.toFixed(3)).join(',') + (fertig && !reduce ? '|' + Math.round(now / 40) : ''), () => {
      w.o.hausT = w.mob ? null : { x: -.88, z: -.48 };
      const F = passt(), c = { ...cam(p, now), ...F };
      w.draw(head, c, {
        nebel: null, rand: .75, kachel: q => eo(rp(head + 1.4, q.ar - .25, q.ar + .55)), weg: [-.6, Math.min(14.35, head)], punkt: head > -.5 && head < 13.9 ? head : null,
        linien: rp(head, -.5, .3), zahlS: .9, haus: rp(head, 13.2, 14.2), licht: rp(head, 14.2, 15),
        tag: k => ({ u: rp(head, k - .06, k + .34), hot: LIFT[k], h: 24 + 640 * io(LIFT[k]) })
      });
      if (sel >= 0 && LIFT[sel] > .05) {
        const q = w.feld(sel, 24 + 640 * io(LIFT[sel])); if (q) { const right = q[0] + 240 < w.W; w.marke(q[0] + (right ? 22 : -22), q[1] - 46, 'Tag ' + pad2(sel + 1), TAGE[sel].t, { a: LIFT[sel], al: right ? 'left' : 'right', f1: w.mob ? 10 : 11, f2: w.mob ? 13 : 15 }); }
      }
    });
  } });
}

/* ---------- 04 Moment ---------- */
function v4() {
  const sec = $('[data-jx4]'); if (!sec) return;
  const can = $('[data-jx4-can]'), view = $('[data-jx4-view]'), k = $('[data-jx4-k]'), ts = $('[data-jx4-ts]'), xs = $('[data-jx4-xs]'), pp = $('[data-jx4-pp]'), steps = $('[data-jx4-steps]');
  ts.innerHTML = stack('jx-t', titel); xs.innerHTML = stack('jx-x', e => e.d);
  steps.innerHTML = PHASEN.map((p, j) => `<p class="jx4__ph jx4__ph--${j}"><span class="jx4__phn">${esc(p.name.replace('.', ''))}</span><span class="info">${p.range}</span></p>`).join('')
    + ALLE.map(e => `<button type="button" class="jx4__s" data-s="${e.i}" style="grid-column:${e.i + 1}" aria-label="${e.ziel ? 'Ab Tag 15, Besser leben' : `Tag ${pad2(e.i + 1)}, ${esc(e.t)}`}"><i></i><span>${e.ziel ? 'Ziel' : pad2(e.i + 1)}</span></button>`).join('');
  const S = $$('.jx4__s', steps), SF = S.map(s => s.querySelector('i')), PH = $$('.jx4__ph', steps), w = buehne(can), INT = 4600;
  let cur = -1, q = -.5, from = -.5, to = -.5, t0 = 0, dur = 1, playing = !reduce, vis = false, next = 0, started = false;
  const go = (i, user) => {
    const now = performance.now(); cur = i; from = q; to = i < 14 ? i : 15; t0 = now; dur = reduce ? 1 : mm(Math.abs(to - from) * 650, 1100, 2400);
    next = now + dur + (user ? INT * 1.4 : INT);
    setStack(ts, i); setStack(xs, i); k.textContent = tagK(i);
    S.forEach((s, j) => { s.classList.toggle('is-done', j < i); s.classList.toggle('is-cur', j === i); if (j === i) s.setAttribute('aria-current', 'step'); else s.removeAttribute('aria-current'); });
    PH.forEach((p, j) => p.classList.toggle('is-cur', j === phaseOf(i)));
    loop.poke();
  };
  /* nach dem Ziel kurz ausblenden und vorn neu beginnen */
  const wrap = () => { view.style.transition = 'opacity 450ms'; view.style.opacity = 0; setTimeout(() => { q = from = to = -.5; go(0); view.style.opacity = 1; }, 480); };
  steps.addEventListener('click', e => { const b = e.target.closest('.jx4__s'); if (b) go(+b.dataset.s, true); });
  pp.addEventListener('click', () => { playing = !playing; pp.classList.toggle('is-play', !playing); pp.setAttribute('aria-label', playing ? 'Anhalten' : 'Abspielen'); next = performance.now() + 900; loop.poke(); });
  if (reduce) { pp.classList.add('is-play'); pp.setAttribute('aria-label', 'Abspielen'); }
  new IntersectionObserver(es => es.forEach(e => { vis = e.isIntersecting; if (vis && !started) { started = true; go(0); } if (vis) loop.poke(); }), { threshold: .2 }).observe(view);
  loop.add({ tick() {
    if (!vis || !started) return;
    const now = performance.now(), u = cl((now - t0) / dur);
    q = from + (to - from) * io(u);
    if (playing && now > next) { if (cur >= 14) { next = now + 99999; wrap(); } else go(cur + 1); }
    SF.forEach((f, j) => { const v = j < cur ? 1 : j === cur ? (playing ? cl((now - (next - INT)) / INT) : 1) : 0, s = 'scaleX(' + v.toFixed(3) + ')'; if (f._s !== s) { f._s = s; f.style.transform = s; } });
    if (!reduce) loop.poke();
    zeichne(w, q.toFixed(4) + (reduce ? '' : '|' + Math.round(now / 30)), () => {
      const mob = w.mob, h = w.haus(), e = io(rp(q, 13, 15)), s = w.S(mm(q, -.5, 13)), T = { x: lerp(s.x, h.m.x, e), y: lerp(40, h.m.y * .6, e), z: lerp(s.z, h.m.z, e) };
      const az = -PI / 2 - .62 + (reduce ? 0 : .3 * Math.sin(now / 5200)), el = .58 + (reduce ? 0 : .05 * Math.sin(now / 7300));
      const cam = { ...umlauf(T, az, el, lerp(mob ? 1750 : 1650, mob ? 4400 : 3800, e)), F: w.F * .92, cx: w.W * .5, cy: w.H * (mob ? .5 : .54) };
      w.draw(q, cam, { netz: 1, linien: 0, tag: j => ({ u: rp(q, j - .4, j + .02), hot: cl(1 - Math.abs(q - j) * 1.25), m: q + .4 }), haus: rp(q, 11.5, 13), licht: rp(q, 14.2, 14.9) });
    });
  } });
}

/* ---------- 05 Panorama ---------- */
function v5() {
  const runEl = $('[data-jx5-run]'); if (!runEl) return;
  const can = $('[data-jx5-can]'), k = $('[data-jx5-k]'), ts = $('[data-jx5-ts]'), xs = $('[data-jx5-xs]'), barEl = $('[data-jx5-bar]');
  ts.innerHTML = stack('jx-t', titel); xs.innerHTML = stack('jx-x', e => e.d);
  /* der Weg quer durchs Bild: je Tag zwei Kacheln nach rechts, sanft auf und ab; zum Ziel gerade */
  const Z = [200, 600, 600, 200, 200, -200, -200, 200, 600, 600, 200, 200, 200, 200];
  const pts = Z.map((z, i) => ({ x: 200 + i * 800, z }));
  const fill = leiste(barEl), w = buehne(can, { hell: true, pts, hausT: { x: 0, z: 1 } }), g = glatt();
  let cur = -1;
  loop.add({ tick() {
    if (!sicht(runEl)) return;
    const pos = g(-.6 + cl(runP(runEl) * 1.05) * 16), c = mm(Math.floor(pos + .5), 0, 14);
    fill(pos, c);
    if (c !== cur) { cur = c; setStack(ts, c); setStack(xs, c); k.textContent = tagK(c); }
    zeichne(w, pos.toFixed(4), () => {
      const mob = w.mob, X = w.S(mm(pos, -.6, 15.4)).x;
      const cam = mob ? { C: { x: X - 220, y: 1050, z: -1250 }, L: { x: X + 90, y: 0, z: 330 }, F: w.F * 1.05, cx: w.W * .5, cy: w.H * .4 }
        : { C: { x: X - 380, y: 1150, z: -1250 }, L: { x: X + 160, y: 0, z: 360 }, F: w.F, cx: w.W * .5, cy: w.H * .38 };
      w.draw(pos, cam, { linien: 1, ausblend: 1300, nebel: [2600, 9000], haus: rp(pos, 12, 13.6), licht: rp(pos, 14.2, 15) });
    });
  } });
}

run('chrome', initChrome);
run('v1', v1); run('v2', v2); run('v3', v3); run('v4', v4); run('v5', v5); run('sw', sw);
reveal(document);
loop.start(frame);
const neu = () => { WELTEN.forEach(w => { w.dirty = true; }); loop.poke(); };
if (document.fonts) document.fonts.ready.then(neu);
addEventListener('load', neu);
