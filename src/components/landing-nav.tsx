import Link from "next/link";

const LANDINGS = [
  { href: "/", label: "1" },
  { href: "/landing2", label: "2" },
  { href: "/landing3", label: "3" },
  { href: "/landing4", label: "4" },
  { href: "/landing5", label: "5" },
  { href: "/landing6", label: "6" },
  { href: "/landing7", label: "7" },
];

export function LandingNav({ current, variant = "light" }: { current: string; variant?: "light" | "dark" }) {
  const active = current;
  const color = variant === "dark" ? "text-white/30 hover:text-white" : "text-[#1A1A1E]/25 hover:text-[#1A1A1E]";
  const activeColor = variant === "dark" ? "text-white bg-white/10" : "text-[#1A1A1E] bg-[#1A1A1E]/8";

  return (
    <div className="flex items-center gap-1">
      {LANDINGS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${l.label === active ? activeColor : color} hover:scale-110`}
        >
          {l.label}
        </Link>
      ))}
    </div>
  );
}
