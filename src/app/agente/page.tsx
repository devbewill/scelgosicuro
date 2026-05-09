const cards = [
  { title: "Polizze attive", value: "—", desc: "Polizze emesse e in corso" },
  { title: "Preventivi in sospeso", value: "—", desc: "Da completare o convertire" },
  { title: "Scadenze questo mese", value: "—", desc: "Polizze in scadenza a 30 gg" },
  { title: "Provvigioni mese", value: "—", desc: "Totale del mese corrente" },
]

export default function AgenteDashboard() {
  return (
    <main className="flex min-h-screen w-full flex-col gap-8 p-8">
      <header className="border-b-2 border-black pb-6">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30">AREA AGENTE</p>
        <h1 className="text-4xl font-black uppercase tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm font-medium text-black/50">Benvenuto nel tuo pannello agente.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.title} className="border-2 border-black p-5 flex flex-col gap-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">{c.title}</p>
            <p className="text-4xl font-black font-mono text-green-500">{c.value}</p>
            <p className="text-xs text-black/50 font-medium">{c.desc}</p>
          </div>
        ))}
      </div>

      <div className="border-2 border-black p-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 mb-2">ATTIVITÀ RECENTE</p>
        <p className="text-sm text-black/40 font-medium">Nessuna attività recente.</p>
      </div>
    </main>
  )
}
