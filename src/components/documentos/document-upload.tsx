'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  FileText, 
  X, 
  Download, 
  Check, 
  AlertTriangle,
  Eye,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  FileImage,
  File
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { 
  TipoDocumento, 
  StatusDocumento, 
  formatarTamanho, 
  obterIconePorTipo, 
  obterCorStatus,
  obterLabelTipo,
  obterLabelStatus
} from '@/types/documento'

interface DocumentoAPI {
  id: string
  nome: string
  tipo: TipoDocumento
  categoria: string
  tamanho: number
  status: StatusDocumento
  clienteId: string
  dataUpload: string
  observacoes?: string
  tags: string[]
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente'
  url: string
}

interface DocumentUploadProps {
  clienteId?: string
  onUpload?: (documento: DocumentoAPI) => void
  readOnly?: boolean
  maxFiles?: number
}

export default function DocumentUpload({ 
  clienteId = '',
  onUpload,
  readOnly = false,
  maxFiles = 10
}: DocumentUploadProps) {
  const [documentos, setDocumentos] = useState<DocumentoAPI[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)

  // Carregar documentos do banco
  const carregarDocumentos = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (clienteId) params.append('clienteId', clienteId)
      params.append('limit', '50') // Limitar para performance
      
      const response = await fetch(`/api/documentos?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setDocumentos(data.data.documentos)
      } else {
        toast.error('Erro ao carregar documentos')
      }
    } catch (error) {
      console.error('Erro ao carregar documentos:', error)
      toast.error('Erro ao carregar documentos')
    } finally {
      setLoading(false)
    }
  }, [clienteId])

  useEffect(() => {
    carregarDocumentos()
  }, [carregarDocumentos])

  // Upload de arquivo
  const uploadFile = async (file: File, tipoDocumento: TipoDocumento) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('clienteId', clienteId)
    formData.append('tipoDocumento', tipoDocumento)
    formData.append('prioridade', 'media')

    const response = await fetch('/api/documentos/upload', {
      method: 'POST',
      body: formData
    })

    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.message || 'Erro no upload')
    }

    return data.documento
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (readOnly) return
    if (documentos.length + acceptedFiles.length > maxFiles) {
      toast.error(`Máximo de ${maxFiles} arquivos permitidos`)
      return
    }

    setUploading(true)

    try {
      for (const file of acceptedFiles) {
        // Determinar tipo baseado no nome do arquivo
        const fileName = file.name.toLowerCase()
        let tipoDocumento: TipoDocumento = 'outros'
        
        if (fileName.includes('rg')) tipoDocumento = 'rg'
        else if (fileName.includes('cpf')) tipoDocumento = 'cpf'
        else if (fileName.includes('laudo')) tipoDocumento = 'laudo_medico'
        else if (fileName.includes('ppp')) tipoDocumento = 'ppp'
        else if (fileName.includes('ctps')) tipoDocumento = 'ctps'
        else if (fileName.includes('comprovante') && fileName.includes('residencia')) tipoDocumento = 'comprovante_residencia'

        const novoDocumento = await uploadFile(file, tipoDocumento)
        
        setDocumentos(prev => [novoDocumento, ...prev])
        onUpload?.(novoDocumento)
        
        toast.success(`${file.name} enviado com sucesso!`)
      }
    } catch (error) {
      console.error('Erro no upload:', error)
      toast.error(error instanceof Error ? error.message : 'Erro no upload')
    } finally {
      setUploading(false)
    }
  }, [readOnly, documentos.length, maxFiles, clienteId, onUpload])

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    disabled: readOnly || uploading,
    maxSize: 5 * 1024 * 1024, // 5MB
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    }
  })

  // Aprovar documento
  const aprovarDocumento = async (id: string) => {
    try {
      const response = await fetch(`/api/documentos/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'aprovado'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setDocumentos(prev => 
          prev.map(doc => 
            doc.id === id ? { ...doc, status: 'aprovado' } : doc
          )
        )
        toast.success('Documento aprovado!')
      } else {
        toast.error('Erro ao aprovar documento')
      }
    } catch (error) {
      toast.error('Erro ao aprovar documento')
    }
  }

  // Rejeitar documento
  const rejeitarDocumento = async (id: string) => {
    try {
      const response = await fetch(`/api/documentos/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'rejeitado',
          observacoes: 'Documento rejeitado via interface'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setDocumentos(prev => 
          prev.map(doc => 
            doc.id === id ? { ...doc, status: 'rejeitado' } : doc
          )
        )
        toast.success('Documento rejeitado!')
      } else {
        toast.error('Erro ao rejeitar documento')
      }
    } catch (error) {
      toast.error('Erro ao rejeitar documento')
    }
  }

  // Download de documento
  const downloadDocumento = async (id: string, nome: string) => {
    try {
      const response = await fetch(`/api/documentos/${id}/download`)
      const data = await response.json()
      
      if (data.success) {
        // Criar link temporário para download
        const link = document.createElement('a')
        link.href = data.data.downloadUrl
        link.download = nome
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        toast.success('Download iniciado!')
      } else {
        toast.error('Erro ao baixar documento')
      }
    } catch (error) {
      toast.error('Erro ao baixar documento')
    }
  }

  const getDropzoneStyle = () => {
    if (isDragReject) return 'border-red-500 bg-red-50'
    if (isDragAccept) return 'border-green-500 bg-green-50'
    if (isDragActive) return 'border-blue-500 bg-blue-50'
    return 'border-gray-300 hover:border-gray-400'
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Carregando documentos...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      {!readOnly && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload de Documentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
                ${getDropzoneStyle()}
                ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input {...getInputProps()} />
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: isDragActive ? 1.05 : 1 }}
                transition={{ duration: 0.2 }}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="text-lg font-medium text-gray-900 mb-2">
                  {uploading ? 'Enviando...' : 'Arraste arquivos aqui'}
                </div>
                <div className="text-sm text-gray-500">
                  ou clique para selecionar arquivos
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (máx. 5MB)
                </div>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Documentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documentos ({documentos.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documentos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>Nenhum documento encontrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {documentos.map((doc, index) => {
                  const IconeType = obterIconePorTipo(doc.tipo)
                  const corStatus = obterCorStatus(doc.status)
                  
                  return (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <IconeType className="h-8 w-8 text-blue-600" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {doc.nome}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{obterLabelTipo(doc.tipo)}</span>
                            <span>•</span>
                            <span>{formatarTamanho(doc.tamanho)}</span>
                            <span>•</span>
                            <span>{new Date(doc.dataUpload).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className={corStatus}>
                          {obterLabelStatus(doc.status)}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadDocumento(doc.id, doc.nome)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        
                        {!readOnly && doc.status === 'recebido' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => aprovarDocumento(doc.id)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => rejeitarDocumento(doc.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 