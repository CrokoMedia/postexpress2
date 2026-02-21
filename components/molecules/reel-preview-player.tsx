'use client'

import React, { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { Eye, EyeOff, Monitor, Smartphone } from 'lucide-react'
import { Button } from '@/components/atoms/button'

// Importação dinâmica do Player para evitar problemas de SSR
const PlayerWrapper = dynamic(() => import('./reel-player-inner'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center bg-neutral-900 rounded-xl border border-neutral-700 aspect-[4/5]">
      <div className="text-center text-neutral-500">
        <div className="w-8 h-8 border-2 border-neutral-600 border-t-primary-500 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Carregando player...</p>
      </div>
    </div>
  ),
})

// Dados de um slide para o player
interface PreviewSlide {
  title: string
  body?: string
  imageUrl?: string
  slideNumber: number
  totalSlides: number
}

export interface ReelPreviewPlayerProps {
  slides: PreviewSlide[]
  profileName?: string
  profileUsername?: string
  profileImageUrl?: string
  templateId?: string
  format?: 'feed' | 'story' | 'square'
  autoPlay?: boolean
  loop?: boolean
  className?: string
}

// Dimensões base por formato (resolução de composição Remotion)
const FORMAT_DIMENSIONS: Record<string, { width: number; height: number }> = {
  feed: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
  square: { width: 1080, height: 1080 },
}

// Constantes de timing (mesmas do remotion/types.ts defaults)
const DEFAULT_FPS = 30
const DEFAULT_DURATION_PER_SLIDE_FRAMES = 90 // 3 segundos a 30fps
const DEFAULT_TRANSITION_FRAMES = 20 // ~0.67s

export function ReelPreviewPlayer({
  slides,
  profileName,
  profileUsername,
  profileImageUrl,
  templateId = 'minimalist',
  format = 'feed',
  autoPlay = false,
  loop = true,
  className = '',
}: ReelPreviewPlayerProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [previewScale, setPreviewScale] = useState<'desktop' | 'mobile'>('desktop')

  // Calcular dimensões da composição baseado no formato
  const dimensions = FORMAT_DIMENSIONS[format] || FORMAT_DIMENSIONS.feed

  // Converter slides para o formato esperado pelo CarouselReel
  const remotionSlides = useMemo(
    () =>
      slides.map((s) => ({
        titulo: s.title,
        corpo: s.body || '',
        contentImageUrl: s.imageUrl || '',
        slideNumber: s.slideNumber,
        totalSlides: s.totalSlides,
      })),
    [slides]
  )

  // Calcular duração total em frames (mesma fórmula do remotion/index.tsx)
  const durationInFrames = useMemo(() => {
    const count = remotionSlides.length
    if (count === 0) return DEFAULT_FPS // mínimo 1 segundo
    const total =
      count * DEFAULT_DURATION_PER_SLIDE_FRAMES -
      (count - 1) * DEFAULT_TRANSITION_FRAMES
    return Math.max(total, DEFAULT_FPS)
  }, [remotionSlides.length])

  // Largura do player para preview (scaled down)
  const previewWidth = previewScale === 'desktop' ? 360 : 280

  // Se não há slides, exibir estado vazio
  if (slides.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center bg-neutral-900 rounded-xl border border-dashed border-neutral-700 aspect-[4/5] max-w-[360px]">
          <div className="text-center p-6">
            <Monitor className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
            <p className="text-sm text-neutral-500 font-medium">
              Preview do Reel
            </p>
            <p className="text-xs text-neutral-600 mt-1">
              Aprove um carrossel para ver o preview animado
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Controles do Player */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
          <Monitor className="w-4 h-4" />
          Preview Animado
        </h3>
        <div className="flex items-center gap-2">
          {/* Toggle de escala */}
          <div className="flex rounded-lg overflow-hidden border border-neutral-700">
            <button
              onClick={() => setPreviewScale('desktop')}
              className={`p-1.5 transition-colors ${
                previewScale === 'desktop'
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
              title="Tamanho desktop"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPreviewScale('mobile')}
              className={`p-1.5 transition-colors ${
                previewScale === 'mobile'
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
              title="Tamanho mobile"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Toggle de visibilidade */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(!isVisible)}
            className="text-xs text-neutral-400 hover:text-neutral-200"
          >
            {isVisible ? (
              <>
                <EyeOff className="w-3.5 h-3.5 mr-1" />
                Ocultar
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 mr-1" />
                Mostrar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Player */}
      {isVisible && (
        <div
          className="transition-all duration-300"
          style={{ maxWidth: previewWidth }}
        >
          <PlayerWrapper
            slides={remotionSlides}
            profilePicUrl={profileImageUrl || ''}
            username={profileUsername || 'preview'}
            fullName={profileName || ''}
            templateId={templateId}
            format={format}
            fps={DEFAULT_FPS}
            durationPerSlideFrames={DEFAULT_DURATION_PER_SLIDE_FRAMES}
            transitionFrames={DEFAULT_TRANSITION_FRAMES}
            compositionWidth={dimensions.width}
            compositionHeight={dimensions.height}
            durationInFrames={durationInFrames}
            previewWidth={previewWidth}
            autoPlay={autoPlay}
            loop={loop}
          />

          {/* Info do formato */}
          <div className="flex items-center justify-between mt-2 text-xs text-neutral-500">
            <span>
              {slides.length} slide{slides.length !== 1 ? 's' : ''} |{' '}
              {Math.round(durationInFrames / DEFAULT_FPS)}s
            </span>
            <span>
              {dimensions.width}x{dimensions.height} ({format})
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
