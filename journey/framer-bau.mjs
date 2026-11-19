// Baut die Framer Code-Komponenten JourneyGehen, JourneyGehen2 und JourneyGehen3 aus der Szene des Vorschlags 1 (Gehen).
// Aufruf: cd griffner-konzepte/journey && node framer-bau.mjs
// Quelle: gehen-szene.js (Szene, Texte, Zeitplan, Bilder), gehen-szene.css, haus3d.js (makeHaus), figur3d.js (figure) und je Variante die Familie:
//   JourneyGehen  (Seite /journey):   familie-toy.js, Spielfiguren in Code gebaut (Runde 7).
//   JourneyGehen2 (Seite /journey-2): familie3d.js, Quaternius Körper und Gang (CC0), Modell-Datei familie.bin.gz bei Framer (Runde 3, erster Versuch).
//   JourneyGehen3 (Seite /journey-3): familie-echt.js + gang-daten.js, Microsoft Rocketbox (MIT), Modell-Datei familie-echt.bin.gz bei Framer (Runde 6).
// Nach neuem Bau einer Modell-Datei (familie-bau.mjs, familie-echt-bau.mjs): neu hochladen und die URL unten eintragen.
// Ziel:   griffner/framer-code/JourneyGehen*.tsx (erzeugt, nicht von Hand ändern).
import { readFileSync, writeFileSync } from 'node:fs';
import { DEF, ICONS } from './gehen-szene.js';

const here = new URL('.', import.meta.url).pathname;
const OUTDIR = new URL('../../griffner/framer-code/', import.meta.url).pathname;
const src = f => readFileSync(here + f, 'utf8');
const noExport = s => s.replace(/^export (async function|const|let|function|class) /gm, '$1 ');
const sect = f => `/* ---------- ${f} ---------- */\n${noExport(src(f)).replace(/^import .*$/gm, '')}\n`;
const LIZENZ = readFileSync(new URL('./familie-echt-LIZENZ.txt', import.meta.url), 'utf8');
const URL2 = 'https://framerusercontent.com/assets/rry7ninQx3XVQFHjtejrj6OSGE.gz'; // familie.bin.gz (Quaternius) bei Framer, hochgeladen 2026-11-19 (Runde 3)
const URL3 = 'https://framerusercontent.com/assets/kN5ihfOtDgvXa294N5bDfKx2g.gz'; // familie-echt.bin.gz (Rocketbox) bei Framer, hochgeladen 2026-11-19 (Runde 6)
const VARIANTS = [
  { name: 'JourneyGehen', title: 'Journey Gehen', files: ['familie-toy.js'],
    head: '// Familie: weiche Spielfiguren, in Code gebaut (eigener Entwurf).\n',
    family: 'Promise.resolve(toyFamily(T))' },
  { name: 'JourneyGehen2', title: 'Journey Gehen 2', files: ['familie3d.js'], url: URL2,
    head: '// Variante 2 (Seite /journey-2): Familie aus Quaternius Universal Base Characters und Universal Animation Library, CC0 1.0 (gemeinfrei).\n',
    family: 'loadFamily(T, FAMILIE_URL)' },
  { name: 'JourneyGehen3', title: 'Journey Gehen 3', files: ['gang-daten.js', 'familie-echt.js'], url: URL3,
    head: '// Variante 3 (Seite /journey-3): echte Menschen, Microsoft Rocketbox Avatar Library (Lizenz unten). Gang: Quaternius Universal Animation Library, CC0 1.0.\n'
      + LIZENZ.trim().split('\n').map(l => '// ' + l).join('\n') + '\n',
    family: 'loadEchteFamilie(T, FAMILIE_URL)' },
];
const css = src('gehen-szene.css').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*\n\s*/g, '').replace(/\s{2,}/g, ' ');

const S = (title, def, extra = {}) => ({ type: 'ControlType.String', title, defaultValue: def, ...extra });
const controls = {
  introInfo: S('Auftakt Zeile', DEF.intro.info),
  introTitel: S('Auftakt Titel', DEF.intro.h, { displayTextArea: true }),
  introText: S('Auftakt Text', DEF.intro.lead, { displayTextArea: true }),
  introHinweis: S('Auftakt Hinweis', DEF.intro.hint),
  schritte: {
    type: 'ControlType.Array', title: 'Schritte', maxCount: 24,
    control: { type: 'ControlType.Object', controls: {
      titel: S('Titel', ''), text: S('Text', '', { displayTextArea: true }), zeit: S('Zeit', ''),
      bild: { type: 'ControlType.Enum', title: 'Bild', defaultValue: 'auto', options: ['auto', ...Object.keys(ICONS), 'keins'], optionTitles: ['Automatisch (nach Titel)', ...Object.values(ICONS).map(x => x[0]), 'Kein Bild'] }
    } },
    defaultValue: DEF.steps.map(s => ({ titel: s.t, text: s.d, zeit: s.m, bild: s.b }))
  },
  schlussInfo: S('Schluss Zeile', DEF.outro.info),
  schlussTitel: S('Schluss Titel', DEF.outro.h, { displayTextArea: true }),
  schlussText: S('Schluss Text', DEF.outro.lead, { displayTextArea: true }),
  knopf: S('Knopf', DEF.outro.cta),
  knopfLink: { type: 'ControlType.Link', title: 'Knopf Link', defaultValue: '/contact#contact-form' },
  bereich: S('Bereich (Vorlesen)', '', { description: 'Leer: „Deine Journey in N Schritten“' })
};
const ctl = JSON.stringify(controls, null, 4).replace(/"(ControlType\.\w+)"/g, '$1');

