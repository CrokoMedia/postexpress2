'use client'

import { useState } from 'react'
import { Button } from '@/components/atoms/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/atoms/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog'
import { Input } from '@/components/atoms/input'
import {
  Wand2,
  ImageOff,
  Upload,
  Pencil,
  Copy,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import type { SlideImageConfig } from '@/types/content-creation'

type BulkActionType = 'auto' | 'no_image' | 'custom_prompt' | 'upload' | 'copy_from'

interface BulkActionsPanelProps {
  carouselIndex: number
  totalSlides: number
  totalCarousels: number
  onApplyBulkAction: (carouselIndex: number, action: BulkActionType, data?: any) => Promise<void>
}

export function BulkActionsPanel({
  carouselIndex,
  totalSlides,
  totalCarousels,
  onApplyBulkAction,
}: BulkActionsPanelProps) {
  const [confirmingAction, setConfirmingAction] = useState<BulkActionType | null>(null)
  const [applying, setApplying] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')
  const [sourceCarouselIndex, setSourceCarouselIndex] = useState<number>(0)
  const [uploadFile, setUploadFile] = useState<File | null>(null)

  const handleActionClick = (action: BulkActionType) => {
    setConfirmingAction(action)
  }

  const handleConfirm = async () => {
    if (!confirmingAction) return

    setApplying(true)
    try {
      let data: any = undefined

      switch (confirmingAction) {
        case 'custom_prompt':
          if (!customPrompt.trim()) {
            alert('Digite um prompt personalizado')
            setApplying(false)
            return
          }
          data = { customPrompt }
          break
        case 'copy_from':
          data = { sourceCarouselIndex }
          break
        case 'upload':
          if (!uploadFile) {
            alert('Selecione uma imagem')
            setApplying(false)
            return
          }
          data = { file: uploadFile }
          break
      }

      await onApplyBulkAction(carouselIndex, confirmingAction, data)

      // Reset and close
      setConfirmingAction(null)
      setCustomPrompt('')
      setSourceCarouselIndex(0)
      setUploadFile(null)
    } catch (error: any) {
      console.error('Erro ao aplicar ação em massa:', error)
      alert(`Erro: ${error.message}`)
    } finally {
      setApplying(false)
    }
  }

  const handleCancel = () => {
    setConfirmingAction(null)
    setCustomPrompt('')
    setSourceCarouselIndex(0)
    setUploadFile(null)
  }

  const getActionTitle = (action: BulkActionType): string => {
    switch (action) {
      case 'auto':
        return 'IA Automática em Todos os Slides'
      case 'no_image':
        return 'Sem Imagem em Todos os Slides'
      case 'custom_prompt':
        return 'Prompt Personalizado em Todos'
      case 'upload':
        return 'Upload de Imagem em Todos'
      case 'copy_from':
        return 'Copiar Configuração de Outro Carrossel'
      default:
        return ''
    }
  }

  const getActionDescription = (action: BulkActionType): string => {
    switch (action) {
      case 'auto':
        return `Você está prestes a configurar TODOS os ${totalSlides} slides deste carrossel para usar geração automática de imagens via IA. A IA decidirá a melhor imagem para cada slide baseada no conteúdo.`
      case 'no_image':
        return `Você está prestes a configurar TODOS os ${totalSlides} slides deste carrossel para NÃO ter imagem. Os slides serão apenas texto.`
      case 'custom_prompt':
        return `Digite um prompt personalizado que será usado para gerar imagens em TODOS os ${totalSlides} slides deste carrossel.`
      case 'upload':
        return `Selecione uma imagem que será usada em TODOS os ${totalSlides} slides deste carrossel.`
      case 'copy_from':
        return `Escolha um carrossel para copiar as configurações de imagem de todos os slides.`
      default:
        return ''
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Ações em Massa</CardTitle>
          <CardDescription>
            Aplique configurações em todos os {totalSlides} slides de uma vez
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleActionClick('auto')}
            disabled={applying}
            className="gap-2"
          >
            <Wand2 className="w-4 h-4" />
            IA em Todos
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleActionClick('no_image')}
            disabled={applying}
            className="gap-2"
          >
            <ImageOff className="w-4 h-4" />
            Sem Imagem
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleActionClick('custom_prompt')}
            disabled={applying}
            className="gap-2"
          >
            <Pencil className="w-4 h-4" />
            Prompt Custom
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleActionClick('upload')}
            disabled={applying}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload em Todos
          </Button>

          {totalCarousels > 1 && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleActionClick('copy_from')}
              disabled={applying}
              className="gap-2"
            >
              <Copy className="w-4 h-4" />
              Copiar de Outro
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmingAction} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmingAction && getActionTitle(confirmingAction)}</DialogTitle>
            <DialogDescription>
              {confirmingAction && getActionDescription(confirmingAction)}
            </DialogDescription>
          </DialogHeader>

          {/* Custom fields based on action */}
          <div className="py-4">
            {confirmingAction === 'custom_prompt' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Prompt Personalizado</label>
                <Input
                  placeholder="Ex: Uma imagem minimalista com fundo azul..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  disabled={applying}
                />
                <p className="text-xs text-neutral-500">
                  Este prompt será usado para gerar imagens em todos os slides
                </p>
              </div>
            )}

            {confirmingAction === 'copy_from' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Carrossel de Origem</label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={sourceCarouselIndex}
                  onChange={(e) => setSourceCarouselIndex(Number(e.target.value))}
                  disabled={applying}
                >
                  {Array.from({ length: totalCarousels }, (_, i) => i).map((i) =>
                    i !== carouselIndex ? (
                      <option key={i} value={i}>
                        Carrossel {i + 1}
                      </option>
                    ) : null
                  )}
                </select>
                <p className="text-xs text-neutral-500">
                  As configurações de imagem serão copiadas slide por slide
                </p>
              </div>
            )}

            {confirmingAction === 'upload' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Selecionar Imagem</label>
                <Input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  disabled={applying}
                />
                <p className="text-xs text-neutral-500">
                  A mesma imagem será usada em todos os slides
                </p>
              </div>
            )}

            {(confirmingAction === 'auto' || confirmingAction === 'no_image') && (
              <div className="flex items-start gap-2 p-3 bg-warning-50 dark:bg-warning-950/20 rounded-lg border border-warning-200 dark:border-warning-800">
                <AlertTriangle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-warning-800 dark:text-warning-200">
                  Esta ação irá substituir TODAS as configurações individuais dos slides.
                  Esta ação não pode ser desfeita.
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={handleCancel} disabled={applying}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm} disabled={applying}>
              {applying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Aplicando...
                </>
              ) : (
                `Aplicar em ${totalSlides} Slides`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
