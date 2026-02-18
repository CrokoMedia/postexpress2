'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useProfile } from '@/hooks/use-profiles'
import { PageHeader } from '@/components/molecules/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { Badge } from '@/components/atoms/badge'
import { Skeleton } from '@/components/atoms/skeleton'
import { LinkContentModal } from '@/components/molecules/link-content-modal'
import { ArrowLeft, FileText, Calendar, BarChart3, ExternalLink, Sparkles, Link2, User } from 'lucide-react'

export default function ProfileContentPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { profile, isLoading: profileLoading } = useProfile(id)

  const [contents, setContents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [linkModalOpen, setLinkModalOpen] = useState(false)
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null)

  useEffect(() => {
    const loadContents = async () => {
      try {
        const response = await fetch(`/api/profiles/${id}/contents`)
        if (!response.ok) throw new Error('Erro ao carregar conteúdos')

        const data = await response.json()
        setContents(data.contents || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (id) loadContents()
  }, [id])

  const handleOpenLinkModal = (contentId: string) => {
    setSelectedContentId(contentId)
    setLinkModalOpen(true)
  }

  const handleLinked = () => {
    // Recarregar conteúdos após vincular/desvincular
    const loadContents = async () => {
      try {
        const response = await fetch(`/api/profiles/${id}/contents`)
        if (!response.ok) throw new Error('Erro ao carregar conteúdos')
        const data = await response.json()
        setContents(data.contents || [])
      } catch (err: any) {
        setError(err.message)
      }
    }
    loadContents()
  }

  if (profileLoading || loading) {
    return (
      <div>
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div>
        <PageHeader title="Erro" />
        <Card>
          <CardContent className="p-8 text-center text-error-500">
            {error || 'Perfil não encontrado'}
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
          onClick={() => router.push(`/dashboard/profiles/${id}`)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Perfil
        </Button>

        <PageHeader
          title={`Conteúdos Gerados - @${profile.username}`}
          description={`${contents.length} ${contents.length === 1 ? 'conteúdo gerado' : 'conteúdos gerados'} pelo Content Squad`}
        />
      </div>

      {/* Empty State */}
      {contents.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="p-12 text-center">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-neutral-500" />
            <h3 className="text-xl font-semibold mb-2">Nenhum conteúdo gerado ainda</h3>
            <p className="text-neutral-400 mb-6">
              Faça uma auditoria e depois gere conteúdos com o Content Squad
            </p>
            <Button onClick={() => router.push(`/dashboard/profiles/${id}`)}>
              Ir para o Perfil
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Contents List */}
      {contents.length > 0 && (
        <div className="space-y-4">
          {contents.map((item: any) => {
            const content = item.content_json
            const audit = item.audit

            return (
              <Card key={item.id} className="hover:border-primary-500/50 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">
                          {content.carousels?.length || 0} {content.carousels?.length === 1 ? 'Carrossel' : 'Carrosséis'}
                        </CardTitle>
                        <Badge variant={
                          (audit.score_overall || 0) >= 75 ? 'success' :
                          (audit.score_overall || 0) >= 50 ? 'warning' :
                          'error'
                        }>
                          Score: {audit.score_overall}
                        </Badge>
                        {item.is_original ? (
                          <Badge variant="info" className="text-xs">
                            <User className="w-3 h-3 mr-1" />
                            Original
                          </Badge>
                        ) : (
                          <Badge variant="neutral" className="text-xs">
                            <Link2 className="w-3 h-3 mr-1" />
                            De @{item.original_profile?.username}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-neutral-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(item.generated_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="flex items-center gap-1">
                          <BarChart3 className="w-4 h-4" />
                          {audit.posts_analyzed} posts analisados
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenLinkModal(item.id)}
                      >
                        <Link2 className="w-4 h-4 mr-2" />
                        Vincular
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => audit?.id && router.push(`/dashboard/audits/${audit.id}/create-content`)}
                        disabled={!audit?.id}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Preview dos carrosséis */}
                  <div className="space-y-3">
                    {content.carousels?.slice(0, 3).map((carousel: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-4 bg-neutral-800/50 rounded-lg border border-neutral-700"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{carousel.titulo}</h4>
                              <Badge variant="neutral" className="text-xs">
                                {carousel.tipo}
                              </Badge>
                            </div>
                            <p className="text-sm text-neutral-400 line-clamp-2">
                              {carousel.objetivo}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <FileText className="w-3 h-3 text-neutral-500" />
                              <span className="text-xs text-neutral-500">
                                {carousel.slides?.length || 0} slides
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {content.carousels?.length > 3 && (
                      <div className="text-center text-sm text-neutral-400 pt-2">
                        +{content.carousels.length - 3} carrosséis adicionais
                      </div>
                    )}
                  </div>

                  {/* Estratégia Geral */}
                  {content.estrategia_geral && (
                    <div className="mt-4 pt-4 border-t border-neutral-800">
                      <h5 className="text-sm font-semibold mb-2">Estratégia Geral</h5>
                      <p className="text-sm text-neutral-400 line-clamp-2">
                        {content.estrategia_geral}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Link Content Modal */}
      {selectedContentId && profile && (
        <LinkContentModal
          contentId={selectedContentId}
          currentProfileId={id}
          currentProfileUsername={profile.username}
          isOpen={linkModalOpen}
          onClose={() => setLinkModalOpen(false)}
          onLinked={handleLinked}
        />
      )}
    </div>
  )
}
