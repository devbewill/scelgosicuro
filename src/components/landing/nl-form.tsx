"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PROFESSIONI = ["medico", "avvocato", "ingegnere", "architetto", "commercialista", "geometra", "consulente"];
const ATTIVITA    = ["studio individuale", "studio associato", "società professionale", "libero professionista"];
const MASSIMALI   = ["€250.000", "€500.000", "€1.000.000", "€2.000.000", "€5.000.000"];
const FRANCHIGIE  = ["nessuna", "€500", "€1.000", "€2.500", "€5.000"];

function Dropdown({
  value,
  options,
  onChange,
  placeholder,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="nl-select inline-flex">
      <button onClick={() => setOpen(!open)}>
        <span>{value || placeholder}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 mt-3 z-[100] bg-forest border border-mint/20 rounded-[20px] min-w-[200px] sm:min-w-[280px] max-w-[calc(100vw-3rem)] p-3 sm:p-4 shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex flex-col gap-1 sm:gap-2"
          >
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setOpen(false); }}
                className="text-sm sm:text-lg font-semibold uppercase tracking-[0.05em] text-white px-4 sm:px-5 py-2 sm:py-3 rounded-xl transition-colors hover:bg-mint hover:text-forest text-left font-sans not-italic"
              >
                {opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function NlForm() {
  const [professione, setProfessione] = useState("medico");
  const [attivita, setAttivita]       = useState("studio individuale");
  const [massimale, setMassimale]     = useState("€1.000.000");
  const [franchigia, setFranchigia]   = useState("media");

  return (
    <section className="py-16 sm:py-40 bg-forest text-white overflow-hidden">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-4 mb-6 sm:mb-12">
            <div className="w-8 sm:w-12 h-px bg-mint" />
            <span className="text-mint text-xs font-bold uppercase tracking-[0.3em]">
              Analisi del Profilo
            </span>
          </div>

          <div className="nl-form-text">
            Sono un{" "}
            <Dropdown value={professione} options={PROFESSIONI} onChange={setProfessione} placeholder="professione" />
            {" "}e lavoro come{" "}
            <Dropdown value={attivita} options={ATTIVITA} onChange={setAttivita} placeholder="tipo di attività" />
            {" "}cerco una RC con massimale{" "}
            <Dropdown value={massimale} options={MASSIMALI} onChange={setMassimale} placeholder="massimale" />
            {" "}e franchigia{" "}
            <Dropdown value={franchigia} options={FRANCHIGIE} onChange={setFranchigia} placeholder="franchigia" />
          </div>


        </motion.div>
      </div>
    </section>
  );
}
