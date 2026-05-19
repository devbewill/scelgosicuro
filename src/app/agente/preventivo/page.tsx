import { DebugPanel } from "@/components/dev/debug-panel"
import { getSectors } from "@/lib/data/catalog"
import { PageHeader } from "@/components/agente/page-header"

export default async function AgentePreventivoPage() {
  const sectors = await getSectors()

  return (
    <main className="flex min-h-screen w-full flex-col gap-8 p-8">
      <PageHeader
        eyebrow="Area Agente"
        title="Calcola preventivo"
        subtitle="Seleziona settore e professione, compila il questionario, visualizza i risultati del motore."
      />
      <DebugPanel sectors={sectors} />
    </main>
  )
}
