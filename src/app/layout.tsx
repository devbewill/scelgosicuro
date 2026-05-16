import type { Metadata } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-heading" })

export const metadata: Metadata = {
  title: "scelgosicuro",
  description: "Comparatore assicurativo multi-compagnia",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="it" className={`h-full antialiased ${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-full">{children}</body>
    </html>
  )
}
