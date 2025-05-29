import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PandoraPro - CRM Advogados Previdenciários',
  description: 'Sistema especializado de CRM para advogados do direito previdenciário, com gestão de clientes e atendimento via WhatsApp.',
  keywords: 'CRM, advogados, previdenciário, INSS, WhatsApp, gestão jurídica',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          {children}
        </div>
      </body>
    </html>
  )
} 