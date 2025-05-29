import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR').format(date)
}

export function formatCPF(cpf: string): string {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function formatCNPJ(cnpj: string): string {
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    consulta_inicial: 'bg-blue-500',
    documentacao_pendente: 'bg-yellow-500',
    analise_caso: 'bg-orange-500',
    protocolo_inss: 'bg-purple-500',
    aguardando_resposta: 'bg-indigo-500',
    recurso_contestacao: 'bg-red-500',
    deferido: 'bg-green-500',
    indeferido: 'bg-gray-500'
  }
  return statusColors[status] || 'bg-gray-500'
}

export function getEspecialidadeColor(especialidade: string): string {
  const especialidadeColors: Record<string, string> = {
    aposentadoria_idade: 'bg-blue-600',
    aposentadoria_tempo_contribuicao: 'bg-green-600',
    aposentadoria_especial: 'bg-purple-600',
    auxilio_doenca: 'bg-orange-600',
    bpc: 'bg-teal-600',
    pensao_morte: 'bg-red-600',
    revisao_beneficios: 'bg-indigo-600'
  }
  return especialidadeColors[especialidade] || 'bg-gray-600'
} 