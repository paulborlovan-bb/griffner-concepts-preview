/* Runde 39: Concept Calm als realistischer Grundriss (grundrisse.html, js/grundriss.js). Ein Geschoß, Satteldach.
   Alles in Punkt aus dem CAD Plan (Langhaus, Relaunch), 1 m = 28,35 pt, Norden oben, y nach unten. Wände aus data/plan-geo.js (plan-calm-eg).
   Material nach den Bildern: helles Holz senkrecht, die Nordseite und der Pfeiler mit der Wand der überdachten Terrasse in hellem Ziegel,
   Satteldach mit dunklen flachen Ziegeln, im Osten ein tiefer Holzrahmen (Dach und Wandenden 0,5 m vor der Wand). Ostgiebel seit Runde 40
   wie das Bild: Holz, schmales Küchenfenster, Ziegelpfeiler bis zum First, zurückgesetzt das Glas vom Essen mit Pfosten, Holz;
   Carport und Gang zum Eingang mit flachem Dach in Holz.
   Flächen gibt der Plan nicht als Liste, sie stehen als „ca.“ aus den Rechtecken. */
export default {
  name: 'Calm', key: 'calm',
  K: 28.35,
  h: { eg: 2.75, slab: .3, cut: 2.1 },
  floor: 'eiche',
  desc: 'Ein Geschoß in hellem Holz und Ziegel, Satteldach mit dunklen Ziegeln, Carport mit überdachtem Gang zum Eingang.',
  build: 'Das Haus wird gebaut: erst die Wände, dann das Dach und der Carport.',
  view: [-.5, .44],
  floors: [
    {
      key: 'eg', name: 'Erdgeschoß', short: 'EG', geo: 'plan-calm-eg',
      crop: [320, 130, 965, 700],
      out: { x0: [329.8, 588.7], x1: [891.3, 826.1, 904.8, 770.1], y0: [390.4, 141.9], y1: [640, 520.9, 337.5] },
      skin: 'holzhell',
      /* Ziegel: die ganze Nordseite, die Ostwand der Küche, die Wände der überdachten Terrasse */
      skins: [[340, 385, 892, 400, 'ziegel'], [875, 470, 895, 525, 'ziegel'], [810, 505, 892, 525, 'ziegel']],
      /* Carport: Wandscheiben ganz in Holz */
      mats: [[585, 138, 775, 341, 'holzhell']],
      /* Runde 44: keine Türblätter an der offenen Seite der Dusche im Bad, im WC (Nische mit Waschbecken, Wandstück),
         zwischen Ankleide und Eltern und im Durchgang zum Wohnen (offen im Plan des Architekten) */
      noDoor: [[456.9, 463.4], [614.8, 450.2], [632.2, 465.4], [424.9, 533.3], [647.8, 497.9]],
      house: [329.8, 390.4, 891.3, 640],
      base: [[329.8, 390.4, 904.8, 640], [588.7, 141.9, 770.1, 352], [588, 352, 958, 390.4], [904.8, 390.4, 958, 694], [339.8, 640, 958, 694]],
      rooms: [
        /* Platten rund ums Haus, Carport */
        { f: 'platten', r: [[588, 352, 958, 390.4], [904.8, 390.4, 958, 694], [339.8, 640, 958, 694]] },
        { n: 'Carport', f: 'beton', r: [[588.7, 141.9, 770.1, 352]], at: [690, 240], out: 1 },
        { n: 'Wohnen', list: 'Wohnen, Essen und Kochen', r: [[631.1, 482.3, 749.8, 628.6], [749.8, 509.5, 814.7, 628.6], [749.8, 401.8, 879.9, 509.5]], at: [660, 600] },
        { n: 'Kochen', part: 1, at: [815, 495] },
        { n: 'Essen', part: 1, at: [795, 570] },
        { n: 'Eingang', list: 'Eingang und Flur', r: [[649.5, 401.8, 703.3, 482.3], [444, 482.3, 631.1, 513.4]], at: [676, 440] },
        { n: 'Speis', r: [[706.8, 401.8, 746.2, 478.7]], at: [735, 440] },
        { n: 'WC', f: 'fliese', r: [[599.2, 401.8, 630.4, 478.7], [630.4, 452, 646, 478.7]], at: [614, 455] },
        { n: 'Technik', r: [[536.4, 401.8, 595.7, 478.7]], at: [565, 455] },
        { n: 'Bad', list: 'Duschbad', f: 'fliese', r: [[473.4, 401.8, 532.9, 478.7]], at: [515, 440] },
        { n: 'Bad', list: 'Bad mit Wanne und Dusche', f: 'fliese', r: [[341.3, 401.8, 469.8, 461.7], [444, 461.7, 469.8, 478.7]], at: [405, 440] },
        { n: 'Ankleide', r: [[341.3, 465.2, 440.5, 531.5]], at: [390, 500] },
        { n: 'Eltern', r: [[341.3, 535.1, 440.5, 628.6]], at: [420, 545] },
        { n: 'Kind', list: 'Kind, Westseite', r: [[444, 517, 543.2, 571.2], [444, 571.2, 524.7, 628.6]], at: [500, 545] },
        { n: 'Kind', list: 'Kind, Ostseite', r: [[546.8, 517, 627.6, 571.2], [528.2, 571.2, 627.6, 628.6]], at: [570, 545] },
        { n: 'Terrasse', list: 'Terrasse, überdacht', f: 'platten', r: [[826.1, 520.9, 904.8, 640]], at: [850, 620], out: 1 }
      ],
      rugs: [[646, 540, 82, 84, 'kalk'], [494.3, 594.3, 26.7, 26.7, 'sand'], [551.4, 596.1, 24.1, 24.1, 'salbei']],
      windows: [
        [341.3, 390.4, 369, 401.8, .5, 2.4, 'glas'],
        [329.8, 390.4, 341.3, 457.9, .5, 2.4, 'glas', { sp: 1 }],
        [471.7, 390.4, 623.9, 401.8, 1.6, 2.2, 'glas', { sp: 4 }],
        [654.5, 390.4, 698, 401.8, 0, 2.4, 'tuer', { leaf: 1.0 }],
        /* Runde 40, Ostgiebel wie das Bild: Küche schmal raumhoch, Essen mit Pfosten, beide mit dunklem Kämpfer an der Traufe */
        [879.9, 449.7, 891.3, 476, 0, 2.75, 'glas', { tr: [2.45], trh: .3 }],
        [814.7, 523.8, 826.1, 610.4, 0, 2.75, 'glas', { m: [542], tr: [2.45], trh: .3 }],
        [364.6, 628.6, 433.5, 640, 0, 2.4, 'schiebe'],
        [488.2, 628.6, 514.6, 640, .3, 2.4, 'glas'],
        [556, 628.6, 582.4, 640, .3, 2.4, 'glas'],
        [665.8, 628.6, 748.9, 640, 0, 2.5, 'schiebe']
      ],
      furn: [
        /* Kochen: Hochschränke und Zeile mit Spüle an der Nordwand, Insel mit Kochfeld, zwei Hocker */
        ['tall', 749.8, 401.8, 40, 17.1, { f: 's', oven: 1 }], ['counter', 789.8, 401.8, 90.1, 17.1, { f: 's', sink: 1 }],
        ['island', 775.8, 450.2, 79.4, 28.4, { cook: [804.4, 452.6, 22.3, 15.6], seat: 's' }],
        ['stool', 795, 481, 11, 11], ['stool', 822, 481, 11, 11],
        ['pendant', 800, 464], ['pendant', 830, 464],
        /* Essen: Tisch für sechs */
        ['table', 749.8, 539.2, 28.4, 62.4, { lamp: 1 }],
        ['chair', 740.4, 543, 9.4, 13.3, { f: 'o' }], ['chair', 740.4, 563.7, 9.4, 13.3, { f: 'o' }], ['chair', 740.4, 584.4, 9.4, 13.3, { f: 'o' }],
        ['chair', 778.2, 543, 9.4, 13.3, { f: 'w' }], ['chair', 778.2, 563.7, 9.4, 13.3, { f: 'w' }], ['chair', 778.2, 584.4, 9.4, 13.3, { f: 'w' }],
        ['pendant', 764, 556], ['pendant', 764, 584],
        /* Wohnen: Lowboard an der Wand, Sofa über Eck nach Westen, Sessel, runder Tisch */
        ['lowboard', 631.1, 517, 8.5, 111.6, { f: 'o' }],
        ['sofa', 691.6, 558.4, 25.5, 59.5, { f: 'w', arms: 'l', c: 'kalk' }],
        ['sofa', 671.7, 592.4, 19.9, 25.5, { f: 'n', arms: 'l', c: 'kalk' }],
        ['chair', 691.7, 526.6, 25.5, 25.5, { f: 's', lounge: 1 }],
        ['otable', 655.8, 559.2, 22.7, 22.7, { round: 1, h: .36 }],
        ['plant', 800, 612, 13, 13, { big: 1 }],
        /* Eingang: Schrank in der Nische, Speis */
        ['wardrobe', 634, 401.8, 14.1, 46.6, { f: 'o' }],
        /* Runde 44: das Regal der Speis an der Ostwand südlich der Tür, die Tür geht frei auf */
        ['tall', 706.9, 401.8, 17, 76.9, { f: 'o' }], ['shelf', 734, 451, 12.2, 27.7, { f: 'w' }],
        /* WC */
        ['toilet', 609.1, 405.1, 11.4, 18.5, { f: 's' }], ['basin', 631.8, 459.5, 13.3, 13.4, { f: 'w' }],
        /* Technik (Runde 44: das Regal an der Westwand, die Tür geht frei auf) */
        ['tech', 578.5, 401.8, 17.2, 34, { f: 'w' }], ['washer', 538, 401.8, 17, 17, { f: 's' }], ['shelf', 536.4, 420, 12, 34, { f: 'o' }],
        /* Duschbad */
        ['toilet', 480.4, 404.7, 11.4, 18.4, { f: 's' }], ['basin', 500, 401.8, 32, 14.2, { f: 's' }],
        ['shower', 473.3, 444.7, 25.8, 34], ['glass', 498.5, 444.7, 1.5, 34],
        /* Bad mit Wanne und Dusche */
        ['tub', 346.8, 407.2, 22.7, 48.2, { free: 1 }], ['vanity', 382.8, 401.8, 45.4, 14.2, { f: 's', n: 2, mirror: 1 }],
        ['toilet', 451.4, 404.7, 11.3, 18.4, { f: 's' }], ['shower', 444.3, 444.7, 25.5, 34], ['glass', 442.8, 444.7, 1.5, 34],
        /* Ankleide */
        ['wardrobe', 341.3, 465.2, 65.1, 14.2, { f: 's' }], ['wardrobe', 341.3, 517.3, 65.1, 14.2, { f: 'n' }], ['wardrobe', 341.3, 479.4, 14.1, 37.9, { f: 'o' }],
        /* Eltern */
        ['bed', 344.1, 556.4, 56.7, 51, { head: 'w', c: 'sand' }], ['night', 345.5, 543.8, 11, 11], ['night', 345.5, 609, 11, 11],
        ['lowboard', 429.1, 564.8, 11.4, 34, { f: 'w' }],
        /* Kind, Westseite */
        ['bed', 444, 517, 28.4, 56.7, { head: 'n', single: 1, c: 'salbei' }], ['night', 472.4, 517, 10, 10],
        ['desk', 444, 611.6, 34, 17, { f: 'n' }], ['ochair', 455, 598, 12, 12, { f: 's' }],
        ['wardrobe', 526.2, 517, 17, 54.2, { f: 'w' }],
        /* Kind, Ostseite */
        ['wardrobe', 528.3, 574.7, 17, 53.9, { f: 'o' }],
        ['bed', 599.2, 517, 28.4, 56.7, { head: 'n', single: 1, c: 'kalk' }], ['night', 586.5, 517, 10, 10],
        ['desk', 593.5, 611.6, 34.1, 17, { f: 'n' }], ['ochair', 604, 598, 12, 12, { f: 's' }],
        /* überdachte Terrasse: Tisch für sechs */
        ['table', 861.6, 543.5, 22.6, 56.7, { out: 1 }],
        ['ochair', 852.2, 548, 9, 9, { f: 'o', out: 1 }], ['ochair', 852.2, 566, 9, 9, { f: 'o', out: 1 }], ['ochair', 852.2, 584, 9, 9, { f: 'o', out: 1 }],
        ['ochair', 884.2, 548, 9, 9, { f: 'w', out: 1 }], ['ochair', 884.2, 566, 9, 9, { f: 'w', out: 1 }], ['ochair', 884.2, 584, 9, 9, { f: 'w', out: 1 }],
        /* vor dem Haus im Süden: zwei Liegestühle (wie auf den Bildern) */
        ['ochair', 700, 655, 16, 18, { f: 's', out: 1, lounge: 1 }], ['ochair', 730, 655, 16, 18, { f: 's', out: 1, lounge: 1 }],
        ['plant', 600, 360, 13, 13, { big: 1 }], ['plant', 930, 420, 14, 14, { big: 1 }]
      ],
      cars: [[671.6, 196.1, 133.4, 50.6, 0x2f3032, 'w'], [671.6, 278.9, 138, 55.2, 0xE9E7E2, 'w']],
      roofs: [
        /* Satteldach, First von West nach Ost, Ziegel dunkel, Kante und Untersicht in Holz, Traufe fast bündig; Westgiebel Holz.
           Ostgiebel (Runde 40, wie das Bild): vorne ein Holzrahmen unter der Stirn, dahinter im Norden Holz, das Küchenfenster und der
           Ziegelpfeiler bis zum First, die Ziegelwand der Terrasse bis unters Dach, im Süden zurückgesetzt das Glas vom Essen mit Pfosten und Holz */
        { type: 'gable', r: [329.8, 390.4, 904.8, 640], rise: 4.2, axis: 'x', ext: .3, ov: .06, cover: 'ziegel', edge: 'holzhell', under: 'holzhell',
          gables: [
            { at: 329.8, kind: 'holzhell' },
            { at: 907.6, band: .5, mat: 'holzhell' },
            { at: 885.6, dep: .4, tb: .07, parts: [[390.4, 449.7, 'holzhell'], [449.7, 476, 'glas'], [476, 520.9, 'ziegel']] },
            { at: 853, parts: [[509.5, 520.9, 'ziegel', { dep: 2.7 }]] },
            { at: 820.4, dep: .4, tb: .07, parts: [[520.9, 523.8, 'ziegel'], [523.8, 610.4, 'glas', { m: [542] }], [610.4, 640, 'holzhell']] }
          ] },
        /* Carport und Gang zum Eingang: flach, Kante und Untersicht in Holz */
        { type: 'flat', r: [[588.7, 141.9, 770.1, 337.5], [629.5, 337.5, 720, 390.4]], t: .3, top: 'kies', side: 'holzhell', under: 'holzhell' }
      ]
    }
  ]
};
