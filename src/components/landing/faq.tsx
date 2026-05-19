import { Plus } from "lucide-react";

const FAQS = [
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
];

export function FAQ() {
  return (
    <section className="py-16 sm:py-40 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-4xl sm:text-7xl font-black uppercase tracking-tighter mb-10 sm:mb-24 text-ink">
          FAQ
        </h2>

        {FAQS.map((faq, i) => (
          <div
            key={i}
            className="group py-8 sm:py-12 border-b-2 border-ink flex flex-col sm:flex-row gap-4 sm:gap-8 items-start cursor-pointer hover:bg-mint/20 px-3 sm:px-4 transition-all"
          >
            <span className="text-xl sm:text-2xl font-black opacity-20 italic font-serif shrink-0">
              0{i + 1}
            </span>
            <div className="flex-grow">
              <div className="text-lg sm:text-3xl font-black uppercase tracking-tighter group-hover:translate-x-2 sm:group-hover:translate-x-4 transition-transform duration-500">
                {faq.q}
              </div>
              <p className="text-sm sm:text-xl text-ink-muted mt-3 sm:mt-6 max-w-2xl font-medium">
                {faq.a}
              </p>
            </div>
            <Plus className="w-7 h-7 sm:w-10 sm:h-10 group-hover:rotate-45 transition-transform shrink-0" />
          </div>
        ))}
      </div>
    </section>
  );
}
