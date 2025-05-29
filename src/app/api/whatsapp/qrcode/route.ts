import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { instanceName, action } = await request.json()
    
    if (!instanceName) {
      return NextResponse.json({
        success: false,
        message: 'Nome da instância é obrigatório'
      }, { status: 400 })
    }
    
    // Import dinâmico
    const { 
      createInstance, 
      fetchQRCode, 
      deleteInstance, 
      checkInstanceConnection,
      getInstanceInfo 
    } = await import('@/lib/evolution-api')
    
    switch (action) {
      case 'create':
        console.log('🆕 Criando nova instância:', instanceName)
        
        try {
          const createResult = await createInstance(instanceName, true)
          
          // Aguardar um pouco antes de buscar QR Code
          await new Promise(resolve => setTimeout(resolve, 3000))
          
          return NextResponse.json({
            success: true,
            message: `Instância '${instanceName}' criada com sucesso`,
            data: {
              instanceName: instanceName,
              created: true,
              createResult: createResult,
              nextStep: 'Aguarde alguns segundos e busque o QR Code'
            },
            recommendation: 'Aguarde alguns segundos e depois busque o QR Code'
          })
          
        } catch (error) {
          return NextResponse.json({
            success: false,
            message: `Erro ao criar instância: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
            error: String(error)
          }, { status: 500 })
        }
      
      case 'qrcode':
        console.log('📱 Buscando QR Code para:', instanceName)
        
        try {
          const qrResult = await fetchQRCode(instanceName, 15, 3000)
          
          if (qrResult.success && qrResult.base64) {
            return NextResponse.json({
              success: true,
              message: 'QR Code gerado com sucesso!',
              data: {
                instanceName: instanceName,
                qrCode: qrResult.base64,
                method: 'qr_code',
                instructions: [
                  '1. Abra o WhatsApp no seu celular',
                  '2. Toque nos três pontos (⋮) no canto superior direito',
                  '3. Selecione "Aparelhos conectados"',
                  '4. Toque em "Conectar um aparelho"',
                  '5. Escaneie este QR Code com a câmera do celular',
                  '6. Aguarde a confirmação da conexão'
                ],
                expiresIn: '60 segundos',
                fullData: qrResult
              },
              recommendation: 'Escaneie o QR Code com seu WhatsApp para conectar'
            })
          } else {
            return NextResponse.json({
              success: false,
              message: 'QR Code ainda não está disponível',
              data: qrResult,
              recommendation: 'Aguarde alguns segundos e tente novamente'
            })
          }
          
        } catch (error) {
          return NextResponse.json({
            success: false,
            message: `Erro ao buscar QR Code: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
            error: String(error),
            recommendation: 'Verifique se a instância foi criada corretamente'
          }, { status: 500 })
        }
      
      case 'check':
        console.log('🔍 Verificando conexão da instância:', instanceName)
        
        try {
          const connectionStatus = await checkInstanceConnection(instanceName)
          
          return NextResponse.json({
            success: connectionStatus.success,
            message: connectionStatus.connected 
              ? 'Instância conectada com sucesso!' 
              : 'Instância ainda não está conectada',
            data: {
              instanceName: instanceName,
              connected: connectionStatus.connected,
              status: connectionStatus.status,
              isReady: connectionStatus.connected,
              connectionData: connectionStatus.data
            },
            recommendation: connectionStatus.connected 
              ? 'Instância pronta para envio de mensagens'
              : 'Escaneie o QR Code para conectar a instância'
          })
          
        } catch (error) {
          return NextResponse.json({
            success: false,
            message: `Erro ao verificar conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
            error: String(error)
          }, { status: 500 })
        }
      
      case 'delete':
        console.log('🗑️ Deletando instância:', instanceName)
        
        try {
          const deleteResult = await deleteInstance(instanceName)
          
          return NextResponse.json({
            success: true,
            message: `Instância '${instanceName}' deletada com sucesso`,
            data: {
              instanceName: instanceName,
              deleted: true,
              deleteResult: deleteResult
            },
            recommendation: 'Instância removida do servidor'
          })
          
        } catch (error) {
          return NextResponse.json({
            success: false,
            message: `Erro ao deletar instância: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
            error: String(error)
          }, { status: 500 })
        }
      
      case 'info':
        console.log('ℹ️ Buscando informações das instâncias')
        
        try {
          const instancesInfo = await getInstanceInfo(instanceName)
          
          return NextResponse.json({
            success: true,
            message: 'Informações obtidas com sucesso',
            data: {
              instances: instancesInfo,
              total: instancesInfo?.length || 0
            }
          })
          
        } catch (error) {
          return NextResponse.json({
            success: false,
            message: `Erro ao buscar informações: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
            error: String(error)
          }, { status: 500 })
        }
      
      default:
        return NextResponse.json({
          success: false,
          message: 'Ação inválida. Use: create, qrcode, check, delete ou info'
        }, { status: 400 })
    }
    
  } catch (error) {
    console.error('❌ Erro na API de QR Code:', error)
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      error: String(error)
    }, { status: 500 })
  }
} 