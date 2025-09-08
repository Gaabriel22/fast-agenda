import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], 
})

export const metadata: Metadata = {
  title: "FastAgenda.io - Agendamento Simplificado",
  description:
    "Organize seus horários, serviços e clientes de forma simples e rápida com FastAgenda.io.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${inter.variable} antialiased bg-gray-50 text-gray-900`}
      >
        {children}
      </body>
    </html>
  )
}
