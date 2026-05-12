import { Playfair_Display } from "next/font/google"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
})

export default function Landing2Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className={playfair.variable}>{children}</div>
}
