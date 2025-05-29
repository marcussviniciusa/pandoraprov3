'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BlurFade } from '@/components/magicui/blur-fade'
import { useToast } from '@/hooks/use-toast'
import {
  MessageCircle,
  Smartphone,
  Users,
  Send,
  QrCode,
  Wifi,
  WifiOff,
  Plus,
  Settings,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
  RefreshCw,
  Loader2,
  Trash2
} from 'lucide-react'

interface WhatsAppInstance {
  id: string
  name: string
  number?: string
  status: 'connected' | 'connecting' | 'disconnected' | 'qr_code'
  profileName?: string
  profilePicture?: string
  lastSeen?: Date
  messagesCount: number
  chatsCount: number
}

interface WhatsAppStats {
  totalInstances: number
  connectedInstances: number
  totalMessages: number
  totalChats: number
  responseRate: number
  averageResponseTime: number
}

export default function WhatsAppPage() {
  const [instances, setInstances] = useState<WhatsAppInstance[]>([])
  const [stats, setStats] = useState<WhatsAppStats>({
    totalInstances: 0,
    connectedInstances: 0,
    totalMessages: 0,
    totalChats: 0,
    responseRate: 0,
    averageResponseTime: 0
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  const { toast } = useToast()

  useEffect(() => {
    // Verificar autenticação antes de carregar dados
    const checkAuth = async () => {
      try {
        const authResponse = await fetch('/api/auth/me', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        })
        
        if (!authResponse.ok) {
          console.warn('⚠️ Usuário não autenticado, redirecionando...')
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login'
            return
          }
        }
        
        // Se autenticado, carregar dados
        loadInstances()
        loadStats()
      } catch (error) {
        console.error('❌ Erro ao verificar autenticação:', error)
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login'
        }
      }
    }
    
    checkAuth()
    
    // Auto-refresh a cada 30 segundos (apenas se já autenticado)
    const interval = setInterval(() => {
      loadInstances()
      loadStats()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const loadInstances = async () => {
    try {
      // Usar API de ações que lista instâncias reais
      const response = await fetch('/api/whatsapp/instance/actions', {
        method: 'GET',
        credentials: 'include', // Importante para incluir cookies de sessão
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          console.warn('⚠️ Usuário não autenticado para carregar instâncias')
          // Se não autenticado, verificar se está na rota de login
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            console.log('🔄 Redirecionando para login...')
            window.location.href = '/auth/login'
            return
          }
          setInstances([])
          return
        }
        throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        let instancesData = data.data || []
        
        console.log(`📋 ${instancesData.length} instâncias carregadas para o usuário`)
        console.log('🔍 Debug: Instâncias carregadas da API:', instancesData)
        
        // Log específico do status de cada instância
        if (instancesData.length > 0) {
          instancesData.forEach((instance: any, index: number) => {
            console.log(`  📱 Instância ${index + 1}: ${instance.name} - Status: ${instance.status}`)
          })
        }
        
        // Se as instâncias estão vindo com status incorreto, verificar diretamente na API de status
        if (instancesData.length > 0) {
          console.log('🔄 Verificando status em tempo real de cada instância...')
          
          const updatedInstances = await Promise.all(
            instancesData.map(async (instance: any) => {
              try {
                const statusResponse = await fetch(`/api/whatsapp/instance/status?instanceName=${instance.name}`, {
                  credentials: 'include',
                  headers: {
                    'Content-Type': 'application/json',
                  }
                })
                
                if (statusResponse.ok) {
                  const statusData = await statusResponse.json()
                  if (statusData.success) {
                    console.log(`✅ Status atualizado para ${instance.name}: ${instance.status} → ${statusData.data.status}`)
                    return {
                      ...instance,
                      status: statusData.data.status,
                      state: statusData.data.state,
                      lastSeen: statusData.data.lastSeen ? new Date(statusData.data.lastSeen) : instance.lastSeen
                    }
                  }
                }
                
                console.log(`⚠️ Mantendo status original para ${instance.name}: ${instance.status}`)
                return instance
              } catch (error) {
                console.warn(`❌ Erro ao verificar status de ${instance.name}:`, error)
                return instance
              }
            })
          )
          
          instancesData = updatedInstances
          console.log('🔄 Status verificado para todas as instâncias')
        }
        
        setInstances(instancesData)
      } else {
        throw new Error(data.message || 'Erro desconhecido ao processar dados')
      }
    } catch (error) {
      console.error('❌ Erro ao carregar instâncias:', error)
      
      // Em caso de erro, manter lista vazia em vez de dados simulados
      setInstances([])
      
      // Mostrar toast apenas se não for problema de autenticação
      if (error instanceof Error && !error.message.includes('401')) {
        toast({
          variant: "destructive",
          title: "Erro ao carregar instâncias",
          description: "Não foi possível carregar as instâncias WhatsApp. Verifique sua conexão e tente novamente.",
        })
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const loadStats = async () => {
    try {
      // API de stats com autenticação
      const response = await fetch('/api/whatsapp/stats', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          console.warn('⚠️ Usuário não autenticado para carregar estatísticas')
          return
        }
        throw new Error('Erro ao carregar estatísticas')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setStats(data.data)
        console.log('📊 Estatísticas carregadas:', data.data)
      } else {
        throw new Error(data.message || 'Erro desconhecido')
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
      
      // Manter estatísticas zeradas em caso de erro
      setStats({
        totalInstances: 0,
        connectedInstances: 0,
        totalMessages: 0,
        totalChats: 0,
        responseRate: 0,
        averageResponseTime: 0
      })
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    
    // Carregar instâncias primeiro (que agora verifica status em tempo real)
    await loadInstances()
    
    // Depois carregar estatísticas
    await loadStats()
  }

  const handleInstanceAction = async (instanceName: string, action: 'connect' | 'disconnect' | 'restart' | 'delete') => {
    if (action === 'delete') {
      const confirmed = confirm(
        `Tem certeza que deseja deletar a instância "${instanceName}"?\n\n` +
        `Esta ação não pode ser desfeita e remove a instância completamente do servidor.`
      )
      if (!confirmed) return
    }

    setActionLoading(instanceName + '_' + action)
    
    try {
      console.log(`🔧 Executando ação "${action}" na instância:`, instanceName)
      
      const response = await fetch('/api/whatsapp/instance/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instanceName,
          action
        })
      })

      const result = await response.json()

      // Se a API retornou erro mas é uma tentativa de delete, oferecer limpeza forçada
      if (!response.ok && action === 'delete') {
        console.warn(`⚠️ Erro ao deletar instância "${instanceName}":`, result.message)
        
        const forceDelete = confirm(
          `Erro ao deletar a instância "${instanceName}" pelo método normal.\n\n` +
          `Erro: ${result.message}\n\n` +
          `Deseja tentar uma LIMPEZA FORÇADA? Isto remove a instância da lista mesmo que ela ainda exista no servidor.`
        )
        
        if (forceDelete) {
          await handleForceCleanup(instanceName)
          return
        } else {
          throw new Error(result.message || 'Erro ao executar ação')
        }
      }

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao executar ação')
      }

      console.log(`✅ Ação "${action}" executada com sucesso:`, result.data)

      let message = ''
      switch (action) {
        case 'connect':
          message = 'Instância conectada/QR Code gerado'
          break
        case 'disconnect':
          message = 'Instância desconectada'
          break
        case 'restart':
          message = 'Instância reiniciada'
          break
        case 'delete':
          message = 'Instância deletada com sucesso'
          break
      }

      toast({
        variant: action === 'delete' ? "destructive" : "juridico",
        title: message,
        description: `Instância: ${instanceName}`
      })

      // Recarregar instâncias após ação
      await loadInstances()

    } catch (error) {
      console.error(`❌ Erro ao executar ação "${action}":`, error)
      
      // Para delete, mostrar opções adicionais
      if (action === 'delete') {
        toast({
          variant: "destructive",
          title: "Erro ao deletar instância",
          description: `${error instanceof Error ? error.message : 'Erro desconhecido'}. Tente novamente ou use a limpeza forçada.`
        })
      } else {
        toast({
          variant: "destructive",
          title: "Erro na ação",
          description: error instanceof Error ? error.message : 'Erro desconhecido'
        })
      }
    } finally {
      setActionLoading(null)
    }
  }

  // Função para limpeza forçada de instâncias fantasma
  const handleForceCleanup = async (instanceName: string) => {
    try {
      console.log(`🧹 Executando limpeza forçada da instância:`, instanceName)
      
      // Remover da lista local imediatamente
      setInstances(prev => prev.filter(instance => instance.name !== instanceName))
      
      toast({
        variant: "juridico",
        title: "Limpeza forçada executada",
        description: `Instância "${instanceName}" removida da lista local. Se ela ainda existir no servidor, aparecerá na próxima atualização.`
      })

      // Aguardar um pouco e recarregar para verificar se realmente sumiu
      setTimeout(async () => {
        await loadInstances()
      }, 2000)

    } catch (error) {
      console.error(`❌ Erro na limpeza forçada:`, error)
      toast({
        variant: "destructive",
        title: "Erro na limpeza forçada",
        description: "Não foi possível limpar a instância da lista"
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'connecting':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'disconnected':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'qr_code':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <Wifi className="h-4 w-4" />
      case 'connecting':
        return <Clock className="h-4 w-4" />
      case 'disconnected':
        return <WifiOff className="h-4 w-4" />
      case 'qr_code':
        return <QrCode className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Conectado'
      case 'connecting':
        return 'Conectando'
      case 'disconnected':
        return 'Desconectado'
      case 'qr_code':
        return 'QR Code'
      default:
        return 'Desconhecido'
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-juridico-azul mx-auto mb-4"></div>
            <p className="text-muted-foreground">Verificando autenticação e carregando WhatsApp...</p>
            <p className="text-xs text-muted-foreground mt-2">
              Se esta tela persistir, você será redirecionado para o login
            </p>
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
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <MessageCircle className="h-8 w-8 text-green-600" />
                WhatsApp Business
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie suas instâncias e conversas do WhatsApp
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={async () => {
                  setRefreshing(true)
                  console.log('🔄 Forçando sincronização manual...')
                  
                  // Carregar instâncias primeiro (com verificação de status em tempo real)
                  await loadInstances()
                  
                  // Depois carregar estatísticas
                  await loadStats()
                  
                  console.log('✅ Sincronização manual concluída')
                }}
                disabled={refreshing}
                className="bg-blue-50 hover:bg-blue-100"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Sincronizar
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
              <Link href="/whatsapp/chat">
                <Button variant="outline" size="sm">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Abrir Chat
                </Button>
              </Link>
              <Link href="/whatsapp/create">
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Instância
                </Button>
              </Link>
            </div>
          </div>
        </BlurFade>

        {/* Stats Cards */}
        <BlurFade delay={0.2}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              key="instances-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Instâncias</CardTitle>
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{instances.filter(i => i.status === 'connected').length}/{instances.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {instances.filter(i => i.status === 'connected').length} conectadas
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              key="conversations-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversas</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalChats}</div>
                  <p className="text-xs text-muted-foreground">
                    Conversas ativas
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              key="messages-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mensagens</CardTitle>
                  <Send className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalMessages}</div>
                  <p className="text-xs text-muted-foreground">
                    Hoje
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              key="response-rate-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Resposta</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.responseRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    Tempo médio: {stats.averageResponseTime}min
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </BlurFade>

        {/* Instances List */}
        <BlurFade delay={0.3}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Instâncias WhatsApp
                {refreshing && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {instances.map((instance, index) => (
                  <motion.div
                    key={`instance-${instance.name || instance.id || 'unknown'}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <MessageCircle className="h-6 w-6 text-green-600" />
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-gray-900">{instance.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{instance.number || 'Número não configurado'}</span>
                          {instance.profileName && (
                            <React.Fragment key={`profile-${instance.name}-${index}`}>
                              <span>•</span>
                              <span>{instance.profileName}</span>
                            </React.Fragment>
                          )}
                        </div>
                        {instance.lastSeen && (
                          <p className="text-xs text-gray-400">
                            Última atividade: {instance.lastSeen.toLocaleString('pt-BR')}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {instance.messagesCount} mensagens
                        </div>
                        <div className="text-xs text-gray-500">
                          {instance.chatsCount} conversas
                        </div>
                      </div>

                      <Badge variant="outline" className={getStatusColor(instance.status)}>
                        {getStatusIcon(instance.status)}
                        <span className="ml-1">{getStatusLabel(instance.status)}</span>
                      </Badge>

                      <div className="flex gap-2">
                        <Link href={`/whatsapp/edit/${instance.name}`}>
                          <Button variant="outline" size="sm" title="Editar configurações">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </Link>
                        
                        {instance.status === 'connected' ? (
                          <React.Fragment key={`connected-${instance.name}-${index}`}>
                            <Link href="/whatsapp/chat">
                              <Button variant="outline" size="sm" title="Abrir chat">
                                <MessageCircle className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleInstanceAction(instance.name, 'disconnect')}
                              disabled={actionLoading === instance.name + '_disconnect'}
                              className="text-orange-600 hover:text-orange-700"
                              title="Desconectar instância"
                            >
                              {actionLoading === instance.name + '_disconnect' ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <WifiOff className="h-4 w-4" />
                              )}
                            </Button>
                          </React.Fragment>
                        ) : instance.status === 'qr_code' ? (
                          <Link href={`/whatsapp/qrcode/${instance.name}`}>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" title="Ver QR Code">
                              <QrCode className="h-4 w-4" />
                            </Button>
                          </Link>
                        ) : (
                          <Button 
                            size="sm" 
                            onClick={() => handleInstanceAction(instance.name, 'connect')}
                            disabled={actionLoading === instance.name + '_connect'}
                            className="bg-green-600 hover:bg-green-700"
                            title="Conectar instância"
                          >
                            {actionLoading === instance.name + '_connect' ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Zap className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        
                        {/* Botão de excluir - sempre visível */}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleInstanceAction(instance.name, 'delete')}
                          disabled={actionLoading === instance.name + '_delete'}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Excluir instância"
                        >
                          {actionLoading === instance.name + '_delete' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {instances.length === 0 && (
                <div className="text-center py-12">
                  <MessageCircle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma instância configurada
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Configure sua primeira instância WhatsApp para começar
                  </p>
                  <Link href="/whatsapp/create">
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar primeira instância
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </BlurFade>
      </div>
    </DashboardLayout>
  )
} 