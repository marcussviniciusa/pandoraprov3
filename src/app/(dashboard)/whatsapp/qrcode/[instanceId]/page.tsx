'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BlurFade } from '@/components/magicui/blur-fade'
import { useToast } from '@/hooks/use-toast'
import {
  QrCode,
  ArrowLeft,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Loader2,
  MessageCircle,
  Wifi,
  Clock,
  HelpCircle
} from 'lucide-react'

interface QrCodePageProps {
  params: Promise<{
    instanceId: string
  }>
}

export default function QrCodePage({ params }: QrCodePageProps) {
  const router = useRouter()
  const { toast } = useToast()
  
  const [instanceId, setInstanceId] = useState<string>('')
  const [qrCodeData, setQrCodeData] = useState<string | null>(null)
  const [status, setStatus] = useState<'qr_code' | 'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const [loading, setLoading] = useState(true)
  const [pollingActive, setPollingActive] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const [timeLeft, setTimeLeft] = useState(120) // 2 minutos timeout
  
  const pollingInterval = useRef<NodeJS.Timeout | null>(null)
  const timeoutInterval = useRef<NodeJS.Timeout | null>(null)

  // Resolver params
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      setInstanceId(resolvedParams.instanceId)
    }
    resolveParams()
  }, [params])

  // Carregar QR Code inicial
  useEffect(() => {
    if (!instanceId) return
    
    loadQrCode()
    startPolling()
    startTimeout()

    return () => {
      stopPolling()
      stopTimeout()
    }
  }, [instanceId])

  const loadQrCode = async () => {
    if (!instanceId) return

    try {
      setLoading(true)
      
      const response = await fetch(`/api/whatsapp/instance/qrcode?instanceName=${instanceId}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao buscar QR Code')
      }

      console.log('📱 QR Code carregado:', result.data)

      if (result.data.qrCode) {
        setQrCodeData(result.data.qrCode)
        setStatus('qr_code')
        setRetryCount(0)
      } else if (result.data.status === 'connected') {
        setStatus('connected')
        setPollingActive(false)
        handleConnectionSuccess()
      } else {
        setStatus(result.data.status || 'disconnected')
      }

    } catch (error) {
      console.error('❌ Erro ao carregar QR Code:', error)
      setStatus('error')
      toast({
        variant: "destructive",
        title: "Erro ao carregar QR Code",
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    } finally {
      setLoading(false)
    }
  }

  const checkStatus = async () => {
    if (!instanceId || !pollingActive) return

    try {
      const response = await fetch(`/api/whatsapp/instance/status?instanceName=${instanceId}`)
      const result = await response.json()

      if (response.ok && result.data) {
        const newStatus = result.data.status
        
        if (newStatus !== status) {
          setStatus(newStatus)
          
          if (newStatus === 'connected') {
            setPollingActive(false)
            handleConnectionSuccess()
          } else if (newStatus === 'qr_code' && !qrCodeData) {
            // Recarregar QR Code se status mudou para qr_code mas não temos o código
            loadQrCode()
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ Erro ao verificar status:', error)
    }
  }

  const startPolling = () => {
    pollingInterval.current = setInterval(checkStatus, 3000) // A cada 3 segundos
  }

  const stopPolling = () => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current)
      pollingInterval.current = null
    }
  }

  const startTimeout = () => {
    timeoutInterval.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeout()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const stopTimeout = () => {
    if (timeoutInterval.current) {
      clearInterval(timeoutInterval.current)
      timeoutInterval.current = null
    }
  }

  const handleTimeout = () => {
    setPollingActive(false)
    stopTimeout()
    setStatus('error')
    toast({
      variant: "destructive",
      title: "QR Code expirado",
      description: "Gerando novo QR Code..."
    })
    handleRefresh()
  }

  const handleConnectionSuccess = () => {
    stopPolling()
    stopTimeout()
    
    toast({
      variant: "juridico",
      title: "WhatsApp conectado com sucesso!",
      description: "Redirecionando para o dashboard..."
    })

    setTimeout(() => {
      router.push('/whatsapp')
    }, 2000)
  }

  const handleRefresh = async () => {
    setRetryCount(prev => prev + 1)
    setTimeLeft(120) // Reset timeout
    setPollingActive(true)
    
    startTimeout()
    await loadQrCode()
    
    if (!pollingInterval.current) {
      startPolling()
    }
  }

  const getStatusInfo = () => {
    switch (status) {
      case 'qr_code':
        return {
          icon: <QrCode className="h-5 w-5" />,
          text: 'Aguardando conexão',
          color: 'bg-blue-100 text-blue-800 border-blue-200'
        }
      case 'connecting':
        return {
          icon: <Loader2 className="h-5 w-5 animate-spin" />,
          text: 'Conectando...',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        }
      case 'connected':
        return {
          icon: <CheckCircle2 className="h-5 w-5" />,
          text: 'Conectado',
          color: 'bg-green-100 text-green-800 border-green-200'
        }
      case 'error':
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          text: 'Erro de conexão',
          color: 'bg-red-100 text-red-800 border-red-200'
        }
      default:
        return {
          icon: <Clock className="h-5 w-5" />,
          text: 'Desconectado',
          color: 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
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
                <QrCode className="h-8 w-8 text-green-600" />
                Conectar WhatsApp
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
          {/* QR Code */}
          <BlurFade delay={0.2}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    QR Code
                  </span>
                  {status !== 'connected' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefresh}
                      disabled={loading}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                      Atualizar
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <AnimatePresence mode="wait">
                  {status === 'connected' ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="py-12"
                    >
                      <CheckCircle2 className="h-24 w-24 text-green-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-green-900 mb-2">
                        WhatsApp Conectado!
                      </h3>
                      <p className="text-green-700">
                        Redirecionando para o dashboard...
                      </p>
                    </motion.div>
                  ) : loading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="py-12"
                    >
                      <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
                      <p className="text-muted-foreground">Carregando QR Code...</p>
                    </motion.div>
                  ) : qrCodeData ? (
                    <motion.div
                      key="qrcode"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="space-y-4"
                    >
                      <div className="bg-white p-4 rounded-lg inline-block">
                        <img
                          src={qrCodeData}
                          alt="QR Code WhatsApp"
                          className="w-64 h-64 mx-auto"
                        />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>Tempo restante: <span className="font-mono font-medium">{formatTime(timeLeft)}</span></p>
                        {retryCount > 0 && (
                          <p>Tentativa {retryCount + 1}</p>
                        )}
                      </div>
                    </motion.div>
                  ) : status === 'error' ? (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="py-12"
                    >
                      <AlertCircle className="h-24 w-24 text-red-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-red-900 mb-2">
                        Erro ao gerar QR Code
                      </h3>
                      <p className="text-red-700 mb-4">
                        Não foi possível conectar com a instância
                      </p>
                      <Button onClick={handleRefresh} className="bg-red-600 hover:bg-red-700">
                        Tentar Novamente
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="disconnected"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="py-12"
                    >
                      <Wifi className="h-24 w-24 text-gray-400 mx-auto mb-4" />
                      <p className="text-muted-foreground">Aguardando conexão...</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </BlurFade>

          {/* Instruções */}
          <BlurFade delay={0.3}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Como conectar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 text-green-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Abra o WhatsApp no celular</p>
                      <p className="text-sm text-muted-foreground">
                        No Android ou iPhone que você quer conectar
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 text-green-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Vá para WhatsApp Web</p>
                      <p className="text-sm text-muted-foreground">
                        Toque nos 3 pontinhos {'>'}  Dispositivos conectados {'>'}  Conectar dispositivo
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 text-green-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Escaneie o QR Code</p>
                      <p className="text-sm text-muted-foreground">
                        Aponte a câmera para o código QR ao lado
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 text-green-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                      4
                    </div>
                    <div>
                      <p className="font-medium">Pronto!</p>
                      <p className="text-sm text-muted-foreground">
                        O WhatsApp será conectado automaticamente
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">💡 Dicas importantes:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• O QR Code expira em 2 minutos</li>
                    <li>• Certifique-se de ter internet estável</li>
                    <li>• Use apenas um dispositivo por vez</li>
                    <li>• A conexão é segura e criptografada</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">⚠️ Problemas?</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Clique em "Atualizar" para novo QR Code</li>
                    <li>• Verifique sua conexão com internet</li>
                    <li>• Certifique-se que o WhatsApp está atualizado</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </BlurFade>
        </div>

        {/* Ações */}
        <BlurFade delay={0.4}>
          <div className="flex justify-center gap-4 mt-6">
            <Button
              variant="outline"
              onClick={() => router.push('/whatsapp')}
            >
              Voltar ao Dashboard
            </Button>
            {status === 'connected' && (
              <Button
                onClick={() => router.push('/whatsapp/chat')}
                className="bg-green-600 hover:bg-green-700"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Abrir Chat
              </Button>
            )}
          </div>
        </BlurFade>
      </div>
    </DashboardLayout>
  )
} 