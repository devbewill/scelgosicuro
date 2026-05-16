"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { LandingNav } from "@/components/landing-nav"

// ─── THEMES ───────────────────────────────────────────────────────────────────
// Journey: slate (hero) → slate (marquee) → light → green → mist → cream → forest → light (CTA) → dark (footer)
// Never returns to pure black until the very last section.
const THEMES = {
  slate:  { bg: "#7e98bc", text: "#f9fafb", isDark: true  },
  dark:   { bg: "#0c1018", text: "#f9fafb", isDark: true  },
  light:  { bg: "#f9fafb", text: "#0c1018", isDark: false },
  green:  { bg: "#e8f2df", text: "#0c1018", isDark: false },
  mist:   { bg: "#dde6f2", text: "#0c1018", isDark: false },
  cream:  { bg: "#fdf5e0", text: "#0c1018", isDark: false },
  forest: { bg: "#3b6331", text: "#f9fafb", isDark: true  },
} as const
type Theme = keyof typeof THEMES

// ─── DATA ─────────────────────────────────────────────────────────────────────
const MARQUEE_ITEMS = [
  "RC Professionale", "Colpa Grave", "Tutela Legale", "Retroattività",
  "AXA", "AmTrust", "Generali", "Unipol", "Allianz",
  "Medici", "Avvocati", "Ingegneri", "Commercialisti", "Architetti", "Consulenti",
]

const PRODUCTS = [
  {
    num: "01", tag: "Copertura base", title: "RC Professionale",
    desc: "La responsabilità civile professionale è il punto di partenza: copre i danni causati a terzi nell'esercizio della tua attività.",
    cats: ["Medici", "Avvocati", "Ingegneri"],
    accent: "#3b6331", accentBg: "#daeecb",
  },
  {
    num: "02", tag: "Protezione estesa", title: "Colpa Grave Extra",
    desc: "Estende la copertura alle responsabilità più gravi, inclusi errori di diagnosi, malpractice e atti dei collaboratori.",
    cats: ["Medici", "Sanitari", "Chirurghi"],
    accent: "#903c27", accentBg: "#fce8df",
  },
  {
    num: "03", tag: "Assistenza legale", title: "Tutela Legale",
    desc: "Spese legali, onorari e costi processuali coperti. Difesa attiva in ogni fase del procedimento, senza franchigia.",
    cats: ["Studi associati", "Aziende"],
    accent: "#1e3a5f", accentBg: "#dde6f2",
  },
  {
    num: "04", tag: "Continuità temporale", title: "Retroattività & RC Postuma",
    desc: "Copertura attiva anche per sinistri emersi dopo la scadenza o relativi ad attività svolte in passato.",
    cats: ["Tutti i professionisti"],
    accent: "#3b6331", accentBg: "#daeecb",
  },
]

const STEPS = [
  { n: "01", title: "Identifica", desc: "Selezioniamo il tuo profilo partendo da professione, attività e struttura. Nessun questionario infinito." },
  { n: "02", title: "Confronta",  desc: "Il motore analizza offerte reali da 5 compagnie e le ordina per coerenza con il tuo profilo di rischio." },
  { n: "03", title: "Scegli",     desc: "Una proposta consigliata, più le alternative. Massimali, franchigie e clausole spiegate in modo leggibile." },
  { n: "04", title: "Proteggi",   desc: "Polizza emessa in meno di 24 ore. Documenti digitali, rinnovi automatici. Zero agenzie, zero code." },
]

const STATS = [
  { n: "5+",    label: "Compagnie confrontate"       },
  { n: "2 min", label: "Per un preventivo completo"  },
  { n: "< 24h", label: "Dalla richiesta alla polizza" },
  { n: "100%",  label: "Digitale, senza intermediari" },
]

