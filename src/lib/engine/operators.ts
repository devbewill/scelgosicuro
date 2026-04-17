export type RuleOperator =
  | "equals"
  | "not_equals"
  | "in"
  | "not_in"
  | "greater_than"
  | "less_than"
  | "between"

export type RuleInput = {
  operator: RuleOperator
  expected_value?: string | null
  expected_values?: string[] | null
  range_min?: number | null
  range_max?: number | null
}

function toNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }
  return null
}

function toStr(v: unknown): string | null {
  if (v === null || v === undefined) return null
  if (typeof v === "boolean") return v ? "true" : "false"
  return String(v)
}

export function matchRule(rule: RuleInput, answer: unknown): boolean {
  switch (rule.operator) {
    case "equals":
      return toStr(answer) === (rule.expected_value ?? null)
    case "not_equals":
      return toStr(answer) !== (rule.expected_value ?? null)
    case "in": {
      const set = rule.expected_values ?? []
      if (Array.isArray(answer)) {
        return answer.map(toStr).some((a) => a !== null && set.includes(a))
      }
      const s = toStr(answer)
      return s !== null && set.includes(s)
    }
    case "not_in": {
      const set = rule.expected_values ?? []
      if (Array.isArray(answer)) {
        return answer.map(toStr).every((a) => a === null || !set.includes(a))
      }
      const s = toStr(answer)
      return s === null || !set.includes(s)
    }
    case "greater_than": {
      const n = toNumber(answer)
      const cmp = toNumber(rule.expected_value)
      return n !== null && cmp !== null && n > cmp
    }
    case "less_than": {
      const n = toNumber(answer)
      const cmp = toNumber(rule.expected_value)
      return n !== null && cmp !== null && n < cmp
    }
    case "between": {
      const n = toNumber(answer)
      if (n === null) return false
      const lo = rule.range_min
      const hi = rule.range_max
      if (lo !== null && lo !== undefined && n < lo) return false
      if (hi !== null && hi !== undefined && n > hi) return false
      return true
    }
    default:
      return false
  }
}
