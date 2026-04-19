const OP_LABELS: Record<string, string> = {
  equals:        "=",
  not_equals:    "≠",
  greater_than:  ">",
  less_than:     "<",
  between:       "tra",
  in:            "∈",
  not_in:        "∉",
}

function renderSingle(cond: Record<string, unknown>): string {
  // new DSL: {key, op, value}
  if (typeof cond.key === "string" && typeof cond.op === "string") {
    const op = OP_LABELS[cond.op] ?? cond.op
    const v = Array.isArray(cond.value) ? cond.value.join(" — ") : String(cond.value)
    return `${cond.key} ${op} ${v}`
  }

  const entries = Object.entries(cond)
  if (entries.length === 0) return "—"

  const parts: string[] = []
  for (const [k, v] of entries) {
    if (k === "all" || k === "any") continue
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      // legacy: {q_key: {operator: value}}
      const inner = v as Record<string, unknown>
      const [[op, val]] = Object.entries(inner)
      const opLabel = OP_LABELS[op] ?? op
      const display = Array.isArray(val) ? val.join(" — ") : String(val)
      parts.push(`${k} ${opLabel} ${display}`)
    } else {
      parts.push(`${k} = ${String(v)}`)
    }
  }
  return parts.join(", ") || "—"
}

function renderCondition(cond: unknown, depth = 0): string {
  if (!cond || typeof cond !== "object") return String(cond ?? "—")
  const c = cond as Record<string, unknown>

  if (Array.isArray(c.all)) {
    const parts = (c.all as unknown[]).map((sub) => renderCondition(sub, depth + 1))
    const joined = parts.join(" AND ")
    return depth > 0 ? `(${joined})` : joined
  }
  if (Array.isArray(c.any)) {
    const parts = (c.any as unknown[]).map((sub) => renderCondition(sub, depth + 1))
    const joined = parts.join(" OR ")
    return depth > 0 ? `(${joined})` : joined
  }
  return renderSingle(c)
}

export function ConditionDisplay({ condition }: { condition: unknown }) {
  const text = renderCondition(condition)
  return (
    <code className="text-xs font-mono bg-muted rounded px-1.5 py-0.5 break-all">
      {text}
    </code>
  )
}

export { renderCondition }
