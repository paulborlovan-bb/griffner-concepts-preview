/* GRIFFNER Journey, Ab Tag 15 (Runde 10, 2026-11-23): eine Sektion für alles bis „Zweimal Griffen“, dann der Abschluss.
   1. Schwarzer Bildschirm wie die Phasen der Szene: „Ab Tag 15 · Besser leben.“ mit dem Satz darunter.
   2. Fünf Kapitel: Ab Tag 15 (vier Punkte), Alles in einem Plan (fünf Ebenen fallen zu einem Plan zusammen), Ein Auftrag. Ein Partner.
      (alle Gewerke laufen in einem Feld zusammen), Jede Woche (das Update baut sich Zeile für Zeile auf), Zweimal Griffen (zwei Wege nach Griffen).
      Das gelbe Feld der Website steht am aktiven Reiter und wandert mit.
   3. Abschluss: Feld, „Dein Tag 01 beginnt mit einem Gespräch.“ und der Knopf zum Kontaktformular.

   Runde 11 (2026-11-23, Kunde: „this section is too big for the viewport and we need to make it tight to the scroll“,
   „remove the images and have just the animations and drawings“):
   - Keine Bilder mehr. Jedes Kapitel hat eine Zeichnung, die sich beim Erscheinen aufbaut (Linien zeichnen sich, das gelbe Feld kommt zuletzt).
     Ab Tag 15: Haus und Zeitstrahl (Tag 15, nach einem Jahr, jedes Jahr, ein Leben lang). Zweimal Griffen: zwei Wege von deinem Zuhause
     nach Griffen (Tag 07, Tag 11), gestrichelt weiter an den Wörthersee und auf den Feuerberg. Beschriftung: marken in inhalt.js.
   - Die Kapitel kleben als ein Bildschirm (100svh): Reiter oben, Text links, Zeichnung rechts (Telefon: Zeichnung oben, Text darunter,
     Punkte zum Aufklappen). Scrollen führt Kapitel für Kapitel weiter (basis.js schritte(), Halte: Phase, Kapitel 1 bis 5);
     ein Reiter gleitet zu seinem Kapitel. Ruhige Fassung (reduzierte Bewegung): alles untereinander, Reiter schalten um. */
import { clamp, esc, nr2, phaseHTML, stichworte } from './basis.js';
import { LEBEN } from './inhalt.js';

export const DEF = LEBEN;
const str = v => String(v ?? '').trim();
const ALT = { liste: 'leben', bild: 'leben' };
const set = o => Object.fromEntries(Object.entries(o || {}).filter(([, v]) => v != null && v !== ''));
export function clean(c = {}) {
  const ph = { ...DEF.phase, ...Object.fromEntries(Object.entries(c.phase || {}).filter(([, v]) => v != null)) };
  const kap = (Array.isArray(c.kapitel) && c.kapitel.length ? c.kapitel : DEF.kapitel).map((k, i) => {
    const art = ALT[k?.art] || k?.art;
    const d = DEF.kapitel.find(x => x.art === art) || DEF.kapitel[i] || {};
    const o = { ...d, ...set(k), art: art || d.art };
    /* aus Framer kommen Punkte als Text (eine Zeile je Punkt, „Titel. Text“), Ebenen mit · getrennt, Marken je Zeile „Zeile · Zeile“ */
    if (typeof o.punkte === 'string') o.punkte = o.punkte.split(/\n+/).map(l => l.trim()).filter(Boolean).map(l => { const m = l.match(/^(.+?[.:])\s+(.+)$/); return m ? [m[1], m[2]] : [l, '']; });
    if (typeof o.schichten === 'string') o.schichten = stichworte(o.schichten);
    if (typeof o.marken === 'string') o.marken = o.marken.split(/\n+/).map(l => l.trim()).filter(Boolean).map(l => { const [a, ...b] = l.split(/\s+·\s+/); return [a || '', b.join(' · ')]; });
    return o;
  }).filter(k => k.h || k.text);
  const cta = { ...DEF.cta, ...Object.fromEntries(Object.entries(c.cta || {}).filter(([, v]) => v != null)) };
  return { phase: ph, kapitel: kap, cta };
}

