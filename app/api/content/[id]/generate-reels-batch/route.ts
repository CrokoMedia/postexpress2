import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { getRemotionBundle } from '@/lib/remotion-bundle'
import { getServerlessRenderOptions } from '@/lib/remotion-chromium'
import { generateContentImage } from '@/lib/nano-banana'
import { generateAndUploadVoiceover } from '@/lib/tts'
import type { TTSVoice, TTSProvider } from '@/lib/tts'
import { getOrCreateSoundEffects } from '@/lib/sound-effects'
import type { SoundEffectUrls } from '@/lib/sound-effects'
import { transcribeMultipleAudios } from '@/lib/captions'
import type { CaptionWord } from '@/lib/captions'
import { getVerifiedTrackForMood, getMusicVolume } from '@/lib/music-library'
import type { MusicMood } from '@/lib/music-library'
import { createRequire } from 'module'
import cloudinary from 'cloudinary'

// CRITICAL: Force traditional require() to bypass Next.js bundler
const require = createRequire(import.meta.url)
import path from 'path'
import fs from 'fs'

// Allow up to 10 minutes for batch video rendering
export const maxDuration = 600

// Cloudinary config
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// ----- Types -----

interface BatchConfig {
  carouselIndex: number
  templateId: string
  format: string
  voiceover: boolean
  voice?: string
  ttsProvider?: string
  hookEnabled?: boolean
  hookText?: string
  soundEffects?: boolean
  captions?: boolean
  captionStyle?: string
  backgroundMusic?: boolean
  musicMood?: string
  textEffect?: string
}

interface BatchReelResult {
  carouselIndex: number
  title: string
  videoUrl: string
  cloudinaryPublicId: string
  duration: number
  totalSlides: number
  templateId: string
  format: string
  hasHook: boolean
  hasVoiceover: boolean
  hasCaptions: boolean
  hasSoundEffects: boolean
  hasBackgroundMusic: boolean
  ttsProvider?: string
  status: 'fulfilled'
}

interface BatchReelError {
  carouselIndex: number
  title: string
  templateId: string
  format: string
  error: string
  status: 'rejected'
}

type BatchReelOutcome = BatchReelResult | BatchReelError

// ----- Shared helpers -----

function isKeywordWord(word: string, originalText: string): boolean {
  const cleaned = word.replace(/[.,!?;:]/g, '').trim()
  if (cleaned.length <= 3) return false
  if (originalText.includes(cleaned.toUpperCase()) && cleaned === cleaned.toUpperCase()) return true
  if (originalText.includes(`**${cleaned}**`)) return true
  return false
}

function getSlideFields(slide: Record<string, string>): { titulo: string; corpo: string } {
  if (slide.titulo && slide.corpo) {
    return { titulo: slide.titulo, corpo: slide.corpo }
  }
  if (slide.titulo) {
    return { titulo: slide.titulo, corpo: '' }
  }
  if (slide.text) {
    const lines = slide.text.split('\n').filter((l: string) => l.trim())
    return {
      titulo: lines[0] || '',
      corpo: lines.slice(1).join('\n'),
    }
  }
  return { titulo: '', corpo: slide.content || '' }
}

// Bundle management moved to @/lib/remotion-bundle

// ----- Semaphore for concurrency control -----

class Semaphore {
  private queue: (() => void)[] = []
  private running = 0

  constructor(private maxConcurrency: number) {}

  async acquire(): Promise<void> {
    if (this.running < this.maxConcurrency) {
      this.running++
      return
    }
    return new Promise<void>((resolve) => {
      this.queue.push(() => {
        this.running++
        resolve()
      })
    })
  }

  release(): void {
    this.running--
    const next = this.queue.shift()
    if (next) {
      next()
    }
  }
}

// ----- Auto-variation logic -----

const AVAILABLE_TEMPLATES = ['minimalist', 'hormozi-dark', 'editorial-magazine', 'neon-social', 'data-driven']
const AVAILABLE_FORMATS = ['feed', 'story', 'square']

