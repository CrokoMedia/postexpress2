/**
 * Registry de backgrounds animados — mapeia estilo para componente React.
 * Adapta cores automaticamente do template ativo.
 */

import React from 'react'
import { GradientFlow } from './GradientFlow'
import { GeometricGrid } from './GeometricGrid'
import { ParticlesFloat } from './ParticlesFloat'
import { WaveMesh } from './WaveMesh'
import type { TemplateConfig } from '../templates/types'

// Estilos de background animado disponiveis
export type AnimatedBackgroundStyle =
  | 'none'
  | 'gradient-flow'
  | 'geometric'
  | 'particles'
  | 'wave-mesh'
  | 'auto'

// Mapeamento automatico: template → estilo recomendado
const AUTO_STYLE_MAP: Record<string, AnimatedBackgroundStyle> = {
  'minimalist': 'wave-mesh',
  'hormozi-dark': 'particles',
  'editorial-magazine': 'gradient-flow',
  'neon-social': 'gradient-flow',
  'data-driven': 'geometric',
}

/**
 * Resolve estilo 'auto' para o estilo concreto baseado no template.
 */
export function resolveAutoStyle(
  style: AnimatedBackgroundStyle,
  templateId: string
): AnimatedBackgroundStyle {
  if (style !== 'auto') return style
  return AUTO_STYLE_MAP[templateId] || 'gradient-flow'
}

/**
 * Extrai 3 cores relevantes do template para uso nos backgrounds.
 * Retorna [background, accent, secondary] como tupla.
 */
function extractTemplateColors(template: TemplateConfig): {
  primary: string
  accent: string
  secondary: string
} {
  return {
    primary: template.colors.background,
    accent: template.colors.accent,
    secondary: template.colors.headerBorder,
  }
}

/**
 * Retorna o componente React de background animado para o estilo selecionado.
 * Retorna null quando o estilo e 'none'.
 */
export function getAnimatedBackground(
  style: AnimatedBackgroundStyle,
  template: TemplateConfig
): React.ReactElement | null {
  const resolvedStyle = resolveAutoStyle(style, template.id)

  if (resolvedStyle === 'none' || resolvedStyle === 'auto') {
    return null
  }

  const { primary, accent, secondary } = extractTemplateColors(template)

  switch (resolvedStyle) {
    case 'gradient-flow':
      return React.createElement(GradientFlow, {
        colors: [primary, accent, secondary],
      })

    case 'geometric':
      return React.createElement(GeometricGrid, {
        accentColor: accent,
        backgroundColor: primary,
      })

    case 'particles':
      return React.createElement(ParticlesFloat, {
        colors: [accent, secondary],
        backgroundColor: primary,
      })

    case 'wave-mesh':
      return React.createElement(WaveMesh, {
        colors: [accent, secondary, primary],
        backgroundColor: primary,
      })

    default:
      return null
  }
}

export { GradientFlow } from './GradientFlow'
export { GeometricGrid } from './GeometricGrid'
export { ParticlesFloat } from './ParticlesFloat'
export { WaveMesh } from './WaveMesh'
