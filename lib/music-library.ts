/**
 * Biblioteca de musicas de fundo para Reels (Remotion).
 *
 * IMPORTANTE: Os arquivos de audio NAO estao incluidos no repositorio.
 * Para usar musica de fundo, coloque seus proprios arquivos MP3 em:
 *   /public/audio/music/{mood}/track-1.mp3
 *
 * Exemplo de estrutura:
 *   public/audio/music/energetic/track-1.mp3
 *   public/audio/music/calm/track-1.mp3
 *   public/audio/music/corporate/track-1.mp3
 *   public/audio/music/inspiring/track-1.mp3
 *
 * Recomendacoes:
 *   - Use musicas royalty-free (ex: Epidemic Sound, Artlist, Pixabay Music)
 *   - Formato: MP3 128kbps ou superior
 *   - Duracao: 30s-120s (o Remotion faz loop automaticamente)
 *   - Volume sera ajustado automaticamente (15% com voiceover, 30% sem)
 */

export type MusicMood = 'energetic' | 'calm' | 'corporate' | 'inspiring'

export interface MusicTrack {
  id: string
  name: string
  mood: MusicMood
  durationSeconds: number
  /** URL publica acessivel pelo Remotion (servida via Next.js de /public) */
  url: string
}

export const MUSIC_MOODS: { id: MusicMood; name: string; icon: string; description: string }[] = [
  { id: 'energetic', name: 'Energetico', icon: 'zap', description: 'Upbeat, motivacional' },
  { id: 'calm', name: 'Calmo', icon: 'waves', description: 'Ambient, relaxante' },
  { id: 'corporate', name: 'Corporativo', icon: 'briefcase', description: 'Profissional, clean' },
  { id: 'inspiring', name: 'Inspirador', icon: 'sparkles', description: 'Cinematic, emocional' },
]

/**
 * Tracks placeholder — apontam para /public/audio/music/{mood}/track-1.mp3
 * Coloque seus proprios arquivos MP3 nestes caminhos para ativar a musica.
 */
export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'energetic-1',
    name: 'Energetico Track 1',
    mood: 'energetic',
    durationSeconds: 60,
    url: '/audio/music/energetic/track-1.mp3',
  },
  {
    id: 'calm-1',
    name: 'Calmo Track 1',
    mood: 'calm',
    durationSeconds: 60,
    url: '/audio/music/calm/track-1.mp3',
  },
  {
    id: 'corporate-1',
    name: 'Corporativo Track 1',
    mood: 'corporate',
    durationSeconds: 60,
    url: '/audio/music/corporate/track-1.mp3',
  },
  {
    id: 'inspiring-1',
    name: 'Inspirador Track 1',
    mood: 'inspiring',
    durationSeconds: 60,
    url: '/audio/music/inspiring/track-1.mp3',
  },
]

/**
 * Retorna um track para o mood especificado, ou null se nao disponivel.
 * Na API (server-side), verificamos se o arquivo existe em /public.
 * No client-side, retornamos o track sem verificacao de filesystem.
 */
export function getTrackForMood(mood: MusicMood): MusicTrack | null {
  const track = MUSIC_TRACKS.find((t) => t.mood === mood)
  return track ?? null
}

/**
 * Verifica se o arquivo de musica existe no filesystem (server-side only).
 * Retorna o track se existir, null caso contrario.
 */
export async function getVerifiedTrackForMood(mood: MusicMood): Promise<MusicTrack | null> {
  const track = getTrackForMood(mood)
  if (!track) return null

  try {
    const fs = await import('fs')
    const path = await import('path')
    const filePath = path.join(process.cwd(), 'public', track.url)
    fs.accessSync(filePath, fs.constants.R_OK)
    return track
  } catch {
    // Arquivo nao encontrado — musica nao disponivel para este mood
    return null
  }
}

/**
 * Calcula o volume adequado para musica de fundo.
 * - Com voiceover: 0.15 (15%) — musica sutil, nao compete com narracao
 * - Sem voiceover: 0.30 (30%) — musica mais presente como elemento principal
 */
export function getMusicVolume(hasVoiceover: boolean): number {
  return hasVoiceover ? 0.15 : 0.30
}