function generateAutoVariations(
  carousels: Record<string, unknown>[],
  approvedIndices: number[]
): BatchConfig[] {
  return approvedIndices.map((carouselIndex, i) => ({
    carouselIndex,
    templateId: AVAILABLE_TEMPLATES[i % AVAILABLE_TEMPLATES.length],
    format: AVAILABLE_FORMATS[i % AVAILABLE_FORMATS.length],
    voiceover: false,
  }))
}

// ----- Format mapping -----

const FORMAT_TO_COMPOSITION: Record<string, { compositionId: string; width: number; height: number }> = {
  feed: { compositionId: 'CarouselReel', width: 1080, height: 1350 },
  story: { compositionId: 'StoryReel', width: 1080, height: 1920 },
  square: { compositionId: 'SquareReel', width: 1080, height: 1080 },
}

// ----- Single reel rendering (extracted from generate-reel) -----

async function renderSingleReel(
  config: BatchConfig,
  carousel: Record<string, unknown>,
  auditId: string,
  profile: Record<string, unknown>,
  bundleLocation: string,
  sharedSoundEffectUrls: SoundEffectUrls | undefined,
  reelIndex: number,
  renderOptions: Record<string, unknown>,
  selectComposition: any,
  renderMedia: any
): Promise<BatchReelResult> {
  const carouselSlides = carousel.slides as Record<string, string>[]
  const carouselName = `batch-reel-${reelIndex + 1}`
  const formatConfig = FORMAT_TO_COMPOSITION[config.format] || FORMAT_TO_COMPOSITION.feed

  const nicheContext = [
    profile?.biography ? (profile.biography as string).substring(0, 150) : null,
    profile?.full_name ? `Expert: ${profile.full_name}` : null,
  ]
    .filter(Boolean)
    .join('. ')

  console.log(`  [Batch ${reelIndex + 1}] Processando reel (template: ${config.templateId}, format: ${config.format}, ${carouselSlides.length} slides)...`)

  // Step 1: Generate images via fal.ai
  const slidesWithImages = await Promise.all(
    carouselSlides.map(async (slide: Record<string, string>, j: number) => {
      const { titulo, corpo } = getSlideFields(slide)
      const imagemPrompt = slide.imagem_prompt || titulo || corpo

      try {
        const fullPrompt = [
          nicheContext ? `Context: ${nicheContext}.` : null,
          `Topic: ${imagemPrompt}`,
          'professional photography, photorealistic, high quality, sharp focus',
          'natural lighting, modern aesthetic, clean composition',
          'no text visible, no letters, no words, no typography in the image',
        ]
          .filter(Boolean)
          .join(', ')

        const contentImageUrl = await generateContentImage(fullPrompt)
        console.log(`  [Batch ${reelIndex + 1}] Imagem ${j + 1}/${carouselSlides.length} gerada`)
        return { titulo, corpo, contentImageUrl }
      } catch (err) {
        console.warn(`  [Batch ${reelIndex + 1}] Imagem ${j + 1} falhou, usando placeholder:`, err)
        return { titulo, corpo, contentImageUrl: '' }
      }
    })
  )

  // Step 2: Generate voiceover (if enabled)
  let audioUrls: string[] | undefined
  let slideDurations: number[] | undefined

  if (config.voiceover) {
    const voice = (config.voice || 'nova') as TTSVoice
    const ttsProvider = (config.ttsProvider || 'openai') as TTSProvider

    console.log(`  [Batch ${reelIndex + 1}] Gerando voiceover (provider: ${ttsProvider})...`)

    const voiceoverResults = []
    for (let j = 0; j < slidesWithImages.length; j++) {
      const slideContent = slidesWithImages[j]
      const narrationText = [slideContent.titulo, slideContent.corpo]
        .filter(Boolean)
        .join('. ')

      if (!narrationText.trim()) {
        voiceoverResults.push({ audioUrl: '', durationSeconds: 3 })
        continue
      }

      try {
        const result = await generateAndUploadVoiceover(narrationText, {
          voice,
          auditId,
          slideIndex: j,
          speed: 1.0,
          provider: ttsProvider,
        })
        voiceoverResults.push(result)
      } catch (err) {
        console.warn(`  [Batch ${reelIndex + 1}] Voiceover slide ${j + 1} falhou:`, err)
        voiceoverResults.push({ audioUrl: '', durationSeconds: 3 })
      }
    }

    audioUrls = voiceoverResults.map((r) => r.audioUrl)
    const FPS = 30
    slideDurations = voiceoverResults.map((r) =>
      Math.max(Math.ceil((r.durationSeconds + 0.5) * FPS), 90)
    )
  }

  // Step 2.5: Generate captions (if enabled and voiceover available)
  let captionDataPerSlide: CaptionWord[][] | undefined

  if (config.captions && config.voiceover && audioUrls) {
    const validAudioUrls = audioUrls.filter((url: string) => url && url.length > 0)

    if (validAudioUrls.length > 0) {
      console.log(`  [Batch ${reelIndex + 1}] Transcrevendo audios para legendas...`)

      const allCaptions = await transcribeMultipleAudios(
        audioUrls.map((url: string) => url || ''),
        2
      )

      captionDataPerSlide = allCaptions.map((captionData) => captionData.words)
    }
  }

  // Step 3: Resolve background music
  let backgroundMusicUrl: string | undefined
  let musicVolume: number | undefined

  if (config.backgroundMusic) {
    try {
      const track = await getVerifiedTrackForMood((config.musicMood || 'inspiring') as MusicMood)
      if (track) {
        backgroundMusicUrl = track.url
        musicVolume = getMusicVolume(config.voiceover)
      }
    } catch (err) {
      console.warn(`  [Batch ${reelIndex + 1}] Background music falhou:`, err)
    }
  }

  // Step 4: Build Remotion input props
  const inputProps: Record<string, unknown> = {
    slides: slidesWithImages.map((s, j) => ({
      titulo: s.titulo,
      corpo: s.corpo,
      contentImageUrl: s.contentImageUrl,
      slideNumber: j + 1,
      totalSlides: carouselSlides.length,
    })),
    profilePicUrl:
      (profile?.profile_pic_cloudinary_url as string) ||
      (profile?.profile_pic_url_hd as string) ||
      '',
    username: (profile?.username as string) || '',
    fullName: (profile?.full_name as string) || '',
    templateId: config.templateId,
    format: config.format,
    fps: 30,
    durationPerSlideFrames: 90,
    transitionFrames: 20,
  }

  // Hook visual
  if (config.hookEnabled) {
    inputProps.hookEnabled = true
    if (config.hookText) {
      inputProps.hookText = config.hookText
    }
  }

  // Voiceover props
  if (config.voiceover && audioUrls && slideDurations) {
    inputProps.voiceover = true
    inputProps.audioUrls = audioUrls
    inputProps.slideDurations = slideDurations
    inputProps.ttsProvider = config.ttsProvider
  }

  // Caption props
  if (config.captions && captionDataPerSlide) {
    inputProps.captionData = captionDataPerSlide
    inputProps.captionStyle = config.captionStyle || 'highlight'
  }

  // Sound effects
  if (config.soundEffects && sharedSoundEffectUrls) {
    inputProps.soundEffectUrls = sharedSoundEffectUrls
  }

  // Background music
  if (config.backgroundMusic && backgroundMusicUrl) {
    inputProps.backgroundMusicUrl = backgroundMusicUrl
    inputProps.musicVolume = musicVolume
  }

  // Text effect
  if (config.textEffect && config.textEffect !== 'none') {
    inputProps.textEffect = config.textEffect
  }

  // Step 5: Select composition
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: formatConfig.compositionId,
    inputProps,
    ...renderOptions,
  })

  console.log(
    `  [Batch ${reelIndex + 1}] Composicao: ${composition.durationInFrames} frames (${(composition.durationInFrames / 30).toFixed(1)}s)`
  )

  // Step 6: Render MP4
  const tempDir = path.join('/tmp', 'reels-batch', auditId)
  fs.mkdirSync(tempDir, { recursive: true })
  const outputPath = path.join(tempDir, `${carouselName}.mp4`)

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: 'h264',
    outputLocation: outputPath,
    inputProps,
    onProgress: ({ progress }: { progress: number }) => {
      if (Math.round(progress * 100) % 25 === 0) {
        console.log(
          `  [Batch ${reelIndex + 1}] Rendering: ${Math.round(progress * 100)}%`
        )
      }
    },
    ...renderOptions,
  })

  // Step 7: Upload to Cloudinary
  const uploadResult = await cloudinary.v2.uploader.upload(outputPath, {
    folder: `carousel-reels/${auditId}`,
    public_id: carouselName,
    resource_type: 'video',
    overwrite: true,
  })

  console.log(`  [Batch ${reelIndex + 1}] Upload Cloudinary: ${uploadResult.secure_url}`)

  // Cleanup temp file
  try {
    fs.unlinkSync(outputPath)
  } catch {
    // Ignore cleanup errors
  }

  return {
    carouselIndex: config.carouselIndex,
    title: (carousel.titulo as string) || `Carrossel ${config.carouselIndex + 1}`,
    videoUrl: uploadResult.secure_url,
    cloudinaryPublicId: uploadResult.public_id,
    duration: composition.durationInFrames / 30,
    totalSlides: carouselSlides.length,
    templateId: config.templateId,
    format: config.format,
    hasHook: config.hookEnabled === true,
    hasVoiceover: config.voiceover,
    hasCaptions: config.captions === true && !!captionDataPerSlide,
    hasSoundEffects: config.soundEffects === true && !!sharedSoundEffectUrls,
    hasBackgroundMusic: config.backgroundMusic === true && !!backgroundMusicUrl,
    ttsProvider: config.voiceover ? config.ttsProvider : undefined,
    status: 'fulfilled' as const,
  }
}

