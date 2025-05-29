'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Scale, Users, MessageSquare, BarChart3, Shield, Calendar } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Verificar se o usuário está autenticado
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        
        if (response.ok) {
          // Usuário autenticado, redirecionar para dashboard
          router.push('/dashboard')
        } else {
          // Usuário não autenticado, redirecionar para login
          router.push('/auth/login')
        }
      } catch (error) {
        // Em caso de erro, redirecionar para login
        router.push('/auth/login')
      }
    }

    checkAuth()
  }, [router])

  // Tela de loading enquanto verifica a autenticação
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <Scale className="h-16 w-16 text-juridico-azul animate-pulse" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">PandoraPro</h1>
        <p className="text-gray-600 mb-6">
          Sistema especializado para advogados previdenciários
        </p>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-juridico-azul"></div>
        </div>
      </div>
    </div>
  )
} 