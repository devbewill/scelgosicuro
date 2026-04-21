"use server"

import { createClient } from "@/lib/supabase/server"
import { phaseASchema } from "@/lib/schemas/quote-session"
import { generateQuotes } from "@/lib/engine/generate"
import { getSectorQuestions } from "@/lib/data/questionnaires"
import { getQuoteResults } from "@/lib/data/results"
import type { SectorQuestion, QuoteResult, Profession } from "@/lib/types"
import { getProfessions } from "@/lib/data/questionnaires"

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
  const { sectorId, professionSlug, contactName, contactEmail, contactPhone } = parsed.data

  const supabase = await createClient()

  const { data: sector } = await supabase
    .from("sectors")
    .select("id")
    .eq("id", sectorId)
    .eq("is_active", true)
    .maybeSingle()

  if (!sector) return { ok: false, error: "Settore non valido" }

  const { data: profData } = await supabase
    .from("professions")
    .select("area_medica")
    .eq("sector_id", sectorId)
    .eq("slug", professionSlug)
    .maybeSingle()

  const initialAnswers: Record<string, unknown> = { q_professione: professionSlug }
  if (profData?.area_medica) initialAnswers.q_tipo_area_medica = profData.area_medica

  const { data: inserted, error } = await supabase.from("quote_sessions").insert({
    sector_id: sectorId,
    contact: { name: contactName, email: contactEmail, phone: contactPhone },
    answers: initialAnswers,
    status: "draft",
  }).select("id").single()

  if (error) return { ok: false, error: error.message }
  return { ok: true, sessionId: String(inserted.id) }
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
  professionSlug?: string,
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
  const answers: Record<string, unknown> = {}
  if (professionSlug) {
    answers.q_professione = professionSlug
    const { data: profData } = await supabase
      .from("professions")
      .select("area_medica")
      .eq("sector_id", sectorId)
      .eq("slug", professionSlug)
      .maybeSingle()
    if (profData?.area_medica) answers.q_tipo_area_medica = profData.area_medica
  }
  const { data: inserted, error } = await supabase.from("quote_sessions").insert({
    sector_id: sectorId,
    contact: { name: "Debug", email: "debug@localhost", phone: "" },
    answers,
    status: "draft",
  }).select("id").single()
  if (error) return { ok: false, error: error.message }
  return { ok: true, sessionId: String(inserted.id) }
}

export async function fetchSectorQuestions(sectorId: string): Promise<SectorQuestion[]> {
  return getSectorQuestions(sectorId)
}

export async function fetchQuoteResults(sessionId: string): Promise<QuoteResult[]> {
  return getQuoteResults(sessionId)
}

export async function fetchProfessions(sectorId: string): Promise<Profession[]> {
  return getProfessions(sectorId)
}

export async function tuneQuote(
  sessionId: string,
  newAnswers: Record<string, unknown>
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!sessionId) return { ok: false, error: "Sessione mancante" }
  const supabase = await createClient()

  const { data: session } = await supabase
    .from("quote_sessions")
    .select("answers")
    .eq("id", sessionId)
    .maybeSingle()

  const merged = { ...((session?.answers as Record<string, unknown>) ?? {}), ...newAnswers }

  const { error: updateErr } = await supabase
    .from("quote_sessions")
    .update({ answers: merged })
    .eq("id", sessionId)
  if (updateErr) return { ok: false, error: updateErr.message }

  const { error: deleteErr } = await supabase
    .from("quote_results")
    .delete()
    .eq("session_id", sessionId)
  if (deleteErr) return { ok: false, error: deleteErr.message }

  const result = await generateQuotes(sessionId)
  if (!result.ok) return { ok: false, error: result.error }

  return { ok: true }
}

