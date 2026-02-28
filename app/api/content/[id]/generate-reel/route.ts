import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getServerSupabase } from '@/lib/supabase'
import { getRemotionBundle } from '@/lib/remotion-bundle'
import { getServerlessRenderOptions } from '@/lib/remotion-chromium'
import { generateContentImage } from '@/lib/nano-banana'
import { searchStockVideosForSlides } from '@/lib/stock-video'
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

// Allow up to 5 minutes for video rendering
export const maxDuration = 300

// Cloudinary config
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * Detecta se uma palavra e uma keyword baseado no texto original do slide.
 * Heuristica: palavras em ALL CAPS (>3 chars) ou entre **negrito** no markdown.
 */
function isKeywordWord(word: string, originalText: string): boolean {
  const cleaned = word.replace(/[.,!?;:]/g, '').trim()
  if (cleaned.length <= 3) return false
  // Palavra em CAPS no texto original
  if (originalText.includes(cleaned.toUpperCase()) && cleaned === cleaned.toUpperCase()) return true
  // Palavra em negrito markdown
  if (originalText.includes(`**${cleaned}**`)) return true
  return false
}

/**
 * Extract titulo and corpo from slide structure (same logic as generate-slides-v2)
 */
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

/**
 * Step 0: Gera um roteiro cinematográfico a partir do conteúdo do carrossel.
 * Em vez de ler os slides literalmente, cria uma narrativa original para vídeo.
 */
interface ScreenplayScene {
  narration: string       // Texto para narração (fala natural, não leitura de slide)
  visualPrompt: string    // Prompt para gerar imagem/vídeo de fundo
  onScreenText: string    // Texto curto para mostrar na tela (headline)
}

