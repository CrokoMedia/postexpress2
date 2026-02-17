# Component Specifications - React/TypeScript

**Versão:** 1.0
**Data:** 2026-02-16
**Autor:** @ux-design-expert

---

## Índice

1. [Convenções de Código](#convenções-de-código)
2. [Atoms](#atoms)
3. [Molecules](#molecules)
4. [Organisms](#organisms)
5. [Templates](#templates)
6. [Utilities](#utilities)

---

## Convenções de Código

### File Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── atoms/           # Atomic components
│   ├── molecules/       # Molecule components
│   ├── organisms/       # Organism components
│   └── templates/       # Page templates
├── lib/
│   ├── utils.ts         # Utility functions
│   └── cn.ts            # Class name merger
├── hooks/
│   ├── use-toast.ts
│   └── use-media-query.ts
└── types/
    └── index.ts         # Shared types
```

### Naming Conventions

```typescript
// Components: PascalCase
export const ProfileCard = () => {}

// Props: ComponentNameProps
interface ProfileCardProps {}

// Hooks: use + camelCase
export const useProfileData = () => {}

// Types: PascalCase + Type/Interface
type ScoreType = 'CRÍTICO' | 'BOM' | 'EXCELENTE'
interface AuditData {}

// Constants: UPPER_SNAKE_CASE
const MAX_SCORE = 100
const DEFAULT_LIMIT = 20
```

### Import Order

```typescript
// 1. React/Next
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// 2. External libraries
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

// 3. Internal components
import { Button } from '@/components/ui/button'
import { Card } from '@/components/atoms/card'

// 4. Hooks
import { useToast } from '@/hooks/use-toast'

// 5. Types
import type { ProfileData } from '@/types'

// 6. Utils
import { formatNumber } from '@/lib/format'
```

---

## Atoms

### Button

```typescript
// components/atoms/button.tsx

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary-500 text-neutral-50 hover:bg-primary-600 active:scale-98',
        secondary: 'bg-neutral-800 text-neutral-50 border border-neutral-600 hover:bg-neutral-700',
        ghost: 'text-neutral-300 hover:bg-neutral-800 hover:text-neutral-50',
        danger: 'bg-error-500 text-neutral-50 hover:bg-error-600',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  icon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, icon, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {children}
          </>
        ) : (
          <>
            {icon && <span className="shrink-0">{icon}</span>}
            {children}
          </>
        )}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
```

**Usage:**

```tsx
<Button variant="primary" size="md">
  Nova Análise
</Button>

<Button variant="secondary" loading>
  Salvando...
</Button>

<Button variant="ghost" icon={<Plus />}>
  Adicionar
</Button>
```

---

### Badge

```typescript
// components/atoms/badge.tsx

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
        neutral: 'bg-neutral-700 text-neutral-300 border-neutral-600',
      },
      size: {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-1',
      },
    },
    defaultVariants: {
      variant: 'neutral',
      size: 'sm',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
```

**Usage:**

```tsx
<Badge variant="success" dot>EXCELENTE</Badge>
<Badge variant="warning">BOM</Badge>
<Badge variant="error">CRÍTICO</Badge>
```

---

### Card

```typescript
// components/atoms/card.tsx

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const cardVariants = cva(
  'rounded-lg border transition-all',
  {
    variants: {
      variant: {
        default: 'bg-neutral-800 border-neutral-700 shadow-sm',
        highlight: 'bg-gradient-to-br from-primary-900/20 to-neutral-800 border-primary-500/20 shadow-glow',
        glass: 'bg-neutral-800/50 backdrop-blur-xl border-neutral-700/50',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      hoverable: {
        true: 'hover:shadow-lg hover:border-primary-500/50 cursor-pointer transition-all hover:-translate-y-1',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      hoverable: false,
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, hoverable, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding, hoverable, className }))}
      {...props}
    />
  )
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5', className)} {...props} />
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />
  )
)
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-neutral-400', className)} {...props} />
  )
)
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('pt-0', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center pt-0', className)} {...props} />
  )
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
```

**Usage:**

```tsx
<Card variant="default" padding="md">
  <CardHeader>
    <CardTitle>Auditoria</CardTitle>
    <CardDescription>Análise completa do perfil</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter>
    <Button>Ver Mais</Button>
  </CardFooter>
