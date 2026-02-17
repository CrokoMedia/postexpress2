'use client'

import { PageHeader } from '@/components/molecules/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card'
import { Badge } from '@/components/atoms/badge'
import { ScoreCard } from '@/components/molecules/score-card'
import { AuditorSection } from '@/components/organisms/auditor-section'
import { PostCard } from '@/components/molecules/post-card'
import { Skeleton } from '@/components/atoms/skeleton'
import { useAudit } from '@/hooks/use-audit'
import { getScoreClassification, formatNumber } from '@/lib/format'
import { useParams } from 'next/navigation'
import { Brain, Pencil, DollarSign, BarChart3, AlertTriangle, TrendingUp, Users, Heart, MessageCircle, Download, Sparkles, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/atoms/button'

export default function AuditPage() {
  const params = useParams()
  const id = params.id as string
  const { audit, isLoading, isError } = useAudit(id)

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`/api/audits/${id}/pdf`)
      if (!response.ok) throw new Error('Erro ao gerar PDF')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `auditoria-${audit?.profile.username}-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Erro ao baixar PDF:', error)
      alert('Erro ao gerar PDF. Tente novamente.')
    }
  }

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid grid-cols-5 gap-4 mb-8">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  if (isError || !audit) {
    return (
      <div>
        <PageHeader title="Auditoria não encontrada" />
        <div className="text-error-500 text-center py-12">
          Erro ao carregar auditoria
        </div>
      </div>
    )
  }

  const classification = getScoreClassification(audit.score_overall || 0)

  // Debug: verificar estrutura do raw_json
  console.log('🔍 Audit raw_json:', {
    has_auditors_analysis: !!audit.raw_json?.auditors_analysis,
    has_top_strengths: !!audit.raw_json?.top_strengths,
    has_critical_problems: !!audit.raw_json?.critical_problems,
    behavior_findings: audit.raw_json?.auditors_analysis?.behavior?.key_findings?.length || 0,
    raw_json_keys: Object.keys(audit.raw_json || {})
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-8">
        <PageHeader
          title={`Auditoria - @${audit.profile.username}`}
          description={new Date(audit.audit_date).toLocaleDateString('pt-BR', {
            dateStyle: 'full'
          })}
        />
        <div className="flex gap-2">
          <Button
            onClick={() => window.location.href = `/dashboard/audits/${id}/slides`}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <ImageIcon className="w-4 h-4" />
            Ver Slides
          </Button>
          <Button
            onClick={() => window.location.href = `/dashboard/audits/${id}/create-content`}
            variant="primary"
            className="flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Criar Conteúdo
          </Button>
          <Button onClick={handleDownloadPDF} variant="secondary" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Baixar PDF
          </Button>
        </div>
      </div>

      {/* Overall Score & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-gradient-to-br from-primary-500/10 to-primary-500/5 border-primary-500/20">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-bold mb-2">Score Geral</h2>
                <div className="flex items-center gap-3">
                  <Badge variant={
                    (audit.score_overall || 0) >= 75 ? 'success' :
                    (audit.score_overall || 0) >= 50 ? 'warning' :
                    'error'
                  }>
                    {classification.label}
                  </Badge>
                </div>
              </div>
              <div className={`text-8xl font-bold ${classification.color}`}>
                {audit.score_overall}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts Analyzed Card */}
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="p-8 flex flex-col items-center justify-center h-full">
            <div className="text-sm text-neutral-400 mb-2">Posts Analisados</div>
            <div className="text-6xl font-bold text-blue-500 mb-2">
              {audit.posts_analyzed}
            </div>
            <Badge variant={
              (audit.posts_analyzed || 0) >= 10 ? 'success' :
              (audit.posts_analyzed || 0) >= 5 ? 'warning' :
              'error'
            }>
              {(audit.posts_analyzed || 0) >= 10 ? 'Amostra Ideal' :
               (audit.posts_analyzed || 0) >= 5 ? 'Amostra Mínima' :
               'Dados Insuficientes'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Warning for insufficient data */}
      {(audit.posts_analyzed || 0) < 10 && (
        <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-yellow-600 mb-2">
                  ⚠️ Análise com Dados {(audit.posts_analyzed || 0) < 5 ? 'Insuficientes' : 'Limitados'}
                </h3>
                <p className="text-sm text-neutral-300">
                  {(audit.posts_analyzed || 0) < 5 ? (
                    <>Esta auditoria foi realizada com apenas <strong>{audit.posts_analyzed} posts</strong>, o que é considerado insuficiente para uma avaliação precisa. <strong>O score máximo possível foi limitado a {(audit.posts_analyzed || 0) < 3 ? '30' : '45'} pontos.</strong> Para uma análise mais confiável, recomendamos auditar no mínimo 10 posts.</>
                  ) : (
                    <>Esta auditoria foi realizada com <strong>{audit.posts_analyzed} posts</strong>. Para uma avaliação mais precisa e completa, recomendamos analisar no mínimo 10 posts. Scores acima de {(audit.posts_analyzed || 0) >= 8 ? '75' : '60'} podem estar limitados pela quantidade de dados.</>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dimension Scores */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Pontuação por Dimensão</h3>
        <div className="grid grid-cols-5 gap-4">
          <ScoreCard
            title="Comportamento"
            score={audit.score_behavior || 0}
            icon={<Brain className="h-5 w-5" />}
            description="Audiência"
          />
          <ScoreCard
            title="Copy"
            score={audit.score_copy || 0}
            icon={<Pencil className="h-5 w-5" />}
            description="Copywriting"
          />
          <ScoreCard
            title="Ofertas"
            score={audit.score_offers || 0}
            icon={<DollarSign className="h-5 w-5" />}
            description="Value Equation"
          />
          <ScoreCard
            title="Métricas"
            score={audit.score_metrics || 0}
            icon={<BarChart3 className="h-5 w-5" />}
            description="Outcomes"
          />
          <ScoreCard
            title="Anomalias"
            score={audit.score_anomalies || 0}
            icon={<AlertTriangle className="h-5 w-5" />}
            description="Oportunidades"
          />
        </div>
      </div>

      {/* Engagement Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas de Engajamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-6">
            <div>
              <div className="flex items-center gap-2 text-neutral-400 mb-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Taxa de Engajamento</span>
              </div>
              <div className="text-3xl font-bold text-primary-500">
                {audit.engagement_rate?.toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-neutral-400 mb-2">
                <Heart className="h-4 w-4" />
                <span className="text-sm">Total de Likes</span>
              </div>
              <div className="text-3xl font-bold text-neutral-300">
                {formatNumber(audit.total_likes || 0)}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-neutral-400 mb-2">
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm">Total de Comentários</span>
              </div>
              <div className="text-3xl font-bold text-neutral-300">
                {formatNumber(audit.total_comments || 0)}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-neutral-400 mb-2">
                <Users className="h-4 w-4" />
                <span className="text-sm">Seguidores (snapshot)</span>
              </div>
              <div className="text-3xl font-bold text-neutral-300">
                {formatNumber(audit.snapshot_followers || 0)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Strengths */}
      {audit.raw_json?.top_strengths && audit.raw_json.top_strengths.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">💪 Pontos Fortes</h3>
          <div className="grid gap-4">
            {audit.raw_json.top_strengths.map((strength: any, index: number) => (
              <Card key={index} className="border-l-4 border-success-500 bg-success-500/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">{strength.emoji}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-success-400 mb-1">
                        #{strength.rank} {strength.title}
                      </h4>
                      <p className="text-sm text-neutral-300">{strength.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Critical Problems */}
      {audit.raw_json?.critical_problems && audit.raw_json.critical_problems.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">⚠️ Problemas Críticos</h3>
          <div className="grid gap-4">
            {audit.raw_json.critical_problems.map((problem: any, index: number) => (
              <Card key={index} className="border-l-4 border-error-500 bg-error-500/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">{problem.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-error-400">
                          #{problem.rank} {problem.title}
                        </h4>
                        {problem.severity && (
                          <Badge variant="error" className="text-xs">
                            {problem.severity}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-neutral-300">{problem.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Quick Wins */}
      {audit.raw_json?.quick_wins && audit.raw_json.quick_wins.length > 0 && (
        <Card className="bg-gradient-to-br from-primary-500/10 to-primary-500/5 border-primary-500/20">
          <CardHeader>
            <CardTitle>⚡ Quick Wins - Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {audit.raw_json.quick_wins.map((win: any, index: number) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-primary-500 font-bold shrink-0">{index + 1}.</span>
                  <span className="text-neutral-300">
                    {typeof win === 'string' ? win : win?.title || win?.description || JSON.stringify(win)}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Auditors Analysis */}
      <div>
        <h3 className="text-xl font-semibold mb-4">🔍 Análise Detalhada dos Auditores</h3>
        <div className="space-y-4">
          <AuditorSection
            auditorName="Daniel Kahneman"
            auditorType="behavior"
            score={audit.score_behavior || 0}
            insights={audit.raw_json?.auditors_analysis?.behavior?.key_findings || []}
            recommendations={audit.raw_json?.auditors_analysis?.behavior?.recommendations || []}
          />
          <AuditorSection
            auditorName="Eugene Schwartz"
            auditorType="copy"
            score={audit.score_copy || 0}
            insights={audit.raw_json?.auditors_analysis?.copy?.key_findings || []}
            recommendations={audit.raw_json?.auditors_analysis?.copy?.recommendations || []}
          />
          <AuditorSection
            auditorName="Alex Hormozi"
            auditorType="offers"
            score={audit.score_offers || 0}
            insights={audit.raw_json?.auditors_analysis?.offers?.key_findings || []}
            recommendations={audit.raw_json?.auditors_analysis?.offers?.recommendations || []}
          />
          <AuditorSection
            auditorName="Marty Cagan"
            auditorType="metrics"
            score={audit.score_metrics || 0}
            insights={audit.raw_json?.auditors_analysis?.metrics?.key_findings || []}
            recommendations={audit.raw_json?.auditors_analysis?.metrics?.recommendations || []}
          />
          <AuditorSection
            auditorName="Paul Graham"
            auditorType="anomalies"
            score={audit.score_anomalies || 0}
            insights={audit.raw_json?.auditors_analysis?.anomalies?.key_findings || []}
            recommendations={audit.raw_json?.auditors_analysis?.anomalies?.opportunities || []}
          />
        </div>
      </div>

      {/* Posts */}
      {audit.posts && audit.posts.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Posts Analisados ({audit.posts.length})</h3>
          <div className="grid grid-cols-3 gap-4">
            {audit.posts.slice(0, 9).map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          {audit.posts.length > 9 && (
            <div className="text-center mt-4 text-neutral-400 text-sm">
              +{audit.posts.length - 9} posts
            </div>
          )}
        </div>
      )}
    </div>
  )
}
