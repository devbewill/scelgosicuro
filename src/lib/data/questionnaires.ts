import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { SectorQuestion, ProductQuestion, Profession, QuoteSession } from "@/lib/types"

export async function getSectorQuestions(sectorId: string): Promise<SectorQuestion[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("sector_questions")
    .select("id, sector_id, key, label, help_text, type, options, validation, position, section, is_required, visible_if")
    .eq("sector_id", sectorId)
    .order("position", { ascending: true })

  if (error) throw new Error(`Failed to load sector questions: ${error.message}`)

  return ((data ?? []) as Array<{
    id: number
    sector_id: number
    key: string
    label: string
    help_text: string | null
    type: string
    options: unknown
    validation: unknown
    position: number
    section: string | null
    is_required: boolean
    visible_if: Record<string, unknown> | null
  }>).map((row) => ({
    id: row.id,
    sectorId: row.sector_id,
    key: row.key,
    label: row.label,
    helpText: row.help_text,
    type: row.type as SectorQuestion["type"],
    options: row.options as SectorQuestion["options"],
    validation: row.validation as SectorQuestion["validation"],
    position: row.position,
    section: row.section,
    isRequired: row.is_required,
    visibleIf: row.visible_if,
  }))
}

export async function getProductQuestions(productIds: number[]): Promise<ProductQuestion[]> {
  if (productIds.length === 0) return []
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("product_questions")
    .select("id, product_id, key, label, help_text, type, options, validation, position, section, is_required, visible_if, phase")
    .in("product_id", productIds)
    .order("position", { ascending: true })

  if (error) throw new Error(`Failed to load product questions: ${error.message}`)

  return ((data ?? []) as Array<{
    id: number
    product_id: number
    key: string
    label: string
    help_text: string | null
    type: string
    options: unknown
    validation: unknown
    position: number
    section: string | null
    is_required: boolean
    visible_if: Record<string, unknown> | null
    phase: string
  }>).map((row) => ({
    id: row.id,
    productId: row.product_id,
    key: row.key,
    label: row.label,
    helpText: row.help_text,
    type: row.type as ProductQuestion["type"],
    options: row.options as ProductQuestion["options"],
    validation: row.validation as ProductQuestion["validation"],
    position: row.position,
    section: row.section,
    isRequired: row.is_required,
    visibleIf: row.visible_if,
    phase: row.phase as ProductQuestion["phase"],
  }))
}

export async function getProfessions(sectorId: string): Promise<Profession[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("professions")
    .select("id, sector_id, slug, name, display_order, is_active")
    .eq("sector_id", sectorId)
    .eq("is_active", true)
    .order("display_order", { ascending: true })

  if (error) throw new Error(`Failed to load professions: ${error.message}`)

  return ((data ?? []) as Array<{
    id: number
    sector_id: number
    slug: string
    name: string
    display_order: number
    is_active: boolean
  }>).map((row) => ({
    id: row.id,
    sectorId: row.sector_id,
    slug: row.slug,
    name: row.name,
    displayOrder: row.display_order,
    isActive: row.is_active,
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
