"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { upsertEligibilityRule } from "@/app/backoffice/actions"

const OPERATORS = [
  { value: "equals",       label: "= uguale a" },
  { value: "not_equals",   label: "≠ diverso da" },
  { value: "greater_than", label: "> maggiore di" },
  { value: "less_than",    label: "< minore di" },
  { value: "between",      label: "tra (min,max)" },
  { value: "in",           label: "∈ uno di (a,b,c)" },
  { value: "not_in",       label: "∉ nessuno di" },
]

type Rule = {
  id?: number
  name?: string
  condition?: unknown
  action?: string
  reason?: string | null
  priority?: number
}

function parseSimple(cond: unknown): { key: string; op: string; val: string } | null {
  if (!cond || typeof cond !== "object" || Array.isArray(cond)) return null
  const c = cond as Record<string, unknown>
  if (c.all || c.any) return null

  // new DSL: { key, op, value }
  if (typeof c.key === "string" && typeof c.op === "string") {
    const val = Array.isArray(c.value) ? (c.value as unknown[]).join(",") : String(c.value ?? "")
    return { key: c.key, op: c.op, val }
  }

  // legacy: { q_key: {op: val} } or { q_key: "val" }
  const entries = Object.entries(c)
  if (entries.length === 1) {
    const [k, v] = entries[0]
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      const [[op, rawVal]] = Object.entries(v as Record<string, unknown>)
      const val = Array.isArray(rawVal) ? (rawVal as unknown[]).join(",") : String(rawVal ?? "")
      return { key: k, op, val }
    }
    return { key: k, op: "equals", val: String(v ?? "") }
  }
  return null
}

export function RuleForm({
  productId,
  initial,
  onClose,
}: {
  productId: number
  initial?: Rule
  onClose: () => void
}) {
  const parsed = React.useMemo(() => parseSimple(initial?.condition), [initial?.condition])

  const [mode, setMode] = React.useState<"simple" | "raw">(
    initial?.condition ? (parsed ? "simple" : "raw") : "simple"
  )
  const [name, setName] = React.useState(initial?.name ?? "")
  const [action, setAction] = React.useState<"exclude" | "manual_quote">(
    (initial?.action as "exclude" | "manual_quote") ?? "exclude"
  )
  const [reason, setReason] = React.useState(initial?.reason ?? "")
  const [priority, setPriority] = React.useState(String(initial?.priority ?? 0))

  // simple condition fields — pre-populated from existing condition
  const [key, setKey] = React.useState(parsed?.key ?? "")
  const [op, setOp] = React.useState(parsed?.op ?? "equals")
  const [val, setVal] = React.useState(parsed?.val ?? "")

  // raw condition
  const [rawJson, setRawJson] = React.useState(
    initial?.condition ? JSON.stringify(initial.condition, null, 2) : ""
  )

  const [error, setError] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState(false)

  function buildCondition(): unknown {
    if (mode === "raw") {
      try { return JSON.parse(rawJson) } catch { throw new Error("JSON condizione non valido") }
    }
    if (!key.trim()) throw new Error("Inserisci la chiave domanda")
    if (!val.trim()) throw new Error("Inserisci il valore")

    const parsedVal = op === "between" || op === "in" || op === "not_in"
      ? val.split(",").map((v) => v.trim()).map((v) => isNaN(Number(v)) ? v : Number(v))
      : isNaN(Number(val)) ? val.trim() : Number(val)

    return { key: key.trim(), op, value: parsedVal }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    let condition: unknown
    try { condition = buildCondition() } catch (err) {
      setError((err as Error).message); return
    }
    setSaving(true)
    const res = await upsertEligibilityRule({
      id: initial?.id,
      product_id: productId,
      name,
      condition,
      action,
      reason,
      priority: Number(priority),
    })
    setSaving(false)
    if (!res.ok) { setError(res.error ?? "Errore"); return }
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Nome regola</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="es. Under 35 esclusi" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Priorità</Label>
          <Input type="number" value={priority} onChange={(e) => setPriority(e.target.value)} min={0} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Azione</Label>
          <Select value={action} onValueChange={(v) => v && setAction(v as "exclude" | "manual_quote")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="exclude">Escludi prodotto</SelectItem>
              <SelectItem value="manual_quote">Preventivo su misura</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Motivo mostrato all'utente</Label>
          <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="es. Età non coperta" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Label>Condizione</Label>
          <button
            type="button"
            onClick={() => setMode(mode === "simple" ? "raw" : "simple")}
            className="text-xs text-muted-foreground underline"
          >
            {mode === "simple" ? "Passa a JSON" : "Passa a wizard"}
          </button>
        </div>

        {mode === "simple" ? (
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col gap-1">
              <Label className="text-xs">Chiave domanda</Label>
              <Input value={key} onChange={(e) => setKey(e.target.value)} placeholder="q_eta" className="font-mono text-xs" />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs">Operatore</Label>
              <Select value={op} onValueChange={(v) => v && setOp(v)}>
                <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {OPERATORS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs">Valore</Label>
              <Input value={val} onChange={(e) => setVal(e.target.value)} placeholder="35  oppure  10,20,30" className="font-mono text-xs" />
            </div>
          </div>
        ) : (
          <textarea
            className="min-h-24 w-full rounded-md border bg-muted px-3 py-2 font-mono text-xs outline-none focus:ring-1 focus:ring-ring"
            value={rawJson}
            onChange={(e) => setRawJson(e.target.value)}
            placeholder={'{"key":"q_eta","op":"greater_than","value":35}'}
          />
        )}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onClose}>Annulla</Button>
        <Button type="submit" disabled={saving}>{saving ? "Salvo…" : initial?.id ? "Aggiorna" : "Aggiungi"}</Button>
      </div>
    </form>
  )
}
