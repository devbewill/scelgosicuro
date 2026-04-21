"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

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

// ── Sector Questions ──────────────────────────────────────────────────────────

export async function upsertSectorQuestion(input: {
  id?: number
  sector_id: number
  key: string
  label: string
  help_text: string | null
  type: string
  options: unknown
  position: number
  is_required: boolean
  visible_if?: unknown
}) {
  const supabase = await createClient()
  const payload = {
    sector_id: input.sector_id,
    key: input.key,
    label: input.label,
    help_text: input.help_text || null,
    type: input.type,
    options: input.options ?? null,
    position: input.position,
    is_required: input.is_required,
    visible_if: input.visible_if ?? null,
  }
  const { error } = input.id
    ? await supabase.from("sector_questions").update(payload).eq("id", input.id)
    : await supabase.from("sector_questions").insert(payload)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/backoffice/domande")
  return { ok: true }
}

export async function deleteSectorQuestion(id: number) {
  const supabase = await createClient()
  const { error } = await supabase.from("sector_questions").delete().eq("id", id)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/backoffice/domande")
  return { ok: true }
}

// ── Product Questions ─────────────────────────────────────────────────────────

export async function upsertProductQuestion(input: {
  id?: number
  product_id: number
  key: string
  label: string
  help_text: string | null
  type: string
  options: unknown
  position: number
  is_required: boolean
  phase: "eligibility" | "pricing" | "addon"
  visible_if?: unknown
}) {
  const supabase = await createClient()
  const payload = {
    product_id: input.product_id,
    key: input.key,
    label: input.label,
    help_text: input.help_text || null,
    type: input.type,
    options: input.options ?? null,
    position: input.position,
    is_required: input.is_required,
    phase: input.phase,
    visible_if: input.visible_if ?? null,
  }
  const { error } = input.id
    ? await supabase.from("product_questions").update(payload).eq("id", input.id)
    : await supabase.from("product_questions").insert(payload)
  if (error) return { ok: false, error: error.message }
  revalidatePath(`/backoffice/catalogo/${input.product_id}`)
  return { ok: true }
}

export async function deleteProductQuestion(id: number, productId: number) {
  const supabase = await createClient()
  const { error } = await supabase.from("product_questions").delete().eq("id", id)
  if (error) return { ok: false, error: error.message }
  revalidatePath(`/backoffice/catalogo/${productId}`)
  return { ok: true }
}
