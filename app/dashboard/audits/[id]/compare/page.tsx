'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { PageHeader } from '@/components/molecules/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { Badge } from '@/components/atoms/badge'
import { Skeleton } from '@/components/atoms/skeleton'
import { formatDate, getScoreClassification } from '@/lib/format'
import { ArrowLeft, TrendingUp, TrendingDown, Minus, FileText, Sparkles } from 'lucide-react'

interface Audit {
  id: string
  audit_date: string
  posts_analyzed: number
  score_overall: number
  score_behavior: number
  score_copy: number
  score_offers: number
  score_metrics: number
  score_anomalies: number
  raw_json: any
  profile: any
}

export default function CompareAuditsPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const v1Id = params.id as string
  const v2Id = searchParams.get('v2')

  const [auditV1, setAuditV1] = useState<Audit | null>(null)
  const [auditV2, setAuditV2] = useState<Audit | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!v1Id || !v2Id) {
      setError('Missing audit IDs')
      setLoading(false)
      return
    }

    fetchAudits()
  }, [v1Id, v2Id])

  const fetchAudits = async () => {
    try {
      const [res1, res2] = await Promise.all([
        fetch(`/api/audits/${v1Id}`),
        fetch(`/api/audits/${v2Id}`)
      ])

      if (!res1.ok || !res2.ok) {
        throw new Error('Failed to fetch audits')
      }

      const data1 = await res1.json()
      const data2 = await res2.json()

      setAuditV1(data1.audit)
      setAuditV2(data2.audit)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div>
        <Skeleton className="h-12 w-96 mb-8" />
        <div className="grid gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (error || !auditV1 || !auditV2) {
    return (
      <div>
        <PageHeader title="Comparação de Auditorias" />
        <div className="text-error-500 text-center py-12">
          {error || 'Erro ao carregar auditorias'}
        </div>
      </div>
    )
  }

  const contextUsed = auditV2.raw_json?.context_used

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/dashboard/profiles/${auditV1.profile?.id}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao Perfil
        </Button>
      </div>

      <PageHeader
        title="Comparação de Auditorias"
        description={`@${auditV1.profile?.username} - v1.0 vs v2.0 com Contexto`}
      />

      {/* Context Info */}
      {contextUsed && (
        <Card className="mb-6 bg-primary-500/5 border-primary-500/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-primary-500" />
              <CardTitle className="text-lg">Contexto Utilizado na v2.0</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              {contextUsed.nicho && (
                <div>
                  <span className="text-neutral-400">Nicho:</span>{' '}
                  <span className="text-neutral-200">{contextUsed.nicho}</span>
                </div>
              )}
              {contextUsed.objetivos && (
                <div>
                  <span className="text-neutral-400">Objetivos:</span>{' '}
                  <span className="text-neutral-200">{contextUsed.objetivos}</span>
                </div>
              )}
              {contextUsed.publico_alvo && (
                <div>
                  <span className="text-neutral-400">Público-Alvo:</span>{' '}
                  <span className="text-neutral-200">{contextUsed.publico_alvo}</span>
                </div>
              )}
              {contextUsed.tom_voz && (
                <div>
                  <span className="text-neutral-400">Tom de Voz:</span>{' '}
                  <span className="text-neutral-200">{contextUsed.tom_voz}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overall Score Comparison */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Score Geral</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {/* v1.0 */}
            <div className="text-center">
              <div className="text-sm text-neutral-400 mb-2">v1.0 - Sem Contexto</div>
              <div className={`text-6xl font-bold ${getScoreClassification(auditV1.score_overall).color}`}>
                {auditV1.score_overall}
              </div>
              <div className="text-xs text-neutral-500 mt-2">
                {formatDate(auditV1.audit_date)}
              </div>
            </div>

            {/* Comparison */}
            <div className="flex items-center justify-center">
              <ScoreDifference v1={auditV1.score_overall} v2={auditV2.score_overall} />
            </div>

            {/* v2.0 */}
            <div className="text-center">
              <div className="text-sm text-neutral-400 mb-2">v2.0 - Com Contexto</div>
              <div className={`text-6xl font-bold ${getScoreClassification(auditV2.score_overall).color}`}>
                {auditV2.score_overall}
              </div>
              <div className="text-xs text-neutral-500 mt-2">
                {formatDate(auditV2.audit_date)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dimension Scores Comparison */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Scores por Dimensão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <DimensionComparison
              label="Comportamento"
              v1={auditV1.score_behavior}
              v2={auditV2.score_behavior}
            />
            <DimensionComparison
              label="Copy"
              v1={auditV1.score_copy}
              v2={auditV2.score_copy}
            />
            <DimensionComparison
              label="Ofertas"
              v1={auditV1.score_offers}
              v2={auditV2.score_offers}
            />
            <DimensionComparison
              label="Métricas"
              v1={auditV1.score_metrics}
              v2={auditV2.score_metrics}
            />
            <DimensionComparison
              label="Anomalias"
              v1={auditV1.score_anomalies}
              v2={auditV2.score_anomalies}
            />
          </div>
        </CardContent>
      </Card>

      {/* Side by Side Analysis */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* v1.0 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Auditoria v1.0
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AnalysisSection
              title="Top 3 Forças"
              items={auditV1.raw_json?.top_strengths || []}
              variant="success"
            />
            <AnalysisSection
              title="Problemas Críticos"
              items={auditV1.raw_json?.critical_problems || []}
              variant="error"
            />
            <AnalysisSection
              title="Quick Wins"
              items={auditV1.raw_json?.quick_wins || []}
              variant="warning"
            />
          </CardContent>
        </Card>

        {/* v2.0 */}
        <Card className="border-primary-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary-500" />
              Auditoria v2.0 (Com Contexto)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AnalysisSection
              title="Top 3 Forças"
              items={auditV2.raw_json?.top_strengths || []}
              variant="success"
            />
            <AnalysisSection
              title="Problemas Críticos"
              items={auditV2.raw_json?.critical_problems || []}
              variant="error"
            />
            <AnalysisSection
              title="Quick Wins"
              items={auditV2.raw_json?.quick_wins || []}
              variant="warning"
            />

            {/* Context-specific insights */}
            {auditV2.raw_json?.context_insights && (
              <>
                <div className="border-t border-neutral-700 pt-4 mt-4">
                  <h4 className="font-semibold mb-2 text-primary-400">
                    Insights Baseados no Contexto
                  </h4>
                </div>

                {auditV2.raw_json.context_insights.alignment_score && (
                  <div>
                    <div className="text-sm text-neutral-400 mb-1">Alinhamento com Objetivos</div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-neutral-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500"
                          style={{ width: `${auditV2.raw_json.context_insights.alignment_score}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold">
                        {auditV2.raw_json.context_insights.alignment_score}%
                      </span>
                    </div>
                  </div>
                )}

                {auditV2.raw_json.context_insights.gaps && (
                  <AnalysisSection
                    title="Gaps Identificados"
                    items={auditV2.raw_json.context_insights.gaps}
                    variant="error"
                  />
                )}

                {auditV2.raw_json.context_insights.opportunities && (
                  <AnalysisSection
                    title="Oportunidades"
                    items={auditV2.raw_json.context_insights.opportunities}
                    variant="success"
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <Button
          onClick={() => router.push(`/dashboard/audits/${v1Id}`)}
          variant="secondary"
        >
          Ver Auditoria v1.0 Completa
        </Button>
        <Button
          onClick={() => router.push(`/dashboard/audits/${v2Id}`)}
          variant="primary"
        >
          Ver Auditoria v2.0 Completa
        </Button>
      </div>
    </div>
  )
}

// Helper Components

function ScoreDifference({ v1, v2 }: { v1: number; v2: number }) {
  const diff = v2 - v1
  const isPositive = diff > 0
  const isNeutral = diff === 0

  return (
    <div className="text-center">
      {isNeutral ? (
        <>
          <Minus className="h-8 w-8 mx-auto text-neutral-400 mb-2" />
          <div className="text-sm text-neutral-400">Sem mudança</div>
        </>
      ) : isPositive ? (
        <>
          <TrendingUp className="h-8 w-8 mx-auto text-success-500 mb-2" />
          <div className="text-2xl font-bold text-success-500">+{diff}</div>
          <div className="text-sm text-neutral-400">pontos</div>
        </>
      ) : (
        <>
          <TrendingDown className="h-8 w-8 mx-auto text-error-500 mb-2" />
          <div className="text-2xl font-bold text-error-500">{diff}</div>
          <div className="text-sm text-neutral-400">pontos</div>
        </>
      )}
    </div>
  )
}

function DimensionComparison({ label, v1, v2 }: { label: string; v1: number; v2: number }) {
  const diff = v2 - v1

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{label}</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-neutral-400">v1.0: {v1}</span>
          <span className="text-sm text-neutral-400">→</span>
          <span className="text-sm font-semibold">v2.0: {v2}</span>
          {diff !== 0 && (
            <Badge variant={diff > 0 ? 'success' : 'error'} className="text-xs">
              {diff > 0 ? '+' : ''}{diff}
            </Badge>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-neutral-500"
            style={{ width: `${v1}%` }}
          />
        </div>
        <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${diff > 0 ? 'bg-success-500' : diff < 0 ? 'bg-error-500' : 'bg-neutral-500'}`}
            style={{ width: `${v2}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// Converte item para string renderizável (pode vir como string ou objeto do Claude)
function itemToString(item: any): string {
  if (typeof item === 'string') return item
  if (typeof item === 'object' && item !== null) {
    const emoji = item.emoji ? `${item.emoji} ` : ''
    const title = item.title || ''
    const description = item.description ? `: ${item.description}` : ''
    return `${emoji}${title}${description}`.trim() || JSON.stringify(item)
  }
  return String(item)
}

function AnalysisSection({
  title,
  items,
  variant
}: {
  title: string
  items: any[]
  variant: 'success' | 'error' | 'warning'
}) {
  const colors = {
    success: 'text-success-500',
    error: 'text-error-500',
    warning: 'text-warning-500'
  }

  return (
    <div>
      <h4 className={`text-sm font-semibold mb-2 ${colors[variant]}`}>{title}</h4>
      <ul className="space-y-1 text-sm text-neutral-300">
        {items.length > 0 ? (
          items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-neutral-500">•</span>
              <span>{itemToString(item)}</span>
            </li>
          ))
        ) : (
          <li className="text-neutral-500">Nenhum item encontrado</li>
        )}
      </ul>
    </div>
  )
}
