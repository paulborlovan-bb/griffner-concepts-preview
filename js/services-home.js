/* Services auf der Startseite (services-home.html). Texte aus data/leistungen.js (FILM),
   Bilder: Standbilder aus dem Film der Seite Services (assets/img/sh, quer 1280 px, hoch-* 900 x 1350 px).
   Runde 1, gewählt:
   01 Drei Kapitel  drei Bilder, darunter die Leistungen jedes Teils (Liste aus FILM.leiste)
   02 Drei Titel    die Bühne steht (sticky), Fortschritt durch den Abschnitt wählt Teil und Leistung; Leiste wie im Film
   Runde 2, neu im Stil von 01 und 02:
   03 Quer          stehende Bühne, Überschrift und die drei Kapitel aus 01 ziehen quer vorbei (Höhe aus der Spurbreite)
   04 Reiter        Überschrift aus 01, Teile als Reiter (Leiste), Bild läuft durch die Leistungen (3,2 s), nur solange sichtbar
   05 Geteilt       links stehen Titel und Leistungen (sticky), rechts ziehen drei Bilder vorbei; das Bild in der Mitte wählt den Teil
   06 Fächer        drei Bilder nebeneinander, das aktive öffnet sich; läuft von selbst (5,2 s), bis jemand wählt
   07 Vollbild      wie 02, das Bild füllt die Fläche und läuft durch alle dreizehn Leistungen
   Runde 3: alle Bilder treiben langsam (Zoom und Schwenk); 01, 03, 05 mit Parallaxe, 02 steigt und 07 schwenkt beim Scrollen.
   Ohne Bewegung (prefers-reduced-motion): kein Selbstlauf, kein Treiben, keine Parallaxe, alles bleibt bedienbar. */
import { loop, reveal, $, $$, reduce } from './core.js';
import { initChrome, frame } from './chrome.js';
import { FILM } from '../data/leistungen.js';

