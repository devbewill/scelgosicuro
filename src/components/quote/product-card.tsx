import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { QuoteResult } from "@/lib/types"

const EUR = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", minimumFractionDigits: 2 })

export function ProductCard({ result, badge }: { result: QuoteResult; badge?: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{result.insurerName}</CardTitle>
        <CardDescription>{result.productName}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {badge && (
          <span className="text-xs uppercase tracking-wide text-muted-foreground">{badge}</span>
        )}
        {result.premiumTotal !== null ? (
          <div className="text-2xl font-semibold">
            {EUR.format(result.premiumTotal)}
            <span className="text-sm font-normal text-muted-foreground"> / anno</span>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Prezzo non disponibile</div>
        )}
      </CardContent>
    </Card>
  )
}

export function ManualQuoteCard({ result }: { result: QuoteResult }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{result.insurerName}</CardTitle>
        <CardDescription>{result.productName}</CardDescription>
      </CardHeader>
      <CardContent>
        <span className="text-sm text-muted-foreground">
          {result.exclusionReason ?? "Preventivo personalizzato su richiesta"}
        </span>
      </CardContent>
    </Card>
  )
}

export function ExcludedCard({ result }: { result: QuoteResult }) {
  return (
    <Card className="opacity-60">
      <CardHeader>
        <CardTitle className="text-sm">{result.insurerName} — {result.productName}</CardTitle>
      </CardHeader>
      <CardContent>
        <span className="text-xs text-destructive">
          {result.exclusionReason ?? "Requisiti non soddisfatti"}
        </span>
      </CardContent>
    </Card>
  )
}
