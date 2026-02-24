import React from 'react'
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from 'remotion'

interface ScoreBarProps {
  label: string
  score: number
  maxScore: number
  color: string
  /** Delay em frames antes de iniciar a animacao */
  delay?: number
}

/**
 * Retorna a cor baseada no score normalizado (0-10 ou 0-100).
 * Vermelho < 50%, amarelo 50-70%, verde > 70%.
 */
function getScoreColor(score: number, maxScore: number): string {
  const ratio = score / maxScore
  if (ratio < 0.5) return '#ef4444' // vermelho
  if (ratio <= 0.7) return '#eab308' // amarelo
  return '#22c55e' // verde
}

export const ScoreBar: React.FC<ScoreBarProps> = ({
  label,
  score,
  maxScore,
  color,
  delay = 0,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Progresso da barra (cresce da esquerda)
  const barProgress = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 60 },
    delay,
  })

  // Valor animado do contador
  const animatedScore = Math.round(score * barProgress)

  // Cor dinamica baseada no score
  const dynamicColor = getScoreColor(score, maxScore)

  // Largura proporcional
  const barWidth = (score / maxScore) * 100 * barProgress

  // Opacidade do label
  const labelOpacity = interpolate(frame, [delay, delay + 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        width: '100%',
        opacity: labelOpacity,
      }}
    >
      {/* Label do auditor */}
      <div
        style={{
          width: 120,
          fontSize: 16,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.85)',
          textAlign: 'right',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          flexShrink: 0,
        }}
      >
        {label}
      </div>

      {/* Container da barra */}
      <div
        style={{
          flex: 1,
          height: 24,
          backgroundColor: 'rgba(255,255,255,0.08)',
          borderRadius: 12,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Barra preenchida */}
        <div
          style={{
            width: `${barWidth}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${color}, ${dynamicColor})`,
            borderRadius: 12,
            transition: 'none',
          }}
        />
      </div>

      {/* Valor numerico */}
      <div
        style={{
          width: 50,
          fontSize: 20,
          fontWeight: 700,
          color: dynamicColor,
          textAlign: 'left',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          flexShrink: 0,
        }}
      >
        {animatedScore}
      </div>
    </div>
  )
}
