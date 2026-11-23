/* GRIFFNER Journey, Ab Tag 15 (Runde 10, 2026-11-23): eine Sektion für alles bis „Zweimal Griffen“, dann der Abschluss.
   1. Schwarzer Bildschirm wie die Phasen der Szene: „Ab Tag 15 · Besser leben.“ mit dem Satz darunter.
   2. Fünf Kapitel zum Umschalten (Reiter oben, Pfeile, Wischen am Telefon), damit die Seite kurz bleibt:
      Ab Tag 15 (vier Punkte), Alles in einem Plan (fünf Ebenen fallen zu einem Plan zusammen), Ein Auftrag. Ein Partner.
      (alle Gewerke laufen in einem Feld zusammen), Jede Woche (das Update baut sich Zeile für Zeile auf), Zweimal Griffen (zwei Bilder).
      Das gelbe Feld der Website steht am aktiven Reiter und wandert mit.
   3. Abschluss: Feld, „Dein Tag 01 beginnt mit einem Gespräch.“ und der Knopf zum Kontaktformular. */
import { esc, nr2, phaseHTML, srcset, stichworte } from './basis.js';
import { LEBEN } from './inhalt.js';

export const DEF = LEBEN;
const str = v => String(v ?? '').trim();
export function clean(c = {}) {
  const ph = { ...DEF.phase, ...Object.fromEntries(Object.entries(c.phase || {}).filter(([, v]) => v != null)) };
  const kap = (Array.isArray(c.kapitel) && c.kapitel.length ? c.kapitel : DEF.kapitel).map((k, i) => {
    const d = DEF.kapitel.find(x => x.art === k?.art) || DEF.kapitel[i] || {};
    const o = { ...d, ...Object.fromEntries(Object.entries(k || {}).filter(([, v]) => v != null && v !== '')) };
    /* aus Framer kommen Punkte als Text (eine Zeile je Punkt, „Titel. Text“) und Ebenen mit · getrennt */
    if (typeof o.punkte === 'string') o.punkte = o.punkte.split(/\n+/).map(l => l.trim()).filter(Boolean).map(l => { const m = l.match(/^(.+?[.:])\s+(.+)$/); return m ? [m[1], m[2]] : [l, '']; });
    if (typeof o.schichten === 'string') o.schichten = stichworte(o.schichten);
    return o;
  }).filter(k => k.h || k.text);
  const cta = { ...DEF.cta, ...Object.fromEntries(Object.entries(c.cta || {}).filter(([, v]) => v != null)) };
  return { phase: ph, kapitel: kap, cta };
}

const img = (u0, alt, cls = '', sizes = '(max-width: 809px) 100vw, 58vw') => {
  if (!u0) return '';
  const fr = /framerusercontent\.com\/images\//.test(u0), u = fr ? String(u0).split('?')[0] : u0;
  return `<img class="${cls}" src="${esc(u)}${fr ? '?scale-down-to=1024' : ''}"${fr ? ` srcset="${esc(srcset(u))}" sizes="${sizes}"` : ''} alt="${esc(alt || '')}" loading="lazy" decoding="async">`;
};
const punkte = p => (p || []).filter(x => x && (x[0] || x[1]));

