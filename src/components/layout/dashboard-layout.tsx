"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sidebar } from './sidebar'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import { LayoutDashboard, Users, Columns, MessageSquare, BarChart, Settings } from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, current: false },
    { name: 'Clientes', href: '/clientes', icon: Users, current: false },
    { name: 'Kanban', href: '/kanban', icon: Columns, current: false },
    { name: 'Atendimentos', href: '/atendimentos', icon: MessageSquare, current: false },
    { name: 'Relatórios', href: '/relatorios', icon: BarChart, current: false },
    { name: 'Configurações', href: '/configuracoes', icon: Settings, current: false },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar para desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Sidebar para mobile */}
      {sidebarOpen && (
        <div className="lg:hidden">
          <div 
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <Sidebar className="z-50" />
        </div>
      )}

      {/* Main content */}
      <motion.div
        initial={{ marginLeft: 0 }}
        animate={{ marginLeft: 280 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="lg:ml-[280px]"
      >
        {/* Mobile header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-semibold">PandoraPro</h1>
          <div /> {/* Spacer */}
        </div>

        {/* Page content */}
        <main className="min-h-[calc(100vh-4rem)] lg:min-h-screen">
          {children}
        </main>
      </motion.div>
    </div>
  )
} 