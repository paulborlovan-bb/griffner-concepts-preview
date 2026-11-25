/* Journey auf der Startseite (journey-home.html), Runde 1, 2026-11-25. Fünf Varianten für einen Abschnitt, der /journey vorstellt.
   Texte wörtlich aus journey/weg.js (DEF, vom Kunden freigegeben): Hero, Phasen, die 14 Tage mit ihrem Satz, Besser leben.
   01 Brett     der Weg als Linie mit 14 Feldern; ein Tag nach dem anderen ist dran (schwarz erledigt, gelb aktuell), Maus oder Finger wählen selbst
   02 Etappen   drei Etappen mit Bild (Parallaxe), Feldern und den Tagen jeder Etappe; Telefon zum Wischen
   03 Vierzehn  stehende Bühne, eine große Zahl zählt beim Scrollen von 01 bis 14 und 15, Tag und Satz wechseln, die Leiste füllt sich
   04 Bild      ein Bild öffnet sich beim Scrollen bis an den Rand (clip-path), die Überschrift steigt darauf, darunter die drei Etappen
   05 Fahrt     kleines 3D-Brett aus CSS-Flächen (preserve-3d): die Kamera fährt den Weg ab, die Blöcke wachsen, am Ziel steht das Haus
   Ohne Bewegung (prefers-reduced-motion): kein Selbstlauf, keine Parallaxe, die Kamera springt ohne Gleiten. */
import { loop, reveal, $, $$, reduce } from './core.js';
import { initChrome, frame } from './chrome.js';
import { esc, pad2, cl, sm, run, runP, sw } from './varianten.js';

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
const LEBEN = { h: 'Besser leben.', lead: 'Mit dem Schlüssel endet dein Projekt, aber nicht unsere Begleitung.', punkte: ['Jahrescheck.', 'GRIFFNER Care.', 'Open House.', 'GRIFFNER Club.'] };
const PHASEN = [
  { name: 'Besser planen.', range: 'Tag 01 bis 07', desc: 'Vom ersten Gespräch bis zum Auftrag.', bild: 'weg-griffen', pos: '62% 50%' },
  { name: 'Besser bauen.', range: 'Tag 08 bis 14', desc: 'Vom Projektstart bis zur Übergabe.', bild: 'weg-manufaktur', pos: '50% 50%' },
  { name: 'Besser leben.', range: 'Ab Tag 15', desc: 'Vom Einzug an, ein Leben lang.', bild: 'weg-terrasse', pos: '50% 30%' }
];
const MARKEN = ['Start', 'Zwischenziel', 'Ziel'];
/* die 14 Tage und als 15. Eintrag das Ziel (Besser leben) */
const ALLE = [...TAGE, { i: 14, t: LEBEN.h, d: LEBEN.lead, ziel: true }];
const titel = e => e.ziel ? e.t : e.t + '.';
const tagK = i => i < 14 ? `Tag ${pad2(i + 1)} / 14` : 'Ab Tag 15';
const phaseOf = i => i < 7 ? 0 : i < 14 ? 1 : 2;
const IMG = n => `assets/img/jh/${n}.jpg`;
const HAUS = '<svg class="jb__haus" viewBox="0 0 44 38" aria-hidden="true"><path d="M3 17 L22 3 L41 17 V37 H3 Z" fill="#fff" stroke="currentColor" stroke-width="1.5" stroke-linejoin="miter"/><rect class="jb__tuer" x="18" y="24" width="8" height="13"/></svg>';
/* gestapelte Texte, die sich überblenden (03, 05): je Eintrag ein Element im selben Rasterfeld */
const stack = (cls, f) => ALLE.map(e => `<p class="${cls}" data-t="${e.i}">${esc(f(e))}</p>`).join('');
const setStack = (root, cur) => $$('[data-t]', root).forEach(el => { const k = +el.dataset.t; el.classList.toggle('is-on', k === cur); el.classList.toggle('is-up', k < cur); });

