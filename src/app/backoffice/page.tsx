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
    <main className="flex min-h-screen w-full flex-col gap-8 p-8">
      <header className="border-b-2 border-black pb-6">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30">BACKOFFICE</p>
        <h1 className="text-4xl font-black uppercase tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm font-medium text-black/50">Strumenti di configurazione e test.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="flex flex-col gap-3 border-2 border-black p-5 transition-colors hover:bg-green-400 group"
          >
            <span className="text-lg font-black uppercase tracking-wide">{s.title}</span>
            <span className="text-sm text-black/60 group-hover:text-black/70">{s.description}</span>
            <span className="mt-auto text-xs font-black uppercase tracking-widest">Apri →</span>
          </Link>
        ))}
      </div>
    </main>
  )
}
