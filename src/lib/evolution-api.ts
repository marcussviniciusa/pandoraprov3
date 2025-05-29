import {
  EvolutionInstance,
  InstanceConfig,
  WebhookConfig,
  SendMessageOptions,
  SendMessageResponse,
  WhatsAppContact,
  InstanceStatus
} from '@/types/whatsapp'

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL!
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY!

// Debug das variáveis de ambiente
console.log('🔧 Evolution API Config:', {
  url: EVOLUTION_API_URL,
  keyLength: EVOLUTION_API_KEY?.length || 0,
  keyPreview: EVOLUTION_API_KEY ? `${EVOLUTION_API_KEY.substring(0, 8)}...` : 'undefined'
})

// Verificar se as variáveis estão definidas
if (!EVOLUTION_API_URL) {
  throw new Error('EVOLUTION_API_URL não está definida no .env.local')
}

if (!EVOLUTION_API_KEY) {
  throw new Error('EVOLUTION_API_KEY não está definida no .env.local')
}

// Configuração base para requests
const apiConfig = {
  headers: {
    'Content-Type': 'application/json',
    'apikey': EVOLUTION_API_KEY
  }
}

// Função auxiliar para fazer requests
async function evolutionRequest(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', body?: any) {
  const url = `${EVOLUTION_API_URL}${endpoint}`
  
  console.log(`🌐 ${method} ${url}`)
  
  const options: RequestInit = {
    method,
    headers: apiConfig.headers,
  }
  
  if (body) {
    options.body = JSON.stringify(body)
    console.log('📤 Payload:', JSON.stringify(body, null, 2))
  }

  try {
    const response = await fetch(url, options)
    
    console.log(`📥 Response Status: ${response.status}`)
    
    // Verificar se a resposta é JSON
    const contentType = response.headers.get('content-type')
    console.log(`📋 Content-Type: ${contentType}`)
    
    if (!response.ok) {
      let errorText = ''
      try {
        if (contentType?.includes('application/json')) {
          const errorJson = await response.json()
          errorText = JSON.stringify(errorJson)
        } else {
          errorText = await response.text()
        }
      } catch (e) {
        errorText = `Failed to parse error response: ${e}`
      }
      throw new Error(`Evolution API Error: ${response.status} - ${errorText}`)
    }
    
    if (contentType?.includes('application/json')) {
      const result = await response.json()
      console.log('✅ Response JSON:', result)
      return result
    } else {
      const text = await response.text()
      console.log('📄 Response Text:', text)
      throw new Error(`Expected JSON response but got: ${contentType}`)
    }
  } catch (error) {
    console.error('❌ Evolution API Request Failed:', error)
    throw error
  }
}

// ===== CRIAÇÃO DE INSTÂNCIAS E QR CODE =====

export async function createInstance(
  instanceName: string,
  qrcode: boolean = true,
  integration: string = 'WHATSAPP-BAILEYS'
) {
  console.log('🔄 Criando instância:', instanceName)
  console.log('🔧 Config:', { EVOLUTION_API_URL, EVOLUTION_API_KEY: `${EVOLUTION_API_KEY.substring(0, 8)}...` })
  
  const payload = {
    instanceName,
    qrcode,
    integration
  }

  return evolutionRequest('/instance/create', 'POST', payload)
}

