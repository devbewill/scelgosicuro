"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { LandingNav } from "@/components/landing-nav"

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN SYSTEM — New Genre-inspired
// ═══════════════════════════════════════════════════════════════════════════════

const COLORS = {
  bg:      "#F8F7F4",       // warm off-white
  surface: "#FFFFFF",        // white cards
  border:  "rgba(0,0,0,0.06)",
  muted:   "rgba(0,0,0,0.45)",
  text:    "rgba(0,0,0,0.82)",
  accent:  "#0C1018",
  brand:   "#2D2A26",   // warm off-white — rich but not harsh
}

const FONT = {
  heading: "var(--font-heading), system-ui, sans-serif",
  body:    "var(--font-sans), system-ui, sans-serif",
}

// ═══════════════════════════════════════════════════════════════════════════════
// REUSABLE MOTION PRIMITIVES
// ═══════════════════════════════════════════════════════════════════════════════

const fadeUp = {
  hidden:  { opacity: 0, y: 48 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.85, ease: [0.25, 0.1, 0.25, 1] as const } },
}

const stagger = (delay = 0.1) => ({
  hidden:  {},
  visible: { transition: { staggerChildren: delay, delayChildren: 0.05 } },
})

const childFadeUp = {
  hidden:  { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.25, 0.1, 0.25, 1] as const } },
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION WRAPPER
// ═══════════════════════════════════════════════════════════════════════════════

function Section({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={stagger(0.12)}
      className={`max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-20 py-28 sm:py-36 ${className}`}
    >
      {children}
    </motion.section>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <motion.p
      variants={childFadeUp}
      style={{ fontFamily: FONT.body, color: COLORS.muted }}
      className="text-[11px] font-semibold tracking-[0.22em] uppercase mb-6"
    >
      {children}
    </motion.p>
  )
}

