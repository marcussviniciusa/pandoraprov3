import mongoose, { Schema, Document } from 'mongoose'
import bcrypt from 'bcryptjs'
import { Usuario as IUsuario } from '@/types'

export interface UsuarioDocument extends Omit<IUsuario, '_id'>, Document {
  compararSenha(senha: string): Promise<boolean>
  isAdmin(): boolean
  isSuperAdmin(): boolean
}

const UsuarioSchema = new Schema<UsuarioDocument>({
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
    maxlength: [100, 'Nome deve ter no máximo 100 caracteres']
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
  senha: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: [6, 'Senha deve ter no mínimo 6 caracteres'],
    select: false // Por padrão, não incluir a senha nas consultas
  },
  role: {
    type: String,
    enum: {
      values: ['super_admin', 'admin', 'user', 'supervisor'],
      message: 'Role deve ser: super_admin, admin, user ou supervisor'
    },
    default: 'user'
  },
  ativo: {
    type: Boolean,
    default: true
  },
  especialidades: [{
    type: String,
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
  }],
  telefone: {
    type: String,
    trim: true,
    validate: {
      validator: function(telefone: string) {
        if (!telefone) return true
        const cleaned = telefone.replace(/\D/g, '')
        return cleaned.length >= 10 && cleaned.length <= 11
      },
      message: 'Telefone deve ter 10 ou 11 dígitos'
    }
  },
  avatar: {
    type: String,
    trim: true,
    validate: {
      validator: function(avatar: string) {
        if (!avatar) return true
        return /^https?:\/\/.+/.test(avatar) || avatar.startsWith('data:image/')
      },
      message: 'Avatar deve ser uma URL válida ou base64'
    }
  },
  ultimoAcesso: {
    type: Date,
    default: Date.now
  },
  configuracoes: {
    notificacoes: {
      type: Boolean,
      default: true
    },
    tema: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    idioma: {
      type: String,
      default: 'pt-BR',
      enum: ['pt-BR', 'en-US', 'es-ES']
    }
  }
}, {
  timestamps: { 
    createdAt: 'criadoEm', 
    updatedAt: 'atualizadoEm' 
  },
  versionKey: false
})

// Índices compostos para otimização
UsuarioSchema.index({ empresaId: 1, email: 1 }, { unique: true })
UsuarioSchema.index({ empresaId: 1, ativo: 1 })
UsuarioSchema.index({ role: 1 })
UsuarioSchema.index({ especialidades: 1 })
UsuarioSchema.index({ ultimoAcesso: 1 })

// Middleware para hash da senha antes de salvar
UsuarioSchema.pre('save', async function(next) {
  // Só faz hash se a senha foi modificada
  if (!this.isModified('senha')) return next()
  
  try {
    // Gera salt e faz hash da senha
    const salt = await bcrypt.genSalt(12)
    this.senha = await bcrypt.hash(this.senha, salt)
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Middleware para formatar telefone
UsuarioSchema.pre('save', function(next) {
  if (this.telefone) {
    this.telefone = this.telefone.replace(/\D/g, '')
  }
  next()
})

// Método para comparar senhas
UsuarioSchema.methods.compararSenha = async function(senha: string): Promise<boolean> {
  return bcrypt.compare(senha, this.senha)
}

// Método para verificar se é admin
UsuarioSchema.methods.isAdmin = function(): boolean {
  return ['admin', 'super_admin'].includes(this.role)
}

// Método para verificar se é super admin
UsuarioSchema.methods.isSuperAdmin = function(): boolean {
  return this.role === 'super_admin'
}

// Método para atualizar último acesso
UsuarioSchema.methods.atualizarUltimoAcesso = function() {
  this.ultimoAcesso = new Date()
  return this.save({ validateBeforeSave: false })
}

// Métodos estáticos
UsuarioSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() }).select('+senha')
}

UsuarioSchema.statics.findAtivosByEmpresa = function(empresaId: string) {
  return this.find({ 
    empresaId, 
    ativo: true 
  }).populate('empresaId', 'nome status')
}

UsuarioSchema.statics.findByEspecialidade = function(
  empresaId: string, 
  especialidade: string
) {
  return this.find({
    empresaId,
    ativo: true,
    especialidades: especialidade
  })
}

UsuarioSchema.statics.countByEmpresa = function(empresaId: string) {
  return this.countDocuments({ empresaId, ativo: true })
}

// Método para buscar admins da empresa
UsuarioSchema.statics.findAdminsByEmpresa = function(empresaId: string) {
  return this.find({
    empresaId,
    ativo: true,
    role: { $in: ['admin', 'super_admin'] }
  })
}

// Virtual para nome formatado
UsuarioSchema.virtual('nomeFormatado').get(function() {
  return this.nome.split(' ').map((palavra: string) => 
    palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase()
  ).join(' ')
})

// Virtual para iniciais
UsuarioSchema.virtual('iniciais').get(function() {
  return this.nome
    .split(' ')
    .map((palavra: string) => palavra.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2)
})

// Transformation para JSON (remove senha)
UsuarioSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.senha
    delete ret.__v
    return ret
  }
})

const Usuario = mongoose.models.Usuario || mongoose.model<UsuarioDocument>('Usuario', UsuarioSchema)

export default Usuario 