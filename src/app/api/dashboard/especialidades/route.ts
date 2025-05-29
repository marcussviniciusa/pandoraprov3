import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Cliente from '@/models/Cliente'
import { getTokenUserData } from '@/lib/auth'

// Mapeamento de cores para cada especialidade
const especialidadeColors = {
  aposentadoria_idade: 'bg-blue-500',
  aposentadoria_tempo_contribuicao: 'bg-green-500',
  aposentadoria_especial: 'bg-purple-500',
  auxilio_doenca: 'bg-red-500',
  bpc: 'bg-orange-500',
  pensao_morte: 'bg-gray-500'
}

// Labels das especialidades em português
const especialidadeLabels = {
  aposentadoria_idade: 'Aposentadoria por Idade',
  aposentadoria_tempo_contribuicao: 'Aposentadoria por Tempo',
  aposentadoria_especial: 'Aposentadoria Especial',
  auxilio_doenca: 'Auxílio-Doença',
  bpc: 'BPC',
  pensao_morte: 'Pensão por Morte'
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

    // Agregação para contar por especialidade
    const distribuicao = await Cliente.aggregate([
      {
        $match: { 
          ativo: true 
        }
      },
      {
        $group: {
          _id: '$especialidade',
          casos: { $sum: 1 }
        }
      },
      {
        $sort: { casos: -1 }
      }
    ])

    // Transformar dados para o formato esperado pelo frontend
    const especialidadesFormatadas = distribuicao.map(item => ({
      nome: especialidadeLabels[item._id as keyof typeof especialidadeLabels] || item._id,
      casos: item.casos,
      color: especialidadeColors[item._id as keyof typeof especialidadeColors] || 'bg-gray-500'
    }))

    return NextResponse.json({
      success: true,
      data: especialidadesFormatadas
    })

  } catch (error) {
    console.error('❌ Erro ao carregar distribuição por especialidades:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
} 