for (const v of VARIANTS) {
const all = ['gehen-szene.js', 'gehen-szene.css', 'haus3d.js', 'figur3d.js', ...v.files];
const tsx = `// @ts-nocheck
// GRIFFNER Journey, Vorschlag 1 Gehen: eine Familie geht in 3D auf ihr Haus zu (Haus Concept Wald), über jedem Schritt ein Linienbild.
// ERZEUGT von griffner-konzepte/journey/framer-bau.mjs aus ${all.slice(0, -1).join(', ')} und ${all[all.length - 1]}.
// Nicht von Hand ändern: dort ändern und neu bauen. Alle Texte und die Bilder je Schritt sind Eingabefelder (rechts in Framer).
${v.head}import { useEffect, useRef } from "react"
import { RenderTarget, addPropertyControls, ControlType } from "framer"
import { store, registerDock } from "./GriffnerStore.tsx"

const CSS = ${JSON.stringify(css)}

/* ---------- haus3d.js ---------- */
${noExport(src('haus3d.js'))}
/* ---------- figur3d.js ---------- */
${noExport(src('figur3d.js'))}
${v.files.map(sect).join('')}${v.url ? `const FAMILIE_URL = ${JSON.stringify(v.url)}\n` : ''}/* ---------- gehen-szene.js ---------- */
${noExport(src('gehen-szene.js'))}
/* ---------- Framer ---------- */
let threeP: Promise<any> | null = null
const three = () => threeP || (threeP = import("https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"))
const reduceMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

function cfgOf(p: any) {
    return {
        intro: { info: p.introInfo, h: p.introTitel, lead: p.introText, hint: p.introHinweis },
        steps: (p.schritte || []).map((s: any) => ({ t: s?.titel, d: s?.text, m: s?.zeit, b: s?.bild })),
        outro: { info: p.schlussInfo, h: p.schlussTitel, lead: p.schlussText, cta: p.knopf, href: p.knopfLink },
        label: p.bereich || "",
    }
}

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1200
 */
export default function ${v.name}(props: any) {
    const ref = useRef<HTMLDivElement>(null)
    const cfg = cfgOf(props)
    const html = markup(cfg)
    useEffect(() => {
        const root = ref.current
        if (!root) return
        const still = RenderTarget.current() === RenderTarget.canvas, reduce = reduceMotion()
        /* Das gelbe Feld der Website ist die Marke an der Schrittleiste: es gleitet von Schritt zu Schritt und bleibt rechts an der Leiste */
        let dock: any = null, offDock: any = null, zone: any = null
        const h = mount(root, cfg, {
            three, makeHaus, figure, reduce, still,
            family: (T: any) => ${v.family},
            onStep(i: number, api: any) { if (dock) dock.el = api.rail[api.railAt()] || dock.el },
        })
        if (!still && !reduce) {
            root.classList.add("has-dock")
            /* Immer an der Leiste rechts, auch zwischen den Stationen, im Auftakt und am Schluss (nie zurück ins Logo) */
            dock = { el: h.rail[h.railAt()], kind: "box", id: "jg-schritt", solid: true, key: () => String(h.railAt()) }
            offDock = registerDock(dock)
            zone = { el: h.stage, on: () => true }
            store.darkZones.add(zone)
        }
        return () => {
            offDock && offDock()
            zone && store.darkZones.delete(zone)
            h.dispose()
            root.classList.remove("has-dock", "is-static", "is-canvas")
        }
    }, [html])
    return (
        <div style={{ width: "100%" }}>
            <style data-jg-css="1" dangerouslySetInnerHTML={{ __html: CSS }} />
            <div ref={ref} className="jg" data-jg="${v.name}" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
    )
}
${v.name}.displayName = "${v.title}"
addPropertyControls(${v.name}, ${ctl})
`;
writeFileSync(OUTDIR + v.name + '.tsx', tsx);
console.log('geschrieben', OUTDIR + v.name + '.tsx', (tsx.length / 1024).toFixed(1) + ' KB');
}
