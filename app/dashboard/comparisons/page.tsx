'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/molecules/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card'
import { Badge } from '@/components/atoms/badge'
import { Button } from '@/components/atoms/button'
import { Skeleton } from '@/components/atoms/skeleton'
import { formatDate } from '@/lib/format'
import { TrendingUp, TrendingDown, Minus, GitCompare, ArrowRight } from 'lucide-react'

interface Comparison {
  id: string
  days_between: number
  date_before: string
  date_after: string
  improvement_overall: number
  improvement_behavior: number
  improvement_copy: number
  improvement_offers: number
  improvement_metrics: number
  improvement_anomalies: number
  growth_followers: number
  growth_followers_pct: number
  profile: {
    id: string
    username: string
    full_name: string | null
    profile_pic_url: string | null
  }
  audit_before: { id: string; score_overall: number }
  audit_after: { id: string; score_overall: number }
}

export default function ComparisonsPage() {
  const router = useRouter()
  const [comparisons, setComparisons] = useState<Comparison[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchComparisons()
  }, [])

  const fetchComparisons = async () => {
    try {
      const res = await fetch('/api/comparisons')
      if (!res.ok) throw new Error('Erro ao carregar comparações')
      const data = await res.json()
      setComparisons(data.comparisons || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Comparações"
          description="Acompanhe a evolução dos perfis entre auditorias"
        />
        <div className="space-y-4 mt-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Comparações" />
        <div className="text-error-500 text-center py-12">{error}</div>
      </div>
    )
  }

  if (comparisons.length === 0) {
    return (
      <div>
        <PageHeader
          title="Comparações"
          description="Acompanhe a evolução dos perfis entre auditorias"
        />
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <GitCompare className="h-12 w-12 text-neutral-600 mb-4" />
            <h3 className="text-lg font-semibold text-neutral-300 mb-2">
              Nenhuma comparação ainda
            </h3>
            <p className="text-neutral-500 max-w-md">
              As comparações são criadas automaticamente quando você faz uma re-auditoria de um perfil.
              Vá até um perfil, adicione contexto e clique em &quot;Re-Auditar com Contexto&quot;.
            </p>
            <Button
              variant="primary"
              className="mt-6"
              onClick={() => router.push('/dashboard')}
            >
              Ver Perfis
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Comparações"
        description={`${comparisons.length} comparação${comparisons.length !== 1 ? 'ões' : ''} registrada${comparisons.length !== 1 ? 's' : ''}`}
      />

      <div className="space-y-4 mt-6">
        {comparisons.map((comparison) => {
          const diff = comparison.improvement_overall
          const isPositive = diff > 0
          const isNeutral = diff === 0

          return (
            <Card key={comparison.id} className="hover:border-neutral-600 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base">
                      @{comparison.profile?.username}
                    </CardTitle>
                    {comparison.profile?.full_name && (
                      <span className="text-sm text-neutral-400">
                        {comparison.profile.full_name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="neutral" className="text-xs">
                      {comparison.days_between} dias entre auditorias
                    </Badge>
                    <ImprovementBadge diff={diff} />
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* Score comparison */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-neutral-300">
                      {comparison.audit_before?.score_overall ?? '—'}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {formatDate(comparison.date_before)}
                    </div>
                    <div className="text-xs text-neutral-500">v1.0</div>
                  </div>

                  <ArrowRight className="h-5 w-5 text-neutral-600 flex-shrink-0" />

                  <div className="text-center">
                    <div className={`text-2xl font-bold ${isPositive ? 'text-success-500' : isNeutral ? 'text-neutral-300' : 'text-error-500'}`}>
                      {comparison.audit_after?.score_overall ?? '—'}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {formatDate(comparison.date_after)}
                    </div>
                    <div className="text-xs text-neutral-500">v2.0</div>
                  </div>

                  <div className="flex-1 grid grid-cols-5 gap-2 ml-4">
                    <MiniScore label="Comportamento" value={comparison.improvement_behavior} />
                    <MiniScore label="Copy" value={comparison.improvement_copy} />
                    <MiniScore label="Ofertas" value={comparison.improvement_offers} />
                    <MiniScore label="Métricas" value={comparison.improvement_metrics} />
                    <MiniScore label="Anomalias" value={comparison.improvement_anomalies} />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
                  {comparison.growth_followers !== 0 && (
                    <span className="text-xs text-neutral-500">
                      Seguidores: {comparison.growth_followers > 0 ? '+' : ''}{comparison.growth_followers}
                      {comparison.growth_followers_pct !== 0 && (
                        <span className={comparison.growth_followers_pct > 0 ? 'text-success-500 ml-1' : 'text-error-500 ml-1'}>
                          ({comparison.growth_followers_pct > 0 ? '+' : ''}{comparison.growth_followers_pct.toFixed(1)}%)
                        </span>
                      )}
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto"
                    onClick={() =>
                      router.push(
                        `/dashboard/audits/${comparison.audit_before?.id}/compare?v2=${comparison.audit_after?.id}`
                      )
                    }
                  >
                    <GitCompare className="h-4 w-4 mr-2" />
                    Ver Comparação Detalhada
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function ImprovementBadge({ diff }: { diff: number }) {
  if (diff === 0) {
    return (
      <Badge variant="neutral" className="flex items-center gap-1">
        <Minus className="h-3 w-3" />
        Sem mudança
      </Badge>
    )
  }
  if (diff > 0) {
    return (
      <Badge variant="success" className="flex items-center gap-1">
        <TrendingUp className="h-3 w-3" />
        +{diff} pontos
      </Badge>
    )
  }
  return (
    <Badge variant="error" className="flex items-center gap-1">
      <TrendingDown className="h-3 w-3" />
      {diff} pontos
    </Badge>
  )
}

function MiniScore({ label, value }: { label: string; value: number }) {
  const color = value > 0 ? 'text-success-500' : value < 0 ? 'text-error-500' : 'text-neutral-400'
  return (
    <div className="text-center">
      <div className={`text-sm font-semibold ${color}`}>
        {value > 0 ? '+' : ''}{value}
      </div>
      <div className="text-xs text-neutral-500 truncate">{label}</div>
    </div>
  )
}
