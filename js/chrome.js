/* Seitenrahmen: Header, Menü und Footer wie griffner.com, Raumfarben, Tinte für Header und Leiste, Connector, Reiseleiste.
   frame(), pickDock(), dockRect() und colorAt() folgen dem Seitencontroller im Handoff. */
import { $, $$, ease, lerp, hex, mix, css, ink, token, ms, reduce, clamp } from './core.js';
import { RAIL } from '../data/content.js';

const colors = {};
const roomColor = el => {
  const k = el.dataset.room;
  if (!colors[k]) { const t = token('--room-' + k); colors[k] = hex(t || '#000000'); }
  return colors[k];
};
const Lm = c => (c[0] * .2126 + c[1] * .7152 + c[2] * .0722) / 255;
function colorAt(y, rooms) {
  const zone = (a, b) => innerHeight * (Math.abs(Lm(a) - Lm(b)) > .45 ? .035 : .3);
  for (let i = 0; i < rooms.length; i++) {
    const r = rooms[i].getBoundingClientRect();
    if (r.top <= y && r.bottom > y) {
      let c = roomColor(rooms[i]);
      const prev = rooms[i - 1], next = rooms[i + 1];
      if (prev) { const pv = roomColor(prev), Z = zone(pv, c); if (y - r.top < Z) c = mix(pv, c, .5 + (y - r.top) / (2 * Z)); }
      if (next) { const n = roomColor(next), Z = zone(c, n); if (r.bottom - y < Z) c = mix(c, n, .5 - (r.bottom - y) / (2 * Z)); }
      return c;
    }
  }
  return rooms.length && y >= rooms[rooms.length - 1].getBoundingClientRect().bottom ? roomColor(rooms[rooms.length - 1]) : roomColor(rooms[0]);
}

const C = { cur: null, from: null, t0: 0, mode: '', n: 0 };
function dockRect(el) {
  const r = el.getBoundingClientRect(), t = el.dataset.dock, over = parseFloat(token('--connector-overlay-opacity')) || .5;
  if (t === 'edge') {
    const share = parseFloat(el.dataset.dockW || token('--connector-share') || .14);
    const w = Math.min(Math.max(r.width * share, r.width / 12), r.width / 5, innerWidth / 5);
    const hh = w * .8, cx = r.left + r.width * parseFloat(el.dataset.dockX || .72);
    return { x: cx - w / 2, y: r.bottom - hh / 2, w, h: hh, top: over };
  }
  if (t === 'rect') return { x: r.left, y: r.top, w: r.width, h: r.height, top: el.dataset.dockSolid ? 1 : over };
  return { x: r.left, y: r.top, w: r.width, h: r.width * .8, top: t === 'home' || el.dataset.dockSolid ? 1 : over };
}
function pickDock() {
  const docks = $$('[data-dock]');
  const home = docks.find(d => d.dataset.dock === 'home');
  if (scrollY < 24 || document.documentElement.dataset.menu === 'open') return home;
  const lim = innerHeight * .5;
  let act = null;
  docks.forEach(d => {
    if (d === home) return;
    const trg = d.dataset.dockTrigger ? document.getElementById(d.dataset.dockTrigger) : d.closest('[data-room]');
    if (trg && trg.getBoundingClientRect().top <= lim) act = d;
  });
  return act || home;
}

/* Header, Menü und Footer wie auf griffner.com (Stand 04.11.2026). Eine Quelle für alle Seiten des Prototyps. */
const G = 'https://griffner.com';
const HEADER = `
    <button class="hd__menu" type="button" data-menu-btn aria-expanded="false" aria-controls="menu" aria-label="Menü öffnen"><span class="hd__bars" aria-hidden="true"><i></i><i></i></span><span class="hd__lbl info" aria-hidden="true">Menu</span></button>
    <div class="hd__prog" aria-hidden="true"><i data-hd-prog></i></div>
    <a class="hd__marke" href="${G}/" aria-label="GRIFFNER Startseite"><span class="wm"></span></a>
    <a class="hd__logo" href="${G}/" data-logo aria-label="GRIFFNER Startseite"><span class="hd__field" data-dock="home"></span><span class="wm" aria-hidden="true"></span></a>
    <a class="hd__cta info" href="${G}/contact#contact-form">Contact</a>`;
