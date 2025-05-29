'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function ExternalConnectPage() {
  const [loading, setLoading] = useState(false)
  const [instanceName, setInstanceName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [result, setResult] = useState<any>(null)

  const testPairingCode = async () => {
    try {
      setLoading(true)
      setResult(null)
      
      const response = await fetch('/api/whatsapp/pairing-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          instanceName,
          phoneNumber: phoneNumber || undefined
        })
      })
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ success: false, message: 'Erro de conexão', error: String(error) })
    } finally {
      setLoading(false)
    }
  }

  const checkExternalInstance = async () => {
    try {
      setLoading(true)
      setResult(null)
      
      const response = await fetch(`/api/whatsapp/pairing-code?instance=${instanceName}`)
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ success: false, message: 'Erro de conexão', error: String(error) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">🔗 Conexão Evolution API - Métodos Avançados</h1>
        <p className="text-muted-foreground">
          Diferentes formas de conectar instâncias WhatsApp na Evolution API
        </p>
      </div>

      <Tabs defaultValue="pairing" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pairing">🔐 Pairing Code</TabsTrigger>
          <TabsTrigger value="external">🏢 Instância Externa</TabsTrigger>
          <TabsTrigger value="guide">📖 Guia Completo</TabsTrigger>
        </TabsList>

        {/* Pairing Code */}
        <TabsContent value="pairing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔐 Pairing Code (Método Recomendado)
                <Badge className="bg-green-500">MAIS CONFIÁVEL</Badge>
              </CardTitle>
              <CardDescription>
                Conecte instâncias usando código de pareamento ao invés de QR Code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  <strong>Vantagens do Pairing Code:</strong><br/>
                  • Mais confiável que QR Code<br/>
                  • Funciona mesmo com problemas de conexão<br/>
                  • Não requer câmera ou scanner<br/>
                  • Código válido por 2 minutos
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome da Instância:</label>
                  <Input
                    value={instanceName}
                    onChange={(e) => setInstanceName(e.target.value)}
                    placeholder="Ex: minha-instancia"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Número (Opcional):</label>
                  <Input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Ex: 5565999999999"
                  />
                </div>
              </div>
              
              <Button 
                onClick={testPairingCode} 
                disabled={loading || !instanceName}
                className="w-full"
              >
                {loading ? '⏳ Gerando...' : '🔐 Obter Pairing Code'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Instância Externa */}
        <TabsContent value="external">
          <Card>
            <CardHeader>
              <CardTitle>🏢 Conectar Instância Externa</CardTitle>
              <CardDescription>
                Conecte instâncias criadas diretamente no dashboard da Evolution API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  <strong>Como funciona:</strong><br/>
                  1. Crie a instância no dashboard da Evolution API<br/>
                  2. Use este método para conectar no seu sistema<br/>
                  3. As credenciais serão sincronizadas automaticamente
                </AlertDescription>
              </Alert>

              <div>
                <label className="block text-sm font-medium mb-2">Nome da Instância Externa:</label>
                <Input
                  value={instanceName}
                  onChange={(e) => setInstanceName(e.target.value)}
                  placeholder="Nome exato da instância no dashboard"
                />
              </div>
              
              <Button 
                onClick={checkExternalInstance} 
                disabled={loading || !instanceName}
                className="w-full"
              >
                {loading ? '⏳ Verificando...' : '🔍 Verificar e Conectar'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Guia Completo */}
        <TabsContent value="guide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>📱 Método 1: Pairing Code</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <p><strong>1. Gere o código:</strong> Use a aba "Pairing Code"</p>
                  <p><strong>2. Abra o WhatsApp:</strong> No seu celular</p>
                  <p><strong>3. Vá em:</strong> Configurações → Aparelhos conectados</p>
                  <p><strong>4. Toque em:</strong> "Conectar aparelho"</p>
                  <p><strong>5. Escolha:</strong> "Inserir código manualmente"</p>
                  <p><strong>6. Digite o código</strong> e confirme</p>
                </div>
                <Badge className="bg-blue-500">Método Preferencial</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🏢 Método 2: Dashboard Evolution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <p><strong>1. Acesse:</strong> Dashboard da Evolution API</p>
                  <p><strong>2. Crie instância:</strong> Com nome único</p>
                  <p><strong>3. Conecte WhatsApp:</strong> Via QR/Pairing no dashboard</p>
                  <p><strong>4. Use nossa integração:</strong> Para importar a instância</p>
                  <p><strong>5. Sincronize credenciais:</strong> Automaticamente</p>
                </div>
                <Badge className="bg-purple-500">Para Múltiplas Instâncias</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>⚙️ Configuração Avançada</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <p><strong>CONFIG_SESSION_PHONE_VERSION:</strong></p>
                  <code className="block bg-gray-100 p-2 rounded text-xs">
                    2.3000.1023204200
                  </code>
                  <p className="text-xs text-muted-foreground">
                    Use esta versão no arquivo .env da Evolution API para resolver problemas de QR Code
                  </p>
                </div>
                <Badge className="bg-orange-500">Solução de Problemas</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🔧 Instâncias Disponíveis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <p><strong>✅ Conectadas (prontas):</strong></p>
                  <p>• vivabem, FINANCEIROEVO</p>
                  <p>• PROSPECTEVO, ValeriaRoque</p>
                  <p>• CLIENTESEVO, Laury</p>
                  <p><strong>⚠️ Desconectadas (reconectáveis):</strong></p>
                  <p>• LauryEvo, EVORaissa, etc.</p>
                </div>
                <Badge className="bg-green-500">6 Instâncias Ativas</Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Resultado */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? '✅ Sucesso' : '❌ Resultado'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p><strong>Mensagem:</strong> {result.message}</p>
              
              {result.data?.pairingCode && (
                <Alert>
                  <AlertDescription>
                    <div className="space-y-2">
                      <p><strong>🔐 Seu Pairing Code:</strong></p>
                      <div className="bg-blue-50 p-4 rounded font-mono text-2xl text-center border-2 border-blue-200">
                        {result.data.pairingCode}
                      </div>
                      <p className="text-sm"><strong>Válido por:</strong> {result.data.expiresIn}</p>
                      <div className="text-sm">
                        <p><strong>Instruções:</strong></p>
                        {result.data.instructions?.map((instruction: string, idx: number) => (
                          <p key={idx}>• {instruction}</p>
                        ))}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
              
              {result.data && !result.data.pairingCode && (
                <div>
                  <strong>Dados:</strong>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto mt-2">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}
              
              {result.error && (
                <div>
                  <strong>Detalhes do Erro:</strong>
                  <pre className="bg-red-50 p-3 rounded text-sm overflow-auto mt-2 text-red-600">
                    {result.error}
                  </pre>
                </div>
              )}

              {result.advantages && (
                <div>
                  <strong>Vantagens deste método:</strong>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    {result.advantages.map((advantage: string, idx: number) => (
                      <li key={idx}>{advantage}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 