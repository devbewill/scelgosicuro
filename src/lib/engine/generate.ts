import "server-only"

import { createClient } from "@/lib/supabase/server"
import { matchRule, type RuleInput, type RuleOperator } from "@/lib/engine/operators"

export type GenerateResult =
  | { ok: true; resultCount: number; userScore: number }
  | { ok: false; error: string }

type ProductRow = {
  id: string
  product_type_id: string
  code: string
  name: string
  status: string
}

type EligibilityRow = {
  product_id: string
  question_key: string
  operator: RuleOperator
  expected_value: string | null
  expected_values: string[] | null
  range_min: number | null
  range_max: number | null
  exclusion_reason: string | null
}

type BasePriceRow = {
  product_id: string
  question_key: string
  answer_value: string | null
  base_price: number
  is_default: boolean
}

type MultiplierRow = {
  product_id: string
  question_key: string
  answer_value: string
  multiplier: number
}

type BandRow = {
  product_id: string
  question_key: string
  calculation: "direct" | "years_since" | "band"
  range_min: number | null
  range_max: number | null
  multiplier: number
}

type AddonPriceRow = {
  product_id: string
  question_key: string
  trigger_value: string
  price_fixed: number | null
  price_percent: number | null
}

type ScoringRow = {
  activity_id: string | null
  product_type_id: string | null
  question_key: string
  operator: RuleOperator
  expected_value: string | null
  expected_values: string[] | null
  range_min: number | null
  range_max: number | null
  score_delta: number
}

type RecommendationRow = {
  product_id: string
  slot: "safe" | "economic"
  score_min: number
  score_max: number
  priority: number
}

