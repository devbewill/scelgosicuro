"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BrandLogo } from "@/components/landing/brand-logo"

const nav = [
  { href: "/agente",                 label: "Dashboard" },
  { href: "/agente/polizze",         label: "Le mie polizze" },
  { href: "/agente/preventivo",      label: "Calcola preventivo" },
  { href: "/agente/set-informativi", label: "Set informativi" },
  { href: "/agente/supporto",        label: "Supporto" },
]

export function AgenteSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 flex w-56 flex-col bg-forest">
      <div className="flex h-16 items-center border-b border-white/10 px-5">
        <Link href="/agente" className="flex items-center gap-2">
          <BrandLogo className="w-6 h-6" invert />
          <span className="font-black text-base tracking-tighter uppercase text-white">
            ScelgoSicuro
          </span>
        </Link>
      </div>

      <nav className="flex flex-col gap-0.5 p-3 flex-1">
        <p className="px-3 pb-2 pt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
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
                  ? "bg-mint/20 text-mint font-semibold"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <Link href="/" className="text-xs font-medium text-white/30 hover:text-white/70 transition-colors">
          ← Torna al sito
        </Link>
      </div>
    </aside>
  )
}
