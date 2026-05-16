import Link from "next/link"

const sections = [
  {
    href: "/backoffice/catalogo",
    title: "Catalogo",
    description: "Prodotti, coperture, regole di eligibilità, moltiplicatori e addon per compagnia.",
  },
  {
    href: "/backoffice/domande",
    title: "Domande",
    description: "Domande del settore (obbligatorie e opzionali) con opzioni e visibilità condizionale.",
  },
  {
    href: "/backoffice/form-testing",
    title: "Form Testing",
    description: "Form rapido senza contatti: seleziona settore, compila il questionario, vedi i risultati del motore.",
  },
]

export default function BackofficePage() {
  return (
    <main className="p-8">
      <header className="mb-8 pb-6 border-b border-[#e2dbd0]">
        <p className="text-xs font-semibold text-[#1C1C1A]/40 uppercase tracking-wider mb-1">Backoffice</p>
        <h1 className="text-3xl font-bold text-[#1C1C1A] tracking-tight font-[family-name:var(--font-heading)]">Dashboard</h1>
        <p className="mt-1.5 text-sm text-[#1C1C1A]/50">Strumenti di configurazione e test.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="flex flex-col gap-3 bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
          >
            <span className="text-lg font-bold text-[#1C1C1A] font-[family-name:var(--font-heading)]">{s.title}</span>
            <span className="text-sm text-[#1C1C1A]/55 leading-relaxed">{s.description}</span>
            <span className="text-xs font-semibold text-[#ff88c8] mt-auto">Apri →</span>
          </Link>
        ))}
      </div>
    </main>
  )
}
