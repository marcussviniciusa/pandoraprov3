import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const evolutionUrl = process.env.EVOLUTION_API_URL
    const evolutionKey = process.env.EVOLUTION_API_KEY
    
    console.log('🔧 Testing Evolution API Variables:')
    console.log('URL:', evolutionUrl)
    console.log('Key length:', evolutionKey?.length || 0)
    console.log('Key preview:', evolutionKey ? `${evolutionKey.substring(0, 8)}...` : 'undefined')
    
    if (!evolutionUrl || !evolutionKey) {
      return NextResponse.json({
        success: false,
        message: 'Variáveis de ambiente não encontradas',
        variables: {
          EVOLUTION_API_URL: !!evolutionUrl,
          EVOLUTION_API_KEY: !!evolutionKey
        }
      })
    }
    
    // Testar conexão com Evolution API
    const response = await fetch(evolutionUrl, {
      headers: {
        'apikey': evolutionKey
      }
    })
    
    if (!response.ok) {
      return NextResponse.json({
        success: false,
        message: `Evolution API retornou erro: ${response.status}`,
        status: response.status
      })
    }
    
    const result = await response.json()
    
    return NextResponse.json({
      success: true,
      message: 'Evolution API está funcionando!',
      evolutionApi: result,
      variables: {
        EVOLUTION_API_URL: evolutionUrl,
        EVOLUTION_API_KEY: `${evolutionKey.substring(0, 8)}...`
      }
    })
    
  } catch (error) {
    console.error('❌ Erro ao testar Evolution API:', error)
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      error: error
    }, { status: 500 })
  }
} 