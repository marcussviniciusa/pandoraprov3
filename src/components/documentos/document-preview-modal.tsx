'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Documento, 
  statusDocumentoLabels, 
  statusDocumentoColors, 
  categoriaDocumentoLabels,
  formatarTamanhoArquivo,
  getIconeParaTipo
} from '@/types/documento'
import {
  Download,
  X,
  FileText,
  Image,
  File,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Eye,
  Calendar,
  User,
  Hash,
  Tag
} from 'lucide-react'

interface DocumentPreviewModalProps {
  documento: Documento | null
  isOpen: boolean
  onClose: () => void
  onDownload?: (documento: Documento) => void
}

export function DocumentPreviewModal({
  documento,
  isOpen,
  onClose,
  onDownload
}: DocumentPreviewModalProps) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  if (!documento) return null

  const isImage = documento.arquivo.tipo.startsWith('image/')
  const isPDF = documento.arquivo.tipo === 'application/pdf'
  const isOfficeDoc = documento.arquivo.tipo.includes('word') || 
                     documento.arquivo.tipo.includes('excel') ||
                     documento.arquivo.tipo.includes('document')

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5))
  const handleRotate = () => setRotation(prev => (prev + 90) % 360)
  const handleDownload = () => onDownload?.(documento)

  const renderPreview = () => {
    if (isImage && documento.arquivo.base64) {
      return (
        <div className="flex items-center justify-center min-h-[400px] bg-muted/20 rounded-lg overflow-hidden">
          <motion.img
            src={documento.arquivo.base64}
            alt={documento.nome}
            className="max-w-full max-h-full object-contain"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: 'transform 0.3s ease'
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )
    }

    if (isPDF) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-muted/20 rounded-lg">
          <File className="h-16 w-16 text-red-500 mb-4" />
          <h3 className="text-lg font-medium mb-2">Documento PDF</h3>
          <p className="text-muted-foreground text-center mb-4">
            Para visualizar este PDF, faça o download ou abra em uma nova aba.
          </p>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Baixar PDF
          </Button>
        </div>
      )
    }

    if (isOfficeDoc) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-muted/20 rounded-lg">
          <FileText className="h-16 w-16 text-blue-500 mb-4" />
          <h3 className="text-lg font-medium mb-2">Documento do Office</h3>
          <p className="text-muted-foreground text-center mb-4">
            Para visualizar este documento, faça o download.
          </p>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Baixar Documento
          </Button>
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-muted/20 rounded-lg">
        <div className="text-4xl mb-4">
          {getIconeParaTipo(documento.arquivo.tipo)}
        </div>
        <h3 className="text-lg font-medium mb-2">Preview não disponível</h3>
        <p className="text-muted-foreground text-center mb-4">
          Este tipo de arquivo não pode ser visualizado no navegador.
        </p>
        <Button variant="outline" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Baixar Arquivo
        </Button>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">
                {getIconeParaTipo(documento.arquivo.tipo)}
              </div>
              <div>
                <DialogTitle className="text-lg">{documento.nome}</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {documento.arquivo.nome}
                </p>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={`${statusDocumentoColors[documento.status]}`}
            >
              {statusDocumentoLabels[documento.status]}
            </Badge>
          </div>
        </DialogHeader>

        {/* Barra de ferramentas */}
        {isImage && (
          <div className="flex items-center justify-center space-x-2 py-2 border-y bg-muted/20">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-16 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              disabled={zoom >= 3}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRotate}
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Área de preview */}
        <div className="flex-1 overflow-hidden">
          {renderPreview()}
        </div>

        {/* Informações do documento */}
        <div className="flex-shrink-0 mt-4 space-y-4">
          <Separator />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="space-y-1">
              <div className="flex items-center space-x-1 text-muted-foreground">
                <Hash className="h-3 w-3" />
                <span>Categoria</span>
              </div>
              <p className="font-medium">
                {categoriaDocumentoLabels[documento.categoria]}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-1 text-muted-foreground">
                <File className="h-3 w-3" />
                <span>Tamanho</span>
              </div>
              <p className="font-medium">
                {formatarTamanhoArquivo(documento.arquivo.tamanho)}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-1 text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Data Upload</span>
              </div>
              <p className="font-medium">
                {new Date(documento.dataUpload).toLocaleDateString('pt-BR')}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-1 text-muted-foreground">
                <User className="h-3 w-3" />
                <span>Responsável</span>
              </div>
              <p className="font-medium">
                {documento.advogadoResponsavel}
              </p>
            </div>
          </div>

          {documento.observacoes && (
            <div className="space-y-2">
              <div className="flex items-center space-x-1 text-muted-foreground">
                <FileText className="h-3 w-3" />
                <span className="text-sm">Observações</span>
              </div>
              <p className="text-sm bg-muted/50 p-3 rounded-md">
                {documento.observacoes}
              </p>
            </div>
          )}

          {documento.tags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-1 text-muted-foreground">
                <Tag className="h-3 w-3" />
                <span className="text-sm">Tags</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {documento.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2">
              {documento.obrigatorio && (
                <Badge variant="destructive" className="text-xs">
                  Obrigatório
                </Badge>
              )}
              {documento.prazoVencimento && (
                <Badge variant="outline" className="text-xs">
                  Vence em: {new Date(documento.prazoVencimento).toLocaleDateString('pt-BR')}
                </Badge>
              )}
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                <X className="h-4 w-4 mr-2" />
                Fechar
              </Button>
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 