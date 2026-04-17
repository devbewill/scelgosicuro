import { z } from "zod"

import type { Question, QuestionnaireDefinition } from "@/lib/types"

function fieldSchema(q: Question, required: boolean): z.ZodTypeAny {
  const v = q.validation ?? {}
  switch (q.type) {
    case "number":
    case "currency": {
      let n: z.ZodNumber = z.number({ error: "Valore non valido" })
      if (typeof v.min === "number") n = n.min(v.min, `Minimo ${v.min}`)
      if (typeof v.max === "number") n = n.max(v.max, `Massimo ${v.max}`)
      return required ? n : n.optional()
    }
    case "date": {
      const d = z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Data non valida (YYYY-MM-DD)")
      return required ? d : d.optional().or(z.literal(""))
    }
    case "boolean": {
      const b = z.boolean()
      return required ? b : b.optional()
    }
    case "multichoice": {
      const arr = z.array(z.string())
      return required ? arr.min(1, "Seleziona almeno un'opzione") : arr
    }
    case "dropdown":
    case "choice":
    case "text":
    default: {
      let s = z.string()
      if (v.regex) s = s.regex(new RegExp(v.regex), "Formato non valido")
      return required
        ? s.min(1, "Campo obbligatorio")
        : s.optional().or(z.literal(""))
    }
  }
}

export function buildQuestionnaireSchema(
  definition: QuestionnaireDefinition,
  questions: Record<string, Question>
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {}
  for (const section of definition.sections) {
    for (const item of section.items) {
      const q = questions[item.question_key]
      if (!q) continue
      const required = item.required ?? q.validation?.required ?? false
      shape[item.question_key] = fieldSchema(q, required)
    }
  }
  return z.object(shape)
}

export function defaultsFor(
  definition: QuestionnaireDefinition,
  questions: Record<string, Question>,
  saved: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const section of definition.sections) {
    for (const item of section.items) {
      const q = questions[item.question_key]
      if (!q) continue
      const existing = saved[item.question_key]
      if (existing !== undefined && existing !== null) {
        out[item.question_key] = existing
        continue
      }
      switch (q.type) {
        case "number":
        case "currency":
          out[item.question_key] = undefined
          break
        case "boolean":
          out[item.question_key] = false
          break
        case "multichoice":
          out[item.question_key] = []
          break
        default:
          out[item.question_key] = ""
      }
    }
  }
  return out
}
