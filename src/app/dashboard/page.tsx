'use client'

import React, { useState, useEffect } from 'react'
import { 
  Users, 
  FileText, 
  TrendingUp, 
  Clock, 
  Scale, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  DollarSign
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface DashboardData {
  totalClientes: number
  casosAtivos: number
  casosAbertos: number
  casosDeferidos: number
  casosIndeferidos: number
  valorTotalBeneficios: number
  proximosVencimentos: number
  statusCounts: {
    consulta_inicial: number
    documentacao_pendente: number
    analise_caso: number
    protocolo_inss: number
    aguardando_resposta: number
    recurso_contestacao: number
    deferido: number
    indeferido: number
  }
  especialidadeCounts: {
    aposentadoria_idade: number
    aposentadoria_tempo_contribuicao: number
    aposentadoria_especial: number
    auxilio_doenca: number
    bpc: number
    pensao_morte: number
    revisao_beneficios: number
  }
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  // Mock data para desenvolvimento
  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      setData({
        totalClientes: 6,
        casosAtivos: 4,
        casosAbertos: 5,
        casosDeferidos: 1,
        casosIndeferidos: 0,
        valorTotalBeneficios: 12700.00,
        proximosVencimentos: 2,
        statusCounts: {
          consulta_inicial: 1,
          documentacao_pendente: 1,
          analise_caso: 1,
          protocolo_inss: 1,
          aguardando_resposta: 1,
          recurso_contestacao: 0,
          deferido: 1,
          indeferido: 0
        },
        especialidadeCounts: {
          aposentadoria_idade: 1,
          aposentadoria_tempo_contribuicao: 1,
          aposentadoria_especial: 1,
          auxilio_doenca: 1,
          bpc: 1,
          pensao_morte: 1,
          revisao_beneficios: 0
        }
      })
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Scale className="text-juridico-azul" />
                Dashboard PandoraPro
              </h1>
              <p className="text-gray-600 mt-2">
                Visão geral dos processos previdenciários
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Agenda
              </Button>
              <Button variant="juridico">
                <FileText className="w-4 h-4 mr-2" />
                Novo Cliente
              </Button>
            </div>
          </div>
        </div>

        {/* Cards de Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
              <Users className="h-4 w-4 text-juridico-azul" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.totalClientes}</div>
              <p className="text-xs text-muted-foreground">
                Todos os clientes cadastrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Casos Ativos</CardTitle>
              <TrendingUp className="h-4 w-4 text-juridico-verde" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.casosAtivos}</div>
              <p className="text-xs text-muted-foreground">
                Em andamento no INSS
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Casos Deferidos</CardTitle>
              <CheckCircle className="h-4 w-4 text-juridico-verde" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.casosDeferidos}</div>
              <p className="text-xs text-muted-foreground">
                Benefícios aprovados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <DollarSign className="h-4 w-4 text-juridico-dourado" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL' 
                }).format(data?.valorTotalBeneficios || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Em benefícios pleiteados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Cards de Status e Especialidades */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Status dos Processos */}
          <Card>
            <CardHeader>
              <CardTitle>Status dos Processos</CardTitle>
              <CardDescription>
                Distribuição por fase processual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(data?.statusCounts || {}).map(([status, count]) => {
                  const statusLabels: Record<string, string> = {
                    consulta_inicial: 'Consulta Inicial',
                    documentacao_pendente: 'Documentação Pendente',
                    analise_caso: 'Análise do Caso',
                    protocolo_inss: 'Protocolo INSS',
                    aguardando_resposta: 'Aguardando Resposta',
                    recurso_contestacao: 'Recurso/Contestação',
                    deferido: 'Deferido',
                    indeferido: 'Indeferido'
                  }

                  const statusColors: Record<string, string> = {
                    consulta_inicial: 'bg-blue-500',
                    documentacao_pendente: 'bg-yellow-500',
                    analise_caso: 'bg-orange-500',
                    protocolo_inss: 'bg-purple-500',
                    aguardando_resposta: 'bg-indigo-500',
                    recurso_contestacao: 'bg-red-500',
                    deferido: 'bg-green-500',
                    indeferido: 'bg-gray-500'
                  }

                  return (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${statusColors[status]}`}></div>
                        <span className="text-sm">{statusLabels[status]}</span>
                      </div>
                      <span className="font-medium">{count}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Especialidades */}
          <Card>
            <CardHeader>
              <CardTitle>Por Especialidade</CardTitle>
              <CardDescription>
                Distribuição por tipo de benefício
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(data?.especialidadeCounts || {}).map(([especialidade, count]) => {
                  const especialidadeLabels: Record<string, string> = {
                    aposentadoria_idade: 'Aposentadoria por Idade',
                    aposentadoria_tempo_contribuicao: 'Aposentadoria por Tempo',
                    aposentadoria_especial: 'Aposentadoria Especial',
                    auxilio_doenca: 'Auxílio-Doença',
                    bpc: 'BPC',
                    pensao_morte: 'Pensão por Morte',
                    revisao_beneficios: 'Revisão de Benefícios'
                  }

                  return (
                    <div key={especialidade} className="flex items-center justify-between">
                      <span className="text-sm">{especialidadeLabels[especialidade]}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alertas e Próximos Vencimentos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-juridico-vermelho" />
                Atenção Requerida
              </CardTitle>
              <CardDescription>
                Casos que precisam de ação imediata
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Maria Oliveira</p>
                    <p className="text-xs text-red-600">Documentação pendente - Alta prioridade</p>
                  </div>
                  <Button size="sm" variant="danger">
                    Ver
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Lucia Ferreira</p>
                    <p className="text-xs text-yellow-600">Aguardando resposta INSS - 15 dias</p>
                  </div>
                  <Button size="sm" variant="warning">
                    Ver
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-juridico-azul" />
                Próximos Vencimentos
              </CardTitle>
              <CardDescription>
                Perícias e prazos importantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Maria Oliveira</p>
                    <p className="text-xs text-blue-600">Perícia médica - 15/12/2025</p>
                  </div>
                  <Button size="sm" variant="juridico">
                    Agendar
                  </Button>
                </div>
                <div className="text-center py-4 text-gray-500 text-sm">
                  Nenhum outro vencimento próximo
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 