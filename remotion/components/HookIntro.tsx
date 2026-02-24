import React, { useState, useCallback } from 'react'
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Img,
} from 'remotion'

/** Img seguro com fallback para URLs externas que podem falhar (CORS/expiradas) */
const SafeHookImg: React.FC<{ src: string; style: React.CSSProperties }> = ({ src, style }) => {
  const [failed, setFailed] = useState(false)
  const onError = useCallback(() => setFailed(true), [])
  if (failed) return <div style={{ ...style, background: '#1a1a2e' }} />
  return <Img src={src} style={style} onError={onError} />
}
import type { LayoutFormat } from '../types'

interface HookIntroProps {
  hookText: string
  backgroundImageUrl?: string
  format: LayoutFormat
}

/**
 * Componente de Hook Visual (primeiros 2 segundos do reel).
 * Mostra texto impactante com animacoes de entrada e saida.
 *
 * Timeline (60 frames @30fps = 2s):
 * - Frame 0-10: background fade-in
 * - Frame 5-25: texto aparece com spring scale (0.7 -> 1.0)
 * - Frame 25-45: texto estavel, sutil zoom-in no background
 * - Frame 50-60: fade-out rapido para transicao
 */
export const HookIntro: React.FC<HookIntroProps> = ({
  hookText,
  backgroundImageUrl,
  format,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Tamanho da fonte por formato
  const fontSize = format === 'story' ? 72 : format === 'square' ? 56 : 64

  // Background fade-in (frames 0-10)
  const backgroundOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Texto aparece com spring scale (frames 5-25)
  const textScale = spring({
    frame: frame - 5,
    fps,
    config: {
      damping: 12,
      stiffness: 100,
      mass: 0.8,
    },
    durationInFrames: 20,
  })

  // Mapear spring para range 0.7 -> 1.0
  const mappedTextScale = interpolate(textScale, [0, 1], [0.7, 1.0])

  // Opacidade do texto (aparece junto com o scale)
  const textOpacity = interpolate(frame, [5, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Sutil zoom-in no background (frames 25-45)
  const backgroundScale = interpolate(frame, [0, 45], [1.0, 1.05], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Fade-out rapido (frames 50-60)
  const fadeOutOpacity = interpolate(frame, [50, 60], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

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
            {/* Imagem de fundo com blur */}
            <AbsoluteFill
              style={{
                transform: `scale(${backgroundScale})`,
              }}
            >
              <SafeHookImg
                src={backgroundImageUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'blur(20px)',
                }}
              />
            </AbsoluteFill>
            {/* Overlay escuro sobre a imagem */}
            <AbsoluteFill
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              }}
            />
          </>
        ) : (
          /* Gradient escuro padrao (sem imagem de fundo) */
          <AbsoluteFill
            style={{
              background:
                'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
              transform: `scale(${backgroundScale})`,
            }}
          />
        )}
      </AbsoluteFill>

      {/* Texto centralizado */}
      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 60px',
        }}
      >
        <div
          style={{
            transform: `scale(${mappedTextScale})`,
            opacity: textOpacity,
            fontSize,
            fontWeight: 700,
            color: '#ffffff',
            textAlign: 'center',
            lineHeight: 1.3,
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.6), 0 4px 16px rgba(0, 0, 0, 0.4)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            maxWidth: '100%',
            wordWrap: 'break-word',
          }}
        >
          {hookText}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
