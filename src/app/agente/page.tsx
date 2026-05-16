const cards = [
  { title: "Polizze attive",          value: "—", desc: "Polizze emesse e in corso" },
  { title: "Preventivi in sospeso",   value: "—", desc: "Da completare o convertire" },
  { title: "Scadenze questo mese",    value: "—", desc: "Polizze in scadenza a 30 gg" },
  { title: "Provvigioni mese",        value: "—", desc: "Totale del mese corrente" },
]

export default function AgenteDashboard() {
  return (
    <main className="p-8">
      <header className="mb-8 pb-6 border-b border-[#e2dbd0]">
        <p className="text-xs font-semibold text-[#1C1C1A]/40 uppercase tracking-wider mb-1">Area Agente</p>
        <h1 className="text-3xl font-bold text-[#1C1C1A] tracking-tight font-[family-name:var(--font-heading)]">Dashboard</h1>
        <p className="mt-1.5 text-sm text-[#1C1C1A]/50">Benvenuto nel tuo pannello agente.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.title} className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
            <p className="text-xs font-semibold text-[#1C1C1A]/40 uppercase tracking-wide">{c.title}</p>
            <p className="text-4xl font-bold text-[#ff88c8] font-[family-name:var(--font-heading)] mt-2">{c.value}</p>
            <p className="text-xs text-[#1C1C1A]/50 mt-1">{c.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
        <p className="text-xs font-semibold text-[#1C1C1A]/40 uppercase tracking-wide mb-3">Attività recente</p>
        <p className="text-sm text-[#1C1C1A]/40">Nessuna attività recente.</p>
      </div>
    </main>
  )
}
