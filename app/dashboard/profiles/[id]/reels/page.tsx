'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useProfile } from '@/hooks/use-profiles'
import { PageHeader } from '@/components/molecules/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { Badge } from '@/components/atoms/badge'
import { Skeleton } from '@/components/atoms/skeleton'
import {
  Video, ArrowLeft, CheckCircle, Loader2, Download,
  Film, Sparkles, Palette, Clapperboard, Scissors, ChevronDown, ChevronUp,
  Mic, MicOff, Type, Globe, Settings2, Monitor, Smartphone, Square
} from 'lucide-react'
import Link from 'next/link'

interface Carousel {
  titulo: string
  tipo: string
  objetivo: string
  baseado_em: string
  approved: boolean | null
  slides: Array<{ numero: number; titulo: string; corpo: string }>
  caption: string
  cta: string
}

interface ReelVideo {
  carouselIndex: number
  title: string
  videoUrl: string
  cloudinaryPublicId: string
  duration: number
  totalSlides: number
}

interface AuditContent {
  auditId: string
  auditDate: string
  carousels: Carousel[]
  reelVideos: ReelVideo[]
}

// Etapas do pipeline do squad
const PIPELINE_STEPS = [
  { id: 'screenwriter', icon: Film, label: 'Roteirista', description: 'Criando roteiro cinematográfico...' },
  { id: 'art-director', icon: Palette, label: 'Art Director', description: 'Definindo identidade visual...' },
  { id: 'director', icon: Clapperboard, label: 'Diretor', description: 'Montando spec técnico...' },
  { id: 'render', icon: Video, label: 'Renderizando', description: 'Gerando vídeo via Remotion...' },
  { id: 'editor', icon: Scissors, label: 'Editor', description: 'Revisando qualidade...' },
]

// Formatos disponíveis
const FORMATS = [
  { id: 'story', label: 'Reels / TikTok', desc: '1080×1920 (9:16)', icon: Smartphone, ratio: '9/16' },
  { id: 'feed', label: 'Feed Instagram', desc: '1080×1350 (4:5)', icon: Monitor, ratio: '4/5' },
  { id: 'square', label: 'Quadrado', desc: '1080×1080 (1:1)', icon: Square, ratio: '1/1' },
] as const

// Estilos visuais (templates Remotion)
const VISUAL_STYLES = [
  { id: 'editorial-magazine', label: 'Cinematico', desc: 'Imagem full-screen + headline overlay (estilo Reels/TikTok)' },
  { id: 'minimalist', label: 'Carrossel Animado', desc: 'Layout de slides com texto + imagem (estilo apresentacao)' },
  { id: 'hormozi-dark', label: 'Dark Bold', desc: 'Fundo escuro, texto impactante (estilo vendas)' },
  { id: 'neon-social', label: 'Neon Social', desc: 'Cores vibrantes, visual viral' },
] as const

// Vozes disponíveis por provider
const VOICES = {
  elevenlabs: [
    { id: 'bella', label: 'Bella', desc: 'Feminina, suave, profissional' },
    { id: 'rachel', label: 'Rachel', desc: 'Feminina, clara, narradora' },
    { id: 'adam', label: 'Adam', desc: 'Masculino, grave, confiante' },
    { id: 'antoni', label: 'Antoni', desc: 'Masculino, jovem, energético' },
  ],
  openai: [
    { id: 'nova', label: 'Nova', desc: 'Feminina, natural, energética' },
    { id: 'shimmer', label: 'Shimmer', desc: 'Feminina, suave, amigável' },
    { id: 'alloy', label: 'Alloy', desc: 'Neutra, versátil' },
    { id: 'echo', label: 'Echo', desc: 'Masculino, ressonante' },
    { id: 'fable', label: 'Fable', desc: 'Masculino, narrativo' },
    { id: 'onyx', label: 'Onyx', desc: 'Masculino, grave, autoritário' },
  ],
} as const

const LANGUAGES = [
  { id: 'pt-BR', label: 'Portugues (Brasil)' },
  { id: 'pt-PT', label: 'Portugues (Portugal)' },
  { id: 'en-US', label: 'English (US)' },
  { id: 'es-ES', label: 'Espanol' },
] as const

const CAPTION_STYLES = [
  { id: 'karaoke', label: 'Karaoke', desc: 'Palavra por palavra, estilo musical' },
  { id: 'highlight', label: 'Highlight', desc: 'Destaca a palavra atual' },
  { id: 'tiktok-viral', label: 'TikTok Viral', desc: 'Bold + keywords em destaque' },
] as const

