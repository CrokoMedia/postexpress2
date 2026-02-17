import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-8', className)}>
      <div>
        <h1 className="text-3xl font-bold text-neutral-50">{title}</h1>
        {description && (
          <p className="text-neutral-400 mt-2">{description}</p>
        )}
      </div>
      {action && (
        <div className="flex gap-2">
          {action}
        </div>
      )}
    </div>
  )
}
