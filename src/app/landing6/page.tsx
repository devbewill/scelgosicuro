"use client"

import { useState } from "react"
import Link from "next/link"
import { LandingNav } from "@/components/landing-nav"

// ─── PALETTE ──────────────────────────────────────────────────────────────────
const INK     = "#0C0C10"
const CREAM   = "#F4F3EE"
const BLUE    = "#5B7CF6"
const MUTED   = "#878780"
const BORDER  = "#E6E4DC"

// ─── DATA ─────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    tag: "Semplicità",
    title: "Poche domande, preventivo in 2 minuti.",
    desc: "Ti chiediamo solo quello che serve. Professione, attività, responsabilità. Niente moduli infiniti, nessuna chiamata.",
    bg: "#EBF0FC",
    dot: "#5B7CF6",
  },
  {
    tag: "Analisi",
    title: "Il sistema valuta il tuo profilo di rischio.",
    desc: "Non solo il prezzo. ScelgoSicuro analizza coperture, massimali, retroattività e clausole per trovare la soluzione più coerente con il tuo lavoro.",
    bg: "#EAF5EE",
    dot: "#3BAD6A",
  },
  {
    tag: "Confronto reale",
    title: "Cinque compagnie, un'unica schermata.",
    desc: "AXA, AmTrust, Generali, Unipol, Allianz. Non una proposta sola — un confronto trasparente tra le offerte disponibili per il tuo settore.",
    bg: "#F5F0E6",
    dot: "#D49C3A",
  },
  {
    tag: "Velocità",
    title: "Polizza attiva in meno di 24 ore.",
    desc: "Tutto digitale. Nessuna agenzia, nessun appuntamento. Dal preventivo all'emissione, senza uscire dalla scrivania.",
    bg: "#F0E8F5",
    dot: "#9B68F0",
  },
]

const STEPS = [
  { n: "01", title: "Inserisci professione e settore", desc: "Medico, avvocato, ingegnere, consulente. Il sistema carica le domande specifiche per il tuo profilo." },
  { n: "02", title: "Rispondi a poche domande chiave", desc: "Struttura, volume d'affari, rischi specifici. Solo ciò che incide davvero sulla copertura." },
  { n: "03", title: "Ricevi la proposta più adatta", desc: "Una soluzione consigliata, più le alternative disponibili. Con spiegazioni chiare su cosa copre e cosa no." },
]

const TESTIMONIALS = [
  {
    quote: "Finalmente un tool che non mi chiede l'impossibile. Preventivo in 3 minuti, polizza emessa il giorno dopo.",
    name: "Dr. Marco R.",
    role: "Medico di base, Milano",
  },
  {
    quote: "Come avvocato avevo bisogno di coperture specifiche sulla colpa grave. ScelgoSicuro le ha trovate subito, senza dover spiegare tutto a un agente.",
    name: "Avv. Laura P.",
    role: "Studio legale, Roma",
  },
  {
    quote: "Nessun agente, nessuna attesa. Il sistema mi ha proposto la polizza giusta al primo colpo. Ho confrontato tre compagnie in dieci minuti.",
    name: "Ing. Davide C.",
    role: "Ingegnere strutturista, Torino",
  },
]

const STATS = [
  { n: "2 min", label: "Per ottenere un preventivo" },
  { n: "5+", label: "Compagnie confrontate" },
  { n: "100%", label: "Online, zero burocrazia" },
  { n: "< 24h", label: "Polizza attiva" },
]

