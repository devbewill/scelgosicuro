import { notFound } from "next/navigation"

import { ResultsView } from "@/components/quote/results-view"
import { getQuoteResults, countQuoteResults } from "@/lib/data/results"
import { getQuoteSession } from "@/lib/data/questionnaires"
import { generateQuotes } from "@/lib/engine/generate"

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

  const results = await getQuoteResults(sessionId)

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col p-6">
      <h1 className="mb-6 text-2xl font-semibold">Le tue proposte</h1>
      <ResultsView results={results} />
    </main>
  )
}
