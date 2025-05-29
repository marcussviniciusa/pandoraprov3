import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { instanceName, number, message } = await request.json()
    
    if (!instanceName || !number || !message) {
      return NextResponse.json({
        success: false,
        message: 'Instância, número e mensagem são obrigatórios'
      }, { status: 400 })
    }
    
    // Import dinâmico
    const { sendTextMessage, checkInstanceConnection } = await import('@/lib/evolution-api')
    
    // Verificar se a instância está conectada
    console.log('🔍 Verificando conexão da instância antes do envio:', instanceName)
    const connectionStatus = await checkInstanceConnection(instanceName)
    
    if (!connectionStatus.success) {
      return NextResponse.json({
        success: false,
        message: `Erro ao verificar instância '${instanceName}'`,
        recommendation: 'Verifique se a instância foi criada corretamente',
        error: connectionStatus.error
      }, { status: 400 })
    }
    
    if (!connectionStatus.connected) {
      return NextResponse.json({
        success: false,
        message: `Instância '${instanceName}' não está conectada`,
        recommendation: 'Escaneie o QR Code para conectar a instância primeiro',
        data: {
          instanceStatus: connectionStatus.status,
          connected: false
        }
      }, { status: 400 })
    }
    
    // Enviar mensagem
    console.log(`📤 Enviando mensagem via ${instanceName} para ${number}`)
    console.log(`📄 Mensagem: ${message}`)
    
    const result = await sendTextMessage(instanceName, number, message)
    
    return NextResponse.json({
      success: true,
      message: 'Mensagem enviada com sucesso!',
      data: {
        instanceName: instanceName,
        number: number,
        messageText: message,
        sendResult: result,
        connectionStatus: connectionStatus
      },
      recommendation: 'Mensagem enviada via instância conectada por QR Code'
    })
    
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error)
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Erro desconhecido ao enviar mensagem',
      error: String(error),
      recommendation: 'Verifique se a instância está conectada via QR Code'
    }, { status: 500 })
  }
} 