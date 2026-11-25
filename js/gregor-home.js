/* Gregor auf der Startseite (gregor-home.html), Runde 1, 2026-11-25: der Film mit Gregor statt der Sprungschanze.
   Jeder Film läuft zuerst stumm als Vorschau (Schleife, nur solange er sichtbar ist). Ein Knopf startet ihn von vorn mit Ton
   (im Klick, damit Safari und iOS den Ton erlauben). Läuft einer mit Ton, gehen alle anderen zurück in die Vorschau.
   Am Ende des Films oder mit Schließen geht er zurück in die stumme Vorschau. Am Telefon zeigt der Film mit Ton das ganze Bild (contain).
   01 Vollbild  Film füllt den Abschnitt, Text und Knopf liegen darauf; mit Ton tritt der Text zurück, unten die Leiste (gp)
   02 Rahmen    stehende Bühne, der Rahmen wächst beim Scrollen bis an den Rand, dann der gelbe Knopf; zurückscrollen beendet den Ton
   03 Kino      Vorschau mit gelbem Knopf; der Film mit Ton öffnet sich über der Seite (Esc oder Kreuz schließt, Fokus bleibt im Kino)
   04 Geteilt   Text links, Film hoch rechts mit dem Schalter Ton an (Balken bewegen sich, solange Ton läuft)
   05 Zeiger    am Rechner folgt der Hinweis Mit Ton abspielen der Maus, Klick ins Bild startet oder pausiert; Zeitleiste zum Springen
   Film: Vorschau = assets/video/gregor-vorschau.mp4 (13 s Ausschnitt, stumm, ohne Balken); mit Ton = der Gregor-Film von griffner.com/gregor
   (Framer-Datei mit Balken oben und unten, darum mit Ton immer object-fit: contain). Die Leiste zeigt erst mit Ton Zeit und Länge.
   Ohne Bewegung (prefers-reduced-motion): keine stumme Vorschau, nur das Standbild; der Knopf mit Ton funktioniert. */
import { loop, reveal, $, $$, reduce } from './core.js';
import { initChrome, frame } from './chrome.js';
import { cl, sm, run, runP, sw } from './varianten.js';

