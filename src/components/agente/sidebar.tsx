"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const nav = [
  { href: "/agente",                  label: "Dashboard" },
  { href: "/agente/polizze",          label: "Le mie polizze" },
  { href: "/agente/preventivo",       label: "Calcola preventivo" },
  { href: "/agente/set-informativi",  label: "Set informativi" },
  { href: "/agente/supporto",         label: "Supporto" },
]

export function AgenteSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 flex w-56 flex-col bg-white border-r border-[#e2dbd0]">
      <div className="flex h-16 items-center border-b border-[#e2dbd0] px-5">
        <Link href="/agente" className="font-bold text-lg text-[#1C1C1A] tracking-tight font-[family-name:var(--font-heading)]">
          scelgosicuro<span className="text-[#ff88c8]">.</span>
        </Link>
      </div>

      <nav className="flex flex-col gap-1 p-3 flex-1">
        <p className="px-3 pb-2 pt-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#1C1C1A]/30">
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
              className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? "bg-[#ffe0f2] text-[#1C1C1A] font-semibold"
                  : "text-[#1C1C1A]/50 hover:text-[#1C1C1A] hover:bg-[#fbf8f5]"
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-[#e2dbd0] p-4">
        <Link href="/" className="text-xs font-medium text-[#1C1C1A]/40 hover:text-[#1C1C1A] transition-colors">
          ← Torna al sito
        </Link>
      </div>
    </aside>
  )
}
