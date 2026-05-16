"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

const LANDINGS = [
  { href: "/",         label: "1" },
  { href: "/landing2", label: "2" },
  { href: "/landing3", label: "3" },
  { href: "/landing4", label: "4" },
  { href: "/landing5", label: "5" },
  { href: "/landing6", label: "6" },
  { href: "/landing7", label: "7" },
]

export function LandingNav({ current, variant = "light" }: { current: string; variant?: "light" | "dark" }) {
  const router = useRouter()

  const color       = variant === "dark" ? "text-white/30 hover:text-white"      : "text-[#1A1A1E]/25 hover:text-[#1A1A1E]"
  const activeColor = variant === "dark" ? "text-white bg-white/10"              : "text-[#1A1A1E] bg-[#1A1A1E]/8"

  const selectStyle = variant === "dark"
    ? { background: "rgba(255,255,255,0.10)", color: "#fff",      border: "1px solid rgba(255,255,255,0.18)" }
    : { background: "rgba(26,26,30,0.07)",   color: "#1A1A1E",   border: "1px solid rgba(26,26,30,0.18)" }

  return (
    <>
      {/* ── mobile: compact dropdown ── */}
      <div className="flex md:hidden">
        <select
          value={current}
          onChange={e => {
            const target = LANDINGS.find(l => l.label === e.target.value)
            if (target) router.push(target.href)
          }}
          className="appearance-none text-xs font-bold px-3 py-1.5 rounded-full outline-none cursor-pointer"
          style={selectStyle}
        >
          {LANDINGS.map(l => (
            <option key={l.href} value={l.label} style={{ background: "#1A1A1E", color: "#fff" }}>
              Landing {l.label}
            </option>
          ))}
        </select>
      </div>

      {/* ── desktop: pill row ── */}
      <div className="hidden md:flex items-center gap-1">
        {LANDINGS.map(l => (
          <Link
            key={l.href}
            href={l.href}
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${l.label === current ? activeColor : color} hover:scale-110`}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </>
  )
}
