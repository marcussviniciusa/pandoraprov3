'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  MessageCircle,
  Send,
  Paperclip,
  MoreVertical,
  Search,
  Users,
  Clock,
  Check,
  CheckCheck,
  Phone,
  User,
  ArrowLeft,
  Smile,
  Image,
  FileText,
  Mic
} from 'lucide-react'

interface Chat {
  id: string
  contactName: string
  contactPhone: string
  contactJid: string
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  isOnline: boolean
  profilePicture?: string
  clienteId?: string
}

interface Message {
  id: string
  content: string
  fromMe: boolean
  timestamp: Date
  status: 'sent' | 'delivered' | 'read'
  messageType: 'text' | 'image' | 'document' | 'audio'
  mediaUrl?: string
  fileName?: string
  caption?: string
}

interface QuickReply {
  id: string
  label: string
  content: string
  category: string
}

export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Quick replies pré-definidos
  const quickReplies: QuickReply[] = [
    {
      id: '1',
      label: 'Boas-vindas',
      content: 'Olá! Bem-vindo(a) ao atendimento do nosso escritório. Como posso ajudá-lo(a)?',
      category: 'geral'
    },
    {
      id: '2',
      label: 'Solicitar Documentos',
      content: 'Para dar continuidade ao seu processo, precisarei de alguns documentos. Poderia me enviar?',
      category: 'documentacao'
    },
    {
      id: '3',
      label: 'Status do Processo',
      content: 'Vou verificar o status do seu processo e retorno em instantes.',
      category: 'status'
    },
    {
      id: '4',
      label: 'Agendar Consulta',
      content: 'Vamos agendar uma consulta. Qual seria o melhor dia e horário para você?',
      category: 'agendamento'
    }
  ]

  useEffect(() => {
    loadChats()
  }, [])

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id)
    }
  }, [selectedChat])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadChats = async () => {
    try {
      const response = await fetch('/api/whatsapp/chats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar chats')
      }

      const result = await response.json()
      if (result.success) {
        const chats = result.data.map((chat: any) => ({
          ...chat,
          lastMessageTime: new Date(chat.lastMessageTime)
        }))
        setChats(chats)
        if (chats.length > 0) {
          setSelectedChat(chats[0])
        }
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error('Erro ao carregar chats:', error)
      toast.error('Erro ao carregar conversas')
      
      // Lista vazia em caso de erro - sem dados mock
      setChats([])
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (chatId: string) => {
    try {
      const response = await fetch(`/api/whatsapp/chats/${chatId}/messages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar mensagens')
      }

      const result = await response.json()
      if (result.success) {
        const messages = result.data.map((message: any) => ({
          ...message,
          timestamp: new Date(message.timestamp)
        }))
        setMessages(messages)
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error)
      toast.error('Erro ao carregar mensagens')
      
      // Lista vazia em caso de erro - sem dados mock
      setMessages([])
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || sending) return

    setSending(true)
    try {
      // Adicionar mensagem otimisticamente na UI
      const optimisticMessage: Message = {
        id: Date.now().toString(),
        content: newMessage,
        fromMe: true,
        timestamp: new Date(),
        status: 'sent',
        messageType: 'text'
      }

      setMessages(prev => [...prev, optimisticMessage])
      const messageContent = newMessage
      setNewMessage('')

      // Enviar mensagem via API
      const response = await fetch('/api/whatsapp/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: selectedChat.id,
          content: messageContent,
          messageType: 'text'
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao enviar mensagem')
      }

      const result = await response.json()
      if (result.success) {
        // Atualizar mensagem com dados reais da API
        setMessages(prev => 
          prev.map(m => 
            m.id === optimisticMessage.id 
              ? { 
                  ...result.data, 
                  timestamp: new Date(result.data.timestamp)
                }
              : m
          )
        )
        toast.success('Mensagem enviada!')
      } else {
        throw new Error(result.message)
      }

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      toast.error('Erro ao enviar mensagem')
      
      // Remover mensagem otimística em caso de erro
      setMessages(prev => prev.filter(m => m.id !== Date.now().toString()))
      setNewMessage(newMessage) // Restaurar texto
    } finally {
      setSending(false)
    }
  }

  const sendQuickReply = (reply: QuickReply) => {
    setNewMessage(reply.content)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  const formatLastMessage = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'agora'
    if (diffInMinutes < 60) return `${diffInMinutes}min`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`
    return date.toLocaleDateString('pt-BR')
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Check className="h-3 w-3 text-gray-400" />
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-gray-400" />
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />
      default:
        return <Clock className="h-3 w-3 text-gray-400" />
    }
  }

  const filteredChats = chats.filter(chat =>
    chat.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.contactPhone.includes(searchTerm)
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2">Carregando conversas...</span>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar com lista de chats */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header da sidebar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-600" />
              Conversas
            </h1>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar conversas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Lista de chats */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            {filteredChats.map((chat, index) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedChat(chat)}
                className={`
                  p-3 rounded-lg cursor-pointer transition-all duration-200 mb-2
                  ${selectedChat?.id === chat.id 
                    ? 'bg-green-50 border border-green-200' 
                    : 'hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={chat.profilePicture} />
                      <AvatarFallback className="bg-green-100 text-green-700">
                        {getInitials(chat.contactName)}
                      </AvatarFallback>
                    </Avatar>
                    {chat.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">
                        {chat.contactName}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatLastMessage(chat.lastMessageTime)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-600 truncate">
                        {chat.lastMessage}
                      </p>
                      {chat.unreadCount > 0 && (
                        <Badge variant="default" className="bg-green-600 h-5 min-w-5 text-xs">
                          {chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Área principal do chat */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Header do chat */}
            <div className="p-4 bg-white border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedChat.profilePicture} />
                    <AvatarFallback className="bg-green-100 text-green-700">
                      {getInitials(selectedChat.contactName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {selectedChat.contactName}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{selectedChat.contactPhone}</span>
                      {selectedChat.isOnline && (
                        <>
                          <span>•</span>
                          <span className="text-green-600">Online</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <User className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Área de mensagens */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex ${message.fromMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`
                          max-w-xs lg:max-w-md px-4 py-2 rounded-lg
                          ${message.fromMe
                            ? 'bg-green-600 text-white rounded-br-none'
                            : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                          }
                        `}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className={`flex items-center justify-end space-x-1 mt-1 ${message.fromMe ? 'text-green-100' : 'text-gray-500'}`}>
                          <span className="text-xs">
                            {formatTime(message.timestamp)}
                          </span>
                          {message.fromMe && getStatusIcon(message.status)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Respostas rápidas */}
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="flex flex-wrap gap-2 mb-3">
                {quickReplies.map((reply) => (
                  <Button
                    key={reply.id}
                    variant="outline"
                    size="sm"
                    onClick={() => sendQuickReply(reply)}
                    className="text-xs"
                  >
                    {reply.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Input de mensagem */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="pr-20"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Smile className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Mic className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Selecione uma conversa
              </h3>
              <p className="text-gray-500">
                Escolha uma conversa da lista para começar a responder
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 