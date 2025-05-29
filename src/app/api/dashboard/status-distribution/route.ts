import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Cliente from '@/models/Cliente'
import { getTokenUserData } from '@/lib/auth'

// Mapeamento de cores para cada status
const statusColors = {
  consulta_inicial: 'bg-blue-500',
  documentacao_pendente: 'bg-yellow-500',
  analise_caso: 'bg-orange-500',
  protocolo_inss: 'bg-purple-500',
  aguardando_resposta: 'bg-indigo-500',
  recurso_contestacao: 'bg-red-500',
  deferido: 'bg-green-500',
  indeferido: 'bg-gray-500'
}

// Labels dos status em português
const statusLabels = {
  consulta_inicial: 'Consulta Inicial',
  documentacao_pendente: 'Documentação Pendente',
  analise_caso: 'Análise do Caso',
  protocolo_inss: 'Protocolo INSS',
  aguardando_resposta: 'Aguardando Resposta',
  recurso_contestacao: 'Recurso/Contestação',
  deferido: 'Deferido',
  indeferido: 'Indeferido'
}

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

    // Agregação para contar por status
    const distribuicao = await Cliente.aggregate([
      {
        $match: { 
          ativo: true 
        }
      },
      {
        $group: {
          _id: '$statusProcessual',
          quantidade: { $sum: 1 }
        }
      },
      {
        $sort: { quantidade: -1 }
      }
    ])

    // Transformar dados para o formato esperado pelo frontend
    const distribuicaoFormatada = distribuicao.map(item => ({
      status: statusLabels[item._id as keyof typeof statusLabels] || item._id,
      quantidade: item.quantidade,
      color: statusColors[item._id as keyof typeof statusColors] || 'bg-gray-500'
    }))

    return NextResponse.json({
      success: true,
      data: distribuicaoFormatada
    })

  } catch (error) {
    console.error('❌ Erro ao carregar distribuição por status:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
} 