import { PageHeader } from "@/components/agente/page-header"

export default function PolizzePage() {
  return (
    <main className="p-8">
      <PageHeader
        eyebrow="Area Agente"
        title="Le mie polizze"
        subtitle="Gestione e monitoraggio delle polizze emesse."
      />

      <div className="bg-white rounded-2xl border border-ink/5 overflow-hidden">
        <div className="border-b border-ink/5 px-6 py-3 bg-warm-white">
          <div className="grid grid-cols-5 text-[10px] font-bold uppercase tracking-[0.15em] text-ink-muted">
            <span>Cliente</span>
            <span>Prodotto</span>
            <span>Compagnia</span>
            <span>Scadenza</span>
            <span>Stato</span>
          </div>
        </div>
        <div className="px-6 py-12 text-center">
          <p className="text-sm font-medium text-ink/30">Nessuna polizza trovata.</p>
        </div>
      </div>
    </main>
  )
}
