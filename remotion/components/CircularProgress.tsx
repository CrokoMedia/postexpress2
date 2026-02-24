import React from 'react'
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from 'remotion'

/**
 * CircularProgress — SVG arc that fills progressively from 0 to (value/max * 360).
 * Uses stroke-dasharray and stroke-dashoffset for the arc animation.
 * Displays an animated central number.
 * Spring timing for organic feeling.
 */

interface CircularProgressProps {
  /** Current value */
  value: number
  /** Maximum value (default: 100) */
  max?: number
  /** Frame at which animation starts (default: 0) */
  startFrame?: number
  /** Accent color for the arc (default: #7c3aed) */
  accentColor?: string
  /** Size of the circle in pixels (default: 120) */
  size?: number
  /** Stroke width in pixels (default: 10) */
  strokeWidth?: number
  /** Color of the background track (default: rgba(255,255,255,0.15)) */
  trackColor?: string
  /** Font size of the central number (default: auto based on size) */
  fontSize?: number
  /** Color of the central number text (default: white) */
  textColor?: string
  /** Suffix for the central number (default: derived from max) */
  suffix?: string
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  startFrame = 0,
  accentColor = '#7c3aed',
  size = 120,
  strokeWidth = 10,
  trackColor = 'rgba(255,255,255,0.15)',
  fontSize,
  textColor = 'white',
  suffix,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Spring for arc animation
  const arcProgress = spring({
    frame: Math.max(0, frame - startFrame),
    fps,
    config: {
      damping: 22,
      stiffness: 80,
      mass: 1.2,
    },
  })

  // Spring for number count-up (slightly delayed for visual interest)
  const numberProgress = spring({
    frame: Math.max(0, frame - startFrame - 3),
    fps,
    config: {
      damping: 18,
      stiffness: 100,
      mass: 0.8,
    },
  })

  // Calculate SVG circle properties
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const fillRatio = Math.min(value / max, 1)
  const dashOffset = circumference - circumference * fillRatio * arcProgress

  // Animated number
  const displayValue = Math.round(value * numberProgress)

  // Auto-derive suffix if not provided
  const displaySuffix = suffix !== undefined ? suffix : (max === 100 ? '' : `/${max}`)

  // Auto font size based on circle size
  const effectiveFontSize = fontSize || Math.round(size * 0.22)
  const suffixFontSize = Math.round(effectiveFontSize * 0.6)

  // Fade-in opacity
  const opacity = interpolate(
    frame,
    [startFrame, startFrame + 8],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  )

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        opacity,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Animated arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={accentColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
        />
      </svg>
      {/* Central number */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <span
          style={{
            fontSize: effectiveFontSize,
            fontWeight: 700,
            color: textColor,
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
          }}
        >
          {displayValue}
          {displaySuffix && (
            <span style={{ fontSize: suffixFontSize, fontWeight: 500, opacity: 0.8 }}>
              {displaySuffix}
            </span>
          )}
        </span>
      </div>
    </div>
  )
}
