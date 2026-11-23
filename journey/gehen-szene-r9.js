/* GRIFFNER Journey, Vorschlag 1 Gehen: du gehst in 3D auf dein Haus zu. Die Figur ist die aus dem Concepts Hero.
   Eine Szene für beide Orte: die Vorschlagsseite gehen.html und die Framer Code-Komponente JourneyGehen
   (journey/framer-bau.mjs baut daraus die Komponente, mit allen Texten als Eingabefelder).

   Runde 2 (2026-11-19, Kundenwunsch: „er geht zu schnell, Halt etwas kürzer, alles weicher“):
   - Weg je Station 5,5 m statt 7 m und 75 statt 62 vh Scrollweg je Station: die Figur geht rund dreimal langsamer pro Scrollweg.
   - Gehen 80 % der Station, Stehen 20 % (vorher 55 / 45): kürzerer Halt.
   - Gehen mit sanftem Anlauf und Auslaufen und gleichmäßigem Tempo dazwischen (statt Smoothstep mit Spitze in der Mitte).
   - Der Scrollwert läuft über eine kritisch gedämpfte Feder: kein Ruck beim Anfahren oder Anhalten.
   - Schrittfrequenz höchstens 1,8 Doppelschritte je Sekunde: bei schnellem Scrollen werden die Schritte länger, nie hektisch.

   Runde 3 (2026-11-19, Kundenwunsch: „eine Illustration je Schritt, dezent und verständlich, über dem Feld; menschlicher; Familie“):
   - Über jedem gelben Feld ein Linienbild zum Schritt (ICONS, weiße Linien als SVG-Bild, kein Canvas). Es wird hell, wenn die Familie kommt.
   - Statt der einen Figur geht eine Familie (Vater, Mutter, Tochter, Sohn): eigene Figuren mit menschlichen Proportionen in gedämpften Farben
     (familie-mensch.js), bewegt von einem echten aufgenommenen Gang (gang-daten.js, CC0). Sie halten sich an den Händen;
     an jeder Station dreht sich ein Kind zu dir um und winkt. Fehlt die Familie, geht wie bisher die Figur aus dem Concepts Hero.
   Runde 5 (2026-11-19, Kundenwunsch: „eine andere Art Menschen“, gewählt: echte Menschen): die Familie sind echte Menschen-Modelle
     (familie-echt.js, Microsoft Rocketbox, MIT), gleiche Schnittstelle, gleicher Gang, Händehalten und Winken.
   Runde 7 (2026-11-19, Kundenwunsch: „die animierten zurück, die echten sehen zu seltsam aus“): wieder die Spielfiguren aus Runde 3
     (familie-toy.js), kleiner und enger, in GRIFFNER Farben, mit Blinzeln, Blicken und Winken mit dem äußeren Arm. Ohne Händehalten.
   Runde 9 (2026-11-20, Kundenwunsch: „für das Telefon fertig, schnell laden, leicht und ohne Ruckeln scrollen“):
   - Das Paar lädt sofort beim Einbinden, parallel zu three.js (deps.prefetch); das Telefon nimmt die kleine Datei (familie-echt-s.bin.gz).
   - Das 3D-Bild erscheint erst, wenn das Paar da ist (höchstens 2,5 s warten), und blendet weich ein: niemand springt ins Bild.
   - Telefon und Tablet: höchstens 1,5 Bildpunkte je CSS-Pixel, Schattenkarte 1024, kein Puffer für Screenshots.
     Kommt ein Gerät nicht mit (deutlich langsamer als sein Bildschirmtakt), wird die Szene in bis zu zwei Stufen leichter.
   - Steht alles still, zeichnet die Szene nur rund 30 Bilder je Sekunde (Blinzeln, Atmen): spart Akku und Wärme, das Telefon bleibt schnell.
   - Texte und Marken werden nur geschrieben, wenn sie sich ändern.
   - Ohne WebGL (oder bei einem Fehler im 3D): die ruhige Fassung mit allen Schritten als Liste, statt einer schwarzen Fläche. */

export const DEF = {
  intro: { info: 'Journey', h: 'Vom ersten Gespräch bis zum Schlüssel.', lead: 'Ein Projektmanager an deiner Seite. Und der Schlüssel in zehn Monaten.', hint: 'Scrollen' },
  steps: [
    { t: 'Kennenlernen', d: 'Wir hören zu, bevor wir zeichnen.', m: 'Vorab', b: 'gespraech' },
    { t: 'Grundstück', d: 'Wir lesen deinen Ort. Gelände, Bäume, Sonne.', m: 'Vorab', b: 'grundstueck' },
    { t: 'Inspiration', d: 'Vier Concepts zum Weiterdenken.', m: 'Vorab', b: 'inspiration' },
    { t: 'Vertrag', d: 'Persönlicher Projektmanager ab dem ersten Tag.', m: 'Monat 0', b: 'vertrag' },
    { t: 'Dein Plan', d: 'Grundriss, Ansichten, Lage stehen fest.', m: 'Monat 1', b: 'plan' },
    { t: 'Eingereicht', d: 'Unterlagen vollständig, wir liefern jedes Dokument.', m: 'Monat 2', b: 'eingereicht' },
    { t: 'Bemusterung', d: 'Besuch in Griffen, Ausstattung festlegen.', m: 'Monat 3', b: 'bemusterung' },
    { t: 'Baubescheid', d: 'Die Gemeinde gibt grünes Licht.', m: 'Monat 4', b: 'bescheid' },
    { t: 'Planung fixiert', d: 'Geht in Fertigung, ab hier ändert sich nichts mehr.', m: 'Monat 5', b: 'fixiert' },
    { t: 'Baustart', d: 'Das Fundament entsteht.', m: 'Monat 6', b: 'baustart' },
    { t: 'Dein Haus entsteht', d: 'Eine Woche Manufaktur in Griffen, dann steht es mit Dach und Fenstern.', m: 'Monat 7', b: 'haus' },
    { t: 'Haustechnik', d: 'Heizung, Lüftung, Strom, Wasser.', m: 'Monat 8', b: 'technik' },
    { t: 'Innenausbau', d: 'Türen, Böden, Bäder. Jetzt wird es deins.', m: 'Monat 9', b: 'ausbau' },
    { t: 'Einzug', d: 'Wir gehen ein letztes Mal gemeinsam durch dein Haus. Dann schließt du selbst auf.', m: 'Monat 10', b: 'schluessel' }
  ],
  outro: { info: 'Dein Haus', h: '10 Monate. Dein Traumhaus ist bezugsfertig.', lead: 'Während andere noch planen, lebst du schon.', cta: 'Kontakt aufnehmen', href: 'https://griffner.com/contact#contact-form' }
};

