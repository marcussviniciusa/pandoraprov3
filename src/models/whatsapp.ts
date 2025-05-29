import mongoose, { Schema, Document } from 'mongoose'
import type { ChatWhatsApp as ChatWhatsAppType, MessageWhatsApp as MessageWhatsAppType, MessageTemplate as MessageTemplateType, BotConfig as BotConfigType } from '@/types/whatsapp'

// ===== SCHEMA DO CHAT WHATSAPP =====

export interface IChatWhatsApp extends Document {
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

const ChatWhatsAppSchema = new Schema<IChatWhatsApp>({
  instanceId: {
    type: String,
    required: true,
    index: true
  },
  clienteId: {
    type: String,
    index: true
  },
  contactJid: {
    type: String,
    required: true,
    index: true
  },
  contactName: {
    type: String,
    required: true
  },
  contactProfilePicture: String,
  lastMessage: String,
  lastMessageTimestamp: Date,
  unreadCount: {
    type: Number,
    default: 0
  },
  isGroup: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'whatsapp_chats'
})

// Índices compostos
ChatWhatsAppSchema.index({ instanceId: 1, contactJid: 1 }, { unique: true })
ChatWhatsAppSchema.index({ instanceId: 1, clienteId: 1 })
ChatWhatsAppSchema.index({ instanceId: 1, lastMessageTimestamp: -1 })

// ===== SCHEMA DA MENSAGEM WHATSAPP =====

export interface IMessageWhatsApp extends Document {
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

const MessageWhatsAppSchema = new Schema<IMessageWhatsApp>({
  chatId: {
    type: String,
    required: true,
    index: true
  },
  messageId: {
    type: String,
    required: true,
    unique: true
  },
  remoteJid: {
    type: String,
    required: true,
    index: true
  },
  fromMe: {
    type: Boolean,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    required: true,
    enum: ['conversation', 'extendedTextMessage', 'imageMessage', 'documentMessage', 'audioMessage', 'videoMessage']
  },
  timestamp: {
    type: Date,
    required: true,
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: ['sent', 'delivered', 'read', 'error'],
    default: 'sent'
  },
  mediaUrl: String,
  fileName: String,
  caption: String,
  quotedMessageId: String,
  tenantId: {
    type: String,
    required: true,
    index: true
  }
}, {
  timestamps: true,
  collection: 'whatsapp_messages'
})

// Índices compostos
MessageWhatsAppSchema.index({ chatId: 1, timestamp: -1 })
MessageWhatsAppSchema.index({ tenantId: 1, timestamp: -1 })
MessageWhatsAppSchema.index({ remoteJid: 1, timestamp: -1 })

// ===== SCHEMA DO TEMPLATE DE MENSAGEM =====

export interface IMessageTemplate extends Document {
  name: string
  category: 'boas-vindas' | 'documentacao' | 'status' | 'agendamento' | 'cobranca' | 'geral'
  content: string
  variables: string[]
  isActive: boolean
  tenantId: string
}

const MessageTemplateSchema = new Schema<IMessageTemplate>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['boas-vindas', 'documentacao', 'status', 'agendamento', 'cobranca', 'geral']
  },
  content: {
    type: String,
    required: true
  },
  variables: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  tenantId: {
    type: String,
    required: true,
    index: true
  }
}, {
  timestamps: true,
  collection: 'message_templates'
})

MessageTemplateSchema.index({ tenantId: 1, category: 1 })
MessageTemplateSchema.index({ tenantId: 1, name: 1 }, { unique: true })

// ===== SCHEMA DA CONFIGURAÇÃO DE BOT =====

export interface IBotConfig extends Document {
  instanceId: string
  isActive: boolean
  welcomeMessage?: string
  menuOptions: any[]
  fallbackMessage: string
  businessHours?: {
    enabled: boolean
    start: string
    end: string
    timezone: string
    offlineMessage: string
  }
  tenantId: string
}

const MenuOptionSchema = new Schema({
  id: String,
  keyword: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  response: {
    type: String,
    required: true
  },
  subOptions: [this],
  action: {
    type: String,
    enum: ['send_message', 'transfer_human', 'collect_info', 'send_document']
  }
}, { _id: false })

