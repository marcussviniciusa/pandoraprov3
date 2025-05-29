import mongoose, { Schema, Document } from 'mongoose'
import { Cliente as ICliente } from '@/types'

export interface ClienteDocument extends Omit<ICliente, '_id'>, Document {}

const ClienteSchema = new Schema<ClienteDocument>({
  empresaId: {
    type: Schema.Types.ObjectId,
    ref: 'Empresa',
    required: [true, 'ID da empresa é obrigatório'],
    index: true
  },
  nome: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    maxlength: [150, 'Nome deve ter no máximo 150 caracteres']
  },
  cpf: {
    type: String,
    required: [true, 'CPF é obrigatório'],
    unique: true,
    trim: true,
    validate: {
      validator: function(cpf: string) {
        const cleaned = cpf.replace(/\D/g, '')
        return cleaned.length === 11
      },
      message: 'CPF deve ter 11 dígitos'
    }
  },
  rg: {
    type: String,
    trim: true,
    maxlength: [20, 'RG deve ter no máximo 20 caracteres']
  },
  dataNascimento: {
    type: Date,
    required: [true, 'Data de nascimento é obrigatória'],
    validate: {
      validator: function(data: Date) {
        const hoje = new Date()
        const idade = hoje.getFullYear() - data.getFullYear()
        return idade >= 0 && idade <= 120
      },
      message: 'Data de nascimento deve ser válida'
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
    trim: true,
    lowercase: true,
    validate: {
      validator: function(email: string) {
        if (!email) return true
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      },
      message: 'Email deve ter um formato válido'
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
  // Dados específicos para advocacia previdenciária
  dadosPrevidenciarios: {
    nit: {
      type: String,
      trim: true,
      validate: {
        validator: function(nit: string) {
          if (!nit) return true
          const cleaned = nit.replace(/\D/g, '')
          return cleaned.length === 11
        },
        message: 'NIT deve ter 11 dígitos'
      }
    },
    numeroProcesso: {
      type: String,
      trim: true,
      maxlength: [50, 'Número do processo deve ter no máximo 50 caracteres']
    },
    tipoBeneficio: {
      type: String,
      required: [true, 'Tipo de benefício é obrigatório'],
      enum: [
        'aposentadoria_idade',
        'aposentadoria_tempo_contribuicao',
        'aposentadoria_especial',
        'auxilio_doenca',
        'auxilio_acidente',
        'bpc_deficiencia',
        'bpc_idoso',
        'pensao_morte',
        'salario_maternidade',
        'outros'
      ]
    },
    valorBeneficio: {
      type: Number,
      min: [0, 'Valor do benefício deve ser positivo'],
      validate: {
        validator: function(valor: number) {
          if (!valor) return true
          return valor >= 0 && valor <= 1000000 // Limite máximo razoável
        },
        message: 'Valor do benefício deve ser válido'
      }
    },
    dataInicioProcesso: {
      type: Date,
      validate: {
        validator: function(data: Date) {
          if (!data) return true
          return data <= new Date()
        },
        message: 'Data de início do processo não pode ser no futuro'
      }
    },
    dataUltimaPericia: {
      type: Date,
      validate: {
        validator: function(data: Date) {
          if (!data) return true
          return data <= new Date()
        },
        message: 'Data da última perícia não pode ser no futuro'
      }
    },
    proximaPericia: {
      type: Date,
      validate: {
        validator: function(data: Date) {
          if (!data) return true
          return data >= new Date()
        },
        message: 'Data da próxima perícia deve ser no futuro'
      }
    },
    observacoes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Observações devem ter no máximo 1000 caracteres']
    }
  },
  statusProcessual: {
    type: String,
    required: [true, 'Status processual é obrigatório'],
    enum: [
      'consulta_inicial',
      'documentacao_pendente',
      'analise_caso',
      'protocolo_inss',
      'aguardando_resposta',
      'recurso_contestacao',
      'deferido',
      'indeferido'
    ],
    default: 'consulta_inicial'
  },
  especialidade: {
    type: String,
    required: [true, 'Especialidade é obrigatória'],
    enum: [
      'aposentadoria_idade',
      'aposentadoria_tempo_contribuicao',
      'aposentadoria_especial',
      'auxilio_doenca',
      'bpc',
      'pensao_morte',
      'revisao_beneficios',
      'personalizada'
    ]
  },
  prioridade: {
    type: String,
    enum: ['baixa', 'normal', 'alta', 'urgente'],
    default: 'normal'
  },
  origem: {
    type: String,
    required: [true, 'Origem é obrigatória'],
    enum: ['indicacao', 'online', 'presencial', 'whatsapp', 'outros'],
    default: 'presencial'
  },
  advogadoResponsavel: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    validate: {
      validator: async function(advogadoId: mongoose.Types.ObjectId) {
        if (!advogadoId) return true
        
        // Verifica se o advogado existe e está ativo na mesma empresa
        const Usuario = mongoose.model('Usuario')
        const advogado = await Usuario.findOne({
          _id: advogadoId,
          empresaId: this.empresaId,
          ativo: true
        })
        return !!advogado
      },
      message: 'Advogado responsável deve ser válido e da mesma empresa'
    }
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag deve ter no máximo 50 caracteres']
  }],
  documentos: [{
    nome: {
      type: String,
      required: [true, 'Nome do documento é obrigatório'],
      trim: true,
      maxlength: [200, 'Nome do documento deve ter no máximo 200 caracteres']
    },
    tipo: {
      type: String,
      required: [true, 'Tipo do documento é obrigatório'],
      enum: ['pdf', 'jpg', 'png', 'doc', 'docx', 'xls', 'xlsx', 'outros'],
      default: 'pdf'
    },
    url: {
      type: String,
      required: [true, 'URL do documento é obrigatória'],
      trim: true,
      validate: {
        validator: function(url: string) {
          return /^https?:\/\/.+/.test(url) || url.startsWith('data:')
        },
        message: 'URL do documento deve ser válida'
      }
    },
    dataUpload: {
      type: Date,
      default: Date.now
    },
    enviado: {
      type: Boolean,
      default: false
    }
  }],
  anotacoes: [{
    texto: {
      type: String,
      required: [true, 'Texto da anotação é obrigatório'],
      trim: true,
      maxlength: [2000, 'Anotação deve ter no máximo 2000 caracteres']
    },
    autor: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'Autor da anotação é obrigatório']
    },
    data: {
      type: Date,
      default: Date.now
    },
    publica: {
      type: Boolean,
      default: false
    }
  }],
  whatsappNumero: {
    type: String,
    trim: true,
    validate: {
      validator: function(numero: string) {
        if (!numero) return true
        const cleaned = numero.replace(/\D/g, '')
        return cleaned.length >= 10 && cleaned.length <= 15
      },
      message: 'Número do WhatsApp deve ter entre 10 e 15 dígitos'
    }
  },
  foto: {
    type: String,
    trim: true,
    validate: {
      validator: function(foto: string) {
        if (!foto) return true
        return /^https?:\/\/.+/.test(foto) || foto.startsWith('data:image/')
      },
      message: 'Foto deve ser uma URL válida ou base64'
    }
  },
  ativo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: { 
    createdAt: 'criadoEm', 
    updatedAt: 'atualizadoEm' 
  },
  versionKey: false
})

