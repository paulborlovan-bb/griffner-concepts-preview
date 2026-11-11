/* Runde 51: das Haus aus dem Gartenplan (Runde 48, data/grundstueck.js), jetzt mit Satteldach (Kundenwunsch: das Satteldach ist
   das Besondere von GRIFFNER). Grundfläche wie in Runde 48: Haus 12,2 × 8 m in zwei Geschoßen, dazu Technik und Abstellraum zur
   Straße, der Eingang zum Carport und der verglaste Essplatz zum Garten. Kein Carport und keine Sauna im Haus: beide stehen im Garten.
   Gezeichnet mit js/grundriss.js wie die Concepts, nur ohne CAD Plan: die Wände stehen hier als Rechtecke (walls).
   Maße in m in den Koordinaten des Gartenplans (x nach Osten, z nach Süden, Straße im Norden), umgerechnet in Punkt (1 m = 28,35 pt).
   Material: unten Putz, oben Lärche, dazwischen das dunkle Band der Decke, Satteldach in dunklem Stehfalz, First von West nach Ost,
   im Osten zum Garten ein Giebel aus Glas, im Westen Holz. Die Anbauten in Lärchenlatten wie der Carport. */
const K = 28.35;
const px = x => +((x + 20) * K).toFixed(1), py = z => +((z + 20) * K).toFixed(1);
const R = (x0, z0, x1, z1) => [px(x0), py(z0), px(x1), py(z1)];
/* Wand entlang x (z0 bis z1 dick) von x0 bis x1, mit Lücken [a, b] */
const wx = (x0, x1, z0, z1, gaps = []) => {
  const out = []; let a = x0;
  [...gaps].sort((p, q) => p[0] - q[0]).forEach(([g0, g1]) => { if (g0 > a) out.push(R(a, z0, g0, z1)); a = g1; });
  if (x1 > a) out.push(R(a, z0, x1, z1)); return out;
};
/* Wand entlang z (x0 bis x1 dick) von z0 bis z1, mit Lücken [a, b] */
const wz = (z0, z1, x0, x1, gaps = []) => {
  const out = []; let a = z0;
  [...gaps].sort((p, q) => p[0] - q[0]).forEach(([g0, g1]) => { if (g0 > a) out.push(R(x0, a, x1, g0)); a = g1; });
  if (z1 > a) out.push(R(x0, a, x1, z1)); return out;
};
/* Möbel und Teppiche in m: [Art, x, z, Breite in x, Tiefe in z, {…}] */
const F = (t, x, z, w, d, o) => o ? [t, px(x), py(z), +(w * K).toFixed(1), +(d * K).toFixed(1), o] : [t, px(x), py(z), +(w * K).toFixed(1), +(d * K).toFixed(1)];
const P = (x, z) => ['pendant', px(x), py(z)];
const RUG = (x, z, w, d, c) => [px(x), py(z), +(w * K).toFixed(1), +(d * K).toFixed(1), c];
/* Öffnung in der Wand: Rechteck in m, Brüstung, Sturz, Art, {…} */
const O = (x0, z0, x1, z1, s, h, k, o) => o ? [...R(x0, z0, x1, z1), s, h, k, o] : [...R(x0, z0, x1, z1), s, h, k];

/* Haus und Anbauten (Außenkanten), Innenkanten des Hauses */
const H = { x0: -2.9, x1: 9.3, z0: -13.2, z1: -5.2 }, T = .42, I = { x0: H.x0 + T, x1: H.x1 - T, z0: H.z0 + T, z1: H.z1 - T };
const TECH = { x0: -5.4, x1: .6, z0: -16.2, z1: -13.2 }, EING = { x0: -5.4, x1: -2.9, z0: -12.0, z1: -8.6 }, ESS = { x0: 1.2, x1: 5.2, z0: -5.2, z1: -3.2 };
/* Treppe entlang der Nordwand, 16 Stufen à 26 cm, steigt nach Osten; oben der Flur */
const ST = { x0: 0, x1: 4.16, z0: I.z0, z1: I.z0 + .95 };
const steps = Array.from({ length: 17 }, (_, i) => px(ST.x0 + i * .26));

export const GARTEN_HAUS = { H, TECH, EING, ESS, ST, I };

