import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { connectToDatabase } from './mongodb'
import { Usuario, Empresa } from '@/models'

const JWT_SECRET = process.env.NEXTAUTH_SECRET!

// Interface para o payload do JWT
export interface JWTPayload {
  userId: string
  empresaId: string
  email: string
  role: string
  nome: string
  iat?: number
  exp?: number
}

// Interface para o usuário autenticado
export interface AuthUser {
  id: string
  nome: string
  email: string
  role: string
  empresaId: string
  especialidades: string[]
  avatar?: string
  empresa: {
    id: string
    nome: string
    status: string
  }
}

// Função para verificar token JWT
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    return null
  }
}

// Função para gerar token JWT
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d'
  })
}

// Função para extrair token do request
export function extractToken(request: NextRequest): string | null {
  // Primeiro verifica no cookie
  const cookieToken = request.cookies.get('auth-token')?.value
  if (cookieToken) {
    return cookieToken
  }
  
  // Depois verifica no header Authorization
  const authHeader = request.headers.get('Authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  return null
}

// Middleware para autenticação
export async function authenticateUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const token = extractToken(request)
    
    if (!token) {
      return null
    }
    
    const payload = verifyToken(token)
    
    if (!payload) {
      return null
    }
    
    await connectToDatabase()
    
    // Buscar usuário no banco para verificar se ainda está ativo
    const usuario = await Usuario.findById(payload.userId).populate('empresaId')
    
    if (!usuario || !usuario.ativo) {
      return null
    }
    
    // Verificar se a empresa ainda está ativa
    const empresa = await Empresa.findById(usuario.empresaId)
    
    if (!empresa || !empresa.isAtiva()) {
      return null
    }
    
    return {
      id: usuario._id.toString(),
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
      empresaId: usuario.empresaId.toString(),
      especialidades: usuario.especialidades,
      avatar: usuario.avatar,
      empresa: {
        id: empresa._id.toString(),
        nome: empresa.nome,
        status: empresa.status
      }
    }
    
  } catch (error) {
    console.error('Erro na autenticação:', error)
    return null
  }
}

// Helper para verificar roles
export function hasRole(user: AuthUser, allowedRoles: string[]): boolean {
  return allowedRoles.includes(user.role)
}

// Helper para verificar se é admin
export function isAdmin(user: AuthUser): boolean {
  return ['admin', 'super_admin'].includes(user.role)
}

// Helper para verificar se é super admin
export function isSuperAdmin(user: AuthUser): boolean {
  return user.role === 'super_admin'
}

// Função para criar resposta de erro de autenticação
export function unauthorizedResponse(message: string = 'Token inválido ou expirado') {
  return Response.json({
    success: false,
    error: message
  }, { status: 401 })
}

// Função para criar resposta de erro de autorização
export function forbiddenResponse(message: string = 'Acesso negado') {
  return Response.json({
    success: false,
    error: message
  }, { status: 403 })
} 