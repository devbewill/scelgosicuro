import { notFound } from "next/navigation"

import { DynamicForm } from "@/components/quote/dynamic-form"
import {
  getPublishedQuestionnaire,
  getQuestionsByKeys,
  getQuoteSession,
} from "@/lib/data/questionnaires"

export default async function DomandePage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = await params

  const session = await getQuoteSession(sessionId)
  if (!session) notFound()

  const questionnaire = await getPublishedQuestionnaire(session.activityId)
  if (!questionnaire) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center p-6">
        <p className="text-sm">
          Nessun questionario disponibile per questa attività.
        </p>
      </main>
    )
  }

  const keys = questionnaire.definition.sections.flatMap((s) =>
    s.items.map((i) => i.question_key)
  )
  const questions = await getQuestionsByKeys(keys)

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col p-6">
      <h1 className="mb-6 text-2xl font-semibold">
        {questionnaire.definition.title}
      </h1>
      <DynamicForm
        sessionId={session.id}
        questionnaire={questionnaire}
        questions={questions}
        savedAnswers={session.answers}
      />
    </main>
  )
}