/* Bilder zu den Schritten: Linien auf 48 × 48, weiß, ohne Füllung (Punkte gefüllt). Titel für die Auswahl in Framer. */
export const ICONS = {
  gespraech: ['Gespräch', '<path d="M9 9h20a4 4 0 0 1 4 4v9a4 4 0 0 1-4 4H18l-6 5v-5H9a4 4 0 0 1-4-4v-9a4 4 0 0 1 4-4z"/><path d="M37 17h2a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4h-1v5l-6-5h-8a4 4 0 0 1-4-3"/><circle cx="13" cy="17.5" r="1.4" class="f"/><circle cx="19" cy="17.5" r="1.4" class="f"/><circle cx="25" cy="17.5" r="1.4" class="f"/>'],
  grundstueck: ['Grundstück', '<path d="M3 40l12-10h30L33 40z"/><path d="M29 35V23"/><path d="M29 23c-5 0-7-3-7-6s3-7 7-7 7 3 7 7-2 6-7 6z"/><circle cx="12" cy="12" r="3.5"/><path d="M12 4.5v2M12 17.5v2M4.5 12h2M17.5 12h2"/>'],
  inspiration: ['Vier Häuser', '<path d="M6 21v-8l7-6 7 6v8z"/><path d="M28 21v-8l7-6 7 6v8z"/><path d="M6 42v-8l7-6 7 6v8z"/><path d="M28 42v-8l7-6 7 6v8z"/>'],
  vertrag: ['Vertrag', '<path d="M11 4h19l8 8v32H11z"/><path d="M30 4v8h8"/><path d="M16 17h15M16 22h15M16 27h9"/><path d="M16 37c2-4 4-4 5 0s3 3 5-1 3-2 5 1"/>'],
  plan: ['Grundriss', '<path d="M5 7h38v34H5z"/><path d="M5 24h14M25 24h18M29 7v10M29 30v11"/><path d="M19 24v-6"/><path d="M19 18a6 6 0 0 1 6 6"/>'],
  eingereicht: ['Einreichen', '<path d="M4 14h14l4 5h22v23H4z"/><path d="M24 36V24M19 29l5-5 5 5"/>'],
  bemusterung: ['Muster', '<path d="M23 43L9 17l7-4 11 27"/><path d="M24 42V8h8v34"/><path d="M27 42L39 15l7 3-14 26"/><circle cx="26.5" cy="39" r="1.3" class="f"/>'],
  bescheid: ['Bescheid', '<path d="M10 4h22l6 6v34H10z"/><path d="M32 4v6h6"/><path d="M17 27l5 5 10-11"/>'],
  fixiert: ['Schloss', '<path d="M13 22h22v20H13z"/><path d="M17 22v-6a7 7 0 0 1 14 0v6"/><path d="M24 30v5"/>'],
  baustart: ['Spaten', '<path d="M3 42h42"/><path d="M8 42c4-7 10-9 15-9s11 2 15 9"/><path d="M30 5v19"/><path d="M26 5h8"/><path d="M26 24h8v7l-4 5-4-5z"/>'],
  haus: ['Haus mit Kran', '<path d="M5 43V29l11-9 11 9v14z"/><path d="M13 43v-8h6v8"/><path d="M37 43V7"/><path d="M26 7h19"/><path d="M30 7v9"/><path d="M28 18a2 2 0 1 0 2-2"/><path d="M37 13l-7-6M37 13l7-6"/>'],
  technik: ['Haustechnik', '<path d="M16 5l-7 15h7l-4 13 12-17h-7l4-11z"/><path d="M35 9c4 6 7 10 7 14a7 7 0 0 1-14 0c0-4 3-8 7-14z"/><path d="M5 40c3-2 5-2 8 0s5 2 8 0 5-2 8 0 5 2 8 0 5-2 7 0"/>'],
  ausbau: ['Farbrolle', '<path d="M7 7h26v9H7z"/><path d="M33 11h5v10H21v6"/><path d="M19 27h4v15h-4z"/>'],
  schluessel: ['Schlüssel', '<circle cx="14" cy="24" r="8"/><circle cx="14" cy="24" r="2.5"/><path d="M22 24h22"/><path d="M38 24v7M43 24v5"/>']
};
const icon = (k, cls = '') => ICONS[k] ? `<svg class="${cls}" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k][1].replace(/class="f"/g, 'fill="currentColor" stroke="none"')}</svg>` : '';

/* Zeitplan in Einheiten: Anlauf L0, dann je Station gehen (WALK) und kurz stehen, zuletzt zur Tür und hinein */
export const TIMING = { L0: .6, WALK: .8, END: 1.9, VH: 75, SP: 5.5 };
export const units = n => TIMING.L0 + n + TIMING.END;
export const sectionHeight = n => `calc(${(units(n) * TIMING.VH).toFixed(1)}vh + 100vh)`;

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const E = (x, a, b) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const nr = i => String(i + 1).padStart(2, '0');

