const sets = [
  { name: "AmTrust RC Professionale", tipo: "DIP / IPID", data: "2024-01-01", formato: "PDF" },
  { name: "AmTrust RC Medici", tipo: "DIP / IPID", data: "2024-01-01", formato: "PDF" },
]

export default function SetInformativiPage() {
  return (
    <main className="flex min-h-screen w-full flex-col gap-8 p-8">
      <header className="border-b-2 border-black pb-6">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30">AREA AGENTE</p>
        <h1 className="text-4xl font-black uppercase tracking-tight">Set informativi</h1>
        <p className="mt-1 text-sm font-medium text-black/50">Documenti precontrattuali e informativi di prodotto.</p>
      </header>

      <div className="border-2 border-black overflow-hidden">
        <div className="border-b-2 border-black bg-black">
          <div className="grid grid-cols-4 px-6 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-white/50">
            <span>Prodotto</span>
            <span>Tipo</span>
            <span>Data</span>
            <span>Scarica</span>
          </div>
        </div>
        {sets.map((s, i) => (
          <div key={i} className={`grid grid-cols-4 items-center px-6 py-4 border-b border-black/10 ${i % 2 === 0 ? "bg-white" : "bg-black/[0.02]"}`}>
            <span className="font-bold text-sm">{s.name}</span>
            <span className="text-xs font-bold text-black/50 uppercase tracking-wide">{s.tipo}</span>
            <span className="text-xs font-medium text-black/40">{s.data}</span>
            <button className="w-fit border-2 border-black px-3 py-1.5 text-xs font-black uppercase tracking-wide hover:bg-black hover:text-white transition-colors">
              {s.formato} ↓
            </button>
          </div>
        ))}
      </div>
    </main>
  )
}
