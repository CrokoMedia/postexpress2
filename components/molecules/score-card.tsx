import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card'
import { cn } from '@/lib/utils'

interface ScoreCardProps {
  title: string
  score: number
  icon?: React.ReactNode
  description?: string
  className?: string
}

export function ScoreCard({ title, score, icon, description, className }: ScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-success-500'
    if (score >= 50) return 'text-warning-500'
    return 'text-error-500'
  }

  const getScoreGradient = (score: number) => {
    if (score >= 75) return 'from-success-500/20 to-success-500/5'
    if (score >= 50) return 'from-warning-500/20 to-warning-500/5'
    return 'from-error-500/20 to-error-500/5'
  }

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      {/* Gradient background */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br opacity-50',
        getScoreGradient(score)
      )} />

      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium text-neutral-300">
            {title}
          </CardTitle>
          {icon && (
            <div className="text-neutral-400">
              {icon}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className={cn('text-5xl font-bold mb-2', getScoreColor(score))}>
          {score}
        </div>
        {description && (
          <p className="text-sm text-neutral-400">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
