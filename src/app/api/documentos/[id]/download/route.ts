import { NextRequest, NextResponse } from 'next/server'
import Documento from '@/models/documento'
import { connectToDatabase } from '@/lib/mongodb'
import { getTokenUserData } from '@/lib/auth'
import { getSignedUrl } from '@/lib/minio'

interface RouteContext {
  params: Promise<{
    id: string
  }>
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

    // Gerar URL assinada para download (válida por 1 hora)
    const signedUrl = await getSignedUrl(documento.objectName, 3600)

    // Log da ação de download (opcional)
    console.log(`📥 Download de documento: ${documento.nome} por ${userData.nome} (${userData.email})`)

    return NextResponse.json({
      success: true,
      data: {
        downloadUrl: signedUrl,
        documento: {
          id: documento._id,
          nome: documento.nome,
          tipo: documento.tipo,
          tamanho: documento.tamanho,
          mimetype: documento.mimetype
        }
      }
    })

  } catch (error) {
    console.error('❌ Erro ao gerar download:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
} 