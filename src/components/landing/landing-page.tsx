"use client";

import { useState } from "react";
import Link from "next/link";
import { LandingNav } from "@/components/landing-nav";

// ─── THEME PALETTES ───────────────────────────────────────────────────────────
const TINT_PALETTE = [
  "#ffe0f2", "#ffd6eb", "#ffb3d9", "#ffc8f0",
  "#ffe4d6", "#d6f0ff", "#d6ffd6", "#fff3d6",
];
const ACCENT_PALETTE = [
  "#ff88c8", "#ff6ab4", "#ff4da0", "#e040a0",
  "#ff8fa0", "#ffab40", "#4dc4ff", "#a259ff",
];
const BTN_PALETTE = [
  "#1C1C1A", "#2d1b4e", "#0a3d2b", "#1a1a3e",
  "#3d1a1a", "#ff88c8", "#7c4d00", "#004d40",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

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

// ─── SVG ACCENTS ──────────────────────────────────────────────────────────────

function IconArrowDiagonal({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M5 17L17 5M17 5H9M17 5V13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconArrowRight({ color }: { color: string }) {
  return (
    <svg width="28" height="16" viewBox="0 0 28 16" fill="none" aria-hidden="true">
      <path d="M0 8H26M20 2L26 8L20 14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconArrowDown({ color }: { color: string }) {
  return (
    <svg width="16" height="28" viewBox="0 0 16 28" fill="none" aria-hidden="true">
      <path d="M8 0V26M2 20L8 26L14 20" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconCircle({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="9" stroke={color} strokeWidth="2" />
    </svg>
  );
}
function IconPlus({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M11 2V20M2 11H20" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function IconAsterisk({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M11 2V20M2 11H20M4 4L18 18M18 4L4 18" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ─── THEME EXPLORER ───────────────────────────────────────────────────────────

function SwatchRow({
  label, palette, value, onChange,
}: {
  label: string; palette: string[]; value: string; onChange: (c: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-semibold text-[#1C1C1A]/40 uppercase tracking-wider">{label}</p>
        <span className="text-[10px] font-mono text-[#1C1C1A]/40">{value}</span>
      </div>
      <div className="flex gap-2 flex-wrap items-center">
        {/* Color picker — apre il selettore nativo */}
        <label
          className="relative w-8 h-8 rounded-full cursor-pointer flex-shrink-0 transition-transform hover:scale-110"
          title="Scegli qualsiasi colore"
          style={{
            background: value,
            boxShadow: "0 0 0 2px white, 0 0 0 4px #1C1C1A",
          }}
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer rounded-full"
          />
        </label>
        <div className="w-px h-5 bg-[#e2dbd0] mx-0.5 flex-shrink-0" />
        {/* Preset swatches */}
        {palette.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            title={c}
            style={{
              background: c,
              boxShadow: value === c
                ? "0 0 0 2px white, 0 0 0 4px #1C1C1A"
                : "0 1px 3px rgba(0,0,0,0.15)",
            }}
            className="w-6 h-6 rounded-full border-0 transition-all duration-150 hover:scale-110 flex-shrink-0"
          />
        ))}
      </div>
    </div>
  );
}

function ThemeExplorer({
  tint, accent, btnBg,
  setTint, setAccent, setBtnBg,
}: {
  tint: string; accent: string; btnBg: string;
  setTint: (c: string) => void;
  setAccent: (c: string) => void;
  setBtnBg: (c: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const shuffle = () => {
    let t, a, b;
    do { t = pick(TINT_PALETTE); } while (t === tint);
    do { a = pick(ACCENT_PALETTE); } while (a === accent);
    do { b = pick(BTN_PALETTE); } while (b === btnBg);
    setTint(t); setAccent(a); setBtnBg(b);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-2">
      {open && (
        <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.18)] border border-[#e2dbd0] p-5 w-72">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-[#1C1C1A] font-[family-name:var(--font-heading)]">Theme Explorer</p>
            <button onClick={() => setOpen(false)} className="text-[#1C1C1A]/30 hover:text-[#1C1C1A] transition-colors text-base leading-none">✕</button>
          </div>
          <div className="space-y-4">
            <SwatchRow label="Badge / tint" palette={TINT_PALETTE} value={tint} onChange={setTint} />
            <SwatchRow label="Accento / svg" palette={ACCENT_PALETTE} value={accent} onChange={setAccent} />
            <SwatchRow label="Sfondo bottoni" palette={BTN_PALETTE} value={btnBg} onChange={setBtnBg} />
          </div>
          <button
            onClick={shuffle}
            className="mt-5 w-full font-semibold py-2.5 text-sm rounded-full transition-all duration-200 hover:opacity-90 hover:-translate-y-px"
            style={{ background: btnBg, color: "white" }}
          >
            Shuffle ↻
          </button>
          <div className="mt-3 flex gap-2 justify-center">
            {[tint, accent, btnBg].map((c, i) => (
              <div key={i} className="w-5 h-5 rounded-full border border-[#e2dbd0]" style={{ background: c }} />
            ))}
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="bg-white border border-[#e2dbd0] rounded-full px-4 py-2 text-xs font-semibold text-[#1C1C1A] shadow-[0_4px_16px_rgba(0,0,0,0.10)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.15)] transition-all"
      >
        {open ? "Chiudi" : "🎨 Tema"}
      </button>
    </div>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────

function Navbar({ accent, btnBg }: { accent: string; btnBg: string }) {
  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#e2dbd0]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
        <span className="font-bold text-xl text-[#1C1C1A] tracking-tight font-[family-name:var(--font-heading)]">
          scelgosicuro<span style={{ color: accent }}>.</span>
        </span>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#1C1C1A]/50">
          <a href="#come-funziona" className="hover:text-[#1C1C1A] transition-colors">Come funziona</a>
          <a href="#faq" className="hover:text-[#1C1C1A] transition-colors">FAQ</a>
          <LandingNav current="1" />
        </div>
        <Link
          href="/app"
          style={{ background: btnBg }}
          className="text-white font-semibold px-5 py-2.5 text-sm rounded-full transition-all duration-200 hover:-translate-y-px hover:opacity-90 hover:shadow-[0_4px_16px_rgba(0,0,0,0.25)]"
        >
          Preventivo gratuito →
        </Link>
      </div>
    </nav>
  );
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────

export function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [tint, setTint] = useState("#ffe0f2");
  const [accent, setAccent] = useState("#ff88c8");
  const [btnBg, setBtnBg] = useState("#1C1C1A");

  return (
    <>
      <Navbar accent={accent} btnBg={btnBg} />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="bg-[#f8f2ea] relative overflow-hidden min-h-205 lg:min-h-[75vh]">
        <div
          className="absolute pointer-events-none"
          style={{
            top: "-18%", right: "-12%",
            width: "820px", height: "820px", borderRadius: "50%",
            background: `radial-gradient(circle at center, ${accent}b8 0%, ${accent}48 40%, transparent 68%)`,
            filter: "blur(70px)",
          }}
        />
        <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10 flex flex-col py-40">
          <div className="space-y-8">
            <h1 className="text-[clamp(3rem,5.6vw,5.8rem)] font-bold leading-[0.95] tracking-[-0.04em] text-[#1C1C1A] font-[family-name:var(--font-heading)] pb-10">
              Scegliere la RC giusta non dovrebbe essere complicato.
            </h1>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/app"
                    style={{ background: btnBg }}
                    className="inline-flex items-center justify-center gap-2 text-white font-semibold px-8 py-4 text-base rounded-full transition-all duration-200 hover:-translate-y-px hover:opacity-90 hover:shadow-[0_10px_28px_rgba(0,0,0,0.25)]"
                  >
                    Calcola il preventivo →
                  </Link>
                  <a
                    href="#come-funziona"
                    className="inline-flex items-center justify-center gap-2 border border-[#e2dbd0] bg-white/80 text-[#1C1C1A] font-semibold px-8 py-4 text-base rounded-full transition-all duration-200 hover:border-[#1C1C1A]/30 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
                  >
                    Come funziona
                  </a>
                </div>
                <div className="flex flex-wrap items-center gap-x-7 gap-y-3 pt-4">
                  {["Gratuito e senza impegno", "5+ compagnie confrontate", "Polizza attiva in 24 ore"].map((t) => (
                    <div key={t} className="flex items-center gap-4">
                      <div className="w-4 h-4 rounded-full bg-white/80 flex items-center justify-center flex-shrink-0">
                        <span className="text-[#1C1C1A] text-[8px] font-bold">✓</span>
                      </div>
                      <span className="text-sm text-[#1C1C1A]/60 font-medium">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-base text-[#1C1C1A]/60 leading-relaxed lg:text-right lg:max-w-85">
                scelgosicuro analizza il tuo profilo, confronta le migliori compagnie e ti spiega davvero cosa stai acquistando.
                <br />
                <span className="text-[#1C1C1A]/40 text-sm">In 2 minuti.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ──────────────────────────────────────────────────────── */}
      <div className="bg-white border-y border-[#e2dbd0] overflow-hidden py-4">
        <div className="flex whitespace-nowrap" style={{ animation: "marquee 28s linear infinite" }}>
          {[0, 1, 2].map((rep) => (
            <span key={rep} className="inline-flex items-center">
              {["AMTRUST","AXA","GENERALI","UNIPOL","ALLIANZ","HDI","GROUPAMA","ZURICH","SARA"].map((c) => (
                <span key={`${rep}-${c}`} className="inline-flex items-center gap-5 mx-8 text-[#1C1C1A]/40 font-semibold text-sm tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0" style={{ background: accent }} />
                  {c}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="come-funziona" className="bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-24 pb-16">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-block text-[#1C1C1A] text-xs font-semibold rounded-full px-3.5 py-1.5" style={{ background: tint }}>
                Come funziona
              </span>
              <IconArrowDiagonal color={accent} />
            </div>
            <h2 className="text-[clamp(2rem,4.5vw,3.2rem)] font-bold tracking-tight text-[#1C1C1A] leading-[1.05] font-[family-name:var(--font-heading)]">
              Un processo semplice.<br />Pensato per chi lavora.
            </h2>
          </div>
          <div className="rounded-3xl p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { n: "01", title: "Inserisci poche informazioni", desc: "Ti chiediamo solo ciò che serve: professione, attività, responsabilità, rischi. Niente moduli infiniti o compilazioni inutili." },
                { n: "02", title: "Il sistema analizza il tuo profilo", desc: "scelgosicuro combina le caratteristiche della tua professione e i rischi tipici del settore. L'obiettivo non è mostrarti decine di prodotti, è trovare quello più coerente con il tuo lavoro." },
                { n: "03", title: "Ricevi una proposta già selezionata", desc: "Ti presentiamo la soluzione più adatta al tuo profilo. Se vuoi, puoi confrontarla con le alternative disponibili e affinare il preventivo in tempo reale." },
              ].map((s, i) => (
                <div key={i} className="bg-[#f0f2df] rounded-2xl p-7 flex flex-col gap-4 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
                  <span className="text-5xl font-bold text-[#1C1C1A] leading-none font-[family-name:var(--font-heading)]">{s.n}</span>
                  <h3 className="text-lg font-bold text-[#1C1C1A] font-[family-name:var(--font-heading)]">{s.title}</h3>
                  <p className="text-sm text-[#1C1C1A]/55 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────────── */}
      <section className="bg-[#fbf8f5] py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 pb-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { n: "2 min",  label: "Per ottenere un preventivo", bg: "#dbe1b0" },
              { n: "5+",     label: "Compagnie confrontate",       bg: "#eeb3b3" },
              { n: "100%",   label: "Online — zero burocrazia",    bg: "#dad2c4" },
              { n: "< 24h",  label: "Polizza attiva",              bg: tint },
            ].map((s, i) => (
              <div key={i} className="rounded-3xl p-8 sm:p-10" style={{ background: s.bg }}>
                <p className="text-4xl sm:text-5xl font-bold text-[#1C1C1A] font-[family-name:var(--font-heading)]">{s.n}</p>
                <p className="text-sm font-medium text-[#1C1C1A]/55 mt-3 leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── APPROACH ─────────────────────────────────────────────────────── */}
      <section className="bg-[#fbf8f5]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-4 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="inline-block text-[#1C1C1A] text-xs font-semibold rounded-full px-3.5 py-1.5" style={{ background: tint }}>
                  Il nostro approccio
                </span>
                <IconArrowRight color={accent} />
              </div>
              <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-bold tracking-tight text-[#1C1C1A] leading-[1.1] mb-6 font-[family-name:var(--font-heading)]">
                Non confrontiamo solo i prezzi.<br />Analizziamo il tuo lavoro.
              </h2>
              <p className="text-base text-[#1C1C1A]/55 leading-relaxed">
                Una RC professionale efficace dipende da molti fattori: il tipo di attività che svolgi, il livello di responsabilità, i clienti con cui lavori, i rischi specifici del tuo settore.
              </p>
              <p className="text-base text-[#1C1C1A]/55 leading-relaxed mt-4">
                Per questo il nostro sistema non ordina semplicemente le polizze dal prezzo più basso. Identifica la soluzione più equilibrata tra protezione, coperture, affidabilità e costo.
              </p>
            </div>
            <div className="space-y-3">
              {[
                { label: "Tipo di attività svolta",      desc: "Valutata in base al settore e alla specializzazione" },
                { label: "Livello di responsabilità",    desc: "Struttura, volume d'affari, numero di collaboratori" },
                { label: "Rischi specifici del settore", desc: "Colpa grave, retroattività, massimali adeguati" },
                { label: "Qualità delle coperture",      desc: "Non solo il premio annuo, ma cosa copre davvero" },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 flex gap-4 items-start shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: tint }}>
                    <span className="text-[#1C1C1A] text-xs font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-[#1C1C1A] text-base">{item.label}</p>
                    <p className="text-sm text-[#1C1C1A]/50 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TRANSPARENCY ─────────────────────────────────────────────────── */}
      <section className="bg-[#fbf8f5]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8 pb-24">
          <div className="bg-[#eeb3b3] rounded-3xl p-8 md:p-14">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="inline-block bg-white/60 text-[#1C1C1A] text-xs font-semibold rounded-full px-3.5 py-1.5">
                    Trasparenza
                  </span>
                  <IconCircle color={accent} />
                </div>
                <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-bold tracking-tight text-[#1C1C1A] leading-[1.1] mb-5 font-[family-name:var(--font-heading)]">
                  Capire una polizza dovrebbe essere semplice.
                </h2>
                <p className="text-base text-[#1C1C1A]/60 leading-relaxed">
                  Massimali, franchigie, retroattività, colpa grave. Molti professionisti sottoscrivono una polizza senza avere davvero chiaro cosa copre, cosa resta escluso e quali clausole incidono sulla protezione reale.
                </p>
                <p className="text-base text-[#1C1C1A]/60 leading-relaxed mt-4">
                  scelgosicuro ti aiuta a comprendere le opzioni in modo semplice e chiaro, così puoi scegliere con maggiore sicurezza.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {["Cosa copre","Cosa resta escluso","Quali garanzie contano","Clausole che incidono"].map((item) => (
                  <div key={item} className="bg-white rounded-2xl p-5 flex items-start gap-3 shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: tint }}>
                      <span className="text-[#1C1C1A] text-[8px] font-bold">✓</span>
                    </div>
                    <span className="text-sm font-semibold text-[#1C1C1A] leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROFESSIONI ──────────────────────────────────────────────────── */}
      <section className="bg-[#fbf8f5] py-8">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 pb-24">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <span className="inline-block text-[#1C1C1A] text-xs font-semibold rounded-full px-3.5 py-1.5" style={{ background: tint }}>
                Soluzioni dedicate
              </span>
            </div>
            <h2 className="text-[clamp(2rem,4.5vw,3.2rem)] font-bold tracking-tight text-[#1C1C1A] leading-[1.05] font-[family-name:var(--font-heading)]">
              Ogni professione<br />ha esigenze diverse.
            </h2>
            <div className="mt-4 mb-6">
              <IconArrowDown color={accent} />
            </div>
            <p className="text-base text-[#1C1C1A]/55 max-w-lg leading-relaxed">
              Anche la polizza dovrebbe esserlo. Copriamo le principali categorie professionali con soluzioni calibrate sul profilo di rischio reale.
            </p>
          </div>
          <div className="bg-[#dad2c4] rounded-3xl p-5 md:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {["Medici","Avvocati","Ingegneri","Geometri","Architetti","Commercialisti","Consulenti","Liberi professionisti"].map((prof) => (
                <Link key={prof} href="/app" className="bg-white rounded-2xl px-5 py-4 flex items-center gap-3 transition-all duration-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] hover:-translate-y-px">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: accent }} />
                  <p className="font-semibold text-sm text-[#1C1C1A]">{prof}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY US ───────────────────────────────────────────────────────── */}
      <section className="bg-[#f8f2ea]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-24">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <span className="inline-block text-[#1C1C1A] text-xs font-semibold rounded-full px-3.5 py-1.5" style={{ background: tint }}>
                Perché noi
              </span>
              <IconPlus color={accent} />
            </div>
            <h2 className="text-[clamp(2rem,4.5vw,3.2rem)] font-bold tracking-tight text-[#1C1C1A] leading-[1.05] font-[family-name:var(--font-heading)]">
              Perché scegliere scelgosicuro
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Proposta realmente personalizzata",    desc: "Basata sul tuo profilo professionale, non solo sul prezzo." },
              { title: "Sistema di selezione intelligente",    desc: "Costruito per individuare la soluzione più coerente con il tuo livello di rischio." },
              { title: "Spiegazioni semplici e chiare",        desc: "Per aiutarti a capire davvero cosa stai acquistando, senza termini tecnici." },
              { title: "Trasparenza totale",                   desc: "Ti consigliamo una soluzione, ma puoi sempre confrontare tutte le alternative." },
              { title: "Velocità e semplicità",                desc: "Preventivo ed emissione gestiti completamente online, in pochi minuti." },
              { title: "Supporto umano quando serve",          desc: "Tecnologia e consulenza lavorano insieme. Un consulente è sempre disponibile." },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-3xl p-7 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-5" style={{ background: tint }}>
                  <span className="text-[#1C1C1A] text-base font-bold">✓</span>
                </div>
                <h3 className="font-bold text-[#1C1C1A] text-base mb-2 font-[family-name:var(--font-heading)]">{item.title}</h3>
                <p className="text-sm text-[#1C1C1A]/50 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section id="faq" className="bg-[#fbf8f5]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className="inline-block text-[#1C1C1A] text-xs font-semibold rounded-full px-3.5 py-1.5" style={{ background: tint }}>
                  FAQ
                </span>
                <IconAsterisk color={accent} />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-[#1C1C1A] font-[family-name:var(--font-heading)]">Domande frequenti</h2>
              <p className="text-base text-[#1C1C1A]/50 mt-4 leading-relaxed">
                Non trovi risposta?{" "}
                <span className="text-[#1C1C1A] font-semibold underline cursor-pointer hover:opacity-60 transition-opacity">Scrivici →</span>
              </p>
            </div>
            <div className="md:col-span-2 space-y-3">
              {FAQ_DATA.map((item, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between py-5 px-6 text-left"
                  >
                    <span className="font-semibold text-base text-[#1C1C1A] pr-4">{item.q}</span>
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-base font-bold transition-all duration-200"
                      style={openFaq === i ? { background: accent, color: "white" } : { background: "#fbf8f5", color: "#1C1C1A" }}
                    >
                      {openFaq === i ? "−" : "+"}
                    </span>
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-5 text-base text-[#1C1C1A]/55 leading-relaxed border-t border-[#e2dbd0] pt-4">
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
      <section className="relative overflow-hidden" style={{ background: accent }}>
        <div
          className="absolute pointer-events-none"
          style={{ top: "-50%", right: "-5%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 65%)", filter: "blur(60px)" }}
        />
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 relative z-10">
          <div className="max-w-lg">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1C1C1A] font-[family-name:var(--font-heading)]">
              La scelta giusta non è sempre la più economica.
            </h2>
            <p className="text-base text-[#1C1C1A]/55 mt-3 leading-relaxed">
              È quella più adatta a proteggere il tuo lavoro. Online in pochi minuti — nessun obbligo.
            </p>
          </div>
          <Link href="/app" className="bg-white text-[#1C1C1A] font-semibold px-8 py-4 rounded-full text-base transition-all duration-200 hover:-translate-y-px hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)] flex-shrink-0 whitespace-nowrap">
            Calcola il preventivo →
          </Link>
        </div>
      </section>

      {/* ── FOOTER — sfondo nero ──────────────────────────────────────────── */}
      <footer className="bg-black">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16">
          <div className="flex flex-col md:flex-row justify-between gap-12">
            <div>
              <p className="font-bold text-2xl text-white tracking-tight font-[family-name:var(--font-heading)] mb-3">
                scelgosicuro<span style={{ color: accent }}>.</span>
              </p>
              <p className="text-sm text-white/40 max-w-xs leading-relaxed">
                Intermediario assicurativo iscritto al R.U.I. presso IVASS.<br />P.IVA 12345678901
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
              {[
                { title: "Professioni", links: ["Medici","Avvocati","Ingegneri","Commercialisti"] },
                { title: "Azienda",     links: ["Chi siamo","Come funziona","Contatti"] },
                { title: "Legale",      links: ["Privacy Policy","Termini e condizioni","Cookie Policy"] },
              ].map((col) => (
                <div key={col.title} className="space-y-3">
                  <p className="text-white/50 font-semibold text-xs tracking-widest uppercase">{col.title}</p>
                  {col.links.map((l) => (
                    <p key={l} className="text-white/30 hover:text-white cursor-pointer transition-colors text-xs">{l}</p>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row justify-between gap-2 text-xs text-white/20">
            <p>© 2025 scelgosicuro. Tutti i diritti riservati.</p>
            <p>Regolato da IVASS — D.Lgs. 209/2005</p>
          </div>
        </div>
      </footer>

      <ThemeExplorer
        tint={tint} accent={accent} btnBg={btnBg}
        setTint={setTint} setAccent={setAccent} setBtnBg={setBtnBg}
      />

      <style>{`
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-33.333%)} }
      `}</style>
    </>
  );
}
