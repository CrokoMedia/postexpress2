'use client'

/**
 * Componente interno do Player Remotion.
 * Separado para importação dinâmica (ssr: false) — evita erros
 * de SSR com dependências client-only do Remotion.
 */

import React from 'react'
import { Player } from '@remotion/player'
import { CarouselReel } from '@/remotion/compositions/CarouselReel'
import type { CarouselReelProps, SlideProps, LayoutFormat } from '@/remotion/types'

interface ReelPlayerInnerProps {
  slides: SlideProps[]
  profilePicUrl: string
  username: string
  fullName: string
  templateId: string
  format: LayoutFormat
  fps: number
  durationPerSlideFrames: number
  transitionFrames: number
  compositionWidth: number
  compositionHeight: number
  durationInFrames: number
  previewWidth: number
  autoPlay: boolean
  loop: boolean
}

export default function ReelPlayerInner({
  slides,
  profilePicUrl,
  username,
  fullName,
  templateId,
  format,
  fps,
  durationPerSlideFrames,
  transitionFrames,
  compositionWidth,
  compositionHeight,
  durationInFrames,
  previewWidth,
  autoPlay,
  loop,
}: ReelPlayerInnerProps) {
  // Props para o CarouselReel (formato esperado pelo Remotion)
  const inputProps: CarouselReelProps = {
    slides,
    profilePicUrl,
    username,
    fullName,
    templateId,
    format,
    fps,
    durationPerSlideFrames,
    transitionFrames,
  }

  // Calcular aspect ratio e altura proporcional do preview
  const aspectRatio = compositionHeight / compositionWidth
  const previewHeight = Math.round(previewWidth * aspectRatio)

  return (
    <div
      className="rounded-xl overflow-hidden border border-neutral-700 bg-black shadow-lg"
      style={{ width: previewWidth }}
    >
      <Player
        component={CarouselReel}
        inputProps={inputProps}
        durationInFrames={durationInFrames}
        fps={fps}
        compositionWidth={compositionWidth}
        compositionHeight={compositionHeight}
        style={{
          width: previewWidth,
          height: previewHeight,
        }}
        controls
        autoPlay={autoPlay}
        loop={loop}
        clickToPlay
        doubleClickToFullscreen
      />
    </div>
  )
}
