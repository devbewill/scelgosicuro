import { DM_Mono } from "next/font/google"
import type { ReactNode } from "react"

const mono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-mono",
})

export default function Landing9Layout({ children }: { children: ReactNode }) {
  return <div className={mono.variable}>{children}</div>
}
