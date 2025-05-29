import { NextRequest, NextResponse } from 'next/server'
import Documento from '@/models/documento'
import { connectToDatabase } from '@/lib/mongodb'
import { getTokenUserData } from '@/lib/auth'
import { StatusDocumento } from '@/types/documento'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

export async function PATCH(request: NextRequest, context: RouteContext) {
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

    const { id } = await context.params
    const { status, observacoes } = await request.json()

    // Validar dados
    if (!status || !['pendente', 'recebido', 'analisado', 'aprovado', 'rejeitado'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Status inválido' },
        { status: 400 }
      )
    }

    // Buscar documento
    const documento = await Documento.findOne({
      _id: id,
      tenantId: userData.tenantId
    })

    if (!documento) {
      return NextResponse.json(
        { success: false, message: 'Documento não encontrado' },
        { status: 404 }
      )
    }

    // Atualizar status
    documento.status = status as StatusDocumento
    
    if (observacoes) {
      documento.observacoes = observacoes
    }

    // Se aprovando ou rejeitando, registrar quem fez a ação
    if (status === 'aprovado') {
      documento.aprovacao = {
        aprovadoPor: userData.userId,
        dataAprovacao: new Date()
      }
    } else if (status === 'rejeitado') {
      documento.aprovacao = {
        aprovadoPor: userData.userId,
        dataAprovacao: new Date(),
        motivoRejeicao: observacoes || 'Não especificado'
      }
    }

    await documento.save()

    return NextResponse.json({
      success: true,
      message: `Documento ${status === 'aprovado' ? 'aprovado' : status === 'rejeitado' ? 'rejeitado' : 'atualizado'} com sucesso`,
      documento: {
        id: documento._id,
        status: documento.status,
        observacoes: documento.observacoes,
        aprovacao: documento.aprovacao
      }
    })

  } catch (error) {
    console.error('❌ Erro ao atualizar status do documento:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
} 