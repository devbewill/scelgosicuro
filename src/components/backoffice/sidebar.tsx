"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const subnav = [
  { href: "/backoffice/catalogo",   label: "Catalogo" },
  { href: "/backoffice/domande",    label: "Domande" },
  { href: "/backoffice/simulatore", label: "Simulatore" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 flex w-56 flex-col border-r bg-card">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/backoffice" className="text-sm font-bold tracking-tight">
          scelgosicuro<span className="text-muted-foreground"> / admin</span>
        </Link>
      </div>

      <nav className="flex flex-col gap-0 p-2 flex-1">
        <p className="px-3 pb-1 pt-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Gestione Prodotti
        </p>
        {subnav.map((item) => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-4">
        <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">
          ← Torna al sito
        </Link>
      </div>
    </aside>
  )
}
