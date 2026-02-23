'use client'

import * as React from 'react'
import { Card } from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { cn } from '@/lib/utils'
import { Sparkles, X, Upload, Copy, RotateCcw, Zap } from 'lucide-react'
import type { SlideImageConfig } from '@/types/content-creation'

export interface BulkActionsPanelProps {
  carouselIndex: number
  totalSlides: number
  onApplyToAll: (action: SlideImageConfig['mode'], data?: Partial<SlideImageConfig>) => void
  onCopyFrom?: (sourceCarouselIndex: number) => void
  onReset?: () => void
  availableCarousels?: number[]
  className?: string
  compact?: boolean
}

export function BulkActionsPanel({
  carouselIndex,
  totalSlides,
  onApplyToAll,
  onCopyFrom,
  onReset,
  availableCarousels = [],
  className,
  compact = false,
}: BulkActionsPanelProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [showCopyMenu, setShowCopyMenu] = React.useState(false)

  const handleApplyAll = (mode: SlideImageConfig['mode']) => {
    onApplyToAll(mode)

    // Feedback visual
    const message = {
      auto: 'IA aplicada em todos os slides',
      no_image: 'Sem imagem aplicado em todos os slides',
      upload: 'Upload selecionado para todos os slides',
      custom_prompt: 'Prompt customizado habilitado para todos',
    }[mode]

    // TODO: Integrar com toast/notification system
    console.log(message)
  }

  const handleCopyFrom = (sourceIndex: number) => {
    if (onCopyFrom) {
      onCopyFrom(sourceIndex)
      setShowCopyMenu(false)
      // TODO: Toast feedback
      console.log(`Configurações copiadas do carrossel ${sourceIndex + 1}`)
    }
  }

  const handleReset = () => {
    if (onReset) {
      onReset()
      // TODO: Toast feedback
      console.log('Configurações resetadas para padrão')
    }
  }

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-label="Ações em massa"
        >
          <Zap className="h-4 w-4" aria-hidden="true" />
          Ações em Massa
        </Button>

        {isExpanded && (
          <div className="flex items-center gap-2 animate-slideIn">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleApplyAll('auto')}
              aria-label="Aplicar IA em todos os slides"
            >
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              IA em todos
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleApplyAll('no_image')}
              aria-label="Remover imagens de todos os slides"
            >
              <X className="h-3 w-3" aria-hidden="true" />
              Sem imagem
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card
      className={cn('p-4', className)}
      role="region"
      aria-label="Painel de ações em massa"
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Zap
            className="h-5 w-5 text-warning-600 dark:text-warning-400"
            aria-hidden="true"
          />
          <h3 className="text-sm font-semibold text-foreground">
            Ações em Massa
          </h3>
          <span className="text-xs text-muted-foreground">
            ({totalSlides} slides)
          </span>
        </div>

        {/* Actions grid */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleApplyAll('auto')}
            className="justify-start"
            aria-label={`Aplicar IA automaticamente em todos os ${totalSlides} slides`}
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            <span className="flex-1 text-left">IA em todos</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleApplyAll('no_image')}
            className="justify-start"
            aria-label={`Remover imagens de todos os ${totalSlides} slides`}
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span className="flex-1 text-left">Sem imagem</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleApplyAll('upload')}
            className="justify-start"
            aria-label={`Habilitar upload para todos os ${totalSlides} slides`}
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            <span className="flex-1 text-left">Upload mesma</span>
          </Button>

          {onCopyFrom && availableCarousels.length > 0 && (
            <div className="relative">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowCopyMenu(!showCopyMenu)}
                className="w-full justify-start"
                aria-expanded={showCopyMenu}
                aria-haspopup="menu"
                aria-label="Copiar configurações de outro carrossel"
              >
                <Copy className="h-4 w-4" aria-hidden="true" />
                <span className="flex-1 text-left">Copiar de...</span>
              </Button>

              {/* Dropdown menu */}
              {showCopyMenu && (
                <Card
                  className="absolute z-10 mt-1 w-48 p-2 shadow-lg"
                  role="menu"
                  aria-label="Escolher carrossel de origem"
                >
                  <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
                    Copiar configurações de:
                  </div>
                  {availableCarousels
                    .filter((idx) => idx !== carouselIndex)
                    .map((idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleCopyFrom(idx)}
                        className={cn(
                          'w-full px-3 py-2 text-left text-sm rounded-button',
                          'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                          'transition-colors duration-200'
                        )}
                        role="menuitem"
                        aria-label={`Copiar configurações do carrossel ${idx + 1}`}
                      >
                        Carrossel {idx + 1}
                      </button>
                    ))}
                </Card>
              )}
            </div>
          )}

          {onReset && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleReset}
              className="justify-start"
              aria-label="Resetar todas as configurações para o padrão"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span className="flex-1 text-left">Resetar tudo</span>
            </Button>
          )}
        </div>

        {/* Help text */}
        <div
          className="text-xs text-muted-foreground bg-info-50 dark:bg-info-900/20 rounded-button px-3 py-2 border border-info-200 dark:border-info-800"
          role="note"
        >
          💡 <strong>Dica:</strong> Use "IA em todos" para acelerar se estiver satisfeito com a estratégia automática.
          Você pode ajustar slides individuais depois.
        </div>
      </div>
    </Card>
  )
}
