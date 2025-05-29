import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { instanceName } = await request.json()
    
    const evolutionUrl = process.env.EVOLUTION_API_URL
    const evolutionKey = process.env.EVOLUTION_API_KEY
    
    console.log('🔧 Creating instance with:')
    console.log('URL:', evolutionUrl)
    console.log('Key:', evolutionKey ? `${evolutionKey.substring(0, 8)}...` : 'undefined')
    console.log('Instance Name:', instanceName)
    
    if (!evolutionUrl || !evolutionKey) {
      return NextResponse.json({
        success: false,
        message: 'Variáveis de ambiente não encontradas'
      }, { status: 500 })
    }
    
    const payload = {
      instanceName: instanceName || 'test-pandora',
      qrcode: true,
      integration: 'WHATSAPP-BAILEYS'
    }
    
    console.log('📤 Payload:', JSON.stringify(payload, null, 2))
    
    const url = `${evolutionUrl}/instance/create`
    console.log('🌐 Request URL:', url)
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionKey
      },
      body: JSON.stringify(payload)
    })
    
    console.log('📥 Response Status:', response.status)
    console.log('📋 Content-Type:', response.headers.get('content-type'))
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Evolution API Error:', errorText)
      return NextResponse.json({
        success: false,
        message: `Evolution API Error: ${response.status}`,
        details: errorText
      }, { status: response.status })
    }
    
    const result = await response.json()
    console.log('✅ Instance created:', result)
    
    return NextResponse.json({
      success: true,
      message: 'Instância criada com sucesso!',
      data: result
    })
    
  } catch (error) {
    console.error('❌ Erro ao criar instância:', error)
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      error: String(error)
    }, { status: 500 })
  }
} 