const BotConfigSchema = new Schema<IBotConfig>({
  instanceId: {
    type: String,
    required: true,
    unique: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  welcomeMessage: String,
  menuOptions: [MenuOptionSchema],
  fallbackMessage: {
    type: String,
    default: 'Desculpe, não entendi sua mensagem. Digite *menu* para ver as opções disponíveis.'
  },
  businessHours: {
    enabled: {
      type: Boolean,
      default: false
    },
    start: {
      type: String,
      default: '08:00'
    },
    end: {
      type: String,
      default: '18:00'
    },
    timezone: {
      type: String,
      default: 'America/Sao_Paulo'
    },
    offlineMessage: {
      type: String,
      default: '🕒 Nosso horário de atendimento é de segunda à sexta, das 8h às 18h. Retornaremos em breve!'
    }
  },
  tenantId: {
    type: String,
    required: true,
    index: true
  }
}, {
  timestamps: true,
  collection: 'bot_configs'
})

// ===== SCHEMA DA INSTÂNCIA WHATSAPP =====

export interface IWhatsAppInstance extends Document {
  instanceName: string
  tenantId: string
  status: 'connected' | 'connecting' | 'disconnected' | 'qr_code'
  qrCode?: string
  number?: string
  profileName?: string
  profilePictureUrl?: string
  lastSeen?: Date
  webhookConfigured: boolean
  isActive: boolean
  connectionAttempts: number
  lastConnectionAttempt?: Date
  createdAt: Date
  updatedAt: Date
}

const WhatsAppInstanceSchema = new Schema<IWhatsAppInstance>({
  instanceName: {
    type: String,
    required: true,
    unique: true
  },
  tenantId: {
    type: String,
    required: true,
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: ['connected', 'connecting', 'disconnected', 'qr_code'],
    default: 'disconnected'
  },
  qrCode: String,
  number: String,
  profileName: String,
  profilePictureUrl: String,
  lastSeen: Date,
  webhookConfigured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  connectionAttempts: {
    type: Number,
    default: 0
  },
  lastConnectionAttempt: Date
}, {
  timestamps: true,
  collection: 'whatsapp_instances'
})

WhatsAppInstanceSchema.index({ tenantId: 1, status: 1 })

// ===== MÉTODOS ESTÁTICOS E DE INSTÂNCIA =====

// Métodos para Chat
ChatWhatsAppSchema.statics.findByInstance = function(instanceId: string) {
  return this.find({ instanceId }).sort({ lastMessageTimestamp: -1 })
}

ChatWhatsAppSchema.statics.findByCliente = function(clienteId: string) {
  return this.find({ clienteId }).sort({ lastMessageTimestamp: -1 })
}

ChatWhatsAppSchema.methods.updateLastMessage = function(content: string, timestamp: Date) {
  this.lastMessage = content
  this.lastMessageTimestamp = timestamp
  return this.save()
}

ChatWhatsAppSchema.methods.incrementUnread = function() {
  this.unreadCount += 1
  return this.save()
}

ChatWhatsAppSchema.methods.markAsRead = function() {
  this.unreadCount = 0
  return this.save()
}

// Métodos para Message
MessageWhatsAppSchema.statics.findByChat = function(chatId: string, limit: number = 50) {
  return this.find({ chatId }).sort({ timestamp: -1 }).limit(limit)
}

MessageWhatsAppSchema.statics.findByTenant = function(tenantId: string, limit: number = 100) {
  return this.find({ tenantId }).sort({ timestamp: -1 }).limit(limit)
}

MessageWhatsAppSchema.statics.countUnreadByTenant = function(tenantId: string) {
  return this.aggregate([
    { $match: { tenantId, fromMe: false, status: { $ne: 'read' } } },
    { $group: { _id: null, count: { $sum: 1 } } }
  ])
}

// Métodos para Template
MessageTemplateSchema.statics.findByCategory = function(tenantId: string, category: string) {
  return this.find({ tenantId, category, isActive: true })
}

MessageTemplateSchema.methods.interpolate = function(variables: Record<string, string>) {
  let content = this.content
  for (const [key, value] of Object.entries(variables)) {
    content = content.replace(new RegExp(`{{${key}}}`, 'g'), value)
  }
  return content
}

// Métodos para Instance
WhatsAppInstanceSchema.statics.findByTenant = function(tenantId: string) {
  return this.find({ tenantId, isActive: true })
}

WhatsAppInstanceSchema.statics.findConnected = function(tenantId: string) {
  return this.find({ tenantId, status: 'connected', isActive: true })
}

WhatsAppInstanceSchema.methods.updateStatus = function(status: string, additionalData?: any) {
  this.status = status
  this.lastSeen = new Date()
  
  if (additionalData) {
    Object.assign(this, additionalData)
  }
  
  return this.save()
}

WhatsAppInstanceSchema.methods.incrementConnectionAttempts = function() {
  this.connectionAttempts += 1
  this.lastConnectionAttempt = new Date()
  return this.save()
}

WhatsAppInstanceSchema.methods.resetConnectionAttempts = function() {
  this.connectionAttempts = 0
  this.lastConnectionAttempt = undefined
  return this.save()
}

// ===== EXPORTAÇÃO DOS MODELOS =====

export const ChatWhatsApp = (mongoose.models?.ChatWhatsApp || 
  mongoose.model<IChatWhatsApp>('ChatWhatsApp', ChatWhatsAppSchema)) as mongoose.Model<IChatWhatsApp>

export const MessageWhatsApp = (mongoose.models?.MessageWhatsApp || 
  mongoose.model<IMessageWhatsApp>('MessageWhatsApp', MessageWhatsAppSchema)) as mongoose.Model<IMessageWhatsApp>

export const MessageTemplate = (mongoose.models?.MessageTemplate || 
  mongoose.model<IMessageTemplate>('MessageTemplate', MessageTemplateSchema)) as mongoose.Model<IMessageTemplate>

export const BotConfig = (mongoose.models?.BotConfig || 
  mongoose.model<IBotConfig>('BotConfig', BotConfigSchema)) as mongoose.Model<IBotConfig>

export const WhatsAppInstance = (mongoose.models?.WhatsAppInstance || 
  mongoose.model<IWhatsAppInstance>('WhatsAppInstance', WhatsAppInstanceSchema)) as mongoose.Model<IWhatsAppInstance> 