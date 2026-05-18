"use client";

import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  ChevronDown,
  Plus,
  MoveRight,
  Compass,
  Zap,
  Layers,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import "./landing20.css";

const BrandLogo = ({
  className = "w-10 h-10",
  invert = false,
}: {
  className?: string;
  color?: string;
  invert?: boolean;
}) => (
  <img
    src="/logo.svg"
    className={className}
    alt="ScelgoSicuro"
    style={invert ? { filter: "invert(1)" } : undefined}
  />
);

const CustomDropdown = ({
  value,
  options,
  onChange,
  placeholder,
}: {
  value: string;
  options: string[];
  onChange: (val: string) => void;
  placeholder: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="nl-select-creative inline-flex">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <span>{value || placeholder}</span>
        <ChevronDown
          className={cn(
            "w-6 h-6 transition-transform duration-300",
            isOpen && "rotate-180",
          )}
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="dropdown-list-creative"
          >
            {options.map((opt) => (
              <div
                key={opt}
                className="dropdown-item-creative"
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
              >
                {opt}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-700 px-6 md:px-12 py-6",
        isScrolled
          ? "bg-white/95 backdrop-blur-xl py-4 border-b border-black/5 shadow-sm"
          : "bg-transparent",
      )}
    >
      <div className="max-w-[1800px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BrandLogo className="w-10 h-10" />
          <span className="text-2xl font-black tracking-tighter uppercase text-black">
            ScelgoSicuro
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-12 text-[11px] font-bold uppercase tracking-widest text-black/40">
          <a href="#" className="hover:text-black transition-colors">
            Manifesto
          </a>
          <a href="#" className="hover:text-black transition-colors">
            Prodotti
          </a>
          <a href="#" className="hover:text-black transition-colors">
            Il Metodo
          </a>
          <a href="#" className="hover:text-black transition-colors">
            Supporto
          </a>
        </div>

        <button className="h-12 px-8 bg-black text-[#b2ffda] rounded-full font-bold uppercase tracking-widest text-[11px] hover:bg-[#136d58] hover:text-white transition-all">
          Calcola Preventivo
        </button>
      </div>
    </motion.nav>
  );
};

const Hero = () => {
  const { scrollY } = useScroll();
  const rotateScroll = useTransform(scrollY, [0, 800], [0, 45]);

  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-32 pb-20 overflow-hidden bg-[#fdfdfb]">
      <div className="hero-blob" />

      <div className="hidden xl:flex hero-orbital-container">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="orbital-ring"
            style={{
              width: i * 120,
              height: i * 120,
              borderWidth: 1.5,
              opacity: 1 - i * 0.15,
            }}
            animate={{
              rotate: i % 2 === 0 ? 360 : -360,
              scale: [1, 1.05, 1],
            }}
            transition={{
              rotate: {
                duration: 15 + i * 8,
                repeat: Infinity,
                ease: "linear",
              },
              scale: { duration: 5 + i, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <div className="orbital-node" style={{ top: -6 }} />
            {i % 2 === 0 && (
              <div className="orbital-node" style={{ bottom: -6 }} />
            )}
            <div
              className="orbital-particle"
              style={{ left: "20%", top: "20%" }}
            />
            <div
              className="orbital-particle"
              style={{ right: "30%", bottom: "15%" }}
            />
          </motion.div>
        ))}
        <motion.div
          className="w-32 h-32 bg-[#0b2d24] rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(178,255,218,0.2)]"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <BrandLogo className="w-14 h-14" invert />
        </motion.div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 md:px-12 relative z-10 w-full">
        <div className="flex flex-col lg:flex-row items-end justify-between gap-12 mb-20">
          <div className="max-w-6xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="h-[1px] w-12 bg-black" />
              <span className="text-xs font-bold uppercase tracking-[0.3em]">
                Oltre la polizza standard
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-[clamp(3rem,9vw,9rem)] font-black leading-[0.85] tracking-tighter text-black uppercase"
            >
              Una {}
              <span className="italic font-light text-[#136d58] lowercase font-serif-creative">
                scelta
              </span>
              <br />
              quella{" "}
              <span className="italic font-light text-[#136d58] lowercase font-serif-creative">
                sicura
              </span>
            </motion.h1>
          </div>
          <motion.div
            style={{ rotate: rotateScroll }}
            className="hidden lg:block w-64 h-64 border-2 border-black rounded-[60px] flex items-center justify-center p-12"
          >
            <div className="text-center">
              <div className="text-5xl font-black mb-2">12+</div>
              <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                Compagnie Leader
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-4">
            <p className="text-2xl text-[#5a6a65] lengthing-tight mb-12 font-medium">
              Analizziamo il tuo profilo e troviamo il prodotto più adatto a te.
              Protezione senza complicazioni.
            </p>
            <div className="flex flex-col gap-4 items-start">
              <button className="h-16 px-10 bg-black text-[#b2ffda] rounded-full font-bold flex items-center gap-3 hover:scale-105 transition-transform group uppercase tracking-widest text-sm">
                La tua scelta sicura{" "}
                <MoveRight className="group-hover:translate-x-2 transition-transform" />
              </button>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-black/40 ml-4">
                Una valutazione semplice e sicura.
              </span>
            </div>
          </div>
          <div className="lg:col-span-8 relative rounded-[80px] overflow-hidden aspect-[16/9] shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop"
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
              alt="Architecture"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b2d24]/60 to-transparent" />
            <div className="absolute bottom-16 left-16 right-16 flex justify-between items-end text-white">
              <div className="text-4xl italic font-serif-creative leading-none">
                "La precisione è la nostra unica metrica."
              </div>
              <div className="flex gap-4">
                <CheckCircle className="text-[#b2ffda] w-8 h-8" />
                <span className="font-bold uppercase tracking-widest text-xs">
                  Zero Scartoffie
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Marquee = () => {
  const logos = [
    "Generali",
    "Allianz",
    "Axa",
    "UnipolSai",
    "Zurich",
    "Reale Mutua",
    "Cattolica",
    "AIG",
    "AmTrust",
    "Chubb",
    "Lloyd's",
    "HDI",
  ];
  return (
    <div className="py-20 border-y border-black/5 bg-white w-full overflow-hidden">
      <div className="marquee">
        <div className="marquee-content animate-marquee">
          {logos.concat(logos).map((logo, index) => (
            <div
              key={index}
              className="text-4xl font-black text-black/10 hover:text-[#136d58] transition-colors cursor-default whitespace-nowrap px-16 uppercase tracking-tighter"
            >
              {logo}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const NaturalLanguageForm = () => {
  const [professione, setProfessione] = useState("medico");
  const [attivita, setAttivita] = useState("studio individuale");
  const [massimale, setMassimale] = useState("€1.000.000");
  const [franchigia, setFranchigia] = useState("media");

  const PROFESSIONI = [
    "medico",
    "avvocato",
    "ingegnere",
    "architetto",
    "commercialista",
    "geometra",
    "consulente",
  ];
  const ATTIVITA = [
    "studio individuale",
    "studio associato",
    "società professionale",
    "libero professionista",
  ];
  const MASSIMALI = [
    "€250.000",
    "€500.000",
    "€1.000.000",
    "€2.000.000",
    "€5.000.000",
  ];
  const FRANCHIGIE = ["nessuna", "€500", "€1.000", "€2.500", "€5.000"];

  return (
    <section className="py-40 bg-[#0b2d24] text-white relative w-full overflow-hidden">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-[1px] bg-[#b2ffda]" />
            <span className="text-[#b2ffda] text-xs font-bold uppercase tracking-[0.3em]">
              Analisi del Profilo
            </span>
          </div>

          <div className="nl-form-creative max-w-full">
            Sono un{" "}
            <CustomDropdown
              value={professione}
              options={PROFESSIONI}
              onChange={setProfessione}
              placeholder="professione"
            />
            e lavoro come{" "}
            <CustomDropdown
              value={attivita}
              options={ATTIVITA}
              onChange={setAttivita}
              placeholder="tipo di attività"
            />
            cerco una RC con massimale{" "}
            <CustomDropdown
              value={massimale}
              options={MASSIMALI}
              onChange={setMassimale}
              placeholder="massimale"
            />
            e franchigia{" "}
            <CustomDropdown
              value={franchigia}
              options={FRANCHIGIE}
              onChange={setFranchigia}
              placeholder="franchigia"
            />
          </div>

          <div className="mt-20 flex flex-col md:flex-row items-center gap-12">
            <button className="group flex items-center gap-6 text-4xl font-black uppercase tracking-tighter hover:text-[#b2ffda] transition-colors">
              Confronta 12 Compagnie{" "}
              <MoveRight className="w-12 h-12 group-hover:translate-x-4 transition-transform" />
            </button>
            <div className="flex flex-col">
              <span className="text-sm font-bold uppercase tracking-widest text-white/40">
                Senza impegno · 100% Online
              </span>
              <span className="text-xs font-medium text-[#b2ffda]/60">
                Risparmio medio riscontrato: 30%
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const CreativeBento = () => {
  return (
    <section className="py-32 px-6 bg-white overflow-hidden">
      <div className="max-w-[1800px] mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-end mb-24 gap-8">
          <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] text-black">
            L'Intelligenza <br />
            <span className="font-serif-creative font-light text-[#136d58] lowercase">
              dietro la
            </span>{" "}
            Protezione
          </h2>
          <p className="max-w-md text-xl text-[#5a6a65] font-medium leading-relaxed">
            Uniamo algoritmi neurali e consulenza umana per garantirti la
            polizza che realmente ti serve. Senza clausole nascoste.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 auto-rows-[300px] gap-4">
          <motion.div
            whileHover={{ scale: 0.98 }}
            className="md:col-span-2 lg:col-span-6 row-span-2 p-12 rounded-[40px] bg-[#0b2d24] text-[#b2ffda] flex flex-col justify-between overflow-hidden relative group"
          >
            <Layers className="w-16 h-16 opacity-40 group-hover:scale-110 transition-transform" />
            <div>
              <h3 className="text-5xl font-black uppercase tracking-tighter mb-4 leading-none">
                Analisi <br />
                12 Compagnie
              </h3>
              <p className="text-xl text-[#b2ffda]/60 leading-tight">
                Analizziamo istantaneamente i set informativi dei leader del
                mercato per trovare il match perfetto.
              </p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 0.98 }}
            className="md:col-span-2 lg:col-span-3 row-span-1 p-12 rounded-[40px] bg-[#f5f5f3] flex flex-col justify-between"
          >
            <Compass className="text-black w-10 h-10" />
            <h3 className="text-2xl font-bold uppercase tracking-tighter">
              Supporto <br />
              Consulenziale
            </h3>
          </motion.div>

          <motion.div
            whileHover={{ scale: 0.98 }}
            className="md:col-span-2 lg:col-span-3 row-span-2 p-12 rounded-[40px] bg-[#b2ffda] text-black flex flex-col justify-between"
          >
            <div className="text-8xl font-black italic font-serif-creative leading-none">
              €850
            </div>
            <h3 className="text-3xl font-black uppercase tracking-tighter">
              Risparmio <br />
              Medio Annuo
            </h3>
          </motion.div>

          <motion.div
            whileHover={{ scale: 0.98 }}
            className="md:col-span-2 lg:col-span-3 row-span-1 p-12 rounded-[40px] border-2 border-black flex flex-col justify-between"
          >
            <Zap className="w-10 h-10" />
            <h3 className="text-2xl font-bold uppercase tracking-tighter">
              Preventivo <br />
              in 2 Minuti
            </h3>
          </motion.div>

          <motion.div
            whileHover={{ scale: 0.98 }}
            className="md:col-span-4 lg:col-span-6 row-span-1 p-12 rounded-[40px] bg-[#136d58] text-white flex items-center justify-between"
          >
            <div className="font-bold uppercase tracking-widest text-xs">
              +40.000 POLIZZE ATTIVE
            </div>
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-full border-4 border-[#136d58] bg-white/20"
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const ImmersiveSection = () => {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);
  const borderRadius = useTransform(scrollYProgress, [0, 0.5], [80, 0]);
  const textXLeft = useTransform(scrollYProgress, [0.4, 0.8], [-1400, 0]);
  const textXRight = useTransform(scrollYProgress, [0.4, 0.8], [1400, 0]);

  return (
    <section ref={containerRef} className="pin-section">
      <div className="pin-sticky">
        <motion.div
          style={{ scale, borderRadius }}
          className="relative w-full h-full overflow-hidden z-10"
        >
          <img
            src="https://images.unsplash.com/photo-1510074377623-8cf13fb86c08?q=80&w=2072&auto=format&fit=crop"
            className="w-full h-full object-cover"
            alt="Immersive"
          />
          <div className="absolute inset-0 bg-white/45" />
        </motion.div>

        <div className="pin-content">
          <motion.div style={{ x: textXLeft }} className="pin-word">
            PROTEZIONE
          </motion.div>
          <motion.div style={{ x: textXRight }} className="pin-word">
            SENZA LIMITI
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const StackedStory = () => {
  const cards = [
    {
      title: "Analisi",
      body: "Analizziamo 12+ Compagnie e ordiniamo le proposte per coerenza con il tuo profilo professionale.",
      bg: "#0b2d24",
    },
    {
      title: "Chiarezza",
      body: "Ti spieghiamo ogni clausola e franchigia prima che tu decida. Zero termini nascosti.",
      bg: "#136d58",
    },
    {
      title: "Emissione",
      body: "Preventivo in 2 minuti. Nessun modulo infinito. Solo firma digitale e sei coperto subito.",
      bg: "#b2ffda",
      textColor: "black",
    },
  ];

  return (
    <section className="pt-32 pb-[30vh] bg-black">
      <div className="max-w-[1800px] mx-auto px-6 mb-32">
        <h2 className="text-7xl md:text-9xl font-black text-white uppercase tracking-tighter leading-[0.8]">
          Semplice. <br />
          <span className="italic font-light lowercase text-[#b2ffda] font-serif-creative">
            Veloce.
          </span>{" "}
          Trasparente.
        </h2>
      </div>
      <div className="px-6 space-y-0">
        {cards.map((card, i) => (
          <div key={i} className="sticky top-[12vh] mb-20">
            <div
              className={cn(
                "grid md:grid-cols-2 rounded-[60px] overflow-hidden shadow-2xl min-h-[650px]",
                card.textColor === "black" ? "text-black" : "text-white",
              )}
              style={{ background: card.bg }}
            >
              <div className="p-16 md:p-24 flex flex-col justify-center">
                <div className="text-xs font-bold uppercase tracking-[0.4em] mb-8 opacity-40">
                  Step 0{i + 1}
                </div>
                <h3 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-8 leading-none">
                  {card.title}
                </h3>
                <p className="text-2xl opacity-70 leading-relaxed max-w-md font-medium">
                  {card.body}
                </p>
              </div>
              <div className="bg-black/10 backdrop-blur-sm flex items-center justify-center p-20">
                <BrandLogo className="w-64 h-64 opacity-10" invert />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const FAQ = () => (
  <section className="py-40 bg-white">
    <div className="max-w-5xl mx-auto px-6">
      <h2 className="text-7xl font-black uppercase tracking-tighter mb-24 text-black">
        FAQ
      </h2>
      {[
        {
          q: "Quanto tempo serve per il preventivo?",
          a: "In media 2-3 minuti. Pochi campi da compilare e nessuna documentazione cartacea necessaria.",
        },
        {
          q: "Il preventivo è gratuito?",
          a: "Sì, assolutamente gratuito e senza alcun impegno all'acquisto.",
        },
        {
          q: "Posso confrontare tutte le compagnie?",
          a: "Sì. Ti mostriamo la proposta consigliata, ma puoi sempre esplorare tutte le alternative disponibili.",
        },
        {
          q: "La polizza è valida subito?",
          a: "Una volta completata la firma digitale e il pagamento, la copertura è immediata.",
        },
      ].map((faq, i) => (
        <div
          key={i}
          className="py-12 border-b-2 border-black flex flex-col md:flex-row gap-8 items-start cursor-pointer group hover:bg-[#b2ffda]/20 px-4 transition-all"
        >
          <span className="text-2xl font-black opacity-20 italic font-serif-creative">
            0{i + 1}
          </span>
          <div className="flex-grow">
            <div className="text-3xl font-black uppercase tracking-tighter group-hover:translate-x-4 transition-transform duration-500">
              {faq.q}
            </div>
            <p className="text-xl text-[#5a6a65] mt-6 max-w-2xl font-medium">
              {faq.a}
            </p>
          </div>
          <Plus className="w-10 h-10 group-hover:rotate-45 transition-transform" />
        </div>
      ))}
    </div>
  </section>
);

const CTA = () => (
  <section className="py-20 px-6 bg-white">
    <div className="max-w-[1800px] mx-auto bg-black rounded-[100px] p-20 md:p-40 text-center text-[#b2ffda] relative overflow-hidden">
      <div className="relative z-10">
        <h2 className="text-6xl md:text-[9vw] font-black uppercase tracking-tighter leading-[0.8] mb-16">
          Il tuo Futuro <br />
          <span className="italic font-light text-white lowercase font-serif-creative">
            merita
          </span>{" "}
          Protezione.
        </h2>
        <button className="h-24 px-16 bg-[#b2ffda] text-black rounded-full text-2xl font-black uppercase tracking-tighter hover:scale-110 transition-transform shadow-2xl">
          Ottieni la tua polizza ora
        </button>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-white py-24 px-12 border-t border-black/5">
    <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
      <div className="flex items-center gap-3">
        <BrandLogo className="w-8 h-8" />
        <span className="text-2xl font-black tracking-tighter uppercase">
          ScelgoSicuro
        </span>
      </div>
      <div className="flex gap-12 text-[10px] font-bold uppercase tracking-widest text-black/40">
        <a href="#">Privacy Policy</a>
        <a href="#">Termini e Condizioni</a>
        <a href="#">Cookies</a>
        <a href="#">© 2026 Boutique Risk Management</a>
      </div>
    </div>
  </footer>
);

export default function Home() {
  return (
    <div className="landing20-container">
      <Head>
        <title>
          ScelgoSicuro | Boutique Risk Management per Professionisti
        </title>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,900;1,400;1,900&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <NaturalLanguageForm />
        <CreativeBento />
        <ImmersiveSection />
        <StackedStory />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
