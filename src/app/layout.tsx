import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

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
    <html lang="it" className={`h-full antialiased ${inter.variable}`}>
      <body className="min-h-full">{children}</body>
    </html>
  )
}
