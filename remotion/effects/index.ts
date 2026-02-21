export { ParticleBurst } from './ParticleBurst'
export { ZoomPulse } from './ZoomPulse'
export { GlowHighlight } from './GlowHighlight'
export { ParallaxContainer } from './ParallaxContainer'

// CTA keywords that trigger highlight effects (Portuguese and English)
const CTA_KEYWORDS = [
  // Portuguese
  'gratis', 'gratuito', 'gratuita', 'agora', 'hoje',
  'descubra', 'aprenda', 'comece', 'garanta', 'acesse',
  'link', 'bio', 'comentarios', 'salve', 'compartilhe',
  'clique', 'arraste', 'confira', 'baixe', 'inscreva',
  // English
  'free', 'now', 'today', 'discover', 'learn', 'start',
  'click', 'save', 'share', 'link', 'comment', 'subscribe',
  'download', 'swipe', 'tap',
]

// Regex to detect numbers/metrics (e.g., "3x", "100%", "R$ 2.000", "$100M", "10k")
const NUMBER_REGEX = /(?:R\$\s?)?[\d.,]+(?:\s?(?:mil|k|M|B|x|%|reais|dollars?))?/i

/**
 * Detect if a slide should receive highlight effects.
 * Returns which effects should be applied based on slide content.
 */
export function detectSlideEffects(
  titulo: string,
  corpo: string,
  slideNumber: number,
  totalSlides: number,
): {
  shouldParticleBurst: boolean
  shouldZoomPulse: boolean
  shouldGlowHighlight: boolean
} {
  const isFirstSlide = slideNumber === 1
  const isLastSlide = slideNumber === totalSlides
  const fullText = `${titulo} ${corpo}`.toLowerCase()

  // Check for CTA keywords
  const hasCTAKeyword = CTA_KEYWORDS.some((keyword) =>
    fullText.includes(keyword.toLowerCase())
  )

  // Check for numbers/metrics in title
  const hasNumbers = NUMBER_REGEX.test(titulo)

  // Particle burst: first slide (title) or last slide (CTA)
  const shouldParticleBurst = isFirstSlide || (isLastSlide && hasCTAKeyword)

  // Zoom pulse: slides with numbers/metrics or CTA keywords
  const shouldZoomPulse = hasNumbers || hasCTAKeyword

  // Glow highlight: first slide or CTA slides
  const shouldGlowHighlight = isFirstSlide || (isLastSlide && hasCTAKeyword)

  return {
    shouldParticleBurst,
    shouldZoomPulse,
    shouldGlowHighlight,
  }
}
