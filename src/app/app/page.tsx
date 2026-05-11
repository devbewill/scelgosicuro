import { getSectors } from "@/lib/data/catalog"
import { QuoteFlow } from "@/components/app/quote-flow"

export const metadata = {
  title: "Calcola il preventivo — ScelgoSicuro",
  description: "Ottieni in 2 minuti il preventivo RC Professionale più adatto al tuo profilo.",
}

export default async function AppPage() {
  const sectors = await getSectors()
  return <QuoteFlow sectors={sectors} />
}
