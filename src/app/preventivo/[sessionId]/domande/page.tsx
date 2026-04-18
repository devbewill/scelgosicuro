import { notFound } from "next/navigation"

import { DynamicForm } from "@/components/quote/dynamic-form"
import { getQuoteSession } from "@/lib/data/questionnaires"
import { getSectorQuestions } from "@/lib/data/questionnaires"

export default async function DomandePage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = await params

  const session = await getQuoteSession(sessionId)
  if (!session) notFound()

  const questions = await getSectorQuestions(session.sectorId)

  if (questions.length === 0) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center p-6">
        <p className="text-sm text-muted-foreground">
          Nessuna domanda configurata per questo settore.
        </p>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col p-6">
      <h1 className="mb-6 text-2xl font-semibold">Raccontaci di te</h1>
      <DynamicForm
        sessionId={session.id}
        sectorQuestions={questions}
        savedAnswers={session.answers}
      />
    </main>
  )
}
