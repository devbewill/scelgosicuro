"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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

const C = {
  bg: "#FAFAF8",
  card: "#FFFFFF",
  lime: "#d4f56a",
  lavender: "#dfc8ff",
  sky: "#c0e4ff",
  limeStrong: "#b8e830",
  lavenderStrong: "#b090f0",
  skyStrong: "#60c0f0",
  text: "#1a1a1a",
  textMuted: "#1a1a1a55",
  border: "#e5e5e0",
};

function Serif({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`font-[family-name:var(--font-serif)] ${className}`}>{children}</span>;
}

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-[#FAFAF8]/90 backdrop-blur-xl border-b" style={{ borderColor: C.border }}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
        <span className="font-bold text-xl tracking-tight text-[#1a1a1a]">
          <Serif>scelgosicuro</Serif><span className="text-[#c8a8f0]">.</span>
        </span>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#1a1a1a40]">
          <a href="#come-funziona" className="hover:text-[#1a1a1a] transition-colors">Come funziona</a>
          <a href="#faq" className="hover:text-[#1a1a1a] transition-colors">FAQ</a>
          <LandingNav current="2" />
        </div>
        <Link
          href="/app"
          className="bg-[#1a1a1a] text-white font-semibold px-5 py-2.5 text-sm rounded-full transition-all duration-200 hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
        >
          Preventivo gratuito →
        </Link>
      </div>
    </nav>
  );
}

