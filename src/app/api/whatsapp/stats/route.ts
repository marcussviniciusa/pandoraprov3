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

    // Simular estatísticas do WhatsApp
    // Em um cenário real, isso viria de agregações do banco de dados
    const stats = {
      totalInstances: 3,
      connectedInstances: 2,
      totalMessages: 2595, // Soma das mensagens de todas instâncias
      totalChats: 68, // Soma dos chats de todas instâncias
      responseRate: 92.5, // Percentual de mensagens respondidas
      averageResponseTime: 8.3 // Tempo médio de resposta em minutos
    }

    // Dados adicionais para dashboards mais detalhados
    const detailedStats = {
      ...stats,
      messagesLast24h: 156,
      newChatsLast24h: 12,
      messagesThisWeek: 892,
      newChatsThisWeek: 47,
      topInstanceByMessages: 'WhatsApp Escritório Principal',
      instancesStatus: {
        connected: 2,
        disconnected: 1,
        connecting: 0,
        qr_code: 0
      },
      messagesByHour: [
        { hour: '09:00', messages: 45 },
        { hour: '10:00', messages: 67 },
        { hour: '11:00', messages: 89 },
        { hour: '14:00', messages: 102 },
        { hour: '15:00', messages: 78 },
        { hour: '16:00', messages: 56 },
        { hour: '17:00', messages: 34 }
      ],
      responseTimeByDay: [
        { day: 'Segunda', avgTime: 7.2 },
        { day: 'Terça', avgTime: 8.1 },
        { day: 'Quarta', avgTime: 6.8 },
        { day: 'Quinta', avgTime: 9.4 },
        { day: 'Sexta', avgTime: 8.8 }
      ]
    }

    return NextResponse.json({
      success: true,
      data: detailedStats
    })

  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas WhatsApp:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
} 