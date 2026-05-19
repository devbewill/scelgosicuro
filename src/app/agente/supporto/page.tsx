import { PageHeader } from "@/components/agente/page-header"

const contacts = [
  { label: "Email supporto", value: "supporto@scelgosicuro.it", action: "Scrivi" },
  { label: "Telefono",       value: "+39 02 0000 0000",          action: "Chiama" },
  { label: "Orari",          value: "Lun–Ven 9:00–18:00",        action: null },
  { label: "Emergenze",      value: "Fuori orario solo sinistri urgenti", action: null },
]

export default function SupportoPage() {
  return (
    <main className="p-8">
      <PageHeader
        eyebrow="Area Agente"
        title="Supporto"
        subtitle="Assistenza tecnica e contatti operativi."
      />

      <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
        {contacts.map((item) => (
          <div key={item.label} className="bg-white rounded-2xl p-6 border border-ink/5 flex flex-col gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-muted">{item.label}</p>
            <p className="font-semibold text-base text-ink">{item.value}</p>
            {item.action && (
              <button className="w-fit bg-ink text-white font-semibold px-4 py-1.5 text-xs rounded-full mt-1 hover:bg-sage transition-colors">
                {item.action} →
              </button>
            )}
          </div>
        ))}
      </div>
    </main>
  )
}
