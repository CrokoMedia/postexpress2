import React, { useMemo } from 'react'
import { AbsoluteFill } from 'remotion'
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from '@remotion/transitions'

// Configuracao da grid de blocos
export type PixelTransitionProps = {
  gridSize?: number // Numero de colunas/linhas (default: 8)
}

/**
 * Componente de transicao pixel dissolve.
 * Cria uma grid de blocos que aparecem/desaparecem progressivamente
 * com timing baseado na distancia do centro (efeito espiral).
 */
const PixelTransitionPresentation: React.FC<
  TransitionPresentationComponentProps<PixelTransitionProps>
> = ({
  children,
  presentationDirection,
  presentationProgress,
  passedProps,
}) => {
  const gridSize = passedProps.gridSize ?? 8
  const isEntering = presentationDirection === 'entering'

  // Gerar ordem dos blocos baseado em distancia do centro (efeito espiral)
  const blockOrder = useMemo(() => {
    const centerX = (gridSize - 1) / 2
    const centerY = (gridSize - 1) / 2
    const blocks: { row: number; col: number; dist: number }[] = []

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const dist = Math.sqrt(
          Math.pow(col - centerX, 2) + Math.pow(row - centerY, 2)
        )
        blocks.push({ row, col, dist })
      }
    }

    // Ordenar do centro para fora
    blocks.sort((a, b) => a.dist - b.dist)

    // Normalizar: cada bloco recebe um threshold (0-1) de quando deve aparecer
    const maxDist = blocks[blocks.length - 1]?.dist ?? 1
    return blocks.map((b) => ({
      ...b,
      threshold: maxDist > 0 ? b.dist / maxDist : 0,
    }))
  }, [gridSize])

  // Gerar clip-path que revela progressivamente os blocos
  const clipPath = useMemo(() => {
    // Para o slide entrando: revelamos blocos conforme progress avanca
    // Para o slide saindo: escondemos blocos conforme progress avanca
    const progress = isEntering ? presentationProgress : 1 - presentationProgress

    // Cada bloco e um retangulo no clip-path
    const cellW = 100 / gridSize
    const cellH = 100 / gridSize
    const rects: string[] = []

    for (const block of blockOrder) {
      // O bloco fica visivel se o progress ultrapassou seu threshold
      // Usar margem de 0.3 para overlap suave
      const blockProgress = Math.max(
        0,
        Math.min(1, (progress - block.threshold * 0.7) / 0.3)
      )

      if (blockProgress > 0) {
        const x = block.col * cellW
        const y = block.row * cellH
        // Bloco cresce do centro para fora conforme seu progress individual
        const size = blockProgress
        const halfW = (cellW * size) / 2
        const halfH = (cellH * size) / 2
        const cx = x + cellW / 2
        const cy = y + cellH / 2

        rects.push(
          `M ${cx - halfW} ${cy - halfH} L ${cx + halfW} ${cy - halfH} L ${cx + halfW} ${cy + halfH} L ${cx - halfW} ${cy + halfH} Z`
        )
      }
    }

    if (rects.length === 0) return 'polygon(0 0, 0 0, 0 0)'

    // Usar SVG path como clip-path nao funciona diretamente em CSS.
    // Em vez disso, usar inset rects compostos com polygon points.
    // Alternativa: usar opacity por bloco via overlay div approach.
    return undefined
  }, [isEntering, presentationProgress, blockOrder, gridSize])

  // Abordagem alternativa: usar grid overlay com blocos individuais
  const containerStyle: React.CSSProperties = useMemo(() => ({
    width: '100%',
    height: '100%',
    position: 'relative' as const,
  }), [])

  const overlayStyle: React.CSSProperties = useMemo(() => ({
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'grid',
    gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
    gridTemplateRows: `repeat(${gridSize}, 1fr)`,
    zIndex: 1,
    pointerEvents: 'none' as const,
  }), [gridSize])

  // Para o slide entrando: comecamos com blocos opacos (preto) e removemos progressivamente
  // Para o slide saindo: comecamos sem blocos e adicionamos progressivamente
  const progress = isEntering ? presentationProgress : 1 - presentationProgress

  return (
    <AbsoluteFill style={containerStyle}>
      <AbsoluteFill>{children}</AbsoluteFill>
      <div style={overlayStyle}>
        {blockOrder.map((block, idx) => {
          // O bloco (mascara) deve desaparecer quando o slide fica visivel
          const blockOpacity = Math.max(
            0,
            Math.min(1, 1 - (progress - block.threshold * 0.7) / 0.3)
          )

          return (
            <div
              key={idx}
              style={{
                gridColumn: block.col + 1,
                gridRow: block.row + 1,
                backgroundColor: '#000',
                opacity: blockOpacity,
              }}
            />
          )
        })}
      </div>
    </AbsoluteFill>
  )
}

/**
 * Transicao Pixel Dissolve: grid de blocos que aparecem progressivamente
 * do centro para as bordas, criando efeito de pixelacao.
 */
export const pixelTransition = (
  props?: PixelTransitionProps
): TransitionPresentation<PixelTransitionProps> => {
  return {
    component: PixelTransitionPresentation,
    props: props ?? {},
  }
}
