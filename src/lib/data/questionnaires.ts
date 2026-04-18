import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { SectorQuestion, Question, QuestionOption, QuestionValidation, QuestionType, QuoteSession } from "@/lib/types"

export async function getSectorQuestions(sectorId: string): Promise<SectorQuestion[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("sector_questions")
    .select(`
      position, section, is_required, visible_if,
      questions!inner(key, label, help_text, type, options, validation)
    `)
    .eq("sector_id", sectorId)
    .order("position", { ascending: true })

  if (error) throw new Error(`Failed to load sector questions: ${error.message}`)

  return ((data ?? []) as unknown as Array<{
    position: number
    section: string | null
    is_required: boolean
    visible_if: Record<string, unknown> | null
    questions: {
      key: string
      label: string
      help_text: string | null
      type: string
      options: QuestionOption[] | null
      validation: QuestionValidation | null
    }
  }>).map((row) => ({
    position: row.position,
    section: row.section,
    isRequired: row.is_required,
    visibleIf: row.visible_if,
    question: {
      key: row.questions.key,
      label: row.questions.label,
      helpText: row.questions.help_text,
      type: row.questions.type as QuestionType,
      options: row.questions.options,
      validation: row.questions.validation,
    } satisfies Question,
  }))
}

export async function getQuoteSession(sessionId: string): Promise<QuoteSession | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("quote_sessions")
    .select("id, sector_id, answers, status")
    .eq("id", sessionId)
    .maybeSingle()

  if (error) throw new Error(`Failed to load quote session: ${error.message}`)
  if (!data) return null

  return {
    id: data.id,
    sectorId: data.sector_id,
    answers: (data.answers as Record<string, unknown>) ?? {},
    status: data.status,
  }
}
