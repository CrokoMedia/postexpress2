'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAudit } from '@/hooks/use-audit'
import { PageHeader } from '@/components/molecules/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { Skeleton } from '@/components/atoms/skeleton'
import { Badge } from '@/components/atoms/badge'
import { Sparkles, ArrowLeft, Download, Copy, Check, Image as ImageIcon, Loader2, CheckCircle, XCircle } from 'lucide-react'

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
      const response = await fetch(`/api/audits/${id}/generate-content`, {
        method: 'POST'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao gerar conteúdo')
      }

      const data = await response.json()
      setContent(data.content)
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
            <h2 className="text-2xl font-bold">Sugestões de Carrosséis</h2>
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
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Slides Visuais Gerados ({slides.summary.totalSlides} imagens)
                </CardTitle>
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
                          </div>
                        </div>

                        {/* Botões de Aprovação */}
                        <div className="flex gap-2">
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
