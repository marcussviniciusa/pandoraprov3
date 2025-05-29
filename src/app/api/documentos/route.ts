import { NextRequest, NextResponse } from 'next/server'
import Documento from '@/models/documento'
import { connectToDatabase } from '@/lib/mongodb'
import { getTokenUserData } from '@/lib/auth'
import { StatusDocumento, CategoriaDocumento } from '@/types/documento'

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
    const status = searchParams.get('status') as StatusDocumento | ''
    const categoria = searchParams.get('categoria') as CategoriaDocumento | ''
    const clienteId = searchParams.get('clienteId') || ''
    const sortBy = searchParams.get('sortBy') || 'dataUpload'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Construir filtros
    const filters: any = {
      tenantId: userData.tenantId
    }

    if (search) {
      filters.$or = [
        { nome: { $regex: search, $options: 'i' } },
        { observacoes: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ]
    }

    if (status) {
      filters.status = status
    }

    if (categoria) {
      filters.categoria = categoria
    }

    if (clienteId) {
      filters.clienteId = clienteId
    }

    // Construir ordenação
    const sort: any = {}
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1

    // Calcular skip para paginação
    const skip = (page - 1) * limit

    // Buscar documentos com paginação
    const [documentos, total] = await Promise.all([
      Documento.find(filters)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Documento.countDocuments(filters)
    ])

    // Calcular estatísticas
    const estatisticas = await Documento.getEstatisticas(userData.tenantId)

    return NextResponse.json({
      success: true,
      data: {
        documentos: documentos.map(doc => ({
          id: doc._id,
          nome: doc.nome,
          tipo: doc.tipo,
          categoria: doc.categoria,
          tamanho: doc.tamanho,
          status: doc.status,
          clienteId: doc.clienteId,
          dataUpload: doc.dataUpload,
          dataAtualizacao: doc.dataAtualizacao,
          observacoes: doc.observacoes,
          tags: doc.tags,
          prioridade: doc.prioridade,
          prazoValidade: doc.prazoValidade,
          url: doc.url
        })),
        estatisticas,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('❌ Erro ao buscar documentos:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
} 