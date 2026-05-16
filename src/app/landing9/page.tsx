"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { LandingNav } from "@/components/landing-nav"

// ─── THEMES ───────────────────────────────────────────────────────────────────
// Adjacent light sections are near-identical so transitions between them are
// imperceptible when stationary. Only the hero, stats and footer are anchored
// with their own CSS background so the wrapper never "bleeds" into them.
const THEMES = {
  slate:  { bg: "#7e98bc", text: "#f9fafb", isDark: true  },
  dark:   { bg: "#0c1018", text: "#f9fafb", isDark: true  },
  light:  { bg: "#fafafa", text: "#0c1018", isDark: false },
  mist:   { bg: "#f5f8fc", text: "#0c1018", isDark: false },
  cream:  { bg: "#fdfcf8", text: "#0c1018", isDark: false },
  forest: { bg: "#3b6331", text: "#f9fafb", isDark: true  },
} as const
type Theme = keyof typeof THEMES

// ─── DATA ─────────────────────────────────────────────────────────────────────
const MONO = "var(--font-dm-mono, 'DM Mono', monospace)"

const MARQUEE_ITEMS = [
  "RC Professionale", "Colpa Grave", "Tutela Legale", "Retroattività",
  "AXA", "AmTrust", "Generali", "Unipol", "Allianz",
  "Medici", "Avvocati", "Ingegneri", "Commercialisti", "Architetti", "Consulenti",
]

const DIFFERENTIATORS = [
  {
    num: "01",
    title: "Multi-compagnia, sempre.",
    desc: "Non una proposta sola. Confrontiamo AXA, AmTrust, Generali, Unipol e Allianz — tariffari aggiornati, coperture reali. Mai stime.",
  },
  {
    num: "02",
    title: "Calibrato sul tuo profilo.",
    desc: "Le domande che facciamo incidono davvero sul rischio. La proposta è personalizzata, non generica. Il sistema conosce la differenza tra un medico di base e un chirurgo.",
  },
  {
    num: "03",
    title: "Polizza in meno di 24 ore.",
    desc: "Dall'analisi all'emissione, tutto digitale. Nessuna agenzia, nessun appuntamento, nessun ritardo. Documenti pronti in giornata.",
  },
]

const PRODUCTS = [
  {
    num: "01", tag: "Copertura base", title: "RC Professionale",
    desc: "Copre i danni causati a terzi nell'esercizio della tua attività. È il punto di partenza per ogni libero professionista.",
    cats: ["Medici", "Avvocati", "Ingegneri"],
    accent: "#3b6331",
  },
  {
    num: "02", tag: "Protezione estesa", title: "Colpa Grave Extra",
    desc: "Estende la copertura alle responsabilità più gravi: errori di diagnosi, malpractice, atti dei collaboratori.",
    cats: ["Medici", "Sanitari", "Chirurghi"],
    accent: "#903c27",
  },
  {
    num: "03", tag: "Assistenza legale", title: "Tutela Legale",
    desc: "Spese legali, onorari e costi processuali coperti. Difesa attiva in ogni fase del procedimento.",
    cats: ["Studi associati", "Aziende"],
    accent: "#1e3a5f",
  },
  {
    num: "04", tag: "Continuità temporale", title: "Retroattività & RC Postuma",
    desc: "Copertura per sinistri emersi dopo la scadenza o relativi ad attività svolte in passato.",
    cats: ["Tutti i professionisti"],
    accent: "#3b6331",
  },
]

const PROFILES = [
  {
    cat: "Medici & Sanitari",
    label: "500+ specializzazioni",
    items: ["RC colpa grave inclusa", "Retroattività fino a 10 anni", "Massimali da €500k a €5M", "Tutela legale su richiesta"],
    accent: "#7e98bc",
  },
  {
    cat: "Avvocati & Legali",
    label: "Polizze per studi legali",
    items: ["Errori e omissioni", "Mancato rispetto di termini", "Perdita di documenti", "Collaboratori e soci inclusi"],
    accent: "#903c27",
  },
  {
    cat: "Ingegneri & Architetti",
    label: "Progettazione e DL",
    items: ["RC progettazione e collaudi", "Direzione lavori", "Massimale calibrato sul progetto", "Copertura cantiere inclusa"],
    accent: "#3b6331",
  },
  {
    cat: "Commercialisti & Consulenti",
    label: "Consulenza e gestione",
    items: ["Errori di consulenza fiscale", "Negligenza professionale", "Danni a clienti e terzi", "Studio associato coperto"],
    accent: "#1e3a5f",
  },
]

