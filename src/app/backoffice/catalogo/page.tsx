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
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b-2 border-black bg-white px-6">
        <h1 className="text-sm font-black uppercase tracking-widest">Catalogo</h1>
        <span className="text-xs font-bold text-black/40">{products.length} prodotti</span>
      </header>

      <main className="flex flex-col gap-8 p-6">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/backoffice/catalogo"
            className={`border-2 px-3 py-1 text-xs font-black uppercase tracking-wide transition-colors ${
              !sector ? "border-black bg-black text-white" : "border-black text-black hover:bg-black hover:text-white"
            }`}
          >
            Tutti
          </Link>
          {sectors.map((s) => (
            <Link
              key={s.slug}
              href={`/backoffice/catalogo?sector=${s.slug}`}
              className={`border-2 px-3 py-1 text-xs font-black uppercase tracking-wide transition-colors ${
                sector === s.slug ? "border-black bg-black text-white" : "border-black text-black hover:bg-black hover:text-white"
              }`}
            >
              {s.name}
              <span className="ml-1.5 opacity-50">{s.productCount}</span>
            </Link>
          ))}
        </div>

        {[...bySector.entries()].map(([sectorName, prods]) => (
          <section key={sectorName}>
            <h2 className="mb-3 text-[10px] font-black uppercase tracking-[0.25em] text-black/30">
              {sectorName}
            </h2>
            <div className="border-2 border-black overflow-hidden">
              <table className="w-full text-sm">
                <thead className="border-b-2 border-black bg-black text-white">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-black uppercase tracking-wide">Prodotto</th>
                    <th className="px-4 py-2.5 text-left text-xs font-black uppercase tracking-wide">Compagnia</th>
                    <th className="px-3 py-2.5 text-center text-xs font-black uppercase tracking-wide">Cop.</th>
                    <th className="px-3 py-2.5 text-center text-xs font-black uppercase tracking-wide">Regole</th>
                    <th className="px-3 py-2.5 text-center text-xs font-black uppercase tracking-wide">Molt.</th>
                    <th className="px-3 py-2.5 text-center text-xs font-black uppercase tracking-wide">Addon</th>
                    <th className="px-3 py-2.5 text-center text-xs font-black uppercase tracking-wide">Stato</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {prods.map((p, i) => (
                    <tr key={p.id} className={`border-b border-black/10 ${i % 2 === 0 ? "bg-white" : "bg-black/[0.02]"}`}>
                      <td className="px-4 py-3">
                        <div className="font-black">{p.name}</div>
                        <div className="text-xs text-black/40 font-mono">{p.slug}</div>
                      </td>
                      <td className="px-4 py-3 font-medium text-black/60">{p.insurer.name}</td>
                      <td className="px-3 py-3 text-center"><Pill n={p.coverageCount} /></td>
                      <td className="px-3 py-3 text-center"><Pill n={p.ruleCount} warn={p.ruleCount === 0} /></td>
                      <td className="px-3 py-3 text-center"><Pill n={p.multiplierCount} /></td>
                      <td className="px-3 py-3 text-center"><Pill n={p.addonCount} /></td>
                      <td className="px-3 py-3 text-center">
                        <span className={`border-2 px-2 py-0.5 text-xs font-black uppercase tracking-wide ${
                          p.is_active ? "border-green-400 bg-green-400 text-black" : "border-black/20 text-black/30"
                        }`}>
                          {p.is_active ? "Attivo" : "Off"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/backoffice/catalogo/${p.id}`}
                          className="text-xs font-black uppercase tracking-wide hover:text-green-600"
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
          <p className="text-sm font-bold text-black/40">Nessun prodotto trovato.</p>
        )}
      </main>
    </div>
  )
}

function Pill({ n, warn }: { n: number; warn?: boolean }) {
  return (
    <span className={`inline-flex h-6 min-w-6 items-center justify-center border-2 px-1.5 text-xs font-black ${
      warn && n === 0 ? "border-red-500 bg-red-500 text-white" : "border-black/20 text-black"
    }`}>
      {n}
    </span>
  )
}
