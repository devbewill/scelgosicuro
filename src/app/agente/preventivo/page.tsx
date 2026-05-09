import Link from "next/link"
import { getSectors } from "@/lib/data/catalog"

export default async function AgentePreventivoPage() {
  const sectors = await getSectors()

  return (
    <main className="flex min-h-screen w-full flex-col gap-8 p-8">
      <header className="border-b-2 border-black pb-6">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30">AREA AGENTE</p>
        <h1 className="text-4xl font-black uppercase tracking-tight">Calcola preventivo</h1>
        <p className="mt-1 text-sm font-medium text-black/50">Avvia un nuovo preventivo per un cliente.</p>
      </header>

      <div className="flex flex-col gap-4 max-w-lg">
        <div className="border-2 border-black p-6 flex flex-col gap-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 mb-3">Settore professionale</p>
            <div className="flex flex-col gap-2">
              {sectors.map((s) => (
                <Link
                  key={s.id}
                  href={`/?sector=${s.id}`}
                  className="flex items-center justify-between border-2 border-black px-4 py-3 font-bold hover:bg-green-400 transition-colors group"
                >
                  <span>{s.name}</span>
                  <span className="text-black/30 group-hover:text-black font-black text-xs">→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
        <p className="text-xs font-medium text-black/40">
          Verrai reindirizzato al form di preventivo sul sito principale.
        </p>
      </div>
    </main>
  )
}
