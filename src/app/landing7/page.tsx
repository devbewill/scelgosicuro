"use client"

import { useState } from "react"
import Link from "next/link"
import { LandingNav } from "@/components/landing-nav"

// ─── PALETTE (Stripe) ─────────────────────────────────────────────────────────
const NAVY   = "#0A2540"
const PURPLE = "#635BFF"
const MUTED  = "#425466"
const BORDER = "#E6EBF1"
const LIGHT  = "#F6F9FC"

// ─── AURORA COMPONENTS ────────────────────────────────────────────────────────

/** Blob viola/rosa nell'angolo in alto a destra dell'hero — identico a Stripe */
function HeroAuroraBlob() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        top: -120,
        right: -180,
        width: 680,
        height: 680,
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <div style={{
        position: "absolute", inset: 0,
        background: [
          "radial-gradient(ellipse 55% 55% at 35% 45%, rgba(99,91,255,0.75) 0%, transparent 55%)",
          "radial-gradient(ellipse 50% 50% at 60% 35%, rgba(168,85,247,0.65) 0%, transparent 55%)",
          "radial-gradient(ellipse 45% 45% at 75% 60%, rgba(219,39,119,0.60) 0%, transparent 50%)",
          "radial-gradient(ellipse 35% 40% at 88% 40%, rgba(251,146,60,0.55) 0%, transparent 45%)",
        ].join(","),
        filter: "blur(48px)",
      }} />
    </div>
  )
}

/** Banda aurora orizzontale piena pagina tra feature e stats — il tratto più iconico di Stripe */
function MidAurora() {
  return (
    <div
      aria-hidden
      style={{
        position: "relative",
        width: "100%",
        height: 360,
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* fondo bianco */}
      <div style={{ position: "absolute", inset: 0, background: "#fff" }} />
      {/* blob aurora */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "160%",
        height: "200%",
        background: [
          "radial-gradient(ellipse 30% 55% at 10% 50%, rgba(59,130,246,0.75) 0%, transparent 60%)",
          "radial-gradient(ellipse 35% 60% at 30% 45%, rgba(99,91,255,0.80) 0%, transparent 58%)",
          "radial-gradient(ellipse 35% 55% at 52% 50%, rgba(168,85,247,0.75) 0%, transparent 55%)",
          "radial-gradient(ellipse 30% 55% at 70% 48%, rgba(219,39,119,0.70) 0%, transparent 55%)",
          "radial-gradient(ellipse 28% 50% at 85% 52%, rgba(251,146,60,0.65) 0%, transparent 50%)",
          "radial-gradient(ellipse 22% 40% at 96% 50%, rgba(253,224,71,0.55) 0%, transparent 45%)",
        ].join(","),
        filter: "blur(56px)",
      }} />
      {/* fade superiore e inferiore verso bianco */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to bottom, #fff 0%, transparent 28%, transparent 72%, #fff 100%)",
      }} />
      {/* fade laterale sinistro */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to right, #fff 0%, transparent 12%, transparent 88%, #fff 100%)",
      }} />
    </div>
  )
}

// ─── UI MOCKUPS (CSS only, nessuna immagine esterna) ──────────────────────────

function MockupForm() {
  return (
    <div style={{
      background: "rgba(255,255,255,0.10)",
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.18)",
      overflow: "hidden",
      backdropFilter: "blur(8px)",
    }}>
      {/* chrome bar */}
      <div style={{
        background: "rgba(255,255,255,0.08)",
        padding: "8px 14px",
        display: "flex",
        alignItems: "center",
        gap: 6,
        borderBottom: "1px solid rgba(255,255,255,0.10)",
      }}>
        {["#ff5f57","#febc2e","#28c840"].map(c => (
          <div key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c, opacity: 0.7 }} />
        ))}
      </div>
      <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.50)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Preventivo RC Professionale
        </p>
        {["Professione", "Settore", "Massimale"].map((label, i) => (
          <div key={label}>
            <p style={{ fontSize: 9, color: "rgba(255,255,255,0.40)", marginBottom: 3, fontWeight: 600 }}>{label}</p>
            <div style={{
              height: 30,
              background: "rgba(255,255,255,0.10)",
              borderRadius: 6,
              border: "1px solid rgba(255,255,255,0.14)",
              padding: "0 10px",
              display: "flex",
              alignItems: "center",
            }}>
              {i === 0 && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>Medico chirurgo</span>}
              {i === 1 && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>Seleziona…</span>}
              {i === 2 && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>Seleziona…</span>}
            </div>
          </div>
        ))}
        <div style={{
          marginTop: 4,
          background: "#fff",
          borderRadius: 6,
          padding: "8px 12px",
          textAlign: "center",
          fontSize: 11,
          fontWeight: 700,
          color: "#5B2FD4",
        }}>
          Calcola preventivo →
        </div>
      </div>
    </div>
  )
}

