import React, { useMemo } from 'react'
import { AbsoluteFill } from 'remotion'
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from '@remotion/transitions'

export type ZoomBlurTransitionProps = {
  maxScale?: number // Escala maxima no zoom (default: 1.3)
  maxBlur?: number // Blur maximo em px (default: 8)
}

/**
 * Componente de transicao Zoom Blur.
 * Slide saindo: zoom in (1.0 -> 1.3) com blur crescente (0 -> 8px)
 * Slide entrando: zoom out (0.7 -> 1.0) com blur decrescente (8px -> 0)
 */
const ZoomBlurPresentation: React.FC<
  TransitionPresentationComponentProps<ZoomBlurTransitionProps>
> = ({
  children,
  presentationDirection,
  presentationProgress,
  passedProps,
}) => {
  const maxScale = passedProps.maxScale ?? 1.3
  const maxBlur = passedProps.maxBlur ?? 8
  const isEntering = presentationDirection === 'entering'

  const style: React.CSSProperties = useMemo(() => {
    if (isEntering) {
      // Entrando: comeca pequeno e embaçado, termina normal
      // Scale: 0.7 -> 1.0 (usando inverso do maxScale como ponto de partida)
      const minScale = 2 - maxScale // se maxScale = 1.3, minScale = 0.7
      const scale = minScale + (1 - minScale) * presentationProgress
      const blur = maxBlur * (1 - presentationProgress)
      const opacity = presentationProgress

      return {
        transform: `scale(${scale})`,
        filter: blur > 0.1 ? `blur(${blur}px)` : 'none',
        opacity,
      }
    } else {
      // Saindo: comeca normal, termina grande e embaçado
      const scale = 1 + (maxScale - 1) * presentationProgress
      const blur = maxBlur * presentationProgress
      const opacity = 1 - presentationProgress

      return {
        transform: `scale(${scale})`,
        filter: blur > 0.1 ? `blur(${blur}px)` : 'none',
        opacity,
      }
    }
  }, [isEntering, presentationProgress, maxScale, maxBlur])

  return (
    <AbsoluteFill style={style}>
      {children}
    </AbsoluteFill>
  )
}

/**
 * Transicao Zoom Blur: zoom-in com blur radial no slide saindo,
 * zoom-out com deblur no slide entrando. Efeito cinematografico suave.
 */
export const zoomBlurTransition = (
  props?: ZoomBlurTransitionProps
): TransitionPresentation<ZoomBlurTransitionProps> => {
  return {
    component: ZoomBlurPresentation,
    props: props ?? {},
  }
}
