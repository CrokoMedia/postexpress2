import React from 'react'
import { useCurrentFrame, useVideoConfig, spring } from 'remotion'

interface ScaleBounceTextProps {
  text: string
  fontSize: number
  color: string
  accentColor: string
  fontWeight: number
  startFrame?: number
}

/**
 * Efeito de texto "scale bounce" — cada palavra aparece sequencialmente
 * com animacao de spring (scale 0 -> 1.2 -> 1.0).
 * Palavras entre **negrito** ficam com accentColor e bounce mais intenso.
 */
export const ScaleBounceText: React.FC<ScaleBounceTextProps> = ({
  text,
  fontSize,
  color,
  accentColor,
  fontWeight,
  startFrame = 0,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Processar texto para detectar palavras em negrito (**palavra**)
  const tokens = parseTextWithBold(text)

  // Delay entre palavras: 4 frames
  const DELAY_PER_WORD = 4

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
      {tokens.map((token, i) => {
        const wordDelay = startFrame + i * DELAY_PER_WORD

        // Spring animation para cada palavra
        const progress = spring({
          frame,
          fps,
          config: {
            damping: 12,
            stiffness: 200,
            // Bounce mais intenso para palavras em negrito
            overshootClamping: false,
          },
          delay: wordDelay,
        })

        // Scale: 0 -> 1.2/1.4 -> 1.0 (usando spring que naturalmente overshoots)
        // Para palavras negrito, usar mass menor para overshoot maior
        const boldProgress = spring({
          frame,
          fps,
          config: {
            damping: 10,
            stiffness: 250,
            mass: 0.8,
            overshootClamping: false,
          },
          delay: wordDelay,
        })

        const scale = token.isBold ? boldProgress : progress
        // Garantir que comeca do zero (antes do delay, spring retorna 0)
        const scaleValue = frame < wordDelay ? 0 : scale

        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              transform: `scale(${scaleValue})`,
              transformOrigin: 'center bottom',
              color: token.isBold ? accentColor : color,
              fontWeight: token.isBold ? 800 : fontWeight,
              marginRight: token.isLastInGroup ? 0 : '0.25em',
              // Visibilidade: esconder completamente antes do delay
              opacity: frame < wordDelay ? 0 : 1,
            }}
          >
            {token.word}
          </span>
        )
      })}
    </span>
  )
}

interface TextToken {
  word: string
  isBold: boolean
  isLastInGroup: boolean
}

/**
 * Processa texto para extrair palavras e detectar trechos em **negrito**.
 * Ex: "Isso e **muito importante** para voce" ->
 *   [{word: 'Isso', isBold: false}, {word: 'e', isBold: false},
 *    {word: 'muito', isBold: true}, {word: 'importante', isBold: true},
 *    {word: 'para', isBold: false}, {word: 'voce', isBold: false}]
 */
function parseTextWithBold(text: string): TextToken[] {
  const tokens: TextToken[] = []
  // Regex para encontrar trechos **negrito**
  const parts = text.split(/(\*\*[^*]+\*\*)/)

  for (const part of parts) {
    if (!part) continue

    const isBold = part.startsWith('**') && part.endsWith('**')
    const cleanText = isBold ? part.slice(2, -2) : part
    const words = cleanText.split(/\s+/).filter((w) => w.length > 0)

    words.forEach((word, idx) => {
      tokens.push({
        word,
        isBold,
        isLastInGroup: idx === words.length - 1,
      })
    })
  }

  return tokens
}
