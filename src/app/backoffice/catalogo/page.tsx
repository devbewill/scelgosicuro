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
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-[#e2dbd0] bg-white px-6">
        <h1 className="text-sm font-bold text-[#1C1C1A] font-[family-name:var(--font-heading)]">Catalogo</h1>
        <span className="text-xs font-medium text-[#1C1C1A]/40">{products.length} prodotti</span>
      </header>

      <main className="flex flex-col gap-8 p-6">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/backoffice/catalogo"
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              !sector
                ? "bg-[#1C1C1A] text-white"
                : "border border-[#e2dbd0] text-[#1C1C1A]/60 hover:text-[#1C1C1A] hover:border-[#1C1C1A]/30"
            }`}
          >
            Tutti
          </Link>
          {sectors.map((s) => (
            <Link
              key={s.slug}
              href={`/backoffice/catalogo?sector=${s.slug}`}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                sector === s.slug
                  ? "bg-[#1C1C1A] text-white"
                  : "border border-[#e2dbd0] text-[#1C1C1A]/60 hover:text-[#1C1C1A] hover:border-[#1C1C1A]/30"
              }`}
            >
              {s.name}
              <span className="ml-1.5 opacity-50">{s.productCount}</span>
            </Link>
          ))}
        </div>

        {[...bySector.entries()].map(([sectorName, prods]) => (
          <section key={sectorName}>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-[#1C1C1A]/40">
              {sectorName}
            </h2>
            <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="border-b border-[#e2dbd0] bg-[#fbf8f5]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#1C1C1A]/40 uppercase tracking-wide">Prodotto</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#1C1C1A]/40 uppercase tracking-wide">Compagnia</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-[#1C1C1A]/40 uppercase tracking-wide">Cop.</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-[#1C1C1A]/40 uppercase tracking-wide">Regole</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-[#1C1C1A]/40 uppercase tracking-wide">Molt.</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-[#1C1C1A]/40 uppercase tracking-wide">Addon</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-[#1C1C1A]/40 uppercase tracking-wide">Stato</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {prods.map((p, i) => (
                    <tr key={p.id} className={`border-b border-[#e2dbd0] last:border-b-0 ${i % 2 === 0 ? "bg-white" : "bg-[#fbf8f5]"}`}>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[#1C1C1A]">{p.name}</div>
                        <div className="text-xs text-[#1C1C1A]/40 font-mono">{p.slug}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#1C1C1A]/60">{p.insurer.name}</td>
                      <td className="px-3 py-3 text-center"><Pill n={p.coverageCount} /></td>
                      <td className="px-3 py-3 text-center"><Pill n={p.ruleCount} warn={p.ruleCount === 0} /></td>
                      <td className="px-3 py-3 text-center"><Pill n={p.multiplierCount} /></td>
                      <td className="px-3 py-3 text-center"><Pill n={p.addonCount} /></td>
                      <td className="px-3 py-3 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          p.is_active
                            ? "bg-[#ffe0f2] text-[#1C1C1A]"
                            : "bg-[#fbf8f5] text-[#1C1C1A]/30"
                        }`}>
                          {p.is_active ? "Attivo" : "Off"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/backoffice/catalogo/${p.id}`}
                          className="text-xs font-semibold text-[#1C1C1A]/40 hover:text-[#ff88c8] transition-colors"
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
          <p className="text-sm font-medium text-[#1C1C1A]/40">Nessun prodotto trovato.</p>
        )}
      </main>
    </div>
  )
}

function Pill({ n, warn }: { n: number; warn?: boolean }) {
  return (
    <span className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-semibold ${
      warn && n === 0
        ? "bg-red-100 text-red-600"
        : "bg-[#fbf8f5] text-[#1C1C1A]/60"
    }`}>
      {n}
    </span>
  )
}
