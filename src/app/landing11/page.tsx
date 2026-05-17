"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { LandingNav } from "@/components/landing-nav"

const CREAM = "#FAFAF5"
const DARK = "#1C3D2E"
const OLIVE = "#6B9B4A"
const OLIVE_DARK = "#527A38"
const LIME = "#D4F56A"
const NEAR_BLACK = "#121212"
const MUTED = "#8A8A80"
const LIGHT_OLIVE = "#EEF4E6"
const CARD_DARK = "#244838"
const CARD_BORDER = "rgba(212,245,106,0.16)"
const TEXT_ON_DARK = "rgba(255,255,255,0.78)"
const TEXT_ON_DARK_MUTED = "rgba(255,255,255,0.50)"

const SANS = "var(--font-inter, 'Inter', system-ui, sans-serif)"
const MONO = "var(--font-dm-mono, 'DM Mono', monospace)"
const SERIF = "var(--font-pt-serif, 'PT Serif', Georgia, serif)"

const COMPANIES = ["AXA", "Generali", "UnipolSai", "Allianz", "HDI", "AmTrust", "Unipol"]

const METRICS = [
  { value: "93%", label: "dei professionisti trova la polizza più adatta al primo tentativo" },
  { value: "2 min", label: "per un preventivo completo e personalizzato" },
  { value: "5+", label: "compagnie confrontate in tempo reale" },
  { value: "< 24h", label: "dalla scelta alla polizza attiva" },
]

const BENTO_FEATURES = [
  {
    tag: "Confronto intelligente",
    title: "Analisi multi-compagnia",
    desc: "Il motore confronta offerte reali da AXA, Generali, UnipolSai, Allianz e altre — ordinandole per coerenza con il tuo profilo di rischio.",
    accent: LIME,
    span: true,
  },
  {
    tag: "Coperture verificate",
    title: "RC Professionale",
    desc: "Massimali fino a €5M, retroattività estesa, colpa grave inclusa per le professioni a rischio.",
    accent: OLIVE,
    span: false,
  },
  {
    tag: "Tutela completa",
    title: "Colpa Grave & Legale",
    desc: "Estensione alle responsabilità più gravi e copertura integrale delle spese legali e processuali.",
    accent: OLIVE_DARK,
    span: false,
  },
]

const PROFILES = [
  { cat: "Medici & Sanitari", count: "500+", items: ["RC colpa grave inclusa", "Retroattività fino a 10 anni", "Massimali fino a €5M"] },
  { cat: "Avvocati & Legali", count: "120+", items: ["Errori e omissioni", "Mancato rispetto termini", "Collaboratori inclusi"] },
  { cat: "Ingegneri & Architetti", count: "200+", items: ["RC progettazione", "Direzione lavori", "Cantiere incluso"] },
  { cat: "Commercialisti", count: "300+", items: ["Consulenza fiscale", "Negligenza professionale", "Studio associato"] },
]

const CHAT_LINES = [
  { role: "system", text: "Profilo identificato: Medico Chirurgo — specializzazione in chirurgia generale." },
  { role: "system", text: "Analisi in corso su 5 compagnie... Tariffari verificati aggiornati al trimestre corrente." },
  { role: "result", text: "AXA — RC Professionale — €680/anno — Consigliata per il tuo profilo" },
  { role: "system", text: "Generali — RC Medici — €740/anno — Copertura base ottima" },
  { role: "detail", text: "Differenza: +€60/anno per massimale ridotto del 25%. La proposta AXA offre un rapporto copertura/prezzo superiore del 18%." },
]

const STEPS = [
  { n: "01", title: "Identifica", desc: "Seleziona il tuo profilo professionale. Poche domande, nessun questionario infinito." },
  { n: "02", title: "Confronta", desc: "Il motore analizza offerte reali da 5 compagnie e le ordina per coerenza con il tuo rischio." },
  { n: "03", title: "Scegli", desc: "Una proposta consigliata e tutte le alternative. Massimali e franchigie spiegati in chiaro." },
  { n: "04", title: "Proteggi", desc: "Polizza attiva in meno di 24 ore. Tutto digitale, zero agenzie." },
]

const FAQS = [
  { q: "Il preventivo è davvero gratuito?", a: "Sì. Nessun costo nascosto, nessun obbligo. Calcoli, confronti e decidi con calma." },
  { q: "Come viene scelta la polizza consigliata?", a: "Il sistema analizza il tuo profilo, i rischi tipici della tua professione e le coperture disponibili — non solo il prezzo." },
  { q: "Posso vedere le alternative?", a: "Sempre. La proposta consigliata è visibile insieme a tutte le alternative con confronto dettagliato." },
  { q: "Quanto tempo per la polizza attiva?", a: "In molti casi meno di 24 ore. Processo digitale, documenti via email, polizza immediatamente operativa." },
]

