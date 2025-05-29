'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BlurFade } from '@/components/magicui/blur-fade'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import {
  Search,
  Upload,
  Download,
  Eye,
  Check,
  X,
  Clock,
  AlertTriangle,
  FileText,
  Image,
  File,
  Filter,
  Plus
} from 'lucide-react'

// Tipos simplificados
interface Documento {
  _id: string
  nome: string
  tipo: string
  categoria: string
  clienteId: string
  arquivo: {
    nome: string
    tamanho: number
    tipo: string
    url?: string
  }
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'analisado'
  dataUpload: Date
  dataAnalise?: Date
  observacoes?: string
  tags: string[]
  obrigatorio: boolean
  createdAt: Date
  updatedAt: Date
}

interface Cliente {
  _id: string
  nome: string
}

// Labels e cores
const statusLabels = {
  pendente: 'Pendente',
  aprovado: 'Aprovado',
  rejeitado: 'Rejeitado',
  analisado: 'Analisado'
}

const statusColors = {
  pendente: 'bg-yellow-500',
  aprovado: 'bg-green-500',
  rejeitado: 'bg-red-500',
  analisado: 'bg-blue-500'
}

const categoriaLabels = {
  identificacao: 'Identificação',
  medicos: 'Médicos',
  trabalhistas: 'Trabalhistas',
  comprovantes: 'Comprovantes',
  outros: 'Outros'
}

function getFileIcon(tipo: string) {
  if (tipo.includes('image')) return <Image className="h-4 w-4" />
  if (tipo.includes('pdf')) return <FileText className="h-4 w-4" />
  return <File className="h-4 w-4" />
}

