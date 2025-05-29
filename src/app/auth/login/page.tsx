'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Scale, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { isValidEmail } from '@/utils'

interface LoginFormData {
  email: string
  senha: string
}

interface LoginError {
  field?: keyof LoginFormData
  message: string
}

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    senha: ''
  })
  const [errors, setErrors] = useState<LoginError[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Função para validar formulário
  const validateForm = (): boolean => {
    const newErrors: LoginError[] = []

    if (!formData.email.trim()) {
      newErrors.push({ field: 'email', message: 'Email é obrigatório' })
    } else if (!isValidEmail(formData.email)) {
      newErrors.push({ field: 'email', message: 'Email deve ter um formato válido' })
    }

    if (!formData.senha.trim()) {
      newErrors.push({ field: 'senha', message: 'Senha é obrigatória' })
    } else if (formData.senha.length < 6) {
      newErrors.push({ field: 'senha', message: 'Senha deve ter no mínimo 6 caracteres' })
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  // Função para lidar com mudanças nos inputs
  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Remover erro do campo quando usuário começar a digitar
    setErrors(prev => prev.filter(error => error.field !== field))
  }

  // Função para submeter o formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    setErrors([])

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        // Login bem-sucedido, redirecionar para dashboard
        router.push('/dashboard')
      } else {
        // Mostrar erro retornado pela API
        setErrors([{ message: data.error || 'Erro ao fazer login' }])
      }
    } catch (error) {
      console.error('Erro no login:', error)
      setErrors([{ message: 'Erro de conexão. Tente novamente.' }])
    } finally {
      setIsLoading(false)
    }
  }

  // Função para obter erro de um campo específico
  const getFieldError = (field: keyof LoginFormData) => {
    return errors.find(error => error.field === field)?.message
  }

  // Função para obter erros gerais (sem campo específico)
  const getGeneralErrors = () => {
    return errors.filter(error => !error.field)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo e título */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Scale className="h-12 w-12 text-juridico-azul" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">PandoraPro</h1>
          <p className="text-gray-600 mt-2">Sistema especializado para advogados previdenciários</p>
        </div>

        {/* Formulário de Login */}
        <Card>
          <CardHeader>
            <CardTitle>Fazer Login</CardTitle>
            <CardDescription>
              Entre com suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Erros gerais */}
              {getGeneralErrors().map((error, index) => (
                <div key={index} className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error.message}
                </div>
              ))}

              {/* Campo Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={getFieldError('email') ? 'border-red-500 focus:border-red-500' : ''}
                  disabled={isLoading}
                />
                {getFieldError('email') && (
                  <p className="text-sm text-red-600">{getFieldError('email')}</p>
                )}
              </div>

              {/* Campo Senha */}
              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <div className="relative">
                  <Input
                    id="senha"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    value={formData.senha}
                    onChange={(e) => handleInputChange('senha', e.target.value)}
                    className={getFieldError('senha') ? 'border-red-500 focus:border-red-500 pr-10' : 'pr-10'}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {getFieldError('senha') && (
                  <p className="text-sm text-red-600">{getFieldError('senha')}</p>
                )}
              </div>

              {/* Botão de Login */}
              <Button
                type="submit"
                variant="juridico"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>

            {/* Links adicionais */}
            <div className="mt-6 text-center text-sm">
              <Link
                href="/auth/forgot-password"
                className="text-juridico-azul hover:underline"
              >
                Esqueceu sua senha?
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Informações adicionais */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>© 2024 PandoraPro. Todos os direitos reservados.</p>
          <p className="mt-1">
            Desenvolvido especificamente para advogados previdenciários
          </p>
        </div>
      </div>
    </div>
  )
} 