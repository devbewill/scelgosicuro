"use client"

import * as React from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { QuestionField } from "@/components/quote/question-field"
import { saveQuestionnaireAnswers } from "@/app/actions"
import type {
  Question,
  Questionnaire,
  QuestionnaireItem,
  VisibleIfRule,
} from "@/lib/types"
import {
  buildQuestionnaireSchema,
  defaultsFor,
} from "@/lib/schemas/questionnaire"

type Values = Record<string, unknown>

export function DynamicForm({
  sessionId,
  questionnaire,
  questions,
  savedAnswers,
}: {
  sessionId: string
  questionnaire: Questionnaire
  questions: Record<string, Question>
  savedAnswers: Record<string, unknown>
}) {
  const router = useRouter()
  const [submitting, setSubmitting] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  const schema = React.useMemo(
    () => buildQuestionnaireSchema(questionnaire.definition, questions),
    [questionnaire.definition, questions]
  )
  const defaults = React.useMemo(
    () => defaultsFor(questionnaire.definition, questions, savedAnswers),
    [questionnaire.definition, questions, savedAnswers]
  )

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: defaults,
  })

  async function onSubmit(values: Values) {
    setSubmitting(true)
    setErrorMsg(null)
    try {
      const res = await saveQuestionnaireAnswers({
        sessionId,
        questionnaireId: questionnaire.id,
        answers: values,
      })
      if (res.ok) {
        router.push(`/preventivo/${sessionId}/risultati`)
      } else {
        setErrorMsg(res.error)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-8"
        noValidate
      >
        {questionnaire.definition.sections.map((section) => (
          <section key={section.key} className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">{section.title}</h2>
            {section.items.map((item) => {
              const q = questions[item.question_key]
              if (!q) return null
              return (
                <VisibleItem key={item.question_key} item={item}>
                  <QuestionField
                    question={q}
                    required={item.required ?? q.validation?.required ?? false}
                    control={form.control}
                  />
                </VisibleItem>
              )
            })}
          </section>
        ))}

        <Button type="submit" disabled={submitting}>
          {submitting ? "Invio in corso..." : "Continua"}
        </Button>

        {errorMsg ? (
          <p role="alert" className="text-destructive text-sm">
            {errorMsg}
          </p>
        ) : null}
      </form>
    </Form>
  )
}

function VisibleItem({
  item,
  children,
}: {
  item: QuestionnaireItem
  children: React.ReactNode
}) {
  const rule = item.visible_if
  const watched = useWatch({ name: rule?.question_key ?? "__none__" })
  if (!rule) return <>{children}</>
  return evalVisibleIf(rule, watched) ? <>{children}</> : null
}

function evalVisibleIf(rule: VisibleIfRule, value: unknown): boolean {
  const target = rule.value
  switch (rule.operator) {
    case "equals":
      return value === target
    case "not_equals":
      return value !== target
    case "in":
      return Array.isArray(target) && target.includes(String(value))
    case "not_in":
      return Array.isArray(target) && !target.includes(String(value))
    default:
      return true
  }
}
