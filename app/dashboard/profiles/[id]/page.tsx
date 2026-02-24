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
import { TwitterExpertsSection } from '@/components/twitter/twitter-experts-section'
import { EditProfileModal } from '@/components/molecules/edit-profile-modal'
import { LinkWhatsAppModal } from '@/components/molecules/link-whatsapp-modal'
import { useProfile } from '@/hooks/use-profiles'
import { formatNumber, formatDate, getScoreClassification } from '@/lib/format'
import { CheckCircle, Users, FileText, Calendar, Trash2, Sparkles, Loader2, BookOpen, MessageSquare, TrendingUp, Image as ImageIcon, ChevronRight, PlusCircle, Eye, EyeOff, Pencil, Factory, Video, ChevronDown, RefreshCw, Palette, Phone } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ConnectInstagramButton } from '@/components/molecules/connect-instagram-button'

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { profile, isLoading, isError } = useProfile(id)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showContextModal, setShowContextModal] = useState(false)
  const [showChatModal, setShowChatModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
  const [hasContext, setHasContext] = useState(false)
  const [contextData, setContextData] = useState<any>(null)
  const [showContextViewer, setShowContextViewer] = useState(false)
  const [isReAuditing, setIsReAuditing] = useState(false)
  const [isFreshAuditing, setIsFreshAuditing] = useState(false)
  const [showAuditDropdown, setShowAuditDropdown] = useState(false)
  const [contentCount, setContentCount] = useState(0)
  const [auditToDelete, setAuditToDelete] = useState<{ id: string; date: string } | null>(null)
  const [localAudits, setLocalAudits] = useState<any[] | null>(null)
  const [localProfile, setLocalProfile] = useState<any>(null)

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

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.audit-dropdown-container')) {
        setShowAuditDropdown(false)
      }
    }

    if (showAuditDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showAuditDropdown])

  // Executar re-auditoria (com contexto, mesmos posts)
  const handleReAudit = async () => {
    if (!latestAudit || isReAuditing) return

    setIsReAuditing(true)
    setShowAuditDropdown(false)
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

  // Nova auditoria com scraping fresco do Instagram
  const handleFreshAudit = async () => {
    if (isFreshAuditing) return

    const confirmed = confirm(
      '🔄 Nova Auditoria com Scraping\n\n' +
      'Isso vai:\n' +
      '• Fazer scraping novo do Instagram\n' +
      '• Coletar os 20 posts mais recentes\n' +
      '• Criar uma nova auditoria completa\n\n' +
      'Tempo estimado: 2-3 minutos\n\n' +
      'Deseja continuar?'
    )

    if (!confirmed) return

    setIsFreshAuditing(true)
    setShowAuditDropdown(false)
    try {
      const res = await fetch(`/api/profiles/${id}/fresh-audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postsLimit: 20,
          includeComments: true
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Erro ao fazer nova auditoria')
      }

      const data = await res.json()

      // Redirecionar para a nova auditoria
      if (data.audit?.id) {
        router.push(`/dashboard/audits/${data.audit.id}`)
      } else {
        // Recarregar página para mostrar nova auditoria
        router.refresh()
      }
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsFreshAuditing(false)
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

  const currentProfile = localProfile ?? profile
  const sortedAudits = localAudits ?? (profile.audits || [])
  const latestAudit = sortedAudits[0]

  const handleAuditDeleted = (deletedAuditId: string) => {
    setLocalAudits((sortedAudits).filter((a: any) => a.id !== deletedAuditId))
    setAuditToDelete(null)
  }

  const handleProfileUpdated = async () => {
    // Recarregar perfil após atualização
    try {
      const res = await fetch(`/api/profiles/${id}`)
      if (res.ok) {
        const data = await res.json()
        setLocalProfile(data.profile)
      }
    } catch (error) {
      console.error('Erro ao recarregar perfil:', error)
    }
  }

  return (
    <div>
      {/* Profile Info */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative h-24 w-24 rounded-full bg-neutral-200 dark:bg-neutral-700 shrink-0 overflow-hidden ring-4 ring-neutral-200 dark:ring-neutral-700">
              {currentProfile.profile_pic_url_hd || currentProfile.profile_pic_cloudinary_url ? (
                <Image
                  src={currentProfile.profile_pic_cloudinary_url || currentProfile.profile_pic_url_hd || ''}
                  alt={currentProfile.username}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-600 dark:text-neutral-300 text-4xl font-bold">
                  {currentProfile.username[0].toUpperCase()}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold text-foreground">{currentProfile.full_name || currentProfile.username}</h2>
                {currentProfile.is_verified && <CheckCircle className="h-6 w-6 text-info-500" />}
                {/* Gender Badge */}
                {currentProfile.gender && (
                  <Badge
                    variant={currentProfile.gender_auto_detected ? 'warning' : 'success'}
                    className="text-xs"
                  >
                    {currentProfile.gender === 'masculino' && '👨'}
                    {currentProfile.gender === 'feminino' && '👩'}
                    {currentProfile.gender === 'neutro' && '🧑'}
                    {currentProfile.gender === 'empresa' && '🏢'}
                    {' '}
                    {currentProfile.gender_auto_detected && '(auto)'}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-sm mb-3">@{currentProfile.username}</p>
              {currentProfile.biography && (
                <p className="text-foreground mb-4 text-sm">{currentProfile.biography}</p>
              )}

              {/* Conectar Instagram */}
              <div className="mb-4">
                <ConnectInstagramButton
                  profileId={id}
                  isConnected={profile.instagram_connected || false}
                  tokenExpiresAt={profile.instagram_token_expires_at || null}
                />
              </div>

              {/* WhatsApp vinculado */}
              {currentProfile.whatsapp_phone ? (
                <div className="mb-4 flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-1.5">
                    <Phone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                      WhatsApp: {currentProfile.whatsapp_phone}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowWhatsAppModal(true)}
                    className="text-xs text-muted-foreground hover:text-foreground underline"
                  >
                    editar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowWhatsAppModal(true)}
                  className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <Phone className="h-4 w-4 group-hover:text-emerald-600" />
                  <span className="underline">Vincular WhatsApp</span>
                </button>
              )}

              <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground font-medium">{formatNumber(profile.followers_count || 0)}</span>
                  <span className="text-muted-foreground">seguidores</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground font-medium">{profile.posts_count || 0}</span>
                  <span className="text-muted-foreground">posts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground font-medium">{profile.total_audits}</span>
                  <span className="text-muted-foreground">auditorias</span>
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

              {/* Re-Audit Dropdown */}
              {latestAudit && (
                <div className="relative w-full audit-dropdown-container">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowAuditDropdown(!showAuditDropdown)}
                    disabled={isReAuditing || isFreshAuditing}
                    className="w-full justify-between"
                  >
                    {isReAuditing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Re-auditando...
                      </>
                    ) : isFreshAuditing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Scraping novo...
                      </>
                    ) : (
                      <>
                        <span className="flex items-center">
                          <Sparkles className="h-4 w-4 mr-2" />
                          Nova Auditoria
                        </span>
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>

                  {/* Dropdown Menu */}
                  {showAuditDropdown && !isReAuditing && !isFreshAuditing && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-50 overflow-hidden">
                      {/* Opção 1: Re-auditar com contexto (mesmos posts) */}
                      {hasContext && (
                        <button
                          onClick={handleReAudit}
                          className="w-full px-4 py-3 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors border-b border-neutral-200 dark:border-neutral-700"
                        >
                          <div className="flex items-start gap-3">
                            <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="font-medium text-sm text-foreground">
                                Re-auditar com Contexto
                              </div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                Analisa posts antigos com contexto atualizado
                              </div>
                            </div>
                          </div>
                        </button>
                      )}

                      {/* Opção 2: Nova auditoria (scraping fresco) */}
                      <button
                        onClick={handleFreshAudit}
                        className="w-full px-4 py-3 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-sm text-foreground">
                              Nova Auditoria (Scraping)
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              Coleta posts recentes do Instagram + auditoria
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
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

              {/* Brand Kit Button */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push(`/dashboard/profiles/${id}/brand-kit`)}
                className="w-full"
              >
                <Palette className="h-4 w-4 mr-2" />
                Brand Kit
              </Button>

              {/* Edit Profile Button */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowEditModal(true)}
                className="w-full"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Editar Perfil
              </Button>

              {/* Delete Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
                className="text-error-500 hover:text-error-700 dark:hover:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/30 w-full"
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
        <h3 className="text-lg font-semibold text-foreground mb-3">Central de Conteúdo</h3>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">

          {/* Card: Criar Conteúdo */}
          {latestAudit ? (
            <Link href={`/dashboard/audits/${latestAudit.id}/create-content`}>
              <div className="group relative rounded-xl border-2 border-purple-300 dark:border-purple-700 bg-purple-50/80 dark:bg-purple-950/40 p-5 shadow-sm hover:border-purple-400 dark:hover:border-purple-600 hover:bg-purple-100/80 dark:hover:bg-purple-950/60 hover:shadow-md hover:shadow-purple-500/10 transition-all cursor-pointer h-full flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl bg-white dark:bg-purple-900/30 shadow-sm flex items-center justify-center border border-purple-200 dark:border-purple-800">
                    <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-purple-400 dark:text-purple-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Criar Conteúdo</h4>
                  <p className="text-xs text-purple-700/80 dark:text-purple-300/80 leading-relaxed">
                    Gere carrosséis com o Content Squad
                  </p>
                </div>
                {contentCount > 0 && (
                  <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-800">
                    <span className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                      {contentCount} carrossel{contentCount !== 1 ? 'is' : ''} gerado{contentCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ) : (
            <div className="rounded-xl border-2 border-neutral-300 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-800 p-5 opacity-60 flex flex-col h-full">
              <div className="w-10 h-10 rounded-lg bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              </div>
              <h4 className="font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Criar Conteúdo</h4>
              <p className="text-xs text-muted-foreground">Faça uma auditoria primeiro</p>
            </div>
          )}

          {/* Card: Content Distillery */}
          <Link href={`/dashboard/profiles/${id}/distillery`}>
            <div className="group relative rounded-xl border-2 border-orange-300 dark:border-orange-700 bg-orange-50/80 dark:bg-orange-950/40 p-5 shadow-sm hover:border-orange-400 dark:hover:border-orange-600 hover:bg-orange-100/80 dark:hover:bg-orange-950/60 hover:shadow-md hover:shadow-orange-500/10 transition-all cursor-pointer h-full flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-white dark:bg-orange-900/30 shadow-sm flex items-center justify-center border border-orange-200 dark:border-orange-800">
                  <Factory className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <ChevronRight className="w-4 h-4 text-orange-400 dark:text-orange-500 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">Content Distillery</h4>
                <p className="text-xs text-orange-700/80 dark:text-orange-300/80 leading-relaxed">
                  Extraia frameworks e gere 60+ peças de conteúdo
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-orange-200 dark:border-orange-800">
                <span className="text-xs text-orange-700 dark:text-orange-300 font-medium">
                  Pipeline de 6 fases - 9 agentes
                </span>
              </div>
            </div>
          </Link>

          {/* Card: Chat Content Squad */}
          <button
            onClick={() => latestAudit && setShowChatModal(true)}
            disabled={!latestAudit}
            className={`group rounded-xl border-2 text-left p-5 transition-all h-full flex flex-col w-full ${
              latestAudit
                ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/80 dark:bg-emerald-950/40 shadow-sm hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-emerald-100/80 dark:hover:bg-emerald-950/60 hover:shadow-md hover:shadow-emerald-500/10 cursor-pointer'
                : 'border-neutral-300 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-800 opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-11 h-11 rounded-xl shadow-sm flex items-center justify-center border ${
                latestAudit ? 'bg-white dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800' : 'bg-neutral-200 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600'
              }`}>
                <MessageSquare className={`w-5 h-5 ${latestAudit ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-600 dark:text-neutral-400'}`} />
              </div>
              {latestAudit && (
                <ChevronRight className="w-4 h-4 text-emerald-400 dark:text-emerald-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
              )}
            </div>
            <div className="flex-1">
              <h4 className={`font-semibold mb-1 ${latestAudit ? 'text-emerald-900 dark:text-emerald-100' : 'text-neutral-600 dark:text-neutral-400'}`}>
                Content Squad
              </h4>
              <p className={`text-xs leading-relaxed ${latestAudit ? 'text-emerald-700/80 dark:text-emerald-300/80' : 'text-muted-foreground'}`}>
                Chat com os 5 especialistas em conteúdo
              </p>
            </div>
          </button>

          {/* Card: Contexto do Expert */}
          <button
            onClick={() => setShowContextModal(true)}
            className="group rounded-xl border-2 border-amber-300 dark:border-amber-700 bg-amber-50/80 dark:bg-amber-950/40 p-5 shadow-sm hover:border-amber-400 dark:hover:border-amber-600 hover:bg-amber-100/80 dark:hover:bg-amber-950/60 hover:shadow-md hover:shadow-amber-500/10 transition-all cursor-pointer h-full flex flex-col text-left w-full"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-white dark:bg-amber-900/30 shadow-sm flex items-center justify-center border border-amber-200 dark:border-amber-800">
                <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <ChevronRight className="w-4 h-4 text-amber-400 dark:text-amber-500 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Contexto do Expert</h4>
              <p className="text-xs text-amber-700/80 dark:text-amber-300/80 leading-relaxed">
                Informações adicionais sobre o perfil
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-800">
              {hasContext ? (
                <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Contexto configurado
                </span>
              ) : (
                <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                  Clique para adicionar
                </span>
              )}
            </div>
          </button>

          {/* Card: Ver Slides */}
          {latestAudit ? (
            <Link href={`/dashboard/profiles/${id}/slides`}>
              <div className="group relative rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-950/40 p-5 shadow-sm hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-100/80 dark:hover:bg-slate-950/60 hover:shadow-md hover:shadow-slate-500/10 transition-all cursor-pointer h-full flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl bg-white dark:bg-slate-900/30 shadow-sm flex items-center justify-center border border-slate-200 dark:border-slate-800">
                    <ImageIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Ver Slides</h4>
                  <p className="text-xs text-slate-700/80 dark:text-slate-300/80 leading-relaxed">
                    Todos os slides gerados
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    Acesso rápido aos slides
                  </span>
                </div>
              </div>
            </Link>
          ) : (
            <div className="rounded-xl border-2 border-neutral-300 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-800 p-5 opacity-60 flex flex-col h-full">
              <div className="w-10 h-10 rounded-lg bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center mb-3">
                <ImageIcon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              </div>
              <h4 className="font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Ver Slides</h4>
              <p className="text-xs text-muted-foreground">Faça uma auditoria primeiro</p>
            </div>
          )}

          {/* Card: Reel Production Squad */}
          {latestAudit ? (
            <Link href={`/dashboard/profiles/${id}/reels`}>
              <div className="group relative rounded-xl border-2 border-blue-300 dark:border-blue-700 bg-blue-50/80 dark:bg-blue-950/40 p-5 shadow-sm hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-100/80 dark:hover:bg-blue-950/60 hover:shadow-md hover:shadow-blue-500/10 transition-all cursor-pointer h-full flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl bg-white dark:bg-blue-900/30 shadow-sm flex items-center justify-center border border-blue-200 dark:border-blue-800">
                    <Video className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-blue-400 dark:text-blue-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Reel Production</h4>
                  <p className="text-xs text-blue-700/80 dark:text-blue-300/80 leading-relaxed">
                    Transforme carrosséis em vídeos profissionais
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                  <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                    4 agentes - Pipeline completo
                  </span>
                </div>
              </div>
            </Link>
          ) : (
            <div className="rounded-xl border-2 border-neutral-300 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-800 p-5 opacity-60 flex flex-col h-full">
              <div className="w-10 h-10 rounded-lg bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center mb-3">
                <Video className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              </div>
              <h4 className="font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Reel Production</h4>
              <p className="text-xs text-muted-foreground">Faça uma auditoria primeiro</p>
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
                <BookOpen className="h-4 w-4 text-warning-600" />
                Contexto Salvo
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowContextModal(true)}
                className="text-muted-foreground text-xs"
              >
                <Pencil className="h-3.5 w-3.5 mr-1" /> Editar
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Arquivos com extração — sempre visível */}
            {contextData.files && contextData.files.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Documentos ({contextData.files.length})
                </p>
                <div className="space-y-3">
                  {contextData.files.map((file: any, idx: number) => (
                    <div key={idx} className="bg-card rounded-lg px-3 py-3 border-2 border-neutral-300 dark:border-neutral-600">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="h-4 w-4 text-primary-600 dark:text-primary-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
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
                        <p className="text-xs text-foreground bg-background rounded p-2 max-h-32 overflow-y-auto whitespace-pre-wrap leading-relaxed border border-neutral-300 dark:border-neutral-600">
                          {file.extractedText.slice(0, 600)}{file.extractedText.length > 600 ? '…' : ''}
                        </p>
                      ) : file.extractionError ? (
                        <p className="text-xs text-error-700 dark:text-error-400 bg-error-50 dark:bg-error-900/30 rounded p-2">{file.extractionError}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
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
                    className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 hover:text-foreground transition-colors w-full text-left"
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
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                            {label}
                          </p>
                          <p className="text-sm text-foreground bg-card rounded-lg px-3 py-2 whitespace-pre-wrap border-2 border-neutral-300 dark:border-neutral-600">
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
            <div className="text-muted-foreground text-center py-8">
              Nenhuma auditoria encontrada
            </div>
          ) : (
            <div className="space-y-3">
              {sortedAudits.map((audit: any) => (
                <div key={audit.id} className="flex items-center justify-between p-4 rounded-lg border-2 border-neutral-300 dark:border-neutral-600 hover:border-primary-400 dark:hover:border-primary-500 transition-all group bg-card">
                  <Link href={`/dashboard/audits/${audit.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">
                        {formatDate(audit.audit_date)}
                      </div>
                      <div className="text-xs text-muted-foreground">
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
                    className="ml-3 p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-error-700 dark:hover:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/30 opacity-0 group-hover:opacity-100 transition-all"
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

      {/* Twitter Monitoring */}
      <div className="mt-6">
        <TwitterExpertsSection
          profileId={id}
          profileUsername={profile.username}
        />
      </div>

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

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          profileId={id}
          username={currentProfile.username}
          currentGender={currentProfile.gender}
          genderAutoDetected={currentProfile.gender_auto_detected || false}
          genderConfidence={currentProfile.gender_confidence}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleProfileUpdated}
        />
      )}

      {/* Link WhatsApp Modal */}
      {showWhatsAppModal && (
        <LinkWhatsAppModal
          profileId={id}
          profileUsername={currentProfile.username}
          currentPhone={currentProfile.whatsapp_phone}
          isOpen={showWhatsAppModal}
          onClose={() => setShowWhatsAppModal(false)}
          onSuccess={(phone) => {
            setLocalProfile({ ...currentProfile, whatsapp_phone: phone || null })
            handleProfileUpdated()
          }}
        />
      )}
    </div>
  )
}
