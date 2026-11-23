/* GRIFFNER Journey, Szene „Gehen“: das Paar geht in 3D den Weg der 14 Tage zu seinem Haus.
   Eine Szene für beide Orte: die Vorschlagsseite gehen.html und die Framer Code-Komponente JourneyGehen
   (journey/framer-bau.mjs baut daraus die Komponente, mit allen Texten als Eingabefelder).
   Runden 1 bis 9 (Gehen, Paar, schnell am Telefon): siehe gehen-szene-r9.js, die Fassung für /journey-2 und /journey-3.

   Runde 10 (2026-11-23, neuer Text vom Kunden):
   - Die 14 Tage aus inhalt.js. Unten links: Tag, Titel, Text. Keine Bilder und keine Namen mehr an den Pflöcken (die Pflöcke sind weg,
     die gelben Felder am Weg bleiben).
   - Rechts um das Paar schweben die Stichworte des Tages als kleine Felder („Darum kümmern wir uns“). Breit: auf Plätzen rund um das Paar,
     die nicht auf den Text oder die Leiste fallen; schmal (Telefon, Tablet hochkant): als Wolke über den Köpfen.
   - Zwei Phasen, Besser planen und Besser bauen: vor dem ersten Tag einer Phase ein schwarzer Bildschirm mit ihrem Namen
     (wie die Titel im Services Film). Die Zeile „Tag 01 bis 07“ entsteht aus den Tagen.
   - Kein Auftakt und kein Schluss mehr in der Szene (dafür Einstieg, Stapel und Leben). Am Ende wird das Bild schwarz.
   - Die Leiste rechts: ein Strich je Tag, Lücke zwischen den Phasen, ein Klick springt zum Tag.
   - Haus-Stufen an den neuen Tagen: Plan bei Tag 05 (Entwurfsplanung), Schnurgerüst Tag 09 (Einreichung, Vermessung),
     Bodenplatte Tag 12 (Freigabe), Haus Tag 13 (Montage), Licht Tag 13 und 14, Tür Tag 14 (Übergabe).

   Runde 11 (2026-11-23, Kunde: „tight the scroll so you can't stop between steps and you can't jump steps“, „remove the title above“):
   - Die Zeile „Darum kümmern wir uns“ über den Stichworten ist weg (nur noch für Vorleser), Text und Stichworte etwas kompakter.
   - handle.stops(): die Halte der Szene (beide Phasen, 14 Tage, Seiten-Y). basis.js schritte() führt jede Geste genau einen Halt weiter.
     Die Leiste springt über handle.goDay (gleitend) zum Tag.

   Runde 13 (2026-11-23, Kunde: „remove completely the lock on steps, make it natural, more slower“, „besser planen and besser bauen
   are too long and still, it looks like stuck“, „very smooth ... like a story“):
   - Kein Halte-Scrollen mehr: die Seite scrollt frei, die Szene folgt dem Scrollen über eine weichere Feder (W0 5 statt 6,5).
   - Phasen halb so lang (P .9 statt 1,5) und nie still: Schwarz blendet weich ein und aus, Zeile, Feld und Titel wandern dabei
     langsam durch das Bild nach oben und der Titel wächst ein wenig (alles am Scrollweg, also so schnell wie man scrollt). */
import { clamp, lerp, E, esc, nr2, stichworte, phaseHTML, chip } from './basis.js';
import { TAGE, SZENE } from './inhalt.js';

export const DEF = { steps: TAGE, kopf: SZENE.kopf, tag: SZENE.tag };

/* Zeitplan in Einheiten (je Einheit VH Scrollweg): Phase P (schwarz), Anlauf L0, je Tag gehen (WALK) und kurz stehen, am Ende zur Tür und schwarz */
export const TIMING = { L0: .35, WALK: .8, END: 2.4, P: .9, VH: 75, SP: 5.5 };

const str = v => String(v ?? '').trim();

