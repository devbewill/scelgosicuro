export function CTA() {
  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 bg-white">
      <div className="max-w-[1800px] mx-auto bg-ink rounded-[32px] sm:rounded-[100px] p-10 sm:p-24 md:p-40 text-center text-mint relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl sm:text-6xl md:text-[9vw] font-black uppercase tracking-tighter leading-[0.85] mb-8 sm:mb-16">
            Il tuo Futuro <br />
            <span className="italic font-light text-white lowercase font-serif">
              merita
            </span>{" "}
            Protezione.
          </h2>
          <button className="h-14 sm:h-24 px-8 sm:px-16 bg-mint text-ink rounded-full text-lg sm:text-2xl font-black uppercase tracking-tighter hover:scale-110 transition-transform shadow-2xl">
            Ottieni la tua polizza
          </button>
        </div>
      </div>
    </section>
  );
}