/* ---------- 01 Brett ---------- */
function v1() {
  const b = $('[data-jb]'), det = $('[data-jb-detail]'); if (!b) return;
  const fld = TAGE.map(t => `<button type="button" class="jb__f" data-d="${t.i}" style="--c:${t.i + 1};--pc:${t.i % 7 + 1};--pr:${t.i < 7 ? 2 : 4}" aria-label="Tag ${pad2(t.i + 1)}, ${esc(t.t)}"><span class="jb__sq"></span><span class="jb__no">${pad2(t.i + 1)}</span></button>`).join('');
  b.innerHTML = `<div class="jb__marks">${MARKEN.map((m, k) => `<p class="jb__mk jb__mk--${k}"><i></i><span class="info">${m}</span></p>`).join('')}</div>
    <div class="jb__track">
      <span class="jb__line jb__line--all"><i></i></span><span class="jb__line jb__line--a"><i></i></span><span class="jb__line jb__line--b"><i></i></span>
      ${fld}
      <button type="button" class="jb__f jb__f--ziel" data-d="14" aria-label="Ab Tag 15, Besser leben">${HAUS}<span class="jb__no">15</span></button>
    </div>
    <div class="jb__phasen">${PHASEN.map((p, k) => `<div class="jb__ph jb__ph--${k}"><p class="info">${p.range}</p><p class="jb__pn">${esc(p.name)}</p><p class="jb__pd">${esc(p.desc)}</p></div>`).join('')}</div>`;
  det.innerHTML = `<p class="info jb__dk" data-dk></p><p class="jb__dt" data-dt></p><p class="jb__dd" data-dd></p>`;
  const F = $$('.jb__f', b), dk = $('[data-dk]', det), dt = $('[data-dt]', det), dd = $('[data-dd]', det), PH = $$('.jb__ph', b);
  let cur = -1, hold = 0, hov = false, vis = false, on = false, swap;
  const fill = k => {
    b.style.setProperty('--p-all', k < 0 ? 0 : k >= 14 ? 1 : (k / 14.6).toFixed(4));
    b.style.setProperty('--p-a', k < 0 ? 0 : cl(k / 6).toFixed(4));
    b.style.setProperty('--p-b', k < 7 ? 0 : cl((k - 7) / 6).toFixed(4));
  };
  const set = k => {
    if (k === cur) return; cur = k;
    F.forEach((f, j) => { f.classList.toggle('is-done', j < k); f.classList.toggle('is-cur', j === k); });
    PH.forEach((p, j) => p.classList.toggle('is-cur', j === phaseOf(k)));
    fill(k);
    const e = ALLE[k], put = () => { dk.textContent = tagK(k); dt.textContent = titel(e); dd.textContent = e.d; det.classList.remove('is-chg'); };
    clearTimeout(swap);
    if (reduce || !dt.textContent) put(); else { det.classList.add('is-chg'); swap = setTimeout(put, 220); }
  };
  const start = () => { if (on) return; on = true; b.classList.add('is-in'); setTimeout(() => set(0), reduce ? 0 : 900); };
  new IntersectionObserver(es => es.forEach(e => { vis = e.isIntersecting; if (vis) start(); }), { threshold: .3 }).observe(b);
  /* Selbstlauf: alle 2,4 s der nächste Tag; am Ziel etwas länger, dann von vorn */
  let wait = 0;
  setInterval(() => {
    if (!on || !vis || reduce || hov || Date.now() < hold || cur < 0) return;
    if (cur === 14 && ++wait < 2) return; wait = 0;
    set((cur + 1) % 15);
  }, 2400);
  b.addEventListener('pointerover', e => { const f = e.target.closest('.jb__f'); if (f && e.pointerType === 'mouse') { hov = true; set(+f.dataset.d); } });
  b.addEventListener('pointerleave', () => { if (hov) { hov = false; hold = Date.now() + 2500; } });
  b.addEventListener('click', e => { const f = e.target.closest('.jb__f'); if (f) { set(+f.dataset.d); hold = Date.now() + 9000; } });
  b.addEventListener('focusin', e => { const f = e.target.closest('.jb__f'); if (f) { set(+f.dataset.d); hold = Date.now() + 9000; } });
}

