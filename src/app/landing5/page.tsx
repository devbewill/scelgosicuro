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

const CORAL = "#FF6154";
const INDIGO = "#5E6AD2";
const DARK = "#141418";

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
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-4">
        <div
          className="flex items-center justify-between rounded-full px-6 py-3 border border-white/10"
          style={{
            background: `${DARK}/90`,
            backdropFilter: "blur(20px)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
          }}
        >
          <span className="font-bold text-lg text-white font-[family-name:var(--font-heading)]">
            scelgosicuro<span style={{ color: CORAL }}>.</span>
          </span>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/50">
            <a
              href="#come-funziona"
              className="hover:text-white transition-colors"
            >
              Come funziona
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
            <LandingNav current="5" variant="dark" />
          </div>
          <Link
            href="/app"
            className="font-bold px-5 py-2 text-sm rounded-full transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,97,84,0.3)]"
            style={{ background: CORAL, color: "#fff" }}
          >
            Preventivo gratuito →
          </Link>
        </div>
      </div>
    </nav>
  );
}

function InlineSelect({
  value,
  onChange,
  placeholder,
  options,
  accent,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
  accent: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none bg-transparent font-bold font-[family-name:var(--font-heading)] outline-none cursor-pointer"
      style={{
        color: value ? accent : "rgba(255,255,255,0.3)",
        fontSize: "inherit",
      }}
    >
      <option value="" disabled style={{ background: DARK }}>
        {placeholder}
      </option>
      {options.map((o) => (
        <option key={o} value={o} style={{ background: DARK }}>
          {o}
        </option>
      ))}
    </select>
  );
}

function DotGrid() {
  return (
    <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
      <div
        className="absolute"
        style={{
          top: "18%",
          right: "8%",
          width: "120px",
          height: "120px",
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)`,
          backgroundSize: "16px 16px",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: "15%",
          left: "5%",
          width: "80px",
          height: "80px",
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)`,
          backgroundSize: "12px 12px",
        }}
      />
    </div>
  );
}

function FloatingBadge({
  children,
  top,
  right,
  bottom,
  left,
}: {
  children: React.ReactNode;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
}) {
  return (
    <div
      className="absolute pointer-events-none z-[2] hidden lg:flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 backdrop-blur-sm"
      style={{ top, right, bottom, left, background: "rgba(255,255,255,0.03)" }}
    >
      {children}
    </div>
  );
}

