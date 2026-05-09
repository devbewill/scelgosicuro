"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { BOQuestion, BOSector } from "@/lib/data/backoffice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { upsertSectorQuestion, deleteSectorQuestion } from "@/app/backoffice/actions"

const TYPE_LABELS: Record<string, string> = {
  dropdown:    "Dropdown",
  number:      "Numero",
  text:        "Testo",
  boolean:     "Sì/No",
  date:        "Data",
  multiselect: "Multi-select",
}

// ─────────────────────────────────────────────────────────────────────────────

export function QuestionPageClient({
  questions,
  sectors,
  currentSector,
}: {
  questions: BOQuestion[]
  sectors: BOSector[]
  currentSector?: string
}) {
  const router = useRouter()
  const [showAdd, setShowAdd] = React.useState(false)
  const [editQ, setEditQ] = React.useState<BOQuestion | null>(null)

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b-2 border-black bg-white px-6">
        <h1 className="text-sm font-black uppercase tracking-widest">Domande</h1>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-black/40">{questions.length} domande</span>
          <button
            onClick={() => setShowAdd(true)}
            className="border-2 border-black bg-black px-3 py-1.5 text-xs font-black uppercase tracking-wide text-white hover:bg-green-400 hover:text-black transition-colors"
          >
            + Aggiungi domanda
          </button>
        </div>
      </header>

      <main className="flex flex-col gap-6 p-6">
        {/* Sector filter */}
        <div className="flex flex-wrap gap-2">
          <Link
            href="/backoffice/domande"
            className={`border-2 px-3 py-1 text-xs font-black uppercase tracking-wide transition-colors ${
              !currentSector ? "border-black bg-black text-white" : "border-black text-black hover:bg-black hover:text-white"
            }`}
          >
            Tutte
          </Link>
          {sectors.map((s) => (
            <Link
              key={s.slug}
              href={`/backoffice/domande?sector=${s.slug}`}
              className={`border-2 px-3 py-1 text-xs font-black uppercase tracking-wide transition-colors ${
                currentSector === s.slug ? "border-black bg-black text-white" : "border-black text-black hover:bg-black hover:text-white"
              }`}
            >
              {s.name}
            </Link>
          ))}
        </div>

        {/* Questions list */}
        <div className="flex flex-col gap-2">
          {questions.map((q) => (
            <QuestionRow key={q.id} q={q} onEdit={() => setEditQ(q)} />
          ))}
          {questions.length === 0 && (
            <p className="text-sm font-bold text-black/40">Nessuna domanda trovata.</p>
          )}
        </div>
      </main>

      {/* Add modal */}
      {showAdd && (
        <Modal title="Aggiungi domanda" onClose={() => setShowAdd(false)}>
          <AddQuestionForm
            sectors={sectors}
            onClose={() => { setShowAdd(false); router.refresh() }}
          />
        </Modal>
      )}

      {/* Edit modal */}
      {editQ && (
        <Modal title={`Modifica — ${editQ.key}`} onClose={() => setEditQ(null)}>
          <EditQuestionForm
            question={editQ}
            onClose={() => { setEditQ(null); router.refresh() }}
          />
        </Modal>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

function DeleteButton({ id }: { id: number }) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)

  async function handleDelete() {
    if (!confirm("Eliminare questa domanda?")) return
    setLoading(true)
    await deleteSectorQuestion(id)
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="border-2 border-red-500 px-2 py-1 text-xs font-black uppercase tracking-wide text-red-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-30"
    >
      {loading ? "…" : "Elimina"}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

function QuestionRow({ q, onEdit }: { q: BOQuestion; onEdit: () => void }) {
  const [open, setOpen] = React.useState(false)
  const hasOptions = q.options && q.options.length > 0

  return (
    <div className="border-2 border-black overflow-hidden">
      {/* Main row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <code className="shrink-0 font-mono text-xs bg-black text-green-400 px-2 py-0.5">{q.key}</code>

        <span className="flex-1 text-sm font-medium">{q.label}</span>

        <span className="shrink-0 border-2 border-black/20 px-2 py-0.5 text-xs font-black uppercase tracking-wide">
          {TYPE_LABELS[q.type] ?? q.type}
        </span>

        <div className="flex shrink-0 flex-wrap gap-1">
          {q.sectorNames.map((name) => (
            <span key={name} className="border border-black/20 px-2 py-0.5 text-xs font-bold">{name}</span>
          ))}
          {q.sectorNames.length === 0 && (
            <span className="text-xs font-bold text-black/30">Nessun settore</span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {hasOptions && (
            <button
              onClick={() => setOpen((o) => !o)}
              className="text-xs font-bold text-black/40 hover:text-black"
            >
              {open ? "▲" : "▼"} {q.options!.length} opzioni
            </button>
          )}
          <button
            onClick={onEdit}
            className="border-2 border-black px-2 py-1 text-xs font-black uppercase tracking-wide hover:bg-black hover:text-white transition-colors"
          >
            Modifica
          </button>
          <DeleteButton id={q.id} />
        </div>
      </div>

      {/* Expanded options */}
      {open && hasOptions && (
        <div className="border-t-2 border-black/10 bg-black/[0.02] px-4 py-3">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left">
                <th className="pb-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-black/30 w-1/3">Valore DB</th>
                <th className="pb-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Label utente</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {q.options!.map((o, i) => (
                <tr key={i} className="border-t border-black/10">
                  <td className="py-1 pr-4 text-black/40">{String(o.value)}</td>
                  <td className="py-1 font-bold">{o.label ?? String(o.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

function EditQuestionForm({
  question,
  onClose,
}: {
  question: BOQuestion
  onClose: () => void
}) {
  const [label, setLabel] = React.useState(question.label)
  const [optionsRaw, setOptionsRaw] = React.useState(
    question.options
      ? question.options.map((o) => `${o.value}|${o.label ?? o.value}`).join("\n")
      : ""
  )
  const [error, setError] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState(false)

  const hasOptions = question.type === "dropdown" || question.type === "multiselect"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    let options: unknown = null
    if (hasOptions) {
      if (!optionsRaw.trim()) { setError("Inserisci almeno un'opzione"); return }
      try {
        options = optionsRaw.trim().split("\n").filter(Boolean).map((line) => {
          const [rawValue, ...rest] = line.split("|")
          const value = rawValue.trim()
          const label = rest.join("|").trim() || value
          // preserve numeric values
          return { value: isNaN(Number(value)) || value === "" ? value : Number(value), label }
        })
      } catch { setError("Formato non valido"); return }
    }

    setSaving(true)
    const res = await upsertSectorQuestion({
      id: question.id,
      sector_id: 0,
      key: question.key,
      label,
      help_text: null,
      type: question.type,
      options,
      position: 0,
      is_required: true,
    })
    setSaving(false)
    if (!res.ok) { setError(res.error ?? "Errore"); return }
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label>Chiave (immutabile)</Label>
        <code className="rounded bg-muted px-3 py-2 font-mono text-sm">{question.key}</code>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Label (testo mostrato all'utente)</Label>
        <Input value={label} onChange={(e) => setLabel(e.target.value)} required />
      </div>

      {hasOptions && (
        <div className="flex flex-col gap-1.5">
          <Label>
            Opzioni{" "}
            <span className="font-normal text-muted-foreground">
              (una per riga: <code className="font-mono text-xs">valore|Label visibile</code>)
            </span>
          </Label>
          <textarea
            className="min-h-48 w-full rounded-md border bg-muted px-3 py-2 font-mono text-xs outline-none focus:ring-1 focus:ring-ring"
            value={optionsRaw}
            onChange={(e) => setOptionsRaw(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            {optionsRaw.trim().split("\n").filter(Boolean).length} opzioni.
            I valori numerici vengono salvati come numeri (es. <code className="font-mono">1000000|€1.000.000</code>).
          </p>
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onClose}>Annulla</Button>
        <Button type="submit" disabled={saving}>{saving ? "Salvo…" : "Salva"}</Button>
      </div>
    </form>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

function AddQuestionForm({
  sectors,
  onClose,
}: {
  sectors: BOSector[]
  onClose: () => void
}) {
  const [key, setKey] = React.useState("")
  const [label, setLabel] = React.useState("")
  const [type, setType] = React.useState("dropdown")
  const [sectorId, setSectorId] = React.useState<string | null>(null)
  const [isRequired, setIsRequired] = React.useState(true)
  const [position, setPosition] = React.useState("99")
  const [optionsRaw, setOptionsRaw] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!sectorId) { setError("Seleziona un settore"); return }
    const sectorIdNum = Number(sectorId)

    let options: unknown = null
    if (type === "dropdown" || type === "multiselect") {
      if (!optionsRaw.trim()) { setError("Inserisci le opzioni"); return }
      try {
        options = optionsRaw.trim().split("\n").filter(Boolean).map((line) => {
          const [rawValue, ...rest] = line.split("|")
          const value = rawValue.trim()
          return { value: isNaN(Number(value)) || value === "" ? value : Number(value), label: rest.join("|").trim() || value }
        })
      } catch { setError("Formato opzioni non valido"); return }
    }

    setSaving(true)
    const res = await upsertSectorQuestion({
      sector_id: sectorIdNum,
      key: key.trim(),
      label: label.trim(),
      help_text: null,
      type,
      options,
      position: Number(position),
      is_required: isRequired,
    })
    setSaving(false)
    if (!res.ok) { setError(res.error ?? "Errore"); return }
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Chiave (question_key)</Label>
          <Input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="q_nuova_domanda"
            className="font-mono text-xs"
            required
          />
          <p className="text-xs text-muted-foreground">Immutabile dopo il salvataggio</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Tipo</Label>
          <Select value={type} onValueChange={(v) => v && setType(v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(TYPE_LABELS).map(([v, l]) => (
                <SelectItem key={v} value={v}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Label (testo mostrato all'utente)</Label>
        <Input value={label} onChange={(e) => setLabel(e.target.value)} required />
      </div>

      {(type === "dropdown" || type === "multiselect") && (
        <div className="flex flex-col gap-1.5">
          <Label>Opzioni <span className="font-normal text-muted-foreground">(una per riga: <code className="font-mono text-xs">valore|Label visibile</code>)</span></Label>
          <textarea
            className="min-h-28 w-full rounded-md border bg-muted px-3 py-2 font-mono text-xs outline-none focus:ring-1 focus:ring-ring"
            value={optionsRaw}
            onChange={(e) => setOptionsRaw(e.target.value)}
            placeholder={"si|Sì\nno|No"}
          />
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Settore</Label>
          <Select value={sectorId ?? ""} onValueChange={setSectorId}>
            <SelectTrigger><SelectValue placeholder="Seleziona…" /></SelectTrigger>
            <SelectContent>
              {sectors.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Posizione</Label>
          <Input type="number" value={position} onChange={(e) => setPosition(e.target.value)} min={0} />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
              className="h-4 w-4 rounded border"
            />
            <span className="text-sm">Obbligatoria</span>
          </label>
        </div>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onClose}>Annulla</Button>
        <Button type="submit" disabled={saving}>{saving ? "Salvo…" : "Aggiungi"}</Button>
      </div>
    </form>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-xl border-2 border-black bg-white p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between border-b-2 border-black pb-4">
          <h2 className="font-black uppercase tracking-wide">{title}</h2>
          <button onClick={onClose} className="font-black text-black/40 hover:text-black">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}