/* ---------- 02 Etappen ---------- */
function v2() {
  const el = $('[data-je]'); if (!el) return;
  el.innerHTML = PHASEN.map((p, k) => {
    const days = k < 2 ? TAGE.slice(k * 7, k * 7 + 7).map(t => [pad2(t.i + 1), t.t]) : LEBEN.punkte.map((t, j) => [pad2(j + 1), t]);
    const sq = k < 2 ? 7 : 1;
    return `<article class="je__c" data-reveal="${k * 120}">
      <a class="je__pic" href="https://griffner.com/journey" tabindex="-1" aria-hidden="true" data-par><span class="je__par"><img src="${IMG(p.bild)}" alt="" loading="lazy" decoding="async" style="object-position:${p.pos}"></span></a>
      <p class="je__sq" aria-hidden="true">${'<i></i>'.repeat(sq)}</p>
      <p class="info je__r">${p.range}</p>
      <h3 class="je__t">${esc(p.name)}</h3>
      <p class="je__d">${esc(p.desc)}</p>
      <ol class="je__days">${days.map(([n, t]) => `<li><span class="je__dn">${n}</span><span>${esc(t)}</span></li>`).join('')}</ol>
    </article>`;
  }).join('');
}

/* Parallaxe für die Bilder in 02: die Ebene läuft gegen die Bewegung (8 %) */
function parallax() {
  if (reduce) return;
  const els = $$('[data-par]').map(el => ({ el, p: el.firstElementChild }));
  loop.add({ tick() {
    const vh = innerHeight;
    els.forEach(({ el, p }) => {
      const r = el.getBoundingClientRect(); if (r.bottom < -80 || r.top > vh + 80) return;
      const d = cl((r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2), -1, 1);
      p.style.transform = `translate3d(0,${(-d * r.height * .08).toFixed(1)}px,0)`;
    });
  } });
}

/* ---------- 03 Vierzehn ---------- */
function v3() {
  const runEl = $('[data-jv-run]'); if (!runEl) return;
  const num = $('[data-jv-num]'), k = $('[data-jv-k]'), ts = $('[data-jv-ts]'), xs = $('[data-jv-xs]'), bar = $('[data-jv-bar]');
  num.innerHTML = ALLE.map(e => `<span class="jv__n" data-t="${e.i}">${pad2(e.i + 1)}</span>`).join('');
  ts.innerHTML = stack('jv__t', titel); xs.innerHTML = stack('jv__x', e => e.d);
  bar.innerHTML = `<div class="jv__segs">${ALLE.map(e => `<span class="jv__seg${e.ziel ? ' jv__seg--ziel' : ''}"><i></i></span>`).join('')}</div>
    <div class="jv__phs">${PHASEN.map((p, j) => `<p class="jv__ph jv__ph--${j}"><span class="info">${p.range}</span><span class="jv__pn">${esc(p.name)}</span></p>`).join('')}</div>`;
  const SEG = $$('.jv__seg i', bar), PH = $$('.jv__ph', bar);
  let cur = -1;
  loop.add({ tick() {
    const r = runEl.getBoundingClientRect(); if (r.bottom < -40 || r.top > innerHeight + 40) return;
    const f = cl(runP(runEl) * 1.07) * 15;              /* 0 bis 15; ab 14 ist das Ziel dran */
    SEG.forEach((s, j) => { s.style.transform = `scaleX(${cl(f - j).toFixed(3)})`; });
    const c = Math.min(14, Math.floor(f));
    if (c === cur) return; cur = c;
    setStack(num, c); setStack(ts, c); setStack(xs, c);
    k.textContent = tagK(c);
    PH.forEach((p, j) => p.classList.toggle('is-cur', j === phaseOf(c)));
  } });
}

