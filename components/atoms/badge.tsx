import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-sm px-2.5 py-0.5 text-xs font-semibold transition-colors border',
  {
    variants: {
      variant: {
        success: 'bg-success-500/10 text-success-500 border-success-500/20',
        warning: 'bg-warning-500/10 text-warning-500 border-warning-500/20',
        error: 'bg-error-500/10 text-error-500 border-error-500/20',
        info: 'bg-info-500/10 text-info-500 border-info-500/20',
        neutral: 'bg-neutral-700/50 text-neutral-300 border-neutral-600',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode
}

function Badge({ className, variant, icon, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
