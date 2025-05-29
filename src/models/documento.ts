import mongoose, { Schema, Document, Model } from 'mongoose'
import { TipoDocumento, StatusDocumento, CategoriaDocumento } from '@/types/documento'

// Interface para o documento MongoDB
export interface IDocumento extends Document {
  _id: string
  nome: string
  tipo: TipoDocumento
  categoria: CategoriaDocumento
  tamanho: number
  mimetype: string
  url: string
  objectName: string // Nome do arquivo no MinIO
  status: StatusDocumento
  clienteId: string
  tenantId: string
  uploadedBy: string
  dataUpload: Date
  dataAtualizacao: Date
  observacoes?: string
  tags: string[]
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente'
  prazoValidade?: Date
  versao: number
  etag: string
  metadados: {
    originalName: string
    uploadSource: 'web' | 'whatsapp' | 'email' | 'api'
    ipAddress?: string
    userAgent?: string
  }
  aprovacao?: {
    aprovadoPor?: string
    dataAprovacao?: Date
    motivoRejeicao?: string
  }
}

// Schema do MongoDB
const DocumentoSchema = new Schema<IDocumento>({
  nome: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  tipo: {
    type: String,
    required: true,
    enum: [
      'rg', 'cpf', 'certidao_nascimento', 'certidao_casamento', 'certidao_obito',
      'comprovante_residencia', 'comprovante_renda', 'extrato_bancario',
      'laudo_medico', 'exame_medico', 'receita_medica', 'atestado_medico',
      'ctps', 'ppp', 'cnis', 'declaracao_aposentadoria',
      'procuracao', 'contrato', 'certidao_tribunal', 'outros'
    ]
  },
  categoria: {
    type: String,
    required: true,
    enum: ['identificacao', 'comprovantes', 'medicos', 'trabalhistas', 'juridicos']
  },
  tamanho: {
    type: Number,
    required: true,
    min: 0,
    max: 5 * 1024 * 1024 // 5MB máximo
  },
  mimetype: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        return /^(application\/(pdf|msword|vnd\.(openxmlformats-officedocument\.wordprocessingml\.document|ms-excel|openxmlformats-officedocument\.spreadsheetml\.sheet))|image\/(jpeg|jpg|png|gif|webp))$/.test(v)
      },
      message: 'Tipo de arquivo não suportado'
    }
  },
  url: {
    type: String,
    required: true
  },
  objectName: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pendente', 'recebido', 'analisado', 'aprovado', 'rejeitado'],
    default: 'recebido'
  },
  clienteId: {
    type: String,
    required: true,
    index: true
  },
  tenantId: {
    type: String,
    required: true,
    index: true
  },
  uploadedBy: {
    type: String,
    required: true
  },
  dataUpload: {
    type: Date,
    required: true,
    default: Date.now
  },
  dataAtualizacao: {
    type: Date,
    required: true,
    default: Date.now
  },
  observacoes: {
    type: String,
    maxlength: 1000
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  prioridade: {
    type: String,
    required: true,
    enum: ['baixa', 'media', 'alta', 'urgente'],
    default: 'media'
  },
  prazoValidade: {
    type: Date
  },
  versao: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  etag: {
    type: String,
    required: true
  },
  metadados: {
    originalName: {
      type: String,
      required: true
    },
    uploadSource: {
      type: String,
      required: true,
      enum: ['web', 'whatsapp', 'email', 'api'],
      default: 'web'
    },
    ipAddress: String,
    userAgent: String
  },
  aprovacao: {
    aprovadoPor: String,
    dataAprovacao: Date,
    motivoRejeicao: String
  }
}, {
  timestamps: true,
  collection: 'documentos'
})

// Índices compostos para performance
DocumentoSchema.index({ clienteId: 1, tenantId: 1 })
DocumentoSchema.index({ tenantId: 1, status: 1 })
DocumentoSchema.index({ tenantId: 1, categoria: 1 })
DocumentoSchema.index({ tenantId: 1, dataUpload: -1 })
DocumentoSchema.index({ objectName: 1 }, { unique: true })

// Middleware para atualizar dataAtualizacao automaticamente
DocumentoSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.dataAtualizacao = new Date()
  }
  next()
})

DocumentoSchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
  this.set({ dataAtualizacao: new Date() })
  next()
})

// Métodos estáticos úteis
DocumentoSchema.statics.findByCliente = function(clienteId: string, tenantId: string) {
  return this.find({ clienteId, tenantId }).sort({ dataUpload: -1 })
}

DocumentoSchema.statics.findByStatus = function(status: StatusDocumento, tenantId: string) {
  return this.find({ status, tenantId }).sort({ dataUpload: -1 })
}

DocumentoSchema.statics.findByCategoria = function(categoria: CategoriaDocumento, tenantId: string) {
  return this.find({ categoria, tenantId }).sort({ dataUpload: -1 })
}

DocumentoSchema.statics.getEstatisticas = async function(tenantId: string) {
  const pipeline = [
    { $match: { tenantId } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        tamanhoTotal: { $sum: '$tamanho' },
        pendentes: {
          $sum: { $cond: [{ $eq: ['$status', 'pendente'] }, 1, 0] }
        },
        aprovados: {
          $sum: { $cond: [{ $eq: ['$status', 'aprovado'] }, 1, 0] }
        },
        rejeitados: {
          $sum: { $cond: [{ $eq: ['$status', 'rejeitado'] }, 1, 0] }
        },
        urgentes: {
          $sum: { $cond: [{ $eq: ['$prioridade', 'urgente'] }, 1, 0] }
        }
      }
    }
  ]
  
  const result = await this.aggregate(pipeline)
  return result[0] || {
    total: 0,
    tamanhoTotal: 0,
    pendentes: 0,
    aprovados: 0,
    rejeitados: 0,
    urgentes: 0
  }
}

// Métodos de instância
DocumentoSchema.methods.aprovar = function(aprovadoPor: string) {
  this.status = 'aprovado'
  this.aprovacao = {
    aprovadoPor,
    dataAprovacao: new Date()
  }
  return this.save()
}

DocumentoSchema.methods.rejeitar = function(motivoRejeicao: string, rejeitadoPor: string) {
  this.status = 'rejeitado'
  this.aprovacao = {
    aprovadoPor: rejeitadoPor,
    dataAprovacao: new Date(),
    motivoRejeicao
  }
  return this.save()
}

DocumentoSchema.methods.adicionarTag = function(tag: string) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag)
    return this.save()
  }
  return this
}

DocumentoSchema.methods.removerTag = function(tag: string) {
  this.tags = this.tags.filter((t: string) => t !== tag)
  return this.save()
}

// Definir interface do modelo com métodos estáticos
interface IDocumentoModel extends Model<IDocumento> {
  findByCliente(clienteId: string, tenantId: string): Promise<IDocumento[]>
  findByStatus(status: StatusDocumento, tenantId: string): Promise<IDocumento[]>
  findByCategoria(categoria: CategoriaDocumento, tenantId: string): Promise<IDocumento[]>
  getEstatisticas(tenantId: string): Promise<{
    total: number
    tamanhoTotal: number
    pendentes: number
    aprovados: number
    rejeitados: number
    urgentes: number
  }>
}

// Criar e exportar o modelo
const Documento: IDocumentoModel = (mongoose.models?.Documento || 
  mongoose.model<IDocumento, IDocumentoModel>('Documento', DocumentoSchema)) as unknown as IDocumentoModel

export default Documento 