/* ---------- 04 Bild ---------- */
function v4() {
  const fr = $('[data-jp-frame]'); if (!fr) return;
  const clip = $('[data-jp-clip]'), img = $('[data-jp-img]'), L = $$('[data-jp-l]'), ph = $('[data-jp-phasen]');
  ph.innerHTML = PHASEN.map((p, k) => `<div class="jp__ph" data-reveal="${k * 120}"><p class="jp__sq" aria-hidden="true">${'<i></i>'.repeat(k < 2 ? 7 : 1)}</p><p class="info">${p.range}</p><p class="jp__pn">${esc(p.name)}</p><p class="jp__pd">${esc(p.desc)}</p></div>`).join('');
  loop.add({ tick() {
    const r = fr.getBoundingClientRect(); if (r.bottom < -40 || r.top > innerHeight + 40) return;
    const W = innerWidth, H = innerHeight, mob = W < 900;
    /* p: 0, wenn das Bild unten hereinkommt, bis 1, wenn es oben anliegt und der Lauf vorbei ist */
    const p = reduce ? 1 : cl((H - r.top) / (r.height));
    const o = sm(cl((p - .12) / .42));                     /* öffnen */
    const iy = (1 - o) * H * (mob ? .1 : .14), ix = (1 - o) * W * (mob ? .06 : .16);
    clip.style.clipPath = `inset(${iy.toFixed(1)}px ${ix.toFixed(1)}px)`;
    img.style.transform = `scale(${(1.16 - .16 * o).toFixed(4)})`;
    L.forEach((l, j) => { const t = sm(cl((p - .36 - j * .07) / .2)); l.style.transform = `translate3d(0,${((1 - t) * 105).toFixed(1)}%,0)`; });
  } });
}

