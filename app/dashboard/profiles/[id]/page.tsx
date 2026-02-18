'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/molecules/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { Badge } from '@/components/atoms/badge'
import { Skeleton } from '@/components/atoms/skeleton'
import { DeleteProfileModal } from '@/components/molecules/delete-profile-modal'
import { DeleteAuditModal } from '@/components/molecules/delete-audit-modal'
import { ProfileContextModal } from '@/components/organisms/profile-context-modal'
import { ContentSquadChatModal } from '@/components/organisms/content-squad-chat-modal'
import { useProfile } from '@/hooks/use-profiles'
import { formatNumber, formatDate, getScoreClassification } from '@/lib/format'
import { CheckCircle, Users, FileText, Calendar, Trash2, Sparkles, Loader2, BookOpen, MessageSquare, TrendingUp, Image as ImageIcon, ChevronRight, PlusCircle, Eye, EyeOff, Pencil } from 'lucide-react'
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
  const [contextData, setContextData] = useState<any>(null)
  const [showContextViewer, setShowContextViewer] = useState(false)
  const [isReAuditing, setIsReAuditing] = useState(false)
  const [contentCount, setContentCount] = useState(0)
  const [auditToDelete, setAuditToDelete] = useState<{ id: string; date: string } | null>(null)
  const [localAudits, setLocalAudits] = useState<any[] | null>(null)

  // Buscar contexto completo
  useEffect(() => {
    const fetchContext = async () => {
      try {
        const res = await fetch(`/api/profiles/${id}/context`)
        if (res.ok) {
          const data = await res.json()
          setHasContext(!!data.context)
          setContextData(data.context || null)
        }
      } catch (error) {
        console.error('Erro ao verificar contexto:', error)
      }
    }
    if (id) fetchContext()
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
      <div className="grid gap-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
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

  const sortedAudits = localAudits ?? (profile.audits || [])
  const latestAudit = sortedAudits[0]

  const handleAuditDeleted = (deletedAuditId: string) => {
    setLocalAudits((sortedAudits).filter((a: any) => a.id !== deletedAuditId))
    setAuditToDelete(null)
  }

  return (
    <div>
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
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold">{profile.full_name || profile.username}</h2>
                {profile.is_verified && <CheckCircle className="h-6 w-6 text-info-500" />}
              </div>
              <p className="text-neutral-400 text-sm mb-3">@{profile.username}</p>
              {profile.biography && (
                <p className="text-neutral-300 mb-4 text-sm">{profile.biography}</p>
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

      {/* Central de Conteúdo */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-neutral-300 mb-3">Central de Conteúdo</h3>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">

          {/* Card: Criar Conteúdo */}
          {latestAudit ? (
            <Link href={`/dashboard/audits/${latestAudit.id}/create-content`}>
              <div className="group relative rounded-xl border border-primary-500/30 bg-gradient-to-br from-primary-500/10 to-primary-500/5 p-5 hover:border-primary-500/60 hover:from-primary-500/15 hover:to-primary-500/10 transition-all cursor-pointer h-full flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary-400" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-primary-400 transition-colors" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-neutral-100 mb-1">Criar Conteúdo</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Gere carrosséis com o Content Squad
                  </p>
                </div>
                {contentCount > 0 && (
                  <div className="mt-3 pt-3 border-t border-primary-500/20">
                    <span className="text-xs text-primary-400 font-medium">
                      {contentCount} carrossel{contentCount !== 1 ? 'is' : ''} gerado{contentCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ) : (
            <div className="rounded-xl border border-neutral-700/50 bg-neutral-800/30 p-5 opacity-50 flex flex-col h-full">
              <div className="w-10 h-10 rounded-lg bg-neutral-700/50 flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5 text-neutral-500" />
              </div>
              <h4 className="font-semibold text-neutral-400 mb-1">Criar Conteúdo</h4>
              <p className="text-xs text-neutral-500">Faça uma auditoria primeiro</p>
            </div>
          )}

          {/* Card: Última Auditoria */}
          {latestAudit ? (
            <Link href={`/dashboard/audits/${latestAudit.id}`}>
              <div className="group relative rounded-xl border border-info-500/30 bg-gradient-to-br from-info-500/10 to-info-500/5 p-5 hover:border-info-500/60 hover:from-info-500/15 hover:to-info-500/10 transition-all cursor-pointer h-full flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-info-500/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-info-400" />
                  </div>
                  <div className={`text-2xl font-bold ${getScoreClassification(latestAudit.score_overall || 0).color}`}>
                    {latestAudit.score_overall}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-neutral-100 mb-1">Última Auditoria</h4>
                  <p className="text-xs text-neutral-400">
                    {formatDate(latestAudit.audit_date)}
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-info-500/20 flex items-center justify-between">
                  <span className="text-xs text-info-400 font-medium">
                    {getScoreClassification(latestAudit.score_overall || 0).label}
                  </span>
                  <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-info-400 transition-colors" />
                </div>
              </div>
            </Link>
          ) : (
            <Link href={`/dashboard/new?username=${profile.username}`}>
              <div className="group rounded-xl border border-dashed border-neutral-600 bg-neutral-800/20 p-5 hover:border-neutral-500 hover:bg-neutral-800/40 transition-all cursor-pointer h-full flex flex-col items-center justify-center text-center">
                <PlusCircle className="w-8 h-8 text-neutral-500 mb-2 group-hover:text-neutral-400" />
                <h4 className="font-semibold text-neutral-400 mb-1">Nova Auditoria</h4>
                <p className="text-xs text-neutral-500">Analisar este perfil</p>
              </div>
            </Link>
          )}

          {/* Card: Chat Content Squad */}
          <button
            onClick={() => latestAudit && setShowChatModal(true)}
            disabled={!latestAudit}
            className={`group rounded-xl border text-left p-5 transition-all h-full flex flex-col w-full ${
              latestAudit
                ? 'border-success-500/30 bg-gradient-to-br from-success-500/10 to-success-500/5 hover:border-success-500/60 hover:from-success-500/15 cursor-pointer'
                : 'border-neutral-700/50 bg-neutral-800/30 opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                latestAudit ? 'bg-success-500/20' : 'bg-neutral-700/50'
              }`}>
                <MessageSquare className={`w-5 h-5 ${latestAudit ? 'text-success-400' : 'text-neutral-500'}`} />
              </div>
              {latestAudit && (
                <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-success-400 transition-colors" />
              )}
            </div>
            <div className="flex-1">
              <h4 className={`font-semibold mb-1 ${latestAudit ? 'text-neutral-100' : 'text-neutral-400'}`}>
                Content Squad
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Chat com os 5 especialistas em conteúdo
              </p>
            </div>
          </button>

          {/* Card: Contexto do Expert */}
          <button
            onClick={() => setShowContextModal(true)}
            className="group rounded-xl border border-warning-500/30 bg-gradient-to-br from-warning-500/10 to-warning-500/5 p-5 hover:border-warning-500/60 hover:from-warning-500/15 transition-all cursor-pointer h-full flex flex-col text-left w-full"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-warning-500/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-warning-400" />
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-warning-400 transition-colors" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-neutral-100 mb-1">Contexto do Expert</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Informações adicionais sobre o perfil
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-warning-500/20">
              {hasContext ? (
                <span className="text-xs text-success-400 font-medium flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Contexto configurado
                </span>
              ) : (
                <span className="text-xs text-warning-400 font-medium">
                  Clique para adicionar
                </span>
              )}
            </div>
          </button>

          {/* Card: Ver Slides */}
          {latestAudit ? (
            <Link href={`/dashboard/audits/${latestAudit.id}/slides`}>
              <div className="group relative rounded-xl border border-neutral-600/40 bg-gradient-to-br from-neutral-800/60 to-neutral-900/40 p-5 hover:border-neutral-500/70 hover:from-neutral-800/80 transition-all cursor-pointer h-full flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-neutral-700/60 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-neutral-300" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-neutral-300 transition-colors" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-neutral-100 mb-1">Ver Slides</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Galeria de slides gerados
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-neutral-700/50">
                  <span className="text-xs text-neutral-400 font-medium">
                    Acesso rápido aos slides
                  </span>
                </div>
              </div>
            </Link>
          ) : (
            <div className="rounded-xl border border-neutral-700/50 bg-neutral-800/30 p-5 opacity-50 flex flex-col h-full">
              <div className="w-10 h-10 rounded-lg bg-neutral-700/50 flex items-center justify-center mb-3">
                <ImageIcon className="w-5 h-5 text-neutral-500" />
              </div>
              <h4 className="font-semibold text-neutral-400 mb-1">Ver Slides</h4>
              <p className="text-xs text-neutral-500">Faça uma auditoria primeiro</p>
            </div>
          )}

        </div>
      </div>

      {/* Contexto do Expert — Visualizador */}
      {hasContext && contextData && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-4 w-4 text-warning-400" />
                Contexto Salvo
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowContextModal(true)}
                className="text-neutral-400 text-xs"
              >
                <Pencil className="h-3.5 w-3.5 mr-1" /> Editar
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Arquivos com extração — sempre visível */}
            {contextData.files && contextData.files.length > 0 && (
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
                  Documentos ({contextData.files.length})
                </p>
                <div className="space-y-3">
                  {contextData.files.map((file: any, idx: number) => (
                    <div key={idx} className="bg-neutral-800/60 rounded-lg px-3 py-3">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="h-4 w-4 text-primary-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-200 truncate">{file.name}</p>
                          <p className="text-xs text-neutral-500">
                            {file.size ? `${(file.size / 1024).toFixed(1)} KB` : ''}
                            {file.wordCount ? ` • ${file.wordCount.toLocaleString()} palavras` : ''}
                            {file.pages ? ` • ${file.pages} págs` : ''}
                          </p>
                        </div>
                        <Badge
                          variant={file.extractionStatus === 'completed' ? 'success' : file.extractionStatus === 'failed' ? 'error' : 'warning'}
                          className="text-xs shrink-0"
                        >
                          {file.extractionStatus === 'completed' ? 'Texto extraído' : file.extractionStatus === 'failed' ? 'Falha' : 'Sem extração'}
                        </Badge>
                      </div>
                      {file.extractedText ? (
                        <p className="text-xs text-neutral-400 bg-neutral-900/50 rounded p-2 max-h-32 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                          {file.extractedText.slice(0, 600)}{file.extractedText.length > 600 ? '…' : ''}
                        </p>
                      ) : file.extractionError ? (
                        <p className="text-xs text-error-400 bg-error-500/5 rounded p-2">{file.extractionError}</p>
                      ) : (
                        <p className="text-xs text-neutral-500 italic">
                          Texto não extraído — faça o upload novamente para extrair.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Campos de texto — colapsáveis */}
            {(() => {
              const fields = [
                { label: 'Nicho / Área de Atuação', value: contextData.nicho },
                { label: 'Objetivos', value: contextData.objetivos },
                { label: 'Público-Alvo', value: contextData.publico_alvo },
                { label: 'Produtos / Serviços', value: contextData.produtos_servicos },
                { label: 'Tom de Voz', value: contextData.tom_voz },
                { label: 'Contexto Adicional', value: contextData.contexto_adicional },
              ].filter(f => f.value)

              if (fields.length === 0) return null

              return (
                <div>
                  <button
                    onClick={() => setShowContextViewer(!showContextViewer)}
                    className="flex items-center gap-2 text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2 hover:text-neutral-300 transition-colors w-full text-left"
                  >
                    {showContextViewer ? (
                      <EyeOff className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                    Campos preenchidos ({fields.length})
                  </button>

                  {showContextViewer && (
                    <div className="space-y-3">
                      {fields.map(({ label, value }) => (
                        <div key={label}>
                          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">
                            {label}
                          </p>
                          <p className="text-sm text-neutral-200 bg-neutral-800/60 rounded-lg px-3 py-2 whitespace-pre-wrap">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })()}
          </CardContent>
        </Card>
      )}

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
                <div key={audit.id} className="flex items-center justify-between p-4 rounded-lg border border-neutral-700 hover:border-neutral-600 transition-all group">
                  <Link href={`/dashboard/audits/${audit.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex-1 min-w-0">
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
                  </Link>
                  <button
                    onClick={() => setAuditToDelete({ id: audit.id, date: audit.audit_date })}
                    className="ml-3 p-2 rounded-lg text-neutral-600 hover:text-error-400 hover:bg-error-500/10 opacity-0 group-hover:opacity-100 transition-all"
                    title="Excluir auditoria"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Profile Modal */}
      <DeleteProfileModal
        profileId={id}
        username={profile.username}
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDeleteSuccess={() => {
          router.push('/dashboard')
        }}
      />

      {/* Delete Audit Modal */}
      {auditToDelete && (
        <DeleteAuditModal
          auditId={auditToDelete.id}
          auditDate={auditToDelete.date}
          isOpen={true}
          onClose={() => setAuditToDelete(null)}
          onDeleteSuccess={() => handleAuditDeleted(auditToDelete.id)}
        />
      )}

      {/* Profile Context Modal */}
      {showContextModal && (
        <ProfileContextModal
          profileId={id}
          username={profile.username}
          onClose={() => setShowContextModal(false)}
          onSave={async () => {
            setHasContext(true)
            setShowContextModal(false)
            // Recarregar contexto após salvar
            try {
              const res = await fetch(`/api/profiles/${id}/context`)
              if (res.ok) {
                const data = await res.json()
                setContextData(data.context || null)
              }
            } catch {}
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
