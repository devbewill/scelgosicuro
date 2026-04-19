import "server-only"
import { createClient } from "@/lib/supabase/server"
import { extractQuestionKeys, describeCondition } from "@/lib/engine/conditions"

// ── Types ────────────────────────────────────────────────────────────────────

export type BOProduct = {
  id: number
  slug: string
  name: string
  version: string
  is_active: boolean
  insurer: { slug: string; name: string }
  sector: { id: number; slug: string; name: string }
  coverageCount: number
  ruleCount: number
  multiplierCount: number
  addonCount: number
}

export type BOProductDetail = {
  id: number
  slug: string
  name: string
  version: string
  source_pdf: string | null
  is_active: boolean
  insurer: { slug: string; name: string }
  sector: { id: number; slug: string; name: string }
  coverages: Array<{
    id: number
    key: string
    name: string
    is_mandatory: boolean
    available_if: unknown
    dimensions: string[]
    rateCount: number
  }>
  eligibilityRules: Array<{
    id: number
    name: string
    condition: unknown
    action: string
    reason: string | null
    priority: number
  }>
  multipliers: Array<{
    id: number
    coverage_id: number | null
    coverageKey: string | null
    name: string
    factor: number
    condition: unknown
    priority: number
  }>
  addons: Array<{
    id: number
    key: string
    name: string
    pricing_mode: string
    flat_premium: number | null
    triggered_by: unknown
    available_if: unknown
  }>
}

export type BOSector = {
  id: number
  slug: string
  name: string
  is_active: boolean
  productCount: number
  questionCount: number
}

export type BOQuestion = {
  id: number
  key: string
  label: string
  type: string
  options: Array<{ value: string | number; label?: string }> | null
  sectorNames: string[]
}

// ── Profession search index ───────────────────────────────────────────────────
// All dropdown questions (profession-type) with their options, joined to sector.
// Used for the cross-sector search on the Tariffari page.

export type ProfessionEntry = {
  sectorId: number
  sectorSlug: string
  sectorName: string
  questionKey: string
  questionLabel: string
  options: Array<{ value: string; label: string }>
}

const EXCLUDED_KEY_FRAGMENTS = [
  "massimale", "franchigia", "periodo", "protezione",
  "opzione", "infortuni", "fascia", "compenso", "fatturato",
]

export async function getAllProfessionOptions(): Promise<ProfessionEntry[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from("sector_questions")
    .select("position, sectors (id, slug, name), questions (key, label, type, options)")
    .order("position", { ascending: true })

  if (!data) return []

  const seen = new Set<string>()
  const entries: ProfessionEntry[] = []

  for (const row of data as any[]) {
    const s = row.sectors
    const q = row.questions
    if (!s || !q || q.type !== "dropdown") continue
    const opts = q.options as Array<{ value: string | number; label?: string }> | null
    if (!opts || opts.length === 0) continue
    if (EXCLUDED_KEY_FRAGMENTS.some((f) => (q.key as string).includes(f))) continue

    const dedupeKey = `${s.id}:${q.key}`
    if (seen.has(dedupeKey)) continue
    seen.add(dedupeKey)

    entries.push({
      sectorId: s.id,
      sectorSlug: s.slug,
      sectorName: s.name,
      questionKey: q.key,
      questionLabel: q.label,
      options: opts.map((o) => ({
        value: String(o.value),
        label: o.label ?? String(o.value),
      })),
    })
  }

  return entries
}

// ── Tariffari Analysis ───────────────────────────────────────────────────────

export type AddonRateRow = {
  dimensionValues: Record<string, unknown>
  premium: number | null
  manualQuote: boolean
}

export type PricingDriver = {
  type: "eligibility" | "multiplier" | "addon"
  name: string
  condition: unknown
  description: string
  effect: string
  questionKeys: string[]
  scope: string | null
  addonId?: number
  rateRows?: AddonRateRow[]
}

export type TariffariProduct = {
  id: number
  name: string
  slug: string
  insurer: string
  drivers: PricingDriver[]
}

export type PrimaryQuestion = {
  key: string
  label: string
  options: Array<{ value: string | number; label?: string }>
}

export type TariffariAnalysis = {
  questions: Array<{ key: string; label: string; type: string }>
  primaryQuestion: PrimaryQuestion | null
  products: TariffariProduct[]
}