// Índices compostos para otimização
ClienteSchema.index({ empresaId: 1, cpf: 1 }, { unique: true })
ClienteSchema.index({ empresaId: 1, ativo: 1 })
ClienteSchema.index({ empresaId: 1, statusProcessual: 1 })
ClienteSchema.index({ empresaId: 1, especialidade: 1 })
ClienteSchema.index({ empresaId: 1, advogadoResponsavel: 1 })
ClienteSchema.index({ empresaId: 1, prioridade: 1 })
ClienteSchema.index({ empresaId: 1, tags: 1 })
ClienteSchema.index({ nome: 'text', 'dadosPrevidenciarios.numeroProcesso': 'text' })

// Middleware para formatação antes de salvar
ClienteSchema.pre('save', function(next) {
  // Remove formatação do CPF
  if (this.cpf) {
    this.cpf = this.cpf.replace(/\D/g, '')
  }
  
  // Remove formatação do NIT
  if (this.dadosPrevidenciarios?.nit) {
    this.dadosPrevidenciarios.nit = this.dadosPrevidenciarios.nit.replace(/\D/g, '')
  }
  
  // Remove formatação do CEP
  if (this.endereco?.cep) {
    this.endereco.cep = this.endereco.cep.replace(/\D/g, '')
  }
  
  // Remove formatação do telefone
  if (this.telefone) {
    this.telefone = this.telefone.replace(/\D/g, '')
  }
  
  // Remove formatação do WhatsApp
  if (this.whatsappNumero) {
    this.whatsappNumero = this.whatsappNumero.replace(/\D/g, '')
  }
  
  next()
})

