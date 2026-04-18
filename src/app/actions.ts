"use server"

import { createClient } from "@/lib/supabase/server"
import { phaseASchema } from "@/lib/schemas/quote-session"
import { generateQuotes } from "@/lib/engine/generate"
import { getSectorQuestions } from "@/lib/data/questionnaires"
import { getQuoteResults } from "@/lib/data/results"
import type { SectorQuestion, QuoteResult } from "@/lib/types"

export type PhaseAResult =
  | { ok: true; sessionId: string }
  | { ok: false; error: string }

export type SaveAnswersResult =
  | { ok: true }
  | { ok: false; error: string }

export type RunEngineResult =
  | { ok: true; resultCount: number; userScore: number }
  | { ok: false; error: string }

export async function createQuoteSession(input: unknown): Promise<PhaseAResult> {
  const parsed = phaseASchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dati non validi" }
  }
  const { sectorId, age, contactName, contactEmail, contactPhone } = parsed.data

  const supabase = await createClient()

  const { data: sector } = await supabase
    .from("sectors")
    .select("id")
    .eq("id", sectorId)
    .eq("is_active", true)
    .maybeSingle()

  if (!sector) return { ok: false, error: "Settore non valido" }

  const sessionId = crypto.randomUUID()
  const { error } = await supabase.from("quote_sessions").insert({
    id: sessionId,
    sector_id: sectorId,
    contact: { name: contactName, email: contactEmail, phone: contactPhone },
    answers: { q_eta: age },
    status: "draft",
  })

  if (error) return { ok: false, error: error.message }
  return { ok: true, sessionId }
}

export async function saveAnswers(input: {
  sessionId: string
  answers: Record<string, unknown>
}): Promise<SaveAnswersResult> {
  if (!input?.sessionId) return { ok: false, error: "Sessione mancante" }

  const supabase = await createClient()

  // Merge with existing answers to preserve pre-set values (e.g. q_eta from Phase A)
  const { data: session } = await supabase
    .from("quote_sessions")
    .select("answers")
    .eq("id", input.sessionId)
    .maybeSingle()

  const merged = { ...((session?.answers as Record<string, unknown>) ?? {}), ...input.answers }

  const { error } = await supabase
    .from("quote_sessions")
    .update({ answers: merged, status: "completed" })
    .eq("id", input.sessionId)

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function runEngine(sessionId: string): Promise<RunEngineResult> {
  if (!sessionId) return { ok: false, error: "Sessione mancante" }
  try {
    return await generateQuotes(sessionId)
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Errore motore" }
  }
}

export async function createDebugSession(
  sectorId: string,
  age: number,
): Promise<{ ok: true; sessionId: string } | { ok: false; error: string }> {
  if (!sectorId) return { ok: false, error: "Settore mancante" }
  const supabase = await createClient()
  const { data: sector } = await supabase
    .from("sectors")
    .select("id")
    .eq("id", sectorId)
    .eq("is_active", true)
    .maybeSingle()
  if (!sector) return { ok: false, error: "Settore non valido" }
  const sessionId = crypto.randomUUID()
  const { error } = await supabase.from("quote_sessions").insert({
    id: sessionId,
    sector_id: sectorId,
    contact: { name: "Debug", email: "debug@localhost", phone: "" },
    answers: { q_eta: age },
    status: "draft",
  })
  if (error) return { ok: false, error: error.message }
  return { ok: true, sessionId }
}

export async function fetchSectorQuestions(sectorId: string): Promise<SectorQuestion[]> {
  return getSectorQuestions(sectorId)
}

export async function fetchQuoteResults(sessionId: string): Promise<QuoteResult[]> {
  return getQuoteResults(sessionId)
}
