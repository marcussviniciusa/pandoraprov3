import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { MessageWhatsApp } from '@/models/whatsapp'
import { getTokenUserData } from '@/lib/auth'

interface RouteContext {
  params: Promise<{
    chatId: string
  }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    // Verificar autenticação
    const userData = await getTokenUserData(request)
    if (!userData) {
      return NextResponse.json(
        { success: false, message: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Conectar ao banco de dados
    await connectToDatabase()

    const { chatId } = await context.params
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '50')

    // Buscar mensagens do chat
    const messages = await MessageWhatsApp.find({
      chatId: chatId,
      tenantId: userData.tenantId
    })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean()

    // Transformar dados para o formato da interface
    const formattedMessages = messages.reverse().map(message => ({
      id: message._id.toString(),
      content: message.content,
      fromMe: message.fromMe,
      timestamp: message.timestamp,
      status: message.status,
      messageType: message.messageType,
      mediaUrl: message.mediaUrl,
      fileName: message.fileName,
      caption: message.caption
    }))

    return NextResponse.json({
      success: true,
      data: formattedMessages
    })

  } catch (error) {
    console.error('❌ Erro ao buscar mensagens:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
} 