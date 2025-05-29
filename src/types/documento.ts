export type TipoDocumento = 
  | 'rg' 
  | 'cpf' 
  | 'cnh' 
  | 'comprovante_residencia'
  | 'certidao_nascimento'
  | 'certidao_casamento'
  | 'certidao_obito'
  | 'carteira_trabalho'
  | 'extrato_inss'
  | 'laudo_medico'
  | 'declaracao_renda'
  | 'procuracao'
  | 'ppp'
  | 'exames_complementares'
  | 'outros'

export type StatusDocumento = 'pendente' | 'recebido' | 'analisado' | 'aprovado' | 'rejeitado'

export type CategoriaDocumento = 'identificacao' | 'comprovantes' | 'medicos' | 'trabalhistas' | 'juridicos'

export interface Documento {
  id: string
  nome: string
  tipo: TipoDocumento
  categoria: CategoriaDocumento
  clienteId: string
  arquivo: {
    nome: string
    tamanho: number
    tipo: string
    url?: string // Para preview/download
    base64?: string // Para exibição temporária
  }
  status: StatusDocumento
  dataUpload: string
  dataAnalise?: string
  observacoes?: string
  tags: string[]
  obrigatorio: boolean
  prazoVencimento?: string
  advogadoResponsavel: string
}

// Labels para exibição
export const tipoDocumentoLabels: Record<TipoDocumento, string> = {
  rg: 'RG (Identidade)',
  cpf: 'CPF',
  cnh: 'CNH (Carteira de Motorista)',
  comprovante_residencia: 'Comprovante de Residência',
  certidao_nascimento: 'Certidão de Nascimento',
  certidao_casamento: 'Certidão de Casamento',
  certidao_obito: 'Certidão de Óbito',
  carteira_trabalho: 'Carteira de Trabalho',
  extrato_inss: 'Extrato INSS (CNIS)',
  laudo_medico: 'Laudo Médico',
  declaracao_renda: 'Declaração de Renda',
  procuracao: 'Procuração',
  ppp: 'PPP (Perfil Profissiográfico)',
  exames_complementares: 'Exames Complementares',
  outros: 'Outros Documentos'
}

export const statusDocumentoLabels: Record<StatusDocumento, string> = {
  pendente: 'Pendente',
  recebido: 'Recebido',
  analisado: 'Analisado',
  aprovado: 'Aprovado',
  rejeitado: 'Rejeitado'
}

export const categoriaDocumentoLabels: Record<CategoriaDocumento, string> = {
  identificacao: 'Identificação',
  comprovantes: 'Comprovantes',
  medicos: 'Documentos Médicos',
  trabalhistas: 'Documentos Trabalhistas',
  juridicos: 'Documentos Jurídicos'
}

// Cores para status
export const statusDocumentoColors: Record<StatusDocumento, string> = {
  pendente: 'bg-orange-100 text-orange-800 border-orange-200',
  recebido: 'bg-blue-100 text-blue-800 border-blue-200',
  analisado: 'bg-purple-100 text-purple-800 border-purple-200',
  aprovado: 'bg-green-100 text-green-800 border-green-200',
  rejeitado: 'bg-red-100 text-red-800 border-red-200'
}

// Cores para categorias
export const categoriaDocumentoColors: Record<CategoriaDocumento, string> = {
  identificacao: 'bg-blue-50 text-blue-700 border-blue-200',
  comprovantes: 'bg-green-50 text-green-700 border-green-200',
  medicos: 'bg-red-50 text-red-700 border-red-200',
  trabalhistas: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  juridicos: 'bg-purple-50 text-purple-700 border-purple-200'
}

// Mapeamento de tipo para categoria
export const tipoParaCategoria: Record<TipoDocumento, CategoriaDocumento> = {
  rg: 'identificacao',
  cpf: 'identificacao',
  cnh: 'identificacao',
  comprovante_residencia: 'comprovantes',
  certidao_nascimento: 'identificacao',
  certidao_casamento: 'identificacao',
  certidao_obito: 'identificacao',
  carteira_trabalho: 'trabalhistas',
  extrato_inss: 'trabalhistas',
  laudo_medico: 'medicos',
  declaracao_renda: 'comprovantes',
  procuracao: 'juridicos',
  ppp: 'trabalhistas',
  exames_complementares: 'medicos',
  outros: 'juridicos'
}

// Tipos de arquivo aceitos
export const tiposArquivoAceitos = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
}

// Tamanho máximo do arquivo (5MB)
export const TAMANHO_MAXIMO_ARQUIVO = 5 * 1024 * 1024

// Utilitários
export function getIconeParaTipo(tipo: string): string {
  const tipoLower = tipo.toLowerCase()
  if (tipoLower.includes('pdf')) return '📄'
  if (tipoLower.includes('image') || tipoLower.includes('jpg') || tipoLower.includes('png')) return '🖼️'
  if (tipoLower.includes('word') || tipoLower.includes('doc')) return '📝'
  if (tipoLower.includes('excel') || tipoLower.includes('sheet')) return '📊'
  return '📎'
}

export function formatarTamanhoArquivo(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function obterDocumentosObrigatorios(especialidade: string): TipoDocumento[] {
  const documentosComuns: TipoDocumento[] = ['rg', 'cpf', 'comprovante_residencia']
  
  switch (especialidade) {
    case 'aposentadoria_idade':
    case 'aposentadoria_tempo_contribuicao':
      return [...documentosComuns, 'carteira_trabalho', 'extrato_inss']
    
    case 'aposentadoria_especial':
      return [...documentosComuns, 'carteira_trabalho', 'extrato_inss', 'ppp', 'laudo_medico']
    
    case 'auxilio_doenca':
      return [...documentosComuns, 'laudo_medico', 'exames_complementares', 'extrato_inss']
    
    case 'bpc':
      return [...documentosComuns, 'laudo_medico', 'declaracao_renda']
    
    case 'pensao_morte':
      return [...documentosComuns, 'certidao_obito', 'certidao_casamento']
    
    default:
      return documentosComuns
  }
}

// Função para obter categoria automaticamente baseada no tipo
export function obterCategoriaPorTipo(tipo: TipoDocumento): CategoriaDocumento {
  const mapeamento: Record<TipoDocumento, CategoriaDocumento> = {
    'rg': 'identificacao',
    'cpf': 'identificacao', 
    'certidao_nascimento': 'identificacao',
    'certidao_casamento': 'identificacao',
    'certidao_obito': 'identificacao',
    'comprovante_residencia': 'comprovantes',
    'comprovante_renda': 'comprovantes',
    'extrato_bancario': 'comprovantes',
    'laudo_medico': 'medicos',
    'exame_medico': 'medicos',
    'receita_medica': 'medicos',
    'atestado_medico': 'medicos',
    'ctps': 'trabalhistas',
    'ppp': 'trabalhistas',
    'cnis': 'trabalhistas',
    'declaracao_aposentadoria': 'trabalhistas',
    'procuracao': 'juridicos',
    'contrato': 'juridicos',
    'certidao_tribunal': 'juridicos',
    'outros': 'juridicos'
  }
  
  return mapeamento[tipo]
} 