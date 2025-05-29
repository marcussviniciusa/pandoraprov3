'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatCPF } from '@/lib/utils'
import { 
  Cliente, 
  statusLabels, 
  especialidadeLabels, 
  prioridadeLabels, 
  prioridadeColors 
} from '@/types/cliente'
import {
  AlertCircle,
  Clock,
  FileText,
  GripVertical
} from 'lucide-react'

interface KanbanCardProps {
  cliente: Cliente
}

export function KanbanCard({ cliente }: KanbanCardProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    return draggable({
      element,
      dragHandle: element,
      getInitialData: () => ({
        type: 'kanban-card',
        clienteId: cliente.id,
        status: cliente.status
      }),
      onDragStart: () => {
        setIsDragging(true)
        console.log('Started dragging cliente:', cliente.nome)
      },
      onDrop: () => {
        setIsDragging(false)
        console.log('Dropped cliente:', cliente.nome)
      }
    })
  }, [cliente.id, cliente.nome, cliente.status])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    })
  }

  const calcularIdade = (nascimento: string) => {
    const hoje = new Date()
    const dataNasc = new Date(nascimento)
    let idade = hoje.getFullYear() - dataNasc.getFullYear()
    const mes = hoje.getMonth() - dataNasc.getMonth()
    if (mes < 0 || (mes === 0 && hoje.getDate() < dataNasc.getDate())) {
      idade--
    }
    return idade
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: isDragging ? 0.5 : 1, 
        scale: isDragging ? 1.05 : 1,
        rotate: isDragging ? 2 : 0
      }}
      whileHover={{ 
        scale: isDragging ? 1.05 : 1.02,
        transition: { duration: 0.2 }
      }}
      className={`group cursor-grab active:cursor-grabbing ${
        isDragging ? 'z-50' : ''
      }`}
    >
      <Card className={`border-l-4 transition-all duration-200 hover:shadow-md ${
        cliente.prioridade === 'alta' 
          ? 'border-l-red-500' 
          : cliente.prioridade === 'normal'
          ? 'border-l-blue-500'
          : 'border-l-green-500'
      } ${isDragging ? 'shadow-lg bg-white' : ''}`}>
        <CardContent className="p-4 space-y-3">
          {/* Header do Card */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="bg-juridico-azul text-white text-xs">
                  {cliente.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-sm truncate">{cliente.nome}</h4>
                <p className="text-xs text-muted-foreground">
                  {formatCPF(cliente.cpf)}
                </p>
              </div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Badge de Prioridade */}
          <div className="flex items-center justify-between">
            <span className={`px-2 py-1 text-xs rounded-full border ${prioridadeColors[cliente.prioridade]}`}>
              {prioridadeLabels[cliente.prioridade]}
            </span>
            <span className="text-xs text-muted-foreground">
              {calcularIdade(cliente.nascimento)} anos
            </span>
          </div>

          {/* Especialidade */}
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">{especialidadeLabels[cliente.especialidade]}</span>
          </div>

          {/* Valor do Benefício */}
          <div className="bg-muted/50 rounded p-2">
            <div className="text-xs text-muted-foreground">Valor do Benefício</div>
            <div className="text-sm font-bold text-juridico-azul">
              {new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              }).format(cliente.valorBeneficio)}
            </div>
          </div>

          {/* Documentos Pendentes */}
          {cliente.documentosPendentes.length > 0 && (
            <div className="flex items-center space-x-1 text-orange-600">
              <FileText className="h-3 w-3" />
              <span className="text-xs">
                {cliente.documentosPendentes.length} doc(s) pendente(s)
              </span>
            </div>
          )}

          {/* Observações (truncadas) */}
          {cliente.observacoes && (
            <div className="text-xs text-muted-foreground">
              <p className="line-clamp-2">{cliente.observacoes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{formatDate(cliente.dataUltimaInteracao)}</span>
            </div>
            <span className="truncate max-w-[100px]">
              {cliente.advogadoResponsavel.replace('Dr. ', '').replace('Dra. ', '')}
            </span>
          </div>

          {/* Indicador de drag */}
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-juridico-azul bg-opacity-10 rounded border-2 border-dashed border-juridico-azul pointer-events-none"
            />
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
} 