const MENU = `
    <div class="menu__in">
      <ul class="menu__list">
        <li><a href="${G}/projects" data-img="assets/img/waldviertel.jpg" data-cap="Gebaute Häuser">Projects</a></li>
        <li><a href="index.html" aria-current="page" data-img="assets/img/wald-garten-ecke.jpg" data-cap="Ideen zum Weiterdenken">Concepts</a></li>
        <li class="is-soon"><span>Services</span><span class="info">Coming 13.11.</span></li>
        <li class="is-soon"><span>Journey</span><span class="info">Coming 20.11.</span></li>
        <li><a href="${G}/about" data-img="assets/img/team-07.jpg" data-cap="Über GRIFFNER">About</a></li>
        <li><a href="${G}/visit" data-img="assets/img/manufaktur.jpg" data-cap="Campus Griffen">Visit</a></li>
      </ul>
      <figure class="menu__fig" aria-hidden="true"><div class="menu__img"><img data-menu-img src="assets/img/wald-garten-ecke.jpg" alt=""></div><figcaption class="info" data-menu-cap>Ideen zum Weiterdenken</figcaption></figure>
      <a class="menu__season info" href="${G}/#kapitel"><span>Kapitel 03 / 06</span><span>Nächstes: Services 13.11.</span></a>
      <div class="menu__foot info"><nav aria-label="Weitere Seiten"><a href="${G}/news">News</a><a href="${G}/contact">Contact</a><a href="${G}/careers">Careers</a><a href="${G}/catalogue">Catalogue</a></nav><span>Griffen / AT / 46.70 N / 14.73 E</span></div>
    </div>`;
const FOOTER = `
    <div class="ft__in">
      <div class="ft__cols">
        <div class="ft__col"><span class="info ft__h">Your home</span><a href="index.html">Concepts</a><a href="${G}/projects">Projects</a><span class="is-dim">Services</span><span class="is-dim">Journey</span></div>
        <div class="ft__col"><span class="info ft__h">Our story</span><a href="${G}/about">About</a><a href="${G}/gregor">Gregor Schlierenzauer</a><a href="${G}/careers">Careers</a></div>
        <div class="ft__col"><span class="info ft__h">Let’s talk</span><a href="${G}/contact">Contact</a><a href="${G}/visit">Visit</a><a href="${G}/catalogue">Catalogue</a><a href="${G}/news">News</a></div>
        <div class="ft__col"><span class="info ft__h">Griffen</span><span>Griffnerhaus GmbH</span><span>Gewerbestraße 3</span><span>9112 Griffen</span></div>
      </div>
      <span class="ft__wm" role="img" aria-label="GRIFFNER"></span>
      <div class="ft__base info"><span>Griffen / AT / 46.70 N / 14.73 E</span><span class="ft__legal"><a href="${G}/imprint">Impressum</a><a href="${G}/privacy">Datenschutz</a><span>Cookie-Einstellungen</span></span></div>
    </div>`;
function mount() {
  const hd = $('[data-header]'), mn = $('[data-menu]'), ft = $('[data-footer]');
  if (hd && !hd.children.length) hd.innerHTML = HEADER;
  if (mn && !mn.children.length) mn.innerHTML = MENU;
  if (ft && !ft.children.length) ft.innerHTML = FOOTER;
}

let bgl, conn, ctop, cbot, hk, sk, rooms, introAt = 0, progEl;
export function initChrome() {
  mount();
  bgl = $('[data-bgl]'); conn = $('[data-connector]'); ctop = conn.firstElementChild; cbot = conn.lastElementChild;
  rooms = $$('[data-room]');
  progEl = $('[data-hd-prog]');
  introAt = performance.now();
  initHeader(); initMenu(); initRail();
  document.documentElement.classList.add('is-ready');
}

/* Läuft jedes Bild, damit der Connector gleiten kann */
export function frame() {
  if (!rooms || !rooms.length) return;
  const vh = innerHeight, menu = document.documentElement.dataset.menu === 'open';
  bgl.style.background = css(colorAt(vh / 2, rooms));
  const nk = menu ? '#FFFFFF' : ink(colorAt(44, rooms));
  const nsk = ink(colorAt(vh - 28, rooms));
  const ds = document.documentElement.style;
  if (nk !== hk) { hk = nk; ds.setProperty('--header-ink', hk); }
  if (nsk !== sk) { sk = nsk; ds.setProperty('--season-ink', sk); }
  if (progEl) { const max = Math.max(1, document.documentElement.scrollHeight - vh); progEl.style.transform = `scaleY(${clamp(scrollY / max).toFixed(4)})`; }
  const dock = pickDock(); if (!dock) return;
  const tgt = dockRect(dock); tgt.bot = 1;
  if (dock.dataset.dock === 'home') tgt.h = dock.getBoundingClientRect().height;
  const now = performance.now();
  const mode = (dock.dataset.dockId || (dock.dataset.dockId = String(++C.n)));
  if (mode !== C.mode) { C.from = C.cur ? { ...C.cur } : tgt; C.t0 = now; C.mode = mode; }
  const dur = reduce ? 0 : ms('--dur-glide');
  const k = dur ? ease(Math.min(1, (now - C.t0) / dur)) : 1, f = C.from;
  C.cur = { x: lerp(f.x, tgt.x, k), y: lerp(f.y, tgt.y, k), w: lerp(f.w, tgt.w, k), h: lerp(f.h, tgt.h, k), top: lerp(f.top, tgt.top, k) };
  const c = C.cur, st = conn.style;
  st.transform = `translate3d(${c.x.toFixed(2)}px,${c.y.toFixed(2)}px,0)`;
  st.width = c.w.toFixed(2) + 'px'; st.height = Math.max(0, c.h).toFixed(2) + 'px';
  ctop.style.opacity = c.top.toFixed(3);
  const ready = now - introAt > 900;
  /* Nie unter den Header: ein Andockpunkt, der nach oben weggescrollt ist, zeigt keinen Connector */
  const under = dock.dataset.dock !== 'home' && tgt.y + tgt.h < 110;
  st.opacity = ready && !dock.dataset.dockHide && !under && c.h > 1 ? '1' : '0';
}