const STEPS = [
  { n: "01", title: "Identifica", desc: "Selezioniamo il tuo profilo partendo da professione, attività e struttura. Nessun questionario infinito." },
  { n: "02", title: "Confronta",  desc: "Il motore analizza offerte reali da 5 compagnie e le ordina per coerenza con il tuo profilo di rischio." },
  { n: "03", title: "Scegli",     desc: "Una proposta consigliata, più le alternative. Massimali, franchigie e clausole spiegate in modo leggibile." },
  { n: "04", title: "Proteggi",   desc: "Polizza emessa in meno di 24 ore. Documenti digitali, rinnovi automatici. Zero agenzie, zero code." },
]

const TESTIMONIALS = [
  {
    quote: "Preventivo in 3 minuti, polizza emessa il giorno dopo. Nessun agente, nessuna attesa. Finalmente.",
    name: "Dr. Marco R.", role: "Medico di base, Milano",
  },
  {
    quote: "Come avvocato avevo bisogno di coperture specifiche sulla colpa grave. ScelgoSicuro le ha trovate subito, senza dover spiegare tutto a un broker.",
    name: "Avv. Laura P.", role: "Studio legale, Roma",
  },
  {
    quote: "Ho confrontato tre compagnie in dieci minuti. La differenza di prezzo era significativa — e la copertura migliore non era la più cara.",
    name: "Ing. Davide C.", role: "Ingegnere strutturista, Torino",
  },
]

const FAQS = [
  { q: "Il preventivo è davvero gratuito e senza impegno?", a: "Sì. Nessun costo nascosto, nessun obbligo di acquisto. Puoi calcolare il preventivo, confrontare le opzioni e decidere con calma. Non ti chiediamo carta di credito." },
  { q: "Come viene scelta la polizza consigliata?", a: "Il sistema analizza il tuo profilo di rischio, i rischi tipici della tua professione e le coperture disponibili per trovare la soluzione più coerente — non solo la più economica." },
  { q: "Posso vedere tutte le alternative oltre a quella consigliata?", a: "Sempre. La piattaforma mostra la proposta consigliata e tutte le alternative disponibili, con massimali, franchigie e clausole spiegate in modo chiaro." },
  { q: "Cosa sono massimali, franchigie e retroattività?", a: "Sono i parametri che determinano la protezione reale. Il massimale è il limite massimo di rimborso. La franchigia è la quota a tuo carico. La retroattività copre eventi accaduti prima della firma ma emersi dopo. Te li spieghiamo senza tecnicismi." },
  { q: "Quanto tempo ci vuole dall'analisi alla polizza attiva?", a: "In molti casi meno di 24 ore. Dopo aver scelto la proposta, il processo è completamente digitale. Ricevi i documenti via email e la polizza è immediatamente operativa." },
]

