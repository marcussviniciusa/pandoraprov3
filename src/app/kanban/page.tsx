'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { BlurFade } from '@/components/magicui/blur-fade'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency, formatDate, formatCPF } from '@/lib/utils'
import {
  Search,
  Plus,
  Filter,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  User,
  Scale
} from 'lucide-react'

// Interface Cliente simplificada
interface Cliente {
  _id: string
  nome: string
  cpf: string
  email?: string
  telefone: string
  statusProcessual: string
  especialidade: string
  prioridade: string
  dadosPrevidenciarios?: {
    valorBeneficio?: number
  }
  createdAt: Date
  updatedAt: Date
}

// Configuração das colunas do Kanban
const kanbanColumns = [
  {
    id: 'consulta_inicial',
    title: 'Consulta Inicial',
    color: 'bg-blue-500',
    icon: '👥'
  },
  {
    id: 'documentacao_pendente',
    title: 'Documentação Pendente',
    color: 'bg-yellow-500',
    icon: '📄'
  },
  {
    id: 'analise_caso',
    title: 'Análise do Caso',
    color: 'bg-orange-500',
    icon: '🔍'
  },
  {
    id: 'protocolo_inss',
    title: 'Protocolo INSS',
    color: 'bg-purple-500',
    icon: '📋'
  },
  {
    id: 'aguardando_resposta',
    title: 'Aguardando Resposta',
    color: 'bg-indigo-500',
    icon: '⏳'
  },
  {
    id: 'recurso_contestacao',
    title: 'Recurso/Contestação',
    color: 'bg-red-500',
    icon: '⚖️'
  },
  {
    id: 'deferido',
    title: 'Deferido',
    color: 'bg-green-500',
    icon: '✅'
  },
  {
    id: 'indeferido',
    title: 'Indeferido',
    color: 'bg-gray-500',
    icon: '❌'
  }
]

// Labels e cores
const prioridadeColors: Record<string, string> = {
  baixa: 'bg-green-100 text-green-800 border-green-200',
  normal: 'bg-blue-100 text-blue-800 border-blue-200',
  alta: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  urgente: 'bg-red-100 text-red-800 border-red-200'
}

const especialidadeLabels: Record<string, string> = {
  aposentadoria_idade: 'Aposentadoria por Idade',
  aposentadoria_tempo_contribuicao: 'Aposentadoria por Tempo',
  aposentadoria_especial: 'Aposentadoria Especial',
  auxilio_doenca: 'Auxílio-Doença',
  bpc: 'BPC',
  pensao_morte: 'Pensão por Morte'
}

