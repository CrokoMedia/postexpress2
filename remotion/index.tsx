import React from 'react'
import { Composition, Still, registerRoot } from 'remotion'
import { CarouselReel } from './compositions/CarouselReel'
import { CarouselStill } from './compositions/CarouselStill'
import { StoryReel } from './compositions/StoryReel'
import { SquareReel } from './compositions/SquareReel'
import { AuditResult } from './compositions/AuditResult'
import { CarouselReelSchema, CarouselStillSchema, AuditVideoSchema } from './types'
import type { CarouselReelProps } from './types'
import type { CalculateMetadataFunction } from 'remotion'

const HOOK_DURATION_FRAMES = 60 // 2 seconds at 30fps

const calculateMetadata: CalculateMetadataFunction<CarouselReelProps> = async ({
  props,
}) => {
  const { slides, durationPerSlideFrames, transitionFrames, slideDurations, hookEnabled, hookText } = props

  let totalFrames: number

  if (slideDurations && slideDurations.length === slides.length) {
    // Durações dinâmicas por slide (voiceover mode)
    const slidesTotal = slideDurations.reduce((sum, d) => sum + d, 0)
    const transitionsTotal = (slides.length - 1) * transitionFrames
    totalFrames = slidesTotal - transitionsTotal
  } else {
    // Duração fixa por slide (modo padrão)
    totalFrames =
      slides.length * durationPerSlideFrames -
      (slides.length - 1) * transitionFrames
  }

  // Adicionar duracao do hook visual (2s) se habilitado
  if (hookEnabled && hookText) {
    // Hook (60 frames) + transicao fade para o primeiro slide
    totalFrames += HOOK_DURATION_FRAMES
  }

  return {
    durationInFrames: Math.max(totalFrames, 30), // minimum 1 second
    props,
  }
}

// Props padrão compartilhados entre composições de reel
const defaultReelSlides = [
  {
    titulo: 'Titulo do Slide',
    corpo: 'Corpo do slide aqui',
    contentImageUrl: '',
    slideNumber: 1,
    totalSlides: 1,
  },
]

const defaultReelProps = {
  slides: defaultReelSlides,
  profilePicUrl: '',
  username: 'preview',
  fullName: 'Preview User',
  templateId: 'minimalist',
  format: 'feed' as const,
  fps: 30,
  durationPerSlideFrames: 90,
  transitionFrames: 20,
}

// Props padrão compartilhados entre composições still
const defaultStillProps = {
  titulo: 'Titulo do Slide',
  corpo: 'Corpo do slide aqui',
  contentImageUrl: '',
  profilePicUrl: '',
  username: 'preview',
  fullName: 'Preview User',
  templateId: 'minimalist',
  format: 'feed' as const,
  slideNumber: 1,
  totalSlides: 1,
}

const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Feed (4:5) — composição padrão */}
      <Composition
        id="CarouselReel"
        component={CarouselReel}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1350}
        schema={CarouselReelSchema}
        calculateMetadata={calculateMetadata}
        defaultProps={defaultReelProps}
      />
      <Still
        id="CarouselStill"
        component={CarouselStill}
        width={1080}
        height={1350}
        schema={CarouselStillSchema}
        defaultProps={defaultStillProps}
      />

      {/* Story (9:16) */}
      <Composition
        id="StoryReel"
        component={StoryReel}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        schema={CarouselReelSchema}
        calculateMetadata={calculateMetadata}
        defaultProps={{
          ...defaultReelProps,
          format: 'story' as const,
        }}
      />
      <Still
        id="StoryStill"
        component={CarouselStill}
        width={1080}
        height={1920}
        schema={CarouselStillSchema}
        defaultProps={{
          ...defaultStillProps,
          format: 'story' as const,
        }}
      />

      {/* Square (1:1) */}
      <Composition
        id="SquareReel"
        component={SquareReel}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1080}
        schema={CarouselReelSchema}
        calculateMetadata={calculateMetadata}
        defaultProps={{
          ...defaultReelProps,
          format: 'square' as const,
        }}
      />
      <Still
        id="SquareStill"
        component={CarouselStill}
        width={1080}
        height={1080}
        schema={CarouselStillSchema}
        defaultProps={{
          ...defaultStillProps,
          format: 'square' as const,
        }}
      />

      {/* Audit Result Video (1:1 quadrado, 18s) */}
      <Composition
        id="AuditResult"
        component={AuditResult}
        durationInFrames={540}
        fps={30}
        width={1080}
        height={1080}
        schema={AuditVideoSchema}
        defaultProps={{
          username: 'preview',
          profileImageUrl: '',
          scores: {
            behavior: 72,
            copy: 65,
            offers: 58,
            metrics: 80,
            anomalies: 45,
            overall: 64,
          },
          insights: [
            'Boa taxa de engajamento nos carrosseis',
            'CTAs poderiam ser mais diretos',
            'Oportunidade em Reels curtos',
          ],
        }}
      />
    </>
  )
}

registerRoot(RemotionRoot)
