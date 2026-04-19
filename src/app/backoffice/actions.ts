"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { simulateQuotes, type SimProductResult } from "@/lib/engine/simulate"

export async function runSimulation(
  sectorId: number,
  answers: Record<string, unknown>
): Promise<SimProductResult[]> {
  return simulateQuotes(sectorId, answers)
}

// ── Product ───────────────────────────────────────────────────────────────────

export async function toggleProductActive(id: number, active: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from("products").update({ is_active: active }).eq("id", id)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/backoffice/catalogo")
  revalidatePath(`/backoffice/catalogo/${id}`)
  return { ok: true }
}

// ── Eligibility rules ─────────────────────────────────────────────────────────

export async function upsertEligibilityRule(input: {
  id?: number
  product_id: number
  name: string
  condition: unknown
  action: "exclude" | "manual_quote"
  reason: string
  priority: number
}) {
  const supabase = await createClient()
  const payload = {
    product_id: input.product_id,
    name: input.name,
    condition: input.condition,
    action: input.action,
    reason: input.reason || null,
    priority: input.priority,
  }
  const { error } = input.id
    ? await supabase.from("product_eligibility_rules").update(payload).eq("id", input.id)
    : await supabase.from("product_eligibility_rules").insert(payload)
  if (error) return { ok: false, error: error.message }
  revalidatePath(`/backoffice/catalogo/${input.product_id}`)
  return { ok: true }
}

export async function deleteEligibilityRule(id: number, productId: number) {
  const supabase = await createClient()
  const { error } = await supabase.from("product_eligibility_rules").delete().eq("id", id)
  if (error) return { ok: false, error: error.message }
  revalidatePath(`/backoffice/catalogo/${productId}`)
  return { ok: true }
}

// ── Multipliers ───────────────────────────────────────────────────────────────

export async function upsertMultiplier(input: {
  id?: number
  product_id: number
  coverage_id: number | null
  name: string
  factor: number
  condition: unknown
  priority: number
}) {
  const supabase = await createClient()
  const payload = {
    product_id: input.product_id,
    coverage_id: input.coverage_id,
    name: input.name,
    factor: input.factor,
    condition: input.condition,
    priority: input.priority,
  }
  const { error } = input.id
    ? await supabase.from("product_multipliers").update(payload).eq("id", input.id)
    : await supabase.from("product_multipliers").insert(payload)
  if (error) return { ok: false, error: error.message }
  revalidatePath(`/backoffice/catalogo/${input.product_id}`)
  return { ok: true }
}

export async function deleteMultiplier(id: number, productId: number) {
  const supabase = await createClient()
  const { error } = await supabase.from("product_multipliers").delete().eq("id", id)
  if (error) return { ok: false, error: error.message }
  revalidatePath(`/backoffice/catalogo/${productId}`)
  return { ok: true }
}

// ── Questions ─────────────────────────────────────────────────────────────────

export async function updateQuestion(input: {
  id: number
  label: string
  help_text: string | null
  options: unknown
}) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("questions")
    .update({ label: input.label, help_text: input.help_text, options: input.options ?? null })
    .eq("id", input.id)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/backoffice/domande")
  return { ok: true }
}

export async function addQuestionToSector(input: {
  key: string
  label: string
  type: string
  options: unknown
  sectorId: number
  isRequired: boolean
  position: number
}) {
  const supabase = await createClient()

  // upsert into questions bank
  const { data: q, error: qErr } = await supabase
    .from("questions")
    .upsert({ key: input.key, label: input.label, type: input.type, options: input.options ?? null })
    .select("id")
    .single()
  if (qErr) return { ok: false, error: qErr.message }

  // link to sector
  const { error: sqErr } = await supabase
    .from("sector_questions")
    .upsert({
      sector_id: input.sectorId,
      question_id: q.id,
      position: input.position,
      is_required: input.isRequired,
    }, { onConflict: "sector_id,question_id" })
  if (sqErr) return { ok: false, error: sqErr.message }

  revalidatePath("/backoffice/domande")
  return { ok: true }
}