const MONO = "var(--font-dm-mono, 'DM Mono', monospace)"

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function Landing9() {
  // Start at slate so the wrapper bg matches the hero gradient bottom
  const [theme, setTheme] = useState<Theme>("slate")

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("[data-theme9]")
    // 10% band in the centre — only one section can be active at a time
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
  const mid = (a: number) =>
    t.isDark ? `rgba(249,250,251,${a})` : `rgba(12,16,24,${a})`

  // 2 s linear — user requested very slow and linear
  const TRANS = "2s linear"

  return (
    <>
      <style>{`
        @keyframes ng-marquee {
          from { transform: translateX(0) }
          to   { transform: translateX(-50%) }
        }
      `}</style>

      {/* PAGE WRAPPER */}
      <div
        style={{
          background: t.bg,
          color: t.text,
          transition: `background-color ${TRANS}, color ${TRANS}`,
          fontFamily: "'Inter', system-ui, sans-serif",
          minHeight: "100vh",
        }}
      >

        {/* ── NAVBAR ──────────────────────────────────────────────────────── */}
        <nav
          className="fixed top-0 left-0 right-0 z-50"
          style={{
            background: t.isDark ? "rgba(12,16,24,0.82)" : `${t.bg}e8`,
            borderBottom: `1px solid ${mid(0.08)}`,
            backdropFilter: "blur(20px)",
            transition: `background ${TRANS}`,
          }}
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-12 h-14 flex items-center justify-between">
            <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 500, letterSpacing: "0.02em", color: t.text, transition: `color ${TRANS}` }}>
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
                  transition: `all ${TRANS}`,
                }}
              >
                Preventivo →
              </Link>
            </div>
          </div>
        </nav>

        {/* ── HERO — gradient from #0c1018 top to #7e98bc bottom ──────────── */}
        {/* Section has its own background that overrides the wrapper */}
        <section
          data-theme9="slate"
          style={{
            minHeight: "100svh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            // gradient: pure black at top, starts clearing at 20%, reaches slate (#7e98bc) at 100%
            background: "linear-gradient(to bottom, #0c1018 0%, #0c1018 20%, #3d6080 65%, #7e98bc 100%)",
            padding: "0 48px 56px",
            paddingTop: "10vh",
          }}
          className="px-6 sm:px-12"
        >
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: 80 }}>
            <p style={{ fontFamily: MONO, fontSize: 11, color: "rgba(249,250,251,0.40)", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 48 }}>
              Intermediario assicurativo — RC Professionale
            </p>
            {/* Headline: no maxWidth cap, font tuned to land on ~3 lines */}
            <h1 style={{
              fontSize: "clamp(2rem, 4.2vw, 5rem)",
              fontWeight: 400,
              lineHeight: 1.08,
              letterSpacing: "-0.025em",
              marginBottom: 52,
              color: "#f9fafb",
            }}>
              ScelgoSicuro è il comparatore che accelera la protezione
              dei liberi professionisti italiani. Polizze RC su misura,
              confrontate in tempo reale.
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 40, flexWrap: "wrap" }}>
              <Link href="/app" style={{
                fontFamily: MONO, fontSize: 12, color: "rgba(249,250,251,0.45)", letterSpacing: "0.10em",
                borderBottom: "1px solid rgba(249,250,251,0.20)", paddingBottom: 2,
              }}>
                Il nostro lavoro ↓
              </Link>
              <span style={{ fontFamily: MONO, fontSize: 11, color: "rgba(249,250,251,0.28)", letterSpacing: "0.08em" }}>
                Gratuito · Senza impegno · Nessun agente
              </span>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingTop: 64, flexWrap: "wrap", gap: 8 }}>
            <p style={{ fontFamily: MONO, fontSize: 11, color: "rgba(249,250,251,0.22)" }}>© 2025</p>
            <p style={{ fontFamily: MONO, fontSize: 11, color: "rgba(249,250,251,0.22)" }}>Milano · Roma</p>
          </div>
        </section>

        {/* ── SECTORS MARQUEE ─────────────────────────────────────────────── */}
        <section
          data-theme9="slate"
          style={{ borderTop: `1px solid ${mid(0.10)}`, borderBottom: `1px solid ${mid(0.10)}`, padding: "20px 0", overflow: "hidden" }}
        >
          <div style={{ display: "flex", width: "max-content", animation: "ng-marquee 26s linear infinite" }}>
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span key={i} style={{ fontFamily: MONO, fontSize: 12, color: mid(0.38), padding: "0 28px", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
                {item}
                <span style={{ margin: "0 14px", opacity: 0.2 }}>·</span>
              </span>
            ))}
          </div>
        </section>

        {/* ── INTRO / MISSION ─────────────────────────────────────────────── */}
        <section data-theme9="light" className="px-6 sm:px-12 py-36">
          <div className="max-w-7xl mx-auto" style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 16 }}>
            <div style={{ gridColumn: "span 4" }}>
              <p style={{
                fontFamily: MONO, fontSize: "clamp(5rem, 12vw, 10rem)", fontWeight: 300,
                lineHeight: 1, color: mid(0.07), letterSpacing: "-0.04em",
              }}>
                5+
              </p>
            </div>
            <div style={{ gridColumn: "span 8", display: "flex", flexDirection: "column", justifyContent: "center", gap: 24 }}>
              <p style={{ fontFamily: MONO, fontSize: 11, color: mid(0.38), letterSpacing: "0.14em", textTransform: "uppercase" }}>
                La nostra piattaforma
              </p>
              <p style={{ fontSize: "clamp(1.25rem, 2.2vw, 1.75rem)", fontWeight: 400, lineHeight: 1.4, maxWidth: "38ch" }}>
                Confrontiamo offerte reali di AXA, AmTrust, Generali, Unipol e Allianz.
                Non stime — tariffari aggiornati, coperture verificate, proposta personalizzata
                sul tuo profilo di rischio.
              </p>
              <div style={{ display: "flex", gap: 28, flexWrap: "wrap", paddingTop: 4 }}>
                {["Medici", "Avvocati", "Ingegneri", "Commercialisti", "Architetti", "Consulenti"].map(p => (
                  <span key={p} style={{ fontFamily: MONO, fontSize: 11, color: mid(0.38), letterSpacing: "0.08em" }}>{p}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FULL-WIDTH EDITORIAL IMAGE ───────────────────────────────────── */}
        <div style={{ position: "relative", width: "100%", height: "52vh", overflow: "hidden" }}>
          <Image
            src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1800&q=80"
            alt=""
            fill
            className="object-cover"
          />
          <div style={{ position: "absolute", inset: 0, background: "rgba(12,16,24,0.18)" }} />
        </div>

        {/* ── PRODUCTS GRID ───────────────────────────────────────────────── */}
        <section data-theme9="green" className="px-6 sm:px-12 py-24">
          <div className="max-w-7xl mx-auto">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 48, flexWrap: "wrap", gap: 16 }}>
              <p style={{ fontFamily: MONO, fontSize: 11, color: mid(0.40), letterSpacing: "0.14em", textTransform: "uppercase" }}>
                Le nostre coperture
              </p>
              <Link href="/app" style={{ fontFamily: MONO, fontSize: 12, color: mid(0.38), borderBottom: "1px solid currentColor", paddingBottom: 1 }}>
                Calcola il tuo preventivo →
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 2 }}>
              {PRODUCTS.map(p => (
                <div key={p.num} style={{
                  background: p.accentBg, padding: "32px 28px",
                  display: "flex", flexDirection: "column", gap: 18, minHeight: 300,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: MONO, fontSize: 10, color: p.accent, letterSpacing: "0.12em", textTransform: "uppercase" }}>{p.tag}</span>
                    <span style={{ fontFamily: MONO, fontSize: 10, color: "rgba(12,16,24,0.25)" }}>{p.num}</span>
                  </div>
                  <h3 style={{ fontSize: "clamp(1.3rem, 2vw, 1.75rem)", fontWeight: 400, lineHeight: 1.2, color: "#0c1018" }}>
                    {p.title}
                  </h3>
                  <p style={{ fontSize: 13, lineHeight: 1.65, color: "rgba(12,16,24,0.52)", flexGrow: 1 }}>
                    {p.desc}
                  </p>
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

        {/* ── PROCESS — 2 col: steps + photo ──────────────────────────────── */}
        <section data-theme9="mist" className="px-6 sm:px-12 py-28">
          <div className="max-w-7xl mx-auto" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }} >
            <div>
              <p style={{ fontFamily: MONO, fontSize: 11, color: mid(0.32), letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 56 }}>
                Il nostro processo
              </p>
              {STEPS.map((s, i) => (
                <div key={s.n} style={{
                  padding: "32px 0",
                  borderTop: `1px solid ${mid(0.12)}`,
                  display: "flex", flexDirection: "column", gap: 14,
                }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 20 }}>
                    <span style={{ fontFamily: MONO, fontSize: "clamp(1.8rem, 3vw, 3rem)", fontWeight: 300, color: mid(0.12), lineHeight: 1, letterSpacing: "-0.03em" }}>
                      {s.n}
                    </span>
                    <h3 style={{ fontSize: 20, fontWeight: 400 }}>{s.title}</h3>
                  </div>
                  <p style={{ fontSize: 13, lineHeight: 1.7, color: mid(0.45) }}>{s.desc}</p>
                </div>
              ))}
            </div>
            {/* Editorial photo */}
            <div style={{ position: "relative", overflow: "hidden", borderRadius: 4, height: "70vh", top: 64 }}>
              <Image
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&q=80"
                alt=""
                fill
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* ── TESTIMONIAL ─────────────────────────────────────────────────── */}
        <section data-theme9="cream" className="px-6 sm:px-12 py-36 text-center">
          <div style={{ maxWidth: 820, margin: "0 auto" }}>
            <p style={{ fontFamily: MONO, fontSize: 10, color: mid(0.32), letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 44 }}>
              Cosa dicono i professionisti
            </p>
            <blockquote style={{
              fontSize: "clamp(1.5rem, 3.2vw, 2.6rem)", fontWeight: 400,
              lineHeight: 1.25, letterSpacing: "-0.02em", marginBottom: 40, color: "#0c1018",
            }}>
              &ldquo;Finalmente uno strumento che non mi chiede l&rsquo;impossibile.
              Preventivo in 3 minuti, polizza emessa il giorno dopo. Nessun agente, nessuna attesa.&rdquo;
            </blockquote>
            <p style={{ fontFamily: MONO, fontSize: 12, color: mid(0.40) }}>
              Dr. Marco R. — Medico di base, Milano
            </p>
          </div>
        </section>

        {/* ── STATS ───────────────────────────────────────────────────────── */}
        <section data-theme9="forest" className="px-6 sm:px-12 py-28">
          <div className="max-w-7xl mx-auto" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
            {STATS.map((s, i) => (
              <div key={s.label} style={{
                padding: "44px 32px",
                borderLeft: i > 0 ? "1px solid rgba(249,250,251,0.10)" : "none",
                borderTop: "1px solid rgba(249,250,251,0.10)",
              }}>
                <p style={{
                  fontFamily: MONO, fontSize: "clamp(2.2rem, 4.5vw, 3.8rem)",
                  fontWeight: 300, lineHeight: 1, color: "#f9fafb", marginBottom: 14, letterSpacing: "-0.03em",
                }}>
                  {s.n}
                </p>
                <p style={{ fontFamily: MONO, fontSize: 10, color: "rgba(249,250,251,0.45)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA / NEWSLETTER — light, never returns to dark ─────────────── */}
        <section data-theme9="light" className="px-6 sm:px-12 py-36">
          <div className="max-w-7xl mx-auto" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 64, alignItems: "start" }}>
            <div>
              <p style={{ fontFamily: MONO, fontSize: 10, color: mid(0.30), letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 28 }}>
                Dispatches dal mondo assicurativo
              </p>
              <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 3rem)", fontWeight: 400, lineHeight: 1.12, letterSpacing: "-0.02em", marginBottom: 20 }}>
                Ricevi aggiornamenti dal confine del mondo assicurativo.
              </h2>
              <p style={{ fontSize: 14, color: mid(0.42), lineHeight: 1.7 }}>
                Ogni mese condividiamo quello che vediamo, costruiamo e pensiamo
                sul mercato della RC professionale in Italia.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", gap: 2 }}>
                <input
                  type="email"
                  placeholder="La tua email professionale"
                  style={{
                    flex: 1, background: mid(0.04),
                    border: `1px solid ${mid(0.12)}`,
                    color: t.text, fontSize: 13, padding: "13px 16px", outline: "none",
                  }}
                />
                <button style={{
                  background: "#0c1018", color: "#f9fafb",
                  fontFamily: MONO, fontSize: 12, fontWeight: 600,
                  padding: "13px 22px", border: "none", cursor: "pointer", whiteSpace: "nowrap",
                }}>
                  Iscriviti
                </button>
              </div>
              <p style={{ fontFamily: MONO, fontSize: 10, color: mid(0.25), letterSpacing: "0.06em" }}>
                Non condivideremo i tuoi dati. Iscrivendoti accetti la nostra Privacy Policy.
              </p>
              <div style={{ height: 1, background: mid(0.08), margin: "28px 0 24px" }} />
              <p style={{ fontSize: "clamp(1.6rem, 2.8vw, 2.5rem)", fontWeight: 400, lineHeight: 1.15, letterSpacing: "-0.02em" }}>
                Proteggi il tuo lavoro. Senza sorprese.
              </p>
              <Link href="/app" style={{
                fontFamily: MONO, fontSize: 12, color: mid(0.40), marginTop: 12,
                letterSpacing: "0.10em", borderBottom: `1px solid ${mid(0.20)}`, paddingBottom: 2,
              }}>
                Calcola il preventivo →
              </Link>
            </div>
          </div>
        </section>

        {/* ── FOOTER — dark only at the very end ──────────────────────────── */}
        <footer data-theme9="dark" className="px-6 sm:px-12 py-16" style={{ borderTop: `1px solid rgba(249,250,251,0.07)` }}>
          <div className="max-w-7xl mx-auto" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 48, marginBottom: 56 }}>
            <div style={{ gridColumn: "span 2" }}>
              <p style={{ fontFamily: MONO, fontSize: 14, fontWeight: 500, color: "#f9fafb", marginBottom: 12 }}>scelgosicuro</p>
              <p style={{ fontSize: 13, color: "rgba(249,250,251,0.32)", lineHeight: 1.65, maxWidth: "28ch" }}>
                Intermediario assicurativo iscritto al R.U.I. presso IVASS.<br />P.IVA 12345678901
              </p>
            </div>
            <div>
              <p style={{ fontFamily: MONO, fontSize: 10, color: "rgba(249,250,251,0.28)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>Milano</p>
              <p style={{ fontSize: 13, color: "rgba(249,250,251,0.38)", lineHeight: 1.7 }}>info@scelgosicuro.it<br />+39 02 0000 0000</p>
            </div>
            <div>
              <p style={{ fontFamily: MONO, fontSize: 10, color: "rgba(249,250,251,0.28)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>Link</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {["Come funziona", "Professioni", "Chi siamo", "Privacy Policy", "Termini"].map(l => (
                  <span key={l} style={{ fontSize: 13, color: "rgba(249,250,251,0.32)", cursor: "pointer" }}>{l}</span>
                ))}
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(249,250,251,0.06)", paddingTop: 22, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <p style={{ fontFamily: MONO, fontSize: 10, color: "rgba(249,250,251,0.20)" }}>© 2025 ScelgoSicuro Srl. Tutti i diritti riservati.</p>
            <p style={{ fontFamily: MONO, fontSize: 10, color: "rgba(249,250,251,0.20)" }}>Regolato da IVASS — D.Lgs. 209/2005</p>
          </div>
        </footer>

      </div>
    </>
  )
}
