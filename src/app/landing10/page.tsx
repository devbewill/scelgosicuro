"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { LandingNav } from "@/components/landing-nav"

const FOREST = "#0F3E17"
const FOREST_LIGHT = "#1a5c23"
const GREEN_ACCENT = "#2d8a3e"
const SAGE = "#E1F4DF"
const SAGE_DARK = "#c5ebc0"
const CREAM = "#f9fdf8"
const DARK = "#0a1f10"
const WHITE = "#ffffff"

const MONO = "var(--font-dm-mono, 'DM Mono', monospace)"
const SANS = "var(--font-inter, 'Inter', system-ui, sans-serif)"
const SERIF = "var(--font-pt-serif, 'PT Serif', Georgia, serif)"

const COMPANIES = [
  "AXA", "AmTrust", "Generali", "UnipolSai", "Allianz",
  "HDI", "Axa", "Generali", "Unipol", "Allianz",
]

const PRODUCTS = [
  {
    tag: "Copertura base",
    title: "RC Professionale",
    desc: "Protegge dai danni causati a terzi nello svolgimento della tua attività professionale. Il fondamento di ogni tutela.",
    features: ["Massimali fino a €5M", "Copertura immediata", "Nessuna franchigia minima"],
    accent: GREEN_ACCENT,
  },
  {
    tag: "Protezione estesa",
    title: "Colpa Grave",
    desc: "Estende la copertura alle responsabilità più gravi: errori diagnostici, malpractice, atti dei collaboratori e dipendenti.",
    features: ["Colpa grave inclusa", "Dipendenti e collaboratori", "Massimale calibrato"],
    accent: "#0a2812",
  },
  {
    tag: "Assistenza legale",
    title: "Tutela Legale",
    desc: "Spese legali, onorari e costi processuali interamente coperti. Difesa attiva in ogni fase del procedimento.",
    features: ["Difesa in giudizio", "Onorari coperti al 100%", "Consulenza legale inclusa"],
    accent: "#1e5c3f",
  },
]

const TRUST_ITEMS = [
  "Intermediario iscritto al R.U.I. presso IVASS",
  "Confronto trasparente tra 5+ compagnie leader",
  "Processo 100% digitale, zero intermediazioni fisiche",
  "Polizza attiva in meno di 24 ore dall'invio",
]

const PROFILES = [
  {
    cat: "Medici & Sanitari",
    label: "500+ specializzazioni",
    items: ["RC colpa grave inclusa", "Retroattività fino a 10 anni", "Massimali da €500k a €5M", "Tutela legale su richiesta"],
    accent: "#2d8a3e",
  },
  {
    cat: "Avvocati & Legali",
    label: "Studi legali",
    items: ["Errori e omissioni", "Mancato rispetto di termini", "Perdita di documenti", "Collaboratori e soci inclusi"],
    accent: "#c45a2c",
  },
  {
    cat: "Ingegneri & Architetti",
    label: "Progettazione e DL",
    items: ["RC progettazione e collaudi", "Direzione lavori", "Massimale calibrato sul progetto", "Copertura cantiere inclusa"],
    accent: "#1e5c3f",
  },
  {
    cat: "Commercialisti & Consulenti",
    label: "Consulenza e gestione",
    items: ["Errori di consulenza fiscale", "Negligenza professionale", "Danni a clienti e terzi", "Studio associato coperto"],
    accent: "#1a3d6e",
  },
]

const STEPS = [
  { n: "01", title: "Identifica", desc: "Selezioniamo il tuo profilo partendo da professione, attività e struttura. Nessun questionario infinito — solo le informazioni che contano." },
  { n: "02", title: "Confronta", desc: "Il motore analizza offerte reali da 5 compagnie e le ordina per coerenza con il tuo profilo di rischio. Non stime — tariffari veri." },
  { n: "03", title: "Scegli", desc: "Una proposta consigliata, più le alternative. Massimali, franchigie e clausole spiegate in modo leggibile, senza tecnicismi." },
  { n: "04", title: "Proteggi", desc: "Polizza emessa in meno di 24 ore. Documenti digitali, rinnovi automatici. Zero agenzie, zero code, zero sorprese." },
]

