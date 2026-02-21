import React from 'react'
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from 'remotion'

/**
 * AnimatedCounter — number that counts from 0 to targetValue using spring.
 * Displays the number with configurable suffix (%, /100, k, etc.)
 * and smooth spring-based animation for organic feeling.
 */

interface AnimatedCounterProps {
  /** Target value to count up to */
  targetValue: number
  /** Suffix displayed after the number (e.g., "%", "/100", "k") */
  suffix?: string
  /** Frame at which animation starts (default: 0) */
  startFrame?: number
  /** Duration of the count animation in frames (default: 40) */
  durationFrames?: number
  /** Font size in pixels (default: 48) */
  fontSize?: number
  /** Text color (default: inherit) */
  color?: string
  /** Font weight (default: 700) */
  fontWeight?: number
  /** Whether to show 1 decimal place (default: false = integers only) */
  showDecimal?: boolean
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  targetValue,
  suffix = '',
  startFrame = 0,
  durationFrames = 40,
  fontSize = 48,
  color,
  fontWeight = 700,
  showDecimal = false,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Spring-based progress for organic feeling
  const progress = spring({
    frame: Math.max(0, frame - startFrame),
    fps,
    config: {
      damping: 20,
      stiffness: 100,
      mass: 0.8,
    },
  })

  // Also clamp with linear interpolation for the duration
  const linearProgress = interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  )

  // Use the minimum of spring and linear so the animation never exceeds durationFrames
  const effectiveProgress = Math.min(progress, linearProgress > 0.98 ? 1 : progress)

  const currentValue = targetValue * effectiveProgress

  // Format the display value
  const displayValue = showDecimal
    ? currentValue.toFixed(1)
    : Math.round(currentValue).toString()

  return (
    <span
      style={{
        fontSize,
        fontWeight,
        color,
        fontVariantNumeric: 'tabular-nums',
        display: 'inline-block',
        lineHeight: 1.2,
      }}
    >
      {displayValue}
      {suffix && (
        <span style={{ fontSize: fontSize * 0.65, fontWeight: 500 }}>
          {suffix}
        </span>
      )}
    </span>
  )
}
