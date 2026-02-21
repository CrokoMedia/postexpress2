import React from 'react'
import { useCurrentFrame, useVideoConfig, spring } from 'remotion'

/**
 * Barra de progresso horizontal animada com spring().
 * Cresce da esquerda até o valor proporcional (value/maxValue).
 * Útil para visualizar métricas, scores e comparações em slides data-driven.
 */

interface AnimatedBarProps {
  /** Valor atual da barra */
  value: number
  /** Valor máximo (100% da largura) */
  maxValue?: number
  /** Alias para maxValue (usado pelo metric-detector) */
  max?: number
  /** Cor da barra preenchida (padrão: #3b82f6 — azul) */
  color?: string
  /** Alias para color — cor do template (usado pelo metric-detector) */
  accentColor?: string
  /** Cor do fundo da barra (padrão: #e2e8f0) */
  backgroundColor?: string
  /** Altura da barra em px (padrão: 24) */
  height?: number
  /** Label exibido à esquerda da barra */
  label?: string
  /** Cor do texto do label (padrão: #1e293b) */
  labelColor?: string
  /** Tamanho da fonte do label (padrão: 20) */
  labelSize?: number
  /** Frame em que a animação começa (padrão: 0) */
  startFrame?: number
  /** Largura total da barra em px (padrão: 100% via CSS) */
  width?: number | string
}

export const AnimatedBar: React.FC<AnimatedBarProps> = ({
  value,
  maxValue,
  max,
  color,
  accentColor,
  backgroundColor = '#e2e8f0',
  height = 24,
  label,
  labelColor = '#1e293b',
  labelSize = 20,
  startFrame = 0,
  width = '100%',
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Resolver aliases: accentColor -> color, max -> maxValue
  const effectiveColor = color || accentColor || '#3b82f6'
  const effectiveMax = maxValue ?? max ?? 100

  // Percentual de preenchimento (clamped entre 0 e 1)
  const fillPercent = Math.min(Math.max(value / effectiveMax, 0), 1)

  // Spring suave para animar a largura da barra
  const progress = spring({
    frame: frame - startFrame,
    fps,
    config: {
      damping: 18,
      stiffness: 80,
      mass: 1,
    },
  })

  // Garante que não anime antes do startFrame
  const animatedWidth = frame < startFrame ? 0 : fillPercent * progress * 100

  return (
    <div style={{ width, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Label acima da barra */}
      {label && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontSize: labelSize,
              fontWeight: 500,
              color: labelColor,
            }}
          >
            {label}
          </span>
          <span
            style={{
              fontSize: labelSize,
              fontWeight: 600,
              color: effectiveColor,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {value}
          </span>
        </div>
      )}

      {/* Barra de progresso */}
      <div
        style={{
          width: '100%',
          height,
          backgroundColor,
          borderRadius: height / 2,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: `${animatedWidth}%`,
            height: '100%',
            backgroundColor: effectiveColor,
            borderRadius: height / 2,
            transition: 'none',
          }}
        />
      </div>
    </div>
  )
}