const punkte = p => (p || []).filter(x => x && (x[0] || x[1]));
/* Beschriftung an einer Stelle der Zeichnung (Zeichenfläche 640 × 480) */
const M = (k, j) => (k.marken || [])[j];
const lab = (m, x, y, j = 0, cls = '') => m && (m[0] || m[1]) ? `<p class="lb__lb ${cls}" style="left:${(x / 6.4).toFixed(2)}%;top:${(y / 4.8).toFixed(2)}%;--j:${j}">${m[0] ? `<span class="lb__l1">${esc(m[0])}</span>` : ''}${m[1] ? `<span class="lb__l2">${esc(m[1])}</span>` : ''}</p>` : '';
const svg = inner => `<svg class="lb__svg" viewBox="0 0 640 480" aria-hidden="true">${inner}</svg>`;
const line = (d, j, cls = '') => `<path class="lb__d ${cls}" style="--j:${j}" d="${d}" pathLength="1"/>`;

/* Zeichnung je Kapitel */
function zeichnung(k) {
  if (k.art === 'schichten') {
    const L = (k.schichten || []).slice(0, 6);
    return `<div class="lb__sch" aria-hidden="true" style="--n:${L.length}">${L.map((s, j) => `<div class="lb__e" style="--j:${j}"><i class="lb__pl"></i><span class="info">${esc(s)}</span></div>`).join('')}</div>`;
  }
  if (k.art === 'partner') {
    const Y = [112, 240, 368], P = [...Y.map(y => [78, y]), ...Y.map(y => [562, y])];
    const lines = P.map(([x, y], j) => line(x < 320 ? `M102 ${y}C190 ${y} 204 240 280 240` : `M538 ${y}C450 ${y} 436 240 360 240`, j)).join('');
    const sq = P.map(([x, y], j) => `<rect class="lb__sq" style="--j:${j}" x="${x - 24}" y="${y - 19}" width="48" height="38"/>`).join('');
    return `${svg(`${lines}${sq}<rect class="lb__ce" x="280" y="208" width="80" height="64"/>`)}${P.map(([x, y], j) => lab(M(k, j), x, y + 30, j)).join('')}${lab(M(k, 6), 320, 290, 6, 'is-hell')}`;
  }
  if (k.art === 'update') {
    const h = M(k, 0);
    return `<div class="lb__up" aria-hidden="true">${h && h[0] ? `<p class="info lb__uh"><i></i>${esc(h[0])}</p>` : ''}${punkte(k.punkte).map((p, j) => `<div class="lb__ur" style="--j:${j}"><i class="${j ? '' : 'is-done'}"></i><div><p class="lb__ut">${esc(p[0])}</p><p class="lb__ux">${esc(p[1])}</p></div></div>`).join('')}</div>`;
  }
  if (k.art === 'griffen') {
    /* dein Zuhause links, Griffen (gelb) rechts; oben der Weg zur Beauftragung (Tag 07), unten der zum Design Day (Tag 11);
       gestrichelt ein Tag mehr am Wörthersee oder auf dem Feuerberg */
    return `${svg(`${line('M120 309C138 176 320 116 414 182', 0)}${line('M146 342C262 424 384 384 414 222', 1)}
<path class="lb__dash" d="M486 190C516 166 542 148 570 142"/><path class="lb__dash" d="M486 212C518 238 542 286 570 298"/>
<rect class="lb__sq" style="--j:0" x="94" y="309" width="52" height="42"/><rect class="lb__ce" x="414" y="171" width="72" height="58"/>
<rect class="lb__sq lb__sq--x" x="570" y="129" width="32" height="26"/><rect class="lb__sq lb__sq--x" x="570" y="287" width="32" height="26"/>`)}
${lab(M(k, 0), 120, 362, 0)}${lab(M(k, 1), 450, 240, 1, 'is-hell')}${lab(M(k, 2), 236, 92, 2, 'is-a')}${lab(M(k, 3), 300, 412, 3, 'is-b')}${lab(M(k, 4), 586, 324, 4, 'is-x')}${lab(M(k, 5), 586, 166, 5, 'is-x')}`;
  }
  /* Ab Tag 15: ein Haus zeichnet sich, ein Fenster wird hell; darunter der Zeitstrahl nach dem Schlüssel */
  const T = [96, 248, 400, 552];
  return `${svg(`${line('M112 118H528V134H112Z', 0)}${line('M146 134V272H494V134', 1)}${line('M174 162H266V272H174Z', 2)}${line('M280 162H372V272H280Z', 3)}${line('M386 162H466V230H386Z', 4)}${line('M64 272H576', 5)}
<rect class="lb__licht" x="394" y="170" width="64" height="52"/>${line('M84 372H560', 6, 'lb__zl')}<path class="lb__dash" d="M562 372H616"/>
${T.slice(1).map((x, j) => `<path class="lb__tk" style="--j:${j + 1}" d="M${x} 364V380"/>`).join('')}<rect class="lb__mk" x="87" y="365" width="18" height="14"/>`)}
${T.map((x, j) => lab(M(k, j), x, 398, j)).join('')}`;
}

