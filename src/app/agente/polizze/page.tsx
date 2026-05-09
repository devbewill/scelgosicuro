export default function PolizzePage() {
  return (
    <main className="flex min-h-screen w-full flex-col gap-8 p-8">
      <header className="border-b-2 border-black pb-6">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30">AREA AGENTE</p>
        <h1 className="text-4xl font-black uppercase tracking-tight">Le mie polizze</h1>
        <p className="mt-1 text-sm font-medium text-black/50">Gestione e monitoraggio delle polizze emesse.</p>
      </header>

      <div className="border-2 border-black">
        <div className="border-b-2 border-black bg-black px-6 py-3">
          <div className="grid grid-cols-5 text-[10px] font-black uppercase tracking-[0.15em] text-white/50">
            <span>Cliente</span>
            <span>Prodotto</span>
            <span>Compagnia</span>
            <span>Scadenza</span>
            <span>Stato</span>
          </div>
        </div>
        <div className="px-6 py-12 text-center">
          <p className="text-sm font-bold text-black/30">Nessuna polizza trovata.</p>
        </div>
      </div>
    </main>
  )
}
