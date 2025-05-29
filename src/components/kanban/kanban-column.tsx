'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { KanbanCard } from './kanban-card'
import { Cliente, StatusType } from '@/types/cliente'

interface KanbanColumnProps {
  column: {
    id: StatusType
    title: string
    description: string
    color: string
    icon: React.ReactNode
    limit?: number
  }
  clientes: Cliente[]
  onClienteClick: (cliente: Cliente) => void
  isDragging: boolean
}

export function KanbanColumn({
  column,
  clientes,
  onClienteClick,
  isDragging
}: KanbanColumnProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [isDraggedOver, setIsDraggedOver] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    return dropTargetForElements({
      element,
      getData: () => ({ columnId: column.id }),
      canDrop: ({ source }) => {
        // Só aceita drops de cards de clientes
        return source.data.type === 'kanban-card'
      },
      onDragEnter: () => setIsDraggedOver(true),
      onDragLeave: () => setIsDraggedOver(false),
      onDrop: () => setIsDraggedOver(false)
    })
  }, [column.id])

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.1,
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1]
      }
    }),
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  }

  return (
    <Card 
      ref={ref}
      className={`${column.color} transition-all duration-200 ${
        isDraggedOver ? 'ring-2 ring-juridico-azul ring-opacity-50 scale-105' : ''
      } ${isDragging ? 'bg-opacity-80' : ''}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {column.icon}
            <CardTitle className="text-lg font-semibold">
              {column.title}
            </CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium bg-white bg-opacity-70 px-2 py-1 rounded-full">
              {clientes.length}
            </span>
            {column.limit && (
              <span className="text-xs text-muted-foreground">
                / {column.limit}
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{column.description}</p>
      </CardHeader>

      <CardContent className="pt-0">
        <div 
          className={`space-y-3 min-h-[200px] transition-all duration-200 ${
            isDraggedOver ? 'bg-juridico-azul bg-opacity-5 rounded-lg p-2' : ''
          }`}
        >
          <AnimatePresence mode="popLayout">
            {clientes.map((cliente, index) => (
              <motion.div
                key={cliente.id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                custom={index}
                layout
                className="cursor-pointer"
                onClick={() => onClienteClick(cliente)}
              >
                <KanbanCard cliente={cliente} />
              </motion.div>
            ))}
          </AnimatePresence>

          {clientes.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-32 text-center text-muted-foreground"
            >
              <div>
                <div className="text-4xl mb-2 opacity-50">📋</div>
                <p className="text-sm">Nenhum caso nesta fase</p>
              </div>
            </motion.div>
          )}

          {/* Indicador visual de drop zone ativo */}
          {isDraggedOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="border-2 border-dashed border-juridico-azul rounded-lg p-4 text-center text-juridico-azul"
            >
              <div className="text-sm font-medium">
                Solte aqui para mover para "{column.title}"
              </div>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 