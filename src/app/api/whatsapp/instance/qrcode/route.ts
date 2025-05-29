import { NextRequest, NextResponse } from 'next/server'
import { getTokenUserData } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const userData = await getTokenUserData(request)
    if (!userData) {
      return NextResponse.json(
        { success: false, message: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Obter instanceName da query string
    const { searchParams } = new URL(request.url)
    const instanceName = searchParams.get('instanceName')

    if (!instanceName) {
      return NextResponse.json(
        { success: false, message: 'Nome da instância é obrigatório' },
        { status: 400 }
      )
    }

    // URL da Evolution API
    const evolutionApiUrl = process.env.EVOLUTION_API_URL
    const evolutionApiKey = process.env.EVOLUTION_API_KEY

    if (!evolutionApiUrl) {
      return NextResponse.json(
        { success: false, message: 'Evolution API não configurada' },
        { status: 500 }
      )
    }

    console.log('📱 Buscando QR Code para instância:', instanceName)

    // Fazer requisição para buscar QR Code na Evolution API
    const evolutionResponse = await fetch(`${evolutionApiUrl}/instance/connect/${instanceName}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(evolutionApiKey && { 'apikey': evolutionApiKey })
      }
    })

    if (!evolutionResponse.ok) {
      const errorData = await evolutionResponse.json().catch(() => null)
      console.error('❌ Erro ao buscar QR Code:', errorData)
      
      return NextResponse.json(
        { 
          success: false, 
          message: `Erro ao buscar QR Code: ${errorData?.message || 'Instância não encontrada'}` 
        },
        { status: evolutionResponse.status }
      )
    }

    const evolutionData = await evolutionResponse.json()

    // A Evolution API pode retornar diferentes formatos dependendo do estado
    let qrCodeData = null
    let connectionStatus = 'disconnected'

    if (evolutionData.base64) {
      // QR Code disponível
      qrCodeData = evolutionData.base64
      connectionStatus = 'qr_code'
      console.log('📱 QR Code obtido com sucesso para:', instanceName)
    } else if (evolutionData.instance?.state === 'open') {
      // Já conectado
      connectionStatus = 'connected'
      console.log('✅ Instância já conectada:', instanceName)
    } else {
      // Outros estados
      connectionStatus = evolutionData.instance?.state || 'disconnected'
      console.log('🔄 Status da instância:', instanceName, connectionStatus)
    }

    return NextResponse.json({
      success: true,
      data: {
        instanceName: instanceName,
        qrCode: qrCodeData,
        status: connectionStatus,
        instance: evolutionData.instance || null
      }
    })

  } catch (error) {
    console.error('❌ Erro ao buscar QR Code:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const userData = await getTokenUserData(request)
    if (!userData) {
      return NextResponse.json(
        { success: false, message: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Ler dados da requisição
    const body = await request.json()
    const { instanceName } = body

    if (!instanceName) {
      return NextResponse.json(
        { success: false, message: 'Nome da instância é obrigatório' },
        { status: 400 }
      )
    }

    // URL da Evolution API
    const evolutionApiUrl = process.env.EVOLUTION_API_URL
    const evolutionApiKey = process.env.EVOLUTION_API_KEY

    if (!evolutionApiUrl) {
      return NextResponse.json(
        { success: false, message: 'Evolution API não configurada' },
        { status: 500 }
      )
    }

    console.log('🔄 Forçando geração de novo QR Code para:', instanceName)

    // Fazer requisição para conectar/gerar novo QR Code
    const evolutionResponse = await fetch(`${evolutionApiUrl}/instance/connect/${instanceName}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(evolutionApiKey && { 'apikey': evolutionApiKey })
      }
    })

    if (!evolutionResponse.ok) {
      const errorData = await evolutionResponse.json().catch(() => null)
      console.error('❌ Erro ao gerar QR Code:', errorData)
      
      return NextResponse.json(
        { 
          success: false, 
          message: `Erro ao gerar QR Code: ${errorData?.message || 'Erro desconhecido'}` 
        },
        { status: evolutionResponse.status }
      )
    }

    const evolutionData = await evolutionResponse.json()

    return NextResponse.json({
      success: true,
      message: 'QR Code gerado com sucesso',
      data: {
        instanceName: instanceName,
        qrCode: evolutionData.base64 || null,
        status: evolutionData.instance?.state || 'qr_code'
      }
    })

  } catch (error) {
    console.error('❌ Erro ao gerar QR Code:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
} 