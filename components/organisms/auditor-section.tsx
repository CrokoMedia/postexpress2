import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/atoms/card'
import { Badge } from '@/components/atoms/badge'
import { Brain, Pencil, DollarSign, BarChart3, AlertTriangle } from 'lucide-react'

interface AuditorSectionProps {
  auditorName: string
  auditorType: 'behavior' | 'copy' | 'offers' | 'metrics' | 'anomalies'
  score: number
  insights: string[]
  problems?: string[]
  recommendations?: string[]
}

const auditorConfig = {
  behavior: {
    icon: Brain,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    description: 'Análise comportamental da audiência',
  },
  copy: {
    icon: Pencil,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    description: 'Avaliação de copywriting e awareness',
  },
  offers: {
    icon: DollarSign,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    description: 'Força das ofertas e value equation',
  },
  metrics: {
    icon: BarChart3,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    description: 'Análise de métricas e outcomes',
  },
  anomalies: {
    icon: AlertTriangle,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    description: 'Detecção de anomalias e oportunidades',
  },
}

function safeString(item: any): string {
  if (typeof item === 'string') return item
  if (typeof item === 'object' && item !== null) {
    return item.title || item.description || item.text || JSON.stringify(item)
  }
  return String(item)
}

export function AuditorSection({
  auditorName,
  auditorType,
  score,
  insights,
  problems = [],
  recommendations = []
}: AuditorSectionProps) {
  const config = auditorConfig[auditorType]
  const Icon = config.icon

  const getScoreBadge = (score: number) => {
    if (score >= 75) return { variant: 'success' as const, label: 'EXCELENTE' }
    if (score >= 50) return { variant: 'warning' as const, label: 'BOM' }
    return { variant: 'error' as const, label: 'CRÍTICO' }
  }

  const scoreBadge = getScoreBadge(score)

  return (
    <Card className={`border-l-4 ${config.border}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${config.bg}`}>
              <Icon className={`h-5 w-5 ${config.color}`} />
            </div>
            <div>
              <CardTitle className="text-lg">{auditorName}</CardTitle>
              <CardDescription>{config.description}</CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className={`text-3xl font-bold ${config.color}`}>{score}</div>
            <Badge variant={scoreBadge.variant}>{scoreBadge.label}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Insights */}
        {insights.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-neutral-300 mb-2">Insights Principais</h4>
            <ul className="space-y-1">
              {insights.map((insight, index) => (
                <li key={index} className="text-sm text-neutral-400 flex gap-2">
                  <span className="text-primary-500 shrink-0">•</span>
                  <span>{safeString(insight)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Problems */}
        {problems.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-error-500 mb-2">Problemas Críticos</h4>
            <ul className="space-y-1">
              {problems.map((problem, index) => (
                <li key={index} className="text-sm text-neutral-400 flex gap-2">
                  <span className="text-error-500 shrink-0">⚠</span>
                  <span>{safeString(problem)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-success-500 mb-2">Recomendações</h4>
            <ul className="space-y-1">
              {recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-neutral-400 flex gap-2">
                  <span className="text-success-500 shrink-0">✓</span>
                  <span>{safeString(rec)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