</Card>
```

---

### Progress

```typescript
// components/atoms/progress.tsx

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number // 0-100
  showLabel?: boolean
  variant?: 'default' | 'gradient'
  size?: 'sm' | 'md' | 'lg'
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, showLabel = false, variant = 'default', size = 'md', ...props }, ref) => {
    const clampedValue = Math.min(100, Math.max(0, value))

    const heights = {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3',
    }

    return (
      <div className="w-full space-y-1">
        {showLabel && (
          <div className="flex justify-between text-xs text-neutral-400">
            <span>Progresso</span>
            <span>{clampedValue}%</span>
          </div>
        )}
        <div
          ref={ref}
          className={cn('relative w-full overflow-hidden rounded-full bg-neutral-800', heights[size], className)}
          {...props}
        >
          <div
            className={cn(
              'h-full transition-all duration-500 ease-out',
              variant === 'default' && 'bg-primary-500',
              variant === 'gradient' && 'bg-gradient-to-r from-primary-500 to-info-500'
            )}
            style={{ width: `${clampedValue}%` }}
          />
        </div>
      </div>
    )
  }
)
Progress.displayName = 'Progress'

export { Progress }
```

**Usage:**

```tsx
<Progress value={65} showLabel variant="gradient" size="md" />
```

---

### Skeleton

```typescript
// components/atoms/skeleton.tsx

import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%]',
        className
      )}
      style={{
        animation: 'pulse 2s ease-in-out infinite',
      }}
      {...props}
    />
  )
}

export { Skeleton }
```

**Usage:**

```tsx
<Skeleton className="h-4 w-full" />
<Skeleton className="h-8 w-8 rounded-full" />
<Skeleton className="h-32 w-full" />
```

---

## Molecules

### ProfileCard

```typescript
// components/molecules/profile-card.tsx

import * as React from 'react'
import Image from 'next/image'
import { Card } from '@/components/atoms/card'
import { Badge } from '@/components/atoms/badge'
import { Button } from '@/components/atoms/button'
import { Users, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/format'

export interface ProfileCardProps {
  profile: {
    username: string
    fullName: string
    followers: number
    profilePicUrl?: string
    verified?: boolean
  }
  lastAudit?: {
    score: number
    classification: 'CRÍTICO' | 'BOM' | 'EXCELENTE'
    date: string
  }
  onClick?: () => void
  className?: string
}

export function ProfileCard({ profile, lastAudit, onClick, className }: ProfileCardProps) {
  const getClassificationVariant = (classification: string) => {
    const map = {
      'CRÍTICO': 'error',
      'BOM': 'warning',
      'EXCELENTE': 'success',
    } as const
    return map[classification as keyof typeof map] || 'neutral'
  }

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-success-500'
    if (score >= 50) return 'text-warning-500'
    return 'text-error-500'
  }

  return (
    <Card
      variant="default"
      padding="md"
      hoverable={!!onClick}
      onClick={onClick}
      className={cn('flex items-center gap-4', className)}
    >
      {/* Avatar */}
      <div className="relative h-16 w-16 shrink-0">
        {profile.profilePicUrl ? (
          <Image
            src={profile.profilePicUrl}
            alt={profile.fullName}
            fill
            className="rounded-full object-cover"
          />
        ) : (
          <div className="h-full w-full rounded-full bg-neutral-700 flex items-center justify-center">
            <Users className="h-6 w-6 text-neutral-500" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-neutral-50 truncate">
            {profile.fullName}
          </h3>
          {profile.verified && (
            <CheckCircle className="h-4 w-4 text-info-500 shrink-0" />
          )}
        </div>
        <p className="text-sm text-neutral-400 truncate">@{profile.username}</p>
        <p className="text-xs text-neutral-500 mt-0.5">
          {formatNumber(profile.followers)} seguidores
        </p>
      </div>

      {/* Last Audit */}
      {lastAudit && (
        <div className="flex flex-col items-end gap-2 shrink-0">
          <Badge variant={getClassificationVariant(lastAudit.classification)} dot>
            {lastAudit.classification}
          </Badge>
          <div className="text-right">
            <div className={cn('text-2xl font-bold', getScoreColor(lastAudit.score))}>
              {lastAudit.score}
            </div>
            <div className="text-xs text-neutral-500">Score Geral</div>
          </div>
          <div className="text-xs text-neutral-500">{lastAudit.date}</div>
        </div>
      )}

      {/* Actions */}
      {onClick && (
        <div className="flex gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={(e) => {
            e.stopPropagation()
            // Handle compare
          }}>
            Comparar
          </Button>
          <Button variant="secondary" size="sm">
            Ver Análise →
          </Button>
        </div>
      )}
    </Card>
  )
}
```

**Usage:**

```tsx
<ProfileCard
  profile={{
    username: 'frankcosta',
    fullName: 'Frank Costa',
    followers: 128400,
    profilePicUrl: '/images/frank.jpg',
    verified: true,
  }}
  lastAudit={{
    score: 72,
    classification: 'BOM',
    date: 'Há 5 dias',
  }}
  onClick={() => router.push('/profiles/frankcosta')}
/>
```

---

### ScoreCard

```typescript
// components/molecules/score-card.tsx

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/card'
import { Badge } from '@/components/atoms/badge'
import { cn } from '@/lib/utils'
import { RadarChart } from '@/components/atoms/radar-chart'

