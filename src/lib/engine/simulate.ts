import "server-only"

import { createClient } from "@/lib/supabase/server"
import { evalCondition, type Condition } from "@/lib/engine/operators"

export type SimMultiplier = {
  name: string
  factor: number
  fired: boolean
  scope: "product" | string   // "product" | coverage key
}

export type SimCoverage = {
  key: string
  name: string
  base: number
  multipliers: SimMultiplier[]
  combined_factor: number
  subtotal: number
}

export type SimAddon = {
  key: string
  name: string
  premium: number | null   // null = manual_quote (no auto-price)
  triggered: boolean
}

export type SimProductResult = {
  productId: number
  productName: string
  productSlug: string
  insurerName: string
  status: "eligible" | "excluded" | "manual_quote"
  exclusionReason: string | null
  premiumTotal: number | null
  coverages: SimCoverage[]
  addons: SimAddon[]
  allMultipliers: SimMultiplier[]   // fired + not-fired combined
  firedRules: { name: string; action: string; reason: string | null }[]
}

function round2(n: number) { return Math.round(n * 100) / 100 }

function groupBy<T, K>(arr: T[], key: (t: T) => K): Map<K, T[]> {
  const m = new Map<K, T[]>()
  for (const it of arr) {
    const k = key(it)
    const g = m.get(k)
    if (g) g.push(it)
    else m.set(k, [it])
  }
  return m
}

