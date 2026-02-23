'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Check, ChevronRight } from 'lucide-react'
import type { ProgressStep } from '@/types/content-creation'

export interface ProgressStepperProps {
  currentStep: 1 | 2 | 3
  onStepClick?: (step: number) => void
  className?: string
  allowNavigation?: boolean
}

const steps: ProgressStep[] = [
  { id: 1, title: 'Criar', status: 'pending' },
  { id: 2, title: 'Refinar', status: 'pending' },
  { id: 3, title: 'Exportar', status: 'pending' },
]

export function ProgressStepper({
  currentStep,
  onStepClick,
  className,
  allowNavigation = false,
}: ProgressStepperProps) {
  // Atualiza status dos steps baseado no currentStep
  const stepsWithStatus = steps.map((step) => ({
    ...step,
    status:
      step.id < currentStep
        ? 'completed'
        : step.id === currentStep
        ? 'current'
        : 'pending',
  })) as ProgressStep[]

  const handleStepClick = (stepId: number) => {
    if (!allowNavigation) return
    if (onStepClick) {
      onStepClick(stepId)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, stepId: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleStepClick(stepId)
    }
  }

  return (
    <nav
      className={cn('w-full', className)}
      aria-label="Progresso de criação de conteúdo"
    >
      <ol className="flex items-center justify-center gap-2 md:gap-4">
        {stepsWithStatus.map((step, index) => {
          const isCompleted = step.status === 'completed'
          const isCurrent = step.status === 'current'
          const isPending = step.status === 'pending'
          const isClickable = allowNavigation && (isCompleted || isCurrent)

          return (
            <React.Fragment key={step.id}>
              {/* Step item */}
              <li className="flex items-center">
                <button
                  type="button"
                  onClick={() => handleStepClick(step.id)}
                  onKeyDown={(e) => handleKeyDown(e, step.id)}
                  disabled={!isClickable}
                  className={cn(
                    'group flex items-center gap-3 transition-all duration-400',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-button',
                    isClickable && 'cursor-pointer hover:scale-105',
                    !isClickable && 'cursor-default'
                  )}
                  aria-current={isCurrent ? 'step' : undefined}
                  aria-label={`${step.title}${
                    isCompleted
                      ? ' - Completo'
                      : isCurrent
                      ? ' - Etapa atual'
                      : ' - Pendente'
                  }`}
                >
                  {/* Step number/icon */}
                  <div
                    className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-400 font-semibold text-sm',
                      isCompleted &&
                        'bg-success-500 dark:bg-success-600 border-success-500 dark:border-success-600 text-white',
                      isCurrent &&
                        'bg-primary-500 dark:bg-primary-600 border-primary-500 dark:border-primary-600 text-white shadow-hover',
                      isPending &&
                        'bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400',
                      isClickable && 'group-hover:scale-110 group-hover:shadow-hover'
                    )}
                    aria-hidden="true"
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </div>

                  {/* Step title */}
                  <div
                    className={cn(
                      'hidden md:block text-left transition-colors duration-400',
                      isCompleted && 'text-success-700 dark:text-success-400',
                      isCurrent && 'text-primary-700 dark:text-primary-400 font-semibold',
                      isPending && 'text-neutral-500 dark:text-neutral-400'
                    )}
                  >
                    <div className="text-xs uppercase tracking-wide mb-0.5 text-neutral-500 dark:text-neutral-400">
                      Fase {step.id}
                    </div>
                    <div className="text-sm font-medium">{step.title}</div>
                  </div>
                </button>
              </li>

              {/* Divider arrow */}
              {index < stepsWithStatus.length - 1 && (
                <ChevronRight
                  className={cn(
                    'h-5 w-5 shrink-0 transition-colors duration-400',
                    step.status === 'completed'
                      ? 'text-success-500 dark:text-success-400'
                      : 'text-neutral-300 dark:text-neutral-700'
                  )}
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          )
        })}
      </ol>

      {/* Mobile step indicator */}
      <div className="md:hidden mt-3 text-center">
        <p
          className="text-sm font-medium text-foreground"
          aria-live="polite"
          aria-atomic="true"
        >
          Fase {currentStep} de 3:{' '}
          <span className="text-primary-600 dark:text-primary-400">
            {stepsWithStatus.find((s) => s.id === currentStep)?.title}
          </span>
        </p>
      </div>

      {/* Progress bar visual (mobile) */}
      <div
        className="md:hidden mt-2"
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={3}
        aria-label="Progresso geral"
      >
        <div className="h-1.5 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 dark:bg-primary-600 transition-all duration-400 ease-out"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>
      </div>
    </nav>
  )
}
