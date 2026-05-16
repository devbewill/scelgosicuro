const sets = [
  { name: "AmTrust RC Professionale", tipo: "DIP / IPID", data: "2024-01-01", formato: "PDF" },
  { name: "AmTrust RC Medici",        tipo: "DIP / IPID", data: "2024-01-01", formato: "PDF" },
]

export default function SetInformativiPage() {
  return (
    <main className="p-8">
      <header className="mb-8 pb-6 border-b border-[#e2dbd0]">
        <p className="text-xs font-semibold text-[#1C1C1A]/40 uppercase tracking-wider mb-1">Area Agente</p>
        <h1 className="text-3xl font-bold text-[#1C1C1A] tracking-tight font-[family-name:var(--font-heading)]">Set informativi</h1>
        <p className="mt-1.5 text-sm text-[#1C1C1A]/50">Documenti precontrattuali e informativi di prodotto.</p>
      </header>

      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="border-b border-[#e2dbd0] bg-[#fbf8f5]">
          <div className="grid grid-cols-4 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#1C1C1A]/40">
            <span>Prodotto</span>
            <span>Tipo</span>
            <span>Data</span>
            <span>Scarica</span>
          </div>
        </div>
        {sets.map((s, i) => (
          <div
            key={i}
            className={`grid grid-cols-4 items-center px-6 py-4 border-b border-[#e2dbd0] last:border-b-0 ${i % 2 === 0 ? "bg-white" : "bg-[#fbf8f5]"}`}
          >
            <span className="font-semibold text-sm text-[#1C1C1A]">{s.name}</span>
            <span className="text-xs font-medium text-[#1C1C1A]/50 uppercase tracking-wide">{s.tipo}</span>
            <span className="text-xs text-[#1C1C1A]/40">{s.data}</span>
            <button className="w-fit bg-[#1C1C1A] text-white font-semibold px-4 py-1.5 text-xs rounded-full transition-all duration-200 hover:bg-black hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
              {s.formato} ↓
            </button>
          </div>
        ))}
      </div>
    </main>
  )
}