/**
 * POST - Batch generate animated Reels (MP4) from approved carousels using Remotion.
 *
 * Accepts an optional array of BatchConfig. If no configs are provided,
 * auto-variation is used: templates and formats are rotated cyclically.
 *
 * Processing happens in parallel with a max concurrency of 3 (semaphore).
 * Returns partial results (successful reels + errors).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      carousels,
      profile,
      configs: rawConfigs,
      // Global defaults (used when no per-reel config specified)
      templateId: globalTemplateId = 'minimalist',
      format: globalFormat = 'feed',
      hookEnabled: globalHookEnabled = false,
      hookText: globalHookText,
      voiceover: globalVoiceover = false,
      voice: globalVoice = 'nova',
      ttsProvider: globalTtsProvider = 'openai',
      soundEffects: globalSoundEffects = false,
      captions: globalCaptions = false,
      captionStyle: globalCaptionStyle = 'highlight',
      backgroundMusic: globalBackgroundMusic = false,
      musicMood: globalMusicMood = 'inspiring',
      textEffect: globalTextEffect,
    } = body

    if (!carousels || carousels.length === 0) {
      return NextResponse.json(
        { error: 'No carousels provided' },
        { status: 400 }
      )
    }

    // Find approved carousels
    const approvedIndices: number[] = []
    carousels.forEach((c: Record<string, unknown>, idx: number) => {
      if (c.approved === true) {
        approvedIndices.push(idx)
      }
    })

    if (approvedIndices.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum carrossel aprovado. Aprove pelo menos um carrossel antes de gerar os reels.' },
        { status: 400 }
      )
    }

    // Build batch configs: use provided configs OR auto-variation
    let batchConfigs: BatchConfig[]

    if (rawConfigs && Array.isArray(rawConfigs) && rawConfigs.length > 0) {
      // User-provided configs — validate carousel indices are approved
      batchConfigs = (rawConfigs as BatchConfig[]).filter((cfg) =>
        approvedIndices.includes(cfg.carouselIndex)
      )
      if (batchConfigs.length === 0) {
        return NextResponse.json(
          { error: 'Nenhum dos carouselIndex fornecidos corresponde a um carrossel aprovado.' },
          { status: 400 }
        )
      }
    } else {
      // Auto-variation: generate one reel per approved carousel, rotating templates/formats
      batchConfigs = generateAutoVariations(carousels, approvedIndices)

      // Apply global defaults to auto-generated configs
      batchConfigs = batchConfigs.map((cfg) => ({
        ...cfg,
        templateId: globalTemplateId,
        format: globalFormat,
        voiceover: globalVoiceover,
        voice: globalVoice,
        ttsProvider: globalTtsProvider,
        hookEnabled: globalHookEnabled,
        hookText: globalHookText,
        soundEffects: globalSoundEffects,
        captions: globalCaptions,
        captionStyle: globalCaptionStyle,
        backgroundMusic: globalBackgroundMusic,
        musicMood: globalMusicMood,
        textEffect: globalTextEffect,
      }))
    }

    console.log(`[Batch] Iniciando geracao de ${batchConfigs.length} reels em paralelo (max 3 concorrentes)...`)

    // Pre-warm: bundle Remotion (shared across all renders)
    const bundleLocation = await getRemotionBundle()

    // Force traditional require() instead of import() (bypasses Next.js bundler)
    const { renderMedia, selectComposition } = require('@remotion/renderer')

    const renderOptions = await getServerlessRenderOptions()

    // Pre-generate sound effects if any config uses them (shared resource)
    let sharedSoundEffectUrls: SoundEffectUrls | undefined
    const anySoundEffects = batchConfigs.some((cfg) => cfg.soundEffects)
    if (anySoundEffects) {
      try {
        sharedSoundEffectUrls = await getOrCreateSoundEffects(id)
      } catch (err) {
        console.warn('[Batch] Sound effects falhou, continuando sem efeitos:', err)
      }
    }

    // Process in parallel with semaphore (max 3 concurrent)
    const semaphore = new Semaphore(3)
    const promises = batchConfigs.map(async (config, reelIndex): Promise<BatchReelOutcome> => {
      await semaphore.acquire()
      try {
        const carousel = carousels[config.carouselIndex]
        const result = await renderSingleReel(
          config,
          carousel,
          id,
          profile || {},
          bundleLocation,
          sharedSoundEffectUrls,
          reelIndex,
          renderOptions,
          selectComposition,
          renderMedia
        )
        return result
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.error(`  [Batch ${reelIndex + 1}] ERRO:`, errorMessage)
        return {
          carouselIndex: config.carouselIndex,
          title: (carousels[config.carouselIndex]?.titulo as string) || `Carrossel ${config.carouselIndex + 1}`,
          templateId: config.templateId,
          format: config.format,
          error: errorMessage,
          status: 'rejected' as const,
        }
      } finally {
        semaphore.release()
      }
    })

    const outcomes = await Promise.all(promises)

    // Separate successes from errors
    const fulfilled = outcomes.filter((o): o is BatchReelResult => o.status === 'fulfilled')
    const rejected = outcomes.filter((o): o is BatchReelError => o.status === 'rejected')

    // Cleanup temp directory
    try {
      const tempDir = path.join('/tmp', 'reels-batch', id)
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true })
      }
    } catch {
      // Directory may not exist
    }

    // Save successful results to database
    if (fulfilled.length > 0) {
      const supabase = getServerSupabase()
      const reelVideosData = {
        videos: fulfilled,
        generated_at: new Date().toISOString(),
        batch: true,
      }

      const { data: contentSuggestion } = await supabase
        .from('content_suggestions')
        .select('id')
        .eq('audit_id', id)
        .single()

      if (contentSuggestion) {
        await supabase
          .from('content_suggestions')
          .update({ reel_videos_json: reelVideosData })
          .eq('id', contentSuggestion.id)
      }
    }

    console.log(
      `[Batch] Concluido: ${fulfilled.length} sucesso, ${rejected.length} erro(s)`
    )

    return NextResponse.json({
      success: true,
      total: batchConfigs.length,
      completed: fulfilled.length,
      failed: rejected.length,
      videos: fulfilled,
      errors: rejected,
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('[Batch] Erro fatal:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar reels em batch', details: errorMessage },
      { status: 500 }
    )
  }
}
