/* Runde 56: Services Übersicht eins zu eins im Entwurf „GRIFFNER Services v2“ (Kunde, Stand 12.11.2026, Kopf „komplex“). Ein gepinnter
   Film (#s-film) über dem 3D Modell des Entwurfs (js/svc-film3d.js, aus dem Entwurf gebaut). Hier, wie die Seite im Entwurf (S2Services):
   Fortschritt P aus dem Scrollen (Gewichte des Entwurfs), der Einstieg „Hausbau ist komplex“ Wort für Wort, die Wörter um die Baustelle,
   das Logo, das aus der Kopfzeile auf den Baucontainer fliegt, die Texte der Kapitel ein und aus, die Tabelle der Gesamtinvestition
   (Runde 57, das 3D blendet dafür aus), der Bauzeitplan der Bauleitung, die Knöpfe der Innenausstattung, „Deins. Einmal.“,
   die Karte zu einem Punkt im Haus.
   Anders als im Entwurf (Wunsch des Kunden, Runde 55): drei schwarze Zwischentitel vor Besser planen, Besser bauen und Besser leben,
   und die größere Leiste unten. Texte aus data/leistungen.js (FILM), in Framer aus dem Markup.
   Runde 66 (Entwurf 13.11.2026): zwei eingeschobene Szenen, in denen P stillsteht (FILM.einschub): Architekturkonzept bei P 4 (Tafel,
   das 3D schwarz verdeckt) und Raumgefühl bei P 9.3 (Kamera im Haus, Maße). Dazu Projektsteuerung mit Verlauf (P 6 bis 6.6, 3D verdeckt),
   der Bauzeitplan entfällt. Am Telefon passen Tafel und Verlauf zwischen Kopfzeile und Text (gemessen), nichts liegt übereinander. */
import { loop, $, $$, reduce, vhs } from './core.js';
import { FILM } from '../data/leistungen.js';

const cl = t => Math.max(0, Math.min(1, t)), sm = t => (t = cl(t), t * t * (3 - 2 * t)), eo = x => 1 - Math.pow(1 - cl(x), 3);
const escH = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/* Sprung auf griffner.com über SmoothScroll (Lenis, Vorhang bei weiten Wegen), im Prototyp weich */
function jumpY(y) {
  const g = globalThis;
  if (g.__griffnerJump) g.__griffnerJump(y);
  else scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
}
const HOTS = ['fenster', 'parkett', 'fliesen', 'bad'];
/* Logo der Kopfzeile, in das das fliegende Logo zurückkehrt: im Entwurf [data-dock="home"], auf griffner.com die Wortmarke „Marke“ */
const dock = () => document.querySelector('[data-dock="home"]') || document.querySelector('a[data-framer-name="Marke"]') || document.querySelector('[data-header] .hd__logo, [data-header] a[href]');