export default function Landing2Page() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <Navbar />

      {/* ── HERO ── */}
      <section className="bg-[#FAFAF8] relative overflow-hidden" style={{ minHeight: "85vh" }}>
        <div className="absolute pointer-events-none" style={{ top: "-15%", right: "-8%", width: "500px", height: "500px", borderRadius: "50%", background: `radial-gradient(circle, ${C.lavenderStrong}15 0%, transparent 60%)`, filter: "blur(50px)" }} />
        <div className="absolute pointer-events-none" style={{ bottom: "-10%", left: "-5%", width: "400px", height: "400px", borderRadius: "50%", background: `radial-gradient(circle, ${C.limeStrong}12 0%, transparent 60%)`, filter: "blur(40px)" }} />
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col justify-center" style={{ minHeight: "85vh" }}>
          <div className="pt-24 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 lg:gap-16 items-center">
              <div>
                <h1 className="text-[clamp(2.8rem,5.5vw,5.2rem)] font-bold leading-[0.92] tracking-[-0.03em] text-[#1a1a1a] pb-10">
                  <Serif>Scegliere la RC giusta non dovrebbe essere complicato.</Serif>
                </h1>
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/app"
                      className="inline-flex items-center justify-center gap-2 bg-[#1a1a1a] text-white font-semibold px-8 py-4 text-base rounded-full transition-all duration-200 hover:-translate-y-px hover:shadow-[0_10px_28px_rgba(0,0,0,0.18)]"
                    >
                      Calcola il preventivo →
                    </Link>
                    <a
                      href="#come-funziona"
                      className="inline-flex items-center justify-center gap-2 border bg-white/80 text-[#1a1a1a] font-semibold px-8 py-4 text-base rounded-full transition-all duration-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
                      style={{ borderColor: C.border }}
                    >
                      Come funziona
                    </a>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-7 gap-y-3 pt-3">
                    {["Gratuito e senza impegno", "5+ compagnie confrontate", "Polizza attiva in 24 ore"].map((t) => (
                      <div key={t} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: C.lime }}>
                          <span className="text-[#1a1a1a] text-[9px] font-bold">✓</span>
                        </div>
                        <span className="text-sm text-[#1a1a1a50] font-medium">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Hero image */}
              <div className="hidden lg:block relative">
                <div className="rounded-[2rem] overflow-hidden" style={{ boxShadow: `0 20px 60px rgba(0,0,0,0.08)` }}>
                  <Image src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80" alt="" width={600} height={450} className="w-full h-auto object-cover" />
                </div>
                <div className="absolute -bottom-4 -left-4 rounded-2xl p-4 px-6" style={{ background: C.lavender, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
                  <p className="text-2xl font-bold font-[family-name:var(--font-serif)]" style={{ color: C.text }}>2 min</p>
                  <p className="text-[10px] text-[#1a1a1a50]">Per il tuo preventivo</p>
                </div>
                <div className="absolute -top-3 -right-3 w-16 h-16 rounded-full flex items-center justify-center" style={{ background: C.limeStrong, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
                  <span className="text-[#1a1a1a] text-xs font-bold">5+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="bg-[#FAFAF8] overflow-hidden py-4 border-y" style={{ borderColor: C.border }}>
        <div className="flex whitespace-nowrap" style={{ animation: "marquee 28s linear infinite" }}>
          {[0, 1, 2].map((rep) => (
            <span key={rep} className="inline-flex items-center">
              {["AMTRUST","AXA","GENERALI","UNIPOL","ALLIANZ","HDI","GROUPAMA","ZURICH","SARA"].map((c) => (
                <span key={`${rep}-${c}`} className="inline-flex items-center gap-5 mx-8 text-[#1a1a1a25] font-semibold text-sm tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0" style={{ background: C.lavenderStrong }} />
                  {c}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── BENTO GRID: COME FUNZIONA + STATS ── */}
      <section id="come-funziona" className="bg-[#FAFAF8]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-24 pb-8">
          <div className="mb-10">
            <span className="inline-block text-[#1a1a1a] text-xs font-semibold rounded-full px-4 py-1.5" style={{ background: C.sky }}>
              Come funziona
            </span>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)]">
            {/* Step 01 - large */}
            <div className="md:col-span-2 md:row-span-2 rounded-[2rem] p-8 flex flex-col justify-between" style={{ background: C.lime, boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
              <div>
                <span className="text-6xl font-bold text-[#1a1a1a] leading-none"><Serif>01</Serif></span>
                <h3 className="text-xl font-bold text-[#1a1a1a] mt-5"><Serif>Inserisci poche informazioni</Serif></h3>
              </div>
              <p className="text-sm text-[#1a1a1a55] leading-relaxed mt-4">Ti chiediamo solo ciò che serve: professione, attività, responsabilità, rischi. Niente moduli infiniti o compilazioni inutili.</p>
            </div>
            {/* Step 02 */}
            <div className="md:col-span-2 rounded-[2rem] p-8 flex flex-col justify-between" style={{ background: C.lavender, boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
              <div>
                <span className="text-5xl font-bold text-[#1a1a1a] leading-none"><Serif>02</Serif></span>
                <h3 className="text-lg font-bold text-[#1a1a1a] mt-4"><Serif>Il sistema analizza il tuo profilo</Serif></h3>
              </div>
              <p className="text-sm text-[#1a1a1a55] leading-relaxed mt-3">scelgosicuro combina le caratteristiche della tua professione e i rischi tipici del settore. L&apos;obiettivo non è mostrarti decine di prodotti, è trovare quello più coerente con il tuo lavoro.</p>
            </div>
            {/* Stat 2min */}
            <div className="rounded-[2rem] p-7 flex flex-col justify-between" style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: "0 1px 8px rgba(0,0,0,0.03)" }}>
              <p className="text-4xl font-bold text-[#1a1a1a]"><Serif>2 min</Serif></p>
              <p className="text-xs font-medium text-[#1a1a1a40] mt-2 leading-snug">Per ottenere un preventivo</p>
            </div>
            {/* Step 03 */}
            <div className="md:col-span-2 rounded-[2rem] p-8 flex flex-col justify-between" style={{ background: C.sky, boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
              <div>
                <span className="text-5xl font-bold text-[#1a1a1a] leading-none"><Serif>03</Serif></span>
                <h3 className="text-lg font-bold text-[#1a1a1a] mt-4"><Serif>Ricevi una proposta già selezionata</Serif></h3>
              </div>
              <p className="text-sm text-[#1a1a1a55] leading-relaxed mt-3">Ti presentiamo la soluzione più adatta al tuo profilo. Se vuoi, puoi confrontarla con le alternative disponibili e affinare il preventivo in tempo reale.</p>
            </div>
            {/* Stat 5+ */}
            <div className="rounded-[2rem] p-7 flex flex-col justify-between" style={{ background: C.lavenderStrong + "30", border: `1px solid ${C.border}`, boxShadow: "0 1px 8px rgba(0,0,0,0.03)" }}>
              <p className="text-4xl font-bold text-[#1a1a1a]"><Serif>5+</Serif></p>
              <p className="text-xs font-medium text-[#1a1a1a40] mt-2 leading-snug">Compagnie confrontate</p>
            </div>
            {/* Stat 100% */}
            <div className="rounded-[2rem] p-7 flex flex-col justify-between" style={{ background: C.limeStrong + "30", border: `1px solid ${C.border}`, boxShadow: "0 1px 8px rgba(0,0,0,0.03)" }}>
              <p className="text-4xl font-bold text-[#1a1a1a]"><Serif>100%</Serif></p>
              <p className="text-xs font-medium text-[#1a1a1a40] mt-2 leading-snug">Online — zero burocrazia</p>
            </div>
            {/* Stat <24h */}
            <div className="rounded-[2rem] p-7 flex flex-col justify-between" style={{ background: C.skyStrong + "30", border: `1px solid ${C.border}`, boxShadow: "0 1px 8px rgba(0,0,0,0.03)" }}>
              <p className="text-4xl font-bold text-[#1a1a1a]"><Serif>&lt; 24h</Serif></p>
              <p className="text-xs font-medium text-[#1a1a1a40] mt-2 leading-snug">Polizza attiva</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── APPROACH ── */}
      <section className="bg-[#FAFAF8]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <div>
              <span className="inline-block text-[#1a1a1a] text-xs font-semibold rounded-full px-4 py-1.5 mb-6" style={{ background: C.lavender }}>
                Il nostro approccio
              </span>
              <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-bold tracking-tight text-[#1a1a1a] leading-[1.08] mb-6">
                <Serif>Non confrontiamo solo i prezzi.<br />Analizziamo il tuo lavoro.</Serif>
              </h2>
              <p className="text-base text-[#1a1a1a50] leading-relaxed">
                Una RC professionale efficace dipende da molti fattori: il tipo di attività che svolgi, il livello di responsabilità, i clienti con cui lavori, i rischi specifici del tuo settore.
              </p>
              <p className="text-base text-[#1a1a1a50] leading-relaxed mt-4">
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
                <div
                  key={i}
                  className="bg-white rounded-2xl p-5 flex gap-4 items-start transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
                  style={{ border: `1px solid ${C.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: i % 3 === 0 ? C.lime : i % 3 === 1 ? C.lavender : C.sky }}>
                    <span className="text-[#1a1a1a] text-xs font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-[#1a1a1a] text-sm">{item.label}</p>
                    <p className="text-xs text-[#1a1a1a40] mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TRANSPARENCY ── */}
      <section className="bg-[#FAFAF8]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 pb-24">
          <div className="rounded-[2rem] overflow-hidden" style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.06)" }}>
            <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr]">
              <div className="p-8 md:p-14" style={{ background: C.lavender }}>
                <span className="inline-block bg-white/60 text-[#1a1a1a] text-xs font-semibold rounded-full px-4 py-1.5 mb-6">
                  Trasparenza
                </span>
                <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-bold tracking-tight text-[#1a1a1a] leading-[1.08] mb-5">
                  <Serif>Capire una polizza dovrebbe essere semplice.</Serif>
                </h2>
                <p className="text-base text-[#1a1a1a50] leading-relaxed">
                  Massimali, franchigie, retroattività, colpa grave. Molti professionisti sottoscrivono una polizza senza avere davvero chiaro cosa copre, cosa resta escluso e quali clausole incidono sulla protezione reale.
                </p>
                <p className="text-base text-[#1a1a1a50] leading-relaxed mt-4">
                  scelgosicuro ti aiuta a comprendere le opzioni in modo semplice e chiaro, così puoi scegliere con maggiore sicurezza.
                </p>
                <div className="grid grid-cols-2 gap-3 mt-8">
                  {["Cosa copre","Cosa resta escluso","Quali garanzie contano","Clausole che incidono"].map((item, i) => (
                    <div key={item} className="bg-white rounded-xl p-4 flex items-center gap-2" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: i % 2 === 0 ? C.limeStrong : C.skyStrong }} />
                      <span className="text-xs font-semibold text-[#1a1a1a]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative hidden md:block">
                <Image src="https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=600&q=80" alt="" width={600} height={600} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROFESSIONI ── */}
      <section className="bg-[#FAFAF8] py-8">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-8 mb-10 items-end">
            <div>
              <span className="inline-block text-[#1a1a1a] text-xs font-semibold rounded-full px-4 py-1.5 mb-5" style={{ background: C.lime }}>
                Soluzioni dedicate
              </span>
              <h2 className="text-[clamp(2rem,4.5vw,3.2rem)] font-bold tracking-tight text-[#1a1a1a] leading-[1.05]">
                <Serif>Ogni professione<br />ha esigenze diverse.</Serif>
              </h2>
              <p className="text-base text-[#1a1a1a50] max-w-lg leading-relaxed mt-4">
                Anche la polizza dovrebbe esserlo. Copriamo le principali categorie professionali con soluzioni calibrate sul profilo di rischio reale.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }}>
                <Image src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=300&q=80" alt="" width={300} height={200} className="w-full h-auto object-cover" />
              </div>
            </div>
          </div>
          <div className="rounded-[2rem] p-5 md:p-6" style={{ background: C.sky }}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {["Medici","Avvocati","Ingegneri","Geometri","Architetti","Commercialisti","Consulenti","Liberi professionisti"].map((prof) => (
                <Link
                  key={prof}
                  href="/app"
                  className="bg-white rounded-2xl px-5 py-4 flex items-center gap-3 transition-all duration-200 hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
                  style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: C.lavenderStrong }} />
                  <p className="font-semibold text-sm text-[#1a1a1a]">{prof}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className="bg-[#FAFAF8]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-24">
          <div className="mb-12">
            <span className="inline-block text-[#1a1a1a] text-xs font-semibold rounded-full px-4 py-1.5 mb-5" style={{ background: C.sky }}>
              Perché noi
            </span>
            <h2 className="text-[clamp(2rem,4.5vw,3.2rem)] font-bold tracking-tight text-[#1a1a1a] leading-[1.05]">
              <Serif>Perché scegliere scelgosicuro</Serif>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Proposta realmente personalizzata", desc: "Basata sul tuo profilo professionale, non solo sul prezzo.", color: C.lime },
              { title: "Sistema di selezione intelligente", desc: "Costruito per individuare la soluzione più coerente con il tuo livello di rischio.", color: C.lavender },
              { title: "Spiegazioni semplici e chiare", desc: "Per aiutarti a capire davvero cosa stai acquistando, senza termini tecnici.", color: C.sky },
              { title: "Trasparenza totale", desc: "Ti consigliamo una soluzione, ma puoi sempre confrontare tutte le alternative.", color: C.sky },
              { title: "Velocità e semplicità", desc: "Preventivo ed emissione gestiti completamente online, in pochi minuti.", color: C.lime },
              { title: "Supporto umano quando serve", desc: "Tecnologia e consulenza lavorano insieme. Un consulente è sempre disponibile.", color: C.lavender },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-[2rem] p-7 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
                style={{ border: `1px solid ${C.border}`, boxShadow: "0 1px 6px rgba(0,0,0,0.03)" }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5" style={{ background: item.color }}>
                  <span className="text-[#1a1a1a] text-base font-bold">✓</span>
                </div>
                <h3 className="font-bold text-[#1a1a1a] text-base mb-2"><Serif>{item.title}</Serif></h3>
                <p className="text-sm text-[#1a1a1a45] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="bg-[#FAFAF8]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div>
              <span className="inline-block text-[#1a1a1a] text-xs font-semibold rounded-full px-4 py-1.5 mb-5" style={{ background: C.lavender }}>
                FAQ
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-[#1a1a1a]"><Serif>Domande frequenti</Serif></h2>
              <p className="text-base text-[#1a1a1a40] mt-4 leading-relaxed">
                Non trovi risposta?{" "}
                <span className="text-[#1a1a1a] font-semibold underline cursor-pointer hover:opacity-60 transition-opacity">Scrivici →</span>
              </p>
            </div>
            <div className="md:col-span-2 space-y-3">
              {FAQ_DATA.map((item, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl overflow-hidden"
                  style={{ border: `1px solid ${C.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between py-5 px-6 text-left"
                  >
                    <span className="font-semibold text-base text-[#1a1a1a] pr-4">{item.q}</span>
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-base font-bold transition-all duration-200"
                      style={openFaq === i ? { background: C.lavenderStrong, color: "white" } : { background: C.lime, color: "#1a1a1a" }}
                    >
                      {openFaq === i ? "−" : "+"}
                    </span>
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-5 text-base text-[#1a1a1a50] leading-relaxed pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <section className="relative overflow-hidden bg-[#1a1a1a]">
        <div
          className="absolute pointer-events-none"
          style={{ top: "-30%", right: "-5%", width: "500px", height: "500px", borderRadius: "50%", background: `radial-gradient(circle, ${C.lavenderStrong}40 0%, transparent 65%)`, filter: "blur(80px)" }}
        />
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 relative z-10">
          <div className="max-w-lg">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              <Serif>La scelta giusta non è sempre la più economica.</Serif>
            </h2>
            <p className="text-base text-white/40 mt-3 leading-relaxed">
              È quella più adatta a proteggere il tuo lavoro. Online in pochi minuti — nessun obbligo.
            </p>
          </div>
          <Link href="/app" className="bg-white text-[#1a1a1a] font-semibold px-8 py-4 rounded-full text-base transition-all duration-200 hover:-translate-y-px hover:shadow-[0_8px_30px_rgba(0,0,0,0.25)] flex-shrink-0 whitespace-nowrap">
            Calcola il preventivo →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16">
          <div className="flex flex-col md:flex-row justify-between gap-12">
            <div>
              <p className="font-bold text-2xl text-white tracking-tight mb-3">
                <Serif>scelgosicuro</Serif><span className="text-[#c8a8f0]">.</span>
              </p>
              <p className="text-sm text-white/30 max-w-xs leading-relaxed">
                Intermediario assicurativo iscritto al R.U.I. presso IVASS.<br />P.IVA 12345678901
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
              {[
                { title: "Professioni", links: ["Medici","Avvocati","Ingegneri","Commercialisti"] },
                { title: "Azienda", links: ["Chi siamo","Come funziona","Contatti"] },
                { title: "Legale", links: ["Privacy Policy","Termini e condizioni","Cookie Policy"] },
              ].map((col) => (
                <div key={col.title} className="space-y-3">
                  <p className="text-white/30 font-semibold text-xs tracking-widest uppercase">{col.title}</p>
                  {col.links.map((l) => (
                    <p key={l} className="text-white/20 hover:text-white cursor-pointer transition-colors text-xs">{l}</p>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row justify-between gap-2 text-xs text-white/15">
            <p>© 2025 scelgosicuro. Tutti i diritti riservati.</p>
            <p>Regolato da IVASS — D.Lgs. 209/2005</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-33.333%)} }
      `}</style>
    </>
  );
}
