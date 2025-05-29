import React from 'react'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'PandoraPro | CRM para Advogados Previdenciários',
  description: 'Sistema CRM especializado para escritórios de advocacia previdenciária com gestão de casos, clientes e processos INSS.',
  keywords: 'CRM advocacia, previdenciário, INSS, benefícios, gestão jurídica',
  authors: [{ name: 'PandoraPro' }],
  openGraph: {
    title: 'PandoraPro | CRM para Advogados Previdenciários',
    description: 'Sistema CRM especializado para escritórios de advocacia previdenciária',
    type: 'website'
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <main className="min-h-screen">
            {children}
          </main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
} 