export async function generateQuotes(
  sessionId: string
): Promise<GenerateResult> {
  const supabase = await createClient()

  const { data: session, error: sessionErr } = await supabase
    .from("quote_sessions")
    .select("id, activity_id, answers")
    .eq("id", sessionId)
    .maybeSingle()
  if (sessionErr) return { ok: false, error: sessionErr.message }
  if (!session) return { ok: false, error: "Sessione non trovata" }

  const answers = (session.answers ?? {}) as Record<string, unknown>

  // Step 1: eligible products for this activity (only active).
  const { data: linkRows, error: linkErr } = await supabase
    .from("activity_products")
    .select("product_id")
    .eq("activity_id", session.activity_id)
  if (linkErr) return { ok: false, error: linkErr.message }

  const productIds = (linkRows ?? []).map((r) => r.product_id)
  if (productIds.length === 0) {
    return { ok: true, resultCount: 0, userScore: 0 }
  }

  const { data: productsRaw, error: productsErr } = await supabase
    .from("products")
    .select("id, product_type_id, code, name, status")
    .in("id", productIds)
    .eq("status", "active")
  if (productsErr) return { ok: false, error: productsErr.message }
  const products = (productsRaw ?? []) as ProductRow[]
  if (products.length === 0) {
    return { ok: true, resultCount: 0, userScore: 0 }
  }
  const activeIds = products.map((p) => p.id)

  // Step 2: eligibility rules.
  const { data: elig, error: eligErr } = await supabase
    .from("product_eligibility_rules")
    .select(
      "product_id, question_key, operator, expected_value, expected_values, range_min, range_max, exclusion_reason"
    )
    .in("product_id", activeIds)
  if (eligErr) return { ok: false, error: eligErr.message }
  const eligByProduct = groupBy(elig as EligibilityRow[], (r) => r.product_id)

  // Step 3: pricing inputs.
  const [basePrices, multipliers, bands, addonPrices] = await Promise.all([
    supabase
      .from("product_base_prices")
      .select("product_id, question_key, answer_value, base_price, is_default")
      .in("product_id", activeIds),
    supabase
      .from("product_multipliers")
      .select("product_id, question_key, answer_value, multiplier")
      .in("product_id", activeIds),
    supabase
      .from("product_multiplier_bands")
      .select(
        "product_id, question_key, calculation, range_min, range_max, multiplier"
      )
      .in("product_id", activeIds),
    supabase
      .from("product_addon_prices")
      .select("product_id, question_key, trigger_value, price_fixed, price_percent")
      .in("product_id", activeIds),
  ])
  if (basePrices.error) return { ok: false, error: basePrices.error.message }
  if (multipliers.error) return { ok: false, error: multipliers.error.message }
  if (bands.error) return { ok: false, error: bands.error.message }
  if (addonPrices.error) return { ok: false, error: addonPrices.error.message }

  const baseByProduct = groupBy(
    (basePrices.data ?? []) as BasePriceRow[],
    (r) => r.product_id
  )
  const multByProduct = groupBy(
    (multipliers.data ?? []) as MultiplierRow[],
    (r) => r.product_id
  )
  const bandByProduct = groupBy(
    (bands.data ?? []) as BandRow[],
    (r) => r.product_id
  )
  const addonByProduct = groupBy(
    (addonPrices.data ?? []) as AddonPriceRow[],
    (r) => r.product_id
  )

  // Step 4: scoring.
  const productTypeIds = Array.from(new Set(products.map((p) => p.product_type_id)))
  const { data: scoringRaw, error: scoringErr } = await supabase
    .from("scoring_rules")
    .select(
      "activity_id, product_type_id, question_key, operator, expected_value, expected_values, range_min, range_max, score_delta"
    )
    .or(
      `activity_id.eq.${session.activity_id},product_type_id.in.(${productTypeIds.join(",")})`
    )
  if (scoringErr) return { ok: false, error: scoringErr.message }
  const scoring = (scoringRaw ?? []) as ScoringRow[]

  let userScore = 0
  for (const rule of scoring) {
    const answer = answers[rule.question_key]
    if (matchRule(ruleFrom(rule), answer)) {
      userScore += Number(rule.score_delta)
    }
  }

  // Step 5: recommendations.
  const { data: recRaw, error: recErr } = await supabase
    .from("product_recommendations")
    .select("product_id, slot, score_min, score_max, priority")
    .in("product_id", activeIds)
    .lte("score_min", userScore)
    .gte("score_max", userScore)
    .order("priority", { ascending: true })
  if (recErr) return { ok: false, error: recErr.message }
  const recs = (recRaw ?? []) as RecommendationRow[]

  const featuredSlot: Record<"safe" | "economic", string | null> = {
    safe: null,
    economic: null,
  }
  for (const r of recs) {
    if (!featuredSlot[r.slot]) featuredSlot[r.slot] = r.product_id
  }

  // Step 2 apply + Step 3 compute + Step 6 build rows.
  type ResultRow = {
    session_id: string
    product_id: string
    annual_price: number | null
    monthly_price: number | null
    excluded: boolean
    excluded_reason: string | null
    slot: "safe" | "economic" | null
  }
  const rows: ResultRow[] = []

  for (const product of products) {
    const eligRules = eligByProduct.get(product.id) ?? []
    let excludedReason: string | null = null
    for (const rule of eligRules) {
      const answer = answers[rule.question_key]
      if (matchRule(ruleFrom(rule), answer)) {
        excludedReason = rule.exclusion_reason ?? "Non eleggibile"
        break
      }
    }

    if (excludedReason) {
      rows.push({
        session_id: sessionId,
        product_id: product.id,
        annual_price: null,
        monthly_price: null,
        excluded: true,
        excluded_reason: excludedReason,
        slot: null,
      })
      continue
    }

    const annual = computePrice(product.id, answers, {
      base: baseByProduct.get(product.id) ?? [],
      multipliers: multByProduct.get(product.id) ?? [],
      bands: bandByProduct.get(product.id) ?? [],
      addons: addonByProduct.get(product.id) ?? [],
    })

    let slot: "safe" | "economic" | null = null
    if (featuredSlot.safe === product.id) slot = "safe"
    else if (featuredSlot.economic === product.id) slot = "economic"

    rows.push({
      session_id: sessionId,
      product_id: product.id,
      annual_price: annual === null ? null : round2(annual),
      monthly_price: annual === null ? null : round2(annual / 12),
      excluded: false,
      excluded_reason: null,
      slot,
    })
  }

  // Step 6: persist results (upsert by unique (session_id, product_id)).
  await supabase.from("quote_results").delete().eq("session_id", sessionId)
  if (rows.length > 0) {
    const { error: insErr } = await supabase.from("quote_results").insert(rows)
    if (insErr) return { ok: false, error: insErr.message }
  }

  // Step 4 persist: user_score on session.
  const { error: upErr } = await supabase
    .from("quote_sessions")
    .update({ user_score: userScore, updated_at: new Date().toISOString() })
    .eq("id", sessionId)
  if (upErr) return { ok: false, error: upErr.message }

  return { ok: true, resultCount: rows.length, userScore }
}

