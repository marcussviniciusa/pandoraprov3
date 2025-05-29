import { NextRequest, NextResponse } from 'next/server'
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

    // Obter instanceName da query string
    const { searchParams } = new URL(request.url)
    const instanceName = searchParams.get('instanceName')

    if (!instanceName) {
      return NextResponse.json(
        { success: false, message: 'Nome da instância é obrigatório' },
        { status: 400 }
      )
    }

    // URL da Evolution API
    const evolutionApiUrl = process.env.EVOLUTION_API_URL
    const evolutionApiKey = process.env.EVOLUTION_API_KEY

    if (!evolutionApiUrl) {
      return NextResponse.json(
        { success: false, message: 'Evolution API não configurada' },
        { status: 500 }
      )
    }

    console.log('📊 Verificando status da instância:', instanceName)

    // Fazer requisição para verificar status na Evolution API
    const evolutionResponse = await fetch(`${evolutionApiUrl}/instance/connectionState/${instanceName}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(evolutionApiKey && { 'apikey': evolutionApiKey })
      }
    })

    if (!evolutionResponse.ok) {
      const errorData = await evolutionResponse.json().catch(() => null)
      console.error('❌ Erro ao verificar status:', errorData)
      
      return NextResponse.json(
        { 
          success: false, 
          message: `Erro ao verificar status: ${errorData?.message || 'Instância não encontrada'}` 
        },
        { status: evolutionResponse.status }
      )
    }

    const evolutionData = await evolutionResponse.json()

    // Mapear estados da Evolution API para nossos estados
    const mapStatus = (state: string) => {
      switch (state?.toLowerCase()) {
        case 'open':
          return 'connected'
        case 'connecting':
          return 'connecting'
        case 'close':
        case 'closed':
          return 'disconnected'
        case 'qr_code':
          return 'qr_code'
        default:
          return 'disconnected'
      }
    }

    const status = mapStatus(evolutionData.instance?.state)
    
    console.log('📊 Status obtido:', instanceName, '→', status)

    // Buscar informações adicionais se conectado
    let profileInfo = null
    if (status === 'connected') {
      try {
        const profileResponse = await fetch(`${evolutionApiUrl}/instance/fetchInstance/${instanceName}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(evolutionApiKey && { 'apikey': evolutionApiKey })
          }
        })

        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          profileInfo = {
            profileName: profileData.instance?.profileName || null,
            profilePicture: profileData.instance?.profilePictureUrl || null,
            number: profileData.instance?.wuid?.user || null
          }
          console.log('👤 Informações do perfil obtidas para:', instanceName)
        }
      } catch (profileError) {
        console.warn('⚠️ Erro ao buscar perfil:', profileError)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        instanceName: instanceName,
        status: status,
        state: evolutionData.instance?.state || 'unknown',
        lastSeen: new Date(),
        profile: profileInfo,
        evolutionData: evolutionData
      }
    })

  } catch (error) {
    console.error('❌ Erro ao verificar status:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
}

// GET para múltiplas instâncias
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

    // Ler lista de instâncias
    const body = await request.json()
    const { instanceNames } = body

    if (!instanceNames || !Array.isArray(instanceNames)) {
      return NextResponse.json(
        { success: false, message: 'Lista de instâncias é obrigatória' },
        { status: 400 }
      )
    }

    // URL da Evolution API
    const evolutionApiUrl = process.env.EVOLUTION_API_URL
    const evolutionApiKey = process.env.EVOLUTION_API_KEY

    if (!evolutionApiUrl) {
      return NextResponse.json(
        { success: false, message: 'Evolution API não configurada' },
        { status: 500 }
      )
    }

    console.log('📊 Verificando status de múltiplas instâncias:', instanceNames.length)

    // Verificar status de cada instância em paralelo
    const statusPromises = instanceNames.map(async (instanceName: string) => {
      try {
        const evolutionResponse = await fetch(`${evolutionApiUrl}/instance/connectionState/${instanceName}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(evolutionApiKey && { 'apikey': evolutionApiKey })
          }
        })

        if (!evolutionResponse.ok) {
          return {
            instanceName,
            status: 'error',
            error: 'Não foi possível verificar status'
          }
        }

        const evolutionData = await evolutionResponse.json()
        
        const mapStatus = (state: string) => {
          switch (state?.toLowerCase()) {
            case 'open': return 'connected'
            case 'connecting': return 'connecting'
            case 'close':
            case 'closed': return 'disconnected'
            case 'qr_code': return 'qr_code'
            default: return 'disconnected'
          }
        }

        return {
          instanceName,
          status: mapStatus(evolutionData.instance?.state),
          state: evolutionData.instance?.state || 'unknown',
          lastSeen: new Date()
        }

      } catch (error) {
        return {
          instanceName,
          status: 'error',
          error: 'Erro de conexão'
        }
      }
    })

    const results = await Promise.all(statusPromises)

    console.log('📊 Status verificado para', results.length, 'instâncias')

    return NextResponse.json({
      success: true,
      data: results
    })

  } catch (error) {
    console.error('❌ Erro ao verificar status múltiplo:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
} 