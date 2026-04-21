import { DebugPanel } from "@/components/dev/debug-panel"
import { getSectors } from "@/lib/data/catalog"

export default async function FormTestingPage() {
  const sectors = await getSectors()

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Form Testing</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Test rapido senza inserire i contatti. Seleziona settore, compila il form, vedi i risultati del motore.
        </p>
      </header>
      <DebugPanel sectors={sectors} />
    </main>
  )
}
