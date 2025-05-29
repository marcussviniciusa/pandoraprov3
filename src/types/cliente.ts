// Tipos e interfaces para o sistema de clientes

export type StatusType = 'consulta_inicial' | 'documentacao_pendente' | 'analise_caso' | 'protocolo_inss' | 'aguardando_resposta' | 'recurso_contestacao' | 'deferido' | 'indeferido'

export type EspecialidadeType = 'aposentadoria_idade' | 'aposentadoria_tempo_contribuicao' | 'aposentadoria_especial' | 'auxilio_doenca' | 'bpc' | 'pensao_morte' | 'revisao_beneficios'

export type PrioridadeType = 'alta' | 'normal' | 'baixa'

export interface Cliente {
  id: string
  nome: string
  cpf: string
  email: string
  telefone: string
  endereco: string
  nascimento: string
  status: StatusType
  especialidade: EspecialidadeType
  valorBeneficio: number
  dataUltimaInteracao: string
  documentosPendentes: string[]
  observacoes: string
  prioridade: PrioridadeType
  dataCadastro: string
  advogadoResponsavel: string
}

export const statusLabels: Record<StatusType, string> = {
  consulta_inicial: 'Consulta Inicial',
  documentacao_pendente: 'Documentação Pendente',
  analise_caso: 'Análise do Caso',
  protocolo_inss: 'Protocolo INSS',
  aguardando_resposta: 'Aguardando Resposta',
  recurso_contestacao: 'Recurso/Contestação',
  deferido: 'Deferido',
  indeferido: 'Indeferido'
}

export const especialidadeLabels: Record<EspecialidadeType, string> = {
  aposentadoria_idade: 'Aposentadoria por Idade',
  aposentadoria_tempo_contribuicao: 'Aposentadoria por Tempo',
  aposentadoria_especial: 'Aposentadoria Especial',
  auxilio_doenca: 'Auxílio-Doença',
  bpc: 'BPC',
  pensao_morte: 'Pensão por Morte',
  revisao_beneficios: 'Revisão de Benefícios'
}

export const prioridadeLabels: Record<PrioridadeType, string> = {
  alta: 'Alta',
  normal: 'Normal',
  baixa: 'Baixa'
}

export const prioridadeColors: Record<PrioridadeType, string> = {
  alta: 'bg-red-100 text-red-800 border-red-200',
  normal: 'bg-blue-100 text-blue-800 border-blue-200',
  baixa: 'bg-green-100 text-green-800 border-green-200'
} 