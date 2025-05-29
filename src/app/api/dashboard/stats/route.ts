import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Cliente from '@/models/Cliente'
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

    // Calcular estatísticas principais
    const [
      totalClientes,
      casosAtivos,
      casosDeferidos,
      valorTotalBeneficios
    ] = await Promise.all([
      // Total de clientes ativos
      Cliente.countDocuments({ ativo: true }),
      
      // Casos ativos (não deferidos nem indeferidos)
      Cliente.countDocuments({ 
        ativo: true,
        statusProcessual: { 
          $nin: ['deferido', 'indeferido'] 
        }
      }),
      
      // Casos deferidos
      Cliente.countDocuments({ 
        ativo: true,
        statusProcessual: 'deferido' 
      }),
      
      // Valor total de benefícios (agregação)
      Cliente.aggregate([
        { 
          $match: { 
            ativo: true,
            'dadosPrevidenciarios.valorBeneficio': { $exists: true, $gt: 0 }
          } 
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$dadosPrevidenciarios.valorBeneficio' }
          }
        }
      ]).then(result => result[0]?.total || 0)
    ])

    return NextResponse.json({
      success: true,
      data: {
        totalClientes,
        casosAtivos,
        casosDeferidos,
        valorTotalBeneficios
      }
    })

  } catch (error) {
    console.error('❌ Erro ao carregar estatísticas do dashboard:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
} 