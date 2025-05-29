import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ChatWhatsApp, MessageWhatsApp, WhatsAppInstance } from '@/models/whatsapp'
import { extractPhoneFromJid, isGroupJid } from '@/lib/evolution-api'
import { WhatsAppWebhookPayload } from '@/types/whatsapp'
import { processIncomingMessage } from '@/lib/whatsapp-processor'

export async function POST(request: NextRequest) {
  try {
    const payload: WhatsAppWebhookPayload = await request.json()
    
    console.log('📱 Webhook WhatsApp recebido:', {
      event: payload.event,
      instance: payload.instance,
      messageType: payload.data?.messageType
    })

    // Conectar ao banco de dados
    await connectToDatabase()

    // Verificar se a instância existe no banco
    const instance = await WhatsAppInstance.findOne({ 
      instanceName: payload.instance, 
      isActive: true 
    })

    if (!instance) {
      console.warn(`⚠️ Instância ${payload.instance} não encontrada no banco`)
      return NextResponse.json({ status: 'ignored' })
    }

    // Processar diferentes tipos de eventos
    switch (payload.event) {
      case 'messages.upsert':
        await handleMessageUpsert(payload, instance.tenantId)
        break
        
      case 'connection.update':
        await handleConnectionUpdate(payload)
        break
        
      case 'qrcode.updated':
        await handleQRCodeUpdate(payload)
        break
        
      case 'messages.update':
        await handleMessageUpdate(payload)
        break
        
      default:
        console.log(`📋 Evento não processado: ${payload.event}`)
    }

    return NextResponse.json({ 
      status: 'processed',
      event: payload.event 
    })

  } catch (error) {
    console.error('❌ Erro no webhook WhatsApp:', error)
    return NextResponse.json(
      { error: 'Erro interno no webhook' },
      { status: 500 }
    )
  }
}

// Processar mensagem recebida
async function handleMessageUpsert(payload: WhatsAppWebhookPayload, tenantId: string) {
  try {
    const messageData = payload.data
    
    // Ignorar mensagens enviadas por nós
    if (messageData.key.fromMe) {
      console.log('📤 Mensagem enviada por nós, ignorando')
      return
    }

    // Ignorar grupos (por enquanto)
    if (isGroupJid(messageData.key.remoteJid)) {
      console.log('👥 Mensagem de grupo, ignorando')
      return
    }

    // Extrair conteúdo da mensagem
    const content = extractMessageContent(messageData.message)
    if (!content) {
      console.log('❌ Não foi possível extrair conteúdo da mensagem')
      return
    }

    const contactPhone = extractPhoneFromJid(messageData.key.remoteJid)
    const contactName = messageData.pushName || contactPhone

    // Buscar ou criar chat
    let chat = await ChatWhatsApp.findOne({
      instanceId: payload.instance,
      contactJid: messageData.key.remoteJid
    })

    if (!chat) {
      chat = new ChatWhatsApp({
        instanceId: payload.instance,
        contactJid: messageData.key.remoteJid,
        contactName: contactName,
        lastMessage: content,
        lastMessageTimestamp: new Date(messageData.messageTimestamp * 1000),
        unreadCount: 1,
        isGroup: false
      })
      await chat.save()
      console.log('✅ Novo chat criado:', chat.id)
    } else {
      // Atualizar chat existente
      chat.lastMessage = content
      chat.lastMessageTimestamp = new Date(messageData.messageTimestamp * 1000)
      chat.unreadCount += 1
      await chat.save()
      console.log('🔄 Chat atualizado:', chat.id)
    }

    // Salvar mensagem
    const message = new MessageWhatsApp({
      chatId: chat.id,
      messageId: messageData.key.id,
      remoteJid: messageData.key.remoteJid,
      fromMe: false,
      content: content,
      messageType: messageData.messageType,
      timestamp: new Date(messageData.messageTimestamp * 1000),
      status: 'delivered',
      tenantId: tenantId,
      mediaUrl: extractMediaUrl(messageData.message),
      fileName: extractFileName(messageData.message),
      caption: extractCaption(messageData.message)
    })

    await message.save()
    console.log('💬 Mensagem salva:', message.id)

    // Processar mensagem para auto-resposta ou automações
    await processIncomingMessage(payload.instance, chat, message, tenantId)

  } catch (error) {
    console.error('❌ Erro ao processar mensagem:', error)
  }
}

// Atualizar status da conexão
async function handleConnectionUpdate(payload: WhatsAppWebhookPayload) {
  try {
    const connectionData = payload.data as any
    
    await WhatsAppInstance.findOneAndUpdate(
      { instanceName: payload.instance },
      { 
        status: connectionData.state === 'open' ? 'connected' : 'disconnected',
        lastSeen: new Date(),
        ...(connectionData.state === 'open' && {
          number: connectionData.number,
          profileName: connectionData.profileName,
          profilePictureUrl: connectionData.profilePictureUrl
        })
      }
    )

    console.log(`🔄 Status da instância ${payload.instance} atualizado: ${connectionData.state}`)
  } catch (error) {
    console.error('❌ Erro ao atualizar status da conexão:', error)
  }
}

// Atualizar QR Code
async function handleQRCodeUpdate(payload: WhatsAppWebhookPayload) {
  try {
    const qrData = payload.data as any
    
    await WhatsAppInstance.findOneAndUpdate(
      { instanceName: payload.instance },
      { 
        qrCode: qrData.qrcode,
        status: 'qr_code',
        lastSeen: new Date()
      }
    )

    console.log(`📱 QR Code atualizado para instância ${payload.instance}`)
  } catch (error) {
    console.error('❌ Erro ao atualizar QR Code:', error)
  }
}

// Atualizar status da mensagem
async function handleMessageUpdate(payload: WhatsAppWebhookPayload) {
  try {
    const updateData = payload.data as any
    
    await MessageWhatsApp.findOneAndUpdate(
      { messageId: updateData.key.id },
      { 
        status: updateData.update?.status || 'delivered',
        updatedAt: new Date()
      }
    )

    console.log(`📝 Status da mensagem ${updateData.key.id} atualizado`)
  } catch (error) {
    console.error('❌ Erro ao atualizar status da mensagem:', error)
  }
}

// Funções utilitárias para extrair dados da mensagem

function extractMessageContent(message: any): string | null {
  if (message.conversation) {
    return message.conversation
  }
  
  if (message.extendedTextMessage?.text) {
    return message.extendedTextMessage.text
  }
  
  if (message.imageMessage?.caption) {
    return message.imageMessage.caption
  }
  
  if (message.documentMessage?.caption) {
    return message.documentMessage.caption
  }
  
  if (message.videoMessage?.caption) {
    return message.videoMessage.caption
  }
  
  if (message.audioMessage) {
    return message.audioMessage.speechToText || '[Áudio]'
  }
  
  if (message.imageMessage) {
    return '[Imagem]'
  }
  
  if (message.documentMessage) {
    return `[Documento: ${message.documentMessage.fileName || 'arquivo'}]`
  }
  
  if (message.videoMessage) {
    return '[Vídeo]'
  }
  
  return null
}

function extractMediaUrl(message: any): string | undefined {
  return message.imageMessage?.mediaUrl || 
         message.documentMessage?.mediaUrl || 
         message.videoMessage?.mediaUrl || 
         message.audioMessage?.mediaUrl
}

function extractFileName(message: any): string | undefined {
  return message.documentMessage?.fileName
}

function extractCaption(message: any): string | undefined {
  return message.imageMessage?.caption || 
         message.documentMessage?.caption || 
         message.videoMessage?.caption
} 