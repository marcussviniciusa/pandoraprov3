import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, unauthorizedResponse } from '@/lib/auth'
import { ApiResponse } from '@/types'

export async function GET(request: NextRequest) {
  try {
    // Autenticar usuário
    const user = await authenticateUser(request)
    
    if (!user) {
      return unauthorizedResponse()
    }
    
    // Retornar dados do usuário
    return NextResponse.json<ApiResponse>({
      success: true,
      data: user
    })
    
  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
} 