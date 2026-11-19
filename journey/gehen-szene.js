/* GRIFFNER Journey, Vorschlag 1 Gehen: du gehst in 3D auf dein Haus zu. Die Figur ist die aus dem Concepts Hero.
   Eine Szene für beide Orte: die Vorschlagsseite gehen.html und die Framer Code-Komponente JourneyGehen
   (journey/framer-bau.mjs baut daraus die Komponente, mit allen Texten als Eingabefelder).

   Runde 2 (2026-11-19, Kundenwunsch: „er geht zu schnell, Halt etwas kürzer, alles weicher“):
   - Weg je Station 5,5 m statt 7 m und 75 statt 62 vh Scrollweg je Station: die Figur geht rund dreimal langsamer pro Scrollweg.
   - Gehen 80 % der Station, Stehen 20 % (vorher 55 / 45): kürzerer Halt.
   - Gehen mit sanftem Anlauf und Auslaufen und gleichmäßigem Tempo dazwischen (statt Smoothstep mit Spitze in der Mitte).
   - Der Scrollwert läuft über eine kritisch gedämpfte Feder: kein Ruck beim Anfahren oder Anhalten.
   - Schrittfrequenz höchstens 1,8 Doppelschritte je Sekunde: bei schnellem Scrollen werden die Schritte länger, nie hektisch. */

export const DEF = {
  intro: { info: 'Journey', h: 'Vom ersten Gespräch bis zum Schlüssel.', lead: 'Ein Projektmanager an deiner Seite. Und der Schlüssel in zehn Monaten.', hint: 'Scrollen' },
  steps: [
    { t: 'Kennenlernen', d: 'Wir hören zu, bevor wir zeichnen.', m: 'Vorab' },
    { t: 'Grundstück', d: 'Wir lesen deinen Ort. Gelände, Bäume, Sonne.', m: 'Vorab' },
    { t: 'Inspiration', d: 'Vier Concepts zum Weiterdenken.', m: 'Vorab' },
    { t: 'Vertrag', d: 'Persönlicher Projektmanager ab dem ersten Tag.', m: 'Monat 0' },
    { t: 'Dein Plan', d: 'Grundriss, Ansichten, Lage stehen fest.', m: 'Monat 1' },
    { t: 'Eingereicht', d: 'Unterlagen vollständig, wir liefern jedes Dokument.', m: 'Monat 2' },
    { t: 'Bemusterung', d: 'Besuch in Griffen, Ausstattung festlegen.', m: 'Monat 3' },
    { t: 'Baubescheid', d: 'Die Gemeinde gibt grünes Licht.', m: 'Monat 4' },
    { t: 'Planung fixiert', d: 'Geht in Fertigung, ab hier ändert sich nichts mehr.', m: 'Monat 5' },
    { t: 'Baustart', d: 'Das Fundament entsteht.', m: 'Monat 6' },
    { t: 'Dein Haus entsteht', d: 'Eine Woche Manufaktur in Griffen, dann steht es mit Dach und Fenstern.', m: 'Monat 7' },
    { t: 'Haustechnik', d: 'Heizung, Lüftung, Strom, Wasser.', m: 'Monat 8' },
    { t: 'Innenausbau', d: 'Türen, Böden, Bäder. Jetzt wird es deins.', m: 'Monat 9' },
    { t: 'Einzug', d: 'Wir gehen ein letztes Mal gemeinsam durch dein Haus. Dann schließt du selbst auf.', m: 'Monat 10' }
  ],
  outro: { info: 'Dein Haus', h: '10 Monate. Dein Traumhaus ist bezugsfertig.', lead: 'Während andere noch planen, lebst du schon.', cta: 'Kontakt aufnehmen', href: 'https://griffner.com/contact#contact-form' }
};

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
  const steps = (Array.isArray(c.steps) && c.steps.length ? c.steps : DEF.steps)
    .map(s => ({ t: String(s?.t ?? '').trim(), d: String(s?.d ?? '').trim(), m: String(s?.m ?? '').trim() }))
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
  const list = `<ol class="jl">${S.map((s, i) => `<li class="jl__i"><span class="info jl__m">${nr(i)}${s.m ? ` · ${esc(s.m)}` : ''}</span><h3 class="h-l">${esc(s.t)}</h3><p class="txt">${esc(s.d)}</p></li>`).join('')}</ol>`;
  return `<section class="g" aria-label="${esc(c.label || `Deine Journey in ${N} Schritten`)}" style="height:${sectionHeight(N)}">
<div class="g__stage"><div class="g__gl" aria-hidden="true"></div><div class="g__tags" aria-hidden="true">${tags}</div><div class="g__intro">${intro}</div><ol class="g__steps">${lis}</ol><div class="g__rail" aria-hidden="true">${S.map(() => '<i></i>').join('')}</div><div class="g__end">${outro}</div></div>
</section><div class="g__list">${list}</div>`;
}

