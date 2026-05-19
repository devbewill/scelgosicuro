"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { MoveRight } from "lucide-react";

export function Hero() {
  const { scrollY } = useScroll();
  const imageY = useTransform(scrollY, [0, 600], [0, -60]);

  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-24 sm:pt-32 pb-16 sm:pb-20 overflow-hidden bg-warm-white">
      <div
        className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] opacity-15 pointer-events-none blur-[80px]"
        style={{ background: "radial-gradient(circle, var(--color-forest) 0%, transparent 70%)" }}
      />

      <motion.div
        className="absolute right-[-14%] top-0 bottom-0 w-[54%] hidden lg:flex items-center overflow-hidden"
        style={{ y: imageY }}
      >
        <motion.img
          src="/hero-2.jpg"
          alt="Professionisti ScelgoSicuro"
          className="w-full h-auto object-contain drop-shadow-2xl opacity-70"
          initial={{ opacity: 0, x: 80, rotate: 4 }}
          animate={{ opacity: 0.7, x: 0, rotate: 2 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-warm-white to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-warm-white to-transparent pointer-events-none" />
      </motion.div>

      <div className="max-w-[1800px] mx-auto px-6 md:px-12 relative z-10 w-full">
        <div className="flex flex-col lg:flex-row items-end justify-between gap-6 sm:gap-12 mb-10 sm:mb-20">
          <div className="max-w-6xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-6 sm:mb-8"
            >
              <div className="h-px w-8 sm:w-12 bg-ink" />
              <span className="text-xs font-bold uppercase tracking-[0.3em]">
                Oltre la polizza standard
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-[clamp(2.5rem,8vw,9rem)] font-black leading-[0.85] tracking-tighter text-ink uppercase"
            >
              Una{" "}
              <span className="italic font-light text-sage lowercase font-serif">
                scelta
              </span>
              <br />
              quella{" "}
              <span className="italic font-light text-sage lowercase font-serif">
                sicura
              </span>
            </motion.h1>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 sm:gap-12 items-start">
          <div className="lg:col-span-4">
            <p className="text-base sm:text-xl md:text-2xl text-ink-muted leading-snug mb-8 sm:mb-12 font-medium">
              Analizziamo il tuo profilo e troviamo il prodotto più adatto a te.
              Protezione senza complicazioni.
            </p>
            <div className="flex flex-col gap-3 sm:gap-4 items-start">
              <button className="h-12 sm:h-16 px-7 sm:px-10 bg-ink text-white rounded-full font-bold flex items-center gap-2 sm:gap-3 hover:scale-105 transition-transform group uppercase tracking-widest text-xs sm:text-sm">
                La tua scelta sicura
                <MoveRight className="group-hover:translate-x-2 transition-transform" />
              </button>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-ink/40 ml-3 sm:ml-4">
                Una valutazione semplice e sicura.
              </span>
            </div>
          </div>
        </div>

        <div className="lg:hidden mt-10 sm:mt-16 overflow-hidden rounded-2xl">
          <img
            src="/hero-2.jpg"
            alt="Professionisti ScelgoSicuro"
            className="w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
