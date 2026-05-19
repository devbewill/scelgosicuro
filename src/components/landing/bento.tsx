import { Layers, Compass, Zap } from "lucide-react";

export function CreativeBento() {
  return (
    <section className="py-16 sm:py-32 px-4 sm:px-6 bg-white overflow-hidden">
      <div className="max-w-[1800px] mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-end mb-10 sm:mb-24 gap-6 sm:gap-8">
          <h2 className="text-4xl sm:text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] text-ink">
            L'Intelligenza <br />
            <span className="font-serif font-light text-sage lowercase italic">
              dietro la
            </span>{" "}
            Protezione
          </h2>
          <p className="max-w-sm sm:max-w-md text-base sm:text-xl text-ink-muted font-medium leading-relaxed">
            Uniamo algoritmi neurali e consulenza umana per garantirti la polizza
            che realmente ti serve. Senza clausole nascoste.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 auto-rows-[160px] sm:auto-rows-[220px] md:auto-rows-[300px] gap-3 sm:gap-4">
          <div className="col-span-2 md:col-span-2 lg:col-span-6 row-span-2 p-6 sm:p-10 md:p-12 rounded-2xl sm:rounded-[40px] bg-forest text-mint flex flex-col justify-between overflow-hidden relative group hover:scale-[0.98] transition-transform">
            <Layers className="w-8 h-8 sm:w-16 sm:h-16 opacity-40 group-hover:scale-110 transition-transform" />
            <div>
              <h3 className="text-xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2 sm:mb-4 leading-none">
                Analisi <br /> 12 Compagnie
              </h3>
              <p className="text-xs sm:text-base md:text-xl text-mint/60 leading-tight hidden sm:block">
                Analizziamo istantaneamente i set informativi dei leader del
                mercato per trovare il match perfetto.
              </p>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 lg:col-span-3 row-span-1 p-4 sm:p-8 md:p-12 rounded-2xl sm:rounded-[40px] bg-[#f5f5f3] flex flex-col justify-between hover:scale-[0.98] transition-transform">
            <Compass className="text-ink w-6 h-6 sm:w-10 sm:h-10" />
            <h3 className="text-sm sm:text-xl md:text-2xl font-bold uppercase tracking-tighter">
              Supporto <br /> Consulenziale
            </h3>
          </div>

          <div className="col-span-1 md:col-span-2 lg:col-span-3 row-span-2 p-4 sm:p-8 md:p-12 rounded-2xl sm:rounded-[40px] bg-mint text-ink flex flex-col justify-between hover:scale-[0.98] transition-transform">
            <div className="text-4xl sm:text-6xl md:text-8xl font-black italic font-serif leading-none">
              €850
            </div>
            <h3 className="text-base sm:text-2xl md:text-3xl font-black uppercase tracking-tighter">
              Risparmio <br /> Medio Annuo
            </h3>
          </div>

          <div className="col-span-1 md:col-span-2 lg:col-span-3 row-span-1 p-4 sm:p-8 md:p-12 rounded-2xl sm:rounded-[40px] border-2 border-ink flex flex-col justify-between hover:scale-[0.98] transition-transform">
            <Zap className="w-6 h-6 sm:w-10 sm:h-10" />
            <h3 className="text-sm sm:text-xl md:text-2xl font-bold uppercase tracking-tighter">
              Preventivo <br /> in 2 Min
            </h3>
          </div>

          <div className="col-span-2 md:col-span-4 lg:col-span-6 row-span-1 p-4 sm:p-8 md:p-12 rounded-2xl sm:rounded-[40px] bg-sage text-white flex items-center justify-between hover:scale-[0.98] transition-transform">
            <div className="font-bold uppercase tracking-widest text-[10px] sm:text-xs">
              +40.000 POLIZZE ATTIVE
            </div>
            <div className="flex -space-x-2 sm:-space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 sm:w-12 sm:h-12 rounded-full border-2 sm:border-4 border-sage bg-white/20"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