export default function Landing5Page() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [profession, setProfession] = useState("");
  const [activity, setActivity] = useState("");
  const [coverage, setCoverage] = useState("");

  return (
    <>
      <Navbar />

      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden"
        style={{ minHeight: "100vh", background: DARK }}
      >
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.08,
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            top: "-10%",
            right: "-5%",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${CORAL}10 0%, transparent 60%)`,
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: "5%",
            left: "-3%",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${INDIGO}08 0%, transparent 60%)`,
            filter: "blur(50px)",
          }}
        />
        <DotGrid />

        {/* Floating badges decorativi */}
        <FloatingBadge top="22%" right="6%">
          <div className="w-2 h-2 rounded-full" style={{ background: CORAL }} />
          <span className="text-[10px] font-semibold text-white/40">
            5+ compagnie
          </span>
        </FloatingBadge>
        <FloatingBadge bottom="25%" left="4%">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: INDIGO }}
          />
          <span className="text-[10px] font-semibold text-white/40">
            100% online
          </span>
        </FloatingBadge>
        <FloatingBadge top="55%" right="12%">
          <span className="text-[10px] font-semibold text-white/30">
            {"<"} 24h attivazione
          </span>
        </FloatingBadge>

        {/* Ring decorativo */}
        <div
          className="absolute pointer-events-none z-[1] hidden lg:block"
          style={{
            top: "12%",
            left: "38%",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            border: `1px solid rgba(255,255,255,0.04)`,
          }}
        />
        <div
          className="absolute pointer-events-none z-[1] hidden lg:block"
          style={{
            bottom: "20%",
            right: "35%",
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            border: `1px solid rgba(255,97,84,0.06)`,
          }}
        />

        <div
          className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10 flex items-center"
          style={{ minHeight: "100vh" }}
        >
          <div className="pt-24 pb-20 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div>
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-8 h-[2px]" style={{ background: CORAL }} />
                  <span className="text-xs font-bold uppercase tracking-[0.15em] text-white/35">
                    RC Professionale
                  </span>
                </div>
                <h1 className="text-[clamp(2.6rem,5vw,4.5rem)] font-bold leading-[0.9] tracking-[-0.04em] text-white font-[family-name:var(--font-heading)] mb-6">
                  Scegliere la RC giusta non dovrebbe essere complicato
                  <span style={{ color: CORAL }}>.</span>
                </h1>
                <p className="text-base text-white/45 leading-relaxed max-w-md mb-8">
                  scelgosicuro analizza il tuo profilo, confronta le migliori
                  compagnie e ti spiega davvero cosa stai acquistando. In 2
                  minuti.
                </p>
                <div className="flex flex-wrap gap-5 text-sm text-white/30">
                  {["Gratuito", "Senza impegno", "Polizza attiva < 24h"].map(
                    (t) => (
                      <div key={t} className="flex items-center gap-2">
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: CORAL }}
                        />
                        <span>{t}</span>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Form — integrato senza sfondo */}
              <div className="relative">
                <div
                  className="absolute pointer-events-none border-l-2 border-white"
                  style={{
                    background: `radial-gradient(ellipse at center, ${CORAL}06 0%, transparent 70%)`,
                    filter: "blur(20px)",
                  }}
                />
                <div className="relative p-8 md:p-10 rounded-[2rem]">
                  <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em] mb-10">
                    Calcola il tuo preventivo
                  </p>
                  <div className="space-y-10">
                    <p className="text-white text-2xl md:text-2xl font-bold leading-[1.8] font-[family-name:var(--font-heading)]">
                      Sono{" "}
                      <InlineSelect
                        value={profession}
                        onChange={setProfession}
                        placeholder="professione"
                        options={PROFESSIONS}
                        accent={CORAL}
                      />
                      <br />
                      lavoro come{" "}
                      <InlineSelect
                        value={activity}
                        onChange={setActivity}
                        placeholder="attività"
                        options={ACTIVITIES}
                        accent={INDIGO}
                      />
                      <br />e voglio copertura{" "}
                      <InlineSelect
                        value={coverage}
                        onChange={setCoverage}
                        placeholder="massimale"
                        options={COVERAGE}
                        accent={CORAL}
                      />
                    </p>
                    <div className="pt-3">
                      <Link
                        href="/app"
                        className="inline-flex items-center justify-center gap-2 font-bold px-8 py-3.5 text-sm rounded-full transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,97,84,0.3)] hover:-translate-y-px"
                        style={{ background: CORAL, color: "#fff" }}
                      >
                        Calcola il preventivo →
                      </Link>
                    </div>
                    <p className="text-white/20 text-xs">
                      Gratuito e senza impegno · 2 minuti
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div
        className="overflow-hidden py-5 border-b border-white/5"
        style={{ background: DARK }}
      >
        <div
          className="flex whitespace-nowrap"
          style={{ animation: "marquee 28s linear infinite" }}
        >
          {[0, 1, 2].map((rep) => (
            <span key={rep} className="inline-flex items-center">
              {[
                "AMTRUST",
                "AXA",
                "GENERALI",
                "UNIPOL",
                "ALLIANZ",
                "HDI",
                "GROUPAMA",
                "ZURICH",
                "SARA",
              ].map((c) => (
                <span
                  key={`${rep}-${c}`}
                  className="inline-flex items-center gap-5 mx-8 text-white/20 font-bold text-sm tracking-[0.15em]"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0"
                    style={{ background: CORAL }}
                  />
                  {c}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS — timeline orizzontale ── */}
      <section id="come-funziona" className="bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-28 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-12 md:gap-20">
            <div className="md:sticky md:top-28 md:self-start">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-[2px]" style={{ background: CORAL }} />
                <span
                  className="text-xs font-bold uppercase tracking-[0.15em]"
                  style={{ color: CORAL }}
                >
                  Come funziona
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-[-0.04em] text-[#1A1A1E] leading-[0.9] font-[family-name:var(--font-heading)]">
                Un processo
                <br />
                semplice<span style={{ color: CORAL }}>.</span>
              </h2>
            </div>
            <div className="space-y-0">
              {[
                {
                  n: "01",
                  title: "Inserisci poche informazioni",
                  desc: "Ti chiediamo solo ciò che serve: professione, attività, responsabilità, rischi. Niente moduli infiniti.",
                  long: true,
                },
                {
                  n: "02",
                  title: "Il sistema analizza il tuo profilo",
                  desc: "scelgosicuro combina le caratteristiche della tua professione e i rischi tipici del settore per trovare il prodotto più coerente.",
                },
                {
                  n: "03",
                  title: "Ricevi una proposta selezionata",
                  desc: "Ti presentiamo la soluzione più adatta. Puoi confrontarla con le alternative e affinare il preventivo in tempo reale.",
                },
              ].map((s, i) => (
                <div key={s.n} className="flex gap-6 md:gap-10 pb-12 relative">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm"
                      style={{
                        background: i === 0 ? CORAL : "#F0F0F2",
                        color: i === 0 ? "#fff" : "#1A1A1E",
                      }}
                    >
                      {s.n}
                    </div>
                    {i < 2 && <div className="w-px flex-1 mt-3 bg-[#EBEBED]" />}
                  </div>
                  <div className="pt-1">
                    <h3 className="text-xl font-bold text-[#1A1A1E] font-[family-name:var(--font-heading)] mb-2">
                      {s.title}
                    </h3>
                    <p className="text-sm text-[#1A1A1E]/50 leading-relaxed max-w-md">
                      {s.desc}
                    </p>
                    {s.long && (
                      <div className="flex flex-wrap gap-3 mt-5">
                        {[
                          "Professione",
                          "Attività",
                          "Responsabilità",
                          "Rischi",
                        ].map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#F7F7F8] text-[#1A1A1E]/50 border border-[#EBEBED]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS — banda con divisori ── */}
      <section className="border-y border-[#EBEBED] bg-[#F7F7F8]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#EBEBED]">
            {[
              { n: "2 min", label: "Per ottenere un preventivo" },
              { n: "5+", label: "Compagnie confrontate" },
              { n: "100%", label: "Online — zero burocrazia" },
              { n: "< 24h", label: "Polizza attiva" },
            ].map((s) => (
              <div
                key={s.label}
                className="py-12 px-6 sm:px-10 first:pl-0 last:pr-0"
              >
                <p className="text-4xl sm:text-5xl font-bold font-[family-name:var(--font-heading)] leading-none text-[#1A1A1E]">
                  {s.n}
                </p>
                <p className="text-xs font-medium text-[#1A1A1E]/40 mt-2 uppercase tracking-wider">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── APPROACH — editoriale grande testo + lista ── */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-28">
          <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-bold tracking-[-0.04em] text-[#1A1A1E] leading-[0.92] font-[family-name:var(--font-heading)] max-w-3xl mb-20">
            Non confrontiamo solo i prezzi.
            <br />
            <span className="text-[#1A1A1E]/15">
              Analizziamo il tuo lavoro.
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-6">
            {[
              {
                label: "Tipo di attività svolta",
                desc: "Valutata in base al settore e alla specializzazione",
              },
              {
                label: "Livello di responsabilità",
                desc: "Struttura, volume d'affari, collaboratori",
              },
              {
                label: "Rischi specifici del settore",
                desc: "Colpa grave, retroattività, massimali",
              },
              {
                label: "Qualità delle coperture",
                desc: "Non solo il premio, ma cosa copre davvero",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-baseline gap-4 py-4 border-b border-[#EBEBED]"
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                  style={{ background: CORAL }}
                />
                <div>
                  <p className="font-bold text-[#1A1A1E]">{item.label}</p>
                  <p className="text-sm text-[#1A1A1E]/40 mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRANSPARENCY — dark card dentro sezione bianca ── */}
      <section className="bg-[#F7F7F8]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-24">
          <div
            className="rounded-[2rem] p-10 md:p-16 relative overflow-hidden"
            style={{ background: DARK }}
          >
            <div
              className="absolute pointer-events-none"
              style={{
                top: "-20%",
                right: "-10%",
                width: "400px",
                height: "400px",
                borderRadius: "50%",
                background: `radial-gradient(circle, ${INDIGO}12 0%, transparent 60%)`,
                filter: "blur(40px)",
              }}
            />
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-12 items-center relative z-10">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-[2px]" style={{ background: INDIGO }} />
                  <span className="text-xs font-bold uppercase tracking-[0.15em] text-white/40">
                    Trasparenza
                  </span>
                </div>
                <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-bold tracking-[-0.03em] text-white leading-[1.05] font-[family-name:var(--font-heading)] mb-6">
                  Capire una polizza dovrebbe essere semplice
                  <span style={{ color: INDIGO }}>.</span>
                </h2>
                <p className="text-base text-white/45 leading-relaxed">
                  Molti professionisti sottoscrivono una polizza senza avere
                  chiaro cosa copre, cosa resta escluso e quali clausole
                  incidono sulla protezione reale.
                </p>
                <p className="text-base text-white/45 leading-relaxed mt-4">
                  scelgosicuro ti aiuta a comprendere le opzioni in modo
                  semplice e chiaro.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  "Cosa copre",
                  "Cosa resta escluso",
                  "Quali garanzie contano",
                  "Clausole che incidono",
                ].map((item, i) => (
                  <div
                    key={item}
                    className="rounded-2xl p-5 flex items-center gap-3 border border-white/5"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: i % 2 === 0 ? CORAL : INDIGO }}
                    />
                    <span className="text-sm font-semibold text-white/60 leading-snug">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROFESSIONS — pills orizzontali ── */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-24">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-[2px]" style={{ background: CORAL }} />
                <span
                  className="text-xs font-bold uppercase tracking-[0.15em]"
                  style={{ color: CORAL }}
                >
                  Soluzioni dedicate
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-[-0.03em] text-[#1A1A1E] font-[family-name:var(--font-heading)]">
                Ogni professione ha esigenze diverse
                <span style={{ color: CORAL }}>.</span>
              </h2>
            </div>
            <p className="hidden md:block text-sm text-[#1A1A1E]/40 max-w-xs text-right leading-relaxed">
              Soluzioni calibrate sul profilo di rischio reale di ogni
              categoria.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              "Medici",
              "Avvocati",
              "Ingegneri",
              "Geometri",
              "Architetti",
              "Commercialisti",
              "Consulenti",
              "Liberi professionisti",
            ].map((prof) => (
              <Link
                key={prof}
                href="/app"
                className="group px-6 py-3 rounded-full border border-[#EBEBED] text-sm font-semibold text-[#1A1A1E]/60 transition-all duration-300 hover:border-[#1A1A1E] hover:text-[#1A1A1E] hover:-translate-y-0.5 hover:shadow-md"
              >
                {prof}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY US — griglia numerata ── */}
      <section className="bg-[#F7F7F8]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-24">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px]" style={{ background: CORAL }} />
            <span
              className="text-xs font-bold uppercase tracking-[0.15em]"
              style={{ color: CORAL }}
            >
              Perché noi
            </span>
          </div>
          <h2 className="text-[clamp(2rem,5vw,4rem)] font-bold tracking-[-0.04em] text-[#1A1A1E] leading-[0.9] font-[family-name:var(--font-heading)] max-w-xl mb-16">
            Perché scegliere
            <br />
            scelgosicuro<span style={{ color: CORAL }}>.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#EBEBED] rounded-[2rem] overflow-hidden">
            {[
              {
                title: "Proposta realmente personalizzata",
                desc: "Basata sul tuo profilo professionale, non solo sul prezzo.",
              },
              {
                title: "Sistema di selezione intelligente",
                desc: "Costruito per individuare la soluzione più coerente con il tuo livello di rischio.",
              },
              {
                title: "Spiegazioni semplici e chiare",
                desc: "Per aiutarti a capire davvero cosa stai acquistando, senza termini tecnici.",
              },
              {
                title: "Trasparenza totale",
                desc: "Ti consigliamo una soluzione, ma puoi sempre confrontare tutte le alternative.",
              },
              {
                title: "Velocità e semplicità",
                desc: "Preventivo ed emissione gestiti completamente online, in pochi minuti.",
              },
              {
                title: "Supporto umano quando serve",
                desc: "Tecnologia e consulenza lavorano insieme. Un consulente è sempre disponibile.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white p-8 flex gap-5 group transition-colors duration-300 hover:bg-[#FAFAFA]"
              >
                <span className="text-2xl font-bold font-[family-name:var(--font-heading)] text-[#1A1A1E]/8 flex-shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-bold text-[#1A1A1E] text-sm mb-1 font-[family-name:var(--font-heading)]">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#1A1A1E]/40 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ — accordion pulito ── */}
      <section id="faq" className="bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-24">
          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-12 md:gap-20">
            <div className="md:sticky md:top-28 md:self-start">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-[2px]" style={{ background: INDIGO }} />
                <span
                  className="text-xs font-bold uppercase tracking-[0.15em]"
                  style={{ color: INDIGO }}
                >
                  FAQ
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-[-0.04em] text-[#1A1A1E] leading-[0.9] font-[family-name:var(--font-heading)]">
                Domande
                <br />
                frequenti<span style={{ color: INDIGO }}>.</span>
              </h2>
              <p className="text-sm text-[#1A1A1E]/40 mt-4 leading-relaxed">
                Non trovi risposta?{" "}
                <span className="text-[#1A1A1E] font-bold cursor-pointer hover:opacity-60 transition-opacity">
                  Scrivici →
                </span>
              </p>
            </div>
            <div className="space-y-0">
              {FAQ_DATA.map((item, i) => (
                <div key={i} className="border-b border-[#EBEBED]">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between py-6 text-left gap-4"
                  >
                    <span className="font-semibold text-[#1A1A1E]">
                      {item.q}
                    </span>
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all duration-300"
                      style={
                        openFaq === i
                          ? { background: CORAL, color: "#fff" }
                          : { background: "#F7F7F8", color: "#1A1A1E" }
                      }
                    >
                      {openFaq === i ? "−" : "+"}
                    </span>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${openFaq === i ? "max-h-60 pb-6" : "max-h-0"}`}
                  >
                    <p className="text-sm text-[#1A1A1E]/50 leading-relaxed max-w-lg">
                      {item.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        className="relative overflow-hidden"
        style={{ background: CORAL }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 relative z-10">
          <div className="max-w-xl">
            <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-bold tracking-[-0.03em] text-white font-[family-name:var(--font-heading)] leading-[1]">
              La scelta giusta non è sempre la più economica.
            </h2>
            <p className="text-base text-white/55 mt-4 leading-relaxed">
              È quella più adatta a proteggere il tuo lavoro. Online in pochi
              minuti — nessun obbligo.
            </p>
          </div>
          <Link
            href="/app"
            className="bg-[#1A1A1E] text-white font-bold px-8 py-4 rounded-full text-base transition-all duration-300 hover:shadow-[0_8px_40px_rgba(0,0,0,0.2)] flex-shrink-0 whitespace-nowrap"
          >
            Calcola il preventivo →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: DARK }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16">
          <div className="flex flex-col md:flex-row justify-between gap-12">
            <div>
              <p className="font-bold text-2xl text-white font-[family-name:var(--font-heading)] mb-3">
                scelgosicuro<span style={{ color: CORAL }}>.</span>
              </p>
              <p className="text-sm text-white/35 max-w-xs leading-relaxed">
                Intermediario assicurativo iscritto al R.U.I. presso IVASS.
                <br />
                P.IVA 12345678901
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
              {[
                {
                  title: "Professioni",
                  links: ["Medici", "Avvocati", "Ingegneri", "Commercialisti"],
                },
                {
                  title: "Azienda",
                  links: ["Chi siamo", "Come funziona", "Contatti"],
                },
                {
                  title: "Legale",
                  links: [
                    "Privacy Policy",
                    "Termini e condizioni",
                    "Cookie Policy",
                  ],
                },
              ].map((col) => (
                <div key={col.title} className="space-y-3">
                  <p className="text-white/35 font-bold text-xs tracking-[0.15em] uppercase">
                    {col.title}
                  </p>
                  {col.links.map((l) => (
                    <p
                      key={l}
                      className="text-white/20 hover:text-white/50 cursor-pointer transition-colors text-xs"
                    >
                      {l}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-white/5 mt-12 pt-6 flex flex-col md:flex-row justify-between gap-2 text-xs text-white/15">
            <p>© 2025 scelgosicuro. Tutti i diritti riservati.</p>
            <p>Regolato da IVASS — D.Lgs. 209/2005</p>
          </div>
        </div>
      </footer>

      <style>{`@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-33.333%)}}`}</style>
    </>
  );
}
