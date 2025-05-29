'use client'

import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { formatCPF, getStatusColor, getEspecialidadeColor } from '@/lib/utils'
import { 
  Cliente, 
  statusLabels, 
  especialidadeLabels, 
  prioridadeLabels, 
  prioridadeColors 
} from '@/types/cliente'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Edit,
  Trash2,
  Clock,
  AlertCircle,
  CheckCircle,
  Scale,
  CreditCard,
  UserCircle,
  Building,
  MessageSquare,
  Download,
  Printer,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ClienteDetailsModalProps {
  cliente: Cliente | null
  isOpen: boolean
  onClose: () => void
  onEdit: (cliente: Cliente) => void
  onDelete: (cliente: Cliente) => void
}

export function ClienteDetailsModal({
  cliente,
  isOpen,
  onClose,
  onEdit,
  onDelete
}: ClienteDetailsModalProps) {
  const { toast } = useToast()

  if (!cliente) return null

  const handleWhatsApp = () => {
    const phoneNumber = cliente.telefone.replace(/\D/g, '')
    const message = `Olá ${cliente.nome.split(' ')[0]}, como está? Somos do escritório Silva & Advogados e gostaríamos de falar sobre o andamento do seu processo previdenciário.`
    const whatsappUrl = `https://wa.me/55${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
    
    toast({
      variant: "juridico",
      title: "WhatsApp Aberto",
      description: `Conversa iniciada com ${cliente.nome}`
    })
  }

  const handleEmail = () => {
    const subject = `Processo Previdenciário - ${especialidadeLabels[cliente.especialidade]}`
    const body = `Prezado(a) ${cliente.nome},\n\nEsperamos que esteja bem.\n\nEntramos em contato para atualizar sobre o andamento do seu processo...\n\nAtenciosamente,\n${cliente.advogadoResponsavel}\nEscritório Silva & Advogados`
    const emailUrl = `mailto:${cliente.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(emailUrl)
    
    toast({
      variant: "success",
      title: "Email Aberto",
      description: `Cliente de email preparado para ${cliente.nome}`
    })
  }

  const handlePrint = () => {
    toast({
      variant: "juridico",
      title: "Imprimindo",
      description: "Relatório do cliente sendo preparado para impressão"
    })
  }

  const handleExport = () => {
    toast({
      variant: "success",
      title: "Exportando",
      description: "Dados do cliente exportados em PDF"
    })
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR })
  }

  const calcularIdade = (nascimento: string) => {
    const hoje = new Date()
    const dataNasc = new Date(nascimento)
    let idade = hoje.getFullYear() - dataNasc.getFullYear()
    const mes = hoje.getMonth() - dataNasc.getMonth()
    if (mes < 0 || (mes === 0 && hoje.getDate() < dataNasc.getDate())) {
      idade--
    }
    return idade
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-juridico-azul text-white text-xl">
                  {cliente.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl font-bold text-foreground">
                  {cliente.nome}
                </DialogTitle>
                <DialogDescription className="text-lg mt-1">
                  {formatCPF(cliente.cpf)} • {calcularIdade(cliente.nascimento)} anos
                </DialogDescription>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`px-3 py-1 text-sm rounded-full border ${prioridadeColors[cliente.prioridade]}`}>
                    {prioridadeLabels[cliente.prioridade]}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className={`h-3 w-3 rounded-full ${getStatusColor(cliente.status)}`} />
                    <span className="text-sm font-medium">
                      {statusLabels[cliente.status]}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Ações principais */}
            <div className="flex items-center space-x-2">
              <Button variant="juridico_outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
              <Button variant="juridico_outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button variant="juridico" size="sm" onClick={() => onEdit(cliente)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-6 mt-6">
          {/* Informações de Contato */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold flex items-center">
              <User className="h-5 w-5 mr-2 text-juridico-azul" />
              Informações de Contato
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{cliente.email}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleEmail}>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{cliente.telefone}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleWhatsApp}>
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Endereço</p>
                  <p className="font-medium">{cliente.endereco}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Data de Nascimento</p>
                  <p className="font-medium">{formatDate(cliente.nascimento)}</p>
                </div>
              </div>
            </div>
          </motion.section>

          <Separator />

          {/* Informações Processuais */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold flex items-center">
              <Scale className="h-5 w-5 mr-2 text-juridico-azul" />
              Informações Processuais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`h-3 w-3 rounded-full ${getEspecialidadeColor(cliente.especialidade)}`} />
                  <p className="text-sm text-muted-foreground">Especialidade</p>
                </div>
                <p className="font-medium">{especialidadeLabels[cliente.especialidade]}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Valor do Benefício</p>
                </div>
                <p className="font-bold text-lg text-juridico-azul">
                  {new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }).format(cliente.valorBeneficio)}
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <UserCircle className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Advogado Responsável</p>
                </div>
                <p className="font-medium">{cliente.advogadoResponsavel}</p>
              </div>
            </div>
          </motion.section>

          <Separator />

          {/* Documentos Pendentes */}
          {cliente.documentosPendentes.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold flex items-center text-orange-600">
                <AlertCircle className="h-5 w-5 mr-2" />
                Documentos Pendentes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {cliente.documentosPendentes.map((doc, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <FileText className="h-4 w-4 text-orange-600" />
                    <span className="font-medium text-orange-800">{doc}</span>
                    <div className="ml-auto">
                      <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700">
                        Solicitar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          <Separator />

          {/* Histórico e Observações */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold flex items-center">
              <Clock className="h-5 w-5 mr-2 text-juridico-azul" />
              Histórico e Observações
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Data de Cadastro</p>
                <p className="font-medium">{formatDate(cliente.dataCadastro)}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Última Interação</p>
                <p className="font-medium">{formatDate(cliente.dataUltimaInteracao)}</p>
              </div>
            </div>
            {cliente.observacoes && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Observações</p>
                <p className="text-sm leading-relaxed">{cliente.observacoes}</p>
              </div>
            )}
          </motion.section>

          {/* Ações Finais */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-between pt-4 border-t"
          >
            <div className="flex space-x-3">
              <Button variant="gradient" onClick={handleWhatsApp}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Conversar via WhatsApp
              </Button>
              <Button variant="juridico_outline" onClick={handleEmail}>
                <Mail className="h-4 w-4 mr-2" />
                Enviar Email
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => onDelete(cliente)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Cliente
              </Button>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 