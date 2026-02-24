import React, { useState, useCallback } from 'react'
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Img,
} from 'remotion'
import type { LayoutFormat } from '../types'

/** Img seguro com fallback para URLs externas que podem falhar (CORS/expiradas) */
const SafeGlitchImg: React.FC<{ src: string; style: React.CSSProperties }> = ({ src, style }) => {
  const [failed, setFailed] = useState(false)
  const onError = useCallback(() => setFailed(true), [])
  if (failed) return <div style={{ ...style, background: '#0a0a0f' }} />
  return <Img src={src} style={style} onError={onError} />
}

interface GlitchHookIntroProps {
  hookText: string
  backgroundImageUrl?: string
  format: LayoutFormat
}

/**
 * Pseudo-random deterministico baseado em frame e seed.
 * Remotion requer determinismo — nao usar Math.random().
 * Retorna valor entre -1 e 1.
 */
function deterministicRandom(frame: number, seed: number): number {
  return Math.sin(frame * seed) * Math.cos(frame * seed * 0.7)
}

/**
 * Gera offset de glitch deterministico para um dado frame.
 * Retorna valor em pixels (pode ser negativo).
 */
function glitchOffset(frame: number, seed: number, maxOffset: number): number {
  const raw = deterministicRandom(frame, seed)
  return raw * maxOffset
}

/**
 * Componente de Hook Visual com efeito GLITCH (primeiros 2 segundos do reel).
 * Texto com distorcao RGB, barras de scan line e tremor digital.
 *
 * Timeline (60 frames @30fps = 2s):
 * - Frame 0-10: texto aparece com glitch forte (offset 5-15px, separacao RGB intensa)
 * - Frame 10-40: glitch intermitente (a cada 3-5 frames, offset aleatorio)
 * - Frame 40-50: glitch diminui, texto estabiliza
 * - Frame 50-60: fade-out suave
 */
