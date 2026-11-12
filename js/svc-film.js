/* Runde 56: Services Übersicht eins zu eins im Entwurf „GRIFFNER Services v2“ (Kunde, Stand 12.11.2026, Kopf „komplex“). Ein gepinnter
   Film (#s-film) über dem 3D Modell des Entwurfs (js/svc-film3d.js, aus dem Entwurf gebaut). Hier, wie die Seite im Entwurf (S2Services):
   Fortschritt P aus dem Scrollen (Gewichte des Entwurfs), der Einstieg „Hausbau ist komplex“ Wort für Wort, die Wörter um die Baustelle,
   das Logo, das aus der Kopfzeile auf den Baucontainer fliegt, die Texte der Kapitel ein und aus, die Tabelle der Gesamtinvestition
   (Runde 57, das 3D blendet dafür aus), der Bauzeitplan der Bauleitung, die Knöpfe der Innenausstattung, „Deins. Einmal.“,
   die Karte zu einem Punkt im Haus.
   Anders als im Entwurf (Wunsch des Kunden, Runde 55): drei schwarze Zwischentitel vor Besser planen, Besser bauen und Besser leben,
   und die größere Leiste unten. Texte aus data/leistungen.js (FILM), in Framer aus dem Markup. */
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
  /* Runde 57: Tabelle der Gesamtinvestition und Bauzeitplan (Entwurf data-ledger, data-bplan) */
  const lg = $('[data-ledger]', r), lrow = lg ? $$('[data-lrow]', lg).map(el => ({ el, bar: $('[data-lbar]', el), mk: $('[data-lmark]', el) })) : [], lseg = lg ? $$('[data-lseg]', lg) : [];
  const bp = $('[data-bplan]', r), bgrow = bp ? $$('[data-grow]', bp).map(el => ({ a: +el.dataset.a, l: +el.dataset.l, f: $('[data-gfill]', el) })) : [], btoday = bp && $('[data-today]', bp), bok = bp ? $$('[data-bok]', bp) : [];
  const LZ = FILM.summe.zeilen.map(z => z[3]);
  const ts = $('[data-ts]', r), tsb = $$('[data-tsb]', r).map(el => ({ el, w: $$('.w>span', el), y: [] }));
  const W = FILM.gewichte, PA = FILM.pausen;
  /* Ablauf: Kapitel k mit Gewicht W[k], vor P 4, 6 und 8 je ein Zwischentitel */
  const SEQ = []; W.forEach((w, k) => { PA.forEach((p, i) => { if (p.at === k) SEQ.push({ w: p.w, ts: i }); }); SEQ.push({ w, k }); });
  const TW = SEQ.reduce((a, q) => a + q.w, 0);
  let eng = null, focus = null, P = 0, T = { i: -1, u: 0 }, ePrev = null, lastNav = '';

  /* Fortschritt: 0 wenn der Film oben ankommt, 12 wenn er unten wegfährt. Im Zwischentitel steht P kurz vor (erste Hälfte) oder
     kurz nach (zweite Hälfte) seiner Stelle, unter dem Schwarz springt das Modell zur nächsten Szene */
  const P0 = () => {
    if (globalThis.__svcTS) { const { i, u } = globalThis.__svcTS; return { P: PA[i].at + (u < .5 ? -1e-4 : 1e-4), i, u }; }
    if (globalThis.__svcP != null) return { P: globalThis.__svcP, i: -1, u: 0 };
    const b = film.getBoundingClientRect(), h = stage.clientHeight || vhs();
    let u = cl(-b.top / Math.max(1, b.height - h)) * TW;
    for (const q of SEQ) {
      if (u < q.w) { const f = u / q.w; return q.ts != null ? { P: PA[q.ts].at + (f < .5 ? -1e-4 : 1e-4), i: q.ts, u: f } : { P: q.k + f, i: -1, u: 0 }; }
      u -= q.w;
    }
    return { P: 12, i: -1, u: 0 };
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

  function frame(force) {
    const q = P0();
    if (!force && Math.abs(q.P - P) < 1e-6 && q.i === T.i && Math.abs(q.u - T.u) < 1e-6 && eng && q.i < 0 && !(hk.length && P < .3)) return;
    P = q.P; T = q;
    /* Unter dem Schwarz bei P 6 und 8 springt das Modell ohne Übergang zur nächsten Szene */
    if (eng) { const snap = ePrev != null && PA.some(p => p.at > 4 && (ePrev - p.at) * (P - p.at) < 0); eng.setP(P, snap); }
    ePrev = P;
    const s = (a, b) => sm((P - a) / (b - a)), narrow = stage.clientWidth < 900;
    ch.forEach(el => {
      const k = +el.dataset.ch, A = el.dataset.a != null ? +el.dataset.a : k, B = el.dataset.b != null ? +el.dataset.b : k + 1, d = B - A;
      const v = s(A + .04 * d, A + .16 * d) * (k === 11 ? 1 : 1 - s(B - .16 * d, B - .04 * d));
      const vf = (k === 8 || k === 9) && focus ? 0 : v;
      el.style.opacity = vf.toFixed(3);
      el.style.transform = `translate3d(0,${((1 - v) * 16).toFixed(1)}px,0)`;
      /* Runde 51: der Textblock fängt keine Klicks, damit die Punkte im Haus überall gehen; nur Links und Knöpfe darin sind klickbar */
      el.classList.toggle('is-act', vf > .5);
      el.style.visibility = vf > .002 ? 'visible' : 'hidden';
    });
    /* Punkt nur in der Ausstattung */
    if (focus && (P < 9 || P > 10)) setFocus(null);
    /* Knöpfe der Ausstattung: der gerade gezeigte (Rundgang) oder offene gelb unterstrichen */
    if (sw.length) { const cur = P > 9.02 && P < 9.95 ? (P < 9.35 ? 1 : P < 9.65 ? 2 : 3) : -1, act = focus ? HOTS.indexOf(focus) : cur; sw.forEach(b => b.classList.toggle('is-on', +b.dataset.sw === act)); }
    /* Schatten hinter dem Text; während des Bauzeitplans (Desktop) rechts */
    if (scrim) { const bl = P > 6.03 && P < 6.97 && !narrow, on = (P > 9 && P < 10) || (P > 5.5 && P < 5.78) || bl || !!focus; scrim.classList.toggle('is-on', on); scrim.classList.toggle('is-r', bl); }
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
    /* Bauzeitplan (Runde 57): der gelbe Strich „heute“ läuft durch die Bauzeit, die Zeilen füllen sich, am Ende die drei Häkchen */
    if (bp) {
      const v = s(6.03, 6.06) * (1 - s(6.95, 6.99)), o = v.toFixed(3); if (bp.style.opacity !== o) bp.style.opacity = o;
      bp.style.visibility = v > .001 ? 'visible' : 'hidden';
      if (v > .001) {
        const tt = cl((P - 6.05) / .87); btoday.style.left = (tt * 100).toFixed(2) + '%';
        bgrow.forEach(g => g.f.style.transform = 'scaleX(' + cl((tt - g.a) / g.l).toFixed(3) + ')');
        bok.forEach((b, i) => b.style.opacity = s(6.9 + i * .008, 6.915 + i * .008).toFixed(3));
      }
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
      let best = null, bv = .01; ch.forEach(el => { const v = +el.style.opacity; if (v > bv) { bv = v; best = el; } });
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
        const sb = $('[data-psub]', a), lab = cur ? (L.sub.find(([e]) => P < e) || L.sub[L.sub.length - 1])[1] : '';
        if (sb.textContent !== lab && (cur || lastNav)) sb.textContent = lab;
      });
      lastNav = String(pi);
    }
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
    globalThis.__svcShow = p => { globalThis.__svcTS = null; globalThis.__svcP = p; frame(true); e.renderAt(p); };
    globalThis.__svcTitle = (i, u) => { globalThis.__svcTS = { i, u }; frame(true); e.renderAt(P); };
  }).catch(e => { console.warn('Services 3D nicht geladen', e); r.classList.add('is-fallback'); });
  const io = new IntersectionObserver(es => { if (es.some(x => x.isIntersecting)) { io.disconnect(); go(); } }, { rootMargin: '1200px 0px' });
  io.observe(film);
}