function computePrice(
  _productId: string,
  answers: Record<string, unknown>,
  pricing: {
    base: BasePriceRow[]
    multipliers: MultiplierRow[]
    bands: BandRow[]
    addons: AddonPriceRow[]
  }
): number | null {
  // base price: pick row where question_key's answer equals answer_value,
  // else fallback to the is_default row (or the first base row if only one).
  let base: number | null = null
  if (pricing.base.length > 0) {
    const byKey = groupBy(pricing.base, (r) => r.question_key)
    for (const [qk, rows] of byKey) {
      const ans = toStr(answers[qk])
      const match = rows.find((r) => r.answer_value === ans)
      const def = rows.find((r) => r.is_default)
      const picked = match ?? def ?? rows[0]
      if (picked) {
        base = (base ?? 0) + Number(picked.base_price)
      }
    }
    if (base === null && pricing.base.length > 0) {
      base = Number(pricing.base[0].base_price)
    }
  }
  if (base === null) return null

  // simple multipliers: exact match on answer_value.
  let mult = 1
  for (const m of pricing.multipliers) {
    const ans = toStr(answers[m.question_key])
    if (ans !== null && ans === m.answer_value) mult *= Number(m.multiplier)
  }

  // bands: direct / years_since / band.
  for (const b of pricing.bands) {
    const raw = answers[b.question_key]
    let n: number | null = null
    if (b.calculation === "direct") n = toNumber(raw)
    else if (b.calculation === "band") n = toNumber(raw)
    else if (b.calculation === "years_since") {
      n = yearsSince(raw)
    }
    if (n === null) continue
    const lo = b.range_min
    const hi = b.range_max
    if (lo !== null && lo !== undefined && n < Number(lo)) continue
    if (hi !== null && hi !== undefined && n > Number(hi)) continue
    mult *= Number(b.multiplier)
  }

  let total = base * mult

  // addons: if trigger_value matches, add fixed or percent.
  for (const a of pricing.addons) {
    const ans = toStr(answers[a.question_key])
    if (ans === null) continue
    if (ans !== a.trigger_value) continue
    if (a.price_fixed !== null) total += Number(a.price_fixed)
    if (a.price_percent !== null) total += total * (Number(a.price_percent) / 100)
  }

  return total
}

function ruleFrom(r: {
  operator: RuleOperator
  expected_value: string | null
  expected_values: string[] | null
  range_min: number | null
  range_max: number | null
}): RuleInput {
  return {
    operator: r.operator,
    expected_value: r.expected_value,
    expected_values: r.expected_values,
    range_min: r.range_min,
    range_max: r.range_max,
  }
}

function toStr(v: unknown): string | null {
  if (v === null || v === undefined) return null
  if (typeof v === "boolean") return v ? "true" : "false"
  return String(v)
}

function toNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }
  return null
}

function yearsSince(v: unknown): number | null {
  const n = toNumber(v)
  if (n !== null && n >= 1900 && n <= 9999) {
    return new Date().getFullYear() - n
  }
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) {
    const d = new Date(v)
    if (!Number.isNaN(d.getTime())) {
      const diff = Date.now() - d.getTime()
      return Math.floor(diff / (365.25 * 24 * 3600 * 1000))
    }
  }
  return null
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
