import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion'

interface WaveTextProps {
  text: string
  fontSize: number
  color: string
  fontWeight: number
  startFrame?: number    // frame onde comeca a animar (default 0)
  amplitude?: number     // amplitude maxima em pixels (default 12)
  frequency?: number     // velocidade da onda (default 0.3)
  charSpread?: number    // propagacao entre caracteres (default 0.5)
  dampingFrames?: number // frames ate a onda amortecer (default 60)
}

/**
 * Efeito de texto "wave" — cada caractere oscila verticalmente
 * como uma onda mexicana propagando-se pelo texto.
 * A amplitude diminui com o tempo (damping) para o texto ficar estavel.
 */
export const WaveText: React.FC<WaveTextProps> = ({
  text,
  fontSize,
  color,
  fontWeight,
  startFrame = 0,
  amplitude = 12,
  frequency = 0.3,
  charSpread = 0.5,
  dampingFrames = 60,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Frames decorridos desde o inicio da animacao
  const elapsed = Math.max(0, frame - startFrame)

  // Damping: amplitude diminui exponencialmente ao longo do tempo
  // De 1.0 (amplitude total) ate ~0.05 (quase parado)
  const dampingFactor = interpolate(elapsed, [0, dampingFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Fade-in rapido nos primeiros frames
  const opacity = interpolate(elapsed, [0, 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Dividir texto preservando espacos (nao animar espacos individualmente)
  const chars = text.split('')

  // Calcular delay base para fps (normalizar velocidade)
  const fpsNormalized = fps / 30

  return (
    <span
      style={{
        fontSize,
        fontWeight,
        color,
        lineHeight: 1.3,
        display: 'inline',
        opacity,
      }}
    >
      {chars.map((char, i) => {
        // Espacos nao recebem animacao (evita gaps visuais)
        if (char === ' ') {
          return (
            <span key={i} style={{ display: 'inline' }}>
              {'\u00A0'}
            </span>
          )
        }

        // Onda senoidal: sin(frame * frequency + charIndex * spread) * amplitude * damping
        const waveY =
          Math.sin(elapsed * frequency * fpsNormalized + i * charSpread) *
          amplitude *
          dampingFactor

        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              transform: `translateY(${waveY}px)`,
              willChange: 'transform',
            }}
          >
            {char}
          </span>
        )
      })}
    </span>
  )
}
