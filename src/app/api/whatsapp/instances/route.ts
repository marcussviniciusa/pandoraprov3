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

    // Simular dados de instâncias WhatsApp
    // Em um cenário real, isso viria de um banco de dados ou API externa
    const instances = [
      {
        id: 'instance_1',
        name: 'WhatsApp Escritório Principal',
        number: '+55 11 99999-8888',
        status: 'connected',
        profileName: 'Escritório Silva Advocacia',
        profilePicture: '',
        lastSeen: new Date(),
        messagesCount: 1247,
        chatsCount: 34
      },
      {
        id: 'instance_2', 
        name: 'WhatsApp Atendimento',
        number: '+55 11 98888-7777',
        status: 'connected',
        profileName: 'Atendimento Silva',
        profilePicture: '',
        lastSeen: new Date(Date.now() - 5 * 60 * 1000), // 5 min ago
        messagesCount: 892,
        chatsCount: 22
      },
      {
        id: 'instance_3',
        name: 'WhatsApp Dr. João',
        number: '+55 11 97777-6666',
        status: 'disconnected',
        profileName: 'Dr. João Silva',
        profilePicture: '',
        lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        messagesCount: 456,
        chatsCount: 12
      }
    ]

    return NextResponse.json({
      success: true,
      data: instances,
      meta: {
        total: instances.length,
        connected: instances.filter(i => i.status === 'connected').length,
        disconnected: instances.filter(i => i.status === 'disconnected').length
      }
    })

  } catch (error) {
    console.error('❌ Erro ao buscar instâncias WhatsApp:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
} 