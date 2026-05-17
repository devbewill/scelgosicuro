"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { LandingNav } from "@/components/landing-nav"

const MIDNIGHT = "#0A1628"
const INDIGO = "#1D4ED8"
const LAVENDER = "#3B82F6"
const MINT = "#E8F8E2"
const MINT_ACCENT = "#56D44F"
const WARM_WHITE = "#FEFCF9"
const SOFT_GRAY = "#F3F1EC"
const TEXT = "#1A2332"
const TEXT_MUTED = "#6B7B8D"
const CARD_BG = "#FFFFFF"
const CARD_BORDER = "rgba(29,78,216,0.08)"
const TAG_BG = "rgba(59,130,246,0.10)"

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
]

const ATTIVITA = [
  "Studio individuale",
  "Studio associato",
  "Società professionale",
  "Libero professionista",
]

const MASSIMALI = [
  "€250.000",
  "€500.000",
  "€1.000.000",
  "€2.000.000",
  "€5.000.000",
]

const FRANCHIGIE = [
  "Nessuna franchigia",
  "€500",
  "€1.000",
  "€2.500",
  "€5.000",
]

const COMPANIES = ["AXA", "Generali", "UnipolSai", "Allianz", "HDI", "AmTrust"]

const BENTO_ITEMS = [
  { tag: "Confronto intelligente", title: "5 compagnie, un unico risultato", desc: "Il motore confronta tariffe reali e ordina le proposte per coerenza con il tuo profilo di rischio.", accent: INDIGO, span: 2 },
  { tag: "Coperture", title: "RC Professionale", desc: "Massimali fino a €5M, retroattività estesa, colpa grave inclusa.", accent: MINT_ACCENT, span: 1 },
  { tag: "Tutela", title: "Colpa Grave & Legale", desc: "Copertura delle responsabilità più gravi e integrale tutela processuale.", accent: LAVENDER, span: 1 },
]

const PROFILES = [
  { name: "Medici & Sanitari", count: "500+", items: ["RC colpa grave inclusa", "Retroattività 10 anni", "Massimali fino a €5M"], accent: INDIGO },
  { name: "Avvocati & Legali", count: "120+", items: ["Errori e omissioni", "Mancato rispetto termini", "Collaboratori inclusi"], accent: LAVENDER },
  { name: "Ingegneri & Architetti", count: "200+", items: ["RC progettazione", "Direzione lavori", "Cantiere incluso"], accent: MINT_ACCENT },
  { name: "Commercialisti", count: "300+", items: ["Consulenza fiscale", "Negligenza professionale", "Studio associato coperto"], accent: INDIGO },
]

const STEPS = [
  { n: "01", title: "Identifica", desc: "Seleziona il tuo profilo. Poche domande, niente questionario infinito." },
  { n: "02", title: "Confronta", desc: "Il motore analizza offerte reali e le ordina per coerenza con il tuo rischio." },
  { n: "03", title: "Scegli", desc: "Una proposta consigliata più tutte le alternative. Tutto spiegato in chiaro." },
  { n: "04", title: "Proteggi", desc: "Polizza attiva in meno di 24 ore. Zero agenzie, zero sorprese." },
]

const FAQS = [
  { q: "Il preventivo è gratuito?", a: "Sì, sempre. Nessun costo nascosto, nessun obbligo." },
  { q: "Come viene scelta la polizza consigliata?", a: "Il sistema analizza il tuo profilo, i rischi tipici della professione e le coperture disponibili — non solo il prezzo." },
  { q: "Posso vedere le alternative?", a: "Sempre. Proposta consigliata + tutte le alternative con confronto dettagliato." },
  { q: "Quanto tempo per la polizza attiva?", a: "Meno di 24 ore nella maggior parte dei casi. Tutto digitale." },
]

