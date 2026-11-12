/* Runde 55: Services Übersicht im neuen Entwurf (GRIFFNER Services v2, Kunde 2026-11-12). Ein gepinnter Film (#s-film) über einem
   3D Modell von Concept Free (js/svc-film3d.js). Hier: Fortschritt P aus dem Scrollen (Gewichte des Entwurfs), dazu drei schwarze
   Zwischentitel vor Besser planen, Besser bauen und Besser leben (Wunsch des Kunden), der Einstieg Wort für Wort, die Texte der
   Kapitel ein und aus, die Knöpfe der Ausstattung, die Balken der Energie, das Jahr des Kundendiensts, „Deins. Einmal.“, die größere
   Leiste unten und die Karte zu einem Punkt im Haus. Texte und Marken aus data/leistungen.js (FILM), in Framer aus dem Markup. */
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

export function initServicesFilm() {
  const r = $('[data-svf]'); if (!r) return;
  const film = $('[data-film]', r), stage = $('[data-stage]', r);
  const ch = $$('[data-ch]', r), hero = $('[data-hero]', r), nav = $('[data-snav]', r), hp = $('[data-hp]', r), scrim = $('[data-scrim]', r);
  const einmal = $('[data-einmal]', r), jahr = $('[data-jahr]', r), bal = $('[data-bal]', r), sw = $$('[data-sw]', r);
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

  /* Einstieg (Entwurf hb0 bis hb3): Wörter in Masken. „Produkt“ bekommt den Strich, „Leben“ die gelbe Linie (Wörter aus dem Markup, in Framer bearbeitbar) */
  const src = k => { const e = hero && hero.querySelector(`[data-f="${FILM.hero.id}-${k}"]`); return (e ? e.textContent : FILM.hero[k === 'x' ? 'strike' : 'unter']).trim().toLowerCase(); };
  const hb = hero ? $$('[data-hb]', hero).map(el => ({ el, w: $$('.w>span', el), y: [] })) : [];
  const mark = (b, word, cls) => { if (!b || !word) return null; const w = b.w.find(x => x.textContent.toLowerCase().replace(/[^a-zäöüß]/g, '').startsWith(word.replace(/[^a-zäöüß]/g, ''))); if (!w) return null; const s = document.createElement('span'); s.className = cls; s.setAttribute('aria-hidden', 'true'); w.appendChild(s); return s; };
  const pst = mark(hb[0], src('x'), 'svf__pst'), ul = mark(hb[1], src('u'), 'svf__ul');
  /* Open Space®: das Zeichen klein und hochgestellt wie im Entwurf */
  ch.forEach(el => { const h = $('.svf__h', el); if (h && h.textContent.includes('®') && !h.querySelector('sup')) h.innerHTML = escH(h.textContent).replace(/®/g, '<sup class="svf__r">®</sup>'); });
  const t0 = performance.now();

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
    if (t && t.closest && (t.closest('[data-hp]') || t.closest('.svf-m--hot') || t.closest('[data-hotbtn]'))) return;
    setFocus(null);
  });

  function frame(force) {
    const q = P0();
    if (!force && Math.abs(q.P - P) < 1e-6 && q.i === T.i && Math.abs(q.u - T.u) < 1e-6 && eng && q.i < 0 && !(hb.length && P < .6)) return;
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
    if (sw.length) { const cur = P > 9.02 && P < 9.95 ? (P < 9.22 ? 0 : P < 9.42 ? 1 : P < 9.62 ? 2 : 3) : -1, act = focus ? HOTS.indexOf(focus) : cur; sw.forEach(b => b.classList.toggle('is-on', +b.dataset.sw === act)); }
    if (scrim) { const on = (P > 9 && P < 10) || (P > 5.67 && P < 5.9) || (P > 6.02 && P < 6.48) || !!focus; scrim.classList.toggle('is-on', on); }
    if (bal) { $('[data-bal-e]', bal).style.transform = 'scaleX(' + s(10.3, 10.38).toFixed(3) + ')'; $('[data-bal-v]', bal).style.transform = 'scaleX(' + s(10.33, 10.41).toFixed(3) + ')'; }
    /* Einstieg Wort für Wort (Entwurf): hb0 kommt nach dem Laden, die übrigen mit dem Scrollen */
    if (hb.length) {
      const now = (performance.now() - t0) / 1000;
      const SP = [[null, [.34, .5]], [[.52, .68], [.9, 1]], [[1.02, 1.18], [1.86, 1.98]], [[1.46, 1.62], [1.86, 1.98]]];
      hb.forEach((b, i) => { const [en, ex] = SP[i] || SP[3], n = Math.max(1, b.w.length - 1);
        b.w.forEach((w, j) => {
          const ve = reduce ? 1 : en ? sm((P - en[0] - j * (en[1] - en[0]) * .5 / n) / ((en[1] - en[0]) * .5)) : eo((now - .5 - j * .075) / .9);
          const vx = sm((P - ex[0] - j * (ex[1] - ex[0]) * .5 / n) / ((ex[1] - ex[0]) * .5));
          const ve2 = en || !reduce ? ve : 1, y = ((1 - ve2) * 160 * (1 - vx) - vx * 160).toFixed(2);
          if (b.y[j] !== y) { b.y[j] = y; w.style.transform = 'translate3d(0,' + y + '%,0)'; w.style.visibility = ve2 < .002 || vx > .998 ? 'hidden' : 'visible'; }
        });
      });
      if (hb[2]) hb[2].el.classList.toggle('is-dim', P > 1.5);
      if (pst) { pst.style.transform = 'scaleX(' + s(.26, .36).toFixed(3) + ')'; pst.style.opacity = (1 - s(.4, .46)).toFixed(3); }
      if (ul) { ul.style.transform = 'scaleX(' + s(.7, .82).toFixed(3) + ')'; ul.style.opacity = (1 - s(.9, .95)).toFixed(3); }
      hero.style.visibility = P < 2.05 ? 'visible' : 'hidden';
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
      if (!best && hero && P < 2.05) best = hero;
      if (focus && hp && hp.offsetHeight) best = $('[data-hp-title]', hp) || hp;
      const top = best ? (best === hero ? hero.offsetTop : best.offsetTop + (best.parentNode === hp ? hp.offsetTop : 0)) : stage.clientHeight * .5;
      eng.setStage(72, Math.round(top - 20));
    }
    if (einmal) { const v = s(11.5, 11.62); einmal.style.opacity = v.toFixed(3); einmal.style.transform = `translate3d(0,${((1 - v) * 16).toFixed(1)}px,0)`; }
    if (jahr) { const y = FILM.kapitel.find(k => k.jahr).jahr + ' ' + Math.max(1, Math.min(10, Math.round(1 + 9 * s(10.55, 10.95)))); if (jahr.textContent !== y) jahr.textContent = y; }
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
  const mkTxt = (id, k, d) => { const e = r.querySelector(`[data-mk="${id}"] [data-k="${k}"]`); return escH(e ? e.textContent.trim() : d); };
  /* 3D erst, wenn der Film in die Nähe kommt (hier: sofort, er steht oben) */
  const go = () => import('./svc-film3d.js').then(m => m.createFilm(stage, {
    P, labels: FILM.marken3d.map(([id, t, s, from, to, o = {}]) => ({ id, t: mkTxt(id, 't', t), s: s ? mkTxt(id, 's', s) : '', from, to, ...o })),
    onHot: id => setFocus(id),
    onJump: id => { const el = document.getElementById(id); if (el) jumpY(el.getBoundingClientRect().top + scrollY); }
  })).then(e => {
    eng = e; r.classList.add('is-live'); ePrev = null; eng.setP(P0().P, true);
    globalThis.__svcEng = e;
    globalThis.__svcShow = p => { globalThis.__svcTS = null; globalThis.__svcP = p; frame(true); e.renderAt(p); };
    globalThis.__svcTitle = (i, u) => { globalThis.__svcTS = { i, u }; frame(true); e.renderAt(P); };
  }).catch(e => { console.warn('Services 3D nicht geladen', e); r.classList.add('is-fallback'); });
  const io = new IntersectionObserver(es => { if (es.some(x => x.isIntersecting)) { io.disconnect(); go(); } }, { rootMargin: '1200px 0px' });
  io.observe(film);
}
