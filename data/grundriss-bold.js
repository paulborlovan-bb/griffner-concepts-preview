/* Runde 39: Concept Bold als realistischer Grundriss (grundrisse.html, js/grundriss.js).
   Alles in Punkt aus den CAD Plänen (Haus 3 mit Garage, EG und OG vom 2026-10-12), 1 m = 28,35 pt, Norden oben, y nach unten.
   Wände aus data/plan-geo.js (plan-bold-eg, plan-bold-og); das Obergeschoß liegt um off [8,5; −25] verschoben
   (gemessen am Treppenauge, das oben genau über der Treppe liegt, und am dunklen Rahmen im Osten).
   Material nach den Bildern: senkrechte Holzlatten unten und oben, dunkle dicke Platte über dem Erdgeschoß (auch die Terrasse oben),
   dunkler Rahmen: im Westen die Wand neben der Garage, im Osten die Stirnwand oben, dunkles Flachdach. Boden Parkett in Eiche wie in allen Häusern (Runde 41), Bäder und WC in Stein und Fliesen, Garage in Beton.
   Flächen gibt der Plan nicht als Liste, sie stehen als „ca.“ aus den Rechtecken. */
const yl = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => +(a + (b - a) * i / n).toFixed(2));
export default {
  name: 'Bold', key: 'bold',
  K: 28.35,
  h: { eg: 2.9, og: 2.75, slab: .5, cut: 2.1 },
  floor: 'eiche',
  desc: 'Holzlatten unten und oben, dazwischen eine dunkle Platte, oben ein dunkles Flachdach und die Terrasse über der Garage.',
  build: 'Das Haus wird gebaut: erst das Erdgeschoß mit der Garage, dann die dunkle Platte, das Obergeschoß und das Dach.',
  view: [-.7, .4],
  floors: [
    {
      key: 'eg', name: 'Erdgeschoß', short: 'EG', geo: 'plan-bold-eg',
      crop: [130, 120, 740, 455],
      out: { x0: [156.4, 142.3], x1: [700.2], y0: [157.1, 129.3, 433.5], y1: [385.6, 385.7, 442.3, 138.1] },
      skin: 'latten',
      /* der dunkle Rahmen im Westen (Wand neben der Garage mit den kurzen Enden) */
      skins: [[140, 125, 170, 446, 'dunkel']],
      mats: [[140, 125, 170, 446, 'dunkel']],
      house: [156.4, 157.1, 700.2, 385.7],
      base: [[142.3, 129.3, 725.7, 442.5]],
      /* Pfeile der Schiebetüren im Plan, doppelte Linien der Rahmenenden */
      skip: [14, 15, 16, 24, 25],
      /* offener Durchgang von der Garderobe in den Eingang */
      noDoor: [[389.6, 202.6]],
      rooms: [
        /* Platten rund ums Haus unter der Platte, Vorplatz der Garage */
        { f: 'platten', r: [[323.7, 129.3, 725.7, 157.1], [167.8, 385.7, 725.7, 442.5], [700.2, 157.1, 725.7, 385.7], [142.3, 129.3, 167.8, 442.5]] },
        { f: 'beton', r: [[167.8, 129.3, 323.7, 157.1]] },
        { n: 'Wohnen', list: 'Wohnen, Essen und Kochen', r: [[449.8, 238.6, 688.7, 374.2], [435.3, 274.7, 449.8, 374.2], [574, 168.5, 688.7, 238.6]], at: [480, 300] },
        { n: 'Kochen', part: 1, at: [630, 200] },
        { n: 'Essen', part: 1, at: [630, 360] },
        { n: 'Zimmer', r: [[335.1, 274.7, 431.7, 374.2]], at: [400, 300] },
        { n: 'Eingang', r: [[391.4, 168.5, 449.8, 269.4]], at: [420, 230] },
        { n: 'Garderobe', r: [[335.1, 168.5, 387.8, 217.7]], at: [362, 200] },
        { n: 'WC', f: 'fliese', r: [[335.1, 221.2, 387.8, 269.4]], at: [372, 250] },
        { n: 'Technik', r: [[516.5, 168.5, 570.4, 235.1]], at: [545, 200] },
        { n: 'Garage', f: 'beton', r: [[167.8, 168.5, 323.7, 324.5]], at: [245, 300] },
        { n: 'Abstellraum', f: 'beton', r: [[167.8, 329.7, 323.7, 374.2]], at: [245, 352] }
      ],
      rugs: [[478, 286, 64, 56, 'sand'], [345, 300, 40, 64, 'kalk']],
      windows: [
        /* Runde 40: alle Öffnungen außen raumhoch bis unter die Platte (Bilder 3 und 4), breite Fenster mit zwei Feldern */
        [174.9, 157.1, 316.6, 168.5, 0, 2.9, 'tor'],
        [397.1, 157.1, 440.5, 168.5, 0, 2.9, 'tuer', { leaf: .95, c: 'dunkel' }],
        [547.3, 157.1, 565.2, 168.5, 0, 2.9, 'glas'],
        [688.7, 189.8, 700.2, 262, 0, 2.9, 'glas', { sp: 1 }],
        [688.7, 312.8, 700.2, 339.2, 0, 2.9, 'glas'],
        [369.1, 374.2, 423.8, 385.7, 0, 2.9, 'glas', { sp: 1 }],
        [507.4, 374.2, 533.7, 385.7, 0, 2.9, 'glas'],
        [590.2, 374.2, 676.7, 385.7, 0, 2.9, 'glas', { sp: 1 }],
        [289.2, 374.2, 318.5, 385.6, 0, 2.9, 'tuer', { leaf: 1.03, c: 'dunkel' }],
        [287.7, 324.5, 319.9, 329.7, 0, 2.1, 'tuer', { leaf: 1.13 }],
        [323.7, 191.1, 335.1, 214, 0, 2.1, 'tuer', { leaf: .8 }]
      ],
      furn: [
        /* Kochen: Hochschränke und Zeile an der Nordwand, Insel mit Kochfeld, drei Hocker */
        ['tall', 574, 168.4, 40, 17, { f: 's', oven: 1 }], ['counter', 614, 168.4, 74.1, 17, { f: 's', sink: 1 }],
        ['island', 600.7, 213.9, 59.6, 28.4, { cook: [618, 220, 16, 14], seat: 's' }],
        ['stool', 607, 244, 11, 11], ['stool', 625, 244, 11, 11], ['stool', 643, 244, 11, 11],
        ['pendant', 615, 228], ['pendant', 645, 228],
        /* Essen: Tisch für acht */
        ['table', 600.2, 312.2, 59.6, 28.4, { lamp: 1 }],
        ['chair', 604, 302.8, 13.3, 9.4, { f: 's' }], ['chair', 623.4, 302.8, 13.3, 9.4, { f: 's' }], ['chair', 643, 302.8, 13.3, 9.4, { f: 's' }],
        ['chair', 604, 340.6, 13.3, 9.4, { f: 'n' }], ['chair', 623.4, 340.6, 13.3, 9.4, { f: 'n' }], ['chair', 643, 340.6, 13.3, 9.4, { f: 'n' }],
        ['chair', 590.8, 319.7, 9.4, 13.3, { f: 'o' }], ['chair', 659.8, 319.7, 9.4, 13.3, { f: 'w' }],
        ['pendant', 630, 326],
        /* Wohnen: Sofa über Eck nach Westen, runder Tisch, Liege am Fenster, Regal an der Wand zum Zimmer */
        ['sofa', 540.6, 276.1, 25.5, 71.1, { f: 'w', arms: 'r', c: 'dark' }],
        ['sofa', 518, 276.1, 22.6, 25.5, { f: 's', arms: 'l', c: 'dark' }],
        ['otable', 512.7, 315.9, 17, 17, { round: 1, h: .38 }],
        ['sofa', 462.7, 343.7, 48.5, 25.5, { f: 'n', arms: 'l', c: 'kupfer' }],
        ['shelf', 435.3, 274.7, 10.9, 99.5, { f: 'o' }],
        ['plant', 670, 352, 13, 13, { big: 1 }],
        /* Lamellen: zwischen Eingang und Treppe, Wand im Wohnen */
        ['slats', 446, 189, 3.8, 48, { h: 2.6, gap: .09 }],
        ['slats', 516, 270.5, 51, 2, { h: 2.6, gap: .09 }],
        /* Zimmer für alles */
        ['wardrobe', 336.1, 274.7, 55.7, 14.1, { f: 's' }],
        ['bed', 336.1, 311.3, 56.7, 45.2, { head: 'w', c: 'kalk' }], ['night', 336.6, 298.3, 11, 11], ['night', 337.1, 359.8, 11, 11],
        /* Garderobe, WC */
        ['wardrobe', 335.1, 168.5, 52.7, 14.2, { f: 's' }],
        ['toilet', 338.7, 228.3, 18.4, 11.4, { f: 'o' }], ['basin', 367.1, 221.2, 15.9, 7.4, { f: 's' }], ['shower', 335.1, 246.7, 22.7, 22.7],
        /* Technik */
        ['tech', 516.4, 168.6, 25.5, 17.1, { f: 's' }], ['shelf', 516.4, 218, 54, 17.1, { f: 'n' }],
        /* Abstellraum */
        ['shelf', 170, 331, 80, 12, { f: 's' }],
        /* Terrasse unter der Platte im Süden */
        ['osofa', 600, 405, 54, 18, { f: 'n' }], ['otable', 615, 425, 26, 13, { h: .38 }],
        ['plant', 690, 410, 13, 13, { big: 1 }]
      ],
      cars: [[208.3, 241.4, 130, 49, 0x2f3032, 's'], [274.9, 241.4, 130, 49, 0xE9E7E2, 's']],
      /* Treppe (U): Lauf nach Norden, halbe Wendel, Lauf nach Süden über der Technik (oben nur die Trittplatten) */
      stair: {
        float: 2.25,
        parts: [
          { dir: 'y', x: [449.8, 478.8], y: yl(235.7, 203, 5) },
          { c: [481.4, 203], rect: [449.8, 168.7, 516.5, 203], n: 10, a0: Math.PI, a1: 2 * Math.PI },
          { dir: 'y', x: [484, 516.5], y: yl(203, 235.7, 5) }
        ]
      },
      /* die dunkle Platte über dem Erdgeschoß, ringsum ausladend (oben ist sie die Terrasse) */
      slabs: [{ r: [[142.3, 129.5, 725.7, 442.5]], t: .5, top: 'dunkel', side: 'dunkel', under: 'dunkel' }]
    },
    {
      key: 'og', name: 'Obergeschoß', short: 'OG', geo: 'plan-bold-og',
      crop: [125, 145, 725, 475], off: [8.5, -25],
      out: { x0: [315.2, 691.7], x1: [717.2], y0: [182.3, 154.5], y1: [410.8, 467.5] },
      skin: 'latten', baseSide: 'dunkel',
      /* dunkler Rahmen im Osten: Stirnwand und ihre Enden bis an die Dachkante */
      skins: [[688, 150, 720, 470, 'dunkel']],
      mats: [[688, 150, 720, 470, 'dunkel']],
      house: [315.2, 182.3, 717.2, 410.8],
      base: [[133.5, 154.5, 717.2, 467.5]],
      skip: [20, 21, 31],
      /* kurze Wandstücke, die im Plan als Linie stehen: Tür ins WC, Tür ins Bad bei den Eltern */
      walls: [[380.2, 264.2, 383.8, 268.7], [380.2, 290.5, 383.8, 295.4], [583.2, 260.7, 589, 264.3]],
      rooms: [
        { n: 'Terrasse', f: 'platten', r: [[155, 161, 315.2, 460.4], [315.2, 410.8, 691.7, 460.4], [315.2, 161, 691.7, 182.3]], at: [230, 310], out: 1 },
        /* Rand der Platte vor dem Geländer */
        { f: 'platten', r: [[133.5, 154.5, 155, 467.5], [133.5, 154.5, 691.7, 161], [133.5, 460.4, 691.7, 467.5]] },
        { n: 'Bad', list: 'Bad mit Wanne und Dusche', f: 'stein', r: [[326.7, 193.7, 437.8, 260.7]], at: [380, 232] },
        { n: 'WC', f: 'stein', r: [[326.7, 264.2, 380.2, 295.4]], at: [362, 288] },
        { n: 'Waschen', r: [[511.5, 193.7, 579.6, 260.7]], at: [535, 230] },
        { n: 'Flur', r: [[383.8, 264.2, 579.6, 295.4], [441.3, 260.7, 508, 264.2]], at: [530, 280] },
        { n: 'Kind', list: 'Kind, Westseite', r: [[326.7, 299, 451.4, 399.4]], at: [400, 320] },
        { n: 'Kind', list: 'Kind, Ostseite', r: [[454.9, 299, 579.6, 399.4]], at: [530, 320] },
        { n: 'Eltern', r: [[583.2, 318.9, 705.8, 399.4], [583.2, 264.3, 614.4, 318.9]], at: [650, 390] },
        { n: 'Ankleide', r: [[617.9, 264.3, 705.8, 315.3]], at: [660, 290] },
        { n: 'Bad', list: 'Bad bei den Eltern', f: 'stein', r: [[583.2, 193.7, 705.8, 260.7]], at: [645, 228] }
      ],
      /* Treppenauge über der Treppe */
      void: [441.3, 193.7, 508, 260.7],
      rugs: [[600, 330, 22, 60, 'kalk'], [388, 330, 40, 50, 'salbei'], [516, 330, 40, 50, 'sand']],
      windows: [
        /* Runde 40: Straße raumhoch mit Kämpfer, Garten raumhoch mit zwei Feldern (Bilder 3 und 4) */
        [483.2, 182.3, 501, 193.7, 0, 2.75, 'glas', { tr: [.9] }],
        [538.8, 182.3, 556.6, 193.7, 0, 2.75, 'glas', { tr: [.9] }],
        [639.5, 182.3, 665.8, 193.7, 0, 2.75, 'glas', { tr: [.9] }],
        [315.2, 220.7, 326.7, 238.5, 1.1, 2.3, 'glas'],
        [315.2, 270.7, 326.7, 288.6, 1.1, 2.3, 'glas'],
        [360.5, 399.4, 415.2, 410.8, 0, 2.75, 'glas', { sp: 1 }],
        [484.2, 399.3, 538.9, 410.8, 0, 2.75, 'glas', { sp: 1 }],
        [607.5, 399.4, 693.8, 410.8, 0, 2.75, 'glas', { sp: 1 }]
      ],
      furn: [
        /* Bad im Westen */
        ['tub', 338.2, 193.7, 48.3, 22.6, { f: 's' }], ['shower', 403.5, 193.7, 34, 25.5], ['glass', 403.5, 218.5, 34, 1.5],
        ['vanity', 340.4, 246.5, 45.3, 14.2, { f: 'n', n: 2, mirror: 1 }], ['cab', 326.7, 246.5, 13.7, 14.2, { f: 'n' }],
        /* WC */
        ['toilet', 330, 274.8, 18.4, 11.4, { f: 'o' }], ['basin', 356.1, 264.2, 15.9, 7.4, { f: 's' }],
        /* Waschen */
        ['washer', 562.6, 193.7, 17, 17, { f: 'w' }], ['tall', 562.6, 210.7, 17, 50, { f: 'w' }],
        /* Kind, Westseite */
        ['bed', 329.5, 328.5, 56.7, 39.7, { head: 'w', c: 'salbei' }],
        ['wardrobe', 434.3, 299, 17.1, 56.7, { f: 'w' }], ['desk', 434.3, 355.7, 17.1, 43.6, { f: 'w' }], ['ochair', 415, 371, 13, 13, { f: 'o' }],
        /* Kind, Ostseite */
        ['bed', 457.7, 328.5, 56.7, 39.6, { head: 'w', c: 'sand' }],
        ['wardrobe', 562.6, 299, 17, 56.7, { f: 'w' }], ['desk', 562.6, 355.7, 17, 43.6, { f: 'w' }], ['ochair', 545, 370.5, 13, 13, { f: 'o' }],
        /* Eltern */
        ['bed', 626.2, 321.7, 56.7, 56.7, { head: 'n', c: 'kalk' }], ['night', 614.2, 322.5, 11, 11], ['night', 685.5, 321.7, 18.3, 10.1],
        ['chair', 586.1, 376.2, 20.3, 20.3, { f: 'o', lounge: 1 }],
        /* Ankleide */
        ['wardrobe', 617.9, 264.3, 87.9, 14.2, { f: 's' }], ['wardrobe', 617.9, 301.1, 87.9, 14.2, { f: 'n' }],
        /* Bad bei den Eltern */
        ['tub', 583.2, 193.7, 48.2, 22.7, { f: 's' }], ['shower', 671.8, 193.7, 34, 25.5], ['glass', 671.8, 218.5, 34, 1.5],
        ['toilet', 683.5, 238.6, 11.4, 18.5, { f: 'n' }], ['vanity', 616.7, 246.2, 51, 14.2, { f: 'n', n: 2, mirror: 1 }],
        /* Geländer am Treppenauge, Glas rund um die Terrasse */
        ['rail', 469.1, 228, 6.4, 32.7], ['rail', 441.3, 261, 27.8, 1.6],
        ['rail', 148.5, 161.6, 1.6, 298.8], ['rail', 148.5, 158, 543, 1.6], ['rail', 148.5, 462.5, 543, 1.6],
        /* Terrasse */
        ['osofa', 200, 175, 54, 18, { f: 's' }], ['otable', 215, 198, 26, 13, { h: .38 }],
        ['table', 240, 380, 44, 24, { out: 1 }],
        ['ochair', 232, 383, 9, 9, { f: 'o', out: 1 }], ['ochair', 232, 395, 9, 9, { f: 'o', out: 1 }],
        ['ochair', 284, 383, 9, 9, { f: 'w', out: 1 }], ['ochair', 284, 395, 9, 9, { f: 'w', out: 1 }],
        ['ochair', 470, 430, 16, 16, { f: 'n', out: 1, lounge: 1 }], ['ochair', 495, 430, 16, 16, { f: 'n', out: 1, lounge: 1 }],
        ['plant', 160, 440, 13, 13, { big: 1 }], ['plant', 300, 170, 12, 12]
      ],
      /* dunkles Flachdach über dem Obergeschoß und den Terrassen im Norden und Süden */
      roofs: [{ type: 'flat', r: [[301, 154.5, 717.2, 467.5]], t: .5, top: 'dunkel', side: 'dunkel', under: 'dunkel' }]
    }
  ]
};