export interface ScoreCardProps {
  overallScore: number
  classification: 'CRÍTICO' | 'BOM' | 'EXCELENTE'
  dimensionScores: {
    behavior: number
    copy: number
    offers: number
    metrics: number
    anomalies: number
  }
  showRadar?: boolean
  className?: string
}

export function ScoreCard({
  overallScore,
  classification,
  dimensionScores,
  showRadar = true,
  className,
}: ScoreCardProps) {
  const getClassificationVariant = (classification: string) => {
    const map = {
      'CRÍTICO': 'error',
      'BOM': 'warning',
      'EXCELENTE': 'success',
    } as const
    return map[classification as keyof typeof map] || 'neutral'
  }

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-success-500'
    if (score >= 50) return 'text-warning-500'
    return 'text-error-500'
  }

  return (
    <Card variant="highlight" padding="lg" className={cn('', className)}>
      <div className="grid md:grid-cols-2 gap-8">
        {/* Score */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={cn('text-6xl font-bold', getScoreColor(overallScore))}>
            {overallScore}
          </div>
          <Badge variant={getClassificationVariant(classification)} size="md">
            {classification}
          </Badge>
        </div>

        {/* Radar Chart */}
        {showRadar && (
          <div className="flex items-center justify-center">
            <RadarChart
              data={[
                { dimension: 'Comportamento', value: dimensionScores.behavior },
                { dimension: 'Copy', value: dimensionScores.copy },
                { dimension: 'Ofertas', value: dimensionScores.offers },
                { dimension: 'Métricas', value: dimensionScores.metrics },
                { dimension: 'Anomalias', value: dimensionScores.anomalies },
              ]}
              size={300}
            />
          </div>
        )}
      </div>

      {/* Dimension Scores */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-neutral-400">Comportamento</span>
          <span className={cn('text-lg font-semibold', getScoreColor(dimensionScores.behavior))}>
            {dimensionScores.behavior}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-neutral-400">Copy</span>
          <span className={cn('text-lg font-semibold', getScoreColor(dimensionScores.copy))}>
            {dimensionScores.copy}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-neutral-400">Ofertas</span>
          <span className={cn('text-lg font-semibold', getScoreColor(dimensionScores.offers))}>
            {dimensionScores.offers}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-neutral-400">Métricas</span>
          <span className={cn('text-lg font-semibold', getScoreColor(dimensionScores.metrics))}>
            {dimensionScores.metrics}
          </span>
        </div>
        <div className="flex justify-between items-center col-span-2 justify-center">
          <span className="text-sm text-neutral-400">Anomalias</span>
          <span className={cn('text-lg font-semibold', getScoreColor(dimensionScores.anomalies))}>
            {dimensionScores.anomalies}
          </span>
        </div>
      </div>
    </Card>
  )
}
```

---

### ProgressTracker

```typescript
// components/molecules/progress-tracker.tsx

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/card'
import { Progress } from '@/components/atoms/progress'
import { Check, Loader2, Circle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Phase {
  name: string
  status: 'pending' | 'in_progress' | 'completed' | 'error'
  duration?: number
  message?: string
}

export interface ProgressTrackerProps {
  phases: Phase[]
  currentPhase: number
  overallProgress?: number
  className?: string
}

export function ProgressTracker({
  phases,
  currentPhase,
  overallProgress,
  className,
}: ProgressTrackerProps) {
  const getIcon = (status: Phase['status']) => {
    switch (status) {
      case 'completed':
        return <Check className="h-5 w-5 text-success-500" />
      case 'in_progress':
        return <Loader2 className="h-5 w-5 text-primary-500 animate-spin" />
      case 'error':
        return <X className="h-5 w-5 text-error-500" />
      default:
        return <Circle className="h-5 w-5 text-neutral-600" />
    }
  }

  const calculatedProgress = overallProgress ?? Math.round((currentPhase / phases.length) * 100)

  return (
    <Card variant="default" padding="lg" className={cn('', className)}>
      <CardHeader>
        <CardTitle>Análise em Andamento...</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Progress Bar */}
        <Progress value={calculatedProgress} showLabel variant="gradient" size="lg" />

        {/* Phases */}
        <div className="mt-6 space-y-4">
          {phases.map((phase, index) => (
            <div
              key={index}
              className={cn(
                'flex items-start gap-3 transition-opacity',
                phase.status === 'pending' && 'opacity-50'
              )}
            >
              <div className="shrink-0 mt-0.5">{getIcon(phase.status)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={cn(
                    'text-sm font-medium',
                    phase.status === 'completed' && 'text-neutral-300',
                    phase.status === 'in_progress' && 'text-neutral-50',
                    phase.status === 'error' && 'text-error-500',
                    phase.status === 'pending' && 'text-neutral-500'
                  )}>
                    {index + 1}. {phase.name}
                  </p>
                  {phase.duration && (
                    <span className="text-xs text-neutral-500">
                      ({phase.duration.toFixed(1)}s)
                    </span>
                  )}
                </div>
                {phase.message && (
                  <p className="text-xs text-neutral-500 mt-1">{phase.message}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## Organisms

### Sidebar

```typescript
// components/organisms/sidebar.tsx

'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Plus, BarChart3, GitCompare, Settings, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Nova', href: '/dashboard/new', icon: Plus },
  { name: 'Perfis', href: '/dashboard/profiles', icon: BarChart3 },
  { name: 'Comparar', href: '/dashboard/comparisons', icon: GitCompare },
  { name: 'Configurações', href: '/dashboard/settings', icon: Settings },
]

export interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen transition-all duration-300 bg-neutral-900 border-r border-neutral-800',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-neutral-800 px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary-500 flex items-center justify-center">
            <span className="text-white font-bold">IA</span>
          </div>
          {!collapsed && (
            <span className="text-lg font-semibold text-neutral-50">Instagram Audit</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-500/10 text-primary-500 border-l-2 border-primary-500'
                  : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-50'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="border-t border-neutral-800 p-4">
        <button
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors w-full',
            'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-50'
          )}
        >
          <User className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Perfil</span>}
        </button>
      </div>
    </aside>
  )
}
```

---

## Utilities

### Format Helpers

```typescript
// lib/format.ts

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function formatPercentage(num: number, decimals: number = 1): string {
  return num.toFixed(decimals) + '%'
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInMs = now.getTime() - d.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) return 'Hoje'
  if (diffInDays === 1) return 'Ontem'
  if (diffInDays < 7) return `Há ${diffInDays} dias`
  if (diffInDays < 30) return `Há ${Math.floor(diffInDays / 7)} semanas`
  if (diffInDays < 365) return `Há ${Math.floor(diffInDays / 30)} meses`
  return d.toLocaleDateString('pt-BR')
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds.toFixed(0)}s`
}
```

---

## TypeScript Types

```typescript
// types/index.ts

export interface Profile {
  id: string
  username: string
  fullName: string
  biography?: string
  followersCount: number
  followsCount: number
  postsCount: number
  profilePicUrl?: string
  profilePicUrlHD?: string
  verified: boolean
  isBusinessAccount: boolean
  lastScrapedAt?: string
  createdAt: string
  updatedAt: string
}

export interface Audit {
  id: string
  profileId: string
  auditDate: string
  scoreOverall: number
  classification: 'CRÍTICO' | 'BOM' | 'EXCELENTE'
  scoreBehavior: number
  scoreCopy: number
  scoreOffers: number
  scoreMetrics: number
  scoreAnomalies: number
  topStrengths: string[]
  criticalProblems: string[]
  quickWins: QuickWin[]
  strategicMoves: string[]
  engagementRate: number
  avgLikes: number
  avgComments: number
  rawJson?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface QuickWin {
  id: string
  title: string
  description: string
  impact: 'low' | 'medium' | 'high'
  effort: 'low' | 'medium' | 'high'
  completed?: boolean
}

export interface Post {
  id: string
  auditId: string
  shortCode: string
  type: 'Image' | 'Video' | 'Sidecar'
  caption?: string
  likesCount: number
  commentsCount: number
  timestamp: string
  displayUrl: string
  ocrText?: string
  hasOffer: boolean
  engagementRate: number
}

export interface Comment {
  id: string
  postId: string
  text: string
  category: 'questions' | 'praise' | 'doubts' | 'buying_intent'
  sentiment: 'positive' | 'neutral' | 'negative'
  timestamp: string
}

export interface Comparison {
  id: string
  profileId: string
  auditBeforeId: string
  auditAfterId: string
  dateBefore: string
  dateAfter: string
  daysInterval: number
  growthFollowers: number
  growthEngagement: number
  improvementOverall: number
  improvementBehavior: number
  improvementCopy: number
  improvementOffers: number
  improvementMetrics: number
  improvementAnomalies: number
}

export interface AnalysisQueueItem {
  id: string
  username: string
  status: 'pending' | 'scraping' | 'analyzing' | 'completed' | 'failed'
  progress: number
  currentPhase?: string
  errorMessage?: string
  completedAt?: string
  createdAt: string
}
```

---

**Próximos Passos:**
1. Implementar componentes base (Atoms)
2. Criar Molecules (ProfileCard, ScoreCard, etc.)
3. Construir Organisms (Sidebar, PageHeader, etc.)
4. Montar Templates (DashboardLayout, PageLayout)
5. Implementar páginas usando templates
6. Setup Storybook para component library
7. Testes com React Testing Library
