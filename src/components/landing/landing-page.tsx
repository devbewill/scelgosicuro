"use client"

import { useState } from "react"
import Link from "next/link"

// ─── COLOR TOKENS ─────────────────────────────────────────────────────────────
// Primary: deep indigo #5046E4 / hover #4338CA / tint #EEF2FF
// Accents: sage #dbe1b0 / rose #eeb3b3 / greige #dad2c4 / cream #F7F4EE

const FAQ = [
  { q: "Quanto tempo serve per ottenere un preventivo?", a: "In molti casi bastano pochi minuti. Ti chiediamo solo le informazioni che contano davvero: professione, attività, responsabilità e rischi. Niente moduli infiniti." },
  { q: "Come viene scelta la polizza consigliata?", a: "Il sistema analizza il tuo profilo professionale, i rischi tipici della tua attività e le coperture disponibili per individuare la soluzione più coerente — non solo la più economica." },
  { q: "Posso vedere anche altre opzioni oltre a quella consigliata?", a: "Sì. La piattaforma ti propone una soluzione consigliata, ma mantiene visibili anche le alternative disponibili. Trasparenza totale." },
  { q: "Il preventivo è gratuito e senza impegno?", a: "Sempre. Nessun costo nascosto, nessun obbligo di acquisto. Puoi calcolare il preventivo, confrontare le opzioni e decidere con calma." },
  { q: "Posso parlare con un consulente?", a: "Sì. Se necessario puoi ricevere supporto da un consulente dedicato. Tecnologia e presenza umana lavorano insieme." },
  { q: "Cosa sono massimali, franchigie e retroattività?", a: "Sono i parametri chiave di una RC professionale. Ti spieghiamo cosa significano in modo chiaro, senza linguaggio tecnico, così sai esattamente cosa stai acquistando." },
]

// ─── SVG ACCENTS ─────────────────────────────────────────────────────────────

function IconArrowDiagonal() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M5 17L17 5M17 5H9M17 5V13" stroke="#5046E4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconArrowRight() {
  return (
    <svg width="28" height="16" viewBox="0 0 28 16" fill="none" aria-hidden="true">
      <path d="M0 8H26M20 2L26 8L20 14" stroke="#5046E4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconArrowDown() {
  return (
    <svg width="16" height="28" viewBox="0 0 16 28" fill="none" aria-hidden="true">
      <path d="M8 0V26M2 20L8 26L14 20" stroke="#5046E4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconCircle() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="9" stroke="#5046E4" strokeWidth="2" />
    </svg>
  )
}
function IconPlus() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M11 2V20M2 11H20" stroke="#5046E4" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
function IconAsterisk() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M11 2V20M2 11H20M4 4L18 18M18 4L4 18" stroke="#5046E4" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// ─── NAVBAR ──────────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E8E4DC]">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
        <span className="font-bold text-xl text-[#1C1C1A] tracking-tight font-[family-name:var(--font-heading)]">
          ScelgoSicuro<span className="text-[#5046E4]">.</span>
        </span>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#5F5F5A]">
          <a href="#come-funziona" className="hover:text-[#1C1C1A] transition-colors">Come funziona</a>
          <a href="#faq" className="hover:text-[#1C1C1A] transition-colors">FAQ</a>
        </div>
        <Link
          href="/app"
          className="bg-[#5046E4] text-white font-semibold px-5 py-2.5 text-sm rounded-full transition-all duration-200 hover:bg-[#4338CA] hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(80,70,228,0.35)]"
        >
          Preventivo gratuito →
        </Link>
      </div>
    </nav>
  )
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────

