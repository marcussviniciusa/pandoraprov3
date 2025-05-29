'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { BlurFade } from '@/components/magicui/blur-fade'
import { useToast } from '@/hooks/use-toast'
import {
  MessageCircle,
  Plus,
  ArrowLeft,
  QrCode,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info
} from 'lucide-react'

export default function CreateInstancePage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    instanceName: '',
    webhook: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validar nome da instância
    if (!formData.instanceName.trim()) {
      newErrors.instanceName = 'Nome da instância é obrigatório'
    } else if (formData.instanceName.length < 3) {
      newErrors.instanceName = 'Nome deve ter pelo menos 3 caracteres'
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.instanceName)) {
      newErrors.instanceName = 'Use apenas letras, números, underscore e hífen'
    }

    // Validar webhook (opcional)
    if (formData.webhook && !/^https?:\/\/.+/.test(formData.webhook)) {
      newErrors.webhook = 'URL do webhook deve começar com http:// ou https://'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Erro de validação",
        description: "Corrija os erros no formulário"
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/whatsapp/instance/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instanceName: formData.instanceName.trim(),
          qrcode: true,
          webhook: formData.webhook.trim() || undefined
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao criar instância')
      }

      console.log('✅ Instância criada:', result.data)

      toast({
        variant: "juridico",
        title: "Instância criada com sucesso!",
        description: "Redirecionando para conectar via QR Code..."
      })

      // Redirecionar para página do QR Code
      router.push(`/whatsapp/qrcode/${result.data.instanceName}`)

    } catch (error) {
      console.error('❌ Erro ao criar instância:', error)
      toast({
        variant: "destructive",
        title: "Erro ao criar instância",
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-2xl mx-auto">
        {/* Header */}
        <BlurFade delay={0.1}>
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <Plus className="h-8 w-8 text-green-600" />
                Nova Instância WhatsApp
              </h1>
              <p className="text-muted-foreground mt-1">
                Configure uma nova instância para conectar seu WhatsApp
              </p>
            </div>
          </div>
        </BlurFade>

        {/* Informações importantes */}
        <BlurFade delay={0.2}>
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-2">Informações importantes:</p>
                  <ul className="space-y-1 text-blue-700">
                    <li>• O nome da instância deve ser único e não pode ser alterado</li>
                    <li>• Você precisará escanear um QR Code para conectar</li>
                    <li>• O webhook é opcional e pode ser configurado depois</li>
                    <li>• Uma vez conectada, a instância ficará ativa 24/7</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </BlurFade>

        {/* Formulário */}
        <BlurFade delay={0.3}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Configuração da Instância
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nome da instância */}
                <div className="space-y-2">
                  <Label htmlFor="instanceName" className="text-sm font-medium">
                    Nome da Instância *
                  </Label>
                  <Input
                    id="instanceName"
                    value={formData.instanceName}
                    onChange={(e) => setFormData({ ...formData, instanceName: e.target.value })}
                    placeholder="ex: escritorio_principal"
                    className={`${errors.instanceName ? 'border-red-500' : ''}`}
                    disabled={loading}
                  />
                  {errors.instanceName && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.instanceName}
                    </p>
                  )}
                  <p className="text-muted-foreground text-xs">
                    Use apenas letras, números, underscore (_) e hífen (-). Sem espaços.
                  </p>
                </div>

                <Separator />

                {/* Webhook (opcional) */}
                <div className="space-y-2">
                  <Label htmlFor="webhook" className="text-sm font-medium">
                    URL do Webhook (Opcional)
                  </Label>
                  <Input
                    id="webhook"
                    value={formData.webhook}
                    onChange={(e) => setFormData({ ...formData, webhook: e.target.value })}
                    placeholder="https://meusite.com/api/webhook/whatsapp"
                    className={`${errors.webhook ? 'border-red-500' : ''}`}
                    disabled={loading}
                  />
                  {errors.webhook && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.webhook}
                    </p>
                  )}
                  <p className="text-muted-foreground text-xs">
                    URL onde serão enviadas as mensagens recebidas. Pode ser configurado depois.
                  </p>
                </div>

                <Separator />

                {/* Próximos passos */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <QrCode className="h-4 w-4" />
                    Próximos passos
                  </h3>
                  <ol className="text-sm text-gray-600 space-y-1">
                    <li>1. Criar a instância no servidor</li>
                    <li>2. Gerar QR Code para conexão</li>
                    <li>3. Escanear com WhatsApp no celular</li>
                    <li>4. Começar a usar!</li>
                  </ol>
                </div>

                {/* Botões */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={loading}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Criar Instância
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </BlurFade>

        {/* Exemplos de uso */}
        <BlurFade delay={0.4}>
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Exemplos de nomes válidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-green-600 font-medium mb-1">✅ Válidos:</p>
                  <ul className="text-gray-600 space-y-1">
                    <li>• escritorio_principal</li>
                    <li>• atendimento_juridico</li>
                    <li>• dr_silva</li>
                    <li>• whatsapp-comercial</li>
                  </ul>
                </div>
                <div>
                  <p className="text-red-600 font-medium mb-1">❌ Inválidos:</p>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Escritório Principal (espaços)</li>
                    <li>• dr.silva (pontos)</li>
                    <li>• atendimento@juridico (símbolos)</li>
                    <li>• wt (muito curto)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </BlurFade>
      </div>
    </DashboardLayout>
  )
} 