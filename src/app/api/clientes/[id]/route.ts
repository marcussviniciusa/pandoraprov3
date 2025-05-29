import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Cliente from '@/models/Cliente'
import { getTokenUserData } from '@/lib/auth'

interface RouteContext {
  params: Promise<{ id: string }>
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

    const { id } = await context.params

    // Buscar cliente por ID
    const cliente = await Cliente.findOne({
      _id: id,
      ativo: true
    }).populate('advogadoResponsavel', 'nome email').lean() as any

    if (!cliente) {
      return NextResponse.json(
        { success: false, message: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: cliente._id,
        nome: cliente.nome,
        cpf: cliente.cpf,
        rg: cliente.rg,
        email: cliente.email,
        telefone: cliente.telefone,
        dataNascimento: cliente.dataNascimento,
        endereco: cliente.endereco,
        statusProcessual: cliente.statusProcessual,
        especialidade: cliente.especialidade,
        prioridade: cliente.prioridade,
        dadosPrevidenciarios: cliente.dadosPrevidenciarios,
        advogadoResponsavel: cliente.advogadoResponsavel,
        tags: cliente.tags,
        documentos: cliente.documentos,
        anotacoes: cliente.anotacoes,
        whatsappNumero: cliente.whatsappNumero,
        ativo: cliente.ativo,
        createdAt: cliente.createdAt,
        updatedAt: cliente.updatedAt
      }
    })

  } catch (error) {
    console.error('❌ Erro ao buscar cliente:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
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
    const body = await request.json()

    // Verificar se cliente existe
    const clienteExistente = await Cliente.findOne({
      _id: id,
      ativo: true
    }) as any

    if (!clienteExistente) {
      return NextResponse.json(
        { success: false, message: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    // Se estiver alterando CPF, verificar duplicatas
    if (body.cpf && body.cpf !== clienteExistente.cpf) {
      const cpfLimpo = body.cpf.replace(/\D/g, '')
      const clienteComMesmoCPF = await Cliente.findOne({
        cpf: cpfLimpo,
        ativo: true,
        _id: { $ne: id }
      })

      if (clienteComMesmoCPF) {
        return NextResponse.json(
          { success: false, message: 'Já existe um cliente com este CPF' },
          { status: 409 }
        )
      }
    }

    // Atualizar cliente
    const clienteAtualizado = await Cliente.findByIdAndUpdate(
      id,
      {
        ...body,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('advogadoResponsavel', 'nome email').lean() as any

    return NextResponse.json({
      success: true,
      message: 'Cliente atualizado com sucesso',
      data: {
        _id: clienteAtualizado._id,
        nome: clienteAtualizado.nome,
        cpf: clienteAtualizado.cpf,
        email: clienteAtualizado.email,
        telefone: clienteAtualizado.telefone,
        statusProcessual: clienteAtualizado.statusProcessual,
        especialidade: clienteAtualizado.especialidade,
        updatedAt: clienteAtualizado.updatedAt
      }
    })

  } catch (error) {
    console.error('❌ Erro ao atualizar cliente:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
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

    // Verificar se cliente existe
    const clienteExistente = await Cliente.findOne({
      _id: id,
      ativo: true
    })

    if (!clienteExistente) {
      return NextResponse.json(
        { success: false, message: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    // Soft delete - marcar como inativo
    await Cliente.findByIdAndUpdate(id, {
      ativo: false,
      updatedAt: new Date()
    })

    return NextResponse.json({
      success: true,
      message: 'Cliente removido com sucesso'
    })

  } catch (error) {
    console.error('❌ Erro ao deletar cliente:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
} 