/* Texte bereinigen: leere Tage fallen weg. Phase: steht bei einem Tag ein Phasenname, beginnt dort eine Phase. */
export function clean(c = {}) {
  const src = Array.isArray(c.steps) && c.steps.length ? c.steps : DEF.steps;
  let steps = src.map(s => ({ t: str(s?.t), d: str(s?.d), k: stichworte(s?.k), ph: str(s?.ph) })).filter(s => s.t || s.d);
  if (!steps.length) steps = DEF.steps.map(s => ({ ...s, k: stichworte(s.k), ph: s.ph || '' }));
  const tag = str(c.tag) || DEF.tag;
  const phases = [];
  steps.forEach((s, i) => { if (s.ph) phases.push({ at: i, h: s.ph }); });
  phases.forEach((p, j) => { const to = (phases[j + 1] ? phases[j + 1].at : steps.length) - 1; p.info = `${tag} ${nr2(p.at + 1)} bis ${nr2(to + 1)}`; });
  const phaseOf = i => { let j = -1; phases.forEach((p, k) => { if (p.at <= i) j = k; }); return j; };
  return { steps, phases, phaseOf, tag, kopf: c.kopf == null ? DEF.kopf : str(c.kopf), label: c.label };
}

/* Scrollweg u (mit den schwarzen Phasen) und Weg w (ohne): die Phasen halten den Weg an */
export function plan(c) {
  const N = c.steps.length, { L0, END, P, WALK } = TIMING, WU = L0 + N + END;
  const INS = c.phases.map((p, j) => ({ j, w: p.at === 0 ? 0 : L0 + p.at, len: P }));
  const U = WU + INS.length * P;
  const split = u => {
    let off = 0;
    for (const q of INS) { const a = q.w + off; if (u < a) break; if (u < a + q.len) return { w: q.w, q, f: (u - a) / q.len }; off += q.len; }
    return { w: Math.min(WU, u - off), q: null, f: 0 };
  };
  const uOf = w => w + INS.filter(q => q.w <= w).reduce((a, q) => a + q.len, 0);
  /* Text eines Tages: ab kurz vor der Ankunft, nach einer Phase sofort (wenn das Schwarz geht) */
  const startW = i => c.phases.some(p => p.at === i) ? (i === 0 ? 0 : L0 + i) : L0 + i + .6;
  const arriveW = i => L0 + i + WALK;
  return { N, WU, INS, U, split, uOf, startW, arriveW };
}
export const sectionHeight = c => `calc(${(plan(clean(c)).U * TIMING.VH).toFixed(1)}vh + 100vh)`;

/* Gehen mit Anlauf und Auslaufen: Tempo steigt über die ersten 22 %, bleibt gleich, fällt über die letzten 22 % */
const RAMP = .22;
const walkEase = f => {
  const v = 1 / (1 - RAMP);
  if (f <= 0) return 0; if (f >= 1) return 1;
  if (f < RAMP) return v * f * f / (2 * RAMP);
  if (f > 1 - RAMP) return 1 - v * (1 - f) * (1 - f) / (2 * RAMP);
  return v * (f - RAMP / 2);
};

/* Markup: auch für das Server-HTML (alle Texte sind lesbar, bevor three.js lädt) */
export function markup(c0) {
  const c = clean(c0), S = c.steps, N = S.length;
  const phName = i => { const j = c.phaseOf(i); return j >= 0 ? c.phases[j].h : ''; };
  const lis = S.map((s, i) => `<li class="g__s"><p class="info g__m"><span>${esc(c.tag)} <em>${nr2(i + 1)}</em></span>${phName(i) ? `<span>${esc(phName(i))}</span>` : ''}</p><h2 class="g__t">${esc(s.t)}</h2>${s.d ? `<p class="txt">${esc(s.d)}</p>` : ''}${s.k.length ? `<ul class="g__vh">${c.kopf ? `<li>${esc(c.kopf)}:</li>` : ''}${s.k.map(k => `<li>${esc(k)}</li>`).join('')}</ul>` : ''}</li>`).join('');
  const groups = S.map(s => `<div class="g__kg">${s.k.map(k => chip(k)).join('')}</div>`).join('');
  const rail = S.map((s, i) => `${c.phases.some(p => p.at === i) && i > 0 ? '<b class="g__rg"></b>' : ''}<button class="g__r" type="button" aria-label="${esc(`${c.tag} ${nr2(i + 1)}: ${s.t}`)}"><i></i></button>`).join('');
  const phases = c.phases.map((p, j) => phaseHTML(p, j ? 'g__ph' : 'g__ph g__ph0')).join('');
  const list = S.map((s, i) => {
    const p = c.phases.find(p => p.at === i);
    return `${p ? `<div class="gl__ph"><p class="info">${esc(p.info)}</p><h3 class="h-xl">${esc(p.h)}</h3></div>` : ''}<div class="gl__i"><p class="info gl__m">${esc(c.tag)} <em>${nr2(i + 1)}</em></p><div class="gl__b"><h3 class="g__t">${esc(s.t)}</h3>${s.d ? `<p class="txt">${esc(s.d)}</p>` : ''}</div>${s.k.length ? `<ul class="gl__k">${s.k.map(k => `<li><i aria-hidden="true"></i>${esc(k)}</li>`).join('')}</ul>` : ''}</div>`;
  }).join('');
  return `<section class="g" aria-label="${esc(c.label || `Deine Journey in ${N} Tagen`)}" style="height:${sectionHeight(c0)}">
<div class="g__stage"><div class="g__gl" aria-hidden="true"></div><div class="g__ks" aria-hidden="true">${groups}</div><ol class="g__steps">${lis}</ol><div class="g__rail">${rail}</div>${phases}<div class="g__fade" aria-hidden="true"></div></div>
</section><div class="g__list">${list}</div>`;
}

