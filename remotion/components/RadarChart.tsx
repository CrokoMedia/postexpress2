import React from 'react'
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from 'remotion'

interface ScoreAxis {
  label: string
  value: number
  color: string
}

interface RadarChartProps {
  scores: ScoreAxis[]
  size?: number
  animated?: boolean
}

/**
 * Gera os pontos de um polígono regular (pentágono) para o radar chart.
 * O ângulo inicial é -90 graus (topo) para que o primeiro eixo fique no topo.
 */
function getPolygonPoint(
  centerX: number,
  centerY: number,
  radius: number,
  index: number,
  total: number
): { x: number; y: number } {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2
  return {
    x: centerX + radius * Math.cos(angle),
    y: centerY + radius * Math.sin(angle),
  }
}

/**
 * Gera string de pontos SVG para um polígono
 */
function polygonPoints(
  centerX: number,
  centerY: number,
  radius: number,
  total: number
): string {
  return Array.from({ length: total })
    .map((_, i) => {
      const point = getPolygonPoint(centerX, centerY, radius, i, total)
      return `${point.x},${point.y}`
    })
    .join(' ')
}

export const RadarChart: React.FC<RadarChartProps> = ({
  scores,
  size = 400,
  animated = true,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const total = scores.length
  const centerX = size / 2
  const centerY = size / 2
  const maxRadius = size * 0.35
  const labelRadius = size * 0.47

  // Progresso da animacao do poligono de dados (cresce do centro)
  const growProgress = animated
    ? spring({
        frame,
        fps,
        config: { damping: 18, stiffness: 80 },
        delay: 10,
      })
    : 1

  // Opacidade dos labels
  const labelOpacity = animated
    ? interpolate(frame, [20, 40], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1

  // Opacidade dos valores nos vertices
  const valueOpacity = animated
    ? interpolate(frame, [30, 50], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1

  // Linhas de grade (3 niveis: 33%, 66%, 100%)
  const gridLevels = [0.33, 0.66, 1.0]

  // Pontos do poligono de dados (animados)
  const dataPoints = scores.map((score, i) => {
    const normalizedValue = Math.min(score.value, 100) / 100
    const animatedRadius = maxRadius * normalizedValue * growProgress
    return getPolygonPoint(centerX, centerY, animatedRadius, i, total)
  })

  const dataPolygonString = dataPoints
    .map((p) => `${p.x},${p.y}`)
    .join(' ')

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grade de fundo - poligonos concentricos */}
      {gridLevels.map((level, idx) => (
        <polygon
          key={`grid-${idx}`}
          points={polygonPoints(centerX, centerY, maxRadius * level, total)}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={1}
        />
      ))}

      {/* Eixos do centro para cada vertice */}
      {scores.map((_, i) => {
        const point = getPolygonPoint(centerX, centerY, maxRadius, i, total)
        return (
          <line
            key={`axis-${i}`}
            x1={centerX}
            y1={centerY}
            x2={point.x}
            y2={point.y}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={1}
          />
        )
      })}

      {/* Poligono de dados preenchido */}
      <polygon
        points={dataPolygonString}
        fill="rgba(124, 58, 237, 0.25)"
        stroke="#7c3aed"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />

      {/* Pontos (circulos) nos vertices dos dados */}
      {dataPoints.map((point, i) => (
        <circle
          key={`dot-${i}`}
          cx={point.x}
          cy={point.y}
          r={5}
          fill={scores[i].color}
          stroke="white"
          strokeWidth={1.5}
          opacity={valueOpacity}
        />
      ))}

      {/* Labels dos auditores */}
      {scores.map((score, i) => {
        const labelPoint = getPolygonPoint(
          centerX,
          centerY,
          labelRadius,
          i,
          total
        )
        return (
          <text
            key={`label-${i}`}
            x={labelPoint.x}
            y={labelPoint.y}
            textAnchor="middle"
            dominantBaseline="central"
            fill="rgba(255,255,255,0.85)"
            fontSize={14}
            fontWeight={600}
            fontFamily="system-ui, -apple-system, sans-serif"
            opacity={labelOpacity}
          >
            {score.label}
          </text>
        )
      })}

      {/* Valores numericos proximos aos pontos */}
      {dataPoints.map((point, i) => {
        // Offset do valor para fora do ponto
        const outerPoint = getPolygonPoint(
          centerX,
          centerY,
          maxRadius * (Math.min(scores[i].value, 100) / 100) + 18,
          i,
          total
        )
        const displayValue = animated
          ? Math.round(scores[i].value * growProgress)
          : scores[i].value
        return (
          <text
            key={`value-${i}`}
            x={outerPoint.x}
            y={outerPoint.y}
            textAnchor="middle"
            dominantBaseline="central"
            fill={scores[i].color}
            fontSize={16}
            fontWeight={700}
            fontFamily="system-ui, -apple-system, sans-serif"
            opacity={valueOpacity}
          >
            {displayValue}
          </text>
        )
      })}
    </svg>
  )
}
