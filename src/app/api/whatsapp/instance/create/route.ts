import { NextRequest, NextResponse } from 'next/server'
import { getTokenUserData } from '@/lib/auth'

interface CreateInstanceRequest {
  instanceName: string
  qrcode?: boolean
  webhook?: string
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
    const body: CreateInstanceRequest = await request.json()
    const { instanceName, qrcode = true, webhook } = body

    // Validação básica
    if (!instanceName || instanceName.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Nome da instância é obrigatório' },
        { status: 400 }
      )
    }

    // Sanitizar nome da instância (apenas letras, números e underscore)
    const sanitizedName = instanceName.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()
    
    // URL da Evolution API
    const evolutionApiUrl = process.env.EVOLUTION_API_URL
    const evolutionApiKey = process.env.EVOLUTION_API_KEY

    if (!evolutionApiUrl) {
      return NextResponse.json(
        { success: false, message: 'Evolution API não configurada' },
        { status: 500 }
      )
    }

    // Payload para criar instância na Evolution API
    const createPayload = {
      instanceName: sanitizedName,
      qrcode: qrcode,
      integration: "WHATSAPP-BAILEYS"
    }

    // Se webhook fornecido, adicionar ao payload
    if (webhook) {
      const webhookPayload = {
        url: webhook,
        webhook_by_events: false,
        webhook_base64: false,
        events: [
          "QRCODE_UPDATED",
          "MESSAGES_UPSERT", 
          "MESSAGES_UPDATE",
          "MESSAGES_DELETE",
          "SEND_MESSAGE",
          "CONNECTION_UPDATE"
        ]
      }
      
      // Primeiro criar instância, depois configurar webhook
      console.log('🔧 Configurando webhook para instância:', sanitizedName)
    }

    console.log('🚀 Criando instância na Evolution API:', sanitizedName)

    // Fazer requisição para Evolution API
    const evolutionResponse = await fetch(`${evolutionApiUrl}/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(evolutionApiKey && { 'apikey': evolutionApiKey })
      },
      body: JSON.stringify(createPayload)
    })

    const evolutionData = await evolutionResponse.json()

    if (!evolutionResponse.ok) {
      console.error('❌ Erro da Evolution API:', evolutionData)
      return NextResponse.json(
        { 
          success: false, 
          message: `Erro da Evolution API: ${evolutionData.message || 'Erro desconhecido'}` 
        },
        { status: evolutionResponse.status }
      )
    }

    // Configurar webhook se fornecido
    if (webhook) {
      try {
        const webhookResponse = await fetch(`${evolutionApiUrl}/webhook/set/${sanitizedName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(evolutionApiKey && { 'apikey': evolutionApiKey })
          },
          body: JSON.stringify({
            url: webhook,
            webhook_by_events: false,
            webhook_base64: false,
            events: [
              "QRCODE_UPDATED",
              "MESSAGES_UPSERT",
              "MESSAGES_UPDATE", 
              "MESSAGES_DELETE",
              "SEND_MESSAGE",
              "CONNECTION_UPDATE"
            ]
          })
        })

        if (webhookResponse.ok) {
          console.log('✅ Webhook configurado com sucesso para:', sanitizedName)
        } else {
          console.warn('⚠️ Erro ao configurar webhook, mas instância criada:', sanitizedName)
        }
      } catch (webhookError) {
        console.warn('⚠️ Erro ao configurar webhook:', webhookError)
      }
    }

    console.log('✅ Instância criada com sucesso:', sanitizedName)

    // Salvar instância no banco de dados vinculada ao usuário
    try {
      const { connectToDatabase } = await import('@/lib/mongodb')
      const { WhatsAppInstance } = await import('@/models/whatsapp')
      
      await connectToDatabase()

      // Criar registro da instância no banco
      const instanceRecord = new WhatsAppInstance({
        instanceName: sanitizedName,
        tenantId: userData.userId,
        status: 'connecting',
        webhookConfigured: !!webhook,
        isActive: true,
        connectionAttempts: 1,
        lastConnectionAttempt: new Date()
      })

      await instanceRecord.save()
      
      console.log('✅ Instância salva no banco de dados:', sanitizedName)
    } catch (dbError) {
      console.error('⚠️ Erro ao salvar instância no banco:', dbError)
      // Não falhar a operação, pois a instância já foi criada na Evolution API
    }

    // Retornar dados da instância criada
    return NextResponse.json({
      success: true,
      message: 'Instância criada com sucesso',
      data: {
        instanceName: sanitizedName,
        qrcode: qrcode,
        webhook: webhook || null,
        evolutionData: evolutionData
      }
    })

  } catch (error) {
    console.error('❌ Erro ao criar instância:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
} 