"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LandingNav } from "@/components/landing-nav";

const FAQ_DATA = [
  { q: "Quanto tempo serve per ottenere un preventivo?", a: "In molti casi bastano pochi minuti. Ti chiediamo solo le informazioni che contano davvero: professione, attività, responsabilità e rischi. Niente moduli infiniti." },
  { q: "Come viene scelta la polizza consigliata?", a: "Il sistema analizza il tuo profilo professionale, i rischi tipici della tua attività e le coperture disponibili per individuare la soluzione più coerente — non solo la più economica." },
  { q: "Posso vedere anche altre opzioni oltre a quella consigliata?", a: "Sì. La piattaforma ti propone una soluzione consigliata, ma mantiene visibili anche le alternative disponibili. Trasparenza totale." },
  { q: "Il preventivo è gratuito e senza impegno?", a: "Sempre. Nessun costo nascosto, nessun obbligo di acquisto. Puoi calcolare il preventivo, confrontare le opzioni e decidere con calma." },
  { q: "Posso parlare con un consulente?", a: "Sì. Se necessario puoi ricevere supporto da un consulente dedicato. Tecnologia e presenza umana lavorano insieme." },
  { q: "Cosa sono massimali, franchigie e retroattività?", a: "Sono i parametri chiave di una RC professionale. Ti spieghiamo cosa significano in modo chiaro, senza linguaggio tecnico, così sai esattamente cosa stai acquistando." },
];

const YEL = "#FFE600";
const PUR = "#7C3AED";
const BLK = "#0A0A0A";
const WHT = "#FFFFFF";

const PROFESSIONS = ["Medico","Avvocato","Ingegnero","Geometra","Architetto","Commercialista","Consulente","Altro"];
const ACTIVITIES = ["Libero professionista","Studio associato","Società di professionisti","Azienda"];
const COVERAGE = ["Fino a €500k","Fino a €1M","Fino a €2.5M","Fino a €5M","Personalizzato"];

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-4">
        <div className="flex items-center justify-between rounded-full px-6 py-3 bg-black border border-white/10" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}>
          <span className="font-bold text-lg font-[family-name:var(--font-heading)]">
            <span className="text-white">scelgosicuro</span><span style={{ color: YEL }}>.</span>
          </span>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-white/40">
            <a href="#come-funziona" className="hover:text-white transition-colors">Come funziona</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <LandingNav current="4" variant="dark" />
          <Link href="/app" className="font-bold px-5 py-2 text-sm rounded-full transition-all duration-200 hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]" style={{ background: PUR, color: WHT }}>
            Preventivo gratuito →
          </Link>
        </div>
      </div>
    </nav>
  );
}

