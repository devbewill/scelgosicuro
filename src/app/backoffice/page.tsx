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
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Backoffice</h1>
        <p className="mt-1 text-sm text-muted-foreground">Strumenti di configurazione e test.</p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="flex flex-col gap-1 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
          >
            <span className="font-semibold">{s.title}</span>
            <span className="text-sm text-muted-foreground">{s.description}</span>
          </Link>
        ))}
      </div>
    </main>
  )
}