/* Gehen mit Anlauf und Auslaufen: Tempo steigt über die ersten 22 %, bleibt gleich, fällt über die letzten 22 % */
const RAMP = .22;
const walkEase = f => {
  const v = 1 / (1 - RAMP);
  if (f <= 0) return 0; if (f >= 1) return 1;
  if (f < RAMP) return v * f * f / (2 * RAMP);
  if (f > 1 - RAMP) return 1 - v * (1 - f) * (1 - f) / (2 * RAMP);
  return v * (f - RAMP / 2);
};

/* Texte bereinigen: leere Schritte fallen weg, fehlende Felder bleiben leer */
export function clean(c = {}) {
  const pick = (o, d) => ({ ...d, ...Object.fromEntries(Object.entries(o || {}).filter(([, v]) => v != null)) });
  /* Bild: gewählt (b), „keins“ = ohne; nicht gesetzt = wie der gleichnamige Schritt im Entwurf, sonst wie der an derselben Stelle */
  const pickB = (s, i, t) => {
    const b = s?.b == null ? '' : String(s.b);
    if (b === 'keins') return '';
    if (ICONS[b]) return b;
    const same = DEF.steps.find(x => x.t.toLowerCase() === t.toLowerCase());
    return same ? same.b : (DEF.steps[i]?.b || '');
  };
  const steps = (Array.isArray(c.steps) && c.steps.length ? c.steps : DEF.steps)
    .map((s, i) => { const t = String(s?.t ?? '').trim(); return { t, d: String(s?.d ?? '').trim(), m: String(s?.m ?? '').trim(), b: pickB(s, i, t) }; })
    .filter(s => s.t || s.d);
  return { intro: pick(c.intro, DEF.intro), outro: pick(c.outro, DEF.outro), steps: steps.length ? steps : DEF.steps, label: c.label };
}

/* Markup: auch für das Server-HTML (alle Texte sind lesbar, bevor three.js lädt) */
export function markup(c0) {
  const c = clean(c0), S = c.steps, N = S.length, I = c.intro, O = c.outro;
  const intro = `<div class="ji">${I.info ? `<p class="info ji__info">${esc(I.info)}</p>` : ''}<h1 class="h-xl ji__h">${esc(I.h)}</h1>${I.lead ? `<p class="lead ji__lead">${esc(I.lead)}</p>` : ''}${I.hint ? `<p class="info ji__hint" aria-hidden="true">${esc(I.hint)}</p>` : ''}</div>`;
  const outro = `<div class="jo">${O.info ? `<p class="info">${esc(O.info)}</p>` : ''}<h2 class="h-xl jo__h">${esc(O.h)}</h2>${O.lead ? `<p class="lead jo__lead">${esc(O.lead)}</p>` : ''}${O.cta ? `<a class="btn" href="${esc(O.href || '#')}">${esc(O.cta)}<span aria-hidden="true">→</span></a>` : ''}</div>`;
  const lis = S.map((s, i) => `<li class="g__s"><p class="info g__m"><span><em>${nr(i)}</em> / ${String(N).padStart(2, '0')}</span>${s.m ? `<span>${esc(s.m)}</span>` : ''}</p><h2 class="h-xl">${esc(s.t)}</h2>${s.d ? `<p class="txt">${esc(s.d)}</p>` : ''}</li>`).join('');
  const tags = S.map((s, i) => `<div class="g__tag info"><b>${nr(i)}</b><span>${esc(s.t)}</span></div>`).join('');
  const list = `<ol class="jl">${S.map((s, i) => `<li class="jl__i"><div class="jl__k">${icon(s.b, 'jl__b')}<span class="info jl__m">${nr(i)}${s.m ? ` · ${esc(s.m)}` : ''}</span></div><h3 class="h-l">${esc(s.t)}</h3><p class="txt">${esc(s.d)}</p></li>`).join('')}</ol>`;
  return `<section class="g" aria-label="${esc(c.label || `Deine Journey in ${N} Schritten`)}" style="height:${sectionHeight(N)}">
<div class="g__stage"><div class="g__gl" aria-hidden="true"></div><div class="g__tags" aria-hidden="true">${tags}</div><div class="g__intro">${intro}</div><ol class="g__steps">${lis}</ol><div class="g__rail" aria-hidden="true">${S.map(() => '<i></i>').join('')}</div><div class="g__end">${outro}</div></div>
</section><div class="g__list">${list}</div>`;
}

/* Szene starten. root: Element mit markup(c) darin (Klasse jg).
   deps: { three: () => Promise<THREE>, makeHaus, figure, family?: T => Promise<Familie> (familie-echt.js), prefetch?: () => void (Familie früh laden),
           reduce, still (Framer Canvas: ohne 3D), onStep(i, els), onStatic?: () => void (3D fällt aus, ruhige Fassung) } */
