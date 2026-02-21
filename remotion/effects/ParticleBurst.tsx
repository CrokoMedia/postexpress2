import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion'

interface ParticleBurstProps {
  /** Frame at which the burst starts */
  startFrame?: number
  /** Number of particles (10-20 recommended) */
  particleCount?: number
  /** Color of particles (template accent color) */
  color?: string
  /** Maximum spread radius in pixels */
  spreadRadius?: number
  /** Duration of the burst in frames */
  durationFrames?: number
  /** Seed for deterministic pseudo-random (use slide index) */
  seed?: number
}

/**
 * ParticleBurst — Deterministic particle explosion around an element.
 * Particles spread radially from center and fade out.
 * Uses Math.sin for pseudo-random to ensure Remotion determinism.
 */
export const ParticleBurst: React.FC<ParticleBurstProps> = ({
  startFrame = 5,
  particleCount = 14,
  color = '#a855f7',
  spreadRadius = 120,
  durationFrames = 18,
  seed = 0,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Only render during burst window
  const localFrame = frame - startFrame
  if (localFrame < 0 || localFrame > durationFrames) return null

  const progress = localFrame / durationFrames

  // Generate deterministic particles
  const particles = Array.from({ length: particleCount }, (_, i) => {
    // Deterministic pseudo-random using sin with large prime multipliers
    const angle = Math.sin(i * 12345.6789 + seed * 9876.5432) * Math.PI * 2
    const speedVariation = 0.5 + Math.abs(Math.sin(i * 54321.9876 + seed * 13579.2468)) * 0.5
    const sizeVariation = 3 + Math.abs(Math.sin(i * 98765.4321 + seed * 24680.1357)) * 5
    const delayVariation = Math.abs(Math.sin(i * 11111.2222 + seed * 33333.4444)) * 3

    // Offset start for stagger effect
    const particleLocalFrame = localFrame - delayVariation
    if (particleLocalFrame < 0) return null

    const particleProgress = Math.min(particleLocalFrame / (durationFrames - delayVariation), 1)

    // Position: radial spread with easing
    const easedProgress = 1 - Math.pow(1 - particleProgress, 2) // ease-out quad
    const distance = spreadRadius * speedVariation * easedProgress
    const x = Math.cos(angle) * distance
    const y = Math.sin(angle) * distance

    // Opacity: fade out in last 40% of life
    const opacity = interpolate(particleProgress, [0, 0.3, 1], [0, 1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })

    // Scale: shrink as they spread
    const scale = interpolate(particleProgress, [0, 0.2, 1], [0.3, 1, 0.2], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })

    return {
      x,
      y,
      opacity,
      scale,
      size: sizeVariation,
      key: i,
    }
  })

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
      }}
    >
      {particles.map((p) => {
        if (!p) return null
        return (
          <div
            key={p.key}
            style={{
              position: 'absolute',
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              backgroundColor: color,
              transform: `translate(${p.x}px, ${p.y}px) scale(${p.scale})`,
              opacity: p.opacity,
              boxShadow: `0 0 ${p.size * 2}px ${color}66`,
            }}
          />
        )
      })}
    </div>
  )
}
