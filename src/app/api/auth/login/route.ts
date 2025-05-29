import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Usuario, Empresa } from '@/models'
import { generateToken } from '@/lib/auth'
import { ApiResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    
    const { email, senha } = await request.json()
    
    // Validações básicas
    if (!email || !senha) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Email e senha são obrigatórios'
      }, { status: 400 })
    }
    
    // Buscar usuário por email (incluindo senha)
    const usuario = await Usuario.findOne({ 
      email: email.toLowerCase() 
    }).select('+senha')
    
    if (!usuario) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Credenciais inválidas'
      }, { status: 401 })
    }
    
    // Verificar se o usuário está ativo
    if (!usuario.ativo) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Usuário inativo. Entre em contato com o administrador.'
      }, { status: 401 })
    }
    
    // Verificar senha
    const senhaValida = await usuario.compararSenha(senha)
    
    if (!senhaValida) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Credenciais inválidas'
      }, { status: 401 })
    }
    
    // Buscar dados da empresa
    const empresa = await Empresa.findById(usuario.empresaId)
    
    if (!empresa) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Empresa não encontrada'
      }, { status: 404 })
    }
    
    // Verificar se a empresa está ativa
    if (!empresa.isAtiva()) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Empresa inativa ou vencida. Entre em contato com o suporte.'
      }, { status: 401 })
    }
    
    // Atualizar último acesso
    await usuario.atualizarUltimoAcesso()
    
    // Gerar JWT token
    const tokenPayload = {
      userId: usuario._id.toString(),
      empresaId: usuario.empresaId.toString(),
      email: usuario.email,
      role: usuario.role,
      nome: usuario.nome
    }
    
    const token = generateToken(tokenPayload)
    
    // Preparar dados do usuário para resposta (sem senha)
    const usuarioResposta = {
      id: usuario._id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
      especialidades: usuario.especialidades,
      avatar: usuario.avatar,
      configuracoes: usuario.configuracoes,
      ultimoAcesso: usuario.ultimoAcesso,
      empresa: {
        id: empresa._id,
        nome: empresa.nome,
        status: empresa.status,
        configuracoes: empresa.configuracoes
      }
    }
    
    // Resposta de sucesso
    const response = NextResponse.json<ApiResponse>({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        usuario: usuarioResposta,
        token
      }
    })
    
    // Definir cookie httpOnly com o token
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 dias
    })
    
    return response
    
  } catch (error) {
    console.error('Erro no login:', error)
    
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
} 