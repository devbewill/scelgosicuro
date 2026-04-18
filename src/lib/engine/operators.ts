export type Condition = Record<string, unknown>

function toNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }
  return null
}

function looseEquals(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a === null || a === undefined || b === null || b === undefined) return false
  const an = toNumber(a), bn = toNumber(b)
  if (an !== null && bn !== null) return an === bn
  return String(a) === String(b)
}

// ---------------------------------------------------------------------------
// evalCondition — supports two formats:
//
// 1. New DSL:  {"key":"q_sinistri_5_anni","op":"greater_than","value":2}
// 2. Legacy:   {"q_sinistri_5_anni":{"greater_than":2}}  or  {"q_sinistri_5_anni":0}
// 3. Logical:  {"all":[…]}  {"any":[…]}
// ---------------------------------------------------------------------------

export function evalCondition(
  cond: Condition | null | undefined,
  answers: Record<string, unknown>
): boolean {
  if (cond === null || cond === undefined) return false

  // logical combinators
  if (Array.isArray(cond.all)) {
    return (cond.all as Condition[]).every((c) => evalCondition(c, answers))
  }
  if (Array.isArray(cond.any)) {
    return (cond.any as Condition[]).some((c) => evalCondition(c, answers))
  }

  // new DSL: {key, op, value}
  if (typeof cond.key === "string" && typeof cond.op === "string") {
    return evalDsl(cond.key, cond.op, cond.value, answers)
  }

  // legacy / dimension-values: every top-level key is a question key
  const keys = Object.keys(cond)
  if (keys.length === 0) return true
  return keys.every((k) => evalPredicate(k, cond[k], answers))
}

function evalDsl(
  key: string,
  op: string,
  value: unknown,
  answers: Record<string, unknown>
): boolean {
  const answer = answers[key]
  switch (op) {
    case "equals":      return looseEquals(answer, value)
    case "not_equals":  return !looseEquals(answer, value)
    case "in":          return Array.isArray(value) && value.some((v) => looseEquals(answer, v))
    case "not_in":      return Array.isArray(value) && !value.some((v) => looseEquals(answer, v))
    case "greater_than": {
      const n = toNumber(answer), c = toNumber(value)
      return n !== null && c !== null && n > c
    }
    case "less_than": {
      const n = toNumber(answer), c = toNumber(value)
      return n !== null && c !== null && n < c
    }
    case "between": {
      if (!Array.isArray(value) || value.length < 2) return false
      const n = toNumber(answer), lo = toNumber(value[0]), hi = toNumber(value[1])
      return n !== null && lo !== null && hi !== null && n >= lo && n <= hi
    }
    default: return false
  }
}

function evalPredicate(
  key: string,
  pred: unknown,
  answers: Record<string, unknown>
): boolean {
  const answer = answers[key]
  if (pred === null || typeof pred !== "object" || Array.isArray(pred)) {
    return looseEquals(answer, pred)
  }
  const obj = pred as Record<string, unknown>
  if ("equals"       in obj) return looseEquals(answer, obj.equals)
  if ("not_equals"   in obj) return !looseEquals(answer, obj.not_equals)
  if ("in"           in obj && Array.isArray(obj.in))
    return (obj.in as unknown[]).some((v) => looseEquals(answer, v))
  if ("not_in"       in obj && Array.isArray(obj.not_in))
    return !(obj.not_in as unknown[]).some((v) => looseEquals(answer, v))
  if ("greater_than" in obj) {
    const n = toNumber(answer), c = toNumber(obj.greater_than)
    return n !== null && c !== null && n > c
  }
  if ("less_than"    in obj) {
    const n = toNumber(answer), c = toNumber(obj.less_than)
    return n !== null && c !== null && n < c
  }
  if ("between"      in obj && Array.isArray(obj.between) && obj.between.length === 2) {
    const n = toNumber(answer), lo = toNumber(obj.between[0]), hi = toNumber(obj.between[1])
    return n !== null && lo !== null && hi !== null && n >= lo && n <= hi
  }
  return false
}
