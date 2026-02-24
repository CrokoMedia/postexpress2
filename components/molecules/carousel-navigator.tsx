'use client'

import { Button } from '@/components/atoms/button'
import { Badge } from '@/components/atoms/badge'
import { Progress } from '@/components/atoms/progress'
import { ChevronLeft, ChevronRight, CheckCircle, XCircle } from 'lucide-react'

interface CarouselNavigatorProps {
  currentIndex: number
  total: number
  carouselTitles: string[]
  approvedIndices: Set<number>
  rejectedIndices?: Set<number>
  onNavigate: (direction: 'prev' | 'next') => void
  onGoTo: (index: number) => void
}

export function CarouselNavigator({
  currentIndex,
  total,
  carouselTitles,
  approvedIndices,
  rejectedIndices = new Set(),
  onNavigate,
  onGoTo
}: CarouselNavigatorProps) {
  const progress = ((currentIndex + 1) / total) * 100

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-600 dark:text-neutral-400">
            Carrossel {currentIndex + 1} de {total}
          </span>
          <span className="text-neutral-600 dark:text-neutral-400">
            {approvedIndices.size} aprovados
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onNavigate('prev')}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Anterior
        </Button>

        {/* Dots indicator */}
        <div className="flex-1 flex items-center justify-center gap-2">
          {Array.from({ length: total }, (_, i) => {
            const isApproved = approvedIndices.has(i)
            const isRejected = rejectedIndices.has(i)
            const isCurrent = i === currentIndex

            return (
              <button
                key={i}
                onClick={() => onGoTo(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  isCurrent
                    ? 'w-8 bg-primary-500'
                    : isApproved
                    ? 'bg-success-500'
                    : isRejected
                    ? 'bg-error-500'
                    : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
                title={carouselTitles[i]}
              />
            )
          })}
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => onNavigate('next')}
          disabled={currentIndex === total - 1}
        >
          Próximo
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Current carousel info */}
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold flex-1">
          {carouselTitles[currentIndex]}
        </h3>
        {approvedIndices.has(currentIndex) && (
          <Badge variant="success" className="gap-1">
            <CheckCircle className="w-3 h-3" />
            Aprovado
          </Badge>
        )}
        {rejectedIndices.has(currentIndex) && (
          <Badge variant="error" className="gap-1">
            <XCircle className="w-3 h-3" />
            Rejeitado
          </Badge>
        )}
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="text-xs text-neutral-500 dark:text-neutral-400">
        <kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded">←</kbd>
        {' '}e{' '}
        <kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded">→</kbd>
        {' '}para navegar
      </div>
    </div>
  )
}