const esc = v => String(v == null ? '' : v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const pad2 = n => String(n).padStart(2, '0');
const cl = v => Math.max(0, Math.min(1, v));
const run = (name, fn) => { try { fn(); } catch (e) { console.error(name, e); } };
const IMG = n => `assets/img/sh/${n}.jpg`;
/* Bewegung in den Bildern (Runde 3): jedes Bild treibt langsam (CSS sh-drift, Zoom und Schwenk); dl(k) startet versetzt, damit nicht alle gleich laufen.
   par() legt ein Bild in eine etwas größere Ebene (.sh-par), die beim Scrollen gegen die Bewegung läuft (Parallaxe, siehe parallax()) */
const dl = k => `animation-delay:-${((k * 4.7) % 12).toFixed(1)}s`;
const par = html => `<span class="sh-par">${html}</span>`;

/* Die drei Teile und ihre Leistungen (Namen wie in der Leiste des Films), dazu Überschrift, Satz und Bild jeder Leistung */
const K = Object.fromEntries(FILM.kapitel.map(k => [k.id, k]));
const ART = { Architekturkonzept: ['konzept', FILM.konzept.h, FILM.konzept.txt], Machbarkeit: ['machbarkeit', K.machbarkeit], Budgetanalyse: ['budget', K.budget],
  Entwurfsplanung: ['entwurf', K.entwurf], Innenarchitektur: ['innen', K.innenarchitektur], Gesamtinvestition: ['gesamt', K.gesamt],
  Projektsteuerung: ['steuerung', K.steuerung], Baumanagement: ['bau', K.baumanagement], Projektmanager: ['pm', K.pm],
  Bausystem: ['bausystem', K.bausystem], Innenausstattung: ['ausstattung', K.ausstattung], Betriebskosten: ['betrieb', K.betrieb], Kundenservice: ['service', K.kundendienst] };
/* hohe Bilder je Teil; pos = Ausschnitt, damit Kran und Haus im Bild bleiben */
const HOCH = [['hoch-machbarkeit', '50% 16%'], ['hoch-bau', '50% 4%'], ['hoch-betrieb', '50% 20%']];
const TEILE = FILM.leiste.map((L, i) => ({ i, name: L.name, n: FILM.pausen[i].n, hoch: HOCH[i][0], pos: HOCH[i][1], subs: L.sub.map(s => s[1]) }));
const SL = [];
TEILE.forEach(t => t.subs.forEach(name => { const a = ART[name]; if (!a) return; const k = a[1];
  const h = typeof k === 'string' ? k : k.h, txt = a[2] || (k.txt || k.nach || '');
  SL.push({ name, teil: t.i, img: a[0], h, txt }); }));
const SUBS = t => SL.filter(s => s.teil === t.i);
const LEAD = 'Nicht nur für dein Haus. Sondern für dein ganzes Projekt. Mit GRIFFNER Services planst, baust und lebst du besser.';
const subsLi = t => SUBS(t).map(s => `<li>${esc(s.name)}</li>`).join('');

/* Leiste wie im Film: drei Teile, Nummer, Name, Balken, darunter die aktuelle Leistung */
const barHtml = (btn) => TEILE.map(t => `<${btn ? 'button type="button"' : 'div'} class="sh-bar__p" data-p="${t.i}"><span class="sh-bar__top"><span class="sh-bar__no">${pad2(t.i + 1)}</span><span class="sh-bar__n">${esc(t.name)}</span></span><span class="sh-bar__line"><i data-f></i></span><span class="sh-bar__sub" data-sub></span></${btn ? 'button' : 'div'}>`).join('');
const setBar = (root, cur, fills, sub) => { if (root.dataset.cur !== String(cur)) root.dataset.cur = cur; $$('.sh-bar__p', root).forEach((p, i) => {
  p.classList.toggle('is-cur', i === cur);
  $('[data-f]', p).style.transform = `scaleX(${cl(fills[i]).toFixed(4)})`;
  const sb = $('[data-sub]', p), lab = i === cur ? sub : ''; if (sb.textContent !== lab) sb.textContent = lab;
}); };

/* Titel, die sich überblenden (02, 05, 07): je Teil ein <p data-t> im selben Rasterfeld */
const titlesHtml = cls => TEILE.map(t => `<p class="${cls}" data-t="${t.i}">${esc(t.name)}</p>`).join('');

/* ---------- 01 Drei Kapitel ---------- */
function v1() {
  const el = $('[data-sh1]'); if (!el) return;
  el.innerHTML = TEILE.map(t => `<article class="sh1__c" data-reveal="${t.i * 120}">
    <a class="sh1__pic" data-par="y" href="leistungen.html" tabindex="-1" aria-hidden="true">${par(`<img src="${IMG(t.hoch)}" style="${dl(t.i)}" alt="" loading="lazy" decoding="async">`)}</a>
    <p class="info sh1__n">${esc(t.n)}</p>
    <h3 class="sh1__t">${esc(t.name)}</h3>
    <ul class="sh1__subs">${subsLi(t)}</ul>
  </article>`).join('');
}

/* ---------- 02 Drei Titel ---------- */
function v2() {
  const sec = $('[data-sh2]'); if (!sec) return;
  const ts = $('[data-sh2-ts]', sec), pics = $('[data-sh2-pics]', sec), subs = $('[data-sh2-subs]', sec), num = $('[data-sh2-n]', sec), bar = $('[data-sh2-bar]', sec);
  ts.innerHTML = titlesHtml('sh2__t');
  pics.innerHTML = TEILE.map(t => `<img class="sh2__img" data-t="${t.i}" src="${IMG(t.hoch)}" style="${dl(t.i)}" alt="" decoding="async">`).join('');
  bar.innerHTML = barHtml(false);
  let last = -1;
  loop.add({ tick() {
    const r = sec.getBoundingClientRect(), span = Math.max(1, r.height - innerHeight), pr = cl(-r.top / span);
    /* das Bild steigt beim Scrollen langsam (über den ganzen Abschnitt, damit es an den Wechseln nicht springt) */
    if (!reduce) pics.style.transform = `translate3d(0,${((.5 - pr) * 56).toFixed(1)}px,0)`;
    /* jeder Teil bekommt ein Drittel; im Teil wandert die Leiste durch seine Leistungen */
    const f = Math.min(2.999, pr * 3), cur = Math.floor(f), inn = f - cur, list = SUBS(TEILE[cur]), si = Math.min(list.length - 1, Math.floor(inn * list.length));
    if (cur !== last) {
      last = cur; num.textContent = TEILE[cur].n;
      $$('[data-t]', sec).forEach(e => e.classList.toggle('is-on', +e.dataset.t === cur));
      subs.innerHTML = list.map((s, i) => `<li data-i="${i}">${esc(s.name)}</li>`).join('');
    }
    $$('li', subs).forEach((li, i) => li.classList.toggle('is-on', i <= si));
    setBar(bar, cur, TEILE.map(t => cl(f - t.i)), list[si].name);
  } });
}

/* ---------- 03 Quer ---------- */
function vQ() {
  const sec = $('[data-shq]'); if (!sec) return;
  const track = $('[data-shq-track]', sec), bar = $('[data-shq-bar]', sec);
  track.innerHTML = `<div class="shq__intro">
      <p class="info shq__k">Services</p>
      <h2 class="sh-h shq__h">Hausbau ist komplex. Wir nehmen dir das ab.</h2>
      <p class="sh-lead">${esc(LEAD)}</p>
      <a class="sh-link info" href="leistungen.html">Alle Services</a>
    </div>` + TEILE.map(t => `<article class="shq__c" data-p="${t.i}">
      <a class="shq__pic" data-par="x" href="leistungen.html" tabindex="-1" aria-hidden="true">${par(`<img src="${IMG(t.hoch)}" style="object-position:${t.pos};${dl(t.i)}" alt="" decoding="async">`)}</a>
      <p class="info shq__n">${esc(t.n)}</p>
      <h3 class="shq__t">${esc(t.name)}</h3>
      <ul class="shq__subs">${subsLi(t)}</ul>
    </article>`).join('');
  bar.innerHTML = barHtml(false);
  const cards = $$('.shq__c', track), SLOW = 1.5;
  let travel = 0, stops = [0, 0];
  /* Weg der Spur = rechte Kante der letzten Karte minus sichtbare Breite; der Abschnitt ist so viel höher (gedehnt, damit es ruhig läuft).
     Halt an jeder Karte (linke Kante am Rand), damit am Telefon immer eine ganz zu sehen ist; am breiten Bildschirm bleiben nur Anfang und Ende */
  const size = () => {
    const last = cards[cards.length - 1], x0 = track.firstElementChild.offsetLeft;
    travel = Math.max(0, last.offsetLeft + last.offsetWidth - track.clientWidth - x0);
    stops = [0, ...cards.map(c => Math.min(travel, c.offsetLeft - x0)), travel].filter((v, k, a) => k === 0 || v - a[k - 1] > 24);
    if (stops.length < 2) stops.push(travel);
    sec.style.height = `${Math.round(innerHeight + travel * SLOW)}px`;
  };
  const ease = t => { t = cl((t - .18) / .64); return t * t * (3 - 2 * t); };
  const at = pr => { const n = stops.length - 1, g = Math.min(n - .0001, pr * n), k = Math.floor(g); return stops[k] + (stops[k + 1] - stops[k]) * ease(g - k); };
  size(); addEventListener('resize', size); addEventListener('load', size); if (document.fonts) document.fonts.ready.then(size);
  let lastCur = -1;
  loop.add({ tick() {
    const r = sec.getBoundingClientRect(), span = Math.max(1, r.height - innerHeight), pr = cl(-r.top / span);
    track.style.transform = `translate3d(${(-at(pr)).toFixed(1)}px,0,0)`;
    const f = Math.min(2.999, pr * 3), cur = Math.floor(f);
    if (cur !== lastCur) { lastCur = cur; cards.forEach((c, i) => c.classList.toggle('is-cur', i === cur)); }
    setBar(bar, cur, TEILE.map(t => cl(f - t.i)), `${SUBS(TEILE[cur]).length} Leistungen`);
  } });
}

/* ---------- 04 Reiter ---------- */
function vR() {
  const sec = $('[data-shr]'); if (!sec) return;
  const tabs = $('[data-shr-tabs]', sec), pics = $('[data-shr-pics]', sec), side = $('[data-shr-side]', sec), body = $('[data-shr-body]', sec);
  tabs.innerHTML = barHtml(true);
  pics.innerHTML = SL.map((s, i) => `<img class="shr__img" data-i="${i}" src="${IMG(s.img)}" style="${dl(i)}" alt="" decoding="async"${i > 2 ? ' loading="lazy"' : ''}>`).join('');
  const DUR = 3200, imgs = $$('.shr__img', pics);
  let i = 0, t0 = performance.now(), vis = false, hold = false, raf = 0, teil = -1;
  /* Füllung des aktuellen Reiters: Anteil der Leistungen, die schon liefen, plus die laufende Zeit */
  const paint = () => {
    const s = SL[i], list = SUBS(TEILE[s.teil]), k = list.indexOf(s);
    const u = reduce || hold ? 1 : cl((performance.now() - t0) / DUR);
    setBar(tabs, s.teil, TEILE.map(t => t.i < s.teil ? 1 : t.i > s.teil ? 0 : (k + u) / list.length), '');
  };
  const show = n => {
    i = (n + SL.length) % SL.length; t0 = performance.now();
    const s = SL[i], t = TEILE[s.teil];
    imgs.forEach((im, k) => im.classList.toggle('is-on', k === i));
    if (s.teil !== teil) {
      teil = s.teil;
      side.innerHTML = `<h3 class="shr__t">${esc(t.name)}</h3>
        <ul class="shr__subs">${SUBS(t).map(x => `<li><button type="button" data-i="${SL.indexOf(x)}">${esc(x.name)}</button></li>`).join('')}</ul>
        <p class="shr__p" data-shr-p></p><a class="sh-link info" href="leistungen.html">Alle Services</a>`;
      side.classList.remove('is-in'); void side.offsetWidth; side.classList.add('is-in');
    }
    $$('button[data-i]', side).forEach(b => b.classList.toggle('is-on', +b.dataset.i === i));
    $('[data-shr-p]', side).textContent = s.txt;
    paint();
  };
  const tick = () => { raf = 0; if (!vis) return; paint(); if (!reduce && !hold && performance.now() - t0 >= DUR) show(i + 1); raf = requestAnimationFrame(tick); };
  const wake = () => { if (!raf && vis) raf = requestAnimationFrame(tick); };
  new IntersectionObserver(es => { vis = es.some(e => e.isIntersecting); if (vis) { t0 = performance.now(); wake(); } }, { threshold: .3 }).observe(body);
  side.addEventListener('click', e => { const b = e.target.closest('button[data-i]'); if (b) show(+b.dataset.i); });
  $$('.sh-bar__p', tabs).forEach(p => p.addEventListener('click', () => show(SL.findIndex(s => s.teil === +p.dataset.p))));
  /* Darüberfahren hält an (Lesen), Wegfahren läuft weiter */
  body.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { hold = true; paint(); } });
  body.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') { hold = false; t0 = performance.now(); wake(); } });
  show(0);
}

