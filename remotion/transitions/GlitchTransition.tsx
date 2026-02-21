import React, { useMemo } from 'react'
import { AbsoluteFill } from 'remotion'
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from '@remotion/transitions'

export type GlitchTransitionProps = {
  sliceCount?: number // Numero de barras horizontais (default: 5)
  intensity?: number // Intensidade do offset RGB em px (default: 12)
}

/**
 * Componente de transicao Glitch.
 * Cria efeito de cortes horizontais com offset RGB e barras aleatorias.
 * Duracao curta para impacto visual maximo.
 */
const GlitchPresentation: React.FC<
  TransitionPresentationComponentProps<GlitchTransitionProps>
> = ({
  children,
  presentationDirection,
  presentationProgress,
  passedProps,
}) => {
  const sliceCount = passedProps.sliceCount ?? 5
  const intensity = passedProps.intensity ?? 12
  const isEntering = presentationDirection === 'entering'

  // Glitch e mais intenso no meio da transicao (bell curve)
  const glitchIntensity = Math.sin(presentationProgress * Math.PI)

  // Opacidade base: entering vai de 0 a 1, exiting vai de 1 a 0
  const baseOpacity = isEntering ? presentationProgress : 1 - presentationProgress

  // Gerar slices com offsets pseudo-aleatorios (deterministico por frame)
  const slices = useMemo(() => {
    const result: { top: string; height: string; offsetX: number }[] = []
    const sliceHeight = 100 / sliceCount

    for (let i = 0; i < sliceCount; i++) {
      // Offset determinıstico baseado no index e progress
      const seed = Math.sin((i + 1) * 127.1 + presentationProgress * 311.7)
      const offsetX = seed * intensity * glitchIntensity

      result.push({
        top: `${i * sliceHeight}%`,
        height: `${sliceHeight}%`,
        offsetX,
      })
    }

    return result
  }, [sliceCount, presentationProgress, intensity, glitchIntensity])

  // RGB split offsets (mais intenso no pico da transicao)
  const rgbOffset = useMemo(() => {
    const offset = intensity * 0.6 * glitchIntensity
    return {
      red: { x: offset, y: -offset * 0.3 },
      blue: { x: -offset, y: offset * 0.3 },
    }
  }, [intensity, glitchIntensity])

  // Determinar se devemos mostrar efeito de glitch (apenas no meio da transicao)
  const showGlitch = glitchIntensity > 0.15

  const containerStyle: React.CSSProperties = useMemo(
    () => ({
      width: '100%',
      height: '100%',
      opacity: baseOpacity,
    }),
    [baseOpacity]
  )

  if (!showGlitch) {
    // Sem efeito de glitch: mostrar slide normalmente com opacity
    return (
      <AbsoluteFill style={containerStyle}>
        {children}
      </AbsoluteFill>
    )
  }

  return (
    <AbsoluteFill>
      {/* Camada Red (offset para direita) */}
      <AbsoluteFill
        style={{
          opacity: baseOpacity * 0.3,
          transform: `translate(${rgbOffset.red.x}px, ${rgbOffset.red.y}px)`,
          mixBlendMode: 'screen',
          filter: 'saturate(3) hue-rotate(-30deg)',
        }}
      >
        {children}
      </AbsoluteFill>

      {/* Camada Blue (offset para esquerda) */}
      <AbsoluteFill
        style={{
          opacity: baseOpacity * 0.3,
          transform: `translate(${rgbOffset.blue.x}px, ${rgbOffset.blue.y}px)`,
          mixBlendMode: 'screen',
          filter: 'saturate(3) hue-rotate(180deg)',
        }}
      >
        {children}
      </AbsoluteFill>

      {/* Camada principal com slices deslocados */}
      <AbsoluteFill style={{ opacity: baseOpacity, overflow: 'hidden' }}>
        {slices.map((slice, idx) => (
          <div
            key={idx}
            style={{
              position: 'absolute',
              top: slice.top,
              left: 0,
              width: '100%',
              height: slice.height,
              overflow: 'hidden',
              transform: `translateX(${slice.offsetX}px)`,
            }}
          >
            {/* Deslocar o conteudo para manter alinhamento visual */}
            <div
              style={{
                position: 'absolute',
                top: `-${slice.top}`,
                left: 0,
                width: '100%',
                height: `${100 / parseFloat(slice.height) * 100}%`,
              }}
            >
              {children}
            </div>
          </div>
        ))}
      </AbsoluteFill>

      {/* Barras horizontais aleatorias (scanlines) */}
      <AbsoluteFill
        style={{
          opacity: glitchIntensity * 0.15,
          pointerEvents: 'none',
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(255,255,255,0.03) 2px,
            rgba(255,255,255,0.03) 4px
          )`,
        }}
      />
    </AbsoluteFill>
  )
}

/**
 * Transicao Glitch: cortes rapidos com separacao RGB, offsets horizontais
 * e barras de scanline. Ideal para transicoes curtas e impactantes.
 */
export const glitchTransition = (
  props?: GlitchTransitionProps
): TransitionPresentation<GlitchTransitionProps> => {
  return {
    component: GlitchPresentation,
    props: props ?? {},
  }
}
