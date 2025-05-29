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
import { ClienteFormModal } from '@/components/forms/cliente-form-modal'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency, formatDate, formatCPF } from '@/lib/utils'
import { Cliente as ClienteForm } from '@/types/cliente'
import {
  Search,
  Plus,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'

// Interface para dados da API (diferente da interface do form)
interface ClienteAPI {
  _id: string
  nome: string
  cpf: string
  email?: string
  telefone: string
  endereco?: any
  dataNascimento?: Date
  statusProcessual: string
  especialidade: string
  prioridade: string
  advogadoResponsavel?: any
  dadosPrevidenciarios?: any
  ativo: boolean
  createdAt: Date
  updatedAt: Date
}

type SortField = 'nome' | 'createdAt' | 'statusProcessual' | 'especialidade'
type SortOrder = 'asc' | 'desc'

// Função para converter ClienteAPI para Cliente (form)
function convertToFormCliente(clienteAPI: ClienteAPI): ClienteForm {
  return {
    id: clienteAPI._id,
    nome: clienteAPI.nome,
    cpf: clienteAPI.cpf,
    email: clienteAPI.email || '',
    telefone: clienteAPI.telefone,
    endereco: clienteAPI.endereco || '',
    nascimento: clienteAPI.dataNascimento?.toISOString().split('T')[0] || '',
    status: clienteAPI.statusProcessual as any,
    especialidade: clienteAPI.especialidade as any,
    prioridade: clienteAPI.prioridade as any,
    valorBeneficio: clienteAPI.dadosPrevidenciarios?.valorBeneficio || 0,
    advogadoResponsavel: clienteAPI.advogadoResponsavel?.nome || '',
    observacoes: '',
    dataUltimaInteracao: clienteAPI.updatedAt.toISOString(),
    documentosPendentes: [],
    dataCadastro: clienteAPI.createdAt.toISOString()
  }
}

// Labels para status e especialidades
const statusLabels: Record<string, string> = {
  consulta_inicial: 'Consulta Inicial',
  documentacao_pendente: 'Documentação Pendente',
  analise_caso: 'Análise do Caso',
  protocolo_inss: 'Protocolo INSS',
  aguardando_resposta: 'Aguardando Resposta',
  recurso_contestacao: 'Recurso/Contestação',
  deferido: 'Deferido',
  indeferido: 'Indeferido'
}

const especialidadeLabels: Record<string, string> = {
  aposentadoria_idade: 'Aposentadoria por Idade',
  aposentadoria_tempo_contribuicao: 'Aposentadoria por Tempo',
  aposentadoria_especial: 'Aposentadoria Especial',
  auxilio_doenca: 'Auxílio-Doença',
  bpc: 'BPC',
  pensao_morte: 'Pensão por Morte'
}

const prioridadeLabels: Record<string, string> = {
  baixa: 'Baixa',
  normal: 'Normal',
  alta: 'Alta',
  urgente: 'Urgente'
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    consulta_inicial: 'bg-blue-500',
    documentacao_pendente: 'bg-yellow-500',
    analise_caso: 'bg-orange-500',
    protocolo_inss: 'bg-purple-500',
    aguardando_resposta: 'bg-indigo-500',
    recurso_contestacao: 'bg-red-500',
    deferido: 'bg-green-500',
    indeferido: 'bg-gray-500'
  }
  return colors[status] || 'bg-gray-500'
}

function getPrioridadeColor(prioridade: string) {
  const colors: Record<string, string> = {
    baixa: 'bg-green-500',
    normal: 'bg-blue-500',
    alta: 'bg-yellow-500',
    urgente: 'bg-red-500'
  }
  return colors[prioridade] || 'bg-gray-500'
}