function SectionHeading({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.h2
      variants={childFadeUp}
      style={{ fontFamily: FONT.heading, color: COLORS.accent }}
      className={`text-3xl sm:text-4xl lg:text-5xl font-medium tracking-[-0.025em] leading-[1.12] text-balance ${className}`}
    >
      {children}
    </motion.h2>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// ── NAVBAR ────────────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(248,247,244,0.92)",
        backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${COLORS.border}`,
      }}
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-20 h-[64px] flex items-center justify-between">
        <Link href="/" style={{ fontFamily: FONT.heading }} className="text-lg font-semibold tracking-[-0.02em] text-black">
          scelgosicuro<span className="text-black/30">.</span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-8 text-sm text-black/50">
            <a href="#come-funziona" className="hover:text-black/80 transition-colors">Come funziona</a>
            <a href="#professioni"   className="hover:text-black/80 transition-colors">Professioni</a>
            <a href="#faq"           className="hover:text-black/80 transition-colors">FAQ</a>
          </div>

          <Link
            href="/preventivo/new/domande"
            style={{ fontFamily: FONT.body }}
            className="text-sm font-semibold px-5 py-2.5 rounded-full bg-black text-white hover:bg-black/90 transition-all active:scale-95"
          >
            Preventivo gratuito
          </Link>

          <div className="ml-1">
            <LandingNav current="8" variant="light" />
          </div>
        </div>
      </div>
    </motion.nav>
  )
}

// ── HERO ──────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-20 pt-10 pb-20">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger(0.18)}
        className="max-w-[840px]"
      >
        <motion.p
          variants={childFadeUp}
          style={{ fontFamily: FONT.body, color: COLORS.muted }}
          className="text-[10px] sm:text-[11px] font-semibold tracking-[0.24em] uppercase mb-8"
        >
          RC Professionale
        </motion.p>

        <motion.h1
          variants={childFadeUp}
          style={{ fontFamily: FONT.heading, color: COLORS.accent }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-[-0.03em] leading-[1.06] text-balance mb-8"
        >
          Scegliere la RC giusta
          <br />
          <span style={{ color: "rgba(0,0,0,0.35)" }}>non dovrebbe essere complicato.</span>
        </motion.h1>

        <motion.p
          variants={childFadeUp}
          style={{ fontFamily: FONT.body, color: "rgba(0,0,0,0.38)" }}
          className="text-base sm:text-lg leading-relaxed max-w-[560px] mb-12"
        >
          scelgosicuro analizza il tuo profilo professionale, confronta le migliori compagnie
          e ti spiega cosa stai acquistando — in due minuti, senza burocrazia.
        </motion.p>

        <motion.div variants={childFadeUp} className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/preventivo/new/domande"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-black text-white text-base font-semibold hover:bg-black/90 transition-all active:scale-95"
          >
            Calcola il preventivo
            <span className="text-lg leading-none">→</span>
          </Link>

          <a
            href="#come-funziona"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-black/15 text-black/70 text-base font-medium hover:border-black/30 hover:text-black transition-all"
          >
            Come funziona
          </a>
        </motion.div>

        {/* Trust micro-indicators */}
        <motion.div
          variants={childFadeUp}
          className="flex flex-wrap gap-x-8 gap-y-3 mt-16"
          style={{ color: "rgba(0,0,0,0.28)" }}
        >
          {[
            { value: "5+", label: "Compagnie" },
            { value: "2 min", label: "Preventivo" },
            { value: "< 24h", label: "Polizza attiva" },
            { value: "100%", label: "Digitale" },
          ].map(({ value, label }) => (
            <div key={label} className="flex items-baseline gap-2">
              <span className="text-sm font-bold text-black/50">{value}</span>
              <span className="text-xs">{label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}

// ── TRUST BAR (compagnie) ─────────────────────────────────────────────────────

const COMPANIES = [
  { name: "AmTrust",   tag: "Specialista RC" },
  { name: "AXA",       tag: "Internazionale" },
  { name: "Generali",  tag: "Leader Italia" },
  { name: "Unipol",    tag: "Mutualistica" },
  { name: "Allianz",   tag: "Globale" },
  { name: "HDI",       tag: "Industriale" },
  { name: "Groupama",  tag: "Agricola" },
  { name: "Zurich",    tag: "Corporate" },
  { name: "SARA",      tag: "Mutua" },
]

function TrustBar() {
  return (
    <div className="border-y border-black/[0.06] bg-white/[0.015]">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-20 py-16">
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          style={{ fontFamily: FONT.body, color: "rgba(0,0,0,0.25)" }}
          className="text-[10px] font-semibold tracking-[0.22em] uppercase mb-10 text-center"
        >
          Confrontiamo le migliori compagnie
        </motion.p>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger(0.06)}
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-6 sm:gap-8 items-center justify-items-center"
        >
          {COMPANIES.map(({ name, tag }) => (
            <motion.div
              key={name}
              variants={childFadeUp}
              className="flex flex-col items-center gap-2 group cursor-default"
            >
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-105"
                style={{
                  background: "rgba(0,0,0,0.04)",
                  border: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                <span
                  style={{ fontFamily: FONT.heading, color: "rgba(0,0,0,0.55)" }}
                  className="text-[10px] sm:text-xs font-bold tracking-tight"
                >
                  {name.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <span className="text-[9px] font-medium text-black/20 uppercase tracking-wider">{name}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

// ── COME FUNZIONA (process, like New Genre Think→Create→Build→Scale) ──────────

const STEPS = [
  {
    num: "01",
    title: "Inserisci poche informazioni",
    desc: "Ti chiediamo solo ciò che serve: professione, attività, responsabilità, rischi. Niente moduli infiniti.",
    color: "rgba(0,0,0,0.08)",
  },
  {
    num: "02",
    title: "Il sistema analizza il tuo profilo",
    desc: "scelgosicuro combina le caratteristiche della tua professione e i rischi del settore per trovare la polizza più coerente con il tuo lavoro.",
    color: "rgba(0,0,0,0.06)",
  },
  {
    num: "03",
    title: "Ricevi una proposta già selezionata",
    desc: "Ti presentiamo la soluzione più adatta. Se vuoi, confrontala con le alternative e affina il preventivo in tempo reale.",
    color: "rgba(0,0,0,0.04)",
  },
]

function HowItWorks() {
  return (
    <Section id="come-funziona">
      <div className="grid lg:grid-cols-[1fr_2fr] gap-16 lg:gap-24">
        {/* Left: label + heading */}
        <div>
          <SectionLabel>Come funziona</SectionLabel>
          <SectionHeading>
            Un processo semplice.
            <br />
            Pensato per chi lavora.
          </SectionHeading>
        </div>

        {/* Right: steps */}
        <div className="space-y-1">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              variants={childFadeUp}
              className="group flex gap-6 sm:gap-10 py-10 sm:py-12 border-b border-black/[0.05] last:border-b-0 transition-colors"
            >
              <span
                style={{ fontFamily: FONT.heading, color: "rgba(0,0,0,0.20)" }}
                className="text-2xl sm:text-3xl font-medium tracking-[-0.02em] shrink-0 mt-1 group-hover:text-black/40 transition-colors"
              >
                {step.num}
              </span>

              <div>
                <h3
                  style={{ fontFamily: FONT.heading, color: COLORS.accent }}
                  className="text-xl sm:text-2xl font-medium tracking-[-0.015em] mb-3"
                >
                  {step.title}
                </h3>
                <p
                  style={{ fontFamily: FONT.body, color: COLORS.muted }}
                  className="text-sm sm:text-base leading-relaxed max-w-[520px]"
                >
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  )
}

// ── PROFESSIONI (grid cards, like New Genre work gallery) ─────────────────────

const PROFESSIONS = [
  { name: "Medici",          tag: "Sanità",           desc: "RC per chirurghi, medici di base, specialisti, dentisti. Copertura colpa grave, retroattività, tutela legale inclusa.",           accent: "#D4A574" },
  { name: "Avvocati",        tag: "Legale",           desc: "Errori e omissioni, mancato rispetto termini, perdita documenti. Copertura per studi legali, soci e collaboratori.",           accent: "#8FA4C8" },
  { name: "Ingegneri",       tag: "Tecnica",          desc: "Progettazione, direzione lavori, collaudi. Retroattività illimitata, franchigia modulabile sul volume d'affari.",               accent: "#9BB89B" },
  { name: "Architetti",      tag: "Progettazione",    desc: "RC per progettisti, DL, interior design. Copertura danni a cose e persone, varianti in corso d'opera.",                       accent: "#C4A882" },
  { name: "Geometri",        tag: "Tecnica",          desc: "Pratiche catastali, direzione lavori, estimo. Polizza calibrata su attività tecnica e cantieristica.",                        accent: "#A8B8A0" },
  { name: "Commercialisti",  tag: "Fiscale",          desc: "Errori contabili, dichiarativi, consulenza fiscale. Copertura per dipendenti e collaboratori di studio.",                      accent: "#B8A0C4" },
  { name: "Consulenti",      tag: "Advisory",         desc: "Consulenza strategica, IT, finanziaria. Polizza su misura per professionisti senza albo con esposizione a danni patrimoniali.", accent: "#C4B8A0" },
  { name: "Liberi professionisti", tag: "Generico",   desc: "RC per tutte le partite IVA senza cassa. Copertura base e integrativa, attivabile in 24 ore.",                                  accent: "#A0B8C4" },
]

function Professions() {
  return (
    <Section id="professioni">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 mb-16">
        <div>
          <SectionLabel>Soluzioni dedicate</SectionLabel>
          <SectionHeading>
            Ogni professione
            <br />
            ha esigenze diverse.
          </SectionHeading>
        </div>

        <motion.p
          variants={childFadeUp}
          style={{ fontFamily: FONT.body, color: COLORS.muted }}
          className="text-sm leading-relaxed max-w-[360px]"
        >
          Anche la polizza dovrebbe esserlo. Copriamo le principali categorie
          professionali con soluzioni calibrate sul profilo di rischio reale.
        </motion.p>
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        variants={stagger(0.08)}
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px"
        style={{ background: COLORS.border }}
      >
        {PROFESSIONS.map(({ name, tag, desc, accent }) => (
          <motion.div
            key={name}
            variants={childFadeUp}
            className="group relative p-8 sm:p-10 transition-all duration-500 hover:bg-white/[0.03]"
            style={{ background: COLORS.bg }}
          >
            {/* accent dot */}
            <div
              className="w-2 h-2 rounded-full mb-6 transition-all duration-300 group-hover:scale-150"
              style={{ background: accent }}
            />

            <p
              style={{ fontFamily: FONT.body, color: "rgba(0,0,0,0.25)" }}
              className="text-[9px] font-semibold tracking-[0.18em] uppercase mb-3"
            >
              {tag}
            </p>

            <h3
              style={{ fontFamily: FONT.heading, color: COLORS.accent }}
              className="text-xl font-medium tracking-[-0.015em] mb-4"
            >
              {name}
            </h3>

            <p
              style={{ fontFamily: FONT.body, color: COLORS.muted }}
              className="text-[13px] leading-relaxed"
            >
              {desc}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  )
}

// ── APPROACH ──────────────────────────────────────────────────────────────────

function Approach() {
  return (
    <div className="border-t border-black/[0.06]">
      <Section>
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div>
            <SectionLabel>Il nostro approccio</SectionLabel>
            <SectionHeading>
              Non confrontiamo solo i prezzi.
              <br />
              Analizziamo il tuo lavoro.
            </SectionHeading>
          </div>

          <motion.div variants={childFadeUp} className="space-y-10">
            {[
              { label: "Tipo di attività",      desc: "Valutata in base al settore e alla specializzazione" },
              { label: "Livello di responsabilità", desc: "Struttura, volume d'affari, numero di collaboratori" },
              { label: "Rischi specifici",      desc: "Colpa grave, retroattività, massimali adeguati" },
              { label: "Qualità delle coperture", desc: "Non solo il premio annuo, ma cosa copre davvero" },
            ].map(({ label, desc }, i) => (
              <div key={label} className="flex gap-4 border-b border-black/[0.04] pb-8 last:border-b-0">
                <span
                  style={{ fontFamily: FONT.heading, color: "rgba(0,0,0,0.15)" }}
                  className="text-lg font-medium shrink-0"
                >
                  0{i + 1}
                </span>
                <div>
                  <p
                    style={{ fontFamily: FONT.heading, color: COLORS.accent }}
                    className="text-base font-medium mb-1"
                  >
                    {label}
                  </p>
                  <p style={{ fontFamily: FONT.body, color: COLORS.muted }} className="text-sm">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </Section>
    </div>
  )
}

// ── TRASPARENZA ───────────────────────────────────────────────────────────────

function Transparency() {
  return (
    <Section>
      <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
        <div>
          <SectionLabel>Trasparenza</SectionLabel>
          <SectionHeading>
            Capire una polizza
            <br />
            dovrebbe essere semplice.
          </SectionHeading>
        </div>

        <motion.div variants={childFadeUp} className="space-y-8">
          <p style={{ fontFamily: FONT.body, color: COLORS.muted }} className="text-base leading-relaxed">
            Massimali, franchigie, retroattività, colpa grave. Molti professionisti
            sottoscrivono una polizza senza avere davvero chiaro cosa copre, cosa resta
            escluso e quali clausole incidono sulla protezione reale.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {["Cosa copre", "Cosa resta escluso", "Quali garanzie contano", "Clausole che incidono"].map(item => (
              <div
                key={item}
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.04)" }}
              >
                <span className="text-xs">✓</span>
                <span style={{ fontFamily: FONT.body, color: COLORS.text }} className="text-[13px]">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </Section>
  )
}

// ── TESTIMONIALS ──────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  { quote: "Finalmente un tool che non mi chiede l'impossibile. Preventivo in 3 minuti, polizza il giorno dopo. Zero telefonate.", name: "Dr. Marco R.", role: "Medico di base · Milano" },
  { quote: "Avevo bisogno di coperture specifiche sulla colpa grave. ScelgoSicuro le ha trovate subito, con spiegazioni finalmente comprensibili.", name: "Avv. Laura P.", role: "Studio legale · Roma" },
  { quote: "Ho confrontato tre compagnie in dieci minuti. Il sistema ha capito il mio profilo di rischio meglio di qualunque broker.", name: "Ing. Davide C.", role: "Ingegnere strutturista · Torino" },
]

function Testimonials() {
  return (
    <Section>
      <SectionLabel>Testimonianze</SectionLabel>
      <SectionHeading className="mb-14">Cosa dicono i professionisti.</SectionHeading>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={stagger(0.1)}
        className="grid md:grid-cols-3 gap-8"
      >
        {TESTIMONIALS.map(({ quote, name, role }) => (
          <motion.blockquote
            key={name}
            variants={childFadeUp}
            className="p-8 rounded-2xl transition-all duration-300 hover:bg-white/[0.03]"
            style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}
          >
            <p style={{ fontFamily: FONT.body, color: COLORS.text }} className="text-sm leading-relaxed mb-6">
              «{quote}»
            </p>
            <div>
              <p style={{ fontFamily: FONT.heading, color: COLORS.accent }} className="text-sm font-medium">{name}</p>
              <p style={{ fontFamily: FONT.body, color: COLORS.muted }} className="text-xs mt-0.5">{role}</p>
            </div>
          </motion.blockquote>
        ))}
      </motion.div>
    </Section>
  )
}

// ── FAQ ───────────────────────────────────────────────────────────────────────

const FAQS = [
  { q: "Quanto tempo serve per ottenere un preventivo?", a: "Meno di 2 minuti. Inserisci professione, attività e massimale desiderato: il sistema genera la proposta in tempo reale." },
  { q: "Come viene scelta la polizza consigliata?",        a: "Il nostro algoritmo analizza decine di combinazioni tra professione, rischi specifici, massimali e garanzie accessorie per identificare la soluzione più equilibrata." },
  { q: "Il preventivo è gratuito e senza impegno?",        a: "Sì. Il preventivo è completamente gratuito. Puoi confrontare più opzioni senza alcun obbligo di acquisto." },
  { q: "Posso parlare con un consulente?",                 a: "Certo. Se preferisci un supporto umano, un consulente assicurativo è sempre disponibile per aiutarti a scegliere o a capire le coperture." },
]

function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <Section id="faq">
      <div className="max-w-[720px]">
        <SectionLabel>FAQ</SectionLabel>
        <SectionHeading className="mb-14">Domande frequenti.</SectionHeading>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger(0.06)}
          className="space-y-1"
        >
          {FAQS.map(({ q, a }, i) => (
            <motion.div
              key={i}
              variants={childFadeUp}
              style={{ borderBottom: `1px solid ${COLORS.border}` }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 py-6 text-left group"
              >
                <span
                  style={{ fontFamily: FONT.heading, color: COLORS.accent }}
                  className="text-base sm:text-lg font-medium tracking-[-0.01em] group-hover:text-black transition-colors"
                >
                  {q}
                </span>
                <motion.span
                  animate={{ rotate: open === i ? 45 : 0 }}
                  transition={{ duration: 0.25 }}
                  className="text-black/25 text-lg shrink-0"
                >
                  +
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                    className="overflow-hidden"
                  >
                    <p
                      style={{ fontFamily: FONT.body, color: COLORS.muted }}
                      className="text-sm leading-relaxed pb-6 pr-12"
                    >
                      {a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Section>
  )
}

// ── CTA ───────────────────────────────────────────────────────────────────────

function CTA() {
  return (
    <Section>
      <motion.div
        variants={childFadeUp}
        className="text-center max-w-[640px] mx-auto py-12 sm:py-20"
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-10"
          style={{ background: "rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.08)" }}
        >
          <span className="text-black/40 text-xl">✦</span>
        </div>

        <h2
          style={{ fontFamily: FONT.heading, color: COLORS.accent }}
          className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-[-0.025em] leading-[1.14] mb-6"
        >
          La scelta giusta
          <br />
          non è sempre la più economica.
        </h2>

        <p style={{ fontFamily: FONT.body, color: COLORS.muted }} className="text-base leading-relaxed mb-10">
          È quella più adatta a proteggere il tuo lavoro.
          Online in pochi minuti — nessun obbligo.
        </p>

        <Link
          href="/preventivo/new/domande"
          className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-black text-white text-base font-semibold hover:bg-black/90 transition-all active:scale-95"
        >
          Calcola il preventivo gratuito
          <span className="text-lg leading-none">→</span>
        </Link>
      </motion.div>
    </Section>
  )
}

// ── FOOTER ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{ borderTop: `1px solid ${COLORS.border}`, background: COLORS.surface }}>
      <div className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-20 py-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" style={{ fontFamily: FONT.heading }} className="text-xl font-semibold tracking-[-0.02em] text-black mb-6 block">
              scelgosicuro<span className="text-black/30">.</span>
            </Link>

            <p style={{ fontFamily: FONT.body, color: COLORS.muted }} className="text-sm leading-relaxed max-w-[360px] mb-6">
              Intermediario assicurativo iscritto al R.U.I. presso IVASS.
              Regolato da D.Lgs. 209/2005.
            </p>

            <p style={{ fontFamily: FONT.body, color: "rgba(0,0,0,0.15)" }} className="text-xs">
              Milano, Italia
            </p>
          </div>

          {/* Professioni */}
          <div>
            <p style={{ fontFamily: FONT.body, color: "rgba(0,0,0,0.25)" }} className="text-[10px] font-semibold tracking-[0.18em] uppercase mb-6">
              Professioni
            </p>
            <div className="space-y-2.5">
              {["Medici", "Avvocati", "Ingegneri", "Architetti", "Geometri", "Commercialisti", "Consulenti"].map(p => (
                <Link key={p} href={`#professioni`} style={{ fontFamily: FONT.body, color: COLORS.muted }} className="text-sm block hover:text-black/70 transition-colors">
                  {p}
                </Link>
              ))}
            </div>
          </div>

          {/* Azienda */}
          <div>
            <p style={{ fontFamily: FONT.body, color: "rgba(0,0,0,0.25)" }} className="text-[10px] font-semibold tracking-[0.18em] uppercase mb-6">
              Azienda
            </p>
            <div className="space-y-2.5">
              {[
                { label: "Come funziona", href: "#come-funziona" },
                { label: "FAQ", href: "#faq" },
                { label: "Contatti", href: "mailto:info@scelgosicuro.it" },
                { label: "Privacy Policy", href: "#" },
                { label: "Cookie Policy", href: "#" },
              ].map(({ label, href }) => (
                <Link key={label} href={href} style={{ fontFamily: FONT.body, color: COLORS.muted }} className="text-sm block hover:text-black/70 transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-black/[0.05] flex flex-col sm:flex-row justify-between gap-4">
          <p style={{ fontFamily: FONT.body, color: "rgba(0,0,0,0.15)" }} className="text-xs">
            © {new Date().getFullYear()} scelgosicuro. Tutti i diritti riservati.
          </p>

          <p style={{ fontFamily: FONT.body, color: "rgba(0,0,0,0.10)" }} className="text-xs italic">
            La scelta giusta non è sempre la più economica — è quella più adatta a proteggere il tuo lavoro.
          </p>
        </div>
      </div>
    </footer>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function Landing8() {
  return (
    <div style={{ background: COLORS.bg, color: COLORS.text, overflowX: "hidden" }}>
      <Navbar />
      <Hero />
      <TrustBar />
      <HowItWorks />
      <Professions />
      <Approach />
      <Transparency />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  )
}
