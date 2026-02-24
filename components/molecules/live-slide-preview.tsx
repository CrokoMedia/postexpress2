'use client'

import { useEffect, useRef, useMemo, memo } from 'react'
import { Card } from '@/components/atoms/card'
import { Badge } from '@/components/atoms/badge'
import { cn } from '@/lib/utils'
import { Loader2, AlertCircle } from 'lucide-react'
import { renderSlidePreview, getFormatDimensions } from '@/lib/slide-preview-renderer'
import type { CarouselSlide } from '@/types/database'
import type { TemplateId, LayoutFormat, ThemeMode, SlideImageConfig } from '@/types/content-creation'

export interface LiveSlidePreviewProps {
  slide: CarouselSlide
  slideIndex: number
  template: TemplateId
  format: LayoutFormat
  theme: ThemeMode
  imageConfig: SlideImageConfig
  className?: string
  loading?: boolean
  error?: string | null
  width?: number
  height?: number
}

/**
 * LiveSlidePreview - Preview em tempo real usando Canvas HTML5
 *
 * Performance: <100ms render time
 * Memoizado para evitar re-renders desnecessários
 * Usa Canvas rendering ao invés de CSS para melhor performance
 */
function LiveSlidePreviewComponent({
  slide,
  slideIndex,
  template,
  format,
  theme,
  imageConfig,
  className,
  loading = false,
  error = null,
  width,
  height
}: LiveSlidePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Dimensões do formato
  const dimensions = useMemo(() => getFormatDimensions(format), [format])

  // Aspect ratio classes
  const aspectRatioClass = useMemo(() => {
    const ratios = {
      feed: 'aspect-[4/5]',
      story: 'aspect-[9/16]',
      square: 'aspect-square'
    }
    return ratios[format]
  }, [format])

  // Image URL baseado no config
  const imageUrl = useMemo(() => {
    if (imageConfig.mode === 'no_image') return undefined
    if (imageConfig.mode === 'upload' && imageConfig.uploadUrl) return imageConfig.uploadUrl
    // TODO: Para 'auto' e 'custom_prompt', gerar via fal.ai
    return undefined
  }, [imageConfig])

  // Renderizar canvas quando props mudam
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || loading || error) return

    // Usar requestAnimationFrame para melhor performance
    const rafId = requestAnimationFrame(() => {
      renderSlidePreview({
        canvas,
        slide,
        template,
        format,
        theme,
        imageUrl
      })
    })

    return () => cancelAnimationFrame(rafId)
  }, [slide, template, format, theme, imageUrl, loading, error])

  return (
    <div className={cn('space-y-2', className)}>
      {/* Header com info do slide */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Badge variant="neutral" className="text-xs">
            Slide {slideIndex + 1}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {slide.tipo}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          {format} • {template}
        </div>
      </div>

      {/* Preview Card */}
      <Card
        className={cn('p-4 bg-neutral-100 dark:bg-neutral-900 relative overflow-hidden')}
        role="img"
        aria-label={`Preview do slide ${slideIndex + 1}: ${slide.titulo}`}
      >
        {/* Loading overlay */}
        {loading && (
          <div
            className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 backdrop-blur-sm"
            role="status"
            aria-live="polite"
          >
            <div className="text-center text-white">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" aria-hidden="true" />
              <p className="text-sm font-medium">Gerando preview...</p>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div
            className="absolute inset-0 bg-error-500/90 flex items-center justify-center z-10 backdrop-blur-sm"
            role="alert"
            aria-live="assertive"
          >
            <div className="text-center text-white px-4">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" aria-hidden="true" />
              <p className="text-sm font-medium mb-1">Erro ao gerar preview</p>
              <p className="text-xs opacity-90">{error}</p>
            </div>
          </div>
        )}

        {/* Canvas Preview */}
        <div
          className={cn(
            'w-full rounded-card shadow-lg overflow-hidden bg-neutral-200 dark:bg-neutral-800',
            aspectRatioClass
          )}
        >
          <canvas
            ref={canvasRef}
            width={dimensions.width}
            height={dimensions.height}
            className="w-full h-full"
            style={{
              width: width ? `${width}px` : '100%',
              height: height ? `${height}px` : 'auto',
              imageRendering: 'crisp-edges'
            }}
            aria-hidden="true"
          />
        </div>

        {/* Dimensões e info técnica */}
        <div
          className="mt-2 flex items-center justify-between text-xs text-muted-foreground px-1"
          role="note"
        >
          <span>
            {dimensions.width}x{dimensions.height}px
          </span>
          <span>
            Tema: {theme}
          </span>
          {imageConfig.mode !== 'no_image' && (
            <span>
              Imagem: {imageConfig.mode === 'auto' ? 'Auto' : imageConfig.mode === 'custom_prompt' ? 'Custom' : 'Upload'}
            </span>
          )}
        </div>
      </Card>

      {/* Acessibilidade: descrição textual do slide */}
      <div className="sr-only" aria-live="polite">
        Slide {slideIndex + 1}: {slide.titulo}.
        {slide.corpo && ` Conteúdo: ${slide.corpo}`}
        {imageConfig.mode !== 'no_image' &&
          ` Com imagem ${
            imageConfig.mode === 'auto'
              ? 'gerada automaticamente'
              : imageConfig.mode === 'custom_prompt'
              ? 'customizada'
              : 'via upload'
          }.`}
      </div>
    </div>
  )
}

// Memoizar componente para evitar re-renders desnecessários
// Só re-renderiza se props relevantes mudarem
export const LiveSlidePreview = memo(LiveSlidePreviewComponent, (prevProps, nextProps) => {
  return (
    prevProps.slide.titulo === nextProps.slide.titulo &&
    prevProps.slide.corpo === nextProps.slide.corpo &&
    prevProps.slide.tipo === nextProps.slide.tipo &&
    prevProps.template === nextProps.template &&
    prevProps.format === nextProps.format &&
    prevProps.theme === nextProps.theme &&
    prevProps.imageConfig.mode === nextProps.imageConfig.mode &&
    prevProps.imageConfig.uploadUrl === nextProps.imageConfig.uploadUrl &&
    prevProps.imageConfig.customPrompt === nextProps.imageConfig.customPrompt &&
    prevProps.loading === nextProps.loading &&
    prevProps.error === nextProps.error
  )
})

LiveSlidePreview.displayName = 'LiveSlidePreview'