export async function simulateQuotes(
  sectorId: number,
  answers: Record<string, unknown>
): Promise<SimProductResult[]> {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from("products")
    .select("id, slug, name, insurers(name)")
    .eq("sector_id", sectorId)
    .eq("is_active", true)
  if (!products?.length) return []

  const productIds = products.map((p) => p.id as number)

  const [eligRes, covRes, multRes, addonRes] = await Promise.all([
    supabase.from("product_eligibility_rules")
      .select("product_id, name, condition, action, reason, priority")
      .in("product_id", productIds).order("priority", { ascending: true }),
    supabase.from("product_coverages")
      .select("id, product_id, key, name, is_mandatory, available_if, dimensions")
      .in("product_id", productIds),
    supabase.from("product_multipliers")
      .select("product_id, coverage_id, name, factor, condition, priority")
      .in("product_id", productIds).order("priority", { ascending: true }),
    supabase.from("product_addons")
      .select("id, product_id, key, name, pricing_mode, flat_premium, triggered_by, available_if, dimensions")
      .in("product_id", productIds),
  ])

  const coverages = covRes.data ?? []
  const coverageIds = coverages.map((c) => c.id as number)

  const [rateRes, addonRateRes] = await Promise.all([
    supabase.from("product_rate_rows")
      .select("coverage_id, dimension_values, premium, manual_quote")
      .in("coverage_id", coverageIds.length ? coverageIds : [-1]),
    supabase.from("product_addon_rate_rows")
      .select("addon_id, dimension_values, premium, manual_quote")
      .in("addon_id",
        ((addonRes.data ?? []) as Array<{id: number; pricing_mode: string}>)
          .filter((a) => a.pricing_mode === "rate_table").map((a) => a.id as unknown as number)
          .concat([-1])
      ),
  ])

  const eligByProduct  = groupBy(eligRes.data  ?? [], (r) => r.product_id as number)
  const covByProduct   = groupBy(coverages,            (r) => r.product_id as number)
  const ratesByCov     = groupBy(rateRes.data  ?? [], (r) => r.coverage_id as number)
  const multByProduct  = groupBy(multRes.data  ?? [], (r) => r.product_id as number)
  const multByCov      = groupBy(multRes.data  ?? [], (r) => r.coverage_id as number | null)
  const addonByProduct = groupBy(addonRes.data ?? [], (r) => r.product_id as number)
  const addonRateByAddon = groupBy(addonRateRes.data ?? [], (r) => r.addon_id as number)
  const covKeyById = new Map<number, string>(coverages.map((c) => [c.id as number, c.key as string]))

  const results: SimProductResult[] = []

  for (const product of products) {
    const insurer = product.insurers as unknown as { name: string }

    // eligibility
    const firedRules: SimProductResult["firedRules"] = []
    let exclusionReason: string | null = null
    let isManualQuote = false

    for (const rule of eligByProduct.get(product.id) ?? []) {
      const fired = evalCondition(rule.condition as Condition, answers)
      if (fired) {
        firedRules.push({ name: rule.name as string, action: rule.action as string, reason: rule.reason as string | null })
        exclusionReason = rule.reason ?? (rule.action === "manual_quote" ? "Preventivo su misura" : "Non eleggibile")
        isManualQuote = rule.action === "manual_quote"
        break
      }
    }

    if (exclusionReason && !isManualQuote) {
      results.push({
        productId: product.id,
        productName: product.name as string,
        productSlug: product.slug as string,
        insurerName: insurer?.name ?? "",
        status: "excluded",
        exclusionReason,
        premiumTotal: null,
        coverages: [],
        addons: [],
        allMultipliers: [],
        firedRules,
      })
      continue
    }

    // collect ALL multipliers with fired status (for display)
    const allProductMults = multByProduct.get(product.id) ?? []
    const allMultipliers: SimMultiplier[] = allProductMults.map((m) => ({
      name: m.name as string,
      factor: Number(m.factor),
      fired: evalCondition(m.condition as Condition, answers),
      scope: m.coverage_id ? (covKeyById.get(m.coverage_id as number) ?? String(m.coverage_id)) : "product",
    }))

    // pricing
    let premiumTotal: number | null = null
    const simCoverages: SimCoverage[] = []
    const simAddons: SimAddon[] = []

    if (!isManualQuote) {
      let allPriced = true

      for (const cov of covByProduct.get(product.id) ?? []) {
        if (!cov.is_mandatory) continue
        if (cov.available_if && !evalCondition(cov.available_if as Condition, answers)) continue

        const rateRows = ratesByCov.get(cov.id as number) ?? []
        const match = rateRows.find((r) => evalCondition(r.dimension_values as Condition, answers))

        if (!match || match.manual_quote || match.premium === null) {
          if (match?.manual_quote) { isManualQuote = true; exclusionReason = "Preventivo su misura" }
          allPriced = false
          break
        }

        const appliedMult: SimMultiplier[] = []
        let factor = 1

        for (const m of (multByProduct.get(product.id) ?? [])) {
          if (m.coverage_id !== null) continue
          if (evalCondition(m.condition as Condition, answers)) {
            factor *= Number(m.factor)
            appliedMult.push({ name: m.name as string, factor: Number(m.factor), fired: true, scope: "product" })
          }
        }
        for (const m of (multByCov.get(cov.id as number) ?? [])) {
          if (evalCondition(m.condition as Condition, answers)) {
            factor *= Number(m.factor)
            appliedMult.push({ name: m.name as string, factor: Number(m.factor), fired: true, scope: cov.key as string })
          }
        }

        const base = Number(match.premium)
        const subtotal = round2(base * factor)
        simCoverages.push({
          key: cov.key as string,
          name: cov.name as string,
          base,
          multipliers: appliedMult,
          combined_factor: round2(factor),
          subtotal,
        })
        premiumTotal = round2((premiumTotal ?? 0) + subtotal)
      }

      if (!allPriced && !isManualQuote) premiumTotal = null

      // addons
      if (premiumTotal !== null) {
        for (const addon of addonByProduct.get(product.id) ?? []) {
          const triggered = !!addon.triggered_by && evalCondition(addon.triggered_by as Condition, answers)
          const available = !addon.available_if || evalCondition(addon.available_if as Condition, answers)
          if (!available) continue

          let addonPremium: number | null = null
          if (addon.pricing_mode === "flat" && addon.flat_premium !== null) {
            addonPremium = Number(addon.flat_premium)
          } else if (addon.pricing_mode === "rate_table") {
            const aMatch = (addonRateByAddon.get(addon.id as number) ?? [])
              .find((r) => evalCondition(r.dimension_values as Condition, answers))
            if (aMatch && !aMatch.manual_quote && aMatch.premium !== null) {
              addonPremium = Number(aMatch.premium)
            }
          }

          // Always surface available addons so the user can see them.
          // If triggered but unpriced (manual_quote rate rows), flip product to manual_quote.
          simAddons.push({ key: addon.key as string, name: addon.name as string, premium: addonPremium, triggered })
          if (triggered) {
            if (addonPremium !== null) {
              premiumTotal = round2(premiumTotal + addonPremium)
            } else {
              isManualQuote = true
              exclusionReason = "Preventivo su misura (addon a prezzo variabile)"
            }
          }
        }
      }
    }

    results.push({
      productId: product.id,
      productName: product.name as string,
      productSlug: product.slug as string,
      insurerName: insurer?.name ?? "",
      status: isManualQuote ? "manual_quote" : "eligible",
      exclusionReason: isManualQuote ? exclusionReason : null,
      premiumTotal,
      coverages: simCoverages,
      addons: simAddons,
      allMultipliers,
      firedRules,
    })
  }

  return results.sort((a, b) => {
    if (a.premiumTotal !== null && b.premiumTotal !== null) return a.premiumTotal - b.premiumTotal
    if (a.premiumTotal !== null) return -1
    if (b.premiumTotal !== null) return 1
    return 0
  })
}
