import React from 'react'
import { useCurrentFrame } from 'remotion'
import { AbsoluteFill } from 'remotion'

interface ParticlesFloatProps {
  colors: [string, string]
  backgroundColor: string
}

// Definicao deterministica de cada particula (seed-based)
interface ParticleDef {
  startX: number      // posicao X inicial (0-1)
  startY: number      // posicao Y inicial (0-1)
  size: number         // tamanho em px (2-6)
  speed: number        // velocidade vertical (0.3-1.2)
  frequency: number    // frequencia de oscilacao horizontal
  amplitude: number    // amplitude de oscilacao horizontal
  opacity: number      // opacidade base (0.15-0.6)
  colorIndex: number   // indice da cor (0 ou 1)
}

// Gerar particulas deterministicamente usando funcao hash simples
function generateParticles(count: number): ParticleDef[] {
  const particles: ParticleDef[] = []
  for (let i = 0; i < count; i++) {
    // Hash deterministico baseado no indice
    const hash1 = Math.sin(i * 127.1 + 311.7) * 43758.5453
    const hash2 = Math.sin(i * 269.5 + 183.3) * 43758.5453
    const hash3 = Math.sin(i * 419.2 + 371.9) * 43758.5453
    const hash4 = Math.sin(i * 547.3 + 157.1) * 43758.5453

    const fract = (x: number) => x - Math.floor(x)

    particles.push({
      startX: fract(hash1),
      startY: fract(hash2),
      size: 2 + fract(hash3) * 4,           // 2-6px
      speed: 0.3 + fract(hash4) * 0.9,       // 0.3-1.2
      frequency: 0.01 + fract(hash1 + 1) * 0.03, // oscilacao lenta
      amplitude: 10 + fract(hash2 + 1) * 30,     // 10-40px
      opacity: 0.15 + fract(hash3 + 1) * 0.45,   // 0.15-0.6
      colorIndex: i % 2,
    })
  }
  return particles
}

const PARTICLES = generateParticles(25)

/**
 * ParticlesFloat — 25 particulas flutuando para cima com oscilacao horizontal.
 * Cada particula tem: translateY(-frame * speed), translateX(sin(frame * freq) * amplitude).
 * Reset suave quando sai do frame (wrap vertical).
 * Animacao 100% deterministica, sem Math.random().
 */
export const ParticlesFloat: React.FC<ParticlesFloatProps> = ({
  colors,
  backgroundColor,
}) => {
  const frame = useCurrentFrame()

  // Altura maxima do viewport (usamos proporcao do container)
  const viewHeight = 1350
  const viewWidth = 1080

  return (
    <AbsoluteFill style={{ backgroundColor, overflow: 'hidden' }}>
      {PARTICLES.map((p, i) => {
        // Posicao Y: sobe continuamente, wrap quando sai de cima
        const totalTravel = frame * p.speed
        const rawY = p.startY * viewHeight - totalTravel
        // Wrap: quando sai de cima, reaparece embaixo
        const wrapHeight = viewHeight + p.size * 2
        const y = ((rawY % wrapHeight) + wrapHeight) % wrapHeight - p.size

        // Posicao X: oscilacao sinusoidal
        const x = p.startX * viewWidth + Math.sin(frame * p.frequency + i * 2.0) * p.amplitude

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              backgroundColor: colors[p.colorIndex],
              opacity: p.opacity,
              willChange: 'transform',
            }}
          />
        )
      })}
    </AbsoluteFill>
  )
}
