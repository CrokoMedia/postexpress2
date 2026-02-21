import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

interface GradientTextProps {
  text: string
  fontSize: number
  fontWeight: number
  gradientColors: [string, string] // [cor1, cor2]
}

/**
 * Efeito de texto com gradiente animado — o gradiente desliza
 * horizontalmente pelo texto usando backgroundPosition.
 */
export const GradientText: React.FC<GradientTextProps> = ({
  text,
  fontSize,
  fontWeight,
  gradientColors,
}) => {
  const frame = useCurrentFrame()

  // Animar backgroundPosition de 0% a 200% em 90 frames (~3s a 30fps)
  const bgPosition = interpolate(frame, [0, 90], [0, 200], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <span
      style={{
        fontSize,
        fontWeight,
        lineHeight: 1.3,
        display: 'inline-block',
        background: `linear-gradient(90deg, ${gradientColors[0]}, ${gradientColors[1]}, ${gradientColors[0]})`,
        backgroundSize: '200% 100%',
        backgroundPosition: `${bgPosition}% 50%`,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        WebkitTextFillColor: 'transparent',
      }}
    >
      {text}
    </span>
  )
}