/* ---------- 05 Geteilt ---------- */
function vG() {
  const sec = $('[data-shg]'); if (!sec) return;
  const ts = $('[data-shg-ts]', sec), subs = $('[data-shg-subs]', sec), num = $('[data-shg-n]', sec), bar = $('[data-shg-bar]', sec), panesEl = $('[data-shg-panes]', sec);
  ts.innerHTML = titlesHtml('shg__t');
  bar.innerHTML = barHtml(false);
  panesEl.innerHTML = TEILE.map(t => `<figure class="shg__pane" data-p="${t.i}">
      <a class="shg__pic" data-par="y" href="leistungen.html" tabindex="-1" aria-hidden="true">${par(`<img src="${IMG(t.hoch)}" style="object-position:${t.pos};${dl(t.i)}" alt="" loading="lazy" decoding="async">`)}</a>
      <figcaption class="shg__cap"><ul class="shg__pl">${subsLi(t)}</ul></figcaption>
    </figure>`).join('') + '<a class="sh-link info shg__end" href="leistungen.html">Alle Services</a>';
  const panes = $$('.shg__pane', panesEl);
  let last = -1;
  loop.add({ tick() {
    const mid = innerHeight * .5;
    const fills = panes.map(p => { const r = p.getBoundingClientRect(); return cl((mid - r.top) / r.height); });
    let cur = 0; panes.forEach((p, k) => { if (p.getBoundingClientRect().top < mid) cur = k; });
    if (cur !== last) {
      last = cur; num.textContent = TEILE[cur].n;
      $$('[data-t]', ts).forEach(e => e.classList.toggle('is-on', +e.dataset.t === cur));
      panes.forEach((p, k) => p.classList.toggle('is-cur', k === cur));
      subs.innerHTML = subsLi(TEILE[cur]); subs.classList.remove('is-in'); void subs.offsetWidth; subs.classList.add('is-in');
    }
    setBar(bar, cur, fills, '');
  } });
}

