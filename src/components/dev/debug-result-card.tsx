"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { QuoteResult } from "@/lib/types"

const EUR = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", minimumFractionDigits: 2 })
const PCT = (f: number) => {
  const delta = Math.round((f - 1) * 100)
  return delta >= 0 ? `+${delta}%` : `${delta}%`
}

type CovDetail = {
  base: number
  dimensions: Record<string, unknown>
  multipliers: { name: string; factor: number }[]
  combined_factor: number
  subtotal: number
}
type AddonDetail = { key: string; name: string; premium: number; mode: string }
type RichBreakdown = {
  coverages: Record<string, CovDetail>
  addons: AddonDetail[]
  total: number | null
}

export function DebugResultCard({ result }: { result: QuoteResult }) {
  const bd = result.premiumBreakdown as RichBreakdown | null

  return (
    <Card className={result.exclusionReason && !result.manualQuote ? "opacity-60" : ""}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">
          {result.insurerName} — {result.productName}
          {result.slot && (
            <span className="ml-2 rounded px-1.5 py-0.5 text-xs font-bold bg-primary text-primary-foreground">
              {result.slot === "safe" ? "SICURO" : "ECONOMICO"}
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 text-sm">
        {/* ESCLUSO */}
        {result.exclusionReason && !result.manualQuote && (
          <p className="text-destructive">Escluso: {result.exclusionReason}</p>
        )}

        {/* MANUAL QUOTE */}
        {result.manualQuote && (
          <p className="text-muted-foreground">Preventivo su misura — {result.exclusionReason}</p>
        )}

        {/* CALCOLO */}
        {bd && (
          <div className="space-y-3">
            {Object.entries(bd.coverages).map(([key, cov]) => (
              <div key={key} className="space-y-1 border-l-2 border-border pl-3">
                <p className="font-bold uppercase tracking-wide text-xs text-muted-foreground">{key}</p>

                {/* dimensioni matchate */}
                <p className="font-mono text-xs text-muted-foreground">
                  {Object.entries(cov.dimensions)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join("  ·  ")}
                </p>

                {/* base → moltiplicatori → subtotale */}
                <div className="flex flex-wrap items-center gap-1 text-xs">
                  <span className="rounded bg-muted px-1.5 py-0.5">base {EUR.format(cov.base)}</span>
                  {cov.multipliers.length === 0 && (
                    <span className="text-muted-foreground">nessun moltiplicatore</span>
                  )}
                  {cov.multipliers.map((m, i) => (
                    <span key={i} className="flex items-center gap-1">
                      <span className="text-muted-foreground">×</span>
                      <span
                        className={`rounded px-1.5 py-0.5 ${m.factor < 1 ? "bg-green-100 text-green-800" : m.factor > 1 ? "bg-red-100 text-red-800" : "bg-muted"}`}
                        title={m.name}
                      >
                        {m.factor} ({PCT(m.factor)}) — {m.name}
                      </span>
                    </span>
                  ))}
                  {cov.multipliers.length > 0 && (
                    <>
                      <span className="text-muted-foreground">=</span>
                      <span className="font-bold">{EUR.format(cov.subtotal)}</span>
                    </>
                  )}
                  {cov.multipliers.length === 0 && (
                    <span className="font-bold">{EUR.format(cov.subtotal)}</span>
                  )}
                </div>
              </div>
            ))}

            {/* addon */}
            {bd.addons.length > 0 && (
              <div className="space-y-1 border-l-2 border-border pl-3">
                <p className="font-bold uppercase tracking-wide text-xs text-muted-foreground">addon</p>
                {bd.addons.map((a) => (
                  <div key={a.key} className="flex items-center gap-1 text-xs">
                    <span className="rounded bg-muted px-1.5 py-0.5">+{EUR.format(a.premium)}</span>
                    <span>{a.name}</span>
                    <span className="text-muted-foreground">({a.mode})</span>
                  </div>
                ))}
              </div>
            )}

            {/* totale */}
            <div className="flex items-baseline gap-2 pt-1 border-t">
              <span className="text-xs text-muted-foreground">TOTALE</span>
              <span className="text-xl font-bold">
                {result.premiumTotal !== null ? EUR.format(result.premiumTotal) : "—"}
              </span>
              <span className="text-xs text-muted-foreground">/ anno</span>
            </div>
          </div>
        )}

        {/* no breakdown e no esclusione */}
        {!bd && !result.exclusionReason && !result.manualQuote && (
          <p className="text-muted-foreground">Prezzo non disponibile</p>
        )}
      </CardContent>
    </Card>
  )
}
