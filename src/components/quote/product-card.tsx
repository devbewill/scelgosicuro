import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { QuoteResult } from "@/lib/types"

const EUR = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", minimumFractionDigits: 2 })

type AddonDetail = { key: string; name: string; premium: number | null; manual: boolean }

function getAddons(result: QuoteResult): AddonDetail[] {
  const bd = result.premiumBreakdown as Record<string, unknown> | null
  if (!bd || !Array.isArray(bd.addons)) return []
  return bd.addons as AddonDetail[]
}

export function ProductCard({ result, badge }: { result: QuoteResult; badge?: string }) {
  const addons = getAddons(result)
  const activeAddons = addons.filter((a) => a.premium !== null || a.manual)

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
            {result.isEstimate && (
              <span className="text-sm font-normal text-muted-foreground mr-1">da</span>
            )}
            {EUR.format(result.premiumTotal)}
            <span className="text-sm font-normal text-muted-foreground"> / anno</span>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Prezzo non disponibile</div>
        )}

        {activeAddons.length > 0 && (
          <div className="mt-1 flex flex-col gap-1 border-t pt-2">
            {activeAddons.map((a) => (
              <div key={a.key} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">+ {a.name}</span>
                {a.manual
                  ? <span className="text-amber-600 font-medium">su richiesta</span>
                  : a.premium === 0
                    ? <span className="text-green-600 font-medium">inclusa</span>
                    : <span className="font-medium">{EUR.format(a.premium!)}</span>
                }
              </div>
            ))}
          </div>
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
