'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAudit } from '@/hooks/use-audit'
import { PageHeader } from '@/components/molecules/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { Skeleton } from '@/components/atoms/skeleton'
import { Badge } from '@/components/atoms/badge'
import { Sparkles, ArrowLeft, Download, Copy, Check, Image as ImageIcon, Loader2, CheckCircle, XCircle, Archive, FolderOpen, Pencil, RefreshCw, Save, X, Video, Repeat2, GalleryHorizontal, Trash2, Calendar } from 'lucide-react'
import Link from 'next/link'
import { ScheduleContentModal } from '@/components/molecules/schedule-content-modal'
import { ScheduledContentList } from '@/components/molecules/scheduled-content-list'
import { SafeScheduledListWrapper } from '@/components/molecules/safe-scheduled-list-wrapper'

export default function CreateContentPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { audit, isLoading, isError } = useAudit(id)

  const [generating, setGenerating] = useState(false)
  const [content, setContent] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [copiedCaption, setCopiedCaption] = useState<number | null>(null)
  const [copiedHashtags, setCopiedHashtags] = useState<number | null>(null)
  const [generatingSlides, setGeneratingSlides] = useState(false)
  const [slides, setSlides] = useState<any>(null) // V1 - template padrão
  const [slidesError, setSlidesError] = useState<string | null>(null)
  const [loadingExisting, setLoadingExisting] = useState(true)
  const [approvingCarousel, setApprovingCarousel] = useState<number | null>(null)
  const [customTheme, setCustomTheme] = useState('')
  const [usedTheme, setUsedTheme] = useState<string | null>(null)
  const [downloadingZip, setDownloadingZip] = useState(false)
  const [sendingToDrive, setSendingToDrive] = useState(false)
  const [driveMessage, setDriveMessage] = useState<string | null>(null)
  const [driveError, setDriveError] = useState<string | null>(null)

  // Download ZIP individual e exclusão de carrosséis
  const [downloadingCarouselZip, setDownloadingCarouselZip] = useState<number | null>(null)
  const [deletingCarousel, setDeletingCarousel] = useState<number | null>(null)

  const [generatingVariations, setGeneratingVariations] = useState<number | null>(null)

  // Template V2 (fal.ai)
  const [generatingSlidesV2, setGeneratingSlidesV2] = useState(false)
  const [slidesV2, setSlidesV2] = useState<any>(null) // V2 - template com IA
  const [slidesV2Error, setSlidesV2Error] = useState<string | null>(null)

  // Reels animados (Remotion MP4)
  const [generatingReel, setGeneratingReel] = useState(false)
  const [reelVideos, setReelVideos] = useState<any[] | null>(null)
  const [reelError, setReelError] = useState<string | null>(null)

  // Geração individual de slides por carrossel
  const [generatingSingleV1, setGeneratingSingleV1] = useState<number | null>(null)
  const [generatingSingleV2, setGeneratingSingleV2] = useState<number | null>(null)

  // Seleção de carrosséis para gerar slides
  const [selectedForSlides, setSelectedForSlides] = useState<Set<number>>(new Set())
  // Seleção de slides individuais: carouselIndex → Set de índices de slides selecionados
  const [selectedSlides, setSelectedSlides] = useState<Map<number, Set<number>>>(new Map())

  // Configuração de imagens por slide: carouselIndex → slideIndex → config
  const [slideImageOptions, setSlideImageOptions] = useState<Map<number, Map<number, {
    mode: 'auto' | 'custom_prompt' | 'upload'
    customPrompt?: string
    uploadUrl?: string
  }>>>(new Map())

  // Estado de upload por slide
  const [uploadingImage, setUploadingImage] = useState<{ carouselIndex: number; slideIndex: number } | null>(null)

  // Estados do painel de edição
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editInstructions, setEditInstructions] = useState('')
  const [editedCarousel, setEditedCarousel] = useState<any>(null)
  const [refining, setRefining] = useState(false)
  const [saving, setSaving] = useState(false)

  // Modal de agendamento
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [schedulesRefreshKey, setSchedulesRefreshKey] = useState(0)

  // Carregar conteúdo e slides existentes ao abrir a página
  useEffect(() => {
    const loadExistingContent = async () => {
      if (!id) return

      try {
        const response = await fetch(`/api/audits/${id}/content`)
        if (response.ok) {
          const data = await response.json()
          if (data.content) {
            setContent(data.content)
            console.log('✅ Conteúdo existente carregado')
          }
          if (data.slides) {
            setSlides(data.slides)
            console.log('✅ Slides V1 existentes carregados')
          }
          if (data.slides_v2) {
            setSlidesV2(data.slides_v2)
            console.log('✅ Slides V2 existentes carregados')
          }
          if (data.reel_videos?.videos) {
            setReelVideos(data.reel_videos.videos)
            console.log('✅ Reel videos existentes carregados')
          }
        }
      } catch (err) {
        console.error('Erro ao carregar conteúdo existente:', err)
      } finally {
        setLoadingExisting(false)
      }
    }

    loadExistingContent()
  }, [id])

  const handleGenerateContent = async () => {
    setGenerating(true)
    setError(null)

    try {
      const themeToUse = customTheme.trim() || null

      console.log('🚀 Iniciando geração de conteúdo...')
      console.log('🔗 URL:', `/api/audits/${id}/generate-content`)
      console.log('📦 Body:', { custom_theme: themeToUse })

      const response = await fetch(`/api/audits/${id}/generate-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          custom_theme: themeToUse
        })
      })

      console.log('📡 Resposta recebida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })

      // Tentar ler o texto da resposta primeiro
      const responseText = await response.text()
      console.log('📄 Resposta raw (primeiros 500 chars):', responseText.substring(0, 500))

      if (!response.ok) {
        let errorData
        try {
          errorData = JSON.parse(responseText)
        } catch {
          errorData = { error: responseText || 'Erro desconhecido' }
        }
        console.error('❌ Erro na resposta:', errorData)
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`)
      }

      // Parse do JSON
      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('❌ Erro ao fazer parse do JSON:', parseError)
        console.error('📄 Texto recebido:', responseText)
        throw new Error('Resposta da API não é um JSON válido')
      }

      console.log('✅ Dados parseados:', {
        success: data.success,
        hasContent: !!data.content,
        contentKeys: data.content ? Object.keys(data.content) : [],
        carouselsCount: data.content?.carousels?.length
      })

      if (!data.content) {
        throw new Error('Resposta da API não contém conteúdo')
      }

      if (!data.content.carousels || data.content.carousels.length === 0) {
        throw new Error('Nenhum carrossel foi gerado')
      }

      setContent(data.content)
      setUsedTheme(themeToUse)
      console.log('✅ Conteúdo setado no estado React')
    } catch (err: any) {
      console.error('❌ Erro ao gerar conteúdo:', err)
      setError(err.message)
    } finally {
      setGenerating(false)
      console.log('🏁 Processo finalizado')
    }
  }

  const handleCopyCarousel = (carousel: any, index: number) => {
    const text = `
${carousel.titulo}
${carousel.tipo.toUpperCase()} | ${carousel.objetivo}

${carousel.slides.map((slide: any) => `
SLIDE ${slide.numero}:
${slide.titulo}
${slide.corpo}
`).join('\n')}

CAPTION:
${carousel.caption}

HASHTAGS:
${carousel.hashtags.join(' ')}

CTA: ${carousel.cta}
    `.trim()

    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleCopyCaption = (carousel: any, index: number) => {
    navigator.clipboard.writeText(carousel.caption)
    setCopiedCaption(index)
    setTimeout(() => setCopiedCaption(null), 2000)
  }

  const handleCopyHashtags = (carousel: any, index: number) => {
    const hashtagsText = carousel.hashtags.map((tag: string) => `#${tag}`).join(' ')
    navigator.clipboard.writeText(hashtagsText)
    setCopiedHashtags(index)
    setTimeout(() => setCopiedHashtags(null), 2000)
  }

  const handleDownloadJSON = () => {
    const dataStr = JSON.stringify(content, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const exportFileDefaultName = `content-suggestions-${audit?.profile.username}-${new Date().toISOString().split('T')[0]}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  // Atualizar configuração de imagem de um slide
  const handleUpdateSlideImageOption = (
    carouselIndex: number,
    slideIndex: number,
    mode: 'auto' | 'custom_prompt' | 'upload',
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

      console.log(`✅ Imagem enviada: ${data.url}`)
    } catch (err: any) {
      console.error('Erro ao enviar imagem:', err)
      alert(`Erro ao enviar imagem: ${err.message}`)
    } finally {
      setUploadingImage(null)
    }
  }

  const handleApproveCarousel = async (carouselIndex: number, approved: boolean) => {
    setApprovingCarousel(carouselIndex)

    try {
      const response = await fetch(`/api/content/${id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carouselIndex, approved })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao atualizar aprovação')
      }

      // Atualizar estado local
      setContent((prev: any) => {
        if (!prev) return prev
        const newContent = { ...prev }
        newContent.carousels[carouselIndex].approved = approved
        return newContent
      })

      // Sincronizar seleção: aprovado → seleciona, rejeitado → remove
      setSelectedForSlides(prev => {
        const next = new Set(prev)
        approved ? next.add(carouselIndex) : next.delete(carouselIndex)
        return next
      })

      // Inicializar slides selecionados (todos) quando carrossel é aprovado
      setSelectedSlides(prev => {
        const next = new Map(prev)
        if (approved) {
          const carousel = content?.carousels?.[carouselIndex]
          if (carousel) {
            next.set(carouselIndex, new Set(carousel.slides.map((_: any, i: number) => i)))
          }
        } else {
          next.delete(carouselIndex)
        }
        return next
      })

      console.log(`✅ Carrossel ${carouselIndex} ${approved ? 'aprovado' : 'desaprovado'}`)
    } catch (err: any) {
      console.error('Erro ao aprovar carrossel:', err)
      alert(`Erro: ${err.message}`)
    } finally {
      setApprovingCarousel(null)
    }
  }

  // Toggle individual de slide
  const handleToggleSlide = (carouselIndex: number, slideIndex: number) => {
    setSelectedSlides(prev => {
      const next = new Map(prev)
      const carouselSet = next.get(carouselIndex) || new Set()
      const newSet = new Set(carouselSet)

      if (newSet.has(slideIndex)) {
        newSet.delete(slideIndex)
      } else {
        newSet.add(slideIndex)
      }

      next.set(carouselIndex, newSet)
      return next
    })
  }

  // Selecionar/Desselecionar todos os slides de um carrossel
  const handleToggleAllSlides = (carouselIndex: number) => {
    const carousel = content?.carousels?.[carouselIndex]
    if (!carousel) return

    setSelectedSlides(prev => {
      const next = new Map(prev)
      const currentSet = next.get(carouselIndex) || new Set()

      // Se todos estão selecionados, desseleciona todos
      // Senão, seleciona todos
      if (currentSet.size === carousel.slides.length) {
        next.set(carouselIndex, new Set())
      } else {
        next.set(carouselIndex, new Set(carousel.slides.map((_: any, i: number) => i)))
      }

      return next
    })
  }

  // Selecionar/Desselecionar TODOS os slides de TODOS os carrosséis aprovados
  const handleToggleAllSlidesGlobal = () => {
    if (!content?.carousels) return

    // Verificar se TODOS os slides de TODOS os carrosséis aprovados estão selecionados
    const allSelected = content.carousels.every((carousel: any, index: number) => {
      if (!carousel.approved) return true // ignora não aprovados
      const slideSel = selectedSlides.get(index)
      return slideSel && slideSel.size === carousel.slides.length
    })

    setSelectedSlides(prev => {
      const next = new Map(prev)

      content.carousels.forEach((carousel: any, index: number) => {
        if (!carousel.approved) return // só afeta aprovados

        if (allSelected) {
          // Desselecionar todos
          next.set(index, new Set())
        } else {
          // Selecionar todos
          next.set(index, new Set(carousel.slides.map((_: any, i: number) => i)))
        }
      })

      return next
    })
  }

  const handleGenerateSlides = async () => {
    if (!content || !content.carousels) {
      setSlidesError('Gere as sugestões de conteúdo primeiro')
      return
    }

    if (selectedForSlides.size === 0) {
      setSlidesError('Selecione pelo menos um carrossel para gerar slides')
      return
    }

    // Validar se há pelo menos 1 slide selecionado em cada carrossel aprovado
    for (const carouselIndex of selectedForSlides) {
      const slideSel = selectedSlides.get(carouselIndex)
      if (!slideSel || slideSel.size === 0) {
        setSlidesError(`Selecione pelo menos 1 slide no Carrossel ${carouselIndex + 1}`)
        return
      }
    }

    setGeneratingSlides(true)
    setSlidesError(null)

    // Enviar apenas os selecionados, filtrando slides individuais
    const carouselsToGenerate = content.carousels.map((c: any, i: number) => {
      if (!selectedForSlides.has(i)) return { ...c, approved: false }
      const slideSel = selectedSlides.get(i)
      const filteredSlides = slideSel
        ? c.slides.filter((_: any, si: number) => slideSel.has(si))
        : c.slides
      return { ...c, approved: true, slides: filteredSlides }
    })

    try {
      const response = await fetch(`/api/content/${id}/generate-slides`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carousels: carouselsToGenerate,
          profile: audit.profile
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao gerar slides')
      }

      const data = await response.json()
      setSlides(data)
    } catch (err: any) {
      console.error('Erro ao gerar slides:', err)
      setSlidesError(err.message)
    } finally {
      setGeneratingSlides(false)
    }
  }

  const handleGenerateSlidesV2 = async () => {
    if (!content || !content.carousels) {
      setSlidesV2Error('Gere as sugestões de conteúdo primeiro')
      return
    }

    if (selectedForSlides.size === 0) {
      setSlidesV2Error('Selecione pelo menos um carrossel para gerar slides')
      return
    }

    // Validar se há pelo menos 1 slide selecionado em cada carrossel aprovado
    for (const carouselIndex of selectedForSlides) {
      const slideSel = selectedSlides.get(carouselIndex)
      if (!slideSel || slideSel.size === 0) {
        setSlidesV2Error(`Selecione pelo menos 1 slide no Carrossel ${carouselIndex + 1}`)
        return
      }
    }

    setGeneratingSlidesV2(true)
    setSlidesV2Error(null)

    // Enviar apenas os selecionados, filtrando slides individuais
    const carouselsToGenerate = content.carousels.map((c: any, i: number) => {
      if (!selectedForSlides.has(i)) return { ...c, approved: false }
      const slideSel = selectedSlides.get(i)
      const filteredSlides = slideSel
        ? c.slides.filter((_: any, si: number) => slideSel.has(si))
        : c.slides
      return { ...c, approved: true, slides: filteredSlides }
    })

    // Converter slideImageOptions para objeto plano (JSON serializable)
    const imageOptionsPlain: Record<number, Record<number, any>> = {}
    slideImageOptions.forEach((carouselMap, carouselIdx) => {
      imageOptionsPlain[carouselIdx] = {}
      carouselMap.forEach((config, slideIdx) => {
        imageOptionsPlain[carouselIdx][slideIdx] = config
      })
    })

    const requestBody = {
      carousels: carouselsToGenerate,
      profile: audit.profile,
      slideImageOptions: imageOptionsPlain,
    }

    try {
      // Tenta V3 (Remotion renderStill) primeiro
      console.log('🎨 Tentando gerar slides via V3 (Remotion)...')
      const v3Response = await fetch(`/api/content/${id}/generate-slides-v3`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (v3Response.ok) {
        const data = await v3Response.json()
        setSlidesV2(data)
        console.log('✅ Slides gerados via V3 (Remotion)')
        return
      }

      // Fallback para V2 (Puppeteer) se V3 falhar
      console.warn('⚠️ V3 falhou, usando fallback V2 (Puppeteer)...')
      const v2Response = await fetch(`/api/content/${id}/generate-slides-v2`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (!v2Response.ok) {
        const data = await v2Response.json()
        throw new Error(data.error || 'Erro ao gerar slides')
      }

      const data = await v2Response.json()
      setSlidesV2(data)
    } catch (err: any) {
      console.error('Erro ao gerar slides:', err)
      setSlidesV2Error(err.message)
    } finally {
      setGeneratingSlidesV2(false)
    }
  }

  // Gerar Reel animado via Remotion (MP4)
  const handleGenerateReel = async () => {
    if (!content || !content.carousels) {
      setReelError('Gere as sugestões de conteúdo primeiro')
      return
    }

    const approved = content.carousels.filter((c: any) => c.approved === true)
    if (approved.length === 0) {
      setReelError('Aprove pelo menos um carrossel antes de gerar o reel')
      return
    }

    setGeneratingReel(true)
    setReelError(null)

    try {
      const response = await fetch(`/api/content/${id}/generate-reel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carousels: content.carousels,
          profile: audit.profile,
        }),
      })

      if (!response.ok) {
        let errorMsg = `Erro ${response.status}`
        try {
          const data = await response.json()
          errorMsg = data.error || data.details || data.message || errorMsg
        } catch {
          const text = await response.text().catch(() => '')
          errorMsg = text || errorMsg
        }
        throw new Error(errorMsg)
      }

      const data = await response.json()
      setReelVideos(data.videos)
    } catch (err: any) {
      console.error('❌ Erro ao gerar reel:', err)
      setReelError(err.message || String(err))
    } finally {
      setGeneratingReel(false)
    }
  }

  // Gerar slides V1 para um único carrossel
  const handleGenerateSingleSlideV1 = async (carouselIndex: number) => {
    if (!content || !content.carousels) {
      setSlidesError('Gere as sugestões de conteúdo primeiro')
      return
    }

    setGeneratingSingleV1(carouselIndex)
    setSlidesError(null)

    // Marcar apenas este carrossel como aprovado
    const carouselsToGenerate = content.carousels.map((c: any, i: number) => {
      if (i !== carouselIndex) return { ...c, approved: false }
      const slideSel = selectedSlides.get(i)
      const filteredSlides = slideSel
        ? c.slides.filter((_: any, si: number) => slideSel.has(si))
        : c.slides
      return { ...c, approved: true, slides: filteredSlides }
    })

    try {
      const response = await fetch(`/api/content/${id}/generate-slides`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carousels: carouselsToGenerate,
          profile: audit.profile
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao gerar slides')
      }

      const data = await response.json()
      setSlides(data)
    } catch (err: any) {
      console.error('Erro ao gerar slides V1:', err)
      setSlidesError(err.message)
    } finally {
      setGeneratingSingleV1(null)
    }
  }

  // Gerar slides V2/V3 (com IA) para um único carrossel
  const handleGenerateSingleSlideV2 = async (carouselIndex: number) => {
    if (!content || !content.carousels) {
      setSlidesV2Error('Gere as sugestões de conteúdo primeiro')
      return
    }

    setGeneratingSingleV2(carouselIndex)
    setSlidesV2Error(null)

    // Marcar apenas este carrossel como aprovado
    const carouselsToGenerate = content.carousels.map((c: any, i: number) => {
      if (i !== carouselIndex) return { ...c, approved: false }
      const slideSel = selectedSlides.get(i)
      const filteredSlides = slideSel
        ? c.slides.filter((_: any, si: number) => slideSel.has(si))
        : c.slides
      return { ...c, approved: true, slides: filteredSlides }
    })

    // Converter slideImageOptions para objeto plano (JSON serializable)
    const imageOptionsPlain: Record<number, Record<number, any>> = {}
    slideImageOptions.forEach((carouselMap, carouselIdx) => {
      imageOptionsPlain[carouselIdx] = {}
      carouselMap.forEach((config, slideIdx) => {
        imageOptionsPlain[carouselIdx][slideIdx] = config
      })
    })

    const requestBody = {
      carousels: carouselsToGenerate,
      profile: audit.profile,
      slideImageOptions: imageOptionsPlain,
    }

    try {
      // Tenta V3 (Remotion renderStill) primeiro
      console.log(`🎨 Tentando gerar slides do carrossel ${carouselIndex} via V3...`)
      const v3Response = await fetch(`/api/content/${id}/generate-slides-v3`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (v3Response.ok) {
        const data = await v3Response.json()
        setSlidesV2(data)
        console.log('✅ Slides gerados via V3 (Remotion)')
        return
      }

      // Fallback para V2 (Puppeteer) se V3 falhar
      console.warn('⚠️ V3 falhou, usando fallback V2 (Puppeteer)...')
      const v2Response = await fetch(`/api/content/${id}/generate-slides-v2`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (!v2Response.ok) {
        const data = await v2Response.json()
        throw new Error(data.error || 'Erro ao gerar slides')
      }

      const data = await v2Response.json()
      setSlidesV2(data)
    } catch (err: any) {
      console.error('Erro ao gerar slides:', err)
      setSlidesV2Error(err.message)
    } finally {
      setGeneratingSingleV2(null)
    }
  }

  const handleOpenEdit = (index: number, carousel: any) => {
    setEditingIndex(index)
    setEditedCarousel(JSON.parse(JSON.stringify(carousel))) // deep copy
    setEditInstructions('')
  }

  const handleCloseEdit = () => {
    setEditingIndex(null)
    setEditedCarousel(null)
    setEditInstructions('')
  }

  const handleSaveDirectEdits = async () => {
    if (editingIndex === null || !editedCarousel) return
    setSaving(true)
    try {
      const response = await fetch(`/api/content/${id}/refine-carousel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carouselIndex: editingIndex, carousel: editedCarousel })
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao salvar')
      }
      setContent((prev: any) => {
        const next = { ...prev }
        next.carousels[editingIndex] = editedCarousel
        return next
      })
      handleCloseEdit()
    } catch (err: any) {
      alert(`Erro: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleRegenerateCarousel = async () => {
    if (editingIndex === null || !editedCarousel || !editInstructions.trim()) return
    setRefining(true)
    try {
      const response = await fetch(`/api/content/${id}/refine-carousel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carouselIndex: editingIndex,
          carousel: editedCarousel,
          instructions: editInstructions
        })
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao regenerar')
      }
      const data = await response.json()
      setContent((prev: any) => {
        const next = { ...prev }
        next.carousels[editingIndex] = data.carousel
        return next
      })
      handleCloseEdit()
    } catch (err: any) {
      alert(`Erro: ${err.message}`)
    } finally {
      setRefining(false)
    }
  }

  const handleGenerateVariations = async (carouselIndex: number) => {
    setGeneratingVariations(carouselIndex)
    try {
      const response = await fetch(`/api/content/${id}/generate-variations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceType: 'carousel', sourceIndex: carouselIndex })
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao gerar variações')
      }
      const data = await response.json()
      // Append das novas variações no estado local
      setContent((prev: any) => {
        if (!prev) return prev
        return {
          ...prev,
          carousels: [...prev.carousels, ...data.new_carousels]
        }
      })
      console.log(`✅ ${data.new_carousels_count} carrosséis + ${data.new_reels_count} reels gerados`)
    } catch (err: any) {
      alert(`Erro ao gerar variações: ${err.message}`)
    } finally {
      setGeneratingVariations(null)
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

  // Deletar carrossel TEXTUAL (conteúdo reprovado)
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

      // Atualizar estado local removendo o carrossel TEXTUAL
      setContent((prev: any) => {
        if (!prev) return prev
        const newContent = { ...prev }
        newContent.carousels.splice(carouselIndex, 1)
        return newContent
      })

      console.log(`✅ ${data.message}`)
      alert(`Carrossel deletado com sucesso!\n\nCarrosséis restantes: ${data.remainingCarousels}`)
    } catch (err: any) {
      console.error('Erro ao deletar carrossel:', err)
      alert(`Erro: ${err.message}`)
    } finally {
      setDeletingCarousel(null)
    }
  }

  // Deletar slides VISUAIS gerados
  const handleDeleteSlideCarousel = async (carouselIndex: number, carouselTitle: string) => {
    if (!confirm(`Tem certeza que deseja excluir os slides visuais do carrossel "${carouselTitle}"?\n\nIsso irá deletar as imagens do Cloudinary. Esta ação não pode ser desfeita.`)) {
      return
    }

    setDeletingCarousel(carouselIndex)
    try {
      const response = await fetch(`/api/content/${id}/slides/${carouselIndex}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao deletar slides')
      }

      const data = await response.json()

      // Atualizar estado local removendo os SLIDES
      setSlides((prev: any) => {
        if (!prev) return prev
        const newSlides = { ...prev }
        newSlides.carousels = newSlides.carousels.filter(
          (c: any) => c.carouselIndex !== carouselIndex
        )
        // Atualizar summary
        newSlides.summary = {
          totalCarousels: newSlides.carousels.length,
          totalSlides: newSlides.carousels.reduce((acc: number, c: any) => acc + c.slides.length, 0)
        }
        return newSlides
      })

      console.log(`✅ Slides deletados: ${data.deletedImages} imagens`)
      alert(`Slides deletados com sucesso!\n\nImagens deletadas do Cloudinary: ${data.cloudinaryDeleted}/${data.deletedImages}`)
    } catch (err: any) {
      console.error('Erro ao deletar slides:', err)
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

  // Contar carrosséis aprovados
  const approvedCarouselsCount = content?.carousels?.filter((c: any) => c.approved === true).length || 0
  const totalCarouselsCount = content?.carousels?.length || 0

  if (isLoading || loadingExisting) {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push(`/dashboard/audits/${id}`)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Auditoria
          </Button>

          <PageHeader
            title={`Criar Conteúdo - @${audit.profile.username}`}
            description="Sugestões de carrosséis baseadas nos insights da auditoria"
          />
        </div>

        <div className="flex items-center gap-2">
          {(slides || slidesV2) && (
            <Button
              variant="secondary"
              onClick={() => router.push(`/dashboard/audits/${id}/slides`)}
              className="flex items-center gap-2"
            >
              <GalleryHorizontal className="w-4 h-4" />
              Ver Slides Gerados
            </Button>
          )}
          {!content && (
            <>
              <Button
                variant="secondary"
                onClick={() => setShowScheduleModal(true)}
                size="lg"
                className="flex items-center gap-2 border-primary-300 text-primary-700 hover:bg-primary-50"
              >
                <Calendar className="w-5 h-5" />
                Agendar Geração
              </Button>
              <Button
                onClick={handleGenerateContent}
                disabled={generating}
                size="lg"
                className="flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                {generating ? 'Gerando...' : 'Gerar Agora'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs: Carrosséis / Reels */}
      <div className="flex gap-1 bg-card border-2 border-neutral-300 dark:border-neutral-600 rounded-xl p-1 w-fit">
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-100 text-primary-600 font-medium text-sm">
          <ImageIcon className="w-4 h-4" />
          Carrosséis
        </div>
        <Link
          href={`/dashboard/audits/${id}/create-content/reels`}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white dark:hover:bg-neutral-800 font-medium text-sm transition-all"
        >
          <Video className="w-4 h-4" />
          Reels
        </Link>
      </div>

      {/* Lista de Agendamentos (com proteção contra erros) */}
      <SafeScheduledListWrapper>
        <ScheduledContentList
          key={schedulesRefreshKey}
          auditId={id}
          onRefresh={() => setSchedulesRefreshKey(prev => prev + 1)}
        />
      </SafeScheduledListWrapper>

      {/* Campo de Tema Personalizado - SEMPRE VISÍVEL */}
      <Card className="border-primary-200 bg-card/50">
        <CardHeader>
          <CardTitle className="text-lg">Tema Personalizado (Opcional)</CardTitle>
          <CardDescription>
            Defina um tema específico para os carrosséis ou deixe vazio para gerar baseado apenas na auditoria
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            value={customTheme}
            onChange={(e) => setCustomTheme(e.target.value)}
            placeholder="Ex: Carrosséis sobre como aumentar vendas com Reels no Instagram..."
            rows={4}
            maxLength={500}
            className="w-full bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Quanto mais específico, melhor será o resultado</span>
            <span className={`font-mono ${
              customTheme.length > 450 ? 'text-warning-500' : 'text-muted-foreground'
            }`}>
              {customTheme.length}/500
            </span>
          </div>
          {customTheme.trim() && (
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="info">Tema Definido</Badge>
              <span className="text-muted-foreground">Os carrosséis serão criados focados neste tema</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading State */}
      {generating && (
        <Card>
          <CardContent className="p-12 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary-600 animate-pulse" />
            <h3 className="text-xl font-semibold mb-2">Content Squad trabalhando...</h3>
            <p className="text-muted-foreground">
              As 5 mentes estão analisando a auditoria e criando sugestões personalizadas
            </p>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-error-500">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-error-500 mb-2">Erro ao gerar conteúdo</h3>
            <p className="text-foreground">{error}</p>
            <Button onClick={handleGenerateContent} className="mt-4">
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Content Results */}
      {content && (
        <>
          {/* Actions */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">Sugestões de Carrosséis</h2>
              {usedTheme ? (
                <Badge variant="info" className="text-xs">
                  Tema: {usedTheme.length > 40 ? usedTheme.substring(0, 40) + '...' : usedTheme}
                </Badge>
              ) : (
                <Badge variant="neutral" className="text-xs">
                  Baseado na Auditoria
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              {approvedCarouselsCount > 0 && (
                <Button
                  variant="primary"
                  onClick={(e) => {
                    e.preventDefault()
                    console.log('🔄 Navegando para configurar slides...')
                    router.push(`/dashboard/audits/${id}/create-content/slides`)
                  }}
                  className="flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Configurar e Gerar Slides ({approvedCarouselsCount})
                </Button>
              )}
              <Button onClick={handleGenerateContent}>
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar Novas Sugestões
              </Button>
            </div>
          </div>

          {/* Slides Error */}
          {slidesError && (
            <Card className="border-error-500">
              <CardContent className="p-4">
                <p className="text-error-500">{slidesError}</p>
              </CardContent>
            </Card>
          )}

          {/* Slides V2 Error */}
          {slidesV2Error && (
            <Card className="border-error-500">
              <CardContent className="p-4">
                <p className="text-error-500">{slidesV2Error}</p>
              </CardContent>
            </Card>
          )}

          {/* Reel Error */}
          {reelError && (
            <Card className="border-error-500">
              <CardContent className="p-4">
                <p className="text-error-500">{reelError}</p>
              </CardContent>
            </Card>
          )}

          {/* Reel Videos Results */}
          {reelVideos && reelVideos.length > 0 && (
            <Card className="bg-gradient-to-br from-warning-50 to-white dark:from-warning-950/30 dark:to-neutral-800/50 border-warning-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-warning-700" />
                  Reels Animados ({reelVideos.length} {reelVideos.length === 1 ? 'video' : 'videos'})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {reelVideos.map((video: any, i: number) => (
                    <div key={i} className="space-y-2">
                      <p className="text-sm font-medium text-foreground">{video.title}</p>
                      <div className="relative rounded-lg overflow-hidden border-2 border-neutral-300 dark:border-neutral-600">
                        <video
                          src={video.videoUrl}
                          controls
                          playsInline
                          style={{ width: '100%', aspectRatio: '4/5' }}
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


          {/* Estratégia Geral */}
          {content.estrategia_geral && (
            <Card>
              <CardHeader>
                <CardTitle>Estratégia Geral</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-700">{content.estrategia_geral}</p>
              </CardContent>
            </Card>
          )}

          {/* Controle Global de Seleção de Slides */}
          {approvedCarouselsCount > 0 && (
            <Card className="bg-primary-50/50 border-primary-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-sm">Seleção de Slides</h4>
                    <p className="text-xs text-neutral-600 mt-1">
                      {(() => {
                        let totalSelected = 0
                        let totalSlides = 0
                        content.carousels?.forEach((carousel: any, idx: number) => {
                          if (carousel.approved) {
                            totalSlides += carousel.slides.length
                            totalSelected += selectedSlides.get(idx)?.size || 0
                          }
                        })
                        return `${totalSelected} de ${totalSlides} slides selecionados`
                      })()}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleToggleAllSlidesGlobal}
                    className="flex items-center gap-2"
                  >
                    {(() => {
                      const allSelected = content.carousels?.every((carousel: any, index: number) => {
                        if (!carousel.approved) return true
                        const slideSel = selectedSlides.get(index)
                        return slideSel && slideSel.size === carousel.slides.length
                      })
                      return (
                        <>
                          <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={() => {}}
                            className="pointer-events-none"
                          />
                          {allSelected ? 'Desselecionar Todos' : 'Selecionar Todos'}
                        </>
                      )
                    })()}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Carrosséis */}
          <div className="space-y-6">
            {content.carousels?.map((carousel: any, index: number) => (
              <Card key={index} className={`border-2 transition-all ${
                carousel.approved === true
                  ? 'border-success-2000 bg-success-500/5'
                  : carousel.approved === false
                  ? 'border-error-200 bg-error-500/5'
                  : 'border-primary-200'
              }`}>
                <CardHeader>
                  <div className="space-y-4">
                    {/* Botões de Ação */}
                    <div className="flex gap-2 flex-wrap p-3 bg-white/50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200">
                          <Button
                            variant={carousel.approved === true ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => handleApproveCarousel(index, true)}
                            disabled={approvingCarousel === index || carousel.approved === true}
                            className={`flex items-center gap-2 ${
                              carousel.approved === true
                                ? 'bg-success-600 hover:bg-success-700 text-white border-success-600'
                                : 'bg-success-50 hover:bg-success-100 text-success-700 border-success-300 font-semibold'
                            }`}
                          >
                            {approvingCarousel === index ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                            Aprovar
                          </Button>
                          {carousel.approved === true && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault()
                                console.log('🔄 Navegando para configurar slides...')
                                router.push(`/dashboard/audits/${id}/create-content/slides`)
                              }}
                              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-lg shadow-primary-500/50"
                            >
                              <Sparkles className="w-4 h-4" />
                              Gerar Slides
                            </Button>
                          )}
                          <Button
                            variant={carousel.approved === false ? 'danger' : 'secondary'}
                            size="sm"
                            onClick={() => handleApproveCarousel(index, false)}
                            disabled={approvingCarousel === index || carousel.approved === false}
                            className={`flex items-center gap-2 ${
                              carousel.approved === false
                                ? 'bg-error-600 hover:bg-error-700 text-white border-error-600'
                                : 'bg-error-50 hover:bg-error-100 text-error-700 border-error-300 font-semibold'
                            }`}
                          >
                            {approvingCarousel === index ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                            Rejeitar
                          </Button>
                          {carousel.approved === false && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteCarousel(index, carousel.titulo)}
                              disabled={deletingCarousel === index}
                              className="flex items-center gap-2"
                            >
                              {deletingCarousel === index ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                              Apagar
                            </Button>
                          )}
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenEdit(index, carousel)}
                            className="flex items-center gap-2 bg-primary-50 hover:bg-primary-100 text-primary-700 border-primary-300 font-semibold"
                          >
                            <Pencil className="w-4 h-4" />
                            Editar
                          </Button>
                          {carousel.approved === true && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleGenerateVariations(index)}
                              disabled={generatingVariations === index}
                              className="flex items-center gap-2 border-primary-500/40 text-primary-600 hover:text-primary-300"
                            >
                              {generatingVariations === index ? (
                                <><Loader2 className="w-4 h-4 animate-spin" />Gerando...</>
                              ) : (
                                <><Repeat2 className="w-4 h-4" />Gerar Variações</>
                              )}
                            </Button>
                          )}
                        </div>

                    {/* Título e Badges - AGORA ABAIXO DOS BOTÕES */}
                    <div>
                      <CardTitle className="text-2xl mb-2">{carousel.titulo}</CardTitle>
                      <div className="flex gap-2 mb-2">
                        <Badge variant={
                          carousel.tipo === 'educacional' ? 'info' :
                          carousel.tipo === 'vendas' ? 'success' :
                          carousel.tipo === 'autoridade' ? 'warning' :
                          'neutral'
                        }>
                          {carousel.tipo}
                        </Badge>
                        {carousel.approved === true && (
                          <Badge variant="success" className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Aprovado
                          </Badge>
                        )}
                        {carousel.approved === false && (
                          <Badge variant="error" className="flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            Não Aprovado
                          </Badge>
                        )}
                        {carousel.is_variation && carousel.variation_source && (
                          <Badge variant="neutral" className="flex items-center gap-1 text-xs">
                            <Repeat2 className="w-3 h-3" />
                            Variação de: {carousel.variation_source.title?.length > 25
                              ? carousel.variation_source.title.substring(0, 25) + '...'
                              : carousel.variation_source.title}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Objetivo e Baseado em */}
                    <div>
                      <p className="text-sm text-neutral-600 mb-1">
                        <strong>Objetivo:</strong> {carousel.objetivo}
                      </p>
                      <p className="text-sm text-neutral-600">
                        <strong>Baseado em:</strong> {carousel.baseado_em}
                      </p>
                    </div>

                    {/* Botão Copiar Tudo */}
                    <div className="flex justify-end">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCopyCarousel(carousel, index)}
                      >
                      {copiedIndex === index ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copiar Tudo
                        </>
                      )}
                    </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Painel de Edição Inline */}
                {editingIndex === index && editedCarousel && (
                  <div className="mx-6 mb-4 rounded-xl border-2 border-primary-500/30 bg-white dark:bg-neutral-900 shadow-lg overflow-hidden">
                    {/* Header do painel */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-100 to-primary-50 dark:from-primary-900/40 dark:to-primary-800/20 border-b border-primary-200 dark:border-primary-700">
                      <h4 className="font-semibold text-primary-700 dark:text-primary-300 flex items-center gap-2">
                        <Pencil className="w-4 h-4" />
                        Editando: {editedCarousel.titulo}
                      </h4>
                      <Button variant="ghost" size="sm" onClick={handleCloseEdit}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="p-4 space-y-4">
                      {/* Instruções para IA */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                          Instruções para regenerar com IA <span className="text-neutral-500 dark:text-neutral-400">(opcional)</span>
                        </label>
                        <textarea
                          value={editInstructions}
                          onChange={(e) => setEditInstructions(e.target.value)}
                          placeholder="Ex: Adicione dados específicos sobre X, mude o tom para mais descontraído, foque em pequenas empresas, adicione estatísticas sobre Y..."
                          rows={3}
                          className="w-full bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg px-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none text-sm"
                        />
                      </div>

                      {/* Título */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">Título do Carrossel</label>
                        <input
                          type="text"
                          value={editedCarousel.titulo}
                          onChange={(e) => setEditedCarousel((p: any) => ({ ...p, titulo: e.target.value }))}
                          className="w-full bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        />
                      </div>

                      {/* Slides */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">Slides</label>
                        <div className="space-y-3">
                          {editedCarousel.slides?.map((slide: any, si: number) => (
                            <div key={si} className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-3 space-y-2">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                  {slide.numero}
                                </span>
                                <input
                                  type="text"
                                  value={slide.titulo}
                                  onChange={(e) => setEditedCarousel((p: any) => {
                                    const slides = [...p.slides]
                                    slides[si] = { ...slides[si], titulo: e.target.value }
                                    return { ...p, slides }
                                  })}
                                  placeholder="Título do slide"
                                  className="flex-1 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded px-2 py-1 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                                />
                              </div>
                              <textarea
                                value={slide.corpo}
                                onChange={(e) => setEditedCarousel((p: any) => {
                                  const slides = [...p.slides]
                                  slides[si] = { ...slides[si], corpo: e.target.value }
                                  return { ...p, slides }
                                })}
                                placeholder="Corpo do slide"
                                rows={2}
                                className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded px-2 py-1 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Caption */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">Caption</label>
                        <textarea
                          value={editedCarousel.caption}
                          onChange={(e) => setEditedCarousel((p: any) => ({ ...p, caption: e.target.value }))}
                          rows={4}
                          className="w-full bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none text-sm"
                        />
                      </div>

                      {/* CTA */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">Call to Action</label>
                        <input
                          type="text"
                          value={editedCarousel.cta}
                          onChange={(e) => setEditedCarousel((p: any) => ({ ...p, cta: e.target.value }))}
                          className="w-full bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        />
                      </div>

                      {/* Botões de ação */}
                      <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                        <Button variant="ghost" size="sm" onClick={handleCloseEdit}>
                          Cancelar
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleSaveDirectEdits}
                          disabled={saving || refining}
                        >
                          {saving ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</>
                          ) : (
                            <><Save className="w-4 h-4 mr-2" />Salvar Edições</>
                          )}
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleRegenerateCarousel}
                          disabled={refining || saving || !editInstructions.trim()}
                          title={!editInstructions.trim() ? 'Digite as instruções para regenerar com IA' : ''}
                        >
                          {refining ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Regenerando...</>
                          ) : (
                            <><RefreshCw className="w-4 h-4 mr-2" />Regenerar com IA</>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <CardContent className="space-y-4">
                  {/* Slides */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">Slides ({carousel.slides.length})</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleAllSlides(index)}
                        className="text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={(selectedSlides.get(index)?.size || 0) === carousel.slides.length}
                          onChange={() => {}}
                          className="mr-2"
                        />
                        {(selectedSlides.get(index)?.size || 0) === carousel.slides.length
                          ? 'Desselecionar Todos'
                          : 'Selecionar Todos'}
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {carousel.slides.map((slide: any, slideIndex: number) => {
                        const isSelected = selectedSlides.get(index)?.has(slideIndex) ?? false
                        return (
                          <Card key={slide.numero} className={`bg-white/50 dark:bg-neutral-800/50 transition-all ${
                            isSelected ? 'ring-2 ring-primary-500 border-primary-300' : 'border-neutral-200'
                          }`}>
                            <CardContent className="p-4">
                              <div className="flex items-start gap-4">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleSlide(index, slideIndex)}
                                  className="mt-1 w-5 h-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                                />
                                <div className="bg-primary-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                                  {slide.numero}
                                </div>
                                <div className="flex-1">
                                  <Badge variant="neutral" className="mb-2">{slide.tipo}</Badge>
                                  <h5 className="font-semibold mb-2">{slide.titulo}</h5>
                                  <p className="text-neutral-700 mb-2">{slide.corpo}</p>
                                  {slide.notas_design && (
                                    <p className="text-xs text-neutral-600 italic">
                                      {slide.notas_design}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>

                  {/* Caption */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Caption</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyCaption(carousel, index)}
                        className="flex items-center gap-1"
                      >
                        {copiedCaption === index ? (
                          <>
                            <Check className="w-4 h-4 text-success-600" />
                            <span className="text-success-600 text-xs">Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span className="text-xs">Copiar</span>
                          </>
                        )}
                      </Button>
                    </div>
                    <Card className="bg-white/50 dark:bg-neutral-800/50">
                      <CardContent className="p-4">
                        <p className="text-neutral-700 whitespace-pre-wrap">{carousel.caption}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Hashtags */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Hashtags</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyHashtags(carousel, index)}
                        className="flex items-center gap-1"
                      >
                        {copiedHashtags === index ? (
                          <>
                            <Check className="w-4 h-4 text-success-600" />
                            <span className="text-success-600 text-xs">Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span className="text-xs">Copiar</span>
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {carousel.hashtags.map((tag: string, i: number) => (
                        <Badge key={i} variant="neutral">#{tag}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <div>
                    <h4 className="font-semibold mb-2">Call to Action</h4>
                    <Card className="bg-primary-500/10 border-primary-200">
                      <CardContent className="p-4">
                        <p className="text-primary-600 font-medium">{carousel.cta}</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Próximos Passos */}
          {content.proximos_passos && content.proximos_passos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Próximos Passos Recomendados</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {content.proximos_passos.map((step: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary-600 font-bold">{index + 1}.</span>
                      <span className="text-neutral-700">{step}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Modal de Agendamento */}
      {showScheduleModal && audit?.profile?.id && (
        <ScheduleContentModal
          auditId={id}
          profileId={audit.profile.id}
          onClose={() => setShowScheduleModal(false)}
          onSuccess={() => {
            setSchedulesRefreshKey(prev => prev + 1)
          }}
        />
      )}
    </div>
  )
}