const FAQ = [
  { q: "Il preventivo è davvero gratuito?", a: "Sì. Nessun costo nascosto, nessun obbligo di acquisto. Puoi calcolare il preventivo, confrontare e decidere con calma." },
  { q: "Come viene scelta la polizza consigliata?", a: "Il sistema analizza il tuo profilo, i rischi del settore e le coperture disponibili per trovare la soluzione più coerente — non solo la più economica." },
  { q: "Posso vedere le alternative?", a: "Sempre. La piattaforma mostra la proposta consigliata e tutte le alternative disponibili. Trasparenza totale." },
  { q: "Cosa sono massimali, franchigie e retroattività?", a: "Sono i parametri che determinano la protezione reale. Te li spieghiamo in modo chiaro, senza linguaggio tecnico." },
  { q: "Posso parlare con un consulente?", a: "Sì. Se necessario puoi ricevere supporto dedicato. Tecnologia e presenza umana lavorano insieme." },
]

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function Landing6() {
  const [email, setEmail] = useState("")
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div style={{ background: CREAM, fontFamily: "var(--font-sans)" }}>

      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: `${INK}F2`,
          backdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-10 h-16 flex items-center justify-between">
          <span
            className="text-xl tracking-tight text-white"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            scelgosicuro<span style={{ color: BLUE }}>.</span>
          </span>

          <div className="hidden md:flex items-center gap-8 text-sm text-white/40">
            <a href="#funziona" className="hover:text-white/70 transition-colors">Come funziona</a>
            <a href="#faq" className="hover:text-white/70 transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <LandingNav current="6" variant="dark" />
            <Link
              href="/app"
              className="text-sm font-semibold px-5 py-2.5 rounded-full text-white transition-all hover:opacity-85"
              style={{ background: BLUE }}
            >
              Preventivo →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-6 pt-32 pb-40"
        style={{ background: INK, minHeight: "100svh" }}
      >
        {/* radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 70% 50% at 50% 35%, ${BLUE}18 0%, transparent 70%)`,
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto">
          <p
            className="text-xs font-semibold tracking-[0.18em] uppercase mb-8"
            style={{ color: `${BLUE}99` }}
          >
            RC Professionale · Liberi Professionisti
          </p>

          <h1
            className="text-5xl sm:text-6xl lg:text-[4.5rem] text-white leading-[1.06] tracking-tight mb-7"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            La polizza giusta.<br />
            <em style={{ color: BLUE }}>Finalmente.</em>
          </h1>

          <p className="text-lg leading-relaxed mb-12 max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.42)" }}>
            Confrontiamo AXA, Generali, AmTrust e altre compagnie per trovare
            la copertura più adatta al tuo profilo professionale. In 2 minuti.
          </p>

          {/* CTA row */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="La tua email professionale"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="flex-1 px-5 py-3.5 rounded-full text-sm outline-none placeholder:text-white/25 text-white"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.10)",
              }}
            />
            <Link
              href="/app"
              className="px-6 py-3.5 rounded-full text-sm font-semibold text-white whitespace-nowrap transition-all hover:opacity-88"
              style={{
                background: BLUE,
                boxShadow: `0 0 24px ${BLUE}44`,
              }}
            >
              Calcola preventivo →
            </Link>
          </div>

          <p className="text-xs mt-5" style={{ color: "rgba(255,255,255,0.18)" }}>
            Gratuito · Senza impegno · Nessun agente
          </p>
        </div>

        {/* fade to cream */}
        <div
          className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
          style={{ background: `linear-gradient(to bottom, transparent, ${CREAM})` }}
        />
      </section>

      {/* ── TRUSTED BY ─────────────────────────────────────────────────────── */}
      <section
        className="py-14 px-6"
        style={{ background: CREAM, borderBottom: `1px solid ${BORDER}` }}
      >
        <div className="max-w-6xl mx-auto">
          <p
            className="text-[10px] font-semibold tracking-[0.18em] uppercase text-center mb-8"
            style={{ color: "#BCBAB2" }}
          >
            Compagnie convenzionate
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12">
            {["AMTRUST", "AXA", "GENERALI", "UNIPOL", "ALLIANZ"].map(name => (
              <span
                key={name}
                className="text-xs font-bold tracking-[0.15em]"
                style={{ color: "#CCCAC2" }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES BENTO ─────────────────────────────────────────────────── */}
      <section id="funziona" className="py-28 px-6 sm:px-10" style={{ background: CREAM }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 max-w-2xl">
            <p
              className="text-[10px] font-semibold tracking-[0.18em] uppercase mb-5"
              style={{ color: BLUE }}
            >
              Perché scelgosicuro
            </p>
            <h2
              className="text-4xl sm:text-5xl tracking-tight leading-[1.1]"
              style={{ fontFamily: "var(--font-serif)", color: INK }}
            >
              Assicurarsi non dovrebbe essere
              {" "}<em>complicato.</em>
            </h2>
          </div>

          {/* 2×2 bento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="rounded-[2rem] p-9 sm:p-11 flex flex-col"
                style={{ background: f.bg }}
              >
                {/* dot icon */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center mb-8 flex-shrink-0"
                  style={{ background: `${f.dot}22` }}
                >
                  <div className="w-3 h-3 rounded-full" style={{ background: f.dot }} />
                </div>

                <p
                  className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-3"
                  style={{ color: f.dot }}
                >
                  {f.tag}
                </p>
                <h3
                  className="text-2xl sm:text-3xl mb-4 leading-snug"
                  style={{ fontFamily: "var(--font-serif)", color: INK }}
                >
                  {f.title}
                </h3>
                <p className="text-base leading-relaxed" style={{ color: MUTED }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────────── */}
      <section
        className="py-28 px-6 sm:px-10"
        style={{ background: INK }}
      >
        <div className="max-w-6xl mx-auto">
          <p
            className="text-[10px] font-semibold tracking-[0.18em] uppercase mb-5"
            style={{ color: `${BLUE}88` }}
          >
            Come funziona
          </p>
          <h2
            className="text-4xl sm:text-5xl text-white tracking-tight mb-16 max-w-xl leading-tight"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Tre passi.<br />Nessuna sorpresa.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: "rgba(255,255,255,0.06)" }}>
            {STEPS.map((s, i) => (
              <div
                key={i}
                className="p-9 sm:p-12 flex flex-col"
                style={{ background: INK }}
              >
                <p
                  className="text-6xl font-light font-mono mb-8"
                  style={{ color: `${BLUE}60` }}
                >
                  {s.n}
                </p>
                <h3
                  className="text-xl text-white mb-4"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.38)" }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────────────────────────── */}
      <section className="py-28 px-6 sm:px-10" style={{ background: CREAM }}>
        <div className="max-w-6xl mx-auto">
          <p
            className="text-[10px] font-semibold tracking-[0.18em] uppercase mb-5"
            style={{ color: BLUE }}
          >
            Cosa dicono i professionisti
          </p>
          <h2
            className="text-4xl sm:text-5xl tracking-tight mb-16 max-w-lg leading-tight"
            style={{ fontFamily: "var(--font-serif)", color: INK }}
          >
            Scelto da chi non ha tempo da perdere.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="rounded-[2rem] p-9 flex flex-col justify-between"
                style={{
                  background: "#fff",
                  border: `1px solid ${BORDER}`,
                  boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
                }}
              >
                <p
                  className="text-base leading-relaxed mb-8"
                  style={{
                    color: INK,
                    fontFamily: "var(--font-serif)",
                    fontStyle: "italic",
                  }}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <p className="text-sm font-semibold" style={{ color: INK }}>{t.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: MUTED }}>{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────────────────────────── */}
      <section
        className="py-20 px-6 sm:px-10"
        style={{
          background: CREAM,
          borderTop: `1px solid ${BORDER}`,
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
          {STATS.map((s, i) => (
            <div key={i} className="text-center">
              <p
                className="text-5xl sm:text-6xl tracking-tight mb-2"
                style={{ fontFamily: "var(--font-serif)", color: INK }}
              >
                {s.n}
              </p>
              <p
                className="text-[10px] font-semibold tracking-[0.12em] uppercase"
                style={{ color: MUTED }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-28 px-6 sm:px-10" style={{ background: CREAM }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
          <div>
            <p
              className="text-[10px] font-semibold tracking-[0.18em] uppercase mb-5"
              style={{ color: BLUE }}
            >
              FAQ
            </p>
            <h2
              className="text-4xl tracking-tight leading-tight mb-6"
              style={{ fontFamily: "var(--font-serif)", color: INK }}
            >
              Domande frequenti
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
              Non trovi risposta?{" "}
              <span
                className="cursor-pointer"
                style={{ color: INK, borderBottom: `1px solid ${BLUE}` }}
              >
                Scrivici →
              </span>
            </p>
          </div>

          <div className="md:col-span-2" style={{ borderTop: `1px solid ${BORDER}` }}>
            {FAQ.map((item, i) => (
              <div key={i} style={{ borderBottom: `1px solid ${BORDER}` }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between py-6 text-left gap-4"
                >
                  <span className="text-base font-medium" style={{ color: INK }}>
                    {item.q}
                  </span>
                  <span
                    className="text-xl flex-shrink-0 transition-transform duration-200"
                    style={{
                      color: MUTED,
                      transform: openFaq === i ? "rotate(45deg)" : "none",
                    }}
                  >
                    +
                  </span>
                </button>
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{ maxHeight: openFaq === i ? "200px" : "0" }}
                >
                  <p className="pb-6 text-sm leading-relaxed" style={{ color: MUTED }}>
                    {item.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ─────────────────────────────────────────────────────── */}
      <section
        className="py-36 px-6 text-center"
        style={{ background: INK }}
      >
        <div className="max-w-2xl mx-auto">
          <h2
            className="text-5xl sm:text-6xl text-white tracking-tight mb-7 leading-tight"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Inizia adesso.<br />
            <em style={{ color: BLUE }}>Bastano 2 minuti.</em>
          </h2>
          <p className="text-base leading-relaxed mb-12" style={{ color: "rgba(255,255,255,0.38)" }}>
            Confronta le migliori polizze RC professionale. Gratis, senza impegno, senza agenti.
          </p>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-9 py-4 rounded-full text-white font-semibold text-base transition-all hover:opacity-88"
            style={{
              background: BLUE,
              boxShadow: `0 0 40px ${BLUE}44`,
            }}
          >
            Calcola il tuo preventivo →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer
        className="py-16 px-6 sm:px-10"
        style={{
          background: INK,
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-12">
          <div>
            <p
              className="text-xl text-white mb-2"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              scelgosicuro<span style={{ color: BLUE }}>.</span>
            </p>
            <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.2)" }}>
              Intermediario assicurativo iscritto al R.U.I. presso IVASS.<br />P.IVA 12345678901
            </p>
          </div>

          <div
            className="grid grid-cols-2 md:grid-cols-3 gap-10 text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.22)" }}
          >
            {[
              { title: "Professioni", links: ["Medici", "Avvocati", "Ingegneri", "Commercialisti"] },
              { title: "Azienda", links: ["Chi siamo", "Come funziona", "Contatti"] },
              { title: "Legale", links: ["Privacy Policy", "Termini", "Cookie"] },
            ].map(col => (
              <div key={col.title} className="space-y-3">
                <p style={{ color: "rgba(255,255,255,0.45)" }}>{col.title}</p>
                {col.links.map(l => (
                  <p key={l} className="cursor-pointer transition-colors hover:text-white/40">{l}</p>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div
          className="max-w-6xl mx-auto mt-12 pt-6 flex flex-col sm:flex-row justify-between gap-2 text-[10px]"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            color: "rgba(255,255,255,0.14)",
          }}
        >
          <p>© 2025 ScelgoSicuro Srl. Tutti i diritti riservati.</p>
          <p>Regolato da IVASS — D.Lgs. 209/2005</p>
        </div>
      </footer>
    </div>
  )
}
