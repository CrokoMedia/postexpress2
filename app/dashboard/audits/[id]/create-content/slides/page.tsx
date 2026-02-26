'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAudit } from '@/hooks/use-audit'
import { PageHeader } from '@/components/molecules/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { Skeleton } from '@/components/atoms/skeleton'
import { Badge } from '@/components/atoms/badge'
import { PublishInstagramButton } from '@/components/molecules/publish-instagram-button'
import { CarouselPreviewGallery } from '@/components/molecules/carousel-preview-gallery'
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
  Download,
  Palette,
  Monitor,
  Smartphone,
  Square,
  Upload,
  Trash2,
  AlertCircle,
  Cloud,
  Sun,
  Moon,
} from 'lucide-react'
import { TEMPLATE_LIST } from '@/remotion/templates'
import type { TemplateId } from '@/remotion/templates'
import type { LayoutFormat } from '@/remotion/types'

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

  // Template selecionado
  const [selectedTemplateId, setSelectedTemplateId] = useState<TemplateId>('minimalist')

  // Formato selecionado (feed 4:5, story 9:16, square 1:1)
  const [selectedFormat, setSelectedFormat] = useState<LayoutFormat>('feed')

  // Tema selecionado (claro/escuro)
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>('light')

  // Carrosséis selecionados para gerar slides (Set de índices originais)
  const [selectedCarousels, setSelectedCarousels] = useState<Set<number>>(new Set())

  // Carrossel selecionado para preview (índice dentro de approvedCarousels)
  const [previewCarouselIndex, setPreviewCarouselIndex] = useState(0)

  // Download e Drive
  const [downloadingZip, setDownloadingZip] = useState(false)
  const [sendingToDrive, setSendingToDrive] = useState(false)
  const [driveMessage, setDriveMessage] = useState<string | null>(null)
  const [driveError, setDriveError] = useState<string | null>(null)

  // Download ZIP individual e exclusão de carrosséis
  const [downloadingCarouselZip, setDownloadingCarouselZip] = useState<number | null>(null)
  const [deletingCarousel, setDeletingCarousel] = useState<number | null>(null)

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
            console.log('Conteudo carregado')
          }
          if (data.slides) {
            setSlides(data.slides)
            console.log('Slides existentes carregados')
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

  // Carrosséis aprovados
  const approvedCarousels = useMemo(() => {
    return content?.carousels?.filter((c: any) => c.approved === true) || []
  }, [content])

  // Separar carrosséis aprovados e marcar quais já têm slides gerados
  // Retorna array de { carousel, originalIndex, hasSlides } para manter referência ao índice correto
  const carouselsToConfig = useMemo(() => {
    if (!content?.carousels) return []

    // Pegar títulos dos carrosséis que já têm slides gerados (para marcar visualmente)
    const generatedTitles = new Set(slides?.carousels?.map((c: any) => c.title) || [])

    // ✅ SEMPRE retornar TODOS os aprovados (permite gerar em múltiplos templates)
    return content.carousels
      .map((c: any, index: number) => ({
        carousel: c,
        originalIndex: index,
        hasSlides: generatedTitles.has(c.titulo), // Marca se já tem slides
      }))
      .filter((item: any) => item.carousel.approved === true)
  }, [content, slides])

  // Selecionar automaticamente todos os carrosséis disponíveis quando a lista mudar
  useEffect(() => {
    if (carouselsToConfig.length > 0) {
      const allIndices = new Set<number>(carouselsToConfig.map((item: { originalIndex: number }) => item.originalIndex))
      setSelectedCarousels(allIndices)
    }
  }, [carouselsToConfig])

  // Handlers de configuração de imagem
  const getSlideImageConfig = (carouselIndex: number, slideIndex: number) => {
    return slideImageOptions.get(carouselIndex)?.get(slideIndex) || null
  }

  const setSlideImageConfig = (
    carouselIndex: number,
    slideIndex: number,
    config: { mode: 'auto' | 'custom_prompt' | 'upload' | 'no_image'; customPrompt?: string; uploadUrl?: string }
  ) => {
    setSlideImageOptions((prev) => {
      const newMap = new Map(prev)
      if (!newMap.has(carouselIndex)) {
        newMap.set(carouselIndex, new Map())
      }
      newMap.get(carouselIndex)!.set(slideIndex, config)
      return newMap
    })
  }

  // Validação: verifica se todos os slides selecionados têm configuração de imagem
  const validateSlideConfigurations = (): { valid: boolean; unconfiguredCount: number; unconfiguredSlides: Array<{ carouselTitle: string; slideIndex: number }> } => {
    const unconfigured: Array<{ carouselTitle: string; slideIndex: number }> = []

    carouselsToConfig
      .filter((item: any) => selectedCarousels.has(item.originalIndex))
      .forEach((item: any) => {
        const carousel = item.carousel
        const carouselIndex = item.originalIndex

        carousel.slides.forEach((slide: any, slideIndex: number) => {
          const config = getSlideImageConfig(carouselIndex, slideIndex)
          if (!config) {
            unconfigured.push({
              carouselTitle: carousel.titulo,
              slideIndex: slideIndex + 1,
            })
          }
        })
      })

    return {
      valid: unconfigured.length === 0,
      unconfiguredCount: unconfigured.length,
      unconfiguredSlides: unconfigured,
    }
  }

  // Upload de imagem
  const handleImageUpload = async (
    carouselIndex: number,
    slideIndex: number,
    file: File
  ) => {
    setUploadingImage({ carouselIndex, slideIndex })
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`/api/content/${id}/upload-slide-image`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Falha no upload')

      const data = await response.json()
      setSlideImageConfig(carouselIndex, slideIndex, {
        mode: 'upload',
        uploadUrl: data.url,
      })
    } catch (err) {
      console.error('Erro no upload:', err)
      alert('Falha ao fazer upload da imagem. Tente novamente.')
    } finally {
      setUploadingImage(null)
    }
  }

  // Toggle seleção de carrossel individual
  const handleToggleCarousel = (originalIndex: number) => {
    setSelectedCarousels(prev => {
      const next = new Set(prev)
      if (next.has(originalIndex)) {
        next.delete(originalIndex)
      } else {
        next.add(originalIndex)
      }
      return next
    })
  }

  // Selecionar/Desselecionar todos os carrosséis
  const handleToggleAllCarousels = () => {
    if (selectedCarousels.size === carouselsToConfig.length) {
      // Se todos estão selecionados, desseleciona todos
      setSelectedCarousels(new Set())
    } else {
      // Senão, seleciona todos
      const allIndices = new Set<number>(carouselsToConfig.map((item: { originalIndex: number }) => item.originalIndex))
      setSelectedCarousels(allIndices)
    }
  }

  // Gerar slides (PNG estáticos via Remotion v3)
  const handleGenerateSlides = async () => {
    if (!carouselsToConfig.length) {
      alert('Nenhum carrossel aprovado encontrado. Aprove carrosséis antes de gerar slides.')
      return
    }

    if (selectedCarousels.size === 0) {
      alert('Selecione pelo menos um carrossel para gerar slides.')
      return
    }

    // ✅ VALIDAÇÃO OBRIGATÓRIA: Verificar se todos os slides têm configuração
    const validation = validateSlideConfigurations()
    if (!validation.valid) {
      const slidesText = validation.unconfiguredSlides
        .slice(0, 5)
        .map(s => `• ${s.carouselTitle} - Slide ${s.slideIndex}`)
        .join('\n')

      const moreText = validation.unconfiguredCount > 5
        ? `\n... e mais ${validation.unconfiguredCount - 5} slides`
        : ''

      alert(
        `⚠️ Configuração Incompleta\n\n` +
        `Você precisa escolher uma opção de imagem para TODOS os slides antes de gerar.\n\n` +
        `Slides pendentes (${validation.unconfiguredCount}):\n${slidesText}${moreText}\n\n` +
        `Role para baixo e escolha entre:\n` +
        `• Sem Imagem\n` +
        `• Automático (IA gera)\n` +
        `• Prompt Custom (você descreve)\n` +
        `• Upload (sua imagem)`
      )
      return
    }

    setGeneratingSlides(true)
    setSlidesError(null)

    try {
      // Filtrar apenas os carrosséis selecionados
      const selectedItems = carouselsToConfig.filter((item: { originalIndex: number }) => selectedCarousels.has(item.originalIndex))

      // Converter Map<number, Map<number, config>> para objeto simples
      const slideImageOptionsObj: Record<number, Record<number, any>> = {}
      slideImageOptions.forEach((carouselMap, carouselIndex) => {
        slideImageOptionsObj[carouselIndex] = {}
        carouselMap.forEach((config, slideIndex) => {
          slideImageOptionsObj[carouselIndex][slideIndex] = config
        })
      })

      const response = await fetch(`/api/content/${id}/generate-slides-v3`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplateId,
          format: selectedFormat,
          theme: selectedTheme,
          carousels: selectedItems.map((item: any) => ({
            ...item.carousel,
            _originalIndex: item.originalIndex, // Preservar índice original para lookup de slideImageOptions
          })),
          profile: audit?.profile,
          slideImageOptions: slideImageOptionsObj,
        }),
      })

      // Verificar se a resposta é JSON válido
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text()
        console.error('Resposta não-JSON da API:', textResponse.substring(0, 500))
        throw new Error('API retornou resposta inválida (não-JSON). Verifique os logs do servidor.')
      }

      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch {
          throw new Error(`API retornou erro ${response.status}: ${response.statusText}`)
        }
        throw new Error(errorData.error || 'Falha ao gerar slides')
      }

      const data = await response.json()
      // API v3 retorna { carousels, summary }, convertemos para { carousels }
      setSlides({ carousels: data.carousels })
      console.log('Slides gerados:', data)
    } catch (err: any) {
      console.error('Erro ao gerar slides:', err)
      setSlidesError(err.message || 'Erro desconhecido')
    } finally {
      setGeneratingSlides(false)
    }
  }

  // Download ZIP
  const handleDownloadZip = async () => {
    if (!slides?.carousels?.length) {
      alert('Nenhum slide gerado ainda')
      return
    }

    setDownloadingZip(true)
    try {
      const response = await fetch(`/api/content/${id}/export-zip`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Falha ao gerar ZIP')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `carroseis-${audit?.profile?.username || 'slides'}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: any) {
      console.error('Erro ao baixar ZIP:', err)
      alert(err.message || 'Falha ao baixar ZIP')
    } finally {
      setDownloadingZip(false)
    }
  }

  // Export Google Drive
  const handleExportDrive = async () => {
    if (!slides?.carousels?.length) {
      alert('Nenhum slide gerado ainda')
      return
    }

    setSendingToDrive(true)
    setDriveError(null)
    setDriveMessage(null)

    try {
      const response = await fetch(`/api/content/${id}/export-drive`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Falha ao enviar para o Drive')
      }

      const data = await response.json()
      setDriveMessage(data.message || 'Slides enviados com sucesso!')
      console.log('Drive export result:', data)
    } catch (err: any) {
      console.error('Erro ao enviar para Drive:', err)
      setDriveError(err.message || 'Falha ao enviar para o Google Drive')
    } finally {
      setSendingToDrive(false)
    }
  }

  // Download ZIP de um carrossel específico
  const handleDownloadCarouselZip = async (carouselIndex: number, carouselTitle: string) => {
    setDownloadingCarouselZip(carouselIndex)
    try {
      const response = await fetch(`/api/content/${id}/carousels/${carouselIndex}/export-zip`, {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao gerar ZIP')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${slugify(carouselTitle)}.zip`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err: any) {
      console.error('Erro ao baixar ZIP do carrossel:', err)
      alert(`Erro: ${err.message}`)
    } finally {
      setDownloadingCarouselZip(null)
    }
  }

  // Deletar carrossel
  const handleDeleteCarousel = async (carouselIndex: number, carouselTitle: string) => {
    if (!confirm(`Tem certeza que deseja excluir o carrossel "${carouselTitle}"?\n\nEsta ação não pode ser desfeita.`)) {
      return
    }

    setDeletingCarousel(carouselIndex)
    try {
      const response = await fetch(`/api/content/${id}/carousels/${carouselIndex}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao deletar carrossel')
      }

      const data = await response.json()

      // Atualizar estado local removendo o carrossel
      setSlides((prev: any) => {
        if (!prev) return prev
        const newSlides = { ...prev }
        newSlides.carousels.splice(carouselIndex, 1)
        return newSlides
      })

      console.log(`✅ ${data.message}`)
      alert(`Carrossel deletado com sucesso!\n\nCarrosséis restantes: ${data.remainingCarousels}`)

      // Se não sobrou nenhum carrossel, voltar para página de conteúdo
      if (data.remainingCarousels === 0) {
        router.push(`/dashboard/audits/${id}/create-content`)
      }
    } catch (err: any) {
      console.error('Erro ao deletar carrossel:', err)
      alert(`Erro: ${err.message}`)
    } finally {
      setDeletingCarousel(null)
    }
  }

  // Helper para slugify (mesmo usado na API)
  const slugify = (text: string): string => {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .substring(0, 50)
  }

  // Estados de loading
  if (isLoading || loadingContent) {
    return (
      <div className="space-y-6">
        <div>
          <Button variant="ghost" disabled className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Conteúdo
          </Button>
          <PageHeader
            title="Configurar Slides"
            description="Carregando..."
          />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6">
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
            title="Erro"
            description="Não foi possível carregar a auditoria"
          />
        </div>
        <Card className="border-error-500/30 bg-error-500/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-error-600 dark:text-error-400">
              <AlertCircle className="w-5 h-5" />
              <p>Erro ao carregar dados. Tente novamente.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Só bloqueia se não há carrosséis aprovados E não há slides gerados
  if (!approvedCarousels.length && !slides?.carousels?.length) {
    return (
      <div className="space-y-6">
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
        <Card className="border-warning-500/30 bg-warning-500/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-warning-600 dark:text-warning-400">
              <AlertCircle className="w-5 h-5" />
              <p>Nenhum carrossel aprovado encontrado. Volte para a página de conteúdo e aprove pelo menos um carrossel.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={`Configurar Slides - @${audit.profile.username}`}
        description="Configure as imagens de cada slide e gere os visuais"
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: `@${audit.profile.username}`, href: `/dashboard/profiles/${audit.profile.id}` },
          { label: 'Auditoria', href: `/dashboard/audits/${id}` },
          { label: 'Criar Conteúdo', href: `/dashboard/audits/${id}/create-content` },
          { label: 'Configurar Slides', href: null }
        ]}
      />

      {/* Conteúdo principal */}
      <div className="space-y-6">

      {/* Info Card */}
      <Card className="border-info-500/30 bg-info-500/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-info-700 dark:text-info-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm text-neutral-600 dark:text-neutral-300">
              <p className="font-medium text-info-700 dark:text-info-400 mb-1">Opções de Layout:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li><strong>Sem Imagem:</strong> Layout focado só no texto (ideal para frases impactantes)</li>
                <li><strong>Automático:</strong> IA gera imagem baseada no conteúdo do slide (detecta marcas, ferramentas, pessoas)</li>
                <li><strong>Prompt Customizado:</strong> Você escreve exatamente o que quer na imagem</li>
                <li><strong>Upload:</strong> Você envia sua própria imagem (gráficos, fotos, infográficos)</li>
              </ul>
            </div>
            {selectedCarousels.size > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  // Configurar todos os slides selecionados como "auto"
                  carouselsToConfig
                    .filter((item: any) => selectedCarousels.has(item.originalIndex))
                    .forEach((item: any) => {
                      const carouselIndex = item.originalIndex
                      item.carousel.slides.forEach((_: any, slideIndex: number) => {
                        setSlideImageConfig(carouselIndex, slideIndex, { mode: 'auto' })
                      })
                    })
                }}
                className="whitespace-nowrap"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Automático em Todos
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Galeria de Templates */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <CardTitle className="text-base">Template Visual</CardTitle>
            </div>
            {selectedTemplateId && (
              <Badge variant="primary" className="text-xs">
                {TEMPLATE_LIST.find(t => t.id === selectedTemplateId)?.name}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-6 gap-2">
            {TEMPLATE_LIST.map((template) => {
              const isSelected = selectedTemplateId === template.id
              return (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplateId(template.id as TemplateId)}
                  className={`relative rounded-lg overflow-hidden border-2 transition-all group ${
                    isSelected
                      ? 'border-primary-500 ring-2 ring-primary-500/30'
                      : 'border-neutral-700 hover:border-neutral-500'
                  }`}
                  title={template.description}
                >
                  {/* Preview visual mini */}
                  <div
                    className="aspect-[4/5] flex flex-col items-center justify-center p-2"
                    style={{ backgroundColor: template.colors.background }}
                  >
                    <div
                      className="w-4 h-4 rounded-full mb-1"
                      style={{ backgroundColor: template.colors.headerBorder }}
                    />
                    <div
                      className="text-center font-bold mb-1"
                      style={{
                        color: template.colors.title,
                        fontSize: 8,
                      }}
                    >
                      Aa
                    </div>
                    {template.layout.showImage && template.layout.imagePosition === 'bottom' && (
                      <div
                        className="w-full h-4 rounded mt-auto"
                        style={{ background: template.colors.imagePlaceholderGradient }}
                      />
                    )}
                  </div>

                  {/* Nome do template (aparece só no hover) */}
                  <div className="absolute inset-x-0 bottom-0 bg-neutral-900/95 p-1.5 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-medium text-neutral-700 dark:text-neutral-200">{template.name}</span>
                  </div>

                  {/* Check icon quando selecionado */}
                  {isSelected && (
                    <div className="absolute top-1 right-1 bg-primary-500 rounded-full p-0.5">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  )}
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
            Formato de Saída
          </CardTitle>
          <CardDescription>
            Escolha o formato dos slides gerados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {([
              { id: 'feed' as LayoutFormat, label: 'Feed', ratio: '4:5', dims: '1080x1350', icon: Monitor },
              { id: 'story' as LayoutFormat, label: 'Story', ratio: '9:16', dims: '1080x1920', icon: Smartphone },
              { id: 'square' as LayoutFormat, label: 'Square', ratio: '1:1', dims: '1080x1080', icon: Square },
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
                      : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 bg-neutral-100 dark:bg-neutral-800/50'
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isSelected ? 'text-primary-400' : 'text-neutral-500 dark:text-neutral-400'}`} />
                  <span className={`font-semibold text-sm ${isSelected ? 'text-primary-700 dark:text-primary-700 dark:text-primary-300' : 'text-neutral-600 dark:text-neutral-300'}`}>
                    {fmt.label}
                  </span>
                  <span className="text-xs text-neutral-600 dark:text-neutral-500">
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

      {/* Seletor de Tema (Claro/Escuro) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Tema de Fundo
          </CardTitle>
          <CardDescription>
            Escolha se o fundo dos slides será claro ou escuro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {/* Tema Claro */}
            <button
              onClick={() => setSelectedTheme('light')}
              className={`relative flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all ${
                selectedTheme === 'light'
                  ? 'border-primary-500 ring-2 ring-primary-500/30 bg-primary-500/10'
                  : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 bg-neutral-100 dark:bg-neutral-800/50'
              }`}
            >
              <div className="w-16 h-16 rounded-full bg-white border-2 border-neutral-300 flex items-center justify-center">
                <Sun className={`w-8 h-8 ${selectedTheme === 'light' ? 'text-yellow-500' : 'text-neutral-500 dark:text-neutral-400'}`} />
              </div>
              <div className="text-center">
                <span className={`font-semibold text-sm block mb-1 ${selectedTheme === 'light' ? 'text-primary-700 dark:text-primary-700 dark:text-primary-300' : 'text-neutral-600 dark:text-neutral-300'}`}>
                  Claro
                </span>
                <span className="text-xs text-neutral-600 dark:text-neutral-500">
                  Fundo branco
                </span>
              </div>
              {selectedTheme === 'light' && (
                <CheckCircle className="absolute top-3 right-3 w-5 h-5 text-primary-500" />
              )}
            </button>

            {/* Tema Escuro */}
            <button
              onClick={() => setSelectedTheme('dark')}
              className={`relative flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all ${
                selectedTheme === 'dark'
                  ? 'border-primary-500 ring-2 ring-primary-500/30 bg-primary-500/10'
                  : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 bg-neutral-100 dark:bg-neutral-800/50'
              }`}
            >
              <div className="w-16 h-16 rounded-full bg-neutral-200 dark:bg-neutral-900 border-2 border-neutral-300 dark:border-neutral-700 flex items-center justify-center">
                <Moon className={`w-8 h-8 ${selectedTheme === 'dark' ? 'text-blue-400' : 'text-neutral-700 dark:text-neutral-600'}`} />
              </div>
              <div className="text-center">
                <span className={`font-semibold text-sm block mb-1 ${selectedTheme === 'dark' ? 'text-primary-700 dark:text-primary-700 dark:text-primary-300' : 'text-neutral-600 dark:text-neutral-300'}`}>
                  Escuro
                </span>
                <span className="text-xs text-neutral-600 dark:text-neutral-500">
                  Fundo preto
                </span>
              </div>
              {selectedTheme === 'dark' && (
                <CheckCircle className="absolute top-3 right-3 w-5 h-5 text-primary-500" />
              )}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Seleção de Carrosséis */}
      {carouselsToConfig.length > 0 && (
        <Card className="border-primary-500/30 bg-primary-500/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <GalleryHorizontal className="w-5 h-5" />
                  Selecionar Carrosséis
                </CardTitle>
                <CardDescription>
                  Escolha quais carrosséis você quer gerar slides ({selectedCarousels.size} de {carouselsToConfig.length} selecionados)
                </CardDescription>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleToggleAllCarousels}
              >
                {selectedCarousels.size === carouselsToConfig.length ? 'Desselecionar Todos' : 'Selecionar Todos'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {carouselsToConfig.map((item: any) => {
                const carousel = item.carousel
                const carouselIndex = item.originalIndex
                const hasSlides = item.hasSlides  // ✅ Novo campo
                const isSelected = selectedCarousels.has(carouselIndex)

                return (
                  <button
                    key={carouselIndex}
                    onClick={() => handleToggleCarousel(carouselIndex)}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800/30 hover:border-neutral-400 dark:hover:border-neutral-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-5 h-5 rounded border-neutral-400 text-primary-600 focus:ring-primary-500 cursor-pointer pointer-events-none"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-neutral-700 dark:text-neutral-200 mb-1">{carousel.titulo}</h4>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={
                          carousel.tipo === 'educacional' ? 'info' :
                          carousel.tipo === 'vendas' ? 'success' :
                          carousel.tipo === 'autoridade' ? 'warning' :
                          'neutral'
                        } className="text-xs">
                          {carousel.tipo}
                        </Badge>
                        <span className="text-xs text-neutral-600 dark:text-neutral-500">
                          {carousel.slides.length} slides
                        </span>
                        {/* ✅ Badge indicando que já tem slides gerados */}
                        {hasSlides && (
                          <Badge variant="warning" className="text-xs">
                            <ImageIcon className="w-3 h-3 mr-1" />
                            Já tem slides
                          </Badge>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle className="w-5 h-5 text-primary-600 dark:text-primary-600 dark:text-primary-400 flex-shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuração de Imagens por Slide */}
      {selectedCarousels.size === 0 && carouselsToConfig.length > 0 ? (
        <Card className="border-warning-500/30 bg-warning-500/5">
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center gap-3">
              <Info className="w-12 h-12 text-warning-600 dark:text-warning-400" />
              <div>
                <h3 className="font-semibold text-lg text-neutral-700 dark:text-neutral-200 mb-1">
                  Nenhum carrossel selecionado
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Selecione pelo menos um carrossel acima para configurar as imagens dos slides.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {carouselsToConfig
        .filter((item: any) => selectedCarousels.has(item.originalIndex))
        .map((item: any) => {
        const carousel = item.carousel
        const carouselIndex = item.originalIndex
        return (
        <Card key={carouselIndex}>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <GalleryHorizontal className="w-5 h-5" />
              {carousel.titulo}
            </CardTitle>
            <CardDescription>
              Configure a imagem de cada slide abaixo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {carousel.slides.map((slide: any, slideIndex: number) => {
                const config = getSlideImageConfig(carouselIndex, slideIndex)
                const isUploading = uploadingImage?.carouselIndex === carouselIndex && uploadingImage?.slideIndex === slideIndex
                const isPending = !config

                return (
                  <div
                    key={slideIndex}
                    className={`border rounded-xl p-4 space-y-3 ${
                      isPending
                        ? 'border-warning-500 bg-warning-500/10 ring-2 ring-warning-500/30'
                        : 'border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800/30'
                    }`}
                  >
                    {/* Header do slide */}
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-sm">
                        {slideIndex + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-neutral-700 dark:text-neutral-200">{slide.titulo}</h4>
                          {isPending && (
                            <Badge variant="warning" className="text-xs">
                              Pendente
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">{slide.corpo}</p>
                      </div>
                    </div>

                    {/* Opções de imagem */}
                    <div className="grid grid-cols-2 gap-2">
                      {/* Sem Imagem */}
                      <button
                        onClick={() => setSlideImageConfig(carouselIndex, slideIndex, { mode: 'no_image' })}
                        className={`flex flex-col items-start gap-1 rounded-lg border p-3 transition-all text-left ${
                          config?.mode === 'no_image'
                            ? 'border-primary-500 bg-primary-500/10'
                            : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500 bg-neutral-100 dark:bg-neutral-800'
                        }`}
                      >
                        <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">Sem Imagem</span>
                        <span className="text-[10px] text-neutral-600 dark:text-neutral-500">Só texto</span>
                      </button>

                      {/* Automático */}
                      <button
                        onClick={() => setSlideImageConfig(carouselIndex, slideIndex, { mode: 'auto' })}
                        className={`flex flex-col items-start gap-1 rounded-lg border p-3 transition-all text-left ${
                          config?.mode === 'auto'
                            ? 'border-primary-500 bg-primary-500/10'
                            : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500 bg-neutral-100 dark:bg-neutral-800'
                        }`}
                      >
                        <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">Automático</span>
                        <span className="text-[10px] text-neutral-600 dark:text-neutral-500">IA gera</span>
                      </button>

                      {/* Prompt Customizado */}
                      <button
                        onClick={() => setSlideImageConfig(carouselIndex, slideIndex, { mode: 'custom_prompt', customPrompt: config?.customPrompt || '' })}
                        className={`flex flex-col items-start gap-1 rounded-lg border p-3 transition-all text-left ${
                          config?.mode === 'custom_prompt'
                            ? 'border-primary-500 bg-primary-500/10'
                            : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500 bg-neutral-100 dark:bg-neutral-800'
                        }`}
                      >
                        <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">Prompt Custom</span>
                        <span className="text-[10px] text-neutral-600 dark:text-neutral-500">Você descreve</span>
                      </button>

                      {/* Upload */}
                      <label
                        className={`flex flex-col items-start gap-1 rounded-lg border p-3 transition-all text-left cursor-pointer ${
                          config?.mode === 'upload'
                            ? 'border-primary-500 bg-primary-500/10'
                            : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500 bg-neutral-100 dark:bg-neutral-800'
                        }`}
                      >
                        <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">Upload</span>
                        <span className="text-[10px] text-neutral-600 dark:text-neutral-500">Sua imagem</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleImageUpload(carouselIndex, slideIndex, file)
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Campo de prompt customizado (se selecionado) */}
                    {config?.mode === 'custom_prompt' && (
                      <textarea
                        value={config?.customPrompt || ''}
                        onChange={(e) =>
                          setSlideImageConfig(carouselIndex, slideIndex, {
                            mode: 'custom_prompt',
                            customPrompt: e.target.value,
                          })
                        }
                        placeholder="Descreva a imagem que você quer (ex: 'um gráfico de crescimento em azul e branco')"
                        rows={2}
                        className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 text-neutral-700 dark:text-neutral-200 text-sm placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      />
                    )}

                    {/* Preview de imagem uploadada */}
                    {config?.mode === 'upload' && config?.uploadUrl && (
                      <div className="relative">
                        <img
                          src={config.uploadUrl}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => setSlideImageConfig(carouselIndex, slideIndex, { mode: 'auto' })}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-error-500/80 hover:bg-error-500 text-white transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Loading de upload */}
                    {isUploading && (
                      <div className="flex items-center gap-2 text-sm text-info-700 dark:text-info-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Fazendo upload...
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
        )
      })}

      {/* Status de Configuração */}
      {selectedCarousels.size > 0 && (() => {
        const validation = validateSlideConfigurations()
        const totalSlides = carouselsToConfig
          .filter((item: any) => selectedCarousels.has(item.originalIndex))
          .reduce((acc: number, item: any) => acc + item.carousel.slides.length, 0)
        const configuredSlides = totalSlides - validation.unconfiguredCount

        return (
          <Card className={validation.valid ? 'border-success-500/30 bg-success-500/5' : 'border-warning-500/30 bg-warning-500/10'}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {validation.valid ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-success-400" />
                      <div>
                        <h4 className="font-semibold text-success-300 text-sm">
                          Configuração Completa
                        </h4>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          Todos os {totalSlides} slides estão configurados
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-warning-600 dark:text-warning-400" />
                      <div>
                        <h4 className="font-semibold text-warning-700 dark:text-warning-700 dark:text-warning-300 text-sm">
                          Configuração Pendente
                        </h4>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {configuredSlides}/{totalSlides} slides configurados • {validation.unconfiguredCount} pendentes
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${validation.valid ? 'bg-success-500' : 'bg-warning-500'}`}
                      style={{ width: `${(configuredSlides / totalSlides) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    {Math.round((configuredSlides / totalSlides) * 100)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })()}

      {/* Preview dos Slides Selecionados */}
      {selectedCarousels.size > 0 && (
        <CarouselPreviewGallery
          auditId={id}
          carousels={carouselsToConfig.filter((item: any) =>
            selectedCarousels.has(item.originalIndex)
          )}
          templateId={selectedTemplateId}
          format={selectedFormat}
          theme={selectedTheme}
        />
      )}

      {/* Botão de Gerar Slides */}
      <Card className="border-primary-500/30 bg-primary-500/5">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-neutral-700 dark:text-neutral-200 mb-1">Pronto para gerar os slides?</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {selectedCarousels.size > 0 ? (
                  <>Gerando slides para <strong>{selectedCarousels.size}</strong> carrossel{selectedCarousels.size !== 1 ? 'éis' : ''} selecionado{selectedCarousels.size !== 1 ? 's' : ''}.</>
                ) : (
                  'Selecione pelo menos um carrossel acima para gerar slides.'
                )}
              </p>
              {/* ✅ Aviso se algum carrossel selecionado já tem slides */}
              {(() => {
                const selectedWithSlides = carouselsToConfig
                  .filter((item: { originalIndex: number; hasSlides: boolean }) => selectedCarousels.has(item.originalIndex) && item.hasSlides)
                if (selectedWithSlides.length > 0) {
                  return (
                    <p className="text-xs text-warning-600 dark:text-warning-400 mt-2 flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {selectedWithSlides.length} carrossel{selectedWithSlides.length !== 1 ? 'éis' : ''} já {selectedWithSlides.length !== 1 ? 'têm' : 'tem'} slides. Gerar novamente irá sobrescrever.
                    </p>
                  )
                }
                return null
              })()}
            </div>
            <Button
              onClick={handleGenerateSlides}
              disabled={generatingSlides || selectedCarousels.size === 0}
              size="lg"
              className="w-full md:w-auto"
            >
              {generatingSlides ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Gerando Slides...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Gerar Slides {selectedCarousels.size > 0 ? `(${selectedCarousels.size})` : ''}
                </>
              )}
            </Button>
          </div>
          {slidesError && (
            <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-error-500/10 border border-error-500/30">
              <AlertCircle className="w-4 h-4 text-error-600 dark:text-error-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-error-700 dark:text-error-300">{slidesError}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview de Slides Gerados */}
      {slides?.carousels && slides.carousels.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Slides Gerados
            </CardTitle>
            <CardDescription>
              Preview dos slides gerados (PNG estáticos)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {slides.carousels.map((carousel: any, carouselIndex: number) => {
              // Encontrar o carrossel original para verificar aprovação
              const originalCarousel = content?.carousels?.find(
                (c: any) => c.titulo === carousel.title
              )
              const isApproved = originalCarousel?.approved === true

              return (
                <div key={carouselIndex} className="mb-8 last:mb-0">
                  <div className="space-y-3 mb-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-neutral-700 dark:text-neutral-200">{carousel.title}</h4>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDownloadCarouselZip(carouselIndex, carousel.title)}
                          disabled={downloadingCarouselZip === carouselIndex}
                        >
                          {downloadingCarouselZip === carouselIndex ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Gerando...
                            </>
                          ) : (
                            <>
                              <Download className="w-3 h-3 mr-1" />
                              Baixar ZIP
                            </>
                          )}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteCarousel(carouselIndex, carousel.title)}
                          disabled={deletingCarousel === carouselIndex}
                        >
                          {deletingCarousel === carouselIndex ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Botão de Publicar no Instagram */}
                    {isApproved && (
                      <div className="pt-2 border-t border-neutral-700">
                        <PublishInstagramButton
                          auditId={id}
                          carouselIndex={carouselIndex}
                          carouselTitle={carousel.title}
                          hasSlides={carousel.slides && carousel.slides.length > 0}
                        />
                      </div>
                    )}
                  </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {carousel.slides.map((slide: any, slideIndex: number) => (
                    <div key={slideIndex} className="relative group">
                      <img
                        src={slide.cloudinaryUrl}
                        alt={`Slide ${slideIndex + 1}`}
                        className="w-full rounded-lg border border-neutral-700 group-hover:border-primary-500 transition-colors"
                      />
                      <div className="absolute top-2 left-2 bg-neutral-900/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                        {slide.slideNumber}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
            })}
          </CardContent>
        </Card>
      )}

      {/* Ações de Export */}
      {slides?.carousels && slides.carousels.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive className="w-5 h-5" />
              Exportar Slides
            </CardTitle>
            <CardDescription>
              Baixe os slides ou envie para o Google Drive
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleDownloadZip}
                disabled={downloadingZip}
                variant="primary"
                className="flex-1"
              >
                {downloadingZip ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Preparando ZIP...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Baixar ZIP
                  </>
                )}
              </Button>

              <Button
                onClick={handleExportDrive}
                disabled={sendingToDrive}
                variant="secondary"
                className="flex-1"
              >
                {sendingToDrive ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Cloud className="w-4 h-4 mr-2" />
                    Enviar para Drive
                  </>
                )}
              </Button>
            </div>

            {/* Mensagens de sucesso/erro do Drive */}
            {driveMessage && (
              <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-success-500/10 border border-success-500/30">
                <CheckCircle className="w-4 h-4 text-success-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-success-300">{driveMessage}</p>
              </div>
            )}

            {driveError && (
              <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-error-500/10 border border-error-500/30">
                <AlertCircle className="w-4 h-4 text-error-600 dark:text-error-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-error-700 dark:text-error-300">{driveError}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      </div>
    </div>
  )
}
