import { Types } from 'mongoose'

// Tipos de usuário do sistema
export type UserRole = 'super_admin' | 'admin' | 'user' | 'supervisor'

// Status dos casos jurídicos
export type StatusProcessual = 
  | 'consulta_inicial'
  | 'documentacao_pendente'
  | 'analise_caso'
  | 'protocolo_inss'
  | 'aguardando_resposta'
  | 'recurso_contestacao'
  | 'deferido'
  | 'indeferido'

// Especialidades previdenciárias
export type EspecialidadePrevidenciaria = 
  | 'aposentadoria_idade'
  | 'aposentadoria_tempo_contribuicao'
  | 'aposentadoria_especial'
  | 'auxilio_doenca'
  | 'bpc'
  | 'pensao_morte'
  | 'revisao_beneficios'
  | 'personalizada'

// Tipos de benefício INSS
export type TipoBeneficio = 
  | 'aposentadoria_idade'
  | 'aposentadoria_tempo_contribuicao'
  | 'aposentadoria_especial'
  | 'auxilio_doenca'
  | 'auxilio_acidente'
  | 'bpc_deficiencia'
  | 'bpc_idoso'
  | 'pensao_morte'
  | 'salario_maternidade'
  | 'outros'

// Status da empresa
export type StatusEmpresa = 'ativa' | 'suspensa' | 'trial' | 'inativa'

// Status do atendimento
export type StatusAtendimento = 
  | 'consulta_inicial'
  | 'analise_documental'
  | 'em_andamento'
  | 'aguardando_cliente'
  | 'finalizado'

// Prioridade do caso
export type PrioridadeCaso = 'baixa' | 'normal' | 'alta' | 'urgente'

// Origem do cliente
export type OrigemCliente = 'indicacao' | 'online' | 'presencial' | 'whatsapp' | 'outros'

// Interfaces principais

export interface Empresa {
  _id?: Types.ObjectId
  nome: string
  cnpj: string
  endereco: {
    rua: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
    cep: string
  }
  telefone: string
  email: string
  website?: string
  status: StatusEmpresa
  configuracoes: {
    limitesClientes: number
    limitesUsuarios: number
    limitesInstanciasWhatsApp: number
    tema: string
    personalizacao: Record<string, any>
  }
  dataVencimento?: Date
  criadoEm: Date
  atualizadoEm: Date
}

export interface Usuario {
  _id?: Types.ObjectId
  empresaId: Types.ObjectId
  nome: string
  email: string
  senha: string
  role: UserRole
  ativo: boolean
  especialidades: EspecialidadePrevidenciaria[]
  telefone?: string
  avatar?: string
  ultimoAcesso?: Date
  configuracoes: {
    notificacoes: boolean
    tema: 'light' | 'dark'
    idioma: string
  }
  criadoEm: Date
  atualizadoEm: Date
}

export interface Cliente {
  _id?: Types.ObjectId
  empresaId: Types.ObjectId
  nome: string
  cpf: string
  rg?: string
  dataNascimento: Date
  telefone: string
  email?: string
  endereco: {
    rua: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
    cep: string
  }
  // Dados específicos previdenciários
  dadosPrevidenciarios: {
    nit?: string
    numeroProcesso?: string
    tipoBeneficio: TipoBeneficio
    valorBeneficio?: number
    dataInicioProcesso?: Date
    dataUltimaPericia?: Date
    proximaPericia?: Date
    observacoes?: string
  }
  statusProcessual: StatusProcessual
  especialidade: EspecialidadePrevidenciaria
  prioridade: PrioridadeCaso
  origem: OrigemCliente
  advogadoResponsavel?: Types.ObjectId
  tags: string[]
  documentos: {
    nome: string
    tipo: string
    url: string
    dataUpload: Date
    enviado: boolean
  }[]
  anotacoes: {
    texto: string
    autor: Types.ObjectId
    data: Date
    publica: boolean
  }[]
  whatsappNumero?: string
  foto?: string
  ativo: boolean
  criadoEm: Date
  atualizadoEm: Date
}

export interface Atendimento {
  _id?: Types.ObjectId
  empresaId: Types.ObjectId
  clienteId: Types.ObjectId
  advogadoId?: Types.ObjectId
  status: StatusAtendimento
  especialidade: EspecialidadePrevidenciaria
  prioridade: PrioridadeCaso
  titulo: string
  descricao?: string
  mensagensNaoLidas: number
  ultimaMensagem?: Date
  dataLimite?: Date
  anotacoes: {
    texto: string
    autor: Types.ObjectId
    data: Date
    interna: boolean
  }[]
  criadoEm: Date
  atualizadoEm: Date
}

