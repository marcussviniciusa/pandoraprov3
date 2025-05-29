import { NextResponse } from 'next/server'
import { ApiResponse } from '@/types'

export async function POST() {
  try {
    // Criar resposta de sucesso
    const response = NextResponse.json<ApiResponse>({
      success: true,
      message: 'Logout realizado com sucesso'
    })
    
    // Remover cookie de autenticação
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0 // Expira imediatamente
    })
    
    return response
    
  } catch (error) {
    console.error('Erro no logout:', error)
    
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
} 