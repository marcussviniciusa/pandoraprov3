import { NextRequest, NextResponse } from 'next/server'
import { getTokenUserData } from '@/lib/auth'

interface InstanceActionRequest {
  instanceName: string
  action: 'connect' | 'disconnect' | 'restart' | 'delete'
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

    // Ler dados da requisição
    const body: InstanceActionRequest = await request.json()
    const { instanceName, action } = body

    // Validação básica
    if (!instanceName || !action) {
      return NextResponse.json(
        { success: false, message: 'Nome da instância e ação são obrigatórios' },
        { status: 400 }
      )
    }

    const validActions = ['connect', 'disconnect', 'restart', 'delete']
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { success: false, message: `Ação inválida. Use: ${validActions.join(', ')}` },
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

    console.log(`🔧 Executando ação "${action}" na instância:`, instanceName)

    let evolutionResponse: Response
    let actionMessage: string

    switch (action) {
      case 'connect':
        // Conectar instância (gerar QR Code)
        evolutionResponse = await fetch(`${evolutionApiUrl}/instance/connect/${instanceName}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(evolutionApiKey && { 'apikey': evolutionApiKey })
          }
        })
        actionMessage = 'Instância conectada/QR Code gerado'
        break

      case 'disconnect':
        // Desconectar instância
        evolutionResponse = await fetch(`${evolutionApiUrl}/instance/logout/${instanceName}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...(evolutionApiKey && { 'apikey': evolutionApiKey })
          }
        })
        actionMessage = 'Instância desconectada'
        break

      case 'restart':
        // Reiniciar instância (desconectar + conectar)
        try {
          // Primeiro desconectar
          await fetch(`${evolutionApiUrl}/instance/logout/${instanceName}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              ...(evolutionApiKey && { 'apikey': evolutionApiKey })
            }
          })

          // Aguardar um pouco
          await new Promise(resolve => setTimeout(resolve, 2000))

          // Depois conectar novamente
          evolutionResponse = await fetch(`${evolutionApiUrl}/instance/connect/${instanceName}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(evolutionApiKey && { 'apikey': evolutionApiKey })
            }
          })
          actionMessage = 'Instância reiniciada'
        } catch (restartError) {
          console.error('❌ Erro durante reinicialização:', restartError)
          return NextResponse.json(
            { success: false, message: 'Erro durante reinicialização da instância' },
            { status: 500 }
          )
        }
        break

      case 'delete':
        // Deletar instância - com tratamento especial para instâncias que não existem
        try {
          evolutionResponse = await fetch(`${evolutionApiUrl}/instance/delete/${instanceName}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              ...(evolutionApiKey && { 'apikey': evolutionApiKey })
            }
          })
          actionMessage = 'Instância deletada'
          
          // Se a Evolution API retornar 404, considerar como sucesso (instância já não existe)
          if (evolutionResponse.status === 404) {
            console.log(`⚠️ Instância "${instanceName}" não encontrada no servidor, mas considerando como deletada`)
            
            // Remover do banco de dados também
            try {
              const { connectToDatabase } = await import('@/lib/mongodb')
              const { WhatsAppInstance } = await import('@/models/whatsapp')
              
              await connectToDatabase()
              await WhatsAppInstance.findOneAndUpdate(
                { instanceName, tenantId: userData.userId },
                { isActive: false }
              )
              console.log(`✅ Instância "${instanceName}" removida do banco de dados`)
            } catch (dbError) {
              console.warn('⚠️ Erro ao remover do banco:', dbError)
            }
            
            return NextResponse.json({
              success: true,
              message: 'Instância removida (não existia no servidor)',
              data: {
                instanceName: instanceName,
                action: action,
                wasGhost: true
              }
            })
          }
        } catch (deleteError) {
          console.warn(`⚠️ Erro ao deletar instância "${instanceName}":`, deleteError)
          // Para delete, tentar continuar mesmo com erro (pode ser instância fantasma)
          
          // Remover do banco mesmo com erro na Evolution API
          try {
            const { connectToDatabase } = await import('@/lib/mongodb')
            const { WhatsAppInstance } = await import('@/models/whatsapp')
            
            await connectToDatabase()
            await WhatsAppInstance.findOneAndUpdate(
              { instanceName, tenantId: userData.userId },
              { isActive: false }
            )
            console.log(`✅ Instância "${instanceName}" removida do banco de dados`)
          } catch (dbError) {
            console.warn('⚠️ Erro ao remover do banco:', dbError)
          }
          
          return NextResponse.json({
            success: true,
            message: 'Instância removida (erro na comunicação com servidor)',
            data: {
              instanceName: instanceName,
              action: action,
              hadError: true,
              error: deleteError instanceof Error ? deleteError.message : 'Erro desconhecido'
            }
          })
        }
        break

      default:
        return NextResponse.json(
          { success: false, message: 'Ação não implementada' },
          { status: 400 }
        )
    }

    if (!evolutionResponse.ok) {
      const errorData = await evolutionResponse.json().catch(() => null)
      console.error(`❌ Erro ao executar ação "${action}":`, errorData)
      
      return NextResponse.json(
        { 
          success: false, 
          message: `Erro ao executar ação: ${errorData?.message || 'Erro desconhecido'}` 
        },
        { status: evolutionResponse.status }
      )
    }

    const evolutionData = await evolutionResponse.json()

    console.log(`✅ Ação "${action}" executada com sucesso para:`, instanceName)

    // Se for delete e bem-sucedido, remover do banco também
    if (action === 'delete') {
      try {
        const { connectToDatabase } = await import('@/lib/mongodb')
        const { WhatsAppInstance } = await import('@/models/whatsapp')
        
        await connectToDatabase()
        await WhatsAppInstance.findOneAndUpdate(
          { instanceName, tenantId: userData.userId },
          { isActive: false }
        )
        console.log(`✅ Instância "${instanceName}" removida do banco de dados`)
      } catch (dbError) {
        console.warn('⚠️ Erro ao remover do banco:', dbError)
      }
    }

    // Para ação de connect, retornar QR Code se disponível
    let responseData: any = {
      instanceName: instanceName,
      action: action,
      evolutionData: evolutionData
    }

    if (action === 'connect' && evolutionData.base64) {
      responseData.qrCode = evolutionData.base64
      responseData.status = 'qr_code'
    }

    return NextResponse.json({
      success: true,
      message: actionMessage,
      data: responseData
    })

  } catch (error) {
    console.error('❌ Erro ao executar ação:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
}

// GET para listar instâncias disponíveis
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug: Verificando autenticação para listagem de instâncias')
    
    // Verificar autenticação
    const userData = await getTokenUserData(request)
    if (!userData) {
      console.log('❌ Debug: Usuário não autenticado')
      console.log('🍪 Debug: Cookies disponíveis:', request.cookies.toString())
      return NextResponse.json(
        { success: false, message: 'Não autorizado' },
        { status: 401 }
      )
    }

    console.log('✅ Debug: Usuário autenticado:', userData.userId)
    console.log('📋 Listando instâncias do usuário:', userData.userId)

    // Importar modelo e conectar ao banco
    const { connectToDatabase } = await import('@/lib/mongodb')
    const { WhatsAppInstance } = await import('@/models/whatsapp')
    
    await connectToDatabase()

    // Buscar apenas instâncias do usuário atual no banco de dados
    const userInstances = await WhatsAppInstance.find({ 
      tenantId: userData.userId,
      isActive: true 
    }).sort({ createdAt: -1 })

    console.log(`📋 Instâncias encontradas no banco: ${userInstances.length}`)

    // URL da Evolution API para verificar status real
    const evolutionApiUrl = process.env.EVOLUTION_API_URL
    const evolutionApiKey = process.env.EVOLUTION_API_KEY

    if (!evolutionApiUrl) {
      // Se não tiver Evolution API configurada, retornar apenas dados do banco
      const instances = userInstances.map(instance => ({
        id: instance.instanceName,
        name: instance.instanceName,
        status: instance.status,
        state: instance.status,
        profileName: instance.profileName || null,
        profilePicture: instance.profilePictureUrl || null,
        number: instance.number || null,
        lastSeen: instance.lastSeen || instance.updatedAt,
        messagesCount: 0,
        chatsCount: 0
      }))

      return NextResponse.json({
        success: true,
        data: instances,
        meta: {
          total: instances.length,
          connected: instances.filter(i => i.status === 'connected').length,
          disconnected: instances.filter(i => i.status === 'disconnected').length
        }
      })
    }

    // Se tiver Evolution API, buscar status atualizado de cada instância
    const instances = []

    for (const dbInstance of userInstances) {
      try {
        // Verificar status real na Evolution API
        const checkResponse = await fetch(`${evolutionApiUrl}/instance/connectionState/${dbInstance.instanceName}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(evolutionApiKey && { 'apikey': evolutionApiKey })
          }
        })

        let status = dbInstance.status
        let profileName = dbInstance.profileName
        let profilePicture = dbInstance.profilePictureUrl
        let number = dbInstance.number

        if (checkResponse.ok) {
          const connectionData = await checkResponse.json()
          
          console.log(`🔍 Debug: Resposta da Evolution API para ${dbInstance.instanceName}:`, connectionData)
          
          // Mapear status da Evolution API
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

          const originalStatus = status
          status = mapStatus(connectionData.state)
          
          console.log(`🔄 Mapeamento de status para ${dbInstance.instanceName}: ${connectionData.state} → ${status} (banco: ${originalStatus})`)
          
          // Atualizar dados se disponíveis
          if (connectionData.profileName) profileName = connectionData.profileName
          if (connectionData.profilePictureUrl) profilePicture = connectionData.profilePictureUrl
          if (connectionData.number) number = connectionData.number

          // Atualizar no banco se status mudou
          if (status !== dbInstance.status) {
            console.log(`🔄 Atualizando status no banco: ${dbInstance.instanceName} de "${dbInstance.status}" para "${status}"`)
            await WhatsAppInstance.findByIdAndUpdate(dbInstance._id, {
              status,
              profileName,
              profilePictureUrl: profilePicture,
              number,
              lastSeen: new Date()
            })
            console.log(`✅ Status atualizado no banco para ${dbInstance.instanceName}: ${status}`)
          } else {
            console.log(`ℹ️ Status inalterado para ${dbInstance.instanceName}: ${status}`)
          }
        } else {
          // Se não conseguir verificar na Evolution API, manter dados do banco
          console.warn(`⚠️ Não foi possível verificar status da instância ${dbInstance.instanceName}`)
        }

        instances.push({
          id: dbInstance.instanceName,
          name: dbInstance.instanceName,
          status: status,
          state: status,
          profileName: profileName,
          profilePicture: profilePicture,
          number: number,
          lastSeen: dbInstance.lastSeen || dbInstance.updatedAt,
          messagesCount: 0, // TODO: Implementar contagem real
          chatsCount: 0 // TODO: Implementar contagem real
        })
        
        console.log(`✅ Instância adicionada à lista: ${dbInstance.instanceName} com status: ${status}`)

      } catch (error) {
        console.warn(`⚠️ Erro ao processar instância ${dbInstance.instanceName}:`, error)
      }
    }

    console.log('📋 Instâncias final:', instances)

    return NextResponse.json({
      success: true,
      data: instances,
      meta: {
        total: instances.length,
        connected: instances.filter(i => i.status === 'connected').length,
        disconnected: instances.filter(i => i.status === 'disconnected').length
      }
    })

  } catch (error) {
    console.error('❌ Erro ao listar instâncias:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
}
