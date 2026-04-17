"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { ExcludedCard, ProductCard } from "@/components/quote/product-card"
import type { QuoteResult } from "@/lib/data/results"

export function ResultsView({ results }: { results: QuoteResult[] }) {
  const [showExcluded, setShowExcluded] = React.useState(false)
  const [showOthers, setShowOthers] = React.useState(false)

  const featured = results.filter((r) => !r.excluded && r.slot !== null)
  const safe = featured.find((r) => r.slot === "safe") ?? null
  const economic = featured.find((r) => r.slot === "economic") ?? null
  const others = results.filter(
    (r) => !r.excluded && r.slot === null && r.id !== safe?.id && r.id !== economic?.id
  )
  const excluded = results.filter((r) => r.excluded)

  if (results.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Nessun prodotto disponibile per questa attività.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {safe || economic ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Proposte in evidenza</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {safe ? <ProductCard result={safe} badge="Safe" /> : null}
            {economic ? (
              <ProductCard result={economic} badge="Economic" />
            ) : null}
          </div>
        </section>
      ) : null}

      {others.length > 0 ? (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Altre proposte eleggibili</h2>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowOthers((v) => !v)}
            >
              {showOthers ? "Nascondi" : `Mostra (${others.length})`}
            </Button>
          </div>
          {showOthers ? (
            <div className="flex flex-col gap-3">
              {others.map((r) => (
                <ProductCard key={r.id} result={r} />
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {excluded.length > 0 ? (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Prodotti esclusi</h2>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowExcluded((v) => !v)}
            >
              {showExcluded ? "Nascondi" : `Mostra (${excluded.length})`}
            </Button>
          </div>
          {showExcluded ? (
            <div className="flex flex-col gap-3">
              {excluded.map((r) => (
                <ExcludedCard key={r.id} result={r} />
              ))}
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}
