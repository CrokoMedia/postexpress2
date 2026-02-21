import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

/**
 * Componente de número animado que conta de 0 até o valor alvo.
 * Usa interpolate() do Remotion para animar frame a frame.
 * Útil para exibir métricas, scores, percentuais em slides data-driven.
 */

interface CountUpNumberProps {
  /** Valor final da animação */
  target: number
  /** Tamanho da fonte em px (padrão: 64) */
  fontSize?: number
  /** Cor do número (padrão: inherit) */
  color?: string
  /** Prefixo antes do número (ex: "R$", "+") */
  prefix?: string
  /** Sufixo após o número (ex: "%", "k", "x") */
  suffix?: string
  /** Frame em que a animação começa (padrão: 0) */
  startFrame?: number
  /** Duração da animação em frames (padrão: 30) */
  durationFrames?: number
  /** Peso da fonte (padrão: 700) */
  fontWeight?: number
}

export const CountUpNumber: React.FC<CountUpNumberProps> = ({
  target,
  fontSize = 64,
  color,
  prefix = '',
  suffix = '',
  startFrame = 0,
  durationFrames = 30,
  fontWeight = 700,
}) => {
  const frame = useCurrentFrame()

  // Interpola de 0 ao valor alvo durante a duração especificada
  const currentValue = interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [0, target],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  )

  // Arredonda para inteiro durante a animação, mostra o alvo exato no final
  const displayValue =
    frame >= startFrame + durationFrames
      ? target
      : Math.round(currentValue)

  return (
    <span
      style={{
        fontSize,
        fontWeight,
        color,
        fontVariantNumeric: 'tabular-nums',
        display: 'inline-block',
      }}
    >
      {prefix}
      {displayValue.toLocaleString('pt-BR')}
      {suffix}
    </span>
  )
}
