import React from 'react'
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from 'remotion'
import type { CaptionWord, CaptionStyle, LayoutFormat } from '../types'

/**
 * Configuração de tipografia por formato de layout.
 * Garante que as legendas se adaptem ao tamanho do vídeo.
 */
const CAPTION_LAYOUT_CONFIG: Record<
  LayoutFormat,
  { fontSize: number; maxLines: number }
> = {
  feed: { fontSize: 28, maxLines: 2 },
  story: { fontSize: 32, maxLines: 3 },
  square: { fontSize: 24, maxLines: 2 },
}

/**
 * Número de palavras exibidas simultaneamente na janela de contexto.
 * Mostramos as palavras ao redor da palavra ativa.
 */
const CONTEXT_WINDOW_SIZE = 5
const TIKTOK_CONTEXT_WINDOW = 3

interface AnimatedCaptionsProps {
  captions: CaptionWord[]
  style: CaptionStyle
  position: 'bottom' | 'center' | 'top'
  layout?: LayoutFormat
  fontSize?: number
  highlightColor?: string
  startFrame: number // frame onde esta legenda começa no vídeo total
}

/**
 * Componente de legendas animadas estilo CapCut/Hormozi.
 *
 * Três estilos disponíveis:
 * - highlight: palavra atual com background colorido, restante em branco
 * - karaoke: texto muda de cor progressivamente (esquerda para direita)
 * - bounce: palavra atual com animação spring de escala
 * - tiktok-viral: pills individuais, keyword highlight, spring pop agressivo
 */