const fmt = s => { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
const BARS = '<span class="gv-bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span>';
const ALL = [];

class Film {
  constructor(v, root, opt = {}) {
    this.v = v; this.root = root; this.opt = opt; this.mode = 'vorschau'; this.vis = false; this.subs = []; this.ziel = null; ALL.push(this);
    /* vor: kurzer stummer Ausschnitt für die Vorschau (data-src), ton: der ganze Film mit Ton von griffner.com (data-ton) */
    this.vor = v.dataset.src || ''; this.tonSrc = v.dataset.ton || opt.src || this.vor;
    v.muted = true; v.loop = !opt.einmal; v.playsInline = true;
    v.addEventListener('ended', () => { if (opt.ende) opt.ende(); else if (this.mode !== 'vorschau') this.vorschau(); });
    /* Sprung in der Zeitleiste, bevor der ganze Film geladen ist: nachholen, sobald seine Länge bekannt ist */
    v.addEventListener('loadedmetadata', () => { if (this.ziel != null && this.mode === 'ton' && isFinite(v.duration)) { v.currentTime = this.ziel * v.duration; this.ziel = null; } });
    ['play', 'pause', 'volumechange', 'loadedmetadata', 'durationchange', 'seeked'].forEach(e => v.addEventListener(e, () => this.sync()));
    this.sync();
  }
  quelle(src) { const v = this.v; if (src && v.getAttribute('src') !== src) { v.preload = 'auto'; v.src = src; return true; } return false; }
  laden() { if (!this.v.getAttribute('src')) this.quelle(this.mode === 'ton' ? this.tonSrc : (this.vor || this.tonSrc)); }
  spielen() { this.laden(); const p = this.v.play(); if (p) p.catch(() => this.sync()); }
  vorschau() {
    this.mode = 'vorschau'; const v = this.v; this.ziel = null;
    if (this.vor && v.getAttribute('src') === this.tonSrc && this.vor !== this.tonSrc) { v.pause(); this.quelle(this.vor); }
    v.muted = true; v.loop = !this.opt.einmal;
    if (this.vis && !reduce && !this.opt.einmal) this.spielen(); else v.pause();
    this.sync();
  }
  /* im Klick aufrufen: Quelle wechseln und play() im selben Schritt, dann erlaubt auch iOS den Ton */
  mitTon() {
    ALL.forEach(f => { if (f !== this && f.mode !== 'vorschau') f.vorschau(); });
    this.mode = 'ton'; const v = this.v; v.loop = false; v.muted = false;
    if (!this.quelle(this.tonSrc)) { try { v.currentTime = 0; } catch (e) { /* noch keine Daten */ } }
    this.spielen(); this.sync();
  }
  pp() { if (this.mode === 'vorschau') return this.mitTon(); if (this.v.paused) this.spielen(); else this.v.pause(); }
  ton() { if (this.mode === 'vorschau') return this.mitTon(); this.v.muted = !this.v.muted; }
  springe(fr) {
    const v = this.v; if (this.mode === 'vorschau') this.mitTon();
    if (isFinite(v.duration) && v.getAttribute('src') === this.tonSrc) v.currentTime = cl(fr) * v.duration; else this.ziel = cl(fr);
  }
  sicht(b) {
    this.vis = b;
    if (!b) { if (!this.v.paused) this.v.pause(); }
    else if (this.mode === 'vorschau' && !reduce && !this.opt.einmal) this.spielen();
  }
  sync() {
    const v = this.v, r = this.root;
    r.dataset.mode = this.mode; r.classList.toggle('is-paused', v.paused); r.classList.toggle('is-muted', v.muted);
    this.subs.forEach(f => f(this));
  }
}

/* Fortschritt und Zeit: ein eigener Takt, der nur laufende Filme mit Ton nachzieht */
function takt() {
  ALL.forEach(f => { if (f.mode === 'ton' && !f.v.paused) f.subs.forEach(s => s(f)); });
  requestAnimationFrame(takt);
}

/* Zeitleiste zum Springen (Ziehen mit Maus oder Finger, Pfeiltasten je 5 s) */
function seekbar(line, film) {
  const at = e => { const r = line.getBoundingClientRect(); return cl((e.clientX - r.left) / r.width); };
  let drag = false;
  line.addEventListener('pointerdown', e => { drag = true; line.setPointerCapture(e.pointerId); film.springe(at(e)); });
  line.addEventListener('pointermove', e => { if (drag) film.springe(at(e)); });
  line.addEventListener('pointerup', () => { drag = false; });
  line.addEventListener('pointercancel', () => { drag = false; });
  line.addEventListener('keydown', e => {
    const v = film.v; if (!isFinite(v.duration)) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); film.springe((v.currentTime + (e.key === 'ArrowRight' ? 5 : -5)) / v.duration); }
  });
}

/* Leiste unten (01, 02, Kino): Pause/Weiter, Zeitleiste, Zeit, Ton, Schließen */
function leiste(gp, film, close) {
  gp.innerHTML = `<button type="button" class="gp__b gp__pp" data-gp-pp aria-label="Pause"><span class="gp__ic" aria-hidden="true"></span></button>
    <span class="gp__line" data-gp-seek role="slider" tabindex="0" aria-label="Stelle im Film"><i data-gp-fill></i></span>
    <span class="gp__t info" data-gp-t>0:00 / 0:00</span>
    <button type="button" class="gp__b gp__ton" data-gp-ton>${BARS}<span data-gp-ton-l>Ton aus</span></button>
    <button type="button" class="gp__b gp__x" data-gp-x aria-label="Schließen"><i></i><i></i></button>`;
  const pp = $('[data-gp-pp]', gp), fill = $('[data-gp-fill]', gp), t = $('[data-gp-t]', gp), tl = $('[data-gp-ton-l]', gp);
  pp.addEventListener('click', () => film.pp());
  $('[data-gp-ton]', gp).addEventListener('click', () => film.ton());
  $('[data-gp-x]', gp).addEventListener('click', () => (close ? close() : film.vorschau()));
  seekbar($('[data-gp-seek]', gp), film);
  film.subs.push(f => {
    const v = f.v, d = v.duration || 0;
    fill.style.transform = `scaleX(${d ? (v.currentTime / d).toFixed(4) : 0})`;
    t.textContent = `${fmt(v.currentTime)} / ${fmt(d)}`;
    pp.setAttribute('aria-label', v.paused ? 'Weiter' : 'Pause');
    tl.textContent = v.muted ? 'Ton an' : 'Ton aus';
  });
}

