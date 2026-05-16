"use client"

import { useState } from "react"
import Link from "next/link"
import { LandingNav } from "@/components/landing-nav"

// ─── PALETTE ──────────────────────────────────────────────────────────────────
const NAVY   = "#0A2540"
const PURPLE = "#635BFF"
const MUTED  = "#425466"
const BORDER = "#E6EBF1"
const LIGHT  = "#F6F9FC"

// ─── DATA ─────────────────────────────────────────────────────────────────────

const PROF_TABS = [
  {
    id: "medici",
    label: "Medici e sanitari",
    headline: "RC professionale per chi tutela la salute.",
    body: "Responsabilità civile professionale, colpa grave, tutela legale e retroattività. Il sistema valuta il tuo profilo e trova la copertura più adatta alla tua specializzazione.",
    pills: ["Colpa grave", "Retroattività 10 anni", "Tutela legale", "Massimale personalizzato"],
    accent: "#4F46E5",
  },
  {
    id: "avvocati",
    label: "Avvocati",
    headline: "Copertura precisa per ogni tipo di contenzioso.",
    body: "Polizze specifiche per studi legali, con copertura per errori e omissioni, mancato rispetto di termini e perdita di documenti. Massimali calibrati sul volume d'affari.",
    pills: ["Errori e omissioni", "Termini procedurali", "Soci e collaboratori", "Nessun minimo"],
    accent: "#7C3AED",
  },
  {
    id: "tecnici",
    label: "Ingegneri e architetti",
    headline: "RC progettazione e direzione lavori.",
    body: "Copertura per progettazione, direzione lavori, collaudi strutturali. Retroattività, massimale per sinistro e franchigia modulabile secondo le caratteristiche del tuo studio.",
    pills: ["Progettazione", "Direzione lavori", "Collaudi", "Retroattività illimitata"],
    accent: "#0EA5E9",
  },
  {
    id: "consulenti",
    label: "Consulenti e commercialisti",
    headline: "Protezione per chi gestisce i numeri degli altri.",
    body: "Commercialisti, fiscalisti, advisor finanziari. Copertura per errori contabili, consulenza fiscale errata e danni da informazioni scorrette ai clienti.",
    pills: ["Errori contabili", "Consulenza fiscale", "Revisione conti", "Dipendenti inclusi"],
    accent: "#059669",
  },
]

const FEATURES = [
  {
    icon: "⚡",
    title: "Preventivo in 2 minuti",
    desc: "Solo le domande che contano. Il sistema genera la proposta personalizzata in tempo reale, senza moduli infiniti.",
  },
  {
    icon: "⚖️",
    title: "5+ compagnie confrontate",
    desc: "AXA, AmTrust, Generali, Unipol, Allianz. Confronto reale sui tariffari aggiornati, non stime.",
  },
  {
    icon: "🎯",
    title: "Analisi del profilo di rischio",
    desc: "L'algoritmo valuta coperture, massimali, franchigie e retroattività specifiche per il tuo settore.",
  },
  {
    icon: "📄",
    title: "Emissione digitale in 24h",
    desc: "Dal preventivo alla polizza attiva, tutto online. Nessuna agenzia, nessun appuntamento, nessuna carta.",
  },
]

const STATS = [
  { n: "5+", label: "Compagnie nel pannello" },
  { n: "2 min", label: "Tempo medio preventivo" },
  { n: "100%", label: "Processo digitale" },
  { n: "< 24h", label: "Polizza attiva" },
]

const TESTIMONIALS = [
  {
    quote: "Finalmente un tool che non mi chiede l'impossibile. Preventivo in 3 minuti, nessuna chiamata, polizza emessa il giorno dopo.",
    author: "Dr. Marco R.",
    role: "Medico di base · Milano",
  },
  {
    quote: "Come avvocato avevo bisogno di coperture specifiche sulla colpa grave. ScelgoSicuro le ha trovate subito, con spiegazioni finalmente comprensibili.",
    author: "Avv. Laura P.",
    role: "Studio legale · Roma",
  },
  {
    quote: "Ho confrontato tre compagnie in dieci minuti. Il sistema ha capito il mio profilo di rischio meglio di qualunque broker.",
    author: "Ing. Davide C.",
    role: "Ingegnere strutturista · Torino",
  },
]

