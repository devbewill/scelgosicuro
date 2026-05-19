import type { ReactNode } from "react";

function AnalisiGraphic() {
  return (
    <svg viewBox="0 0 300 260" fill="none" className="w-full max-w-xs sm:max-w-lg">
      <rect x="18"  y="150" width="42" height="90"  rx="8" fill="rgba(178,255,218,0.12)" />
      <rect x="74"  y="70"  width="42" height="170" rx="8" fill="#b2ffda" />
      <rect x="130" y="110" width="42" height="130" rx="8" fill="rgba(178,255,218,0.18)" />
      <rect x="186" y="90"  width="42" height="150" rx="8" fill="rgba(178,255,218,0.14)" />
      <rect x="242" y="130" width="42" height="110" rx="8" fill="rgba(178,255,218,0.10)" />
      <text x="95" y="56" textAnchor="middle" fill="#b2ffda" fontSize="11" fontWeight="800" letterSpacing="2">BEST MATCH</text>
      <text x="95" y="38" textAnchor="middle" fill="#b2ffda" fontSize="22" fontWeight="900">€850</text>
      <line x1="10" y1="248" x2="290" y2="248" stroke="rgba(178,255,218,0.12)" strokeWidth="1" />
      <text x="39"  y="258" textAnchor="middle" fill="rgba(178,255,218,0.35)" fontSize="9" fontWeight="700">AXA</text>
      <text x="95"  y="258" textAnchor="middle" fill="#b2ffda"                fontSize="9" fontWeight="900">✦</text>
      <text x="151" y="258" textAnchor="middle" fill="rgba(178,255,218,0.35)" fontSize="9" fontWeight="700">UNI</text>
      <text x="207" y="258" textAnchor="middle" fill="rgba(178,255,218,0.35)" fontSize="9" fontWeight="700">GEN</text>
      <text x="263" y="258" textAnchor="middle" fill="rgba(178,255,218,0.35)" fontSize="9" fontWeight="700">AIG</text>
    </svg>
  );
}

function ChiarezzaGraphic() {
  return (
    <svg viewBox="0 0 300 260" fill="none" className="w-full max-w-xs sm:max-w-lg">
      <text x="0" y="28" fill="rgba(255,255,255,0.5)" fontSize="11" fontWeight="800" letterSpacing="2">MASSIMALE</text>
      <text x="300" y="28" textAnchor="end" fill="white" fontSize="11" fontWeight="900">€1.000.000</text>
      <rect x="0" y="38" width="300" height="10" rx="5" fill="rgba(255,255,255,0.1)" />
      <rect x="0" y="38" width="240" height="10" rx="5" fill="white" />

      <text x="0" y="90" fill="rgba(255,255,255,0.5)" fontSize="11" fontWeight="800" letterSpacing="2">FRANCHIGIA</text>
      <text x="300" y="90" textAnchor="end" fill="white" fontSize="11" fontWeight="900">€500</text>
      <rect x="0" y="100" width="300" height="10" rx="5" fill="rgba(255,255,255,0.1)" />
      <rect x="0" y="100" width="80" height="10" rx="5" fill="white" />

      <text x="0" y="152" fill="rgba(255,255,255,0.5)" fontSize="11" fontWeight="800" letterSpacing="2">COPERTURA RC</text>
      <text x="300" y="152" textAnchor="end" fill="white" fontSize="11" fontWeight="900">100%</text>
      <rect x="0" y="162" width="300" height="10" rx="5" fill="rgba(255,255,255,0.1)" />
      <rect x="0" y="162" width="300" height="10" rx="5" fill="white" />

      <text x="0" y="214" fill="rgba(255,255,255,0.5)" fontSize="11" fontWeight="800" letterSpacing="2">CLAUSOLE EXTRA</text>
      <text x="300" y="214" textAnchor="end" fill="white" fontSize="11" fontWeight="900">3 / 3</text>
      <rect x="0" y="224" width="300" height="10" rx="5" fill="rgba(255,255,255,0.1)" />
      <rect x="0" y="224" width="300" height="10" rx="5" fill="white" />
    </svg>
  );
}

