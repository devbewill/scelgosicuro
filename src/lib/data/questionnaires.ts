import "server-only"

import { createClient } from "@/lib/supabase/server"
import type {
  Question,
  QuestionOption,
  QuestionType,
  QuestionValidation,
  Questionnaire,
  QuestionnaireDefinition,
  QuoteSession,
} from "@/lib/types"

export async function getPublishedQuestionnaire(
  activityId: string
): Promise<Questionnaire | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("questionnaires")
    .select("id, activity_id, version, definition")
    .eq("activity_id", activityId)
    .eq("status", "published")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to load questionnaire: ${error.message}`)
  }
  if (!data) return null

  return {
    id: data.id,
    activityId: data.activity_id,
    version: data.version,
    definition: data.definition as QuestionnaireDefinition,
  }
}

export async function getQuestionsByKeys(
  keys: string[]
): Promise<Record<string, Question>> {
  if (keys.length === 0) return {}
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("questions")
    .select("key, label, help_text, type, options, validation")
    .in("key", keys)

  if (error) {
    throw new Error(`Failed to load questions: ${error.message}`)
  }

  const map: Record<string, Question> = {}
  for (const row of data ?? []) {
    map[row.key] = {
      key: row.key,
      label: row.label,
      helpText: row.help_text,
      type: row.type as QuestionType,
      options: (row.options as QuestionOption[] | null) ?? null,
      validation: (row.validation as QuestionValidation | null) ?? null,
    }
  }
  return map
}

export async function getQuoteSession(
  sessionId: string
): Promise<QuoteSession | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("quote_sessions")
    .select("id, activity_id, questionnaire_id, answers, status")
    .eq("id", sessionId)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to load quote session: ${error.message}`)
  }
  if (!data) return null

  return {
    id: data.id,
    activityId: data.activity_id,
    questionnaireId: data.questionnaire_id,
    answers: (data.answers as Record<string, unknown> | null) ?? {},
    status: data.status,
  }
}
