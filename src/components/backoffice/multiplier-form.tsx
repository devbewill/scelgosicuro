"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { upsertMultiplier } from "@/app/backoffice/actions"

const OPERATORS = [
  { value: "equals",       label: "= uguale a" },
  { value: "not_equals",   label: "≠ diverso da" },
  { value: "greater_than", label: "> maggiore di" },
  { value: "less_than",    label: "< minore di" },
  { value: "between",      label: "tra (min,max)" },
  { value: "in",           label: "∈ uno di (a,b,c)" },
]

type Coverage = { id: number; key: string; name: string }

type MultiplierInit = {
  id?: number
  coverage_id?: number | null
  name?: string
  factor?: number
  condition?: unknown
  priority?: number
}

export function MultiplierForm({
  productId,
  coverages,
  initial,
  onClose,
}: {
  productId: number
  coverages: Coverage[]
  initial?: MultiplierInit
  onClose: () => void
}) {
  const [mode, setMode] = React.useState<"simple" | "raw">("simple")
  const [name, setName] = React.useState(initial?.name ?? "")
  const [factor, setFactor] = React.useState(String(initial?.factor ?? "1.00"))
  const [coverageId, setCoverageId] = React.useState<string | null>(
    initial?.coverage_id ? String(initial.coverage_id) : "product"
  )
  const [priority, setPriority] = React.useState(String(initial?.priority ?? 0))

  const [key, setKey] = React.useState("")
  const [op, setOp] = React.useState("equals")
  const [val, setVal] = React.useState("")

  const [rawJson, setRawJson] = React.useState(
    initial?.condition ? JSON.stringify(initial.condition, null, 2) : ""
  )

  const [error, setError] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState(false)

  const factorNum = parseFloat(factor) || 1
  const delta = Math.round((factorNum - 1) * 100)
  const deltaLabel = delta === 0 ? "nessuna variazione" : delta > 0 ? `+${delta}% maggiorazione` : `${delta}% sconto`

  function buildCondition(): unknown {
    if (mode === "raw") {
      try { return JSON.parse(rawJson) } catch { throw new Error("JSON condizione non valido") }
    }
    if (!key.trim()) throw new Error("Inserisci la chiave domanda")
    if (!val.trim()) throw new Error("Inserisci il valore")
    const parsedVal = op === "between" || op === "in"
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
    const res = await upsertMultiplier({
      id: initial?.id,
      product_id: productId,
      coverage_id: (!coverageId || coverageId === "product") ? null : Number(coverageId),
      name,
      factor: factorNum,
      condition,
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
          <Label>Nome moltiplicatore</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="es. Sconto struttura" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Applica a</Label>
          <Select value={coverageId ?? "product"} onValueChange={(v) => setCoverageId(v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="product">Tutto il prodotto</SelectItem>
              {coverages.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name} ({c.key})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Fattore</Label>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            value={factor}
            onChange={(e) => setFactor(e.target.value)}
            className="font-mono"
          />
          <span className="text-xs text-muted-foreground">{deltaLabel}</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Priorità</Label>
          <Input type="number" value={priority} onChange={(e) => setPriority(e.target.value)} min={0} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Label>Condizione</Label>
          <button type="button" onClick={() => setMode(mode === "simple" ? "raw" : "simple")}
            className="text-xs text-muted-foreground underline">
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
              <Input value={val} onChange={(e) => setVal(e.target.value)} placeholder="35  oppure  10,20" className="font-mono text-xs" />
            </div>
          </div>
        ) : (
          <textarea
            className="min-h-24 w-full rounded-md border bg-muted px-3 py-2 font-mono text-xs outline-none focus:ring-1 focus:ring-ring"
            value={rawJson}
            onChange={(e) => setRawJson(e.target.value)}
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
