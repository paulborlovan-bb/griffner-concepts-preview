/* Services auf der Startseite (services-home.html): fünf Varianten eines kurzen Abschnitts. Texte aus data/leistungen.js (FILM),
   Bilder: Standbilder aus dem Film der Seite Services (assets/img/sh, quer 1280 px, hoch-* 900 px).
   01 Drei Kapitel  drei hohe Bilder, darunter die Leistungen jedes Teils (Liste aus FILM.leiste)
   02 Drei Titel    die Bühne steht (sticky), Fortschritt durch den Abschnitt wählt Teil und Leistung; Leiste wie im Film
   03 Kurzfilm      dreizehn Bilder laufen von selbst (4,2 s), nur solange sichtbar; Klick auf einen Teil springt dorthin
   04 Wörter        Reihen aus den Wörtern des Einstiegs ziehen vorbei (CSS), sichtbar setzt .is-on den zweiten Satz
   05 Liste         Zeilen wie die Projects; Darüberfahren oder Fokus zeigt das Bild, am Telefon öffnet ein Tipp die Zeile
   Ohne Bewegung (prefers-reduced-motion): kein Vorbeiziehen und kein Selbstlauf, alles bleibt bedienbar. */
import { loop, reveal, $, $$, reduce } from './core.js';
import { initChrome, frame } from './chrome.js';
import { FILM } from '../data/leistungen.js';