export async function getTariffariAnalysis(sectorId: number): Promise<TariffariAnalysis> {
  const supabase = await createClient()

  const { data: sq } = await supabase
    .from("sector_questions")
    .select("question_id, position, questions (id, key, label, type, options)")
    .eq("sector_id", sectorId)
    .order("position", { ascending: true })

  const qids = (sq ?? []).map((r: any) => r.question_id as number)

  const { data: qs } = qids.length
    ? await supabase.from("questions").select("key, label, type").in("id", qids)
    : { data: [] }

  const questions = (qs ?? []) as Array<{ key: string; label: string; type: string }>
  const labels = new Map(questions.map((q) => [q.key, q.label]))

  // Detect primary question: first dropdown with >3 options, excluding config-type keys
  const EXCLUDED_KEY_FRAGMENTS = [
    "massimale", "franchigia", "periodo", "protezione",
    "opzione", "infortuni", "fascia", "compenso", "fatturato",
  ]
  const primaryRaw = (sq ?? []).find((r: any) => {
    const q = r.questions as any
    if (!q || q.type !== "dropdown") return false
    const opts = q.options as unknown[]
    if (!opts || opts.length <= 3) return false
    const key: string = q.key
    return !EXCLUDED_KEY_FRAGMENTS.some((f) => key.includes(f))
  }) ?? (sq ?? []).find((r: any) => {
    const q = r.questions as any
    return q?.type === "dropdown" && (q.options as unknown[])?.length > 3
  })

  const primaryQuestion: PrimaryQuestion | null = primaryRaw
    ? {
        key: (primaryRaw.questions as any).key,
        label: (primaryRaw.questions as any).label,
        options: (primaryRaw.questions as any).options ?? [],
      }
    : null

  const { data: products } = await supabase
    .from("products")
    .select(`
      id, slug, name,
      insurers (name),
      product_coverages (id, key, name),
      product_eligibility_rules (name, condition, action, reason, priority),
      product_multipliers (name, factor, condition, priority, coverage_id),
      product_addons (id, key, name, pricing_mode, flat_premium, triggered_by)
    `)
    .eq("sector_id", sectorId)
    .eq("is_active", true)
    .order("name")

  if (!products) return { questions, primaryQuestion, products: [] }

  const result: TariffariProduct[] = (products as any[]).map((p) => {
    const covById = new Map<number, string>(
      (p.product_coverages ?? []).map((c: any) => [c.id, c.name])
    )
    const drivers: PricingDriver[] = []

    for (const r of (p.product_eligibility_rules ?? []).sort(
      (a: any, b: any) => a.priority - b.priority
    )) {
      drivers.push({
        type: "eligibility",
        name: r.name,
        condition: r.condition,
        description: describeCondition(r.condition, labels),
        effect: r.action === "exclude" ? "Esclusione" : "Preventivo manuale",
        questionKeys: extractQuestionKeys(r.condition),
        scope: null,
      })
    }

    for (const m of (p.product_multipliers ?? []).sort(
      (a: any, b: any) => a.priority - b.priority
    )) {
      const covName = m.coverage_id ? (covById.get(m.coverage_id) ?? null) : null
      const diff = Math.round(Math.abs(m.factor - 1) * 100)
      const sign = m.factor >= 1 ? `+${diff}%` : `-${diff}%`
      drivers.push({
        type: "multiplier",
        name: m.name,
        condition: m.condition,
        description: describeCondition(m.condition, labels),
        effect: `×${m.factor} (${sign})`,
        questionKeys: extractQuestionKeys(m.condition),
        scope: covName,
      })
    }

    for (const a of p.product_addons ?? []) {
      if (!a.triggered_by) continue
      let effect: string
      if (a.pricing_mode === "flat" && a.flat_premium != null) {
        effect = `+${Number(a.flat_premium).toLocaleString("it-IT")} €/anno`
      } else {
        effect = "a tariffa (vedi dettaglio)"
      }
      drivers.push({
        type: "addon",
        name: a.name,
        condition: a.triggered_by,
        description: describeCondition(a.triggered_by, labels),
        effect,
        questionKeys: extractQuestionKeys(a.triggered_by),
        scope: null,
        addonId: a.id,
      })
    }

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      insurer: (p.insurers as any)?.name ?? "",
      drivers,
    }
  })

  // Batch-fetch rate rows for all rate_table addons
  const allAddonIds = result.flatMap((p) =>
    p.drivers.filter((d) => d.type === "addon" && d.addonId != null).map((d) => d.addonId!)
  )

  if (allAddonIds.length > 0) {
    const { data: rateRowsRaw } = await supabase
      .from("product_addon_rate_rows")
      .select("addon_id, dimension_values, premium, manual_quote")
      .in("addon_id", allAddonIds)

    const ratesByAddon = new Map<number, AddonRateRow[]>()
    for (const row of rateRowsRaw ?? []) {
      const id = row.addon_id as number
      if (!ratesByAddon.has(id)) ratesByAddon.set(id, [])
      ratesByAddon.get(id)!.push({
        dimensionValues: row.dimension_values as Record<string, unknown>,
        premium: row.premium != null ? Number(row.premium) : null,
        manualQuote: row.manual_quote as boolean,
      })
    }

    for (const product of result) {
      for (const driver of product.drivers) {
        if (driver.type === "addon" && driver.addonId != null) {
          driver.rateRows = ratesByAddon.get(driver.addonId) ?? []
        }
      }
    }
  }

  return { questions, primaryQuestion, products: result }
}

// ── Products ─────────────────────────────────────────────────────────────────

