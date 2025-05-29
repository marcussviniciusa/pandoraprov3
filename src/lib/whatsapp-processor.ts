import { sendTextMessage, messageTemplates } from './evolution-api'
import { BotConfig, MessageTemplate } from '@/models/whatsapp'
import { IChatWhatsApp, IMessageWhatsApp } from '@/models/whatsapp'
import { Cliente } from '@/models'
import { connectToDatabase } from './mongodb'

// Processar mensagem recebida
export async function processIncomingMessage(
  instanceName: string, 
  chat: IChatWhatsApp, 
  message: IMessageWhatsApp, 
  tenantId: string
) {
  try {
    await connectToDatabase()

    // Verificar se há configuração de bot ativa
    const botConfig = await BotConfig.findOne({
      instanceId: instanceName,
      isActive: true
    })

    if (!botConfig) {
      console.log('🤖 Nenhum bot configurado para esta instância')
      return
    }

    // Verificar horário comercial
    if (botConfig.businessHours?.enabled && !isBusinessHours(botConfig.businessHours)) {
      await sendTextMessage(instanceName, extractPhoneFromJid(chat.contactJid), botConfig.businessHours.offlineMessage)
      return
    }

    const messageContent = message.content.toLowerCase().trim()
    const contactPhone = extractPhoneFromJid(chat.contactJid)

    // Buscar cliente por telefone
    const cliente = await Cliente.findOne({
      $or: [
        { celular: contactPhone },
        { celular: formatPhoneForMatch(contactPhone) },
        { telefone: contactPhone },
        { telefone: formatPhoneForMatch(contactPhone) }
      ],
      tenantId: tenantId
    })

    // Processar comandos específicos
    if (messageContent === 'menu' || messageContent === '/menu') {
      await sendMenuMessage(instanceName, contactPhone)
      return
    }

    if (messageContent === 'oi' || messageContent === 'olá' || messageContent === 'ola') {
      const nome = cliente?.nome || chat.contactName
      await sendTextMessage(instanceName, contactPhone, messageTemplates.welcome(nome))
      return
    }

    // Processar opções do menu
    if (/^[1-4]$/.test(messageContent)) {
      await processMenuOption(instanceName, contactPhone, messageContent, cliente, tenantId)
      return
    }

    // Processar documentos recebidos
    if (message.messageType === 'documentMessage' || message.messageType === 'imageMessage') {
      await processDocumentReceived(instanceName, message, cliente, tenantId)
      return
    }

    // Verificar palavras-chave do bot
    const menuOption = findMenuOption(botConfig.menuOptions, messageContent)
    if (menuOption) {
      await sendTextMessage(instanceName, contactPhone, menuOption.response)
      return
    }

    // Resposta padrão se não entendeu
    await sendTextMessage(instanceName, contactPhone, botConfig.fallbackMessage)

  } catch (error) {
    console.error('❌ Erro ao processar mensagem:', error)
  }
}

// Enviar menu principal
async function sendMenuMessage(instanceName: string, contactPhone: string) {
  const menuText = messageTemplates.menu()
  await sendTextMessage(instanceName, contactPhone, menuText)
}

// Processar opção do menu
async function processMenuOption(
  instanceName: string, 
  contactPhone: string, 
  option: string, 
  cliente: any, 
  tenantId: string
) {
  switch (option) {
    case '1': // Status do processo
      if (cliente) {
        const statusText = `📋 *Status do seu processo:*\n\n` +
          `👤 Cliente: ${cliente.nome}\n` +
          `📊 Status: ${getStatusLabel(cliente.status)}\n` +
          `⚖️ Especialidade: ${cliente.especialidade}\n` +
          `💰 Valor: ${formatCurrency(cliente.valorBeneficio)}\n\n` +
          `Em caso de dúvidas, estamos à disposição!`
        
        await sendTextMessage(instanceName, contactPhone, statusText)
      } else {
        await sendTextMessage(instanceName, contactPhone, 
          '❌ Não encontrei seu processo em nosso sistema. Entre em contato conosco para mais informações.')
      }
      break

    case '2': // Enviar documentos
      if (cliente) {
        const documentos = getDocumentosPendentes(cliente)
        if (documentos.length > 0) {
          const docText = messageTemplates.documentRequest(cliente.nome, documentos)
          await sendTextMessage(instanceName, contactPhone, docText)
        } else {
          await sendTextMessage(instanceName, contactPhone, 
            '✅ Todos os documentos necessários já foram recebidos!')
        }
      } else {
        await sendTextMessage(instanceName, contactPhone, 
          'Para enviar documentos, primeiro precisamos localizar seu processo. Entre em contato conosco.')
      }
      break

    case '3': // Agendar consulta
      await sendTextMessage(instanceName, contactPhone, 
        '📅 Para agendar uma consulta, entre em contato conosco pelos telefones:\n\n' +
        '📞 (11) 1234-5678\n' +
        '📱 (11) 98765-4321\n\n' +
        'Ou aguarde que um de nossos atendentes entrará em contato!')
      break

    case '4': // Falar com advogado
      await sendTextMessage(instanceName, contactPhone, 
        '👨‍⚖️ Solicitação de contato com advogado registrada!\n\n' +
        'Um de nossos profissionais entrará em contato em breve. ' +
        'Horário de atendimento: Segunda à Sexta, 8h às 18h.')
      break

    default:
      await sendTextMessage(instanceName, contactPhone, 
        'Opção inválida. Digite *menu* para ver as opções disponíveis.')
  }
}