export interface Mensagem {
  _id?: Types.ObjectId
  empresaId: Types.ObjectId
  atendimentoId: Types.ObjectId
  clienteId: Types.ObjectId
  remetente: 'cliente' | 'advogado'
  remetenteId?: Types.ObjectId
  conteudo: string
  tipo: 'texto' | 'imagem' | 'audio' | 'video' | 'documento'
  anexo?: {
    nome: string
    url: string
    tamanho: number
    mimetype: string
  }
  whatsappId?: string
  status: 'enviando' | 'enviado' | 'entregue' | 'lido' | 'erro'
  lida: boolean
  criadoEm: Date
}

export interface Especialidade {
  _id?: Types.ObjectId
  empresaId: Types.ObjectId
  nome: string
  codigo: EspecialidadePrevidenciaria
  descricao: string
  cor: string
  ativa: boolean
  advogados: Types.ObjectId[]
  templates: {
    nome: string
    conteudo: string
    tipo: 'solicitacao_documentos' | 'agendamento' | 'status_processo' | 'explicacao_beneficio' | 'geral'
  }[]
  camposObrigatorios: string[]
  criadoEm: Date
  atualizadoEm: Date
}

export interface Tag {
  _id?: Types.ObjectId
  empresaId: Types.ObjectId
  nome: string
  cor: string
  categoria: 'beneficio' | 'status' | 'prioridade' | 'origem' | 'geral'
  ativa: boolean
  criadoEm: Date
}

export interface InstanciaWhatsApp {
  _id?: Types.ObjectId
  empresaId: Types.ObjectId
  nome: string
  numero: string
  evolutionApiInstanceId: string
  evolutionApiKey: string
  status: 'conectado' | 'desconectado' | 'conectando' | 'erro'
  qrCode?: string
  webhook: {
    url?: string
    token?: string
    ativo: boolean
  }
  configuracoes: {
    autoResposta: boolean
    mensagemBoasVindas?: string
    horarioAtendimento: {
      ativo: boolean
      inicio: string
      fim: string
      diasSemana: number[]
    }
  }
  ultimaConexao?: Date
  ultimaSincronizacao?: Date
  criadoEm: Date
  atualizadoEm: Date
}

export interface WebhookExterno {
  _id?: Types.ObjectId
  empresaId: Types.ObjectId
  nome: string
  url: string
  ativo: boolean
  eventos: ('nova_mensagem' | 'cliente_criado' | 'status_alterado')[]
  autenticacao: {
    tipo: 'none' | 'bearer' | 'api_key' | 'basic'
    token?: string
    usuario?: string
    senha?: string
    header?: string
  }
  filtros: {
    clientes?: Types.ObjectId[]
    especialidades?: EspecialidadePrevidenciaria[]
    tiposMensagem?: string[]
  }
  tentativas: {
    data: Date
    status: 'sucesso' | 'erro'
    resposta?: string
    erro?: string
  }[]
  criadoEm: Date
  atualizadoEm: Date
}

// Tipos para API responses
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Tipos para formulários
export interface LoginForm {
  email: string
  senha: string
}

export interface ClienteForm {
  nome: string
  cpf: string
  rg?: string
  dataNascimento: string
  telefone: string
  email?: string
  endereco: {
    rua: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
    cep: string
  }
  dadosPrevidenciarios: {
    nit?: string
    numeroProcesso?: string
    tipoBeneficio: TipoBeneficio
    valorBeneficio?: number
    dataInicioProcesso?: string
    observacoes?: string
  }
  especialidade: EspecialidadePrevidenciaria
  prioridade: PrioridadeCaso
  origem: OrigemCliente
  tags: string[]
}

// Tipos para dashboard
export interface DashboardMetrics {
  totalClientes: number
  casosAbertos: number
  casosFechados: number
  taxaDeferimento: number
  tempoMedioProcesso: number
  mensagensNaoLidas: number
  proximosVencimentos: number
  distribuicaoEspecialidades: {
    [key in EspecialidadePrevidenciaria]?: number
  }
  distribuicaoStatus: {
    [key in StatusProcessual]?: number
  }
} 