function NLSelect({ value, onChange, placeholder, options }: { value: string; onChange: (v: string) => void; placeholder: string; options: string[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none bg-transparent font-bold font-[family-name:var(--font-heading)] outline-none cursor-pointer"
      style={{
        color: value ? PUR : "rgba(0,0,0,0.38)",
        fontSize: "inherit",
        borderBottom: `2px ${value ? "solid" : "dashed"} ${value ? PUR : "rgba(0,0,0,0.35)"}`,
        paddingBottom: 2,
      }}
    >
      <option value="" disabled style={{ background: YEL, color: BLK }}>{placeholder}</option>
      {options.map((o) => <option key={o} value={o} style={{ background: YEL, color: BLK }}>{o}</option>)}
    </select>
  );
}

export default function Landing4Page() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [profession, setProfession] = useState("");
  const [activity, setActivity] = useState("");
  const [coverage, setCoverage] = useState("");

  return (
    <>
      <Navbar />

      {/* ── HERO — giallo, form con immagine ── */}
      <section className="relative overflow-hidden" style={{ minHeight: "100vh", background: YEL }}>
        <div className="absolute top-20 right-10 w-32 h-32 rounded-full border-4 border-black/5 pointer-events-none hidden lg:block" />
        <div className="absolute bottom-32 left-8 w-20 h-20 rounded-full pointer-events-none hidden lg:block" style={{ background: PUR, opacity: 0.06 }} />
        <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10 flex items-center" style={{ minHeight: "100vh" }}>
          <div className="pt-24 pb-20 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-8" style={{ background: PUR, color: WHT }}>
                  RC Professionale
                </div>
                <h1 className="text-[clamp(2.8rem,6vw,5.5rem)] font-bold leading-[0.88] tracking-[-0.04em] text-black font-[family-name:var(--font-heading)] mb-6">
                  La RC professionale<br />
                  <span style={{ color: PUR }}>fatta bene.</span>
                </h1>
                <p className="text-lg text-black/40 leading-relaxed max-w-md mb-8">
                  scelgosicuro analizza il tuo profilo, confronta le migliori compagnie e ti spiega davvero cosa stai acquistando. In 2 minuti.
                </p>
                <div className="flex flex-wrap gap-5 text-sm text-black/30">
                  {["Gratuito","Senza impegno","Polizza attiva < 24h"].map((t) => (
                    <div key={t} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: PUR }} />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="overflow-hidden rounded-[2rem]" style={{ background: BLK, boxShadow: "0 32px 80px rgba(0,0,0,0.25)" }}>
                  <div className="relative">
                    <Image src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80" alt="" width={800} height={300} className="w-full h-48 object-cover opacity-40" />
                    <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 30%, ${BLK})` }} />
                  </div>
                  <div className="p-8 pt-4 relative z-10">
                    <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em] mb-8">Calcola il tuo preventivo</p>
                    <div className="space-y-5">
                      <p className="text-white text-lg md:text-xl font-bold leading-relaxed font-[family-name:var(--font-heading)]">
                        Sono <NLSelect value={profession} onChange={setProfession} placeholder="professione" options={PROFESSIONS} />
                        <br />lavoro come <NLSelect value={activity} onChange={setActivity} placeholder="attività" options={ACTIVITIES} />
                        <br />e voglio copertura <NLSelect value={coverage} onChange={setCoverage} placeholder="massimale" options={COVERAGE} />
                      </p>
                      <div className="pt-3">
                        <Link href="/app" className="inline-flex items-center justify-center gap-2 font-bold px-8 py-3.5 text-sm rounded-full transition-all duration-300 hover:shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:-translate-y-px" style={{ background: PUR, color: WHT }}>
                          Calcola il preventivo →
                        </Link>
                      </div>
                      <p className="text-white/20 text-xs">Gratuito e senza impegno · 2 minuti</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE — nero ── */}
      <div className="overflow-hidden py-5" style={{ background: BLK }}>
        <div className="flex whitespace-nowrap" style={{ animation: "marquee 26s linear infinite" }}>
          {[0, 1, 2].map((rep) => (
            <span key={rep} className="inline-flex items-center">
              {["AMTRUST","AXA","GENERALI","UNIPOL","ALLIANZ","HDI","GROUPAMA","ZURICH","SARA"].map((c) => (
                <span key={`${rep}-${c}`} className="inline-flex items-center gap-5 mx-8 text-white/15 font-bold text-sm tracking-[0.15em]">
                  <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ background: YEL }} />{c}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS — bianco, timeline verticale con immagine ── */}
      <section id="come-funziona" className="bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-24 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-12 md:gap-16 items-start">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-[2px]" style={{ background: PUR }} />
                <span className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: PUR }}>Come funziona</span>
              </div>
              <h2 className="text-[clamp(2.2rem,5vw,4rem)] font-bold tracking-[-0.04em] text-black leading-[0.9] font-[family-name:var(--font-heading)] mb-16">
                Tre passi.<br /><span className="text-black/15">Niente di più.</span>
              </h2>
              <div className="space-y-0">
                {[
                  { n: "01", title: "Inserisci poche informazioni", desc: "Ti chiediamo solo ciò che serve: professione, attività, responsabilità, rischi. Niente moduli infiniti." },
                  { n: "02", title: "Il sistema analizza il tuo profilo", desc: "scelgosicuro combina le caratteristiche della tua professione e i rischi tipici del settore per trovare il prodotto più coerente." },
                  { n: "03", title: "Ricevi una proposta selezionata", desc: "Ti presentiamo la soluzione più adatta. Puoi confrontarla con le alternative e affinare il preventivo in tempo reale." },
                ].map((s, i) => (
                  <div key={s.n} className="flex gap-8 pb-14 relative last:pb-0">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm" style={{ background: i === 0 ? YEL : "#F5F5F5", color: i === 0 ? BLK : BLK }}>
                        {s.n}
                      </div>
                      {i < 2 && <div className="w-px flex-1 mt-3 bg-black/8" />}
                    </div>
                    <div className="pt-1.5">
                      <h3 className="text-xl font-bold text-black font-[family-name:var(--font-heading)] mb-2">{s.title}</h3>
                      <p className="text-sm text-black/40 leading-relaxed max-w-md">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden md:block sticky top-28">
              <div className="rounded-[2rem] overflow-hidden" style={{ boxShadow: "0 16px 48px rgba(0,0,0,0.08)" }}>
                <Image src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&q=80" alt="" width={400} height={500} className="w-full h-auto object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS — banda viola full-width ── */}
      <section style={{ background: PUR }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-10 md:py-14">
            {[
              { n: "2 min", label: "Per un preventivo" },
              { n: "5+", label: "Compagnie" },
              { n: "100%", label: "Online" },
              { n: "< 24h", label: "Attivazione" },
            ].map((s, i) => (
              <div key={s.label} className="flex items-center gap-5">
                <p className="text-5xl md:text-6xl font-bold font-[family-name:var(--font-heading)] leading-none text-white">{s.n}</p>
                <p className="text-xs font-bold text-white/40 uppercase tracking-wider">{s.label}</p>
                {i < 3 && <div className="hidden md:block w-px h-12 bg-white/10 ml-10" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── APPROACH — nero, full-bleed image + overlay ── */}
      <section style={{ background: BLK }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-24">
          <div className="relative rounded-[2rem] overflow-hidden" style={{ minHeight: "400px" }}>
            <Image src="https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=1400&q=80" alt="" width={1400} height={600} className="absolute inset-0 w-full h-full object-cover opacity-20" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${BLK}ee 40%, ${BLK}99)` }} />
            <div className="relative z-10 p-10 md:p-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-[2px]" style={{ background: YEL }} />
                  <span className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: YEL }}>Il nostro approccio</span>
                </div>
                <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-bold tracking-[-0.03em] text-white leading-[1] font-[family-name:var(--font-heading)] mb-6">
                  Non confrontiamo solo i prezzi<span style={{ color: YEL }}>.</span>
                </h2>
                <p className="text-base text-white/35 leading-relaxed">Una RC efficace dipende dal tipo di attività, livello di responsabilità e rischi specifici del settore.</p>
                <p className="text-base text-white/35 leading-relaxed mt-4">Il nostro sistema identifica la soluzione più equilibrata tra protezione, coperture e costo.</p>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Tipo di attività svolta", desc: "Settore e specializzazione" },
                  { label: "Livello di responsabilità", desc: "Struttura e volume" },
                  { label: "Rischi specifici del settore", desc: "Colpa grave, retroattività" },
                  { label: "Qualità delle coperture", desc: "Cosa copre davvero" },
                ].map((item, i) => (
                  <div key={item.label} className="flex items-center gap-4 p-4 rounded-xl border border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ background: i % 2 === 0 ? YEL : PUR, color: BLK }}>
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{item.label}</p>
                      <p className="text-xs text-white/25">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRANSPARENCY — giallo, layout specchiato ── */}
      <section style={{ background: YEL }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-24">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-12 items-center">
            {/* Immagine a sinistra */}
            <div className="relative order-2 md:order-1">
              <div className="rounded-[2rem] overflow-hidden" style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.1)" }}>
                <Image src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80" alt="" width={800} height={600} className="w-full h-auto object-cover" />
              </div>
              <div className="absolute -top-4 -left-4 w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: PUR, boxShadow: "0 8px 24px rgba(124,58,237,0.3)" }}>
                <span className="text-white text-2xl font-bold font-[family-name:var(--font-heading)]">?</span>
              </div>
            </div>
            {/* Testo a destra */}
            <div className="order-1 md:order-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-[2px]" style={{ background: PUR }} />
                <span className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: PUR }}>Trasparenza</span>
              </div>
              <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-bold tracking-[-0.03em] text-black leading-[1.05] font-[family-name:var(--font-heading)] mb-6">
                Capire una polizza dovrebbe essere semplice<span style={{ color: PUR }}>.</span>
              </h2>
              <p className="text-base text-black/40 leading-relaxed">Molti professionisti sottoscrivono una polizza senza avere chiaro cosa copre, cosa resta escluso e quali clausole incidono sulla protezione reale.</p>
              <p className="text-base text-black/40 leading-relaxed mt-4">scelgosicuro ti aiuta a comprendere le opzioni in modo semplice e chiaro.</p>
              <div className="flex flex-wrap gap-2 mt-8">
                {["Cosa copre","Cosa resta escluso","Quali garanzie contano","Clausole che incidono"].map((item, i) => (
                  <span key={item} className="px-4 py-2 rounded-full text-xs font-bold" style={{ background: i % 2 === 0 ? BLK : PUR, color: WHT }}>{item}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROFESSIONS — bianco, griglia con immagini ── */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-24">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6" style={{ background: YEL, color: BLK }}>Soluzioni dedicate</span>
            <h2 className="text-[clamp(2rem,5vw,4rem)] font-bold tracking-[-0.04em] text-black leading-[0.9] font-[family-name:var(--font-heading)]">
              Ogni professione ha esigenze diverse<span style={{ color: PUR }}>.</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { name: "Medici", img: "photo-1551076805-e1869033e561" },
              { name: "Avvocati", img: "photo-1589829545856-10cfc1e6a68a" },
              { name: "Ingegneri", img: "photo-1504384308090-c894fdcc538d" },
              { name: "Geometri", img: "photo-1503387762-592deb58ef4e" },
              { name: "Architetti", img: "photo-1487958449943-2429e8be8625" },
              { name: "Commercialisti", img: "photo-1460925895917-afdab827c52f" },
              { name: "Consulenti", img: "photo-1556761175-5973dc0f32e7" },
              { name: "Liberi professionisti", img: "photo-1521737711867-e3b97375f902" },
            ].map((prof, i) => (
              <Link key={prof.name} href="/app" className="group relative rounded-2xl overflow-hidden aspect-[4/3] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl" style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
                <Image src={`https://images.unsplash.com/${prof.img}?w=400&q=80`} alt="" width={400} height={300} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0" style={{ background: i % 2 === 0 ? `linear-gradient(to top, ${BLK}cc 0%, transparent 60%)` : `linear-gradient(to top, ${PUR}cc 0%, transparent 60%)` }} />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-bold text-sm">{prof.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY US — viola, lista numerata orizzontale ── */}
      <section style={{ background: PUR }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-24">
          <h2 className="text-[clamp(2rem,5vw,4rem)] font-bold tracking-[-0.04em] text-white leading-[0.9] font-[family-name:var(--font-heading)] max-w-2xl mb-16">
            Perché scegliere<br />scelgosicuro<span className="text-white/20">.</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "Proposta realmente personalizzata", desc: "Basata sul tuo profilo professionale, non solo sul prezzo." },
              { title: "Sistema di selezione intelligente", desc: "Per individuare la soluzione più coerente con il tuo livello di rischio." },
              { title: "Spiegazioni semplici e chiare", desc: "Per aiutarti a capire davvero cosa stai acquistando." },
              { title: "Trasparenza totale", desc: "Puoi sempre confrontare tutte le alternative." },
              { title: "Velocità e semplicità", desc: "Preventivo ed emissione gestiti completamente online." },
              { title: "Supporto umano quando serve", desc: "Un consulente è sempre disponibile." },
            ].map((item, i) => (
              <div key={i} className="rounded-2xl p-6 flex gap-5 transition-all duration-300 hover:-translate-y-0.5" style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.15)" }}>
                <span className="text-3xl font-bold font-[family-name:var(--font-heading)] text-white/10 flex-shrink-0">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="font-bold text-white text-sm mb-1 font-[family-name:var(--font-heading)]">{item.title}</h3>
                  <p className="text-xs text-white/40 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ — giallo, full-width accordion ── */}
      <section id="faq" style={{ background: YEL }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-24">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-[2px]" style={{ background: PUR }} />
              <span className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: PUR }}>FAQ</span>
            </div>
            <h2 className="text-[clamp(2.2rem,5vw,4rem)] font-bold tracking-[-0.04em] text-black leading-[0.9] font-[family-name:var(--font-heading)] mb-12">
              Domande frequenti<span style={{ color: PUR }}>.</span>
            </h2>
            <div className="space-y-3">
              {FAQ_DATA.map((item, i) => (
                <div key={i} className="rounded-2xl overflow-hidden transition-all duration-300" style={{ background: openFaq === i ? BLK : WHT, boxShadow: openFaq === i ? "0 8px 32px rgba(0,0,0,0.1)" : "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between py-5 px-6 text-left gap-4">
                    <span className="font-bold" style={{ color: openFaq === i ? WHT : BLK }}>{item.q}</span>
                    <span className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all duration-300" style={openFaq === i ? { background: YEL, color: BLK } : { background: PUR, color: WHT }}>
                      {openFaq === i ? "−" : "+"}
                    </span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? "max-h-60 pb-6" : "max-h-0"}`}>
                    <p className="text-sm leading-relaxed max-w-lg px-6" style={{ color: "rgba(255,255,255,0.5)" }}>{item.a}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-black/30 mt-8">
              Non trovi risposta?{" "}
              <span className="text-black font-bold cursor-pointer hover:opacity-60 transition-opacity">Scrivici →</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA — nero, card viola + glow ── */}
      <section style={{ background: BLK }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-24">
          <div className="rounded-[2rem] p-12 md:p-16 relative overflow-hidden" style={{ background: PUR }}>
            <div className="absolute pointer-events-none" style={{ top: "-30%", right: "-10%", width: "400px", height: "400px", borderRadius: "50%", background: `radial-gradient(circle, ${YEL}20 0%, transparent 60%)`, filter: "blur(40px)" }} />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 relative z-10">
              <div className="max-w-xl">
                <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-bold tracking-[-0.03em] text-white font-[family-name:var(--font-heading)] leading-[1]">
                  La scelta giusta non è sempre la più economica.
                </h2>
                <p className="text-base text-white/45 mt-4 leading-relaxed">È quella più adatta a proteggere il tuo lavoro. Online in pochi minuti — nessun obbligo.</p>
              </div>
              <Link href="/app" className="font-bold px-8 py-4 rounded-full text-base transition-all duration-300 hover:shadow-[0_8px_40px_rgba(255,230,0,0.3)] flex-shrink-0 whitespace-nowrap" style={{ background: YEL, color: BLK }}>
                Calcola il preventivo →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: BLK }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16">
          <div className="flex flex-col md:flex-row justify-between gap-12">
            <div>
              <p className="font-bold text-2xl text-white font-[family-name:var(--font-heading)] mb-3">
                scelgosicuro<span style={{ color: YEL }}>.</span>
              </p>
              <p className="text-sm text-white/25 max-w-xs leading-relaxed">Intermediario assicurativo iscritto al R.U.I. presso IVASS.<br />P.IVA 12345678901</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
              {[
                { title: "Professioni", links: ["Medici","Avvocati","Ingegneri","Commercialisti"] },
                { title: "Azienda", links: ["Chi siamo","Come funziona","Contatti"] },
                { title: "Legale", links: ["Privacy Policy","Termini e condizioni","Cookie Policy"] },
              ].map((col) => (
                <div key={col.title} className="space-y-3">
                  <p className="text-white/30 font-bold text-xs tracking-[0.15em] uppercase">{col.title}</p>
                  {col.links.map((l) => (
                    <p key={l} className="text-white/15 hover:text-white/40 cursor-pointer transition-colors text-xs">{l}</p>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-white/5 mt-12 pt-6 flex flex-col md:flex-row justify-between gap-2 text-xs text-white/10">
            <p>© 2025 scelgosicuro. Tutti i diritti riservati.</p>
            <p>Regolato da IVASS — D.Lgs. 209/2005</p>
          </div>
        </div>
      </footer>

      <style>{`@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-33.333%)}}`}</style>
    </>
  );
}