/* Plätze für die Stichworte rund um das Paar (breite Bilder). Einheit: Höhe des Paars im Bild; x vom Paar aus, y von den Köpfen aus.
   a: 'r' das Feld beginnt dort (wächst nach rechts), 'l' es endet dort, 'c' mittig. Die ersten passenden Plätze gewinnen. */
/* zwei lockere Spalten neben dem Paar, abwechselnd rechts und links, von der Mitte nach außen */
const SLOTS = [[.34, -.06], [-.34, .02], [.42, .12], [-.42, -.16], [.34, .3], [-.34, .2], [.42, -.24], [-.42, .38], [.34, .48], [-.34, -.34],
  [.42, .66], [-.42, .56], [.34, .84], [-.34, -.52], [.54, -.42], [-.54, .74]].map(([x, y]) => ({ x, y, a: x > 0 ? 'r' : 'l' }));

/* Szene starten. root: Element mit markup(c) darin (Klasse jg).
   deps: { three: () => Promise<THREE>, makeHaus, figure, family?: T => Promise<Familie> (familie-echt.js), prefetch?: () => void (Familie früh laden),
           reduce, still (Framer Canvas: ohne 3D), onStep(i, api), onStatic?: () => void (3D fällt aus, ruhige Fassung), scrollTo?: y => void } */
