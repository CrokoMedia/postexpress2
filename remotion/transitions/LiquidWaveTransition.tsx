import React, { useMemo } from 'react'
import { AbsoluteFill } from 'remotion'
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from '@remotion/transitions'

export type LiquidWaveTransitionProps = {
  waveCount?: number // Numero de ondas na distorcao (default: 3)
  direction?: 'horizontal' | 'vertical' // Direcao da onda (default: horizontal)
}

/**
 * Componente de transicao Liquid Wave.
 * Cria uma distorcao ondulada horizontal/vertical que revela o proximo slide.
 * Usa SVG clipPath com forma de onda sinusoidal progressiva.
 */
const LiquidWavePresentation: React.FC<
  TransitionPresentationComponentProps<LiquidWaveTransitionProps>
> = ({
  children,
  presentationDirection,
  presentationProgress,
  passedProps,
}) => {
  const waveCount = passedProps.waveCount ?? 3
  const direction = passedProps.direction ?? 'horizontal'
  const isEntering = presentationDirection === 'entering'

  // Para o slide entrando: progress vai de 0 (oculto) para 1 (visivel)
  // Para o slide saindo: progress vai de 0 (visivel) para 1 (oculto)
  const progress = isEntering ? presentationProgress : 1 - presentationProgress

  // Gerar SVG clipPath com onda sinusoidal
  const clipPathId = useMemo(
    () => `liquid-wave-${direction}-${Math.random().toString(36).substr(2, 9)}`,
    [direction]
  )

  const wavePath = useMemo(() => {
    // Amplitude da onda diminui conforme progress avanca (fica reta no final)
    const amplitude = 15 * Math.sin(progress * Math.PI) // Max no meio da transicao
    const steps = 50 // Numero de pontos na curva

    if (direction === 'horizontal') {
      // Onda se move da esquerda para direita
      const baseX = progress * 120 - 20 // -20 a 100 (com margem)
      const points: string[] = []

      // Lado esquerdo (inicio)
      points.push(`M -10 -10`)
      points.push(`L -10 110`)

      // Curva ondulada da base para o topo
      for (let i = steps; i >= 0; i--) {
        const y = (i / steps) * 100
        const waveOffset =
          amplitude * Math.sin((y / 100) * waveCount * Math.PI * 2 + progress * Math.PI * 4)
        const x = baseX + waveOffset
        points.push(`L ${x} ${y}`)
      }

      // Fechar o path
      points.push(`L -10 -10`)
      points.push('Z')

      return points.join(' ')
    } else {
      // Onda se move de cima para baixo
      const baseY = progress * 120 - 20
      const points: string[] = []

      points.push(`M -10 -10`)
      points.push(`L 110 -10`)

      // Curva ondulada da direita para esquerda
      for (let i = steps; i >= 0; i--) {
        const x = (i / steps) * 100
        const waveOffset =
          amplitude * Math.sin((x / 100) * waveCount * Math.PI * 2 + progress * Math.PI * 4)
        const y = baseY + waveOffset
        points.push(`L ${x} ${y}`)
      }

      points.push(`L -10 -10`)
      points.push('Z')

      return points.join(' ')
    }
  }, [progress, waveCount, direction])

  const containerStyle: React.CSSProperties = useMemo(
    () => ({
      width: '100%',
      height: '100%',
      clipPath: `url(#${clipPathId})`,
    }),
    [clipPathId]
  )

  return (
    <AbsoluteFill>
      {/* SVG com definicao do clipPath */}
      <svg
        style={{
          position: 'absolute',
          width: 0,
          height: 0,
          overflow: 'hidden',
        }}
      >
        <defs>
          <clipPath id={clipPathId} clipPathUnits="objectBoundingBox" transform="scale(0.01)">
            <path d={wavePath} />
          </clipPath>
        </defs>
      </svg>

      <AbsoluteFill style={containerStyle}>{children}</AbsoluteFill>
    </AbsoluteFill>
  )
}

/**
 * Transicao Liquid Wave: distorcao ondulada que revela progressivamente
 * o proximo slide com uma onda sinusoidal animada.
 */
export const liquidWaveTransition = (
  props?: LiquidWaveTransitionProps
): TransitionPresentation<LiquidWaveTransitionProps> => {
  return {
    component: LiquidWavePresentation,
    props: props ?? {},
  }
}