function getInitials(nome: string) {
  return nome
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function ClientesPage() {
  // Estados
  const [clientes, setClientes] = useState<ClienteAPI[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('todos')
  const [selectedEspecialidade, setSelectedEspecialidade] = useState<string>('todas')
  const [selectedPrioridade, setSelectedPrioridade] = useState<string>('todas')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState<ClienteAPI | null>(null)
  
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

  // Filtros e ordenação
  const clientesFiltrados = useMemo(() => {
    let filtered = clientes.filter(cliente => {
      const matchesSearch = cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cliente.cpf.includes(searchTerm) ||
                           (cliente.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      
      const matchesStatus = selectedStatus === 'todos' || cliente.statusProcessual === selectedStatus
      const matchesEspecialidade = selectedEspecialidade === 'todas' || cliente.especialidade === selectedEspecialidade
      const matchesPrioridade = selectedPrioridade === 'todas' || cliente.prioridade === selectedPrioridade

      return matchesSearch && matchesStatus && matchesEspecialidade && matchesPrioridade
    })

    // Ordenação
    filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === 'createdAt') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  }, [clientes, searchTerm, selectedStatus, selectedEspecialidade, selectedPrioridade, sortField, sortOrder])

  const handleNewCliente = () => {
    setSelectedCliente(null)
    setShowCreateModal(true)
  }

  const handleEditCliente = (cliente: ClienteAPI) => {
    setSelectedCliente(cliente)
    setShowEditModal(true)
  }

  const handleDeleteCliente = async (cliente: ClienteAPI) => {
    if (!confirm(`Tem certeza que deseja remover ${cliente.nome}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/clientes/${cliente._id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erro ao deletar cliente')
      }

      await loadClientes()
      
      toast({
        variant: "success",
        title: "Cliente Removido",
        description: `${cliente.nome} foi removido do sistema.`
      })
    } catch (error) {
      console.error('Erro ao deletar cliente:', error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao remover cliente"
      })
    }
  }

  const handleSaveCliente = async (data: any) => {
    try {
      const method = selectedCliente ? 'PUT' : 'POST'
      const url = selectedCliente ? `/api/clientes/${selectedCliente._id}` : '/api/clientes'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar cliente')
      }

      await loadClientes()
      
      toast({
        variant: selectedCliente ? "juridico" : "success",
        title: selectedCliente ? "Cliente Atualizado" : "Cliente Cadastrado",
        description: selectedCliente 
          ? `Dados de ${data.nome} foram atualizados!`
          : `${data.nome} foi cadastrado com sucesso!`
      })

      setShowCreateModal(false)
      setShowEditModal(false)
    } catch (error) {
      console.error('Erro ao salvar cliente:', error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao salvar cliente"
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
        {/* Header */}
        <BlurFade delay={0.1}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
              <p className="text-muted-foreground">
                Gerencie seus clientes e processos jurídicos
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
              <Button onClick={handleNewCliente}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Cliente
              </Button>
            </div>
          </div>
        </BlurFade>

        {/* Filtros */}
        <BlurFade delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros e Busca
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  placeholder="Buscar por nome, CPF ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="col-span-1 md:col-span-4"
                />
                
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option value="todos">Todos os Status</option>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                
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
                  {Object.entries(prioridadeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Mostrando {clientesFiltrados.length} de {clientes.length} clientes
                </p>
              </div>
            </CardContent>
          </Card>
        </BlurFade>

        {/* Lista de Clientes */}
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: { 
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {clientesFiltrados.map((cliente, index) => (
              <motion.div
                key={cliente._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
              >
                <BlurFade delay={0.3 + index * 0.05}>
                  <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-juridico-azul text-white">
                              {getInitials(cliente.nome)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-lg">{cliente.nome}</h3>
                            <p className="text-sm text-muted-foreground">
                              {formatCPF(cliente.cpf)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditCliente(cliente)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteCliente(cliente)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{cliente.telefone}</span>
                        </div>
                        
                        {cliente.email && (
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span>{cliente.email}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <Badge className={`${getStatusColor(cliente.statusProcessual)} text-white`}>
                            {statusLabels[cliente.statusProcessual] || cliente.statusProcessual}
                          </Badge>
                          <Badge variant="outline">
                            {especialidadeLabels[cliente.especialidade] || cliente.especialidade}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>Cadastrado em {formatDate(cliente.createdAt)}</span>
                          <Badge className={`${getPrioridadeColor(cliente.prioridade)} text-white text-xs`}>
                            {prioridadeLabels[cliente.prioridade] || cliente.prioridade}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </BlurFade>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {clientesFiltrados.length === 0 && !loading && (
          <BlurFade delay={0.3}>
            <Card className="text-center py-12">
              <CardContent>
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum cliente encontrado</h3>
                <p className="text-muted-foreground mb-6">
                  {clientes.length === 0 
                    ? "Comece cadastrando seu primeiro cliente"
                    : "Tente ajustar os filtros de busca"
                  }
                </p>
                {clientes.length === 0 && (
                  <Button onClick={handleNewCliente}>
                    <Plus className="mr-2 h-4 w-4" />
                    Cadastrar Primeiro Cliente
                  </Button>
                )}
              </CardContent>
            </Card>
          </BlurFade>
        )}

        {/* Modais */}
        <ClienteFormModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={handleSaveCliente}
          cliente={null}
          mode="create"
        />

        <ClienteFormModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedCliente(null)
          }}
          onSave={handleSaveCliente}
          cliente={selectedCliente ? convertToFormCliente(selectedCliente) : null}
          mode="edit"
        />
      </div>
    </DashboardLayout>
  )
} 