async function generateScreenplay(
  carousel: Record<string, unknown>,
  profile: { username?: string; full_name?: string },
  language: string = 'pt-BR'
): Promise<ScreenplayScene[]> {
  const anthropic = new Anthropic()

  // Extrair todo o conteúdo do carrossel
  const slides = carousel.slides as Record<string, string>[]
  const slideTexts = slides.map((s, i) => {
    const { titulo, corpo } = getSlideFields(s)
    return `Slide ${i + 1}: ${titulo}${corpo ? `\n${corpo}` : ''}`
  }).join('\n\n')

  const languageMap: Record<string, string> = {
    'pt-BR': 'português brasileiro',
    'pt-PT': 'português de Portugal',
    'en-US': 'inglês americano',
    'es-ES': 'espanhol',
  }
  const langName = languageMap[language] || 'português brasileiro'

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Você é um roteirista de vídeos curtos para redes sociais (Reels, TikTok, Shorts).

CONTEXTO:
- Perfil: @${profile.username || 'creator'} (${profile.full_name || 'Creator'})
- Título do conteúdo: ${carousel.titulo || 'Sem título'}
- Tipo: ${carousel.tipo || 'educacional'}
- Objetivo: ${carousel.objetivo || 'educar a audiência'}

CONTEÚDO ORIGINAL (carrossel aprovado):
${slideTexts}

TAREFA:
Transforme este conteúdo em um ROTEIRO CINEMATOGRÁFICO para vídeo curto (30-90 segundos).

REGRAS IMPORTANTES:
1. NÃO leia os slides. Crie uma narrativa ORAL, como se estivesse falando com um amigo
2. Use linguagem conversacional em ${langName}
3. Comece com um HOOK forte nos primeiros 3 segundos (pergunta provocativa, estatística chocante, ou afirmação bold)
4. Cada cena deve ter narração curta (1-3 frases faladas, máximo 25 palavras)
5. Crie 4-6 cenas no total (não precisa ser 1:1 com os slides)
6. O texto na tela (onScreenText) deve ser uma headline curta (3-6 palavras), NÃO o texto completo
7. O visualPrompt deve descrever uma imagem cinematográfica que complementa a narração

Responda APENAS com JSON válido, sem markdown:
[
  {
    "narration": "texto falado pelo narrador",
    "visualPrompt": "descrição da imagem de fundo",
    "onScreenText": "headline curta na tela"
  }
]`
    }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  try {
    // Tentar parsear JSON direto
    const parsed = JSON.parse(text.trim())
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed as ScreenplayScene[]
    }
  } catch {
    // Tentar extrair JSON de dentro do texto
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0])
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as ScreenplayScene[]
        }
      } catch {
        // Falhou mesmo
      }
    }
  }

  // Fallback: usar slides originais (comportamento antigo)
  console.warn('   Screenplay generation falhou, usando slides originais como fallback')
  return slides.map((s) => {
    const { titulo, corpo } = getSlideFields(s)
    return {
      narration: [titulo, corpo].filter(Boolean).join('. '),
      visualPrompt: titulo || corpo,
      onScreenText: titulo || '',
    }
  })
}

// Bundle management moved to @/lib/remotion-bundle

/**
 * POST - Generate animated Reel (MP4) from approved carousels using Remotion.
 * Suporta voiceover opcional via OpenAI TTS ou ElevenLabs TTS.
 * Suporta sound effects opcionais via ElevenLabs Sound Generation.
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
      templateId = 'minimalist',
      format = 'feed',
      hookEnabled = false,
      hookText: hookTextRaw,
      hookStyle = 'word-by-word',
      hookIntroStyle = 'spring',
      voiceover = false,
      voice = 'nova' as TTSVoice,
      voiceSpeed = 1.0,
      ttsProvider = 'openai' as TTSProvider,
      soundEffects = false,
      captions = false,
      captionStyle = 'highlight',
      backgroundMusic = false,
      musicMood = 'inspiring' as MusicMood,
      textEffect,
      motionEffects = { kenBurns: true, progressBar: true },
      brollVideo = false,
      transitionStyle = 'random',
      animatedBackground = 'auto',
      particleEffects = true,
      animatedMetrics = false,
      parallax = false,
      language = 'pt-BR',
    } = body

    // Legendas requerem voiceover ativo (precisamos de áudio para transcrever)
    if (captions && !voiceover) {
      return NextResponse.json(
        { error: 'Legendas animadas requerem voiceover ativo. Ative a narração para usar legendas.' },
        { status: 400 }
      )
    }

    // Mapear formato para composicao Remotion e dimensoes
    const FORMAT_TO_COMPOSITION: Record<string, { compositionId: string; width: number; height: number }> = {
      feed:   { compositionId: 'CarouselReel', width: 1080, height: 1350 },
      story:  { compositionId: 'StoryReel',    width: 1080, height: 1920 },
      square: { compositionId: 'SquareReel',   width: 1080, height: 1080 },
    }
    const formatConfig = FORMAT_TO_COMPOSITION[format] || FORMAT_TO_COMPOSITION.feed

    if (!carousels || carousels.length === 0) {
      return NextResponse.json(
        { error: 'No carousels provided' },
        { status: 400 }
      )
    }

    // Filter approved carousels
    const approvedIndices = carousels
      .map((c: Record<string, unknown>, idx: number) => ({ carousel: c, originalIndex: idx }))
      .filter(({ carousel }: { carousel: Record<string, unknown> }) => carousel.approved === true)

    if (approvedIndices.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum carrossel aprovado. Aprove pelo menos um carrossel antes de gerar o reel.' },
        { status: 400 }
      )
    }

    // Resolver hookText: se hookEnabled mas sem texto, usar titulo do primeiro slide do primeiro carrossel aprovado
    let hookText: string | undefined
    if (hookEnabled) {
      if (hookTextRaw && typeof hookTextRaw === 'string' && hookTextRaw.trim()) {
        hookText = hookTextRaw.trim()
      } else {
        // Fallback: titulo do primeiro slide do primeiro carrossel aprovado
        const firstCarousel = approvedIndices[0]?.carousel
        const firstSlide = (firstCarousel?.slides as Record<string, string>[])?.[0]
        if (firstSlide) {
          const { titulo } = getSlideFields(firstSlide)
          hookText = titulo || undefined
        }
      }
    }

    console.log(`Gerando Reels (${format} ${formatConfig.width}x${formatConfig.height}) para ${approvedIndices.length} carrosseis aprovados${hookEnabled && hookText ? ` com hook visual` : ''}${voiceover ? ` com voiceover (provider: ${ttsProvider}, voz: ${voice})` : ''}${soundEffects ? ' com sound effects' : ''}${brollVideo ? ' com B-Roll video' : ''}...`)

    // Niche context for image generation
    const nicheContext = [
      profile?.biography ? profile.biography.substring(0, 150) : null,
      profile?.full_name ? `Expert: ${profile.full_name}` : null,
    ]
      .filter(Boolean)
      .join('. ')

    // Gerar sound effects (se habilitado) — pode ser feito em paralelo com o bundle
    let soundEffectUrls: SoundEffectUrls | undefined

    if (soundEffects) {
      try {
        soundEffectUrls = await getOrCreateSoundEffects(id)
      } catch (err) {
        console.warn('Sound effects falhou, continuando sem efeitos:', err)
        // Não é bloqueante — continuar sem sound effects
      }
    }

    // Resolver background music (se habilitado)
    let backgroundMusicUrl: string | undefined
    let musicVolume: number | undefined

    if (backgroundMusic) {
      try {
        const track = await getVerifiedTrackForMood(musicMood as MusicMood)
        if (track) {
          backgroundMusicUrl = track.url
          musicVolume = getMusicVolume(voiceover)
          console.log(`   Background music: ${track.name} (mood: ${musicMood}, volume: ${(musicVolume * 100).toFixed(0)}%)`)
        } else {
          console.warn(`   Background music: arquivo nao encontrado para mood "${musicMood}". Coloque um MP3 em /public/audio/music/${musicMood}/track-1.mp3`)
        }
      } catch (err) {
        console.warn('Background music falhou, continuando sem musica:', err)
        // Nao e bloqueante — continuar sem musica
      }
    }

    // Bundle Remotion composition (cached after first call)
    const bundleLocation = await getRemotionBundle()

    // Force traditional require() instead of import() (bypasses Next.js bundler)
    const { renderMedia, selectComposition } = require('@remotion/renderer')

    const renderOptions = await getServerlessRenderOptions()

    const results = []

    for (let i = 0; i < approvedIndices.length; i++) {
      const { carousel, originalIndex } = approvedIndices[i]
      const carouselSlides = carousel.slides as Record<string, string>[]
      const carouselName = `carrossel-${i + 1}`

      console.log(`Processando reel ${carouselName} (${carouselSlides.length} slides)...`)

      // Step 0: Gerar roteiro cinematográfico via Claude
      console.log(`   Gerando roteiro cinematográfico...`)
      const screenplay = await generateScreenplay(carousel, profile || {}, language)
      console.log(`   Roteiro: ${screenplay.length} cenas criadas`)

      // Step 1: Generate B-Roll videos (Pexels) or images (fal.ai) for each SCENE (não slide)
      let videoUrls: (string | null)[] | undefined
      if (brollVideo) {
        console.log(`   Buscando B-Roll videos via Pexels para ${screenplay.length} cenas...`)
        const keywords = screenplay.map((s) => s.visualPrompt)
        videoUrls = await searchStockVideosForSlides(keywords, 2)
        const foundCount = videoUrls.filter((u) => u !== null).length
        console.log(`   B-Roll: ${foundCount}/${screenplay.length} videos encontrados`)
      }

      const slidesWithImages = await Promise.all(
        screenplay.map(async (scene, j: number) => {
          // Se B-Roll ativado e video encontrado para esta cena, usar video
          const backgroundVideoUrl = videoUrls?.[j] || undefined
          if (backgroundVideoUrl) {
            console.log(`   Cena ${j + 1}/${screenplay.length}: usando B-Roll video`)
            return {
              titulo: scene.onScreenText,
              corpo: '',
              narration: scene.narration,
              contentImageUrl: '',
              backgroundVideoUrl,
            }
          }

          // Gerar imagem via fal.ai baseada no visualPrompt do roteiro
          try {
            const fullPrompt = [
              nicheContext ? `Context: ${nicheContext}.` : null,
              `Scene: ${scene.visualPrompt}`,
              'cinematic, professional photography, photorealistic, high quality, sharp focus',
              'dramatic lighting, modern aesthetic, clean composition',
              'no text visible, no letters, no words, no typography in the image',
            ]
              .filter(Boolean)
              .join(', ')

            const contentImageUrl = await generateContentImage(fullPrompt)
            console.log(`   Cena ${j + 1}/${screenplay.length}: imagem gerada`)
            return {
              titulo: scene.onScreenText,
              corpo: '',
              narration: scene.narration,
              contentImageUrl,
              backgroundVideoUrl: undefined,
            }
          } catch (err) {
            console.warn(`   Cena ${j + 1} imagem falhou, usando placeholder:`, err)
            return {
              titulo: scene.onScreenText,
              corpo: '',
              narration: scene.narration,
              contentImageUrl: '',
              backgroundVideoUrl: undefined,
            }
          }
        })
      )

      // Step 2: Gerar voiceover (se habilitado) — usando NARRAÇÃO DO ROTEIRO
      let audioUrls: string[] | undefined
      let slideDurations: number[] | undefined

      if (voiceover) {
        console.log(`   Gerando voiceover para ${screenplay.length} cenas (provider: ${ttsProvider})...`)

        const voiceoverResults = []
        for (let j = 0; j < slidesWithImages.length; j++) {
          const slideContent = slidesWithImages[j]
          // Usar a narração do roteiro, não o texto dos slides
          const narrationText = slideContent.narration || [slideContent.titulo, slideContent.corpo]
            .filter(Boolean)
            .join('. ')

          if (!narrationText.trim()) {
            // Slide sem texto: usar duracoo padrao, sem audio
            voiceoverResults.push({ audioUrl: '', durationSeconds: 3 })
            continue
          }

          try {
            const result = await generateAndUploadVoiceover(narrationText, {
              voice: voice as TTSVoice,
              auditId: id,
              slideIndex: j,
              speed: voiceSpeed,
              provider: ttsProvider as TTSProvider,
            })
            voiceoverResults.push(result)
          } catch (err) {
            console.warn(`   Voiceover slide ${j + 1} falhou:`, err)
            // Fallback: sem audio, duracao padrao
            voiceoverResults.push({ audioUrl: '', durationSeconds: 3 })
          }
        }

        audioUrls = voiceoverResults.map((r) => r.audioUrl)
        // Converter duracao em segundos para frames (30fps)
        // Adicionar 0.5s de margem para respiracao entre slides
        const FPS = 30
        slideDurations = voiceoverResults.map((r) =>
          Math.max(Math.ceil((r.durationSeconds + 0.5) * FPS), 90) // minimo 3s (90 frames)
        )

        console.log(
          `   Voiceover completo: ${voiceoverResults.filter((r) => r.audioUrl).length}/${slidesWithImages.length} slides com audio`
        )
      }

      // Step 2.5: Gerar legendas animadas (se habilitado e voiceover disponível)
      let captionDataPerSlide: CaptionWord[][] | undefined

      if (captions && voiceover && audioUrls) {
        // Filtrar apenas URLs válidas para transcrição
        const validAudioUrls = audioUrls.filter((url: string) => url && url.length > 0)

        if (validAudioUrls.length > 0) {
          console.log(`   Transcrevendo ${validAudioUrls.length} áudios para legendas (Whisper)...`)

          // Transcrever todos os áudios para obter timestamps word-level
          const allCaptions = await transcribeMultipleAudios(
            audioUrls.map((url: string) => url || ''),
            2 // concorrência: 2 transcrições simultâneas
          )

          captionDataPerSlide = allCaptions.map((captionData) => captionData.words)

          // Keyword detection: marcar palavras importantes para estilo tiktok-viral
          if (captionStyle === 'tiktok-viral') {
            captionDataPerSlide = captionDataPerSlide.map((words, slideIdx) => {
              const slideContent = slidesWithImages[slideIdx]
              const originalText = [slideContent?.titulo || '', slideContent?.corpo || ''].join(' ')
              return words.map(word => ({
                ...word,
                isKeyword: isKeywordWord(word.word, originalText),
              }))
            })
          }

          const totalWords = captionDataPerSlide.reduce((sum, words) => sum + words.length, 0)
          console.log(
            `   Legendas geradas: ${totalWords} palavras em ${captionDataPerSlide.filter((w) => w.length > 0).length} slides`
          )
        }
      }

      // Step 3: Build Remotion input props (inclui formato selecionado e voiceover)
      const inputProps: Record<string, unknown> = {
        slides: slidesWithImages.map((s, j) => ({
          titulo: s.titulo,
          corpo: s.corpo,
          contentImageUrl: s.contentImageUrl,
          slideNumber: j + 1,
          totalSlides: carouselSlides.length,
          ...(s.backgroundVideoUrl ? { backgroundVideoUrl: s.backgroundVideoUrl } : {}),
        })),
        profilePicUrl:
          profile?.profile_pic_cloudinary_url ||
          profile?.profile_pic_url_hd ||
          '',
        username: profile?.username || '',
        fullName: profile?.full_name || '',
        templateId,
        format,
        fps: 30,
        durationPerSlideFrames: 90, // 3 seconds per slide (fallback sem voiceover)
        transitionFrames: 20,
      }

      // Adicionar props de hook visual se habilitado
      if (hookEnabled && hookText) {
        inputProps.hookEnabled = true
        inputProps.hookText = hookText
        inputProps.hookStyle = hookStyle
        inputProps.hookIntroStyle = hookIntroStyle
      }

      // Motion effects (Ken Burns, progress bar) — sempre ativo por padrao
      if (motionEffects) {
        inputProps.motionEffects = motionEffects
      }

      // Adicionar props de voiceover se habilitado
      if (voiceover && audioUrls && slideDurations) {
        inputProps.voiceover = true
        inputProps.audioUrls = audioUrls
        inputProps.slideDurations = slideDurations
        inputProps.ttsProvider = ttsProvider
      }

      // Adicionar props de legendas se habilitado
      if (captions && captionDataPerSlide) {
        inputProps.captionData = captionDataPerSlide
        inputProps.captionStyle = captionStyle
      }

      // Adicionar props de sound effects se disponíveis
      if (soundEffects && soundEffectUrls) {
        inputProps.soundEffectUrls = soundEffectUrls
      }

      // Adicionar props de background music se disponivel
      if (backgroundMusic && backgroundMusicUrl) {
        inputProps.backgroundMusicUrl = backgroundMusicUrl
        inputProps.musicVolume = musicVolume
      }

      // Adicionar efeito de texto dinamico se selecionado
      if (textEffect && textEffect !== 'none') {
        inputProps.textEffect = textEffect
      }

      // Adicionar background animado se selecionado
      if (animatedBackground && animatedBackground !== 'none') {
        inputProps.animatedBackground = animatedBackground
      }

      // Adicionar estilo de transicao entre slides
      if (transitionStyle) {
        inputProps.transitionStyle = transitionStyle
      }

      // Adicionar efeitos de destaque (particle burst, zoom pulse, glow)
      inputProps.particleEffects = particleEffects

      // Adicionar metricas animadas (AnimatedCounter, CircularProgress, AnimatedBar)
      if (animatedMetrics) {
        inputProps.animatedMetrics = true
      }

      // Adicionar parallax 3D (camadas em velocidades diferentes)
      if (parallax) {
        inputProps.parallax = true
      }

      // Step 4: Select composition baseada no formato (resolves dynamic duration)
      const composition = await selectComposition({
        serveUrl: bundleLocation,
        id: formatConfig.compositionId,
        inputProps,
        ...renderOptions,
      })

      console.log(
        `   Composicao: ${composition.durationInFrames} frames (${(composition.durationInFrames / 30).toFixed(1)}s)`
      )

      // Step 5: Render MP4 to /tmp
      const tempDir = path.join('/tmp', 'reels', id)
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
              `   Rendering ${carouselName}: ${Math.round(progress * 100)}%`
            )
          }
        },
        ...renderOptions,
      })

      console.log(`   Reel renderizado: ${outputPath}`)

      // Step 6: Upload to Cloudinary as video
      const uploadResult = await cloudinary.v2.uploader.upload(outputPath, {
        folder: `carousel-reels/${id}`,
        public_id: carouselName,
        resource_type: 'video',
        overwrite: true,
      })

      console.log(`   Upload Cloudinary: ${uploadResult.secure_url}`)

      // Cleanup temp file
      fs.unlinkSync(outputPath)

      results.push({
        carouselIndex: originalIndex,
        title: (carousel.titulo as string) || `Carrossel ${i + 1}`,
        videoUrl: uploadResult.secure_url,
        cloudinaryPublicId: uploadResult.public_id,
        duration: composition.durationInFrames / 30,
        totalSlides: carouselSlides.length,
        hasHook: hookEnabled && !!hookText,
        hasVoiceover: voiceover,
        hasCaptions: captions && !!captionDataPerSlide,
        hasSoundEffects: soundEffects && !!soundEffectUrls,
        hasBackgroundMusic: backgroundMusic && !!backgroundMusicUrl,
        hasBrollVideo: brollVideo && videoUrls ? videoUrls.some((u) => u !== null) : false,
        ttsProvider: voiceover ? ttsProvider : undefined,
      })
    }

    // Cleanup temp directory
    try {
      fs.rmdirSync(path.join('/tmp', 'reels', id))
    } catch {
      // Directory may not be empty or already removed
    }

    // Step 7: Save to database
    const supabase = getServerSupabase()
    const reelVideosData = {
      videos: results,
      generated_at: new Date().toISOString(),
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

    console.log(
      `${results.length} reel(s) gerado(s) com sucesso${hookEnabled && hookText ? ' (com hook visual)' : ''}${voiceover ? ` (com voiceover via ${ttsProvider})` : ''}${captions ? ' (com legendas)' : ''}${soundEffects ? ' (com sound effects)' : ''}${backgroundMusic && backgroundMusicUrl ? ' (com background music)' : ''}${brollVideo ? ' (com B-Roll video)' : ''}!`
    )

    return NextResponse.json({
      success: true,
      videos: results,
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Erro ao gerar reel:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar reel', details: errorMessage },
      { status: 500 }
    )
  }
}
