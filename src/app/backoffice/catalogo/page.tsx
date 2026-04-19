import Link from "next/link"
import { getBackofficeProducts } from "@/lib/data/backoffice"
import { getBackofficeSectors } from "@/lib/data/backoffice"

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ sector?: string }>
}) {
  const { sector } = await searchParams
  const [products, sectors] = await Promise.all([
    getBackofficeProducts(sector),
    getBackofficeSectors(),
  ])

  const bySector = new Map<string, typeof products>()
  for (const p of products) {
    const key = p.sector.name
    if (!bySector.has(key)) bySector.set(key, [])
    bySector.get(key)!.push(p)
  }

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-card px-6">
        <h1 className="text-sm font-bold">Catalogo</h1>
        <span className="text-xs text-muted-foreground">{products.length} prodotti</span>
      </header>

      <main className="flex flex-col gap-6 p-6">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/backoffice/catalogo"
            className={`rounded-full px-3 py-1 text-xs font-bold border transition-colors ${
              !sector ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"
            }`}
          >
            Tutti
          </Link>
          {sectors.map((s) => (
            <Link
              key={s.slug}
              href={`/backoffice/catalogo?sector=${s.slug}`}
              className={`rounded-full px-3 py-1 text-xs font-bold border transition-colors ${
                sector === s.slug ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"
              }`}
            >
              {s.name}
              <span className="ml-1.5 opacity-70">{s.productCount}</span>
            </Link>
          ))}
        </div>

        {[...bySector.entries()].map(([sectorName, prods]) => (
          <section key={sectorName}>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {sectorName}
            </h2>
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-bold">Prodotto</th>
                    <th className="px-4 py-2.5 text-left font-bold">Compagnia</th>
                    <th className="px-3 py-2.5 text-center font-bold">Cop.</th>
                    <th className="px-3 py-2.5 text-center font-bold">Regole</th>
                    <th className="px-3 py-2.5 text-center font-bold">Molt.</th>
                    <th className="px-3 py-2.5 text-center font-bold">Addon</th>
                    <th className="px-3 py-2.5 text-center font-bold">Stato</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {prods.map((p, i) => (
                    <tr key={p.id} className={i % 2 === 0 ? "bg-card" : "bg-muted/20"}>
                      <td className="px-4 py-3">
                        <div className="font-bold">{p.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">{p.slug}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{p.insurer.name}</td>
                      <td className="px-3 py-3 text-center"><Pill n={p.coverageCount} /></td>
                      <td className="px-3 py-3 text-center"><Pill n={p.ruleCount} warn={p.ruleCount === 0} /></td>
                      <td className="px-3 py-3 text-center"><Pill n={p.multiplierCount} /></td>
                      <td className="px-3 py-3 text-center"><Pill n={p.addonCount} /></td>
                      <td className="px-3 py-3 text-center">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                          p.is_active ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"
                        }`}>
                          {p.is_active ? "Attivo" : "Off"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/backoffice/catalogo/${p.id}`}
                          className="text-xs font-bold text-primary hover:underline"
                        >
                          Dettaglio →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}

        {products.length === 0 && (
          <p className="text-sm text-muted-foreground">Nessun prodotto trovato.</p>
        )}
      </main>
    </div>
  )
}

function Pill({ n, warn }: { n: number; warn?: boolean }) {
  return (
    <span className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-bold ${
      warn && n === 0 ? "bg-red-100 text-red-700" : "bg-muted text-foreground"
    }`}>
      {n}
    </span>
  )
}
