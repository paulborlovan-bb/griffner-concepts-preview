// Baut die Framer Code-Komponente JourneyGehen aus der Szene des Vorschlags 1 (Gehen).
// Aufruf: cd griffner-konzepte/journey && node framer-bau.mjs
// Quelle: gehen-szene.js (Szene, Texte, Zeitplan), gehen-szene.css, haus3d.js (makeHaus), figur3d.js (figure).
// Ziel:   griffner/framer-code/JourneyGehen.tsx (erzeugt, nicht von Hand ändern).
import { readFileSync, writeFileSync } from 'node:fs';
import { DEF } from './gehen-szene.js';

const here = new URL('.', import.meta.url).pathname;
const OUT = new URL('../../griffner/framer-code/JourneyGehen.tsx', import.meta.url).pathname;
const src = f => readFileSync(here + f, 'utf8');
const noExport = s => s.replace(/^export (const|let|function|class) /gm, '$1 ');
const css = src('gehen-szene.css').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*\n\s*/g, '').replace(/\s{2,}/g, ' ');

const S = (title, def, extra = {}) => ({ type: 'ControlType.String', title, defaultValue: def, ...extra });
const controls = {
  introInfo: S('Auftakt Zeile', DEF.intro.info),
  introTitel: S('Auftakt Titel', DEF.intro.h, { displayTextArea: true }),
  introText: S('Auftakt Text', DEF.intro.lead, { displayTextArea: true }),
  introHinweis: S('Auftakt Hinweis', DEF.intro.hint),
  schritte: {
    type: 'ControlType.Array', title: 'Schritte', maxCount: 24,
    control: { type: 'ControlType.Object', controls: { titel: S('Titel', ''), text: S('Text', '', { displayTextArea: true }), zeit: S('Zeit', '') } },
    defaultValue: DEF.steps.map(s => ({ titel: s.t, text: s.d, zeit: s.m }))
  },
  schlussInfo: S('Schluss Zeile', DEF.outro.info),
  schlussTitel: S('Schluss Titel', DEF.outro.h, { displayTextArea: true }),
  schlussText: S('Schluss Text', DEF.outro.lead, { displayTextArea: true }),
  knopf: S('Knopf', DEF.outro.cta),
  knopfLink: { type: 'ControlType.Link', title: 'Knopf Link', defaultValue: '/contact#contact-form' },
  bereich: S('Bereich (Vorlesen)', '', { description: 'Leer: „Deine Journey in N Schritten“' })
};
const ctl = JSON.stringify(controls, null, 4).replace(/"(ControlType\.\w+)"/g, '$1');

const tsx = `// @ts-nocheck
// GRIFFNER Journey, Vorschlag 1 Gehen: du gehst in 3D auf dein Haus zu (Figur aus dem Concepts Hero, Haus Concept Wald).
// ERZEUGT von griffner-konzepte/journey/framer-bau.mjs aus gehen-szene.js, gehen-szene.css, haus3d.js und figur3d.js.
// Nicht von Hand ändern: dort ändern und neu bauen. Alle Texte sind Eingabefelder (rechts in Framer).
import { useEffect, useRef } from "react"
import { RenderTarget, addPropertyControls, ControlType } from "framer"
import { store, registerDock } from "./GriffnerStore.tsx"

const CSS = ${JSON.stringify(css)}

/* ---------- haus3d.js ---------- */
${noExport(src('haus3d.js'))}
/* ---------- figur3d.js ---------- */
${noExport(src('figur3d.js'))}
/* ---------- gehen-szene.js ---------- */
${noExport(src('gehen-szene.js'))}
/* ---------- Framer ---------- */
let threeP: Promise<any> | null = null
const three = () => threeP || (threeP = import("https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"))
const reduceMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

function cfgOf(p: any) {
    return {
        intro: { info: p.introInfo, h: p.introTitel, lead: p.introText, hint: p.introHinweis },
        steps: (p.schritte || []).map((s: any) => ({ t: s?.titel, d: s?.text, m: s?.zeit })),
        outro: { info: p.schlussInfo, h: p.schlussTitel, lead: p.schlussText, cta: p.knopf, href: p.knopfLink },
        label: p.bereich || "",
    }
}

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1200
 */
export default function JourneyGehen(props: any) {
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
            <div ref={ref} className="jg" data-jg="JourneyGehen" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
    )
}
JourneyGehen.displayName = "Journey Gehen"
addPropertyControls(JourneyGehen, ${ctl})
`;
writeFileSync(OUT, tsx);
console.log('geschrieben', OUT, (tsx.length / 1024).toFixed(1) + ' KB');
