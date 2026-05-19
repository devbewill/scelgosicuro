import { PageHeader } from "@/components/agente/page-header"

const cards = [
  { title: "Polizze attive",        value: "—", desc: "Polizze emesse e in corso" },
  { title: "Preventivi in sospeso", value: "—", desc: "Da completare o convertire" },
  { title: "Scadenze questo mese",  value: "—", desc: "Polizze in scadenza a 30 gg" },
  { title: "Provvigioni mese",      value: "—", desc: "Totale del mese corrente" },
]

export default function AgenteDashboard() {
  return (
    <main className="p-8">
      <PageHeader
        eyebrow="Area Agente"
        title="Dashboard"
        subtitle="Benvenuto nel tuo pannello agente."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.title} className="bg-white rounded-2xl p-6 border border-ink/5">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-muted">{c.title}</p>
            <p className="text-4xl font-black text-sage tracking-tighter mt-2">{c.value}</p>
            <p className="text-xs text-ink-muted mt-1">{c.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-white rounded-2xl p-6 border border-ink/5">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-muted mb-3">Attività recente</p>
        <p className="text-sm text-ink/30">Nessuna attività recente.</p>
      </div>
    </main>
  )
}