export default {
  name: 'Haus am Garten', key: 'garten',
  K,
  floor: 'eiche',
  desc: 'Zwei Geschoße, unten Putz, oben Lärche, Satteldach mit einem Giebel aus Glas zum Garten.',
  build: 'Das Haus wird gebaut: erst die Wände, dann das Obergeschoß und das Dach.',
  view: [-.62, .42],
  h: { eg: 2.9, og: 2.75, slab: .34, cut: 2.1 },
  floors: [
    {
      key: 'eg', name: 'Erdgeschoß', short: 'EG',
      crop: R(-5.6, -16.4, 9.5, -3.0),
      out: { x0: [px(H.x0), px(TECH.x0)], x1: [px(H.x1), px(TECH.x1)], y0: [py(H.z0), py(TECH.z0), py(EING.z0)], y1: [py(H.z1), py(EING.z1), py(H.z0)] },
      skin: 'putz',
      /* Technik und Eingang in Lärchenlatten wie der Carport */
      skins: [[...R(-5.6, -16.4, .8, -13.1), 'latten'], [...R(-5.6, -12.2, -2.95, -8.4), 'latten']],
      house: R(H.x0, H.z0, H.x1, H.z1),
      base: [R(H.x0, H.z0, H.x1, H.z1), R(TECH.x0, TECH.z0, TECH.x1, H.z0), R(EING.x0, EING.z0, H.x0, EING.z1), R(ESS.x0, H.z1, ESS.x1, ESS.z1)],
      walls: [
        /* Haus: Nordwand (Fenster über der Treppe, Büro), Südwand (Küche, offen zum Essplatz, Schiebetür beim Wohnen) */
        ...wx(H.x0, H.x1, H.z0, I.z0, [[1.5, 2.9], [6.2, 8.4]]),
        ...wx(H.x0, H.x1, I.z1, H.z1, [[-2.2, .4], [1.2, 5.2], [5.8, 8.6]]),
        /* Westwand: Durchgang zum Eingang, Fenster über der Küchenzeile; Ostwand: Büro und Wohnen raumhoch */
        ...wz(I.z0, I.z1, H.x0, I.x0, [[-11.0, -9.6], [-7.8, -6.2]]),
        ...wz(I.z0, I.z1, I.x1, H.x1, [[-12.2, -10.8], [-8.6, -6.2]]),
        /* WC */
        R(-.98, I.z0, -.86, -11.0), ...wx(I.x0, -.86, -11.12, -11.0, [[-2.0, -1.15]]),
        /* Büro */
        R(5.22, I.z0, 5.34, -10.2), ...wx(5.22, I.x1, -10.32, -10.2, [[7.75, 8.65]]),
        /* Eingang: Nord, Süd, West mit Haustür und Seitenteil */
        R(EING.x0, EING.z0, H.x0, EING.z0 + T), R(EING.x0, EING.z1 - T, H.x0, EING.z1),
        ...wz(EING.z0 + T, EING.z1 - T, EING.x0, EING.x0 + T, [[-10.95, -9.3]]),
        /* Technik und Abstellraum zur Straße, je eine Tür nach Norden */
        ...wx(TECH.x0, TECH.x1, TECH.z0, TECH.z0 + T, [[-4.5, -3.6], [-1.3, -.4]]),
        R(TECH.x0, TECH.z0 + T, TECH.x0 + T, H.z0), R(TECH.x1 - T, TECH.z0 + T, TECH.x1, H.z0),
        R(TECH.x0 + T, H.z0 - T, H.x0, H.z0), R(-2.0, TECH.z0 + T, -1.88, H.z0),
        /* Essplatz aus Glas: vier Pfosten */
        R(ESS.x0, ESS.z1 - .18, ESS.x0 + .18, ESS.z1), R(ESS.x1 - .18, ESS.z1 - .18, ESS.x1, ESS.z1),
        R(ESS.x0, H.z1, ESS.x0 + .18, H.z1 + .18), R(ESS.x1 - .18, H.z1, ESS.x1, H.z1 + .18)
      ],
      rooms: [
        { n: 'Wohnen', list: 'Wohnen, Essen und Kochen', r: [R(I.x0, -10.2, I.x1, I.z1), R(-.86, I.z0, 5.22, -10.2), R(I.x0, -11.0, -.86, -10.2), R(ESS.x0 + .18, H.z1, ESS.x1 - .18, ESS.z1 - .18)], at: [px(7.0), py(-6.4)] },
        { n: 'Kochen', part: 1, at: [px(.3), py(-9.4)] },
        { n: 'Essen', part: 1, at: [px(3.2), py(-3.6)] },
        { n: 'WC', f: 'fliese', r: [R(I.x0, I.z0, -.98, -11.12)], at: [px(-1.7), py(-11.6)] },
        { n: 'Büro', r: [R(5.34, I.z0, I.x1, -10.32)], at: [px(7.1), py(-11.0)] },
        { n: 'Eingang', list: 'Eingang mit Garderobe', f: 'fliese', r: [R(EING.x0 + T, EING.z0 + T, H.x0, EING.z1 - T), R(H.x0, -11.0, I.x0, -9.6)], at: [px(-4.0), py(-9.6)] },
        { n: 'Technik', f: 'beton', r: [R(TECH.x0 + T, TECH.z0 + T, -2.0, H.z0 - T)], at: [px(-3.4), py(-14.2)] },
        { n: 'Abstellraum', f: 'beton', r: [R(-1.88, TECH.z0 + T, TECH.x1 - T, H.z0)], at: [px(-.6), py(-14.0)] }
      ],
      rugs: [RUG(6.0, -8.1, 2.6, 2.1, 'sand')],
      windows: [
        O(1.5, H.z0, 2.9, I.z0, 1.3, 2.5, 'glas'),
        O(6.2, H.z0, 8.4, I.z0, .9, 2.4, 'glas', { sp: 1 }),
        O(-2.2, I.z1, .4, H.z1, 0, 2.6, 'glas', { sp: 1 }),
        O(5.8, I.z1, 8.6, H.z1, 0, 2.6, 'schiebe'),
        O(H.x0, -7.8, I.x0, -6.2, .95, 2.3, 'glas'),
        O(I.x1, -12.2, H.x1, -10.8, 0, 2.6, 'glas'),
        O(I.x1, -8.6, H.x1, -6.2, 0, 2.6, 'glas', { sp: 1 }),
        /* Haustür Holz-Alu mit Seitenteil aus Glas, vom Carport her */
        O(EING.x0, -10.95, EING.x0 + T, -9.3, 0, 2.4, 'tuer', { leaf: 1.05 }),
        O(-4.5, TECH.z0, -3.6, TECH.z0 + T, 0, 2.2, 'tuer', { leaf: .9, c: 'dunkel' }),
        O(-1.3, TECH.z0, -.4, TECH.z0 + T, 0, 2.2, 'tuer', { leaf: .9, c: 'dunkel' }),
        /* Essplatz: Glas an drei Seiten */
        O(ESS.x0 + .18, ESS.z1 - .18, ESS.x1 - .18, ESS.z1, 0, 2.75, 'glas', { sp: 2 }),
        O(ESS.x0, H.z1 + .18, ESS.x0 + .18, ESS.z1 - .18, 0, 2.75, 'glas'),
        O(ESS.x1 - .18, H.z1 + .18, ESS.x1, ESS.z1 - .18, 0, 2.75, 'glas')
      ],
      furn: [
        /* Kochen: Zeile an der Westwand unter dem Fenster, Hochschränke neben dem WC, Insel mit Kochfeld, drei Hocker */
        F('counter', I.x0, -9.4, .62, 3.2, { f: 'o', sink: 1 }),
        F('tall', -.86, I.z0, .8, .62, { f: 's', oven: 1 }),
        F('island', -.9, -8.75, 2.4, .95, { cook: [px(-.3), py(-8.6), 18, 14], seat: 's' }),
        F('stool', -.6, -7.7, .38, .38), F('stool', .05, -7.7, .38, .38), F('stool', .7, -7.7, .38, .38),
        P(-.3, -8.3), P(.9, -8.3),
        /* Essen im Glas: Tisch für sechs */
        F('table', 2.1, -4.75, 2.2, 1.0, { lamp: 1 }),
        F('chair', 2.25, -5.12, .47, .33, { f: 's' }), F('chair', 2.97, -5.12, .47, .33, { f: 's' }), F('chair', 3.69, -5.12, .47, .33, { f: 's' }),
        F('chair', 2.25, -3.7, .47, .33, { f: 'n' }), F('chair', 2.97, -3.7, .47, .33, { f: 'n' }), F('chair', 3.69, -3.7, .47, .33, { f: 'n' }),
        P(2.7, -4.25), P(3.7, -4.25),
        /* Wohnen: Sofa zum Garten, Couchtisch, Sessel, Lowboard an der Wand zum Büro */
        F('sofa', 5.9, -8.75, 2.8, .95, { f: 's', arms: 'b', c: 'kalk' }),
        F('coffee', 6.75, -7.45, 1.1, .6),
        F('chair', 8.0, -7.3, .75, .75, { f: 'w', lounge: 1 }),
        F('lowboard', 5.45, -10.2, 2.2, .42, { f: 's' }),
        F('plant', I.x1 - .5, -9.5, .45, .45, { big: 1 }), F('plant', 4.4, -11.6, .42, .42, { big: 1 }),
        /* Büro */
        F('desk', 6.1, I.z0, 1.6, .7, { f: 's' }), F('ochair', 6.7, -11.95, .45, .45, { f: 'n' }),
        F('shelf', 5.34, -12.6, .4, 1.5, { f: 'o' }),
        /* WC */
        F('toilet', -1.95, I.z0, .4, .65, { f: 's' }), F('basin', I.x0, -12.0, .3, .47, { f: 'o' }),
        /* Eingang: Garderobe an der Nordwand */
        F('wardrobe', EING.x0 + T, EING.z0 + T, 2.08, .6, { f: 's' }), F('plant', -4.8, -9.55, .4, .4),
        /* Technik, Abstellraum */
        F('tech', -2.6, TECH.z0 + T, .6, 2.0, { f: 'w' }), F('washer', -4.95, -14.3, .62, .62, { f: 's' }),
        F('shelf', -1.88, -13.65, 2.06, .4, { f: 'n' }), F('shelf', TECH.x1 - .82, -15.78, .4, 1.9, { f: 'w' })
      ],
      stair: { parts: [{ dir: 'x', x: steps, y: [py(ST.z0), py(ST.z1)] }] },
      /* flache Dächer über Technik, Eingang und Essplatz */
      roofs: [{ type: 'flat', r: [R(TECH.x0 - .1, TECH.z0 - .1, TECH.x1 + .1, H.z0), R(EING.x0 - .1, EING.z0 - .1, H.x0, EING.z1 + .1), R(ESS.x0 - .1, H.z1, ESS.x1 + .1, ESS.z1 + .1)], t: .3, top: 'kies', side: 'anthrazit', under: 'holz' }]
    },
    {
      key: 'og', name: 'Obergeschoß', short: 'OG',
      crop: R(-3.1, -13.4, 9.5, -5.0),
      out: { x0: [px(H.x0)], x1: [px(H.x1)], y0: [py(H.z0)], y1: [py(H.z1)] }, skin: 'holz', baseSide: 'anthrazit',
      house: R(H.x0, H.z0, H.x1, H.z1),
      base: [R(H.x0, H.z0, H.x1, H.z1)],
      walls: [
        ...wx(H.x0, H.x1, H.z0, I.z0, [[-1.6, -.6], [1.4, 2.8], [5.7, 6.9]]),
        ...wx(H.x0, H.x1, I.z1, H.z1, [[-1.5, .5], [2.3, 4.3], [6.0, 8.2]]),
        ...wz(I.z0, I.z1, H.x0, I.x0, [[-10.4, -9.8], [-8.2, -6.6]]),
        ...wz(I.z0, I.z1, I.x1, H.x1, [[-12.4, -11.2], [-10.45, -9.75], [-9.0, -6.0]]),
        /* WC und Waschen im Nordwesten, Bad im Nordosten */
        R(-.12, I.z0, 0, -10.6), ...wx(I.x0, 0, -10.72, -10.6, [[-1.4, -.5]]),
        R(5.1, I.z0, 5.22, -10.6), ...wx(5.1, I.x1, -10.72, -10.6, [[5.45, 6.35]]),
        /* Flur und die drei Zimmer im Süden */
        ...wx(I.x0, I.x1, -9.6, -9.48, [[.25, 1.15], [1.95, 2.85], [5.5, 6.4]]),
        R(1.5, -9.48, 1.62, I.z1), R(5.06, -9.48, 5.18, I.z1)
      ],
      roofs: [{ type: 'gable', r: R(H.x0, H.z0, H.x1, H.z1), rise: 3.6, axis: 'x', ov: .35, ext: .7, edge: 'anthrazit', under: 'holz',
        gables: [{ at: px(H.x0), kind: 'holz' }, { at: px(H.x1), kind: 'glas' }] }],
      rooms: [
        { n: 'Eltern', f: 'eiche', r: [R(5.18, -9.48, I.x1, I.z1)], at: [px(7.0), py(-6.2)] },
        { n: 'Bad', f: 'fliese', r: [R(5.22, I.z0, I.x1, -10.72)], at: [px(7.0), py(-11.2)] },
        { n: 'WC', list: 'WC und Waschen', f: 'fliese', r: [R(I.x0, I.z0, -.12, -10.72)], at: [px(-1.3), py(-11.2)] },
        { n: 'Kind', list: 'Kind, Westseite', f: 'eiche', r: [R(I.x0, -9.48, 1.5, I.z1)], at: [px(-.5), py(-6.2)] },
        { n: 'Kind', list: 'Kind, Ostseite', f: 'eiche', r: [R(1.62, -9.48, 5.06, I.z1)], at: [px(3.3), py(-6.2)] },
        { n: 'Flur', f: 'eiche', r: [R(0, ST.z1, 5.1, -10.6), R(I.x0, -10.6, I.x1, -9.6), R(ST.x1, I.z0, 5.1, ST.z1)], at: [px(2.2), py(-10.1)] }
      ],
      void: R(ST.x0, ST.z0, ST.x1, ST.z1),
      rugs: [RUG(6.2, -7.2, 2.2, 1.4, 'kalk'), RUG(-1.6, -7.0, 1.4, 1.0, 'sand'), RUG(2.6, -7.0, 1.4, 1.0, 'salbei')],
      windows: [
        O(-1.6, H.z0, -.6, I.z0, 1.2, 2.3, 'glas'),
        O(1.4, H.z0, 2.8, I.z0, .9, 2.4, 'glas'),
        O(5.7, H.z0, 6.9, I.z0, 1.1, 2.4, 'glas'),
        O(-1.5, I.z1, .5, H.z1, .4, 2.55, 'glas', { sp: 1 }),
        O(2.3, I.z1, 4.3, H.z1, .4, 2.55, 'glas', { sp: 1 }),
        O(6.0, I.z1, 8.2, H.z1, .4, 2.55, 'glas', { sp: 1 }),
        O(H.x0, -10.4, I.x0, -9.8, .9, 2.3, 'glas'),
        O(H.x0, -8.2, I.x0, -6.6, .9, 2.4, 'glas'),
        O(I.x1, -12.4, H.x1, -11.2, 1.1, 2.4, 'glas'),
        O(I.x1, -10.45, H.x1, -9.75, .9, 2.3, 'glas'),
        /* Eltern: raumhoch nach Osten, darüber das Glas im Giebel */
        O(I.x1, -9.0, H.x1, -6.0, 0, 2.75, 'glas', { sp: 2 })
      ],
      furn: [
        /* Geländer am Treppenauge */
        F('rail', ST.x0, ST.z1 - .03, ST.x1 - ST.x0, .06),
        /* Eltern: Bett mit dem Kopf zum Flur, Blick nach Osten in den Garten */
        F('bed', 6.45, -9.42, 1.8, 2.1, { head: 'n', c: 'sand' }), F('night', 8.3, -9.4, .4, .4),
        F('wardrobe', 5.18, -8.2, .6, 2.4, { f: 'o' }), F('plant', 8.4, -6.1, .4, .4, { big: 1 }),
        /* Bad: Wanne unter dem Fenster, Doppelwaschtisch, Dusche, WC */
        F('tub', 5.35, I.z0, 1.75, .78, {}), F('vanity', 7.2, I.z0, 1.5, .52, { f: 's', n: 2, mirror: 1 }),
        F('shower', 7.95, -11.75, .9, .9), F('glass', 7.9, -11.75, .05, .9), F('toilet', 6.6, -11.37, .4, .65, { f: 'n' }),
        /* WC und Waschen */
        F('toilet', -1.95, I.z0, .4, .62, { f: 's' }), F('basin', I.x0, -11.7, .3, .45, { f: 'o' }), F('washer', -.78, I.z0, .62, .62, { f: 's' }),
        /* Kind, Westseite */
        F('bed', I.x0, -8.9, 2.0, 1.0, { head: 'w', single: 1, c: 'salbei' }), F('night', I.x0, -9.35, .4, .4),
        F('desk', -1.3, I.z1 - .62, 1.2, .62, { f: 'n' }), F('ochair', -.9, -6.75, .45, .45, { f: 's' }),
        F('wardrobe', .88, -8.4, .62, 1.7, { f: 'w' }),
        /* Kind, Ostseite */
        F('bed', 3.06, -8.9, 2.0, 1.0, { head: 'o', single: 1, c: 'kalk' }), F('night', 4.66, -9.35, .4, .4),
        F('desk', 2.3, I.z1 - .62, 1.2, .62, { f: 'n' }), F('ochair', 2.7, -6.75, .45, .45, { f: 's' }),
        F('wardrobe', 1.62, -8.5, .62, 1.6, { f: 'o' }),
        /* Flur */
        F('plant', 4.6, -10.2, .4, .4)
      ]
    }
  ]
};