export function mount(root, c0, deps) {
  const c = clean(c0), N = c.steps.length, { L0, WALK, SP } = TIMING, U = units(N);
  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
  const el = $('.g'), stage = $('.g__stage');
  const LIS = $$('.g__s'), RAIL = $$('.g__rail i'), TAGS = $$('.g__tag'), INTRO = $('.g__intro'), END = $('.g__end');
  let alive = true, S = null, tk = null, offScroll = null, active = -2, railAt = -1;
  const handle = { root, stage, rail: RAIL, active: () => active, railAt: () => Math.max(0, railAt), dispose };

  const staticMode = deps.reduce || deps.still;
  if (staticMode) {
    root.classList.add('is-static'); if (deps.still) root.classList.add('is-canvas');
    el.parentNode.appendChild(END);
  } else el.style.height = sectionHeight(N);
  if (deps.still) return handle;

  /* Das Paar sofort laden (parallel zu three.js) */
  deps.prefetch && deps.prefetch();
  /* Telefon und Tablet: weniger Bildpunkte und eine kleinere Schattenkarte */
  const coarse = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse), (max-width: 809px)').matches;
  const DPR0 = Math.min(coarse ? 1.5 : 1.6, devicePixelRatio || 1), SH0 = coarse ? 1024 : 2048;
  /* Bildschirmtakt messen, solange die Szene lädt (Median von 30 Bildern): Maßstab, ob ein Gerät später mit der Szene mitkommt */
  let base = 0;
  { const iv = []; let l0 = 0; const tick = t => { if (!alive) return; if (l0) iv.push(t - l0); l0 = t; if (iv.length < 30) requestAnimationFrame(tick); else { iv.sort((a, b) => a - b); base = clamp(iv[iv.length >> 1], 6, 40); } }; requestAnimationFrame(tick); }
  /* Ohne WebGL oder bei einem Fehler im 3D: die ruhige Fassung (alle Schritte als Liste), nie eine schwarze Fläche zum Durchscrollen */
  const fallback = e => {
    console.warn('[Journey Gehen] ohne 3D', e);
    if (!alive || root.classList.contains('is-static')) return;
    tk && tk.stop(); offScroll && offScroll();
    root.classList.add('is-static'); el.style.height = ''; el.parentNode.appendChild(END); INTRO.style.opacity = '1';
    deps.onStatic && deps.onStatic(handle);
  };

  const arr = i => L0 + i + WALK;
  /* Haus-Stufen an den Schritten. Bei 14 Schritten wie im Entwurf (05 Plan, 09 Schnurgerüst, 10 Platte, 11 Haus, 12 und 13 Licht, 14 Tür),
     bei einer anderen Zahl verteilt auf dieselben Anteile des Wegs. */
  const at14 = k => Math.round(k * (N - 1) / 13);

  deps.three().then(T => {
    if (!alive) return;
    const H3 = deps.makeHaus(T);
    S = H3.createStage($('.g__gl'), { bg: 0x000000, fov: 32, shadow: .55, key: 2.2, hemi: .6, fogNear: 50, fogFar: 170, dpr: DPR0, shadowSize: SH0, preserve: false });
    build(T, H3);
  }).catch(fallback);

  function build(T, H3) {
    const sc = S.scene;
    const grid = new T.GridHelper(600, 150, 0x1c1c1c, 0x121212); grid.position.y = .002; sc.add(grid);

    /* Der Weg: Start, Stationen, Anlauf zur Tür, durch die Tür */
    const HX = 0, HZ = -(N * SP) - 21, C = H3.CONCEPTS.wald, DX = HX + 7.3;
    const pts = [new T.Vector3(0, 0, 0)];
    for (let i = 0; i < N; i++) pts.push(new T.Vector3(2.4 * Math.sin((i + 1) * .7), 0, -(i + 1) * SP));
    pts.push(new T.Vector3(HX + 4.6, 0, HZ + 10), new T.Vector3(DX, 0, HZ + 5.4), new T.Vector3(DX, 0, HZ + 3.9));
    const curve = new T.CatmullRomCurve3(pts, false, 'centripetal');
    const NS = 3000, SMP = curve.getSpacedPoints(NS), LEN = curve.getLength();
    const near = p => { let b = 0, bd = 1e9; SMP.forEach((q, j) => { const d = q.distanceToSquared(p); if (d < bd) { bd = d; b = j; } }); return b / NS * LEN; };
    const ST = c.steps.map((_, i) => near(pts[i + 1])), SEND = LEN;
    const at = s => { const f = clamp(s / LEN) * NS, j = Math.min(NS - 1, Math.floor(f)), k = f - j, a = SMP[j], b = SMP[j + 1]; return { x: lerp(a.x, b.x, k), z: lerp(a.z, b.z, k) }; };
    const tan = s => { const a = at(Math.max(0, s - .6)), b = at(Math.min(LEN, s + .6)); const dx = b.x - a.x, dz = b.z - a.z, l = Math.hypot(dx, dz) || 1; return [dx / l, dz / l]; };

    /* Linien auf dem Boden: vorne gepunktet, hinter dir durchgezogen */
    const lp = SMP.filter((_, j) => j % 3 === 0).map(p => new T.Vector3(p.x, .012, p.z));
    const ahead = new T.Line(new T.BufferGeometry().setFromPoints(lp), new T.LineDashedMaterial({ color: 0xCACACA, dashSize: .22, gapSize: .45, transparent: true, opacity: .55 }));
    ahead.computeLineDistances(); sc.add(ahead);
    const done = new T.Line(new T.BufferGeometry().setFromPoints(lp.map(p => p.clone().setY(.016))), new T.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: .9 }));
    sc.add(done);

    /* Stationen: ein gelbes Feld (5:4) neben dem Weg und ein dünner Pflock an der Wegseite. Leer als Umriss, erreicht gefüllt. */
    const yel = new T.MeshBasicMaterial({ color: 0xFFB200, transparent: true });
    /* Das Feld liegt 1,4 m vor dem Haltepunkt: beim Halten steht es vorne rechts im Bild, mit dem Bild darüber */
    const PL = ST.map(s0 => {
      const s = Math.min(LEN, s0 + 1.4), p = at(s), [dx, dz] = tan(s), rx = -dz, rz = dx, x = p.x + rx * 1.8, z = p.z + rz * 1.8;
      const g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = Math.atan2(-dx, -dz); sc.add(g);
      const fill = new T.Mesh(new T.BoxGeometry(1, .03, .8), yel.clone()); fill.position.y = .02; fill.material.opacity = 0; g.add(fill);
      const edge = new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(1, .03, .8)), new T.LineBasicMaterial({ color: 0xCACACA, transparent: true, opacity: .7 })); edge.position.y = .02; g.add(edge);
      const post = new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(-.5, 0, 0), new T.Vector3(-.5, 2.45, 0)]), new T.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: .5 })); g.add(post);
      return { g, fill, edge, tip: new T.Vector3(-.5, 2.45, 0) };
    });

    /* Bilder über den Feldern: weiße Linien als SVG-Bild (kein Canvas, Safari 26), immer zur Kamera gedreht, dezent bis die Familie kommt.
       In 1,8 m Höhe, über den Köpfen der Familie (sonst steht der Vater beim Halten davor); Pflock und Nummer darüber. */
    const iconTex = k => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="-6 -6 60 60" fill="none" stroke="#ffffff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${ICONS[k][1].replace(/class="f"/g, 'fill="#ffffff" stroke="none"')}</svg>`;
      const img = new Image(), t = new T.Texture(img);
      t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4;
      img.onload = () => { t.needsUpdate = true; tk && tk.poke(); };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
      return t;
    };
    const ICO = c.steps.map((st, i) => {
      if (!ICONS[st.b]) return null;
      const sp = new T.Sprite(new T.SpriteMaterial({ map: iconTex(st.b), transparent: true, depthWrite: false, opacity: 0 }));
      sp.scale.set(.8, .8, 1); sp.position.set(0, 1.8, 0); PL[i].g.add(sp);
      return sp;
    });

    /* Das Haus am Ende des Wegs: Concept Wald. Erst als Plan in Linien, dann Schnurgerüst, Bodenplatte, Haus, Licht. */
    const ghost = S.house({ line: 0xCACACA }); ghost.set({ ...C }); ghost.x = HX; ghost.z = HZ; ghost.ghost = 1; ghost.build = 0;
    const house = S.house({ line: 0x8a8a8a, toned: true }); house.set({ ...C }); house.x = HX; house.z = HZ; house.build = 0; house.edgeAlways = .28;
    const stake = S.stake(); stake.set({ L0: C.L0, D: C.D }); stake.x = HX; stake.z = HZ; stake.build = 0;
    const slab = new T.Mesh(new T.BoxGeometry(C.L0 + 1.2, .32, C.D + 1.2), new T.MeshStandardMaterial({ color: 0x3a3a38, roughness: .95 }));
    slab.receiveShadow = true; slab.castShadow = true; slab.position.set(HX, .16, HZ); sc.add(slab);
    const door = new T.Mesh(new T.PlaneGeometry(1.05, 2.4), new T.MeshBasicMaterial({ color: 0xFFD9AC, transparent: true, opacity: 0 }));
    door.position.set(DX, 1.2, HZ + C.D / 2 + .12); sc.add(door);
    /* Lichtfleck vor der Tür: Verlauf als DataTexture (kein Canvas, Safari 26 verrauscht Canvas-Texturen) */
    const spill = (() => {
      const n = 64, d = new Uint8Array(n * n * 4);
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
        const r = Math.hypot(x - n / 2 + .5, y - n / 2 + .5) / (n / 2), a = Math.pow(clamp(1 - r), 1.6) * .7, o = (y * n + x) * 4;
        d[o] = 255; d[o + 1] = 217; d[o + 2] = 172; d[o + 3] = Math.round(a * 255);
      }
      const tx = new T.DataTexture(d, n, n); tx.needsUpdate = true; tx.magFilter = T.LinearFilter; tx.minFilter = T.LinearFilter;
      const m = new T.Mesh(new T.PlaneGeometry(4, 5), new T.MeshBasicMaterial({ map: tx, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending }));
      m.rotation.x = -Math.PI / 2; m.position.set(DX, .02, HZ + C.D / 2 + 2.2); sc.add(m); return m;
    })();
    const lamp = new T.PointLight(0xFFD2A0, 0, 16, 1.4); lamp.position.set(DX, 1.8, HZ + C.D / 2 + 1.4); sc.add(lamp);

    /* Die Familie. Lädt sie nicht (oder fehlt sie), geht die Figur aus dem Concepts Hero.
       Das Bild startet erst, wenn sie da ist (ready), höchstens 2,5 s warten; dann blendet die Bühne ein (.g__gl.is-on). */
    let F = null, FAM = null, redraw = null, ready = !deps.family, shown = false;
    const GL = $('.g__gl');
    const go = () => { if (ready || !alive) return; ready = true; tk && tk.poke(); redraw && redraw(); };
    const useFigure = () => { if (!alive || F) return; F = deps.figure(T); sc.add(F.man); tk && tk.poke(); redraw && redraw(); };
    if (deps.family) {
      deps.family(T).then(f => {
        if (!alive) return;
        FAM = f; f.members.forEach(m => { m.ph = m.fwd * 2.3; m.yaw = null; sc.add(m.g); });
        tk && tk.poke(); redraw && redraw(); go();
      }).catch(e => { console.warn('[Journey Gehen] Familie', e); useFigure(); go(); });
      setTimeout(go, 2500);
    } else useFigure();

    function sAt(u) {
      if (u < L0) return 0;
      const b = Math.floor(u - L0), f = u - L0 - b;
      if (b >= N) return lerp(ST[N - 1], SEND, walkEase(clamp((u - L0 - N) / .9)));
      const s0 = b ? ST[b - 1] : 0;
      return f < WALK ? lerp(s0, ST[b], walkEase(f / WALK)) : ST[b];
    }
    function nearest(s) { let b = 0, bd = 1e9; ST.forEach((q, i) => { const d = Math.abs(q - s); if (d < bd) { bd = d; b = i; } }); return b; }

    const kPlan = at14(4), kStake = at14(8), kSlab = at14(9), kHouse = at14(10), kN1 = at14(11), kN2 = at14(12), kDoor = N - 1;
    let vk = '', sPrev = 0, ph = 0, env = 0, yaw = 0, dir = 1, idle = 0, look = 0, cam = null;
    const tmp = new T.Vector3(), lookV = new T.Vector3();
    /* zuletzt geschriebene Werte: Marken, Auftakt und Schluss nur anfassen, wenn sich etwas ändert */
    const TS = TAGS.map(() => ({ o: '', t: '', f: null, on: null }));
    let introO = '', endOn = null;
    const angTo = (a, b, k) => { const d = ((b - a + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; return a + d * k; };

    function frame(u, dt, now, still) {
      const s = sAt(u), ds = s - sPrev; sPrev = s;
      const speed = Math.abs(ds) / Math.max(dt, 1e-3);
      env += (clamp(speed / 1.1) - env) * (still ? 1 : 1 - Math.exp(-dt * 6));
      /* Schrittlänge 1,45 m, bei schnellem Scrollen länger: höchstens 1,8 Doppelschritte je Sekunde */
      ph += Math.abs(ds) / Math.max(1.45, speed / 1.8) * Math.PI * 2;
      if (ds > 1e-4) { dir = 1; idle = 0; } else if (ds < -1e-4) { dir = -1; idle = 0; } else idle += dt;
      if (idle > .8) dir = 1;
      const p = at(s), [dx, dz] = tan(s);
      const yt = Math.atan2(-dx, -dz) + (dir < 0 ? Math.PI : 0);
      yaw = still || !cam ? yt : angTo(yaw, yt, 1 - Math.exp(-dt * 5));
      let busy = env > .002 || Math.abs(angTo(yaw, yt, 1) - yaw) > 1e-3;
      /* An der Station schauen alle zum gelben Feld rechts */
      let nd = 1e9; ST.forEach(q => { nd = Math.min(nd, Math.abs(q - s)); });
      const lt2 = dir > 0 ? -.55 * (1 - clamp(nd / 1.6)) * (1 - env) : 0;
      look += (lt2 - look) * (still ? 1 : 1 - Math.exp(-dt * 3.5));
      if (Math.abs(lt2 - look) > 1e-3) busy = true;
      if (F) { F.man.position.set(p.x, 0, p.z); F.man.rotation.y = yaw; F.pose(ph, env, now / 1000, look, still); F.fade(1 - E(s, SEND - 1.1, SEND - .2)); }
      /* Familie: jede und jeder auf dem eigenen Platz am Weg (seitlich, vorne), vor der Tür hintereinander.
         Die Phase hängt am gegangenen Weg (nichts rutscht); Kinder machen kürzere, schnellere Schritte. */
      if (FAM) FAM.members.forEach(m => {
        const si = clamp(s + m.fwd, 0, LEN), q = at(si), [mx, mz] = tan(si), lk = m.lat * (innerWidth / innerHeight < .85 ? .85 : 1) * (1 - E(si, SEND - 7.5, SEND - 2.4));
        m.g.position.set(q.x - mz * lk, 0, q.z + mx * lk);
        let ym = Math.atan2(-mx, -mz) + (dir < 0 ? Math.PI : 0);
        /* An der Station dreht sich ein Kind zu dir um und winkt (abwechselnd Tochter und Sohn) */
        const wt = !still && cam && m.kid && dir > 0 && (nearest(s) % 2 ? m.key === 'sohn' : m.key === 'tochter') ? (1 - env) * (1 - clamp(nd / 1.1)) : 0;
        m.turn += (wt - m.turn) * (1 - Math.exp(-dt * 2.6));
        if (m.turn > .001) ym = angTo(ym, Math.atan2(-(cam.c[0] - m.g.position.x), -(cam.c[2] - m.g.position.z)), m.turn * .82);
        m.yaw = still || m.yaw == null ? ym : angTo(m.yaw, ym, 1 - Math.exp(-dt * 5));
        m.g.rotation.y = m.yaw;
        m.ph += Math.abs(ds) / Math.max(FAM.stride(m), speed / m.cad) * Math.PI * 2;
        FAM.pose(m, m.ph, env, now / 1000, m.turn > .01 ? look * (1 - m.turn) : look, still, { wave: clamp((m.turn - .35) / .55) });
        FAM.fade(m, 1 - E(si, SEND - 1.1, SEND - .2));
      });
      /* Hände halten (eine Hand je Paar; wer sich umdreht und winkt, lässt los) */
      if (FAM && FAM.hands) FAM.hands(still);

      /* Kamera: schräg hinter dir, Blick den Weg entlang. Am Ende weit zurück, das ganze Haus. */
      const vw = innerWidth, vh = innerHeight, narrow = vw / vh < .85;
      const ox = narrow ? -1.4 : -2.5, oy = narrow ? 4 : 2.7, oz = narrow ? 12.2 : 7.4, ah = narrow ? 5 : 6.5;
      const rx = -dz, rz = dx;
      const c1 = [p.x + rx * ox - dx * oz, oy, p.z + rz * ox - dz * oz], l1 = [p.x + dx * ah + rx * .7, narrow ? 1.25 : 1.05, p.z + dz * ah + rz * .7];
      const wide = narrow ? [HX - 8, 14, HZ + 74] : [HX - 19, 7, HZ + 40], wl = narrow ? [HX - 1.5, -4, HZ] : [HX - 3.5, 2.7, HZ + 2];
      const kw = E(u, L0 + N + .1, L0 + N + 1.05);
      const tc = c1.map((v, i) => lerp(v, wide[i], kw)), tl = l1.map((v, i) => lerp(v, wl[i], kw));
      if (!cam || still) cam = { c: tc, l: tl };
      else { const k = 1 - Math.exp(-dt * 4); cam.c = cam.c.map((v, i) => lerp(v, tc[i], k)); cam.l = cam.l.map((v, i) => lerp(v, tl[i], k)); }
      if (cam.c.some((v, i) => Math.abs(v - tc[i]) > 2e-3) || cam.l.some((v, i) => Math.abs(v - tl[i]) > 2e-3)) busy = true;
      S.cam.position.set(...cam.c); lookV.set(...cam.l); S.cam.lookAt(lookV);
      /* Breit: das Bild rückt nach rechts, links bleibt Platz für den Text */
      const cw = S.r.domElement.clientWidth, ch = S.r.domElement.clientHeight, vo = narrow ? 0 : -cw * .17, key = cw + ',' + ch + ',' + vo;
      if (key !== vk) { vk = key; S.cam.setViewOffset(cw, ch, vo, 0, cw, ch); S.cam.updateProjectionMatrix(); }
      S.key.position.set(p.x - 34, 60, p.z + 46); S.key.target.position.set(p.x, 0, p.z - 20); S.key.target.updateMatrixWorld();

      /* Weg und Stationen */
      done.geometry.setDrawRange(0, Math.round(clamp(s / LEN) * lp.length));
      const ni = nearest(s);
      PL.forEach((q, i) => {
        const r = E(s, ST[i] - 1.2, ST[i] - .1);
        q.fill.material.opacity = r; q.edge.material.opacity = lerp(.7, 0, r);
        q.g.scale.setScalar(1 + .22 * Math.sin(Math.PI * clamp((s - ST[i] + 1.2) / 1.6)) * (1 - E(nd, .5, 2)) * (i === ni ? 1 : 0));
        /* Bild: von weitem leise, an der Station hell und etwas höher, danach wieder zurück */
        const sp = ICO[i];
        if (sp) {
          const d = s - ST[i], near = 1 - E(Math.abs(d), .8, 5.5);
          sp.material.opacity = (.26 + .74 * near) * (d > 1 ? lerp(1, .6, E(d, 1, 4)) : 1) * (1 - kw);
          sp.position.y = 1.8 + .12 * near;
        }
      });

      /* Das Haus entsteht mit den Schritten */
      const kP = E(u, arr(kPlan) - .15, arr(kPlan) + .35);
      ghost.build = kP; ghost.g.visible = kP > .002;
      ghost.lineMat.opacity = kP * (1 - E(u, arr(kHouse) + .1, arr(kHouse) + .45));
      stake.build = E(u, arr(kStake) - .1, arr(kStake) + .4) * (1 - E(u, arr(kHouse) - .2, arr(kHouse) + .05)); stake.g.visible = stake.build > .002;
      const kS = E(u, arr(kSlab) - .15, arr(kSlab) + .25); slab.scale.set(1, Math.max(.001, kS), 1); slab.position.y = .16 * kS; slab.visible = kS > .002;
      house.build = E(u, arr(kHouse) - .3, arr(kHouse) + .4); house.g.visible = house.build > .002;
      house.night = .25 * E(u, arr(kN1) - .2, arr(kN1) + .2) + .5 * E(u, arr(kN2) - .2, arr(kN2) + .2);
      const kIn = E(u, arr(kDoor) - .25, arr(kDoor) + .1);
      door.material.opacity = kIn; spill.material.opacity = kIn * .9; lamp.intensity = kIn * 18;
      const dusk = Math.max(.45 * E(u, arr(kN1) - .2, arr(kN2) + .2), E(u, arr(kDoor) - .2, L0 + N + .9));
      S.hemi.intensity = lerp(.6, .16, dusk); S.key.intensity = lerp(2.2, .45, dusk); S.fill.intensity = lerp(.5, .15, dusk);
      S.render();
      if (!shown) { shown = true; GL.classList.add('is-on'); }

      /* Nummern an den Pflöcken */
      const W = S.r.domElement.clientWidth;
      PL.forEach((q, i) => {
        tmp.copy(q.tip).applyMatrix4(q.g.matrixWorld);
        const d = S.cam.position.distanceTo(tmp), pr2 = S.project(tmp.x, tmp.y, tmp.z), t = TAGS[i], ts = TS[i];
        const o = pr2.z < 1 && pr2.x > -40 && pr2.x < W + 40 ? clamp((42 - d) / 14) * (1 - kw * .6) : 0;
        const os = o.toFixed(3); if (ts.o !== os) { ts.o = os; t.style.opacity = os; }
        /* Nahe am rechten Rand (Leiste) steht die Marke links vom Pflock */
        const flip = pr2.x > W * .74, sc = clamp(9 / d, .6, 1.15).toFixed(3);
        if (o > 0) {
          const tr = flip ? `translate3d(${Math.min(pr2.x - 8, W - 20).toFixed(1)}px,${(pr2.y - 14).toFixed(1)}px,0) translateX(-100%) scale(${sc})` : `translate3d(${(pr2.x + 8).toFixed(1)}px,${(pr2.y - 14).toFixed(1)}px,0) scale(${sc})`;
          if (ts.t !== tr) { ts.t = tr; t.style.transform = tr; }
        }
        if (ts.f !== flip) { ts.f = flip; t.classList.toggle('is-flip', flip); }
        /* Bild nahe am rechten Rand: wächst nach links, damit es nicht an die Leiste stößt (gilt ab dem nächsten Bild) */
        const sp = ICO[i];
        if (sp && sp.material.opacity > 0) { tmp.setFromMatrixPosition(sp.matrixWorld); const ps = S.project(tmp.x, tmp.y, tmp.z); sp.center.x = lerp(.5, 1.05, E(ps.x, W * .6, W * .86)); }
        const on = i === active; if (ts.on !== on) { ts.on = on; t.classList.toggle('is-on', on); }
      });

      /* Text der Station: kurz bevor du ankommst, bis zur Hälfte des Wegs zur nächsten */
      /* Marke an der Leiste: die zuletzt erreichte Station, vor der ersten die erste. Sie bleibt immer an der Leiste
         (Kundenwunsch 2026-11-19: das gelbe Feld springt nicht zwischendurch nach oben ins Logo, es bleibt rechts). */
      let a = -1, r = 0;
      for (let i = 0; i < N; i++) {
        const nx = i < N - 1 ? (ST[i] + ST[i + 1]) / 2 : Infinity;
        if (s >= ST[i] - 1.1 && s < nx && u < L0 + N + .7) a = i;
        if (s >= ST[i] - 1.1) r = i;
      }
      if (a !== active || r !== railAt) {
        if (a !== active) LIS.forEach((li, i) => li.classList.toggle('is-on', i === a));
        if (r !== railAt) RAIL.forEach((x, i) => { x.classList.toggle('is-now', i === r); x.classList.toggle('is-past', i < r); });
        active = a; railAt = r;
        deps.onStep && deps.onStep(a, handle);
      }
      const io = (1 - E(u, .1, .45)).toFixed(3); if (io !== introO) { introO = io; INTRO.style.opacity = io; }
      const eo = u > L0 + N + .75; if (eo !== endOn) { endOn = eo; END.classList.toggle('is-on', eo); }
      /* busy: etwas gleitet noch nach (Tempo, Blick, Drehung, Kamera); sonst darf die Szene langsamer zeichnen */
      return busy;
    }

    if (staticMode) {
      /* Ruhiges Bild: du stehst vor deinem fertigen Haus, die Tür ist offen */
      const draw = () => {
        sPrev = ST[N - 1]; frame(U, .016, 0, true);
        if (F) { F.fade(1); F.man.position.set(DX - .4, 0, HZ + 8); F.man.rotation.y = .15; F.pose(0, 0, 0, 0, true); }
        if (FAM) FAM.members.forEach(m => { FAM.fade(m, 1); m.g.position.set(DX - .4 + m.lat * 1.2, 0, HZ + 8 - m.fwd * .7); m.g.rotation.y = .15; FAM.pose(m, 0, 0, 0, 0, true); }); if (FAM && FAM.hands) FAM.hands(true);
        INTRO.style.opacity = '1'; introO = '1'; S.render();
      };
      redraw = () => ready && draw(); S.onResize = redraw; redraw();
      return;
    }

    /* Scrollwert über eine kritisch gedämpfte Feder: weich anfahren, weich anhalten. Große Sprünge (Anker, Zurück) springen mit. */
    let x = null, v = 0, lt = 0, calm = false;
    const W0 = 6.5;
    /* Kommt das Gerät nicht mit? Mittel von 40 vollen Bildern (nach den ersten 90), zweimal hintereinander deutlich langsamer als der
       Bildschirmtakt (1,45 fach, mindestens 21 ms): eine Stufe leichter. Stufe 1: 75 % der Bildpunkte, Schatten 1024. Stufe 2: 1 Bildpunkt, Schatten 512. */
    const AQ = { lvl: 0, n: 0, sum: 0, wait: 90, bad: 0 };
    const adapt = dt => {
      if (!base || AQ.lvl >= 2) return;
      if (AQ.wait > 0) { AQ.wait--; return; }
      AQ.sum += dt; if (++AQ.n < 40) return;
      const mean = AQ.sum / AQ.n * 1000; AQ.n = 0; AQ.sum = 0;
      AQ.bad = mean > Math.max(base * 1.45, 21) ? AQ.bad + 1 : 0;
      if (AQ.bad < 2) return;
      AQ.lvl++; AQ.bad = 0; AQ.wait = 45;
      if (AQ.lvl === 1) { S.setDpr(Math.max(1, DPR0 * .75)); S.setShadowSize(Math.min(SH0, 1024)); }
      else { S.setDpr(Math.min(1, DPR0)); S.setShadowSize(512); }
      root.dataset.jgq = AQ.lvl;
    };
    const prog = () => { const r = el.getBoundingClientRect(), span = Math.max(1, r.height - innerHeight); return { p: clamp(-r.top / span), on: r.top < innerHeight * 1.5 && r.bottom > -innerHeight * .5 }; };
    let raf = 0;
    const run = now => {
      raf = 0; if (!alive || !ready) return;
      const pr = prog();
      if (!pr.on) { x = null; v = 0; lt = 0; return; }
      /* Alles ruhig (niemand scrollt, nichts gleitet nach): nur rund 30 Bilder je Sekunde */
      if (calm && lt && now - lt < 30) { raf = requestAnimationFrame(run); return; }
      const full = lt && !calm;
      const dt = Math.min(.1, lt ? (now - lt) / 1000 : .016); lt = now;
      const tgt = pr.p * U;
      if (x === null || Math.abs(tgt - x) > 3) { x = tgt; v = 0; }
      else {
        const n = Math.ceil(dt / .008), h = dt / n;
        for (let i = 0; i < n; i++) { v += (W0 * W0 * (tgt - x) - 2 * W0 * v) * h; x += v * h; }
      }
      const busy = frame(x, dt, now, false);
      if (full) adapt(dt);
      const moving = Math.abs(tgt - x) > 1e-4 || Math.abs(v) > 1e-4 || busy;
      calm = !moving;
      if (moving || pr.p > 0 && pr.p < 1) raf = requestAnimationFrame(run);
      else lt = 0;
    };
    tk = { poke() { if (!raf && alive) raf = requestAnimationFrame(run); }, stop() { raf && cancelAnimationFrame(raf); raf = 0; } };
    const onScroll = () => { calm = false; tk.poke(); };
    addEventListener('scroll', onScroll, { passive: true });
    offScroll = () => removeEventListener('scroll', onScroll);
    S.onResize = () => tk.poke();
    tk.poke();
  }

  function dispose() {
    alive = false;
    tk && tk.stop(); offScroll && offScroll();
    if (S) { try { S.dispose(); const gl = S.r.getContext(); gl && gl.getExtension('WEBGL_lose_context')?.loseContext(); } catch (e) { } }
  }
  return handle;
}