export default function ReelsPage() {
  const params = useParams()
  const id = params.id as string
  const { profile, isLoading: profileLoading } = useProfile(id)

  const [auditsContent, setAuditsContent] = useState<AuditContent[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)
  const [pipelineStep, setPipelineStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [expandedAudit, setExpandedAudit] = useState<string | null>(null)
  const [showConfig, setShowConfig] = useState(true)

  // Configurações de geração
  const [selectedTemplate, setSelectedTemplate] = useState<string>('editorial-magazine')
  const [selectedFormat, setSelectedFormat] = useState<string>('story')
  const [voiceoverEnabled, setVoiceoverEnabled] = useState(true)
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'elevenlabs'>('elevenlabs')
  const [selectedVoice, setSelectedVoice] = useState<string>('bella')
  const [selectedLanguage, setSelectedLanguage] = useState<string>('pt-BR')
  const [captionsEnabled, setCaptionsEnabled] = useState(true)
  const [selectedCaptionStyle, setSelectedCaptionStyle] = useState<string>('karaoke')
  const [backgroundMusic, setBackgroundMusic] = useState(true)

  // Quando muda o provider, resetar voz para a primeira do novo provider
  useEffect(() => {
    const firstVoice = VOICES[selectedProvider][0]
    setSelectedVoice(firstVoice.id)
  }, [selectedProvider])

  // Legendas requerem voiceover
  useEffect(() => {
    if (!voiceoverEnabled) setCaptionsEnabled(false)
  }, [voiceoverEnabled])

  // Carregar conteúdos de todas as auditorias do perfil
  useEffect(() => {
    const loadAllContent = async () => {
      if (!profile?.audits?.length) {
        setLoading(false)
        return
      }

      const results: AuditContent[] = []

      for (const audit of profile.audits) {
        try {
          const res = await fetch(`/api/audits/${audit.id}/content`)
          if (!res.ok) continue

          const data = await res.json()
          if (!data.content?.carousels) continue

          const approvedCarousels = data.content.carousels.filter(
            (c: Carousel) => c.approved === true
          )

          if (approvedCarousels.length === 0) continue

          results.push({
            auditId: audit.id,
            auditDate: audit.audit_date,
            carousels: approvedCarousels,
            reelVideos: data.reel_videos?.videos || [],
          })
        } catch {
          // Silently skip failed audits
        }
      }

      setAuditsContent(results)
      if (results.length > 0) {
        setExpandedAudit(results[0].auditId)
      }
      setLoading(false)
    }

    if (profile) loadAllContent()
  }, [profile])

  // Gerar reel para um carrossel
  const handleGenerateReel = async (auditId: string, carouselIndex: number, carousel: Carousel) => {
    const key = `${auditId}-${carouselIndex}`
    setGenerating(key)
    setPipelineStep(0)
    setError(null)

    const progressInterval = setInterval(() => {
      setPipelineStep(prev => {
        if (prev < PIPELINE_STEPS.length - 1) return prev + 1
        return prev
      })
    }, 8000)

    try {
      const res = await fetch(`/api/content/${auditId}/generate-reel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carousels: [{ ...carousel, approved: true }],
          profile: {
            username: profile?.username,
            full_name: profile?.full_name,
            profile_pic_url_hd: profile?.profile_pic_cloudinary_url || profile?.profile_pic_url_hd,
          },
          templateId: selectedTemplate,
          format: selectedFormat,
          hookEnabled: true,
          voiceover: voiceoverEnabled,
          voice: selectedVoice,
          ttsProvider: selectedProvider,
          captions: captionsEnabled,
          captionStyle: selectedCaptionStyle,
          backgroundMusic,
          musicMood: 'inspiring',
          soundEffects: true,
          language: selectedLanguage,
          brollVideo: selectedTemplate === 'editorial-magazine',
          textEffect: selectedTemplate === 'editorial-magazine' ? 'cinematic' : 'none',
          motionEffects: { kenBurns: true, progressBar: true },
        }),
      })

      clearInterval(progressInterval)

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Erro ao gerar reel')
      }

      const data = await res.json()
      setPipelineStep(PIPELINE_STEPS.length - 1)

      setAuditsContent(prev =>
        prev.map(ac => {
          if (ac.auditId !== auditId) return ac
          return {
            ...ac,
            reelVideos: [...ac.reelVideos, ...(data.videos || [])],
          }
        })
      )

      setTimeout(() => {
        setGenerating(null)
        setPipelineStep(0)
      }, 2000)
    } catch (err: any) {
      clearInterval(progressInterval)
      setError(err.message || 'Erro desconhecido')
      setGenerating(null)
      setPipelineStep(0)
    }
  }

  const findExistingVideo = (reelVideos: ReelVideo[], carouselTitle: string) => {
    return reelVideos.find(v => v.title === carouselTitle)
  }

  if (profileLoading || loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  const totalApproved = auditsContent.reduce((sum, ac) => sum + ac.carousels.length, 0)
  const totalVideos = auditsContent.reduce((sum, ac) => sum + ac.reelVideos.length, 0)
  const currentVoices = VOICES[selectedProvider]

  return (
    <div>
      <PageHeader
        title="Reel Production"
        description={`@${profile?.username} • ${totalApproved} carrossel${totalApproved !== 1 ? 'is' : ''} aprovado${totalApproved !== 1 ? 's' : ''}`}
        action={
          <Link href={`/dashboard/profiles/${id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao perfil
            </Button>
          </Link>
        }
      />

      {/* Stats resumo */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-100">{totalApproved}</p>
              <p className="text-xs text-neutral-400">Aprovados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-info-500/20 flex items-center justify-center">
              <Video className="w-5 h-5 text-info-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-100">{totalVideos}</p>
              <p className="text-xs text-neutral-400">Videos gerados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-success-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-100">4</p>
              <p className="text-xs text-neutral-400">Agentes no squad</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Painel de configurações */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center justify-between w-full text-left"
          >
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-neutral-400" />
              Configuracoes de Producao
            </CardTitle>
            {showConfig
              ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
              : <ChevronDown className="w-4 h-4 text-muted-foreground" />
            }
          </button>
        </CardHeader>

        {showConfig && (
          <CardContent className="space-y-6">
            {/* Estilo Visual */}
            <div>
              <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3 block">
                Estilo Visual
              </label>
              <div className="grid grid-cols-2 gap-3">
                {VISUAL_STYLES.map(style => {
                  const isSelected = selectedTemplate === style.id
                  return (
                    <button
                      key={style.id}
                      onClick={() => setSelectedTemplate(style.id)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'border-info-500 bg-info-500/10'
                          : 'border-neutral-700 bg-neutral-800/50 hover:border-neutral-600'
                      }`}
                    >
                      <span className={`text-sm font-medium block ${isSelected ? 'text-info-300' : 'text-neutral-300'}`}>
                        {style.label}
                      </span>
                      <span className="text-xs text-muted-foreground mt-0.5 block">{style.desc}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Formato */}
            <div>
              <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3 block">
                Formato do Video
              </label>
              <div className="grid grid-cols-3 gap-3">
                {FORMATS.map(fmt => {
                  const Icon = fmt.icon
                  const isSelected = selectedFormat === fmt.id
                  return (
                    <button
                      key={fmt.id}
                      onClick={() => setSelectedFormat(fmt.id)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'border-info-500 bg-info-500/10'
                          : 'border-neutral-700 bg-neutral-800/50 hover:border-neutral-600'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-info-400' : 'text-muted-foreground'}`} />
                        <span className={`text-sm font-medium ${isSelected ? 'text-info-300' : 'text-neutral-300'}`}>
                          {fmt.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`border rounded ${isSelected ? 'border-info-500/50' : 'border-neutral-600'}`}
                          style={{
                            width: fmt.ratio === '9/16' ? 16 : fmt.ratio === '4/5' ? 20 : 22,
                            height: fmt.ratio === '9/16' ? 28 : fmt.ratio === '4/5' ? 25 : 22,
                          }}
                        />
                        <span className="text-xs text-muted-foreground">{fmt.desc}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Narração */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Narracao (Voiceover)
                </label>
                <button
                  onClick={() => setVoiceoverEnabled(!voiceoverEnabled)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    voiceoverEnabled
                      ? 'bg-success-500/20 text-success-400'
                      : 'bg-neutral-700 text-muted-foreground'
                  }`}
                >
                  {voiceoverEnabled ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
                  {voiceoverEnabled ? 'Ativada' : 'Desativada'}
                </button>
              </div>

              {voiceoverEnabled && (
                <div className="space-y-4 pl-1">
                  {/* Idioma */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
                      <Globe className="w-3 h-3" /> Idioma
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {LANGUAGES.map(lang => (
                        <button
                          key={lang.id}
                          onClick={() => setSelectedLanguage(lang.id)}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                            selectedLanguage === lang.id
                              ? 'bg-info-500/20 text-info-300 border border-info-500/40'
                              : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:border-neutral-600'
                          }`}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Provider */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Provider</label>
                    <div className="flex gap-2">
                      {(['elevenlabs', 'openai'] as const).map(provider => (
                        <button
                          key={provider}
                          onClick={() => setSelectedProvider(provider)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            selectedProvider === provider
                              ? 'bg-info-500/20 text-info-300 border border-info-500/40'
                              : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:border-neutral-600'
                          }`}
                        >
                          {provider === 'elevenlabs' ? 'ElevenLabs' : 'OpenAI'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Voz */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
                      <Mic className="w-3 h-3" /> Voz
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {currentVoices.map(voice => (
                        <button
                          key={voice.id}
                          onClick={() => setSelectedVoice(voice.id)}
                          className={`p-2.5 rounded-lg text-left transition-all ${
                            selectedVoice === voice.id
                              ? 'bg-info-500/15 border border-info-500/40'
                              : 'bg-neutral-800/50 border border-neutral-700 hover:border-neutral-600'
                          }`}
                        >
                          <span className={`text-sm font-medium block ${
                            selectedVoice === voice.id ? 'text-info-300' : 'text-neutral-300'
                          }`}>
                            {voice.label}
                          </span>
                          <span className="text-xs text-muted-foreground">{voice.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Legendas */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5" /> Legendas
                </label>
                <button
                  onClick={() => { if (voiceoverEnabled) setCaptionsEnabled(!captionsEnabled) }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    !voiceoverEnabled
                      ? 'bg-neutral-800 text-muted-foreground cursor-not-allowed'
                      : captionsEnabled
                      ? 'bg-success-500/20 text-success-400'
                      : 'bg-neutral-700 text-muted-foreground'
                  }`}
                >
                  {captionsEnabled && voiceoverEnabled ? 'Ativadas' : 'Desativadas'}
                </button>
              </div>
              {!voiceoverEnabled && (
                <p className="text-xs text-muted-foreground italic">Legendas requerem narracao ativa</p>
              )}
              {captionsEnabled && voiceoverEnabled && (
                <div className="flex gap-2">
                  {CAPTION_STYLES.map(style => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedCaptionStyle(style.id)}
                      className={`flex-1 p-2.5 rounded-lg text-left transition-all ${
                        selectedCaptionStyle === style.id
                          ? 'bg-info-500/15 border border-info-500/40'
                          : 'bg-neutral-800/50 border border-neutral-700 hover:border-neutral-600'
                      }`}
                    >
                      <span className={`text-xs font-medium block ${
                        selectedCaptionStyle === style.id ? 'text-info-300' : 'text-neutral-300'
                      }`}>
                        {style.label}
                      </span>
                      <span className="text-xs text-muted-foreground">{style.desc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Background Music toggle */}
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Musica de fundo
              </label>
              <button
                onClick={() => setBackgroundMusic(!backgroundMusic)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  backgroundMusic
                    ? 'bg-success-500/20 text-success-400'
                    : 'bg-neutral-700 text-muted-foreground'
                }`}
              >
                {backgroundMusic ? 'Ativada' : 'Desativada'}
              </button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Erro global */}
      {error && (
        <div className="mb-4 p-4 rounded-lg bg-error-500/10 border border-error-500/30 text-error-400 text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-3 underline text-xs">Fechar</button>
        </div>
      )}

      {/* Sem carrosséis aprovados */}
      {auditsContent.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-300 mb-2">Nenhum carrossel aprovado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Aprove carrosseis na pagina de criacao de conteudo para gerar reels.
            </p>
            <Link href={`/dashboard/profiles/${id}`}>
              <Button variant="secondary" size="sm">Voltar ao perfil</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Lista de carrosséis aprovados por auditoria */}
      {auditsContent.map(auditContent => (
        <Card key={auditContent.auditId} className="mb-4">
          <CardHeader className="pb-2">
            <button
              onClick={() => setExpandedAudit(
                expandedAudit === auditContent.auditId ? null : auditContent.auditId
              )}
              className="flex items-center justify-between w-full text-left"
            >
              <CardTitle className="text-sm flex items-center gap-2">
                <span className="text-neutral-400">Auditoria</span>
                <Badge variant="info" className="text-xs">
                  {auditContent.carousels.length} carrossel{auditContent.carousels.length !== 1 ? 'is' : ''}
                </Badge>
              </CardTitle>
              {expandedAudit === auditContent.auditId
                ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                : <ChevronDown className="w-4 h-4 text-muted-foreground" />
              }
            </button>
          </CardHeader>

          {expandedAudit === auditContent.auditId && (
            <CardContent className="space-y-4">
              {auditContent.carousels.map((carousel, idx) => {
                const existingVideo = findExistingVideo(auditContent.reelVideos, carousel.titulo)
                const genKey = `${auditContent.auditId}-${idx}`
                const isGenerating = generating === genKey

                return (
                  <div
                    key={idx}
                    className="rounded-lg border border-neutral-700 p-4 space-y-3"
                  >
                    {/* Header do carrossel */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-neutral-100 truncate">
                            {carousel.titulo}
                          </h4>
                          <Badge
                            variant={carousel.tipo === 'educacional' ? 'info' : carousel.tipo === 'vendas' ? 'warning' : 'success'}
                            className="text-xs shrink-0"
                          >
                            {carousel.tipo}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {carousel.slides.length} slides • {carousel.baseado_em}
                        </p>
                        {carousel.objetivo && (
                          <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                            {carousel.objetivo}
                          </p>
                        )}
                      </div>

                      {/* Ação: gerar ou ver vídeo */}
                      <div className="shrink-0 ml-4">
                        {existingVideo ? (
                          <div className="flex items-center gap-2">
                            <Badge variant="success" className="text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Gerado
                            </Badge>
                            <a
                              href={existingVideo.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button variant="secondary" size="sm">
                                <Download className="w-3.5 h-3.5 mr-1" />
                                Baixar
                              </Button>
                            </a>
                          </div>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleGenerateReel(auditContent.auditId, idx, carousel)}
                            disabled={!!generating}
                          >
                            {isGenerating ? (
                              <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                            ) : (
                              <Video className="w-3.5 h-3.5 mr-1" />
                            )}
                            {isGenerating ? 'Gerando...' : 'Gerar Reel'}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Config resumo (quando não está gerando) */}
                    {!existingVideo && !isGenerating && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground">
                          {VISUAL_STYLES.find(s => s.id === selectedTemplate)?.label}
                        </span>
                        <span className="text-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {FORMATS.find(f => f.id === selectedFormat)?.label}
                        </span>
                        <span className="text-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {voiceoverEnabled
                            ? `${selectedProvider === 'elevenlabs' ? 'ElevenLabs' : 'OpenAI'} / ${currentVoices.find(v => v.id === selectedVoice)?.label || selectedVoice}`
                            : 'Sem narracao'
                          }
                        </span>
                        <span className="text-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {LANGUAGES.find(l => l.id === selectedLanguage)?.label}
                        </span>
                      </div>
                    )}

                    {/* Pipeline visual (durante geração) */}
                    {isGenerating && (
                      <div className="rounded-lg bg-neutral-800/60 border border-neutral-700/50 p-4">
                        <div className="flex items-center gap-1 mb-3">
                          {PIPELINE_STEPS.map((step, stepIdx) => (
                            <div key={step.id} className="flex items-center flex-1">
                              <div
                                className={`w-full h-1.5 rounded-full transition-all duration-500 ${
                                  stepIdx <= pipelineStep
                                    ? 'bg-info-500'
                                    : 'bg-neutral-700'
                                }`}
                              />
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center gap-3">
                          {(() => {
                            const currentStep = PIPELINE_STEPS[pipelineStep]
                            const StepIcon = currentStep.icon
                            return (
                              <>
                                <div className="w-8 h-8 rounded-lg bg-info-500/20 flex items-center justify-center shrink-0">
                                  <StepIcon className="w-4 h-4 text-info-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-neutral-200">
                                    {currentStep.label}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {currentStep.description}
                                  </p>
                                </div>
                                <Loader2 className="w-4 h-4 text-info-400 animate-spin shrink-0" />
                              </>
                            )
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Player do vídeo existente */}
                    {existingVideo && (
                      <div className="rounded-lg overflow-hidden bg-black">
                        <video
                          src={existingVideo.videoUrl}
                          controls
                          className="w-full max-h-[400px]"
                          poster=""
                        >
                          Seu navegador nao suporta video.
                        </video>
                        <div className="px-3 py-2 bg-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
                          <span>{existingVideo.duration?.toFixed(1)}s • {existingVideo.totalSlides} slides</span>
                          <a
                            href={existingVideo.videoUrl}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-info-400 hover:underline"
                          >
                            Download MP4
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )
}
