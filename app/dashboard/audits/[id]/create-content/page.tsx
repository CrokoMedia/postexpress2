'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAudit } from '@/hooks/use-audit'
import { PageHeader } from '@/components/molecules/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { Skeleton } from '@/components/atoms/skeleton'
import { Badge } from '@/components/atoms/badge'
import { Sparkles, ArrowLeft, Download, Copy, Check, Image as ImageIcon, Loader2, CheckCircle, XCircle, Archive, FolderOpen, Pencil, RefreshCw, Save, X, Video, Repeat2 } from 'lucide-react'
import Link from 'next/link'

export default function CreateContentPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { audit, isLoading, isError } = useAudit(id)

  const [generating, setGenerating] = useState(false)
  const [content, setContent] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [generatingSlides, setGeneratingSlides] = useState(false)
  const [slides, setSlides] = useState<any>(null)
  const [slidesError, setSlidesError] = useState<string | null>(null)
  const [loadingExisting, setLoadingExisting] = useState(true)
  const [approvingCarousel, setApprovingCarousel] = useState<number | null>(null)
  const [customTheme, setCustomTheme] = useState('')
  const [usedTheme, setUsedTheme] = useState<string | null>(null)
  const [downloadingZip, setDownloadingZip] = useState(false)
  const [sendingToDrive, setSendingToDrive] = useState(false)
  const [driveMessage, setDriveMessage] = useState<string | null>(null)
  const [driveError, setDriveError] = useState<string | null>(null)

  const [generatingVariations, setGeneratingVariations] = useState<number | null>(null)

  // Estados do painel de edição
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editInstructions, setEditInstructions] = useState('')
  const [editedCarousel, setEditedCarousel] = useState<any>(null)
  const [refining, setRefining] = useState(false)
  const [saving, setSaving] = useState(false)

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
            console.log('✅ Slides existentes carregados')
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

      const response = await fetch(`/api/audits/${id}/generate-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          custom_theme: themeToUse
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao gerar conteúdo')
      }

      const data = await response.json()
      setContent(data.content)
      setUsedTheme(themeToUse)
    } catch (err: any) {
      console.error('Erro:', err)
      setError(err.message)
    } finally {
      setGenerating(false)
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

  const handleDownloadJSON = () => {
    const dataStr = JSON.stringify(content, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const exportFileDefaultName = `content-suggestions-${audit?.profile.username}-${new Date().toISOString().split('T')[0]}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
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

      console.log(`✅ Carrossel ${carouselIndex} ${approved ? 'aprovado' : 'desaprovado'}`)
    } catch (err: any) {
      console.error('Erro ao aprovar carrossel:', err)
      alert(`Erro: ${err.message}`)
    } finally {
      setApprovingCarousel(null)
    }
  }

  const handleGenerateSlides = async () => {
    if (!content || !content.carousels) {
      setSlidesError('Gere as sugestões de conteúdo primeiro')
      return
    }

    const approvedCount = content.carousels.filter((c: any) => c.approved === true).length

    if (approvedCount === 0) {
      setSlidesError('Aprove pelo menos um carrossel antes de gerar slides')
      return
    }

    setGeneratingSlides(true)
    setSlidesError(null)

    try {
      const response = await fetch(`/api/content/${id}/generate-slides`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carousels: content.carousels,
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

        {!content && (
          <Button
            onClick={handleGenerateContent}
            disabled={generating}
            size="lg"
            className="flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            {generating ? 'Gerando...' : 'Gerar Sugestões'}
          </Button>
        )}
      </div>

      {/* Tabs: Carrosséis / Reels */}
      <div className="flex gap-1 bg-neutral-900 border border-neutral-800 rounded-xl p-1 w-fit">
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500/20 text-primary-400 font-medium text-sm">
          <ImageIcon className="w-4 h-4" />
          Carrosséis
        </div>
        <Link
          href={`/dashboard/audits/${id}/create-content/reels`}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 font-medium text-sm transition-all"
        >
          <Video className="w-4 h-4" />
          Reels
        </Link>
      </div>

      {/* Resumo da Auditoria */}
      <Card className="bg-gradient-to-br from-primary-500/10 to-primary-500/5 border-primary-500/20">
        <CardContent className="p-6">
          <div className="grid grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-sm text-neutral-400 mb-1">Score Geral</div>
              <div className="text-3xl font-bold text-primary-500">{audit.score_overall}</div>
            </div>
            <div>
              <div className="text-sm text-neutral-400 mb-1">Comportamento</div>
              <div className="text-2xl font-bold">{audit.score_behavior}</div>
            </div>
            <div>
              <div className="text-sm text-neutral-400 mb-1">Copy</div>
              <div className="text-2xl font-bold">{audit.score_copy}</div>
            </div>
            <div>
              <div className="text-sm text-neutral-400 mb-1">Ofertas</div>
              <div className="text-2xl font-bold">{audit.score_offers}</div>
            </div>
            <div>
              <div className="text-sm text-neutral-400 mb-1">Métricas</div>
              <div className="text-2xl font-bold">{audit.score_metrics}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campo de Tema Personalizado */}
      {!content && (
        <Card className="border-primary-500/30 bg-neutral-900/50">
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
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-500">💡 Quanto mais específico, melhor será o resultado</span>
              <span className={`font-mono ${
                customTheme.length > 450 ? 'text-warning-500' : 'text-neutral-500'
              }`}>
                {customTheme.length}/500
              </span>
            </div>
            {customTheme.trim() && (
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="info">Tema Definido</Badge>
                <span className="text-neutral-400">Os carrosséis serão criados focados neste tema</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {generating && (
        <Card>
          <CardContent className="p-12 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary-500 animate-pulse" />
            <h3 className="text-xl font-semibold mb-2">Content Squad trabalhando...</h3>
            <p className="text-neutral-400">
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
            <p className="text-neutral-300">{error}</p>
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
              <Button variant="secondary" onClick={handleDownloadJSON}>
                <Download className="w-4 h-4 mr-2" />
                Download JSON
              </Button>
              <Button
                variant="primary"
                onClick={handleGenerateSlides}
                disabled={generatingSlides || approvedCarouselsCount === 0}
                title={approvedCarouselsCount === 0 ? 'Aprove pelo menos um carrossel primeiro' : ''}
              >
                {generatingSlides ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando Slides...
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Gerar Slides Visuais ({approvedCarouselsCount}/{totalCarouselsCount} aprovados)
                  </>
                )}
              </Button>
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

          {/* Slides Results */}
          {slides && (
            <Card className="bg-gradient-to-br from-success-500/10 to-success-500/5 border-success-500/20">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Slides Visuais Gerados ({slides.summary.totalSlides} imagens)
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
                <div className="space-y-6">
                  {slides.carousels.map((carousel: any, idx: number) => (
                    <div key={idx}>
                      <h4 className="font-semibold mb-3">{carousel.title}</h4>
                      <div className="grid grid-cols-3 gap-4">
                        {carousel.slides.map((slide: any) => (
                          <a
                            key={slide.slideNumber}
                            href={slide.cloudinaryUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block group"
                          >
                            <div className="relative aspect-[4/5] rounded-lg overflow-hidden border border-neutral-700 hover:border-primary-500 transition-all">
                              <img
                                src={slide.cloudinaryUrl}
                                alt={`Slide ${slide.slideNumber}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white font-semibold">
                                  Ver em Tamanho Real
                                </span>
                              </div>
                              <div className="absolute top-2 right-2 bg-primary-500 text-white px-2 py-1 rounded text-xs font-semibold">
                                {slide.slideNumber}/{carousel.slides.length}
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
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
                <p className="text-neutral-300">{content.estrategia_geral}</p>
              </CardContent>
            </Card>
          )}

          {/* Carrosséis */}
          <div className="space-y-6">
            {content.carousels?.map((carousel: any, index: number) => (
              <Card key={index} className={`border-2 transition-all ${
                carousel.approved === true
                  ? 'border-success-500/50 bg-success-500/5'
                  : carousel.approved === false
                  ? 'border-error-500/30 bg-error-500/5 opacity-60'
                  : 'border-primary-500/20'
              }`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-2">
                        <div className="flex-1">
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

                        {/* Botões de Ação */}
                        <div className="flex gap-2 flex-wrap justify-end">
                          {carousel.approved === true && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleGenerateVariations(index)}
                              disabled={generatingVariations === index}
                              className="flex items-center gap-2 border-primary-500/40 text-primary-400 hover:text-primary-300"
                              title="Gerar novos conteúdos a partir deste tema aprovado"
                            >
                              {generatingVariations === index ? (
                                <><Loader2 className="w-4 h-4 animate-spin" />Gerando...</>
                              ) : (
                                <><Repeat2 className="w-4 h-4" />Gerar Variações</>
                              )}
                            </Button>
                          )}
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenEdit(index, carousel)}
                            className="flex items-center gap-2"
                          >
                            <Pencil className="w-4 h-4" />
                            Editar
                          </Button>
                          <Button
                            variant={carousel.approved === true ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => handleApproveCarousel(index, true)}
                            disabled={approvingCarousel === index || carousel.approved === true}
                            className={`flex items-center gap-2 ${
                              carousel.approved === true
                                ? 'bg-success-500 hover:bg-success-600'
                                : ''
                            }`}
                          >
                            {approvingCarousel === index ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                            Aprovar
                          </Button>
                          <Button
                            variant={carousel.approved === false ? 'danger' : 'secondary'}
                            size="sm"
                            onClick={() => handleApproveCarousel(index, false)}
                            disabled={approvingCarousel === index || carousel.approved === false}
                            className="flex items-center gap-2"
                          >
                            {approvingCarousel === index ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                            Rejeitar
                          </Button>
                        </div>
                      </div>

                      <p className="text-sm text-neutral-400 mb-1">
                        <strong>Objetivo:</strong> {carousel.objetivo}
                      </p>
                      <p className="text-sm text-neutral-400">
                        <strong>Baseado em:</strong> {carousel.baseado_em}
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleCopyCarousel(carousel, index)}
                      className="ml-4"
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
                </CardHeader>

                {/* Painel de Edição Inline */}
                {editingIndex === index && editedCarousel && (
                  <div className="mx-6 mb-4 rounded-xl border border-primary-500/40 bg-neutral-900/80 overflow-hidden">
                    {/* Header do painel */}
                    <div className="flex items-center justify-between px-4 py-3 bg-primary-500/10 border-b border-primary-500/30">
                      <h4 className="font-semibold text-primary-400 flex items-center gap-2">
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
                        <label className="block text-sm font-medium text-neutral-300 mb-1">
                          Instruções para regenerar com IA <span className="text-neutral-500">(opcional)</span>
                        </label>
                        <textarea
                          value={editInstructions}
                          onChange={(e) => setEditInstructions(e.target.value)}
                          placeholder="Ex: Adicione dados específicos sobre X, mude o tom para mais descontraído, foque em pequenas empresas, adicione estatísticas sobre Y..."
                          rows={3}
                          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none text-sm"
                        />
                      </div>

                      {/* Título */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-1">Título do Carrossel</label>
                        <input
                          type="text"
                          value={editedCarousel.titulo}
                          onChange={(e) => setEditedCarousel((p: any) => ({ ...p, titulo: e.target.value }))}
                          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        />
                      </div>

                      {/* Slides */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">Slides</label>
                        <div className="space-y-3">
                          {editedCarousel.slides?.map((slide: any, si: number) => (
                            <div key={si} className="bg-neutral-800/60 rounded-lg p-3 space-y-2">
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
                                  className="flex-1 bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-neutral-200 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
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
                                className="w-full bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-neutral-200 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Caption */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-1">Caption</label>
                        <textarea
                          value={editedCarousel.caption}
                          onChange={(e) => setEditedCarousel((p: any) => ({ ...p, caption: e.target.value }))}
                          rows={4}
                          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none text-sm"
                        />
                      </div>

                      {/* CTA */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-1">Call to Action</label>
                        <input
                          type="text"
                          value={editedCarousel.cta}
                          onChange={(e) => setEditedCarousel((p: any) => ({ ...p, cta: e.target.value }))}
                          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        />
                      </div>

                      {/* Botões de ação */}
                      <div className="flex justify-end gap-2 pt-2 border-t border-neutral-700">
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
                    <h4 className="font-semibold mb-3">Slides ({carousel.slides.length})</h4>
                    <div className="space-y-3">
                      {carousel.slides.map((slide: any) => (
                        <Card key={slide.numero} className="bg-neutral-800/50">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <div className="bg-primary-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                                {slide.numero}
                              </div>
                              <div className="flex-1">
                                <Badge variant="neutral" className="mb-2">{slide.tipo}</Badge>
                                <h5 className="font-semibold mb-2">{slide.titulo}</h5>
                                <p className="text-neutral-300 mb-2">{slide.corpo}</p>
                                {slide.notas_design && (
                                  <p className="text-xs text-neutral-400 italic">
                                    💡 {slide.notas_design}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Caption */}
                  <div>
                    <h4 className="font-semibold mb-2">Caption</h4>
                    <Card className="bg-neutral-800/50">
                      <CardContent className="p-4">
                        <p className="text-neutral-300 whitespace-pre-wrap">{carousel.caption}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Hashtags */}
                  <div>
                    <h4 className="font-semibold mb-2">Hashtags</h4>
                    <div className="flex flex-wrap gap-2">
                      {carousel.hashtags.map((tag: string, i: number) => (
                        <Badge key={i} variant="neutral">#{tag}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <div>
                    <h4 className="font-semibold mb-2">Call to Action</h4>
                    <Card className="bg-primary-500/10 border-primary-500/30">
                      <CardContent className="p-4">
                        <p className="text-primary-400 font-medium">{carousel.cta}</p>
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
                      <span className="text-primary-500 font-bold">{index + 1}.</span>
                      <span className="text-neutral-300">{step}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
