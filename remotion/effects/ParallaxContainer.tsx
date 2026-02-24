import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion'

type ParallaxLayer = 0 | 1 | 2

interface ParallaxContainerProps {
  /** Depth layer: 0 = background (slow), 1 = middle (medium), 2 = foreground (fast/static) */
  layer: ParallaxLayer
  /** Maximum movement amplitude in pixels (default: 30) */
  amplitude?: number
  /** Pan direction (default: 'horizontal') */
  direction?: 'horizontal' | 'vertical'
  /** Whether to apply depth blur on background layer (default: true for layer 0) */
  depthBlur?: boolean
  children: React.ReactNode
}

/** Speed multiplier per layer — lower = slower movement = appears further away */
const LAYER_SPEED: Record<ParallaxLayer, number> = {
  0: 0.3,  // background: slow
  1: 0.6,  // middle: medium
  2: 1.0,  // foreground: fast (or static if desired)
}

/**
 * ParallaxContainer — Wrapper that applies a subtle parallax translation
 * to its children based on the current frame and depth layer.
 *
 * Creates a 3D depth sensation where background moves slower than foreground.
 * Maximum amplitude is 30px to keep the effect subtle and non-nauseating.
 *
 * Uses Remotion's deterministic interpolate() for frame-accurate animation.
 */
export const ParallaxContainer: React.FC<ParallaxContainerProps> = ({
  layer,
  amplitude = 30,
  direction = 'horizontal',
  depthBlur = false,
  children,
}) => {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()

  // Clamp amplitude to 30px max for subtlety
  const clampedAmplitude = Math.min(amplitude, 30)

  const speed = LAYER_SPEED[layer]

  // Calculate pan offset: left-to-right over the slide duration
  // Start position is negative (content shifted left), end is positive (shifted right)
  const startPos = -clampedAmplitude * speed
  const endPos = clampedAmplitude * speed

  const offset = interpolate(
    frame,
    [0, durationInFrames],
    [startPos, endPos],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  )

  const transform = direction === 'horizontal'
    ? `translateX(${offset}px)`
    : `translateY(${offset}px)`

  // Depth blur: subtle 2px blur on background layer for depth effect
  const shouldBlur = depthBlur && layer === 0
  const filter = shouldBlur ? 'blur(2px)' : undefined

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        transform,
        filter,
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  )
}