/* ---------- 06 Fächer ---------- */
/* Bilder je Teil: Planen quer (das hohe Bild ist im breiten Fächer zu nah), Bauen und Leben hoch */
const FAN = [['machbarkeit', '66% 50%'], ['hoch-bau', '50% 4%'], ['hoch-betrieb', '50% 20%']];
function vF() {
  const sec = $('[data-shf]'); if (!sec) return;
  const row = $('[data-shf-row]', sec);
  row.innerHTML = TEILE.map(t => `<div class="shf__p" data-p="${t.i}" role="button" tabindex="0" aria-expanded="false" aria-label="${esc(t.name)}">
      <img src="${IMG(FAN[t.i][0])}" style="object-position:${FAN[t.i][1]};${dl(t.i)}" alt="" decoding="async">
      <div class="shf__c">
        <span class="shf__line" aria-hidden="true"><i></i></span>
        <p class="info shf__n">${esc(t.n)}</p>
        <h3 class="shf__h">${esc(t.name)}</h3>
        <div class="shf__more"><div class="shf__mi"><ul class="shf__subs">${subsLi(t)}</ul><a class="sh-link info" href="leistungen.html" tabindex="-1">Alle Services</a></div></div>
      </div>
    </div>`).join('');
  const ps = $$('.shf__p', row), fine = matchMedia('(hover:hover) and (pointer:fine)'), DUR = 5200;
  let cur = -1, auto = !reduce, vis = false, timer = 0;
  /* Selbstlauf: die Linie oben im offenen Bild läuft 5,2 s, dann öffnet sich das nächste; jede Wahl beendet ihn */
  const arm = () => {
    clearTimeout(timer); ps.forEach(p => p.classList.remove('is-run'));
    if (!auto || !vis || cur < 0) return;
    void row.offsetWidth; ps[cur].classList.add('is-run');
    timer = setTimeout(() => act((cur + 1) % ps.length), DUR);
  };
  const act = i => {
    if (i !== cur) { cur = i; ps.forEach((p, k) => { const on = k === i; p.classList.toggle('is-act', on); p.setAttribute('aria-expanded', on ? 'true' : 'false'); $('a', p).tabIndex = on ? 0 : -1; }); }
    arm();
  };
  const stop = () => { if (!auto) return; auto = false; sec.classList.remove('is-auto'); arm(); };
  sec.classList.toggle('is-auto', auto);
  ps.forEach((p, i) => {
    p.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse' && fine.matches) { stop(); act(i); } });
    p.addEventListener('click', e => { if (e.target.closest('a')) return; stop(); if (cur === i && fine.matches) { location.href = 'leistungen.html'; return; } act(i); });
    p.addEventListener('keydown', e => { if (e.target === p && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); stop(); act(i); } });
  });
  new IntersectionObserver(es => { vis = es.some(e => e.isIntersecting); arm(); }, { threshold: .4 }).observe(row);
  act(0);
}