// Virtual para idade
ClienteSchema.virtual('idade').get(function() {
  const hoje = new Date()
  const nascimento = this.dataNascimento
  let idade = hoje.getFullYear() - nascimento.getFullYear()
  const mes = hoje.getMonth() - nascimento.getMonth()
  
  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--
  }
  
  return idade
})

// Virtual para nome formatado
ClienteSchema.virtual('nomeFormatado').get(function() {
  return this.nome.split(' ').map((palavra: string) => 
    palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase()
  ).join(' ')
})

// Virtual para iniciais
ClienteSchema.virtual('iniciais').get(function() {
  return this.nome
    .split(' ')
    .map((palavra: string) => palavra.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2)
})

// Métodos do modelo
ClienteSchema.methods.adicionarAnotacao = function(texto: string, autorId: string, publica: boolean = false) {
  this.anotacoes.push({
    texto,
    autor: autorId,
    data: new Date(),
    publica
  })
  return this.save()
}

ClienteSchema.methods.alterarStatus = function(novoStatus: string) {
  this.statusProcessual = novoStatus
  return this.save()
}

ClienteSchema.methods.atribuirAdvogado = function(advogadoId: string) {
  this.advogadoResponsavel = advogadoId
  return this.save()
}

// Métodos estáticos
ClienteSchema.statics.findByEmpresa = function(empresaId: string, filtros: any = {}) {
  return this.find({ 
    empresaId, 
    ativo: true,
    ...filtros 
  }).populate('advogadoResponsavel', 'nome email especialidades')
}

ClienteSchema.statics.findByStatus = function(empresaId: string, status: string) {
  return this.find({
    empresaId,
    ativo: true,
    statusProcessual: status
  }).populate('advogadoResponsavel', 'nome email')
}

ClienteSchema.statics.findByAdvogado = function(empresaId: string, advogadoId: string) {
  return this.find({
    empresaId,
    ativo: true,
    advogadoResponsavel: advogadoId
  })
}

ClienteSchema.statics.countByEmpresa = function(empresaId: string) {
  return this.countDocuments({ empresaId, ativo: true })
}

ClienteSchema.statics.countByStatus = function(empresaId: string) {
  return this.aggregate([
    { $match: { empresaId: new mongoose.Types.ObjectId(empresaId), ativo: true } },
    { $group: { _id: '$statusProcessual', count: { $sum: 1 } } }
  ])
}

ClienteSchema.statics.countByEspecialidade = function(empresaId: string) {
  return this.aggregate([
    { $match: { empresaId: new mongoose.Types.ObjectId(empresaId), ativo: true } },
    { $group: { _id: '$especialidade', count: { $sum: 1 } } }
  ])
}

// Transformation para JSON
ClienteSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v
    return ret
  }
})

const Cliente = mongoose.models.Cliente || mongoose.model<ClienteDocument>('Cliente', ClienteSchema)

export default Cliente 