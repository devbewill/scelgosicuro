const LOGOS = [
  "Generali", "Allianz", "Axa", "UnipolSai", "Zurich",
  "Reale Mutua", "Cattolica", "AIG", "AmTrust", "Chubb", "Lloyd's", "HDI",
];

export function Marquee() {
  return (
    <div className="py-20 border-y border-black/5 bg-white overflow-hidden">
      <div className="flex overflow-hidden select-none w-full">
        <div className="flex shrink-0 min-w-full justify-around animate-marquee">
          {[...LOGOS, ...LOGOS].map((logo, i) => (
            <span
              key={i}
              className="text-4xl font-black text-black/10 hover:text-sage transition-colors cursor-default whitespace-nowrap px-16 uppercase tracking-tighter"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
