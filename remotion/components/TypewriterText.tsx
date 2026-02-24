import React from 'react'
import { useCurrentFrame } from 'remotion'

interface TypewriterTextProps {
  text: string
  fontSize: number
  color: string
  fontWeight: number
  startFrame?: number // frame onde comeca a animar (default 0)
  charsPerFrame?: number // velocidade (default 1 char por frame)
}

/**
 * Efeito de texto "typewriter" — caracteres aparecem um a um
 * com cursor piscando no final enquanto digita.
 */
export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  fontSize,
  color,
  fontWeight,
  startFrame = 0,
  charsPerFrame = 1,
}) => {
  const frame = useCurrentFrame()

  // Calcular quantos caracteres mostrar com base no frame atual
  const elapsedFrames = Math.max(0, frame - startFrame)
  const visibleChars = Math.min(text.length, Math.floor(elapsedFrames * charsPerFrame))
  const visibleText = text.substring(0, visibleChars)

  // Verificar se terminou de digitar
  const isTypingComplete = visibleChars >= text.length
  const framesAfterComplete = isTypingComplete
    ? elapsedFrames - Math.ceil(text.length / charsPerFrame)
    : 0

  // Cursor pisca a cada 8 frames enquanto digita; desaparece 10 frames apos terminar
  const showCursor = !isTypingComplete || framesAfterComplete < 10
  const cursorOpacity = showCursor
    ? Math.floor(elapsedFrames / 8) % 2 === 0
      ? 1
      : 0
    : 0

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
      {visibleText}
      <span
        style={{
          opacity: cursorOpacity,
          fontWeight: 300,
          color,
          marginLeft: 2,
        }}
      >
        |
      </span>
    </span>
  )
}
