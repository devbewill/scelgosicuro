import "server-only"

import { createClient } from "@/lib/supabase/server"

export type QuoteResult = {
  id: string
  productId: string
  productName: string
  productCode: string
  insurerName: string
  insurerLogoUrl: string | null
  annualPrice: number | null
  monthlyPrice: number | null
  excluded: boolean
  excludedReason: string | null
  slot: "safe" | "economic" | null
}

export async function getQuoteResults(sessionId: string): Promise<QuoteResult[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("quote_results")
    .select(
      `id, product_id, annual_price, monthly_price, excluded, excluded_reason, slot,
       products!inner(code, name, insurers!inner(name, logo_url))`
    )
    .eq("session_id", sessionId)
    .order("annual_price", { ascending: true, nullsFirst: false })

  if (error) throw new Error(`Failed to load quote results: ${error.message}`)

  type Row = {
    id: string
    product_id: string
    annual_price: number | null
    monthly_price: number | null
    excluded: boolean
    excluded_reason: string | null
    slot: "safe" | "economic" | null
    products: {
      code: string
      name: string
      insurers: { name: string; logo_url: string | null }
    }
  }

  return ((data ?? []) as unknown as Row[]).map((r) => ({
    id: r.id,
    productId: r.product_id,
    productName: r.products.name,
    productCode: r.products.code,
    insurerName: r.products.insurers.name,
    insurerLogoUrl: r.products.insurers.logo_url,
    annualPrice: r.annual_price,
    monthlyPrice: r.monthly_price,
    excluded: r.excluded,
    excludedReason: r.excluded_reason,
    slot: r.slot,
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