const FAQ = [
  {
    q: "Il preventivo è gratuito e senza impegno?",
    a: "Sempre. Nessun costo nascosto, nessun obbligo di acquisto. Puoi calcolare, confrontare e decidere con calma.",
  },
  {
    q: "Come viene scelta la polizza consigliata?",
    a: "Il sistema analizza il tuo profilo, i rischi tipici del settore e le coperture disponibili per trovare la soluzione più coerente — non solo la più economica.",
  },
  {
    q: "Posso vedere le alternative alla polizza consigliata?",
    a: "Sempre. Mostriamo la proposta principale e tutte le alternative disponibili. Trasparenza totale sul confronto.",
  },
  {
    q: "Cosa sono massimali, franchigie e retroattività?",
    a: "Sono i parametri che determinano la protezione reale di una RC professionale. Te li spieghiamo in modo chiaro, senza linguaggio tecnico, così sai esattamente cosa stai acquistando.",
  },
  {
    q: "Posso parlare con un consulente?",
    a: "Sì. Se necessario puoi ricevere supporto da un consulente dedicato. Tecnologia e presenza umana lavorano insieme.",
  },
]

// ─── AURORA ───────────────────────────────────────────────────────────────────
// CSS-only approximation of Stripe's signature gradient wave

function Aurora() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        top: 0,
        left: "-5%",
        right: "-5%",
        height: "100%",
        zIndex: 0,
        overflow: "hidden",
      }}
    >
      {/* main gradient mesh */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: [
            "radial-gradient(ellipse 60% 50% at 10% 60%,  rgba(99, 91, 255, 0.55) 0%, transparent 60%)",
            "radial-gradient(ellipse 50% 60% at 35% 20%,  rgba(84, 51, 255, 0.60) 0%, transparent 55%)",
            "radial-gradient(ellipse 55% 45% at 65%  5%,  rgba(0,  180, 255, 0.55) 0%, transparent 55%)",
            "radial-gradient(ellipse 40% 50% at 88% 50%,  rgba(0,  212, 255, 0.45) 0%, transparent 50%)",
            "radial-gradient(ellipse 70% 40% at 50% -10%, rgba(128,100, 255, 0.70) 0%, transparent 50%)",
          ].join(","),
          filter: "blur(2px)",
        }}
      />
      {/* wave clip mask at the bottom */}
      <svg
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          bottom: -1,
          left: 0,
          right: 0,
          width: "100%",
          height: 80,
          display: "block",
        }}
      >
        <path
          d="M0,40 C200,90 400,0 600,50 C800,100 1000,10 1200,55 C1350,85 1420,45 1440,40 L1440,100 L0,100 Z"
          fill="white"
        />
      </svg>
    </div>
  )
}

// ─── UI MOCKUP ────────────────────────────────────────────────────────────────

