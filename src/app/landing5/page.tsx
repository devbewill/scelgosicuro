"use client";

import { useState } from "react";
import Link from "next/link";
import { LandingNav } from "@/components/landing-nav";

const FAQ_DATA = [
  {
    q: "Quanto tempo serve per ottenere un preventivo?",
    a: "In molti casi bastano pochi minuti. Ti chiediamo solo le informazioni che contano davvero: professione, attività, responsabilità e rischi. Niente moduli infiniti.",
  },
  {
    q: "Come viene scelta la polizza consigliata?",
    a: "Il sistema analizza il tuo profilo professionale, i rischi tipici della tua attività e le coperture disponibili per individuare la soluzione più coerente — non solo la più economica.",
  },
  {
    q: "Posso vedere anche altre opzioni oltre a quella consigliata?",
    a: "Sì. La piattaforma ti propone una soluzione consigliata, ma mantiene visibili anche le alternative disponibili. Trasparenza totale.",
  },
  {
    q: "Il preventivo è gratuito e senza impegno?",
    a: "Sempre. Nessun costo nascosto, nessun obbligo di acquisto. Puoi calcolare il preventivo, confrontare le opzioni e decidere con calma.",
  },
  {
    q: "Posso parlare con un consulente?",
    a: "Sì. Se necessario puoi ricevere supporto da un consulente dedicato. Tecnologia e presenza umana lavorano insieme.",
  },
  {
    q: "Cosa sono massimali, franchigie e retroattività?",
    a: "Sono i parametri chiave di una RC professionale. Ti spieghiamo cosa significano in modo chiaro, senza linguaggio tecnico, così sai esattamente cosa stai acquistando.",
  },
];

const GREEN = "#00FF7F";
const GREEN_DARK = "#00CC66";
const GREEN_MUTED = "#1A2E1F";
const DARK = "#0A0A0A";
const DARK_ELEVATED = "#141414";
const LIGHT = "#F5F5F0";
const WHITE = "#FFFFFF";

const PROFESSIONS = [
  "Medico",
  "Avvocato",
  "Ingegnero",
  "Geometra",
  "Architetto",
  "Commercialista",
  "Consulente",
  "Altro",
];
const ACTIVITIES = [
  "Libero professionista",
  "Studio associato",
  "Società di professionisti",
  "Azienda",
];
const COVERAGE = [
  "Fino a €500k",
  "Fino a €1M",
  "Fino a €2.5M",
  "Fino a €5M",
  "Personalizzato",
];

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: DARK, borderBottom: `2px solid ${GREEN_MUTED}` }}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-between py-4">
          <span className="font-bold text-lg text-white font-[family-name:var(--font-heading)]">
            scelgosicuro<span style={{ color: GREEN }}>.</span>
          </span>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/50">
            <a href="#come-funziona" className="hover:text-white transition-colors">Come funziona</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <LandingNav current="5" variant="dark" />
          </div>
          <Link
            href="/app"
            className="font-bold px-5 py-2.5 text-sm transition-all duration-200 hover:brightness-110"
            style={{ background: GREEN, color: DARK }}
          >
            Preventivo gratuito →
          </Link>
        </div>
      </div>
    </nav>
  );
}

