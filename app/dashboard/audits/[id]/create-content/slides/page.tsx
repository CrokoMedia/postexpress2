'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAudit } from '@/hooks/use-audit'
import { PageHeader } from '@/components/molecules/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { Skeleton } from '@/components/atoms/skeleton'
import { Badge } from '@/components/atoms/badge'
import {
  ArrowLeft,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  Archive,
  FolderOpen,
  CheckCircle,
  GalleryHorizontal,
  Info,
  Video,
  Download,
  Palette,
  Monitor,
  Smartphone,
  Square,
  Mic,
  Subtitles,
  Volume2,
  Zap,
  Music,
  Waves,
  Briefcase,
  Type,
  PlayCircle,
  AlertCircle,
  Clock,
  Layers,
  Upload,
  Trash2,
  UserCircle,
  AlertTriangle,
  Film,
  Shuffle,
  Grid3X3,
  Droplets,
  ZoomIn,
  Tv,
  BarChart2,
  Pencil,
} from 'lucide-react'
import { TEMPLATE_LIST } from '@/remotion/templates'
import type { TemplateId } from '@/remotion/templates'
import type { LayoutFormat } from '@/remotion/types'
import { ReelPreviewPlayer } from '@/components/molecules/reel-preview-player'
import { Switch } from '@/components/atoms/switch'

type TTSProviderOption = 'openai' | 'elevenlabs'
type OpenAIVoiceOption = 'alloy' | 'nova' | 'shimmer' | 'echo'
type ElevenLabsVoiceOption = 'rachel' | 'adam' | 'antoni' | 'bella'
type VoiceOption = OpenAIVoiceOption | ElevenLabsVoiceOption
type CaptionStyleOption = 'highlight' | 'karaoke' | 'bounce' | 'floating-chips'

const OPENAI_VOICE_OPTIONS: { id: OpenAIVoiceOption; label: string; description: string }[] = [
  { id: 'nova', label: 'Nova', description: 'Feminina, natural e expressiva' },
  { id: 'alloy', label: 'Alloy', description: 'Neutra, equilibrada e versátil' },
  { id: 'shimmer', label: 'Shimmer', description: 'Feminina, suave e clara' },
  { id: 'echo', label: 'Echo', description: 'Masculina, profunda e calma' },
]

const ELEVENLABS_VOICE_OPTIONS: { id: ElevenLabsVoiceOption; label: string; description: string }[] = [
  { id: 'rachel', label: 'Rachel', description: 'Feminina, profissional e clara' },
  { id: 'adam', label: 'Adam', description: 'Masculino, autoridade e confianca' },
  { id: 'antoni', label: 'Antoni', description: 'Masculino, casual e amigavel' },
  { id: 'bella', label: 'Bella', description: 'Feminina, amigavel e expressiva' },
]

const CAPTION_STYLE_OPTIONS: { id: CaptionStyleOption; label: string; description: string; isPremium?: boolean }[] = [
  { id: 'highlight', label: 'Highlight', description: 'Palavra ativa com fundo colorido (recomendado)' },
  { id: 'karaoke', label: 'Karaoke', description: 'Texto muda de cor progressivamente' },
  { id: 'bounce', label: 'Bounce', description: 'Palavra ativa com animacao de escala' },
  { id: 'floating-chips', label: 'Floating Chips', description: 'Pills flutuantes com spring premium', isPremium: true },
]

type TextEffectOption = 'none' | 'typewriter' | 'bounce' | 'gradient' | 'marker' | 'split-reveal' | 'wave' | 'cinematic'

const TEXT_EFFECT_OPTIONS: { id: TextEffectOption; label: string; description: string; isNew?: boolean }[] = [
  { id: 'none', label: 'Padrao', description: 'Texto aparece com fade-in (animacao padrao)' },
  { id: 'typewriter', label: 'Typewriter', description: 'Letra por letra com cursor piscando' },
  { id: 'bounce', label: 'Bounce', description: 'Palavras crescem uma a uma com spring' },
  { id: 'gradient', label: 'Gradiente', description: 'Cor animada deslizando pelo texto' },
  { id: 'marker', label: 'Marca-texto', description: 'Highlight amarelo cresce atras do texto' },
  { id: 'split-reveal', label: 'Split Reveal', description: 'Linhas deslizam da esquerda com mascara', isNew: true },
  { id: 'wave', label: 'Wave', description: 'Caracteres ondulam como ola mexicana', isNew: true },
  { id: 'cinematic', label: 'Cinematico', description: 'Palavras surgem com blur e tracking', isNew: true },
]

type TransitionStyleOption = 'fade' | 'slide' | 'pixel' | 'liquid' | 'glitch' | 'zoom-blur' | 'random'

const TRANSITION_STYLE_OPTIONS: { id: TransitionStyleOption; label: string; description: string; Icon: typeof Zap }[] = [
  { id: 'fade', label: 'Fade', description: 'Dissolve suave entre slides', Icon: Sparkles },
  { id: 'slide', label: 'Slide', description: 'Desliza da direita para esquerda', Icon: Layers },
  { id: 'pixel', label: 'Pixel', description: 'Dissolucao em blocos pixelados', Icon: Grid3X3 },
  { id: 'liquid', label: 'Liquid Wave', description: 'Onda ondulada revelando o proximo', Icon: Droplets },
  { id: 'glitch', label: 'Glitch', description: 'Cortes RGB com offset horizontal', Icon: Tv },
  { id: 'zoom-blur', label: 'Zoom Blur', description: 'Zoom com blur cinematografico', Icon: ZoomIn },
  { id: 'random', label: 'Aleatorio', description: 'Mistura transicoes entre slides', Icon: Shuffle },
]

