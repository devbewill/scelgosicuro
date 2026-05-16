export default function SupportoPage() {
  return (
    <main className="p-8">
      <header className="mb-8 pb-6 border-b border-[#e2dbd0]">
        <p className="text-xs font-semibold text-[#1C1C1A]/40 uppercase tracking-wider mb-1">Area Agente</p>
        <h1 className="text-3xl font-bold text-[#1C1C1A] tracking-tight font-[family-name:var(--font-heading)]">Supporto</h1>
        <p className="mt-1.5 text-sm text-[#1C1C1A]/50">Assistenza tecnica e contatti operativi.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
        {[
          { label: "Email supporto", value: "supporto@scelgosicuro.it", action: "Scrivi" },
          { label: "Telefono",       value: "+39 02 0000 0000",          action: "Chiama" },
          { label: "Orari",          value: "Lun–Ven 9:00–18:00",        action: null },
          { label: "Emergenze",      value: "Fuori orario solo sinistri urgenti", action: null },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.05)] flex flex-col gap-2">
            <p className="text-xs font-semibold text-[#1C1C1A]/40 uppercase tracking-wide">{item.label}</p>
            <p className="font-semibold text-base text-[#1C1C1A]">{item.value}</p>
            {item.action && (
              <button className="w-fit bg-[#1C1C1A] text-white font-semibold px-4 py-1.5 text-xs rounded-full mt-1 transition-all duration-200 hover:bg-black hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
                {item.action} →
              </button>
            )}
          </div>
        ))}
      </div>
    </main>
  )
}
