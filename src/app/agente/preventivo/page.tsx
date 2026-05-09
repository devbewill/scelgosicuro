import { DebugPanel } from "@/components/dev/debug-panel"
import { getSectors } from "@/lib/data/catalog"

export default async function AgentePreventivoPage() {
  const sectors = await getSectors()

  return (
    <main className="flex min-h-screen w-full flex-col gap-8 p-8">
      <header className="border-b-2 border-black pb-6">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30">AREA AGENTE</p>
        <h1 className="text-4xl font-black uppercase tracking-tight">Calcola preventivo</h1>
        <p className="mt-1 text-sm font-medium text-black/50">
          Seleziona settore e professione, compila il questionario, visualizza i risultati del motore.
        </p>
      </header>
      <DebugPanel sectors={sectors} />
    </main>
  )
}