/* Szene starten. root: Element mit markup(c) darin (Klasse jg).
   deps: { three: () => Promise<THREE>, makeHaus, figure, reduce, still (Framer Canvas: ohne 3D), onStep(i, els) } */
export function mount(root, c0, deps) {
  const c = clean(c0), N = c.steps.length, { L0, WALK, SP } = TIMING, U = units(N);
  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
  const el = $('.g'), stage = $('.g__stage');
  const LIS = $$('.g__s'), RAIL = $$('.g__rail i'), TAGS = $$('.g__tag'), INTRO = $('.g__intro'), END = $('.g__end');
  let alive = true, S = null, tk = null, offScroll = null, active = -2;
  const handle = { root, stage, rail: RAIL, active: () => active, dispose };

  const staticMode = deps.reduce || deps.still;
  if (staticMode) {
    root.classList.add('is-static'); if (deps.still) root.classList.add('is-canvas');
    el.parentNode.appendChild(END);
  } else el.style.height = sectionHeight(N);
  if (deps.still) return handle;

  const arr = i => L0 + i + WALK;
  /* Haus-Stufen an den Schritten. Bei 14 Schritten wie im Entwurf (05 Plan, 09 Schnurgerüst, 10 Platte, 11 Haus, 12 und 13 Licht, 14 Tür),
     bei einer anderen Zahl verteilt auf dieselben Anteile des Wegs. */
  const at14 = k => Math.round(k * (N - 1) / 13);

  deps.three().then(T => {
    if (!alive) return;
    const H3 = deps.makeHaus(T);
    S = H3.createStage($('.g__gl'), { bg: 0x000000, fov: 32, shadow: .55, key: 2.2, hemi: .6, fogNear: 50, fogFar: 170 });
    build(T, H3);
  }).catch(e => console.error('[Journey Gehen]', e));

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

    /* Stationen: ein gelbes Feld (5:4) neben dem Weg und ein dünner Pflock. Leer als Umriss, erreicht gefüllt. */
    const yel = new T.MeshBasicMaterial({ color: 0xFFB200, transparent: true });
    const PL = ST.map(s => {
      const p = at(s), [dx, dz] = tan(s), rx = -dz, rz = dx, x = p.x + rx * 1.45, z = p.z + rz * 1.45;
      const g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = Math.atan2(-dx, -dz); sc.add(g);
      const fill = new T.Mesh(new T.BoxGeometry(1, .03, .8), yel.clone()); fill.position.y = .02; fill.material.opacity = 0; g.add(fill);
      const edge = new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(1, .03, .8)), new T.LineBasicMaterial({ color: 0xCACACA, transparent: true, opacity: .7 })); edge.position.y = .02; g.add(edge);
      const post = new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(.5, 0, 0), new T.Vector3(.5, 1.5, 0)]), new T.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: .5 })); g.add(post);
      return { g, fill, edge, tip: new T.Vector3(.5, 1.5, 0) };
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

    /* Du */
    const F = deps.figure(T); sc.add(F.man);

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
      yaw = still ? yt : angTo(yaw, yt, 1 - Math.exp(-dt * 5));
      F.man.position.set(p.x, 0, p.z); F.man.rotation.y = yaw;
      /* An der Station schaut die Figur zum gelben Feld rechts */
      let nd = 1e9; ST.forEach(q => { nd = Math.min(nd, Math.abs(q - s)); });
      const lt2 = dir > 0 ? -.55 * (1 - clamp(nd / 1.6)) * (1 - env) : 0;
      look += (lt2 - look) * (still ? 1 : 1 - Math.exp(-dt * 3.5));
      F.pose(ph, env, now / 1000, look, still);
      F.fade(1 - E(s, SEND - 1.1, SEND - .2));

      /* Kamera: schräg hinter dir, Blick den Weg entlang. Am Ende weit zurück, das ganze Haus. */
      const vw = innerWidth, vh = innerHeight, narrow = vw / vh < .85;
      const ox = narrow ? -1.5 : -2.5, oy = narrow ? 3.7 : 2.7, oz = narrow ? 11 : 7.4, ah = narrow ? 5 : 6.5;
      const rx = -dz, rz = dx;
      const c1 = [p.x + rx * ox - dx * oz, oy, p.z + rz * ox - dz * oz], l1 = [p.x + dx * ah + rx * .7, narrow ? 1.25 : 1.05, p.z + dz * ah + rz * .7];
      const wide = narrow ? [HX - 8, 14, HZ + 74] : [HX - 19, 7, HZ + 40], wl = narrow ? [HX - 1.5, -4, HZ] : [HX - 3.5, 2.7, HZ + 2];
      const kw = E(u, L0 + N + .1, L0 + N + 1.05);
      const tc = c1.map((v, i) => lerp(v, wide[i], kw)), tl = l1.map((v, i) => lerp(v, wl[i], kw));
      if (!cam || still) cam = { c: tc, l: tl };
      else { const k = 1 - Math.exp(-dt * 4); cam.c = cam.c.map((v, i) => lerp(v, tc[i], k)); cam.l = cam.l.map((v, i) => lerp(v, tl[i], k)); }
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

      /* Nummern an den Pflöcken */
      const W = S.r.domElement.clientWidth;
      PL.forEach((q, i) => {
        tmp.copy(q.tip).applyMatrix4(q.g.matrixWorld);
        const d = S.cam.position.distanceTo(tmp), pr2 = S.project(tmp.x, tmp.y, tmp.z), t = TAGS[i];
        const o = pr2.z < 1 && pr2.x > -40 && pr2.x < W + 40 ? clamp((42 - d) / 14) * (1 - kw * .6) : 0;
        t.style.opacity = o.toFixed(3);
        if (o > 0) t.style.transform = `translate3d(${(pr2.x + 8).toFixed(1)}px,${(pr2.y - 14).toFixed(1)}px,0) scale(${clamp(9 / d, .6, 1.15).toFixed(3)})`;
        t.classList.toggle('is-on', i === active);
      });

      /* Text der Station: kurz bevor du ankommst, bis zur Hälfte des Wegs zur nächsten */
      let a = -1;
      for (let i = 0; i < N; i++) {
        const nx = i < N - 1 ? (ST[i] + ST[i + 1]) / 2 : Infinity;
        if (s >= ST[i] - 1.1 && s < nx && u < L0 + N + .7) a = i;
      }
      if (a !== active) {
        active = a;
        LIS.forEach((li, i) => li.classList.toggle('is-on', i === a));
        RAIL.forEach((r, i) => { r.classList.toggle('is-now', i === a); r.classList.toggle('is-past', i < a || (a < 0 && u > L0 + N)); });
        deps.onStep && deps.onStep(a, handle);
      }
      INTRO.style.opacity = (1 - E(u, .1, .45)).toFixed(3);
      END.classList.toggle('is-on', u > L0 + N + .75);
    }

    if (staticMode) {
      /* Ruhiges Bild: du stehst vor deinem fertigen Haus, die Tür ist offen */
      const draw = () => { sPrev = ST[N - 1]; frame(U, .016, 0, true); F.fade(1); F.man.position.set(DX - .4, 0, HZ + 8); F.man.rotation.y = .15; F.pose(0, 0, 0, 0, true); INTRO.style.opacity = '1'; S.render(); };
      S.onResize = draw; draw();
      return;
    }

    /* Scrollwert über eine kritisch gedämpfte Feder: weich anfahren, weich anhalten. Große Sprünge (Anker, Zurück) springen mit. */
    let x = null, v = 0, lt = 0;
    const W0 = 6.5;
    const prog = () => { const r = el.getBoundingClientRect(), span = Math.max(1, r.height - innerHeight); return { p: clamp(-r.top / span), on: r.top < innerHeight * 1.5 && r.bottom > -innerHeight * .5 }; };
    let raf = 0;
    const run = now => {
      raf = 0; if (!alive) return;
      const pr = prog();
      if (!pr.on) { x = null; v = 0; lt = 0; return; }
      const dt = Math.min(.1, lt ? (now - lt) / 1000 : .016); lt = now;
      const tgt = pr.p * U;
      if (x === null || Math.abs(tgt - x) > 3) { x = tgt; v = 0; }
      else {
        const n = Math.ceil(dt / .008), h = dt / n;
        for (let i = 0; i < n; i++) { v += (W0 * W0 * (tgt - x) - 2 * W0 * v) * h; x += v * h; }
      }
      frame(x, dt, now, false);
      const moving = Math.abs(tgt - x) > 1e-4 || Math.abs(v) > 1e-4 || env > .002 || Math.abs(look) > 1e-3;
      if (moving || pr.p > 0 && pr.p < 1) raf = requestAnimationFrame(run);
      else lt = 0;
    };
    tk = { poke() { if (!raf && alive) raf = requestAnimationFrame(run); }, stop() { raf && cancelAnimationFrame(raf); raf = 0; } };
    const onScroll = () => tk.poke();
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
