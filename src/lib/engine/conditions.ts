// Pure utilities for extracting question keys, building human-readable
// descriptions, and evaluating profession-specific matches from the JSONB
// condition format used across rules tables.

export function extractQuestionKeys(cond: unknown): string[] {
  if (!cond || typeof cond !== "object" || Array.isArray(cond)) return []
  const c = cond as Record<string, unknown>
  if (Array.isArray(c.all)) return (c.all as unknown[]).flatMap(extractQuestionKeys)
  if (Array.isArray(c.any)) return (c.any as unknown[]).flatMap(extractQuestionKeys)
  if (typeof c.key === "string") return [c.key]
  // Legacy format: top-level keys that start with q_
  return Object.keys(c).filter((k) => k.startsWith("q_"))
}

function describeOp(op: string, value: unknown): string {
  if (Array.isArray(value)) {
    if (op === "between" && value.length === 2) return `tra ${value[0]} e ${value[1]}`
    return `in [${value.join(", ")}]`
  }
  switch (op) {
    case "equals":       return `= ${value}`
    case "not_equals":   return `≠ ${value}`
    case "in":           return `∈ [${value}]`
    case "not_in":       return `∉ [${value}]`
    case "greater_than": return `> ${value}`
    case "less_than":    return `< ${value}`
    default:             return `${op} ${value}`
  }
}

export function describeCondition(cond: unknown, labels: Map<string, string>): string {
  if (!cond || typeof cond !== "object" || Array.isArray(cond)) return ""
  const c = cond as Record<string, unknown>

  if (Array.isArray(c.all)) {
    return (c.all as unknown[])
      .map((x) => describeCondition(x, labels))
      .filter(Boolean)
      .join(" E ")
  }
  if (Array.isArray(c.any)) {
    return (c.any as unknown[])
      .map((x) => describeCondition(x, labels))
      .filter(Boolean)
      .join(" O ")
  }
  if (typeof c.key === "string") {
    const label = labels.get(c.key) ?? c.key
    return `${label} ${describeOp(c.op as string, c.value)}`
  }
  // Legacy
  return Object.entries(c)
    .map(([k, v]) => {
      const label = labels.get(k) ?? k
      if (v && typeof v === "object" && !Array.isArray(v)) {
        const obj = v as Record<string, unknown>
        const [op, val] = Object.entries(obj)[0] ?? []
        if (op) return `${label} ${describeOp(op, val)}`
      }
      return `${label} = ${v}`
    })
    .join(" E ")
}

// ── String value extraction from conditions ───────────────────────────────────
// Extracts non-numeric string leaf values from any condition tree.
// Used to build a full-text search index across rule conditions.

export function extractStringValues(cond: unknown): string[] {
  if (cond === null || cond === undefined) return []
  if (typeof cond === "string") return isNaN(Number(cond)) ? [cond] : []
  if (typeof cond === "number" || typeof cond === "boolean") return []
  if (Array.isArray(cond)) return cond.flatMap(extractStringValues)
  if (typeof cond !== "object") return []

  const c = cond as Record<string, unknown>
  if (Array.isArray(c.all)) return (c.all as unknown[]).flatMap(extractStringValues)
  if (Array.isArray(c.any)) return (c.any as unknown[]).flatMap(extractStringValues)

  // DSL: { key, op, value }
  if (typeof c.key === "string") {
    const v = c.value
    if (Array.isArray(v)) return v.filter((x) => typeof x === "string" && isNaN(Number(x))).map(String)
    if (typeof v === "string" && isNaN(Number(v))) return [v]
    return []
  }

  // Legacy: { q_key: value | { op: value } }
  return Object.values(c).flatMap((pred) => {
    if (typeof pred === "string" && isNaN(Number(pred))) return [pred]
    if (Array.isArray(pred)) return pred.filter((x) => typeof x === "string" && isNaN(Number(x))).map(String)
    if (pred && typeof pred === "object") return extractStringValues(pred)
    return []
  })
}

// ── Profession matching ───────────────────────────────────────────────────────
// Given a condition, a question key, and a candidate value, returns:
//   'fires'   – the condition references qKey and the value satisfies that part
//   'blocked' – the condition references qKey but the value does NOT satisfy it
//   'neutral' – the condition doesn't reference qKey at all

export type ProfMatch = "fires" | "blocked" | "neutral"

function looseEq(a: unknown, b: unknown): boolean {
  if (a === b) return true
  const an = typeof a === "string" ? Number(a) : a
  const bn = typeof b === "string" ? Number(b) : b
  if (typeof an === "number" && typeof bn === "number" && !isNaN(an) && !isNaN(bn))
    return an === bn
  return String(a) === String(b)
}

function evalLeaf(answer: unknown, op: string, value: unknown): boolean {
  switch (op) {
    case "equals":       return looseEq(answer, value)
    case "not_equals":   return !looseEq(answer, value)
    case "in":           return Array.isArray(value) && value.some((v) => looseEq(answer, v))
    case "not_in":       return Array.isArray(value) && !value.some((v) => looseEq(answer, v))
    case "greater_than": { const n = Number(answer), c = Number(value); return !isNaN(n) && !isNaN(c) && n > c }
    case "less_than":    { const n = Number(answer), c = Number(value); return !isNaN(n) && !isNaN(c) && n < c }
    case "between": {
      if (!Array.isArray(value) || value.length < 2) return false
      const n = Number(answer), lo = Number(value[0]), hi = Number(value[1])
      return !isNaN(n) && !isNaN(lo) && !isNaN(hi) && n >= lo && n <= hi
    }
    default: return false
  }
}

function evalLegacyPred(answer: unknown, pred: unknown): boolean {
  if (pred === null || typeof pred !== "object" || Array.isArray(pred))
    return looseEq(answer, pred)
  const obj = pred as Record<string, unknown>
  for (const [op, val] of Object.entries(obj)) {
    if (!evalLeaf(answer, op, val)) return false
  }
  return true
}

export function matchesProfession(cond: unknown, qKey: string, value: unknown): ProfMatch {
  if (!cond || typeof cond !== "object" || Array.isArray(cond)) return "neutral"
  const c = cond as Record<string, unknown>

  if (Array.isArray(c.all)) {
    const results = (c.all as unknown[]).map((x) => matchesProfession(x, qKey, value))
    if (results.every((r) => r === "neutral")) return "neutral"
    return results.some((r) => r === "blocked") ? "blocked" : "fires"
  }

  if (Array.isArray(c.any)) {
    const results = (c.any as unknown[]).map((x) => matchesProfession(x, qKey, value))
    if (results.every((r) => r === "neutral")) return "neutral"
    return results.some((r) => r === "fires") ? "fires" : "blocked"
  }

  if (typeof c.key === "string") {
    if (c.key !== qKey) return "neutral"
    return evalLeaf(value, c.op as string, c.value) ? "fires" : "blocked"
  }

  // Legacy
  if (qKey in c) return evalLegacyPred(value, c[qKey]) ? "fires" : "blocked"
  return "neutral"
}
