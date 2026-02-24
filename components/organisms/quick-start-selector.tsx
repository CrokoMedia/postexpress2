'use client'

import * as React from 'react'
import { Card } from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { Badge } from '@/components/atoms/badge'
import { cn } from '@/lib/utils'
import { Sparkles, LayoutTemplate, Settings, Clock, CheckCircle2 } from 'lucide-react'
import type { QuickStartMode, QuickStartOption } from '@/types/content-creation'

export interface QuickStartSelectorProps {
  onSelect: (mode: QuickStartMode) => void
  className?: string
}

const quickStartOptions: QuickStartOption[] = [
  {
    id: 'smart',
    title: 'One-Click Smart',
    description: 'IA decide tudo (template, tema, imagens)',
    estimatedTime: '30 segundos',
    features: [
      'Template visual ideal',
      'Formato otimizado (feed/story/square)',
      'Tema de cores automático',
      'Estratégia de imagens inteligente',
    ],
    recommended: true,
  },
  {
    id: 'template',
    title: 'Templates Rápidos',
    description: 'Presets otimizados por objetivo',
    estimatedTime: '1 minuto',
    features: [
      'Educacional (Texto + Ícones)',
      'Vendas (Visual impactante)',
      'Autoridade (Minimalista)',
      'Viral (Cores vibrantes)',
    ],
  },
  {
    id: 'advanced',
    title: 'Modo Avançado',
    description: 'Controle total sobre cada detalhe',
    estimatedTime: '3-5 minutos',
    features: [
      'Escolher template visual',
      'Definir formato e tema',
      'Configurar estratégia de imagens',
      'Personalizar cada aspecto',
    ],
  },
]

const getIcon = (mode: QuickStartMode) => {
  switch (mode) {
    case 'smart':
      return Sparkles
    case 'template':
      return LayoutTemplate
    case 'advanced':
      return Settings
  }
}

export function QuickStartSelector({ onSelect, className }: QuickStartSelectorProps) {
  const [selectedMode, setSelectedMode] = React.useState<QuickStartMode | null>(null)
  const [focusedIndex, setFocusedIndex] = React.useState<number>(0)

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setFocusedIndex((prev) => (prev + 1) % quickStartOptions.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setFocusedIndex((prev) => (prev - 1 + quickStartOptions.length) % quickStartOptions.length)
      } else if (e.key === 'Enter' && focusedIndex !== null) {
        e.preventDefault()
        handleSelect(quickStartOptions[focusedIndex].id)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [focusedIndex])

  const handleSelect = (mode: QuickStartMode) => {
    setSelectedMode(mode)
    onSelect(mode)
  }

  return (
    <div
      className={cn('w-full max-w-4xl mx-auto space-y-6', className)}
      role="radiogroup"
      aria-label="Escolha como criar carrosséis"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Criar Carrosséis
        </h1>
        <p className="text-lg text-muted-foreground">
          Escolha como você quer começar
        </p>
      </div>

      {/* Options Grid */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        {quickStartOptions.map((option, index) => {
          const Icon = getIcon(option.id)
          const isSelected = selectedMode === option.id
          const isFocused = focusedIndex === index

          return (
            <Card
              key={option.id}
              className={cn(
                'relative p-6 cursor-pointer transition-all duration-400 group',
                'hover:shadow-hover hover:scale-[1.02]',
                'focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2',
                isSelected && 'ring-2 ring-primary-500 shadow-hover',
                isFocused && 'ring-2 ring-primary-400',
                option.recommended && 'border-2 border-primary-500'
              )}
              onClick={() => handleSelect(option.id)}
              role="radio"
              aria-checked={isSelected}
              tabIndex={isFocused ? 0 : -1}
              onFocus={() => setFocusedIndex(index)}
            >
              {/* Recommended badge */}
              {option.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="primary" className="shadow-sm">
                    <Sparkles className="h-3 w-3" aria-hidden="true" />
                    RECOMENDADO
                  </Badge>
                </div>
              )}

              {/* Header with icon */}
              <div className="flex items-start gap-4 mb-4">
                <div
                  className={cn(
                    'p-3 rounded-button transition-colors duration-400',
                    isSelected
                      ? 'bg-primary-500 text-white'
                      : 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30'
                  )}
                  aria-hidden="true"
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {option.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              </div>

              {/* Time estimate */}
              <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" aria-hidden="true" />
                <span>Pronto em {option.estimatedTime}</span>
              </div>

              {/* Features list */}
              <ul className="space-y-2 mb-6" aria-label={`Recursos do modo ${option.title}`}>
                {option.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle2
                      className="h-4 w-4 shrink-0 mt-0.5 text-success-600 dark:text-success-400"
                      aria-hidden="true"
                    />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Action button */}
              <Button
                variant={isSelected ? 'primary' : 'secondary'}
                size="md"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation()
                  handleSelect(option.id)
                }}
                aria-label={`Selecionar modo ${option.title}`}
              >
                {isSelected ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Selecionado
                  </>
                ) : (
                  <>
                    {option.id === 'smart' ? '🚀 Gerar Automaticamente' : '✨ Usar Este Modo'}
                  </>
                )}
              </Button>
            </Card>
          )
        })}
      </div>

      {/* Help tip */}
      <Card className="p-4 bg-info-50 dark:bg-info-900/20 border-info-200 dark:border-info-800">
        <div className="flex items-start gap-3">
          <div
            className="p-2 rounded-button bg-info-100 dark:bg-info-900/40 text-info-600 dark:text-info-400 shrink-0"
            aria-hidden="true"
          >
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-info-900 dark:text-info-100 mb-1">
              💡 Dica: Primeira vez?
            </p>
            <p className="text-sm text-info-700 dark:text-info-300">
              Use <strong>One-Click Smart</strong> para gerar carrosséis automaticamente.
              A IA vai decidir template, formato, tema e imagens. Depois você pode ajustar o que quiser!
            </p>
          </div>
        </div>
      </Card>

      {/* Keyboard shortcuts hint */}
      <div
        className="text-center text-xs text-muted-foreground"
        role="note"
        aria-label="Atalhos de teclado disponíveis"
      >
        <kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded border border-neutral-300 dark:border-neutral-700">
          ↑↓
        </kbd>
        {' '}para navegar •{' '}
        <kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded border border-neutral-300 dark:border-neutral-700">
          Enter
        </kbd>
        {' '}para selecionar
      </div>
    </div>
  )
}
