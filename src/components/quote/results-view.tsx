"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { ProductCard, ManualQuoteCard, ExcludedCard } from "@/components/quote/product-card"
import { tuneQuote } from "@/app/actions"
import { evalCondition } from "@/lib/engine/operators"
import type { QuoteResult, SectorQuestion } from "@/lib/types"

export function ResultsView({
  results,
  sessionId,
  tuningQuestions,
  savedAnswers,
}: {
  results: QuoteResult[]
  sessionId: string
  tuningQuestions: SectorQuestion[]
  savedAnswers: Record<string, unknown>
}) {
  const router = useRouter()
  const [showOthers, setShowOthers] = React.useState(false)
  const [showExcluded, setShowExcluded] = React.useState(false)
  const [tuning, setTuning] = React.useState(false)
  const [tuneError, setTuneError] = React.useState<string | null>(null)

  const [selections, setSelections] = React.useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    for (const q of tuningQuestions) {
      const saved = savedAnswers[q.key]
      init[q.key] = saved !== undefined && saved !== null ? String(saved) : ""
    }
    return init
  })

  const safe     = results.find((r) => r.slot === "safe")
  const economic = results.find((r) => r.slot === "economic")
  const others   = results.filter((r) => r.slot === null && !r.exclusionReason && !r.manualQuote)
  const manuals  = results.filter((r) => r.manualQuote)
  const excluded = results.filter((r) => !r.manualQuote && !!r.exclusionReason)

  const hasAnyEstimate = results.some((r) => r.isEstimate && r.premiumTotal !== null)

  // Sector optional questions (no section) → affect base price
  // Addon product questions (have section) → add coverages
  const allVisible = tuningQuestions.filter((q) => {
    if (!q.visibleIf) return true
    return evalCondition(q.visibleIf, { ...savedAnswers, ...selections })
  })
  const visiblePriceQuestions = allVisible.filter((q) => !q.section)
  const visibleAddonQuestions = allVisible.filter((q) => !!q.section)

  async function handleTune() {
    const answers: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(selections)) {
      if (v !== "") {
        const q = tuningQuestions.find((q) => q.key === k)
        if (q?.type === "number") {
          answers[k] = Number(v)
        } else {
          answers[k] = isNaN(Number(v)) || v === "" ? v : Number(v)
        }
      }
    }
    setTuning(true)
    setTuneError(null)
    const res = await tuneQuote(sessionId, answers)
    if (res.ok) {
      router.refresh()
    } else {
      setTuneError(res.error)
    }
    setTuning(false)
  }

  if (results.length === 0) {
    return <p className="text-sm text-muted-foreground">Nessun prodotto disponibile.</p>
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Tuning bar */}
      {(visiblePriceQuestions.length > 0 || visibleAddonQuestions.length > 0) && (
        <section className="rounded-lg border bg-muted/30 p-4 flex flex-col gap-4">

          {visiblePriceQuestions.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">
                {hasAnyEstimate ? "Personalizza per ottenere il prezzo esatto:" : "Filtra le proposte:"}
              </p>
              <div className="flex flex-wrap items-end gap-3">
                {visiblePriceQuestions.map((q) => (
                  <div key={q.key} className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">{q.label}</span>
                    <TuningSelect q={q} selections={selections} setSelections={setSelections} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {visibleAddonQuestions.length > 0 && (
            <div className="flex flex-col gap-2 border-t pt-3">
              <p className="text-sm font-medium">Garanzie aggiuntive</p>
              <p className="text-xs text-muted-foreground">Seleziona le coperture che vuoi aggiungere e clicca Aggiorna per vedere il nuovo prezzo.</p>
              <div className="flex flex-wrap items-end gap-3">
                {visibleAddonQuestions.map((q) => (
                  <div key={q.key} className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">{q.label}</span>
                    <TuningSelect q={q} selections={selections} setSelections={setSelections} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button size="sm" onClick={handleTune} disabled={tuning} className="h-8">
              {tuning ? "Aggiorno…" : "Aggiorna"}
            </Button>
            {tuneError && <p className="text-xs text-destructive">{tuneError}</p>}
          </div>
        </section>
      )}

      {(safe || economic) && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Proposte in evidenza</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {safe     && <ProductCard result={safe}     badge="Sicuro" />}
            {economic && <ProductCard result={economic} badge="Economico" />}
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Altre proposte</h2>
            <Button variant="ghost" onClick={() => setShowOthers((v) => !v)}>
              {showOthers ? "Nascondi" : `Mostra (${others.length})`}
            </Button>
          </div>
          {showOthers && (
            <div className="flex flex-col gap-3">
              {others.map((r) => <ProductCard key={r.id} result={r} />)}
            </div>
          )}
        </section>
      )}

      {manuals.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Preventivo su misura</h2>
          <div className="flex flex-col gap-3">
            {manuals.map((r) => <ManualQuoteCard key={r.id} result={r} />)}
          </div>
        </section>
      )}

      {excluded.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium text-muted-foreground">Prodotti non disponibili</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowExcluded((v) => !v)}>
              {showExcluded ? "Nascondi" : `Mostra (${excluded.length})`}
            </Button>
          </div>
          {showExcluded && (
            <div className="flex flex-col gap-2">
              {excluded.map((r) => <ExcludedCard key={r.id} result={r} />)}
            </div>
          )}
        </section>
      )}
    </div>
  )
}

function TuningSelect({
  q,
  selections,
  setSelections,
}: {
  q: import("@/lib/types").SectorQuestion
  selections: Record<string, string>
  setSelections: React.Dispatch<React.SetStateAction<Record<string, string>>>
}) {
  const val = selections[q.key] ?? ""
  return (
    <Select
      value={val}
      onValueChange={(v) => setSelections((s) => ({ ...s, [q.key]: v ?? "" }))}
    >
      <SelectTrigger className="h-8 w-44 text-sm">
        <span className="truncate">
          {(() => {
            if (!val) return <span className="text-muted-foreground">Qualsiasi</span>
            const opt = (q.options ?? []).find((o) => String(o.value) === val)
            return opt?.label ?? val
          })()}
        </span>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">Qualsiasi</SelectItem>
        {(q.options ?? []).map((opt) => (
          <SelectItem key={String(opt.value)} value={String(opt.value)}>
            {opt.label ?? String(opt.value)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