export function mount(root, c0, deps) {
  const c = clean(c0), PL0 = plan(c), { N, WU, U, split, uOf, startW, arriveW } = PL0, { L0, WALK, SP } = TIMING;
  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
  const el = $('.g'), stage = $('.g__stage');
  const LIS = $$('.g__s'), RAIL = $$('.g__r'), KG = $$('.g__kg'), PH = $$('.g__ph'), PHB = PH.map(p => p.querySelector('.jph__b')), PHH = PH.map(p => p.querySelector('.jph__h')), FADE = $('.g__fade');
  let alive = true, S = null, tk = null, offScroll = null, active = -2, railAt = -1, phaseOn = -1, coverK = 1, endK = 0;
  const handle = {
    root, stage, rail: RAIL, phases: PH.map(p => p.querySelector('.jph__f')), active: () => active, railAt: () => Math.max(0, railAt),
    /* für das gelbe Feld der Website: welche Phase den Bildschirm deckt (−1: keine), ob gerade gegangen wird */
    phaseOn: () => phaseOn, walking: () => phaseOn < 0 && coverK < .5 && endK < .5, plan: PL0, dispose
  };

  const staticMode = deps.reduce || deps.still;
  if (staticMode) {
    root.classList.add('is-static'); if (deps.still) root.classList.add('is-canvas');
    PH[0] && PH[0].classList.add('is-in');
  } else el.style.height = sectionHeight(c0);
  if (deps.still) return handle;

  /* Klick auf einen Strich der Leiste: zum Tag scrollen (stehend am Feld) */
  const yOfU = handle.yOfU = u => { const r = el.getBoundingClientRect(); return r.top + scrollY + u / U * Math.max(1, el.offsetHeight - innerHeight); };
  const dayY = handle.dayY = i => yOfU(uOf(arriveW(i) + .08));
  RAIL.forEach((b, i) => b.addEventListener('click', () => {
    const y = dayY(i);
    deps.scrollTo ? deps.scrollTo(y) : scrollTo({ top: y, behavior: 'smooth' });
  }));

  /* Das Paar sofort laden (parallel zu three.js) */
  deps.prefetch && deps.prefetch();
  /* Telefon und Tablet: weniger Bildpunkte und eine kleinere Schattenkarte */
  const coarse = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse), (max-width: 809px)').matches;
  const DPR0 = Math.min(coarse ? 1.5 : 1.6, devicePixelRatio || 1), SH0 = coarse ? 1024 : 2048;
  /* Bildschirmtakt messen, solange die Szene lädt (Median von 30 Bildern): Maßstab, ob ein Gerät später mit der Szene mitkommt */
  let base = 0;
  { const iv = []; let l0 = 0; const tick = t => { if (!alive) return; if (l0) iv.push(t - l0); l0 = t; if (iv.length < 30) requestAnimationFrame(tick); else { iv.sort((a, b) => a - b); base = clamp(iv[iv.length >> 1], 6, 40); } }; requestAnimationFrame(tick); }
  /* Ohne WebGL oder bei einem Fehler im 3D: die ruhige Fassung (alle Tage als Liste), nie eine schwarze Fläche zum Durchscrollen */
  const fallback = e => {
    console.warn('[Journey Gehen] ohne 3D', e);
    if (!alive || root.classList.contains('is-static')) return;
    tk && tk.stop(); offScroll && offScroll();
    root.classList.add('is-static', 'is-nogl'); el.style.height = '';
    PH.forEach((p, j) => { p.style.opacity = ''; p.classList.toggle('is-in', j === 0); PHB[j].style.transform = ''; PHH[j].style.transform = ''; });
    phaseOn = -1;
    deps.onStatic && deps.onStatic(handle);
  };

  /* Haus-Stufen an den Tagen. Bei 14 Tagen wie oben beschrieben, bei einer anderen Zahl verteilt auf dieselben Anteile des Wegs. */
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

    /* Stationen: ein gelbes Feld (5:4) neben dem Weg, 1,4 m vor dem Haltepunkt. Leer als Umriss, erreicht gefüllt. */
    const yel = new T.MeshBasicMaterial({ color: 0xFFB200, transparent: true });
    const PL = ST.map(s0 => {
      const s = Math.min(LEN, s0 + 1.4), p = at(s), [dx, dz] = tan(s), rx = -dz, rz = dx, x = p.x + rx * 1.8, z = p.z + rz * 1.8;
      const g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = Math.atan2(-dx, -dz); sc.add(g);
      const fill = new T.Mesh(new T.BoxGeometry(1, .03, .8), yel.clone()); fill.position.y = .02; fill.material.opacity = 0; g.add(fill);
      const edge = new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(1, .03, .8)), new T.LineBasicMaterial({ color: 0xCACACA, transparent: true, opacity: .7 })); edge.position.y = .02; g.add(edge);
      return { g, fill, edge };
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

    /* Das Paar. Lädt es nicht (oder fehlt es), geht die Figur aus dem Concepts Hero.
       Das Bild startet erst, wenn es da ist (ready), höchstens 2,5 s warten; dann blendet die Bühne ein (.g__gl.is-on). */
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

    /* Weg w (ohne Phasen) → Strecke s auf dem Weg */
    function sAt(w) {
      if (w < L0) return 0;
      const b = Math.floor(w - L0), f = w - L0 - b;
      if (b >= N) return lerp(ST[N - 1], SEND, walkEase(clamp((w - L0 - N) / .9)));
      const s0 = b ? ST[b - 1] : 0;
      return f < WALK ? lerp(s0, ST[b], walkEase(f / WALK)) : ST[b];
    }
    function nearest(s) { let b = 0, bd = 1e9; ST.forEach((q, i) => { const d = Math.abs(q - s); if (d < bd) { bd = d; b = i; } }); return b; }

    const kPlan = at14(4), kStake = at14(8), kSlab = at14(11), kHouse = at14(12), kN1 = at14(12), kN2 = at14(13), kDoor = N - 1;
    const arr = i => L0 + i + WALK;
    let vk = '', sPrev = 0, ph = 0, env = 0, yaw = 0, dir = 1, idle = 0, look = 0, cam = null;
    const tmp = new T.Vector3(), lookV = new T.Vector3();
    const angTo = (a, b, k) => { const d = ((b - a + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; return a + d * k; };

    /* Stichworte: Gruppe je Tag. Breit auf Plätzen rund um das Paar (einmal beim Erscheinen gewählt), schmal als Wolke über den Köpfen. */
    const KS = KG.map(g => ({ g, items: [...g.children].map(e => ({ e, w: 0, h: 0, sl: null, t: '', x: null, y: 0 })), placed: '', y: '', obst: [], bounds: null }));
    let anc = null, cloud = null;
    const stageRect = () => stage.getBoundingClientRect();
    const rel = (r, s0) => ({ l: r.left - s0.left, t: r.top - s0.top, r: r.right - s0.left, b: r.bottom - s0.top });
    const hit = (a, b, m = 10) => a.l < b.r + m && a.r > b.l - m && a.t < b.b + m && a.b > b.t - m;
    const rectAt = (sl, w, h) => {
      const x = anc.cx + sl.x * anc.hh, y = anc.hy + sl.y * anc.hh, l = sl.a === 'r' ? x : sl.a === 'l' ? x - w : x - w / 2;
      return { l, t: y - h / 2, r: l + w, b: y + h / 2 };
    };
    /* Hindernisse (Text des Tages, Leiste) und Rand: beim Erscheinen und bei neuer Fenstergröße gemessen */
    function measure(i) {
      const K = KS[i], s0 = stageRect(), W = s0.width, H = s0.height, mg = Math.max(16, W * .02);
      K.obst = [];
      if (LIS[i]) K.obst.push(rel(LIS[i].getBoundingClientRect(), s0));
      const rr = $('.g__rail'); if (rr) K.obst.push(rel(rr.getBoundingClientRect(), s0));
      K.bounds = { l: mg, t: Math.max(92, H * .1), r: W - mg, b: H - mg };
      K.items.forEach(it => { it.w = it.e.offsetWidth; it.h = it.e.offsetHeight; });
      K.placed = `${Math.round(W)}x${Math.round(H)}`;
    }
    /* Jedes Bild: jedes Stichwort behält seinen Platz, solange er frei ist (großzügig); sonst der erste freie (streng). Gleitet weich hin. */
    function posGroup(i, narrow, dt, snap) {
      const K = KS[i]; if (!K || !anc) return;
      const cw = S.r.domElement.clientWidth, ch = S.r.domElement.clientHeight;
      if (narrow) {
        /* Wolke: ihre Unterkante 14 px über den Köpfen, nie unter den Kopf der Seite */
        const h = K.g.offsetHeight, y = Math.max(84, Math.min(anc.hy - 14 - h, ch * .5 - h)).toFixed(1);
        if (K.y !== y) { K.y = y; K.g.style.transform = `translate3d(0,${y}px,0)`; }
        return;
      }
      if (K.y !== '') { K.y = ''; K.g.style.transform = ''; }
      if (!K.placed) measure(i);
      const B = K.bounds, used = [], taken = new Set(), k = snap ? 1 : 1 - Math.exp(-dt * 7);
      const free = (sl, it, m1, m2) => {
        const r = rectAt(sl, it.w, it.h);
        return r.l >= B.l && r.r <= B.r && r.t >= B.t && r.b <= B.b && !K.obst.some(o => hit(r, o, m1)) && !used.some(o => hit(r, o, m2));
      };
      K.items.forEach((it, n) => {
        const list = SLOTS;
        if (!it.sl || taken.has(it.sl) || !free(it.sl, it, 2, 2)) it.sl = list.find(sl => !taken.has(sl) && free(sl, it, 14, 8)) || (it.sl && !taken.has(it.sl) ? it.sl : list.find(sl => !taken.has(sl)) || list[0]);
        taken.add(it.sl);
        const r = rectAt(it.sl, it.w, it.h); used.push(r);
        const tx = clamp(r.l, B.l, B.r - it.w), ty = clamp(r.t, B.t, B.b - it.h);
        if (it.x == null || snap) { it.x = tx; it.y = ty; } else { it.x += (tx - it.x) * k; it.y += (ty - it.y) * k; }
        const t = `translate3d(${it.x.toFixed(1)}px,${it.y.toFixed(1)}px,0)`;
        if (t !== it.t) { it.t = t; it.e.style.transform = t; }
      });
    }

    function frame(u, dt, now, still) {
      const SP2 = split(u), w = SP2.w, s = sAt(w), ds = s - sPrev; sPrev = s;
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
      /* An der Station schauen beide zum gelben Feld rechts */
      let nd = 1e9; ST.forEach(q => { nd = Math.min(nd, Math.abs(q - s)); });
      const lt2 = dir > 0 ? -.55 * (1 - clamp(nd / 1.6)) * (1 - env) : 0;
      look += (lt2 - look) * (still ? 1 : 1 - Math.exp(-dt * 3.5));
      if (Math.abs(lt2 - look) > 1e-3) busy = true;
      if (F) { F.man.position.set(p.x, 0, p.z); F.man.rotation.y = yaw; F.pose(ph, env, now / 1000, look, still); F.fade(1 - E(s, SEND - 1.1, SEND - .2)); }
      /* Das Paar: beide auf dem eigenen Platz am Weg, vor der Tür hintereinander. Die Phase hängt am gegangenen Weg (nichts rutscht). */
      if (FAM) FAM.members.forEach(m => {
        const si = clamp(s + m.fwd, 0, LEN), q = at(si), [mx, mz] = tan(si), lk = m.lat * (innerWidth / innerHeight < .85 ? .85 : 1) * (1 - E(si, SEND - 7.5, SEND - 2.4));
        m.g.position.set(q.x - mz * lk, 0, q.z + mx * lk);
        const ym = Math.atan2(-mx, -mz) + (dir < 0 ? Math.PI : 0);
        m.turn = 0;
        m.yaw = still || m.yaw == null ? ym : angTo(m.yaw, ym, 1 - Math.exp(-dt * 5));
        m.g.rotation.y = m.yaw;
        m.ph += Math.abs(ds) / Math.max(FAM.stride(m), speed / m.cad) * Math.PI * 2;
        FAM.pose(m, m.ph, env, now / 1000, look, still, { wave: 0 });
        FAM.fade(m, 1 - E(si, SEND - 1.1, SEND - .2));
      });
      /* Hände halten */
      if (FAM && FAM.hands) FAM.hands(still);

      /* Kamera: schräg hinter dem Paar, Blick den Weg entlang. Am Ende weit zurück, das ganze Haus. */
      const vw = innerWidth, vh = innerHeight, narrow = vw / vh < .85;
      const ox = narrow ? -1.4 : -2.5, oy = narrow ? 4 : 2.7, oz = narrow ? 12.2 : 7.4, ah = narrow ? 5 : 6.5;
      const rx = -dz, rz = dx;
      const c1 = [p.x + rx * ox - dx * oz, oy, p.z + rz * ox - dz * oz], l1 = [p.x + dx * ah + rx * .7, narrow ? 1.25 : 1.05, p.z + dz * ah + rz * .7];
      const wide = narrow ? [HX - 8, 14, HZ + 74] : [HX - 19, 7, HZ + 40], wl = narrow ? [HX - 1.5, -4, HZ] : [HX - 3.5, 2.7, HZ + 2];
      const kw = E(w, L0 + N + .1, L0 + N + 1.05);
      const tc = c1.map((v, i) => lerp(v, wide[i], kw)), tl = l1.map((v, i) => lerp(v, wl[i], kw));
      if (!cam || still) cam = { c: tc, l: tl };
      else { const k = 1 - Math.exp(-dt * 4); cam.c = cam.c.map((v, i) => lerp(v, tc[i], k)); cam.l = cam.l.map((v, i) => lerp(v, tl[i], k)); }
      if (cam.c.some((v, i) => Math.abs(v - tc[i]) > 2e-3) || cam.l.some((v, i) => Math.abs(v - tl[i]) > 2e-3)) busy = true;
      S.cam.position.set(...cam.c); lookV.set(...cam.l); S.cam.lookAt(lookV);
      /* Breit: das Bild rückt etwas nach rechts, links bleibt Platz für den Text, rechts für die Stichworte */
      const cw = S.r.domElement.clientWidth, ch = S.r.domElement.clientHeight, vo = narrow ? 0 : -cw * .02 * (1 - kw), key = cw + ',' + ch + ',' + vo.toFixed(1);
      if (key !== vk) { vk = key; S.cam.setViewOffset(cw, ch, vo, 0, cw, ch); S.cam.updateProjectionMatrix(); }
      S.key.position.set(p.x - 34, 60, p.z + 46); S.key.target.position.set(p.x, 0, p.z - 20); S.key.target.updateMatrixWorld();

      /* Weg und Stationen */
      done.geometry.setDrawRange(0, Math.round(clamp(s / LEN) * lp.length));
      const ni = nearest(s);
      PL.forEach((q, i) => {
        const r = E(s, ST[i] - 1.2, ST[i] - .1);
        q.fill.material.opacity = r; q.edge.material.opacity = lerp(.7, 0, r);
        q.g.scale.setScalar(1 + .22 * Math.sin(Math.PI * clamp((s - ST[i] + 1.2) / 1.6)) * (1 - E(nd, .5, 2)) * (i === ni ? 1 : 0));
      });

      /* Das Haus entsteht mit den Tagen */
      const kP = E(w, arr(kPlan) - .15, arr(kPlan) + .35);
      ghost.build = kP; ghost.g.visible = kP > .002;
      ghost.lineMat.opacity = kP * (1 - E(w, arr(kHouse) + .1, arr(kHouse) + .45));
      stake.build = E(w, arr(kStake) - .1, arr(kStake) + .4) * (1 - E(w, arr(kSlab) - .2, arr(kSlab) + .05)); stake.g.visible = stake.build > .002;
      const kS = E(w, arr(kSlab) - .15, arr(kSlab) + .25); slab.scale.set(1, Math.max(.001, kS), 1); slab.position.y = .16 * kS; slab.visible = kS > .002;
      house.build = E(w, arr(kHouse) - .3, arr(kHouse) + .4); house.g.visible = house.build > .002;
      house.night = .25 * E(w, arr(kN1) + .1, arr(kN1) + .4) + .5 * E(w, arr(kN2) - .2, arr(kN2) + .2);
      const kIn = E(w, arr(kDoor) - .25, arr(kDoor) + .1);
      door.material.opacity = kIn; spill.material.opacity = kIn * .9; lamp.intensity = kIn * 18;
      const dusk = Math.max(.45 * E(w, arr(kN1) - .2, arr(kN2) + .2), E(w, arr(kDoor) - .2, L0 + N + .9));
      S.hemi.intensity = lerp(.6, .16, dusk); S.key.intensity = lerp(2.2, .45, dusk); S.fill.intensity = lerp(.5, .15, dusk);
      S.render();
      if (!shown) { shown = true; GL.classList.add('is-on'); }

      /* Wo steht das Paar im Bild (Köpfe, Füße): dort schweben die Stichworte */
      let mx = 0, mz = 0, n = 0;
      if (FAM) FAM.members.forEach(m => { mx += m.g.position.x; mz += m.g.position.z; n++; });
      else if (F) { mx = F.man.position.x; mz = F.man.position.z; n = 1; }
      if (n) {
        mx /= n; mz /= n;
        const hd = S.project(mx, FAM ? 1.55 : 1.8, mz), ft = S.project(mx, 0, mz);
        anc = { cx: (hd.x + ft.x) / 2, hy: hd.y, hh: Math.max(60, ft.y - hd.y) };
      }

      /* Phasen: der schwarze Bildschirm blendet weich ein und aus; Zeile, Feld und Titel wandern dabei langsam nach oben, der Titel wächst ein wenig.
         Nie still: alles hängt am Scrollweg (über die Feder, also weich). */
      const q = SP2.q;
      let cov = 0, pOn = -1;
      PH.forEach((P, j) => {
        let o = 0, inn = false, f = 0;
        if (q && q.j === j) {
          const first = q.w === 0; f = SP2.f;
          o = (first ? 1 : E(f, 0, .24)) * (1 - E(f, .7, 1));
          inn = f > (first ? .0 : .1) && f < .78;
          if (first && SP2.f < .02 && el.getBoundingClientRect().top > innerHeight * .4) inn = false;
        }
        const os = o.toFixed(3);
        if (P.dataset.o !== os) { P.dataset.o = os; P.style.opacity = os; P.style.visibility = o > .001 ? 'visible' : 'hidden'; }
        if (o > .001) {
          const ty = ((.5 - f) * 22).toFixed(2), sc = (.96 + f * .08).toFixed(4);
          if (P.dataset.f !== ty) { P.dataset.f = ty; PHB[j].style.transform = `translate3d(0,${ty}vh,0)`; PHH[j].style.transform = `scale(${sc})`; }
        }
        if (P.classList.contains('is-in') !== inn) P.classList.toggle('is-in', inn);
        if (o > cov) cov = o;
        if (o > .5) pOn = j;
      });
      coverK = cov; phaseOn = pOn;
      /* Am Ende wird das Bild schwarz (weiter zum Stapel) */
      endK = E(w, WU - .6, WU - .1);
      const es = endK.toFixed(3); if (FADE.dataset.o !== es) { FADE.dataset.o = es; FADE.style.opacity = es; }

      /* Text und Stichworte des Tages: ab startW, bis der nächste beginnt; am Ende aus */
      /* in einer Phase bis zur Mitte noch der Tag davor (er geht mit dem Schwarz), danach der erste Tag der Phase */
      const wt = q && SP2.f < .5 ? w - .001 : w;
      let a = -1, r = 0;
      for (let i = 0; i < N; i++) {
        const st = startW(i), nx = i < N - 1 ? startW(i + 1) : L0 + N + .55;
        if (wt >= st && wt < nx && cov < .98) a = i;
        if (wt >= st) r = i;
      }
      if (a !== active || r !== railAt) {
        if (a !== active) {
          LIS.forEach((li, i) => li.classList.toggle('is-on', i === a));
          KS.forEach((K, i) => { K.g.classList.toggle('is-on', i === a); });
          if (a >= 0) { KS[a].placed = ''; KS[a].items.forEach(it => { it.x = null; it.sl = null; }); }
        }
        if (r !== railAt) RAIL.forEach((x, i) => { x.classList.toggle('is-now', i === r); x.classList.toggle('is-past', i < r); });
        active = a; railAt = r;
        deps.onStep && deps.onStep(a, handle);
      }
      if (narrow !== cloud) { cloud = narrow; root.classList.toggle('g--cloud', narrow); KS.forEach(K => { K.placed = ''; K.items.forEach(it => { it.t = ''; it.x = null; it.sl = null; it.e.style.transform = ''; }); K.y = '-'; }); }
      if (active >= 0) posGroup(active, narrow, dt, still);
      /* busy: etwas gleitet noch nach (Tempo, Blick, Drehung, Kamera); sonst darf die Szene langsamer zeichnen */
      return busy;
    }

    if (staticMode) {
      /* Ruhiges Bild: das Paar steht vor seinem fertigen Haus, die Tür ist offen */
      const draw = () => {
        sPrev = ST[N - 1]; frame(uOf(L0 + N + 1.2), .016, 0, true);
        PH.forEach((P, j) => { P.style.opacity = ''; P.style.visibility = ''; P.classList.toggle('is-in', j === 0); });
        FADE.style.opacity = '0';
        if (F) { F.fade(1); F.man.position.set(DX - .4, 0, HZ + 8); F.man.rotation.y = .15; F.pose(0, 0, 0, 0, true); }
        if (FAM) FAM.members.forEach(m => { FAM.fade(m, 1); m.g.position.set(DX - .4 + m.lat * 1.2, 0, HZ + 8 - m.fwd * .7); m.g.rotation.y = .15; FAM.pose(m, 0, 0, 0, 0, true); }); if (FAM && FAM.hands) FAM.hands(true);
        S.render();
      };
      redraw = () => ready && draw(); S.onResize = redraw; redraw();
      return;
    }

    /* Scrollwert über eine kritisch gedämpfte Feder: weich anfahren, weich anhalten (Runde 13: etwas weicher). Große Sprünge (Anker, Zurück) springen mit. */
    let x = null, v = 0, lt = 0, calm = false;
    const W0 = 5;
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
    S.onResize = () => { KS.forEach(K => { K.placed = ''; }); tk.poke(); };
    tk.poke();
  }

  function dispose() {
    alive = false;
    tk && tk.stop(); offScroll && offScroll();
    if (S) { try { S.dispose(); const gl = S.r.getContext(); gl && gl.getExtension('WEBGL_lose_context')?.loseContext(); } catch (e) { } }
  }
  return handle;
}