export async function getBackofficeProducts(sectorSlug?: string): Promise<BOProduct[]> {
  const supabase = await createClient()

  let query = supabase
    .from("products")
    .select(`
      id, slug, name, version, is_active,
      insurers (slug, name),
      sectors (id, slug, name),
      product_coverages (id),
      product_eligibility_rules (id),
      product_multipliers (id),
      product_addons (id)
    `)
    .order("name")

  if (sectorSlug) {
    const { data: sector } = await supabase
      .from("sectors")
      .select("id")
      .eq("slug", sectorSlug)
      .maybeSingle()
    if (sector) query = query.eq("sector_id", sector.id)
  }

  const { data } = await query
  if (!data) return []

  return data.map((p: any) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    version: p.version,
    is_active: p.is_active,
    insurer: p.insurers,
    sector: p.sectors,
    coverageCount: (p.product_coverages ?? []).length,
    ruleCount: (p.product_eligibility_rules ?? []).length,
    multiplierCount: (p.product_multipliers ?? []).length,
    addonCount: (p.product_addons ?? []).length,
  }))
}

export async function getBackofficeProductDetail(id: number): Promise<BOProductDetail | null> {
  const supabase = await createClient()

  const { data: p } = await supabase
    .from("products")
    .select(`
      id, slug, name, version, source_pdf, is_active,
      insurers (slug, name),
      sectors (id, slug, name),
      product_coverages (id, key, name, is_mandatory, available_if, dimensions),
      product_eligibility_rules (id, name, condition, action, reason, priority),
      product_multipliers (id, coverage_id, name, factor, condition, priority),
      product_addons (id, key, name, pricing_mode, flat_premium, triggered_by, available_if)
    `)
    .eq("id", id)
    .maybeSingle()

  if (!p) return null

  // fetch rate counts per coverage
  const covIds = (p.product_coverages as any[]).map((c: any) => c.id)
  const { data: rateCounts } = await supabase
    .from("product_rate_rows")
    .select("coverage_id")
    .in("coverage_id", covIds.length ? covIds : [-1])

  const rateByCovidId = new Map<number, number>()
  for (const r of rateCounts ?? []) {
    rateByCovidId.set(r.coverage_id, (rateByCovidId.get(r.coverage_id) ?? 0) + 1)
  }

  const covKeyById = new Map<number, string>()
  for (const c of (p.product_coverages as any[])) covKeyById.set(c.id, c.key)

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    version: p.version,
    source_pdf: p.source_pdf,
    is_active: p.is_active,
    insurer: (p.insurers as any),
    sector: (p.sectors as any),
    coverages: (p.product_coverages as any[]).map((c: any) => ({
      id: c.id,
      key: c.key,
      name: c.name,
      is_mandatory: c.is_mandatory,
      available_if: c.available_if,
      dimensions: c.dimensions ?? [],
      rateCount: rateByCovidId.get(c.id) ?? 0,
    })),
    eligibilityRules: (p.product_eligibility_rules as any[])
      .sort((a: any, b: any) => a.priority - b.priority),
    multipliers: (p.product_multipliers as any[])
      .sort((a: any, b: any) => a.priority - b.priority)
      .map((m: any) => ({
        ...m,
        coverageKey: m.coverage_id ? (covKeyById.get(m.coverage_id) ?? null) : null,
      })),
    addons: (p.product_addons as any[]),
  }
}

// ── Sectors ──────────────────────────────────────────────────────────────────

export async function getBackofficeSectors(): Promise<BOSector[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from("sectors")
    .select(`
      id, slug, name, is_active,
      products (id),
      sector_questions (question_id)
    `)
    .order("display_order")

  if (!data) return []
  return data.map((s: any) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    is_active: s.is_active,
    productCount: (s.products ?? []).length,
    questionCount: (s.sector_questions ?? []).length,
  }))
}

// ── Questions ────────────────────────────────────────────────────────────────

export async function getBackofficeQuestions(sectorSlug?: string): Promise<BOQuestion[]> {
  const supabase = await createClient()

  // sector_questions joined to sectors for name
  const { data: sq } = await supabase
    .from("sector_questions")
    .select("question_id, sectors (slug, name)")

  const sectorNamesByQ = new Map<number, string[]>()
  for (const row of sq ?? []) {
    const qid = row.question_id as number
    const s = row.sectors as any
    if (!sectorNamesByQ.has(qid)) sectorNamesByQ.set(qid, [])
    sectorNamesByQ.get(qid)!.push(s?.name ?? "")
  }

  let qQuery = supabase
    .from("questions")
    .select("id, key, label, type, options")
    .order("key")

  if (sectorSlug) {
    const { data: sector } = await supabase
      .from("sectors").select("id").eq("slug", sectorSlug).maybeSingle()
    if (sector) {
      const { data: sqFiltered } = await supabase
        .from("sector_questions").select("question_id").eq("sector_id", sector.id)
      const qids = (sqFiltered ?? []).map((r: any) => r.question_id)
      if (qids.length) qQuery = qQuery.in("id", qids)
      else return []
    }
  }

  const { data: questions } = await qQuery
  if (!questions) return []

  return questions.map((q: any) => ({
    id: q.id,
    key: q.key,
    label: q.label,
    type: q.type,
    options: q.options,
    sectorNames: sectorNamesByQ.get(q.id) ?? [],
  }))
}