export async function fetchQRCode(instanceName: string, maxRetries: number = 20, retryInterval: number = 2000) {
  console.log('🔄 Buscando QR Code para:', instanceName)
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`📊 Tentativa ${attempt}/${maxRetries} - QR Code`)
    
    try {
      // Endpoint correto da Evolution API v2.2.3
      const url = `${EVOLUTION_API_URL}/instance/connect/${instanceName}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': EVOLUTION_API_KEY
        }
      })

      if (response.ok) {
        const result = await response.json()
        console.log(`📥 Resposta da conexão:`, result)
        
        // Verificar se o QR Code foi gerado
        const qrCodeBase64 = result.base64 || 
                            result.qrcode?.base64 || 
                            result.data?.base64 ||
                            result.qr?.base64 ||
                            result.code
        
        if (qrCodeBase64 && qrCodeBase64.length > 100) {
          console.log('✅ QR Code obtido com sucesso! Tamanho:', qrCodeBase64.length)
          return {
            ...result,
            connectionMethod: 'qr_code',
            base64: qrCodeBase64,
            success: true,
            message: 'QR Code gerado com sucesso!'
          }
        }
        
        // Se não tem QR Code ainda, verificar status
        if (result.count !== undefined) {
          console.log(`⏳ QR Code ainda não gerado (count: ${result.count})`)
        }
      } else {
        const errorText = await response.text()
        console.log(`❌ Erro ${response.status}:`, errorText)
      }
      
      // Aguardar antes da próxima tentativa
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryInterval))
      }
      
    } catch (error) {
      console.error(`❌ Erro na tentativa ${attempt}:`, error)
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryInterval))
        continue
      } else {
        throw error
      }
    }
  }
  
  throw new Error('QR Code não foi gerado após múltiplas tentativas')
}

export async function getInstanceInfo(instanceName: string) {
  try {
    return await evolutionRequest(`/instance/fetchInstances`)
  } catch (error) {
    console.error('❌ Erro ao buscar informações da instância:', error)
    throw error
  }
}

export async function checkInstanceConnection(instanceName: string) {
  try {
    const response = await evolutionRequest(`/instance/connectionState/${instanceName}`)
    return {
      success: true,
      connected: response.instance?.state === 'open',
      status: response.instance?.state || 'unknown',
      data: response
    }
  } catch (error) {
    console.error('❌ Erro ao verificar conexão:', error)
    return {
      success: false,
      connected: false,
      status: 'error',
      error: String(error)
    }
  }
}

// ===== GESTÃO DE INSTÂNCIAS =====

export async function deleteInstance(instanceName: string) {
  const url = `${EVOLUTION_API_URL}/instance/delete/${instanceName}`
  
  console.log('🔄 Deletando instância:', instanceName)
  
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'apikey': EVOLUTION_API_KEY
    }
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Erro ao deletar instância: ${error.message || response.statusText}`)
  }

  const result = await response.json()
  console.log('✅ Instância deletada')
  return result
}

export async function restartInstance(instanceName: string) {
  const url = `${EVOLUTION_API_URL}/instance/restart/${instanceName}`
  
  console.log('🔄 Reiniciando instância:', instanceName)
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'apikey': EVOLUTION_API_KEY
    }
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Erro ao reiniciar instância: ${error.message || response.statusText}`)
  }

  const result = await response.json()
  console.log('✅ Instância reiniciada')
  return result
}

export async function logoutInstance(instanceName: string) {
  const url = `${EVOLUTION_API_URL}/instance/logout/${instanceName}`
  
  console.log('🔄 Fazendo logout da instância:', instanceName)
  
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'apikey': EVOLUTION_API_KEY
    }
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Erro ao fazer logout: ${error.message || response.statusText}`)
  }

  const result = await response.json()
  console.log('✅ Logout realizado')
  return result
}

// ===== ENVIO DE MENSAGENS =====

export async function sendTextMessage(instanceName: string, number: string, text: string): Promise<SendMessageResponse> {
  try {
    // Formato simplificado para Evolution API v2.2.3
    const payload = {
      number: number.replace(/\D/g, ''), // Remove caracteres não numéricos
      text: text
    }
    
    console.log(`📤 Enviando mensagem para ${number} via ${instanceName}`)
    console.log('📄 Texto:', text)
    
    return await evolutionRequest(`/message/sendText/${instanceName}`, 'POST', payload)
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem de texto:', error)
    throw error
  }
}

export async function sendMediaMessage(instanceName: string, options: SendMessageOptions): Promise<SendMessageResponse> {
  try {
    const payload = {
      number: options.number.replace(/\D/g, ''),
      options: {
        delay: 1200,
        presence: 'composing'
      },
      mediaMessage: {
        mediatype: options.media!.mediatype,
        media: options.media!.media,
        fileName: options.media!.fileName,
        caption: options.media!.caption
      }
    }

    return await evolutionRequest(`/message/sendMedia/${instanceName}`, 'POST', payload)
  } catch (error) {
    console.error('❌ Erro ao enviar mídia:', error)
    throw error
  }
}

