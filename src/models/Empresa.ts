import mongoose, { Schema, Document } from 'mongoose'
import { Empresa as IEmpresa } from '@/types'

export interface EmpresaDocument extends Omit<IEmpresa, '_id'>, Document {}

const EmpresaSchema = new Schema<EmpresaDocument>({
  nome: {
    type: String,
    required: [true, 'Nome da empresa é obrigatório'],
    trim: true,
    maxlength: [100, 'Nome deve ter no máximo 100 caracteres']
  },
  cnpj: {
    type: String,
    required: [true, 'CNPJ é obrigatório'],
    unique: true,
    trim: true,
    validate: {
      validator: function(cnpj: string) {
        // Remove formatação e valida se tem 14 dígitos
        const cleaned = cnpj.replace(/\D/g, '')
        return cleaned.length === 14
      },
      message: 'CNPJ deve ter 14 dígitos'
    }
  },
  endereco: {
    rua: {
      type: String,
      required: [true, 'Rua é obrigatória'],
      trim: true,
      maxlength: [200, 'Rua deve ter no máximo 200 caracteres']
    },
    numero: {
      type: String,
      required: [true, 'Número é obrigatório'],
      trim: true,
      maxlength: [20, 'Número deve ter no máximo 20 caracteres']
    },
    complemento: {
      type: String,
      trim: true,
      maxlength: [100, 'Complemento deve ter no máximo 100 caracteres']
    },
    bairro: {
      type: String,
      required: [true, 'Bairro é obrigatório'],
      trim: true,
      maxlength: [100, 'Bairro deve ter no máximo 100 caracteres']
    },
    cidade: {
      type: String,
      required: [true, 'Cidade é obrigatória'],
      trim: true,
      maxlength: [100, 'Cidade deve ter no máximo 100 caracteres']
    },
    estado: {
      type: String,
      required: [true, 'Estado é obrigatório'],
      trim: true,
      length: [2, 'Estado deve ter 2 caracteres'],
      uppercase: true
    },
    cep: {
      type: String,
      required: [true, 'CEP é obrigatório'],
      trim: true,
      validate: {
        validator: function(cep: string) {
          const cleaned = cep.replace(/\D/g, '')
          return cleaned.length === 8
        },
        message: 'CEP deve ter 8 dígitos'
      }
    }
  },
  telefone: {
    type: String,
    required: [true, 'Telefone é obrigatório'],
    trim: true,
    validate: {
      validator: function(telefone: string) {
        const cleaned = telefone.replace(/\D/g, '')
        return cleaned.length >= 10 && cleaned.length <= 11
      },
      message: 'Telefone deve ter 10 ou 11 dígitos'
    }
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(email: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      },
      message: 'Email deve ter um formato válido'
    }
  },
  website: {
    type: String,
    trim: true,
    validate: {
      validator: function(website: string) {
        if (!website) return true
        return /^https?:\/\/.+/.test(website)
      },
      message: 'Website deve começar com http:// ou https://'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['ativa', 'suspensa', 'trial', 'inativa'],
      message: 'Status deve ser: ativa, suspensa, trial ou inativa'
    },
    default: 'trial'
  },
  configuracoes: {
    limitesClientes: {
      type: Number,
      default: 100,
      min: [1, 'Limite de clientes deve ser no mínimo 1'],
      max: [10000, 'Limite de clientes deve ser no máximo 10.000']
    },
    limitesUsuarios: {
      type: Number,
      default: 5,
      min: [1, 'Limite de usuários deve ser no mínimo 1'],
      max: [100, 'Limite de usuários deve ser no máximo 100']
    },
    limitesInstanciasWhatsApp: {
      type: Number,
      default: 1,
      min: [1, 'Limite de instâncias WhatsApp deve ser no mínimo 1'],
      max: [10, 'Limite de instâncias WhatsApp deve ser no máximo 10']
    },
    tema: {
      type: String,
      default: 'light',
      enum: ['light', 'dark']
    },
    personalizacao: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  dataVencimento: {
    type: Date,
    validate: {
      validator: function(data: Date) {
        return !data || data > new Date()
      },
      message: 'Data de vencimento deve ser no futuro'
    }
  }
}, {
  timestamps: { 
    createdAt: 'criadoEm', 
    updatedAt: 'atualizadoEm' 
  },
  versionKey: false
})

// Índices para otimização de consultas
EmpresaSchema.index({ cnpj: 1 })
EmpresaSchema.index({ email: 1 })
EmpresaSchema.index({ status: 1 })
EmpresaSchema.index({ 'configuracoes.limitesClientes': 1 })

// Middleware para formatação antes de salvar
EmpresaSchema.pre('save', function(next) {
  // Remove formatação do CNPJ
  if (this.cnpj) {
    this.cnpj = this.cnpj.replace(/\D/g, '')
  }
  
  // Remove formatação do CEP
  if (this.endereco?.cep) {
    this.endereco.cep = this.endereco.cep.replace(/\D/g, '')
  }
  
  // Remove formatação do telefone
  if (this.telefone) {
    this.telefone = this.telefone.replace(/\D/g, '')
  }
  
  next()
})

// Métodos do modelo
EmpresaSchema.methods.isAtiva = function(): boolean {
  return this.status === 'ativa' && (!this.dataVencimento || this.dataVencimento > new Date())
}

EmpresaSchema.methods.podeAdicionarClientes = function(quantidadeAtual: number): boolean {
  return quantidadeAtual < this.configuracoes.limitesClientes
}

EmpresaSchema.methods.podeAdicionarUsuarios = function(quantidadeAtual: number): boolean {
  return quantidadeAtual < this.configuracoes.limitesUsuarios
}

EmpresaSchema.methods.podeAdicionarInstanciasWhatsApp = function(quantidadeAtual: number): boolean {
  return quantidadeAtual < this.configuracoes.limitesInstanciasWhatsApp
}

// Método estático para buscar empresa ativa
EmpresaSchema.statics.findAtiva = function(id: string) {
  return this.findOne({ 
    _id: id, 
    status: 'ativa',
    $or: [
      { dataVencimento: { $exists: false } },
      { dataVencimento: { $gt: new Date() } }
    ]
  })
}

const Empresa = mongoose.models.Empresa || mongoose.model<EmpresaDocument>('Empresa', EmpresaSchema)

export default Empresa 