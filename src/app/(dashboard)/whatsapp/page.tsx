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
  Zap
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
  
  const { toast } = useToast()

  useEffect(() => {
    loadInstances()
    loadStats()
  }, [])

  const loadInstances = async () => {
    try {
      // Carregar instâncias reais da API
      const response = await fetch('/api/whatsapp/instances')
      
      if (!response.ok) {
        throw new Error('Erro ao carregar instâncias')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setInstances(data.data || [])
      } else {
        throw new Error(data.message || 'Erro desconhecido')
      }
    } catch (error) {
      console.error('Erro ao carregar instâncias:', error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar instâncias WhatsApp"
      })
      
      // Lista vazia em caso de erro
      setInstances([])
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      // Carregar estatísticas reais da API
      const response = await fetch('/api/whatsapp/stats')
      
      if (!response.ok) {
        throw new Error('Erro ao carregar estatísticas')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setStats(data.data)
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
            <p className="text-muted-foreground">Carregando WhatsApp...</p>
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
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Nova Instância
              </Button>
            </div>
          </div>
        </BlurFade>

        {/* Stats Cards */}
        <BlurFade delay={0.2}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
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
                  <div className="text-2xl font-bold">{stats.connectedInstances}/{stats.totalInstances}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.connectedInstances} conectadas
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
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
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {instances.map((instance, index) => (
                  <motion.div
                    key={instance.id}
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
                            <>
                              <span>•</span>
                              <span>{instance.profileName}</span>
                            </>
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
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                        {instance.status === 'connected' ? (
                          <Button variant="outline" size="sm">
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <Zap className="h-4 w-4" />
                          </Button>
                        )}
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
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar primeira instância
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </BlurFade>
      </div>
    </DashboardLayout>
  )
} 