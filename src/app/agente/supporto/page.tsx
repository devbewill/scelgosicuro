export default function SupportoPage() {
  return (
    <main className="flex min-h-screen w-full flex-col gap-8 p-8">
      <header className="border-b-2 border-black pb-6">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30">AREA AGENTE</p>
        <h1 className="text-4xl font-black uppercase tracking-tight">Supporto</h1>
        <p className="mt-1 text-sm font-medium text-black/50">Assistenza tecnica e contatti operativi.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
        {[
          { label: "Email supporto", value: "supporto@scelgosicuro.it", action: "Scrivi" },
          { label: "Telefono", value: "+39 02 0000 0000", action: "Chiama" },
          { label: "Orari", value: "Lun–Ven 9:00–18:00", action: null },
          { label: "Emergenze", value: "Fuori orario solo sinistri urgenti", action: null },
        ].map((item) => (
          <div key={item.label} className="border-2 border-black p-5 flex flex-col gap-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">{item.label}</p>
            <p className="font-black text-base">{item.value}</p>
            {item.action && (
              <button className="w-fit border-2 border-black px-3 py-1.5 text-xs font-black uppercase tracking-wide hover:bg-black hover:text-white transition-colors mt-1">
                {item.action} →
              </button>
            )}
          </div>
        ))}
      </div>
    </main>
  )
}
