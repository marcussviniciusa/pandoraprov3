// Tipos para integração WhatsApp com Evolution API

export interface EvolutionInstance {
  instanceName: string
  status: 'connected' | 'connecting' | 'disconnected' | 'qr_code'
  qrCode?: string
  number?: string
  profilePictureUrl?: string
  profileName?: string
  lastSeen?: Date
}

export interface WhatsAppMessage {
  key: {
    remoteJid: string
    fromMe: boolean
    id: string
  }
  pushName?: string
  message: {
    conversation?: string
    extendedTextMessage?: {
      text: string
    }
    imageMessage?: {
      caption?: string
      mimetype: string
      mediaUrl?: string
    }
    documentMessage?: {
      fileName?: string
      mimetype: string
      mediaUrl?: string
      caption?: string
    }
    audioMessage?: {
      mimetype: string
      mediaUrl?: string
      speechToText?: string
    }
    videoMessage?: {
      caption?: string
      mimetype: string
      mediaUrl?: string
    }
  }
  messageType: 'conversation' | 'extendedTextMessage' | 'imageMessage' | 'documentMessage' | 'audioMessage' | 'videoMessage'
  messageTimestamp: number
  numberId?: string
}

export interface WhatsAppWebhookPayload {
  event: string
  instance: string
  data: {
    key: {
      remoteJid: string
      fromMe: boolean
      id: string
    }
    pushName?: string
    message: any
    messageType: string
    messageTimestamp: number
  }
}

export interface WhatsAppContact {
  id: string
  pushName?: string
  profilePictureUrl?: string
  isMyContact: boolean
  lastSeen?: Date
  isOnline?: boolean
}

export interface SendMessageOptions {
  number: string
  text?: string
  media?: {
    mediatype: 'image' | 'document' | 'video' | 'audio'
    fileName?: string
    caption?: string
    media: string // base64 ou URL
  }
  quoted?: {
    key: {
      remoteJid: string
      fromMe: boolean
      id: string
    }
  }
}

export interface SendMessageResponse {
  key: {
    remoteJid: string
    fromMe: boolean
    id: string
  }
  message: any
  messageTimestamp: number
  status: string
}

export interface InstanceConfig {
  instanceName: string
  token?: string
  number?: string
  qrcode: boolean
  integration: 'WHATSAPP-BAILEYS' | 'WHATSAPP-BUSINESS' | 'EVOLUTION'
  webhook?: {
    url: string
    events: string[]
    enabled: boolean
  }
}

export interface WebhookConfig {
  url: string
  webhook_by_events: boolean
  webhook_base64: boolean
  events: WebhookEvent[]
}

export type WebhookEvent = 
  | 'QRCODE_UPDATED'
  | 'MESSAGES_UPSERT'
  | 'MESSAGES_UPDATE'
  | 'MESSAGES_DELETE'
  | 'SEND_MESSAGE'
  | 'CONNECTION_UPDATE'
  | 'CONTACTS_UPSERT'
  | 'CHATS_UPSERT'
  | 'PRESENCE_UPDATE'

export interface ChatWhatsApp {
  id: string
  instanceId: string
  clienteId?: string
  contactJid: string
  contactName: string
  contactProfilePicture?: string
  lastMessage?: string
  lastMessageTimestamp?: Date
  unreadCount: number
  isGroup: boolean
  createdAt: Date
  updatedAt: Date
}

export interface MessageWhatsApp {
  id: string
  chatId: string
  messageId: string
  remoteJid: string
  fromMe: boolean
  content: string
  messageType: string
  timestamp: Date
  status: 'sent' | 'delivered' | 'read' | 'error'
  mediaUrl?: string
  fileName?: string
  caption?: string
  quotedMessageId?: string
  tenantId: string
  createdAt: Date
}

// Templates de mensagem pré-definidos
export interface MessageTemplate {
  id: string
  name: string
  category: 'boas-vindas' | 'documentacao' | 'status' | 'agendamento' | 'cobranca' | 'geral'
  content: string
  variables: string[] // variáveis como {{nome}}, {{beneficio}}, etc.
  isActive: boolean
  tenantId: string
}

// Mensagem automática baseada em eventos
export interface AutoMessage {
  id: string
  trigger: 'cliente_criado' | 'documento_aprovado' | 'documento_rejeitado' | 'status_mudou' | 'prazo_vencendo'
  templateId: string
  delay: number // em minutos
  isActive: boolean
  tenantId: string
}

// Status de conexão da instância
export interface InstanceStatus {
  instanceName: string
  state: 'open' | 'connecting' | 'close'
  status: 'connected' | 'connecting' | 'disconnected'
  qrCode?: string
  profilePictureUrl?: string
  profileName?: string
  number?: string
  lastSeen?: Date
}

// Configuração de bot automático
export interface BotConfig {
  id: string
  instanceId: string
  isActive: boolean
  welcomeMessage?: string
  menuOptions: MenuOption[]
  fallbackMessage: string
  businessHours?: {
    enabled: boolean
    start: string // HH:mm
    end: string // HH:mm
    timezone: string
    offlineMessage: string
  }
  tenantId: string
}

export interface MenuOption {
  id: string
  keyword: string
  title: string
  description: string
  response: string
  subOptions?: MenuOption[]
  action?: 'send_message' | 'transfer_human' | 'collect_info' | 'send_document'
}

// Relatórios e métricas
export interface WhatsAppMetrics {
  totalMessages: number
  sentMessages: number
  receivedMessages: number
  totalChats: number
  activeChats: number
  responseRate: number
  averageResponseTime: number // em minutos
  documentsReceived: number
  period: {
    start: Date
    end: Date
  }
} 