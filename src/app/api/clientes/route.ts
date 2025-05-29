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

    // Obter parâmetros de query
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const especialidade = searchParams.get('especialidade') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Construir filtros
    const filters: any = {
      ativo: true
    }

    if (search) {
      filters.$or = [
        { nome: { $regex: search, $options: 'i' } },
        { cpf: { $regex: search.replace(/\D/g, ''), $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }

    if (status) {
      filters.statusProcessual = status
    }

    if (especialidade) {
      filters.especialidade = especialidade
    }

    // Construir ordenação
    const sort: any = {}
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1

    // Calcular skip para paginação
    const skip = (page - 1) * limit

    // Buscar clientes com paginação
    const [clientes, total] = await Promise.all([
      Cliente.find(filters)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('advogadoResponsavel', 'nome email')
        .lean(),
      Cliente.countDocuments(filters)
    ])

    // Calcular estatísticas básicas
    const totalClientes = await Cliente.countDocuments({ ativo: true })

    return NextResponse.json({
      success: true,
      data: clientes.map(cliente => ({
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
        whatsappNumero: cliente.whatsappNumero,
        ativo: cliente.ativo,
        createdAt: cliente.createdAt,
        updatedAt: cliente.updatedAt
      })),
      meta: {
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        stats: {
          total: totalClientes
        }
      }
    })

  } catch (error) {
    console.error('❌ Erro ao buscar clientes:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    // Obter dados do corpo da requisição
    const body = await request.json()

    // Validar campos obrigatórios
    if (!body.nome || !body.cpf || !body.telefone) {
      return NextResponse.json(
        { success: false, message: 'Nome, CPF e telefone são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se já existe cliente com mesmo CPF
    const clienteExistente = await Cliente.findOne({
      cpf: body.cpf.replace(/\D/g, ''),
      ativo: true
    })

    if (clienteExistente) {
      return NextResponse.json(
        { success: false, message: 'Já existe um cliente com este CPF' },
        { status: 409 }
      )
    }

    // Criar novo cliente
    const novoCliente = new Cliente({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    await novoCliente.save()

    return NextResponse.json({
      success: true,
      message: 'Cliente criado com sucesso',
      data: {
        _id: novoCliente._id,
        nome: novoCliente.nome,
        cpf: novoCliente.cpf,
        email: novoCliente.email,
        telefone: novoCliente.telefone,
        statusProcessual: novoCliente.statusProcessual,
        especialidade: novoCliente.especialidade
      }
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Erro ao criar cliente:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
} 