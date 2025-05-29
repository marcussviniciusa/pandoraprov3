"use client"

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import {
  Home,
  Users,
  Briefcase,
  Calendar,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Scale,
  Bell,
  User,
  Menu,
  Columns,
  MessageCircle
} from 'lucide-react'

interface SidebarProps {
  className?: string
}

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: Users, label: 'Clientes', href: '/clientes' },
  { icon: Columns, label: 'Kanban', href: '/kanban' },
  { icon: FileText, label: 'Documentos', href: '/documentos' },
  { icon: MessageCircle, label: 'WhatsApp', href: '/whatsapp' },
  { icon: Briefcase, label: 'Casos', href: '/casos' },
  { icon: Calendar, label: 'Agenda', href: '/agenda' },
  { icon: Bell, label: 'Notificações', href: '/notificacoes' },
  { icon: Settings, label: 'Configurações', href: '/configuracoes' }
]

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const { toast } = useToast()

  const handleLogout = () => {
    toast({
      variant: "success",
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso!"
    })
  }

  const sidebarVariants = {
    expanded: { width: 280 },
    collapsed: { width: 80 }
  }

  const itemVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -10 }
  }

  return (
    <motion.div
      initial="expanded"
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed left-0 top-0 z-50 h-screen bg-card border-r border-border shadow-lg",
        className
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center space-x-2"
              >
                <Scale className="h-8 w-8 text-juridico-azul" />
                <span className="text-xl font-bold text-juridico-azul">
                  PandoraPro
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-auto"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback className="bg-juridico-azul text-white">
                JS
              </AvatarFallback>
            </Avatar>
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium text-foreground truncate">
                    Dr. João Silva
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    Admin • Escritório Silva
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-1 p-2">
          {menuItems.map((item, index) => {
            const isActive = pathname === item.href
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={item.href}>
                  <Button
                    variant={isActive ? "juridico" : "ghost"}
                    className={cn(
                      "w-full justify-start relative",
                      isCollapsed ? "px-2" : "px-3",
                      isActive && "bg-juridico-azul/10 border border-juridico-azul/20"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", isCollapsed ? "mx-auto" : "mr-3")} />
                    <AnimatePresence mode="wait">
                      {!isCollapsed && (
                        <motion.span
                          variants={itemVariants}
                          initial="collapsed"
                          animate="expanded"
                          exit="collapsed"
                          transition={{ duration: 0.2 }}
                          className="truncate"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute right-2 h-2 w-2 rounded-full bg-juridico-azul"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Button>
                </Link>
              </motion.div>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              "w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50",
              isCollapsed ? "px-2" : "px-3"
            )}
          >
            <LogOut className={cn("h-5 w-5", isCollapsed ? "mx-auto" : "mr-3")} />
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.span
                  variants={itemVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  transition={{ duration: 0.2 }}
                >
                  Sair
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </div>
    </motion.div>
  )
} 