export const GlitchHookIntro: React.FC<GlitchHookIntroProps> = ({
  hookText,
  backgroundImageUrl,
  format,
}) => {
  const frame = useCurrentFrame()

  // Tamanho da fonte por formato (mesmo padrao do HookIntro)
  const fontSize = format === 'story' ? 72 : format === 'square' ? 56 : 64

  // Primos para pseudo-random deterministico (cada layer usa um seed diferente)
  const SEED_RED = 7.31
  const SEED_CYAN = 13.17
  const SEED_MAIN = 5.43
  const SEED_SCAN = 11.89

  // --- Fase de intensidade do glitch ---
  // Frames 0-10: glitch forte (intensidade 1.0)
  // Frames 10-40: glitch intermitente (intensidade 0.3-0.7)
  // Frames 40-50: glitch diminui (intensidade -> 0)
  // Frames 50-60: sem glitch, fade-out
  let glitchIntensity: number
  if (frame <= 10) {
    // Fase 1: entrada forte
    glitchIntensity = interpolate(frame, [0, 3, 10], [0.5, 1.0, 0.8], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  } else if (frame <= 40) {
    // Fase 2: glitch intermitente — pulsa a cada poucos frames
    const pulse = Math.abs(Math.sin(frame * 1.7)) > 0.6 ? 1.0 : 0.0
    glitchIntensity = pulse * interpolate(frame, [10, 40], [0.7, 0.4], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  } else if (frame <= 50) {
    // Fase 3: estabilizacao
    glitchIntensity = interpolate(frame, [40, 50], [0.3, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  } else {
    glitchIntensity = 0
  }

  // Offsets RGB — separacao horizontal das layers vermelho e ciano
  const maxOffset = 15 * glitchIntensity
  const redOffsetX = glitchOffset(frame, SEED_RED, maxOffset)
  const cyanOffsetX = glitchOffset(frame, SEED_CYAN, -maxOffset)

  // Tremor vertical do texto principal
  const mainJitterY = glitchOffset(frame, SEED_MAIN, 4 * glitchIntensity)
  const mainJitterX = glitchOffset(frame, SEED_MAIN * 1.3, 3 * glitchIntensity)

  // Opacidade do texto (aparece nos primeiros frames)
  const textOpacity = interpolate(frame, [0, 5], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Fade-out nos ultimos 10 frames (50-60)
  const fadeOutOpacity = interpolate(frame, [50, 60], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Background fade-in
  const backgroundOpacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // --- Scan line bars (3-4 barras semi-transparentes em alturas pseudo-aleatorias) ---
  const scanLineBars: { top: string; height: string; opacity: number }[] = []
  if (glitchIntensity > 0.1) {
    const barCount = 4
    for (let b = 0; b < barCount; b++) {
      const barSeed = SEED_SCAN + b * 3.71
      // Posicao vertical pseudo-aleatoria (0-100%)
      const topPct = ((Math.sin(frame * barSeed) + 1) / 2) * 100
      // Altura da barra (2-8px equivalente em porcentagem)
      const heightPx = 2 + Math.abs(deterministicRandom(frame, barSeed * 1.5)) * 6
      scanLineBars.push({
        top: `${topPct}%`,
        height: `${heightPx}px`,
        opacity: glitchIntensity * 0.3,
      })
    }
  }

  // --- Clip-path para simular "corte" horizontal do glitch ---
  // Quando intensidade alta, aplica clip-path no layer vermelho/ciano
  // para simular blocos deslocados
  const clipRedTop = ((Math.sin(frame * 2.31) + 1) / 2) * 30
  const clipCyanTop = ((Math.sin(frame * 3.17) + 1) / 2) * 30
  const clipHeight = 10 + Math.abs(deterministicRandom(frame, 9.43)) * 20
  const redClipPath = glitchIntensity > 0.3
    ? `inset(${clipRedTop}% 0 ${100 - clipRedTop - clipHeight}% 0)`
    : 'none'
  const cyanClipPath = glitchIntensity > 0.3
    ? `inset(${clipCyanTop}% 0 ${100 - clipCyanTop - clipHeight}% 0)`
    : 'none'

  // Estilo base do texto (compartilhado entre as 3 layers)
  const baseTextStyle: React.CSSProperties = {
    fontSize,
    fontWeight: 800,
    textAlign: 'center',
    lineHeight: 1.3,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    maxWidth: '100%',
    wordWrap: 'break-word',
    letterSpacing: '-0.02em',
  }

  return (
    <AbsoluteFill
      style={{
        opacity: fadeOutOpacity,
      }}
    >
      {/* Background layer */}
      <AbsoluteFill
        style={{
          opacity: backgroundOpacity,
        }}
      >
        {backgroundImageUrl ? (
          <>
            {/* Imagem de fundo com blur pesado */}
            <AbsoluteFill>
              <SafeGlitchImg
                src={backgroundImageUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'blur(25px) brightness(0.4)',
                }}
              />
            </AbsoluteFill>
            {/* Overlay escuro com tint azulado (para sensacao digital) */}
            <AbsoluteFill
              style={{
                backgroundColor: 'rgba(5, 5, 20, 0.75)',
              }}
            />
          </>
        ) : (
          /* Background escuro padrao (sem imagem de fundo) */
          <AbsoluteFill
            style={{
              background:
                'linear-gradient(135deg, #050510 0%, #0a0a1e 50%, #0d1020 100%)',
            }}
          />
        )}
      </AbsoluteFill>

      {/* Noise/grain overlay sutil (efeito de ruido digital via CSS) */}
      <AbsoluteFill
        style={{
          opacity: 0.06 + glitchIntensity * 0.08,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px',
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
        }}
      />

      {/* Scan line bars — barras horizontais semi-transparentes */}
      {scanLineBars.map((bar, idx) => (
        <div
          key={idx}
          style={{
            position: 'absolute',
            top: bar.top,
            left: 0,
            right: 0,
            height: bar.height,
            backgroundColor: `rgba(255, 255, 255, ${bar.opacity})`,
            pointerEvents: 'none',
            zIndex: 10,
          }}
        />
      ))}

      {/* Texto com 3 layers: red offset + cyan offset + white principal */}
      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 60px',
          opacity: textOpacity,
        }}
      >
        {/* Layer 1: Red (offset para direita) */}
        <div
          style={{
            ...baseTextStyle,
            position: 'absolute',
            color: 'rgba(255, 30, 30, 0.7)',
            transform: `translate(${redOffsetX}px, ${mainJitterY}px)`,
            clipPath: redClipPath,
            mixBlendMode: 'screen',
          }}
        >
          {hookText}
        </div>

        {/* Layer 2: Cyan (offset para esquerda) */}
        <div
          style={{
            ...baseTextStyle,
            position: 'absolute',
            color: 'rgba(30, 255, 255, 0.7)',
            transform: `translate(${cyanOffsetX}px, ${-mainJitterY * 0.5}px)`,
            clipPath: cyanClipPath,
            mixBlendMode: 'screen',
          }}
        >
          {hookText}
        </div>

        {/* Layer 3: White principal (com tremor sutil) */}
        <div
          style={{
            ...baseTextStyle,
            position: 'relative',
            color: '#ffffff',
            transform: `translate(${mainJitterX}px, ${mainJitterY}px)`,
            textShadow: `0 0 10px rgba(255, 255, 255, 0.5),
                          0 0 30px rgba(100, 100, 255, 0.2),
                          0 2px 8px rgba(0, 0, 0, 0.8)`,
          }}
        >
          {hookText}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
