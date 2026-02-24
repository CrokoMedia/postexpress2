'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { Badge } from '@/components/atoms/badge'
import {
  Download,
  FolderOpen,
  Instagram,
  Calendar,
  Loader2,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  X,
  ZoomIn,
  Package,
  Clock,
  FileJson,
  Copy,
  FileText,
} from 'lucide-react'
import { useContentCreation } from '@/store/content-creation'
import { PublishInstagramButton } from '@/components/molecules/publish-instagram-button'
import { ScheduleContentModal } from '@/components/molecules/schedule-content-modal'
import { ScheduledContentList } from '@/components/molecules/scheduled-content-list'

interface Phase3ExportarProps {
  auditId: string
  profileId: string
  username: string
}

interface GeneratedSlide {
  slideNumber: number
  cloudinaryUrl: string
  title: string
}

interface GeneratedCarousel {
  carouselIndex: number
  title: string
  approved: boolean
  slides: GeneratedSlide[]
}

interface GeneratedSlidesData {
  carousels: GeneratedCarousel[]
  summary: {
    totalCarousels: number
    totalSlides: number
  }
}

export function Phase3Exportar({ auditId, profileId, username }: Phase3ExportarProps) {
  const router = useRouter()
  const {
    generatedSlides,
    isGenerating,
    approvedCarousels,
    carousels,
    downloadingZip,
    setDownloadingZip,
    downloadingCarouselZip,
    setDownloadingCarouselZip,
    sendingToDrive,
    setSendingToDrive,
    driveMessage,
    setDriveMessage,
    driveError,
    setDriveError,
    showScheduleModal,
    setShowScheduleModal,
    schedulesRefreshKey,
    refreshSchedules,
  } = useContentCreation()

  // Lightbox (UI temporária - mantém useState local)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

  // Estados para copiar legenda
  const [copiedCaption, setCopiedCaption] = useState<number | null>(null)
  const [downloadingCaption, setDownloadingCaption] = useState<number | null>(null)

  // Verificar se há slides gerados
  const hasGeneratedSlides = generatedSlides && generatedSlides.carousels?.length > 0
  const approvedSlidesCount = generatedSlides?.carousels?.filter((c: GeneratedCarousel) => c.approved).length || 0
  const totalSlidesCount = generatedSlides?.summary?.totalSlides || 0

  // Carregar slides existentes do backend ao montar
  useEffect(() => {
    const loadExistingSlides = async () => {
      try {
        const response = await fetch(`/api/audits/${auditId}/content`)
        if (response.ok) {
          const data = await response.json()
          if (data.slides_v2) {
            useContentCreation.getState().setGeneratedSlides(data.slides_v2)
            console.log('✅ Slides V2 carregados do backend')
          }
        }
      } catch (err) {
        console.error('Erro ao carregar slides existentes:', err)
      }
    }

    loadExistingSlides()
  }, [auditId])

  const handleDownloadZip = async () => {
    setDownloadingZip(true)
    setDriveMessage(null)
    setDriveError(null)

    try {
      const response = await fetch(`/api/content/${auditId}/export-zip`, { method: 'POST' })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao gerar ZIP')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `slides-${username}-${new Date().toISOString().split('T')[0]}.zip`
      a.click()
      URL.revokeObjectURL(url)

      setDriveMessage('ZIP baixado com sucesso!')
      setTimeout(() => setDriveMessage(null), 3000)
    } catch (err: any) {
      console.error('Erro ao baixar ZIP:', err)
      setDriveError(err.message)
      setTimeout(() => setDriveError(null), 5000)
    } finally {
      setDownloadingZip(false)
    }
  }

  const handleDownloadCarouselZip = async (carouselIndex: number, carouselTitle: string) => {
    setDownloadingCarouselZip(carouselIndex)
    setDriveMessage(null)
    setDriveError(null)

    try {
      const response = await fetch(
        `/api/content/${auditId}/carousels/${carouselIndex}/export-zip`,
        { method: 'POST' }
      )

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

      setDriveMessage(`ZIP do carrossel "${carouselTitle}" baixado!`)
      setTimeout(() => setDriveMessage(null), 3000)
    } catch (err: any) {
      console.error('Erro ao baixar ZIP do carrossel:', err)
      setDriveError(err.message)
      setTimeout(() => setDriveError(null), 5000)
    } finally {
      setDownloadingCarouselZip(null)
    }
  }

  const handleSendToDrive = async () => {
    setSendingToDrive(true)
    setDriveMessage(null)
    setDriveError(null)

    try {
      const response = await fetch(`/api/content/${auditId}/export-drive`, { method: 'POST' })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar para o Drive')
      }

      setDriveMessage(data.message || 'Enviado para o Google Drive com sucesso!')
    } catch (err: any) {
      console.error('Erro ao enviar para o Drive:', err)
      setDriveError(err.message)
    } finally {
      setSendingToDrive(false)
      setTimeout(() => {
        setDriveMessage(null)
        setDriveError(null)
      }, 5000)
    }
  }

  const slugify = (text: string): string => {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .substring(0, 50)
  }

  const handleDownloadJSON = () => {
    if (carousels.length === 0) {
      alert('Nenhum carrossel disponível para exportar')
      return
    }

    // Montar objeto JSON com todos os carrosséis
    const exportData = {
      exported_at: new Date().toISOString(),
      audit_id: auditId,
      username: username,
      carousels: carousels.map((carousel, index) => ({
        index,
        titulo: carousel.titulo,
        tipo: carousel.tipo,
        approved: carousel.approved,
        slides: carousel.slides,
        caption: carousel.caption,
        hashtags: carousel.hashtags,
        cta: carousel.cta,
        is_variation: carousel.is_variation,
        variation_source: carousel.variation_source,
      })),
    }

    // Criar blob e download
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `conteudo-${username}-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)

    setDriveMessage('JSON exportado com sucesso!')
    setTimeout(() => setDriveMessage(null), 3000)
  }

  // Copiar legenda do carrossel
  const handleCopyCaption = (carouselIndex: number) => {
    const carousel = carousels[carouselIndex]
    if (!carousel) return

    const captionText = `${carousel.caption}\n\n${carousel.hashtags?.map((tag: string) => `#${tag}`).join(' ') || ''}\n\n${carousel.cta || ''}`

    navigator.clipboard.writeText(captionText)
    setCopiedCaption(carouselIndex)
    setTimeout(() => setCopiedCaption(null), 2000)
  }

  // Baixar legenda como TXT
  const handleDownloadCaption = async (carouselIndex: number) => {
    setDownloadingCaption(carouselIndex)
    try {
      const response = await fetch(
        `/api/content/${auditId}/carousels/${carouselIndex}/export-caption`
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao gerar arquivo TXT')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url

      // Extrair nome do arquivo do header Content-Disposition
      const contentDisposition = response.headers.get('Content-Disposition')
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/)
      const filename = filenameMatch?.[1] || `legenda-${carouselIndex}.txt`

      a.download = filename
      a.click()
      URL.revokeObjectURL(url)

      setDriveMessage('Legenda baixada com sucesso!')
      setTimeout(() => setDriveMessage(null), 3000)
    } catch (err: any) {
      console.error('Erro ao baixar legenda:', err)
      setDriveError(err.message)
      setTimeout(() => setDriveError(null), 5000)
    } finally {
      setDownloadingCaption(null)
    }
  }

  // Se não há slides gerados
  if (!hasGeneratedSlides) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary-600" />
            Fase 3: Exportar
          </CardTitle>
          <CardDescription>
            Baixe, compartilhe ou publique seus slides gerados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isGenerating ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary-600 animate-spin" />
              <h3 className="text-lg font-semibold mb-2">Gerando slides...</h3>
              <p className="text-neutral-600 text-sm">
                Aguarde enquanto criamos os slides visuais dos seus carrosséis
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-neutral-400" />
              <h3 className="text-lg font-semibold mb-2">Nenhum slide gerado</h3>
              <p className="text-neutral-600 text-sm mb-4">
                Volte para a Fase 2 e gere os slides visuais dos carrosséis aprovados
              </p>
              <Button
                variant="secondary"
                onClick={() => useContentCreation.getState().goToPhase(2)}
              >
                Voltar para Fase 2
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header da Fase 3 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-primary-600" />
                Fase 3: Exportar
              </CardTitle>
              <CardDescription>
                {approvedSlidesCount} {approvedSlidesCount === 1 ? 'carrossel' : 'carrosséis'} aprovado
                {approvedSlidesCount !== 1 ? 's' : ''} · {totalSlidesCount} slides no total
              </CardDescription>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push(`/dashboard/audits/${auditId}/slides`)}
            >
              Ver Galeria Completa
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Mensagens de Feedback */}
      {driveMessage && (
        <div className="bg-success-50 dark:bg-success-950/20 border border-success-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0" />
          <p className="text-sm text-success-700 dark:text-success-300 font-medium">
            {driveMessage}
          </p>
        </div>
      )}

      {driveError && (
        <div className="bg-error-50 dark:bg-error-950/20 border border-error-200 rounded-lg p-4 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-error-600 flex-shrink-0" />
          <p className="text-sm text-error-700 dark:text-error-300 font-medium">{driveError}</p>
        </div>
      )}

      {/* Botões de Exportação Global */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Exportar Todos os Carrosséis</CardTitle>
          <CardDescription>
            Baixe ou envie todos os carrosséis aprovados de uma vez
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              onClick={handleDownloadZip}
              disabled={downloadingZip || approvedSlidesCount === 0}
              className="flex items-center gap-2"
            >
              {downloadingZip ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gerando ZIP...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download ZIP Completo ({approvedSlidesCount})
                </>
              )}
            </Button>

            <Button
              variant="secondary"
              onClick={handleSendToDrive}
              disabled={sendingToDrive || approvedSlidesCount === 0}
              className="flex items-center gap-2"
            >
              {sendingToDrive ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <FolderOpen className="w-4 h-4" />
                  Enviar para Google Drive
                </>
              )}
            </Button>

            <Button
              variant="secondary"
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center gap-2 border-primary-300 text-primary-700 hover:bg-primary-50"
            >
              <Calendar className="w-4 h-4" />
              Agendar Nova Geração
            </Button>

            <Button
              variant="secondary"
              onClick={handleDownloadJSON}
              disabled={carousels.length === 0}
              className="flex items-center gap-2"
            >
              <FileJson className="w-4 h-4" />
              Download JSON
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Agendamentos */}
      <ScheduledContentList
        key={schedulesRefreshKey}
        auditId={auditId}
        onRefresh={refreshSchedules}
      />

      {/* Carrosséis Individuais */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold">Carrosséis Gerados</h2>

        {generatedSlides.carousels.map((carousel: GeneratedCarousel) => {
          if (!carousel.approved) return null

          return (
            <Card
              key={carousel.carouselIndex}
              className="border-2 border-success-200 bg-success-50/20"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg mb-2">{carousel.title}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="success" className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Aprovado
                      </Badge>
                      <Badge variant="neutral">{carousel.slides.length} slides</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Galeria de Slides */}
                <div>
                  <h4 className="font-semibold mb-3 text-sm">Preview dos Slides</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {carousel.slides.map((slide: GeneratedSlide) => (
                      <div
                        key={slide.slideNumber}
                        className="relative group cursor-pointer rounded-lg overflow-hidden border-2 border-neutral-300 hover:border-primary-500 transition-all"
                        onClick={() => setLightboxImage(slide.cloudinaryUrl)}
                      >
                        <img
                          src={slide.cloudinaryUrl}
                          alt={`Slide ${slide.slideNumber}`}
                          className="w-full aspect-square object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
                          <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-all" />
                        </div>
                        <div className="absolute top-2 left-2 bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                          {slide.slideNumber}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Seção de Legenda */}
                {(() => {
                  const carouselData = carousels[carousel.carouselIndex]
                  if (!carouselData) return null

                  return (
                    <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary-600" />
                          Legenda do Carrossel
                        </h4>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyCaption(carousel.carouselIndex)}
                            className="flex items-center gap-1 text-xs"
                          >
                            {copiedCaption === carousel.carouselIndex ? (
                              <>
                                <CheckCircle className="w-3 h-3 text-success-600" />
                                <span className="text-success-600">Copiado!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copiar</span>
                              </>
                            )}
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleDownloadCaption(carousel.carouselIndex)}
                            disabled={downloadingCaption === carousel.carouselIndex}
                            className="flex items-center gap-1 text-xs"
                          >
                            {downloadingCaption === carousel.carouselIndex ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Baixando...</span>
                              </>
                            ) : (
                              <>
                                <Download className="w-3 h-3" />
                                <span>Baixar TXT</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4 space-y-3">
                        {/* Caption */}
                        <div>
                          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">
                            CAPTION:
                          </p>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                            {carouselData.caption}
                          </p>
                        </div>

                        {/* Hashtags */}
                        {carouselData.hashtags && carouselData.hashtags.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">
                              HASHTAGS:
                            </p>
                            <p className="text-sm text-primary-600 dark:text-primary-400">
                              {carouselData.hashtags.map((tag: string) => `#${tag}`).join(' ')}
                            </p>
                          </div>
                        )}

                        {/* CTA */}
                        {carouselData.cta && (
                          <div>
                            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">
                              CALL TO ACTION:
                            </p>
                            <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium">
                              {carouselData.cta}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })()}

                {/* Botões de Ação do Carrossel */}
                <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        handleDownloadCarouselZip(carousel.carouselIndex, carousel.title)
                      }
                      disabled={downloadingCarouselZip === carousel.carouselIndex}
                      className="flex items-center gap-2"
                    >
                      {downloadingCarouselZip === carousel.carouselIndex ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Gerando...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Download ZIP
                        </>
                      )}
                    </Button>

                    <PublishInstagramButton
                      auditId={auditId}
                      carouselIndex={carousel.carouselIndex}
                      carouselTitle={carousel.title}
                      hasSlides={true}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Lightbox para visualização de imagem */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 text-white hover:bg-white/10"
            onClick={() => setLightboxImage(null)}
          >
            <X className="w-6 h-6" />
          </Button>
          <img
            src={lightboxImage}
            alt="Preview"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Modal de Agendamento */}
      {showScheduleModal && (
        <ScheduleContentModal
          auditId={auditId}
          profileId={profileId}
          onClose={() => setShowScheduleModal(false)}
          onSuccess={() => {
            refreshSchedules()
            setShowScheduleModal(false)
          }}
        />
      )}
    </div>
  )
}
