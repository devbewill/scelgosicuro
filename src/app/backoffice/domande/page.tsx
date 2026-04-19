import { getBackofficeQuestions, getBackofficeSectors } from "@/lib/data/backoffice"
import { QuestionPageClient } from "./client"

export default async function DomandePage({
  searchParams,
}: {
  searchParams: Promise<{ sector?: string }>
}) {
  const { sector } = await searchParams
  const [questions, sectors] = await Promise.all([
    getBackofficeQuestions(sector),
    getBackofficeSectors(),
  ])

  return <QuestionPageClient questions={questions} sectors={sectors} currentSector={sector} />
}
