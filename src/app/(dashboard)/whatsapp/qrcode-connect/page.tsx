'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'

export default function QRCodeConnectPage() {
  const [loading, setLoading] = useState(false)
  const [instanceName, setInstanceName] = useState('')
  const [result, setResult] = useState<any>(null)
  const [qrCode, setQrCode] = useState('')
  const [connectionStatus, setConnectionStatus] = useState<'pending' | 'connecting' | 'connected' | 'error'>('pending')

  const createInstance = async () => {
    if (!instanceName.trim()) {
      setResult({
        success: false,
        message: 'Por favor, digite um nome para a instância'
      })
      return
    }

    try {
      setLoading(true)
      setResult(null)
      setQrCode('')
      setConnectionStatus('pending')
      
      console.log('🆕 Criando instância:', instanceName)
      
      const response = await fetch('/api/whatsapp/qrcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instanceName: instanceName.trim(),
          action: 'create'
        })
      })
      
      const data = await response.json()
      setResult(data)
      
      if (data.success) {
        setConnectionStatus('connecting')
        // Aguardar um pouco e depois buscar QR Code automaticamente
        setTimeout(() => {
          fetchQRCode()
        }, 5000)
      }
      
    } catch (error) {
      setResult({
        success: false,
        message: 'Erro ao criar instância',
        error: String(error)
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchQRCode = async () => {
    if (!instanceName.trim()) return

    try {
      setLoading(true)
      
      console.log('📱 Buscando QR Code para:', instanceName)
      
      const response = await fetch('/api/whatsapp/qrcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instanceName: instanceName.trim(),
          action: 'qrcode'
        })
      })
      
      const data = await response.json()
      setResult(data)
      
      if (data.success && data.data.qrCode) {
        // Remover o prefixo data:image/png;base64, se existir
        const base64Data = data.data.qrCode.replace(/^data:image\/[a-zA-Z]+;base64,/, '')
        setQrCode(base64Data)
        setConnectionStatus('connecting')
        
        // Iniciar verificação periódica da conexão
        checkConnectionPeriodically()
      }
      
    } catch (error) {
      setResult({
        success: false,
        message: 'Erro ao buscar QR Code',
        error: String(error)
      })
    } finally {
      setLoading(false)
    }
  }

  const checkConnection = async () => {
    if (!instanceName.trim()) return

    try {
      setLoading(true)
      
      const response = await fetch('/api/whatsapp/qrcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instanceName: instanceName.trim(),
          action: 'check'
        })
      })
      
      const data = await response.json()
      setResult(data)
      
      if (data.success && data.data.connected) {
        setConnectionStatus('connected')
      } else {
        setConnectionStatus('connecting')
      }
      
      return data.success && data.data.connected
      
    } catch (error) {
      setResult({
        success: false,
        message: 'Erro ao verificar conexão',
        error: String(error)
      })
      setConnectionStatus('error')
      return false
    } finally {
      setLoading(false)
    }
  }

  const checkConnectionPeriodically = () => {
    const interval = setInterval(async () => {
      const isConnected = await checkConnection()
      if (isConnected) {
        clearInterval(interval)
      }
    }, 5000) // Verificar a cada 5 segundos

    // Parar após 2 minutos
    setTimeout(() => {
      clearInterval(interval)
    }, 120000)
  }

  const deleteInstance = async () => {
    if (!instanceName.trim()) return

    try {
      setLoading(true)
      
      const response = await fetch('/api/whatsapp/qrcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instanceName: instanceName.trim(),
          action: 'delete'
        })
      })
      
      const data = await response.json()
      setResult(data)
      
      if (data.success) {
        setQrCode('')
        setConnectionStatus('pending')
      }
      
    } catch (error) {
      setResult({
        success: false,
        message: 'Erro ao deletar instância',
        error: String(error)
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'pending':
        return <Badge className="bg-gray-500">⏳ Aguardando</Badge>
      case 'connecting':
        return <Badge className="bg-yellow-500">🔄 Conectando</Badge>
      case 'connected':
        return <Badge className="bg-green-500">✅ Conectada</Badge>
      case 'error':
        return <Badge className="bg-red-500">❌ Erro</Badge>
      default:
        return <Badge className="bg-gray-500">❓ Desconhecido</Badge>
    }
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          📱 Conexão via QR Code
          <Badge className="bg-blue-500">MÉTODO PRINCIPAL</Badge>
        </h1>
        <p className="text-muted-foreground">
          Crie uma instância WhatsApp e conecte via QR Code
        </p>
      </div>

      {/* Instruções */}
      <Alert>
        <AlertDescription>
          <strong>🎯 Como funciona:</strong><br/>
          1. ✅ <strong>Digite um nome</strong> para sua instância WhatsApp<br/>
          2. ✅ <strong>Crie a instância</strong> clicando em "Criar Instância"<br/>
          3. ✅ <strong>Escaneie o QR Code</strong> com seu WhatsApp<br/>
          4. ✅ <strong>Aguarde a conexão</strong> ser estabelecida<br/>
          <br/>
          <strong>💡 Dica:</strong> Use nomes únicos como "suporte2024", "vendas", "atendimento"
        </AlertDescription>
      </Alert>

      {/* Formulário Principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            🚀 Criar Nova Instância
            {getStatusBadge()}
          </CardTitle>
          <CardDescription>
            Digite um nome único para sua instância WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={instanceName}
              onChange={(e) => setInstanceName(e.target.value)}
              placeholder="Nome da instância (ex: suporte2024)"
              className="flex-1"
              maxLength={20}
            />
            
            <Button 
              onClick={createInstance}
              disabled={loading || !instanceName.trim()}
              className="min-w-[120px]"
            >
              {loading ? '⏳ Criando...' : '🆕 Criar Instância'}
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={fetchQRCode}
              disabled={loading || !instanceName.trim()}
              variant="outline"
              className="flex-1"
            >
              {loading ? '⏳' : '📱 Buscar QR Code'}
            </Button>
            
            <Button 
              onClick={checkConnection}
              disabled={loading || !instanceName.trim()}
              variant="outline"
              className="flex-1"
            >
              {loading ? '⏳' : '🔍 Verificar Conexão'}
            </Button>
            
            <Button 
              onClick={deleteInstance}
              disabled={loading || !instanceName.trim()}
              variant="destructive"
              className="flex-1"
            >
              {loading ? '⏳' : '🗑️ Deletar'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* QR Code */}
      {qrCode && (
        <Card>
          <CardHeader>
            <CardTitle>📱 QR Code para Conexão</CardTitle>
            <CardDescription>
              Escaneie este QR Code com seu WhatsApp para conectar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-lg shadow-lg">
                <img 
                  src={`data:image/png;base64,${qrCode}`} 
                  alt="QR Code WhatsApp"
                  className="w-64 h-64"
                />
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="font-medium text-blue-800 mb-2">📋 Instruções para Conectar:</p>
              <ol className="text-sm list-decimal list-inside space-y-1">
                <li>Abra o WhatsApp no seu celular</li>
                <li>Toque nos três pontos (⋮) no canto superior direito</li>
                <li>Selecione "Aparelhos conectados"</li>
                <li>Toque em "Conectar um aparelho"</li>
                <li>Escaneie este QR Code com a câmera do celular</li>
                <li>Aguarde a confirmação da conexão</li>
              </ol>
            </div>
            
            <Alert>
              <AlertDescription>
                <strong>⏰ Importante:</strong> O QR Code expira em 60 segundos. Se não conseguir conectar, clique em "Buscar QR Code" novamente.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Resultado */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? '✅ Resultado' : '❌ Erro'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p><strong>Mensagem:</strong> {result.message}</p>
              
              {result.recommendation && (
                <Alert>
                  <AlertDescription>
                    <strong>💡 Recomendação:</strong> {result.recommendation}
                  </AlertDescription>
                </Alert>
              )}
              
              {result.data?.connected !== undefined && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="font-medium text-green-800 mb-2">📊 Status da Conexão:</p>
                  <div className="text-sm space-y-1">
                    <p><strong>Instância:</strong> {result.data.instanceName}</p>
                    <p><strong>Conectada:</strong> {result.data.connected ? '✅ Sim' : '❌ Não'}</p>
                    <p><strong>Status:</strong> {result.data.status}</p>
                    <p><strong>Pronta para uso:</strong> {result.data.isReady ? '✅ Sim' : '❌ Não'}</p>
                  </div>
                </div>
              )}
              
              {result.error && (
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="font-medium text-red-800 mb-2">❌ Detalhes do Erro:</p>
                  <p className="text-sm text-red-600">{result.error}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Guia de Uso */}
      <Card>
        <CardHeader>
          <CardTitle>📖 Guia de Uso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 border rounded-lg">
              <p className="font-medium mb-2">🎯 Passo a Passo:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Digite nome da instância</li>
                <li>Clique em "Criar Instância"</li>
                <li>Aguarde o QR Code aparecer</li>
                <li>Escaneie com WhatsApp</li>
                <li>Aguarde confirmação</li>
              </ol>
            </div>
            
            <div className="p-3 border rounded-lg">
              <p className="font-medium mb-2">⚠️ Problemas Comuns:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>QR Code não aparece: aguarde mais tempo</li>
                <li>QR Code expirou: busque novamente</li>
                <li>Não conecta: verifique internet</li>
                <li>Erro de criação: use nome diferente</li>
              </ul>
            </div>
            
            <div className="p-3 border rounded-lg">
              <p className="font-medium mb-2">✅ Boas Práticas:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Use nomes únicos e descritivos</li>
                <li>Mantenha o WhatsApp atualizado</li>
                <li>Tenha boa conexão de internet</li>
                <li>Aguarde a confirmação completa</li>
              </ul>
            </div>
            
            <div className="p-3 border rounded-lg">
              <p className="font-medium mb-2">🔧 Funcionalidades:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Criação automática de instância</li>
                <li>QR Code em tempo real</li>
                <li>Verificação automática de conexão</li>
                <li>Instruções detalhadas</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 