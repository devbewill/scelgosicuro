import "server-only"

import { createClient } from "@/lib/supabase/server"
import { evalCondition, evalConditionTriState, type Condition } from "@/lib/engine/operators"

export type GenerateResult =
  | { ok: true; resultCount: number; userScore: number; mode: "base" | "refined" }
  | { ok: false; error: string }

export async function generateQuotes(
  sessionId: string,
  opts?: { mode?: "base" | "refined" }
): Promise<GenerateResult> {
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

  // ── inject profession-derived synthetic answers ───────────────────────────
  if (typeof answers.q_professione === "string" && !("q_tipo_area_medica" in answers)) {
    const { data: prof } = await supabase
      .from("professions")
      .select("area_medica")
      .eq("sector_id", session.sector_id)
      .eq("slug", answers.q_professione)
      .maybeSingle()
    if (prof?.area_medica) answers.q_tipo_area_medica = prof.area_medica
  }

  // ── step 1: products for this sector ─────────────────────────────────────
  const { data: productsRaw, error: productsErr } = await supabase
    .from("products")
    .select("id, slug, name")
    .eq("sector_id", session.sector_id)
    .eq("is_active", true)
  if (productsErr) return { ok: false, error: productsErr.message }

  const products = productsRaw ?? []
  if (products.length === 0) return { ok: true, resultCount: 0, userScore: 0, mode: "base" }
  const productIds = products.map((p) => p.id)

  // ── load all data in parallel ─────────────────────────────────────────────
  const [eligRes, covRes, multRes, addonRes, pqRes, sqRes] = await Promise.all([
    supabase.from("product_eligibility_rules")
      .select("product_id, name, condition, action, reason, priority")
      .in("product_id", productIds)
      .order("priority", { ascending: true }),
    supabase.from("product_coverages")
      .select("id, product_id, key, is_mandatory, available_if, dimensions")
      .in("product_id", productIds),
    supabase.from("product_multipliers")
      .select("product_id, coverage_id, name, factor, condition, priority")
      .in("product_id", productIds)
      .order("priority", { ascending: true }),
    supabase.from("product_addons")
      .select("id, product_id, key, name, pricing_mode, flat_premium, triggered_by, available_if, dimensions")
      .in("product_id", productIds),
    supabase.from("product_questions")
      .select("product_id, key")
      .in("product_id", productIds),
    supabase.from("sector_questions")
      .select("key, is_required")
      .eq("sector_id", session.sector_id),
  ])

  if (eligRes.error)  return { ok: false, error: eligRes.error.message }
  if (covRes.error)   return { ok: false, error: covRes.error.message }
  if (multRes.error)  return { ok: false, error: multRes.error.message }
  if (addonRes.error) return { ok: false, error: addonRes.error.message }
  if (pqRes.error)    return { ok: false, error: pqRes.error.message }
  if (sqRes.error)    return { ok: false, error: sqRes.error.message }

  const nonMandatoryKeys = new Set(
    (sqRes.data ?? []).filter((q) => !q.is_required).map((q) => q.key as string)
  )

  // ── auto-detect mode ──────────────────────────────────────────────────────
  const allProductQuestionKeys = new Set((pqRes.data ?? []).map((r) => r.key as string))
  const allOptionalKeys = new Set([...allProductQuestionKeys, ...nonMandatoryKeys])
  const mode: "base" | "refined" = opts?.mode
    ?? ([...allOptionalKeys].every((k) => k in answers) ? "refined" : "base")

  const coverages = covRes.data ?? []
  const coverageIds = coverages.map((c) => c.id)

  const [rateRes, addonRateRes] = await Promise.all([
    supabase.from("product_rate_rows")
      .select("coverage_id, dimension_values, premium, manual_quote")
      .in("coverage_id", coverageIds.length ? coverageIds : [-1]),
    supabase.from("product_addon_rate_rows")
      .select("addon_id, dimension_values, premium, manual_quote")
      .in("addon_id",
        ((addonRes.data ?? []) as Array<{ id: number; pricing_mode: string }>)
          .filter((a) => a.pricing_mode === "rate_table")
          .map((a) => a.id)
          .concat([-1])
      ),
  ])
  if (rateRes.error)     return { ok: false, error: rateRes.error.message }
  if (addonRateRes.error) return { ok: false, error: addonRateRes.error.message }

  const userScore = 0
  const featuredSlot: Record<"safe" | "economic", number | null> = { safe: null, economic: null }

  // ── indexes ───────────────────────────────────────────────────────────────
  const eligByProduct  = groupBy(eligRes.data  ?? [], (r) => r.product_id as number)
  const covByProduct   = groupBy(coverages,            (r) => r.product_id as number)
  const ratesByCov     = groupBy(rateRes.data  ?? [], (r) => r.coverage_id as number)
  const multByProduct  = groupBy(multRes.data  ?? [], (r) => r.product_id as number)
  const multByCov      = groupBy(multRes.data  ?? [], (r) => r.coverage_id as number | null)
  const addonByProduct = groupBy(addonRes.data ?? [], (r) => r.product_id as number)
  const addonRateByAddon = groupBy(addonRateRes.data ?? [], (r) => r.addon_id as number)

  // ── steps 2–3–6: per product ──────────────────────────────────────────────
  type ResultRow = {
    session_id: string
    product_id: number
    slot: "safe" | "economic" | null
    premium_total: number | null
    premium_breakdown: Record<string, unknown> | null
    manual_quote: boolean
    exclusion_reason: string | null
    is_estimate: boolean
    available_options: Record<string, unknown[]> | null
  }
  const rows: ResultRow[] = []

  for (const product of products) {
    // ── step 2: eligibility ──────────────────────────────────────────────────
    let exclusionReason: string | null = null
    let isManualQuote = false

    for (const rule of eligByProduct.get(product.id) ?? []) {
      if (mode === "refined") {
        if (evalCondition(rule.condition as Condition, answers)) {
          exclusionReason = rule.reason ?? (rule.action === "manual_quote" ? "Preventivo su misura" : "Non eleggibile")
          isManualQuote   = rule.action === "manual_quote"
          break
        }
      } else {
        // base mode: skip rules that depend on unanswered product questions
        const ts = evalConditionTriState(rule.condition as Condition, answers)
        if (ts === "true") {
          exclusionReason = rule.reason ?? (rule.action === "manual_quote" ? "Preventivo su misura" : "Non eleggibile")
          isManualQuote   = rule.action === "manual_quote"
          break
        }
        // 'unknown' → skip; 'false' → rule does not fire
      }
    }

    if (exclusionReason && !isManualQuote) {
      rows.push({
        session_id: sessionId, product_id: product.id, slot: null,
        premium_total: null, premium_breakdown: null,
        manual_quote: false, exclusion_reason: exclusionReason, is_estimate: false,
        available_options: null,
      })
      continue
    }

    // ── step 3: pricing ──────────────────────────────────────────────────────
    let premiumTotal: number | null = null
    let isEstimate = false

    type CovDetail = {
      base: number
      dimensions: Record<string, unknown>
      multipliers: { name: string; factor: number }[]
      combined_factor: number
      subtotal: number
    }
    type AddonDetail = { key: string; name: string; premium: number | null; mode: string; manual: boolean }
    const covDetails: Record<string, CovDetail> = {}
    const addonDetails: AddonDetail[] = []

    if (!isManualQuote) {
      let allPriced = true

      for (const cov of (covByProduct.get(product.id) ?? [])) {
        if (!cov.is_mandatory) continue
        if (cov.available_if && !evalCondition(cov.available_if as Condition, answers)) continue

        const rateRows = ratesByCov.get(cov.id) ?? []

        let match: typeof rateRows[0] | undefined
        if (mode === "refined") {
          match = rateRows.find((r) => evalCondition(r.dimension_values as Condition, answers))
        } else {
          // base mode: prefer exact match, fallback to cheapest partial match
          const exact = rateRows.find((r) =>
            evalConditionTriState(r.dimension_values as Condition, answers) === "true"
          )
          if (exact) {
            match = exact
          } else {
            const candidates = rateRows.filter((r) =>
              evalConditionTriState(r.dimension_values as Condition, answers) !== "false"
            )
            if (candidates.length > 0) {
              match = candidates.reduce((best, r) =>
                (Number(r.premium) < Number(best.premium) ? r : best)
              )
              isEstimate = true
            }
          }
        }

        if (!match || match.manual_quote || match.premium === null) {
          if (match?.manual_quote) { isManualQuote = true; exclusionReason = "Preventivo su misura" }
          allPriced = false
          break
        }

        // multipliers: in base mode only apply those that evaluate to 'true'
        const appliedMult: { name: string; factor: number }[] = []
        let factor = 1

        for (const m of (multByProduct.get(product.id) ?? [])) {
          if (m.coverage_id !== null) continue
          const fires = mode === "refined"
            ? evalCondition(m.condition as Condition, answers)
            : evalConditionTriState(m.condition as Condition, answers) === "true"
          if (fires) {
            factor *= Number(m.factor)
            appliedMult.push({ name: m.name as string, factor: Number(m.factor) })
          }
        }
        for (const m of (multByCov.get(cov.id) ?? [])) {
          const fires = mode === "refined"
            ? evalCondition(m.condition as Condition, answers)
            : evalConditionTriState(m.condition as Condition, answers) === "true"
          if (fires) {
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

      // addons
      if (premiumTotal !== null) {
        for (const addon of (addonByProduct.get(product.id) ?? [])) {
          if (!addon.triggered_by) continue

          // base mode: skip addons with indeterminate trigger
          if (mode === "base") {
            const ts = evalConditionTriState(addon.triggered_by as Condition, answers)
            if (ts !== "true") continue
          } else {
            if (!evalCondition(addon.triggered_by as Condition, answers)) continue
          }
          if (addon.available_if && !evalCondition(addon.available_if as Condition, answers)) continue

          let addonPremium: number | null = null
          if (addon.pricing_mode === "flat" && addon.flat_premium !== null) {
            addonPremium = Number(addon.flat_premium)
          } else if (addon.pricing_mode === "rate_table") {
            const addonRows = addonRateByAddon.get(addon.id) ?? []
            let aMatch: typeof addonRows[0] | undefined
            aMatch = addonRows.find((r) => evalConditionTriState(r.dimension_values as Condition, answers) === "true")
            if (!aMatch) {
              const candidates = addonRows.filter((r) => evalConditionTriState(r.dimension_values as Condition, answers) !== "false")
              if (candidates.length > 0) {
                aMatch = candidates.reduce((best, r) => Number(r.premium) < Number(best.premium) ? r : best)
                isEstimate = true
              }
            }
            if (aMatch) {
              if (!aMatch.manual_quote && aMatch.premium !== null) {
                addonPremium = Number(aMatch.premium)
              } else if (aMatch.manual_quote) {
                addonDetails.push({ key: addon.key as string, name: addon.name as string, premium: null, mode: addon.pricing_mode as string, manual: true })
                continue
              }
            }
          }
          if (addonPremium !== null) {
            addonDetails.push({ key: addon.key as string, name: addon.name as string, premium: addonPremium, mode: addon.pricing_mode as string, manual: false })
            premiumTotal = round2(premiumTotal + addonPremium)
          }
        }
      }
    }

    const breakdown = Object.keys(covDetails).length || addonDetails.length
      ? { coverages: covDetails, addons: addonDetails, total: premiumTotal, is_estimate: isEstimate }
      : null

    // ── available_options: collect distinct values for non-mandatory sector keys ──
    let availableOptions: Record<string, unknown[]> | null = null
    if (!exclusionReason || isManualQuote) {
      const opts: Record<string, Set<unknown>> = {}

      // from rate_rows dimensions
      for (const cov of (covByProduct.get(product.id) ?? [])) {
        const dims = (cov.dimensions ?? []) as string[]
        for (const dim of dims) {
          if (!nonMandatoryKeys.has(dim)) continue
          if (!opts[dim]) opts[dim] = new Set()
          for (const row of (ratesByCov.get(cov.id) ?? [])) {
            const val = (row.dimension_values as Record<string, unknown>)[dim]
            if (val !== undefined) opts[dim].add(val)
          }
        }
      }

      // from multiplier conditions (simple equals only)
      for (const m of (multByProduct.get(product.id) ?? [])) {
        const cond = m.condition as Record<string, unknown>
        if (cond.op === "equals" && typeof cond.key === "string" && nonMandatoryKeys.has(cond.key)) {
          if (!opts[cond.key]) opts[cond.key] = new Set()
          opts[cond.key].add(cond.value)
        }
      }

      // from addon triggered_by conditions (simple equals only)
      for (const addon of (addonByProduct.get(product.id) ?? [])) {
        if (!addon.triggered_by) continue
        const cond = addon.triggered_by as Record<string, unknown>
        if (cond.op === "equals" && typeof cond.key === "string" && nonMandatoryKeys.has(cond.key)) {
          if (!opts[cond.key]) opts[cond.key] = new Set()
          opts[cond.key].add(cond.value)
        }
      }

      if (Object.keys(opts).length > 0) {
        availableOptions = Object.fromEntries(
          Object.entries(opts).map(([k, s]) => [k, [...s].sort((a, b) => {
            if (typeof a === "number" && typeof b === "number") return a - b
            return String(a).localeCompare(String(b))
          })])
        )
      }
    }

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
      is_estimate: isEstimate,
      available_options: availableOptions,
    })
  }

  // fallback slots
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
    for (const r of rows) {
      r.slot =
        featuredSlot.safe === r.product_id ? "safe" :
        featuredSlot.economic === r.product_id ? "economic" : r.slot
    }
  }

  // ── step 6: persist ───────────────────────────────────────────────────────
  await supabase.from("quote_results").delete().eq("session_id", sessionId)
  if (rows.length > 0) {
    const { error: insErr } = await supabase.from("quote_results").insert(rows)
    if (insErr) return { ok: false, error: insErr.message }
  }

  await supabase.from("quote_sessions")
    .update({ user_score: userScore, status: "completed" })
    .eq("id", sessionId)

  return {
    ok: true,
    resultCount: rows.filter((r) => !r.exclusion_reason || r.manual_quote).length,
    userScore,
    mode,
  }
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