function UIMockup() {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${BORDER}`,
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(10,37,64,0.12), 0 2px 8px rgba(10,37,64,0.06)",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* window chrome */}
      <div
        style={{
          background: LIGHT,
          borderBottom: `1px solid ${BORDER}`,
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", gap: 6 }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map(c => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
          ))}
        </div>
        <div
          style={{
            flex: 1,
            background: "#fff",
            border: `1px solid ${BORDER}`,
            borderRadius: 6,
            padding: "3px 10px",
            fontSize: 11,
            color: MUTED,
            textAlign: "center",
          }}
        >
          scelgosicuro.it/preventivo
        </div>
      </div>

      {/* content */}
      <div style={{ padding: "20px 24px" }}>
        {/* header */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: PURPLE, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>
            PREVENTIVO GRATUITO
          </p>
          <p style={{ fontSize: 15, fontWeight: 700, color: NAVY }}>
            RC Professionale — Medico chirurgo
          </p>
        </div>

        {/* comparison rows */}
        {[
          { company: "AmTrust", product: "Medico Protetto", price: "€ 320/anno", tag: "Consigliato", tagColor: PURPLE, tagBg: `${PURPLE}14` },
          { company: "AXA",     product: "RC Pro Smart",    price: "€ 345/anno", tag: null,        tagColor: "",      tagBg: "" },
          { company: "Generali",product: "Libero Prof.",    price: "€ 365/anno", tag: null,        tagColor: "",      tagBg: "" },
        ].map((row, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 12px",
              borderRadius: 8,
              marginBottom: 6,
              border: i === 0 ? `1.5px solid ${PURPLE}` : `1px solid ${BORDER}`,
              background: i === 0 ? `${PURPLE}06` : "#fff",
            }}
          >
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 2 }}>{row.company}</p>
              <p style={{ fontSize: 10, color: MUTED }}>{row.product}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {row.tag && (
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: row.tagColor,
                    background: row.tagBg,
                    padding: "2px 7px",
                    borderRadius: 4,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  {row.tag}
                </span>
              )}
              <p style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{row.price}</p>
            </div>
          </div>
        ))}

        {/* CTA */}
        <div
          style={{
            marginTop: 14,
            padding: "9px 14px",
            background: PURPLE,
            borderRadius: 6,
            textAlign: "center",
            fontSize: 11,
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "0.04em",
            cursor: "pointer",
          }}
        >
          Acquista — AmTrust Medico Protetto →
        </div>
      </div>
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function Landing7() {
  const [activeTab, setActiveTab] = useState("medici")
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const activeProf = PROF_TABS.find(t => t.id === activeTab)!

  return (
    <div style={{ background: "#fff", color: NAVY }}>

      {/* ── NAVBAR ───────────────────────────────────────────────────────── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(16px)",
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-10 h-[60px] flex items-center justify-between">
          <span style={{ fontWeight: 700, fontSize: 18, color: NAVY, letterSpacing: "-0.02em" }}>
            scelgosicuro<span style={{ color: PURPLE }}>.</span>
          </span>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: MUTED }}>
            <a href="#professioni" className="hover:text-[#0A2540] transition-colors">Professioni</a>
            <a href="#come-funziona" className="hover:text-[#0A2540] transition-colors">Come funziona</a>
            <a href="#faq" className="hover:text-[#0A2540] transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <LandingNav current="7" />
            <Link
              href="/app"
              className="text-sm font-semibold px-5 py-2.5 text-white rounded-md transition-all hover:opacity-90"
              style={{ background: PURPLE }}
            >
              Inizia gratis →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        style={{ position: "relative", overflow: "hidden", paddingBottom: 100 }}
        className="pt-24 sm:pt-32 px-6"
      >
        <Aurora />

        <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* left: text */}
          <div>
            <p
              style={{
                display: "inline-block",
                fontSize: 12,
                fontWeight: 700,
                color: PURPLE,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                background: `${PURPLE}12`,
                padding: "4px 12px",
                borderRadius: 4,
                marginBottom: 24,
              }}
            >
              RC Professionale · Liberi Professionisti
            </p>

            <h1
              style={{
                fontSize: "clamp(2.4rem, 5vw, 3.6rem)",
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                color: NAVY,
                marginBottom: 24,
              }}
            >
              <em style={{ fontStyle: "italic" }}>L&rsquo;assicurazione giusta</em><br />
              per il tuo lavoro.<br />
              <span style={{ color: PURPLE }}>In 2 minuti.</span>
            </h1>

            <p
              style={{
                fontSize: 18,
                lineHeight: 1.65,
                color: MUTED,
                marginBottom: 36,
                maxWidth: 480,
              }}
            >
              Confrontiamo AXA, Generali, AmTrust e altre compagnie per trovare
              la polizza RC professionale più adatta al tuo profilo.
              Preventivo gratuito, emissione digitale.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/app"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "14px 28px",
                  background: PURPLE,
                  color: "#fff",
                  borderRadius: 6,
                  fontWeight: 700,
                  fontSize: 15,
                  textDecoration: "none",
                  transition: "opacity 0.2s",
                  boxShadow: `0 4px 24px ${PURPLE}44`,
                }}
              >
                Calcola il tuo preventivo
                <span style={{ fontSize: 16 }}>→</span>
              </Link>
              <a
                href="#come-funziona"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "14px 24px",
                  color: NAVY,
                  borderRadius: 6,
                  fontWeight: 600,
                  fontSize: 15,
                  textDecoration: "none",
                  border: `1.5px solid ${BORDER}`,
                  transition: "border-color 0.2s",
                }}
              >
                Come funziona
                <span style={{ color: MUTED }}>→</span>
              </a>
            </div>

            <p style={{ fontSize: 12, color: MUTED, marginTop: 16 }}>
              Gratuito · Senza impegno · Nessun agente
            </p>
          </div>

          {/* right: UI mockup */}
          <div className="hidden lg:block">
            <UIMockup />
          </div>
        </div>
      </section>

      {/* ── LOGO BAR ─────────────────────────────────────────────────────── */}
      <section
        style={{ borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, background: LIGHT }}
        className="py-10 px-6"
      >
        <div className="max-w-6xl mx-auto">
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#8898AA",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            Compagnie convenzionate
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14">
            {["AMTRUST", "AXA", "GENERALI", "UNIPOL", "ALLIANZ"].map(name => (
              <span
                key={name}
                style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.10em", color: "#C4CAD4" }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURE GRID ─────────────────────────────────────────────────── */}
      <section className="py-24 px-6 sm:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: PURPLE,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              La piattaforma
            </p>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 700, letterSpacing: "-0.03em", color: NAVY, lineHeight: 1.15 }}>
              Tutto quello che ti serve.<br />Niente di superfluo.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 10,
                  padding: "28px 24px",
                  boxShadow: "0 2px 8px rgba(10,37,64,0.05)",
                  transition: "box-shadow 0.2s",
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: MUTED }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROFESSIONI TABS ─────────────────────────────────────────────── */}
      <section id="professioni" style={{ background: LIGHT, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }} className="py-24 px-6 sm:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p style={{ fontSize: 11, fontWeight: 700, color: PURPLE, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
              Per ogni professione
            </p>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 700, letterSpacing: "-0.03em", color: NAVY, lineHeight: 1.15 }}>
              Soluzioni specifiche per ogni categoria.
            </h2>
          </div>

          {/* tab strip */}
          <div
            className="flex flex-wrap justify-center gap-1 mb-12"
            style={{
              background: "#fff",
              border: `1px solid ${BORDER}`,
              borderRadius: 8,
              padding: 4,
              width: "fit-content",
              margin: "0 auto 48px",
            }}
          >
            {PROF_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "8px 18px",
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "none",
                  transition: "all 0.15s",
                  background: activeTab === tab.id ? PURPLE : "transparent",
                  color: activeTab === tab.id ? "#fff" : MUTED,
                  boxShadow: activeTab === tab.id ? `0 2px 8px ${PURPLE}40` : "none",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* tab content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3
                style={{
                  fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: NAVY,
                  lineHeight: 1.2,
                  marginBottom: 16,
                }}
              >
                {activeProf.headline}
              </h3>
              <p style={{ fontSize: 16, lineHeight: 1.7, color: MUTED, marginBottom: 28 }}>
                {activeProf.body}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 32 }}>
                {activeProf.pills.map(pill => (
                  <span
                    key={pill}
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: activeProf.accent,
                      background: `${activeProf.accent}12`,
                      border: `1px solid ${activeProf.accent}30`,
                      padding: "5px 12px",
                      borderRadius: 4,
                    }}
                  >
                    {pill}
                  </span>
                ))}
              </div>
              <Link
                href="/app"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "12px 24px",
                  background: activeProf.accent,
                  color: "#fff",
                  borderRadius: 6,
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: "none",
                  transition: "opacity 0.2s",
                }}
              >
                Preventivo per {activeProf.label.split(" ")[0].toLowerCase()} →
              </Link>
            </div>

            {/* right: mini mockup for the tab */}
            <div
              style={{
                background: "#fff",
                border: `1px solid ${BORDER}`,
                borderRadius: 12,
                padding: "28px 28px",
                boxShadow: "0 8px 32px rgba(10,37,64,0.08)",
              }}
            >
              <p style={{ fontSize: 10, fontWeight: 700, color: "#8898AA", letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 16 }}>
                Esempio preventivo · {activeProf.label}
              </p>
              {[
                { label: "Profilo", value: activeProf.label },
                { label: "Copertura base", value: "500.000 € per sinistro" },
                { label: "Retroattività", value: "10 anni" },
                { label: "Premio annuo indicativo", value: "da € 280 / anno" },
              ].map(row => (
                <div
                  key={row.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 0",
                    borderBottom: `1px solid ${BORDER}`,
                  }}
                >
                  <span style={{ fontSize: 13, color: MUTED }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{row.value}</span>
                </div>
              ))}
              <div
                style={{
                  marginTop: 20,
                  padding: "10px 16px",
                  background: `${activeProf.accent}10`,
                  border: `1px solid ${activeProf.accent}30`,
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: activeProf.accent }}>Compagnie disponibili</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: activeProf.accent }}>5 offerte</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────────── */}
      <section
        style={{ background: NAVY }}
        className="py-20 px-6 sm:px-10"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <p
                  style={{
                    fontSize: "clamp(2.4rem, 5vw, 3.2rem)",
                    fontWeight: 800,
                    color: "#fff",
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                    marginBottom: 10,
                  }}
                >
                  {s.n}
                </p>
                <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.45)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="come-funziona" className="py-24 px-6 sm:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p style={{ fontSize: 11, fontWeight: 700, color: PURPLE, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
              Come funziona
            </p>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 700, letterSpacing: "-0.03em", color: NAVY, lineHeight: 1.15 }}>
              Tre passi. Nessuna sorpresa.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                n: "01",
                title: "Inserisci professione e settore",
                desc: "Medico, avvocato, ingegnere, consulente. Il sistema carica le domande specifiche per il tuo profilo professionale.",
              },
              {
                n: "02",
                title: "Rispondi a poche domande chiave",
                desc: "Struttura, volume d'affari, tipologia clienti, rischi specifici. Solo le informazioni che incidono davvero sulla copertura.",
              },
              {
                n: "03",
                title: "Ricevi la proposta più adatta",
                desc: "Una soluzione consigliata più le alternative disponibili, con spiegazioni chiare su coperture, massimali ed esclusioni.",
              },
            ].map((step, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 10,
                  padding: "32px 28px",
                  position: "relative",
                  boxShadow: "0 2px 8px rgba(10,37,64,0.04)",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: PURPLE,
                    letterSpacing: "0.12em",
                    background: `${PURPLE}10`,
                    padding: "3px 8px",
                    borderRadius: 4,
                    display: "inline-block",
                    marginBottom: 20,
                  }}
                >
                  STEP {step.n}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: NAVY, marginBottom: 12, lineHeight: 1.3 }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: 14, lineHeight: 1.65, color: MUTED }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section
        style={{ background: LIGHT, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}
        className="py-24 px-6 sm:px-10"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p style={{ fontSize: 11, fontWeight: 700, color: PURPLE, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
              Testimonianze
            </p>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 2.6rem)", fontWeight: 700, letterSpacing: "-0.03em", color: NAVY, lineHeight: 1.2 }}>
              Scelto da chi non ha tempo da perdere.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 10,
                  padding: "28px 24px",
                  boxShadow: "0 2px 12px rgba(10,37,64,0.05)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                {/* stars */}
                <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
                  {Array.from({ length: 5 }).map((_, si) => (
                    <span key={si} style={{ color: "#FBB040", fontSize: 14 }}>★</span>
                  ))}
                </div>
                <p
                  style={{
                    fontSize: 15,
                    lineHeight: 1.65,
                    color: NAVY,
                    marginBottom: 20,
                    flex: 1,
                  }}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 16 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{t.author}</p>
                  <p style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 px-6 sm:px-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: PURPLE, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
              FAQ
            </p>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, letterSpacing: "-0.02em", color: NAVY, lineHeight: 1.2, marginBottom: 16 }}>
              Domande frequenti
            </h2>
            <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.65 }}>
              Non trovi risposta?{" "}
              <span style={{ color: PURPLE, fontWeight: 600, cursor: "pointer", borderBottom: `1px solid ${PURPLE}50` }}>
                Scrivici →
              </span>
            </p>
          </div>

          <div className="md:col-span-2" style={{ borderTop: `1px solid ${BORDER}` }}>
            {FAQ.map((item, i) => (
              <div key={i} style={{ borderBottom: `1px solid ${BORDER}` }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "20px 0",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    gap: 12,
                  }}
                >
                  <span style={{ fontSize: 15, fontWeight: 600, color: NAVY }}>{item.q}</span>
                  <span
                    style={{
                      color: PURPLE,
                      fontSize: 20,
                      flexShrink: 0,
                      fontWeight: 300,
                      transition: "transform 0.2s",
                      transform: openFaq === i ? "rotate(45deg)" : "none",
                    }}
                  >
                    +
                  </span>
                </button>
                <div
                  style={{
                    overflow: "hidden",
                    maxHeight: openFaq === i ? 200 : 0,
                    transition: "max-height 0.3s ease",
                  }}
                >
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: MUTED, paddingBottom: 20 }}>
                    {item.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ───────────────────────────────────────────────────── */}
      <section
        style={{
          background: `linear-gradient(135deg, #1a1060 0%, #3d2fa0 40%, #635BFF 100%)`,
        }}
        className="py-28 px-6 text-center"
      >
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2
            style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "#fff",
              lineHeight: 1.15,
              marginBottom: 20,
            }}
          >
            <em style={{ fontStyle: "italic" }}>Inizia oggi.</em><br />
            Bastano 2 minuti.
          </h2>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.65)", lineHeight: 1.65, marginBottom: 36 }}>
            Preventivo gratuito. Confronto reale tra 5+ compagnie.<br />
            Polizza attiva in meno di 24 ore.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/app"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "15px 32px",
                background: "#fff",
                color: PURPLE,
                borderRadius: 6,
                fontWeight: 700,
                fontSize: 15,
                textDecoration: "none",
                transition: "opacity 0.2s",
                boxShadow: "0 4px 20px rgba(0,0,0,0.20)",
              }}
            >
              Calcola il tuo preventivo →
            </Link>
            <a
              href="#come-funziona"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "15px 28px",
                color: "rgba(255,255,255,0.85)",
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 15,
                textDecoration: "none",
                border: "1.5px solid rgba(255,255,255,0.3)",
                transition: "border-color 0.2s",
              }}
            >
              Come funziona
            </a>
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 20 }}>
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
                Intermediario assicurativo iscritto al R.U.I. presso IVASS.<br />
                P.IVA 12345678901
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-10" style={{ fontSize: 13 }}>
              {[
                { title: "Professioni", links: ["Medici", "Avvocati", "Ingegneri", "Commercialisti"] },
                { title: "Azienda", links: ["Chi siamo", "Come funziona", "Contatti"] },
                { title: "Legale", links: ["Privacy Policy", "Termini", "Cookie"] },
              ].map(col => (
                <div key={col.title}>
                  <p style={{ fontWeight: 700, color: NAVY, marginBottom: 12, fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    {col.title}
                  </p>
                  {col.links.map(l => (
                    <p key={l} style={{ color: MUTED, marginBottom: 8, cursor: "pointer" }} className="hover:text-[#0A2540] transition-colors">
                      {l}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              borderTop: `1px solid ${BORDER}`,
              paddingTop: 20,
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              gap: 8,
              fontSize: 12,
              color: "#8898AA",
            }}
          >
            <p>© 2025 ScelgoSicuro Srl. Tutti i diritti riservati.</p>
            <p>Regolato da IVASS — D.Lgs. 209/2005</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