export function markup(c0) {
  const c = clean(c0), K = c.kapitel;
  const tabs = K.map((k, i) => `<button class="lb__tab" type="button" role="tab" id="lb-t${i}" aria-controls="lb-p${i}" aria-selected="${i ? 'false' : 'true'}" tabindex="${i ? -1 : 0}"><span class="lb__tn"><i class="lb__tf" aria-hidden="true"></i><span>${nr2(i + 1)}</span></span><span class="lb__tl">${esc(k.tab || k.h)}</span></button>`).join('');
  const slides = K.map((k, i) => {
    const pk = punkte(k.punkte);
    /* Punkte: am Desktop alle offen, am Telefon zum Aufklappen. Beim Update stehen sie in der Zeichnung (für Vorleser zusätzlich als Liste). */
    const list = k.art === 'leben' && pk.length ? `<ul class="lb__pk">${pk.map((p, j) => `<li><button class="lb__pt" type="button" aria-expanded="true" aria-controls="lb-x${i}-${j}">${esc(p[0])}</button><p class="lb__px" id="lb-x${i}-${j}">${esc(p[1])}</p></li>`).join('')}</ul>` : '';
    const upl = k.art === 'update' && pk.length ? `<ul class="lb__pk lb__pk--u">${pk.map(p => `<li><p>${esc(p[0])}</p><p>${esc(p[1])}</p></li>`).join('')}</ul>` : '';
    return `<div class="lb__sl lb__sl--${esc(k.art || 'leben')}${i ? '' : ' is-on'}" role="tabpanel" id="lb-p${i}" aria-labelledby="lb-t${i}"${i ? ' inert aria-hidden="true"' : ''}><div class="lb__tx"><h3 class="h-kap lb__h">${esc(k.h)}</h3>${k.text ? `<p class="txt lb__p">${esc(k.text)}</p>` : ''}${list}${upl}</div><div class="lb__m"><div class="lb__fig">${zeichnung(k)}</div></div></div>`;
  }).join('');
  return `<section class="lb" aria-label="${esc(`${c.phase.info} ${c.phase.h}`)}">
<div class="lb__ph"><div class="lb__phs">${phaseHTML(c.phase)}</div></div>
<div class="lb__k" style="--n:${K.length}"><div class="lb__kp"><div class="lb__tabs" role="tablist" style="--n:${K.length}" aria-label="${esc(c.phase.h)}">${tabs}</div>
<div class="lb__st">${slides}</div></div></div>
<div class="lb__cta"><i class="jf lb__f" aria-hidden="true"></i><h2 class="h-xl lb__ch">${esc(c.cta.h)}</h2>${c.cta.knopf ? `<a class="btn" href="${esc(c.cta.href || '/contact#contact-form')}">${esc(c.cta.knopf)}<span aria-hidden="true">→</span></a>` : ''}</div>
</section>`;
}

