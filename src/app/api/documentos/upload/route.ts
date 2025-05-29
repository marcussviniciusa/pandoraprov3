import { NextRequest, NextResponse } from 'next/server'
import { uploadFile } from '@/lib/minio'
import Documento from '@/models/documento'
import { connectToDatabase } from '@/lib/mongodb'
import { getTokenUserData } from '@/lib/auth'
import { TipoDocumento, obterCategoriaPorTipo } from '@/types/documento'

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

    // Obter dados do form
    const formData = await request.formData()
    const file = formData.get('file') as File
    const clienteId = formData.get('clienteId') as string
    const tipoDocumento = formData.get('tipoDocumento') as TipoDocumento
    const observacoes = formData.get('observacoes') as string
    const prioridade = formData.get('prioridade') as 'baixa' | 'media' | 'alta' | 'urgente' || 'media'

    if (!file || !clienteId || !tipoDocumento) {
      return NextResponse.json(
        { success: false, message: 'Arquivo, clienteId e tipoDocumento são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar tamanho do arquivo (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'Arquivo muito grande. Máximo 5MB permitido.' },
        { status: 400 }
      )
    }

    // Validar tipo de arquivo
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Tipo de arquivo não suportado' },
        { status: 400 }
      )
    }

    // Converter arquivo para buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload para MinIO
    const uploadResult = await uploadFile({
      buffer,
      originalName: file.name,
      mimeType: file.type,
      clienteId,
      tipoDocumento
    })

    // Obter metadados da requisição
    const userAgent = request.headers.get('user-agent') || undefined
    const xForwardedFor = request.headers.get('x-forwarded-for')
    const ipAddress = xForwardedFor ? xForwardedFor.split(',')[0] : 
                     request.headers.get('x-real-ip') || undefined

    // Salvar no MongoDB
    const documento = new Documento({
      nome: file.name,
      tipo: tipoDocumento,
      categoria: obterCategoriaPorTipo(tipoDocumento),
      tamanho: file.size,
      mimetype: file.type,
      url: uploadResult.url,
      objectName: uploadResult.objectName,
      status: 'recebido',
      clienteId,
      tenantId: userData.tenantId,
      uploadedBy: userData.userId,
      observacoes,
      tags: [],
      prioridade,
      versao: 1,
      etag: uploadResult.etag,
      metadados: {
        originalName: file.name,
        uploadSource: 'web',
        ipAddress,
        userAgent
      }
    })

    const savedDoc = await documento.save()

    return NextResponse.json({
      success: true,
      message: 'Documento enviado com sucesso',
      documento: {
        id: savedDoc._id,
        nome: savedDoc.nome,
        tipo: savedDoc.tipo,
        categoria: savedDoc.categoria,
        tamanho: savedDoc.tamanho,
        status: savedDoc.status,
        dataUpload: savedDoc.dataUpload,
        url: savedDoc.url,
        prioridade: savedDoc.prioridade
      }
    })

  } catch (error) {
    console.error('❌ Erro no upload de documento:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
}

// Configuração do Next.js para uploads
export const config = {
  api: {
    bodyParser: false,
  },
} 