// Processar documento recebido
async function processDocumentReceived(
  instanceName: string, 
  message: IMessageWhatsApp, 
  cliente: any, 
  tenantId: string
) {
  const contactPhone = extractPhoneFromJid(message.remoteJid)
  
  if (cliente) {
    const fileName = message.fileName || 'documento'
    await sendTextMessage(instanceName, contactPhone, messageTemplates.documentReceived(fileName))
    
    // TODO: Integrar com sistema de documentos para salvar automaticamente
    // await saveDocumentFromWhatsApp(message, cliente._id, tenantId)
  } else {
    await sendTextMessage(instanceName, contactPhone, 
      '📄 Documento recebido! Porém, não conseguimos localizar seu processo em nosso sistema. ' +
      'Entre em contato conosco para que possamos associar o documento corretamente.')
  }
}

// Verificar horário comercial
function isBusinessHours(businessHours: any): boolean {
  const now = new Date()
  const currentTime = now.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: businessHours.timezone 
  })
  
  const currentDay = now.getDay() // 0 = Domingo, 1 = Segunda, etc.
  
  // Verificar se é dia útil (Segunda a Sexta)
  if (currentDay < 1 || currentDay > 5) {
    return false
  }
  
  return currentTime >= businessHours.start && currentTime <= businessHours.end
}

// Buscar opção do menu por palavra-chave
function findMenuOption(menuOptions: any[], keyword: string): any | null {
  for (const option of menuOptions) {
    if (option.keyword.toLowerCase() === keyword || 
        option.title.toLowerCase().includes(keyword)) {
      return option
    }
    
    // Verificar sub-opções
    if (option.subOptions?.length > 0) {
      const subOption = findMenuOption(option.subOptions, keyword)
      if (subOption) return subOption
    }
  }
  
  return null
}

// Funções utilitárias

function extractPhoneFromJid(jid: string): string {
  return jid.replace('@s.whatsapp.net', '').replace('@g.us', '')
}

function formatPhoneForMatch(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  
  // Tentar diferentes formatos
  if (cleaned.length === 13) return cleaned.substring(2) // Remove 55
  if (cleaned.length === 11) return `55${cleaned}` // Adiciona 55
  if (cleaned.length === 10) return `5511${cleaned}` // Adiciona 5511
  
  return cleaned
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'consulta_inicial': 'Consulta Inicial',
    'documentacao_pendente': 'Documentação Pendente',
    'analise_caso': 'Análise do Caso',
    'protocolo_inss': 'Protocolo INSS',
    'aguardando_resposta': 'Aguardando Resposta',
    'recurso_contestacao': 'Recurso/Contestação',
    'deferido': 'Deferido ✅',
    'indeferido': 'Indeferido ❌'
  }
  
  return labels[status] || status
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

function getDocumentosPendentes(cliente: any): string[] {
  // Esta função seria integrada com o sistema de documentos
  // Por enquanto, retorna uma lista exemplo baseada na especialidade
  const documentosComuns = ['RG', 'CPF', 'Comprovante de Residência']
  
  switch (cliente.especialidade) {
    case 'aposentadoria_idade':
    case 'aposentadoria_tempo_contribuicao':
      return [...documentosComuns, 'Carteira de Trabalho', 'Extrato INSS']
    
    case 'aposentadoria_especial':
      return [...documentosComuns, 'Carteira de Trabalho', 'Extrato INSS', 'PPP', 'Laudo Médico']
    
    case 'auxilio_doenca':
      return [...documentosComuns, 'Laudo Médico', 'Exames Complementares', 'Extrato INSS']
    
    case 'bpc':
      return [...documentosComuns, 'Laudo Médico', 'Declaração de Renda']
    
    case 'pensao_morte':
      return [...documentosComuns, 'Certidão de Óbito', 'Certidão de Casamento']
    
    default:
      return documentosComuns
  }
} 