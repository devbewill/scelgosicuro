"use server"

import { createClient } from "@/lib/supabase/server"
import { phaseASchema } from "@/lib/schemas/quote-session"
import { generateQuotes } from "@/lib/engine/generate"

export type PhaseAResult =
  | { ok: true; sessionId: string }
  | { ok: false; error: string }

export type SaveAnswersResult =
  | { ok: true }
  | { ok: false; error: string }

export type RunEngineResult =
  | { ok: true; resultCount: number; userScore: number }
  | { ok: false; error: string }

export async function createQuoteSession(
  input: unknown
): Promise<PhaseAResult> {
  const parsed = phaseASchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "Dati non validi" }
  }
  const data = parsed.data

  const supabase = await createClient()

  const { data: activity, error: activityError } = await supabase
    .from("activities")
    .select("id, sector_id")
    .eq("id", data.activityId)
    .maybeSingle()

  if (activityError) {
    return { ok: false, error: "Errore nella verifica dell'attività" }
  }
  if (!activity) {
    return { ok: false, error: "Attività non valida" }
  }
  if (activity.sector_id !== data.sectorId) {
    return {
      ok: false,
      error: "L'attività selezionata non appartiene al settore scelto",
    }
  }

  const sessionId = crypto.randomUUID()
  const { error: insertError } = await supabase
    .from("quote_sessions")
    .insert({
      id: sessionId,
      activity_id: data.activityId,
      contact_name: data.contactName,
      contact_email: data.contactEmail,
      contact_phone: data.contactPhone,
    })

  if (insertError) {
    console.error("[createQuoteSession] insert failed:", insertError)
    return {
      ok: false,
      error: `Insert failed: ${insertError.code ?? ""} ${insertError.message}`,
    }
  }

  return { ok: true, sessionId }
}

export async function saveQuestionnaireAnswers(input: {
  sessionId: string
  questionnaireId: string
  answers: Record<string, unknown>
}): Promise<SaveAnswersResult> {
  if (!input?.sessionId || !input?.questionnaireId) {
    return { ok: false, error: "Parametri mancanti" }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("quote_sessions")
    .update({
      questionnaire_id: input.questionnaireId,
      answers: input.answers,
      status: "answered",
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.sessionId)

  if (error) {
    console.error("[saveQuestionnaireAnswers] update failed:", error)
    return {
      ok: false,
      error: `Update failed: ${error.code ?? ""} ${error.message}`,
    }
  }

  return { ok: true }
}

export async function runEngine(sessionId: string): Promise<RunEngineResult> {
  if (!sessionId) return { ok: false, error: "Sessione mancante" }
  try {
    return await generateQuotes(sessionId)
  } catch (err) {
    console.error("[runEngine] failed:", err)
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Errore motore",
    }
  }
}
