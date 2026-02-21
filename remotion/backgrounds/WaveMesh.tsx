import React from 'react'
import { useCurrentFrame } from 'remotion'
import { AbsoluteFill } from 'remotion'

interface WaveMeshProps {
  colors: [string, string, string]
  backgroundColor: string
}

// Definicao de cada onda
interface WaveDef {
  centerY: number    // posicao vertical central (fracao 0-1)
  frequency: number  // frequencia da onda
  amplitude: number  // amplitude em pixels
  speed: number      // velocidade de animacao
  opacity: number    // opacidade
  colorIndex: number // indice da cor
}

const WAVES: WaveDef[] = [
  { centerY: 0.3, frequency: 0.008, amplitude: 60, speed: 0.04, opacity: 0.25, colorIndex: 0 },
  { centerY: 0.45, frequency: 0.012, amplitude: 45, speed: 0.06, opacity: 0.20, colorIndex: 1 },
  { centerY: 0.6, frequency: 0.006, amplitude: 70, speed: 0.03, opacity: 0.30, colorIndex: 2 },
  { centerY: 0.75, frequency: 0.010, amplitude: 50, speed: 0.05, opacity: 0.15, colorIndex: 0 },
]

/**
 * WaveMesh — 4 ondas senoidais sobrepostas renderizadas como SVG <path>.
 * Cada onda tem frequencia, amplitude e velocidade diferentes.
 * Cores semi-transparentes do template.
 * Animacao deterministica via frame.
 */
export const WaveMesh: React.FC<WaveMeshProps> = ({ colors, backgroundColor }) => {
  const frame = useCurrentFrame()

  const width = 1080
  const height = 1350

  // Gerar path SVG para cada onda
  const wavePaths = WAVES.map((wave, waveIndex) => {
    const centerY = wave.centerY * height
    const points: string[] = []

    // Gerar pontos da onda com resolucao de 10px
    const step = 10
    for (let x = 0; x <= width; x += step) {
      const y =
        centerY +
        Math.sin(x * wave.frequency + frame * wave.speed) * wave.amplitude +
        Math.sin(x * wave.frequency * 0.5 + frame * wave.speed * 1.3 + waveIndex) * (wave.amplitude * 0.4)

      if (x === 0) {
        points.push(`M 0 ${y}`)
      } else {
        points.push(`L ${x} ${y}`)
      }
    }

    // Fechar o path pela parte inferior
    points.push(`L ${width} ${height}`)
    points.push(`L 0 ${height}`)
    points.push('Z')

    return (
      <path
        key={waveIndex}
        d={points.join(' ')}
        fill={colors[wave.colorIndex]}
        opacity={wave.opacity}
      />
    )
  })

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="100%"
        style={{ position: 'absolute', inset: 0 }}
        preserveAspectRatio="none"
      >
        {wavePaths}
      </svg>
    </AbsoluteFill>
  )
}
