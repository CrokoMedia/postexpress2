import React from 'react'
import { useCurrentFrame, useVideoConfig, spring } from 'remotion'

interface SplitRevealTextProps {
  text: string
  fontSize: number
  color: string
  fontWeight: number
  startFrame?: number // frame onde comeca a animar (default 0)
  lineDelay?: number  // frames de delay entre linhas (default 8)
}

/**
 * Efeito de texto "split reveal" — cada linha aparece com uma mascara
 * deslizando da esquerda para a direita (clip-path inset).
 * Linhas sao reveladas sequencialmente com delay configuravel.
 */
export const SplitRevealText: React.FC<SplitRevealTextProps> = ({
  text,
  fontSize,
  color,
  fontWeight,
  startFrame = 0,
  lineDelay = 8,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Dividir texto em linhas (por quebra de linha ou wrap natural)
  // Para textos sem \n, dividir em chunks de ~40 chars para simular linhas
  const lines = splitTextIntoLines(text)

  return (
    <span
      style={{
        fontSize,
        fontWeight,
        color,
        lineHeight: 1.3,
        display: 'inline-flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      {lines.map((line, i) => {
        const delay = startFrame + i * lineDelay

        // Spring para controlar a revelacao da mascara
        const revealProgress = spring({
          frame,
          fps,
          config: {
            damping: 18,
            stiffness: 100,
            mass: 0.8,
          },
          delay,
        })

        // clip-path: inset(0 100% 0 0) → inset(0 0% 0 0)
        // O valor da direita vai de 100% (totalmente escondido) a 0% (totalmente visivel)
        const clipRight = (1 - revealProgress) * 100

        // Leve translateX para efeito de deslizamento
        const translateX = (1 - revealProgress) * -20

        return (
          <span
            key={i}
            style={{
              display: 'block',
              clipPath: `inset(0 ${clipRight}% 0 0)`,
              transform: `translateX(${translateX}px)`,
              willChange: 'clip-path, transform',
            }}
          >
            {line}
          </span>
        )
      })}
    </span>
  )
}

/**
 * Divide texto em linhas logicas.
 * Se o texto contem \n, usa essas quebras.
 * Caso contrario, mantem como linha unica (o container cuidara do wrap).
 */
function splitTextIntoLines(text: string): string[] {
  const lines = text.split('\n').filter((l) => l.trim().length > 0)
  if (lines.length > 1) {
    return lines
  }

  // Texto sem quebras: dividir em segmentos de ~5-6 palavras para efeito visual
  const words = text.split(/\s+/)
  if (words.length <= 6) {
    return [text]
  }

  const result: string[] = []
  const wordsPerLine = Math.ceil(words.length / Math.ceil(words.length / 6))
  for (let i = 0; i < words.length; i += wordsPerLine) {
    result.push(words.slice(i, i + wordsPerLine).join(' '))
  }
  return result
}
