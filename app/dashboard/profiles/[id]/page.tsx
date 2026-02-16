'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/molecules/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { Badge } from '@/components/atoms/badge'
import { Skeleton } from '@/components/atoms/skeleton'
import { DeleteProfileModal } from '@/components/molecules/delete-profile-modal'
import { ProfileContextModal } from '@/components/organisms/profile-context-modal'
import { ContentSquadChatModal } from '@/components/organisms/content-squad-chat-modal'
import { useProfile } from '@/hooks/use-profiles'
import { formatNumber, formatDate, getScoreClassification } from '@/lib/format'
import { CheckCircle, Users, FileText, Calendar, Trash2, FileEdit, Sparkles, Loader2, BookOpen, MessageSquare } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { profile, isLoading, isError } = useProfile(id)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showContextModal, setShowContextModal] = useState(false)
  const [showChatModal, setShowChatModal] = useState(false)
  const [hasContext, setHasContext] = useState(false)
  const [isReAuditing, setIsReAuditing] = useState(false)
  const [contentCount, setContentCount] = useState(0)

  // Verificar se tem contexto
  useEffect(() => {
    const checkContext = async () => {
      try {
        const res = await fetch(`/api/profiles/${id}/context`)
        if (res.ok) {
          const data = await res.json()
          setHasContext(!!data.context)
        }
      } catch (error) {
        console.error('Erro ao verificar contexto:', error)
      }
    }
    if (id) checkContext()
  }, [id])

  // Verificar quantos conteúdos gerados existem
  useEffect(() => {
    const checkContents = async () => {
      try {
        const res = await fetch(`/api/profiles/${id}/contents`)
        if (res.ok) {
          const data = await res.json()
          setContentCount(data.total || 0)
        }
      } catch (error) {
        console.error('Erro ao verificar conteúdos:', error)
      }
    }
    if (id) checkContents()
  }, [id])

  // Executar re-auditoria
  const handleReAudit = async () => {
    if (!latestAudit || isReAuditing) return

    setIsReAuditing(true)
    try {
      const res = await fetch(`/api/audits/${latestAudit.id}/re-audit`, {
        method: 'POST'
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Erro ao re-auditar')
      }

      const data = await res.json()

      // Redirecionar para página de comparação
      if (data.comparison_url) {
        router.push(data.comparison_url)
      } else {
        router.push(`/dashboard/audits/${latestAudit.id}/compare?v2=${data.audit_v2.id}`)
      }
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsReAuditing(false)
    }
  }

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid gap-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div>
        <PageHeader title="Perfil não encontrado" />
        <div className="text-error-500 text-center py-12">
          Erro ao carregar perfil
        </div>
      </div>
    )
  }

  const sortedAudits = profile.audits || []
  const latestAudit = sortedAudits[0]

  return (
    <div>
      <PageHeader
        title={profile.full_name || profile.username}
        description={`@${profile.username}`}
      />

      {/* Profile Info */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative h-24 w-24 rounded-full bg-neutral-700 shrink-0 overflow-hidden ring-4 ring-neutral-700">
              {profile.profile_pic_url_hd || profile.profile_pic_cloudinary_url ? (
                <Image
                  src={profile.profile_pic_cloudinary_url || profile.profile_pic_url_hd || ''}
                  alt={profile.username}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-500 text-4xl font-bold">
                  {profile.username[0].toUpperCase()}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{profile.full_name || profile.username}</h2>
                {profile.is_verified && <CheckCircle className="h-6 w-6 text-info-500" />}
              </div>
              {profile.biography && (
                <p className="text-neutral-300 mb-4">{profile.biography}</p>
              )}
              <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-neutral-400" />
                  <span className="text-neutral-300 font-medium">{formatNumber(profile.followers_count || 0)}</span>
                  <span className="text-neutral-500">seguidores</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-neutral-400" />
                  <span className="text-neutral-300 font-medium">{profile.posts_count || 0}</span>
                  <span className="text-neutral-500">posts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-neutral-400" />
                  <span className="text-neutral-300 font-medium">{profile.total_audits}</span>
                  <span className="text-neutral-500">auditorias</span>
                </div>
              </div>
            </div>

            {/* Latest Score & Actions */}
            <div className="text-right space-y-3">
              {latestAudit && (
                <>
                  <div className={`text-5xl font-bold ${getScoreClassification(latestAudit.score_overall || 0).color}`}>
                    {latestAudit.score_overall}
                  </div>
                  <Badge
                    variant={
                      (latestAudit.score_overall || 0) >= 75 ? 'success' :
                      (latestAudit.score_overall || 0) >= 50 ? 'warning' :
                      'error'
                    }
                  >
                    {getScoreClassification(latestAudit.score_overall || 0).label}
                  </Badge>
                </>
              )}

              {/* Context Button */}
              <Button
                variant={hasContext ? 'secondary' : 'primary'}
                size="sm"
                onClick={() => setShowContextModal(true)}
                className="w-full"
              >
                {hasContext ? (
                  <>
                    <FileEdit className="h-4 w-4 mr-2" />
                    Editar Contexto
                  </>
                ) : (
                  <>
                    <FileEdit className="h-4 w-4 mr-2" />
                    Adicionar Contexto
                  </>
                )}
              </Button>

              {/* Re-Audit Button (only if has context) */}
              {hasContext && latestAudit && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleReAudit}
                  disabled={isReAuditing}
                  className="w-full"
                >
                  {isReAuditing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Re-auditando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Re-auditar com Contexto
                    </>
                  )}
                </Button>
              )}

              {/* Chat with Content Squad Button */}
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowChatModal(true)}
                disabled={!latestAudit}
                className="w-full"
                title={!latestAudit ? 'Faça uma auditoria primeiro' : 'Conversar com Content Squad'}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Conversar com Content Squad
              </Button>

              {/* View Contents Button */}
              {contentCount > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => router.push(`/dashboard/profiles/${id}/content`)}
                  className="w-full"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Ver Conteúdos ({contentCount})
                </Button>
              )}

              {/* Delete Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
                className="text-error-500 hover:text-error-400 hover:bg-error-500/10 w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Deletar Perfil
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audits History */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Auditorias</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedAudits.length === 0 ? (
            <div className="text-neutral-400 text-center py-8">
              Nenhuma auditoria encontrada
            </div>
          ) : (
            <div className="space-y-3">
              {sortedAudits.map((audit: any) => (
                <Link key={audit.id} href={`/dashboard/audits/${audit.id}`}>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-neutral-700 hover:border-primary-500/50 hover:bg-neutral-800/50 transition-all cursor-pointer">
                    <div>
                      <div className="text-sm font-medium text-neutral-300">
                        {formatDate(audit.audit_date)}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {audit.posts_analyzed} posts analisados
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`text-2xl font-bold ${getScoreClassification(audit.score_overall || 0).color}`}>
                        {audit.score_overall}
                      </div>
                      <Button variant="ghost" size="sm">
                        Ver →
                      </Button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Modal */}
      <DeleteProfileModal
        profileId={id}
        username={profile.username}
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDeleteSuccess={() => {
          router.push('/dashboard')
        }}
      />

      {/* Profile Context Modal */}
      {showContextModal && (
        <ProfileContextModal
          profileId={id}
          username={profile.username}
          onClose={() => setShowContextModal(false)}
          onSave={() => {
            setHasContext(true)
            setShowContextModal(false)
          }}
        />
      )}

      {/* Content Squad Chat Modal */}
      {showChatModal && latestAudit && (
        <ContentSquadChatModal
          profileId={id}
          username={profile.username}
          latestAudit={latestAudit}
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
        />
      )}
    </div>
  )
}
