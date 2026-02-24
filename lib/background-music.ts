/**
 * Background Music — utilidade para musica de fundo em reels Remotion.
 *
 * Suporta volume ducking (volume reduzido quando voiceover esta ativo),
 * fade-in e fade-out automaticos.
 */

export interface BackgroundMusicConfig {
  url: string
  volume: number
  fadeInFrames: number
  fadeOutFrames: number
}

/**
 * Cria uma callback de volume para o componente <Audio> do Remotion.
 * - Fade-in nos primeiros frames
 * - Fade-out nos ultimos frames
 * - Volume reduzido pela metade quando ha voiceover (ducking)
 */
export function getMusicVolumeCallback(
  config: BackgroundMusicConfig,
  totalFrames: number,
  hasVoiceover: boolean
): (frame: number) => number {
  return (frame: number) => {
    // Volume base: reduzido se ha voiceover (ducking)
    const baseVolume = hasVoiceover ? config.volume * 0.5 : config.volume

    // Fade in
    if (frame < config.fadeInFrames) {
      return (frame / config.fadeInFrames) * baseVolume
    }

    // Fade out
    const fadeOutStart = totalFrames - config.fadeOutFrames
    if (frame > fadeOutStart) {
      const remaining = totalFrames - frame
      return (remaining / config.fadeOutFrames) * baseVolume
    }

    return baseVolume
  }
}
