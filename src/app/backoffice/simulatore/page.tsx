import { getBackofficeSectors, getTariffariAnalysis, getAllProfessionOptions } from "@/lib/data/backoffice"
import { getSectorQuestions } from "@/lib/data/questionnaires"
import { SimulatoreClient } from "./client"

export default async function SimulatorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const params = await searchParams
  const tab = (params.tab === "simula" ? "simula" : "analizza") as "simula" | "analizza"

  const [sectors, professionIndex] = await Promise.all([
    getBackofficeSectors(),
    getAllProfessionOptions(),
  ])

  const selectedSector = sectors.find((s) => s.slug === params.sector) ?? null

  // Load data only for the active tab
  const [questions, analysis] = await Promise.all([
    tab === "simula" && selectedSector
      ? getSectorQuestions(String(selectedSector.id))
      : Promise.resolve([]),
    tab === "analizza" && selectedSector
      ? getTariffariAnalysis(selectedSector.id)
      : Promise.resolve(null),
  ])

  // Pre-fill answers from URL (keys starting with q_)
  const prefill: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(params)) {
    if (k.startsWith("q_")) prefill[k] = isNaN(Number(v)) ? v : Number(v)
  }

  return (
    <SimulatoreClient
      tab={tab}
      sectors={sectors}
      professionIndex={professionIndex}
      selectedSector={selectedSector}
      questions={questions}
      prefillAnswers={prefill}
      analysis={analysis}
      selectedProfession={params.profession ?? null}
    />
  )
}
