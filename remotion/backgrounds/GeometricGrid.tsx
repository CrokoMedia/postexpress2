import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'
import { AbsoluteFill } from 'remotion'

interface GeometricGridProps {
  accentColor: string
  backgroundColor: string
}

/**
 * GeometricGrid — grid 6x6 de circulos SVG com rotacao sutil e opacidade pulsante.
 * Cada forma tem offset de fase diferente para criar padroes organicos.
 * Animacao deterministica: rotate(frame * 0.15deg), opacidade via sin().
 */
export const GeometricGrid: React.FC<GeometricGridProps> = ({
  accentColor,
  backgroundColor,
}) => {
  const frame = useCurrentFrame()

  const gridSize = 6
  const cellWidth = 1080 / gridSize
  const cellHeight = 1350 / gridSize // Usar altura maxima (feed)
  const circleRadius = Math.min(cellWidth, cellHeight) * 0.25

  // Rotacao sutil do grid inteiro
  const rotation = frame * 0.15

  // Gerar circulos do grid com opacidade pulsante
  const circles: React.ReactNode[] = []
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const index = row * gridSize + col
      // Fase diferente por posicao para efeito onda
      const phaseOffset = (row + col) * 0.8
      const opacityValue = interpolate(
        Math.sin(frame * 0.05 + phaseOffset),
        [-1, 1],
        [0.08, 0.35]
      )

      const cx = col * cellWidth + cellWidth / 2
      const cy = row * cellHeight + cellHeight / 2

      circles.push(
        <circle
          key={index}
          cx={cx}
          cy={cy}
          r={circleRadius}
          fill={accentColor}
          opacity={opacityValue}
        />
      )
    }
  }

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      <svg
        viewBox="0 0 1080 1350"
        width="100%"
        height="100%"
        style={{
          position: 'absolute',
          inset: 0,
          transform: `rotate(${rotation}deg)`,
          transformOrigin: 'center center',
        }}
      >
        {circles}
      </svg>
    </AbsoluteFill>
  )
}
