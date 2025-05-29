'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { BlurFade } from '@/components/magicui/blur-fade'
import { useToast } from '@/hooks/use-toast'
import {
  Settings,
  ArrowLeft,
  Save,
  AlertCircle,
  Loader2,
  Info,
  Smartphone,
  Wifi,
  WifiOff,
  QrCode,
  Trash2,
  RefreshCw
} from 'lucide-react'

interface EditInstancePageProps {
  params: Promise<{
    instanceId: string
  }>
}

interface InstanceData {
  instanceName: string
  status: 'connected' | 'connecting' | 'disconnected' | 'qr_code'
  profileName?: string
  profilePicture?: string
  number?: string
  webhook?: string
  lastSeen?: Date
  state?: string
}

export default function EditInstancePage({ params }: EditInstancePageProps) {
  const router = useRouter()
  const { toast } = useToast()
  
  const [instanceId, setInstanceId] = useState<string>('')
  const [instanceData, setInstanceData] = useState<InstanceData | null>(null)
  const [formData, setFormData] = useState({
    webhook: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Resolver params
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      setInstanceId(resolvedParams.instanceId)
    }
    resolveParams()
  }, [params])

  // Carregar dados da instância
  useEffect(() => {
    if (!instanceId) return
    loadInstanceData()
  }, [instanceId])

  const loadInstanceData = async () => {
    if (!instanceId) return

    try {
      setLoading(true)
      
      const response = await fetch(`/api/whatsapp/instance/status?instanceName=${instanceId}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao carregar dados da instância')
      }

      console.log('📊 Dados da instância carregados:', result.data)

      setInstanceData(result.data)
      setFormData({
        webhook: result.data.webhook || ''
      })

    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error)
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validar webhook (opcional)
    if (formData.webhook && !/^https?:\/\/.+/.test(formData.webhook)) {
      newErrors.webhook = 'URL do webhook deve começar com http:// ou https://'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Erro de validação",
        description: "Corrija os erros no formulário"
      })
      return
    }

    setSaving(true)

    try {
      const response = await fetch('/api/whatsapp/instance/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instanceName: instanceId,
          webhook: formData.webhook.trim() || undefined
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao salvar configurações')
      }

      console.log('💾 Configurações salvas:', result.data)

      toast({
        variant: "juridico",
        title: "Configurações salvas!",
        description: "As alterações foram aplicadas com sucesso"
      })

      // Recarregar dados da instância
      await loadInstanceData()

    } catch (error) {
      console.error('❌ Erro ao salvar:', error)
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleInstanceAction = async (action: 'connect' | 'disconnect' | 'restart' | 'delete') => {
    if (action === 'delete') {
      const confirmed = confirm(`Tem certeza que deseja deletar a instância "${instanceId}"? Esta ação não pode ser desfeita.`)
      if (!confirmed) return
    }

    setActionLoading(action)
    
    try {
      const response = await fetch('/api/whatsapp/instance/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instanceName: instanceId,
          action
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao executar ação')
      }

      console.log(`✅ Ação "${action}" executada:`, result.data)

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
          message = 'Instância deletada'
          break
      }

      toast({
        variant: action === 'delete' ? "destructive" : "juridico",
        title: message,
        description: `Instância: ${instanceId}`
      })

      if (action === 'delete') {
        router.push('/whatsapp')
        return
      }

      // Recarregar dados após ação
      await loadInstanceData()

    } catch (error) {
      console.error(`❌ Erro ao executar ação "${action}":`, error)
      toast({
        variant: "destructive",
        title: "Erro na ação",
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusInfo = () => {
    if (!instanceData) return { icon: <Loader2 className="h-5 w-5 animate-spin" />, text: 'Carregando...', color: 'bg-gray-100 text-gray-800' }

    switch (instanceData.status) {
      case 'connected':
        return {
          icon: <Wifi className="h-5 w-5" />,
          text: 'Conectado',
          color: 'bg-green-100 text-green-800 border-green-200'
        }
      case 'connecting':
        return {
          icon: <Loader2 className="h-5 w-5 animate-spin" />,
          text: 'Conectando...',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        }
      case 'qr_code':
        return {
          icon: <QrCode className="h-5 w-5" />,
          text: 'QR Code disponível',
          color: 'bg-blue-100 text-blue-800 border-blue-200'
        }
      default:
        return {
          icon: <WifiOff className="h-5 w-5" />,
          text: 'Desconectado',
          color: 'bg-red-100 text-red-800 border-red-200'
        }
    }
  }

  const statusInfo = getStatusInfo()

  if (!instanceId) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <BlurFade delay={0.1}>
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/whatsapp')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <Settings className="h-8 w-8 text-blue-600" />
                Editar Instância
              </h1>
              <p className="text-muted-foreground mt-1">
                Instância: <span className="font-medium">{instanceId}</span>
              </p>
            </div>
            <Badge variant="outline" className={statusInfo.color}>
              {statusInfo.icon}
              <span className="ml-1">{statusInfo.text}</span>
            </Badge>
          </div>
        </BlurFade>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informações da Instância */}
          <BlurFade delay={0.2}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Informações da Instância
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Carregando dados...</span>
                  </div>
                ) : instanceData ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Nome</Label>
                        <p className="font-medium">{instanceData.instanceName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Status</Label>
                        <Badge variant="outline" className={statusInfo.color}>
                          {statusInfo.icon}
                          <span className="ml-1">{statusInfo.text}</span>
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Número</Label>
                        <p className="font-medium">{instanceData.number || 'Não configurado'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Nome do Perfil</Label>
                        <p className="font-medium">{instanceData.profileName || 'Não disponível'}</p>
                      </div>
                    </div>

                    {instanceData.lastSeen && (
                      <>
                        <Separator />
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Última Atividade</Label>
                          <p className="font-medium">{instanceData.lastSeen.toLocaleString('pt-BR')}</p>
                        </div>
                      </>
                    )}

                    <Separator />

                    {/* Ações da Instância */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-600">Ações</Label>
                      <div className="flex flex-wrap gap-2">
                        {instanceData.status === 'connected' ? (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleInstanceAction('disconnect')}
                              disabled={actionLoading === 'disconnect'}
                              className="text-orange-600 hover:text-orange-700"
                            >
                              {actionLoading === 'disconnect' ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <WifiOff className="h-4 w-4 mr-2" />
                              )}
                              Desconectar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleInstanceAction('restart')}
                              disabled={actionLoading === 'restart'}
                            >
                              {actionLoading === 'restart' ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <RefreshCw className="h-4 w-4 mr-2" />
                              )}
                              Reiniciar
                            </Button>
                          </>
                        ) : instanceData.status === 'qr_code' ? (
                          <Button 
                            size="sm" 
                            onClick={() => router.push(`/whatsapp/qrcode/${instanceId}`)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <QrCode className="h-4 w-4 mr-2" />
                            Ver QR Code
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            onClick={() => handleInstanceAction('connect')}
                            disabled={actionLoading === 'connect'}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {actionLoading === 'connect' ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Wifi className="h-4 w-4 mr-2" />
                            )}
                            Conectar
                          </Button>
                        )}

                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleInstanceAction('delete')}
                          disabled={actionLoading === 'delete'}
                          className="text-red-600 hover:text-red-700"
                        >
                          {actionLoading === 'delete' ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-2" />
                          )}
                          Deletar
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600">Erro ao carregar dados da instância</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </BlurFade>

          {/* Configurações */}
          <BlurFade delay={0.3}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-6">
                  {/* Webhook */}
                  <div className="space-y-2">
                    <Label htmlFor="webhook" className="text-sm font-medium">
                      URL do Webhook
                    </Label>
                    <Input
                      id="webhook"
                      value={formData.webhook}
                      onChange={(e) => setFormData({ ...formData, webhook: e.target.value })}
                      placeholder="https://meusite.com/api/webhook/whatsapp"
                      className={`${errors.webhook ? 'border-red-500' : ''}`}
                      disabled={saving}
                    />
                    {errors.webhook && (
                      <p className="text-red-500 text-sm flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.webhook}
                      </p>
                    )}
                    <p className="text-muted-foreground text-xs">
                      URL onde serão enviadas as mensagens recebidas via WhatsApp
                    </p>
                  </div>

                  <Separator />

                  {/* Informações sobre webhook */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-2">Sobre o Webhook:</p>
                        <ul className="space-y-1 text-blue-700">
                          <li>• Recebe todas as mensagens em tempo real</li>
                          <li>• Formato JSON com dados da mensagem e cliente</li>
                          <li>• Deve responder com status 200 para confirmar</li>
                          <li>• Tentativas automáticas em caso de falha</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Botões */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/whatsapp')}
                      disabled={saving}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Salvar Alterações
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </BlurFade>
        </div>
      </div>
    </DashboardLayout>
  )
} 