export default function ConfigureSlidesPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { audit, isLoading, isError } = useAudit(id)

  const [content, setContent] = useState<any>(null)
  const [loadingContent, setLoadingContent] = useState(true)

  // Configuração de imagens por slide: carouselIndex → slideIndex → config
  const [slideImageOptions, setSlideImageOptions] = useState<Map<number, Map<number, {
    mode: 'auto' | 'custom_prompt' | 'upload' | 'no_image'
    customPrompt?: string
    uploadUrl?: string
  }>>>(new Map())

  // Estado de upload
  const [uploadingImage, setUploadingImage] = useState<{ carouselIndex: number; slideIndex: number } | null>(null)

  // Geração de slides
  const [generatingSlides, setGeneratingSlides] = useState(false)
  const [slides, setSlides] = useState<any>(null)
  const [slidesError, setSlidesError] = useState<string | null>(null)

  // Reels (Remotion video)
  const [generatingReel, setGeneratingReel] = useState(false)
  const [reelVideos, setReelVideos] = useState<any[] | null>(null)
  const [reelError, setReelError] = useState<string | null>(null)

  // Template selecionado
  const [selectedTemplateId, setSelectedTemplateId] = useState<TemplateId>('minimalist')

  // Formato selecionado (feed 4:5, story 9:16, square 1:1)
  const [selectedFormat, setSelectedFormat] = useState<LayoutFormat>('feed')

  // Carrossel selecionado para preview (índice dentro de approvedCarousels)
  const [previewCarouselIndex, setPreviewCarouselIndex] = useState(0)

  // Voiceover (narracao)
  const [voiceoverEnabled, setVoiceoverEnabled] = useState(false)
  const [selectedTTSProvider, setSelectedTTSProvider] = useState<TTSProviderOption>('elevenlabs')
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>('rachel')

  // Voice Cloning
  const [clonedVoiceId, setClonedVoiceId] = useState<string | null>(null)
  const [useClonedVoice, setUseClonedVoice] = useState(false)
  const [cloningVoice, setCloningVoice] = useState(false)
  const [removingVoice, setRemovingVoice] = useState(false)
  const [voiceCloneError, setVoiceCloneError] = useState<string | null>(null)
  const [voiceCloneConsent, setVoiceCloneConsent] = useState(false)

  // Hook visual (2s de intro antes do primeiro slide)
  const [hookEnabled, setHookEnabled] = useState(true)
  const [hookText, setHookText] = useState('')
  type HookIntroStyleOption = 'spring' | 'glitch'
  const [hookIntroStyle, setHookIntroStyle] = useState<HookIntroStyleOption>('spring')

  // Sound effects nas transicoes
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true)

  // Legendas animadas (requerem voiceover)
  const [captionsEnabled, setCaptionsEnabled] = useState(false)
  const [selectedCaptionStyle, setSelectedCaptionStyle] = useState<CaptionStyleOption>('highlight')

  // Efeito de texto dinamico (titulo dos slides no reel)
  const [selectedTextEffect, setSelectedTextEffect] = useState<TextEffectOption>('none')

  // Background music
  type MusicMoodOption = 'energetic' | 'calm' | 'corporate' | 'inspiring'
  const [backgroundMusicEnabled, setBackgroundMusicEnabled] = useState(false)
  const [selectedMusicMood, setSelectedMusicMood] = useState<MusicMoodOption>('inspiring')

  // Estilo de transicao entre slides
  const [selectedTransitionStyle, setSelectedTransitionStyle] = useState<TransitionStyleOption>('random')

  // B-Roll Video (Pexels stock video como background)
  const [brollVideoEnabled, setBrollVideoEnabled] = useState(false)

  // Background animado (gradient, geometric, particles, wave-mesh, auto)
  type AnimatedBackgroundOption = 'none' | 'gradient-flow' | 'geometric' | 'particles' | 'wave-mesh' | 'auto'
  const [selectedAnimatedBg, setSelectedAnimatedBg] = useState<AnimatedBackgroundOption>('auto')

  // Efeitos de destaque (particle burst, zoom pulse, glow highlight)
  const [particleEffectsEnabled, setParticleEffectsEnabled] = useState(true)

  // Metricas animadas (AnimatedCounter, CircularProgress, AnimatedBar)
  const [animatedMetricsEnabled, setAnimatedMetricsEnabled] = useState(false)

  // Parallax 3D (camadas em velocidades diferentes para sensacao de profundidade)
  const [parallaxEnabled, setParallaxEnabled] = useState(false)

  // Batch Reels
  type BatchReelStatus = 'waiting' | 'generating' | 'done' | 'error'
  interface BatchReelCard {
    carouselIndex: number
    title: string
    templateId: string
    format: string
    status: BatchReelStatus
    videoUrl?: string
    duration?: number
    error?: string
  }
  const [generatingBatch, setGeneratingBatch] = useState(false)
  const [batchCards, setBatchCards] = useState<BatchReelCard[]>([])
  const [batchProgress, setBatchProgress] = useState({ completed: 0, total: 0 })

  // Download e Drive
  const [downloadingZip, setDownloadingZip] = useState(false)
  const [sendingToDrive, setSendingToDrive] = useState(false)
  const [driveMessage, setDriveMessage] = useState<string | null>(null)
  const [driveError, setDriveError] = useState<string | null>(null)

  // Desligar legendas automaticamente quando voiceover é desativado
  const handleVoiceoverToggle = (enabled: boolean) => {
    setVoiceoverEnabled(enabled)
    if (!enabled) {
      setCaptionsEnabled(false)
    }
  }

  // Trocar provider e resetar voz para default do provider selecionado
  const handleProviderChange = (provider: TTSProviderOption) => {
    setSelectedTTSProvider(provider)
    if (provider === 'elevenlabs') {
      setSelectedVoice('rachel')
    } else {
      setSelectedVoice('nova')
    }
  }

  // Vozes ativas baseadas no provider selecionado
  const activeVoiceOptions = selectedTTSProvider === 'elevenlabs'
    ? ELEVENLABS_VOICE_OPTIONS
    : OPENAI_VOICE_OPTIONS

  // Carregar conteúdo ao abrir a página
  useEffect(() => {
    const loadContent = async () => {
      if (!id) return

      try {
        const response = await fetch(`/api/audits/${id}/content`)
        if (response.ok) {
          const data = await response.json()
          if (data.content) {
            setContent(data.content)
            // Pre-preencher hook text com titulo do primeiro slide do primeiro carrossel aprovado
            const firstApproved = data.content.carousels?.find((c: { approved?: boolean }) => c.approved === true)
            if (firstApproved?.slides?.[0]?.titulo && !hookText) {
              setHookText(firstApproved.slides[0].titulo)
            }
            console.log('Conteudo carregado')
          }
          if (data.slides) {
            setSlides(data.slides)
            console.log('Slides existentes carregados')
          }
          if (data.reel_videos?.videos) {
            setReelVideos(data.reel_videos.videos)
            console.log('Reel videos existentes carregados')
          }
        }
      } catch (err) {
        console.error('Erro ao carregar conteúdo:', err)
      } finally {
        setLoadingContent(false)
      }
    }

    loadContent()
  }, [id])

  // Carregar cloned_voice_id do perfil quando audit carrega
  useEffect(() => {
    if (!audit?.profile?.id) return

    const loadVoiceCloneStatus = async () => {
      try {
        const response = await fetch(`/api/profiles/${audit.profile.id}`)
        if (response.ok) {
          const data = await response.json()
          const voiceId = data.profile?.cloned_voice_id
          if (voiceId) {
            setClonedVoiceId(voiceId)
            if (selectedTTSProvider === 'elevenlabs') {
              setUseClonedVoice(true)
            }
          }
        }
      } catch (err) {
        console.error('Erro ao carregar status de voz clonada:', err)
      }
    }

    loadVoiceCloneStatus()
  }, [audit?.profile?.id])

  // Voice cloning handlers
  const handleCloneVoice = async (file: File) => {
    if (!audit?.profile?.id) return

    setCloningVoice(true)
    setVoiceCloneError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`/api/profiles/${audit.profile.id}/voice-clone`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao clonar voz')
      }

      const data = await response.json()
      setClonedVoiceId(data.voice_id)
      setUseClonedVoice(true)
      setVoiceCloneConsent(false)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      console.error('Erro ao clonar voz:', err)
      setVoiceCloneError(errorMessage)
    } finally {
      setCloningVoice(false)
    }
  }

  const handleRemoveClonedVoice = async () => {
    if (!audit?.profile?.id || !clonedVoiceId) return

    if (!confirm('Tem certeza que deseja remover sua voz clonada? Esta acao nao pode ser desfeita.')) {
      return
    }

    setRemovingVoice(true)
    setVoiceCloneError(null)

    try {
      const response = await fetch(`/api/profiles/${audit.profile.id}/voice-clone`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao remover voz clonada')
      }

      setClonedVoiceId(null)
      setUseClonedVoice(false)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      console.error('Erro ao remover voz clonada:', err)
      setVoiceCloneError(errorMessage)
    } finally {
      setRemovingVoice(false)
    }
  }

  // Atualizar configuração de imagem de um slide
  const handleUpdateSlideImageOption = (
    carouselIndex: number,
    slideIndex: number,
    mode: 'auto' | 'custom_prompt' | 'upload' | 'no_image',
    extraData?: { customPrompt?: string; uploadUrl?: string }
  ) => {
    setSlideImageOptions(prev => {
      const next = new Map(prev)
      if (!next.has(carouselIndex)) {
        next.set(carouselIndex, new Map())
      }
      const carouselMap = next.get(carouselIndex)!
      carouselMap.set(slideIndex, {
        mode,
        ...(extraData || {}),
      })
      return next
    })
  }

  // Upload de imagem customizada
  const handleUploadSlideImage = async (
    carouselIndex: number,
    slideIndex: number,
    file: File
  ) => {
    setUploadingImage({ carouselIndex, slideIndex })
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('carouselIndex', carouselIndex.toString())
      formData.append('slideIndex', slideIndex.toString())

      const response = await fetch(`/api/content/${id}/upload-slide-image`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao fazer upload')
      }

      const data = await response.json()

      // Atualizar configuração com a URL da imagem
      handleUpdateSlideImageOption(carouselIndex, slideIndex, 'upload', {
        uploadUrl: data.url,
      })

      console.log(`Imagem enviada: ${data.url}`)
    } catch (err: any) {
      console.error('Erro ao enviar imagem:', err)
      alert(`Erro ao enviar imagem: ${err.message}`)
    } finally {
      setUploadingImage(null)
    }
  }

  // Gerar slides via Remotion renderStill (v3), com fallback para v2
  const handleGenerateSlides = async () => {
    if (!content || !approvedCarousels.length) {
      setSlidesError('Nenhum carrossel aprovado para gerar slides')
      return
    }

    setGeneratingSlides(true)
    setSlidesError(null)

    const carouselsToGenerate = content.carousels.map((c: any) => ({
      ...c,
      approved: c.approved === true,
    }))

    // Converter slideImageOptions para objeto plano (JSON serializable)
    const imageOptionsPlain: Record<number, Record<number, any>> = {}
    slideImageOptions.forEach((carouselMap, carouselIdx) => {
      imageOptionsPlain[carouselIdx] = {}
      carouselMap.forEach((config, slideIdx) => {
        imageOptionsPlain[carouselIdx][slideIdx] = config
      })
    })

    const payload = {
      carousels: carouselsToGenerate,
      profile: audit.profile,
      slideImageOptions: imageOptionsPlain,
      templateId: selectedTemplateId,
      format: selectedFormat,
    }

    try {
      // Tentar v3 (Remotion) primeiro
      const response = await fetch(`/api/content/${id}/generate-slides-v3`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao gerar slides')
      }

      const data = await response.json()
      setSlides(data)
    } catch (v3Error: any) {
      console.warn('V3 falhou, tentando fallback V2:', v3Error.message)

      // Fallback para v2 (Puppeteer)
      try {
        const response = await fetch(`/api/content/${id}/generate-slides-v2`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Erro ao gerar slides (fallback)')
        }

        const data = await response.json()
        setSlides(data)
      } catch (v2Error: any) {
        console.error('Erro ao gerar slides (v3 + v2 fallback):', v2Error)
        setSlidesError(v3Error.message)
      }
    } finally {
      setGeneratingSlides(false)
    }
  }

  const handleDownloadZip = async () => {
    setDownloadingZip(true)
    try {
      const response = await fetch(`/api/content/${id}/export-zip`, { method: 'POST' })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao gerar ZIP')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `slides-${audit?.profile.username}-${new Date().toISOString().split('T')[0]}.zip`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err: any) {
      console.error('Erro ao baixar ZIP:', err)
      alert(`Erro: ${err.message}`)
    } finally {
      setDownloadingZip(false)
    }
  }

  const handleSendToDrive = async () => {
    setSendingToDrive(true)
    setDriveMessage(null)
    setDriveError(null)
    try {
      const response = await fetch(`/api/content/${id}/export-drive`, { method: 'POST' })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar para o Drive')
      }

      setDriveMessage(data.message)
    } catch (err: any) {
      console.error('Erro ao enviar para o Drive:', err)
      setDriveError(err.message)
    } finally {
      setSendingToDrive(false)
    }
  }

  // Gerar Reel animado (Remotion MP4)
  const handleGenerateReel = async () => {
    const approved = content?.carousels?.filter((c: any) => c.approved === true) || []
    if (!content || !approved.length) {
      setReelError('Nenhum carrossel aprovado para gerar reel')
      return
    }

    setGeneratingReel(true)
    setReelError(null)

    try {
      const reelPayload: Record<string, unknown> = {
        carousels: content.carousels,
        profile: audit.profile,
        templateId: selectedTemplateId,
        format: selectedFormat,
      }

      // Adicionar parametros de hook visual se habilitado
      if (hookEnabled) {
        reelPayload.hookEnabled = true
        if (hookText.trim()) {
          reelPayload.hookText = hookText.trim()
        }
        reelPayload.hookIntroStyle = hookIntroStyle
        // Se hookText vazio, a API usa o titulo do primeiro slide como fallback
      }

      // Adicionar parametros de voiceover se habilitado
      if (voiceoverEnabled) {
        reelPayload.voiceover = true
        reelPayload.voice = selectedVoice
        reelPayload.ttsProvider = selectedTTSProvider

        // Usar voz clonada se selecionada
        if (useClonedVoice && clonedVoiceId) {
          reelPayload.voiceId = clonedVoiceId
        }

        // Adicionar parametros de legendas animadas (requerem voiceover)
        if (captionsEnabled) {
          reelPayload.captions = true
          reelPayload.captionStyle = selectedCaptionStyle
        }
      }

      // Adicionar sound effects se habilitado
      if (soundEffectsEnabled) {
        reelPayload.soundEffects = true
      }

      // Adicionar background music se habilitado
      if (backgroundMusicEnabled) {
        reelPayload.backgroundMusic = true
        reelPayload.musicMood = selectedMusicMood
      }

      // Adicionar efeito de texto dinamico se nao for padrao
      if (selectedTextEffect !== 'none') {
        reelPayload.textEffect = selectedTextEffect
      }

      // Adicionar B-Roll video se habilitado
      if (brollVideoEnabled) {
        reelPayload.brollVideo = true
      }

      // Adicionar background animado se selecionado
      if (selectedAnimatedBg !== 'none') {
        reelPayload.animatedBackground = selectedAnimatedBg
      }

      // Adicionar estilo de transicao
      reelPayload.transitionStyle = selectedTransitionStyle

      // Adicionar efeitos de destaque
      reelPayload.particleEffects = particleEffectsEnabled

      // Adicionar metricas animadas
      if (animatedMetricsEnabled) {
        reelPayload.animatedMetrics = true
      }

      // Adicionar parallax 3D
      if (parallaxEnabled) {
        reelPayload.parallax = true
      }

      const response = await fetch(`/api/content/${id}/generate-reel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reelPayload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao gerar reel')
      }

      const data = await response.json()
      setReelVideos(data.videos)
    } catch (err: any) {
      console.error('Erro ao gerar reel:', err)
      setReelError(err.message)
    } finally {
      setGeneratingReel(false)
    }
  }

  // Gerar Reels em batch (todos os aprovados em paralelo)
  const handleGenerateBatch = async () => {
    const approved = content?.carousels?.filter((c: Record<string, unknown>) => c.approved === true) || []
    if (!content || !approved.length) {
      setReelError('Nenhum carrossel aprovado para gerar reels')
      return
    }

    // Build initial cards (all waiting)
    const approvedIndices: number[] = []
    content.carousels.forEach((c: Record<string, unknown>, idx: number) => {
      if (c.approved === true) approvedIndices.push(idx)
    })

    const initialCards: BatchReelCard[] = approvedIndices.map((carouselIndex) => {
      const carousel = content.carousels[carouselIndex]
      return {
        carouselIndex,
        title: (carousel.titulo as string) || `Carrossel ${carouselIndex + 1}`,
        templateId: selectedTemplateId,
        format: selectedFormat,
        status: 'waiting' as BatchReelStatus,
      }
    })

    setBatchCards(initialCards)
    setBatchProgress({ completed: 0, total: initialCards.length })
    setGeneratingBatch(true)
    setReelError(null)

    // Mark all as generating
    setBatchCards((prev) => prev.map((c) => ({ ...c, status: 'generating' as BatchReelStatus })))

    try {
      const batchPayload: Record<string, unknown> = {
        carousels: content.carousels,
        profile: audit.profile,
        templateId: selectedTemplateId,
        format: selectedFormat,
      }

      // Global options
      if (hookEnabled) {
        batchPayload.hookEnabled = true
        if (hookText.trim()) batchPayload.hookText = hookText.trim()
        batchPayload.hookIntroStyle = hookIntroStyle
      }
      if (voiceoverEnabled) {
        batchPayload.voiceover = true
        batchPayload.voice = selectedVoice
        batchPayload.ttsProvider = selectedTTSProvider
        if (useClonedVoice && clonedVoiceId) {
          batchPayload.voiceId = clonedVoiceId
        }
        if (captionsEnabled) {
          batchPayload.captions = true
          batchPayload.captionStyle = selectedCaptionStyle
        }
      }
      if (soundEffectsEnabled) batchPayload.soundEffects = true
      if (backgroundMusicEnabled) {
        batchPayload.backgroundMusic = true
        batchPayload.musicMood = selectedMusicMood
      }
      if (selectedTextEffect !== 'none') {
        batchPayload.textEffect = selectedTextEffect
      }

      // Adicionar estilo de transicao
      batchPayload.transitionStyle = selectedTransitionStyle

      // Adicionar background animado se selecionado
      if (selectedAnimatedBg !== 'none') {
        batchPayload.animatedBackground = selectedAnimatedBg
      }

      // Adicionar efeitos de destaque
      batchPayload.particleEffects = particleEffectsEnabled

      // Adicionar metricas animadas
      if (animatedMetricsEnabled) {
        batchPayload.animatedMetrics = true
      }

      // Adicionar parallax 3D
      if (parallaxEnabled) {
        batchPayload.parallax = true
      }

      const response = await fetch(`/api/content/${id}/generate-reels-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batchPayload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao gerar reels em batch')
      }

      const data = await response.json()

      // Update cards with results
      const updatedCards: BatchReelCard[] = initialCards.map((card) => {
        // Check if this carousel is in the success list
        const successVideo = (data.videos || []).find(
          (v: Record<string, unknown>) => v.carouselIndex === card.carouselIndex
        )
        if (successVideo) {
          return {
            ...card,
            status: 'done' as BatchReelStatus,
            videoUrl: successVideo.videoUrl as string,
            duration: successVideo.duration as number,
          }
        }
        // Check if this carousel is in the error list
        const errorEntry = (data.errors || []).find(
          (e: Record<string, unknown>) => e.carouselIndex === card.carouselIndex
        )
        if (errorEntry) {
          return {
            ...card,
            status: 'error' as BatchReelStatus,
            error: errorEntry.error as string,
          }
        }
        return { ...card, status: 'error' as BatchReelStatus, error: 'Resultado desconhecido' }
      })

      setBatchCards(updatedCards)
      setBatchProgress({ completed: data.completed || 0, total: data.total || initialCards.length })

      // Also update reelVideos for the gallery
      if (data.videos && data.videos.length > 0) {
        setReelVideos(data.videos)
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      console.error('Erro ao gerar reels em batch:', err)
      setReelError(errorMessage)
      setBatchCards((prev) =>
        prev.map((c) => ({
          ...c,
          status: 'error' as BatchReelStatus,
          error: errorMessage,
        }))
      )
    } finally {
      setGeneratingBatch(false)
    }
  }

  if (isLoading || loadingContent) {
    return (
      <div>
        <Skeleton className="h-12 w-64 mb-8" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (isError || !audit) {
    return (
      <div>
        <PageHeader title="Erro" />
        <Card>
          <CardContent className="p-8 text-center text-error-500">
            Auditoria não encontrada
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!content) {
    return (
      <div>
        <Button
          variant="ghost"
          onClick={() => router.push(`/dashboard/audits/${id}/create-content`)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <PageHeader title="Configurar Slides" />
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-neutral-400 mb-4">
              Você precisa gerar o conteúdo dos carrosséis primeiro
            </p>
            <Button onClick={() => router.push(`/dashboard/audits/${id}/create-content`)}>
              Ir para Criação de Conteúdo
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const approvedCarousels = content.carousels?.filter((c: any) => c.approved === true) || []

  // Construir dados de preview para o Player Remotion
  // Usa useMemo via variável derivada (recalcula quando dependências mudam)
  const currentPreviewCarousel = approvedCarousels[previewCarouselIndex] || approvedCarousels[0]
  const previewSlides = currentPreviewCarousel?.slides?.map((slide: { titulo: string; corpo?: string; numero: number }, idx: number) => ({
    title: slide.titulo || '',
    body: slide.corpo || '',
    imageUrl: '', // Imagens serão geradas depois; placeholder é exibido
    slideNumber: idx + 1,
    totalSlides: currentPreviewCarousel.slides.length,
  })) || []

  if (approvedCarousels.length === 0) {
    return (
      <div>
        <Button
          variant="ghost"
          onClick={() => router.push(`/dashboard/audits/${id}/create-content`)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <PageHeader title="Configurar Slides" />
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-neutral-400 mb-4">
              Você precisa aprovar pelo menos um carrossel antes de configurar os slides
            </p>
            <Button onClick={() => router.push(`/dashboard/audits/${id}/create-content`)}>
              Voltar e Aprovar Carrosséis
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => router.push(`/dashboard/audits/${id}/create-content`)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Conteúdo
        </Button>

        <PageHeader
          title={`Configurar Slides - @${audit.profile.username}`}
          description="Configure as imagens de cada slide e gere os visuais"
        />
      </div>

      {/* Layout responsivo: conteúdo + player */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Coluna principal (editor/configurações) */}
        <div className="flex-1 min-w-0 space-y-6">

      {/* Info Card */}
      <Card className="border-info-500/30 bg-info-500/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-info-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-neutral-300">
              <p className="font-medium text-info-400 mb-1">Opções de Layout:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li><strong>Sem Imagem:</strong> Layout focado só no texto (ideal para frases impactantes)</li>
                <li><strong>Automático:</strong> IA gera imagem baseada no conteúdo do slide</li>
                <li><strong>Prompt Customizado:</strong> Você escreve exatamente o que quer na imagem</li>
                <li><strong>Upload:</strong> Você envia sua própria imagem (gráficos, fotos, infográficos)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Galeria de Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Template Visual
          </CardTitle>
          <CardDescription>
            Escolha o estilo visual dos seus slides e reels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {TEMPLATE_LIST.map((template) => {
              const isSelected = selectedTemplateId === template.id
              return (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplateId(template.id as TemplateId)}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all text-left ${
                    isSelected
                      ? 'border-primary-500 ring-2 ring-primary-500/30'
                      : 'border-neutral-700 hover:border-neutral-500'
                  }`}
                >
                  {/* Preview visual mini */}
                  <div
                    className="aspect-[4/5] flex flex-col items-center justify-center p-4"
                    style={{ backgroundColor: template.colors.background }}
                  >
                    <div
                      className="w-8 h-8 rounded-full mb-3"
                      style={{ backgroundColor: template.colors.headerBorder }}
                    />
                    <div
                      className="text-center font-bold mb-2"
                      style={{
                        color: template.colors.title,
                        fontSize: 14,
                      }}
                    >
                      Titulo
                    </div>
                    <div
                      className="text-center text-xs"
                      style={{ color: template.colors.body }}
                    >
                      Corpo do texto
                    </div>
                    {template.layout.showImage && template.layout.imagePosition === 'bottom' && (
                      <div
                        className="w-full h-8 rounded mt-auto"
                        style={{ background: template.colors.imagePlaceholderGradient }}
                      />
                    )}
                    {template.id === 'hormozi-dark' && (
                      <div
                        className="w-full h-0.5 mt-auto"
                        style={{ backgroundColor: template.colors.accent }}
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3 bg-neutral-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm">{template.name}</span>
                      {isSelected && (
                        <CheckCircle className="w-4 h-4 text-primary-500" />
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Seletor de Formato */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Formato de Saida
          </CardTitle>
          <CardDescription>
            Escolha o formato dos slides e reels gerados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {([
              { id: 'feed' as LayoutFormat, label: 'Feed', ratio: '4:5', dims: '1080x1350', icon: Monitor, aspect: 'aspect-[4/5]' },
              { id: 'story' as LayoutFormat, label: 'Story', ratio: '9:16', dims: '1080x1920', icon: Smartphone, aspect: 'aspect-[9/16]' },
              { id: 'square' as LayoutFormat, label: 'Square', ratio: '1:1', dims: '1080x1080', icon: Square, aspect: 'aspect-square' },
            ]).map((fmt) => {
              const isSelected = selectedFormat === fmt.id
              const Icon = fmt.icon
              return (
                <button
                  key={fmt.id}
                  onClick={() => setSelectedFormat(fmt.id)}
                  className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                    isSelected
                      ? 'border-primary-500 ring-2 ring-primary-500/30 bg-primary-500/10'
                      : 'border-neutral-700 hover:border-neutral-500 bg-neutral-800/50'
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isSelected ? 'text-primary-400' : 'text-neutral-400'}`} />
                  <span className={`font-semibold text-sm ${isSelected ? 'text-primary-300' : 'text-neutral-300'}`}>
                    {fmt.label}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {fmt.ratio} ({fmt.dims})
                  </span>
                  {isSelected && (
                    <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-primary-500" />
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Hook Visual (2s de intro) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Hook Visual (2s)
              </CardTitle>
              <CardDescription>
                Adicione uma intro impactante de 2 segundos antes do primeiro slide
              </CardDescription>
            </div>
            <Switch
              checked={hookEnabled}
              onChange={setHookEnabled}
              disabled={generatingReel}
            />
          </div>
        </CardHeader>
        {hookEnabled && (
          <CardContent>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Texto do Hook:
                </label>
                <textarea
                  value={hookText}
                  onChange={(e) => setHookText(e.target.value)}
                  placeholder="Ex: Voce esta perdendo seguidores por causa disso..."
                  rows={2}
                  disabled={generatingReel}
                  className={`w-full bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 text-neutral-200 text-sm placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none ${generatingReel ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </div>

              {/* Seletor de estilo do hook intro */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Estilo da Intro:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Card Spring */}
                  <button
                    type="button"
                    onClick={() => setHookIntroStyle('spring')}
                    disabled={generatingReel}
                    className={`relative p-3 rounded-lg border text-left transition-all ${
                      hookIntroStyle === 'spring'
                        ? 'border-primary-500 bg-primary-500/10 ring-1 ring-primary-500'
                        : 'border-neutral-600 bg-neutral-800 hover:border-neutral-500'
                    } ${generatingReel ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Layers className="w-4 h-4 text-primary-400" />
                      <span className="text-sm font-medium text-neutral-200">Suave (Spring)</span>
                    </div>
                    <p className="text-xs text-neutral-400">
                      Escala suave com fade-in elegante
                    </p>
                  </button>

                  {/* Card Glitch */}
                  <button
                    type="button"
                    onClick={() => setHookIntroStyle('glitch')}
                    disabled={generatingReel}
                    className={`relative p-3 rounded-lg border text-left transition-all ${
                      hookIntroStyle === 'glitch'
                        ? 'border-primary-500 bg-primary-500/10 ring-1 ring-primary-500'
                        : 'border-neutral-600 bg-neutral-800 hover:border-neutral-500'
                    } ${generatingReel ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-medium text-neutral-200">Impacto (Glitch)</span>
                      <Badge variant="warning" className="text-[10px] px-1.5 py-0 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                        Novo
                      </Badge>
                    </div>
                    <p className="text-xs text-neutral-400">
                      Distorcao RGB com tremor digital
                    </p>
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 rounded-lg bg-neutral-800/50 border border-neutral-700">
                <Info className="w-4 h-4 text-info-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-neutral-400">
                  O hook aparece por 2 segundos antes do primeiro slide.
                  {hookIntroStyle === 'glitch'
                    ? ' O estilo Glitch usa separacao RGB e barras de scan para um visual de impacto digital.'
                    : ' O estilo Spring usa escala suave com fade-in elegante.'}
                  {' '}Se nenhum texto for fornecido, o titulo do primeiro slide sera usado.
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Voiceover (Narracao) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5" />
                Narracao (Voiceover)
              </CardTitle>
              <CardDescription>
                Adicione narracao automatica aos Reels com voz sintetizada
              </CardDescription>
            </div>
            <Switch
              checked={voiceoverEnabled}
              onChange={handleVoiceoverToggle}
              disabled={generatingReel}
            />
          </div>
        </CardHeader>
        {voiceoverEnabled && (
          <CardContent>
            <div className="space-y-4">
              {/* Seletor de Provider */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Provider de Voz:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleProviderChange('elevenlabs')}
                    disabled={generatingReel}
                    className={`relative flex flex-col items-start gap-1.5 rounded-xl border-2 p-3 transition-all text-left ${
                      selectedTTSProvider === 'elevenlabs'
                        ? 'border-primary-500 ring-2 ring-primary-500/30 bg-primary-500/10'
                        : 'border-neutral-700 hover:border-neutral-500 bg-neutral-800/50'
                    } ${generatingReel ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold text-sm ${selectedTTSProvider === 'elevenlabs' ? 'text-primary-300' : 'text-neutral-300'}`}>
                        ElevenLabs
                      </span>
                      <Badge variant="info" className="text-[10px] px-1.5 py-0.5">Natural</Badge>
                      {selectedTTSProvider === 'elevenlabs' && (
                        <CheckCircle className="w-3.5 h-3.5 text-primary-500" />
                      )}
                    </div>
                    <span className="text-xs text-neutral-500">
                      Vozes ultra-realistas, melhor qualidade
                    </span>
                  </button>
                  <button
                    onClick={() => handleProviderChange('openai')}
                    disabled={generatingReel}
                    className={`relative flex flex-col items-start gap-1.5 rounded-xl border-2 p-3 transition-all text-left ${
                      selectedTTSProvider === 'openai'
                        ? 'border-primary-500 ring-2 ring-primary-500/30 bg-primary-500/10'
                        : 'border-neutral-700 hover:border-neutral-500 bg-neutral-800/50'
                    } ${generatingReel ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold text-sm ${selectedTTSProvider === 'openai' ? 'text-primary-300' : 'text-neutral-300'}`}>
                        OpenAI
                      </span>
                      <Badge variant="neutral" className="text-[10px] px-1.5 py-0.5">Padrao</Badge>
                      {selectedTTSProvider === 'openai' && (
                        <CheckCircle className="w-3.5 h-3.5 text-primary-500" />
                      )}
                    </div>
                    <span className="text-xs text-neutral-500">
                      Vozes consistentes, rapido
                    </span>
                  </button>
                </div>
              </div>

              {/* Seletor de Voz (dinamico por provider) */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Escolha a voz ({selectedTTSProvider === 'elevenlabs' ? 'ElevenLabs' : 'OpenAI'}):
                </label>

                {/* Minha Voz (clonada) - aparece no topo se ElevenLabs selecionado */}
                {selectedTTSProvider === 'elevenlabs' && clonedVoiceId && (
                  <div className="mb-3">
                    <button
                      onClick={() => setUseClonedVoice(true)}
                      disabled={generatingReel}
                      className={`w-full flex items-center gap-3 rounded-xl border-2 p-3 transition-all text-left ${
                        useClonedVoice
                          ? 'border-success-500 ring-2 ring-success-500/30 bg-success-500/10'
                          : 'border-neutral-700 hover:border-neutral-500 bg-neutral-800/50'
                      } ${generatingReel ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <UserCircle className={`w-5 h-5 ${useClonedVoice ? 'text-success-400' : 'text-neutral-400'}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold text-sm ${useClonedVoice ? 'text-success-300' : 'text-neutral-300'}`}>
                            Minha Voz
                          </span>
                          <Badge variant="success" className="text-[10px] px-1.5 py-0.5">Clonada</Badge>
                          {useClonedVoice && (
                            <CheckCircle className="w-3.5 h-3.5 text-success-500" />
                          )}
                        </div>
                        <span className="text-xs text-neutral-500">
                          Voz clonada de @{audit?.profile?.username} via ElevenLabs
                        </span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemoveClonedVoice() }}
                        disabled={removingVoice || generatingReel}
                        className="p-1.5 rounded-lg hover:bg-error-500/20 text-neutral-500 hover:text-error-400 transition-colors"
                        title="Remover voz clonada"
                      >
                        {removingVoice ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {activeVoiceOptions.map((voiceOpt) => {
                    const isSelected = !useClonedVoice && selectedVoice === voiceOpt.id
                    return (
                      <button
                        key={voiceOpt.id}
                        onClick={() => { setSelectedVoice(voiceOpt.id); setUseClonedVoice(false) }}
                        disabled={generatingReel}
                        className={`flex flex-col items-start gap-1 rounded-xl border-2 p-3 transition-all text-left ${
                          isSelected
                            ? 'border-primary-500 ring-2 ring-primary-500/30 bg-primary-500/10'
                            : 'border-neutral-700 hover:border-neutral-500 bg-neutral-800/50'
                        } ${generatingReel ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center gap-2">
                          <Mic className={`w-4 h-4 ${isSelected ? 'text-primary-400' : 'text-neutral-400'}`} />
                          <span className={`font-semibold text-sm ${isSelected ? 'text-primary-300' : 'text-neutral-300'}`}>
                            {voiceOpt.label}
                          </span>
                          {isSelected && (
                            <CheckCircle className="w-3.5 h-3.5 text-primary-500" />
                          )}
                        </div>
                        <span className="text-xs text-neutral-500">
                          {voiceOpt.description}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Voice Cloning Form (apenas ElevenLabs e sem voz clonada) */}
              {selectedTTSProvider === 'elevenlabs' && !clonedVoiceId && (
                <div className="rounded-xl border-2 border-dashed border-neutral-600 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <UserCircle className="w-5 h-5 text-neutral-400" />
                    <span className="font-semibold text-sm text-neutral-300">Clonar minha voz</span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Envie um audio de 30s a 2min com sua voz para criar uma replica via ElevenLabs.
                  </p>
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-warning-500/10 border border-warning-500/30">
                    <AlertTriangle className="w-4 h-4 text-warning-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-warning-300">
                      <p className="font-medium mb-1">Aviso importante:</p>
                      <p>Voice cloning cria uma replica da sua voz. So use com sua propria voz. O uso indevido viola os termos do ElevenLabs.</p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={voiceCloneConsent}
                      onChange={(e) => setVoiceCloneConsent(e.target.checked)}
                      disabled={cloningVoice}
                      className="rounded border-neutral-600 bg-neutral-700 text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-xs text-neutral-300">Confirmo que este audio contem apenas minha propria voz</span>
                  </label>
                  <input
                    type="file"
                    accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/x-m4a,audio/mp4,.mp3,.wav,.m4a"
                    disabled={!voiceCloneConsent || cloningVoice}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleCloneVoice(file)
                    }}
                    className={`block w-full text-sm text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:cursor-pointer cursor-pointer ${
                      voiceCloneConsent
                        ? 'file:bg-primary-500/20 file:text-primary-400 hover:file:bg-primary-500/30'
                        : 'file:bg-neutral-700 file:text-neutral-500 file:cursor-not-allowed cursor-not-allowed opacity-50'
                    }`}
                  />
                  {cloningVoice && (
                    <div className="flex items-center gap-2 text-sm text-info-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Clonando voz... (pode levar 15-30s)
                    </div>
                  )}
                  {voiceCloneError && (
                    <div className="flex items-start gap-2 p-2 rounded-lg bg-error-500/10 border border-error-500/30">
                      <AlertCircle className="w-4 h-4 text-error-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-error-300">{voiceCloneError}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-start gap-2 p-3 rounded-lg bg-neutral-800/50 border border-neutral-700">
                <Info className="w-4 h-4 text-info-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-neutral-400">
                  {selectedTTSProvider === 'elevenlabs'
                    ? 'ElevenLabs oferece vozes ultra-realistas com suporte nativo a pt-BR. Requer ELEVENLABS_API_KEY. Se ausente, usa OpenAI automaticamente.'
                    : 'A narracao sera gerada via OpenAI TTS (tts-1). Requer OPENAI_API_KEY configurada.'
                  }
                  {' '}A duracao do reel sera ajustada para acompanhar o tempo da narracao.
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Sound Effects nas Transicoes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                Sound Effects
              </CardTitle>
              <CardDescription>
                Adicione efeitos sonoros cinematicos nas transicoes entre slides
              </CardDescription>
            </div>
            <Switch
              checked={soundEffectsEnabled}
              onChange={setSoundEffectsEnabled}
              disabled={generatingReel}
            />
          </div>
        </CardHeader>
        {soundEffectsEnabled && (
          <CardContent>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-neutral-800/50 border border-neutral-700">
              <Info className="w-4 h-4 text-info-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-neutral-400">
                Efeitos sonoros de transicao (whoosh) serao gerados via ElevenLabs e cacheados no Cloudinary.
                Requer ELEVENLABS_API_KEY configurada. O volume dos efeitos e ajustado para 50% para nao sobrepor a narracao.
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Efeitos de Destaque (Particle Burst, Zoom Pulse, Glow) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Efeitos de Destaque
              </CardTitle>
              <CardDescription>
                Particulas, zoom pulse e glow automaticos em momentos-chave do reel
              </CardDescription>
            </div>
            <Switch
              checked={particleEffectsEnabled}
              onChange={setParticleEffectsEnabled}
              disabled={generatingReel}
            />
          </div>
        </CardHeader>
        {particleEffectsEnabled && (
          <CardContent>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-neutral-800/50 border border-neutral-700">
              <Info className="w-4 h-4 text-info-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-neutral-400">
                Efeitos sutis aplicados automaticamente: particulas no titulo do primeiro slide e CTA,
                zoom pulse em numeros/metricas, e glow highlight em keywords.
                Todos os efeitos duram 15-20 frames para nao poluir visualmente.
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Metricas Animadas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5" />
                Metricas Animadas
              </CardTitle>
              <CardDescription>
                Detecta numeros, scores e percentuais no texto e renderiza visualizacoes animadas
              </CardDescription>
            </div>
            <Switch
              checked={animatedMetricsEnabled}
              onChange={setAnimatedMetricsEnabled}
              disabled={generatingReel}
            />
          </div>
        </CardHeader>
        {animatedMetricsEnabled && (
          <CardContent>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-neutral-800/50 border border-neutral-700">
              <Info className="w-4 h-4 text-info-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-neutral-400">
                Detecta automaticamente metricas no corpo dos slides:
                scores (85/100) mostram progresso circular,
                percentuais (42%) mostram barra animada,
                e numeros mostram contador animado com spring.
                Maximo 3 metricas por slide.
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Parallax 3D */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Parallax 3D
              </CardTitle>
              <CardDescription>
                Adiciona profundidade com camadas em velocidades diferentes
              </CardDescription>
            </div>
            <Switch
              checked={parallaxEnabled}
              onChange={setParallaxEnabled}
              disabled={generatingReel}
            />
          </div>
        </CardHeader>
        {parallaxEnabled && (
          <CardContent>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-neutral-800/50 border border-neutral-700">
              <Info className="w-4 h-4 text-info-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-neutral-400">
                Cria sensacao de profundidade com 3 camadas: fundo (lento), conteudo (medio) e texto (estatico).
                O fundo tambem recebe um blur sutil de 2px para reforcar a profundidade.
                Movimento maximo de 30px para manter o efeito sutil.
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Background Music */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Music className="w-5 h-5" />
                Musica de Fundo
              </CardTitle>
              <CardDescription>
                Adicione musica de fundo ambiente aos Reels
              </CardDescription>
            </div>
            <Switch
              checked={backgroundMusicEnabled}
              onChange={setBackgroundMusicEnabled}
              disabled={generatingReel}
            />
          </div>
        </CardHeader>
        {backgroundMusicEnabled && (
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Mood da musica:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { id: 'energetic' as MusicMoodOption, label: 'Energetico', description: 'Upbeat, motivacional', Icon: Zap },
                    { id: 'calm' as MusicMoodOption, label: 'Calmo', description: 'Ambient, relaxante', Icon: Waves },
                    { id: 'corporate' as MusicMoodOption, label: 'Corporativo', description: 'Profissional, clean', Icon: Briefcase },
                    { id: 'inspiring' as MusicMoodOption, label: 'Inspirador', description: 'Cinematic, emocional', Icon: Sparkles },
                  ]).map((moodOpt) => {
                    const isSelected = selectedMusicMood === moodOpt.id
                    const MoodIcon = moodOpt.Icon
                    return (
                      <button
                        key={moodOpt.id}
                        onClick={() => setSelectedMusicMood(moodOpt.id)}
                        disabled={generatingReel}
                        className={`flex flex-col items-start gap-1 rounded-xl border-2 p-3 transition-all text-left ${
                          isSelected
                            ? 'border-primary-500 ring-2 ring-primary-500/30 bg-primary-500/10'
                            : 'border-neutral-700 hover:border-neutral-500 bg-neutral-800/50'
                        } ${generatingReel ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center gap-2">
                          <MoodIcon className={`w-4 h-4 ${isSelected ? 'text-primary-400' : 'text-neutral-400'}`} />
                          <span className={`font-semibold text-sm ${isSelected ? 'text-primary-300' : 'text-neutral-300'}`}>
                            {moodOpt.label}
                          </span>
                          {isSelected && (
                            <CheckCircle className="w-3.5 h-3.5 text-primary-500" />
                          )}
                        </div>
                        <span className="text-xs text-neutral-500">
                          {moodOpt.description}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-neutral-800/50 border border-neutral-700">
                <Info className="w-4 h-4 text-info-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-neutral-400">
                  Volume: {voiceoverEnabled ? '15%' : '30%'} {voiceoverEnabled ? '-- nao compete com narracao' : '-- musica como elemento principal'}.
                  Coloque seus MP3 em <code className="bg-neutral-700 px-1 rounded">/public/audio/music/{'{'}{selectedMusicMood}{'}'}/track-1.mp3</code>.
                  A musica faz loop automatico e tem fade-in/out suave.
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* B-Roll Video (Pexels) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Film className="w-5 h-5" />
                B-Roll Video
                <Badge variant="info" className="text-[10px] px-1.5 py-0.5">beta</Badge>
              </CardTitle>
              <CardDescription>
                Substitua imagens estaticas por clipes de video curtos como background dos slides
              </CardDescription>
            </div>
            <Switch
              checked={brollVideoEnabled}
              onChange={setBrollVideoEnabled}
              disabled={generatingReel}
            />
          </div>
        </CardHeader>
        {brollVideoEnabled && (
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-neutral-800/50 border border-neutral-700">
                <Info className="w-4 h-4 text-info-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-neutral-400 space-y-1">
                  <p>
                    Videos stock HD serao buscados automaticamente no Pexels para cada slide,
                    baseado no conteudo/titulo. Se nenhum video for encontrado, a imagem via IA sera usada como fallback.
                  </p>
                  <p className="text-warning-400">
                    Aumenta o tempo de renderizacao em ~10-20s por slide. Requer PEXELS_API_KEY configurada.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Background Animado */}
      <Card className={brollVideoEnabled ? 'opacity-60' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Background Animado
              </CardTitle>
              <CardDescription>
                {brollVideoEnabled
                  ? 'Desative o B-Roll Video para usar backgrounds animados'
                  : 'Fundos animados em loop para slides sem imagem ou video'
                }
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {([
              { id: 'auto' as AnimatedBackgroundOption, label: 'Auto', description: 'Escolhe o melhor para o template' },
              { id: 'none' as AnimatedBackgroundOption, label: 'Nenhum', description: 'Cor solida do template' },
              { id: 'gradient-flow' as AnimatedBackgroundOption, label: 'Gradiente', description: 'Gradiente suave em movimento' },
              { id: 'geometric' as AnimatedBackgroundOption, label: 'Geometrico', description: 'Grid de formas com pulso' },
              { id: 'particles' as AnimatedBackgroundOption, label: 'Particulas', description: 'Particulas flutuando' },
              { id: 'wave-mesh' as AnimatedBackgroundOption, label: 'Ondas', description: 'Ondas senoidais sobrepostas' },
            ]).map((bgOpt) => {
              const isSelected = selectedAnimatedBg === bgOpt.id
              return (
                <button
                  key={bgOpt.id}
                  onClick={() => setSelectedAnimatedBg(bgOpt.id)}
                  disabled={brollVideoEnabled || generatingReel}
                  className={`
                    relative p-3 rounded-lg border text-left transition-all
                    ${isSelected
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-neutral-700 bg-neutral-800/50 hover:border-neutral-500'
                    }
                    ${brollVideoEnabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-sm font-medium text-neutral-200">
                      {bgOpt.label}
                    </span>
                    {isSelected && (
                      <CheckCircle className="w-3.5 h-3.5 text-primary-500" />
                    )}
                  </div>
                  <span className="text-xs text-neutral-500">
                    {bgOpt.description}
                  </span>
                </button>
              )
            })}
          </div>
          {brollVideoEnabled && (
            <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-neutral-800/50 border border-neutral-700">
              <AlertTriangle className="w-4 h-4 text-warning-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-neutral-400">
                Backgrounds animados sao desativados quando B-Roll Video esta ativo.
                O video de fundo tem prioridade.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legendas Animadas */}
      <Card className={!voiceoverEnabled ? 'opacity-60' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Subtitles className="w-5 h-5" />
                Legendas Animadas
              </CardTitle>
              <CardDescription>
                {voiceoverEnabled
                  ? 'Adicione legendas sincronizadas estilo CapCut/Hormozi aos Reels'
                  : 'Ative a narracao primeiro para usar legendas animadas'
                }
              </CardDescription>
            </div>
            <div className="relative group">
              <Switch
                checked={captionsEnabled}
                onChange={setCaptionsEnabled}
                disabled={!voiceoverEnabled || generatingReel}
              />
              {!voiceoverEnabled && (
                <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-neutral-700 text-neutral-300 text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Ative a narracao primeiro
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        {captionsEnabled && voiceoverEnabled && (
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Estilo de legenda:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {CAPTION_STYLE_OPTIONS.map((styleOpt) => {
                    const isSelected = selectedCaptionStyle === styleOpt.id
                    return (
                      <button
                        key={styleOpt.id}
                        onClick={() => setSelectedCaptionStyle(styleOpt.id)}
                        disabled={generatingReel}
                        className={`relative flex flex-col items-start gap-1 rounded-xl border-2 p-3 transition-all text-left ${
                          isSelected
                            ? 'border-primary-500 ring-2 ring-primary-500/30 bg-primary-500/10'
                            : 'border-neutral-700 hover:border-neutral-500 bg-neutral-800/50'
                        } ${generatingReel ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {styleOpt.isPremium && (
                          <span className="absolute -top-2 -right-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full shadow-lg">
                            Premium
                          </span>
                        )}
                        <div className="flex items-center gap-2">
                          <Subtitles className={`w-4 h-4 ${isSelected ? 'text-primary-400' : 'text-neutral-400'}`} />
                          <span className={`font-semibold text-sm ${isSelected ? 'text-primary-300' : 'text-neutral-300'}`}>
                            {styleOpt.label}
                          </span>
                          {isSelected && (
                            <CheckCircle className="w-3.5 h-3.5 text-primary-500" />
                          )}
                        </div>
                        <span className="text-xs text-neutral-500">
                          {styleOpt.description}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-neutral-800/50 border border-neutral-700">
                <Info className="w-4 h-4 text-info-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-neutral-400">
                  As legendas sao geradas via transcricao do audio (OpenAI Whisper) com timestamps por palavra,
                  sincronizadas com a narracao. Adiciona ~15-30s ao tempo de geracao por slide.
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Efeito de Texto Dinamico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="w-5 h-5" />
            Efeito de Texto
          </CardTitle>
          <CardDescription>
            Escolha como o titulo dos slides aparece no Reel animado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {TEXT_EFFECT_OPTIONS.map((effectOpt) => {
              const isSelected = selectedTextEffect === effectOpt.id
              return (
                <button
                  key={effectOpt.id}
                  onClick={() => setSelectedTextEffect(effectOpt.id)}
                  disabled={generatingReel}
                  className={`flex flex-col items-start gap-1 rounded-xl border-2 p-3 transition-all text-left ${
                    isSelected
                      ? 'border-primary-500 ring-2 ring-primary-500/30 bg-primary-500/10'
                      : 'border-neutral-700 hover:border-neutral-500 bg-neutral-800/50'
                  } ${generatingReel ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <Type className={`w-4 h-4 ${isSelected ? 'text-primary-400' : 'text-neutral-400'}`} />
                    <span className={`font-semibold text-sm ${isSelected ? 'text-primary-300' : 'text-neutral-300'}`}>
                      {effectOpt.label}
                    </span>
                    {effectOpt.isNew && (
                      <Badge variant="success" className="text-[10px] px-1.5 py-0">Novo</Badge>
                    )}
                    {isSelected && (
                      <CheckCircle className="w-3.5 h-3.5 text-primary-500" />
                    )}
                  </div>
                  <span className="text-xs text-neutral-500">
                    {effectOpt.description}
                  </span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Estilo de Transicao entre Slides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Transicao entre Slides
          </CardTitle>
          <CardDescription>
            Escolha o efeito visual entre cada slide no Reel animado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            {TRANSITION_STYLE_OPTIONS.map((transOpt) => {
              const isSelected = selectedTransitionStyle === transOpt.id
              const TransIcon = transOpt.Icon
              return (
                <button
                  key={transOpt.id}
                  onClick={() => setSelectedTransitionStyle(transOpt.id)}
                  disabled={generatingReel}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all text-center ${
                    isSelected
                      ? 'border-primary-500 ring-2 ring-primary-500/30 bg-primary-500/10'
                      : 'border-neutral-700 hover:border-neutral-500 bg-neutral-800/50'
                  } ${generatingReel ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <TransIcon className={`w-5 h-5 ${isSelected ? 'text-primary-400' : 'text-neutral-400'}`} />
                  <span className={`font-semibold text-xs ${isSelected ? 'text-primary-300' : 'text-neutral-300'}`}>
                    {transOpt.label}
                  </span>
                  {isSelected && (
                    <CheckCircle className="w-3.5 h-3.5 text-primary-500" />
                  )}
                </button>
              )
            })}
          </div>
          <p className="text-xs text-neutral-500 mt-3">
            {selectedTransitionStyle === 'random'
              ? 'Cada transicao usara um efeito diferente para maxima variedade visual.'
              : `Todas as transicoes usarao o efeito "${TRANSITION_STYLE_OPTIONS.find(t => t.id === selectedTransitionStyle)?.label}".`
            }
          </p>
        </CardContent>
      </Card>

      {/* Slides já gerados */}
      {slides && (
        <Card className="bg-gradient-to-br from-success-500/10 to-success-500/5 border-success-500/20">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle className="flex items-center gap-2">
                <GalleryHorizontal className="w-5 h-5" />
                Slides Gerados ({slides.summary?.totalSlides} imagens)
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDownloadZip}
                  disabled={downloadingZip}
                >
                  {downloadingZip ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gerando ZIP...
                    </>
                  ) : (
                    <>
                      <Archive className="w-4 h-4 mr-2" />
                      Baixar ZIP
                    </>
                  )}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSendToDrive}
                  disabled={sendingToDrive}
                >
                  {sendingToDrive ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <FolderOpen className="w-4 h-4 mr-2" />
                      Enviar para Drive
                    </>
                  )}
                </Button>
              </div>
            </div>
            {driveMessage && (
              <p className="text-success-400 text-sm mt-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {driveMessage}
              </p>
            )}
            {driveError && (
              <p className="text-error-400 text-sm mt-2">{driveError}</p>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {slides.carousels.map((carousel: any, idx: number) => {
                // Aspect ratio do thumbnail baseado no formato dos slides
                const slidesFormat = slides.format || 'feed'
                const aspectClass = slidesFormat === 'story'
                  ? 'aspect-[9/16]'
                  : slidesFormat === 'square'
                    ? 'aspect-square'
                    : 'aspect-[4/5]'
                return (
                <div key={idx}>
                  <h4 className="font-semibold mb-3 text-sm text-neutral-300">{carousel.title}</h4>
                  <div className="grid grid-cols-4 gap-3">
                    {carousel.slides.map((slide: any) => (
                      <a
                        key={slide.slideNumber}
                        href={slide.cloudinaryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block group"
                      >
                        <div className={`relative ${aspectClass} rounded-lg overflow-hidden border border-neutral-700 hover:border-success-500 transition-all`}>
                          <img
                            src={slide.cloudinaryUrl}
                            alt={`Slide ${slide.slideNumber}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-xs font-semibold">Ver tamanho real</span>
                          </div>
                          <div className="absolute top-2 right-2 bg-success-500 text-white px-2 py-1 rounded text-xs font-semibold">
                            {slide.slideNumber}/{carousel.slides.length}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Errors */}
      {slidesError && (
        <Card className="border-error-500">
          <CardContent className="p-4">
            <p className="text-error-500">{slidesError}</p>
          </CardContent>
        </Card>
      )}

      {reelError && (
        <Card className="border-error-500">
          <CardContent className="p-4">
            <p className="text-error-500">{reelError}</p>
          </CardContent>
        </Card>
      )}

      {/* Reels Animados Gerados */}
      {reelVideos && reelVideos.length > 0 && (
        <Card className="bg-gradient-to-br from-warning-500/10 to-warning-500/5 border-warning-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5 text-warning-400" />
              Reels Animados ({reelVideos.length} {reelVideos.length === 1 ? 'video' : 'videos'})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {reelVideos.map((video: any, i: number) => (
                <div key={i} className="space-y-2">
                  <p className="text-sm font-medium text-neutral-300">{video.title}</p>
                  <div className="relative rounded-lg overflow-hidden border border-neutral-700">
                    <video
                      src={video.videoUrl}
                      controls
                      playsInline
                      style={{ width: '100%', aspectRatio: selectedFormat === 'story' ? '9/16' : selectedFormat === 'square' ? '1/1' : '4/5' }}
                      className="bg-black"
                    />
                    <div className="absolute top-2 right-2 bg-warning-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      {video.totalSlides} slides / {Math.round(video.duration)}s
                    </div>
                  </div>
                  <a href={video.videoUrl} download={`reel-${video.title}.mp4`}>
                    <Button variant="secondary" size="sm" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Baixar MP4
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botoes de Geracao */}
      <div className="flex justify-center gap-3 flex-wrap">
        <Button
          variant="primary"
          size="lg"
          onClick={handleGenerateSlides}
          disabled={generatingSlides}
          className="px-8"
        >
          {generatingSlides ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Gerando Slides...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Gerar Slides ({approvedCarousels.length} carrossel{approvedCarousels.length !== 1 ? 'eis' : ''})
            </>
          )}
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={handleGenerateReel}
          disabled={generatingReel || generatingBatch}
          className="px-8 border-warning-500/40 text-warning-400 hover:bg-warning-500/10"
        >
          {generatingReel ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              {voiceoverEnabled
                ? captionsEnabled
                  ? 'Gerando Reel com Narracao + Legendas...'
                  : 'Gerando Reel com Narracao...'
                : 'Gerando Reel... (2-3 min)'
              }
            </>
          ) : (
            <>
              {voiceoverEnabled ? (
                captionsEnabled ? (
                  <Subtitles className="w-5 h-5 mr-2" />
                ) : (
                  <Mic className="w-5 h-5 mr-2" />
                )
              ) : (
                <Video className="w-5 h-5 mr-2" />
              )}
              {voiceoverEnabled
                ? captionsEnabled
                  ? 'Gerar Reel com Narracao + Legendas'
                  : 'Gerar Reel com Narracao'
                : 'Gerar Reel Animado (MP4)'
              }
            </>
          )}
        </Button>
        {approvedCarousels.length > 1 && (
          <Button
            variant="secondary"
            size="lg"
            onClick={handleGenerateBatch}
            disabled={generatingReel || generatingBatch}
            className="px-8 border-primary-500/40 text-primary-400 hover:bg-primary-500/10"
          >
            {generatingBatch ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Gerando {approvedCarousels.length} Reels...
              </>
            ) : (
              <>
                <Layers className="w-5 h-5 mr-2" />
                Gerar Todos os Reels ({approvedCarousels.length})
              </>
            )}
          </Button>
        )}
      </div>

      {/* Batch Progress Cards */}
      {batchCards.length > 0 && (
        <Card className="border-primary-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary-400" />
              Geracao em Batch
              {generatingBatch && (
                <Badge variant="info" className="ml-2">Em andamento</Badge>
              )}
            </CardTitle>
            <CardDescription>
              {batchProgress.completed}/{batchProgress.total} reels concluidos
            </CardDescription>
            {/* Progress bar */}
            <div className="w-full bg-neutral-700 rounded-full h-2 mt-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                style={{
                  width: batchProgress.total > 0
                    ? `${(batchProgress.completed / batchProgress.total) * 100}%`
                    : '0%',
                }}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {batchCards.map((card, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl border p-4 space-y-2 transition-all ${
                    card.status === 'done'
                      ? 'border-success-500/40 bg-success-500/5'
                      : card.status === 'error'
                        ? 'border-error-500/40 bg-error-500/5'
                        : card.status === 'generating'
                          ? 'border-warning-500/40 bg-warning-500/5'
                          : 'border-neutral-700 bg-neutral-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm truncate max-w-[160px]">
                      {card.title}
                    </span>
                    {card.status === 'waiting' && (
                      <Clock className="w-4 h-4 text-neutral-400" />
                    )}
                    {card.status === 'generating' && (
                      <Loader2 className="w-4 h-4 text-warning-400 animate-spin" />
                    )}
                    {card.status === 'done' && (
                      <CheckCircle className="w-4 h-4 text-success-400" />
                    )}
                    {card.status === 'error' && (
                      <AlertCircle className="w-4 h-4 text-error-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <Badge variant="neutral" className="text-[10px]">{card.templateId}</Badge>
                    <Badge variant="neutral" className="text-[10px]">{card.format}</Badge>
                  </div>
                  {card.status === 'done' && card.videoUrl && (
                    <div className="pt-1">
                      <a
                        href={card.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-success-400 hover:text-success-300 flex items-center gap-1"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        Assistir ({card.duration ? `${Math.round(card.duration)}s` : 'pronto'})
                      </a>
                    </div>
                  )}
                  {card.status === 'error' && card.error && (
                    <p className="text-xs text-error-400 line-clamp-2">{card.error}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Carrosséis Aprovados - Configuração de Imagens */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">
          Configurar Imagens dos Slides ({approvedCarousels.length} carrossel{approvedCarousels.length !== 1 ? 'éis' : ''})
        </h2>

        {approvedCarousels.map((carousel: any, carouselIdx: number) => {
          const originalIndex = content.carousels.indexOf(carousel)

          return (
            <Card key={originalIndex} className="border-primary-500/30 bg-primary-500/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl mb-1">{carousel.titulo}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Badge variant="neutral">{carousel.tipo}</Badge>
                      <span className="text-neutral-400">{carousel.slides.length} slides</span>
                    </CardDescription>
                  </div>
                  <Badge variant="success" className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Aprovado
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {carousel.slides.map((slide: any, slideIdx: number) => {
                    const config = slideImageOptions.get(originalIndex)?.get(slideIdx)
                    const currentMode = config?.mode || 'auto'

                    return (
                      <Card key={slideIdx} className="bg-neutral-800/50">
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            {/* Cabeçalho do Slide */}
                            <div className="flex items-start gap-3">
                              <div className="bg-primary-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                                {slide.numero}
                              </div>
                              <div className="flex-1">
                                <h5 className="font-semibold mb-1">{slide.titulo}</h5>
                                <p className="text-sm text-neutral-400">{slide.corpo}</p>
                              </div>
                            </div>

                            {/* Controles de Imagem */}
                            <div className="pl-11 space-y-3">
                              <div className="flex items-center gap-2 mb-2">
                                <ImageIcon className="w-4 h-4 text-neutral-400" />
                                <span className="text-sm font-medium text-neutral-300">Imagem do Slide:</span>
                              </div>

                              {/* Botões de Modo */}
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  onClick={() => handleUpdateSlideImageOption(originalIndex, slideIdx, 'no_image')}
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    currentMode === 'no_image'
                                      ? 'bg-neutral-600 text-white ring-2 ring-neutral-400'
                                      : 'bg-neutral-700 text-neutral-400 hover:bg-neutral-600'
                                  }`}
                                >
                                  📄 Sem Imagem
                                </button>
                                <button
                                  onClick={() => handleUpdateSlideImageOption(originalIndex, slideIdx, 'auto')}
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    currentMode === 'auto'
                                      ? 'bg-primary-500 text-white'
                                      : 'bg-neutral-700 text-neutral-400 hover:bg-neutral-600'
                                  }`}
                                >
                                  ✨ Auto (com IA)
                                </button>
                                <button
                                  onClick={() => handleUpdateSlideImageOption(originalIndex, slideIdx, 'custom_prompt')}
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    currentMode === 'custom_prompt'
                                      ? 'bg-info-500 text-white'
                                      : 'bg-neutral-700 text-neutral-400 hover:bg-neutral-600'
                                  }`}
                                >
                                  <Pencil className="w-4 h-4 inline-block mr-1.5" />
                                  Prompt Customizado
                                </button>
                                <button
                                  onClick={() => handleUpdateSlideImageOption(originalIndex, slideIdx, 'upload')}
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    currentMode === 'upload'
                                      ? 'bg-success-500 text-white'
                                      : 'bg-neutral-700 text-neutral-400 hover:bg-neutral-600'
                                  }`}
                                >
                                  📤 Upload
                                </button>
                              </div>

                              {/* Campo de Prompt Customizado */}
                              {currentMode === 'custom_prompt' && (
                                <div>
                                  <label className="block text-sm text-neutral-400 mb-2">
                                    Descreva a imagem que você quer gerar:
                                  </label>
                                  <textarea
                                    value={config?.customPrompt || ''}
                                    onChange={(e) => handleUpdateSlideImageOption(originalIndex, slideIdx, 'custom_prompt', { customPrompt: e.target.value })}
                                    placeholder="Ex: Uma pessoa trabalhando em um laptop moderno em um café acolhedor, luz natural, ambiente profissional..."
                                    rows={3}
                                    className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 text-neutral-200 text-sm placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-info-500 resize-none"
                                  />
                                </div>
                              )}

                              {/* Upload de Imagem */}
                              {currentMode === 'upload' && (
                                <div>
                                  {config?.uploadUrl ? (
                                    <div className="space-y-2">
                                      <div className="relative rounded-lg overflow-hidden border border-success-500/50">
                                        <img
                                          src={config.uploadUrl}
                                          alt="Imagem enviada"
                                          className="w-full h-48 object-cover"
                                        />
                                        <div className="absolute top-2 right-2">
                                          <Badge variant="success" className="text-xs">✓ Enviada</Badge>
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => {
                                          const input = document.createElement('input')
                                          input.type = 'file'
                                          input.accept = 'image/*'
                                          input.onchange = (e: any) => {
                                            const file = e.target.files?.[0]
                                            if (file) handleUploadSlideImage(originalIndex, slideIdx, file)
                                          }
                                          input.click()
                                        }}
                                        className="text-sm text-success-400 hover:text-success-300 underline"
                                      >
                                        Trocar imagem
                                      </button>
                                    </div>
                                  ) : (
                                    <div>
                                      <label className="block text-sm text-neutral-400 mb-2">
                                        Escolha uma imagem (PNG, JPG - máx 5MB):
                                      </label>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        disabled={uploadingImage?.carouselIndex === originalIndex && uploadingImage?.slideIndex === slideIdx}
                                        onChange={(e) => {
                                          const file = e.target.files?.[0]
                                          if (file) handleUploadSlideImage(originalIndex, slideIdx, file)
                                        }}
                                        className="block w-full text-sm text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-success-500/20 file:text-success-400 hover:file:bg-success-500/30 file:cursor-pointer cursor-pointer"
                                      />
                                      {uploadingImage?.carouselIndex === originalIndex && uploadingImage?.slideIndex === slideIdx && (
                                        <div className="mt-2 flex items-center gap-2 text-sm text-info-400">
                                          <Loader2 className="w-4 h-4 animate-spin" />
                                          Enviando imagem...
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Indicadores */}
                              {currentMode === 'no_image' && (
                                <div className="text-sm text-neutral-500 italic">
                                  📄 Slide será gerado sem imagem (layout focado no texto)
                                </div>
                              )}
                              {currentMode === 'auto' && (
                                <div className="text-sm text-neutral-500 italic">
                                  ✨ A IA vai gerar a imagem baseada no conteúdo do slide
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

        </div>{/* Fim da coluna principal */}

        {/* Coluna do Player (sticky sidebar - visível em desktop) */}
        <div className="hidden lg:block w-[400px] flex-shrink-0">
          <div className="sticky top-6">
            {/* Seletor de carrossel para preview */}
            {approvedCarousels.length > 1 && (
              <div className="mb-3">
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                  Carrossel no preview:
                </label>
                <select
                  value={previewCarouselIndex}
                  onChange={(e) => setPreviewCarouselIndex(Number(e.target.value))}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {approvedCarousels.map((c: { titulo: string }, i: number) => (
                    <option key={i} value={i}>
                      {i + 1}. {c.titulo?.length > 35 ? c.titulo.substring(0, 35) + '...' : c.titulo}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <ReelPreviewPlayer
              slides={previewSlides}
              profileName={audit.profile.full_name || audit.profile.username}
              profileUsername={audit.profile.username}
              profileImageUrl={audit.profile.profile_pic_url || ''}
              templateId={selectedTemplateId}
              format={selectedFormat}
              loop
            />
          </div>
        </div>
      </div>{/* Fim do layout flex */}

      {/* Player para mobile (stacked, abaixo do conteúdo) */}
      <div className="lg:hidden">
        {approvedCarousels.length > 1 && (
          <div className="mb-3">
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              Carrossel no preview:
            </label>
            <select
              value={previewCarouselIndex}
              onChange={(e) => setPreviewCarouselIndex(Number(e.target.value))}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {approvedCarousels.map((c: { titulo: string }, i: number) => (
                <option key={i} value={i}>
                  {i + 1}. {c.titulo?.length > 35 ? c.titulo.substring(0, 35) + '...' : c.titulo}
                </option>
              ))}
            </select>
          </div>
        )}

        <ReelPreviewPlayer
          slides={previewSlides}
          profileName={audit.profile.full_name || audit.profile.username}
          profileUsername={audit.profile.username}
          profileImageUrl={audit.profile.profile_pic_url || ''}
          templateId={selectedTemplateId}
          format={selectedFormat}
          loop
        />
      </div>

      {/* Botões de Geração (duplicado no final para conveniência) */}
      <div className="flex justify-center gap-3 flex-wrap pt-4 border-t border-neutral-800">
        <Button
          variant="primary"
          size="lg"
          onClick={handleGenerateSlides}
          disabled={generatingSlides}
          className="px-8"
        >
          {generatingSlides ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Gerando Slides...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Gerar Slides ({approvedCarousels.length})
            </>
          )}
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={handleGenerateReel}
          disabled={generatingReel || generatingBatch}
          className="px-8 border-warning-500/40 text-warning-400 hover:bg-warning-500/10"
        >
          {generatingReel ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              {voiceoverEnabled
                ? captionsEnabled
                  ? 'Gerando Reel com Narracao + Legendas...'
                  : 'Gerando Reel com Narracao...'
                : 'Gerando Reel...'
              }
            </>
          ) : (
            <>
              {voiceoverEnabled ? (
                captionsEnabled ? (
                  <Subtitles className="w-5 h-5 mr-2" />
                ) : (
                  <Mic className="w-5 h-5 mr-2" />
                )
              ) : (
                <Video className="w-5 h-5 mr-2" />
              )}
              {voiceoverEnabled
                ? captionsEnabled
                  ? 'Gerar Reel com Narracao + Legendas'
                  : 'Gerar Reel com Narracao'
                : 'Gerar Reel (MP4)'
              }
            </>
          )}
        </Button>
        {approvedCarousels.length > 1 && (
          <Button
            variant="secondary"
            size="lg"
            onClick={handleGenerateBatch}
            disabled={generatingReel || generatingBatch}
            className="px-8 border-primary-500/40 text-primary-400 hover:bg-primary-500/10"
          >
            {generatingBatch ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Gerando {approvedCarousels.length} Reels...
              </>
            ) : (
              <>
                <Layers className="w-5 h-5 mr-2" />
                Gerar Todos ({approvedCarousels.length})
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
