"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { ProductCard, ManualQuoteCard, ExcludedCard } from "@/components/quote/product-card"
import type { QuoteResult } from "@/lib/types"

export function ResultsView({ results }: { results: QuoteResult[] }) {
  const [showOthers, setShowOthers] = React.useState(false)
  const [showExcluded, setShowExcluded] = React.useState(false)

  const safe     = results.find((r) => r.slot === "safe")
  const economic = results.find((r) => r.slot === "economic")
  const others   = results.filter((r) => r.slot === null && !r.exclusionReason && !r.manualQuote)
  const manuals  = results.filter((r) => r.manualQuote)
  const excluded = results.filter((r) => !r.manualQuote && !!r.exclusionReason)

  if (results.length === 0) {
    return <p className="text-sm text-muted-foreground">Nessun prodotto disponibile.</p>
  }

  return (
    <div className="flex flex-col gap-8">
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
