'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { formatCPF } from '@/lib/utils'
import { 
  Cliente, 
  StatusType,
  EspecialidadeType,
  PrioridadeType,
  statusLabels, 
  especialidadeLabels, 
  prioridadeLabels 
} from '@/types/cliente'
import {
  User,
  Save,
  X,
  Scale,
  FileText,
  AlertCircle
} from 'lucide-react'

// Schema de validação com Zod
const clienteFormSchema = z.object({
  nome: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome não pode exceder 100 caracteres'),
  cpf: z.string()
    .min(11, 'CPF deve ter 11 dígitos')
    .max(14, 'CPF inválido')
    .refine((cpf) => {
      // Remove formatação
      const numbers = cpf.replace(/\D/g, '')
      return numbers.length === 11
    }, 'CPF deve ter 11 dígitos válidos'),
  email: z.string()
    .email('Email inválido')
    .min(1, 'Email é obrigatório'),
  telefone: z.string()
    .min(10, 'Telefone deve ter pelo menos 10 dígitos')
    .max(15, 'Telefone inválido'),
  endereco: z.string()
    .min(5, 'Endereço deve ter pelo menos 5 caracteres')
    .max(200, 'Endereço não pode exceder 200 caracteres'),
  nascimento: z.string()
    .min(1, 'Data de nascimento é obrigatória')
    .refine((date) => {
      const birthDate = new Date(date)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      return age >= 16 && age <= 120
    }, 'Idade deve estar entre 16 e 120 anos'),
  especialidade: z.enum([
    'aposentadoria_idade',
    'aposentadoria_tempo_contribuicao', 
    'aposentadoria_especial',
    'auxilio_doenca',
    'bpc',
    'pensao_morte',
    'revisao_beneficios'
  ] as const, {
    required_error: 'Especialidade é obrigatória'
  }),
  status: z.enum([
    'consulta_inicial',
    'documentacao_pendente',
    'analise_caso',
    'protocolo_inss',
    'aguardando_resposta',
    'recurso_contestacao',
    'deferido',
    'indeferido'
  ] as const, {
    required_error: 'Status é obrigatório'
  }),
  prioridade: z.enum(['alta', 'normal', 'baixa'] as const, {
    required_error: 'Prioridade é obrigatória'
  }),
  valorBeneficio: z.string()
    .min(1, 'Valor do benefício é obrigatório')
    .refine((value) => {
      const num = parseFloat(value.replace(/\D/g, '')) / 100
      return num > 0 && num <= 50000
    }, 'Valor deve estar entre R$ 0,01 e R$ 50.000,00'),
  advogadoResponsavel: z.string()
    .min(2, 'Nome do advogado deve ter pelo menos 2 caracteres')
    .max(100, 'Nome não pode exceder 100 caracteres'),
  observacoes: z.string()
    .max(500, 'Observações não podem exceder 500 caracteres')
    .optional(),
})

type ClienteFormData = z.infer<typeof clienteFormSchema>

interface ClienteFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: ClienteFormData) => void
  cliente?: Cliente | null
  mode: 'create' | 'edit'
}

const advogados = [
  'Dr. João Silva',
  'Dra. Maria Santos', 
  'Dr. Carlos Mendes',
  'Dra. Ana Costa',
  'Dr. Pedro Oliveira'
]

export function ClienteFormModal({
  isOpen,
  onClose,
  onSave,
  cliente,
  mode
}: ClienteFormModalProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ClienteFormData>({
    resolver: zodResolver(clienteFormSchema),
    defaultValues: {
      nome: cliente?.nome || '',
      cpf: cliente?.cpf || '',
      email: cliente?.email || '',
      telefone: cliente?.telefone || '',
      endereco: cliente?.endereco || '',
      nascimento: cliente?.nascimento || '',
      especialidade: cliente?.especialidade || undefined,
      status: cliente?.status || 'consulta_inicial',
      prioridade: cliente?.prioridade || 'normal',
      valorBeneficio: cliente?.valorBeneficio 
        ? new Intl.NumberFormat('pt-BR', { 
            style: 'currency', 
            currency: 'BRL' 
          }).format(cliente.valorBeneficio).replace('R$', '').trim()
        : '',
      advogadoResponsavel: cliente?.advogadoResponsavel || '',
      observacoes: cliente?.observacoes || '',
    },
  })

  const onSubmit = async (data: ClienteFormData) => {
    setIsSubmitting(true)
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onSave(data)
      
      toast({
        variant: mode === 'create' ? "success" : "juridico",
        title: mode === 'create' ? "Cliente Cadastrado" : "Cliente Atualizado",
        description: mode === 'create' 
          ? `${data.nome} foi cadastrado com sucesso!`
          : `Dados de ${data.nome} foram atualizados!`
      })
      
      onClose()
      form.reset()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao salvar os dados. Tente novamente."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCpfInput = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return formatCPF(numbers)
  }

  const formatPhoneInput = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }

  const formatCurrencyInput = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    const amount = parseFloat(numbers) / 100
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center">
            <User className="h-6 w-6 mr-2 text-juridico-azul" />
            {mode === 'create' ? 'Cadastrar Novo Cliente' : 'Editar Cliente'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Preencha as informações para cadastrar um novo cliente no sistema.'
              : 'Atualize as informações do cliente conforme necessário.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Informações Pessoais */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-juridico-azul" />
                <h3 className="text-lg font-semibold">Informações Pessoais</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: João Silva Santos"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="000.000.000-00"
                          {...field}
                          onChange={(e) => {
                            const formatted = formatCpfInput(e.target.value)
                            field.onChange(formatted)
                          }}
                          maxLength={14}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nascimento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Nascimento *</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="(11) 99999-9999"
                          {...field}
                          onChange={(e) => {
                            const formatted = formatPhoneInput(e.target.value)
                            field.onChange(formatted)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="cliente@email.com"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endereco"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Rua, número, bairro, cidade - UF"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
              <div className="flex items-center space-x-2">
                <Scale className="h-5 w-5 text-juridico-azul" />
                <h3 className="text-lg font-semibold">Informações Processuais</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="especialidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Especialidade *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a especialidade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(especialidadeLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(statusLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prioridade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridade *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a prioridade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(prioridadeLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="valorBeneficio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor do Benefício *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="0,00"
                          {...field}
                          onChange={(e) => {
                            const formatted = formatCurrencyInput(e.target.value)
                            field.onChange(formatted)
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Valor estimado ou concedido do benefício
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="advogadoResponsavel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Advogado Responsável *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o advogado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {advogados.map((advogado) => (
                            <SelectItem key={advogado} value={advogado}>
                              {advogado}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </motion.section>

            <Separator />

            {/* Observações */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-juridico-azul" />
                <h3 className="text-lg font-semibold">Observações</h3>
              </div>
              
              <FormField
                control={form.control}
                name="observacoes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações Gerais</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Adicione observações sobre o cliente ou processo..."
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Máximo de 500 caracteres
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.section>

            {/* Ações */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-end space-x-4 pt-6 border-t"
            >
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="gradient"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-4 w-4 mr-2"
                  >
                    <AlertCircle className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isSubmitting 
                  ? 'Salvando...' 
                  : mode === 'create' 
                    ? 'Cadastrar Cliente' 
                    : 'Salvar Alterações'
                }
              </Button>
            </motion.div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 