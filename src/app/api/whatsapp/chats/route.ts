import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ChatWhatsApp } from '@/models/whatsapp'
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

    // Conectar ao banco de dados
    await connectToDatabase()

    // Buscar chats da empresa do usuário
    const chats = await ChatWhatsApp.find({})
      .sort({ lastMessageTimestamp: -1 })
      .limit(50)
      .lean()

    // Transformar dados para o formato da interface
    const formattedChats = chats.map(chat => ({
      id: chat._id.toString(),
      contactName: chat.contactName,
      contactPhone: extractPhoneFromJid(chat.contactJid),
      contactJid: chat.contactJid,
      lastMessage: chat.lastMessage || '',
      lastMessageTime: chat.lastMessageTimestamp || chat.updatedAt,
      unreadCount: chat.unreadCount || 0,
      isOnline: false, // TODO: Implementar status online real
      profilePicture: chat.contactProfilePicture,
      clienteId: chat.clienteId
    }))

    return NextResponse.json({
      success: true,
      data: formattedChats
    })

  } catch (error) {
    console.error('❌ Erro ao buscar chats:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
}

function extractPhoneFromJid(jid: string): string {
  return jid.replace('@s.whatsapp.net', '').replace('@g.us', '')
} 