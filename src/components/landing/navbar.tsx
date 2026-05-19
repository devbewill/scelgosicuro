"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { BrandLogo } from "./brand-logo";

const NAV_LINKS = ["Manifesto", "Prodotti", "Il Metodo", "Supporto"];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-700 px-4 sm:px-6 md:px-12 py-4 sm:py-6",
        scrolled && "bg-white/95 backdrop-blur-xl py-3 sm:py-4 border-b border-black/5 shadow-sm",
      )}
    >
      <div className="max-w-[1800px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <BrandLogo className="w-8 h-8 sm:w-10 sm:h-10" />
          <span className="text-lg sm:text-2xl font-black tracking-tighter uppercase text-ink">
            ScelgoSicuro
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-12 text-[11px] font-bold uppercase tracking-widest text-ink/40">
          {NAV_LINKS.map((item) => (
            <a key={item} href="#" className="hover:text-ink transition-colors">
              {item}
            </a>
          ))}
        </div>

        <button className="h-9 sm:h-12 px-4 sm:px-8 bg-ink text-white rounded-full font-bold uppercase tracking-widest text-[10px] sm:text-[11px] hover:bg-sage transition-colors whitespace-nowrap">
          <span className="sm:hidden">Preventivo</span>
          <span className="hidden sm:inline">Calcola Preventivo</span>
        </button>
      </div>
    </motion.nav>
  );
}