export function initServicesFilm() {
  const r = $('[data-svf]'); if (!r) return;
  const film = $('[data-film]', r), stage = $('[data-stage]', r);
  const ch = $$('[data-ch]', r), herok = $('[data-hero-k]', r), nav = $('[data-snav]', r), hp = $('[data-hp]', r), scrim = $('[data-scrim]', r);
  const einmal = $('[data-einmal]', r), sw = $$('[data-sw]', r), kdim = $('[data-kdim]', r);
  /* Runde 57: Tabelle der Gesamtinvestition (Entwurf data-ledger) */
  const lg = $('[data-ledger]', r), lrow = lg ? $$('[data-lrow]', lg).map(el => ({ el, bar: $('[data-lbar]', el), mk: $('[data-lmark]', el) })) : [], lseg = lg ? $$('[data-lseg]', lg) : [];
  const LZ = FILM.summe.zeilen.map(z => z[3]);
  /* Runde 66: Architekturkonzept (Tafel), Projektsteuerung (Verlauf), Raumgefühl (Maße), das Schwarz über dem 3D und die Texte der Einschübe */
  const stil = $('[data-stil]', r), board = stil && $('[data-stil-board]', stil), msvg = board && $('svg', board), mwrap = board && $('[data-mwrap]', board), myel = board && $('[data-myel]', board);
  const mlab = board ? $$('[data-ml]', board) : [], mhead = mlab.filter(t => t.dataset.ml[0] === 'h'), mhp = {};
  if (board) $$('[data-hp]', board).forEach(g => { mhp[g.dataset.hp] = { p: g.firstElementChild, px: +g.dataset.px, py: +g.dataset.py }; });
  const mding = board ? $$('[data-ms]', board).map(g => { const d = g.dataset, i = +d.ms; return { g, p: g.firstElementChild, i, tx: +d.tx, ty: +d.ty, sel: !!d.sel, cx: +d.cx, cy: +d.cy, s: +d.s, lab: board.querySelector('[data-ml="' + i + '"]') }; }) : [];
  const ps = $('[data-psteu]', r), psv = ps && $('svg', ps), pst = ps ? $$('text', ps) : [];
  const psl = ps ? [0, 1, 2].map(i => ({ a: $('[data-psa="' + i + '"]', ps), b: $('[data-psb="' + i + '"]', ps), c: $('[data-psc="' + i + '"]', ps), y0: 80 + 60 * i })) : [];
  const psm = ps ? $$('[data-psm]', ps).map(c => ({ c, x: +c.dataset.x })) : [], psn = ps ? $$('[data-psl]', ps) : [], psh = ps && $('[data-psh]', ps), psr = ps && $('[data-psr]', ps);
  const rm = $('[data-raum]', r), rdg = rm ? $$('[data-rdg]', rm).map(g => ({ g, l: $('[data-rdl]', g), t: $('[data-rdt]', g) })) : [], rw = rm ? $$('[data-rw]', rm) : [];
  const chx = $$('[data-chx]', r), stilTx = chx.find(e => e.dataset.chx === 'stil'), raumTx = chx.find(e => e.dataset.chx === 'raum');
  const cov = $('[data-cov]', r), l3 = $('[data-l3]', r);
  const ts = $('[data-ts]', r), tsb = $$('[data-tsb]', r).map(el => ({ el, w: $$('.w>span', el), y: [] }));
  const W = FILM.gewichte, PA = FILM.pausen, EIN = FILM.einschub || [];
  /* Ablauf: Kapitel k mit Gewicht W[k], vor P 4, 6 und 8 je ein Zwischentitel; die Einschübe teilen ihr Kapitel (wie tools/services-seiten.mjs) */
  const SEQ = [];
  W.forEach((w, k) => {
    PA.forEach((p, i) => { if (p.at === k) SEQ.push({ w: p.w, ts: i }); });
    let a = k;
    EIN.filter(e => e.p >= k && e.p < k + 1).sort((x, y) => x.p - y.p).forEach(e => { if (e.p > a) SEQ.push({ w: w * (e.p - a), k, a, b: e.p }); SEQ.push({ w: e.w, ins: e.key, p: e.p }); a = e.p; });
    SEQ.push({ w: w * (k + 1 - a), k, a, b: k + 1 });
  });
  const TW = SEQ.reduce((a, q) => a + q.w, 0);
  let eng = null, focus = null, P = 0, T = { i: -1, u: 0, ins: {} }, ePrev = null, lastNav = '';

  /* Fortschritt: 0 wenn der Film oben ankommt, 12 wenn er unten wegfährt. Im Zwischentitel steht P kurz vor (erste Hälfte) oder
     kurz nach (zweite Hälfte) seiner Stelle, unter dem Schwarz springt das Modell zur nächsten Szene. ins: je Einschub -1 (noch nicht),
     0 bis 1 (läuft, P steht still) oder 2 (vorbei), wie im Entwurf */
  const insAt = (n, f) => { const o = {}; SEQ.forEach((q, x) => { if (q.ins) o[q.ins] = x < n ? 2 : x === n ? f : -1; }); return o; };
  const P0 = () => {
    if (globalThis.__svcTS) { const { i, u } = globalThis.__svcTS; return { P: PA[i].at + (u < .5 ? -1e-4 : 1e-4), i, u, ins: insAt(SEQ.findIndex(q => q.ts === i), -1) }; }
    if (globalThis.__svcP != null) return { P: globalThis.__svcP, i: -1, u: 0, ins: globalThis.__svcIns || {} };
    const b = film.getBoundingClientRect(), h = stage.clientHeight || vhs();
    let u = cl(-b.top / Math.max(1, b.height - h)) * TW;
    for (let x = 0; x < SEQ.length; x++) {
      const q = SEQ[x];
      if (u < q.w) {
        const f = u / q.w, ins = insAt(x, q.ins ? f : -1);
        if (q.ts != null) return { P: PA[q.ts].at + (f < .5 ? -1e-4 : 1e-4), i: q.ts, u: f, ins };
        if (q.ins) return { P: q.p, i: -1, u: 0, ins };
        return { P: q.a + f * (q.b - q.a), i: -1, u: 0, ins };
      }
      u -= q.w;
    }
    return { P: 12, i: -1, u: 0, ins: insAt(SEQ.length, -1) };
  };
  /* Zum Prüfen: Scrollposition zu P (oder zu einem Einschub mit Anteil f) */
  globalThis.__svcY = (p, key, f = .5) => {
    let u = 0;
    for (const q of SEQ) { if (key ? q.ins === key : q.k != null && p >= q.a && p < q.b) { u += key ? f * q.w : (p - q.a) / (q.b - q.a) * q.w; break; } u += q.w; }
    const fb = film.getBoundingClientRect(); return fb.top + scrollY + u / TW * Math.max(1, fb.height - (stage.clientHeight || vhs()));
  };

  /* Einstieg „komplex“ (Entwurf hk0 bis hk5): Zeilen in Masken, Wort für Wort. hk0 kommt nach dem Laden, die übrigen mit dem Scrollen */
  const hk = herok ? $$('[data-hk]', herok).map(el => ({ el, i: +el.dataset.hk, w: $$('.w>span', el), y: [] })) : [];
  const SPK = { 0: [null, [.12, .2]], 1: [[.72, .8], [1.0, 1.07]], 3: [[1.1, 1.2], [2.42, 2.5]], 4: [[1.46, 1.56], [2.42, 2.5]], 5: [[2.56, 2.66], [3.9, 3.98]] };
  const t0 = performance.now();
  const mkEl = (id, k) => r.querySelector(`[data-mk="${id}"] [data-k="${k}"]`);

  /* Karte zu einem Punkt im Haus: Texte aus dem versteckten Markup (in Framer bearbeitbar), sonst aus data/leistungen.js */
  const D = { ...FILM.punkte };
  $$('[data-pt]', r).forEach(el => {
    const g = k => { const e = $(`[data-k="${k}"]`, el); return e ? e.textContent.trim() : ''; };
    D[el.dataset.pt] = { t: g('t'), x: g('x'), f: [[g('f1'), g('f1s')], [g('f2'), g('f2s')]].filter(([a]) => a) };
  });
  function setFocus(id) {
    if (id && focus === id) id = null;
    if (id && !D[id]) id = null;
    focus = id || null;
    if (eng) eng.setFocus(focus);
    if (focus) {
      const c = D[focus];
      $('[data-hp-title]', hp).textContent = c.t; $('[data-hp-text]', hp).textContent = c.x;
      $('[data-hp-facts]', hp).innerHTML = c.f.map(([a, b]) => `<div class="svf-hp__f"><b>${escH(a)}</b><span>${escH(b)}</span></div>`).join('');
    }
    r.classList.toggle('is-focus', !!focus);
    hp.setAttribute('aria-hidden', focus ? 'false' : 'true');
    frame(true);
    if (focus) requestAnimationFrame(() => { const b = $('[data-hp-close]', hp); b && b.focus({ preventScroll: true }); });
  }
  r.addEventListener('click', e => {
    const t = e.target; if (!t.closest) return;
    if (t.closest('[data-hp-close]')) { setFocus(null); return; }
    const hb2 = t.closest('[data-hotbtn]'); if (hb2) { setFocus(hb2.dataset.hotbtn); return; }
    /* Runde 53: Sprünge im Film sind Knöpfe (data-jump), keine Anker: kein #… in der Adresse, nichts, was Framer oder der Browser selbst springen lässt */
    const j = t.closest('[data-jump]');
    if (j) { const el = document.getElementById(j.dataset.jump); if (el) { e.preventDefault(); jumpY(el.getBoundingClientRect().top + scrollY); } }
  });
  addEventListener('keydown', e => { if (e.key === 'Escape' && focus) setFocus(null); });
  /* Runde 52: ein Klick irgendwo außerhalb der Karte schließt sie auch (die Punkte und Knöpfe halten ihren Klick an) */
  document.addEventListener('click', e => {
    if (!focus) return;
    const t = e.target;
    if (t && t.closest && (t.closest('[data-hp]') || t.closest('[data-svf] [data-l3] button') || t.closest('[data-hotbtn]'))) return;
    setFocus(null);
  });

  /* ===== Runde 66: Szenen des Entwurfs (S2Services stilFrame), Zeiten und Bewegungen eins zu eins ===== */
  const lp = (a, b, k) => a + (b - a) * k;
  /* Schrift in SVG immer gleich groß am Bildschirm (Entwurf: 11 px durch den Maßstab der Zeichnung) */
  const svgFont = (sv, list, px, tag = '') => { const m = sv.getScreenCTM(), fs = m && m.a ? (px / m.a).toFixed(2) + 'px' : ''; if (fs && sv['_fs' + tag] !== fs) { sv['_fs' + tag] = fs; list.forEach(t => { t.style.fontSize = fs; }); } };
  /* Telefon: Tafel und Verlauf stehen zwischen Kopfzeile und dem Text ihres Kapitels, so groß wie die Breite erlaubt, in der freien Fläche
     etwas über der Mitte (gemessen, neu je Größe der Bühne und Höhe des Texts). Am Telefon zeigt die Zeichnung nur ihren Inhalt (vbN),
     damit sie größer wird. Desktop: Lage aus css/svc-film.css (rechts neben dem Text, wie im Entwurf) */
  const fitBox = (el, sv, txt, vbW, vbN) => {
    const w = stage.clientWidth, h = stage.clientHeight, key = w + 'x' + h + ':' + (txt ? txt.offsetTop : 0);
    if (el._fit === key) return; el._fit = key;
    const nw = w < 900 && !!txt, vb = nw ? vbN : vbW; if (sv.getAttribute('viewBox') !== vb) { sv.setAttribute('viewBox', vb); sv._fs = sv._fsk = ''; }
    if (!nw) { el.style.top = el.style.bottom = el.style.height = ''; return; }
    const [, , vw, vh] = vb.split(' ').map(Number), t0 = h < 700 ? 76 : 88, room = txt.offsetTop - 16 - t0, hh = Math.max(90, Math.min(room, el.clientWidth * vh / vw));
    el.style.top = Math.round(t0 + Math.max(0, room - hh) * .42) + 'px'; el.style.bottom = 'auto'; el.style.height = Math.round(hh) + 'px';
  };
  const showTx = (el, v, dy) => { const o = v.toFixed(3), vis = v > .002 ? 'visible' : 'hidden'; if (el.style.opacity !== o) el.style.opacity = o; if (el.style.visibility !== vis) el.style.visibility = vis; el.style.transform = 'translate3d(0,' + dy.toFixed(1) + 'px,0)'; el.classList.toggle('is-act', v > .5); };
  /* Architekturkonzept: neun Dinge zeichnen sich in drei Spalten, das gelbe Feld wählt Viel Licht, Satteldach und Holz, die fliegen in
     die Hauszeichnung, die übrigen blenden ab; zum Schluss wird die Zeichnung größer und blendet aus */
  function stilFrame(st) {
    if (!stil) return;
    const act = st >= 0 && st <= 1, bg = act ? sm(st / .05) : 0, cf = 1 - sm((st - .86) / .1), o = bg.toFixed(3), vis = bg > .001 ? 'visible' : 'hidden';
    if (stil.style.opacity !== o) stil.style.opacity = o; if (stil.style.visibility !== vis) stil.style.visibility = vis;
    if (bg <= .001) { if (stilTx.style.visibility !== 'hidden') showTx(stilTx, 0, 16); return; }
    fitBox(board, msvg, stilTx, '40 30 520 320', '70 30 460 322');
    const tv = sm((st - .04) / .08); showTx(stilTx, tv * cf, (1 - tv) * 16); board.style.opacity = cf.toFixed(3);
    const tm = reduce ? 0 : performance.now() / 1000, fd = sm((st - .62) / .05), as = sm((st - .66) / .16);
    const STOP = [[660, 330], [140, 100], [460, 100], [460, 195]], T0 = .4, SG = .07, MV = .03, arr = [];
    let yx = STOP[0][0], yy = STOP[0][1];
    for (let j = 0; j < 3; j++) { const t0 = T0 + j * SG, k = sm((st - t0) / MV); arr.push(t0 + MV * .8); if (st >= t0) { yx = lp(STOP[j][0], STOP[j + 1][0], k); yy = lp(STOP[j][1], STOP[j + 1][1], k); } }
    const yo = sm((st - T0) / .03) * (1 - sm((st - .62) / .04)); myel.setAttribute('opacity', (yo * .5).toFixed(3)); myel.setAttribute('x', (yx - 35).toFixed(1)); myel.setAttribute('y', (yy - 28).toFixed(1));
    const PICK = { 5: arr[0], 0: arr[1], 7: arr[2] };
    mding.forEach(d => {
      const i = d.i, t0 = .04 + i * .028, ap = sm((st - t0) / .06), dr = sm((st - t0) / .12), dx = Math.sin(tm * .6 + i) * 3 * (1 - as), dy = Math.cos(tm * .5 + i * 1.3) * 3 * (1 - as), tx = d.tx + dx, ty = d.ty + dy;
      d.p.style.strokeDashoffset = (1 - dr).toFixed(3);
      if (d.sel) { const h = mhp[i], mv = sm(as / .55); d.g.setAttribute('transform', 'translate(' + lp(tx, h.px, mv).toFixed(2) + ' ' + lp(ty, h.py, mv).toFixed(2) + ') scale(' + d.s + ') translate(' + (-d.cx) + ' ' + (-d.cy) + ')'); d.g.setAttribute('opacity', (ap * (1 - sm((as - .45) / .3))).toFixed(3)); h.p.style.strokeDashoffset = (1 - sm((as - .35) / .6)).toFixed(3); }
      else { d.g.setAttribute('transform', 'translate(' + tx.toFixed(2) + ' ' + ty.toFixed(2) + ') scale(.8)'); d.g.setAttribute('opacity', (ap * (1 - .82 * fd) * (1 - as)).toFixed(3)); }
      d.lab.setAttribute('opacity', (ap * (d.sel ? 1 : 1 - .82 * fd) * (1 - as)).toFixed(3)); d.lab.classList.toggle('is-on', d.sel && st >= PICK[i]);
    });
    svgFont(msvg, mlab, 11);
    /* Kleine Tafel (kurze Telefone): die Namen rücken so weit nach unten, dass sie nicht an ihr Ding stoßen */
    if (msvg._ly !== msvg._fs) { msvg._ly = msvg._fs; const fu = parseFloat(msvg._fs) || 9, dy = Math.max(0, .7 * fu - 9.5); mding.forEach(d => { const y0 = d.lab.dataset.y0 || (d.lab.dataset.y0 = d.lab.getAttribute('y')); d.lab.setAttribute('y', (+y0 + dy).toFixed(1)); }); }
    mhead.forEach(h => h.setAttribute('opacity', (sm((st - .03) / .06) * (1 - as)).toFixed(3)));
    mwrap.setAttribute('transform', 'translate(300 192) scale(' + (1 + .35 * as).toFixed(4) + ') translate(-300 -192)');
    if (!reduce) anim = true;
  }
  /* Projektsteuerung (P 6 bis 6.6): drei unruhige Linien, hinter dem gelben Strich ruhig; unten die Schritte, unter dem Strich der aktuelle */
  function steuerFrame(narrow) {
    if (!ps) return;
    const s = (a, b) => sm((P - a) / (b - a)), v = P >= 5.99 && P < 6.66 ? s(6.02, 6.05) * (1 - s(6.54, 6.59)) : 0, o = v.toFixed(3), vis = v > .001 ? 'visible' : 'hidden';
    if (ps.style.opacity !== o) ps.style.opacity = o; if (ps.style.visibility !== vis) ps.style.visibility = vis;
    if (v <= .001) return;
    /* Telefon: links mehr Platz, damit die Namen der Linien nicht in die Linien reichen; die Phasen oben eine Stufe kleiner, damit
       Planung und Behörden nicht aneinanderstoßen */
    fitBox(ps, psv, ch.find(e => e.dataset.ch === '6'), '0 0 600 300', '-44 18 644 284');
    pst.forEach(t => { if (t.classList.contains('svf-ps__r')) { const x = narrow ? '-44' : '0'; if (t.getAttribute('x') !== x) t.setAttribute('x', x); } });
    svgFont(psv, pst, 11);
    /* Stoßen zwei Phasen oben aneinander (schmales Telefon), steht jede zweite eine Zeile höher (gemessen, auch nach Änderungen in Framer) */
    const sk = psv._fs + narrow; if (psv._stg !== sk) {
      psv._stg = sk; const K = pst.filter(t => t.classList.contains('svf-ps__k')), m = psv.getScreenCTM(), sc = m && m.a ? m.a : 1;
      K.forEach(t => t.setAttribute('y', '40'));
      let clash = false; try { const wd = K.map(t => t.getComputedTextLength()); for (let i = 0; i < K.length - 1; i++) if (+K[i].getAttribute('x') + wd[i] / 2 + 10 / sc > +K[i + 1].getAttribute('x') - wd[i + 1] / 2) clash = true; } catch (e) { /* ohne Maße bleibt eine Zeile */ }
      if (clash) K.forEach((t, i) => { if (i % 2) t.setAttribute('y', String(40 - 15 / sc)); });
    }
    const t = reduce ? 0 : performance.now() / 1000, dr = s(6.03, 6.09), k = cl((P - 6.08) / .42), px = 110 + 480 * k, X1 = 110 + 480 * dr;
    psl.forEach((L, i) => {
      let a = '';
      for (let x = px; x <= X1 + .1; x += 5) { const ramp = sm((x - px) / 40), nn = Math.sin(x * .045 + t * (1.1 + i * .3) + i * 2) * .6 + Math.sin(x * .11 - t * 1.7 + i) * .4; a += (a ? 'L' : 'M') + x.toFixed(1) + ' ' + (L.y0 + nn * 11 * ramp).toFixed(1); }
      L.a.setAttribute('d', a); L.b.setAttribute('d', k > .001 ? 'M110 ' + L.y0 + 'H' + px.toFixed(1) : ''); L.c.setAttribute('cx', px.toFixed(1)); L.c.style.opacity = sm(k / .02).toFixed(3);
    });
    let cur = -1;
    psm.forEach((m, i) => { const on = px >= m.x - .5; if (on) cur = i; m.c.classList.toggle('is-on', on); m.c.style.opacity = dr.toFixed(3); });
    psh.setAttribute('d', 'M' + px.toFixed(1) + ' 52V262'); psr.setAttribute('x', (px - 8).toFixed(1));
    const hv = sm(k / .02).toFixed(3); psh.style.opacity = hv; psr.style.opacity = hv;
    psn.forEach((tx, i) => {
      const on = i === cur; tx.setAttribute('opacity', on ? '1' : '0'); if (!on) return;
      let hw = 0; try { hw = tx.getComputedTextLength() / 2; } catch (e) { /* noch nicht gesetzt */ }
      tx.setAttribute('x', Math.min(Math.min(540, 600 - hw), Math.max(Math.max(160, hw + (narrow ? -40 : 0)), px)).toFixed(1));
    });
    if (!reduce) anim = true;
  }
  /* Raumgefühl (Einschub bei P 9.3): Kamera ins Haus (Entwurf K), gelbe Maße am Fenster, an der Raumhöhe und bis unter den First;
     danach führt die Kamera durch die Innenausstattung (KI, bis P 10.04). Ein offener Punkt im Haus hat Vorrang (fw) */
  let rOv = 0, rDbl = false, fw = 0;
  const RK = [[0, -48, 6, 7.2, 5.6, 1.3, -3.4], [.3, -40, 6, 7.2, 5.6, 1.3, -3.4], [.4, -14, 4, 7.6, 3.6, 1.45, -5.3], [.6, -20, 4, 7.6, 3.6, 1.45, -5.3], [.72, -30, -28, 3.4, .9, 6.1, -5.0], [1, -22, -25, 3.4, .9, 6.0, -5.0]];
  /* Runde 72 (Kunde: zu plötzlich, gebrochen): nach dem Bad fährt die Kamera in einem Zug in Augenhöhe rückwärts aus dem Obergeschoß
     (durch die Längswand) und dreht im Bogen zur Ansicht der Betriebskosten (ausCam) */
  const RKI = [[9.3, -22, -25, 3.4, .9, 6.0, -5.0, 70], [9.33, -22, -25, 3.4, .9, 6.0, -5.0, 70], [9.42, 58, 19, 3.6, -1.9, 3.55, -3.4, 62], [9.5, 50, 17, 3.5, -1.9, 3.55, -3.3, 62], [9.6, 27, 23.5, 2.64, 2.8, 3.4, -3.9, 62], [9.7, 36, 22, 2.6, 2.8, 3.4, -3.9, 62], [9.8, -119, 16, 2.6, 4.4, 4.2, -2.4, 62], [9.94, -110, 16, 2.6, 4.4, 4.2, -2.4, 62]];
  /* Ausfahrt (P 9.94 bis 10.14) als eine Kurve: Lage auf einer Bézierkurve vom Bad nach Westen durch die Längswand (unter der Traufe,
     y um 5 m) und im Bogen nach vorn, Blick gleitet vom Bad zur Hausmitte; Ende = Kamera des Films bei P 10.14 (Betriebskosten) */
  const orb = c => { const A = c[0] * Math.PI / 180, E = c[1] * Math.PI / 180, d = c[2]; return [c[3] + d * Math.cos(E) * Math.sin(A), c[4] + d * Math.sin(E), c[5] + d * Math.cos(E) * Math.cos(A)]; };
  const AUS = { p0: orb([-110, 16, 2.6, 4.4, 4.2, -2.4]), t0: [4.4, 4.2, -2.4], c: [-22, 4.8, -6], p2: orb([20.8, 10.6, 55.8, 0, 3, 1.3]), t2: [0, 3, 1.3] };
  const ausCam = p => { const u = sm((p - 9.94) / .2), v = 1 - u, k = sm(u), q = [0, 1, 2].map(i => v * v * AUS.p0[i] + 2 * u * v * AUS.c[i] + u * u * AUS.p2[i]), t = [0, 1, 2].map(i => AUS.t0[i] + (AUS.t2[i] - AUS.t0[i]) * k);
    const dx = q[0] - t[0], dy = q[1] - t[1], dz = q[2] - t[2], d = Math.hypot(dx, dy, dz); return [Math.atan2(dx, dz) * 180 / Math.PI, Math.asin(dy / d) * 180 / Math.PI, d, t[0], t[1], t[2], 62 - 32 * sm(u * 1.4)]; };
  /* Runde 72: vom fertigen Haus (Ende Bausystem) in einem Zug über das Haus, das Obergeschoß hebt ab, dann hinunter zum Fenster im
     Erdgeschoß (Kamera des Films bei P 9.12), statt Sprung bei P 9 */
  const RKB = [[8.93, 36, 16, 62, 0, 3.5, 1.3], [9.04, 24, 38, 50, 0, 1.2, 0], [9.15, 10, 30, 17, 1.5, 1.2, -5.0]];
  const keyAt = (K, x) => { let i = 0; while (i < K.length - 2 && x >= K[i + 1][0]) i++; const a = K[i], b = K[i + 1], kk = sm(cl((x - a[0]) / (b[0] - a[0]))), cv = []; for (let j = 1; j < a.length; j++) cv.push(a[j] + (b[j] - a[j]) * kk); return cv; };
  function raumFrame(ra, raA) {
    const E = eng; if (!rm || !E || !E.camOv) return;
    const s = (a, b) => sm((P - a) / (b - a)), pre = ra === -1 && P > 9.02 && P < 9.31 ? s(9.04, 9.09) : 0, bg = raA ? 1 - sm((ra - .94) / .06) : pre, o = bg.toFixed(3), vis = bg > .001 ? 'visible' : 'hidden';
    if (rm.style.opacity !== o) rm.style.opacity = o; if (rm.style.visibility !== vis) rm.style.visibility = vis;
    const fT = focus ? 1 : 0; if (Math.abs(fw - fT) > .002) { fw += (fT - fw) * (reduce ? 1 : .12); anim = true; } else fw = fT;
    if (raA) {
      const cv = keyAt(RK, ra); E.camOv(cv, sm(ra / .08), lp(64, 70, sm((ra - .6) / .12))); E.ogLight && E.ogLight(sm((ra - .64) / .08));
      const rd = ra > .64; if (rDbl !== rd) { rDbl = rd; E.roofDouble && E.roofDouble(rd); } E.dollOv(0, sm((ra - .6) / .1)); rOv = 1;
    } else if (ra === -1 && P >= 8.93 && P < 9.16) {
      const w = sm((P - 8.93) / .04) * (1 - s(9.12, 9.16)) * (1 - fw);
      E.camOv(keyAt(RKB, P), w, 30); E.dollOv(sm((P - 8.95) / .09), 1); rOv = 1;
    } else if (ra === 2 && P >= 9.3 && P < 10.16) {
      const cv = P > 9.94 ? ausCam(P) : keyAt(RKI, P), fv = cv.pop(), w = (1 - s(10.12, 10.16)) * (1 - fw);
      /* das Dach nur von innen doppelseitig, solange die Kamera drin ist (beim Hinausfahren sonst ein graues Bild unter dem Dach) */
      const rd = P < 9.96; if (rDbl !== rd) { rDbl = rd; E.roofDouble && E.roofDouble(rd); }
      E.camOv(cv, w, fv); E.dollOv(0, w); E.ogLight && E.ogLight(w * (1 - s(9.94, 10.04))); rOv = 1;
    } else if (rOv) { rOv = 0; E.camOv(null, 0); E.dollOv(0, 0); if (rDbl) { rDbl = false; E.roofDouble && E.roofDouble(false); } E.ogLight && E.ogLight(0); }
    if (bg <= .001) { if (raumTx.style.visibility !== 'hidden') showTx(raumTx, 0, 0); return; }
    showTx(raumTx, 1, 0);
    /* Telefon: die Maße enden über dem Text (sonst lief die Linie bis unter den First durch Titel und Satz) */
    const rds = rdg.length && rdg[0].g.ownerSVGElement, nwR = stage.clientWidth < 900, lim = nwR ? Math.max(120, raumTx.offsetTop - 6) : 1e5, dk = nwR ? lim + 'px' : '';
    if (rds && rds.style.height !== dk) { rds.style.height = dk; rds.style.overflow = nwR ? 'hidden' : ''; }
    const aw = ra < .38 ? 0 : ra < .66 ? 1 : 2; rw.forEach(sp => sp.classList.toggle('is-on', +sp.dataset.rw === aw));
    /* Maße: 0 = Fenster (Rahmen zeichnet sich), 1 = Raumhöhe, 2 = bis unter den offenen First */
    const SEG = [['huelle', [2, .15, -5.15], [2, 3.0, -5.15], [.42, .6]], ['up', [.9, 3.3, -5.2], null, [.74, 1.05]]];
    { const g = rdg[0], v = sm((ra - .1) / .05) * (1 - sm((ra - .32) / .05)); g.g.setAttribute('opacity', v.toFixed(3)); g.t.setAttribute('opacity', '0');
      if (v > .002) { const C = [[5.9, .15, -4.6], [5.9, .15, -1.8], [5.9, 2.8, -1.8], [5.9, 2.8, -4.6]].map(p => E.pt('huelle', ...p));
        if (C.every(Boolean)) { g.l.setAttribute('d', 'M' + C.map(q => q.x.toFixed(1) + ' ' + q.y.toFixed(1)).join('L') + 'Z'); g.l.setAttribute('pathLength', '1'); g.l.style.strokeDasharray = '1 1'; g.l.style.strokeDashoffset = (1 - sm((ra - .1) / .1)).toFixed(3); } } }
    SEG.forEach(([u, p0, p1, [t0, t1]], j) => {
      const i = j + 1, g = rdg[i], v = sm((ra - t0) / .05) * (1 - sm((ra - t1) / .05)); g.g.setAttribute('opacity', v.toFixed(3)); if (v < .002) return;
      const A0 = E.pt(u, ...p0), A1 = i === 2 ? E.pt('roof', .9, 9.3, -5.2) : E.pt(u, ...p1); if (!A0 || !A1) return;
      const gr = sm((ra - t0) / .08), x1 = lp(A0.x, A1.x, gr), y1 = lp(A0.y, A1.y, gr), dx = A1.x - A0.x, dy = A1.y - A0.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L * 7, ny = dx / L * 7;
      g.l.setAttribute('d', 'M' + (A0.x - nx).toFixed(1) + ' ' + (A0.y - ny).toFixed(1) + 'L' + (A0.x + nx).toFixed(1) + ' ' + (A0.y + ny).toFixed(1) + 'M' + A0.x.toFixed(1) + ' ' + A0.y.toFixed(1) + 'L' + x1.toFixed(1) + ' ' + y1.toFixed(1) + (gr > .98 ? 'M' + (A1.x - nx).toFixed(1) + ' ' + (A1.y - ny).toFixed(1) + 'L' + (A1.x + nx).toFixed(1) + ' ' + (A1.y + ny).toFixed(1) : ''));
      /* Name in der Mitte des sichtbaren Teils der Linie */
      const ya = Math.min(A0.y, lim), yb = Math.min(y1, lim), xa = A0.y > lim && y1 !== A0.y ? lp(A0.x, x1, (lim - A0.y) / (y1 - A0.y)) : A0.x;
      g.t.setAttribute('x', ((xa + x1) / 2 + 14).toFixed(1)); g.t.setAttribute('y', Math.min(lim - 10, (ya + yb) / 2 + 4).toFixed(1)); g.t.setAttribute('opacity', sm((gr - .6) / .4).toFixed(3));
    });
    anim = true;
  }

  /* anim: eine Szene bewegt sich auch ohne Scrollen (Tafel, Linien des Verlaufs, Maße an der Kamera), dann jedes Bild neu */
  let anim = false;
  const iq = (a, b) => (a.stil ?? -1) === (b.stil ?? -1) && (a.raum ?? -1) === (b.raum ?? -1);
  function frame(force) {
    const q = P0();
    if (!force && !anim && Math.abs(q.P - P) < 1e-6 && q.i === T.i && Math.abs(q.u - T.u) < 1e-6 && iq(q.ins, T.ins) && eng && q.i < 0 && !(hk.length && P < .3)) return;
    P = q.P; T = q; anim = false;
    const I = T.ins || {}, st = I.stil ?? -1, ra = I.raum ?? -1, stA = st >= 0 && st <= 1, raA = ra >= 0 && ra <= 1;
    /* Unter dem Schwarz bei P 6 und 8 springt das Modell ohne Übergang zur nächsten Szene */
    if (eng) { const snap = ePrev != null && PA.some(p => p.at > 4 && (ePrev - p.at) * (P - p.at) < 0); eng.setP(P, snap); }
    ePrev = P;
    const s = (a, b) => sm((P - a) / (b - a)), narrow = stage.clientWidth < 900;
    ch.forEach(el => {
      const k = +el.dataset.ch, A = el.dataset.a != null ? +el.dataset.a : k, B = el.dataset.b != null ? +el.dataset.b : k + 1, d = B - A;
      let v = s(A + .04 * d, A + .16 * d) * (k === 11 ? 1 : 1 - s(B - .16 * d, B - .04 * d));
      /* Runde 66 (Entwurf): Machbarkeit wartet, solange das Architekturkonzept läuft; die Innenausstattung kommt erst nach dem Raumgefühl */
      if (k === 4 && stA) v = 0;
      if (k === 9) { if (ra !== 2) v = 0; else if (P < 9.38) v = Math.min(v, s(9.31, 9.36)); }
      const vf = (k === 8 || k === 9) && focus ? 0 : v;
      el.style.opacity = vf.toFixed(3);
      el.style.transform = `translate3d(0,${((1 - v) * 16).toFixed(1)}px,0)`;
      /* Runde 51: der Textblock fängt keine Klicks, damit die Punkte im Haus überall gehen; nur Links und Knöpfe darin sind klickbar */
      el.classList.toggle('is-act', vf > .5);
      el.style.visibility = vf > .002 ? 'visible' : 'hidden';
    });
    /* Punkt nur in der Ausstattung (nicht während des Raumgefühls, dort führt der Einschub die Kamera) */
    if (focus && (P < 9 || P > 10 || raA)) setFocus(null);
    /* Knöpfe der Ausstattung: der gerade gezeigte (Rundgang) oder offene gelb unterstrichen (Runde 66: Zeiten des Entwurfs) */
    if (sw.length) { const cur = P > 9.02 && P < 9.95 ? (P < 9.52 ? 1 : P < 9.73 ? 2 : 3) : -1, act = focus ? HOTS.indexOf(focus) : cur; sw.forEach(b => b.classList.toggle('is-on', +b.dataset.sw === act)); }
    /* Schatten hinter dem Text */
    if (scrim) { const on = (P > 9 && P < 10) || (P > 5.5 && P < 5.78) || !!focus; scrim.classList.toggle('is-on', on); }
    stilFrame(st, narrow);
    /* Runde 66 (Entwurf): Schwarz über dem 3D während des Architekturkonzepts (danach blendet das Grundstück bis P 4.46 auf), der
       Projektsteuerung und kurz nach einem Sprung der Kamera (dip). Die Schilder im 3D blenden mit */
    if (cov) {
      /* Runde 71 (Kunde): beim Zwischentitel Besser planen verschwindet der Ebenenstapel mit dem Schwarz (sonst stand er beim Ausblenden
         des Titels noch da); vor Besser bauen ist das Schwarz schon zu, also kein Grundstück vor der Projektsteuerung; von der
         Innenausstattung zu den Betriebskosten fährt die Kamera seit Runde 72 in einem Zug aus dem Haus (raumFrame), ohne Blende */
      const pcv = P >= 5.98 && P < 6.66 ? s(5.986, 5.998) * (1 - s(6.56, 6.62)) : 0, rcv = eng && eng.dip ? Math.min(1, eng.dip * 1.6) : 0;
      const tcv = T.i === 0 ? sm(T.u / .2) : 0;
      const co = (stA ? 0 : st === 2 && P < 4.47 ? s(4.37, 4.46) : 1) * (1 - pcv) * (1 - rcv) * (1 - tcv), c2 = (1 - co).toFixed(3), s2 = co.toFixed(3);
      if (cov.style.opacity !== c2) cov.style.opacity = c2;
      if (l3 && l3.style.opacity !== s2) l3.style.opacity = s2;
      if (rcv > .002) anim = true;
    }
    steuerFrame(narrow);
    raumFrame(ra, raA, narrow);
    /* Gesamtinvestition (Runde 57): Zeile für Zeile mit Balken und gelber Marke, dann der Balken aus allen Posten; das 3D blendet so lange aus */
    if (lg) {
      const lv = s(5.81, 5.825) * (1 - s(5.99, 6)), o = lv.toFixed(3); if (lg.style.opacity !== o) lg.style.opacity = o;
      lg.style.visibility = lv > .001 ? 'visible' : 'hidden';
      if (lv > .001) lrow.forEach((w, i) => {
        const a = LZ[i], k = s(a - .004, a + .006), nx = i < LZ.length - 1 ? LZ[i + 1] : 5.94;
        w.el.style.opacity = k.toFixed(3); w.el.style.transform = 'translate3d(0,' + ((1 - k) * 10).toFixed(1) + 'px,0)';
        w.bar.style.transform = 'scaleX(' + s(a, a + .01).toFixed(3) + ')';
        w.mk.style.transform = 'scaleX(' + (s(a - .002, a + .008) * (1 - s(nx - .002, nx + .004))).toFixed(3) + ')';
        if (lseg[i]) lseg[i].style.transform = 'scaleX(' + s(5.945 + i * .004, 5.952 + i * .004).toFixed(3) + ')';
      });
      const cv = eng && stage.querySelector('canvas');
      if (cv) { const co = (1 - s(5.772, 5.79) * (1 - s(5.995, 6.01))).toFixed(3); if (cv.style.opacity !== co) cv.style.opacity = co; }
    }
    /* Einstieg „komplex“ Wort für Wort (Entwurf) */
    if (hk.length) {
      const now = (performance.now() - t0) / 1000;
      hk.forEach(b => { const sp = SPK[b.i]; if (!sp) return; const [en, ex] = sp, n = Math.max(1, b.w.length - 1);
        b.w.forEach((w, j) => {
          const ve = reduce && !en ? 1 : en ? sm((P - en[0] - j * (en[1] - en[0]) * .5 / n) / ((en[1] - en[0]) * .5)) : eo((now - .5 - j * .075) / .9);
          const vx = sm((P - ex[0] - j * (ex[1] - ex[0]) * .5 / n) / ((ex[1] - ex[0]) * .5));
          const y = ((1 - ve) * 160 * (1 - vx) - vx * 160).toFixed(2);
          if (b.y[j] !== y) { b.y[j] = y; w.style.transform = 'translate3d(0,' + y + '%,0)'; w.style.visibility = ve < .002 || vx > .998 ? 'hidden' : 'visible'; }
        });
        if (b.i === 5) { const sc = (1 - .4 * s(2.86, 3.06)).toFixed(3); if (b.sc !== sc) { b.sc = sc; b.el.style.transform = 'scale(' + sc + ')'; } }
        if (b.i === 3) b.el.classList.toggle('is-dim', P > 1.5);
      });
      if (kdim) { const o = (.45 * s(.16, .6) * (1 - s(.72, .98))).toFixed(3); if (kdim.style.opacity !== o) kdim.style.opacity = o; }
      herok.style.visibility = P < 4.05 ? 'visible' : 'hidden';
      /* Runde 59 (Kunde, iPhone: am Anfang kein Text): „Hausbau ist komplex.“ steigt nach der Zeit auf, der Takt läuft aber nur beim
         Scrollen. Ohne Scrollen blieb die Zeile versteckt, darum hier weiter takten, bis sie ganz oben ist */
      if (!reduce && P < .2 && now < 2.6) loop.poke();
    }
    /* Runde 55 (Kunde): schwarzer Zwischentitel mit großem Titel, dann geht der Film weiter */
    if (ts) {
      const on = T.i >= 0, u = T.u, bg = on ? sm(u / .2) * (1 - sm((u - .8) / .2)) : 0;
      ts.style.opacity = bg.toFixed(3); ts.style.visibility = bg > .002 ? 'visible' : 'hidden';
      tsb.forEach((b, i) => {
        const act = i === T.i, dsp = act ? 'grid' : 'none'; if (b.el.style.display !== dsp) b.el.style.display = dsp; b.el.style.visibility = act ? 'visible' : 'hidden'; if (!act) return;
        const n = Math.max(1, b.w.length - 1);
        b.w.forEach((w, j) => {
          const ve = reduce ? 1 : sm((u - .1 - j * .12 / n) / .2), vx = reduce ? 0 : sm((u - .62 - j * .08 / n) / .18);
          const y = ((1 - ve) * 110 * (1 - vx) - vx * 110).toFixed(2);
          if (b.y[j] !== y) { b.y[j] = y; w.style.transform = 'translate3d(0,' + y + '%,0)'; w.style.visibility = ve < .002 || vx > .998 ? 'hidden' : 'visible'; }
        });
      });
    }
    /* Runde 54: am Telefon endet die Bühne des 3D über dem Text des stärksten Kapitels (oder über der Karte eines Punkts) */
    if (eng && eng.setStage && narrow && T.i < 0) {
      let best = null, bv = .01; [...ch, ...chx].forEach(el => { const v = +el.style.opacity; if (v > bv) { bv = v; best = el; } });
      if (focus && hp && hp.offsetHeight) best = $('[data-hp-title]', hp) || hp;
      const top = best ? best.offsetTop + (best.parentNode === hp ? hp.offsetTop : 0) : stage.clientHeight * .62;
      eng.setStage(72, Math.round(top - 20));
    }
    if (einmal) { const v = s(11.5, 11.62); einmal.style.opacity = v.toFixed(3); einmal.style.transform = `translate3d(0,${((1 - v) * 16).toFixed(1)}px,0)`; }
    /* Leiste unten (Runde 55: größer, die drei Teile klar unterscheidbar; am Telefon bekommt der aktuelle Teil mehr Platz) */
    if (nav) {
      const on = (P > 3.95 && P < 10.98) || (T.i >= 0 && (T.i > 0 || T.u > .5));
      nav.classList.toggle('is-on', on);
      /* im Zwischentitel ist sein Teil schon der aktuelle */
      const pi = T.i >= 0 ? T.i : P < 6 ? 0 : P < 8 ? 1 : 2;
      if (nav.dataset.cur !== String(pi)) nav.dataset.cur = String(pi);
      $$('[data-pl]', nav).forEach((a, i) => {
        const L = FILM.leiste[i], [r0, r1] = L.r, cur = i === pi, f = cur && T.i >= 0 ? 0 : cl((P - r0) / (r1 - r0));
        $('[data-pf]', a).style.transform = 'scaleX(' + f.toFixed(4) + ')';
        a.classList.toggle('is-cur', cur); a.classList.toggle('is-done', f >= 1 && !cur);
        if (cur) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current');
        /* Runde 66: während der Einschübe deren Name (Architekturkonzept im ersten Teil, Raumgefühl im dritten) */
        const E2 = FILM.leisteEin || {}, ein = i === 0 && stA ? E2.stil : i === 2 && (raA || (ra === -1 && P > 9.02)) ? E2.raum : '';
        const sb = $('[data-psub]', a), lab = cur ? ein || (L.sub.find(([e]) => P < e) || L.sub[L.sub.length - 1])[1] : '';
        if (sb.textContent !== lab && (cur || lastNav)) sb.textContent = lab;
      });
      lastNav = String(pi);
    }
    if (anim) loop.poke();
  }
  loop.add({ tick: () => frame(false) });
  addEventListener('resize', () => frame(true));
  frame(true);

  /* Runde 53: Namen im 3D Modell aus dem versteckten Markup (in Framer bearbeitbar), sonst aus data/leistungen.js */
  const mkTxt = (id, k, d) => { const e = mkEl(id, k); return escH(e ? e.textContent.trim() : d); };
  /* Wörter um die Baustelle (ein Feld, Wörter mit Punkt) */
  const wsrc = $('[data-wsrc]', r), words = String(wsrc ? wsrc.textContent : FILM.komplex.woerter).trim().split(/(?<=\.)\s+/).filter(Boolean);
  /* Das Logo, das aus der Kopfzeile auf den Baucontainer fliegt (Entwurf data-flylogo): fest am Bildschirm, darum direkt im body */
  let fly = document.querySelector('img[data-flylogo]');
  const go = () => import('./svc-film3d.js').then(m => {
    if (!fly) { fly = document.createElement('img'); fly.dataset.flylogo = '1'; fly.alt = ''; fly.setAttribute('aria-hidden', 'true'); fly.className = 'svf-fly'; document.body.appendChild(fly); }
    /* Runde 57: Stil direkt am Bild. Im body greift das CSS der Komponente auf griffner.com nicht (dort unter .gk), sonst stand das Logo
       1000 px breit unter der Fußzeile und das Telefon ließ sich seitlich schieben */
    fly.style.cssText = 'position:fixed;left:0;top:0;width:100px;max-width:none;height:auto;margin:0;transform-origin:0 0;z-index:61;pointer-events:none;opacity:0;will-change:transform';
    if (!fly.getAttribute('src')) fly.src = m.LOGO_INV;
    return m.createFilm(stage, {
      P, variant: 'komplex', flyLogo: 'img[data-flylogo]', dock,
      tags: { words, clear: '[data-svf] [data-hk="1"]' },
      labels: FILM.marken3d.map(([id, t, s, from, to, o = {}]) => ({ id, t: mkTxt(id, 't', t), s: s ? mkTxt(id, 's', s) : '', from, to, ...o })),
      onHot: id => setFocus(id),
      onJump: id => { const el = document.getElementById(id); if (el) jumpY(el.getBoundingClientRect().top + scrollY); }
    });
  }).then(e => {
    eng = e; r.classList.add('is-live'); ePrev = null; eng.setP(P0().P, true);
    globalThis.__svcEng = e;
    globalThis.__svcShow = (p, ins) => { globalThis.__svcTS = null; globalThis.__svcP = p; globalThis.__svcIns = ins || {}; frame(true); e.renderAt(p); };
    globalThis.__svcTitle = (i, u) => { globalThis.__svcTS = { i, u }; frame(true); e.renderAt(P); };
  }).catch(e => { console.warn('Services 3D nicht geladen', e); r.classList.add('is-fallback'); });
  const io = new IntersectionObserver(es => { if (es.some(x => x.isIntersecting)) { io.disconnect(); go(); } }, { rootMargin: '1200px 0px' });
  io.observe(film);
}
