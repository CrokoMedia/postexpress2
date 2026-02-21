/**
 * Registry de transicoes custom para Remotion.
 * Centraliza todas as transicoes disponıveis e oferece
 * funcao getTransitionForStyle() para selecao dinamica.
 */
import { fade } from '@remotion/transitions/fade'
import { slide } from '@remotion/transitions/slide'
import type { TransitionPresentation } from '@remotion/transitions'
import { pixelTransition } from './PixelTransition'
import { liquidWaveTransition } from './LiquidWaveTransition'
import { glitchTransition } from './GlitchTransition'
import { zoomBlurTransition } from './ZoomBlurTransition'

export type TransitionStyle =
  | 'fade'
  | 'slide'
  | 'pixel'
  | 'liquid'
  | 'glitch'
  | 'zoom-blur'
  | 'random'

// Estilos disponiveis para o modo "random" (exclui 'random' para evitar recursao)
const ALL_STYLES: Exclude<TransitionStyle, 'random'>[] = [
  'fade',
  'slide',
  'pixel',
  'liquid',
  'glitch',
  'zoom-blur',
]

/**
 * Retorna uma TransitionPresentation baseada no estilo selecionado.
 * Se "random": cicla entre todas as transicoes usando o slideIndex como seed.
 * Fallback: retorna fade() em caso de estilo desconhecido.
 */
export function getTransitionForStyle(
  style: TransitionStyle,
  slideIndex: number = 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): TransitionPresentation<any> {
  // Modo aleatorio: distribuir transicoes entre os slides
  if (style === 'random') {
    const selectedStyle = ALL_STYLES[slideIndex % ALL_STYLES.length]
    return getTransitionForStyle(selectedStyle, slideIndex)
  }

  try {
    switch (style) {
      case 'fade':
        return fade()
      case 'slide':
        return slide({ direction: 'from-right' })
      case 'pixel':
        return pixelTransition()
      case 'liquid':
        return liquidWaveTransition()
      case 'glitch':
        return glitchTransition()
      case 'zoom-blur':
        return zoomBlurTransition()
      default:
        // Fallback para fade em caso de estilo desconhecido
        return fade()
    }
  } catch {
    // Fallback seguro: se transicao custom falhar, usar fade
    console.warn(`Transicao "${style}" falhou, usando fade como fallback`)
    return fade()
  }
}

// Re-exportar tipos e funcoes dos componentes individuais
export { pixelTransition } from './PixelTransition'
export { liquidWaveTransition } from './LiquidWaveTransition'
export { glitchTransition } from './GlitchTransition'
export { zoomBlurTransition } from './ZoomBlurTransition'
