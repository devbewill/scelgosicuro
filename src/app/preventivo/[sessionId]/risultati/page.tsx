import { notFound } from "next/navigation"

import { ResultsView } from "@/components/quote/results-view"
import { getQuoteResults, countQuoteResults } from "@/lib/data/results"
import { getQuoteSession, getSectorQuestions, getProductQuestions } from "@/lib/data/questionnaires"
import { generateQuotes } from "@/lib/engine/generate"
import type { SectorQuestion } from "@/lib/types"

export default async function RisultatiPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = await params

  const session = await getQuoteSession(sessionId)
  if (!session) notFound()

  const existing = await countQuoteResults(sessionId)
  if (existing === 0) {
    const res = await generateQuotes(sessionId)
    if (!res.ok) {
      return (
        <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col p-6">
          <h1 className="mb-4 text-2xl font-semibold">Risultati</h1>
          <p className="text-sm text-destructive">Errore: {res.error}</p>
        </main>
      )
    }
  }

  const [results, allSectorQuestions] = await Promise.all([
    getQuoteResults(sessionId),
    getSectorQuestions(String(session.sectorId)),
  ])

  const productIds = [...new Set(results.map((r) => r.productId))]
  const allProductQuestions = productIds.length > 0 ? await getProductQuestions(productIds) : []

  const addonQs: SectorQuestion[] = allProductQuestions
    .filter((pq) => pq.phase === "addon")
    .map((pq) => ({
      id: pq.id,
      sectorId: session.sectorId,
      key: pq.key,
      label: pq.label,
      helpText: pq.helpText,
      type: pq.type,
      options: pq.options,
      validation: pq.validation,
      position: 100 + pq.position,
      section: pq.section,
      isRequired: pq.isRequired,
      visibleIf: pq.visibleIf,
    }))

  const tuningQuestions = [
    ...allSectorQuestions.filter((q) => !q.isRequired),
    ...addonQs,
  ]

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col p-6">
      <h1 className="mb-6 text-2xl font-semibold">Le tue proposte</h1>
      <ResultsView
        results={results}
        sessionId={sessionId}
        tuningQuestions={tuningQuestions}
        savedAnswers={session.answers}
      />
    </main>
  )
}