export const AnimatedCaptions: React.FC<AnimatedCaptionsProps> = ({
  captions,
  style = 'highlight',
  position = 'bottom',
  layout = 'feed',
  fontSize: fontSizeOverride,
  highlightColor = '#FACC15', // amarelo (yellow-400)
  startFrame,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  if (!captions || captions.length === 0) {
    return null
  }

  const layoutConfig = CAPTION_LAYOUT_CONFIG[layout]
  const effectiveFontSize = fontSizeOverride || layoutConfig.fontSize

  // Frame relativo ao início desta legenda
  const relativeFrame = frame - startFrame
  // Converter frame atual para milissegundos
  const currentMs = (relativeFrame / fps) * 1000

  // Encontrar índice da palavra ativa
  const activeWordIndex = captions.findIndex(
    (w) => currentMs >= w.startMs && currentMs <= w.endMs
  )

  // Se nenhuma palavra ativa, verificar se estamos entre palavras
  // (mostrar a última palavra que já passou)
  const displayIndex =
    activeWordIndex >= 0
      ? activeWordIndex
      : captions.findIndex((w) => currentMs < w.startMs) - 1

  // Se ainda não começou ou já acabou, não mostrar
  if (displayIndex < 0 && activeWordIndex < 0) {
    // Verificar se estamos antes da primeira palavra
    if (currentMs < (captions[0]?.startMs ?? 0)) {
      return null
    }
    // Se estamos depois da última palavra, mostrar a última janela
    if (currentMs > (captions[captions.length - 1]?.endMs ?? 0)) {
      return null
    }
  }

  const currentIndex = Math.max(0, activeWordIndex >= 0 ? activeWordIndex : displayIndex)

  // TikTok viral usa janela menor (mais compacto e impactante)
  const isTikTokViral = style === 'tiktok-viral'
  const isFloatingChips = style === 'floating-chips'
  const windowSize = isTikTokViral ? TIKTOK_CONTEXT_WINDOW : CONTEXT_WINDOW_SIZE

  // Calcular janela de palavras ao redor da ativa
  const halfWindow = Math.floor(windowSize / 2)
  let windowStart = Math.max(0, currentIndex - halfWindow)
  let windowEnd = Math.min(captions.length, windowStart + windowSize)

  // Ajustar se a janela ficou menor no final
  if (windowEnd - windowStart < windowSize) {
    windowStart = Math.max(0, windowEnd - windowSize)
  }

  const visibleWords = captions.slice(windowStart, windowEnd)

  // Posicionamento vertical (tiktok-viral e floating-chips default: center)
  const effectivePosition = (isTikTokViral || isFloatingChips) && position === 'bottom' ? 'center' : position
  const positionStyle: React.CSSProperties =
    effectivePosition === 'top'
      ? { top: 120, left: 40, right: 40 }
      : effectivePosition === 'center'
        ? { top: '50%', left: 40, right: 40, transform: 'translateY(-50%)' }
        : { bottom: 80, left: 40, right: 40 }

  return (
    <div
      style={{
        position: 'absolute',
        ...positionStyle,
        zIndex: 10,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          // TikTok viral e floating-chips: sem background unico (cada palavra tem pill proprio)
          backgroundColor: (isTikTokViral || isFloatingChips) ? 'transparent' : 'rgba(0, 0, 0, 0.6)',
          borderRadius: (isTikTokViral || isFloatingChips) ? 0 : 8,
          padding: (isTikTokViral || isFloatingChips) ? '0' : '12px 20px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: isFloatingChips ? 6 : isTikTokViral ? 8 : 6,
          maxWidth: '100%',
        }}
      >
        {visibleWords.map((word, localIdx) => {
          const globalIdx = windowStart + localIdx
          const isActive = globalIdx === currentIndex && activeWordIndex >= 0

          return (
            <CaptionWordSpan
              key={`${globalIdx}-${word.word}`}
              word={word}
              isActive={isActive}
              globalIndex={globalIdx}
              activeIndex={currentIndex}
              style={style}
              fontSize={effectiveFontSize}
              highlightColor={highlightColor}
              currentMs={currentMs}
              fps={fps}
              frame={relativeFrame}
            />
          )
        })}
      </div>
    </div>
  )
}

/**
 * Componente individual para cada palavra na legenda.
 * Aplica o estilo de animação correto.
 */
interface CaptionWordSpanProps {
  word: CaptionWord
  isActive: boolean
  globalIndex: number
  activeIndex: number
  style: CaptionStyle
  fontSize: number
  highlightColor: string
  currentMs: number
  fps: number
  frame: number
}

const CaptionWordSpan: React.FC<CaptionWordSpanProps> = ({
  word,
  isActive,
  globalIndex,
  activeIndex,
  style: captionStyle,
  fontSize,
  highlightColor,
  currentMs,
  fps,
  frame,
}) => {
  // Estilo base
  const baseStyle: React.CSSProperties = {
    fontSize,
    fontWeight: 700,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    lineHeight: 1.4,
    display: 'inline-block',
  }

  if (captionStyle === 'highlight') {
    return renderHighlight(word, isActive, baseStyle, highlightColor)
  }

  if (captionStyle === 'karaoke') {
    return renderKaraoke(
      word,
      globalIndex,
      activeIndex,
      baseStyle,
      highlightColor,
      currentMs
    )
  }

  if (captionStyle === 'bounce') {
    return renderBounce(word, isActive, baseStyle, highlightColor, fps, frame)
  }

  if (captionStyle === 'tiktok-viral') {
    return renderTikTokViral(word, isActive, baseStyle, highlightColor, fps, frame)
  }

  if (captionStyle === 'floating-chips') {
    return renderFloatingChips(
      word,
      isActive,
      globalIndex,
      activeIndex,
      baseStyle,
      highlightColor,
      fps,
      frame,
      currentMs
    )
  }

  // Fallback para highlight
  return renderHighlight(word, isActive, baseStyle, highlightColor)
}

/**
 * Estilo Highlight: palavra atual com background colorido, restante em branco.
 */
function renderHighlight(
  word: CaptionWord,
  isActive: boolean,
  baseStyle: React.CSSProperties,
  highlightColor: string
) {
  return (
    <span
      style={{
        ...baseStyle,
        color: isActive ? '#000000' : '#FFFFFF',
        backgroundColor: isActive ? highlightColor : 'transparent',
        borderRadius: isActive ? 4 : 0,
        padding: isActive ? '2px 6px' : '2px 0',
        transition: 'all 0.05s ease',
      }}
    >
      {word.word}
    </span>
  )
}

/**
 * Estilo Karaoke: palavras já passadas ficam coloridas, futuras ficam brancas.
 * A palavra ativa faz uma transição progressiva de cor.
 */
function renderKaraoke(
  word: CaptionWord,
  globalIndex: number,
  activeIndex: number,
  baseStyle: React.CSSProperties,
  highlightColor: string,
  currentMs: number
) {
  const isPast = globalIndex < activeIndex
  const isCurrent = globalIndex === activeIndex
  const isFuture = globalIndex > activeIndex

  let color = '#FFFFFF'
  let opacity = 0.6

  if (isPast) {
    color = highlightColor
    opacity = 1
  } else if (isCurrent) {
    // Progressão dentro da palavra atual
    const wordDuration = word.endMs - word.startMs
    const elapsed = currentMs - word.startMs
    const progress = wordDuration > 0 ? Math.max(0, Math.min(1, elapsed / wordDuration)) : 0

    // Interpolar entre branco e cor de destaque
    if (progress > 0.3) {
      color = highlightColor
    }
    opacity = interpolate(progress, [0, 1], [0.7, 1])
  } else if (isFuture) {
    color = '#FFFFFF'
    opacity = 0.5
  }

  return (
    <span
      style={{
        ...baseStyle,
        color,
        opacity,
      }}
    >
      {word.word}
    </span>
  )
}

/**
 * Estilo Bounce: palavra ativa tem animação spring de escala.
 * As demais ficam em tamanho normal e cor mais suave.
 */
function renderBounce(
  word: CaptionWord,
  isActive: boolean,
  baseStyle: React.CSSProperties,
  highlightColor: string,
  fps: number,
  frame: number
) {
  // Spring para escala quando a palavra fica ativa
  const scaleSpring = isActive
    ? spring({
        frame,
        fps,
        config: { damping: 8, stiffness: 200, mass: 0.5 },
      })
    : 0

  const scale = isActive ? interpolate(scaleSpring, [0, 1], [1.0, 1.25]) : 1.0

  return (
    <span
      style={{
        ...baseStyle,
        color: isActive ? highlightColor : '#FFFFFF',
        transform: `scale(${scale})`,
        transformOrigin: 'center',
        opacity: isActive ? 1 : 0.7,
      }}
    >
      {word.word}
    </span>
  )
}

/**
 * Estilo TikTok Viral: cada palavra em pill individual com spring pop.
 * Keywords (isKeyword=true) ficam sempre em cor de destaque.
 * Palavra ativa: scale 1.3x, background amarelo, texto preto.
 */
function renderTikTokViral(
  word: CaptionWord,
  isActive: boolean,
  baseStyle: React.CSSProperties,
  highlightColor: string,
  fps: number,
  frame: number
) {
  const popScale = isActive
    ? spring({
        frame,
        fps,
        config: { damping: 10, stiffness: 400, mass: 0.3 },
      })
    : 0

  const scale = isActive ? interpolate(popScale, [0, 1], [0.8, 1.3]) : 1.0
  const isKeyword = word.isKeyword

  return (
    <span
      style={{
        ...baseStyle,
        display: 'inline-block',
        color: isActive ? '#000000' : isKeyword ? highlightColor : '#FFFFFF',
        backgroundColor: isActive ? highlightColor : 'rgba(0, 0, 0, 0.65)',
        borderRadius: 10,
        padding: '6px 14px',
        margin: '2px 3px',
        transform: `scale(${scale})`,
        transformOrigin: 'center',
        fontWeight: isActive || isKeyword ? 900 : 700,
        fontSize: isActive
          ? (baseStyle.fontSize as number) * 1.15
          : baseStyle.fontSize,
        // Keywords inativos: borda sutil para destaque
        ...(isKeyword && !isActive
          ? { border: `2px solid ${highlightColor}` }
          : {}),
      }}
    >
      {word.word}
    </span>
  )
}

/**
 * Estilo Floating Chips: cada palavra como pill/chip flutuante premium.
 * Entry: spring de baixo (translateY 20→0) + scale (0.5→1.0)
 * Palavra ativa: scale 1.1, cor de destaque, boxShadow glow
 * Palavras passadas: opacity 0.5, scale 0.9
 * Palavras futuras (na janela): opacity parcial, prontas para ativar
 */
function renderFloatingChips(
  word: CaptionWord,
  isActive: boolean,
  globalIndex: number,
  activeIndex: number,
  baseStyle: React.CSSProperties,
  highlightColor: string,
  fps: number,
  frame: number,
  currentMs: number
) {
  const isPast = globalIndex < activeIndex
  const isFuture = globalIndex > activeIndex

  // Entry spring: cada chip faz spring ao entrar na janela de contexto
  // Usa globalIndex como offset determinístico para stagger
  const entryDelay = globalIndex * 2 // stagger de 2 frames por chip
  const entryFrame = Math.max(0, frame - entryDelay)

  const entrySpring = spring({
    frame: entryFrame,
    fps,
    config: { damping: 12, stiffness: 120, mass: 0.6 },
  })

  // translateY: 20→0 (entra de baixo)
  const translateY = interpolate(entrySpring, [0, 1], [20, 0])

  // scale base da entrada: 0.5→1.0
  const entryScale = interpolate(entrySpring, [0, 1], [0.5, 1.0])

  // Opacidade de entrada
  const entryOpacity = interpolate(entrySpring, [0, 1], [0, 1])

  // Active word pop: spring quando a palavra fica ativa
  const activeSpring = isActive
    ? spring({
        frame,
        fps,
        config: { damping: 10, stiffness: 200, mass: 0.4 },
      })
    : 0

  // Calcular scale final com base no estado da palavra
  let finalScale: number
  if (isActive) {
    finalScale = entryScale * interpolate(activeSpring, [0, 1], [1.0, 1.1])
  } else if (isPast) {
    finalScale = entryScale * 0.9
  } else {
    finalScale = entryScale
  }

  // Calcular opacidade final
  let finalOpacity: number
  if (isActive) {
    finalOpacity = 1
  } else if (isPast) {
    finalOpacity = entryOpacity * 0.5
  } else if (isFuture) {
    finalOpacity = entryOpacity * 0.7
  } else {
    finalOpacity = entryOpacity
  }

  // Exit: palavras passadas sobem levemente
  const exitY = isPast ? translateY - 5 : translateY

  // Background do chip: cor de destaque com opacidade baixa (0x22 = 13%)
  // Ativo: cor completa com glow
  const chipBackground = isActive
    ? highlightColor
    : `${highlightColor}22`

  const chipColor = isActive ? '#000000' : '#FFFFFF'

  const chipShadow = isActive
    ? `0 0 20px ${highlightColor}66, 0 4px 12px rgba(0, 0, 0, 0.3)`
    : '0 2px 8px rgba(0, 0, 0, 0.2)'

  return (
    <span
      style={{
        ...baseStyle,
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 14px',
        borderRadius: 20,
        background: chipBackground,
        color: chipColor,
        fontSize: isActive
          ? (baseStyle.fontSize as number) * 1.05
          : baseStyle.fontSize,
        fontWeight: isActive ? 800 : 700,
        margin: '3px',
        transform: `translateY(${exitY}px) scale(${finalScale})`,
        transformOrigin: 'center',
        opacity: finalOpacity,
        boxShadow: chipShadow,
      }}
    >
      {word.word}
    </span>
  )
}