/* Bild und Bewegung je Kapitel */
function media(k) {
  if (k.art === 'schichten') {
    const L = (k.schichten || []).slice(0, 6);
    return `${img(k.bild, k.alt, 'lb__img is-dim')}<div class="lb__sch" aria-hidden="true" style="--n:${L.length}">${L.map((s, j) => `<div class="lb__e" style="--j:${j}"><i class="lb__pl"></i><span class="info">${esc(s)}</span></div>`).join('')}</div>`;
  }
  if (k.art === 'partner') {
    const Y = [52, 128, 204], P = [...Y.map(y => [44, y]), ...Y.map(y => [356, y])];
    return `${img(k.bild, k.alt, 'lb__img is-dim2')}<svg class="lb__pa" viewBox="0 0 400 256" aria-hidden="true">${P.map(([x, y], j) => `<path class="lb__ln" style="--j:${j}" d="M${x + (x < 200 ? 14 : -14)} ${y}C${x < 200 ? 140 : 260} ${y} ${x < 200 ? 150 : 250} 128 ${x < 200 ? 175 : 225} 128" pathLength="1"/><rect class="lb__sq" style="--j:${j}" x="${x - 14}" y="${y - 11}" width="28" height="22"/>`).join('')}<rect class="lb__ce" x="175" y="108" width="50" height="40"/></svg>`;
  }
  if (k.art === 'update') {
    return `${img(k.bild, k.alt, 'lb__img is-dim')}<div class="lb__up" aria-hidden="true">${punkte(k.punkte).map((p, j) => `<div class="lb__ur" style="--j:${j}"><i class="${j ? '' : 'is-done'}"></i><div><p class="lb__ut">${esc(p[0])}</p><p class="lb__ux">${esc(p[1])}</p></div></div>`).join('')}</div>`;
  }
  if (k.art === 'griffen') {
    return `<figure class="lb__g1">${img(k.bild, k.alt, 'lb__img')}${k.bildA ? `<figcaption class="info">${esc(k.bildA)}</figcaption>` : ''}</figure><figure class="lb__g2">${img(k.bild2, k.alt2, 'lb__img', '(max-width: 809px) 60vw, 26vw')}${k.bildB ? `<figcaption class="info">${esc(k.bildB)}</figcaption>` : ''}</figure>`;
  }
  return img(k.bild, k.alt, 'lb__img is-kb');
}

export function markup(c0) {
  const c = clean(c0), K = c.kapitel;
  const tabs = K.map((k, i) => `<button class="lb__tab" type="button" role="tab" id="lb-t${i}" aria-controls="lb-p${i}" aria-selected="${i ? 'false' : 'true'}" tabindex="${i ? -1 : 0}"><span class="lb__tn"><i class="lb__tf" aria-hidden="true"></i><span>${nr2(i + 1)}</span></span><span class="lb__tl">${esc(k.tab || k.h)}</span></button>`).join('');
  const slides = K.map((k, i) => {
    const pk = punkte(k.punkte);
    const list = k.art === 'liste' && pk.length ? `<ul class="lb__pk">${pk.map(p => `<li><p class="lb__pt">${esc(p[0])}</p><p class="lb__px">${esc(p[1])}</p></li>`).join('')}</ul>` : '';
    /* Update: die Punkte stehen im Bild (aufbauend); für Vorleser und ohne Bild zusätzlich als Liste */
    const upl = k.art === 'update' && pk.length ? `<ul class="lb__pk lb__pk--u">${pk.map(p => `<li><p class="lb__pt">${esc(p[0])}</p><p class="lb__px">${esc(p[1])}</p></li>`).join('')}</ul>` : '';
    return `<div class="lb__sl lb__sl--${esc(k.art || 'bild')}${i ? '' : ' is-on'}" role="tabpanel" id="lb-p${i}" aria-labelledby="lb-t${i}"${i ? ' inert aria-hidden="true"' : ''}><div class="lb__m">${media(k)}</div><div class="lb__tx"><h3 class="h-kap lb__h">${esc(k.h)}</h3>${k.text ? `<p class="txt lb__p">${esc(k.text)}</p>` : ''}${list}${upl}</div></div>`;
  }).join('');
  return `<section class="lb" aria-label="${esc(`${c.phase.info} ${c.phase.h}`)}">
<div class="lb__ph"><div class="lb__phs">${phaseHTML(c.phase)}</div></div>
<div class="lb__k"><div class="lb__tabs" role="tablist" style="--n:${K.length}" aria-label="${esc(c.phase.h)}">${tabs}</div>
<div class="lb__st">${slides}</div>
<div class="lb__nav"><button class="lb__ar" type="button" data-d="-1" aria-label="Voriges Kapitel"><span aria-hidden="true">←</span></button><span class="info lb__cnt"><em>01</em> / ${nr2(K.length)}</span><button class="lb__ar" type="button" data-d="1" aria-label="Nächstes Kapitel"><span aria-hidden="true">→</span></button></div></div>
<div class="lb__cta"><i class="jf lb__f" aria-hidden="true"></i><h2 class="h-xl lb__ch">${esc(c.cta.h)}</h2>${c.cta.knopf ? `<a class="btn" href="${esc(c.cta.href || '/contact#contact-form')}">${esc(c.cta.knopf)}<span aria-hidden="true">→</span></a>` : ''}</div>
</section>`;
}

