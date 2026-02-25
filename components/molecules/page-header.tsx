import { Fragment } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href: string | null // null = current page
}

interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  breadcrumb?: BreadcrumbItem[]
  className?: string
}

export function PageHeader({ title, description, action, breadcrumb, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-8', className)}>
      <div>
        {breadcrumb && (
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            {breadcrumb.map((item, idx) => (
              <Fragment key={idx}>
                {idx > 0 && <ChevronRight className="h-3 w-3" />}
                {item.href ? (
                  <Link href={item.href} className="hover:text-primary-600 transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <span className="font-medium text-foreground">{item.label}</span>
                )}
              </Fragment>
            ))}
          </nav>
        )}
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-2">{description}</p>
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
