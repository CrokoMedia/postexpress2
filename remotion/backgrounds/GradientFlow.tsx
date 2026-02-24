import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion'
import { AbsoluteFill } from 'remotion'

interface GradientFlowProps {
  colors: [string, string, string]
}

/**
 * GradientFlow — gradiente animado que muda de posicao suavemente em loop.
 * Usa 3 cores do template, linear-gradient a 135deg, backgroundSize 200%x200%.
 * Animacao deterministica baseada em frame via interpolate().
 */
export const GradientFlow: React.FC<GradientFlowProps> = ({ colors }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Ciclo completo de 4 segundos (120 frames a 30fps)
  const cycleDuration = fps * 4
  const cycleProgress = (frame % cycleDuration) / cycleDuration

  // Animar backgroundPosition em loop suave (0% -> 100% -> 0%)
  // Usamos sin para movimento suave ida-e-volta
  const posX = interpolate(
    Math.sin(cycleProgress * Math.PI * 2),
    [-1, 1],
    [0, 100]
  )
  const posY = interpolate(
    Math.cos(cycleProgress * Math.PI * 2),
    [-1, 1],
    [0, 100]
  )

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]}, ${colors[2]}, ${colors[0]})`,
        backgroundSize: '200% 200%',
        backgroundPosition: `${posX}% ${posY}%`,
      }}
    />
  )
}
