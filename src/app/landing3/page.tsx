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

const TERRA = "#C45C3C";
const SAND = "#E8D5C4";
const CREAM = "#FAF6F0";
const OLIVE = "#5C6B3C";
const NAVY = "#1B2838";

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b" style={{ background: `${CREAM}/95`, backdropFilter: "blur(16px)", borderColor: SAND }}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
        <span className="font-bold text-xl tracking-[-0.03em] font-[family-name:var(--font-heading)]" style={{ color: NAVY }}>
          scelgosicuro<span style={{ color: TERRA }}>.</span>
        </span>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: `${NAVY}40` }}>
          <a href="#come-funziona" className="hover:opacity-100 transition-opacity" style={{ color: "inherit" }}>Come funziona</a>
          <a href="#faq" className="hover:opacity-100 transition-opacity" style={{ color: "inherit" }}>FAQ</a>
        </div>
        <LandingNav current="3" />
        <Link href="/app" className="font-bold px-5 py-2.5 text-sm rounded-full transition-all duration-200 hover:-translate-y-px hover:shadow-lg" style={{ background: TERRA, color: "#fff" }}>
          Preventivo gratuito →
        </Link>
      </div>
    </nav>
  );
}

export default function Landing3Page() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <Navbar />

      {/* ── HERO — bento asimmetrico con immagine ── */}
      <section style={{ background: CREAM }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-20 md:py-28">
          <div className="grid grid-cols-12 gap-4 md:gap-5">
            {/* Titolo — 7 colonne */}
            <div className="col-span-12 md:col-span-7">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 rounded-full" style={{ background: TERRA }} />
                <span className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: TERRA }}>RC Professionale</span>
              </div>
              <h1 className="text-[clamp(2.6rem,5.5vw,5rem)] font-bold leading-[0.9] tracking-[-0.04em] font-[family-name:var(--font-heading)] mb-6" style={{ color: NAVY }}>
                Scegliere la RC giusta non dovrebbe essere complicato<span style={{ color: TERRA }}>.</span>
              </h1>
              <p className="text-base leading-relaxed max-w-md mb-8" style={{ color: `${NAVY}55` }}>
                scelgosicuro analizza il tuo profilo, confronta le migliori compagnie e ti spiega davvero cosa stai acquistando. In 2 minuti.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/app" className="inline-flex items-center justify-center font-bold px-8 py-4 text-base rounded-full transition-all duration-200 hover:-translate-y-px hover:shadow-lg" style={{ background: TERRA, color: "#fff" }}>
                  Calcola il preventivo →
                </Link>
                <a href="#come-funziona" className="inline-flex items-center justify-center font-bold px-8 py-4 text-base rounded-full border-2 transition-all duration-200" style={{ borderColor: SAND, color: NAVY }}>
                  Come funziona
                </a>
              </div>
            </div>
            {/* Immagine — 5 colonne */}
            <div className="col-span-12 md:col-span-5 row-span-2 hidden md:block">
              <div className="rounded-[2rem] overflow-hidden h-full" style={{ minHeight: "380px", boxShadow: "0 16px 48px rgba(0,0,0,0.08)" }}>
                <Image src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80" alt="" width={600} height={500} className="w-full h-full object-cover" />
              </div>
            </div>
            {/* Mini-card badge — sotto il titolo */}
            <div className="col-span-6 md:col-span-4">
              <div className="rounded-2xl p-5 border" style={{ background: "#fff", borderColor: SAND }}>
                <p className="text-3xl font-bold font-[family-name:var(--font-heading)]" style={{ color: TERRA }}>5+</p>
                <p className="text-xs mt-1" style={{ color: `${NAVY}40` }}>Compagnie confrontate</p>
              </div>
            </div>
            <div className="col-span-6 md:col-span-3">
              <div className="rounded-2xl p-5 border" style={{ background: "#fff", borderColor: SAND }}>
                <p className="text-3xl font-bold font-[family-name:var(--font-heading)]" style={{ color: OLIVE }}>2 min</p>
                <p className="text-xs mt-1" style={{ color: `${NAVY}40` }}>Per il preventivo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="overflow-hidden py-4 border-y" style={{ background: "#fff", borderColor: SAND }}>
        <div className="flex whitespace-nowrap" style={{ animation: "marquee 28s linear infinite" }}>
          {[0, 1, 2].map((rep) => (
            <span key={rep} className="inline-flex items-center">
              {["AMTRUST","AXA","GENERALI","UNIPOL","ALLIANZ","HDI","GROUPAMA","ZURICH","SARA"].map((c) => (
                <span key={`${rep}-${c}`} className="inline-flex items-center gap-5 mx-8 font-bold text-sm tracking-[0.15em]" style={{ color: `${NAVY}15` }}>
                  <span className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0" style={{ background: TERRA }} />{c}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS — navy, card orizzontali con barra laterale ── */}
      <section id="come-funziona" style={{ background: NAVY }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-24 pb-20">
          <p className="text-xs font-bold uppercase tracking-[0.15em] mb-4" style={{ color: TERRA }}>Come funziona</p>
          <h2 className="text-[clamp(2rem,5vw,4rem)] font-bold tracking-[-0.04em] text-white leading-[0.9] font-[family-name:var(--font-heading)] max-w-lg mb-20">
            Un processo semplice<span className="text-white/15">.</span>
          </h2>
          <div className="space-y-4">
            {[
              { n: "01", title: "Inserisci poche informazioni", desc: "Ti chiediamo solo ciò che serve: professione, attività, responsabilità, rischi. Niente moduli infiniti o compilazioni inutili." },
              { n: "02", title: "Il sistema analizza il tuo profilo", desc: "scelgosicuro combina le caratteristiche della tua professione e i rischi tipici del settore per trovare il prodotto più coerente con il tuo lavoro." },
              { n: "03", title: "Ricevi una proposta già selezionata", desc: "Ti presentiamo la soluzione più adatta al tuo profilo. Puoi confrontarla con le alternative e affinare il preventivo in tempo reale." },
            ].map((s, i) => (
              <div key={s.n} className="flex gap-0 rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                <div className="w-20 md:w-28 flex items-center justify-center flex-shrink-0" style={{ background: i === 0 ? TERRA : i === 1 ? OLIVE : SAND }}>
                  <span className="text-2xl font-bold font-[family-name:var(--font-heading)]" style={{ color: i === 2 ? NAVY : "#fff" }}>{s.n}</span>
                </div>
                <div className="p-6 md:p-8 flex-1">
                  <h3 className="text-lg font-bold text-white font-[family-name:var(--font-heading)] mb-2">{s.title}</h3>
                  <p className="text-sm text-white/35 leading-relaxed max-w-lg">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS + APPROACH — bento grid su sfondo crema ── */}
      <section style={{ background: CREAM }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 auto-rows-[minmax(120px,auto)]">
            {/* Stat grande */}
            <div className="col-span-2 rounded-[2rem] p-8 flex flex-col justify-between" style={{ background: TERRA }}>
              <p className="text-6xl font-bold font-[family-name:var(--font-heading)] text-white leading-none">2 min</p>
              <p className="text-sm text-white/50 mt-4">Per ottenere un preventivo completo, gratuito e senza impegno.</p>
            </div>
            {/* Stat piccola */}
            <div className="rounded-[2rem] p-6 flex flex-col justify-between bg-white border" style={{ borderColor: SAND }}>
              <p className="text-4xl font-bold font-[family-name:var(--font-heading)] leading-none" style={{ color: OLIVE }}>100%</p>
              <p className="text-xs mt-2" style={{ color: `${NAVY}40` }}>Online</p>
            </div>
            {/* Stat piccola */}
            <div className="rounded-[2rem] p-6 flex flex-col justify-between bg-white border" style={{ borderColor: SAND }}>
              <p className="text-4xl font-bold font-[family-name:var(--font-heading)] leading-none" style={{ color: TERRA }}>{"<"}24h</p>
              <p className="text-xs mt-2" style={{ color: `${NAVY}40` }}>Polizza attiva</p>
            </div>
            {/* Approach text — largo */}
            <div className="col-span-2 md:col-span-3 rounded-[2rem] p-8 md:p-10 bg-white border" style={{ borderColor: SAND }}>
              <p className="text-xs font-bold uppercase tracking-[0.15em] mb-4" style={{ color: OLIVE }}>Il nostro approccio</p>
              <h2 className="text-[clamp(1.6rem,3.5vw,2.6rem)] font-bold tracking-[-0.03em] leading-[1.05] font-[family-name:var(--font-heading)] mb-4" style={{ color: NAVY }}>
                Non confrontiamo solo i prezzi. Analizziamo il tuo lavoro<span style={{ color: TERRA }}>.</span>
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: `${NAVY}45` }}>Il nostro sistema identifica la soluzione più equilibrata tra protezione, coperture, affidabilità e costo.</p>
            </div>
            {/* Mini immagine */}
            <div className="rounded-[2rem] overflow-hidden hidden md:block" style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.06)" }}>
              <Image src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&q=80" alt="" width={400} height={400} className="w-full h-full object-cover" />
            </div>
          </div>
          {/* Criteria sotto il bento */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
            {[
              { label: "Tipo di attività", desc: "Settore e specializzazione" },
              { label: "Responsabilità", desc: "Struttura e volume" },
              { label: "Rischi specifici", desc: "Colpa grave, retroattività" },
              { label: "Qualità coperture", desc: "Cosa copre davvero" },
            ].map((item, i) => (
              <div key={item.label} className="rounded-xl p-4 bg-white border flex items-start gap-3" style={{ borderColor: SAND }}>
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: i % 2 === 0 ? TERRA : OLIVE }} />
                <div>
                  <p className="font-bold text-sm" style={{ color: NAVY }}>{item.label}</p>
                  <p className="text-xs" style={{ color: `${NAVY}35` }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRANSPARENCY — navy con card interna sabbia ── */}
      <section style={{ background: NAVY }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-24">
          <div className="rounded-[2rem] p-10 md:p-14 relative overflow-hidden" style={{ background: SAND }}>
            <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-12 items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] mb-4" style={{ color: TERRA }}>Trasparenza</p>
                <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-bold tracking-[-0.03em] leading-[1.05] font-[family-name:var(--font-heading)] mb-6" style={{ color: NAVY }}>
                  Capire una polizza dovrebbe essere semplice<span style={{ color: TERRA }}>.</span>
                </h2>
                <p className="text-base leading-relaxed" style={{ color: `${NAVY}50` }}>Molti professionisti sottoscrivono una polizza senza avere chiaro cosa copre, cosa resta escluso e quali clausole incidono sulla protezione reale.</p>
                <p className="text-base leading-relaxed mt-4" style={{ color: `${NAVY}50` }}>scelgosicuro ti aiuta a comprendere le opzioni in modo semplice e chiaro.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {["Cosa copre","Cosa resta escluso","Quali garanzie contano","Clausole che incidono"].map((item, i) => (
                  <div key={item} className="rounded-2xl p-5 flex items-center gap-3" style={{ background: i % 2 === 0 ? "#fff" : NAVY }}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: i % 2 === 0 ? TERRA : SAND }} />
                    <span className="text-sm font-bold" style={{ color: i % 2 === 0 ? NAVY : "#fff" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROFESSIONS — bianco, due colonne con lista ── */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-24">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-16 items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] mb-4" style={{ color: OLIVE }}>Soluzioni dedicate</p>
              <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-bold tracking-[-0.04em] leading-[0.9] font-[family-name:var(--font-heading)]" style={{ color: NAVY }}>
                Ogni professione ha esigenze diverse<span style={{ color: TERRA }}>.</span>
              </h2>
              <p className="text-sm leading-relaxed mt-4" style={{ color: `${NAVY}40` }}>Soluzioni calibrate sul profilo di rischio reale.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {["Medici","Avvocati","Ingegneri","Geometri","Architetti","Commercialisti","Consulenti","Liberi professionisti"].map((prof, i) => (
                <Link key={prof} href="/app" className="group rounded-xl px-5 py-4 flex items-center gap-3 border transition-all duration-200 hover:-translate-y-px hover:shadow-md" style={{ background: i % 3 === 0 ? CREAM : "#fff", borderColor: SAND }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold" style={{ background: i % 2 === 0 ? TERRA : OLIVE, color: "#fff" }}>
                    {i + 1}
                  </div>
                  <p className="font-semibold text-sm" style={{ color: NAVY }}>{prof}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY US — crema, card alternata largo/stretto ── */}
      <section style={{ background: CREAM }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-24">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.15em] mb-4" style={{ color: TERRA }}>Perché noi</p>
            <h2 className="text-[clamp(2rem,5vw,4rem)] font-bold tracking-[-0.04em] leading-[0.9] font-[family-name:var(--font-heading)]" style={{ color: NAVY }}>
              Perché scegliere scelgosicuro<span style={{ color: TERRA }}>.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Proposta realmente personalizzata", desc: "Basata sul tuo profilo professionale, non solo sul prezzo." },
              { title: "Sistema di selezione intelligente", desc: "Per individuare la soluzione più coerente con il tuo livello di rischio." },
              { title: "Spiegazioni semplici e chiare", desc: "Per aiutarti a capire davvero cosa stai acquistando." },
              { title: "Trasparenza totale", desc: "Puoi sempre confrontare tutte le alternative." },
              { title: "Velocità e semplicità", desc: "Preventivo ed emissione gestiti completamente online." },
              { title: "Supporto umano quando serve", desc: "Un consulente è sempre disponibile." },
            ].map((item, i) => {
              const styles = [
                { bg: TERRA, text: "#fff", muted: "rgba(255,255,255,0.5)" },
                { bg: "#fff", text: NAVY, muted: `${NAVY}40` },
                { bg: NAVY, text: "#fff", muted: "rgba(255,255,255,0.4)" },
              ];
              const s = styles[i % 3];
              return (
                <div key={i} className="rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg" style={{ background: s.bg }}>
                  <span className="text-2xl font-bold font-[family-name:var(--font-heading)] block mb-4" style={{ color: s.text, opacity: 0.15 }}>{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="font-bold text-base mb-2 font-[family-name:var(--font-heading)]" style={{ color: s.text }}>{item.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: s.muted }}>{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FAQ — bianco, layout a singola colonna ── */}
      <section id="faq" className="bg-white">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 py-24">
          <p className="text-xs font-bold uppercase tracking-[0.15em] mb-4" style={{ color: OLIVE }}>FAQ</p>
          <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-bold tracking-[-0.04em] leading-[0.9] font-[family-name:var(--font-heading)] mb-4" style={{ color: NAVY }}>
            Domande frequenti<span style={{ color: TERRA }}>.</span>
          </h2>
          <p className="text-sm mb-12" style={{ color: `${NAVY}40` }}>
            Non trovi risposta? <span className="font-bold cursor-pointer hover:opacity-60 transition-opacity" style={{ color: NAVY }}>Scrivici →</span>
          </p>
          <div className="space-y-0">
            {FAQ_DATA.map((item, i) => (
              <div key={i} className="border-b" style={{ borderColor: SAND }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between py-6 text-left gap-4">
                  <span className="font-semibold" style={{ color: NAVY }}>{item.q}</span>
                  <span className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold transition-all duration-300" style={openFaq === i ? { background: TERRA, color: "#fff" } : { background: CREAM, color: NAVY }}>
                    {openFaq === i ? "−" : "+"}
                  </span>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? "max-h-60 pb-6" : "max-h-0"}`}>
                  <p className="text-sm leading-relaxed max-w-lg" style={{ color: `${NAVY}45` }}>{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA — terracotta ── */}
      <section style={{ background: TERRA }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <div className="max-w-xl">
            <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-bold tracking-[-0.03em] text-white font-[family-name:var(--font-heading)] leading-[1]">
              La scelta giusta non è sempre la più economica.
            </h2>
            <p className="text-base text-white/50 mt-4 leading-relaxed">È quella più adatta a proteggere il tuo lavoro. Online in pochi minuti — nessun obbligo.</p>
          </div>
          <Link href="/app" className="font-bold px-8 py-4 rounded-full text-base transition-all duration-200 hover:shadow-lg flex-shrink-0 whitespace-nowrap" style={{ background: "#fff", color: NAVY }}>
            Calcola il preventivo →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: NAVY }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16">
          <div className="flex flex-col md:flex-row justify-between gap-12">
            <div>
              <p className="font-bold text-2xl text-white font-[family-name:var(--font-heading)] mb-3">
                scelgosicuro<span style={{ color: TERRA }}>.</span>
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
