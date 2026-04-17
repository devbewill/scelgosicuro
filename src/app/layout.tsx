import type { Metadata } from "next"
import "./globals.css"

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
    <html lang="it" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  )
}