const PROFESSIONI = [
  "Medico Chirurgo",
  "Medico di Base",
  "Avvocato",
  "Ingegnere",
  "Architetto",
  "Commercialista",
  "Consulente finanziario",
  "Geometra",
  "Psicologo",
  "Dentista",
  "Infermiere",
  "Farmacista",
]

const ATTIVITA = [
  "Studio individuale",
  "Studio associato",
  "Società professionale",
  "Libero professionista",
  "Collaboratore coordinato",
]

const MASSIMALI = [
  "€250.000",
  "€500.000",
  "€1.000.000",
  "€2.000.000",
  "€3.000.000",
  "€5.000.000",
]

const FRANCHIGIE = [
  "Nessuna franchigia",
  "€500",
  "€1.000",
  "€2.500",
  "€5.000",
  "€10.000",
]

export default function Landing11() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map())
  const [formStep, setFormStep] = useState(0)
  const [form, setForm] = useState({ professione: "", attivita: "", massimale: "", franchigia: "" })
  const [submitted, setSubmitted] = useState(false)

  const filledSteps = [
    form.professione !== "",
    form.attivita !== "",
    form.massimale !== "",
    form.franchigia !== "",
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleSections((prev) => {
          const next = new Set(prev)
          for (const e of entries) {
            const id = e.target.getAttribute("data-section")
            if (id && e.isIntersecting) next.add(id)
          }
          return next
        })
      },
      { threshold: 0.12 }
    )
    const sections = document.querySelectorAll("[data-section]")
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  const vis = (id: string) => visibleSections.has(id)

  const fadeUp: React.CSSProperties = {
    opacity: 0,
    transform: "translateY(28px)",
    transition: "opacity 0.7s ease, transform 0.7s ease",
  }
  const fadeUpVisible: React.CSSProperties = {
    opacity: 1,
    transform: "translateY(0)",
    transition: "opacity 0.7s ease, transform 0.7s ease",
  }
  const st = (id: string): React.CSSProperties => vis(id) ? fadeUpVisible : fadeUp

  return (
    <>
      <style>{`
        @keyframes lg11-marquee {
          from { transform: translateX(0) }
          to   { transform: translateX(-50%) }
        }
        @keyframes lg11-float {
          0%, 100% { transform: translateY(0) }
          50%      { transform: translateY(-6px) }
        }
        @keyframes lg11-pulse {
          0%, 100% { opacity: 0.5 }
          50%      { opacity: 1 }
        }
        @keyframes lg11-progress {
          from { width: 0 }
          to   { width: 100% }
        }
      `}</style>

      <div style={{ background: CREAM, color: NEAR_BLACK, fontFamily: SANS }}>

        {/* ── NAVBAR ── */}
        <nav style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
          background: "rgba(249,249,244,0.88)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(18,42,30,0.06)",
        }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: DARK, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2L14 8L8 14L2 8L8 2Z" fill={LIME} stroke={LIME} strokeWidth="0.5" strokeLinejoin="round"/></svg>
              </div>
              <span style={{ fontFamily: SANS, fontSize: 17, fontWeight: 700, color: DARK, letterSpacing: "-0.03em" }}>ScelgoSicuro</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <LandingNav current="11" variant="light" />
              <Link href="/app" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: DARK, color: CREAM,
                fontFamily: SANS, fontSize: 13, fontWeight: 600,
                padding: "10px 22px", borderRadius: 100,
                textDecoration: "none", letterSpacing: "-0.01em",
              }}>
                Calcola preventivo
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7H11M11 7L8 4M11 7L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
            </div>
          </div>
        </nav>

        {/* ── HERO (LIGHT BG) ── */}
        <section style={{
          minHeight: "100svh",
          background: CREAM,
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "120px 32px 0",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: "-15%", right: "-10%", width: "55vw", height: "55vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(212,245,106,0.08) 0%, transparent 60%)", pointerEvents: "none" }} />

          <div style={{ maxWidth: 1280, margin: "0 auto", width: "100%", position: "relative", zIndex: 1, flex: 1, display: "flex", alignItems: "center" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 72, alignItems: "center" }} className="lg11-hero-grid">

              {/* LEFT: headline + CTA */}
              <div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "rgba(91,122,59,0.10)", padding: "7px 16px", borderRadius: 100, marginBottom: 32,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: LIME, animation: "lg11-pulse 2s ease-in-out infinite" }} />
                  <span style={{ fontFamily: MONO, fontSize: 10, color: OLIVE, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 500 }}>
                    Intermediario RUI — IVASS
                  </span>
                </div>

                <h1 style={{
                  fontFamily: SANS,
                  fontSize: "clamp(2.6rem, 5vw, 4.2rem)",
                  fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.04em",
                  color: NEAR_BLACK, marginBottom: 24,
                }}>
                  La protezione<br />inizia da un{" "}
                  <span style={{ display: "inline-block", background: DARK, color: LIME, padding: "2px 16px", borderRadius: 8, fontWeight: 800 }}>
                    confronto
                  </span>
                </h1>

                <p style={{
                  fontSize: "clamp(0.95rem, 1.1vw, 1.08rem)",
                  lineHeight: 1.72, color: MUTED,
                  maxWidth: "38ch", marginBottom: 40, fontWeight: 400,
                }}>
                  Confrontiamo tariffe reali di AXA, Generali, UnipolSai, Allianz e altre.
                  Non stime — prezzi veri, coperture verificate, proposta su misura per il tuo rischio.
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                  <Link href="/app" style={{
                    display: "inline-flex", alignItems: "center", gap: 10,
                    background: DARK, color: CREAM,
                    fontFamily: SANS, fontSize: 15, fontWeight: 600,
                    padding: "16px 32px", borderRadius: 100,
                    textDecoration: "none", letterSpacing: "-0.01em",
                    boxShadow: "0 4px 24px rgba(18,42,30,0.18)",
                  }}>
                    Calcola il tuo preventivo
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M13 8L9 4.5M13 8L9 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </Link>
                  <Link href="/app" style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    background: "transparent", color: MUTED,
                    fontFamily: SANS, fontSize: 14, fontWeight: 400,
                    padding: "14px 0", textDecoration: "none",
                    borderBottom: `2px solid ${OLIVE}`,
                  }}>
                    Scopri come funziona
                  </Link>
                </div>
              </div>

              {/* RIGHT: natural language form */}
              <div style={{ position: "relative" }}>
                <div style={{
                  background: DARK, borderRadius: 20, overflow: "hidden",
                  border: `1px solid ${CARD_BORDER}`,
                  boxShadow: "0 16px 64px rgba(18,42,30,0.22)",
                }}>
                  {/* Header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 32px", borderBottom: `1px solid ${CARD_BORDER}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(212,245,106,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2L14 8L8 14L2 8L8 2Z" fill={LIME} opacity="0.8"/></svg>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "white", letterSpacing: "-0.01em" }}>Preventivo immediato</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: LIME, animation: "lg11-pulse 1.8s ease-in-out infinite" }} />
                      <span style={{ fontFamily: MONO, fontSize: 9, color: TEXT_ON_DARK_MUTED, letterSpacing: "0.06em" }}>2 min</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ padding: "0 32px" }}>
                    <div style={{ display: "flex", gap: 6, marginTop: 20 }}>
                      {filledSteps.map((filled, i) => (
                        <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: filled ? LIME : "rgba(255,255,255,0.08)", transition: "background 0.4s ease" }} />
                      ))}
                    </div>
                  </div>

                  {/* Natural language sentence */}
                  <div style={{ padding: "36px 32px 44px" }}>
                    <p style={{
                      fontSize: "clamp(1.35rem, 2vw, 1.7rem)",
                      fontWeight: 300,
                      lineHeight: 2.4,
                      color: "rgba(255,255,255,0.48)",
                      letterSpacing: "-0.01em",
                    }}>
                      Sono{" "}
                      <select
                        value={form.professione}
                        onChange={(e) => { setForm({ ...form, professione: e.target.value }); if (formStep < 1) setFormStep(1) }}
                        style={{
                          appearance: "none",
                          background: form.professione ? "rgba(212,245,106,0.10)" : "transparent",
                          border: "none",
                          borderBottom: form.professione ? `2px solid ${LIME}` : `1.5px dashed rgba(212,245,106,0.35)`,
                          color: form.professione ? LIME : "rgba(255,255,255,0.35)",
                          fontSize: "clamp(1.35rem, 2vw, 1.7rem)",
                          fontFamily: SANS,
                          fontWeight: 700,
                          padding: "3px 10px",
                          borderRadius: 0,
                          cursor: "pointer",
                          outline: "none",
                          transition: "all 0.3s ease",
                          display: "inline-block",
                          minWidth: 160,
                        }}
                      >
                        <option value="" disabled style={{ background: DARK, color: "rgba(255,255,255,0.40)" }}>professione</option>
                        {PROFESSIONI.map((p) => <option key={p} value={p} style={{ background: DARK, color: "white" }}>{p}</option>)}
                      </select>
                      {" "}e lavoro come{" "}
                      <select
                        value={form.attivita}
                        onChange={(e) => { setForm({ ...form, attivita: e.target.value }); if (formStep < 2) setFormStep(2) }}
                        style={{
                          appearance: "none",
                          background: form.attivita ? "rgba(212,245,106,0.10)" : "transparent",
                          border: "none",
                          borderBottom: form.attivita ? `2px solid ${LIME}` : `1.5px dashed rgba(212,245,106,0.35)`,
                          color: form.attivita ? LIME : "rgba(255,255,255,0.35)",
                          fontSize: "clamp(1.35rem, 2vw, 1.7rem)",
                          fontFamily: SANS,
                          fontWeight: 700,
                          padding: "3px 10px",
                          borderRadius: 0,
                          cursor: "pointer",
                          outline: "none",
                          transition: "all 0.3s ease",
                          display: "inline-block",
                          minWidth: 170,
                        }}
                      >
                        <option value="" disabled style={{ background: DARK, color: "rgba(255,255,255,0.40)" }}>tipo di attività</option>
                        {ATTIVITA.map((a) => <option key={a} value={a} style={{ background: DARK, color: "white" }}>{a}</option>)}
                      </select>
                      <br />cerco una RC con massimale{" "}
                      <select
                        value={form.massimale}
                        onChange={(e) => { setForm({ ...form, massimale: e.target.value }); if (formStep < 3) setFormStep(3) }}
                        style={{
                          appearance: "none",
                          background: form.massimale ? "rgba(212,245,106,0.10)" : "transparent",
                          border: "none",
                          borderBottom: form.massimale ? `2px solid ${LIME}` : `1.5px dashed rgba(212,245,106,0.35)`,
                          color: form.massimale ? LIME : "rgba(255,255,255,0.35)",
                          fontSize: "clamp(1.35rem, 2vw, 1.7rem)",
                          fontFamily: SANS,
                          fontWeight: 700,
                          padding: "3px 10px",
                          borderRadius: 0,
                          cursor: "pointer",
                          outline: "none",
                          transition: "all 0.3s ease",
                          display: "inline-block",
                          minWidth: 140,
                        }}
                      >
                        <option value="" disabled style={{ background: DARK, color: "rgba(255,255,255,0.40)" }}>massimale</option>
                        {MASSIMALI.map((m) => <option key={m} value={m} style={{ background: DARK, color: "white" }}>{m}</option>)}
                      </select>
                      {" "}e franchigia{" "}
                      <select
                        value={form.franchigia}
                        onChange={(e) => { setForm({ ...form, franchigia: e.target.value }) }}
                        style={{
                          appearance: "none",
                          background: form.franchigia ? "rgba(212,245,106,0.10)" : "transparent",
                          border: "none",
                          borderBottom: form.franchigia ? `2px solid ${LIME}` : `1.5px dashed rgba(212,245,106,0.35)`,
                          color: form.franchigia ? LIME : "rgba(255,255,255,0.35)",
                          fontSize: "clamp(1.35rem, 2vw, 1.7rem)",
                          fontFamily: SANS,
                          fontWeight: 700,
                          padding: "3px 10px",
                          borderRadius: 0,
                          cursor: "pointer",
                          outline: "none",
                          transition: "all 0.3s ease",
                          display: "inline-block",
                          minWidth: 155,
                        }}
                      >
                        <option value="" disabled style={{ background: DARK, color: "rgba(255,255,255,0.40)" }}>franchigia</option>
                        {FRANCHIGIE.map((f) => <option key={f} value={f} style={{ background: DARK, color: "white" }}>{f}</option>)}
                      </select>
                    </p>

                    <div style={{ marginTop: 36 }}>
                      <Link
                        href={form.professione && form.attivita && form.massimale && form.franchigia ? "/app" : "#"}
                        onClick={(e) => { if (!form.professione || !form.attivita || !form.massimale || !form.franchigia) e.preventDefault() }}
                        style={{
                          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
                          background: form.professione && form.attivita && form.massimale && form.franchigia ? LIME : "rgba(212,245,106,0.10)",
                          color: form.professione && form.attivita && form.massimale && form.franchigia ? DARK : "rgba(255,255,255,0.22)",
                          fontFamily: SANS, fontSize: 15, fontWeight: 600,
                          padding: "15px 32px", borderRadius: 12,
                          textDecoration: "none", letterSpacing: "-0.01em",
                          transition: "all 0.3s ease",
                          cursor: form.professione && form.attivita && form.massimale && form.franchigia ? "pointer" : "default",
                          boxShadow: form.professione && form.attivita && form.massimale && form.franchigia ? "0 4px 24px rgba(212,245,106,0.25)" : "none",
                        }}
                      >
                        Calcola il preventivo
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M13 8L9 4.5M13 8L9 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </Link>
                    </div>

                    <p style={{ marginTop: 20, fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.18)", letterSpacing: "0.06em" }}>Gratuito · Senza impegno · 2 minuti</p>
                  </div>
                </div>

                {/* Floating badge bottom-left */}
                <div style={{
                  position: "absolute", bottom: -18, left: -24,
                  background: CREAM, borderRadius: 14, padding: "16px 20px",
                  boxShadow: "0 8px 32px rgba(18,42,30,0.10)",
                  border: "1px solid rgba(18,42,30,0.08)",
                  animation: "lg11-float 3.5s ease-in-out infinite",
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: DARK, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M4 7.5L6 10L10 4" stroke={LIME} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div>
                    <p style={{ fontFamily: MONO, fontSize: 9, color: MUTED, letterSpacing: "0.08em" }}>GRATUITO</p>
                    <p style={{ fontSize: 15, fontWeight: 700, color: DARK, letterSpacing: "-0.02em" }}>Nessun impegno</p>
                  </div>
                </div>

                {/* Floating badge top-right */}
                <div style={{
                  position: "absolute", top: -14, right: -14,
                  background: DARK, borderRadius: 10, padding: "10px 14px",
                  boxShadow: "0 4px 16px rgba(18,42,30,0.14)",
                  border: `1px solid ${CARD_BORDER}`,
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: LIME, animation: "lg11-pulse 1.8s ease-in-out infinite" }} />
                  <span style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.50)", letterSpacing: "0.06em" }}>Live</span>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof bar */}
          <div style={{ borderTop: "1px solid rgba(18,42,30,0.06)", marginTop: 56 }}>
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "36px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
              <p style={{ fontFamily: MONO, fontSize: 10, color: MUTED, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                Compagnie confrontate in tempo reale
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 48, flexWrap: "wrap", justifyContent: "center" }}>
                {COMPANIES.map((c) => (
                  <span key={c} style={{ fontFamily: SANS, fontSize: 17, fontWeight: 700, color: "rgba(18,42,30,0.12)", letterSpacing: "-0.02em" }}>{c}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── TRANSITION SECTION (LIGHT) ── */}
        <section data-section="transition" style={{ background: CREAM, padding: "60px 32px 80px", borderTop: "1px solid rgba(18,42,30,0.06)" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", textAlign: "center", ...st("transition") }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: DARK, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 3V19M3 11H19" stroke={LIME} strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <p style={{
              fontFamily: MONO, fontSize: 10, color: OLIVE, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 16, fontWeight: 500,
            }}>
              Le nostre coperture
            </p>
            <h2 style={{
              fontFamily: SANS, fontSize: "clamp(2rem, 3.8vw, 3.2rem)",
              fontWeight: 700, lineHeight: 1.08, letterSpacing: "-0.04em",
              color: NEAR_BLACK, maxWidth: "20ch", margin: "0 auto",
            }}>
              Polizze pensate per chi fa sul serio.
            </h2>
          </div>
        </section>

        {/* ── FEATURE MACRO-SECTION (DARK BG) ── */}
        <section data-section="features" style={{ background: DARK, padding: "100px 32px", color: "white" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", ...st("features") }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 72, alignItems: "start" }} className="lg11-features-grid">

              {/* LEFT: big metrics */}
              <div>
                <p style={{
                  fontFamily: MONO, fontSize: 10, color: LIME, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 20, fontWeight: 500,
                }}>
                  Perché funziona
                </p>
                <h2 style={{
                  fontFamily: SANS, fontSize: "clamp(2rem, 3.5vw, 3rem)",
                  fontWeight: 700, lineHeight: 1.08, letterSpacing: "-0.04em",
                  marginBottom: 48, color: "white",
                }}>
                  Dati reali,<br />nessuna stima.
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
                  {METRICS.map((m, i) => (
                    <div key={i}>
                      <p style={{ fontFamily: SANS, fontSize: "clamp(2.4rem, 4.5vw, 3.8rem)", fontWeight: 800, color: LIME, lineHeight: 1, letterSpacing: "-0.04em" }}>{m.value}</p>
                      <p style={{ fontSize: 14, lineHeight: 1.6, color: TEXT_ON_DARK_MUTED, marginTop: 8, maxWidth: "30ch" }}>{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT: bento cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {BENTO_FEATURES.map((f) => (
                  <div key={f.title} style={{
                    background: CARD_DARK,
                    border: `1px solid ${CARD_BORDER}`,
                    borderRadius: 16, padding: 32,
                    ...(f.span ? { gridColumn: "span 2" } : {}),
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 4, background: f.accent }} />
                      <span style={{ fontFamily: MONO, fontSize: 10, color: f.accent, letterSpacing: "0.10em", textTransform: "uppercase", fontWeight: 500 }}>{f.tag}</span>
                    </div>
                    <h3 style={{ fontSize: f.span ? 22 : 18, fontWeight: 600, color: "white", marginBottom: 10, letterSpacing: "-0.02em" }}>{f.title}</h3>
                    <p style={{ fontSize: 14, lineHeight: 1.7, color: TEXT_ON_DARK_MUTED }}>{f.desc}</p>

                    {f.span && (
                      <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                        {[
                          { l: "Massimali", v: "fino a €5M" },
                          { l: "Copertura", v: "Immediata" },
                          { l: "Franchigia", v: "Nessuna minima" },
                        ].map((s) => (
                          <div key={s.l} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "14px 16px" }}>
                            <p style={{ fontFamily: MONO, fontSize: 9, color: TEXT_ON_DARK_MUTED, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>{s.l}</p>
                            <p style={{ fontSize: 14, fontWeight: 600, color: "white" }}>{s.v}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── PRODUCT DETAIL / CHAT (WHITE BG) ── */}
        <section data-section="product" style={{ background: "white", padding: "100px 32px" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", ...st("product") }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 72, alignItems: "start" }} className="lg11-product-grid">

              {/* LEFT: text */}
              <div>
                <p style={{
                  fontFamily: MONO, fontSize: 10, color: OLIVE, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 20, fontWeight: 500,
                }}>
                  Il motore di analisi
                </p>
                <h2 style={{
                  fontFamily: SANS, fontSize: "clamp(2rem, 3.5vw, 3rem)",
                  fontWeight: 700, lineHeight: 1.08, letterSpacing: "-0.04em",
                  marginBottom: 24, color: NEAR_BLACK,
                }}>
                  Confronto trasparente. Risultato immediato.
                </h2>
                <p style={{ fontSize: "1.05rem", lineHeight: 1.72, color: MUTED, maxWidth: "36ch", marginBottom: 36 }}>
                  Il sistema analizza il tuo profilo di rischio, le coperture disponibili e i prezzi praticati dalle compagnie. Non un ranking per prezzo — una valutazione per coerenza.
                </p>

                <Link href="/app" style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  background: DARK, color: CREAM,
                  fontFamily: SANS, fontSize: 14, fontWeight: 600,
                  padding: "14px 28px", borderRadius: 100,
                  textDecoration: "none", letterSpacing: "-0.01em",
                }}>
                  Prova ora
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7H11M11 7L8 4M11 7L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
              </div>

              {/* RIGHT: chat-style simulation */}
              <div style={{
                background: DARK,
                border: `1px solid ${CARD_BORDER}`,
                borderRadius: 20, padding: 24, overflow: "hidden",
              }}>
                {/* Chat header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid rgba(212,245,106,0.08)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 4, background: LIME, animation: "lg11-pulse 2s ease-in-out infinite" }} />
                    <span style={{ fontFamily: MONO, fontSize: 10, color: TEXT_ON_DARK_MUTED, letterSpacing: "0.08em" }}>ANALISI IN TEMPO REALE</span>
                  </div>
                  <span style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.20)" }}>v2.4</span>
                </div>

                {/* Chat lines */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {CHAT_LINES.map((line, i) => (
                    <div key={i} style={{
                      background: line.role === "result" ? "rgba(212,245,106,0.08)" : line.role === "detail" ? "rgba(212,245,106,0.04)" : "rgba(255,255,255,0.03)",
                      border: line.role === "result" ? `1px solid rgba(212,245,106,0.18)` : "1px solid rgba(255,255,255,0.04)",
                      borderRadius: line.role === "result" ? 12 : 10,
                      padding: "14px 18px",
                    }}>
                      {line.role === "result" ? (
                        <p style={{ fontSize: 13, fontWeight: 500, color: LIME, lineHeight: 1.5 }}>{line.text}</p>
                      ) : line.role === "detail" ? (
                        <p style={{ fontSize: 12, lineHeight: 1.6, color: "rgba(255,255,255,0.55)" }}>{line.text}</p>
                      ) : (
                        <p style={{ fontSize: 12, lineHeight: 1.6, color: TEXT_ON_DARK_MUTED }}>{line.text}</p>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 10, background: "rgba(212,245,106,0.06)", border: "1px solid rgba(212,245,106,0.10)", display: "flex", alignItems: "center", gap: 10 }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5.5 3L10.5 7L5.5 11" stroke={LIME} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.70)" }}>Analisi completata — 5 compagnie, 3 livelli di copertura</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PROFESSIONAL PROFILES (LIGHT) ── */}
        <section data-section="profiles" style={{ background: CREAM, padding: "100px 32px" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", ...st("profiles") }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 56, flexWrap: "wrap", gap: 24 }}>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(91,122,59,0.10)", padding: "6px 16px", borderRadius: 100, marginBottom: 24 }}>
                  <span style={{ fontFamily: MONO, fontSize: 10, color: OLIVE, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500 }}>
                    Per chi è
                  </span>
                </div>
                <h2 style={{ fontFamily: SANS, fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-0.04em", color: NEAR_BLACK }}>
                  Il tuo mestiere,<br />la tua polizza.
                </h2>
              </div>
              <Link href="/app" style={{ fontFamily: MONO, fontSize: 12, color: DARK, letterSpacing: "0.04em", borderBottom: `2px solid ${OLIVE}`, paddingBottom: 2, textDecoration: "none", fontWeight: 500 }}>
                Scopri il tuo profilo →
              </Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
              {PROFILES.map((pr) => (
                <div key={pr.cat} style={{
                  background: "white", borderRadius: 16, padding: "32px 28px",
                  display: "flex", flexDirection: "column", gap: 20,
                  border: "1px solid rgba(18,42,30,0.06)",
                  boxShadow: "0 2px 12px rgba(18,42,30,0.04)",
                }}>
                  <div>
                    <p style={{ fontFamily: MONO, fontSize: 10, color: OLIVE, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6, fontWeight: 500 }}>{pr.count} profili</p>
                    <h3 style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.2, color: NEAR_BLACK, letterSpacing: "-0.02em" }}>{pr.cat}</h3>
                  </div>
                  <ul style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                    {pr.items.map((item) => (
                      <li key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 20, height: 20, borderRadius: 6, background: "rgba(212,245,106,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2.5 5L4 6.5L7.5 3" stroke={OLIVE} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                        <span style={{ fontSize: 14, lineHeight: 1.4, color: MUTED }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PROCESS (LIGHT) ── */}
        <section data-section="process" style={{ background: "white", padding: "100px 32px" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", ...st("process") }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }} className="lg11-process-grid">
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(91,122,59,0.10)", padding: "6px 16px", borderRadius: 100, marginBottom: 24 }}>
                  <span style={{ fontFamily: MONO, fontSize: 10, color: OLIVE, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500 }}>
                    Il nostro processo
                  </span>
                </div>
                <h2 style={{ fontFamily: SANS, fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-0.04em", marginBottom: 24, color: NEAR_BLACK }}>
                  Dal rischio alla copertura. In quattro passi.
                </h2>
                <p style={{ fontSize: "1.05rem", lineHeight: 1.72, color: MUTED, maxWidth: "36ch" }}>
                  Nessuna complicazione. Identifichiamo il tuo profilo, confrontiamo le offerte e ti proteggiamo — tutto in meno di 24 ore.
                </p>
              </div>
              <div>
                {STEPS.map((s) => (
                  <div key={s.n} style={{
                    padding: "28px 0",
                    borderTop: "1px solid rgba(18,42,30,0.06)",
                    display: "flex", gap: 20,
                  }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: DARK, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontFamily: MONO, fontSize: 14, color: LIME, fontWeight: 600 }}>{s.n}</span>
                    </div>
                    <div style={{ paddingTop: 4 }}>
                      <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 6, color: NEAR_BLACK, letterSpacing: "-0.01em" }}>{s.title}</h3>
                      <p style={{ fontSize: 14, lineHeight: 1.7, color: MUTED }}>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ (LIGHT) ── */}
        <section data-section="faq" style={{ background: CREAM, padding: "100px 32px" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", ...st("faq") }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 64, alignItems: "start" }}>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(91,122,59,0.10)", padding: "6px 16px", borderRadius: 100, marginBottom: 24 }}>
                  <span style={{ fontFamily: MONO, fontSize: 10, color: OLIVE, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500 }}>
                    FAQ
                  </span>
                </div>
                <h2 style={{ fontFamily: SANS, fontSize: "clamp(2rem, 3vw, 2.8rem)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.04em", marginBottom: 20, color: NEAR_BLACK }}>
                  Domande frequenti.
                </h2>
                <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.7, maxWidth: "30ch" }}>
                  Non trovi risposta?{" "}
                  <span style={{ borderBottom: `2px solid ${OLIVE}`, cursor: "pointer", color: DARK }}>Scrivici →</span>
                </p>
              </div>
              <div>
                {FAQS.map((faq, i) => (
                  <div key={i} style={{ borderBottom: "1px solid rgba(18,42,30,0.06)" }}>
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 0", background: "none", border: "none", cursor: "pointer", color: NEAR_BLACK, gap: 16, textAlign: "left" }}
                    >
                      <span style={{ fontSize: 16, fontWeight: 500 }}>{faq.q}</span>
                      <span style={{
                        fontFamily: MONO, fontSize: 18, flexShrink: 0,
                        transform: openFaq === i ? "rotate(45deg)" : "none", transition: "transform 0.25s ease",
                        width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center",
                        borderRadius: "50%", background: openFaq === i ? DARK : "transparent",
                        color: openFaq === i ? LIME : MUTED,
                      }}>+</span>
                    </button>
                    <div style={{ maxHeight: openFaq === i ? 220 : 0, overflow: "hidden", transition: "max-height 0.35s ease" }}>
                      <p style={{ fontSize: 14, lineHeight: 1.75, color: MUTED, paddingBottom: 24, maxWidth: "50ch" }}>{faq.a}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA (LIGHT BG — asymmetric) ── */}
        <section data-section="cta" style={{ background: "white", padding: "120px 32px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: "40vw", height: "40vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(212,245,106,0.06) 0%, transparent 60%)", pointerEvents: "none" }} />
          <div style={{ maxWidth: 1280, margin: "0 auto", ...st("cta") }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "center" }} className="lg11-cta-grid">

              {/* LEFT: CTA text */}
              <div>
                <h2 style={{ fontFamily: SANS, fontSize: "clamp(2.4rem, 5vw, 4rem)", fontWeight: 700, lineHeight: 1.06, letterSpacing: "-0.04em", color: NEAR_BLACK, marginBottom: 28 }}>
                  Proteggi il tuo lavoro.{" "}
                  <span style={{ color: OLIVE }}>Senza sorprese.</span>
                </h2>
                <p style={{ fontSize: "1.08rem", lineHeight: 1.68, color: MUTED, maxWidth: "40ch", marginBottom: 40 }}>
                  Il confronto migliore, la copertura più adatta, l&apos;emissione più veloce.
                  In meno di 24 ore.
                </p>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                  <Link href="/app" style={{
                    display: "inline-flex", alignItems: "center", gap: 10,
                    background: DARK, color: CREAM,
                    fontFamily: SANS, fontSize: 15, fontWeight: 600,
                    padding: "16px 32px", borderRadius: 100,
                    textDecoration: "none", letterSpacing: "-0.01em",
                    boxShadow: "0 4px 24px rgba(18,42,30,0.18)",
                  }}>
                    Calcola il preventivo
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M13 8L9 4.5M13 8L9 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </Link>
                  <Link href="/app" style={{
                    display: "inline-flex", alignItems: "center", gap: 10,
                    background: "transparent", color: DARK,
                    fontFamily: SANS, fontSize: 15, fontWeight: 500,
                    padding: "16px 32px", borderRadius: 100,
                    border: "1px solid rgba(18,42,30,0.12)",
                    textDecoration: "none",
                  }}>
                    Scopri come funziona
                  </Link>
                </div>
              </div>

              {/* RIGHT: dark mock card */}
              <div style={{
                background: DARK, borderRadius: 20, padding: 40, overflow: "hidden",
                border: `1px solid ${CARD_BORDER}`,
                boxShadow: "0 16px 64px rgba(18,42,30,0.16)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(212,245,106,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2L16 9L9 16L2 9L9 2Z" fill={LIME} opacity="0.8"/></svg>
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: "white" }}>ScelgoSicuro</p>
                    <p style={{ fontFamily: MONO, fontSize: 9, color: TEXT_ON_DARK_MUTED, letterSpacing: "0.08em" }}>PREVENTIVO ISTANTANEO</p>
                  </div>
                </div>

                {[
                  { label: "Profilo identificato", value: "Medico Chirurgo", bar: 100, color: LIME },
                  { label: "Compagnie analizzate", value: "5 compagnie", bar: 85, color: LIME },
                  { label: "Copertura consigliata", value: "AXA — RC Professionale", bar: 93, color: LIME },
                  { label: "Risparmio stimato", value: "€120/anno vs media", bar: 68, color: "rgba(212,245,106,0.5)" },
                ].map((item, i) => (
                  <div key={i} style={{ marginBottom: i < 3 ? 20 : 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: TEXT_ON_DARK_MUTED }}>{item.label}</span>
                      <span style={{ fontFamily: MONO, fontSize: 11, color: i === 2 ? LIME : "rgba(255,255,255,0.60)", fontWeight: i === 2 ? 600 : 400 }}>{item.value}</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${item.bar}%`, borderRadius: 2, background: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER (LIGHT) ── */}
        <footer style={{ background: DARK, padding: "80px 32px 40px", color: "white" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 64 }} className="lg11-footer-grid">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(212,245,106,0.10)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L13 7L7 13L1 7L7 1Z" fill={LIME} opacity="0.8"/></svg>
                  </div>
                  <span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 700, color: "white", letterSpacing: "-0.02em" }}>ScelgoSicuro</span>
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: TEXT_ON_DARK_MUTED, maxWidth: "32ch" }}>
                  Intermediario assicurativo iscritto al R.U.I. presso IVASS. Confrontiamo le migliori compagnie per proteggere il lavoro dei professionisti italiani.
                </p>
              </div>
              <div>
                <p style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.20)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20 }}>Coperture</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {["RC Professionale", "Colpa Grave", "Tutela Legale", "Retroattività"].map((l) => (
                    <span key={l} style={{ fontSize: 14, color: "rgba(255,255,255,0.40)", cursor: "pointer" }}>{l}</span>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.20)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20 }}>Professioni</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {["Medici & Sanitari", "Avvocati & Legali", "Ingegneri & Architetti", "Commercialisti"].map((l) => (
                    <span key={l} style={{ fontSize: 14, color: "rgba(255,255,255,0.40)", cursor: "pointer" }}>{l}</span>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.20)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20 }}>Azienda</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {["Chi siamo", "Privacy Policy", "Termini", "Contatti"].map((l) => (
                    <span key={l} style={{ fontSize: 14, color: "rgba(255,255,255,0.40)", cursor: "pointer" }}>{l}</span>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <p style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.15)", letterSpacing: "0.06em" }}>© 2025 ScelgoSicuro Srl. Tutti i diritti riservati.</p>
              <p style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.15)", letterSpacing: "0.06em" }}>Regolato da IVASS — D.Lgs. 209/2005</p>
            </div>
          </div>
        </footer>
      </div>

      {/* ── RESPONSIVE ── */}
      <style>{`
        @media (max-width: 768px) {
          .lg11-hero-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .lg11-features-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .lg11-product-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .lg11-process-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .lg11-cta-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .lg11-footer-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </>
  )
}