/* Kompakt: Logo weg, kleine Wortmarke links. Das gelbe Feld oben hat dann keinen Platz mehr für den Connector. */
function setCompact(on) {
  const hd = $('[data-header]'), f = $('[data-dock="home"]');
  hd.classList.toggle('is-compact', on);
  if (on) f.dataset.dockHide = '1'; else delete f.dataset.dockHide;
}
/* Header wie griffner.com: oben das Logo mit dem gelben Feld, beim Scrollen weicht es der kleinen Wortmarke links */
function initHeader() {
  const hd = $('[data-header]');
  const band = () => {
    const open = document.documentElement.dataset.menu === 'open';
    setCompact(scrollY > 80 && !open);
  };
  addEventListener('scroll', band, { passive: true }); band();
}

function initMenu() {
  const btn = $('[data-menu-btn]'), panel = $('#menu');
  const img = $('[data-menu-img]', panel), cap = $('[data-menu-cap]', panel);
  const set = open => {
    document.documentElement.dataset.menu = open ? 'open' : '';
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    panel.hidden = !open; requestAnimationFrame(() => panel.classList.toggle('is-open', open));
    $('[data-dock="home"]').style.background = open ? 'var(--griffner-gelb)' : 'transparent';
    setCompact(!open && scrollY > 80);
  };
  btn.addEventListener('click', () => set(document.documentElement.dataset.menu !== 'open'));
  panel.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
  $$('a[data-img]', panel).forEach(a => a.addEventListener('pointerenter', () => {
    if (img.getAttribute('src') !== a.dataset.img) { img.classList.remove('is-in'); img.src = a.dataset.img; requestAnimationFrame(() => requestAnimationFrame(() => img.classList.add('is-in'))); }
    cap.textContent = a.dataset.cap;
  }));
  img.classList.add('is-in');
  addEventListener('keydown', e => { if (e.key === 'Escape' && document.documentElement.dataset.menu === 'open') set(false); });
}

/* Reiseleiste unten links: zeigt das aktuelle Kapitel der Reise, jedes Segment springt hin */
let rail, railItems, railLabel, railNr;
function initRail() {
  rail = $('[data-rail]'); if (!rail) return;
  const bar = $('[data-rail-bar]', rail);
  railLabel = $('[data-rail-label]', rail); railNr = $('[data-rail-nr]', rail);
  railItems = RAIL.map(([id, nr, name]) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'rail__seg'; b.setAttribute('aria-label', `Kapitel ${nr}, ${name}`);
    b.innerHTML = '<span></span>';
    b.addEventListener('click', () => { const t = document.getElementById(id); t && scrollTo({ top: t.getBoundingClientRect().top + scrollY, behavior: reduce ? 'auto' : 'smooth' }); });
    bar.appendChild(b);
    return { id, nr, name, b, fill: b.firstElementChild };
  });
}
export function tickRail() {
  if (!railItems) return;
  const mid = innerHeight * .5;
  let cur = -1;
  railItems.forEach((it, i) => {
    const el = document.getElementById(it.id); if (!el) return;
    const r = el.getBoundingClientRect();
    const p = clamp((mid - r.top) / Math.max(1, r.height));
    it.fill.style.transform = `scaleX(${p.toFixed(3)})`;
    if (r.top <= mid) cur = i;
  });
  const last = document.getElementById(railItems[railItems.length - 1].id).getBoundingClientRect();
  const show = cur >= 0 && last.bottom > mid;
  rail.classList.toggle('is-on', show);
  if (cur >= 0 && railItems[cur]) { railNr.textContent = railItems[cur].nr + ' / 0' + railItems.length; railLabel.textContent = railItems[cur].name; }
  railItems.forEach((it, i) => it.b.classList.toggle('is-cur', i === cur));
}