/* ---------- 05 Fahrt ---------- */
function v5() {
  const runEl = $('[data-jf-run]'); if (!runEl) return;
  const cam = $('[data-jf-cam]'), fit = $('[data-jf-fit]'), k = $('[data-jf-k]'), ts = $('[data-jf-ts]'), xs = $('[data-jf-xs]'), bar = $('[data-jf-bar]');
  const G = 120, T = 84, B = 54, HH = [30, 40, 36, 50, 44, 56, 66, 38, 46, 54, 52, 62, 68, 76];
  /* Weg: Tag 01 bis 07 nach rechts, hinunter zum Zwischenziel, Tag 08 bis 14 zurück nach links, dann das Ziel */
  const R = TAGE.map(t => t.i < 7 ? [t.i * G, 0] : [(13 - t.i) * G, 2 * G]); R.push([-1.6 * G, 2 * G]);
  const D = [0]; for (let j = 1; j < R.length; j++) D.push(D[j - 1] + Math.abs(R[j][0] - R[j - 1][0]) + Math.abs(R[j][1] - R[j - 1][1]));
  const LEN = D[D.length - 1];
  const box = (cls, w, d, x, y, extra = '') => `<div class="jf__b${cls}" style="--w:${w}px;--d:${d}px;left:${x - w / 2}px;top:${y - d / 2}px"><i class="t"></i><i class="n"></i><i class="w"></i><i class="e"></i><i class="s">${extra}</i></div>`;
  const path = `M${R[0][0]} ${R[0][1]} H${R[6][0]} V${R[7][1]} H${R[14][0]}`;
  cam.innerHTML = `<svg class="jf__route" viewBox="-320 -140 1200 520" style="left:-320px;top:-140px;width:1200px;height:520px"><path class="jf__r0" d="${path}"/><path class="jf__r1" d="${path}" style="stroke-dasharray:${LEN};stroke-dashoffset:${LEN}" data-jf-r/></svg>`
    + TAGE.map(t => `<div class="jf__tile" style="left:${R[t.i][0] - T / 2}px;top:${R[t.i][1] - T / 2}px;width:${T}px;height:${T}px"><span class="jf__no">${pad2(t.i + 1)}</span></div>`).join('')
    + `<div class="jf__tile jf__tile--ziel" style="left:${R[14][0] - 70}px;top:${R[14][1] - 56}px;width:140px;height:112px"></div>`
    + [[0, 'Start'], [7, 'Zwischenziel'], [14, 'Ziel']].map(([j, m]) => `<p class="jf__mk info" style="left:${R[j][0] - (j === 14 ? 70 : T / 2)}px;top:${R[j][1] + (j === 0 ? -T / 2 - 30 : (j === 14 ? 64 : T / 2 + 12))}px"><i></i>${m}</p>`).join('')
    + TAGE.map(t => box('', B, B, R[t.i][0], R[t.i][1])).join('')
    + box(' jf__b--haus', 104, 72, R[14][0], R[14][1], '<b class="jf__win"></b><b class="jf__win jf__win--2"></b>');
  ts.innerHTML = stack('jf__t', titel); xs.innerHTML = stack('jf__x', e => e.d);
  bar.innerHTML = PHASEN.map((p, j) => `<div class="jf__p" data-p="${j}"><span class="jf__pt"><span class="jf__pno">${pad2(j + 1)}</span><span class="jf__pn">${esc(p.name.replace('.', ''))}</span></span><span class="jf__pl"><i></i></span></div>`).join('');
  const BL = $$('.jf__b', cam), RT = $('[data-jf-r]', cam), PF = $$('.jf__pl i', bar), PP = $$('.jf__p', bar);
  const HX = [...HH, 80];
  /* Mitte des Bretts: am Rechner folgt die Kamera nur halb (FOLGE), so bleibt fast das ganze Brett im Ausschnitt; am Telefon ganz */
  const MX = 250, MY = 120; let FOLGE = 1;
  let cx = MX, cy = MY, cur = -1, s = 1;
  const size = () => { const W = innerWidth, mob = W < 900; s = mob ? cl(W / 560, .5, .78) : cl(W / 1850, .56, .92); FOLGE = mob ? 1 : .5; fit.style.setProperty('--s', s.toFixed(3)); };
  size(); addEventListener('resize', size);
  const hs = BL.map(() => -1);
  loop.add({ tick() {
    const r = runEl.getBoundingClientRect(); if (r.bottom < -40 || r.top > innerHeight + 40) return;
    const f = cl(runP(runEl) * 1.08) * 14;             /* 0 bis 14; 14 ist das Ziel */
    const j = Math.min(13, Math.floor(f)), fr = f - j;
    const px = R[j][0] + (R[j + 1][0] - R[j][0]) * fr, py = R[j][1] + (R[j + 1][1] - R[j][1]) * fr;
    const tx = MX + (px - MX) * FOLGE, ty = MY + (py - MY) * FOLGE;
    const a = reduce ? 1 : .14; cx += (tx - cx) * a; cy += (ty - cy) * a;
    if (Math.abs(tx - cx) + Math.abs(ty - cy) > .4) loop.poke(); else { cx = tx; cy = ty; }
    cam.style.transform = `rotateX(56deg) rotateZ(-34deg) translate3d(${(-cx).toFixed(1)}px,${(-cy).toFixed(1)}px,0)`;
    RT.style.strokeDashoffset = (LEN - (D[j] + (D[j + 1] - D[j]) * fr)).toFixed(1);
    BL.forEach((b, q) => { const h = Math.round(HX[q] * sm((f - q + .55) / .5)); if (h !== hs[q]) { hs[q] = h; b.style.setProperty('--h', h + 'px'); b.classList.toggle('is-up', h > 0); } });
    PF[0].style.transform = `scaleX(${cl((f + .5) / 7).toFixed(3)})`;
    PF[1].style.transform = `scaleX(${cl((f + .5 - 7) / 7).toFixed(3)})`;
    PF[2].style.transform = `scaleX(${cl((f - 13.5) / .5).toFixed(3)})`;
    const c = Math.min(14, Math.floor(f + .5));
    if (c === cur) return; cur = c;
    BL.forEach((b, q) => b.classList.toggle('is-cur', q === c));
    setStack(ts, c); setStack(xs, c); k.textContent = tagK(c);
    PP.forEach((p, q) => p.classList.toggle('is-cur', q === phaseOf(c)));
  } });
}

run('chrome', initChrome);
run('v1', v1); run('v2', v2); run('v3', v3); run('v4', v4); run('v5', v5); run('par', parallax); run('sw', sw);
reveal(document);
loop.start(frame);
if (document.fonts) document.fonts.ready.then(() => loop.poke());
addEventListener('load', () => loop.poke());