/* ---------- 07 Vollbild ---------- */
function vV() {
  const sec = $('[data-shv]'); if (!sec) return;
  const ts = $('[data-shv-ts]', sec), pics = $('[data-shv-pics]', sec), subs = $('[data-shv-subs]', sec), num = $('[data-shv-n]', sec), bar = $('[data-shv-bar]', sec);
  ts.innerHTML = titlesHtml('shv__t');
  pics.innerHTML = SL.map((s, i) => `<img class="shv__img" data-i="${i}" src="${IMG(s.img)}" style="${dl(i)}" alt="" decoding="async"${i > 1 ? ' loading="lazy"' : ''}>`).join('');
  bar.innerHTML = barHtml(false);
  const imgs = $$('.shv__img', pics), wide = matchMedia('(min-width:900px)');
  let last = -1, lastI = -1;
  loop.add({ tick() {
    const r = sec.getBoundingClientRect(), span = Math.max(1, r.height - innerHeight), pr = cl(-r.top / span);
    /* die ganze Fläche schwenkt beim Scrollen langsam nach links (nur am breiten Bildschirm, dort füllt sie die Bühne) */
    pics.style.transform = !reduce && wide.matches ? `translate3d(${((.5 - pr) * 3).toFixed(2)}%,0,0) scale(1.05)` : '';
    const f = Math.min(2.999, pr * 3), cur = Math.floor(f), inn = f - cur, list = SUBS(TEILE[cur]), si = Math.min(list.length - 1, Math.floor(inn * list.length));
    if (cur !== last) {
      last = cur; num.textContent = TEILE[cur].n;
      $$('[data-t]', ts).forEach(e => e.classList.toggle('is-on', +e.dataset.t === cur));
      subs.innerHTML = list.map((s, i) => `<li data-i="${i}">${esc(s.name)}</li>`).join('');
    }
    $$('li', subs).forEach((li, i) => { li.classList.toggle('is-on', i <= si); li.classList.toggle('is-cur', i === si); });
    const gi = SL.indexOf(list[si]);
    if (gi !== lastI) { lastI = gi; imgs.forEach((im, k) => im.classList.toggle('is-on', k === gi)); }
    setBar(bar, cur, TEILE.map(t => cl(f - t.i)), list[si].name);
  } });
}