const STATS = [
  { n: "5+", label: "Compagnie confrontate" },
  { n: "2 min", label: "Per un preventivo completo" },
  { n: "< 24h", label: "Dalla richiesta alla polizza" },
  { n: "100%", label: "Digitale, senza intermediari" },
]

const TESTIMONIALS = [
  {
    quote: "Preventivo in 3 minuti, polizza emessa il giorno dopo. Nessun agente, nessuna attesa. Finalmente.",
    name: "Dr. Marco R.",
    role: "Medico di base, Milano",
  },
  {
    quote: "Come avvocato avevo bisogno di coperture specifiche sulla colpa grave. ScelgoSicuro le ha trovate subito.",
    name: "Avv. Laura P.",
    role: "Studio legale, Roma",
  },
  {
    quote: "Ho confrontato tre compagnie in dieci minuti. La copertura migliore non era la più cara — e questo fa la differenza.",
    name: "Ing. Davide C.",
    role: "Ingegnere strutturista, Torino",
  },
]

const FAQS = [
  { q: "Il preventivo è davvero gratuito e senza impegno?", a: "Sì. Nessun costo nascosto, nessun obbligo di acquisto. Puoi calcolare il preventivo, confrontare le opzioni e decidere con calma." },
  { q: "Come viene scelta la polizza consigliata?", a: "Il sistema analizza il tuo profilo di rischio, i rischi tipici della tua professione e le coperture disponibili per trovare la soluzione più coerente — non solo la più economica." },
  { q: "Posso vedere tutte le alternative oltre a quella consigliata?", a: "Sempre. La piattaforma mostra la proposta consigliata e tutte le alternative, con massimali, franchigie e clausole spiegate in modo chiaro." },
  { q: "Quanto tempo ci vuole dall'analisi alla polizza attiva?", a: "In molti casi meno di 24 ore. Dopo aver scelto la proposta, il processo è completamente digitale. Ricevi i documenti via email e la polizza è immediatamente operativa." },
]

export default function Landing10() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map())

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
      { threshold: 0.15 }
    )
    const sections = document.querySelectorAll("[data-section]")
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  const vis = (id: string) => visibleSections.has(id)

  const fadeUp: React.CSSProperties = {
    opacity: 0,
    transform: "translateY(30px)",
    transition: "opacity 0.8s ease, transform 0.8s ease",
  }
  const fadeUpVisible: React.CSSProperties = {
    opacity: 1,
    transform: "translateY(0)",
    transition: "opacity 0.8s ease, transform 0.8s ease",
  }
  const st = (id: string): React.CSSProperties => vis(id) ? fadeUpVisible : fadeUp

  return (
    <>
      <style>{`
        @keyframes lg10-marquee {
          from { transform: translateX(0) }
          to   { transform: translateX(-50%) }
        }
        @keyframes lg10-float {
          0%, 100% { transform: translateY(0) }
          50%      { transform: translateY(-8px) }
        }
        @keyframes lg10-pulse {
          0%, 100% { opacity: 0.4 }
          50%      { opacity: 0.8 }
        }
      `}</style>

      <div style={{ background: WHITE, color: DARK, fontFamily: SANS }}>

        {/* ── NAVBAR ────────────────────────────────────────────────────────── */}
        <nav style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(15,62,23,0.08)",
        }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: FOREST, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L13 7L7 13L1 7L7 1Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/></svg>
              </div>
              <span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 600, color: FOREST, letterSpacing: "-0.01em" }}>ScelgoSicuro</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <LandingNav current="10" variant="light" />
              <Link
                href="/app"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: FOREST, color: WHITE,
                  fontFamily: SANS, fontSize: 14, fontWeight: 500,
                  padding: "10px 24px", borderRadius: 100,
                  textDecoration: "none",
                  transition: "background 0.2s",
                }}
              >
                Calcola preventivo
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
            </div>
          </div>
        </nav>

