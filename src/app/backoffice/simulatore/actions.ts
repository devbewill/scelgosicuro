"use server"

import { createClient } from "@/lib/supabase/server"
import { extractStringValues, describeCondition } from "@/lib/engine/conditions"

export type SectorHit = {
  kind: "sector"
  sectorId: number
  sectorSlug: string
  sectorName: string
}

export type ProductHit = {
  kind: "product"
  sectorId: number
  sectorSlug: string
  sectorName: string
  productId: number
  productName: string
  insurerName: string
}

export type OptionHit = {
  kind: "option"
  sectorId: number
  sectorSlug: string
  sectorName: string
  questionKey: string
  questionLabel: string
  optionValue: string
  optionLabel: string
}

export type ConditionHit = {
  kind: "condition"
  sectorId: number
  sectorSlug: string
  sectorName: string
  productId: number
  productName: string
  insurerName: string
  ruleType: "eligibility" | "multiplier" | "addon"
  ruleName: string
  conditionDescription: string
  effect: string
  matchedValues: string[]
}

export type ProfessionHit = SectorHit | ProductHit | OptionHit | ConditionHit

export async function searchProfessions(term: string): Promise<ProfessionHit[]> {
  const t = term.trim().toLowerCase()
  if (t.length < 2) return []

  const supabase = await createClient()

  const [sectorsRes, productsRes, sqRes, eligRes, multRes, addonRes] = await Promise.all([
    supabase.from("sectors").select("id, slug, name").eq("is_active", true),
    supabase.from("products").select("id, slug, name, insurers (name), sectors (id, slug, name)").eq("is_active", true),
    supabase.from("sector_questions").select("sectors (id, slug, name), questions (key, label, options)"),
    supabase.from("product_eligibility_rules").select("name, condition, action, products (id, name, insurers (name), sectors (id, slug, name))"),
    supabase.from("product_multipliers").select("name, condition, factor, products (id, name, insurers (name), sectors (id, slug, name))"),
    supabase.from("product_addons").select("name, triggered_by, flat_premium, pricing_mode, products (id, name, insurers (name), sectors (id, slug, name))").not("triggered_by", "is", null),
  ])

  const hits: ProfessionHit[] = []
  const seen = new Set<string>()

  for (const s of (sectorsRes.data ?? []) as any[]) {
    if (s.name.toLowerCase().includes(t) || s.slug.toLowerCase().includes(t)) {
      hits.push({ kind: "sector", sectorId: s.id, sectorSlug: s.slug, sectorName: s.name })
    }
  }

  for (const p of (productsRes.data ?? []) as any[]) {
    const s = p.sectors
    if (!s) continue
    if (p.name.toLowerCase().includes(t) || p.slug.toLowerCase().includes(t)) {
      const dedupe = `prod:${p.id}`
      if (!seen.has(dedupe)) {
        seen.add(dedupe)
        hits.push({ kind: "product", sectorId: s.id, sectorSlug: s.slug, sectorName: s.name, productId: p.id, productName: p.name, insurerName: (p.insurers as any)?.name ?? "" })
      }
    }
  }

  const questionLabels = new Map<string, string>()
  const sqSeen = new Set<string>()
  for (const row of (sqRes.data ?? []) as any[]) {
    const s = row.sectors
    const q = row.questions
    if (!s || !q) continue
    if (q.label) questionLabels.set(q.key, q.label)
    const opts = q.options as Array<{ value: string | number; label?: string }> | null
    if (!opts) continue
    for (const opt of opts) {
      const rawValue = String(opt.value)
      const label = opt.label ?? rawValue
      if (rawValue.toLowerCase().includes(t) || label.toLowerCase().includes(t)) {
        const dedupe = `opt:${s.slug}:${q.key}:${rawValue}`
        if (sqSeen.has(dedupe)) continue
        sqSeen.add(dedupe)
        hits.push({ kind: "option", sectorId: s.id, sectorSlug: s.slug, sectorName: s.name, questionKey: q.key, questionLabel: q.label, optionValue: rawValue, optionLabel: label })
      }
    }
  }

  function addConditionHit(condition: unknown, ruleType: ConditionHit["ruleType"], ruleName: string, effect: string, product: any, sector: any) {
    if (!condition || !product || !sector) return
    const vals = extractStringValues(condition)
    const matched = vals.filter((v) => v.toLowerCase().includes(t))
    if (matched.length === 0) return
    const dedupe = `cond:${product.id}:${ruleType}:${ruleName}`
    if (seen.has(dedupe)) return
    seen.add(dedupe)
    hits.push({ kind: "condition", sectorId: sector.id, sectorSlug: sector.slug, sectorName: sector.name, productId: product.id, productName: product.name, insurerName: (product.insurers as any)?.name ?? "", ruleType, ruleName, conditionDescription: describeCondition(condition, questionLabels), effect, matchedValues: [...new Set(matched)] })
  }

  for (const r of (eligRes.data ?? []) as any[]) {
    addConditionHit(r.condition, "eligibility", r.name, r.action === "exclude" ? "Esclusione" : "Preventivo manuale", r.products, r.products?.sectors)
  }
  for (const m of (multRes.data ?? []) as any[]) {
    const diff = Math.round(Math.abs(m.factor - 1) * 100)
    addConditionHit(m.condition, "multiplier", m.name, `×${m.factor} (${m.factor >= 1 ? "+" : "-"}${diff}%)`, m.products, m.products?.sectors)
  }
  for (const a of (addonRes.data ?? []) as any[]) {
    const effect = a.pricing_mode === "flat" && a.flat_premium != null ? `+${Number(a.flat_premium).toLocaleString("it-IT")} €/anno` : `+${a.name} (tariffa variabile)`
    addConditionHit(a.triggered_by, "addon", a.name, effect, a.products, a.products?.sectors)
  }

  const KIND_ORDER: Record<ProfessionHit["kind"], number> = { sector: 0, product: 1, option: 2, condition: 3 }
  hits.sort((a, b) => {
    const ko = KIND_ORDER[a.kind] - KIND_ORDER[b.kind]
    return ko !== 0 ? ko : a.sectorName.localeCompare(b.sectorName)
  })

  return hits
}
