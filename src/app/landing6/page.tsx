"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { LandingNav } from "@/components/landing-nav"

// ─── PALETTE ──────────────────────────────────────────────────────────────────
const INK    = "#0C0C10"
const WHITE  = "#FFFFFF"
const CREAM  = "#F8F7F4"
const BLUE   = "#5B7CF6"
const MUTED  = "#8A8880"
const BORDER = "#E8E6DE"

// ─── DATA ─────────────────────────────────────────────────────────────────────

const FEATURE_GRID = [
  {
    img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=700&q=80",
    title: "Visibilità totale",
    desc: "Tutte le offerte disponibili per il tuo profilo, ordinate per prezzo e copertura.",
  },
  {
    img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=700&q=80",
    title: "Processo digitale",
    desc: "Dalla richiesta all'emissione, tutto online. Nessuna agenzia, nessun appuntamento.",
  },
  {
    img: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=700&q=80",
    title: "Documenti sempre pronti",
    desc: "Polizza, attestati e documenti accessibili da qualsiasi dispositivo, in ogni momento.",
  },
  {
    img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=700&q=80",
    title: "Supporto dedicato",
    desc: "Un consulente disponibile quando ne hai bisogno. Tecnologia e presenza umana insieme.",
  },
]

const STATS = [
  { n: "5+",    label: "Compagnie confrontate" },
  { n: "2 min", label: "Per un preventivo" },
  { n: "< 24h", label: "Polizza attiva" },
  { n: "100%",  label: "Digitale" },
]

const FAQ = [
  { q: "Il preventivo è davvero gratuito?", a: "Sì. Nessun costo nascosto, nessun obbligo di acquisto. Puoi calcolare il preventivo, confrontare le opzioni e decidere con calma." },
  { q: "Come viene scelta la polizza consigliata?", a: "Il sistema analizza il tuo profilo, i rischi del settore e le coperture disponibili per trovare la soluzione più coerente — non solo la più economica." },
  { q: "Posso vedere le alternative?", a: "Sempre. La piattaforma mostra la proposta consigliata e tutte le alternative disponibili. Trasparenza totale." },
  { q: "Cosa sono massimali, franchigie e retroattività?", a: "Sono i parametri che determinano la protezione reale. Te li spieghiamo in modo chiaro, senza linguaggio tecnico." },
  { q: "Posso parlare con un consulente?", a: "Sì. Se necessario puoi ricevere supporto dedicato. Tecnologia e presenza umana lavorano insieme." },
]

// ─── MOCKUP DASHBOARD ─────────────────────────────────────────────────────────

