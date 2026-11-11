/* Runde 49: Services Übersicht im Design v2 (Kunde). Ein gepinnter Film (#s-film): zwölf Kapitel des Entwurfs über einem 3D Modell
   von Concept Free (js/svc-film3d.js). Hier: Fortschritt P aus dem Scrollen (Gewichte wie im Entwurf), Texte der Kapitel ein und aus,
   das Durchstreichen, die drei Wörter des Projektplans, das Jahr des Kundendiensts, „Deins. Einmal.“, die Leiste unten und die
   Karte zu einem Punkt im Haus. Texte und Marken aus data/leistungen.js (FILM). */
import { loop, $, $$, reduce, vhs } from './core.js';
import { FILM } from '../data/leistungen.js';

const cl = t => Math.max(0, Math.min(1, t)), sm = t => (t = cl(t), t * t * (3 - 2 * t));
/* Sprung auf griffner.com über SmoothScroll (Lenis, Vorhang bei weiten Wegen), im Prototyp weich */
function jumpY(y) {
  const g = globalThis;
  if (g.__griffnerJump) g.__griffnerJump(y);
  else scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
}

export function initServicesFilm() {
  const r = $('[data-svf]'); if (!r) return;
  const film = $('[data-film]', r), stage = $('[data-stage]', r);
  const ch = $$('[data-ch]', r), strikes = $$('[data-strike]', r), besser = $('[data-besser]', r), mp = $$('[data-mp]', r);
  const einmal = $('[data-einmal]', r), jahr = $('[data-jahr]', r), nav = $('[data-snav]', r), hp = $('[data-hp]', r);
  const h1a = $('[data-h1a]', r), h1b = $('[data-h1b]', r);
  const W = FILM.gewichte, TW = W.reduce((a, b) => a + b, 0);
  let eng = null, focus = null, P = 0, lastNav = '';

  /* Fortschritt: 0 wenn der Film oben ankommt, 12 wenn er unten wegfährt; jedes Kapitel bekommt seinen Anteil */
  const P0 = () => {
    if (globalThis.__svcP != null) return globalThis.__svcP;
    const b = film.getBoundingClientRect(), h = stage.clientHeight || vhs();
    let u = cl(-b.top / Math.max(1, b.height - h)) * TW;
    for (let k = 0; k < W.length; k++) { if (u < W[k]) return k + u / W[k]; u -= W[k]; }
    return 12;
  };

  /* Karte zu einem Punkt im Haus: Texte aus dem versteckten Markup (in Framer bearbeitbar), sonst aus data/leistungen.js */
  const D = { ...FILM.punkte };
  $$('[data-pt]', r).forEach(el => {
    const g = k => { const e = $(`[data-k="${k}"]`, el); return e ? e.textContent.trim() : ''; };
    D[el.dataset.pt] = { info: g('info'), t: g('t'), x: g('x'), f: [[g('f1'), g('f1s')], [g('f2'), g('f2s')]].filter(([a]) => a) };
  });
  const escH = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  function setFocus(id) {
    if (id && focus === id) id = null;
    focus = id || null;
    if (eng) eng.setFocus(focus);
    if (focus) {
      const c = D[focus];
      $('[data-hp-info]', hp).textContent = c.info; $('[data-hp-title]', hp).textContent = c.t; $('[data-hp-text]', hp).textContent = c.x;
      $('[data-hp-facts]', hp).innerHTML = c.f.map(([a, b]) => `<div class="svf-hp__f"><b>${escH(a)}</b><span>${escH(b)}</span></div>`).join('');
    }
    r.classList.toggle('is-focus', !!focus);
    hp.setAttribute('aria-hidden', focus ? 'false' : 'true');
    frame(true);
    if (focus) requestAnimationFrame(() => { const b = $('[data-hp-close]', hp); b && b.focus({ preventScroll: true }); });
  }
  r.addEventListener('click', e => {
    const t = e.target;
    if (t.closest && t.closest('[data-hp-close]')) { setFocus(null); return; }
    /* Runde 53: Sprünge im Film sind Knöpfe (data-jump), keine Anker: kein #… in der Adresse, nichts, was Framer oder der Browser selbst springen lässt */
    const j = t.closest && t.closest('[data-jump]');
    if (j) { const el = document.getElementById(j.dataset.jump); if (el) { e.preventDefault(); jumpY(el.getBoundingClientRect().top + scrollY); } }
  });
  addEventListener('keydown', e => { if (e.key === 'Escape' && focus) setFocus(null); });
  /* Runde 52: ein Klick irgendwo außerhalb der Karte schließt sie auch (die Punkte selbst halten ihren Klick an) */
  document.addEventListener('click', e => {
    if (!focus) return;
    const t = e.target;
    if (t && t.closest && (t.closest('[data-hp]') || t.closest('.svf-m--hot'))) return;
    setFocus(null);
  });

  function frame(force) {
    const p = P0();
    if (!force && Math.abs(p - P) < 1e-5 && eng) return;
    P = p;
    if (eng) eng.setP(P);
    const s = (a, b) => sm((P - a) / (b - a));
    ch.forEach(el => {
      const k = +el.dataset.ch, A = el.dataset.a != null ? +el.dataset.a : k, B = el.dataset.b != null ? +el.dataset.b : k + 1, d = B - A;
      const v = (k === 0 ? 1 : s(A + .04 * d, A + .16 * d)) * (k === 11 ? 1 : 1 - s(B - .16 * d, B - .04 * d));
      const vf = (k === 7 || k === 8) && focus ? 0 : v;
      el.style.opacity = vf.toFixed(3);
      el.style.transform = `translate3d(0,${((1 - v) * 16).toFixed(1)}px,0)`;
      /* Runde 51: der Block selbst bleibt durchlässig (Punkte im Haus darunter), nur Links und Knöpfe darin sind klickbar */
      el.classList.toggle('is-act', vf > .5);
      el.style.visibility = vf > .002 ? 'visible' : 'hidden';
    });
    /* Runde 54: am Telefon endet die Bühne des 3D über dem Text des stärksten Kapitels (oder über der Karte eines Punkts) */
    if (eng && eng.setStage && stage.clientWidth < 900) {
      let best = null, bv = .01; ch.forEach(el => { const v = +el.style.opacity; if (v > bv) { bv = v; best = el; } });
      if (focus && hp && hp.offsetHeight) best = hp;
      const top = best ? best.offsetTop : stage.clientHeight * .5;
      eng.setStage(72, Math.round(top - 20));
    }
    /* Punkt nur im eigenen Kapitel */
    if (focus) { const ext = ['dach', 'wand', 'fenster', 'fassade', 'hoehe'].includes(focus); if (ext ? (P < 7.15 || P > 7.99) : (P < 8.22 || P > 8.99)) setFocus(null); }
    strikes.forEach((e, i) => { e.parentNode.style.setProperty('--x', s(1.12 + i * .17, 1.3 + i * .17).toFixed(3)); });
    /* Runde 52: Kapitel 0, erst „Hausbau wird oft wie ein Produkt behandelt.“, dann „Wir behandeln ihn wie das, was er ist: dein Leben.“ */
    if (h1a && h1b) {
      const a = 1 - s(.26, .4), b = s(.36, .52);
      h1a.style.opacity = a.toFixed(3); h1a.style.transform = `translate3d(0,${(-(1 - a) * 18).toFixed(1)}px,0)`;
      h1b.style.opacity = b.toFixed(3); h1b.style.transform = `translate3d(0,${((1 - b) * 18).toFixed(1)}px,0)`;
      h1b.style.visibility = b > .002 ? 'visible' : 'hidden'; h1a.style.visibility = a > .002 ? 'visible' : 'hidden';
    }
    if (besser) besser.style.opacity = s(1.66, 1.78).toFixed(3);
    mp.forEach(w => { const i = +w.dataset.mp; w.classList.toggle('is-on', P > 5.1 + i * .12); });
    if (einmal) { const v = s(11.5, 11.62); einmal.style.opacity = v.toFixed(3); einmal.style.transform = `translate3d(0,${((1 - v) * 16).toFixed(1)}px,0)`; }
    if (jahr) { const y = FILM.kapitel.find(k => k.jahr).jahr + ' ' + Math.max(1, Math.min(10, Math.round(1 + 9 * s(10.55, 10.95)))); if (jahr.textContent !== y) jahr.textContent = y; }
    if (nav) {
      const on = P > 3.95 && P < 10.98;
      nav.classList.toggle('is-on', on);
      const pi = P < 6 ? 0 : P < 10.5 ? 1 : 2;
      $$('[data-pl]', nav).forEach((a, i) => {
        const L = FILM.leiste[i], [r0, r1] = L.r, f = cl((P - r0) / (r1 - r0)), cur = i === pi;
        $('[data-pf]', a).style.transform = 'scaleX(' + f.toFixed(4) + ')';
        a.classList.toggle('is-cur', cur);
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
  const mkTxt = (id, k, d) => { const e = r.querySelector(`[data-mk="${id}"] [data-k="${k}"]`); return e ? e.textContent.trim() : d; };
  /* 3D erst, wenn der Film in die Nähe kommt (hier: sofort, er steht oben) */
  const go = () => import('./svc-film3d.js').then(m => m.createFilm(stage, {
    P, labels: FILM.marken3d.map(([id, t, s, from, to, o = {}]) => ({ id, t: mkTxt(id, 't', t), s: mkTxt(id, 's', s), from, to, ...o })),
    onHot: id => setFocus(id),
    onJump: id => { const el = document.getElementById(id); if (el) jumpY(el.getBoundingClientRect().top + scrollY); }
  })).then(e => {
    eng = e; r.classList.add('is-live'); eng.setP(P0());
    globalThis.__svcEng = e;
    globalThis.__svcShow = p => { globalThis.__svcP = p; frame(true); e.renderAt(p); };
  }).catch(e => { console.warn('Services 3D nicht geladen', e); r.classList.add('is-fallback'); });
  const io = new IntersectionObserver(es => { if (es.some(x => x.isIntersecting)) { io.disconnect(); go(); } }, { rootMargin: '1200px 0px' });
  io.observe(film);
}
