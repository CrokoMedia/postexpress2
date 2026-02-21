import React from 'react'
import { Audio, useCurrentFrame, interpolate } from 'remotion'

interface BackgroundMusicProps {
  /** URL do arquivo de audio (publica, acessivel pelo Remotion) */
  src: string
  /** Volume alvo da musica (0-1). Default: 0.15 com voiceover, 0.30 sem */
  volume: number
  /** Total de frames do video (para calcular fade-out) */
  totalFrames: number
}

/**
 * Componente de musica de fundo para composicoes Remotion.
 *
 * Features:
 * - Fade-in: 0 → volume alvo nos primeiros 15 frames (0.5s a 30fps)
 * - Fade-out: volume alvo → 0 nos ultimos 30 frames (1s a 30fps)
 * - Loop automatico: se o reel for mais longo que a musica
 * - Volume controlado para nao competir com voiceover/narracao
 */
export const BackgroundMusic: React.FC<BackgroundMusicProps> = ({
  src,
  volume,
  totalFrames,
}) => {
  const frame = useCurrentFrame()

  // Fade-in: 0 → volume nos primeiros 15 frames (0.5s a 30fps)
  const fadeIn = interpolate(frame, [0, 15], [0, volume], {
    extrapolateRight: 'clamp',
  })

  // Fade-out: volume → 0 nos ultimos 30 frames (1s a 30fps)
  const fadeOut = interpolate(frame, [totalFrames - 30, totalFrames], [volume, 0], {
    extrapolateLeft: 'clamp',
  })

  // O volume atual e o menor entre fade-in e fade-out
  // Isso garante que ambos os fades funcionem corretamente
  const currentVolume = Math.min(fadeIn, fadeOut)

  return <Audio src={src} volume={currentVolume} loop />
}
