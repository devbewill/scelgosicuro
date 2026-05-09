"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const nav = [
  { href: "/agente",                label: "Dashboard" },
  { href: "/agente/polizze",        label: "Le mie polizze" },
  { href: "/agente/preventivo",     label: "Calcola preventivo" },
  { href: "/agente/set-informativi",label: "Set informativi" },
  { href: "/agente/supporto",       label: "Supporto" },
]

export function AgenteSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 flex w-56 flex-col border-r-2 border-black bg-black">
      <div className="flex h-14 items-center border-b-2 border-white/10 px-4">
        <Link href="/agente" className="text-sm font-black uppercase tracking-widest text-white">
          scelgosicuro<span className="text-green-400"> /agente</span>
        </Link>
      </div>

      <nav className="flex flex-col gap-0 p-3 flex-1">
        <p className="px-2 pb-2 pt-1 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
          Area Agente
        </p>
        {nav.map((item) => {
          const active = item.href === "/agente"
            ? pathname === "/agente"
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-2 py-2 text-sm font-bold uppercase tracking-wide transition-colors ${
                active
                  ? "bg-green-400 text-black"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t-2 border-white/10 p-4">
        <Link href="/" className="text-xs font-bold uppercase tracking-wide text-white/40 hover:text-white">
          ← Torna al sito
        </Link>
      </div>
    </aside>
  )
}