// ===== WEBHOOKS =====

export async function setWebhook(instanceName: string, webhookUrl: string) {
  const url = `${EVOLUTION_API_URL}/webhook/set/${instanceName}`
  
  console.log('🔄 Configurando webhook para:', instanceName)
  
  const payload = {
    url: webhookUrl,
    webhook_by_events: false,
    webhook_base64: false,
    events: [
      'QRCODE_UPDATED',
      'MESSAGES_UPSERT',
      'MESSAGES_UPDATE',
      'MESSAGES_DELETE',
      'SEND_MESSAGE',
      'CONNECTION_UPDATE'
    ]
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': EVOLUTION_API_KEY
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Erro ao configurar webhook: ${error.message || response.statusText}`)
  }

  const result = await response.json()
  console.log('✅ Webhook configurado')
  return result
}

// ===== UTILITÁRIOS =====

export function formatPhoneNumber(phone: string): string {
  // Remove caracteres não numéricos
  const cleaned = phone.replace(/\D/g, '')
  
  // Adiciona código do país (55) se não existir
  if (cleaned.length === 11 && cleaned.startsWith('11')) {
    return `55${cleaned}`
  } else if (cleaned.length === 10) {
    return `5511${cleaned}`
  } else if (cleaned.length === 13 && cleaned.startsWith('55')) {
    return cleaned
  }
  
  return cleaned
}

export function formatWhatsAppJid(phone: string): string {
  const formatted = formatPhoneNumber(phone)
  return `${formatted}@s.whatsapp.net`
}

// ===== TEMPLATES DE MENSAGEM =====

export const messageTemplates = {
  welcome: (nome: string) => `👋 Olá *${nome}*! Bem-vindo(a) ao atendimento do escritório.\n\nEm que posso ajudá-lo(a) hoje?`,
  
  documentRequest: (nome: string, documentos: string[]) => 
    `📄 Olá *${nome}*!\n\nPara dar continuidade ao seu processo, precisamos dos seguintes documentos:\n\n${documentos.map(doc => `• ${doc}`).join('\n')}\n\nPor favor, envie as fotos ou PDFs aqui mesmo no WhatsApp.`,
  
  documentReceived: (nomeDocumento: string) => 
    `✅ Documento *${nomeDocumento}* recebido com sucesso!\n\nNosso time fará a análise e retornaremos em breve.`,
  
  statusUpdate: (nome: string, status: string) => 
    `📋 Olá *${nome}*!\n\nSeu processo teve uma atualização de status:\n\n*${status}*\n\nEm caso de dúvidas, estamos à disposição.`,
  
  appointment: (nome: string, data: string, hora: string) => 
    `📅 *Agendamento Confirmado*\n\nOlá *${nome}*!\n\nSua consulta foi agendada para:\n📅 Data: *${data}*\n🕒 Hora: *${hora}*\n\nAguardamos você!`,
  
  menu: () => 
    `📋 *Menu de Atendimento*\n\n1️⃣ Status do meu processo\n2️⃣ Enviar documentos\n3️⃣ Agendar consulta\n4️⃣ Falar com advogado\n\nDigite o número da opção desejada.`,
  
  businessHours: () => 
    `🕒 Nosso horário de atendimento é de segunda à sexta, das 8h às 18h.\n\nSua mensagem é importante para nós! Retornaremos assim que possível.`,
    
  goodbye: (nome: string) => 
    `👋 Obrigado pelo contato, *${nome}*!\n\nEstamos sempre à disposição. Tenha um ótimo dia!`
}

// ===== VERIFICAÇÃO DE STATUS =====

export async function checkEvolutionApiStatus(): Promise<boolean> {
  try {
    const response = await fetch(EVOLUTION_API_URL, {
      headers: {
        'apikey': EVOLUTION_API_KEY
      }
    })
    return response.ok
  } catch (error) {
    console.error('❌ Evolution API não está acessível:', error)
    return false
  }
}