'use client'

import { useEffect, useState, useCallback } from 'react'
import { useContentCreation } from '@/store/content-creation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { Badge } from '@/components/atoms/badge'
import { SplitPreviewEditor } from '@/components/organisms/split-preview-editor'
import { BulkActionsPanel } from '@/components/molecules/bulk-actions-panel'
import { Sparkles, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import type { CarouselSlide } from '@/types/database'
import type { SlideImageConfig } from '@/types/content-creation'

interface Phase2RefinarProps {
  auditId: string
}

export function Phase2Refinar({ auditId }: Phase2RefinarProps) {
  const {
    carousels,
    currentCarouselIndex,
    slideImageConfigs,
    approvedCarousels,
    selectedTemplate,
    selectedFormat,
    selectedTheme,
    setCurrentCarouselIndex,
    updateSlideImageConfig,
    updateCarousel,
    approveCarousel,
    rejectCarousel,
    nextPhase,
    setCarousels,
  } = useContentCreation()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar carrosséis da API se ainda não existirem
  useEffect(() => {
    const loadCarousels = async () => {
      if (carousels.length > 0) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await fetch(`/api/audits/${auditId}/content`)

        if (!response.ok) {
          throw new Error('Erro ao carregar conteúdo')
        }

        const data = await response.json()

        if (data.content?.carousels && data.content.carousels.length > 0) {
          setCarousels(data.content.carousels)
        } else {
          setError('Nenhum carrossel encontrado. Volte para a Fase 1 para gerar conteúdo.')
        }
      } catch (err: any) {
        console.error('Erro ao carregar carrosséis:', err)
        setError(err.message || 'Erro ao carregar carrosséis')
      } finally {
        setLoading(false)
      }
    }

    loadCarousels()
  }, [auditId, carousels.length, setCarousels])

  // Handlers
  const handleNavigate = useCallback((direction: 'prev' | 'next') => {
    if (direction === 'next' && currentCarouselIndex < carousels.length - 1) {
      setCurrentCarouselIndex(currentCarouselIndex + 1)
    } else if (direction === 'prev' && currentCarouselIndex > 0) {
      setCurrentCarouselIndex(currentCarouselIndex - 1)
    }
  }, [currentCarouselIndex, carousels.length, setCurrentCarouselIndex])

  const handleGoToCarousel = useCallback((index: number) => {
    setCurrentCarouselIndex(index)
  }, [setCurrentCarouselIndex])

  const handleEditSlide = useCallback((
    carouselIndex: number,
    slideIndex: number,
    changes: Partial<CarouselSlide>
  ) => {
    const carousel = carousels[carouselIndex]
    const updatedSlides = [...carousel.slides]
    updatedSlides[slideIndex] = {
      ...updatedSlides[slideIndex],
      ...changes,
    }

    updateCarousel(carouselIndex, { slides: updatedSlides })
  }, [carousels, updateCarousel])

  const handleUpdateImageConfig = useCallback((
    carouselIndex: number,
    slideIndex: number,
    config: SlideImageConfig
  ) => {
    updateSlideImageConfig(carouselIndex, slideIndex, config)
  }, [updateSlideImageConfig])

  const handleApplyBulkAction = useCallback((
    mode: SlideImageConfig['mode'],
    data?: Partial<SlideImageConfig>
  ) => {
    const carousel = carousels[currentCarouselIndex]

    // Aplicar a config em todos os slides do carrossel atual
    carousel.slides.forEach((_, slideIndex) => {
      updateSlideImageConfig(currentCarouselIndex, slideIndex, {
        mode,
        ...data,
      })
    })
  }, [carousels, currentCarouselIndex, updateSlideImageConfig])

  const handleCopyFrom = useCallback((sourceCarouselIndex: number) => {
    const sourceConfigs = slideImageConfigs.get(sourceCarouselIndex)
    if (!sourceConfigs) return

    const targetCarousel = carousels[currentCarouselIndex]

    // Copiar config slide por slide
    targetCarousel.slides.forEach((_, slideIndex) => {
      const sourceConfig = sourceConfigs.get(slideIndex)
      if (sourceConfig) {
        updateSlideImageConfig(currentCarouselIndex, slideIndex, sourceConfig)
      }
    })
  }, [slideImageConfigs, carousels, currentCarouselIndex, updateSlideImageConfig])

  const handleApprove = useCallback(
    async (index: number) => {
      await approveCarousel(auditId, index)
    },
    [auditId, approveCarousel]
  )

  const handleReject = useCallback(
    async (index: number) => {
      await rejectCarousel(auditId, index)
    },
    [auditId, rejectCarousel]
  )

  const handleGenerateSlides = useCallback(async () => {
    // Navegar para Fase 3 (Exportar)
    nextPhase()
  }, [nextPhase])

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary-600 animate-spin" />
          <h3 className="text-xl font-semibold mb-2">Carregando carrosséis...</h3>
          <p className="text-muted-foreground">
            Buscando conteúdo gerado
          </p>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card className="border-error-500">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-error-500" />
            <CardTitle>Erro ao Carregar Conteúdo</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (carousels.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="p-12 text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-neutral-500" />
          <h3 className="text-xl font-semibold mb-2">Nenhum carrossel gerado ainda</h3>
          <p className="text-neutral-400 mb-6">
            Volte para a Fase 1 para gerar carrosséis
          </p>
        </CardContent>
      </Card>
    )
  }

  const approvedCount = approvedCarousels.size
  const totalCount = carousels.length

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Refinar Carrosséis</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Aprove, edite e configure imagens para cada carrossel
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-foreground">
                  {approvedCount} / {totalCount}
                </div>
                <div className="text-xs text-muted-foreground">
                  Carrosséis aprovados
                </div>
              </div>
              {approvedCount > 0 && (
                <Button
                  onClick={handleGenerateSlides}
                  size="lg"
                  className="gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Gerar Slides ({approvedCount})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Bulk Actions Panel */}
      {carousels.length > 0 && (
        <BulkActionsPanel
          carouselIndex={currentCarouselIndex}
          totalSlides={carousels[currentCarouselIndex]?.slides.length || 0}
          onApplyToAll={handleApplyBulkAction}
          onCopyFrom={carousels.length > 1 ? handleCopyFrom : undefined}
          availableCarousels={Array.from({ length: carousels.length }, (_, i) => i)}
        />
      )}

      {/* Split Preview Editor */}
      <div className="bg-white dark:bg-neutral-950 rounded-lg border shadow-sm overflow-hidden">
        <SplitPreviewEditor
          auditId={auditId}
          carousels={carousels}
          currentIndex={currentCarouselIndex}
          template={selectedTemplate || 'minimalist'}
          format={selectedFormat}
          theme={selectedTheme}
          slideImageConfigs={slideImageConfigs}
          approvedCarousels={approvedCarousels}
          onNavigate={handleNavigate}
          onGoToCarousel={handleGoToCarousel}
          onApprove={handleApprove}
          onReject={handleReject}
          onEdit={handleEditSlide}
          onUpdateImageConfig={handleUpdateImageConfig}
          onApplyBulkAction={handleApplyBulkAction}
        />
      </div>

      {/* Bottom CTA */}
      {approvedCount > 0 && (
        <Card className="bg-gradient-to-r from-primary-50 via-primary-500/5 to-primary-500/10 border-primary-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-success-600" />
              <h3 className="text-lg font-semibold">
                {approvedCount} carrossel{approvedCount !== 1 ? 'éis' : ''} aprovado{approvedCount !== 1 ? 's' : ''}!
              </h3>
            </div>
            <p className="text-neutral-600 text-sm mb-4">
              Prossiga para a Fase 3 para gerar os slides visuais finais
            </p>
            <Button
              onClick={handleGenerateSlides}
              size="lg"
              className="gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Ir para Fase 3 - Exportar
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