export default function Landing8() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [professione, setProfessione] = useState("")
  const [attivita, setAttivita] = useState("")
  const [massimale, setMassimale] = useState("")
  const [franchigia, setFranchigia] = useState("")
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
      { threshold: 0.12 }
    )
    const sections = document.querySelectorAll("[data-section]")
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  const vis = (id: string) => visibleSections.has(id)
  const fadeUp: React.CSSProperties = { opacity: 0, transform: "translateY(24px)", transition: "opacity 0.7s ease, transform 0.7s ease" }
  const fadeUpVisible: React.CSSProperties = { opacity: 1, transform: "translateY(0)", transition: "opacity 0.7s ease, transform 0.7s ease" }
  const st = (id: string): React.CSSProperties => vis(id) ? fadeUpVisible : fadeUp

  const allFilled = professione && attivita && massimale && franchigia

  return (
    <div style={{ background: WARM_WHITE, color: TEXT }}>
      {/* ── NAVBAR ── */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: "rgba(254,252,249,0.92)", backdropFilter: "blur(16px)", borderBottom: `1px solid ${CARD_BORDER}` }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 32px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: INDIGO, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L13 7L7 13L1 7L7 1Z" fill="white" opacity="0.9"/></svg>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: TEXT, letterSpacing: "-0.02em" }}>ScelgoSicuro</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <LandingNav current="8" variant="light" />
            <Link href="/app" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: INDIGO, color: "white", fontSize: 13, fontWeight: 600, padding: "10px 22px", borderRadius: 100, textDecoration: "none" }}>
              Preventivo gratuito
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7H11M11 7L8 4M11 7L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight: "100svh", background: WARM_WHITE, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0", position: "relative", overflow: "hidden" }}>
        {/* Full-bleed photo background with overlay */}
        <div style={{ position: "absolute", inset: 0 }}>
          <Image src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1800&q=80" alt="" fill style={{ objectFit: "cover", objectPosition: "center 40%" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(254,252,249,0.95) 0%, rgba(254,252,249,0.85) 45%, rgba(10,22,40,0.70) 100%)" }} />
        </div>

        {/* Decorative: large circle */}
        <div style={{ position: "absolute", top: "-10%", right: "-5%", width: "55vw", height: "55vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(29,78,216,0.05) 0%, transparent 60%)", pointerEvents: "none" }} />
        {/* Decorative: grid dots */}
        <div style={{ position: "absolute", top: "28%", right: "18%", opacity: 0.06, pointerEvents: "none" }} className="lg8-hero-dots">
          {[0,1,2,3,4,5].map(r => [0,1,2,3,4,5].map(c => (
            <div key={`hd-${r}-${c}`} style={{ position: "absolute", top: r * 16, left: c * 16, width: 3, height: 3, borderRadius: "50%", background: INDIGO }} />
          )))}
        </div>
        {/* Decorative: floating ring */}
        <div style={{ position: "absolute", top: "22%", right: "12%", width: 140, height: 140, borderRadius: "50%", border: `1.5px solid rgba(29,78,216,0.08)`, pointerEvents: "none" }} className="lg8-hero-ring" />
        <div style={{ position: "absolute", top: "25%", right: "14%", width: 60, height: 60, borderRadius: "50%", border: `1px solid rgba(29,78,216,0.06)`, pointerEvents: "none" }} className="lg8-hero-ring-sm" />
        {/* Decorative: accent vertical bar */}
        <div style={{ position: "absolute", bottom: "15%", right: "6%", width: 3, height: 100, borderRadius: 2, background: `linear-gradient(to bottom, ${INDIGO}, transparent)`, opacity: 0.10, pointerEvents: "none" }} />
        {/* Decorative: rotated square */}
        <div style={{ position: "absolute", bottom: "30%", right: "22%", width: 36, height: 36, borderRadius: 6, border: `1.5px solid rgba(29,78,216,0.07)`, transform: "rotate(25deg)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1320, margin: "0 auto", width: "100%", padding: "120px 32px 80px", position: "relative", zIndex: 1, flex: 1, display: "flex", alignItems: "center" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }} className="lg8-hero-grid">
            {/* LEFT: text + CTA */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: INDIGO }} />
                <p style={{ fontFamily: "monospace", fontSize: 11, color: LAVENDER, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600 }}>
                  Intermediario RUI — IVASS
                </p>
              </div>
              <h1 style={{ fontSize: "clamp(2.8rem, 6vw, 5rem)", fontWeight: 700, lineHeight: 1.04, letterSpacing: "-0.04em", color: TEXT, marginBottom: 28, maxWidth: "18ch" }}>
                La tua RC professionale
                <br />
                <span style={{ color: INDIGO }}>confrontata,</span>
                <br />
                non subita.
              </h1>
              <p style={{ fontSize: "1.1rem", lineHeight: 1.7, color: TEXT_MUTED, maxWidth: "44ch", marginBottom: 40 }}>
                5 compagnie, tariffe reali, una proposta su misura. Senza agenzie, senza sorprese.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <Link href="/app" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: INDIGO, color: "white", fontSize: 15, fontWeight: 600, padding: "16px 32px", borderRadius: 100, textDecoration: "none" }}>
                  Calcola il preventivo
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M13 8L9 4.5M13 8L9 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
                <span style={{ fontSize: 13, color: TEXT_MUTED }}>Gratuito · 2 min · Nessun impegno</span>
              </div>
            </div>

            {/* RIGHT: visual composition — floating cards with stats */}
            <div style={{ position: "relative" }} className="lg8-hero-visual">
              {/* Main card */}
              <div style={{
                background: "rgba(255,255,255,0.92)", backdropFilter: "blur(20px)",
                borderRadius: 24, padding: 32, overflow: "hidden",
                border: "1px solid rgba(29,78,216,0.08)",
                boxShadow: "0 20px 60px rgba(10,22,40,0.12)",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: INDIGO, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2L16 9L9 16L2 9L9 2Z" fill="white" opacity="0.9"/></svg>
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>Analisi completata</p>
                      <p style={{ fontFamily: "monospace", fontSize: 10, color: TEXT_MUTED, letterSpacing: "0.06em" }}>PROFILO — MEDICO CHIRURGO</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: MINT_ACCENT }} />
                    <span style={{ fontFamily: "monospace", fontSize: 9, color: TEXT_MUTED, letterSpacing: "0.06em" }}>Live</span>
                  </div>
                </div>

                {/* Comparison rows */}
                <div style={{ borderTop: "1px solid rgba(29,78,216,0.06)", paddingTop: 20 }}>
                  <p style={{ fontFamily: "monospace", fontSize: 9, color: TEXT_MUTED, letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 14 }}>Preventivo consigliato</p>
                  {[
                    { name: "AXA — RC Professionale", price: "€680/anno", pct: 93 },
                    { name: "Generali — RC Medici", price: "€740/anno", pct: 76 },
                    { name: "AmTrust — Colpa Grave", price: "€820/anno", pct: 61 },
                  ].map((row, i) => (
                    <div key={i} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 24, height: 24, borderRadius: 6, background: i === 0 ? "rgba(29,78,216,0.10)" : "rgba(29,78,216,0.03)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontFamily: "monospace", fontSize: 9, color: i === 0 ? INDIGO : "rgba(29,78,216,0.25)", fontWeight: i === 0 ? 700 : 400 }}>{i + 1}</span>
                          </div>
                          <span style={{ color: i === 0 ? TEXT : TEXT_MUTED, fontSize: 13, fontWeight: i === 0 ? 500 : 400 }}>{row.name}</span>
                        </div>
                        <span style={{ fontFamily: "monospace", fontSize: 12, color: i === 0 ? INDIGO : TEXT_MUTED, fontWeight: i === 0 ? 600 : 400 }}>{row.price}</span>
                      </div>
                      <div style={{ height: 3, borderRadius: 2, background: "rgba(29,78,216,0.06)", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${row.pct}%`, borderRadius: 2, background: i === 0 ? INDIGO : "rgba(29,78,216,0.15)" }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 12, background: "rgba(29,78,216,0.04)", border: "1px solid rgba(29,78,216,0.08)", display: "flex", alignItems: "center", gap: 10 }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7.5L5.5 10L11 4.5" stroke={INDIGO} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span style={{ fontSize: 12, fontWeight: 500, color: TEXT }}>Miglior rapporto copertura/prezzo</span>
                </div>
              </div>

              {/* Floating stats card — bottom left */}
              <div style={{
                position: "absolute", bottom: -20, left: -28,
                background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)",
                borderRadius: 16, padding: "18px 22px",
                boxShadow: "0 8px 32px rgba(10,22,40,0.10)",
                border: "1px solid rgba(29,78,216,0.06)",
                display: "flex", alignItems: "center", gap: 14,
              }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: INDIGO, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8.5L6.5 11L12 5.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div>
                  <p style={{ fontFamily: "monospace", fontSize: 9, color: TEXT_MUTED, letterSpacing: "0.08em" }}>EMISSIONE</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>&lt; 24 ore</p>
                </div>
              </div>

              {/* Floating accent — top right */}
              <div style={{
                position: "absolute", top: -14, right: -14,
                background: MINT, borderRadius: 12, padding: "10px 16px",
                boxShadow: "0 4px 20px rgba(86,212,79,0.15)",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: MIDNIGHT }}>5+</span>
                <span style={{ fontSize: 11, color: "rgba(10,22,40,0.60)" }}>compagnie</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── NL FORM — big sentence on white ── */}
      <section style={{ background: "white", borderTop: `1px solid ${CARD_BORDER}`, borderBottom: `1px solid ${CARD_BORDER}`, padding: "80px 32px", position: "relative", overflow: "hidden" }}>
        {/* Decorative: rotated accent square */}
        <div style={{ position: "absolute", top: 32, right: "6%", width: 48, height: 48, borderRadius: 10, border: `2px solid rgba(29,78,216,0.08)`, transform: "rotate(15deg)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 40, left: "4%", width: 32, height: 32, borderRadius: "50%", background: "rgba(59,130,246,0.06)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <p style={{ fontFamily: "monospace", fontSize: 11, color: INDIGO, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 16, fontWeight: 600 }}>
            Trova la tua polizza
          </p>
          <h2 style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.5rem)", fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.04em", color: TEXT, marginBottom: 48, maxWidth: "18ch" }}>
            Il prodotto su misura per la tua professione.
          </h2>
          <p style={{
            fontSize: "clamp(1.6rem, 3.5vw, 2.8rem)",
            fontWeight: 300,
            lineHeight: 1.55,
            color: TEXT_MUTED,
            letterSpacing: "-0.03em",
            textAlign: "left",
          }}>
            Sono{" "}
            <select
              value={professione}
              onChange={(e) => setProfessione(e.target.value)}
              style={{
                appearance: "none",
                background: professione ? "rgba(29,78,216,0.06)" : "transparent",
                border: "none",
                borderBottom: professione ? `2px solid ${INDIGO}` : `1.5px solid rgba(29,78,216,0.30)`,
                color: professione ? INDIGO : "rgba(29,78,216,0.40)",
                fontSize: "clamp(1.6rem, 3.5vw, 2.8rem)",
                fontFamily: "inherit",
                fontWeight: 400,
                padding: "3px 10px",
                borderRadius: 0,
                cursor: "pointer",
                outline: "none",
                transition: "all 0.3s ease",
                display: "inline-block",
                minWidth: 155,
              }}
            >
              <option value="" disabled style={{ background: "white", color: TEXT_MUTED }}>professione</option>
              {PROFESSIONI.map((p) => <option key={p} value={p} style={{ background: "white", color: TEXT }}>{p}</option>)}
            </select>
            {" "}e lavoro come{" "}
            <select
              value={attivita}
              onChange={(e) => setAttivita(e.target.value)}
              style={{
                appearance: "none",
                background: attivita ? "rgba(29,78,216,0.06)" : "transparent",
                border: "none",
                borderBottom: attivita ? `2px solid ${INDIGO}` : `1.5px solid rgba(29,78,216,0.30)`,
                color: attivita ? INDIGO : "rgba(29,78,216,0.40)",
                fontSize: "clamp(1.6rem, 3.5vw, 2.8rem)",
                fontFamily: "inherit",
                fontWeight: 400,
                padding: "3px 10px",
                borderRadius: 0,
                cursor: "pointer",
                outline: "none",
                transition: "all 0.3s ease",
                display: "inline-block",
                minWidth: 165,
              }}
            >
              <option value="" disabled style={{ background: "white", color: TEXT_MUTED }}>attività</option>
              {ATTIVITA.map((a) => <option key={a} value={a} style={{ background: "white", color: TEXT }}>{a}</option>)}
            </select>
            {" cerco una RC con massimale "}
            <select
              value={massimale}
              onChange={(e) => setMassimale(e.target.value)}
              style={{
                appearance: "none",
                background: massimale ? "rgba(29,78,216,0.06)" : "transparent",
                border: "none",
                borderBottom: massimale ? `2px solid ${INDIGO}` : `1.5px solid rgba(29,78,216,0.30)`,
                color: massimale ? INDIGO : "rgba(29,78,216,0.40)",
                fontSize: "clamp(1.6rem, 3.5vw, 2.8rem)",
                fontFamily: "inherit",
                fontWeight: 400,
                padding: "3px 10px",
                borderRadius: 0,
                cursor: "pointer",
                outline: "none",
                transition: "all 0.3s ease",
                display: "inline-block",
                minWidth: 155,
              }}
            >
              <option value="" disabled style={{ background: "white", color: TEXT_MUTED }}>massimale</option>
              {MASSIMALI.map((m) => <option key={m} value={m} style={{ background: "white", color: TEXT }}>{m}</option>)}
            </select>
            {" "}e franchigia{" "}
            <select
              value={franchigia}
              onChange={(e) => setFranchigia(e.target.value)}
              style={{
                appearance: "none",
                background: franchigia ? "rgba(29,78,216,0.06)" : "transparent",
                border: "none",
                borderBottom: franchigia ? `2px solid ${INDIGO}` : `1.5px solid rgba(29,78,216,0.30)`,
                color: franchigia ? INDIGO : "rgba(29,78,216,0.40)",
                fontSize: "clamp(1.6rem, 3.5vw, 2.8rem)",
                fontFamily: "inherit",
                fontWeight: 400,
                padding: "3px 10px",
                borderRadius: 0,
                cursor: "pointer",
                outline: "none",
                transition: "all 0.3s ease",
                display: "inline-block",
                minWidth: 175,
              }}
            >
              <option value="" disabled style={{ background: "white", color: TEXT_MUTED }}>franchigia</option>
              {FRANCHIGIE.map((f) => <option key={f} value={f} style={{ background: "white", color: TEXT }}>{f}</option>)}
            </select>
          </p>

          <div style={{ marginTop: 48 }}>
            <Link
              href={allFilled ? "/app" : "#"}
              onClick={(e) => { if (!allFilled) e.preventDefault() }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                background: allFilled ? INDIGO : "rgba(29,78,216,0.12)",
                color: allFilled ? "white" : "rgba(29,78,216,0.40)",
                fontSize: 15, fontWeight: 600,
                padding: "16px 36px", borderRadius: 100,
                textDecoration: "none",
                transition: "all 0.3s ease",
                cursor: allFilled ? "pointer" : "default",
              }}
            >
              Calcola il preventivo
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M13 8L9 4.5M13 8L9 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── COMPANIES ── */}
      <section style={{ background: WARM_WHITE, padding: "48px 32px" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontFamily: "monospace", fontSize: 10, color: TEXT_MUTED, letterSpacing: "0.20em", textTransform: "uppercase", marginBottom: 24 }}>
            Compagnie confrontate in tempo reale
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 48, flexWrap: "wrap", justifyContent: "center" }}>
            {COMPANIES.map((c) => (
              <span key={c} style={{ fontSize: 18, fontWeight: 700, color: "rgba(43,42,62,0.10)", letterSpacing: "-0.02em" }}>{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENTO FEATURES ── */}
      <section data-section="features" style={{ background: WARM_WHITE, padding: "100px 32px", position: "relative", overflow: "hidden" }}>
        {/* Decorative: large faded circle */}
        <div style={{ position: "absolute", top: "-10%", left: "-12%", width: "40vw", height: "40vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(29,78,216,0.03) 0%, transparent 65%)", pointerEvents: "none" }} />
        {/* Decorative: ring outline */}
        <div style={{ position: "absolute", bottom: "5%", right: "3%", width: 200, height: 200, borderRadius: "50%", border: `1.5px solid rgba(29,78,216,0.06)`, pointerEvents: "none" }} />

        <div style={{ maxWidth: 1320, margin: "0 auto", position: "relative", zIndex: 1, ...st("features") }}>
          <p style={{ fontFamily: "monospace", fontSize: 11, color: INDIGO, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 16, fontWeight: 600 }}>
            Le nostre coperture
          </p>
          <h2 style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.5rem)", fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.04em", color: TEXT, marginBottom: 56, maxWidth: "20ch" }}>
            Polizze pensate per chi fa sul serio.
          </h2>

          {/* Row 1: full-width long card */}
          <div style={{ background: "#DBEAFE", borderRadius: 24, padding: "44px 48px", marginBottom: 16, border: "1px solid rgba(29,78,216,0.10)" }}>
            <span style={{ display: "inline-block", background: TAG_BG, padding: "5px 12px", borderRadius: 100, fontFamily: "monospace", fontSize: 10, color: LAVENDER, letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 20, fontWeight: 500 }}>
              Confronto intelligente
            </span>
            <h3 style={{ fontSize: 28, fontWeight: 700, color: TEXT, marginBottom: 12, letterSpacing: "-0.02em" }}>5 compagnie, un unico risultato</h3>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: TEXT_MUTED, maxWidth: "52ch" }}>Il motore confronta tariffe reali e ordina le proposte per coerenza con il tuo profilo di rischio.</p>
            <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
              {[
                { l: "Massimali", v: "fino a €5M" },
                { l: "Copertura", v: "Immediata" },
                { l: "Franchigia", v: "Nessuna minima" },
              ].map((s) => (
                <div key={s.l} style={{ background: "rgba(29,78,216,0.06)", borderRadius: 12, padding: "16px 18px" }}>
                  <p style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(29,78,216,0.50)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>{s.l}</p>
                  <p style={{ fontSize: 15, fontWeight: 600, color: TEXT }}>{s.v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2: two cards side by side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="lg8-bento-row2">
            {/* RC Professionale card */}
            <div style={{
              background: "#EFF6FF", borderRadius: 24, padding: 40,
              display: "flex", flexDirection: "column", justifyContent: "flex-end",
              minHeight: 300,
              border: "1px solid rgba(29,78,216,0.08)",
            }}>
              <span style={{ display: "inline-block", background: TAG_BG, padding: "5px 12px", borderRadius: 100, fontFamily: "monospace", fontSize: 10, color: LAVENDER, letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 20, fontWeight: 500, alignSelf: "flex-start" }}>
                Coperture verificate
              </span>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: TEXT, marginBottom: 12, letterSpacing: "-0.02em" }}>RC Professionale</h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: TEXT_MUTED }}>Massimali fino a €5M, retroattività estesa, colpa grave inclusa per le professioni a rischio.</p>
            </div>

            {/* Colpa Grave & Legale card */}
            <div style={{
              background: "#E8F5E9", borderRadius: 24, padding: 40,
              display: "flex", flexDirection: "column", justifyContent: "flex-end",
              minHeight: 300,
              border: "1px solid rgba(86,212,79,0.12)",
            }}>
              <span style={{ display: "inline-block", background: "rgba(86,212,79,0.12)", padding: "5px 12px", borderRadius: 100, fontFamily: "monospace", fontSize: 10, color: MINT_ACCENT, letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 20, fontWeight: 500, alignSelf: "flex-start" }}>
                Tutela completa
              </span>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: TEXT, marginBottom: 12, letterSpacing: "-0.02em" }}>Colpa Grave & Legale</h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: TEXT_MUTED }}>Estensione alle responsabilità più gravi e copertura integrale delle spese legali e processuali.</p>

              <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { n: "93%", l: "trova la polizza giusta al primo tentativo" },
                  { n: "2 min", l: "per un preventivo completo" },
                  { n: "< 24h", l: "dalla scelta alla polizza attiva" },
                ].map((s) => (
                  <div key={s.n} style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                    <span style={{ fontSize: 22, fontWeight: 400, color: MIDNIGHT, letterSpacing: "-0.03em" }}>{s.n}</span>
                    <span style={{ fontSize: 12, color: "rgba(10,22,40,0.50)" }}>{s.l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── EDITORIAL IMAGE BREAK ── */}
      <div style={{ position: "relative", width: "100%", height: "45vh", overflow: "hidden" }}>
        <Image src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1800&q=80" alt="" fill style={{ objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(10,22,40,0.75) 0%, rgba(29,78,216,0.30) 100%)" }} />
        <div style={{ position: "absolute", bottom: 60, left: 32, right: 32, maxWidth: 1320, margin: "0 auto" }}>
          <p style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.45)", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 16 }}>
            Per i professionisti che non lasciano nulla al caso
          </p>
          <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 700, lineHeight: 1.12, letterSpacing: "-0.03em", color: "white", maxWidth: "24ch" }}>
            Coperture su misura per ogni professione.
          </h2>
        </div>
        {/* Decorative: corner ring */}
        <div style={{ position: "absolute", top: 40, right: 40, width: 60, height: 60, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.10)", pointerEvents: "none" }} />
      </div>

      {/* ── PROFILES ── */}
      <section data-section="profiles" style={{ background: "white", padding: "100px 32px", position: "relative", overflow: "hidden" }}>
        {/* Decorative: photo strip on the right side */}
        <div style={{ position: "absolute", top: "15%", right: "2%", width: 180, opacity: 0.08, pointerEvents: "none", display: "flex", flexDirection: "column", gap: 8 }} className="lg8-deco-photos">
          <Image src="https://images.unsplash.com/photo-1551076805-e1869033e561?w=200&q=60" alt="" width={180} height={140} style={{ borderRadius: 12, objectFit: "cover" }} />
          <Image src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=200&q=60" alt="" width={180} height={140} style={{ borderRadius: 12, objectFit: "cover" }} />
        </div>
        {/* Decorative: horizontal line */}
        <div style={{ position: "absolute", top: "50%", left: 0, width: "30%", height: 1, background: `linear-gradient(to right, rgba(29,78,216,0.06), transparent)`, pointerEvents: "none" }} />

        <div style={{ maxWidth: 1320, margin: "0 auto", position: "relative", zIndex: 1, ...st("profiles") }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 56, flexWrap: "wrap", gap: 24 }}>
            <div>
              <p style={{ fontFamily: "monospace", fontSize: 11, color: INDIGO, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 16, fontWeight: 600 }}>Per chi è</p>
              <h2 style={{ fontSize: "clamp(2.2rem, 4vw, 3.2rem)", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-0.04em", color: TEXT }}>
                Il tuo mestiere,<br />la tua polizza.
              </h2>
            </div>
            <Link href="/app" style={{ fontFamily: "monospace", fontSize: 12, color: INDIGO, borderBottom: `2px solid ${INDIGO}`, paddingBottom: 2, textDecoration: "none", fontWeight: 500 }}>
              Scopri il tuo profilo →
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {PROFILES.map((pr) => (
              <div key={pr.name} style={{
                background: WARM_WHITE, borderRadius: 20, padding: "32px 28px",
                display: "flex", flexDirection: "column", gap: 20,
                border: `1px solid ${CARD_BORDER}`,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: 4, background: pr.accent }} />
                <div>
                  <p style={{ fontFamily: "monospace", fontSize: 10, color: pr.accent, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6, fontWeight: 600 }}>{pr.count} profili</p>
                  <h3 style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.2, color: TEXT, letterSpacing: "-0.02em" }}>{pr.name}</h3>
                </div>
                <ul style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                  {pr.items.map((item) => (
                    <li key={item} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: TEXT_MUTED }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7L6 10L11 4.5" stroke={pr.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section data-section="process" style={{ background: WARM_WHITE, padding: "100px 32px", position: "relative", overflow: "hidden" }}>
        {/* Decorative: vertical dotted line */}
        <div style={{ position: "absolute", left: "48%", top: "10%", height: "80%", width: 1, borderLeft: "2px dashed rgba(29,78,216,0.06)", pointerEvents: "none" }} className="lg8-deco-line" />

        <div style={{ maxWidth: 1320, margin: "0 auto", position: "relative", zIndex: 1, ...st("process") }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }} className="lg8-process-grid">
            <div>
              <p style={{ fontFamily: "monospace", fontSize: 11, color: INDIGO, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 16, fontWeight: 600 }}>Il nostro processo</p>
              <h2 style={{ fontSize: "clamp(2.2rem, 4vw, 3.2rem)", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-0.04em", color: TEXT, marginBottom: 20 }}>
                Dal rischio alla copertura. In quattro passi.
              </h2>
              <p style={{ fontSize: "1.05rem", lineHeight: 1.72, color: TEXT_MUTED, maxWidth: "36ch" }}>
                Identifichiamo il tuo profilo, confrontiamo le offerte e ti proteggiamo — tutto in meno di 24 ore.
              </p>
            </div>
            <div>
              {STEPS.map((s) => (
                <div key={s.n} style={{ padding: "28px 0", borderTop: `1px solid ${CARD_BORDER}`, display: "flex", gap: 20 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: INDIGO, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontFamily: "monospace", fontSize: 14, color: "white", fontWeight: 600 }}>{s.n}</span>
                  </div>
                  <div style={{ paddingTop: 4 }}>
                    <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 6, color: TEXT, letterSpacing: "-0.01em" }}>{s.title}</h3>
                    <p style={{ fontSize: 14, lineHeight: 1.7, color: TEXT_MUTED }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section data-section="faq" style={{ background: "white", padding: "100px 32px", position: "relative", overflow: "hidden" }}>
        {/* Decorative: bottom-right photo */}
        <div style={{ position: "absolute", bottom: "5%", right: "3%", width: 220, opacity: 0.06, pointerEvents: "none", borderRadius: 20, overflow: "hidden" }} className="lg8-deco-photo">
          <Image src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=300&q=60" alt="" width={220} height={300} style={{ objectFit: "cover" }} />
        </div>

        <div style={{ maxWidth: 1320, margin: "0 auto", position: "relative", zIndex: 1, ...st("faq") }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 64, alignItems: "start" }}>
            <div>
              <p style={{ fontFamily: "monospace", fontSize: 11, color: INDIGO, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 16, fontWeight: 600 }}>FAQ</p>
              <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.8rem)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.04em", marginBottom: 20, color: TEXT }}>
                Domande frequenti.
              </h2>
              <p style={{ fontSize: 15, color: TEXT_MUTED, lineHeight: 1.7, maxWidth: "30ch" }}>
                Non trovi risposta?{" "}
                <span style={{ borderBottom: `2px solid ${INDIGO}`, cursor: "pointer", color: TEXT }}>Scrivici →</span>
              </p>
            </div>
            <div>
              {FAQS.map((faq, i) => (
                <div key={i} style={{ borderBottom: `1px solid ${CARD_BORDER}` }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 0", background: "none", border: "none", cursor: "pointer", color: TEXT, gap: 16, textAlign: "left" }}
                  >
                    <span style={{ fontSize: 16, fontWeight: 500 }}>{faq.q}</span>
                    <span style={{
                      fontFamily: "monospace", fontSize: 18, flexShrink: 0,
                      transform: openFaq === i ? "rotate(45deg)" : "none", transition: "transform 0.25s ease",
                      width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center",
                      borderRadius: "50%", background: openFaq === i ? INDIGO : "transparent",
                      color: openFaq === i ? "white" : TEXT_MUTED,
                    }}>+</span>
                  </button>
                  <div style={{ maxHeight: openFaq === i ? 220 : 0, overflow: "hidden", transition: "max-height 0.35s ease" }}>
                    <p style={{ fontSize: 14, lineHeight: 1.75, color: TEXT_MUTED, paddingBottom: 24, maxWidth: "50ch" }}>{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section data-section="cta" style={{ background: MIDNIGHT, padding: "120px 32px", position: "relative", overflow: "hidden", color: "white" }}>
        <div style={{ position: "absolute", top: "-30%", right: "-15%", width: "45vw", height: "45vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 60%)", pointerEvents: "none" }} />
        {/* Decorative: small ring */}
        <div style={{ position: "absolute", top: "15%", left: "5%", width: 80, height: 80, borderRadius: "50%", border: "1.5px solid rgba(59,130,246,0.10)", pointerEvents: "none" }} />
        {/* Decorative: scattered dots */}
        <div style={{ position: "absolute", bottom: "20%", left: "8%", opacity: 0.06, pointerEvents: "none" }}>
          {[0,1,2].map(r => [0,1,2,3].map(c => (
            <div key={`cta-dot-${r}-${c}`} style={{ position: "absolute", top: r * 14, left: c * 14, width: 3, height: 3, borderRadius: "50%", background: LAVENDER }} />
          )))}
        </div>
        <div style={{ maxWidth: 1320, margin: "0 auto", position: "relative", zIndex: 1, textAlign: "center", ...st("cta") }}>
          <h2 style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", fontWeight: 700, lineHeight: 1.06, letterSpacing: "-0.04em", marginBottom: 24 }}>
            Proteggi il tuo lavoro.<br />
            <span style={{ color: LAVENDER }}>Senza sorprese.</span>
          </h2>
          <p style={{ fontSize: "1.1rem", lineHeight: 1.6, color: "rgba(255,255,255,0.55)", maxWidth: "44ch", margin: "0 auto 44px" }}>
            Il confronto migliore, la copertura più adatta, l&apos;emissione più veloce. In meno di 24 ore.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
            <Link href="/app" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: LAVENDER, color: MIDNIGHT, fontSize: 15, fontWeight: 600, padding: "16px 36px", borderRadius: 100, textDecoration: "none" }}>
              Calcola il preventivo
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M13 8L9 4.5M13 8L9 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
            <Link href="/app" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "transparent", color: "rgba(255,255,255,0.60)", fontSize: 15, fontWeight: 500, padding: "16px 36px", borderRadius: 100, border: "1px solid rgba(255,255,255,0.15)", textDecoration: "none" }}>
              Scopri come funziona
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: MIDNIGHT, borderTop: "1px solid rgba(59,130,246,0.08)", padding: "80px 32px 40px", color: "white" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 64 }} className="lg8-footer-grid">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: LAVENDER, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L13 7L7 13L1 7L7 1Z" fill={MIDNIGHT} opacity="0.7"/></svg>
                </div>
                <span style={{ fontSize: 16, fontWeight: 700, color: "white", letterSpacing: "-0.02em" }}>ScelgoSicuro</span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.40)", maxWidth: "32ch" }}>
                Intermediario assicurativo iscritto al R.U.I. presso IVASS. Confrontiamo le migliori compagnie per proteggere il lavoro dei professionisti italiani.
              </p>
            </div>
            <div>
              <p style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(255,255,255,0.20)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20 }}>Coperture</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {["RC Professionale", "Colpa Grave", "Tutela Legale", "Retroattività"].map((l) => (
                  <span key={l} style={{ fontSize: 14, color: "rgba(255,255,255,0.40)" }}>{l}</span>
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(255,255,255,0.20)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20 }}>Professioni</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {["Medici & Sanitari", "Avvocati & Legali", "Ingegneri & Architetti", "Commercialisti"].map((l) => (
                  <span key={l} style={{ fontSize: 14, color: "rgba(255,255,255,0.40)" }}>{l}</span>
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(255,255,255,0.20)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20 }}>Azienda</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {["Chi siamo", "Privacy Policy", "Termini", "Contatti"].map((l) => (
                  <span key={l} style={{ fontSize: 14, color: "rgba(255,255,255,0.40)" }}>{l}</span>
                ))}
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <p style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(255,255,255,0.15)", letterSpacing: "0.06em" }}>© 2025 ScelgoSicuro Srl. Tutti i diritti riservati.</p>
            <p style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(255,255,255,0.15)", letterSpacing: "0.06em" }}>Regolato da IVASS — D.Lgs. 209/2005</p>
          </div>
        </div>
      </footer>

      {/* ── RESPONSIVE ── */}
<style>{`
        @media (max-width: 768px) {
          .lg8-bento-row2 { grid-template-columns: 1fr !important; }
          .lg8-process-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .lg8-footer-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .lg8-deco-photos { display: none !important; }
          .lg8-deco-photo { display: none !important; }
          .lg8-deco-line { display: none !important; }
          .lg8-hero-visual { display: none !important; }
          .lg8-hero-dots { display: none !important; }
          .lg8-hero-ring { display: none !important; }
          .lg8-hero-ring-sm { display: none !important; }
          .lg8-hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}