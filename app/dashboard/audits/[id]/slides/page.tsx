'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAudit } from '@/hooks/use-audit'
import { PageHeader } from '@/components/molecules/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { Badge } from '@/components/atoms/badge'
import { Skeleton } from '@/components/atoms/skeleton'
import {
  ArrowLeft,
  Archive,
  FolderOpen,
  Loader2,
  Image as ImageIcon,
  Sparkles,
  ExternalLink,
  CheckCircle,
  Trash2,
} from 'lucide-react'

export default function SlidesPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { audit, isLoading: auditLoading } = useAudit(id)

  const [slidesV1, setSlidesV1] = useState<any>(null)
  const [slidesV2, setSlidesV2] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [downloadingZip, setDownloadingZip] = useState(false)
  const [sendingToDrive, setSendingToDrive] = useState(false)
  const [driveMessage, setDriveMessage] = useState<string | null>(null)
  const [driveError, setDriveError] = useState<string | null>(null)
  const [deletingCarousel, setDeletingCarousel] = useState<{ template: string; idx: number } | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/audits/${id}/content`)
        if (res.ok) {
          const data = await res.json()
          if (data.slides) setSlidesV1(data.slides)
          if (data.slides_v2) setSlidesV2(data.slides_v2)
        }
      } catch (err) {
        console.error('Erro ao carregar slides:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleDownloadZip = async () => {
    setDownloadingZip(true)
    try {
      const res = await fetch(`/api/content/${id}/export-zip`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao gerar ZIP')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `slides-${audit?.profile.username}-${new Date().toISOString().split('T')[0]}.zip`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err: any) {
      alert(`Erro: ${err.message}`)
    } finally {
      setDownloadingZip(false)
    }
  }

  const handleDeleteCarousel = async (template: string, carouselIndex: number) => {
    if (!confirm('Tem certeza que deseja excluir este carrossel? As imagens serão deletadas permanentemente.')) return
    setDeletingCarousel({ template, idx: carouselIndex })
    try {
      const res = await fetch(
        `/api/content/${id}/slides?carouselIndex=${carouselIndex}&template=${template}`,
        { method: 'DELETE' }
      )
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao excluir carrossel')
      }

      const setSlides = template === 'v2' ? setSlidesV2 : setSlidesV1
      setSlides((prev: any) => {
        const newCarousels = prev.carousels.filter((_: any, i: number) => i !== carouselIndex)
        if (newCarousels.length === 0) return null
        return {
          ...prev,
          carousels: newCarousels,
          summary: {
            totalCarousels: newCarousels.length,
            totalSlides: newCarousels.reduce((acc: number, c: any) => acc + c.slides.length, 0),
          },
        }
      })
    } catch (err: any) {
      alert(`Erro: ${err.message}`)
    } finally {
      setDeletingCarousel(null)
    }
  }

  const handleSendToDrive = async () => {
    setSendingToDrive(true)
    setDriveMessage(null)
    setDriveError(null)
    try {
      const res = await fetch(`/api/content/${id}/export-drive`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao enviar para Drive')
      setDriveMessage(data.message)
    } catch (err: any) {
      setDriveError(err.message)
    } finally {
      setSendingToDrive(false)
    }
  }

  const hasSlides = !!(slidesV1 || slidesV2)
  const totalV1 = slidesV1?.summary?.totalSlides || 0
  const totalV2 = slidesV2?.summary?.totalSlides || 0
  const totalSlides = totalV1 + totalV2

  if (loading || auditLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5]" />
          ))}
        </div>
      </div>
    )
  }

  const renderCarouselGrid = (slides: any, template: string) => (
    slides.carousels.map((carousel: any, idx: number) => (
      <Card key={idx} className="border-neutral-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="bg-primary-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">
                {idx + 1}
              </span>
              {carousel.title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="neutral" className="text-xs">
                {carousel.totalSlides} slides
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteCarousel(template, idx)}
                disabled={deletingCarousel !== null}
                className="text-neutral-500 hover:text-red-400 h-8 w-8 p-0"
                title="Excluir carrossel"
              >
                {deletingCarousel?.template === template && deletingCarousel?.idx === idx ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {carousel.slides.map((slide: any) => (
              <a
                key={slide.slideNumber}
                href={slide.cloudinaryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <div className="relative aspect-[4/5] rounded-xl overflow-hidden border border-neutral-800 hover:border-primary-500 transition-all shadow-sm">
                  <img
                    src={slide.cloudinaryUrl}
                    alt={`Slide ${slide.slideNumber}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <ExternalLink className="w-6 h-6 text-white" />
                    <span className="text-white text-xs font-medium">Ver tamanho real</span>
                  </div>
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-semibold px-2 py-1 rounded-lg">
                    {slide.slideNumber}/{carousel.totalSlides}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    ))
  )

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
          Voltar para Criar Conteúdo
        </Button>

        <div className="flex items-start justify-between flex-wrap gap-4">
          <PageHeader
            title={`Slides Gerados — @${audit?.profile.username}`}
            description={
              hasSlides
                ? `${totalSlides} slide${totalSlides !== 1 ? 's' : ''} gerado${totalSlides !== 1 ? 's' : ''} (${[totalV1 > 0 && `${totalV1} padrão`, totalV2 > 0 && `${totalV2} com IA`].filter(Boolean).join(' + ')})`
                : 'Nenhum slide gerado ainda'
            }
          />

          {hasSlides && (
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="secondary"
                onClick={handleDownloadZip}
                disabled={downloadingZip}
              >
                {downloadingZip ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Gerando ZIP...</>
                ) : (
                  <><Archive className="w-4 h-4 mr-2" />Baixar ZIP</>
                )}
              </Button>
              <Button
                variant="secondary"
                onClick={handleSendToDrive}
                disabled={sendingToDrive}
              >
                {sendingToDrive ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</>
                ) : (
                  <><FolderOpen className="w-4 h-4 mr-2" />Enviar para Drive</>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Feedback Drive */}
        {driveMessage && (
          <p className="mt-3 text-success-400 text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {driveMessage}
          </p>
        )}
        {driveError && (
          <p className="mt-3 text-error-400 text-sm">{driveError}</p>
        )}
      </div>

      {/* Estado vazio */}
      {!hasSlides && (
        <Card>
          <CardContent className="p-16 text-center space-y-4">
            <ImageIcon className="w-16 h-16 mx-auto text-neutral-600" />
            <h3 className="text-xl font-semibold text-neutral-300">
              Nenhum slide gerado ainda
            </h3>
            <p className="text-neutral-500 max-w-md mx-auto">
              Aprove um carrossel na central de conteúdo e clique em
              &quot;Gerar Slides&quot; ou &quot;Gerar com IA&quot;.
            </p>
            <Button
              onClick={() => router.push(`/dashboard/audits/${id}/create-content`)}
              className="mt-2"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Ir para Criar Conteúdo
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Template Padrão (V1) */}
      {slidesV1 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge variant="neutral" className="flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              Template Padrão
            </Badge>
            <span className="text-sm text-neutral-500">
              {slidesV1.summary?.totalCarousels} carrossel{slidesV1.summary?.totalCarousels !== 1 ? 'is' : ''} ·{' '}
              {totalV1} slide{totalV1 !== 1 ? 's' : ''} · gerado em{' '}
              {new Date(slidesV1.generated_at).toLocaleString('pt-BR')}
            </span>
          </div>
          <div className="space-y-4">
            {renderCarouselGrid(slidesV1, 'v1')}
          </div>
        </div>
      )}

      {/* Template com IA (V2) */}
      {slidesV2 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge variant="info" className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Template com IA
            </Badge>
            <span className="text-sm text-neutral-500">
              {slidesV2.summary?.totalCarousels} carrossel{slidesV2.summary?.totalCarousels !== 1 ? 'is' : ''} ·{' '}
              {totalV2} slide{totalV2 !== 1 ? 's' : ''} · gerado em{' '}
              {new Date(slidesV2.generated_at).toLocaleString('pt-BR')}
            </span>
          </div>
          <div className="space-y-4">
            {renderCarouselGrid(slidesV2, 'v2')}
          </div>
        </div>
      )}
    </div>
  )
}
