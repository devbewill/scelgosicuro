export default function PolizzePage() {
  return (
    <main className="p-8">
      <header className="mb-8 pb-6 border-b border-[#e2dbd0]">
        <p className="text-xs font-semibold text-[#1C1C1A]/40 uppercase tracking-wider mb-1">Area Agente</p>
        <h1 className="text-3xl font-bold text-[#1C1C1A] tracking-tight font-[family-name:var(--font-heading)]">Le mie polizze</h1>
        <p className="mt-1.5 text-sm text-[#1C1C1A]/50">Gestione e monitoraggio delle polizze emesse.</p>
      </header>

      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="border-b border-[#e2dbd0] px-6 py-3 bg-[#fbf8f5]">
          <div className="grid grid-cols-5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#1C1C1A]/40">
            <span>Cliente</span>
            <span>Prodotto</span>
            <span>Compagnia</span>
            <span>Scadenza</span>
            <span>Stato</span>
          </div>
        </div>
        <div className="px-6 py-12 text-center">
          <p className="text-sm font-medium text-[#1C1C1A]/30">Nessuna polizza trovata.</p>
        </div>
      </div>
    </main>
  )
}
