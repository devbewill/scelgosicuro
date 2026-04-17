import { PhaseAForm } from "@/components/quote/phase-a-form"
import { getActivities, getSectors } from "@/lib/data/catalog"

export default async function Home() {
  const [sectors, activities] = await Promise.all([
    getSectors(),
    getActivities(),
  ])

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center p-6">
      <PhaseAForm sectors={sectors} activities={activities} />
    </main>
  )
}