const STATS = [
  { n: "5+",    label: "Compagnie confrontate"       },
  { n: "2 min", label: "Per un preventivo completo"  },
  { n: "< 24h", label: "Dalla richiesta alla polizza" },
  { n: "100%",  label: "Digitale, senza intermediari" },
]

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function Landing9() {
  const [theme, setTheme]     = useState<Theme>("slate")
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("[data-theme9]")
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setTheme(e.target.getAttribute("data-theme9") as Theme)
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    )
    sections.forEach(s => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  const t = THEMES[theme]
  // opacity-based mid colour that flips automatically with the theme
  const mid = (a: number) =>
    t.isDark ? `rgba(249,250,251,${a})` : `rgba(12,16,24,${a})`

  // Fast transition: adjacent light sections are near-identical, so 0.4 s is
  // imperceptible between them. Anchored sections (hero, stats, footer) have
  // their own CSS background and never depend on the wrapper.
  const TR = "0.4s ease"

  return (
    <>
      <style>{`
        @keyframes ng-marquee {
          from { transform: translateX(0) }
          to   { transform: translateX(-50%) }
        }
      `}</style>

      {/* PAGE WRAPPER — background driven by theme state */}
      <div
        style={{
          background: t.bg,
          color: t.text,
          transition: `background-color ${TR}, color ${TR}`,
          fontFamily: "'Inter', system-ui, sans-serif",
          minHeight: "100vh",
        }}
      >

        {/* ── NAVBAR ──────────────────────────────────────────────────────── */}
        <nav
          className="fixed top-0 left-0 right-0 z-50"
          style={{
            background: t.isDark ? "rgba(12,16,24,0.82)" : `${t.bg}ee`,
            borderBottom: `1px solid ${mid(0.09)}`,
            backdropFilter: "blur(20px)",
            transition: `background ${TR}`,
          }}
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-12 h-14 flex items-center justify-between">
            <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 500, letterSpacing: "0.02em", color: t.text, transition: `color ${TR}` }}>
              scelgosicuro
            </span>
            <div className="flex items-center gap-4">
              <LandingNav current="9" variant={t.isDark ? "dark" : "light"} />
              <Link
                href="/app"
                className="hidden sm:block"
                style={{
                  fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em",
                  padding: "7px 16px",
                  border: `1px solid ${mid(0.28)}`,
                  color: t.text,
                  transition: `all ${TR}`,
                }}
              >
                Preventivo →
              </Link>
            </div>
          </div>
        </nav>

        {/* ── HERO — anchored gradient, never changes ──────────────────────── */}
        <section
          data-theme9="slate"
          style={{
            minHeight: "100svh",
            display: "flex", flexDirection: "column", justifyContent: "space-between",
            background: "linear-gradient(to bottom, #0c1018 0%, #0c1018 20%, #3d6080 65%, #7e98bc 100%)",
            padding: "0 48px 56px", paddingTop: "10vh",
          }}
          className="px-6 sm:px-12"
        >
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: 80 }}>
            <p style={{ fontFamily: MONO, fontSize: 11, color: "rgba(249,250,251,0.40)", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 48 }}>
              Intermediario assicurativo — RC Professionale
            </p>
            <h1 style={{
              fontSize: "clamp(2rem, 4.2vw, 5rem)",
              fontWeight: 400, lineHeight: 1.08, letterSpacing: "-0.025em",
              marginBottom: 52, color: "#f9fafb",
            }}>
              ScelgoSicuro è il comparatore che accelera la protezione
              dei liberi professionisti italiani. Polizze RC su misura,
              confrontate in tempo reale.
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 40, flexWrap: "wrap" }}>
              <Link href="/app" style={{ fontFamily: MONO, fontSize: 12, color: "rgba(249,250,251,0.45)", letterSpacing: "0.10em", borderBottom: "1px solid rgba(249,250,251,0.20)", paddingBottom: 2 }}>
                Scopri come funziona ↓
              </Link>
              <span style={{ fontFamily: MONO, fontSize: 11, color: "rgba(249,250,251,0.28)", letterSpacing: "0.08em" }}>
                Gratuito · Senza impegno · Nessun agente
              </span>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 64, flexWrap: "wrap", gap: 8 }}>
            <p style={{ fontFamily: MONO, fontSize: 11, color: "rgba(249,250,251,0.22)" }}>© 2025</p>
            <p style={{ fontFamily: MONO, fontSize: 11, color: "rgba(249,250,251,0.22)" }}>Milano · Roma</p>
          </div>
        </section>

        {/* ── MARQUEE ─────────────────────────────────────────────────────── */}
        <section
          data-theme9="slate"
          style={{ borderTop: `1px solid ${mid(0.10)}`, borderBottom: `1px solid ${mid(0.10)}`, padding: "20px 0", overflow: "hidden" }}
        >
          <div style={{ display: "flex", width: "max-content", animation: "ng-marquee 26s linear infinite" }}>
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span key={i} style={{ fontFamily: MONO, fontSize: 12, color: mid(0.38), padding: "0 28px", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
                {item}<span style={{ margin: "0 14px", opacity: 0.2 }}>·</span>
              </span>
            ))}
          </div>
        </section>

        {/* ── DIFFERENTIATORS — 3 columns ─────────────────────────────────── */}
        <section data-theme9="light" className="px-6 sm:px-12 py-28">
          <div className="max-w-7xl mx-auto">
            <p style={{ fontFamily: MONO, fontSize: 11, color: mid(0.32), letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 56 }}>
              Perché scelgosicuro
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 0 }}>
              {DIFFERENTIATORS.map((d, i) => (
                <div key={d.num} style={{
                  padding: "40px 40px 44px",
                  borderLeft: i > 0 ? `1px solid ${mid(0.09)}` : "none",
                  display: "flex", flexDirection: "column", gap: 16,
                }}>
                  <span style={{ fontFamily: MONO, fontSize: "clamp(2.5rem, 4vw, 4rem)", fontWeight: 300, lineHeight: 1, color: mid(0.07), letterSpacing: "-0.04em" }}>
                    {d.num}
                  </span>
                  <h3 style={{ fontSize: "clamp(1.1rem, 1.6vw, 1.4rem)", fontWeight: 500, lineHeight: 1.25 }}>
                    {d.title}
                  </h3>
                  <p style={{ fontSize: 13, lineHeight: 1.75, color: mid(0.45) }}>
                    {d.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── INTRO / MISSION ─────────────────────────────────────────────── */}
        <section data-theme9="light" className="px-6 sm:px-12 pb-28">
          <div className="max-w-7xl mx-auto" style={{ display: "grid", gridTemplateColumns: "repeat(12,1fr)", gap: 16, borderTop: `1px solid ${mid(0.08)}`, paddingTop: 56 }}>
            <div style={{ gridColumn: "span 4" }}>
              <p style={{ fontFamily: MONO, fontSize: "clamp(5rem, 12vw, 10rem)", fontWeight: 300, lineHeight: 1, color: mid(0.07), letterSpacing: "-0.04em" }}>
                5+
              </p>
            </div>
            <div style={{ gridColumn: "span 8", display: "flex", flexDirection: "column", justifyContent: "center", gap: 24 }}>
              <p style={{ fontFamily: MONO, fontSize: 11, color: mid(0.36), letterSpacing: "0.14em", textTransform: "uppercase" }}>La nostra piattaforma</p>
              <p style={{ fontSize: "clamp(1.2rem, 2.2vw, 1.7rem)", fontWeight: 400, lineHeight: 1.4, maxWidth: "38ch" }}>
                Confrontiamo offerte reali di AXA, AmTrust, Generali, Unipol e Allianz.
                Non stime — tariffari aggiornati, coperture verificate, proposta personalizzata sul tuo profilo di rischio.
              </p>
              <div style={{ display: "flex", gap: 28, flexWrap: "wrap", paddingTop: 4 }}>
                {["Medici", "Avvocati", "Ingegneri", "Commercialisti", "Architetti", "Consulenti"].map(p => (
                  <span key={p} style={{ fontFamily: MONO, fontSize: 11, color: mid(0.36), letterSpacing: "0.08em" }}>{p}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FULL-WIDTH EDITORIAL IMAGE ───────────────────────────────────── */}
        <div style={{ position: "relative", width: "100%", height: "52vh", overflow: "hidden" }}>
          <Image src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1800&q=80" alt="" fill className="object-cover" />
          <div style={{ position: "absolute", inset: 0, background: "rgba(12,16,24,0.15)" }} />
        </div>

        {/* ── PRODUCTS — all cards #f7f6f6 ────────────────────────────────── */}
        <section data-theme9="light" className="px-6 sm:px-12 py-24">
          <div className="max-w-7xl mx-auto">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 48, flexWrap: "wrap", gap: 16 }}>
              <p style={{ fontFamily: MONO, fontSize: 11, color: mid(0.38), letterSpacing: "0.14em", textTransform: "uppercase" }}>Le nostre coperture</p>
              <Link href="/app" style={{ fontFamily: MONO, fontSize: 12, color: mid(0.36), borderBottom: "1px solid currentColor", paddingBottom: 1 }}>
                Calcola il tuo preventivo →
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 2 }}>
              {PRODUCTS.map(p => (
                <div key={p.num} style={{
                  background: "#f7f6f6",
                  padding: "32px 28px",
                  display: "flex", flexDirection: "column", gap: 18, minHeight: 300,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: MONO, fontSize: 10, color: p.accent, letterSpacing: "0.12em", textTransform: "uppercase" }}>{p.tag}</span>
                    <span style={{ fontFamily: MONO, fontSize: 10, color: "rgba(12,16,24,0.22)" }}>{p.num}</span>
                  </div>
                  <h3 style={{ fontSize: "clamp(1.3rem, 2vw, 1.75rem)", fontWeight: 400, lineHeight: 1.2, color: "#0c1018" }}>
                    {p.title}
                  </h3>
                  <p style={{ fontSize: 13, lineHeight: 1.65, color: "rgba(12,16,24,0.50)", flexGrow: 1 }}>{p.desc}</p>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    {p.cats.map(c => (
                      <span key={c} style={{ fontFamily: MONO, fontSize: 10, color: p.accent, letterSpacing: "0.06em" }}>{c}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PROFESSIONAL PROFILES ───────────────────────────────────────── */}
        <section data-theme9="mist" className="px-6 sm:px-12 py-28">
          <div className="max-w-7xl mx-auto">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 56, flexWrap: "wrap", gap: 16 }}>
              <div>
                <p style={{ fontFamily: MONO, fontSize: 11, color: mid(0.32), letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>Per chi è</p>
                <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 3rem)", fontWeight: 400, lineHeight: 1.15, letterSpacing: "-0.02em", maxWidth: "28ch" }}>
                  Coperture su misura per ogni professione.
                </h2>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 2 }}>
              {PROFILES.map(pr => (
                <div key={pr.cat} style={{ background: "#fafafa", padding: "28px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
                  <div>
                    <p style={{ fontFamily: MONO, fontSize: 10, color: pr.accent, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>{pr.label}</p>
                    <h3 style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.2, color: "#0c1018" }}>{pr.cat}</h3>
                  </div>
                  <ul style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {pr.items.map(item => (
                      <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <span style={{ color: pr.accent, marginTop: 2, fontSize: 10, flexShrink: 0 }}>✦</span>
                        <span style={{ fontSize: 13, lineHeight: 1.55, color: "rgba(12,16,24,0.55)" }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PROCESS — 2 col: steps + photo ──────────────────────────────── */}
        <section data-theme9="light" className="px-6 sm:px-12 py-28">
          <div className="max-w-7xl mx-auto" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }}>
            <div>
              <p style={{ fontFamily: MONO, fontSize: 11, color: mid(0.30), letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 52 }}>
                Il nostro processo
              </p>
              {STEPS.map((s, i) => (
                <div key={s.n} style={{ padding: "28px 0", borderTop: `1px solid ${mid(0.09)}`, display: "flex", gap: 20 }}>
                  <span style={{ fontFamily: MONO, fontSize: "clamp(1.6rem, 2.5vw, 2.5rem)", fontWeight: 300, color: mid(0.10), lineHeight: 1, letterSpacing: "-0.03em", flexShrink: 0, width: 56 }}>
                    {s.n}
                  </span>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>{s.title}</h3>
                    <p style={{ fontSize: 13, lineHeight: 1.7, color: mid(0.42) }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ position: "relative", overflow: "hidden", borderRadius: 4, height: "68vh", top: 56 }}>
              <Image src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&q=80" alt="" fill className="object-cover" />
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS GRID ───────────────────────────────────────────── */}
        <section data-theme9="cream" className="px-6 sm:px-12 py-28">
          <div className="max-w-7xl mx-auto">
            <p style={{ fontFamily: MONO, fontSize: 11, color: mid(0.30), letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 48 }}>
              Cosa dicono i professionisti
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 2 }}>
              {TESTIMONIALS.map((tm, i) => (
                <div key={i} style={{ background: "#f7f6f6", padding: "36px 32px", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 32, minHeight: 260 }}>
                  <p style={{ fontSize: "clamp(1rem, 1.5vw, 1.15rem)", lineHeight: 1.55, fontStyle: "italic", color: "#0c1018" }}>
                    &ldquo;{tm.quote}&rdquo;
                  </p>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "#0c1018" }}>{tm.name}</p>
                    <p style={{ fontFamily: MONO, fontSize: 10, color: "rgba(12,16,24,0.40)", marginTop: 4, letterSpacing: "0.06em" }}>{tm.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── STATS — anchored forest green, never depends on wrapper ─────── */}
        <section
          data-theme9="forest"
          style={{ background: "#3b6331" }}
          className="px-6 sm:px-12 py-28"
        >
          <div className="max-w-7xl mx-auto" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
            {STATS.map((s, i) => (
              <div key={s.label} style={{ padding: "40px 32px", borderLeft: i > 0 ? "1px solid rgba(249,250,251,0.10)" : "none", borderTop: "1px solid rgba(249,250,251,0.10)" }}>
                <p style={{ fontFamily: MONO, fontSize: "clamp(2.2rem, 4.5vw, 3.8rem)", fontWeight: 300, lineHeight: 1, color: "#f9fafb", marginBottom: 14, letterSpacing: "-0.03em" }}>
                  {s.n}
                </p>
                <p style={{ fontFamily: MONO, fontSize: 10, color: "rgba(249,250,251,0.45)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────────────────────── */}
        <section data-theme9="light" className="px-6 sm:px-12 py-28">
          <div className="max-w-7xl mx-auto" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 64, alignItems: "start" }}>
            <div>
              <p style={{ fontFamily: MONO, fontSize: 11, color: mid(0.30), letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 20 }}>FAQ</p>
              <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 400, lineHeight: 1.2, letterSpacing: "-0.02em", marginBottom: 20 }}>
                Domande frequenti.
              </h2>
              <p style={{ fontSize: 13, color: mid(0.40), lineHeight: 1.7 }}>
                Non trovi risposta?{" "}
                <span style={{ borderBottom: "1px solid currentColor", cursor: "pointer" }}>Scrivici →</span>
              </p>
            </div>
            <div style={{ borderTop: `1px solid ${mid(0.09)}` }}>
              {FAQS.map((faq, i) => (
                <div key={i} style={{ borderBottom: `1px solid ${mid(0.09)}` }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "22px 0", background: "none", border: "none", cursor: "pointer", color: t.text, gap: 16, textAlign: "left" }}
                  >
                    <span style={{ fontSize: 15, fontWeight: 400 }}>{faq.q}</span>
                    <span style={{ fontFamily: MONO, fontSize: 18, color: mid(0.30), flexShrink: 0, transform: openFaq === i ? "rotate(45deg)" : "none", transition: "transform 0.2s" }}>+</span>
                  </button>
                  <div style={{ maxHeight: openFaq === i ? 200 : 0, overflow: "hidden", transition: "max-height 0.3s ease" }}>
                    <p style={{ fontSize: 13, lineHeight: 1.75, color: mid(0.45), paddingBottom: 22 }}>{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA / NEWSLETTER ────────────────────────────────────────────── */}
        <section data-theme9="light" className="px-6 sm:px-12 py-36" style={{ borderTop: `1px solid ${mid(0.09)}` }}>
          <div className="max-w-7xl mx-auto" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 64, alignItems: "start" }}>
            <div>
              <p style={{ fontFamily: MONO, fontSize: 10, color: mid(0.28), letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 24 }}>
                Dispatches dal mondo assicurativo
              </p>
              <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 3rem)", fontWeight: 400, lineHeight: 1.12, letterSpacing: "-0.02em", marginBottom: 20 }}>
                Ricevi aggiornamenti dal confine del mondo assicurativo.
              </h2>
              <p style={{ fontSize: 14, color: mid(0.40), lineHeight: 1.7 }}>
                Ogni mese condividiamo quello che vediamo, costruiamo e pensiamo sul mercato della RC professionale in Italia.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", gap: 2 }}>
                <input
                  type="email"
                  placeholder="La tua email professionale"
                  style={{ flex: 1, background: mid(0.04), border: `1px solid ${mid(0.11)}`, color: t.text, fontSize: 13, padding: "13px 16px", outline: "none" }}
                />
                <button style={{ background: "#0c1018", color: "#f9fafb", fontFamily: MONO, fontSize: 12, fontWeight: 600, padding: "13px 22px", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>
                  Iscriviti
                </button>
              </div>
              <p style={{ fontFamily: MONO, fontSize: 10, color: mid(0.24), letterSpacing: "0.06em" }}>
                Non condivideremo i tuoi dati. Iscrivendoti accetti la nostra Privacy Policy.
              </p>
              <div style={{ height: 1, background: mid(0.08), margin: "24px 0 20px" }} />
              <p style={{ fontSize: "clamp(1.5rem, 2.8vw, 2.4rem)", fontWeight: 400, lineHeight: 1.15, letterSpacing: "-0.02em" }}>
                Proteggi il tuo lavoro. Senza sorprese.
              </p>
              <Link href="/app" style={{ fontFamily: MONO, fontSize: 12, color: mid(0.38), marginTop: 12, letterSpacing: "0.10em", borderBottom: `1px solid ${mid(0.18)}`, paddingBottom: 2 }}>
                Calcola il preventivo →
              </Link>
            </div>
          </div>
        </section>

        {/* ── FOOTER — anchored dark, always #0c1018 ──────────────────────── */}
        <footer
          data-theme9="dark"
          style={{ background: "#0c1018", borderTop: "1px solid rgba(249,250,251,0.07)" }}
          className="px-6 sm:px-12 py-16"
        >
          <div className="max-w-7xl mx-auto" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 48, marginBottom: 56 }}>
            <div style={{ gridColumn: "span 2" }}>
              <p style={{ fontFamily: MONO, fontSize: 14, fontWeight: 500, color: "#f9fafb", marginBottom: 12 }}>scelgosicuro</p>
              <p style={{ fontSize: 13, color: "rgba(249,250,251,0.30)", lineHeight: 1.65, maxWidth: "28ch" }}>
                Intermediario assicurativo iscritto al R.U.I. presso IVASS.<br />P.IVA 12345678901
              </p>
            </div>
            <div>
              <p style={{ fontFamily: MONO, fontSize: 10, color: "rgba(249,250,251,0.26)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>Milano</p>
              <p style={{ fontSize: 13, color: "rgba(249,250,251,0.36)", lineHeight: 1.7 }}>info@scelgosicuro.it<br />+39 02 0000 0000</p>
            </div>
            <div>
              <p style={{ fontFamily: MONO, fontSize: 10, color: "rgba(249,250,251,0.26)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>Link</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {["Come funziona", "Professioni", "Chi siamo", "Privacy Policy", "Termini"].map(l => (
                  <span key={l} style={{ fontSize: 13, color: "rgba(249,250,251,0.30)", cursor: "pointer" }}>{l}</span>
                ))}
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(249,250,251,0.06)", paddingTop: 22, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <p style={{ fontFamily: MONO, fontSize: 10, color: "rgba(249,250,251,0.18)" }}>© 2025 ScelgoSicuro Srl. Tutti i diritti riservati.</p>
            <p style={{ fontFamily: MONO, fontSize: 10, color: "rgba(249,250,251,0.18)" }}>Regolato da IVASS — D.Lgs. 209/2005</p>
          </div>
        </footer>

      </div>
    </>
  )
}