const esc = v => String(v == null ? '' : v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const pad2 = n => String(n).padStart(2, '0');
const cl = v => Math.max(0, Math.min(1, v));
const run = (name, fn) => { try { fn(); } catch (e) { console.error(name, e); } };
const IMG = n => `assets/img/sh/${n}.jpg`;

/* Die drei Teile und ihre Leistungen (Namen wie in der Leiste des Films), dazu Überschrift, Satz und Bild jeder Leistung */
const K = Object.fromEntries(FILM.kapitel.map(k => [k.id, k]));
const ART = { Architekturkonzept: ['konzept', FILM.konzept.h, FILM.konzept.txt], Machbarkeit: ['machbarkeit', K.machbarkeit], Budgetanalyse: ['budget', K.budget],
  Entwurfsplanung: ['entwurf', K.entwurf], Innenarchitektur: ['innen', K.innenarchitektur], Gesamtinvestition: ['gesamt', K.gesamt],
  Projektsteuerung: ['steuerung', K.steuerung], Baumanagement: ['bau', K.baumanagement], Projektmanager: ['pm', K.pm],
  Bausystem: ['bausystem', K.bausystem], Innenausstattung: ['ausstattung', K.ausstattung], Betriebskosten: ['betrieb', K.betrieb], Kundenservice: ['service', K.kundendienst] };
const TEILE = FILM.leiste.map((L, i) => ({ i, name: L.name, n: FILM.pausen[i].n, hoch: ['hoch-machbarkeit', 'hoch-bau', 'hoch-betrieb'][i], subs: L.sub.map(s => s[1]) }));
const SL = [];
TEILE.forEach(t => t.subs.forEach(name => { const a = ART[name]; if (!a) return; const k = a[1];
  const h = typeof k === 'string' ? k : k.h, txt = a[2] || (k.txt || k.nach || '');
  SL.push({ name, teil: t.i, img: a[0], h, txt }); }));
const SUBS = t => SL.filter(s => s.teil === t.i);

/* Leiste wie im Film: drei Teile, Nummer, Name, Balken, darunter die aktuelle Leistung */
const barHtml = (btn) => TEILE.map(t => `<${btn ? 'button type="button"' : 'div'} class="sh-bar__p" data-p="${t.i}"><span class="sh-bar__top"><span class="sh-bar__no">${pad2(t.i + 1)}</span><span class="sh-bar__n">${esc(t.name)}</span></span><span class="sh-bar__line"><i data-f></i></span><span class="sh-bar__sub" data-sub></span></${btn ? 'button' : 'div'}>`).join('');
const setBar = (root, cur, fills, sub) => { if (root.dataset.cur !== String(cur)) root.dataset.cur = cur; $$('.sh-bar__p', root).forEach((p, i) => {
  p.classList.toggle('is-cur', i === cur);
  $('[data-f]', p).style.transform = `scaleX(${cl(fills[i]).toFixed(4)})`;
  const sb = $('[data-sub]', p), lab = i === cur ? sub : ''; if (sb.textContent !== lab) sb.textContent = lab;
}); };

/* ---------- 01 Drei Kapitel ---------- */
function v1() {
  const el = $('[data-sh1]'); if (!el) return;
  el.innerHTML = TEILE.map(t => `<article class="sh1__c" data-reveal="${t.i * 120}">
    <a class="sh1__pic" href="leistungen.html" tabindex="-1" aria-hidden="true"><img src="${IMG(t.hoch)}" alt="" loading="lazy" decoding="async"></a>
    <p class="info sh1__n">${esc(t.n)}</p>
    <h3 class="sh1__t">${esc(t.name)}</h3>
    <ul class="sh1__subs">${SUBS(t).map(s => `<li>${esc(s.name)}</li>`).join('')}</ul>
  </article>`).join('');
}

/* ---------- 02 Drei Titel ---------- */
function v2() {
  const sec = $('[data-sh2]'); if (!sec) return;
  const ts = $('[data-sh2-ts]', sec), pics = $('[data-sh2-pics]', sec), subs = $('[data-sh2-subs]', sec), num = $('[data-sh2-n]', sec), bar = $('[data-sh2-bar]', sec);
  ts.innerHTML = TEILE.map(t => `<p class="sh2__t" data-t="${t.i}">${esc(t.name)}</p>`).join('');
  pics.innerHTML = TEILE.map(t => `<img class="sh2__img" data-t="${t.i}" src="${IMG(t.hoch)}" alt="" decoding="async">`).join('');
  bar.innerHTML = barHtml(false);
  let last = -1, lastSub = '';
  loop.add({ tick() {
    const r = sec.getBoundingClientRect(), span = Math.max(1, r.height - innerHeight), pr = cl(-r.top / span);
    /* jeder Teil bekommt ein Drittel; im Teil wandert die Leiste durch seine Leistungen */
    const f = Math.min(2.999, pr * 3), cur = Math.floor(f), inn = f - cur, list = SUBS(TEILE[cur]), si = Math.min(list.length - 1, Math.floor(inn * list.length));
    if (cur !== last) {
      last = cur; num.textContent = TEILE[cur].n;
      $$('[data-t]', sec).forEach(e => e.classList.toggle('is-on', +e.dataset.t === cur));
      subs.innerHTML = list.map((s, i) => `<li data-i="${i}">${esc(s.name)}</li>`).join('');
    }
    $$('li', subs).forEach((li, i) => li.classList.toggle('is-on', i <= si));
    setBar(bar, cur, TEILE.map(t => cl(f - t.i)), list[si].name);
    if (list[si].name !== lastSub) lastSub = list[si].name;
  } });
}

/* ---------- 03 Kurzfilm ---------- */
function v3() {
  const sec = $('[data-sh3]'); if (!sec) return;
  const pics = $('[data-sh3-pics]', sec), cap = $('[data-sh3-cap]', sec), bar = $('[data-sh3-bar]', sec);
  pics.innerHTML = SL.map((s, i) => `<img class="sh3__img" data-i="${i}" src="${IMG(s.img)}" alt="" decoding="async"${i > 1 ? ' loading="lazy"' : ''}>`).join('');
  bar.innerHTML = barHtml(true);
  const DUR = 4200, imgs = $$('.sh3__img', pics);
  let i = 0, t0 = performance.now(), vis = false, hold = false, raf = 0;
  const show = n => {
    i = (n + SL.length) % SL.length; t0 = performance.now();
    imgs.forEach((im, k) => im.classList.toggle('is-on', k === i));
    const s = SL[i];
    cap.innerHTML = `<p class="info sh3__k">${esc(TEILE[s.teil].n)} / ${esc(TEILE[s.teil].name)}</p><h3 class="sh3__h">${esc(s.h)}</h3><p class="sh3__p">${esc(s.txt)}</p>`;
    cap.classList.remove('is-in'); void cap.offsetWidth; cap.classList.add('is-in');
    paint();
  };
  /* Füllung: Anteil der Leistungen des Teils, die schon liefen, plus die laufende Zeit der aktuellen */
  const paint = () => {
    const s = SL[i], list = SL.filter(x => x.teil === s.teil), k = list.indexOf(s);
    const u = reduce || hold ? 1 : cl((performance.now() - t0) / DUR);
    setBar(bar, s.teil, TEILE.map(t => t.i < s.teil ? 1 : t.i > s.teil ? 0 : (k + u) / list.length), s.name);
  };
  const tick = () => { raf = 0; if (!vis) return; paint(); if (!reduce && !hold && performance.now() - t0 >= DUR) show(i + 1); raf = requestAnimationFrame(tick); };
  const wake = () => { if (!raf && vis) raf = requestAnimationFrame(tick); };
  new IntersectionObserver(es => { vis = es.some(e => e.isIntersecting); if (vis) { t0 = performance.now(); wake(); } }, { threshold: .35 }).observe(sec);
  $$('.sh-bar__p', bar).forEach(p => p.addEventListener('click', () => show(SL.findIndex(s => s.teil === +p.dataset.p))));
  /* Darüberfahren hält an (Lesen), Wegfahren läuft weiter */
  const fr = $('.sh3__frame', sec);
  fr.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { hold = true; paint(); } });
  fr.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') { hold = false; t0 = performance.now(); wake(); } });
  show(0);
}

