import "server-only"

import { createClient } from "@/lib/supabase/server"
import { evalCondition, type Condition } from "@/lib/engine/operators"

export type GenerateResult =
  | { ok: true; resultCount: number; userScore: number }
  | { ok: false; error: string }

export async function generateQuotes(sessionId: string): Promise<GenerateResult> {
  const supabase = await createClient()

  // ── load session ──────────────────────────────────────────────────────────
  const { data: session, error: sessionErr } = await supabase
    .from("quote_sessions")
    .select("id, sector_id, answers")
    .eq("id", sessionId)
    .maybeSingle()
  if (sessionErr) return { ok: false, error: sessionErr.message }
  if (!session)   return { ok: false, error: "Sessione non trovata" }

  const answers = (session.answers ?? {}) as Record<string, unknown>

  // ── step 1: products for this sector ─────────────────────────────────────
  const { data: productsRaw, error: productsErr } = await supabase
    .from("products")
    .select("id, slug, name")
    .eq("sector_id", session.sector_id)
    .eq("is_active", true)
  if (productsErr) return { ok: false, error: productsErr.message }

  const products = productsRaw ?? []
  if (products.length === 0) return { ok: true, resultCount: 0, userScore: 0 }
  const productIds = products.map((p) => p.id)

  // ── load all pricing data in parallel ────────────────────────────────────
  const [eligRes, covRes, rateRes, multRes, addonRes] = await Promise.all([
    supabase.from("product_eligibility_rules")
      .select("product_id, name, condition, action, reason, priority")
      .in("product_id", productIds)
      .order("priority", { ascending: true }),
    supabase.from("product_coverages")
      .select("id, product_id, key, is_mandatory, available_if, dimensions")
      .in("product_id", productIds),
    supabase.from("product_rate_rows")
      .select("coverage_id, dimension_values, premium, manual_quote")
      .in("coverage_id",
        // populated after covRes — placeholder; refetched below
        [-1]
      ),
    supabase.from("product_multipliers")
      .select("product_id, coverage_id, name, factor, condition, priority")
      .in("product_id", productIds)
      .order("priority", { ascending: true }),
    supabase.from("product_addons")
      .select("id, product_id, key, name, pricing_mode, flat_premium, triggered_by, available_if, dimensions")
      .in("product_id", productIds),
  ])

  if (eligRes.error)  return { ok: false, error: eligRes.error.message }
  if (covRes.error)   return { ok: false, error: covRes.error.message }
  if (multRes.error)  return { ok: false, error: multRes.error.message }
  if (addonRes.error) return { ok: false, error: addonRes.error.message }

  const coverages = covRes.data ?? []
  const coverageIds = coverages.map((c) => c.id)

  // now fetch rate rows and addon rate rows properly
  const [rateRes2, addonRateRes] = await Promise.all([
    supabase.from("product_rate_rows")
      .select("coverage_id, dimension_values, premium, manual_quote")
      .in("coverage_id", coverageIds.length ? coverageIds : [-1]),
    supabase.from("product_addon_rate_rows")
      .select("addon_id, dimension_values, premium, manual_quote")
      .in("addon_id",
        ((addonRes.data ?? []) as Array<{id:string;pricing_mode:string}>)
          .filter((a) => a.pricing_mode === "rate_table")
          .map((a) => a.id as unknown as number)
          .concat([-1])
      ),
  ])
  if (rateRes2.error)     return { ok: false, error: rateRes2.error.message }
  if (addonRateRes.error) return { ok: false, error: addonRateRes.error.message }
  void rateRes // unused placeholder fetch

  // ── step 4: scoring ───────────────────────────────────────────────────────
  const { data: scoringRaw, error: scoringErr } = await supabase
    .from("sector_scoring_rules")
    .select("condition, score_delta")
    .eq("sector_id", session.sector_id)
  if (scoringErr) return { ok: false, error: scoringErr.message }

  let userScore = 0
  for (const rule of scoringRaw ?? []) {
    if (evalCondition(rule.condition as Condition, answers)) {
      userScore += Number(rule.score_delta)
    }
  }

  // ── step 5: recommendations ───────────────────────────────────────────────
  const { data: recsRaw, error: recsErr } = await supabase
    .from("sector_product_recommendations")
    .select("product_id, slot, min_score, max_score, priority")
    .eq("sector_id", session.sector_id)
    .order("priority", { ascending: true })
  if (recsErr) return { ok: false, error: recsErr.message }

  const featuredSlot: Record<"safe" | "economic", string | null> = { safe: null, economic: null }
  for (const r of recsRaw ?? []) {
    const slot = r.slot as "safe" | "economic"
    if (featuredSlot[slot]) continue
    const lo = r.min_score ?? -Infinity
    const hi = r.max_score ?? Infinity
    if (userScore >= lo && userScore <= hi) featuredSlot[slot] = r.product_id
  }
  // fallback: if no recommendations, will assign slots after pricing (see below)

  // ── index by product / coverage ───────────────────────────────────────────
  const eligByProduct  = groupBy(eligRes.data  ?? [], (r) => r.product_id as string)
  const covByProduct   = groupBy(coverages,            (r) => r.product_id as string)
  const ratesByCov     = groupBy(rateRes2.data  ?? [], (r) => r.coverage_id as string)
  const multByProduct  = groupBy(multRes.data   ?? [], (r) => r.product_id as string)
  const multByCov      = groupBy(multRes.data   ?? [], (r) => r.coverage_id as string | null)
  const addonByProduct = groupBy(addonRes.data  ?? [], (r) => r.product_id as string)
  const addonRateByAddon = groupBy(addonRateRes.data ?? [], (r) => r.addon_id as string)

  // ── steps 2–3–6: per product ──────────────────────────────────────────────
  type ResultRow = {
    session_id: string
    product_id: string
    slot: "safe" | "economic" | null
    premium_total: number | null
    premium_breakdown: Record<string, unknown> | null
    manual_quote: boolean
    exclusion_reason: string | null
  }
  const rows: ResultRow[] = []

  for (const product of products) {
    // step 2 – eligibility
    let exclusionReason: string | null = null
    let isManualQuote = false

    for (const rule of eligByProduct.get(product.id) ?? []) {
      if (evalCondition(rule.condition as Condition, answers)) {
        exclusionReason = rule.reason ?? (rule.action === "manual_quote" ? "Preventivo su misura" : "Non eleggibile")
        isManualQuote   = rule.action === "manual_quote"
        break
      }
    }

    if (exclusionReason && !isManualQuote) {
      rows.push({ session_id: sessionId, product_id: product.id, slot: null, premium_total: null, premium_breakdown: null, manual_quote: false, exclusion_reason: exclusionReason })
      continue
    }

    // step 3 – pricing
    let premiumTotal: number | null = null

    type CovDetail = {
      base: number
      dimensions: Record<string, unknown>
      multipliers: { name: string; factor: number }[]
      combined_factor: number
      subtotal: number
    }
    type AddonDetail = { key: string; name: string; premium: number; mode: string }
    const covDetails: Record<string, CovDetail> = {}
    const addonDetails: AddonDetail[] = []

    if (!isManualQuote) {
      let allPriced = true

      for (const cov of (covByProduct.get(product.id) ?? [])) {
        if (!cov.is_mandatory) continue
        if (cov.available_if && !evalCondition(cov.available_if as Condition, answers)) continue

        const rateRows = ratesByCov.get(cov.id) ?? []
        const match = rateRows.find((r) =>
          evalCondition(r.dimension_values as Condition, answers)
        )

        if (!match || match.manual_quote || match.premium === null) {
          if (match?.manual_quote) { isManualQuote = true; exclusionReason = "Preventivo su misura" }
          allPriced = false
          break
        }

        // collect applied multipliers with detail
        const appliedMult: { name: string; factor: number }[] = []
        let factor = 1
        for (const m of (multByProduct.get(product.id) ?? [])) {
          if (m.coverage_id !== null) continue
          if (evalCondition(m.condition as Condition, answers)) {
            factor *= Number(m.factor)
            appliedMult.push({ name: m.name as string, factor: Number(m.factor) })
          }
        }
        for (const m of (multByCov.get(cov.id) ?? [])) {
          if (evalCondition(m.condition as Condition, answers)) {
            factor *= Number(m.factor)
            appliedMult.push({ name: m.name as string, factor: Number(m.factor) })
          }
        }

        const base = Number(match.premium)
        const subtotal = round2(base * factor)
        covDetails[cov.key] = {
          base,
          dimensions: match.dimension_values as Record<string, unknown>,
          multipliers: appliedMult,
          combined_factor: round2(factor),
          subtotal,
        }
        premiumTotal = round2((premiumTotal ?? 0) + subtotal)
      }

      if (!allPriced && !isManualQuote) premiumTotal = null

      // addons auto-triggered
      if (premiumTotal !== null) {
        for (const addon of (addonByProduct.get(product.id) ?? [])) {
          if (!addon.triggered_by || !evalCondition(addon.triggered_by as Condition, answers)) continue
          if (addon.available_if && !evalCondition(addon.available_if as Condition, answers)) continue

          let addonPremium: number | null = null
          if (addon.pricing_mode === "flat" && addon.flat_premium !== null) {
            addonPremium = Number(addon.flat_premium)
          } else if (addon.pricing_mode === "rate_table") {
            const aMatch = (addonRateByAddon.get(addon.id) ?? []).find((r) =>
              evalCondition(r.dimension_values as Condition, answers)
            )
            if (aMatch && !aMatch.manual_quote && aMatch.premium !== null) {
              addonPremium = Number(aMatch.premium)
            }
          }
          if (addonPremium !== null) {
            addonDetails.push({ key: addon.key as string, name: addon.name as string, premium: addonPremium, mode: addon.pricing_mode as string })
            premiumTotal = round2(premiumTotal + addonPremium)
          }
        }
      }
    }

    const breakdown = Object.keys(covDetails).length || addonDetails.length
      ? { coverages: covDetails, addons: addonDetails, total: premiumTotal }
      : null

    const slot: "safe" | "economic" | null =
      featuredSlot.safe === product.id ? "safe" :
      featuredSlot.economic === product.id ? "economic" : null

    rows.push({
      session_id: sessionId,
      product_id: product.id,
      slot,
      premium_total: isManualQuote ? null : premiumTotal,
      premium_breakdown: breakdown,
      manual_quote: isManualQuote,
      exclusion_reason: exclusionReason,
    })
  }

  // fallback slots when no recommendations configured:
  // cheapest priced product → economic, most expensive → safe
  if (!featuredSlot.safe && !featuredSlot.economic) {
    const priced = rows
      .filter((r) => r.premium_total !== null && !r.exclusion_reason && !r.manual_quote)
      .sort((a, b) => (a.premium_total ?? 0) - (b.premium_total ?? 0))
    if (priced.length === 1) {
      featuredSlot.safe = priced[0].product_id
    } else if (priced.length >= 2) {
      featuredSlot.economic = priced[0].product_id
      featuredSlot.safe     = priced[priced.length - 1].product_id
    }
    // re-apply slots
    for (const r of rows) {
      r.slot =
        featuredSlot.safe === r.product_id ? "safe" :
        featuredSlot.economic === r.product_id ? "economic" : r.slot
    }
  }

  // step 6 – persist
  await supabase.from("quote_results").delete().eq("session_id", sessionId)
  if (rows.length > 0) {
    const { error: insErr } = await supabase.from("quote_results").insert(rows)
    if (insErr) return { ok: false, error: insErr.message }
  }

  await supabase.from("quote_sessions")
    .update({ user_score: userScore, status: "completed" })
    .eq("id", sessionId)

  return { ok: true, resultCount: rows.filter((r) => !r.exclusion_reason || r.manual_quote).length, userScore }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function groupBy<T, K>(arr: T[], key: (t: T) => K): Map<K, T[]> {
  const m = new Map<K, T[]>()
  for (const it of arr) {
    const k = key(it)
    const existing = m.get(k)
    if (existing) existing.push(it)
    else m.set(k, [it])
  }
  return m
}
