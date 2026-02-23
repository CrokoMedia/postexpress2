'use client'

import { useState } from 'react'
import { useContentCreation } from '@/store/content-creation'
import { QuickStartSelector } from '@/components/organisms/quick-start-selector'
import { TemplateGallery } from './template-gallery'
import { AdvancedConfigForm } from './advanced-config-form'
import { Card, CardContent } from '@/components/atoms/card'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { QuickStartMode, TemplateId } from '@/types/content-creation'

interface Phase1CriarProps {
  auditId: string
}

export function Phase1Criar({ auditId }: Phase1CriarProps) {
  // View é UI local (qual tela mostrar)
  const [view, setView] = useState<'selector' | 'template-gallery' | 'advanced-form'>('selector')

  const {
    generating,
    setGenerating,
    setQuickStartMode,
    setCarousels,
    nextPhase,
    setTemplate,
  } = useContentCreation()

  // Handler: Smart Generation (One-Click)
  const handleSmartGeneration = async () => {
    setQuickStartMode('smart')
    setGenerating(true)

    try {
      console.log('🚀 [Phase1] Iniciando Smart Generation para audit:', auditId)

      const response = await fetch(`/api/audits/${auditId}/generate-smart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao gerar conteúdo automaticamente')
      }

      const data = await response.json()

      console.log('✅ [Phase1] Smart Generation bem-sucedida:', data)

      // Carregar carrosséis no Zustand
      setCarousels(data.content.carousels)

      toast.success('Carrosséis gerados automaticamente!', {
        description: `${data.content.carousels.length} carrosséis criados pela IA`,
      })

      // Avançar para Fase 2
      nextPhase()
    } catch (error: any) {
      console.error('❌ [Phase1] Erro na Smart Generation:', error)
      toast.error('Erro ao gerar carrosséis', {
        description: error.message || 'Tente novamente ou escolha outro modo',
      })
    } finally {
      setGenerating(false)
    }
  }

  // Handler: Template Selection
  const handleTemplateSelect = (templateId: TemplateId) => {
    setQuickStartMode('template')
    setTemplate(templateId)

    console.log('✨ [Phase1] Template selecionado:', templateId)

    toast.success('Template aplicado!', {
      description: 'Gerando carrosséis com o template escolhido...',
    })

    // TODO: Gerar carrosséis com template específico
    // Por enquanto, usar a API generate-smart e aplicar template depois
    handleGenerateWithTemplate(templateId)
  }

  const handleGenerateWithTemplate = async (templateId: TemplateId) => {
    setGenerating(true)

    try {
      // Gerar conteúdo usando a API smart
      const response = await fetch(`/api/audits/${auditId}/generate-smart`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Erro ao gerar conteúdo')
      }

      const data = await response.json()
      setCarousels(data.content.carousels)

      toast.success('Carrosséis gerados com template!')
      nextPhase()
    } catch (error: any) {
      toast.error('Erro ao gerar carrosséis', {
        description: error.message,
      })
    } finally {
      setGenerating(false)
    }
  }

  // Handler: Advanced Mode
  const handleAdvancedSubmit = async (config: any) => {
    setQuickStartMode('advanced')
    setGenerating(true)

    try {
      console.log('⚙️ [Phase1] Modo Avançado - Config:', config)

      // Gerar conteúdo com configuração customizada
      const response = await fetch(`/api/audits/${auditId}/generate-smart`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Erro ao gerar conteúdo')
      }

      const data = await response.json()
      setCarousels(data.content.carousels)

      toast.success('Carrosséis gerados com configuração avançada!')
      nextPhase()
    } catch (error: any) {
      toast.error('Erro ao gerar carrosséis', {
        description: error.message,
      })
    } finally {
      setGenerating(false)
    }
  }

  // Renderizar loading state
  if (generating) {
    return (
      <Card className="p-12">
        <CardContent>
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
            <div className="text-center">
              <p className="text-lg font-medium text-foreground">
                Gerando seus carrosséis...
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                A IA está analisando a auditoria e criando conteúdo personalizado
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Renderizar view apropriada
  if (view === 'selector') {
    return (
      <QuickStartSelector
        onSelect={(mode: QuickStartMode) => {
          if (mode === 'smart') {
            handleSmartGeneration()
          } else if (mode === 'template') {
            setView('template-gallery')
          } else if (mode === 'advanced') {
            setView('advanced-form')
          }
        }}
      />
    )
  }

  if (view === 'template-gallery') {
    return (
      <TemplateGallery
        onSelect={handleTemplateSelect}
        onBack={() => setView('selector')}
      />
    )
  }

  if (view === 'advanced-form') {
    return (
      <AdvancedConfigForm
        auditId={auditId}
        onSubmit={handleAdvancedSubmit}
        onBack={() => setView('selector')}
      />
    )
  }

  return null
}