/* deps: { reduce, still } → { phaseFeld, phaseOn(), tabFeld(), tabsOn(), ctaFeld, ctaOn(), index(), dispose } */
export function mount(root, c0, deps = {}) {
  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
  const ph = $('.lb__ph'), jph = $('.lb__ph .jph'), TABS = $$('.lb__tab'), SL = $$('.lb__sl'), k = $('.lb__k'), cnt = $('.lb__cnt em'), cta = $('.lb__cta');
  let idx = 0, alive = true;
  const vis = (el, a = .5, b = 0) => { const r = el.getBoundingClientRect(); return r.top < innerHeight * a && r.bottom > innerHeight * b; };
  const handle = {
    root, phaseFeld: $('.lb__ph .jph__f'), ctaFeld: $('.lb__f'),
    phaseOn: () => jph.classList.contains('is-in') && vis(ph.firstElementChild, .62, .3),
    tabFeld: () => TABS[idx].querySelector('.lb__tf'), tabsOn: () => vis(k, .55, .35),
    ctaOn: () => vis($('.lb__f'), .62, 0), index: () => idx, dispose
  };
  const show = (i, focus) => {
    i = (i + SL.length) % SL.length; if (i === idx && SL[i].classList.contains('is-on')) return;
    idx = i;
    TABS.forEach((t, j) => { const on = j === i; t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1; t.classList.toggle('is-on', on); });
    SL.forEach((s, j) => { const on = j === i; s.classList.toggle('is-on', on); s.inert = !on; on ? s.removeAttribute('aria-hidden') : s.setAttribute('aria-hidden', 'true'); });
    if (cnt) cnt.textContent = nr2(i + 1);
    /* Telefon: der aktive Reiter rückt in die Reihe (nur waagrecht, die Seite bleibt stehen) */
    const tl = TABS[i].parentElement; if (tl.scrollWidth > tl.clientWidth) { const m = parseFloat(getComputedStyle(tl).paddingLeft) || 0; tl.scrollTo({ left: Math.max(0, tl.scrollLeft + TABS[i].getBoundingClientRect().left - tl.getBoundingClientRect().left - m), behavior: 'smooth' }); }
    focus && TABS[i].focus();
    deps.onKapitel && deps.onKapitel(i, handle);
  };
  TABS.forEach((t, i) => {
    t.addEventListener('click', () => show(i));
    t.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); show(idx + (e.key === 'ArrowRight' ? 1 : -1), true); } });
  });
  $$('.lb__ar').forEach(b => b.addEventListener('click', () => show(idx + +b.dataset.d)));
  TABS[0].classList.add('is-on');
  /* Wischen am Telefon (waagrecht, deutlich mehr als senkrecht) */
  const st = $('.lb__st'); let x0 = null, y0 = 0;
  st.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  st.addEventListener('touchend', e => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) show(idx + (dx < 0 ? 1 : -1)); }, { passive: true });

  if (deps.reduce || deps.still) { root.classList.add('is-static'); jph.classList.add('is-in'); return handle; }
  /* Kapitel erst bewegen, wenn sie zu sehen sind (Bewegungen in den Bildern starten mit is-vis) */
  let raf = 0;
  const run = () => {
    raf = 0; if (!alive) return;
    const r = ph.getBoundingClientRect(), inn = r.top < innerHeight * .4 && r.bottom > innerHeight * .6;
    if (jph.classList.contains('is-in') !== inn) jph.classList.toggle('is-in', inn);
    const kv = vis(k, .75, .25); if (k.classList.contains('is-vis') !== kv && kv) k.classList.add('is-vis');
    const cv = vis(cta, .8, 0); if (cv && !cta.classList.contains('is-in')) cta.classList.add('is-in');
  };
  const on = () => { if (!raf) raf = requestAnimationFrame(run); };
  addEventListener('scroll', on, { passive: true }); addEventListener('resize', on); run();
  function dispose() { alive = false; removeEventListener('scroll', on); removeEventListener('resize', on); raf && cancelAnimationFrame(raf); }
  return handle;
}
