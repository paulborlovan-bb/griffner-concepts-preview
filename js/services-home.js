/* Services auf der Startseite (services-home.html). Texte aus data/leistungen.js (FILM),
   Bilder: kurze Schleifen aus dem Film der Seite Services (assets/vid/sh/<name>.mp4, quer 1280 x 800, hoch-* 720 x 1080, je 6 s vor und zurück,
   Poster <name>.jpg = erstes Bild der Schleife).
   Runde 1, gewählt:
   01 Drei Kapitel  drei Bilder, darunter die Leistungen jedes Teils (Liste aus FILM.leiste)
   02 Drei Titel    die Bühne steht (sticky), Fortschritt durch den Abschnitt wählt Teil und Leistung; Leiste wie im Film
   Runde 2 (03 Quer, 04 Reiter, 05 Geteilt, 06 Fächer, 07 Vollbild): nicht gewählt, entfernt.
   Runde 5, wieder im Stil von 01 und 02:
   03 Zeilen        Überschrift aus 01, drei große Titelzeilen mit Leistungen; am Rechner folgt das Bild der Maus, sonst steht es in der Zeile
   04 Karten        drei schwarze Karten (Aufbau wie 02) legen sich beim Scrollen übereinander, ihre Streifen bleiben oben stehen
   05 Folge         01 als stehende Fläche: der Fortschritt wählt Kapitel und Leistung, die Leiste aus 02 läuft mit
   06 Mitte         wie 02, das Bild in der Mitte zwischen Besser und dem wechselnden Wort
   07 Versetzt      01 versetzt und verschieden groß, die Spalten laufen verschieden schnell, der Titel liegt halb im Bild
   Runde 3: alle Bilder treiben langsam (Zoom und Schwenk); 01, 03, 05 mit Parallaxe, 02 steigt und 07 schwenkt beim Scrollen.
   Runde 4: statt der Standbilder dieselben Stellen als Film (Kamera fährt, Haus entsteht, Jahreszeiten), Parallaxe und Schwenk stärker.
   Runde 6: neuer Text vom Kunden. Überschrift, ein Satz darunter, je Teil ein Satz (SATZ) statt der Liste der Leistungen, Knopf Services entdecken;
   02 und 06 haben die Überschrift jetzt über der stehenden Bühne, die Leiste zeigt keine Leistung mehr.
   Ohne Bewegung (prefers-reduced-motion): kein Selbstlauf, kein Treiben, keine Parallaxe, die Filme bleiben beim Poster, alles bleibt bedienbar. */
import { loop, reveal, $, $$, reduce } from './core.js';
import { initChrome, frame } from './chrome.js';
import { FILM } from '../data/leistungen.js';