/* ---------- 04 Wörter ---------- */
function v4() {
  const sec = $('[data-sh4]'); if (!sec) return;
  const W = FILM.komplex.woerter.split(/\.\s*/).filter(Boolean), rows = $('[data-sh4-rows]', sec), N = 5;
  rows.innerHTML = Array.from({ length: N }, (_, r) => {
    const part = W.filter((_, k) => k % N === r), line = part.map(w => `<span>${esc(w)}.</span>`).join('');
    return `<div class="sh4__row" style="--d:${(52 + r * 9)}s;--dir:${r % 2 ? 'reverse' : 'normal'}"><div class="sh4__track">${line}${line}</div></div>`;
  }).join('');
  new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { sec.classList.add('is-on'); } }), { threshold: .5 }).observe(sec);
}

/* ---------- 05 Liste ---------- */
function v5() {
  const sec = $('[data-sh5]'); if (!sec) return;
  const list = $('[data-sh5-list]', sec), pic = $('[data-sh5-pic]', sec);
  list.innerHTML = SL.map((s, i) => `<li class="sh5__r" data-i="${i}">
    <button type="button" class="sh5__b" aria-expanded="false"><span class="sh5__no info">${pad2(i + 1)}</span><span class="sh5__n">${esc(s.name)}</span><span class="sh5__t info">${esc(TEILE[s.teil].name)}</span></button>
    <div class="sh5__more"><div class="sh5__mi"><img src="${IMG(s.img)}" alt="" loading="lazy" decoding="async"><p>${esc(s.txt)}</p></div></div>
  </li>`).join('');
  pic.innerHTML = SL.map((s, i) => `<img data-i="${i}" src="${IMG(s.img)}" alt="" loading="lazy" decoding="async">`).join('') + '<p class="sh5__cap info" data-sh5-cap></p>';
  const capEl = $('[data-sh5-cap]', pic), rowsEl = $$('.sh5__r', list), imgs = $$('img', pic);
  const fine = matchMedia('(hover:hover) and (pointer:fine)');
  const act = i => { rowsEl.forEach((r, k) => r.classList.toggle('is-act', k === i)); imgs.forEach((im, k) => im.classList.toggle('is-on', k === i)); capEl.textContent = SL[i].h; };
  rowsEl.forEach((r, i) => {
    const b = $('.sh5__b', r);
    r.addEventListener('pointerenter', () => { if (fine.matches) act(i); });
    b.addEventListener('focus', () => act(i));
    b.addEventListener('click', () => { if (fine.matches) { location.href = 'leistungen.html'; return; }
      const open = !r.classList.contains('is-open'); rowsEl.forEach(x => { x.classList.remove('is-open'); $('.sh5__b', x).setAttribute('aria-expanded', 'false'); });
      if (open) { r.classList.add('is-open'); b.setAttribute('aria-expanded', 'true'); } });
  });
  act(0);
}

/* Sprungleiste der Varianten: nur zwischen Einstieg und Fußzeile, die aktuelle hervorgehoben; am Rechner rechts im Rand */
function sw() {
  const nav = $('[data-shsw]'), start = $('#sh-start'), foot = $('[data-footer]'), ids = ['v1', 'v2', 'v3', 'v4', 'v5'];
  /* am Telefon nur beim Zurückscrollen sichtbar und nie über der stehenden Bühne von 02, damit sie nichts verdeckt */
  const wide = matchMedia('(min-width:900px)'), pin = $('.sh2'); let y0 = scrollY, up = false;
  loop.add({ tick() {
    const y = scrollY; if (Math.abs(y - y0) > 6) { up = y < y0; y0 = y; }
    const pr = pin ? pin.getBoundingClientRect() : null, pinned = pr && pr.top <= 1 && pr.bottom >= innerHeight - 1;
    const on = start.getBoundingClientRect().bottom < innerHeight * .5 && foot.getBoundingClientRect().top > innerHeight * .8 && (wide.matches || (up && !pinned));
    nav.classList.toggle('is-on', on);
    let cur = 0; ids.forEach((id, k) => { if ($('#' + id).getBoundingClientRect().top < innerHeight * .5) cur = k; });
    $$('a', nav).forEach((a, k) => a.classList.toggle('is-cur', k === cur));
  } });
}

run('chrome', initChrome);
run('v1', v1); run('v2', v2); run('v3', v3); run('v4', v4); run('v5', v5); run('sw', sw);
reveal(document);
loop.start(frame);
if (document.fonts) document.fonts.ready.then(() => loop.poke());
addEventListener('load', () => loop.poke());