/* Sichtbarkeit: Vorschau spielt nur, solange mindestens ein Viertel des Films zu sehen ist */
const io = new IntersectionObserver(es => es.forEach(e => { const f = e.target._film; if (f) f.sicht(e.isIntersecting); }), { threshold: .25 });
const watch = (el, film) => { el._film = film; io.observe(el); };

/* Steuerung blendet sich am Rechner nach 2,5 s ohne Bewegung aus */
function ruhe(root) {
  let tm; const wach = () => { root.classList.remove('is-idle'); clearTimeout(tm); tm = setTimeout(() => root.classList.add('is-idle'), 2500); };
  root.addEventListener('pointermove', wach); root.addEventListener('pointerdown', wach); wach();
}

/* ---------- 01 Vollbild ---------- */
function gg1() {
  const s = $('[data-gv="1"]'); if (!s) return;
  const film = new Film($('[data-gv-v]', s), s);
  $('[data-gv-go]', s).addEventListener('click', () => film.mitTon());
  leiste($('[data-gp]', s), film); watch(s, film); ruhe(s);
}

/* ---------- 02 Rahmen ---------- */
function gg2() {
  const s = $('[data-gv="2"]'); if (!s) return;
  const runEl = $('[data-g2-run]', s), fr = $('[data-g2-frame]', s), head = $('[data-g2-head]', s);
  const film = new Film($('[data-gv-v]', fr), s);
  $('[data-gv-go]', s).addEventListener('click', () => film.mitTon());
  leiste($('[data-gp]', s), film); watch(fr, film); ruhe(s);
  let last = '';
  loop.add({ tick() {
    const r = runEl.getBoundingClientRect(); if (r.bottom < -40 || r.top > innerHeight + 40) return;
    const W = innerWidth, H = innerHeight, mob = W < 900, p = runP(runEl);
    const g = reduce ? 1 : sm(p / .62);
    const w0 = mob ? W - 48 : Math.min(W * .42, 680), h0 = w0 * 9 / 16;
    const w = w0 + (W - w0) * g, h = h0 + (H - h0) * g;
    const cy = (mob ? H * .6 : H * .64) + (H / 2 - (mob ? H * .6 : H * .64)) * g;
    const css = `${w.toFixed(1)}|${h.toFixed(1)}|${cy.toFixed(1)}`;
    if (css !== last) { last = css; fr.style.width = w.toFixed(1) + 'px'; fr.style.height = h.toFixed(1) + 'px'; fr.style.top = (cy - h / 2).toFixed(1) + 'px'; }
    head.style.opacity = (1 - sm((p - .12) / .3)).toFixed(3);
    s.classList.toggle('is-cta', g > .985);
    /* zurück nach oben gescrollt: der Ton endet, der Film läuft wieder stumm */
    if (p < .45 && film.mode === 'ton') film.vorschau();
  } });
}

/* ---------- 03 Kino ---------- */
function gg3() {
  const s = $('[data-gv="3"]'), k = $('[data-g3k]'); if (!s || !k) return;
  const frameBtn = $('[data-gv-go]', s), pre = new Film($('[data-gv-v]', s), s);
  watch(frameBtn, pre);
  const kv = $('[data-g3k-v]', k);
  let kino = null;
  const zu = () => {
    if (k.hidden) return;
    kv.pause(); k.hidden = true; document.documentElement.classList.remove('is-kino');
    if (kino) kino.mode = 'vorschau';
    pre.sicht(true); frameBtn.focus({ preventScroll: true });
  };
  kino = new Film(kv, k, { einmal: true, src: pre.v.dataset.ton, ende: zu });
  leiste($('[data-gp]', k), kino, zu); ruhe(k);
  frameBtn.addEventListener('click', () => {
    k.hidden = false; document.documentElement.classList.add('is-kino');
    pre.sicht(false); kino.mitTon(); $('[data-g3k-x]', k).focus({ preventScroll: true });
  });
  $('[data-g3k-x]', k).addEventListener('click', zu);
  addEventListener('keydown', e => {
    if (k.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); zu(); }
    if (e.key === ' ' && e.target === document.body) { e.preventDefault(); kino.pp(); }
    if (e.key === 'Tab') { /* Fokus bleibt im Kino */
      const f = $$('button,[tabindex="0"]', k); const i = f.indexOf(document.activeElement);
      e.preventDefault(); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });
}

