import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

interface HighlightMarkerProps {
  text: string
  fontSize: number
  color: string
  fontWeight: number
  highlightColor?: string // default '#FACC15' (yellow)
  startFrame?: number
}

/**
 * Efeito de texto "marca-texto" — um retangulo colorido cresce
 * por tras do texto da esquerda para a direita, simulando
 * um marca-texto (highlighter) real.
 */
export const HighlightMarker: React.FC<HighlightMarkerProps> = ({
  text,
  fontSize,
  color,
  fontWeight,
  highlightColor = '#FACC15',
  startFrame = 0,
}) => {
  const frame = useCurrentFrame()

  // Animacao: width de 0% a 100% em 30 frames a partir de startFrame
  const highlightWidth = interpolate(
    frame,
    [startFrame, startFrame + 30],
    [0, 100],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  )

  // Altura do highlight: 60% do fontSize (marca-texto nao cobre toda a altura)
  const highlightHeight = fontSize * 0.6

  return (
    <span
      style={{
        position: 'relative',
        display: 'inline',
        fontSize,
        fontWeight,
        color,
        lineHeight: 1.3,
      }}
    >
      {/* Retangulo de marca-texto atras do texto */}
      <span
        style={{
          position: 'absolute',
          left: -4,
          bottom: 0,
          width: `${highlightWidth}%`,
          height: highlightHeight,
          backgroundColor: highlightColor,
          opacity: 0.3,
          borderRadius: 4,
          transform: 'skewX(-2deg)',
          zIndex: 0,
          // Padding extra para cobrir alem do texto
          paddingRight: 8,
          pointerEvents: 'none',
        }}
      />
      {/* Texto acima do highlight */}
      <span style={{ position: 'relative', zIndex: 1 }}>
        {text}
      </span>
    </span>
  )
}
