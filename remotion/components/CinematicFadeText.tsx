import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'

interface CinematicFadeTextProps {
  text: string
  fontSize: number
  color: string
  fontWeight: number
  startFrame?: number   // frame onde comeca a animar (default 0)
  wordDelay?: number    // frames de delay entre palavras (default 6)
  maxBlur?: number      // blur maximo em pixels (default 4)
  maxSpacing?: number   // letter-spacing maximo em pixels (default 8)
}

/**
 * Efeito de texto "cinematic fade" — cada palavra aparece sequencialmente
 * com fade-in + letter-spacing fechando + blur desaparecendo.
 * Efeito inspirado em titulos de cinema e trailers.
 */
export const CinematicFadeText: React.FC<CinematicFadeTextProps> = ({
  text,
  fontSize,
  color,
  fontWeight,
  startFrame = 0,
  wordDelay = 6,
  maxBlur = 4,
  maxSpacing = 8,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Dividir texto em palavras
  const words = text.split(/\s+/).filter((w) => w.length > 0)

  return (
    <span
      style={{
        fontSize,
        fontWeight,
        color,
        lineHeight: 1.3,
        display: 'inline',
      }}
    >
      {words.map((word, i) => {
        const delay = startFrame + i * wordDelay

        // Spring para transicao suave
        const progress = spring({
          frame,
          fps,
          config: {
            damping: 20,
            stiffness: 80,
            mass: 0.6,
          },
          delay,
        })

        // Opacity: 0 → 1
        const opacity = interpolate(progress, [0, 0.6], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })

        // Letter-spacing: maxSpacing → 0 (fecha ao revelar)
        const letterSpacing = interpolate(progress, [0, 1], [maxSpacing, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })

        // Blur: maxBlur → 0 (desfocado → nitido)
        const blur = interpolate(progress, [0, 0.8], [maxBlur, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })

        // Leve scale-up para efeito cinematico
        const scale = interpolate(progress, [0, 1], [0.95, 1.0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })

        // Esconder completamente antes do delay
        const isVisible = frame >= delay

        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity: isVisible ? opacity : 0,
              letterSpacing: `${letterSpacing}px`,
              filter: blur > 0.1 ? `blur(${blur}px)` : 'none',
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
              marginRight: '0.25em',
              willChange: 'opacity, letter-spacing, filter, transform',
            }}
          >
            {word}
          </span>
        )
      })}
    </span>
  )
}
