'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PageHeader } from '@/components/molecules/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { Badge } from '@/components/atoms/badge'
import { Skeleton } from '@/components/atoms/skeleton'
import { Sparkles, Youtube, BarChart3, Loader2, AlertCircle, CheckCircle, FileText, Image as ImageIcon, ArrowLeft, Clock, Brain } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useProfile } from '@/hooks/use-profiles'

type DistilleryMode = 'audit' | 'youtube'

export default function DistilleryPage() {
  const params = useParams()
  const router = useRouter()
  const profileId = params.id as string
  const { profile, isLoading: loadingProfile } = useProfile(profileId)

  const [mode, setMode] = useState<DistilleryMode>('audit')
  const [audits, setAudits] = useState<any[]>([])
  const [loadingAudits, setLoadingAudits] = useState(true)
  const [selectedAuditId, setSelectedAuditId] = useState<string>('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [activeView, setActiveView] = useState<'summary' | 'frameworks' | 'ideas' | 'carousels' | 'calendar'>('summary')
  const [approvingCarousel, setApprovingCarousel] = useState<number | null>(null)

  // Carregar auditorias deste perfil
  useEffect(() => {
    const loadAudits = async () => {
      if (!profileId) return

      try {
        const { data, error } = await supabase
          .from('audits')
          .select(`
            id,
            created_at,
            score_overall
          `)
          .eq('profile_id', profileId)
          .order('created_at', { ascending: false })
          .limit(20)

        if (error) throw error

        const auditsData = (data || []) as Array<{
          id: string
          created_at: string
          score_overall: number
        }>

        setAudits(auditsData)

        // Auto-selecionar a auditoria mais recente
        if (auditsData.length > 0) {
          setSelectedAuditId(auditsData[0].id)
        }
      } catch (err: any) {
        console.error('Erro ao carregar auditorias:', err)
      } finally {
        setLoadingAudits(false)
      }
    }

    loadAudits()
  }, [profileId])

  const handleDistill = async () => {
    setProcessing(true)
    setError(null)
    setResult(null)

    try {
      if (mode === 'audit' && !selectedAuditId) {
        throw new Error('Selecione uma auditoria')
      }

      if (mode === 'youtube' && !youtubeUrl.trim()) {
        throw new Error('Informe a URL do YouTube')
      }

      const response = await fetch('/api/content/distill-youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          audit_id: mode === 'audit' ? selectedAuditId : undefined,
          youtube_url: mode === 'youtube' ? youtubeUrl : undefined
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao processar')
      }

      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      console.error('Erro:', err)
      setError(err.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleApproveCarousel = async (carouselIndex: number) => {
    if (!result || !result.carousels || !result.carousels[carouselIndex]) {
      return
    }

    setApprovingCarousel(carouselIndex)

    try {
      const carousel = result.carousels[carouselIndex]

      // Criar um content_suggestion com apenas este carrossel aprovado
      const response = await fetch('/api/content/approve-distillery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: profileId,
          audit_id: mode === 'audit' ? selectedAuditId : null,
          carousel: carousel,
          source_mode: result.source_mode,
          source_identifier: result.source_identifier
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao aprovar carrossel')
      }

      const data = await response.json()

      // Redirecionar para a página de criar conteúdo
      if (data.audit_id) {
        router.push(`/dashboard/audits/${data.audit_id}/create-content`)
      } else {
        throw new Error('Auditoria não encontrada após aprovação')
      }
    } catch (err: any) {
      console.error('Erro ao aprovar carrossel:', err)
      alert(`Erro: ${err.message}`)
    } finally {
      setApprovingCarousel(null)
    }
  }

  if (loadingProfile || loadingAudits) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64 mb-8" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div>
        <PageHeader title="Erro" />
        <Card>
          <CardContent className="p-8 text-center text-error-500">
            Perfil não encontrado
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={`Content Distillery - @${profile.username}`}
        description="Transforme auditorias ou vídeos do YouTube em frameworks estruturados e 60+ peças de conteúdo"
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: `@${profile.username}`, href: `/dashboard/profiles/${profileId}` },
          { label: 'Content Distillery', href: null }
        ]}
      />

      {/* Seletor de Modo */}
      <div className="flex gap-2 bg-neutral-900 border border-neutral-800 rounded-xl p-1 w-fit">
        <button
          onClick={() => setMode('audit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            mode === 'audit'
              ? 'bg-primary-500/20 text-primary-400'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          A partir de Auditoria
        </button>
        <button
          onClick={() => setMode('youtube')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            mode === 'youtube'
              ? 'bg-primary-500/20 text-primary-400'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
          }`}
        >
          <Youtube className="w-4 h-4" />
          A partir de Vídeo YouTube
        </button>
      </div>

      {/* Modo: Auditoria */}
      {mode === 'audit' && (
        <Card>
          <CardHeader>
            <CardTitle>Selecione uma Auditoria</CardTitle>
            <CardDescription>
              O Distillery vai processar os insights da auditoria e gerar frameworks + conteúdo multiplataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingAudits ? (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : audits.length === 0 ? (
              <div className="text-center py-8 text-neutral-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma auditoria disponível</p>
              </div>
            ) : (
              <div className="space-y-2">
                {audits.map((audit, idx) => (
                  <button
                    key={audit.id}
                    onClick={() => setSelectedAuditId(audit.id)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      selectedAuditId === audit.id
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-neutral-700 bg-neutral-800/50 hover:border-neutral-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-500/20 text-primary-400 font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-semibold">
                            Auditoria {idx === 0 ? '(Mais recente)' : `#${idx + 1}`}
                          </div>
                          <div className="text-xs text-neutral-400">
                            {new Date(audit.created_at).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                      <Badge variant="neutral">Score: {audit.score_overall}</Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selectedAuditId && (
              <Button
                onClick={handleDistill}
                disabled={processing}
                size="lg"
                className="w-full"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processando Pipeline (6 fases)...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Destilar Conteúdo
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modo: YouTube */}
      {mode === 'youtube' && (
        <Card>
          <CardHeader>
            <CardTitle>URL do Vídeo YouTube</CardTitle>
            <CardDescription>
              O Distillery vai baixar o vídeo, extrair transcrição, frameworks e gerar 60+ peças de conteúdo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Cole a URL do YouTube
              </label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-neutral-500 mt-2">
                Funciona com livestreams, keynotes, entrevistas (1-4 horas)
              </p>
            </div>

            <Button
              onClick={handleDistill}
              disabled={processing || !youtubeUrl.trim()}
              size="lg"
              className="w-full"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processando Pipeline (6 fases)...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Destilar Vídeo
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pipeline Progress */}
      {processing && (
        <Card className="border-primary-500/30 bg-gradient-to-br from-primary-500/5 to-primary-500/10">
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
                <span className="font-semibold text-primary-400">Pipeline em execução...</span>
              </div>
              <div className="space-y-2 text-sm text-neutral-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-success-500" />
                  Fase 1: Ingest (download + transcrição)
                </div>
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Fase 2: Extract (frameworks + conhecimento tácito)
                </div>
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Fase 3: Distill (5 camadas de resumo)
                </div>
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Fase 4: Multiply (80+ ideias)
                </div>
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Fase 5: Produce (60+ peças de conteúdo)
                </div>
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Fase 6: Optimize (YouTube SEO)
                </div>
              </div>
              <p className="text-xs text-neutral-500 italic flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Tempo estimado: 3-5 minutos para vídeos curtos, 8-12 minutos para livestreams
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Card className="border-error-500 bg-error-500/10">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-error-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-error-500 mb-1">Erro ao processar</h3>
                <p className="text-neutral-300">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Header de Sucesso */}
          <Card className="border-success-500/30 bg-gradient-to-br from-success-500/5 to-success-500/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-6 h-6 text-success-500" />
                <h3 className="text-xl font-bold text-success-400">Pipeline Concluído!</h3>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-primary-500">{result.frameworks_count || 0}</div>
                  <div className="text-sm text-neutral-400">Frameworks</div>
                </div>
                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-primary-500">{result.ideas_count || 0}</div>
                  <div className="text-sm text-neutral-400">Ideias</div>
                </div>
                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-primary-500">
                    {(result.carousels?.length || 0)}
                  </div>
                  <div className="text-sm text-neutral-400">Carrosséis</div>
                </div>
              </div>

              <p className="text-sm text-neutral-400 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success-500" />
                Processado em {new Date(result.processed_at).toLocaleString('pt-BR')}
              </p>
            </CardContent>
          </Card>

          {/* Navigation Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={activeView === 'summary' ? 'primary' : 'ghost'}
              onClick={() => setActiveView('summary')}
              size="sm"
            >
              <BarChart3 className="w-4 h-4 mr-1.5" />
              Resumo
            </Button>
            <Button
              variant={activeView === 'frameworks' ? 'primary' : 'ghost'}
              onClick={() => setActiveView('frameworks')}
              size="sm"
            >
              <Brain className="w-4 h-4 mr-1.5" />
              Frameworks ({result.frameworks_count || 0})
            </Button>
            <Button
              variant={activeView === 'ideas' ? 'primary' : 'ghost'}
              onClick={() => setActiveView('ideas')}
              size="sm"
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              Ideias ({result.ideas_count || 0})
            </Button>
            <Button
              variant={activeView === 'carousels' ? 'primary' : 'ghost'}
              onClick={() => setActiveView('carousels')}
              size="sm"
            >
              <ImageIcon className="w-4 h-4 mr-1.5" />
              Carrosséis ({result.carousels?.length || 0})
            </Button>
            {result.calendar && (
              <Button
                variant={activeView === 'calendar' ? 'primary' : 'ghost'}
                onClick={() => setActiveView('calendar')}
                size="sm"
              >
                Calendário
              </Button>
            )}
          </div>

          {/* View: Summary */}
          {activeView === 'summary' && result.summary_layers && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary-500" />
                  Progressive Summarization (5 Camadas)
                </CardTitle>
                <CardDescription>Método Tiago Forte - do mais conciso ao mais detalhado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Layer 1 - Tweet */}
                {result.summary_layers.layer_1_tweet && (
                  <div className="bg-neutral-800/30 rounded-lg p-4 border-l-4 border-primary-500">
                    <div className="text-xs font-bold text-primary-400 mb-2">LAYER 1 - TWEET (140 chars)</div>
                    <p className="text-neutral-200">{result.summary_layers.layer_1_tweet}</p>
                  </div>
                )}

                {/* Layer 2 - Thread */}
                {result.summary_layers.layer_2_thread && (
                  <div className="bg-neutral-800/30 rounded-lg p-4 border-l-4 border-primary-400">
                    <div className="text-xs font-bold text-primary-400 mb-2">LAYER 2 - THREAD (3-5 tweets)</div>
                    <p className="text-neutral-200 whitespace-pre-line">{result.summary_layers.layer_2_thread}</p>
                  </div>
                )}

                {/* Layer 3 - Article */}
                {result.summary_layers.layer_3_article && (
                  <div className="bg-neutral-800/30 rounded-lg p-4 border-l-4 border-primary-300">
                    <div className="text-xs font-bold text-primary-400 mb-2">LAYER 3 - ARTICLE (500 palavras)</div>
                    <p className="text-neutral-200 whitespace-pre-line">{result.summary_layers.layer_3_article}</p>
                  </div>
                )}

                {/* Layer 4 - Deep Dive */}
                {result.summary_layers.layer_4_deep_dive && (
                  <div className="bg-neutral-800/30 rounded-lg p-4 border-l-4 border-primary-200">
                    <div className="text-xs font-bold text-primary-400 mb-2">LAYER 4 - DEEP DIVE (1500 palavras)</div>
                    <div className="text-neutral-200 whitespace-pre-line max-h-96 overflow-y-auto">
                      {result.summary_layers.layer_4_deep_dive}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* View: Frameworks */}
          {activeView === 'frameworks' && result.frameworks && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary-500" />
                  Frameworks Extraídos
                </CardTitle>
                <CardDescription>Modelos mentais, heurísticas e processos identificados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.frameworks.map((framework: any, idx: number) => (
                  <div key={idx} className="bg-neutral-800/30 rounded-lg p-5 border border-neutral-700">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-lg font-bold text-neutral-100">{framework.nome}</h4>
                      <Badge variant={
                        framework.categoria === 'mental_model' ? 'info' :
                        framework.categoria === 'heuristic' ? 'warning' : 'neutral'
                      }>
                        {framework.categoria}
                      </Badge>
                    </div>

                    <p className="text-neutral-300 mb-4">{framework.descricao}</p>

                    {framework.componentes && framework.componentes.length > 0 && (
                      <div className="mb-4">
                        <div className="text-xs font-bold text-neutral-400 mb-2">COMPONENTES:</div>
                        <ul className="list-disc list-inside space-y-1 text-sm text-neutral-300">
                          {framework.componentes.map((comp: string, i: number) => (
                            <li key={i}>{comp}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {framework.aplicacao_pratica && (
                      <div className="bg-primary-500/10 rounded-lg p-3 border-l-2 border-primary-500">
                        <div className="text-xs font-bold text-primary-400 mb-1">APLICAÇÃO PRÁTICA:</div>
                        <p className="text-sm text-neutral-300">{framework.aplicacao_pratica}</p>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* View: Ideas */}
          {activeView === 'ideas' && result.ideas && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary-500" />
                  Ideias Geradas (4A Framework)
                </CardTitle>
                <CardDescription>Actionable, Analytical, Aspirational, Anthropological</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.ideas
                  .sort((a: any, b: any) => (b.score || 0) - (a.score || 0))
                  .map((idea: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-neutral-800/30 rounded-lg p-4 border border-neutral-700 hover:border-primary-500/50 transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-neutral-100 flex-1">{idea.titulo}</h4>
                        <div className="flex items-center gap-2 ml-3">
                          <Badge variant="info">{idea.score}/100</Badge>
                          <Badge variant="neutral">{idea.plataforma}</Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={
                          idea.angulo_4a === 'Actionable' ? 'success' :
                          idea.angulo_4a === 'Analytical' ? 'info' :
                          idea.angulo_4a === 'Aspirational' ? 'warning' : 'neutral'
                        }>
                          {idea.angulo_4a}
                        </Badge>
                        <span className="text-xs text-neutral-400">{idea.formato}</span>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}

          {/* View: Carousels */}
          {activeView === 'carousels' && result.carousels && (
            <div className="space-y-6">
              {result.carousels.map((carousel: any, idx: number) => (
                <Card key={idx} className="border-primary-500/20">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle>{carousel.titulo}</CardTitle>
                        <CardDescription>
                          {carousel.slides?.length || 0} slides • {carousel.tipo}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="info">{carousel.tipo}</Badge>
                        <Button
                          onClick={() => handleApproveCarousel(idx)}
                          disabled={approvingCarousel === idx}
                          variant="primary"
                          size="sm"
                          className="whitespace-nowrap"
                        >
                          {approvingCarousel === idx ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Aprovando...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Aprovar e Gerar Slides
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Objetivo */}
                    {carousel.objetivo && (
                      <div className="bg-primary-500/10 rounded-lg p-3 border-l-2 border-primary-500">
                        <div className="text-xs font-bold text-primary-400 mb-1">OBJETIVO:</div>
                        <p className="text-sm text-neutral-300">{carousel.objetivo}</p>
                      </div>
                    )}

                    {/* Baseado em */}
                    {carousel.baseado_em && (
                      <div className="text-xs text-neutral-400">
                        <strong>Baseado em:</strong> {carousel.baseado_em}
                      </div>
                    )}

                    {/* Slides */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-neutral-200">Slides:</h4>
                      {carousel.slides?.map((slide: any, slideIdx: number) => (
                        <div
                          key={slideIdx}
                          className="bg-neutral-800/30 rounded-lg p-4 border border-neutral-700"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 text-xs font-bold">
                              {slide.numero}
                            </div>
                            <Badge variant="neutral">{slide.tipo}</Badge>
                          </div>

                          {slide.titulo && (
                            <h5 className="font-bold text-neutral-100 mb-2">{slide.titulo}</h5>
                          )}

                          {slide.corpo && (
                            <p className="text-sm text-neutral-300 mb-2 whitespace-pre-line">{slide.corpo}</p>
                          )}

                          {slide.notas_design && (
                            <div className="text-xs text-neutral-500 italic mt-2">
                              Design: {slide.notas_design}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Caption */}
                    {carousel.caption && (
                      <div className="bg-neutral-800/30 rounded-lg p-4 border border-neutral-700">
                        <div className="text-xs font-bold text-neutral-400 mb-2">CAPTION:</div>
                        <p className="text-sm text-neutral-300 whitespace-pre-line">{carousel.caption}</p>
                      </div>
                    )}

                    {/* Hashtags */}
                    {carousel.hashtags && carousel.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {carousel.hashtags.map((tag: string, i: number) => (
                          <Badge key={i} variant="neutral">#{tag}</Badge>
                        ))}
                      </div>
                    )}

                    {/* CTA */}
                    {carousel.cta && (
                      <div className="bg-success-500/10 rounded-lg p-3 border-l-2 border-success-500">
                        <div className="text-xs font-bold text-success-400 mb-1">CALL TO ACTION:</div>
                        <p className="text-sm text-neutral-300">{carousel.cta}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* View: Calendar */}
          {activeView === 'calendar' && result.calendar && (
            <Card>
              <CardHeader>
                <CardTitle>Calendário Editorial (4 Semanas)</CardTitle>
                <CardDescription>Plano de publicação sugerido</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(result.calendar).map(([semana, posts]: [string, any]) => (
                  <div key={semana} className="bg-neutral-800/30 rounded-lg p-4 border border-neutral-700">
                    <h4 className="font-bold text-neutral-100 mb-3 capitalize">
                      {semana.replace('_', ' ')}
                    </h4>
                    <div className="space-y-2">
                      {Array.isArray(posts) && posts.map((postId: string, idx: number) => (
                        <div key={idx} className="text-sm text-neutral-300 pl-4 border-l-2 border-primary-500/30">
                          {postId}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Info Cards */}
      {!processing && !result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-neutral-700">
            <CardHeader>
              <CardTitle className="text-base">Pipeline de 6 Fases</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li>✓ <strong>Ingest:</strong> Download + transcrição</li>
                <li>✓ <strong>Extract:</strong> Frameworks + conhecimento tácito</li>
                <li>✓ <strong>Distill:</strong> 5 camadas de resumo (PARA)</li>
                <li>✓ <strong>Multiply:</strong> 4A Framework (80+ ideias)</li>
                <li>✓ <strong>Produce:</strong> 60+ peças multiplataforma</li>
                <li>✓ <strong>Optimize:</strong> YouTube SEO</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-neutral-700">
            <CardHeader>
              <CardTitle className="text-base">9 Agentes Especializados</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li><strong>Cedric Chin:</strong> Conhecimento tácito</li>
                <li><strong>Shane Parrish:</strong> Modelos mentais</li>
                <li><strong>Tiago Forte:</strong> Progressive Summarization</li>
                <li><strong>Gary Vaynerchuk:</strong> Reverse Pyramid</li>
                <li><strong>Nicolas Cole & Dickie Bush:</strong> 4A Framework</li>
                <li><strong>Dan Koe:</strong> Content Ecosystem</li>
                <li><strong>Justin Welsh:</strong> Batch Production</li>
                <li><strong>Paddy Galloway:</strong> YouTube Strategy</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