/* deps: { reduce, still, onKapitel?(i, api) } → { phaseFeld, phaseOn(), tabFeld(), tabsOn(), ctaFeld, ctaOn(), index(), go?: y => void, dispose }
   handle.go: gleiten zu einem Kapitel (Reiter); auf der Website mit Lenis, sonst gleitet der Browser.
   Runde 13: frei scrollen (kein Halte-Scrollen). Die Phase „Besser leben.“ ist kürzer und wandert beim Scrollen langsam nach oben,
   die Zeichnung und der Text des Kapitels steigen mit dem Scrollen ganz leicht, damit der klebende Bildschirm nie still steht. */
export function mount(root, c0, deps = {}) {
  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
  const ph = $('.lb__ph'), jph = $('.lb__ph .jph'), TABS = $$('.lb__tab'), SL = $$('.lb__sl'), k = $('.lb__k'), kp = $('.lb__kp'), cta = $('.lb__cta');
  const n = SL.length, stat = !!(deps.reduce || deps.still);
  let idx = 0, alive = true;
  const vis = (el, a = .5, b = 0) => { const r = el.getBoundingClientRect(); return r.top < innerHeight * a && r.bottom > innerHeight * b; };
  /* Kapitel-Halte: der klebende Bildschirm steht, jedes Kapitel ein gleich langes Stück Scrollweg */
  const geo = () => { const r = k.getBoundingClientRect(), top = r.top + scrollY, span = Math.max(1, k.offsetHeight - kp.offsetHeight); return { top, step: n > 1 ? span / (n - 1) : 0 }; };
  const kapY = i => { const g = geo(); return g.top + i * g.step; };
  const PHB = $('.lb__ph .jph__b'), PHH = $('.lb__ph .jph__h'), MS = SL.map(s => s.querySelector('.lb__m')), TX = SL.map(s => s.querySelector('.lb__tx'));
  let phK = '', kK = '';
  const handle = {
    root, phaseFeld: $('.lb__ph .jph__f'), ctaFeld: $('.lb__f'),
    phaseOn: () => jph.classList.contains('is-in') && vis(ph.firstElementChild, .62, .3),
    tabFeld: () => TABS[idx].querySelector('.lb__tf'), tabsOn: () => { const r = k.getBoundingClientRect(); return r.top < innerHeight * .35 && r.bottom > innerHeight * .65; },
    ctaOn: () => vis($('.lb__f'), .62, 0), index: () => idx, go: null, dispose
  };
  const show = (i, focus) => {
    i = clamp(i, 0, n - 1); if (i === idx && SL[i].classList.contains('is-on')) return;
    idx = i;
    TABS.forEach((t, j) => { const on = j === i; t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1; t.classList.toggle('is-on', on); });
    SL.forEach((s, j) => { const on = j === i; s.classList.toggle('is-on', on); s.inert = !on; on ? s.removeAttribute('aria-hidden') : s.setAttribute('aria-hidden', 'true'); });
    /* Telefon: der aktive Reiter rückt in die Reihe (nur waagrecht, die Seite bleibt stehen) */
    const tl = TABS[i].parentElement; if (tl.scrollWidth > tl.clientWidth) { const m = parseFloat(getComputedStyle(tl).paddingLeft) || 0; tl.scrollTo({ left: Math.max(0, tl.scrollLeft + TABS[i].getBoundingClientRect().left - tl.getBoundingClientRect().left - m), behavior: 'smooth' }); }
    focus && TABS[i].focus();
    deps.onKapitel && deps.onKapitel(i, handle);
  };
  /* Reiter: gleitet zum Kapitel (die Seite schaltet beim Scrollen um); ruhige Fassung: schaltet direkt */
  const pick = (i, focus) => {
    i = clamp(i, 0, n - 1);
    if (stat || root.classList.contains('is-static')) return show(i, focus);
    const y = kapY(i);
    handle.go ? handle.go(y) : scrollTo({ top: y, behavior: 'smooth' });
    focus && TABS[i].focus({ preventScroll: true });
  };
  TABS.forEach((t, i) => {
    t.addEventListener('click', () => pick(i));
    t.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); pick(idx + (e.key === 'ArrowRight' ? 1 : -1), true); } });
  });
  TABS[0].classList.add('is-on');
  /* Punkte: am Telefon aufklappen (einer zur Zeit), sonst alle offen */
  const mq = typeof matchMedia !== 'undefined' ? matchMedia('(max-width: 809px)') : null;
  const LI = $$('.lb__pk:not(.lb__pk--u) li');
  const punkteZu = () => { const ph2 = mq && mq.matches; LI.forEach(li => { li.classList.toggle('is-open', !ph2); li.querySelector('.lb__pt').setAttribute('aria-expanded', ph2 ? 'false' : 'true'); }); };
  LI.forEach(li => li.querySelector('.lb__pt').addEventListener('click', () => {
    if (!(mq && mq.matches)) return;
    const open = !li.classList.contains('is-open');
    li.parentElement.querySelectorAll('li').forEach(x => { const on = x === li && open; x.classList.toggle('is-open', on); x.querySelector('.lb__pt').setAttribute('aria-expanded', on ? 'true' : 'false'); });
  }));
  punkteZu(); mq && mq.addEventListener && mq.addEventListener('change', punkteZu);

  if (stat) { root.classList.add('is-static'); jph.classList.add('is-in'); k.classList.add('is-vis'); return handle; }
  let raf = 0;
  const run = () => {
    raf = 0; if (!alive) return;
    const r = ph.getBoundingClientRect(), inn = r.top < innerHeight * .45 && r.bottom > innerHeight * .55;
    if (jph.classList.contains('is-in') !== inn) jph.classList.toggle('is-in', inn);
    /* Phase: solange sie klebt, wandert sie langsam nach oben und der Titel wächst ein wenig */
    if (r.top < innerHeight && r.bottom > 0) {
      const f = clamp(-r.top / Math.max(1, ph.offsetHeight - innerHeight)), key = f.toFixed(4);
      if (key !== phK) { phK = key; PHB.style.transform = `translate3d(0,${((.5 - f) * 18).toFixed(2)}vh,0)`; PHH.style.transform = `scale(${(.96 + f * .08).toFixed(4)})`; }
    }
    /* welches Kapitel: das nächste am Scrollweg */
    const g = geo(), at = g.step ? (scrollY - g.top) / g.step : 0, i = clamp(Math.round(at), 0, n - 1);
    if (i !== idx) show(i);
    /* das aktive Kapitel steigt mit dem Scrollen ganz leicht (Zeichnung mehr als Text) */
    const kf = clamp(at - i, -.5, .5), kk = i + ':' + kf.toFixed(3);
    if (kk !== kK) { kK = kk; MS[i].style.transform = `translate3d(0,${(-kf * 4).toFixed(2)}vh,0)`; TX[i].style.transform = `translate3d(0,${(-kf * 1.6).toFixed(2)}vh,0)`; }
    const kv = vis(kp, .75, .25); if (k.classList.contains('is-vis') !== kv && kv) k.classList.add('is-vis');
    const cv = vis(cta, .8, 0); if (cv && !cta.classList.contains('is-in')) cta.classList.add('is-in');
  };
  const on = () => { if (!raf) raf = requestAnimationFrame(run); };
  addEventListener('scroll', on, { passive: true }); addEventListener('resize', on); run();
  function dispose() { alive = false; removeEventListener('scroll', on); removeEventListener('resize', on); raf && cancelAnimationFrame(raf); mq && mq.removeEventListener && mq.removeEventListener('change', punkteZu); }
  return handle;
}