function DashboardMockup() {
  return (
    <div style={{
      background: "#111318",
      borderRadius: 16,
      overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.10)",
      boxShadow: "0 24px 80px rgba(0,0,0,0.40)",
    }}>
      <div style={{
        background: "rgba(255,255,255,0.05)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}>
        {["#FF5F57","#FEBC2E","#28C840"].map(c => (
          <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c, opacity: 0.7 }} />
        ))}
      </div>
      <div style={{ padding: "20px 20px 24px" }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.30)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 16 }}>
          Preventivo RC Professionale
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: BLUE, letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 4 }}>★ Consigliato</p>
            <p style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>AmTrust Medico Pro</p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", marginTop: 2 }}>Colpa grave · Retroattività 10a</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 24, fontWeight: 800, color: "#fff", lineHeight: 1 }}>€320</p>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>/anno</p>
          </div>
        </div>
        {[
          { name: "AXA Professionals", price: "€345" },
          { name: "Generali RC Pro", price: "€368" },
          { name: "Unipol Base+", price: "€298" },
        ].map(r => (
          <div key={r.name} style={{
            display: "flex", justifyContent: "space-between",
            padding: "9px 0",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{r.name}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.50)" }}>{r.price}</span>
          </div>
        ))}
        <div style={{
          marginTop: 18,
          background: BLUE,
          borderRadius: 8,
          padding: "9px 0",
          textAlign: "center",
          fontSize: 12,
          fontWeight: 700,
          color: "#fff",
        }}>
          Acquista polizza →
        </div>
      </div>
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function Landing6() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [scrolled,  setScrolled]  = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div style={{ background: WHITE, fontFamily: "var(--font-sans)" }}>

      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? `${INK}F8` : "transparent",
          backdropFilter: "blur(20px)",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "1px solid transparent",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-10 h-16 flex items-center justify-between">
          <span className="text-xl tracking-tight text-white" style={{ fontFamily: "var(--font-serif)" }}>
            scelgosicuro<span style={{ color: BLUE }}>.</span>
          </span>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/40">
            <a href="#funziona" className="hover:text-white/70 transition-colors">Come funziona</a>
            <a href="#faq" className="hover:text-white/70 transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <LandingNav current="6" variant="dark" />
            <Link href="/app" className="hidden sm:block text-sm font-semibold px-5 py-2.5 rounded-full text-white transition-all hover:opacity-85" style={{ background: BLUE }}>
              Preventivo →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO — full-bleed photo ─────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center text-center" style={{ minHeight: "100svh" }}>
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1800&q=80"
            alt=""
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0" style={{ background: "rgba(8,8,12,0.52)" }} />
          <div className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none" style={{ background: `linear-gradient(to bottom, transparent, ${INK})` }} />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <h1
            className="text-5xl sm:text-6xl lg:text-[4.5rem] text-white leading-[1.06] tracking-tight mb-7"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            La polizza giusta.<br />
            <em style={{ color: BLUE }}>Finalmente.</em>
          </h1>
          <p className="text-lg leading-relaxed mb-12 max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.52)" }}>
            Confrontiamo AXA, Generali, AmTrust e altre compagnie per trovare
            la copertura più adatta al tuo profilo professionale.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/app"
              className="px-7 py-3.5 rounded-full text-sm font-semibold text-white transition-all hover:opacity-88"
              style={{ background: BLUE, boxShadow: `0 0 28px ${BLUE}55` }}
            >
              Calcola il preventivo →
            </Link>
            <a
              href="#funziona"
              className="px-7 py-3.5 rounded-full text-sm font-semibold transition-all"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.72)", border: "1px solid rgba(255,255,255,0.14)" }}
            >
              Scopri come funziona
            </a>
          </div>
        </div>
      </section>

      {/* ── INTRO 2-COL — dark ──────────────────────────────────────────────── */}
      <section style={{ background: INK }} className="px-6 sm:px-10 py-28">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2
              className="text-4xl sm:text-5xl text-white tracking-tight leading-tight mb-8"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Tutto ciò che riguarda la tua copertura.{" "}
              <em style={{ color: "rgba(255,255,255,0.38)" }}>In un'unica piattaforma.</em>
            </h2>
            <ul className="space-y-4 mb-10">
              {[
                "Confronto multi-compagnia in tempo reale",
                "Analisi del profilo di rischio personalizzata",
                "Emissione polizza 100% digitale",
                "Documenti e rinnovi sempre accessibili",
              ].map(item => (
                <li key={item} className="flex items-start gap-3">
                  <span style={{ color: BLUE, marginTop: 3, flexShrink: 0, fontSize: 10 }}>✦</span>
                  <span className="text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.50)" }}>{item}</span>
                </li>
              ))}
            </ul>
            <Link href="/app" className="text-sm font-semibold transition-colors" style={{ color: BLUE, borderBottom: `1px solid ${BLUE}55`, paddingBottom: 1 }}>
              Avvia la demo →
            </Link>
          </div>
          <DashboardMockup />
        </div>
      </section>

      {/* ── LOGO BAR ─────────────────────────────────────────────────────────── */}
      <section className="py-14 px-6" style={{ background: CREAM, borderBottom: `1px solid ${BORDER}` }}>
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-center mb-8" style={{ color: "#BCBAB2" }}>
            Compagnie convenzionate
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14">
            {["AMTRUST", "AXA", "GENERALI", "UNIPOL", "ALLIANZ"].map(name => (
              <span key={name} className="text-xs font-bold tracking-[0.15em]" style={{ color: "#C8C6BE" }}>{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── LARGE PERSON PHOTO ──────────────────────────────────────────────── */}
      <section className="px-6 sm:px-10 pt-28 pb-0" style={{ background: WHITE }}>
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden" style={{ borderRadius: 32, aspectRatio: "16/7" }}>
            <Image
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1200&q=80"
              alt="Professionista assicurato con ScelgoSicuro"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── FEATURE MOCKUP 1 — preventivo ───────────────────────────────────── */}
      <section className="px-6 sm:px-10 py-28" style={{ background: WHITE }}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[10px] font-semibold tracking-[0.18em] uppercase mb-5" style={{ color: BLUE }}>Preventivo</p>
          <h2
            className="text-4xl sm:text-5xl tracking-tight mb-4 leading-tight"
            style={{ fontFamily: "var(--font-serif)", color: INK }}
          >
            Poche domande.<br /><em style={{ color: MUTED }}>Proposta immediata.</em>
          </h2>
          <p className="text-base leading-relaxed mb-14 max-w-md mx-auto" style={{ color: MUTED }}>
            Solo le informazioni che incidono sul rischio. Il sistema calcola la tua proposta personalizzata in tempo reale.
          </p>
          <div style={{
            background: CREAM,
            borderRadius: 20,
            border: `1px solid ${BORDER}`,
            padding: "28px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.05)",
            textAlign: "left",
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 18 }}>Calcola preventivo</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              {[
                { label: "Professione", value: "Medico chirurgo" },
                { label: "Attività",    value: "Libero professionista" },
              ].map(f => (
                <div key={f.label} style={{ background: WHITE, borderRadius: 10, border: `1px solid ${BORDER}`, padding: "12px 14px" }}>
                  <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: MUTED, marginBottom: 6 }}>{f.label}</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: INK }}>{f.value}</p>
                </div>
              ))}
            </div>
            <div style={{ background: WHITE, borderRadius: 10, border: `1px solid ${BORDER}`, padding: "12px 14px", marginBottom: 14 }}>
              <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: MUTED, marginBottom: 6 }}>Massimale</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#C8C6BE" }}>Seleziona…</p>
            </div>
            <div style={{ background: BLUE, borderRadius: 10, padding: "12px 0", textAlign: "center", fontSize: 13, fontWeight: 700, color: "#fff" }}>
              Calcola il preventivo →
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURE MOCKUP 2 — confronto ────────────────────────────────────── */}
      <section className="px-6 sm:px-10 pb-28" style={{ background: WHITE }}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[10px] font-semibold tracking-[0.18em] uppercase mb-5" style={{ color: "#3BAD6A" }}>Confronto</p>
          <h2
            className="text-4xl sm:text-5xl tracking-tight mb-4 leading-tight"
            style={{ fontFamily: "var(--font-serif)", color: INK }}
          >
            Cinque compagnie.<br /><em style={{ color: MUTED }}>Una schermata.</em>
          </h2>
          <p className="text-base leading-relaxed mb-14 max-w-md mx-auto" style={{ color: MUTED }}>
            Confronto reale sui tariffari aggiornati. Offerte effettive, con coperture e massimali spiegati chiaramente.
          </p>
          <div style={{
            background: CREAM,
            borderRadius: 20,
            border: `1px solid ${BORDER}`,
            padding: "24px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.05)",
            textAlign: "left",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: "0.14em", textTransform: "uppercase" }}>Risultati per il tuo profilo</p>
              <span style={{ fontSize: 11, fontWeight: 700, color: BLUE }}>5 offerte</span>
            </div>
            <div style={{ background: WHITE, borderRadius: 12, border: `2px solid ${BLUE}35`, padding: "14px 16px", marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: BLUE, letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 4 }}>★ Consigliato</p>
                  <p style={{ fontSize: 15, fontWeight: 800, color: INK }}>AmTrust Medico Protetto</p>
                  <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>Colpa grave · Retroattività 10a</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 22, fontWeight: 800, color: INK, lineHeight: 1 }}>€320</p>
                  <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>/anno</p>
                </div>
              </div>
            </div>
            {[
              { n: "AXA Professionals", p: "€345" },
              { n: "Generali RC Pro",   p: "€368" },
              { n: "Unipol Base+",      p: "€298" },
            ].map(r => (
              <div key={r.n} style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px", borderBottom: `1px solid ${BORDER}` }}>
                <span style={{ fontSize: 13, color: MUTED }}>{r.n}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>{r.p}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SINGLE QUOTE ─────────────────────────────────────────────────────── */}
      <section
        className="py-24 px-6 text-center"
        style={{ background: CREAM, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}
      >
        <div className="max-w-2xl mx-auto">
          <p
            className="text-2xl sm:text-3xl leading-relaxed mb-8"
            style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: INK }}
          >
            &ldquo;Finalmente un tool che non mi chiede l&apos;impossibile.
            Preventivo in 3 minuti, polizza emessa il giorno dopo.&rdquo;
          </p>
          <p className="text-sm font-semibold" style={{ color: INK }}>Dr. Marco R.</p>
          <p className="text-xs mt-1" style={{ color: MUTED }}>Medico di base, Milano</p>
        </div>
      </section>

      {/* ── GET STARTED — steps + dark photo ────────────────────────────────── */}
      <section id="funziona" className="px-6 sm:px-10 py-28" style={{ background: WHITE }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase mb-5" style={{ color: BLUE }}>Come funziona</p>
            <h2
              className="text-4xl sm:text-5xl tracking-tight leading-tight mb-10"
              style={{ fontFamily: "var(--font-serif)", color: INK }}
            >
              Inizia velocemente.<br />
              <em style={{ color: MUTED }}>Non smettere mai di crescere.</em>
            </h2>
            <div className="space-y-8">
              {[
                { n: "01", t: "Scegli professione e settore",    d: "Il sistema carica le domande specifiche per il tuo profilo." },
                { n: "02", t: "Rispondi a poche domande chiave", d: "Solo ciò che incide davvero sulla copertura. Niente burocrazia." },
                { n: "03", t: "Ricevi la proposta più adatta",   d: "Soluzione consigliata + alternative, con coperture spiegate chiaramente." },
              ].map(s => (
                <div key={s.n} className="flex gap-5">
                  <span className="text-2xl font-mono font-light flex-shrink-0 w-10" style={{ color: `${BLUE}60` }}>{s.n}</span>
                  <div>
                    <p className="font-semibold text-base mb-1" style={{ color: INK }}>{s.t}</p>
                    <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/app"
              className="inline-block mt-10 text-sm font-semibold"
              style={{ color: INK, borderBottom: `1px solid ${BORDER}`, paddingBottom: 1 }}
            >
              Avvia il preventivo →
            </Link>
          </div>
          <div className="relative overflow-hidden" style={{ borderRadius: 32, aspectRatio: "4/5" }}>
            <Image
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"
              alt=""
              fill
              className="object-cover"
            />
            <div className="absolute inset-0" style={{ background: "rgba(8,8,12,0.28)" }} />
          </div>
        </div>
      </section>

      {/* ── ZERO AGENTI — circular image + bullets ──────────────────────────── */}
      <section className="px-6 sm:px-10 py-28" style={{ background: CREAM }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="flex items-center justify-center order-2 lg:order-1">
            <div className="relative overflow-hidden rounded-full" style={{ width: 360, height: 360, maxWidth: "100%", flexShrink: 0 }}>
              <Image
                src="https://images.unsplash.com/photo-1607706189992-eae578626c86?w=800&q=80"
                alt=""
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <h2
              className="text-4xl sm:text-5xl tracking-tight leading-tight mb-8"
              style={{ fontFamily: "var(--font-serif)", color: INK }}
            >
              Smetti di sprecare tempo con gli agenti.{" "}
              <em style={{ color: MUTED }}>Usalo per crescere.</em>
            </h2>
            <ul className="space-y-4">
              {[
                "Confronta offerte reali da 5 compagnie in 2 minuti",
                "Nessuna chiamata, nessun appuntamento in agenzia",
                "Fino al 30% di risparmio rispetto al canale tradizionale",
                "Rinnovi automatici con alert prima della scadenza",
              ].map(item => (
                <li key={item} className="flex items-start gap-3">
                  <span style={{ color: BLUE, marginTop: 3, flexShrink: 0, fontSize: 10 }}>✦</span>
                  <span className="text-base leading-relaxed" style={{ color: MUTED }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── 2×2 FEATURE GRID ────────────────────────────────────────────────── */}
      <section className="px-6 sm:px-10 py-28" style={{ background: WHITE }}>
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] font-semibold tracking-[0.18em] uppercase mb-5" style={{ color: BLUE }}>La piattaforma</p>
          <h2
            className="text-4xl sm:text-5xl tracking-tight leading-tight mb-16 max-w-xl"
            style={{ fontFamily: "var(--font-serif)", color: INK }}
          >
            Gestisci la tua copertura<br />
            <em style={{ color: MUTED }}>come un professionista.</em>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURE_GRID.map((f, i) => (
              <div key={i} className="overflow-hidden" style={{ border: `1px solid ${BORDER}`, borderRadius: 28 }}>
                <div className="relative" style={{ aspectRatio: "16/9" }}>
                  <Image src={f.img} alt={f.title} fill className="object-cover" />
                </div>
                <div style={{ padding: "28px 28px 32px" }}>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: INK }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────────────── */}
      <section
        className="py-28 px-6 sm:px-10 text-center"
        style={{ background: CREAM, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}
      >
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl tracking-tight mb-16 max-w-lg mx-auto leading-tight"
            style={{ fontFamily: "var(--font-serif)", color: INK }}
          >
            Stai costruendo qualcosa che dura.<br />
            <em style={{ color: MUTED }}>Anche noi.</em>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {STATS.map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-5xl sm:text-6xl tracking-tight mb-2" style={{ fontFamily: "var(--font-serif)", color: INK }}>{s.n}</p>
                <p className="text-[10px] font-semibold tracking-[0.12em] uppercase" style={{ color: MUTED }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-28 px-6 sm:px-10" style={{ background: WHITE }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase mb-5" style={{ color: BLUE }}>FAQ</p>
            <h2 className="text-4xl tracking-tight leading-tight mb-6" style={{ fontFamily: "var(--font-serif)", color: INK }}>
              Domande frequenti
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
              Non trovi risposta?{" "}
              <span className="cursor-pointer" style={{ color: INK, borderBottom: `1px solid ${BLUE}` }}>Scrivici →</span>
            </p>
          </div>
          <div className="md:col-span-2" style={{ borderTop: `1px solid ${BORDER}` }}>
            {FAQ.map((item, i) => (
              <div key={i} style={{ borderBottom: `1px solid ${BORDER}` }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between py-6 text-left gap-4"
                >
                  <span className="text-base font-medium" style={{ color: INK }}>{item.q}</span>
                  <span
                    className="text-xl flex-shrink-0 transition-transform duration-200"
                    style={{ color: MUTED, transform: openFaq === i ? "rotate(45deg)" : "none" }}
                  >
                    +
                  </span>
                </button>
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{ maxHeight: openFaq === i ? "200px" : "0" }}
                >
                  <p className="pb-6 text-sm leading-relaxed" style={{ color: MUTED }}>{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DARK CTA — immagine circolare ────────────────────────────────────── */}
      <section className="py-28 px-6 text-center" style={{ background: INK }}>
        <div className="max-w-2xl mx-auto">
          <div
            className="relative overflow-hidden rounded-full mx-auto mb-14"
            style={{ width: 180, height: 180 }}
          >
            <Image
              src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80"
              alt=""
              fill
              className="object-cover"
            />
            <div
              className="absolute inset-0 flex items-center justify-center text-3xl"
              style={{ background: "rgba(8,8,12,0.40)" }}
            >
              🔒
            </div>
          </div>
          <h2
            className="text-5xl sm:text-6xl text-white tracking-tight mb-7 leading-tight"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Inizia adesso.<br />
            <em style={{ color: BLUE }}>Bastano 2 minuti.</em>
          </h2>
          <p className="text-base leading-relaxed mb-12" style={{ color: "rgba(255,255,255,0.35)" }}>
            Confronta le migliori polizze RC professionale. Gratis, senza impegno, senza agenti.
          </p>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-9 py-4 rounded-full text-white font-semibold text-base transition-all hover:opacity-88"
            style={{ background: BLUE, boxShadow: `0 0 40px ${BLUE}44` }}
          >
            Calcola il tuo preventivo →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="py-16 px-6 sm:px-10" style={{ background: INK, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-12">
          <div>
            <p className="text-xl text-white mb-2" style={{ fontFamily: "var(--font-serif)" }}>
              scelgosicuro<span style={{ color: BLUE }}>.</span>
            </p>
            <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.20)" }}>
              Intermediario assicurativo iscritto al R.U.I. presso IVASS.<br />P.IVA 12345678901
            </p>
          </div>
          <div
            className="grid grid-cols-2 md:grid-cols-3 gap-10 text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.22)" }}
          >
            {[
              { title: "Professioni", links: ["Medici", "Avvocati", "Ingegneri", "Commercialisti"] },
              { title: "Azienda",     links: ["Chi siamo", "Come funziona", "Contatti"] },
              { title: "Legale",      links: ["Privacy Policy", "Termini", "Cookie"] },
            ].map(col => (
              <div key={col.title} className="space-y-3">
                <p style={{ color: "rgba(255,255,255,0.45)" }}>{col.title}</p>
                {col.links.map(l => (
                  <p key={l} className="cursor-pointer hover:text-white/40 transition-colors">{l}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div
          className="max-w-6xl mx-auto mt-12 pt-6 flex flex-col sm:flex-row justify-between gap-2 text-[10px]"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.14)" }}
        >
          <p>© 2025 ScelgoSicuro Srl. Tutti i diritti riservati.</p>
          <p>Regolato da IVASS — D.Lgs. 209/2005</p>
        </div>
      </footer>

    </div>
  )
}