{/* ── HERO — EASE-STYLE GRID ──────────────────────────────────────────── */}
        <section style={{
          minHeight: "100svh",
          background: CREAM,
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "120px 32px 0",
          position: "relative", overflow: "hidden",
        }}>
          {/* subtle decorative circles */}
          <div style={{ position: "absolute", top: "-10%", right: "-5%", width: "50vw", height: "50vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(193,235,192,0.35) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "5%", left: "-8%", width: "35vw", height: "35vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(193,235,192,0.25) 0%, transparent 70%)", pointerEvents: "none" }} />

          <div style={{ maxWidth: 1280, margin: "0 auto", width: "100%", position: "relative", zIndex: 1, flex: 1, display: "flex", alignItems: "center" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }} className="lg10-hero-grid">

              {/* ── LEFT COLUMN: text + CTA ─────────────────────────────── */}
              <div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: SAGE, padding: "8px 16px", borderRadius: 100, marginBottom: 36,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN_ACCENT, animation: "lg10-pulse 2s ease-in-out infinite" }} />
                  <span style={{ fontFamily: MONO, fontSize: 11, color: FOREST, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                    Intermediario iscritto al RUI — IVASS
                  </span>
                </div>

                <h1 style={{
                  fontFamily: SERIF,
                  fontSize: "clamp(2.4rem, 4.5vw, 4rem)",
                  fontWeight: 400, lineHeight: 1.06, letterSpacing: "-0.02em",
                  color: DARK, marginBottom: 28,
                }}>
                  La protezione del professionista inizia da un <strong style={{ fontWeight: 600, color: FOREST }}>confronto.</strong>
                </h1>

                <p style={{
                  fontSize: "clamp(1rem, 1.3vw, 1.12rem)",
                  lineHeight: 1.7, color: "rgba(10,31,16,0.55)",
                  maxWidth: "40ch", marginBottom: 44,
                }}>
                  Confrontiamo offerte reali di AXA, AmTrust, Generali, Unipol e Allianz.
                  Tariffari aggiornati, coperture verificate, proposta personalizzata.
                  Nessuna stima — solo dati concreti.
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <Link href="/app" style={{
                    display: "inline-flex", alignItems: "center", gap: 10,
                    background: FOREST, color: WHITE,
                    fontFamily: SANS, fontSize: 15, fontWeight: 600,
                    padding: "16px 32px", borderRadius: 100,
                    textDecoration: "none",
                    boxShadow: "0 4px 20px rgba(15,62,23,0.20)",
                  }}>
                    Calcola il tuo preventivo
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 9H14M14 9L10 5M14 9L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </Link>
                  <Link href="/app" style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "transparent", color: "rgba(10,31,16,0.55)",
                    fontFamily: SANS, fontSize: 15, fontWeight: 400,
                    padding: "16px 0",
                    textDecoration: "none",
                    borderBottom: "2px solid rgba(10,31,16,0.15)",
                    paddingBottom: 4,
                  }}>
                    Scopri come funziona
                  </Link>
                </div>
              </div>

              {/* ── RIGHT COLUMN: comparison card ────────────────────────── */}
              <div style={{ position: "relative" }}>
                <div style={{
                  background: WHITE,
                  border: "1px solid rgba(15,62,23,0.08)",
                  borderRadius: 20, padding: 32,
                  boxShadow: "0 8px 40px rgba(10,31,16,0.08)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: SAGE, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C5.686 1.5 3 4.186 3 7.5V11.25C3 12.493 4.007 13.5 5.25 13.5H6.75V9H4.5V7.5C4.5 5.015 6.515 3 9 3C11.485 3 13.5 5.015 13.5 7.5V9H11.25V13.5H12.75C13.993 13.5 15 12.493 15 11.25V7.5C15 4.186 12.314 1.5 9 1.5Z" fill={FOREST} opacity="0.6"/></svg>
                      </div>
                      <div>
                        <p style={{ fontFamily: MONO, fontSize: 10, color: "rgba(10,31,16,0.40)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Profilo</p>
                        <p style={{ color: DARK, fontSize: 14, fontWeight: 600 }}>Medico Chirurgo</p>
                      </div>
                    </div>
                    <div style={{ background: SAGE, padding: "6px 14px", borderRadius: 100 }}>
                      <span style={{ fontFamily: MONO, fontSize: 10, color: FOREST, letterSpacing: "0.06em", fontWeight: 500 }}>5 offerte</span>
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid rgba(15,62,23,0.06)", paddingTop: 20 }}>
                    <p style={{ fontFamily: MONO, fontSize: 10, color: "rgba(10,31,16,0.35)", letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 14 }}>Preventivo consigliato</p>
                    {[
                      { i: 1, name: "AXA — RC Professionale", price: "€680/anno", best: true },
                      { i: 2, name: "Generali — RC Medici", price: "€740/anno", best: false },
                      { i: 3, name: "AmTrust — Colpa Grave", price: "€820/anno", best: false },
                    ].map((row) => (
                      <div key={row.i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderTop: "1px solid rgba(15,62,23,0.05)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 6, background: row.best ? SAGE : "rgba(10,31,16,0.04)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontFamily: MONO, fontSize: 9, color: row.best ? FOREST : "rgba(10,31,16,0.30)", fontWeight: row.best ? 600 : 400 }}>{row.i}</span>
                          </div>
                          <span style={{ color: row.best ? DARK : "rgba(10,31,16,0.50)", fontSize: 14, fontWeight: row.best ? 500 : 400 }}>{row.name}</span>
                        </div>
                        <span style={{ fontFamily: MONO, fontSize: 13, color: row.best ? FOREST : "rgba(10,31,16,0.30)", fontWeight: row.best ? 500 : 400 }}>{row.price}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{
                    marginTop: 20, padding: "14px 20px", borderRadius: 12,
                    background: FOREST, color: WHITE,
                    display: "flex", alignItems: "center", gap: 10,
                  }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8.5L6.5 11L12 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>Miglior rapporto copertura/prezzo per il tuo profilo</span>
                  </div>
                </div>

                <div style={{
                  position: "absolute", bottom: -20, left: -20,
                  background: WHITE, borderRadius: 16, padding: "18px 22px",
                  boxShadow: "0 8px 32px rgba(10,31,16,0.08)",
                  display: "flex", alignItems: "center", gap: 14,
                  animation: "lg10-float 3s ease-in-out infinite",
                  border: "1px solid rgba(15,62,23,0.06)",
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: SAGE, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M5 9L8 12L13 6.5" stroke={FOREST} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div>
                    <p style={{ fontFamily: MONO, fontSize: 10, color: "rgba(10,31,16,0.40)", letterSpacing: "0.08em" }}>EMISSIONE</p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: FOREST }}>&lt; 24 ore</p>
                  </div>
                </div>

                <div style={{
                  position: "absolute", top: -16, right: -16,
                  background: WHITE, borderRadius: 12, padding: "12px 16px",
                  boxShadow: "0 4px 20px rgba(10,31,16,0.08)",
                  border: "1px solid rgba(15,62,23,0.06)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2d8a3e" }} />
                    <span style={{ fontFamily: MONO, fontSize: 10, color: "rgba(10,31,16,0.50)", letterSpacing: "0.06em" }}>Aggiornato in tempo reale</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Stats ribbon ─────────────────────────────────────────────── */}
          <div style={{
            borderTop: "1px solid rgba(15,62,23,0.06)",
            padding: "0 32px",
            marginTop: 48,
          }}>
            <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0 }} className="lg10-stats-row">
              {[
                { n: "5+", label: "Compagnie confrontate" },
                { n: "2 min", label: "Per un preventivo" },
                { n: "< 24h", label: "Alla polizza attiva" },
                { n: "100%", label: "Digitale" },
              ].map((s, i) => (
                <div key={s.label} style={{
                  padding: "40px 32px",
                  borderLeft: i > 0 ? "1px solid rgba(15,62,23,0.06)" : "none",
                }}>
                  <p style={{ fontFamily: MONO, fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 300, lineHeight: 1, color: FOREST, marginBottom: 8, letterSpacing: "-0.04em" }}>{s.n}</p>
                  <p style={{ fontFamily: MONO, fontSize: 10, color: "rgba(10,31,16,0.40)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── MARQUEE (COMPANIES) ──────────────────────────────────────────── */}
        <section style={{ background: CREAM, borderTop: `1px solid rgba(15,62,23,0.06)`, borderBottom: `1px solid rgba(15,62,23,0.06)`, padding: "24px 0", overflow: "hidden" }}>
          <p style={{ fontFamily: MONO, fontSize: 10, color: "rgba(10,31,16,0.28)", letterSpacing: "0.16em", textTransform: "uppercase", textAlign: "center", marginBottom: 16 }}>
            Confrontiamo le principali compagnie assicurative
          </p>
          <div style={{ display: "flex", width: "max-content", animation: "lg10-marquee 20s linear infinite" }}>
            {[...COMPANIES].map((c, i) => (
              <span key={i} style={{ fontFamily: SANS, fontSize: 18, fontWeight: 600, color: "rgba(15,62,23,0.18)", padding: "0 48px", whiteSpace: "nowrap", letterSpacing: "-0.01em" }}>
                {c}
              </span>
            ))}
          </div>
        </section>

        {/* ── TRUST / REGULATION ───────────────────────────────────────────── */}
        <section data-section="trust" style={{ background: CREAM, padding: "80px 32px" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", ...st("trust") }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }} className="lg10-trust-grid">
              <div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: SAGE, padding: "6px 16px", borderRadius: 100, marginBottom: 24,
                }}>
                  <span style={{ fontFamily: MONO, fontSize: 10, color: FOREST, letterSpacing: "0.10em", textTransform: "uppercase", fontWeight: 500 }}>
                    Regolamentazione e standard
                  </span>
                </div>
                <h2 style={{ fontFamily: SERIF, fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.02em", color: DARK, marginBottom: 20 }}>
                  Sicurezza e trasparenza su cui contare.
                </h2>
                <p style={{ fontSize: "1.05rem", lineHeight: 1.65, color: "rgba(10,31,16,0.55)", maxWidth: "42ch" }}>
                  Operiamo nel pieno rispetto della normativa assicurativa italiana, con la supervisione diretta di IVASS.
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {TRUST_ITEMS.map((item, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "flex-start", gap: 16,
                    padding: "20px 24px", borderRadius: 14,
                    background: WHITE,
                    border: "1px solid rgba(15,62,23,0.06)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: SAGE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8.5L6.5 11L12 5.5" stroke={FOREST} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <p style={{ fontSize: 15, lineHeight: 1.5, color: DARK }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── PRODUCTS ─────────────────────────────────────────────────────── */}
        <section data-section="products" style={{ background: WHITE, padding: "100px 32px" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", ...st("products") }}>
            <div style={{ maxWidth: "42ch", marginBottom: 64 }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: SAGE, padding: "6px 16px", borderRadius: 100, marginBottom: 24,
              }}>
                <span style={{ fontFamily: MONO, fontSize: 10, color: FOREST, letterSpacing: "0.10em", textTransform: "uppercase", fontWeight: 500 }}>
                  Le nostre coperture
                </span>
              </div>
<h2 style={{ fontFamily: SERIF, fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.02em", color: DARK, marginBottom: 20 }}>
                  Polizze pensate per chi fa sul serio.
              </h2>
              <p style={{ fontSize: "1.05rem", lineHeight: 1.65, color: "rgba(10,31,16,0.55)" }}>
                Ogni professionista ha un rischio differente. Noi lo identifichiamo, lo confrontiamo e ti proponiamo la copertura più adatta.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1em" }}>
              {PRODUCTS.map((p, i) => (
                <div key={p.title} style={{
                  background: i === 0 ? "#b1dbb8" : i === 1 ? "#cfe7d3" : "#e1f4df", borderRadius: 16, padding: 40,
                  display: "flex", flexDirection: "column",
                  transition: "transform 0.3s, box-shadow 0.3s",
                }}>
                  <div style={{ marginBottom: 24 }}>
                    <span style={{ fontFamily: MONO, fontSize: 10, color: p.accent, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500 }}>
                      {p.tag}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "clamp(1.4rem, 2vw, 1.7rem)", fontWeight: 500, lineHeight: 1.2, color: DARK, marginBottom: 12, letterSpacing: "-0.01em" }}>
                    {p.title}
                  </h3>
                  <p style={{ fontSize: 14, lineHeight: 1.65, color: "rgba(10,31,16,0.50)", marginBottom: 28, flexGrow: 1 }}>
                    {p.desc}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {p.features.map(f => (
                      <div key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7L6 10L11 4.5" stroke={p.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        <span style={{ fontSize: 13, color: "rgba(10,31,16,0.60)" }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── EDITORIAL IMAGE BREAK ────────────────────────────────────────── */}
        <div data-section="image" style={{ position: "relative", width: "100%", height: "56vh", overflow: "hidden" }}>
          <Image src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1800&q=80" alt="" fill className="object-cover" />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(10,31,16,0.20) 0%, rgba(10,31,16,0.50) 100%)" }} />
          <div style={{ position: "absolute", bottom: 80, left: 32, right: 32, maxWidth: 1280, margin: "0 auto" }}>
            <p style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.45)", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 16 }}>
              Per i professionisti che non lasciano nulla al caso
            </p>
            <h2 style={{ fontFamily: SERIF, fontSize: "clamp(1.8rem, 3.5vw, 3rem)", fontWeight: 400, lineHeight: 1.12, letterSpacing: "-0.02em", color: WHITE, maxWidth: "24ch" }}>
              Coperture su misura per ogni professione.
            </h2>
          </div>
        </div>

        {/* ── PROFESSIONAL PROFILES ────────────────────────────────────────── */}
        <section data-section="profiles" style={{ background: SAGE, padding: "100px 32px" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", ...st("profiles") }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 56, flexWrap: "wrap", gap: 24 }}>
              <div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "rgba(15,62,23,0.10)", padding: "6px 16px", borderRadius: 100, marginBottom: 24,
                }}>
                  <span style={{ fontFamily: MONO, fontSize: 10, color: FOREST, letterSpacing: "0.10em", textTransform: "uppercase", fontWeight: 500 }}>
                    Per chi è
                  </span>
                </div>
                <h2 style={{ fontFamily: SERIF, fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.02em", color: DARK }}>
                  Il tuo mestiere, la tua polizza.
                </h2>
              </div>
              <Link href="/app" style={{ fontFamily: MONO, fontSize: 12, color: FOREST, letterSpacing: "0.06em", borderBottom: "2px solid currentColor", paddingBottom: 2, textDecoration: "none" }}>
                Scopri il tuo profilo →
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
              {PROFILES.map(pr => (
                <div key={pr.cat} style={{
                  background: WHITE, borderRadius: 16, padding: "32px 28px",
                  display: "flex", flexDirection: "column", gap: 20,
                  border: "1px solid rgba(15,62,23,0.06)",
                }}>
                  <div>
                    <p style={{ fontFamily: MONO, fontSize: 10, color: pr.accent, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8, fontWeight: 500 }}>{pr.label}</p>
                    <h3 style={{ fontSize: 20, fontWeight: 500, lineHeight: 1.2, color: DARK }}>{pr.cat}</h3>
                  </div>
                  <ul style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                    {pr.items.map(item => (
                      <li key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 20, height: 20, borderRadius: 6, background: `${pr.accent}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2.5 5L4 6.5L7.5 3" stroke={pr.accent} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                        <span style={{ fontSize: 14, lineHeight: 1.4, color: "rgba(10,31,16,0.60)" }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS — PROCESS ───────────────────────────────────────── */}
        <section data-section="process" style={{ background: WHITE, padding: "100px 32px", color: DARK }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", ...st("process") }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }} className="lg10-process-grid">
              <div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: SAGE, padding: "6px 16px", borderRadius: 100, marginBottom: 24,
                }}>
                  <span style={{ fontFamily: MONO, fontSize: 10, color: FOREST, letterSpacing: "0.10em", textTransform: "uppercase", fontWeight: 500 }}>
                    Il nostro processo
                  </span>
                </div>
                <h2 style={{ fontFamily: SERIF, fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 20, color: DARK }}>
                  Dal rischio alla copertura. In quattro passi.
                </h2>
                <p style={{ fontSize: "1.05rem", lineHeight: 1.65, color: "rgba(10,31,16,0.55)", maxWidth: "36ch" }}>
                  Nessuna complicazione inutile. Identifichiamo il tuo profilo, confrontiamo le offerte e ti proteggiamo — tutto in meno di 24 ore.
                </p>
              </div>
              <div>
                {STEPS.map((s, i) => (
                  <div key={s.n} style={{
                    padding: "32px 0",
                    borderTop: "1px solid rgba(15,62,23,0.08)",
                    display: "flex", gap: 24,
                  }}>
                    <div style={{ width: 56, height: 56, borderRadius: 14, background: SAGE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontFamily: MONO, fontSize: 16, color: FOREST, fontWeight: 500 }}>{s.n}</span>
                    </div>
                    <div style={{ paddingTop: 4 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 500, marginBottom: 8, color: DARK }}>{s.title}</h3>
                      <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(10,31,16,0.50)" }}>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
        <section data-section="testimonials" style={{ background: WHITE, padding: "100px 32px" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", ...st("testimonials") }}>
            <div style={{ maxWidth: "40ch", marginBottom: 56 }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: SAGE, padding: "6px 16px", borderRadius: 100, marginBottom: 24,
              }}>
                <span style={{ fontFamily: MONO, fontSize: 10, color: FOREST, letterSpacing: "0.10em", textTransform: "uppercase", fontWeight: 500 }}>
                  Testimonianze
                </span>
              </div>
<h2 style={{ fontFamily: SERIF, fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.02em", color: DARK }}>
                  Professionisti che hanno scelto la semplicità.
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
              {TESTIMONIALS.map((tm, i) => (
                <div key={i} style={{
                  background: CREAM, borderRadius: 16, padding: "36px 32px",
                  display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 32,
                  minHeight: 280, border: "1px solid rgba(15,62,23,0.06)",
                }}>
                  <div>
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ marginBottom: 20 }}>
                      <path d="M10 20H4V14C4 8 8 4 14 4V8C10 8 8 10 8 14V16H10V20ZM22 20H16V14C16 8 20 4 26 4V8C22 8 20 10 20 14V16H22V20Z" fill={SAGE_DARK} opacity="0.6"/>
                    </svg>
                    <p style={{ fontSize: "1.05rem", lineHeight: 1.6, color: DARK, fontStyle: "italic" }}>
                      &ldquo;{tm.quote}&rdquo;
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: DARK }}>{tm.name}</p>
                    <p style={{ fontFamily: MONO, fontSize: 11, color: "rgba(10,31,16,0.40)", marginTop: 4, letterSpacing: "0.06em" }}>{tm.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────────────────────────── */}
        <section data-section="faq" style={{ background: CREAM, padding: "100px 32px" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", ...st("faq") }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 64, alignItems: "start" }}>
              <div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: SAGE, padding: "6px 16px", borderRadius: 100, marginBottom: 24,
                }}>
                  <span style={{ fontFamily: MONO, fontSize: 10, color: FOREST, letterSpacing: "0.10em", textTransform: "uppercase", fontWeight: 500 }}>
                    FAQ
                  </span>
                </div>
                <h2 style={{ fontFamily: SERIF, fontSize: "clamp(2rem, 3vw, 2.8rem)", fontWeight: 400, lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: 20, color: DARK }}>
                  Domande frequenti.
                </h2>
                <p style={{ fontSize: 15, color: "rgba(10,31,16,0.45)", lineHeight: 1.7, maxWidth: "30ch" }}>
                  Non trovi risposta?{" "}
                  <span style={{ borderBottom: "2px solid currentColor", cursor: "pointer", color: FOREST }}>Scrivici →</span>
                </p>
              </div>
              <div>
                {FAQS.map((faq, i) => (
                  <div key={i} style={{ borderBottom: "1px solid rgba(15,62,23,0.08)" }}>
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 0", background: "none", border: "none", cursor: "pointer", color: DARK, gap: 16, textAlign: "left" }}
                    >
                      <span style={{ fontSize: 16, fontWeight: 400 }}>{faq.q}</span>
                      <span style={{
                        fontFamily: MONO, fontSize: 20, color: "rgba(10,31,16,0.25)", flexShrink: 0,
                        transform: openFaq === i ? "rotate(45deg)" : "none", transition: "transform 0.25s ease",
                        width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center",
                        borderRadius: "50%", background: openFaq === i ? SAGE : "transparent",
                      }}>+</span>
                    </button>
                    <div style={{ maxHeight: openFaq === i ? 220 : 0, overflow: "hidden", transition: "max-height 0.35s ease" }}>
                      <p style={{ fontSize: 14, lineHeight: 1.75, color: "rgba(10,31,16,0.50)", paddingBottom: 24, maxWidth: "50ch" }}>{faq.a}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        <section data-section="cta" style={{ background: SAGE, padding: "120px 32px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-30%", right: "-15%", width: "45vw", height: "45vw", borderRadius: "50%", background: "rgba(15,62,23,0.04)", pointerEvents: "none" }} />
          <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 1, textAlign: "center", ...st("cta") }}>
            <h2 style={{ fontFamily: SERIF, fontSize: "clamp(2.4rem, 5vw, 4.2rem)", fontWeight: 400, lineHeight: 1.08, letterSpacing: "-0.02em", color: DARK, marginBottom: 28 }}>
              Proteggi il tuo lavoro.<br /><strong style={{ fontWeight: 600, color: FOREST }}>Senza sorprese.</strong>
            </h2>
            <p style={{ fontSize: "1.1rem", lineHeight: 1.6, color: "rgba(10,31,16,0.55)", maxWidth: "44ch", margin: "0 auto 44px" }}>
              Il confronto migliore, la copertura più adatta, l'emissione più veloce.
              In meno di 24 ore.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
              <Link href="/app" style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                background: FOREST, color: WHITE,
                fontFamily: SANS, fontSize: 16, fontWeight: 600,
                padding: "18px 36px", borderRadius: 100,
                textDecoration: "none",
                transition: "transform 0.2s, box-shadow 0.2s",
                boxShadow: "0 4px 20px rgba(15,62,23,0.20)",
              }}>
                Calcola il preventivo
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 9H14M14 9L10 5M14 9L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
              <Link href="/app" style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                background: WHITE, color: DARK,
                fontFamily: SANS, fontSize: 16, fontWeight: 500,
                padding: "18px 36px", borderRadius: 100,
                border: "1px solid rgba(15,62,23,0.12)",
                textDecoration: "none",
              }}>
                Scopri come funziona
              </Link>
            </div>
          </div>
        </section>

        {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
        <footer style={{ background: DARK, borderTop: "1px solid rgba(255,255,255,0.06)", padding: "80px 32px 40px", color: WHITE }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 64 }} className="lg10-footer-grid">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: SAGE, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L13 7L7 13L1 7L7 1Z" stroke={FOREST} strokeWidth="1.5" strokeLinejoin="round"/></svg>
                  </div>
                  <span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 600, color: WHITE }}>ScelgoSicuro</span>
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.40)", maxWidth: "32ch" }}>
                  Intermediario assicurativo iscritto al R.U.I. presso IVASS. Confrontiamo le migliori compagnie per proteggere il lavoro dei professionisti italiani.
                </p>
              </div>
              <div>
                <p style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20 }}>Coperture</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {["RC Professionale", "Colpa Grave", "Tutela Legale", "Retroattività"].map(l => (
                    <span key={l} style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", cursor: "pointer", transition: "color 0.2s" }}>{l}</span>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20 }}>Professioni</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {["Medici & Sanitari", "Avvocati & Legali", "Ingegneri & Architetti", "Commercialisti"].map(l => (
                    <span key={l} style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", cursor: "pointer", transition: "color 0.2s" }}>{l}</span>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20 }}>Azienda</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {["Chi siamo", "Privacy Policy", "Termini", "Contatti"].map(l => (
                    <span key={l} style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", cursor: "pointer", transition: "color 0.2s" }}>{l}</span>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <p style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.20)", letterSpacing: "0.06em" }}>© 2025 ScelgoSicuro Srl. Tutti i diritti riservati.</p>
              <p style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.20)", letterSpacing: "0.06em" }}>Regolato da IVASS — D.Lgs. 209/2005</p>
            </div>
          </div>
        </footer>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .lg10-hero-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .lg10-stats-row {
            grid-template-columns: 1fr 1fr !important;
            gap: 24px !important;
          }
          .lg10-stats-row > div {
            border-left: none !important;
            padding: 20px 0 !important;
          }
          .lg10-trust-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .lg10-process-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .lg10-footer-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </>
  )
}