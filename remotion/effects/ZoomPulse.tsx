import React from 'react'
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion'

interface ZoomPulseProps {
  /** Frame at which the pulse starts */
  startFrame?: number
  /** Maximum scale (1.0 -> this -> 1.0) */
  maxScale?: number
  /** Duration of full pulse cycle in frames */
  durationFrames?: number
  /** Optional glow color during pulse */
  glowColor?: string
  /** Whether to show subtle glow during pulse */
  showGlow?: boolean
  /** Children to wrap with the zoom pulse effect */
  children: React.ReactNode
}

/**
 * ZoomPulse — Wrapper that applies a quick scale pulse with spring physics.
 * Scales from 1.0 -> maxScale -> 1.0 over durationFrames.
 * Optionally adds a subtle glow during the peak of the pulse.
 */
export const ZoomPulse: React.FC<ZoomPulseProps> = ({
  startFrame = 8,
  maxScale = 1.15,
  durationFrames = 20,
  glowColor = '#a855f7',
  showGlow = true,
  children,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const localFrame = frame - startFrame

  // Before the pulse starts, render children normally
  if (localFrame < 0) {
    return <div style={{ display: 'inline-block' }}>{children}</div>
  }

  // After the pulse ends, render children normally
  if (localFrame > durationFrames) {
    return <div style={{ display: 'inline-block' }}>{children}</div>
  }

  // Spring-based pulse: up phase
  const halfDuration = durationFrames / 2
  let scale: number
  let glowIntensity: number

  if (localFrame <= halfDuration) {
    // Scale up: 1.0 -> maxScale
    const upProgress = spring({
      frame: localFrame,
      fps,
      config: { damping: 10, stiffness: 300, mass: 0.4 },
    })
    scale = interpolate(upProgress, [0, 1], [1.0, maxScale])
    glowIntensity = interpolate(upProgress, [0, 1], [0, 1])
  } else {
    // Scale down: maxScale -> 1.0
    const downProgress = spring({
      frame: localFrame - halfDuration,
      fps,
      config: { damping: 14, stiffness: 200, mass: 0.5 },
    })
    scale = interpolate(downProgress, [0, 1], [maxScale, 1.0])
    glowIntensity = interpolate(downProgress, [0, 1], [1, 0])
  }

  const glowShadow = showGlow && glowIntensity > 0
    ? `0 0 ${20 * glowIntensity}px ${glowColor}${Math.round(glowIntensity * 60).toString(16).padStart(2, '0')}`
    : 'none'

  return (
    <div
      style={{
        display: 'inline-block',
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        filter: showGlow && glowIntensity > 0
          ? `drop-shadow(${glowShadow})`
          : undefined,
      }}
    >
      {children}
    </div>
  )
}