function HeroForm() {
  const [profession, setProfession] = useState("");
  const [activity, setActivity] = useState("");
  const [coverage, setCoverage] = useState("");

  return (
    <div className="w-full relative">
      {/* Top accent bar */}
      <div className="absolute -top-px left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GREEN}, transparent)` }} />
      
      <div className="p-8 md:p-10" style={{ background: DARK_ELEVATED, border: `2px solid ${GREEN}20` }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em]">
            Calcola il tuo preventivo
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2" style={{ background: GREEN }} />
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Live</span>
          </div>
        </div>

        {/* Form fields as interactive blocks */}
        <div className="space-y-6">
          {/* Row 1 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4" style={{ background: `${GREEN}06`, border: `1px solid ${GREEN}15` }}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-2">Professione</p>
              <select
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="w-full appearance-none bg-transparent font-bold text-white outline-none cursor-pointer"
                style={{ fontSize: "1.1rem" }}
              >
                <option value="" disabled style={{ background: DARK }}>Seleziona...</option>
                {PROFESSIONS.map((o) => (
                  <option key={o} value={o} style={{ background: DARK }}>{o}</option>
                ))}
              </select>
            </div>
            <div className="p-4" style={{ background: `${GREEN}06`, border: `1px solid ${GREEN}15` }}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-2">Attività</p>
              <select
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                className="w-full appearance-none bg-transparent font-bold text-white outline-none cursor-pointer"
                style={{ fontSize: "1.1rem" }}
              >
                <option value="" disabled style={{ background: DARK }}>Seleziona...</option>
                {ACTIVITIES.map((o) => (
                  <option key={o} value={o} style={{ background: DARK }}>{o}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2 - Full width */}
          <div className="p-4" style={{ background: `${GREEN}06`, border: `1px solid ${GREEN}15` }}>
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-2">Copertura desiderata</p>
            <select
              value={coverage}
              onChange={(e) => setCoverage(e.target.value)}
              className="w-full appearance-none bg-transparent font-bold text-white outline-none cursor-pointer"
              style={{ fontSize: "1.1rem" }}
            >
              <option value="" disabled style={{ background: DARK }}>Seleziona...</option>
              {COVERAGE.map((o) => (
                <option key={o} value={o} style={{ background: DARK }}>{o}</option>
              ))}
            </select>
          </div>

          {/* CTA button */}
          <button
            className="w-full font-bold py-4 text-sm transition-all duration-300 hover:brightness-110 mt-2"
            style={{ background: GREEN, color: DARK }}
          >
            Calcola il preventivo →
          </button>

          {/* Footer info */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-white/20 text-[10px] uppercase tracking-wider">
              Gratuito · Senza impegno · 2 minuti
            </p>
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="w-3 h-1" style={{ background: i < 3 ? GREEN : `${GREEN}20` }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom accent bar */}
      <div className="absolute -bottom-px left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GREEN}, transparent)` }} />
    </div>
  );
}

export default function Landing5Page() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <Navbar />

      {/* ═══════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ minHeight: "100vh", background: DARK }}>
        {/* Background grid pattern */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Vertical lines */}
          <div className="absolute" style={{ top: "0", left: "25%", width: "1px", height: "100%", background: `${GREEN}06` }} />
          <div className="absolute" style={{ top: "0", left: "50%", width: "1px", height: "100%", background: `${GREEN}04` }} />
          <div className="absolute" style={{ top: "0", left: "75%", width: "1px", height: "100%", background: `${GREEN}06` }} />
          {/* Horizontal lines */}
          <div className="absolute" style={{ top: "33%", left: "0", width: "100%", height: "1px", background: `${GREEN}04` }} />
          <div className="absolute" style={{ top: "66%", left: "0", width: "100%", height: "1px", background: `${GREEN}04` }} />
          
          {/* Decorative blocks */}
          <div className="absolute" style={{ top: "8%", left: "4%", width: "60px", height: "60px", border: `1px solid ${GREEN}10` }} />
          <div className="absolute" style={{ top: "15%", right: "8%", width: "120px", height: "80px", border: `1px solid ${GREEN}08`, background: `${GREEN}03` }} />
          <div className="absolute" style={{ bottom: "20%", left: "10%", width: "40px", height: "40px", background: `${GREEN}08` }} />
          <div className="absolute" style={{ bottom: "15%", right: "5%", width: "80px", height: "80px", border: `2px solid ${GREEN}15` }} />
          <div className="absolute" style={{ top: "45%", right: "15%", width: "4px", height: "4px", background: GREEN }} />
          <div className="absolute" style={{ top: "55%", left: "20%", width: "6px", height: "6px", background: `${GREEN}60` }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10 flex items-center" style={{ minHeight: "100vh" }}>
          <div className="pt-24 pb-20 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left content */}
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-3 h-3" style={{ background: GREEN }} />
                  <span className="text-xs font-bold uppercase tracking-[0.15em] text-white/35">RC Professionale</span>
                </div>
                <h1 className="text-[clamp(2.6rem,5vw,4.5rem)] font-bold leading-[0.9] tracking-[-0.04em] text-white font-[family-name:var(--font-heading)] mb-6">
                  Scegliere la RC giusta non dovrebbe essere complicato
                  <span style={{ color: GREEN }}>.</span>
                </h1>
                <p className="text-base text-white/45 leading-relaxed max-w-md mb-8">
                  scelgosicuro analizza il tuo profilo, confronta le migliori
                  compagnie e ti spiega davvero cosa stai acquistando. In 2
                  minuti.
                </p>
                <div className="flex flex-wrap gap-5 text-sm text-white/30">
                  {["Gratuito", "Senza impegno", "Polizza attiva < 24h"].map((t) => (
                    <div key={t} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5" style={{ background: GREEN }} />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right form */}
              <div>
                <HeroForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          MARQUEE
      ═══════════════════════════════════════════ */}
      <div className="overflow-hidden py-4" style={{ background: DARK, borderTop: `2px solid ${GREEN_MUTED}`, borderBottom: `2px solid ${GREEN_MUTED}` }}>
        <div className="flex whitespace-nowrap" style={{ animation: "marquee 28s linear infinite" }}>
          {[0, 1, 2].map((rep) => (
            <span key={rep} className="inline-flex items-center">
              {["AMTRUST", "AXA", "GENERALI", "UNIPOL", "ALLIANZ", "HDI", "GROUPAMA", "ZURICH", "SARA"].map((c) => (
                <span key={`${rep}-${c}`} className="inline-flex items-center gap-5 mx-8 text-white/20 font-bold text-sm tracking-[0.15em]">
                  <span className="w-1.5 h-1.5 inline-block flex-shrink-0" style={{ background: GREEN }} />
                  {c}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          HOW IT WORKS — staggered cards
      ═══════════════════════════════════════════ */}
      <section id="come-funziona" className="py-24" style={{ background: LIGHT }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          {/* Section header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3" style={{ background: GREEN }} />
            <span className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: DARK }}>Come funziona</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-[-0.04em] leading-[0.9] font-[family-name:var(--font-heading)] mb-16">
            Un processo semplice<span style={{ color: GREEN_DARK }}>.</span>
          </h2>

          {/* Staggered cards */}
          <div className="space-y-8">
            {/* Step 01 - offset right */}
            <div className="md:ml-24 p-8 md:p-10" style={{ background: WHITE, border: `2px solid ${GREEN}20` }}>
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 flex items-center justify-center flex-shrink-0 font-bold text-xl" style={{ background: GREEN, color: DARK }}>01</div>
                <div>
                  <h3 className="text-xl font-bold font-[family-name:var(--font-heading)] mb-2">Inserisci poche informazioni</h3>
                  <p className="text-sm leading-relaxed max-w-lg" style={{ color: `${DARK}70` }}>Ti chiediamo solo ciò che serve: professione, attività, responsabilità, rischi. Niente moduli infiniti.</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {["Professione", "Attività", "Responsabilità", "Rischi"].map((tag) => (
                      <span key={tag} className="px-3 py-1 text-xs font-medium" style={{ background: `${GREEN}15`, color: DARK, border: `1px solid ${GREEN}30` }}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 02 - offset left */}
            <div className="md:mr-24 p-8 md:p-10" style={{ background: DARK, border: `2px solid ${GREEN}30` }}>
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 flex items-center justify-center flex-shrink-0 font-bold text-xl" style={{ background: GREEN, color: DARK }}>02</div>
                <div>
                  <h3 className="text-xl font-bold font-[family-name:var(--font-heading)] mb-2 text-white">Il sistema analizza il tuo profilo</h3>
                  <p className="text-sm leading-relaxed max-w-lg text-white/60">scelgosicuro combina le caratteristiche della tua professione e i rischi tipici del settore per trovare il prodotto più coerente.</p>
                </div>
              </div>
            </div>

            {/* Step 03 - offset right */}
            <div className="md:ml-12 p-8 md:p-10" style={{ background: WHITE, border: `2px solid ${GREEN}20` }}>
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 flex items-center justify-center flex-shrink-0 font-bold text-xl" style={{ background: `${GREEN}40`, color: DARK }}>03</div>
                <div>
                  <h3 className="text-xl font-bold font-[family-name:var(--font-heading)] mb-2">Ricevi una proposta selezionata</h3>
                  <p className="text-sm leading-relaxed max-w-lg" style={{ color: `${DARK}70` }}>Ti presentiamo la soluzione più adatta. Puoi confrontarla con le alternative e affinare il preventivo in tempo reale.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          STATS — dark band
      ═══════════════════════════════════════════ */}
      <section style={{ background: DARK, borderTop: `2px solid ${GREEN_MUTED}`, borderBottom: `2px solid ${GREEN_MUTED}` }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {[
              { n: "2 min", label: "Per ottenere un preventivo" },
              { n: "5+", label: "Compagnie confrontate" },
              { n: "100%", label: "Online — zero burocrazia" },
              { n: "< 24h", label: "Polizza attiva" },
            ].map((s, i) => (
              <div key={s.label} className="py-12 px-6 sm:px-10" style={{ borderRight: i < 3 ? `1px solid ${GREEN}15` : "none" }}>
                <p className="text-4xl sm:text-5xl font-bold font-[family-name:var(--font-heading)] leading-none text-white">{s.n}</p>
                <p className="text-xs font-medium text-white/40 mt-2 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          APPROACH — editorial
      ═══════════════════════════════════════════ */}
      <section style={{ background: WHITE }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
            <div className="lg:col-span-8">
              <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-bold tracking-[-0.04em] leading-[0.92] font-[family-name:var(--font-heading)]">
                Non confrontiamo solo i prezzi.
                <br />
                <span style={{ color: `${DARK}15` }}>Analizziamo il tuo lavoro.</span>
              </h2>
            </div>
            <div className="lg:col-span-4 flex items-end">
              <div className="w-full h-24" style={{ background: `${GREEN}10`, border: `2px solid ${GREEN}20` }} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {[
              { label: "Tipo di attività svolta", desc: "Valutata in base al settore e alla specializzazione" },
              { label: "Livello di responsabilità", desc: "Struttura, volume d'affari, collaboratori" },
              { label: "Rischi specifici del settore", desc: "Colpa grave, retroattività, massimali" },
              { label: "Qualità delle coperture", desc: "Non solo il premio, ma cosa copre davvero" },
            ].map((item, i) => (
              <div key={item.label} className="flex items-baseline gap-4 p-6" style={{ borderBottom: "1px solid #EBEBED", borderRight: i % 2 === 0 ? "1px solid #EBEBED" : "none", background: i % 3 === 0 ? `${GREEN}05` : "transparent" }}>
                <div className="w-3 h-3 flex-shrink-0 mt-1.5" style={{ background: GREEN }} />
                <div>
                  <p className="font-bold" style={{ color: DARK }}>{item.label}</p>
                  <p className="text-sm mt-0.5" style={{ color: `${DARK}60` }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          TRANSPARENCY — split layout
      ═══════════════════════════════════════════ */}
      <section style={{ background: LIGHT }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            <div className="lg:col-span-7 p-10 md:p-16" style={{ background: DARK }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3" style={{ background: GREEN }} />
                <span className="text-xs font-bold uppercase tracking-[0.15em] text-white/40">Trasparenza</span>
              </div>
              <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-bold tracking-[-0.03em] text-white leading-[1.05] font-[family-name:var(--font-heading)] mb-6">
                Capire una polizza dovrebbe essere semplice
                <span style={{ color: GREEN }}>.</span>
              </h2>
              <p className="text-base text-white/45 leading-relaxed">
                Molti professionisti sottoscrivono una polizza senza avere chiaro cosa copre, cosa resta escluso e quali clausole incidono sulla protezione reale.
              </p>
              <p className="text-base text-white/45 leading-relaxed mt-4">
                scelgosicuro ti aiuta a comprendere le opzioni in modo semplice e chiaro.
              </p>
            </div>

            <div className="lg:col-span-5 flex flex-col">
              {[
                "Cosa copre",
                "Cosa resta escluso",
                "Quali garanzie contano",
                "Clausole che incidono",
              ].map((item, i) => (
                <div key={item} className="flex-1 flex items-center gap-4 p-6" style={{ background: i % 2 === 0 ? DARK_ELEVATED : DARK, borderLeft: `2px solid ${GREEN}${i % 2 === 0 ? "30" : "15"}`, borderBottom: i < 3 ? `1px solid ${GREEN}10` : "none" }}>
                  <div className="w-3 h-3 flex-shrink-0" style={{ background: i % 2 === 0 ? GREEN : `${GREEN}60` }} />
                  <span className="text-sm font-semibold text-white/60 leading-snug">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PROFESSIONS — grid with hover
      ═══════════════════════════════════════════ */}
      <section style={{ background: WHITE }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-24">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-3 h-3" style={{ background: GREEN }} />
            <span className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: DARK }}>Soluzioni dedicate</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-[-0.03em] font-[family-name:var(--font-heading)] mb-10">
            Ogni professione ha esigenze diverse
            <span style={{ color: GREEN_DARK }}>.</span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
            {["Medici", "Avvocati", "Ingegneri", "Geometri", "Architetti", "Commercialisti", "Consulenti", "Liberi professionisti"].map((prof, i) => (
              <Link key={prof} href="/app" className="group p-6 text-sm font-semibold transition-all duration-200" style={{ color: `${DARK}70`, background: i % 2 === 0 ? `${GREEN}08` : "transparent", border: `1px solid ${GREEN}15`, marginTop: i >= 4 ? "-1px" : "0", marginLeft: i % 4 !== 0 ? "-1px" : "0" }} onMouseEnter={(e) => { e.currentTarget.style.background = GREEN; e.currentTarget.style.color = DARK; e.currentTarget.style.borderColor = GREEN; }} onMouseLeave={(e) => { e.currentTarget.style.background = i % 2 === 0 ? `${GREEN}08` : "transparent"; e.currentTarget.style.color = `${DARK}70`; e.currentTarget.style.borderColor = `${GREEN}15`; }}>
                {prof}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          WHY US — bento grid
      ═══════════════════════════════════════════ */}
      <section style={{ background: LIGHT }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-24">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3" style={{ background: GREEN }} />
            <span className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: DARK }}>Perché noi</span>
          </div>
          <h2 className="text-[clamp(2rem,5vw,4rem)] font-bold tracking-[-0.04em] leading-[0.9] font-[family-name:var(--font-heading)] max-w-xl mb-16">
            Perché scegliere
            <br />
            scelgosicuro<span style={{ color: GREEN_DARK }}>.</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
            <div className="md:col-span-7 p-8 md:p-10" style={{ background: DARK, border: `2px solid ${GREEN}20` }}>
              <span className="text-3xl font-bold font-[family-name:var(--font-heading)] text-white/10">01</span>
              <h3 className="font-bold text-white text-lg mb-2 font-[family-name:var(--font-heading)] mt-4">Proposta realmente personalizzata</h3>
              <p className="text-sm text-white/40 leading-relaxed max-w-sm">Basata sul tuo profilo professionale, non solo sul prezzo.</p>
            </div>

            <div className="md:col-span-5 flex flex-col">
              <div className="flex-1 p-8" style={{ background: WHITE, border: `2px solid ${GREEN}15`, borderLeft: "none", borderBottom: "none" }}>
                <span className="text-2xl font-bold font-[family-name:var(--font-heading)]" style={{ color: `${DARK}10` }}>02</span>
                <h3 className="font-bold text-sm mb-1 font-[family-name:var(--font-heading)] mt-3" style={{ color: DARK }}>Sistema di selezione intelligente</h3>
                <p className="text-xs leading-relaxed" style={{ color: `${DARK}50` }}>Costruito per individuare la soluzione più coerente con il tuo livello di rischio.</p>
              </div>
              <div className="flex-1 p-8" style={{ background: WHITE, border: `2px solid ${GREEN}15`, borderLeft: "none" }}>
                <span className="text-2xl font-bold font-[family-name:var(--font-heading)]" style={{ color: `${DARK}10` }}>03</span>
                <h3 className="font-bold text-sm mb-1 font-[family-name:var(--font-heading)] mt-3" style={{ color: DARK }}>Spiegazioni semplici e chiare</h3>
                <p className="text-xs leading-relaxed" style={{ color: `${DARK}50` }}>Per aiutarti a capire davvero cosa stai acquistando, senza termini tecnici.</p>
              </div>
            </div>

            <div className="md:col-span-4 p-8" style={{ background: `${GREEN}10`, border: `2px solid ${GREEN}20`, borderTop: "none" }}>
              <span className="text-2xl font-bold font-[family-name:var(--font-heading)]" style={{ color: `${GREEN}30` }}>04</span>
              <h3 className="font-bold text-sm mb-1 font-[family-name:var(--font-heading)] mt-3" style={{ color: DARK }}>Trasparenza totale</h3>
              <p className="text-xs leading-relaxed" style={{ color: `${DARK}50` }}>Ti consigliamo una soluzione, ma puoi sempre confrontare tutte le alternative.</p>
            </div>
            <div className="md:col-span-4 p-8" style={{ background: WHITE, border: `2px solid ${GREEN}15`, borderTop: "none", borderLeft: "none" }}>
              <span className="text-2xl font-bold font-[family-name:var(--font-heading)]" style={{ color: `${DARK}10` }}>05</span>
              <h3 className="font-bold text-sm mb-1 font-[family-name:var(--font-heading)] mt-3" style={{ color: DARK }}>Velocità e semplicità</h3>
              <p className="text-xs leading-relaxed" style={{ color: `${DARK}50` }}>Preventivo ed emissione gestiti completamente online, in pochi minuti.</p>
            </div>
            <div className="md:col-span-4 p-8" style={{ background: DARK_ELEVATED, border: `2px solid ${GREEN}20`, borderTop: "none", borderLeft: "none" }}>
              <span className="text-2xl font-bold font-[family-name:var(--font-heading)] text-white/10">06</span>
              <h3 className="font-bold text-sm mb-1 font-[family-name:var(--font-heading)] mt-3 text-white">Supporto umano quando serve</h3>
              <p className="text-xs text-white/40 leading-relaxed">Tecnologia e consulenza lavorano insieme. Un consulente è sempre disponibile.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FAQ
      ═══════════════════════════════════════════ */}
      <section id="faq" style={{ background: WHITE }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3" style={{ background: GREEN }} />
                <span className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: DARK }}>FAQ</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-[-0.04em] leading-[0.9] font-[family-name:var(--font-heading)]">
                Domande
                <br />
                frequenti<span style={{ color: GREEN_DARK }}>.</span>
              </h2>
              <p className="text-sm mt-4 leading-relaxed" style={{ color: `${DARK}50` }}>
                Non trovi risposta?{" "}
                <span className="font-bold cursor-pointer hover:opacity-60 transition-opacity" style={{ color: DARK }}>Scrivici →</span>
              </p>
            </div>
            <div className="lg:col-span-8 space-y-0">
              {FAQ_DATA.map((item, i) => (
                <div key={i} style={{ borderBottom: "1px solid #EBEBED" }}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between py-6 text-left gap-4">
                    <span className="font-semibold" style={{ color: DARK }}>{item.q}</span>
                    <span className="w-8 h-8 flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all duration-300" style={openFaq === i ? { background: GREEN, color: DARK } : { background: LIGHT, color: DARK }}>
                      {openFaq === i ? "−" : "+"}
                    </span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? "max-h-60 pb-6" : "max-h-0"}`}>
                    <p className="text-sm leading-relaxed max-w-lg" style={{ color: `${DARK}60` }}>{item.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CTA
      ═══════════════════════════════════════════ */}
      <section style={{ background: GREEN }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 relative z-10">
          <div className="max-w-xl">
            <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-bold tracking-[-0.03em] font-[family-name:var(--font-heading)] leading-[1]" style={{ color: DARK }}>
              La scelta giusta non è sempre la più economica.
            </h2>
            <p className="text-base mt-4 leading-relaxed" style={{ color: `${DARK}70` }}>
              È quella più adatta a proteggere il tuo lavoro. Online in pochi minuti — nessun obbligo.
            </p>
          </div>
          <Link href="/app" className="font-bold px-8 py-4 text-base transition-all duration-300 hover:brightness-110 flex-shrink-0 whitespace-nowrap" style={{ background: DARK, color: WHITE }}>
            Calcola il preventivo →
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════ */}
      <footer style={{ background: DARK, borderTop: `2px solid ${GREEN_MUTED}` }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16">
          <div className="flex flex-col md:flex-row justify-between gap-12">
            <div>
              <p className="font-bold text-2xl text-white font-[family-name:var(--font-heading)] mb-3">
                scelgosicuro<span style={{ color: GREEN }}>.</span>
              </p>
              <p className="text-sm text-white/35 max-w-xs leading-relaxed">
                Intermediario assicurativo iscritto al R.U.I. presso IVASS.
                <br />
                P.IVA 12345678901
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
              {[
                { title: "Professioni", links: ["Medici", "Avvocati", "Ingegneri", "Commercialisti"] },
                { title: "Azienda", links: ["Chi siamo", "Come funziona", "Contatti"] },
                { title: "Legale", links: ["Privacy Policy", "Termini e condizioni", "Cookie Policy"] },
              ].map((col) => (
                <div key={col.title} className="space-y-3">
                  <p className="text-white/35 font-bold text-xs tracking-[0.15em] uppercase">{col.title}</p>
                  {col.links.map((l) => (
                    <p key={l} className="text-white/20 hover:text-white/50 cursor-pointer transition-colors text-xs">{l}</p>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-12 pt-6 flex flex-col md:flex-row justify-between gap-2 text-xs text-white/15" style={{ borderTop: `1px solid ${GREEN}10` }}>
            <p>© 2025 scelgosicuro. Tutti i diritti riservati.</p>
            <p>Regolato da IVASS — D.Lgs. 209/2005</p>
          </div>
        </div>
      </footer>

      <style>{`@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-33.333%)}}`}</style>
    </>
  );
}