/* ---------- 04 Geteilt ---------- */
function gg4() {
  const s = $('[data-gv="4"]'); if (!s) return;
  const m = $('.gg4__media', s), film = new Film($('[data-gv-v]', m), s);
  $('[data-gv-go]', s).addEventListener('click', () => film.mitTon());
  $('[data-gv-ton]', s).addEventListener('click', () => film.ton());
  const lab = $('[data-gv-ton-l]', s), fill = $('[data-gv-fill]', s);
  film.subs.push(f => {
    const v = f.v, d = v.duration || 0;
    lab.textContent = f.mode === 'vorschau' || v.muted ? 'Ton an' : 'Ton aus';
    fill.style.transform = `scaleX(${f.mode === 'ton' && d ? (v.currentTime / d).toFixed(4) : 0})`;
  });
  watch(m, film);
}

/* ---------- 05 Zeiger ---------- */
function gg5() {
  const s = $('[data-gv="5"]'); if (!s) return;
  const fr = $('[data-g5-frame]', s), hint = $('[data-g5-hint]', s), hl = $('[data-g5-hint-l]', s);
  const film = new Film($('[data-gv-v]', fr), s);
  watch(fr, film);
  const fein = matchMedia('(hover:hover) and (pointer:fine)');
  /* Klick irgendwo ins Bild: Vorschau → mit Ton, sonst Pause/Weiter */
  fr.addEventListener('click', e => { if (e.target.closest('[data-g5-hint]') && !fein.matches) return; film.pp(); });
  hint.addEventListener('click', e => { if (fein.matches) return; e.stopPropagation(); film.pp(); });
  $('[data-gv-ton]', s).addEventListener('click', () => film.ton());
  seekbar($('[data-gv-seek]', s), film);
  const t = $('[data-gv-t]', s), d = $('[data-gv-d]', s), fill = $('[data-gv-fill]', s), tl = $('[data-gv-ton-l]', s);
  film.subs.push(f => {
    const v = f.v, du = v.duration || 0, on = f.mode === 'ton';
    hl.textContent = !on ? 'Mit Ton abspielen' : v.paused ? 'Weiter' : 'Pause';
    tl.textContent = !on || v.muted ? 'Ton an' : 'Ton aus';
    fill.style.transform = `scaleX(${on && du ? (v.currentTime / du).toFixed(4) : 0})`;
    t.textContent = on ? fmt(v.currentTime) : '0:00'; if (on && du) d.textContent = fmt(du);
  });
  /* der Hinweis folgt der Maus (weich nachgezogen) */
  let tx = 0, ty = 0, x = 0, y = 0, inside = false, anim = false;
  const home = () => { const r = fr.getBoundingClientRect(); tx = r.width / 2; ty = r.height / 2; };
  const step = () => {
    x += (tx - x) * .22; y += (ty - y) * .22;
    hint.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(-50%,-50%)`;
    if (Math.abs(tx - x) + Math.abs(ty - y) > .3) requestAnimationFrame(step); else anim = false;
  };
  const go = () => { if (!anim) { anim = true; requestAnimationFrame(step); } };
  fr.addEventListener('pointermove', e => { if (!fein.matches) return; const r = fr.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top; inside = true; s.classList.add('is-zeig'); go(); });
  fr.addEventListener('pointerleave', () => { if (!fein.matches) return; inside = false; s.classList.remove('is-zeig'); home(); go(); });
  const place = () => { if (fein.matches) { if (!inside) { home(); x = tx; y = ty; step(); } } else hint.style.transform = ''; };
  place(); addEventListener('resize', place); fein.addEventListener?.('change', place);
}

run('chrome', initChrome);
run('gg1', gg1); run('gg2', gg2); run('gg3', gg3); run('gg4', gg4); run('gg5', gg5); run('sw', sw);
requestAnimationFrame(takt);
reveal(document);
loop.start(frame);
if (document.fonts) document.fonts.ready.then(() => loop.poke());
addEventListener('load', () => loop.poke());