// Função para formatar tamanho de arquivo
function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default function DocumentosPage() {
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('todos')
  const [selectedCategoria, setSelectedCategoria] = useState<string>('todas')
  const [selectedCliente, setSelectedCliente] = useState<string>('todos')
  
  const { toast } = useToast()

  // Carregar dados
  useEffect(() => {
    loadDocumentos()
    loadClientes()
  }, [])

  const loadDocumentos = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/documentos')
      
      if (!response.ok) {
        throw new Error('Erro ao carregar documentos')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setDocumentos(data.data || [])
      } else {
        throw new Error(data.message || 'Erro desconhecido')
      }
    } catch (error) {
      console.error('Erro ao carregar documentos:', error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar documentos"
      })
      setDocumentos([])
    } finally {
      setLoading(false)
    }
  }

  const loadClientes = async () => {
    try {
      const response = await fetch('/api/clientes')
      
      if (!response.ok) {
        throw new Error('Erro ao carregar clientes')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setClientes(data.data || [])
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
    }
  }

  // Filtros
  const documentosFiltrados = useMemo(() => {
    if (!documentos || !Array.isArray(documentos)) {
      return []
    }
    
    return documentos.filter(doc => {
      // Verificações de segurança para evitar erros de propriedades undefined
      if (!doc) return false
      
      const matchesSearch = (doc.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (doc.arquivo?.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (doc.tags || []).some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesStatus = selectedStatus === 'todos' || doc.status === selectedStatus
      const matchesCategoria = selectedCategoria === 'todas' || doc.categoria === selectedCategoria
      const matchesCliente = selectedCliente === 'todos' || doc.clienteId === selectedCliente

      return matchesSearch && matchesStatus && matchesCategoria && matchesCliente
    })
  }, [documentos, searchTerm, selectedStatus, selectedCategoria, selectedCliente])

  // Estatísticas
  const stats = useMemo(() => {
    if (!documentos || !Array.isArray(documentos)) {
      return { total: 0, pendentes: 0, aprovados: 0, rejeitados: 0, tamanhoTotal: 0 }
    }
    
    const total = documentos.length
    const pendentes = documentos.filter(d => d && d.status === 'pendente').length
    const aprovados = documentos.filter(d => d && d.status === 'aprovado').length
    const rejeitados = documentos.filter(d => d && d.status === 'rejeitado').length
    const tamanhoTotal = documentos.reduce((acc, doc) => {
      if (!doc || !doc.arquivo) return acc
      return acc + (doc.arquivo.tamanho || 0)
    }, 0)

    return { total, pendentes, aprovados, rejeitados, tamanhoTotal }
  }, [documentos])

  const handleStatusChange = async (documentoId: string, novoStatus: string) => {
    try {
      const response = await fetch(`/api/documentos/${documentoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus })
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar status')
      }

      await loadDocumentos()
      
      toast({
        variant: "success",
        title: "Status Atualizado",
        description: `Documento marcado como "${statusLabels[novoStatus as keyof typeof statusLabels]}"`
      })
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao atualizar status do documento"
      })
    }
  }

  const handleDownload = (documento: Documento) => {
    if (documento.arquivo.url) {
      window.open(documento.arquivo.url, '_blank')
    }
    
    toast({
      variant: "success",
      title: "Download Iniciado",
      description: `Baixando ${documento.arquivo.nome}`
    })
  }

  const getClienteNome = (clienteId: string) => {
    if (!clientes || !Array.isArray(clientes) || !clienteId) {
      return 'Cliente não encontrado'
    }
    return clientes.find(c => c && c._id === clienteId)?.nome || 'Cliente não encontrado'
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-juridico-azul mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando documentos...</p>
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
              <h1 className="text-3xl font-bold tracking-tight">Documentos</h1>
              <p className="text-muted-foreground">
                Gerencie documentos dos processos jurídicos
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </div>
          </div>
        </BlurFade>

        {/* Estatísticas */}
        <BlurFade delay={0.2}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-juridico-azul">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.pendentes}</div>
                <div className="text-sm text-muted-foreground">Pendentes</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.aprovados}</div>
                <div className="text-sm text-muted-foreground">Aprovados</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{stats.rejeitados}</div>
                <div className="text-sm text-muted-foreground">Rejeitados</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{formatFileSize(stats.tamanhoTotal)}</div>
                <div className="text-sm text-muted-foreground">Tamanho Total</div>
              </CardContent>
            </Card>
          </div>
        </BlurFade>

        {/* Filtros */}
        <BlurFade delay={0.3}>
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
                  placeholder="Buscar documentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="col-span-1 md:col-span-4"
                />
                
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    {Object.entries(statusLabels).map(([status, label]) => (
                      <SelectItem key={status} value={status}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as Categorias</SelectItem>
                    {Object.entries(categoriaLabels).map(([categoria, label]) => (
                      <SelectItem key={categoria} value={categoria}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedCliente} onValueChange={setSelectedCliente}>
                  <SelectTrigger>
                    <SelectValue placeholder="Cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Clientes</SelectItem>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente._id} value={cliente._id}>{cliente.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Mostrando {documentosFiltrados.length} de {documentos.length} documentos
                </p>
              </div>
            </CardContent>
          </Card>
        </BlurFade>

        {/* Lista de Documentos */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          <AnimatePresence mode="popLayout">
            {documentosFiltrados.map((documento, index) => (
              <motion.div
                key={documento._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
              >
                <BlurFade delay={0.4 + index * 0.05}>
                  <Card className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {getFileIcon(documento.arquivo.tipo)}
                            <div>
                              <h3 className="font-semibold">{documento.nome}</h3>
                              <p className="text-sm text-muted-foreground">{documento.arquivo.nome}</p>
                            </div>
                          </div>
                          
                          <Badge className={`${statusColors[documento.status]} text-white`}>
                            {statusLabels[documento.status]}
                          </Badge>
                        </div>

                        <div className="text-sm text-muted-foreground">
                          <p><strong>Cliente:</strong> {getClienteNome(documento.clienteId)}</p>
                          <p><strong>Categoria:</strong> {categoriaLabels[documento.categoria as keyof typeof categoriaLabels]}</p>
                          <p><strong>Tamanho:</strong> {formatFileSize(documento.arquivo.tamanho)}</p>
                          <p><strong>Upload:</strong> {formatDate(documento.dataUpload)}</p>
                        </div>

                        {documento.observacoes && (
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm">{documento.observacoes}</p>
                          </div>
                        )}

                        {documento.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {documento.tags.map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center gap-2">
                            {documento.obrigatorio && (
                              <Badge variant="destructive" className="text-xs">
                                Obrigatório
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost" onClick={() => handleDownload(documento)}>
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                            
                            {documento.status === 'pendente' && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => handleStatusChange(documento._id, 'aprovado')}
                                >
                                  <Check className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => handleStatusChange(documento._id, 'rejeitado')}
                                >
                                  <X className="h-4 w-4 text-red-600" />
                                </Button>
                              </>
                            )}
                          </div>
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
        {documentosFiltrados.length === 0 && !loading && (
          <BlurFade delay={0.5}>
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum documento encontrado</h3>
                <p className="text-muted-foreground mb-6">
                  {documentos.length === 0 
                    ? "Comece fazendo upload dos primeiros documentos"
                    : "Tente ajustar os filtros de busca"
                  }
                </p>
                {documentos.length === 0 && (
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Fazer Upload
                  </Button>
                )}
              </CardContent>
            </Card>
          </BlurFade>
        )}
      </div>
    </DashboardLayout>
  )
} 