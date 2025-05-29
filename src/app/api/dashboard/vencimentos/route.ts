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

    const hoje = new Date()
    const em30Dias = new Date()
    em30Dias.setDate(hoje.getDate() + 30)

    // Buscar clientes com próximas perícias ou vencimentos
    const clientesComVencimentos = await Cliente.find({
      ativo: true,
      $or: [
        {
          'dadosPrevidenciarios.proximaPericia': {
            $gte: hoje,
            $lte: em30Dias
          }
        }
      ]
    }).lean() as any[]

    // Transformar dados para o formato esperado
    const proximosVencimentos = clientesComVencimentos.map(cliente => {
      const proximaPericia = cliente.dadosPrevidenciarios?.proximaPericia
      
      if (proximaPericia) {
        const dataPericia = new Date(proximaPericia)
        const diffTime = dataPericia.getTime() - hoje.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        return {
          cliente: cliente.nome,
          tipo: 'Perícia Médica',
          data: dataPericia.toLocaleDateString('pt-BR'),
          dias: diffDays
        }
      }
      
      return null
    }).filter((item): item is NonNullable<typeof item> => item !== null)

    // Simular alguns vencimentos adicionais se não houver dados suficientes
    if (proximosVencimentos.length === 0) {
      const vencimentosSimulados = [
        {
          cliente: 'Sistema de Monitoramento',
          tipo: 'Verificação de Dados',
          data: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
          dias: 7
        }
      ]
      
      return NextResponse.json({
        success: true,
        data: vencimentosSimulados
      })
    }

    // Ordenar por dias (mais próximos primeiro)
    proximosVencimentos.sort((a, b) => a.dias - b.dias)

    return NextResponse.json({
      success: true,
      data: proximosVencimentos.slice(0, 10) // Limitar a 10 resultados
    })

  } catch (error) {
    console.error('❌ Erro ao carregar próximos vencimentos:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
} 