const esc = v => String(v == null ? '' : v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const pad2 = n => String(n).padStart(2, '0');
const cl = v => Math.max(0, Math.min(1, v));
const run = (name, fn) => { try { fn(); } catch (e) { console.error(name, e); } };
const VID = n => `assets/vid/sh/${n}`;
/* Film statt Bild (Runde 4): stumm, Schleife, lädt erst, wenn es sichtbar und an der Reihe ist (siehe vids()); is-st = liegt in einem Stapel (02, 04, 07), spielt nur mit is-on */
const media = (n, cls = '', style = '', attrs = '') => `<video class="sh-m${cls ? ' ' + cls : ''}" data-src="${VID(n)}.mp4" poster="${VID(n)}.jpg" muted loop playsinline disablepictureinpicture preload="none" aria-hidden="true"${style ? ` style="${style}"` : ''}${attrs ? ' ' + attrs : ''}></video>`;
/* Bewegung in den Bildern (Runde 3): jedes Bild treibt langsam (CSS sh-drift, Zoom und Schwenk); dl(k) startet versetzt, damit nicht alle gleich laufen.
   par() legt ein Bild in eine etwas größere Ebene (.sh-par), die beim Scrollen gegen die Bewegung läuft (Parallaxe, siehe parallax()) */
const dl = k => `animation-delay:-${((k * 4.7) % 12).toFixed(1)}s`;
const par = html => `<span class="sh-par">${html}</span>`;

/* Die drei Teile (Namen wie in der Leiste des Films). Runde 6: je Teil ein Satz statt der Liste der Leistungen (Text vom Kunden, 2026-11-18) */
const SATZ = [
  'Bevor gebaut wird, weißt du, was möglich ist und was dein Projekt kostet.',
  'Wir steuern dein Projekt und die Baustelle, mit einem persönlichen Ansprechpartner an deiner Seite.',
  'Ein Zuhause, das sich jeden Tag gut anfühlt, und ein Service, der auch nach dem Einzug bleibt.'];
/* hohe Bilder je Teil; pos = Ausschnitt, damit Kran und Haus im Bild bleiben */
const HOCH = [['hoch-machbarkeit', '50% 16%'], ['hoch-bau', '50% 4%'], ['hoch-betrieb', '50% 20%']];
const TEILE = FILM.leiste.map((L, i) => ({ i, name: L.name, n: FILM.pausen[i].n, hoch: HOCH[i][0], pos: HOCH[i][1], txt: SATZ[i] }));

/* Leiste wie im Film: drei Teile, Nummer, Name, Balken (Runde 6: ohne die Leistung darunter) */
const barHtml = (btn) => TEILE.map(t => `<${btn ? 'button type="button"' : 'div'} class="sh-bar__p" data-p="${t.i}"><span class="sh-bar__top"><span class="sh-bar__no">${pad2(t.i + 1)}</span><span class="sh-bar__n">${esc(t.name)}</span></span><span class="sh-bar__line"><i data-f></i></span></${btn ? 'button' : 'div'}>`).join('');
const setBar = (root, cur, fills) => { if (root.dataset.cur !== String(cur)) root.dataset.cur = cur; $$('.sh-bar__p', root).forEach((p, i) => {
  p.classList.toggle('is-cur', i === cur);
  $('[data-f]', p).style.transform = `scaleX(${cl(fills[i]).toFixed(4)})`;
}); };
/* Sätze, die sich mit dem Titel überblenden (02, 06): je Teil ein <p data-t> im selben Rasterfeld */
const satzHtml = cls => TEILE.map(t => `<p class="${cls}" data-t="${t.i}">${esc(t.txt)}</p>`).join('');

/* Titel, die sich überblenden (02, 05, 07): je Teil ein <p data-t> im selben Rasterfeld */
const titlesHtml = cls => TEILE.map(t => `<p class="${cls}" data-t="${t.i}">${esc(t.name)}</p>`).join('');

/* ---------- 01 Drei Kapitel ---------- */
function v1() {
  const el = $('[data-sh1]'); if (!el) return;
  el.innerHTML = TEILE.map(t => `<article class="sh1__c" data-reveal="${t.i * 120}">
    <a class="sh1__pic" data-par="y" href="leistungen.html" tabindex="-1" aria-hidden="true">${par(media(t.hoch, '', dl(t.i)))}</a>
    <p class="info sh1__n">${esc(t.n)}</p>
    <h3 class="sh1__t">${esc(t.name)}</h3>
    <p class="sh1__x">${esc(t.txt)}</p>
  </article>`).join('');
}

/* ---------- 02 Drei Titel ---------- */
function v2() {
  const sec = $('[data-sh2]'); if (!sec) return;
  /* Runde 6: Überschrift über der Bühne, der Fortschritt zählt nur im stehenden Teil (data-sh2-run) */
  const run = $('[data-sh2-run]', sec), ts = $('[data-sh2-ts]', sec), xs = $('[data-sh2-xs]', sec), pics = $('[data-sh2-pics]', sec), num = $('[data-sh2-n]', sec), bar = $('[data-sh2-bar]', sec);
  ts.innerHTML = titlesHtml('sh2__t');
  xs.innerHTML = satzHtml('sh2__x');
  pics.innerHTML = TEILE.map(t => media(t.hoch, 'sh2__img is-st', dl(t.i), `data-t="${t.i}"`)).join('');
  bar.innerHTML = barHtml(false);
  let last = -1;
  loop.add({ tick() {
    const pr = prOf(run);
    /* das Bild steigt beim Scrollen langsam (über den ganzen Abschnitt, damit es an den Wechseln nicht springt) */
    if (!reduce) pics.style.transform = `translate3d(0,${((.5 - pr) * (innerWidth < 900 ? 28 : 120)).toFixed(1)}px,0)`;
    /* jeder Teil bekommt ein Drittel, die Leiste füllt sich mit */
    const f = Math.min(2.999, pr * 3), cur = Math.floor(f);
    if (cur !== last) {
      last = cur; num.textContent = TEILE[cur].n;
      $$('[data-t]', sec).forEach(e => e.classList.toggle('is-on', +e.dataset.t === cur));
    }
    setBar(bar, cur, TEILE.map(t => cl(f - t.i)));
  } });
}

/* Filme je Teil: quer (1280 x 800) mit Ausschnitt, hoch (720 x 1080) mit Ausschnitt aus TEILE */
const WIDE = [['machbarkeit', '62% 50%'], ['bau', '50% 30%'], ['betrieb', '58% 50%']];
const wideM = (t, cls = '', attrs = '') => media(WIDE[t.i][0], cls, `object-position:${WIDE[t.i][1]};${dl(t.i)}`, attrs);
const hochM = (t, cls = '', attrs = '') => media(t.hoch, cls, `object-position:${t.pos};${dl(t.i)}`, attrs);
const split = name => { const k = name.indexOf(' '); return k < 0 ? [name, ''] : [name.slice(0, k), name.slice(k + 1)]; };
const FINE = matchMedia('(hover:hover) and (pointer:fine)');
const prOf = sec => { const r = sec.getBoundingClientRect(); return cl(-r.top / Math.max(1, r.height - innerHeight)); };

/* ---------- 03 Zeilen ---------- */
function vZ() {
  const sec = $('[data-shz]'); if (!sec) return;
  const rowsEl = $('[data-shz-rows]', sec), fl = $('[data-shz-float]', sec), fi = $('[data-shz-fi]', sec);
  rowsEl.innerHTML = TEILE.map(t => `<a class="shz__r" data-p="${t.i}" href="leistungen.html">
      <span class="info shz__n">${esc(t.n)}</span>
      <span class="shz__t">${esc(t.name)}</span>
      <span class="shz__pic" aria-hidden="true">${wideM(t)}</span>
      <span class="shz__x">${esc(t.txt)}</span>
    </a>`).join('');
  fi.innerHTML = TEILE.map(t => hochM(t, 'shz__img is-st', `data-p="${t.i}"`)).join('');
  const rows = $$('.shz__r', rowsEl), vs = $$('video', fi);
  let cur = -1, mx = 0, my = 0, fx = 0, fy = 0, rot = 0, raf = 0, inside = false;
  const set = i => {
    if (i === cur) return; cur = i;
    rows.forEach((r, k) => r.classList.toggle('is-cur', k === i));
    rowsEl.classList.toggle('is-hov', i >= 0); fl.classList.toggle('is-on', i >= 0);
    vs.forEach((v, k) => v.classList.toggle('is-on', k === i));
    syncV();
  };
  /* das Bild folgt dem Zeiger mit etwas Verzug und neigt sich in die Laufrichtung */
  const place = () => { fl.style.transform = `translate3d(${fx.toFixed(1)}px,${fy.toFixed(1)}px,0) translate(-50%,-50%) rotate(${rot.toFixed(2)}deg)`; };
  const step = () => {
    raf = 0; const dx = mx - fx, dy = my - fy;
    fx += dx * .14; fy += dy * .14; rot += (Math.max(-7, Math.min(7, dx * .05)) - rot) * .12; place();
    if (Math.abs(dx) > .3 || Math.abs(dy) > .3 || Math.abs(rot) > .05) raf = requestAnimationFrame(step);
  };
  const pick = () => { const el = document.elementFromPoint(mx, my), r = el && el.closest('.shz__r'); set(r && rowsEl.contains(r) ? +r.dataset.p : -1); };
  rowsEl.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse' || !FINE.matches) return;
    mx = e.clientX; my = e.clientY;
    if (!inside) { inside = true; fx = mx; fy = my; rot = 0; place(); }
    pick();
    if (reduce) { fx = mx; fy = my; place(); } else if (!raf) raf = requestAnimationFrame(step);
  });
  rowsEl.addEventListener('pointerleave', () => { inside = false; set(-1); });
  addEventListener('scroll', () => { if (inside) pick(); }, { passive: true });
}