function EmissioneGraphic() {
  return (
    <svg viewBox="0 0 280 290" fill="none" className="w-full max-w-xs sm:max-w-lg">
      <circle cx="140" cy="126" r="94" stroke="rgba(11,45,36,0.12)" strokeWidth="14" />
      <circle
        cx="140" cy="126" r="94"
        stroke="#0b2d24" strokeWidth="14" strokeLinecap="round"
        strokeDasharray="591" strokeDashoffset="70"
        transform="rotate(-90 140 126)"
      />
      <text x="140" y="116" textAnchor="middle" fill="#0b2d24" fontSize="52" fontWeight="900">2'</text>
      <text x="140" y="140" textAnchor="middle" fill="rgba(11,45,36,0.45)" fontSize="11" fontWeight="800" letterSpacing="4">MINUTI</text>

      <circle cx="70"  cy="256" r="14" fill="#0b2d24" />
      <text x="70"  y="261" textAnchor="middle" fill="#b2ffda" fontSize="13" fontWeight="800">✓</text>
      <text x="70"  y="278" textAnchor="middle" fill="rgba(11,45,36,0.5)" fontSize="9" fontWeight="700">COMPILA</text>
      <line x1="84" y1="256" x2="126" y2="256" stroke="rgba(11,45,36,0.2)" strokeWidth="1.5" />

      <circle cx="140" cy="256" r="14" fill="#0b2d24" />
      <text x="140" y="261" textAnchor="middle" fill="#b2ffda" fontSize="13" fontWeight="800">✓</text>
      <text x="140" y="278" textAnchor="middle" fill="rgba(11,45,36,0.5)" fontSize="9" fontWeight="700">CONFRONTA</text>
      <line x1="154" y1="256" x2="196" y2="256" stroke="rgba(11,45,36,0.2)" strokeWidth="1.5" />

      <circle cx="210" cy="256" r="14" fill="#0b2d24" />
      <text x="210" y="261" textAnchor="middle" fill="#b2ffda" fontSize="13" fontWeight="800">✓</text>
      <text x="210" y="278" textAnchor="middle" fill="rgba(11,45,36,0.5)" fontSize="9" fontWeight="700">FIRMA</text>
    </svg>
  );
}

type Card = {
  step: string;
  title: string;
  body: string;
  cardClass: string;
  graphic: ReactNode;
};

const CARDS: Card[] = [
  {
    step: "Step 01",
    title: "Analisi",
    body: "Analizziamo 12+ Compagnie e ordiniamo le proposte per coerenza con il tuo profilo professionale.",
    cardClass: "bg-forest text-white",
    graphic: <AnalisiGraphic />,
  },
  {
    step: "Step 02",
    title: "Chiarezza",
    body: "Ti spieghiamo ogni clausola e franchigia prima che tu decida. Zero termini nascosti.",
    cardClass: "bg-sage text-white",
    graphic: <ChiarezzaGraphic />,
  },
  {
    step: "Step 03",
    title: "Emissione",
    body: "Preventivo in 2 minuti. Nessun modulo infinito. Solo firma digitale e sei coperto subito.",
    cardClass: "bg-mint text-ink",
    graphic: <EmissioneGraphic />,
  },
];

export function StackedStory() {
  return (
    <section className="pt-16 sm:pt-32 pb-[20vh] sm:pb-[30vh] bg-ink">
      <div className="max-w-[1800px] mx-auto px-6 mb-12 sm:mb-32">
        <h2 className="text-4xl sm:text-7xl md:text-9xl font-black text-white uppercase tracking-tighter leading-[0.85]">
          Semplice. <br />
          <span className="italic font-light lowercase text-mint font-serif">Veloce.</span>{" "}
          Trasparente.
        </h2>
      </div>

      <div className="px-4 sm:px-6">
        {CARDS.map((card) => (
          <div key={card.title} className="sticky top-0 sm:top-[12vh] mb-4 sm:mb-20">
            <div className={`grid md:grid-cols-2 rounded-3xl sm:rounded-[60px] overflow-hidden shadow-2xl ${card.cardClass}`}>
              <div className="p-8 sm:p-16 md:p-24 flex flex-col justify-center">
                <div className="text-xs font-bold uppercase tracking-[0.4em] mb-4 sm:mb-8 opacity-40">
                  {card.step}
                </div>
                <h3 className="text-4xl sm:text-6xl md:text-8xl font-black uppercase tracking-tighter mb-4 sm:mb-8 leading-none">
                  {card.title}
                </h3>
                <p className="text-base sm:text-2xl opacity-70 leading-relaxed max-w-md font-medium">
                  {card.body}
                </p>
              </div>
              <div className="flex items-center justify-center p-8 sm:p-16">
                {card.graphic}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
