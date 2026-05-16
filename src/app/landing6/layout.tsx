import { DM_Serif_Display } from "next/font/google"

const serif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
})

export default function Landing6Layout({ children }: { children: React.ReactNode }) {
  return <div className={serif.variable}>{children}</div>
}