function MockupComparison() {
  const rows = [
    { name: "AmTrust", price: "€ 320/a", tag: "★ Consigliato", highlighted: true },
    { name: "AXA",     price: "€ 345/a", tag: null,           highlighted: false },
    { name: "Generali",price: "€ 368/a", tag: null,           highlighted: false },
  ]
  return (
    <div style={{
      background: "rgba(255,255,255,0.10)",
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.18)",
      overflow: "hidden",
    }}>
      <div style={{
        background: "rgba(255,255,255,0.08)",
        padding: "8px 14px",
        display: "flex",
        alignItems: "center",
        gap: 6,
        borderBottom: "1px solid rgba(255,255,255,0.10)",
      }}>
        {["#ff5f57","#febc2e","#28c840"].map(c => (
          <div key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c, opacity: 0.7 }} />
        ))}
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginLeft: 6 }}>Confronto polizze</span>
      </div>
      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 7 }}>
        {rows.map(r => (
          <div key={r.name} style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "9px 11px",
            borderRadius: 7,
            background: r.highlighted ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.06)",
            border: `1px solid ${r.highlighted ? "rgba(255,255,255,0.30)" : "rgba(255,255,255,0.08)"}`,
          }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{r.name}</p>
              {r.tag && <p style={{ fontSize: 9, color: "rgba(255,255,255,0.60)", marginTop: 1 }}>{r.tag}</p>}
            </div>
            <p style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>{r.price}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function MockupPolicy() {
  return (
    <div style={{
      background: "rgba(255,255,255,0.10)",
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.18)",
      overflow: "hidden",
    }}>
      <div style={{
        background: "rgba(255,255,255,0.08)",
        padding: "8px 14px",
        display: "flex", alignItems: "center", gap: 6,
        borderBottom: "1px solid rgba(255,255,255,0.10)",
      }}>
        {["#ff5f57","#febc2e","#28c840"].map(c => (
          <div key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c, opacity: 0.7 }} />
        ))}
      </div>
      <div style={{ padding: "18px 18px", textAlign: "center" }}>
        {/* check circle */}
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          background: "rgba(255,255,255,0.20)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 12px",
          border: "1.5px solid rgba(255,255,255,0.35)",
        }}>
          <span style={{ fontSize: 22, lineHeight: 1 }}>✓</span>
        </div>
        <p style={{ fontSize: 11, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Polizza emessa</p>
        <p style={{ fontSize: 9, color: "rgba(255,255,255,0.50)", marginBottom: 14 }}>RC Professionale attiva</p>
        {[
          { l: "Assicurato", v: "Dr. Mario Rossi" },
          { l: "Decorrenza", v: "16 mag 2026" },
          { l: "Massimale", v: "€ 500.000" },
        ].map(row => (
          <div key={row.l} style={{
            display: "flex", justifyContent: "space-between",
            padding: "6px 0",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.40)" }}>{row.l}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>{row.v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── HERO FORM ────────────────────────────────────────────────────────────────

const PROFESSIONS = ["Medico","Avvocato","Ingegnero","Geometra","Architetto","Commercialista","Consulente","Altro"]
const ACTIVITIES  = ["Libero professionista","Studio associato","Società di professionisti","Azienda"]
const COVERAGE    = ["Fino a €500k","Fino a €1M","Fino a €2.5M","Fino a €5M","Personalizzato"]

function HeroForm() {
  const [profession, setProfession] = useState("")
  const [activity,   setActivity]   = useState("")
  const [coverage,   setCoverage]   = useState("")

  return (
    <div style={{
      position: "relative",
      background: "#fff",
      border: `1px solid ${BORDER}`,
      borderRadius: 16,
      boxShadow: "0 12px 48px rgba(10,37,64,0.12)",
      maxWidth: 420,
      margin: "0 auto",
      overflow: "hidden",
    }}>
      {/* top accent line */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${PURPLE}, #9B8FFF)` }} />

      <div style={{ padding: "28px 28px 24px" }}>
        {/* header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: PURPLE, letterSpacing: "0.14em", textTransform: "uppercase" }}>
            Calcola il tuo preventivo
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: PURPLE }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: "0.10em", textTransform: "uppercase" }}>Live</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* top row: professione + attività */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Professione", value: profession, set: setProfession, opts: PROFESSIONS },
              { label: "Attività",    value: activity,   set: setActivity,   opts: ACTIVITIES  },
            ].map(({ label, value, set, opts }) => (
              <div key={label} style={{
                background: LIGHT,
                border: `1px solid ${BORDER}`,
                borderRadius: 8,
                padding: "10px 12px",
              }}>
                <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: MUTED, marginBottom: 6 }}>{label}</p>
                <select
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  style={{
                    width: "100%",
                    appearance: "none" as const,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    fontSize: 13,
                    fontWeight: 700,
                    color: value ? NAVY : "#8898AA",
                    cursor: "pointer",
                  }}
                >
                  <option value="" disabled style={{ background: "#fff" }}>Seleziona…</option>
                  {opts.map(o => <option key={o} value={o} style={{ background: "#fff", color: NAVY }}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>

          {/* copertura — full width */}
          <div style={{
            background: LIGHT,
            border: `1px solid ${BORDER}`,
            borderRadius: 8,
            padding: "10px 12px",
          }}>
            <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: MUTED, marginBottom: 6 }}>Massimale</p>
            <select
              value={coverage}
              onChange={(e) => setCoverage(e.target.value)}
              style={{
                width: "100%",
                appearance: "none" as const,
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: 13,
                fontWeight: 700,
                color: coverage ? NAVY : "#8898AA",
                cursor: "pointer",
              }}
            >
              <option value="" disabled style={{ background: "#fff" }}>Seleziona…</option>
              {COVERAGE.map(o => <option key={o} value={o} style={{ background: "#fff", color: NAVY }}>{o}</option>)}
            </select>
          </div>

          {/* CTA */}
          <button style={{
            width: "100%",
            background: PURPLE,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "14px 0",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            marginTop: 2,
          }}>
            Calcola il preventivo →
          </button>

          {/* footer */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 2 }}>
            <p style={{ fontSize: 10, color: "#8898AA" }}>Gratuito · Senza impegno · 2 minuti</p>
            <div style={{ display: "flex", gap: 3 }}>
              {[0,1,2,3,4].map(i => (
                <div key={i} style={{ width: 16, height: 3, borderRadius: 2, background: i < 3 ? PURPLE : `${PURPLE}20` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── FEATURE CARDS (sezione con gradient bg — identico a Stripe) ──────────────

const FEATURE_CARDS = [
  {
    gradient: "linear-gradient(145deg, #3B1FA3 0%, #5B2FD4 40%, #8B5CF6 100%)",
    tag: "Preventivo",
    title: "Poche domande, proposta immediata.",
    desc: "Solo le informazioni che incidono sul rischio. Il sistema genera la tua proposta personalizzata in tempo reale.",
    mockup: <MockupForm />,
  },
  {
    gradient: "linear-gradient(145deg, #1E3A5F 0%, #2563EB 45%, #635BFF 100%)",
    tag: "Confronto",
    title: "5 compagnie, una schermata.",
    desc: "AXA, AmTrust, Generali, Unipol, Allianz. Confronto reale sui tariffari aggiornati, non stime.",
    mockup: <MockupComparison />,
  },
  {
    gradient: "linear-gradient(145deg, #064E3B 0%, #059669 40%, #10B981 100%)",
    tag: "Emissione",
    title: "Polizza attiva in meno di 24 ore.",
    desc: "Dal preventivo alla polizza, tutto digitale. Nessuna agenzia, nessun appuntamento, nessuna carta.",
    mockup: <MockupPolicy />,
  },
]

// ─── ACCORDION enterprise (stile Stripe) ─────────────────────────────────────

const ACCORDION_ITEMS = [
  {
    prof: "Medici e sanitari",
    stat: "500+ specializzazioni coperte",
    body: "Responsabilità civile professionale, colpa grave, retroattività fino a 10 anni. Copertura calibrata sulla specializzazione e sul contesto (libero professionista, dipendente, struttura).",
    pills: ["Colpa grave", "Retroattività", "Tutela legale"],
    accent: "#7C3AED",
  },
  {
    prof: "Avvocati",
    stat: "Polizze su misura per studi legali",
    body: "Copertura per errori e omissioni, mancato rispetto di termini procedurali, perdita di documenti. Massimale modulabile, soci e collaboratori inclusi.",
    pills: ["Errori e omissioni", "Termini procedurali", "Collaboratori"],
    accent: "#2563EB",
  },
  {
    prof: "Ingegneri e architetti",
    stat: "Progettazione, DL e collaudi",
    body: "RC professionale per progettazione, direzione lavori, collaudi strutturali. Retroattività illimitata disponibile, franchigia modulabile secondo il volume d'affari.",
    pills: ["Progettazione", "Direzione lavori", "Collaudi strutturali"],
    accent: "#059669",
  },
  {
    prof: "Consulenti e commercialisti",
    stat: "Errori contabili e consulenza fiscale",
    body: "Protezione per commercialisti, fiscalisti, advisor finanziari. Errori contabili, consulenza errata, danni da informazioni scorrette ai clienti. Dipendenti inclusi.",
    pills: ["Errori contabili", "Consulenza fiscale", "Dipendenti"],
    accent: "#D97706",
  },
]

// ─── TESTIMONIALS (foto Unsplash — licenza gratuita) ──────────────────────────

const TESTIMONIALS = [
  {
    quote: "Finalmente un tool che non mi chiede l'impossibile. Preventivo in 3 minuti, polizza il giorno dopo. Zero telefonate.",
    name: "Dr. Marco R.",
    role: "Medico di base · Milano",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face&auto=format&q=80",
  },
  {
    quote: "Avevo bisogno di coperture specifiche sulla colpa grave. ScelgoSicuro le ha trovate subito, con spiegazioni finalmente comprensibili.",
    name: "Avv. Laura P.",
    role: "Studio legale · Roma",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face&auto=format&q=80",
  },
  {
    quote: "Ho confrontato tre compagnie in dieci minuti. Il sistema ha capito il mio profilo di rischio meglio di qualunque broker.",
    name: "Ing. Davide C.",
    role: "Ingegnere strutturista · Torino",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face&auto=format&q=80",
  },
]

const STATS = [
  { n: "5+",    label: "Compagnie nel pannello" },
  { n: "2 min", label: "Tempo medio preventivo" },
  { n: "100%",  label: "Processo digitale" },
  { n: "< 24h", label: "Polizza attiva" },
]

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function Landing7() {
  const [openAccordion, setOpenAccordion] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div style={{ background: "#fff", color: NAVY, overflowX: "hidden" }}>

      {/* ── NAVBAR ───────────────────────────────────────────────────────── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${BORDER}`,
      }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-10 h-[60px] flex items-center justify-between">
          <span style={{ fontWeight: 700, fontSize: 18, color: NAVY, letterSpacing: "-0.025em" }}>
            scelgosicuro<span style={{ color: PURPLE }}>.</span>
          </span>

          <div className="hidden md:flex items-center gap-8" style={{ fontSize: 14, fontWeight: 500, color: MUTED }}>
            <a href="#soluzioni"    className="hover:text-[#0A2540] transition-colors">Soluzioni</a>
            <a href="#professioni"  className="hover:text-[#0A2540] transition-colors">Professioni</a>
            <a href="#come-funziona" className="hover:text-[#0A2540] transition-colors">Come funziona</a>
          </div>

          <div className="flex items-center gap-3">
            <LandingNav current="7" />
            <Link
              href="/app"
              style={{
                fontSize: 14, fontWeight: 600,
                padding: "8px 20px",
                background: PURPLE, color: "#fff",
                borderRadius: 6,
                textDecoration: "none",
              }}
            >
              Inizia gratis →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", overflow: "hidden", background: "#fff" }} className="pt-24 pb-20 px-6">
        <HeroAuroraBlob />

        <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* left */}
          <div>
            <h1 style={{
              fontSize: "clamp(2.6rem, 5.5vw, 3.8rem)",
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: "-0.035em",
              color: NAVY,
              marginBottom: 22,
            }}>
              <em style={{ fontStyle: "italic" }}>L&rsquo;assicurazione giusta</em><br />
              per il tuo lavoro.<br />
              <span style={{ color: PURPLE }}>In 2 minuti.</span>
            </h1>

            <p style={{ fontSize: 18, lineHeight: 1.7, color: MUTED, marginBottom: 36, maxWidth: 480 }}>
              Confrontiamo AXA, Generali, AmTrust e altre compagnie per trovare
              la polizza RC professionale più adatta al tuo profilo.
              Preventivo gratuito, emissione digitale, nessun agente.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
              <Link href="/app" style={{
                padding: "13px 28px",
                background: PURPLE, color: "#fff",
                borderRadius: 6, fontWeight: 700, fontSize: 15,
                textDecoration: "none",
                boxShadow: `0 4px 20px ${PURPLE}55`,
              }}>
                Calcola il tuo preventivo →
              </Link>
              <a href="#soluzioni" style={{
                padding: "13px 24px",
                border: `1.5px solid ${BORDER}`, color: NAVY,
                borderRadius: 6, fontWeight: 600, fontSize: 15,
                textDecoration: "none",
              }}>
                Scopri come funziona
              </a>
            </div>

            <p style={{ fontSize: 12, color: "#8898AA" }}>
              Gratuito · Senza impegno · Nessun agente
            </p>
          </div>

          {/* right: quote form */}
          <div style={{ position: "relative" }}>
            <div style={{
              position: "absolute", inset: -40,
              background: `radial-gradient(ellipse at 50% 50%, ${PURPLE}18 0%, transparent 70%)`,
              pointerEvents: "none",
            }} />
            <HeroForm />
          </div>
        </div>
      </section>

      {/* ── LOGO BAR ─────────────────────────────────────────────────────── */}
      <div style={{ borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, background: LIGHT }} className="py-9 px-6">
        <div className="max-w-6xl mx-auto">
          <p style={{ fontSize: 11, fontWeight: 700, color: "#8898AA", letterSpacing: "0.14em", textTransform: "uppercase", textAlign: "center", marginBottom: 22 }}>
            Compagnie convenzionate
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-16">
            {["AMTRUST", "AXA", "GENERALI", "UNIPOL", "ALLIANZ"].map(n => (
              <span key={n} style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.12em", color: "#C4CAD4" }}>{n}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURE CARDS (gradient bg) ──────────────────────────────────── */}
      <section id="soluzioni" className="py-24 px-6 sm:px-10">
        <div className="max-w-6xl mx-auto">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: PURPLE, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>
              La piattaforma
            </p>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 700, letterSpacing: "-0.03em", color: NAVY, lineHeight: 1.15 }}>
              Soluzioni flessibili per ogni professionista.
            </h2>
            <p style={{ fontSize: 17, color: MUTED, marginTop: 14, maxWidth: 520, margin: "14px auto 0" }}>
              Dalla prima domanda alla polizza attiva, un processo completamente digitale
              e trasparente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURE_CARDS.map((card, i) => (
              <div
                key={i}
                style={{
                  borderRadius: 16,
                  overflow: "hidden",
                  background: card.gradient,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* mockup UI */}
                <div style={{ padding: "28px 24px 0" }}>
                  {card.mockup}
                </div>
                {/* text */}
                <div style={{ padding: "22px 24px 28px", color: "#fff" }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.60)", marginBottom: 8 }}>
                    {card.tag}
                  </p>
                  <h3 style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.3, marginBottom: 10 }}>
                    {card.title}
                  </h3>
                  <p style={{ fontSize: 14, lineHeight: 1.65, color: "rgba(255,255,255,0.70)" }}>
                    {card.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MID AURORA (banda orizzontale Stripe) ────────────────────────── */}
      <MidAurora />

      {/* ── STATS ────────────────────────────────────────────────────────── */}
      <section className="pb-28 px-6 sm:px-10" style={{ background: "#fff" }}>
        <div className="max-w-6xl mx-auto text-center">
          <p style={{ fontSize: 11, fontWeight: 700, color: PURPLE, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 14 }}>
            In numeri
          </p>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 700, letterSpacing: "-0.03em", color: NAVY, lineHeight: 1.15, marginBottom: 60 }}>
            La colonna portante<br />della RC professionale digitale.
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {STATS.map((s, i) => (
              <div key={i}>
                <p style={{ fontSize: "clamp(2.4rem, 5vw, 3.4rem)", fontWeight: 800, color: NAVY, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 10 }}>
                  {s.n}
                </p>
                <p style={{ fontSize: 13, fontWeight: 600, color: MUTED, letterSpacing: "0.04em" }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROFESSIONI ACCORDION ────────────────────────────────────────── */}
      <section id="professioni" style={{ background: LIGHT, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }} className="py-24 px-6 sm:px-10">
        <div className="max-w-6xl mx-auto">
          <div style={{ marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: PURPLE, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>
              Per ogni professione
            </p>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 700, letterSpacing: "-0.03em", color: NAVY, lineHeight: 1.15, maxWidth: 500 }}>
              Gestisci il tuo profilo di rischio su una piattaforma pensata per te.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* accordion */}
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {ACCORDION_ITEMS.map((item, i) => (
                <div
                  key={i}
                  style={{
                    borderRadius: 10,
                    overflow: "hidden",
                    border: openAccordion === i ? `1.5px solid ${item.accent}40` : `1px solid ${BORDER}`,
                    background: openAccordion === i ? "#fff" : "transparent",
                    transition: "all 0.2s",
                    boxShadow: openAccordion === i ? "0 4px 20px rgba(10,37,64,0.07)" : "none",
                  }}
                >
                  <button
                    onClick={() => setOpenAccordion(i)}
                    style={{
                      width: "100%", textAlign: "left",
                      padding: "16px 20px",
                      background: "none", border: "none",
                      cursor: "pointer",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}
                  >
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: NAVY }}>{item.prof}</p>
                      <p style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{item.stat}</p>
                    </div>
                    <span style={{
                      fontSize: 18, color: openAccordion === i ? item.accent : MUTED,
                      fontWeight: 300,
                      transition: "transform 0.2s",
                      transform: openAccordion === i ? "rotate(45deg)" : "none",
                    }}>+</span>
                  </button>

                  <div style={{
                    overflow: "hidden",
                    maxHeight: openAccordion === i ? 220 : 0,
                    transition: "max-height 0.3s ease",
                  }}>
                    <div style={{ padding: "0 20px 20px" }}>
                      <p style={{ fontSize: 14, lineHeight: 1.7, color: MUTED, marginBottom: 14 }}>{item.body}</p>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {item.pills.map(p => (
                          <span key={p} style={{
                            fontSize: 11, fontWeight: 600,
                            color: item.accent, background: `${item.accent}12`,
                            border: `1px solid ${item.accent}25`,
                            padding: "3px 9px", borderRadius: 4,
                          }}>{p}</span>
                        ))}
                      </div>
                      <Link href="/app" style={{
                        display: "inline-block", marginTop: 16,
                        fontSize: 13, fontWeight: 700,
                        color: item.accent, textDecoration: "none",
                        borderBottom: `1px solid ${item.accent}40`,
                      }}>
                        Preventivo per {item.prof.split(" ")[0].toLowerCase()} →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* right: immagine professionale — Unsplash free */}
            <div style={{ position: "relative" }}>
              <div style={{
                borderRadius: 16, overflow: "hidden",
                boxShadow: "0 20px 60px rgba(10,37,64,0.14)",
                aspectRatio: "4/3",
              }}>
                <img
                  src="https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=800&auto=format&fit=crop&q=80"
                  alt="Professionista al lavoro"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                {/* overlay con stat */}
                <div style={{
                  position: "absolute", bottom: 20, left: 20, right: 20,
                  background: "rgba(255,255,255,0.92)",
                  backdropFilter: "blur(12px)",
                  borderRadius: 10,
                  padding: "14px 18px",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  border: `1px solid ${BORDER}`,
                  boxShadow: "0 4px 16px rgba(10,37,64,0.10)",
                }}>
                  <div>
                    <p style={{ fontSize: 11, color: MUTED, marginBottom: 3 }}>Preventivo generato</p>
                    <p style={{ fontSize: 16, fontWeight: 800, color: NAVY }}>AmTrust · RC Pro</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 11, color: MUTED, marginBottom: 3 }}>Premio annuo</p>
                    <p style={{ fontSize: 20, fontWeight: 800, color: PURPLE }}>€ 320</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="come-funziona" className="py-24 px-6 sm:px-10">
        <div className="max-w-6xl mx-auto">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: PURPLE, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>
              Come funziona
            </p>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 700, letterSpacing: "-0.03em", color: NAVY, lineHeight: 1.15 }}>
              Crea valore più velocemente.<br />
              <em style={{ fontStyle: "italic", color: PURPLE }}>Tre passi, nessuna sorpresa.</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                n: "01",
                title: "Inserisci professione e settore",
                desc: "Medico, avvocato, ingegnere, consulente. Il sistema carica le domande specifiche per il tuo profilo e i tuoi rischi.",
                img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=75",
              },
              {
                n: "02",
                title: "Rispondi a poche domande chiave",
                desc: "Struttura, volume d'affari, tipologia clienti. Solo ciò che incide davvero sulla copertura. Nessuna ridondanza.",
                img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&auto=format&fit=crop&q=75",
              },
              {
                n: "03",
                title: "Ricevi la proposta più adatta",
                desc: "Una soluzione consigliata e le alternative disponibili, con spiegazioni chiare su coperture, massimali ed esclusioni.",
                img: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&auto=format&fit=crop&q=75",
              },
            ].map((step, i) => (
              <div key={i} style={{
                background: "#fff",
                border: `1px solid ${BORDER}`,
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: "0 2px 12px rgba(10,37,64,0.05)",
              }}>
                {/* immagine */}
                <div style={{ height: 180, overflow: "hidden" }}>
                  <img
                    src={step.img}
                    alt={step.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div style={{ padding: "22px 22px 26px" }}>
                  <div style={{
                    display: "inline-block",
                    fontSize: 11, fontWeight: 800, color: PURPLE,
                    background: `${PURPLE}10`, padding: "2px 8px", borderRadius: 4,
                    letterSpacing: "0.10em", marginBottom: 12,
                  }}>
                    STEP {step.n}
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: NAVY, marginBottom: 10, lineHeight: 1.3 }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: 14, lineHeight: 1.65, color: MUTED }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section style={{ background: LIGHT, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }} className="py-24 px-6 sm:px-10">
        <div className="max-w-6xl mx-auto">
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: PURPLE, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>
              Testimonianze
            </p>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 2.6rem)", fontWeight: 700, letterSpacing: "-0.03em", color: NAVY }}>
              Scelto da chi non ha tempo da perdere.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{
                background: "#fff",
                border: `1px solid ${BORDER}`,
                borderRadius: 12,
                padding: "28px 24px",
                boxShadow: "0 2px 12px rgba(10,37,64,0.05)",
                display: "flex", flexDirection: "column",
              }}>
                {/* stars */}
                <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>
                  {Array.from({ length: 5 }).map((_, si) => (
                    <span key={si} style={{ color: "#FBB040", fontSize: 13 }}>★</span>
                  ))}
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.65, color: NAVY, flex: 1, marginBottom: 20 }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12, borderTop: `1px solid ${BORDER}`, paddingTop: 18 }}>
                  <img
                    src={t.avatar}
                    alt={t.name}
                    style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                  />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{t.name}</p>
                    <p style={{ fontSize: 12, color: MUTED, marginTop: 1 }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ───────────────────────────────────────────────────── */}
      <section style={{ background: "#fff" }} className="py-28 px-6">
        <div style={{
          maxWidth: 780, margin: "0 auto",
          background: `linear-gradient(135deg, #1a0f6e 0%, #3d2fa0 35%, ${PURPLE} 70%, #8B5CF6 100%)`,
          borderRadius: 20,
          padding: "60px 48px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* glow interno */}
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse 60% 60% at 50% 0%, rgba(255,255,255,0.10) 0%, transparent 60%)",
            pointerEvents: "none",
          }} />
          <h2 style={{
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: 700, letterSpacing: "-0.03em",
            color: "#fff", lineHeight: 1.15, marginBottom: 18,
            position: "relative",
          }}>
            <em style={{ fontStyle: "italic" }}>Inizia oggi.</em><br />Bastano 2 minuti.
          </h2>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.65)", lineHeight: 1.65, marginBottom: 36, position: "relative" }}>
            Preventivo gratuito. Confronto reale tra 5+ compagnie.<br />
            Polizza attiva in meno di 24 ore.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", position: "relative" }}>
            <Link href="/app" style={{
              padding: "14px 32px",
              background: "#fff", color: PURPLE,
              borderRadius: 6, fontWeight: 700, fontSize: 15,
              textDecoration: "none",
              boxShadow: "0 4px 20px rgba(0,0,0,0.20)",
            }}>
              Calcola il tuo preventivo →
            </Link>
            <a href="#come-funziona" style={{
              padding: "14px 26px",
              border: "1.5px solid rgba(255,255,255,0.35)", color: "rgba(255,255,255,0.90)",
              borderRadius: 6, fontWeight: 600, fontSize: 15,
              textDecoration: "none",
            }}>
              Scopri come funziona
            </a>
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 22, position: "relative" }}>
            Gratuito · Senza impegno · Nessun agente
          </p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer style={{ background: "#fff", borderTop: `1px solid ${BORDER}` }} className="py-16 px-6 sm:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-12 mb-12">
            <div style={{ maxWidth: 260 }}>
              <p style={{ fontWeight: 700, fontSize: 18, color: NAVY, letterSpacing: "-0.02em", marginBottom: 10 }}>
                scelgosicuro<span style={{ color: PURPLE }}>.</span>
              </p>
              <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.65 }}>
                Intermediario assicurativo iscritto al R.U.I. presso IVASS.<br />P.IVA 12345678901
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
              {[
                { title: "Professioni", links: ["Medici", "Avvocati", "Ingegneri", "Commercialisti"] },
                { title: "Azienda",     links: ["Chi siamo", "Come funziona", "Contatti"] },
                { title: "Legale",      links: ["Privacy Policy", "Termini", "Cookie"] },
              ].map(col => (
                <div key={col.title}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: NAVY, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
                    {col.title}
                  </p>
                  {col.links.map(l => (
                    <p key={l} style={{ fontSize: 13, color: MUTED, marginBottom: 8, cursor: "pointer" }}
                       className="hover:text-[#0A2540] transition-colors">{l}</p>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div style={{
            borderTop: `1px solid ${BORDER}`, paddingTop: 20,
            display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 8,
            fontSize: 12, color: "#8898AA",
          }}>
            <p>© 2025 ScelgoSicuro Srl. Tutti i diritti riservati.</p>
            <p>Regolato da IVASS — D.Lgs. 209/2005</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
