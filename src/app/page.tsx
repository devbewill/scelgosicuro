import { PhaseAForm } from "@/components/quote/phase-a-form"
import { getSectors } from "@/lib/data/catalog"

export default async function Home() {
  const sectors = await getSectors()

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center p-6">
      <PhaseAForm sectors={sectors} />
    </main>
  )
}
