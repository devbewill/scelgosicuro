import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { QuoteResult } from "@/lib/types"

export type { QuoteResult }

export async function getQuoteResults(sessionId: string): Promise<QuoteResult[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("quote_results")
    .select(`
      id, product_id, slot, premium_total, premium_breakdown, manual_quote, exclusion_reason, is_estimate, available_options,
      products!inner(slug, name, insurers!inner(name, logo_url))
    `)
    .eq("session_id", sessionId)
    .order("premium_total", { ascending: true, nullsFirst: false })

  if (error) throw new Error(`Failed to load quote results: ${error.message}`)

  type Row = {
    id: number
    product_id: number
    slot: "safe" | "economic" | null
    premium_total: number | null
    premium_breakdown: Record<string, unknown> | null
    manual_quote: boolean
    exclusion_reason: string | null
    is_estimate: boolean
    available_options: Record<string, unknown[]> | null
    products: {
      slug: string
      name: string
      insurers: { name: string; logo_url: string | null }
    }
  }

  return ((data ?? []) as unknown as Row[]).map((r) => ({
    id: r.id,
    productId: r.product_id,
    productName: r.products.name,
    productSlug: r.products.slug,
    insurerName: r.products.insurers.name,
    insurerLogoUrl: r.products.insurers.logo_url,
    premiumTotal: r.premium_total,
    premiumBreakdown: r.premium_breakdown,
    manualQuote: r.manual_quote,
    exclusionReason: r.exclusion_reason,
    slot: r.slot,
    isEstimate: r.is_estimate,
    availableOptions: r.available_options,
  }))
}

export async function countQuoteResults(sessionId: string): Promise<number> {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from("quote_results")
    .select("id", { count: "exact", head: true })
    .eq("session_id", sessionId)
  if (error) throw new Error(`Failed to count results: ${error.message}`)
  return count ?? 0
}
