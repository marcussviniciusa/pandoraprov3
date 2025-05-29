import { NextRequest, NextResponse } from 'next/server'
import { getTokenUserData } from '@/lib/auth'

interface UpdateInstanceRequest {
  instanceName: string
  webhook?: string
}

export async function PUT(request: NextRequest) {
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
    const body: UpdateInstanceRequest = await request.json()
    const { instanceName, webhook } = body

    // Validação básica
    if (!instanceName || instanceName.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Nome da instância é obrigatório' },
        { status: 400 }
      )
    }

    // Validar webhook se fornecido
    if (webhook && !/^https?:\/\/.+/.test(webhook)) {
      return NextResponse.json(
        { success: false, message: 'URL do webhook deve começar com http:// ou https://' },
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

    console.log('🔧 Atualizando configurações da instância:', instanceName)

    // Atualizar webhook se fornecido
    if (webhook) {
      try {
        const webhookResponse = await fetch(`${evolutionApiUrl}/webhook/set/${instanceName}`, {
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

        if (!webhookResponse.ok) {
          const errorData = await webhookResponse.json().catch(() => null)
          throw new Error(errorData?.message || 'Erro ao configurar webhook')
        }

        console.log('✅ Webhook configurado com sucesso para:', instanceName)

      } catch (webhookError) {
        console.error('❌ Erro ao configurar webhook:', webhookError)
        return NextResponse.json(
          { 
            success: false, 
            message: `Erro ao configurar webhook: ${webhookError instanceof Error ? webhookError.message : 'Erro desconhecido'}` 
          },
          { status: 500 }
        )
      }
    } else {
      // Remover webhook se string vazia
      try {
        await fetch(`${evolutionApiUrl}/webhook/set/${instanceName}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...(evolutionApiKey && { 'apikey': evolutionApiKey })
          }
        })

        console.log('🗑️ Webhook removido para:', instanceName)

      } catch (deleteError) {
        console.warn('⚠️ Erro ao remover webhook (pode não existir):', deleteError)
        // Não é erro crítico, continuar
      }
    }

    console.log('✅ Configurações atualizadas com sucesso:', instanceName)

    // Retornar sucesso
    return NextResponse.json({
      success: true,
      message: 'Configurações atualizadas com sucesso',
      data: {
        instanceName: instanceName,
        webhook: webhook || null,
        updatedAt: new Date()
      }
    })

  } catch (error) {
    console.error('❌ Erro ao atualizar instância:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
} 