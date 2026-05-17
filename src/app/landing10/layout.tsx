import { Inter, DM_Mono, PT_Serif } from "next/font/google"
import type { ReactNode } from "react"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const mono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-mono",
})

const ptSerif = PT_Serif({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-pt-serif",
})

export default function Landing10Layout({ children }: { children: ReactNode }) {
  return <div className={`${inter.variable} ${mono.variable} ${ptSerif.variable}`}>{children}</div>
}