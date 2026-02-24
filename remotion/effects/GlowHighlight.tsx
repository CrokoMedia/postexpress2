import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion'

interface GlowHighlightProps {
  /** Frame at which the glow starts */
  startFrame?: number
  /** Color of the glow (template accent color) */
  color?: string
  /** Maximum spread of the glow in pixels */
  maxSpread?: number
  /** Number of pulse cycles during the slide */
  pulseCount?: number
  /** Total duration the glow is visible in frames */
  durationFrames?: number
  /** Children to wrap with glow */
  children: React.ReactNode
}

/**
 * GlowHighlight — Animated pulsing glow (box-shadow) around wrapped content.
 * Expands and contracts 2-3 times with template accent color.
 * Subtle effect that draws attention without overwhelming.
 */
export const GlowHighlight: React.FC<GlowHighlightProps> = ({
  startFrame = 10,
  color = '#a855f7',
  maxSpread = 16,
  pulseCount = 2,
  durationFrames = 40,
  children,
}) => {
  const frame = useCurrentFrame()

  const localFrame = frame - startFrame

  // Before glow starts or after it ends, render children normally
  if (localFrame < 0 || localFrame > durationFrames) {
    return <div style={{ display: 'inline-block' }}>{children}</div>
  }

  const progress = localFrame / durationFrames

  // Create pulsing effect: sine wave with pulseCount cycles
  // progress goes from 0 to 1, we want pulseCount full cycles
  const pulsePhase = Math.sin(progress * Math.PI * 2 * pulseCount)

  // Map sine (-1 to 1) to glow intensity (0 to 1)
  const glowIntensity = (pulsePhase + 1) / 2

  // Fade in at start and fade out at end for smooth appearance
  const envelopeOpacity = interpolate(progress, [0, 0.1, 0.85, 1], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const finalIntensity = glowIntensity * envelopeOpacity
  const spread = maxSpread * finalIntensity
  const opacity = 0.4 * finalIntensity

  // Parse color and create with opacity
  const glowShadow = spread > 0
    ? `0 0 ${spread}px ${spread * 0.5}px ${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`
    : 'none'

  return (
    <div
      style={{
        display: 'inline-block',
        boxShadow: glowShadow,
        borderRadius: 8,
        transition: 'none', // Remotion handles frame-by-frame
      }}
    >
      {children}
    </div>
  )
}