/* Parallaxe für Bilder im Fluss (01, 03, 05): die Ebene läuft gegen die Bewegung, 01 und 05 senkrecht, 03 quer zur Spur */
function parallax() {
  if (reduce) return;
  const els = $$('[data-par]').map(el => ({ el, ax: el.dataset.par, p: $('.sh-par', el) }));
  loop.add({ tick() {
    const vw = innerWidth, vh = innerHeight;
    els.forEach(({ el, ax, p }) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -80 || r.top > vh + 80 || r.right < -80 || r.left > vw + 80) return;
      if (ax === 'x') { const d = Math.max(-1, Math.min(1, (r.left + r.width / 2 - vw / 2) / (vw / 2 + r.width / 2))); p.style.transform = `translate3d(${(-d * r.width * .05).toFixed(1)}px,0,0)`; }
      else { const d = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2))); p.style.transform = `translate3d(0,${(-d * r.height * .05).toFixed(1)}px,0)`; }
    });
  } });
}

/* Sprungleiste der Varianten: nur zwischen Einstieg und Fußzeile, die aktuelle hervorgehoben; am Rechner rechts im Rand */
function sw() {
  const nav = $('[data-shsw]'), start = $('#sh-start'), foot = $('[data-footer]'), ids = $$('a', nav).map(a => a.getAttribute('href').slice(1));
  /* am Telefon nur beim Zurückscrollen sichtbar und nie über einer stehenden Bühne (data-pin), damit sie nichts verdeckt */
  const wide = matchMedia('(min-width:900px)'), pins = $$('[data-pin]'); let y0 = scrollY, up = false;
  loop.add({ tick() {
    const y = scrollY; if (Math.abs(y - y0) > 6) { up = y < y0; y0 = y; }
    const pinned = pins.some(p => { const r = p.getBoundingClientRect(); return r.top <= 1 && r.bottom >= innerHeight - 1; });
    const on = start.getBoundingClientRect().bottom < innerHeight * .5 && foot.getBoundingClientRect().top > innerHeight * .8 && (wide.matches || (up && !pinned));
    nav.classList.toggle('is-on', on);
    let cur = 0; ids.forEach((id, k) => { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < innerHeight * .5) cur = k; });
    $$('a', nav).forEach((a, k) => a.classList.toggle('is-cur', k === cur));
  } });
}

run('chrome', initChrome);
run('v1', v1); run('v2', v2); run('v3', vQ); run('v4', vR); run('v5', vG); run('v6', vF); run('v7', vV); run('par', parallax); run('sw', sw);
reveal(document);
loop.start(frame);
if (document.fonts) document.fonts.ready.then(() => loop.poke());
addEventListener('load', () => loop.poke());