export function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <>
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="bg-[#F7F4EE] relative overflow-hidden min-h-[680px] lg:min-h-[720px]">

        {/* blob: rosa — top-right, sottile come gli originali */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "-15%",
            right: "-8%",
            width: "750px",
            height: "750px",
            borderRadius: "50%",
            background: "radial-gradient(circle at center, rgba(255,30,140,0.20) 0%, rgba(255,30,140,0.07) 45%, transparent 70%)",
            filter: "blur(78px)",
          }}
        />

        {/* blob: giallo — bottom-left, sottile */}
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: "-20%",
            left: "-6%",
            width: "580px",
            height: "580px",
            borderRadius: "50%",
            background: "radial-gradient(circle at center, rgba(255,224,0,0.18) 0%, transparent 65%)",
            filter: "blur(88px)",
          }}
        />

        {/* archi SVG — angolo top-right */}
        <svg
          aria-hidden="true"
          className="absolute top-0 right-0 pointer-events-none"
          width="560"
          height="560"
          viewBox="0 0 560 560"
          fill="none"
          style={{ opacity: 0.055 }}
        >
          <circle cx="560" cy="0" r="480" stroke="#1C1C1A" strokeWidth="1" />
          <circle cx="560" cy="0" r="360" stroke="#1C1C1A" strokeWidth="1" />
          <circle cx="560" cy="0" r="240" stroke="#1C1C1A" strokeWidth="1" />
          <circle cx="560" cy="0" r="130" stroke="#1C1C1A" strokeWidth="1" />
        </svg>

        {/* testo — h1 occupa tutta la larghezza del container */}
        <div className="max-w-6xl mx-auto px-6 sm:px-8 pt-24 pb-20 relative z-10">
          <div className="space-y-9">
            <span className="inline-block bg-[#EEF2FF] text-[#5046E4] text-xs font-semibold rounded-full px-3.5 py-1.5">
              RC Professionale · Liberi Professionisti
            </span>

            {/* h1 full-width — nessun grid che lo dimezza */}
            <h1 className="text-[clamp(3rem,6.2vw,5.4rem)] font-bold leading-[0.97] tracking-[-0.03em] text-[#1C1C1A] font-[family-name:var(--font-heading)]">
              Scegliere la RC giusta<br />
              non dovrebbe essere<br />
              <span className="text-[#5046E4]">complicato.</span>
            </h1>

            {/* sottotitolo e CTA: rimangono stretti per non sbucare sotto la card */}
            <div className="lg:max-w-[580px] space-y-7">
              <p className="text-lg sm:text-xl text-[#5F5F5A] leading-relaxed">
                ScelgoSicuro analizza il tuo profilo professionale, confronta le migliori compagnie e ti spiega davvero cosa stai acquistando. In 2 minuti.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/app"
                  className="inline-flex items-center justify-center gap-2 bg-[#5046E4] text-white font-semibold px-8 py-4 text-base rounded-full transition-all duration-200 hover:bg-[#4338CA] hover:-translate-y-px hover:shadow-[0_10px_28px_rgba(80,70,228,0.35)]"
                >
                  Calcola il preventivo
                  <span className="text-white/70">→</span>
                </Link>
                <a
                  href="#come-funziona"
                  className="inline-flex items-center justify-center gap-2 border border-[#E8E4DC] bg-white text-[#1C1C1A] font-semibold px-8 py-4 text-base rounded-full transition-all duration-200 hover:border-[#1C1C1A]/30 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
                >
                  Come funziona
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
                {["Gratuito e senza impegno", "5+ compagnie confrontate", "Polizza attiva in 24 ore"].map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
                      <span className="text-[#5046E4] text-[8px] font-bold">✓</span>
                    </div>
                    <span className="text-sm text-[#5F5F5A] font-medium">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* mock card — absolute rispetto alla section (full-viewport-width),
            right: -72px → tagliata dal bordo dello schermo via overflow-hidden */}
        <div
          className="hidden lg:block absolute top-1/2 -translate-y-1/2 z-20"
          style={{ right: "-72px" }}
        >
          <div className="w-80 bg-white rounded-3xl shadow-[0_24px_64px_rgba(0,0,0,0.13)] overflow-hidden">

            <div className="bg-[#F7F4EE] px-5 py-4 border-b border-[#E8E4DC] flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5046E4]">
                <span>⭐</span> Consigliata per te
              </span>
              <span className="text-[10px] font-semibold text-[#5F5F5A] bg-white border border-[#E8E4DC] px-2.5 py-1 rounded-full">
                AmTrust
              </span>
            </div>

            <div className="bg-[#EEF2FF] px-5 py-5">
              <p className="text-xs font-semibold text-[#5F5F5A] mb-2">RC Professionale · Medici</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-[#1C1C1A] tracking-tight font-[family-name:var(--font-heading)]">€ 420</p>
                  <p className="text-xs text-[#5F5F5A] mt-0.5">/ anno · IVA inclusa</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#5046E4]">€ 35</p>
                  <p className="text-[10px] text-[#5F5F5A]">/ mese</p>
                </div>
              </div>
            </div>

            <div className="px-5 py-4 space-y-2.5">
              {["Colpa grave inclusa", "Retroattività 10 anni", "Massimale € 1.000.000"].map((f) => (
                <div key={f} className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
                    <span className="text-[#5046E4] text-[8px] font-bold">✓</span>
                  </div>
                  <span className="text-sm text-[#5F5F5A] font-medium">{f}</span>
                </div>
              ))}
            </div>

            <div className="px-5 pb-4">
              <div className="border border-[#E8E4DC] rounded-2xl p-3 flex items-center justify-between">
                <p className="text-[10px] font-semibold text-[#5F5F5A]">Altre opzioni</p>
                <div className="flex gap-1.5">
                  {["AXA", "Generali", "Unipol"].map((c) => (
                    <span key={c} className="text-[9px] font-semibold text-[#5F5F5A] bg-[#F7F4EE] border border-[#E8E4DC] px-2 py-0.5 rounded-full">{c}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-5 pb-5">
              <div className="bg-[#5046E4] text-white text-center py-3.5 rounded-full text-sm font-semibold">
                Acquista questa polizza →
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* ── MARQUEE ──────────────────────────────────────────────────────── */}
      <div className="bg-white border-y border-[#E8E4DC] overflow-hidden py-4">
        <div className="flex whitespace-nowrap" style={{ animation: "marquee 28s linear infinite" }}>
          {[0, 1, 2].map((rep) => (
            <span key={rep} className="inline-flex items-center">
              {["AMTRUST", "AXA", "GENERALI", "UNIPOL", "ALLIANZ", "HDI", "GROUPAMA", "ZURICH", "SARA"].map((c) => (
                <span key={`${rep}-${c}`} className="inline-flex items-center gap-5 mx-8 text-[#5F5F5A] font-semibold text-sm tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5046E4] inline-block flex-shrink-0" />{c}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS — bg sage ────────────────────────────────────────── */}
      <section id="come-funziona" className="bg-[#dbe1b0]">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 pt-28 pb-36">
          <div className="mb-16 max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-block bg-white/60 text-[#5046E4] text-xs font-semibold rounded-full px-3.5 py-1.5">
                Come funziona
              </span>
              <IconArrowDiagonal />
            </div>
            <h2 className="text-[clamp(2rem,4.5vw,3.2rem)] font-bold tracking-tight text-[#1C1C1A] leading-[1.05] font-[family-name:var(--font-heading)]">
              Un processo semplice.<br />Pensato per chi lavora.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { n: "01", title: "Inserisci poche informazioni", desc: "Ti chiediamo solo ciò che serve: professione, attività, responsabilità, rischi. Niente moduli infiniti o compilazioni inutili." },
              { n: "02", title: "Il sistema analizza il tuo profilo", desc: "ScelgoSicuro combina le caratteristiche della tua professione e i rischi tipici del settore. L'obiettivo non è mostrarti decine di prodotti — è trovare quello più coerente con il tuo lavoro." },
              { n: "03", title: "Ricevi una proposta già selezionata", desc: "Ti presentiamo la soluzione più adatta al tuo profilo. Se vuoi, puoi confrontarla con le alternative disponibili e affinare il preventivo in tempo reale." },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 flex flex-col gap-5 shadow-[0_4px_24px_rgba(0,0,0,0.05)]">
                <span className="text-5xl font-bold text-[#5046E4] leading-none font-[family-name:var(--font-heading)]">{s.n}</span>
                <h3 className="text-xl font-bold text-[#1C1C1A] font-[family-name:var(--font-heading)]">{s.title}</h3>
                <p className="text-base text-[#5F5F5A] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS — bg dark ──────────────────────────────────────────────── */}
      <section className="bg-[#1C1C1A] relative overflow-hidden">
        {/* asterisk watermark */}
        <svg className="absolute top-5 right-8 pointer-events-none" style={{ opacity: 0.18 }} width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">
          <path d="M26 4V48M4 26H48M8 8L44 44M44 8L8 44" stroke="#5046E4" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10">
            {[
              { n: "2 min", label: "Per ottenere un preventivo" },
              { n: "5+", label: "Compagnie confrontate" },
              { n: "100%", label: "Online — zero burocrazia" },
              { n: "< 24h", label: "Polizza attiva" },
            ].map((s, i) => (
              <div key={i} className="bg-[#1C1C1A] p-8 sm:p-10">
                <p className="text-4xl sm:text-5xl font-bold text-[#5046E4] font-[family-name:var(--font-heading)]">{s.n}</p>
                <p className="text-sm font-medium text-white/40 mt-3">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── APPROACH — bg cream ──────────────────────────────────────────── */}
      <section className="bg-[#F7F4EE]">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 pt-20 pb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="inline-block bg-[#EEF2FF] text-[#5046E4] text-xs font-semibold rounded-full px-3.5 py-1.5">
                  Il nostro approccio
                </span>
                <IconArrowRight />
              </div>
              <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-bold tracking-tight text-[#1C1C1A] leading-[1.1] mb-6 font-[family-name:var(--font-heading)]">
                Non confrontiamo solo i prezzi.<br />Analizziamo il tuo lavoro.
              </h2>
              <p className="text-base text-[#5F5F5A] leading-relaxed">
                Una RC professionale efficace dipende da molti fattori: il tipo di attività che svolgi, il livello di responsabilità, i clienti con cui lavori, i rischi specifici del tuo settore.
              </p>
              <p className="text-base text-[#5F5F5A] leading-relaxed mt-4">
                Per questo il nostro sistema non ordina semplicemente le polizze dal prezzo più basso. Identifica la soluzione più equilibrata tra protezione, coperture, affidabilità e costo.
              </p>
            </div>
            <div className="space-y-3">
              {[
                { label: "Tipo di attività svolta", desc: "Valutata in base al settore e alla specializzazione" },
                { label: "Livello di responsabilità", desc: "Struttura, volume d'affari, numero di collaboratori" },
                { label: "Rischi specifici del settore", desc: "Colpa grave, retroattività, massimali adeguati" },
                { label: "Qualità delle coperture", desc: "Non solo il premio annuo, ma cosa copre davvero" },
              ].map((item, i) => (
                <div key={i} className="bg-white border border-[#E8E4DC] rounded-2xl p-5 flex gap-4 items-start shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                  <div className="w-8 h-8 rounded-full bg-[#EEF2FF] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[#5046E4] text-xs font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-[#1C1C1A] text-base">{item.label}</p>
                    <p className="text-sm text-[#5F5F5A] mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TRANSPARENCY — bg rose ───────────────────────────────────────── */}
      <section className="bg-[#eeb3b3]">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="inline-block bg-white/60 text-[#5046E4] text-xs font-semibold rounded-full px-3.5 py-1.5">
                  Trasparenza
                </span>
                <IconCircle />
              </div>
              <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-bold tracking-tight text-[#1C1C1A] leading-[1.1] mb-5 font-[family-name:var(--font-heading)]">
                Capire una polizza dovrebbe essere semplice.
              </h2>
              <p className="text-base text-[#1C1C1A]/60 leading-relaxed">
                Massimali, franchigie, retroattività, colpa grave. Molti professionisti sottoscrivono una polizza senza avere davvero chiaro cosa copre, cosa resta escluso e quali clausole incidono sulla protezione reale.
              </p>
              <p className="text-base text-[#1C1C1A]/60 leading-relaxed mt-4">
                ScelgoSicuro ti aiuta a comprendere le opzioni in modo semplice e chiaro, così puoi scegliere con maggiore sicurezza.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {["Cosa copre", "Cosa resta escluso", "Quali garanzie contano", "Clausole che incidono"].map((item) => (
                <div key={item} className="bg-white rounded-2xl p-5 flex items-start gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
                  <div className="w-5 h-5 rounded-full bg-[#EEF2FF] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[#5046E4] text-[8px] font-bold">✓</span>
                  </div>
                  <span className="text-sm font-semibold text-[#1C1C1A] leading-snug">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PROFESSIONI — bg greige ──────────────────────────────────────── */}
      <section className="bg-[#dad2c4]">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 pt-32 pb-20">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <span className="inline-block bg-white/60 text-[#5046E4] text-xs font-semibold rounded-full px-3.5 py-1.5">
                Soluzioni dedicate
              </span>
            </div>
            <h2 className="text-[clamp(2rem,4.5vw,3.2rem)] font-bold tracking-tight text-[#1C1C1A] leading-[1.05] font-[family-name:var(--font-heading)]">
              Ogni professione<br />ha esigenze diverse.
            </h2>
            <div className="mt-5 mb-6">
              <IconArrowDown />
            </div>
            <p className="text-base text-[#1C1C1A]/55 max-w-lg leading-relaxed">
              Anche la polizza dovrebbe esserlo. Copriamo le principali categorie professionali con soluzioni calibrate sul profilo di rischio reale.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {["Medici", "Avvocati", "Ingegneri", "Geometri", "Architetti", "Commercialisti", "Consulenti", "Liberi professionisti"].map((prof) => (
              <Link
                key={prof}
                href="/app"
                className="bg-white/70 border border-white/60 rounded-2xl px-5 py-4 flex items-center gap-3 transition-all duration-200 hover:bg-white hover:border-[#5046E4]/30 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
              >
                <div className="w-2 h-2 rounded-full bg-[#5046E4] flex-shrink-0" />
                <p className="font-semibold text-sm text-[#1C1C1A]">{prof}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY US — bg cream ────────────────────────────────────────────── */}
      <section className="bg-[#F7F4EE]">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 pt-20 pb-24">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <span className="inline-block bg-[#EEF2FF] text-[#5046E4] text-xs font-semibold rounded-full px-3.5 py-1.5">
                Perché noi
              </span>
              <IconPlus />
            </div>
            <h2 className="text-[clamp(2rem,4.5vw,3.2rem)] font-bold tracking-tight text-[#1C1C1A] leading-[1.05] font-[family-name:var(--font-heading)]">
              Perché scegliere ScelgoSicuro
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Proposta realmente personalizzata", desc: "Basata sul tuo profilo professionale, non solo sul prezzo." },
              { title: "Sistema di selezione intelligente", desc: "Costruito per individuare la soluzione più coerente con il tuo livello di rischio." },
              { title: "Spiegazioni semplici e chiare", desc: "Per aiutarti a capire davvero cosa stai acquistando, senza termini tecnici." },
              { title: "Trasparenza totale", desc: "Ti consigliamo una soluzione, ma puoi sempre confrontare tutte le alternative." },
              { title: "Velocità e semplicità", desc: "Preventivo ed emissione gestiti completamente online, in pochi minuti." },
              { title: "Supporto umano quando serve", desc: "Tecnologia e consulenza lavorano insieme. Un consulente è sempre disponibile." },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-[#E8E4DC] rounded-3xl p-7 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
                <div className="w-10 h-10 bg-[#EEF2FF] rounded-2xl flex items-center justify-center mb-5">
                  <span className="text-[#5046E4] text-base font-bold">✓</span>
                </div>
                <h3 className="font-bold text-[#1C1C1A] text-base mb-2 font-[family-name:var(--font-heading)]">{item.title}</h3>
                <p className="text-sm text-[#5F5F5A] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ — bg sage ────────────────────────────────────────────────── */}
      <section id="faq" className="bg-[#dbe1b0]">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-28">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className="inline-block bg-white/60 text-[#5046E4] text-xs font-semibold rounded-full px-3.5 py-1.5">
                  FAQ
                </span>
                <IconAsterisk />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-[#1C1C1A] font-[family-name:var(--font-heading)]">Domande frequenti</h2>
              <p className="text-base text-[#1C1C1A]/55 mt-4 leading-relaxed">
                Non trovi risposta?{" "}
                <span className="text-[#5046E4] font-semibold cursor-pointer hover:text-[#4338CA] transition-colors">Scrivici →</span>
              </p>
            </div>
            <div className="md:col-span-2 space-y-3">
              {FAQ.map((item, i) => (
                <div key={i} className="bg-white border border-[#c8d49a] rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between py-5 px-6 text-left"
                  >
                    <span className="font-semibold text-base text-[#1C1C1A] pr-4">{item.q}</span>
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-base font-bold transition-all duration-200 ${openFaq === i ? "bg-[#5046E4] text-white" : "bg-[#F7F4EE] text-[#5F5F5A]"}`}>
                      {openFaq === i ? "−" : "+"}
                    </span>
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-5 text-base text-[#5F5F5A] leading-relaxed border-t border-[#c8d49a] pt-4">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BAND ─────────────────────────────────────────────────────── */}
      <section className="bg-[#5046E4] relative overflow-hidden">
        <div
          className="absolute pointer-events-none"
          style={{
            top: "-50%",
            right: "-5%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 65%)",
            filter: "blur(60px)",
          }}
        />
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 relative z-10">
          <div className="max-w-lg">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-[family-name:var(--font-heading)]">
              La scelta giusta non è sempre la più economica.
            </h2>
            <p className="text-base text-white/60 mt-3 leading-relaxed">
              È quella più adatta a proteggere il tuo lavoro. Online in pochi minuti — nessun obbligo.
            </p>
          </div>
          <Link
            href="/app"
            className="bg-white text-[#5046E4] font-semibold px-8 py-4 rounded-full text-base transition-all duration-200 hover:-translate-y-px hover:shadow-[0_8px_30px_rgba(0,0,0,0.20)] flex-shrink-0 whitespace-nowrap"
          >
            Calcola il preventivo →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="bg-[#1C1C1A]">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-16">
          <div className="flex flex-col md:flex-row justify-between gap-12">
            <div>
              <p className="font-bold text-2xl text-white tracking-tight font-[family-name:var(--font-heading)] mb-3">
                ScelgoSicuro<span className="text-[#5046E4]">.</span>
              </p>
              <p className="text-sm text-white/40 max-w-xs leading-relaxed">
                Intermediario assicurativo iscritto al R.U.I. presso IVASS.<br />P.IVA 12345678901
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
              {[
                { title: "Professioni", links: ["Medici", "Avvocati", "Ingegneri", "Commercialisti"] },
                { title: "Azienda", links: ["Chi siamo", "Come funziona", "Contatti"] },
                { title: "Legale", links: ["Privacy Policy", "Termini e condizioni", "Cookie Policy"] },
              ].map((col) => (
                <div key={col.title} className="space-y-3">
                  <p className="text-white font-semibold text-xs tracking-widest uppercase">{col.title}</p>
                  {col.links.map((l) => (
                    <p key={l} className="text-white/40 hover:text-[#5046E4] cursor-pointer transition-colors text-xs">{l}</p>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row justify-between gap-2 text-xs text-white/30">
            <p>© 2025 ScelgoSicuro Srl. Tutti i diritti riservati.</p>
            <p>Regolato da IVASS — D.Lgs. 209/2005</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-33.333%)} }
      `}</style>
    </>
  )
}