/* ---------- 04 Karten ---------- */
function vK() {
  const sec = $('[data-shk]'); if (!sec) return;
  const box = $('[data-shk-cards]', sec);
  box.innerHTML = TEILE.map(t => `<article class="shk__c" data-p="${t.i}" style="--i:${t.i}">
      <div class="shk__strip"><p class="info shk__n">${esc(t.n)}</p><p class="shk__sn">${esc(t.name)}</p></div>
      <div class="shk__body">
        <a class="shk__pic" href="leistungen.html" tabindex="-1" aria-hidden="true">${wideM(t, 'is-st')}</a>
        <div class="shk__txt">
          <h3 class="shk__t">${esc(t.name)}</h3>
          <p class="shk__x">${esc(t.txt)}</p>
          <a class="sh-btn" href="leistungen.html">Services entdecken</a>
        </div>
      </div>
    </article>`).join('');
  const cards = $$('.shk__c', box), strips = cards.map(c => $('.shk__strip', c)), vs = cards.map(c => $('video', c)), n = cards.length;
  loop.add({ tick() {
    const vh = innerHeight, rs = cards.map(c => c.getBoundingClientRect());
    if (rs[0].top > vh + 200 || rs[n - 1].bottom < -200) return;
    cards.forEach((c, k) => {
      const S = strips[k].offsetHeight, r = rs[k], next = k < n - 1 ? rs[k + 1].top : Infinity;
      /* die nächste Karte schiebt sich darüber: diese wird dunkler und rückt etwas nach hinten */
      const u = k < n - 1 ? cl(1 - (next - r.top - S) / Math.max(1, r.height - S)) : 0;
      c.style.setProperty('--u', u.toFixed(3));
      /* Film spielt, solange vom Bild etwas zu sehen ist */
      vs[k].classList.toggle('is-on', Math.min(next, vh) - Math.max(r.top + S, 0) > 40);
    });
  } });
}

