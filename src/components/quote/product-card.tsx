import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { QuoteResult } from "@/lib/data/results"

const EUR = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
})

export function ProductCard({
  result,
  badge,
}: {
  result: QuoteResult
  badge?: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{result.insurerName}</CardTitle>
        <CardDescription>{result.productName}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {badge ? (
          <span className="text-muted-foreground text-xs uppercase tracking-wide">
            {badge}
          </span>
        ) : null}
        {result.annualPrice !== null ? (
          <div>
            <div className="text-2xl font-semibold">
              {EUR.format(result.annualPrice)}
              <span className="text-muted-foreground text-sm font-normal">
                {" "}
                / anno
              </span>
            </div>
            {result.monthlyPrice !== null ? (
              <div className="text-muted-foreground text-sm">
                {EUR.format(result.monthlyPrice)} / mese
              </div>
            ) : null}
          </div>
        ) : (
          <div className="text-muted-foreground text-sm">
            Prezzo non disponibile
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function ExcludedCard({ result }: { result: QuoteResult }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{result.insurerName}</CardTitle>
        <CardDescription>{result.productName}</CardDescription>
      </CardHeader>
      <CardContent>
        <span className="text-destructive text-sm">
          Non disponibile: {result.excludedReason ?? "requisiti non soddisfatti"}
        </span>
      </CardContent>
    </Card>
  )
}
