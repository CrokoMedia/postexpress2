'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAudit } from '@/hooks/use-audit'
import { PageHeader } from '@/components/molecules/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { Skeleton } from '@/components/atoms/skeleton'
import { Badge } from '@/components/atoms/badge'
import {
  Video, ArrowLeft, Image as ImageIcon, Sparkles, Loader2,
  CheckCircle, XCircle, Copy, Check, Maximize2, Clock, Mic
} from 'lucide-react'

export default function ReelsPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { audit, isLoading, isError } = useAudit(id)

  const [generating, setGenerating] = useState(false)
  const [reels, setReels] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loadingExisting, setLoadingExisting] = useState(true)
  const [approvingReel, setApprovingReel] = useState<number | null>(null)
  const [customTheme, setCustomTheme] = useState('')
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  // Carregar reels existentes
  useEffect(() => {
    const load = async () => {
      if (!id) return
      try {
        const res = await fetch(`/api/audits/${id}/content`)
        if (res.ok) {
          const data = await res.json()
          if (data.reels) {
            setReels(data.reels)
          }
        }
      } catch (err) {
        console.error('Erro ao carregar reels:', err)
      } finally {
        setLoadingExisting(false)
      }
    }
    load()
  }, [id])

  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch(`/api/audits/${id}/generate-reels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ custom_theme: customTheme.trim() || null })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao gerar reels')
      }
      const data = await res.json()
      setReels(data.reels)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  const handleApprove = async (reelIndex: number, approved: boolean) => {
    setApprovingReel(reelIndex)
    try {
      const res = await fetch(`/api/content/${id}/approve-reel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reelIndex, approved })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao atualizar aprovação')
      }
      setReels((prev: any) => {
        if (!prev) return prev
        const next = { ...prev }
        next.reels[reelIndex].approved = approved
        return next
      })
    } catch (err: any) {
      alert(`Erro: ${err.message}`)
    } finally {
      setApprovingReel(null)
    }
  }

  const handleCopyBriefing = (reel: any, index: number) => {
    const text = [
      `🎬 ${reel.titulo}`,
      `⏱ Duração: ${reel.duracao_sugerida}`,
      ``,
      `🎙 HOOK (primeira frase):`,
      `"${reel.hook_verbal}"`,
      ``,
      `📋 TÓPICOS:`,
      ...reel.topicos.map((t: string, i: number) => `${i + 1}. ${t}`),
      ``,
      `✅ CTA FINAL:`,
      reel.cta_final,
      ``,
      `💡 DICA DE GRAVAÇÃO:`,
      reel.dica_gravacao
    ].join('\n')

    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

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
      <div>
        <Button
          variant="ghost"
          onClick={() => router.push(`/dashboard/audits/${id}/create-content`)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Carrosséis
        </Button>
        <PageHeader
          title={`Ideias de Reels — @${audit.profile.username}`}
          description="Tópicos para gravar — sem roteiro, sem travar"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-neutral-900 border border-neutral-800 rounded-xl p-1 w-fit">
        <Link
          href={`/dashboard/audits/${id}/create-content`}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 font-medium text-sm transition-all"
        >
          <ImageIcon className="w-4 h-4" />
          Carrosséis
        </Link>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500/20 text-primary-400 font-medium text-sm">
          <Video className="w-4 h-4" />
          Reels
        </div>
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

      {/* Tema Personalizado + Botão Gerar */}
      {!reels && (
        <Card className="border-primary-500/30 bg-neutral-900/50">
          <CardHeader>
            <CardTitle className="text-lg">Tema Personalizado (Opcional)</CardTitle>
            <CardDescription>
              Defina um tema específico ou deixe vazio para gerar baseado na auditoria
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              value={customTheme}
              onChange={(e) => setCustomTheme(e.target.value)}
              placeholder="Ex: Reels sobre bastidores da minha rotina de criação de conteúdo..."
              rows={3}
              maxLength={500}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-500">{customTheme.length}/500</span>
              <Button onClick={handleGenerate} disabled={generating} size="lg">
                <Sparkles className="w-5 h-5 mr-2" />
                {generating ? 'Gerando...' : 'Gerar Ideias de Reels'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {generating && (
        <Card>
          <CardContent className="p-12 text-center">
            <Video className="w-12 h-12 mx-auto mb-4 text-primary-500 animate-pulse" />
            <h3 className="text-xl font-semibold mb-2">Content Squad gerando tópicos...</h3>
            <p className="text-neutral-400">
              As 5 mentes estão criando ideias de Reels acionáveis baseadas na auditoria
            </p>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Card className="border-error-500">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-error-500 mb-2">Erro ao gerar</h3>
            <p className="text-neutral-300">{error}</p>
            <Button onClick={handleGenerate} className="mt-4">Tentar Novamente</Button>
          </CardContent>
        </Card>
      )}

      {/* Lista de Reels */}
      {reels && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Ideias de Reels</h2>
            <Button onClick={handleGenerate} disabled={generating} variant="secondary">
              <Sparkles className="w-4 h-4 mr-2" />
              Gerar Novas Ideias
            </Button>
          </div>

          <div className="space-y-6">
            {reels.reels?.map((reel: any, index: number) => (
              <Card
                key={index}
                className={`border-2 transition-all ${
                  reel.approved === true
                    ? 'border-success-500/50 bg-success-500/5'
                    : reel.approved === false
                    ? 'border-error-500/30 bg-error-500/5 opacity-60'
                    : 'border-primary-500/20'
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <CardTitle className="text-xl">{reel.titulo}</CardTitle>
                        <div className="flex items-center gap-1 text-xs text-neutral-400">
                          <Clock className="w-3 h-3" />
                          {reel.duracao_sugerida}
                        </div>
                        {reel.approved === true && (
                          <Badge variant="success" className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Aprovado
                          </Badge>
                        )}
                        {reel.approved === false && (
                          <Badge variant="error" className="flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            Rejeitado
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Botões de ação */}
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant={reel.approved === true ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => handleApprove(index, true)}
                        disabled={approvingReel === index || reel.approved === true}
                        className={reel.approved === true ? 'bg-success-500 hover:bg-success-600' : ''}
                      >
                        {approvingReel === index ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        <span className="ml-1">Aprovar</span>
                      </Button>
                      <Button
                        variant={reel.approved === false ? 'danger' : 'secondary'}
                        size="sm"
                        onClick={() => handleApprove(index, false)}
                        disabled={approvingReel === index || reel.approved === false}
                      >
                        {approvingReel === index ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        <span className="ml-1">Rejeitar</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5">
                  {/* Hook verbal */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Mic className="w-4 h-4 text-primary-400" />
                      <h4 className="font-semibold text-primary-400">Hook de Abertura</h4>
                      <span className="text-xs text-neutral-500">(primeira frase falada)</span>
                    </div>
                    <Card className="bg-primary-500/10 border-primary-500/30">
                      <CardContent className="p-4">
                        <p className="text-primary-200 font-medium text-lg italic">
                          &ldquo;{reel.hook_verbal}&rdquo;
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Tópicos */}
                  <div>
                    <h4 className="font-semibold mb-3">Tópicos para Falar</h4>
                    <div className="space-y-2">
                      {reel.topicos?.map((topico: string, ti: number) => (
                        <div key={ti} className="flex items-start gap-3 bg-neutral-800/60 rounded-lg px-4 py-3">
                          <span className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                            {ti + 1}
                          </span>
                          <p className="text-neutral-200">{topico}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Final */}
                  <div>
                    <h4 className="font-semibold mb-2">CTA Final</h4>
                    <Card className="bg-neutral-800/50">
                      <CardContent className="p-4">
                        <p className="text-neutral-200">{reel.cta_final}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Dica de Gravação */}
                  <div className="flex items-start gap-2 bg-warning-500/10 border border-warning-500/20 rounded-lg px-4 py-3">
                    <span className="text-warning-400 text-lg">💡</span>
                    <div>
                      <span className="text-xs font-semibold text-warning-400 uppercase tracking-wide">Dica de Gravação</span>
                      <p className="text-neutral-300 text-sm mt-0.5">{reel.dica_gravacao}</p>
                    </div>
                  </div>

                  {/* Caption e Hashtags */}
                  <details className="group">
                    <summary className="cursor-pointer text-sm font-medium text-neutral-400 hover:text-neutral-200 transition-colors">
                      Ver caption e hashtags ▾
                    </summary>
                    <div className="mt-3 space-y-3">
                      <div>
                        <h5 className="text-sm font-medium text-neutral-400 mb-1">Caption</h5>
                        <Card className="bg-neutral-800/50">
                          <CardContent className="p-3">
                            <p className="text-neutral-300 whitespace-pre-wrap text-sm">{reel.caption}</p>
                          </CardContent>
                        </Card>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-neutral-400 mb-2">Hashtags</h5>
                        <div className="flex flex-wrap gap-2">
                          {reel.hashtags?.map((tag: string, hi: number) => (
                            <Badge key={hi} variant="neutral">#{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </details>

                  {/* Briefing de Gravação (quando aprovado) */}
                  {reel.approved === true && (
                    <div className="border-t border-success-500/30 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-success-400 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Briefing para Gravação
                        </h4>
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleCopyBriefing(reel, index)}
                          >
                            {copiedIndex === index ? (
                              <><Check className="w-4 h-4 mr-1" />Copiado!</>
                            ) : (
                              <><Copy className="w-4 h-4 mr-1" />Copiar Briefing</>
                            )}
                          </Button>
                          <Link
                            href={`/teleprompter/${id}/${index}`}
                            target="_blank"
                          >
                            <Button variant="primary" size="sm">
                              <Maximize2 className="w-4 h-4 mr-1" />
                              Modo Teleprompter
                            </Button>
                          </Link>
                        </div>
                      </div>

                      {/* Preview do briefing */}
                      <Card className="bg-neutral-900 border-neutral-700">
                        <CardContent className="p-4 space-y-3">
                          <div>
                            <span className="text-xs font-semibold text-neutral-500 uppercase">Hook</span>
                            <p className="text-white font-medium mt-1">&ldquo;{reel.hook_verbal}&rdquo;</p>
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-neutral-500 uppercase">Tópicos</span>
                            <ol className="mt-1 space-y-1">
                              {reel.topicos?.map((t: string, ti: number) => (
                                <li key={ti} className="text-neutral-200 text-sm flex gap-2">
                                  <span className="text-primary-400 font-bold">{ti + 1}.</span>
                                  {t}
                                </li>
                              ))}
                            </ol>
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-neutral-500 uppercase">CTA</span>
                            <p className="text-neutral-200 text-sm mt-1">{reel.cta_final}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