/* ---------- 05 Folge ---------- */
function vL() {
  const sec = $('[data-shl]'); if (!sec) return;
  const cols = $('[data-shl-cols]', sec), bar = $('[data-shl-bar]', sec);
  cols.innerHTML = TEILE.map(t => `<article class="shl__c" data-p="${t.i}">
      <a class="shl__pic" href="leistungen.html" tabindex="-1" aria-hidden="true">${wideM(t, 'is-st')}</a>
      <p class="info shl__n">${esc(t.n)}</p>
      <h3 class="shl__t">${esc(t.name)}</h3>
      <p class="shl__x">${esc(t.txt)}</p>
    </article>`).join('');
  bar.innerHTML = barHtml(false);
  const cards = $$('.shl__c', cols);
  let last = -1;
  loop.add({ tick() {
    /* wie 02: jedes Kapitel bekommt ein Drittel, die Leiste füllt sich mit */
    const pr = prOf(sec), f = Math.min(2.999, pr * 3), cur = Math.floor(f);
    if (cur !== last) {
      last = cur;
      cards.forEach((c, k) => {
        c.classList.toggle('is-cur', k === cur); c.classList.toggle('is-done', k < cur);
        $('video', c).classList.toggle('is-on', k === cur);
      });
    }
    setBar(bar, cur, TEILE.map(t => cl(f - t.i)));
  } });
}

/* ---------- 06 Mitte ---------- */
function vM() {
  const sec = $('[data-shm]'); if (!sec) return;
  /* Runde 6: Überschrift über der Bühne, der Fortschritt zählt nur im stehenden Teil (data-shm-run) */
  const run = $('[data-shm-run]', sec), wa = $('[data-shm-a]', sec), wb = $('[data-shm-b]', sec), pics = $('[data-shm-pics]', sec), xs = $('[data-shm-xs]', sec), num = $('[data-shm-n]', sec), bar = $('[data-shm-bar]', sec);
  wa.textContent = split(TEILE[0].name)[0];
  wb.innerHTML = TEILE.map(t => `<p class="shm__t" data-t="${t.i}">${esc(split(t.name)[1])}</p>`).join('');
  xs.innerHTML = satzHtml('shm__x');
  pics.innerHTML = TEILE.map(t => hochM(t, 'shm__img is-st', `data-t="${t.i}"`)).join('');
  bar.innerHTML = barHtml(false);
  let last = -1;
  loop.add({ tick() {
    const pr = prOf(run), d = pr - .5;
    /* beim Scrollen steigt das Bild, die beiden Wörter gehen langsam auseinander */
    if (!reduce) {
      pics.style.transform = `translate3d(0,${(-d * (innerWidth < 900 ? 24 : 70)).toFixed(1)}px,0)`;
      const wd = innerWidth < 900 ? 16 : 64;
      wa.style.transform = `translate3d(${(-d * wd).toFixed(1)}px,0,0)`; wb.style.transform = `translate3d(${(d * wd).toFixed(1)}px,0,0)`;
    }
    const f = Math.min(2.999, pr * 3), cur = Math.floor(f);
    if (cur !== last) {
      last = cur; num.textContent = TEILE[cur].n;
      $$('[data-t]', sec).forEach(e => e.classList.toggle('is-on', +e.dataset.t === cur));
    }
    setBar(bar, cur, TEILE.map(t => cl(f - t.i)));
  } });
}

