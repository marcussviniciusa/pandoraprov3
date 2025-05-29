import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Função para combinar classes CSS com Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatação de CPF
export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '')
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

// Validação de CPF
export function isValidCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '')
  
  if (cleaned.length !== 11) return false
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleaned)) return false
  
  // Validação do primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i)
  }
  let firstDigit = (sum * 10) % 11
  if (firstDigit === 10) firstDigit = 0
  
  if (firstDigit !== parseInt(cleaned[9])) return false
  
  // Validação do segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * (11 - i)
  }
  let secondDigit = (sum * 10) % 11
  if (secondDigit === 10) secondDigit = 0
  
  return secondDigit === parseInt(cleaned[10])
}

// Formatação de CNPJ
export function formatCNPJ(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, '')
  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

// Validação de CNPJ
export function isValidCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, '')
  
  if (cleaned.length !== 14) return false
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleaned)) return false
  
  // Validação do primeiro dígito verificador
  let sum = 0
  let weight = 5
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned[i]) * weight
    weight = weight === 2 ? 9 : weight - 1
  }
  let firstDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  
  if (firstDigit !== parseInt(cleaned[12])) return false
  
  // Validação do segundo dígito verificador
  sum = 0
  weight = 6
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned[i]) * weight
    weight = weight === 2 ? 9 : weight - 1
  }
  let secondDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  
  return secondDigit === parseInt(cleaned[13])
}

// Formatação de telefone
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  } else if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  
  return phone
}

// Formatação de CEP
export function formatCEP(cep: string): string {
  const cleaned = cep.replace(/\D/g, '')
  return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2')
}

// Formatação de data para pt-BR
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('pt-BR')
}

// Formatação de data e hora para pt-BR
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('pt-BR')
}

// Formatação de valor monetário
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

// Função para gerar cores aleatórias para tags
export function generateRandomColor(): string {
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// Função para calcular tempo relativo (ex: "2 horas atrás")
export function getRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffSecs < 60) return 'agora'
  if (diffMins < 60) return `${diffMins} min atrás`
  if (diffHours < 24) return `${diffHours}h atrás`
  if (diffDays < 7) return `${diffDays}d atrás`
  
  return formatDate(d)
}

// Função para truncar texto
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Função para remover acentos
export function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

// Função para busca fuzzy simples
export function fuzzySearch(query: string, text: string): boolean {
  const queryNormalized = removeAccents(query.toLowerCase())
  const textNormalized = removeAccents(text.toLowerCase())
  return textNormalized.includes(queryNormalized)
}

// Função para capitalizar primeira letra
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Função para converter string para slug
export function slugify(str: string): string {
  return removeAccents(str)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// Função para validar email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Função para gerar ID único simples
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Função para obter iniciais do nome
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

// Função para verificar se uma data está vencida
export function isOverdue(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  return d < new Date()
}

// Função para calcular idade
export function calculateAge(birthDate: Date | string): number {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

// Constantes úteis para o sistema previdenciário
export const ESPECIALIDADES_LABELS = {
  aposentadoria_idade: 'Aposentadoria por Idade',
  aposentadoria_tempo_contribuicao: 'Aposentadoria por Tempo de Contribuição',
  aposentadoria_especial: 'Aposentadoria Especial',
  auxilio_doenca: 'Auxílio-Doença',
  bpc: 'BPC',
  pensao_morte: 'Pensão por Morte',
  revisao_beneficios: 'Revisão de Benefícios',
  personalizada: 'Personalizada'
}

export const STATUS_PROCESSUAL_LABELS = {
  consulta_inicial: 'Consulta Inicial',
  documentacao_pendente: 'Documentação Pendente',
  analise_caso: 'Análise do Caso',
  protocolo_inss: 'Protocolo INSS',
  aguardando_resposta: 'Aguardando Resposta',
  recurso_contestacao: 'Recurso/Contestação',
  deferido: 'Deferido',
  indeferido: 'Indeferido'
}

export const PRIORIDADE_LABELS = {
  baixa: 'Baixa',
  normal: 'Normal',
  alta: 'Alta',
  urgente: 'Urgente'
}

export const ORIGEM_LABELS = {
  indicacao: 'Indicação',
  online: 'Online',
  presencial: 'Presencial',
  whatsapp: 'WhatsApp',
  outros: 'Outros'
} 