'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { BlurFade } from '@/components/magicui/blur-fade'
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text'
import { TypingAnimation } from '@/components/magicui/typing-animation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/utils'
import { 
  Users, 
  Briefcase, 
  CheckCircle, 
  DollarSign, 
  Calendar,
  AlertTriangle,
  TrendingUp,
  Clock,
  Scale,
  FileText,
  Bell,
  Plus
} from 'lucide-react'

interface DashboardStats {
  totalClientes: number
  casosAtivos: number
  casosDeferidos: number
  valorTotalBeneficios: number
}

interface StatusDistribution {
  status: string
  quantidade: number
  color: string
}

interface Especialidade {
  nome: string
  casos: number
  color: string
}

interface ProximoVencimento {
  cliente: string
  tipo: string
  data: string
  dias: number
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  }
}

function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClientes: 0,
    casosAtivos: 0,
    casosDeferidos: 0,
    valorTotalBeneficios: 0
  })
  const [distribuicaoStatus, setDistribuicaoStatus] = useState<StatusDistribution[]>([])
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([])
  const [proximosVencimentos, setProximosVencimentos] = useState<ProximoVencimento[]>([])
  const [loading, setLoading] = useState(true)
  
  const { toast } = useToast()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Carregar estatísticas gerais
      const statsResponse = await fetch('/api/dashboard/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        if (statsData.success) {
          setStats(statsData.data)
        }
      }

      // Carregar distribuição por status
      const statusResponse = await fetch('/api/dashboard/status-distribution')
      if (statusResponse.ok) {
        const statusData = await statusResponse.json()
        if (statusData.success) {
          setDistribuicaoStatus(statusData.data)
        }
      }

      // Carregar especialidades
      const especialidadesResponse = await fetch('/api/dashboard/especialidades')
      if (especialidadesResponse.ok) {
        const especialidadesData = await especialidadesResponse.json()
        if (especialidadesData.success) {
          setEspecialidades(especialidadesData.data)
        }
      }

      // Carregar próximos vencimentos
      const vencimentosResponse = await fetch('/api/dashboard/vencimentos')
      if (vencimentosResponse.ok) {
        const vencimentosData = await vencimentosResponse.json()
        if (vencimentosData.success) {
          setProximosVencimentos(vencimentosData.data)
        }
      }

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar dados do dashboard"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationClick = () => {
    toast({
      variant: "juridico",
      title: "Notificação do Sistema",
      description: `Você tem ${proximosVencimentos.length} prazos próximos!`
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-juridico-azul mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/50 p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header Welcome */}
        <BlurFade delay={0.1}>
          <div className="text-center space-y-4">
            <TypingAnimation 
              text="Dashboard Jurídico" 
              className="text-4xl font-bold text-foreground md:text-5xl"
              duration={50}
            />
            <AnimatedShinyText className="text-xl text-muted-foreground">
              Visão geral dos processos previdenciários
            </AnimatedShinyText>
            <Button 
              onClick={handleNotificationClick}
              variant="outline"
              size="lg"
              className="mt-4"
            >
              <Bell className="mr-2 h-4 w-4" />
              Notificações
            </Button>
          </div>
        </BlurFade>

        {/* Cards de Estatísticas */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={cardVariant}>
            <BlurFade delay={0.2}>
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-juridico-azul">{stats.totalClientes}</div>
                  <p className="text-xs text-muted-foreground">
                    Clientes cadastrados no sistema
                  </p>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-juridico-azul to-juridico-verde" />
              </Card>
            </BlurFade>
          </motion.div>

          <motion.div variants={cardVariant}>
            <BlurFade delay={0.3}>
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Casos Ativos</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{stats.casosAtivos}</div>
                  <p className="text-xs text-muted-foreground">
                    Processos em andamento
                  </p>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-orange-300" />
              </Card>
            </BlurFade>
          </motion.div>

          <motion.div variants={cardVariant}>
            <BlurFade delay={0.4}>
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Casos Deferidos</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.casosDeferidos}</div>
                  <p className="text-xs text-muted-foreground">
                    Benefícios concedidos
                  </p>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-300" />
              </Card>
            </BlurFade>
          </motion.div>

          <motion.div variants={cardVariant}>
            <BlurFade delay={0.5}>
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-juridico-verde">
                    {formatCurrency(stats.valorTotalBeneficios)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Em benefícios conquistados
                  </p>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-juridico-verde to-green-400" />
              </Card>
            </BlurFade>
          </motion.div>
        </motion.div>

        {/* Gráficos e Distribuições */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribuição por Status */}
          <BlurFade delay={0.6}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Distribuição por Status
                </CardTitle>
                <CardDescription>
                  Casos organizados por fase processual
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {distribuicaoStatus.map((item, index) => (
                    <motion.div
                      key={item.status}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="font-medium">{item.status}</span>
                      </div>
                      <span className="text-lg font-bold text-juridico-azul">{item.quantidade}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </BlurFade>

          {/* Especialidades */}
          <BlurFade delay={0.7}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Especialidades
                </CardTitle>
                <CardDescription>
                  Casos por área do direito previdenciário
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {especialidades.map((item, index) => (
                    <motion.div
                      key={item.nome}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="font-medium text-sm">{item.nome}</span>
                      </div>
                      <span className="text-lg font-bold text-juridico-azul">{item.casos}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </BlurFade>
        </div>

        {/* Próximos Vencimentos */}
        <BlurFade delay={0.9}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Próximos Vencimentos
              </CardTitle>
              <CardDescription>
                Prazos importantes que precisam de atenção
              </CardDescription>
            </CardHeader>
            <CardContent>
              {proximosVencimentos.length > 0 ? (
                <div className="space-y-3">
                  {proximosVencimentos.map((vencimento, index) => (
                    <motion.div
                      key={`${vencimento.cliente}-${vencimento.data}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.0 + index * 0.1 }}
                      className={`flex items-center justify-between p-4 rounded-lg border-l-4 ${
                        vencimento.dias <= 3 
                          ? 'border-l-red-500 bg-red-50' 
                          : vencimento.dias <= 7 
                            ? 'border-l-orange-500 bg-orange-50'
                            : 'border-l-blue-500 bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="font-semibold">{vencimento.cliente}</h4>
                          <p className="text-sm text-muted-foreground">{vencimento.tipo}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{vencimento.data}</div>
                        <div className={`text-xs ${
                          vencimento.dias <= 3 
                            ? 'text-red-600' 
                            : vencimento.dias <= 7 
                              ? 'text-orange-600'
                              : 'text-blue-600'
                        }`}>
                          {vencimento.dias} dias
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum prazo próximo</h3>
                  <p className="text-muted-foreground">
                    Não há vencimentos importantes nos próximos dias.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </BlurFade>

        {/* Ações Rápidas */}
        <BlurFade delay={1.1}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Ações Rápidas
              </CardTitle>
              <CardDescription>
                Acesso rápido às principais funcionalidades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <Users className="h-6 w-6 mb-2" />
                  <span>Novo Cliente</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <FileText className="h-6 w-6 mb-2" />
                  <span>Upload Documento</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Scale className="h-6 w-6 mb-2" />
                  <span>Kanban</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <TrendingUp className="h-6 w-6 mb-2" />
                  <span>Relatórios</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </BlurFade>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  )
} 