function getInitials(nome: string) {
  return nome
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function KanbanPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEspecialidade, setSelectedEspecialidade] = useState<string>('todas')
  const [selectedPrioridade, setSelectedPrioridade] = useState<string>('todas')
  
  const { toast } = useToast()

  // Carregar clientes do banco de dados
  useEffect(() => {
    loadClientes()
  }, [])

  const loadClientes = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/clientes')
      
      if (!response.ok) {
        throw new Error('Erro ao carregar clientes')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setClientes(data.data || [])
      } else {
        throw new Error(data.message || 'Erro desconhecido')
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar clientes"
      })
      setClientes([])
    } finally {
      setLoading(false)
    }
  }

  // Filtrar clientes
  const clientesFiltrados = useMemo(() => {
    return clientes.filter(cliente => {
      const matchesSearch = cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cliente.cpf.includes(searchTerm) ||
                           (cliente.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      
      const matchesEspecialidade = selectedEspecialidade === 'todas' || cliente.especialidade === selectedEspecialidade
      const matchesPrioridade = selectedPrioridade === 'todas' || cliente.prioridade === selectedPrioridade

      return matchesSearch && matchesEspecialidade && matchesPrioridade
    })
  }, [clientes, searchTerm, selectedEspecialidade, selectedPrioridade])

  // Agrupar clientes por status
  const clientesPorStatus = useMemo(() => {
    const grupos: Record<string, Cliente[]> = {}
    
    kanbanColumns.forEach(column => {
      grupos[column.id] = clientesFiltrados.filter(cliente => cliente.statusProcessual === column.id)
    })
    
    return grupos
  }, [clientesFiltrados])

  // Estatísticas
  const estatisticas = useMemo(() => {
    const total = clientes.length
    const deferidos = clientes.filter(c => c.statusProcessual === 'deferido').length
    const emAndamento = clientes.filter(c => !['deferido', 'indeferido'].includes(c.statusProcessual)).length
    const valorTotal = clientes
      .filter(c => c.dadosPrevidenciarios?.valorBeneficio)
      .reduce((acc, c) => acc + (c.dadosPrevidenciarios?.valorBeneficio || 0), 0)

    return { total, deferidos, emAndamento, valorTotal }
  }, [clientes])

  const handleMoveCard = async (clienteId: string, novoStatus: string) => {
    try {
      const response = await fetch(`/api/clientes/${clienteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statusProcessual: novoStatus })
      })

      if (!response.ok) {
        throw new Error('Erro ao mover card')
      }

      await loadClientes()
      
      toast({
        variant: "success",
        title: "Status Atualizado",
        description: "Status do cliente foi atualizado com sucesso"
      })
    } catch (error) {
      console.error('Erro ao mover card:', error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao atualizar status do cliente"
      })
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-juridico-azul mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando clientes...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header com Estatísticas */}
        <BlurFade delay={0.1}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Kanban Jurídico</h1>
              <p className="text-muted-foreground">
                Visualização em tempo real dos processos previdenciários
              </p>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-juridico-azul">{estatisticas.total}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{estatisticas.deferidos}</div>
                <div className="text-sm text-muted-foreground">Deferidos</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{estatisticas.emAndamento}</div>
                <div className="text-sm text-muted-foreground">Em Andamento</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-juridico-azul">{formatCurrency(estatisticas.valorTotal)}</div>
                <div className="text-sm text-muted-foreground">Valor Total</div>
              </Card>
            </div>
          </div>
        </BlurFade>

        {/* Filtros */}
        <BlurFade delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Buscar clientes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                
                <select
                  value={selectedEspecialidade}
                  onChange={(e) => setSelectedEspecialidade(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option value="todas">Todas Especialidades</option>
                  {Object.entries(especialidadeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                
                <select
                  value={selectedPrioridade}
                  onChange={(e) => setSelectedPrioridade(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option value="todas">Todas Prioridades</option>
                  <option value="urgente">Urgente</option>
                  <option value="alta">Alta</option>
                  <option value="normal">Normal</option>
                  <option value="baixa">Baixa</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </BlurFade>

        {/* Kanban Board */}
        <div className="overflow-x-auto">
          <div className="flex gap-6 min-w-max pb-6">
            {kanbanColumns.map((column, columnIndex) => (
              <BlurFade key={column.id} delay={0.3 + columnIndex * 0.1}>
                <div className="w-80 flex-shrink-0">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{column.icon}</span>
                          <span>{column.title}</span>
                        </div>
                        <Badge className={`${column.color} text-white`}>
                          {clientesPorStatus[column.id]?.length || 0}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 h-96 overflow-y-auto">
                      <AnimatePresence>
                        {clientesPorStatus[column.id]?.map((cliente, index) => (
                          <motion.div
                            key={cliente._id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Card className="p-4 hover:shadow-md transition-all cursor-grab active:cursor-grabbing">
                              <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback className="bg-juridico-azul text-white text-xs">
                                        {getInitials(cliente.nome)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <h4 className="font-semibold text-sm">{cliente.nome}</h4>
                                      <p className="text-xs text-muted-foreground">{formatCPF(cliente.cpf)}</p>
                                    </div>
                                  </div>
                                  <Badge className={`text-xs ${prioridadeColors[cliente.prioridade]} border`}>
                                    {cliente.prioridade}
                                  </Badge>
                                </div>

                                <div className="text-xs text-muted-foreground">
                                  {especialidadeLabels[cliente.especialidade] || cliente.especialidade}
                                </div>

                                {cliente.dadosPrevidenciarios?.valorBeneficio && (
                                  <div className="text-sm font-semibold text-juridico-azul">
                                    {formatCurrency(cliente.dadosPrevidenciarios.valorBeneficio)}
                                  </div>
                                )}

                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Phone className="h-3 w-3" />
                                  <span>{cliente.telefone}</span>
                                </div>

                                <div className="text-xs text-muted-foreground">
                                  {formatDate(cliente.updatedAt)}
                                </div>
                              </div>
                            </Card>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      
                      {clientesPorStatus[column.id]?.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <p className="text-sm">Nenhum cliente nesta fase</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </BlurFade>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {clientes.length === 0 && (
          <BlurFade delay={0.5}>
            <Card className="text-center py-12">
              <CardContent>
                <Scale className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum processo encontrado</h3>
                <p className="text-muted-foreground mb-6">
                  Comece cadastrando seus primeiros clientes para visualizar o fluxo processual
                </p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Cadastrar Cliente
                </Button>
              </CardContent>
            </Card>
          </BlurFade>
        )}
      </div>
    </DashboardLayout>
  )
} 