/* ---------- 07 Versetzt ---------- */
function vX() {
  const sec = $('[data-shx]'); if (!sec) return;
  const cols = $('[data-shx-cols]', sec);
  cols.innerHTML = TEILE.map(t => `<article class="shx__c" data-p="${t.i}">
      <a class="shx__pic" href="leistungen.html" tabindex="-1" aria-hidden="true">${hochM(t)}</a>
      <h3 class="shx__t">${esc(t.name)}</h3>
      <p class="info shx__n">${esc(t.n)}</p>
      <p class="shx__x">${esc(t.txt)}</p>
    </article>`).join('');
  if (reduce) return;
  /* jede Spalte läuft mit eigener Geschwindigkeit; in der Mitte des Bildschirms stehen sie auf ihrem Versatz */
  const cards = $$('.shx__c', cols), wide = matchMedia('(min-width:900px)'), SP = [.04, .12, .2];
  let on = false;
  loop.add({ tick() {
    if (!wide.matches) { if (on) { on = false; cards.forEach(c => { c.style.transform = ''; }); } return; }
    const r = cols.getBoundingClientRect(), vh = innerHeight; if (r.bottom < -300 || r.top > vh + 300) return;
    on = true; const d = Math.max(-1.2, Math.min(1.2, (r.top + r.height / 2 - vh / 2) / vh));
    cards.forEach((c, k) => { c.style.transform = `translate3d(0,${(d * vh * SP[k]).toFixed(1)}px,0)`; });
  } });
}

/* Filme: spielen nur, solange sie sichtbar sind (mit etwas Vorlauf), in Stapeln nur das aktive; die Datei lädt beim ersten Spielen.
   Ohne Bewegung bleibt das Poster stehen */
const VS = [];
const syncV = () => VS.forEach(v => {
  const want = v._in && (!v.classList.contains('is-st') || v.classList.contains('is-on'));
  if (want) { if (!v.getAttribute('src')) { v.preload = 'auto'; v.src = v.dataset.src; } if (v.paused) v.play().catch(() => {}); }
  else if (!v.paused) v.pause();
});
function vids() {
  if (reduce) return;
  const io = new IntersectionObserver(es => { es.forEach(e => { e.target._in = e.isIntersecting; }); syncV(); }, { rootMargin: '160px 160px' });
  $$('video.sh-m').forEach(v => { v.muted = true; VS.push(v); io.observe(v); });
  loop.add({ tick: syncV });
}

/* Parallaxe für Bilder im Fluss (01, 03, 05): die Ebene läuft gegen die Bewegung, 01 und 05 senkrecht, 03 quer zur Spur (Runde 4: 9 % statt 5 %) */
function parallax() {
  if (reduce) return;
  const els = $$('[data-par]').map(el => ({ el, ax: el.dataset.par, p: $('.sh-par', el) }));
  loop.add({ tick() {
    const vw = innerWidth, vh = innerHeight;
    els.forEach(({ el, ax, p }) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -80 || r.top > vh + 80 || r.right < -80 || r.left > vw + 80) return;
      if (ax === 'x') { const d = Math.max(-1, Math.min(1, (r.left + r.width / 2 - vw / 2) / (vw / 2 + r.width / 2))); p.style.transform = `translate3d(${(-d * r.width * .09).toFixed(1)}px,0,0)`; }
      else { const d = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2))); p.style.transform = `translate3d(0,${(-d * r.height * .09).toFixed(1)}px,0)`; }
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
run('v1', v1); run('v2', v2); run('v3', vZ); run('v4', vK); run('v5', vL); run('v6', vM); run('v7', vX); run('vids', vids); run('par', parallax); run('sw', sw);
reveal(document);
loop.start(frame);
if (document.fonts) document.fonts.ready.then(() => loop.poke());
addEventListener('load', () => loop.poke());
