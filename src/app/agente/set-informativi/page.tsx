import { PageHeader } from "@/components/agente/page-header"

const sets = [
  { name: "AmTrust RC Professionale", tipo: "DIP / IPID", data: "2024-01-01", formato: "PDF" },
  { name: "AmTrust RC Medici",        tipo: "DIP / IPID", data: "2024-01-01", formato: "PDF" },
]

export default function SetInformativiPage() {
  return (
    <main className="p-8">
      <PageHeader
        eyebrow="Area Agente"
        title="Set informativi"
        subtitle="Documenti precontrattuali e informativi di prodotto."
      />

      <div className="bg-white rounded-2xl border border-ink/5 overflow-hidden">
        <div className="border-b border-ink/5 bg-warm-white">
          <div className="grid grid-cols-4 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-ink-muted">
            <span>Prodotto</span>
            <span>Tipo</span>
            <span>Data</span>
            <span>Scarica</span>
          </div>
        </div>
        {sets.map((s, i) => (
          <div
            key={i}
            className={`grid grid-cols-4 items-center px-6 py-4 border-b border-ink/5 last:border-b-0 ${i % 2 === 0 ? "bg-white" : "bg-warm-white"}`}
          >
            <span className="font-semibold text-sm text-ink">{s.name}</span>
            <span className="text-xs font-medium text-ink-muted uppercase tracking-wide">{s.tipo}</span>
            <span className="text-xs text-ink/40">{s.data}</span>
            <button className="w-fit bg-ink text-white font-semibold px-4 py-1.5 text-xs rounded-full hover:bg-sage transition-colors">
              {s.formato} ↓
            </button>
          </div>
        ))}
      </div>
    </main>
  )
}
