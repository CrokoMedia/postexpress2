'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useProfile } from '@/hooks/use-profiles'
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
  Calendar,
  TrendingUp,
} from 'lucide-react'

interface AuditSlides {
  audit_id: string
  audit_date: string
  overall_score: number | null
  posts_analyzed: number | null
  slides_json: any
  slides_v2_json: any
  generated_at: string
}

interface SlidesResponse {
  audits: AuditSlides[]
  total_audits: number
  total_slides: number
  total_slides_v1: number
  total_slides_v2: number
}

export default function ProfileSlidesPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { profile, isLoading: profileLoading } = useProfile(id)

  const [data, setData] = useState<SlidesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloadingZip, setDownloadingZip] = useState<string | null>(null)
  const [sendingToDrive, setSendingToDrive] = useState<string | null>(null)
  const [driveMessage, setDriveMessage] = useState<{ auditId: string; message: string } | null>(null)
  const [driveError, setDriveError] = useState<{ auditId: string; message: string } | null>(null)
  const [deletingCarousel, setDeletingCarousel] = useState<{ auditId: string; template: string; idx: number } | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/profiles/${id}/slides`)
        if (res.ok) {
          const json = await res.json()
          setData(json)
        }
      } catch (err) {
        console.error('Erro ao carregar slides:', err)
      } finally {
        setLoading(false)
      }
    }
    if (id) load()
  }, [id])

  const handleDownloadZip = async (auditId: string) => {
    setDownloadingZip(auditId)
    try {
      const res = await fetch(`/api/content/${auditId}/export-zip`, { method: 'POST' })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Erro ao gerar ZIP')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `slides-${profile?.username || 'profile'}-${new Date().toISOString().split('T')[0]}.zip`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err: any) {
      alert(`Erro: ${err.message}`)
    } finally {
      setDownloadingZip(null)
    }
  }

  const handleSendToDrive = async (auditId: string) => {
    setSendingToDrive(auditId)
    setDriveMessage(null)
    setDriveError(null)
    try {
      const res = await fetch(`/api/content/${auditId}/export-drive`, { method: 'POST' })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Erro ao enviar para Drive')
      setDriveMessage({ auditId, message: d.message })
    } catch (err: any) {
      setDriveError({ auditId, message: err.message })
    } finally {
      setSendingToDrive(null)
    }
  }

  const handleDeleteCarousel = async (auditId: string, template: string, carouselIndex: number) => {
    if (!confirm('Tem certeza que deseja excluir este carrossel? As imagens serão deletadas permanentemente.')) return
    setDeletingCarousel({ auditId, template, idx: carouselIndex })
    try {
      const res = await fetch(
        `/api/content/${auditId}/slides?carouselIndex=${carouselIndex}&template=${template}`,
        { method: 'DELETE' }
      )
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Erro ao excluir carrossel')
      }

      // Atualizar estado local
      setData((prev) => {
        if (!prev) return prev
        const field = template === 'v2' ? 'slides_v2_json' : 'slides_json'
        const updatedAudits = prev.audits.map((audit) => {
          if (audit.audit_id !== auditId) return audit
          const slidesData = audit[field]
          if (!slidesData) return audit
          const newCarousels = slidesData.carousels.filter((_: any, i: number) => i !== carouselIndex)
          if (newCarousels.length === 0) {
            return { ...audit, [field]: null }
          }
          return {
            ...audit,
            [field]: {
              ...slidesData,
              carousels: newCarousels,
              summary: {
                totalCarousels: newCarousels.length,
                totalSlides: newCarousels.reduce((acc: number, c: any) => acc + c.slides.length, 0),
              },
            },
          }
        }).filter((audit) => audit.slides_json || audit.slides_v2_json)

        // Recalcular totais
        let totalV1 = 0
        let totalV2 = 0
        for (const a of updatedAudits) {
          totalV1 += a.slides_json?.summary?.totalSlides || 0
          totalV2 += a.slides_v2_json?.summary?.totalSlides || 0
        }

        return {
          ...prev,
          audits: updatedAudits,
          total_audits: updatedAudits.length,
          total_slides: totalV1 + totalV2,
          total_slides_v1: totalV1,
          total_slides_v2: totalV2,
        }
      })
    } catch (err: any) {
      alert(`Erro: ${err.message}`)
    } finally {
      setDeletingCarousel(null)
    }
  }

  const renderCarouselGrid = (slides: any, template: string, auditId: string) =>
    slides.carousels.map((carousel: any, idx: number) => (
      <Card key={`${template}-${idx}`} className="border-neutral-800">
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
                onClick={() => handleDeleteCarousel(auditId, template, idx)}
                disabled={deletingCarousel !== null}
                className="text-muted-foreground hover:text-red-400 h-8 w-8 p-0"
                title="Excluir carrossel"
              >
                {deletingCarousel?.auditId === auditId && deletingCarousel?.template === template && deletingCarousel?.idx === idx ? (
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

  if (loading || profileLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5]" />
          ))}
        </div>
      </div>
    )
  }

  const hasSlides = data && data.audits.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => router.push(`/dashboard/profiles/${id}`)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Perfil
        </Button>

        <PageHeader
          title={`Todos os Slides — @${profile?.username || '...'}`}
          description={
            hasSlides
              ? `${data.total_slides} slide${data.total_slides !== 1 ? 's' : ''} em ${data.total_audits} auditoria${data.total_audits !== 1 ? 's' : ''} (${[data.total_slides_v1 > 0 && `${data.total_slides_v1} padrão`, data.total_slides_v2 > 0 && `${data.total_slides_v2} com IA`].filter(Boolean).join(' + ')})`
              : 'Nenhum slide gerado ainda'
          }
        />
      </div>

      {/* Estado vazio */}
      {!hasSlides && (
        <Card>
          <CardContent className="p-16 text-center space-y-4">
            <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground" />
            <h3 className="text-xl font-semibold text-neutral-300">
              Nenhum slide gerado ainda
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Crie uma auditoria, aprove carrosséis e gere slides para vê-los aqui.
            </p>
            <Button
              onClick={() => router.push(`/dashboard/profiles/${id}`)}
              className="mt-2"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Voltar para o Perfil
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Lista de auditorias com slides */}
      {hasSlides && data.audits.map((audit) => {
        const totalV1 = audit.slides_json?.summary?.totalSlides || 0
        const totalV2 = audit.slides_v2_json?.summary?.totalSlides || 0
        const totalAuditSlides = totalV1 + totalV2

        return (
          <div key={audit.audit_id} className="space-y-4">
            {/* Header da auditoria */}
            <div className="flex items-center justify-between flex-wrap gap-4 bg-neutral-900/50 rounded-xl p-4 border border-neutral-800">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <Calendar className="w-4 h-4" />
                  {audit.audit_date
                    ? new Date(audit.audit_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
                    : 'Data desconhecida'}
                </div>
                {audit.overall_score != null && (
                  <div className="flex items-center gap-1 text-sm">
                    <TrendingUp className="w-4 h-4 text-primary-400" />
                    <span className="text-primary-400 font-semibold">{audit.overall_score.toFixed(1)}</span>
                  </div>
                )}
                <Badge variant="neutral" className="text-xs">
                  {totalAuditSlides} slide{totalAuditSlides !== 1 ? 's' : ''}
                </Badge>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDownloadZip(audit.audit_id)}
                  disabled={downloadingZip !== null}
                >
                  {downloadingZip === audit.audit_id ? (
                    <><Loader2 className="w-4 h-4 mr-1 animate-spin" />ZIP...</>
                  ) : (
                    <><Archive className="w-4 h-4 mr-1" />Baixar ZIP</>
                  )}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleSendToDrive(audit.audit_id)}
                  disabled={sendingToDrive !== null}
                >
                  {sendingToDrive === audit.audit_id ? (
                    <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Enviando...</>
                  ) : (
                    <><FolderOpen className="w-4 h-4 mr-1" />Drive</>
                  )}
                </Button>
              </div>
            </div>

            {/* Feedback Drive */}
            {driveMessage?.auditId === audit.audit_id && (
              <p className="text-success-400 text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {driveMessage.message}
              </p>
            )}
            {driveError?.auditId === audit.audit_id && (
              <p className="text-error-400 text-sm">{driveError.message}</p>
            )}

            {/* Slides V1 */}
            {audit.slides_json && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge variant="neutral" className="flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    Template Padrão
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {audit.slides_json.summary?.totalCarousels} carrossel{audit.slides_json.summary?.totalCarousels !== 1 ? 'is' : ''} · {totalV1} slide{totalV1 !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="space-y-4">
                  {renderCarouselGrid(audit.slides_json, 'v1', audit.audit_id)}
                </div>
              </div>
            )}

            {/* Slides V2 */}
            {audit.slides_v2_json && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge variant="info" className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Template com IA
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {audit.slides_v2_json.summary?.totalCarousels} carrossel{audit.slides_v2_json.summary?.totalCarousels !== 1 ? 'is' : ''} · {totalV2} slide{totalV2 !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="space-y-4">
                  {renderCarouselGrid(audit.slides_v2_json, 'v2', audit.audit_id)}
                </div>
              </div>
            )}

            {/* Separador entre auditorias */}
            <div className="border-b border-neutral-800/50" />
          </div>
        )
      })}
    </div>
  )
}
