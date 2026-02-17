# Implementation Guide - Quick Start

Guia prático para implementar o design system do zero.

---

## Setup Inicial (30 minutos)

### 1. Criar Projeto Next.js

```bash
# Criar projeto
npx create-next-app@latest instagram-audit-dashboard --typescript --tailwind --app --use-npm

# Entrar no diretório
cd instagram-audit-dashboard

# Instalar dependências
npm install
```

**Configurações durante instalação:**
- TypeScript: **Yes**
- ESLint: **Yes**
- Tailwind CSS: **Yes**
- src/ directory: **Yes**
- App Router: **Yes**
- Import alias (@/*): **Yes**

---

### 2. Configurar Tailwind CSS

```javascript
// tailwind.config.js
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
        success: {
          500: '#10b981',
          600: '#059669',
        },
        warning: {
          500: '#f59e0b',
          600: '#d97706',
        },
        error: {
          500: '#ef4444',
          600: '#dc2626',
        },
        info: {
          500: '#3b82f6',
          600: '#2563eb',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'Menlo', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 20px rgb(168 85 247 / 0.3)',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        gradient: 'gradient 3s ease infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}

export default config
```

---

### 3. Configurar Fontes (Next.js 15)

```typescript
// src/app/layout.tsx
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
```

---

### 4. Global Styles

```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-neutral-700;
  }

  body {
    @apply bg-neutral-900 text-neutral-50;
  }

  /* Focus visible for keyboard navigation */
  *:focus-visible {
    @apply outline-none ring-2 ring-primary-500 ring-offset-2 ring-offset-neutral-900;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }

  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
}
```

---

### 5. Instalar Dependências

```bash
# shadcn/ui
npx shadcn-ui@latest init

# Componentes específicos
npm install framer-motion recharts lucide-react
npm install class-variance-authority clsx tailwind-merge
npm install @radix-ui/react-dialog @radix-ui/react-tooltip
npm install sonner
npm install swr

# Dev dependencies
npm install -D @tailwindcss/forms @tailwindcss/typography
```

---

## Estrutura de Diretórios

```bash
mkdir -p src/components/{ui,atoms,molecules,organisms,templates}
mkdir -p src/lib
mkdir -p src/hooks
mkdir -p src/types
```

**Resultado:**
```
src/
├── app/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── atoms/           # Atomic components
│   ├── molecules/       # Molecule components
│   ├── organisms/       # Organism components
│   └── templates/       # Page templates
├── lib/
│   ├── utils.ts
│   └── format.ts
├── hooks/
├── types/
└── styles/
```

---

## Implementação: Dia 1

### 1. Utility Functions

```typescript
// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

```typescript
// src/lib/format.ts
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) return 'Hoje'
  if (diffInDays === 1) return 'Ontem'
  if (diffInDays < 7) return `Há ${diffInDays} dias`
  if (diffInDays < 30) return `Há ${Math.floor(diffInDays / 7)} semanas`
  return d.toLocaleDateString('pt-BR')
}
```

---

### 2. Primeiro Componente (Button)

```bash
# Criar arquivo
touch src/components/atoms/button.tsx
```

```typescript
// src/components/atoms/button.tsx
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
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
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
```

---

### 3. Testar Componente

```typescript
// src/app/page.tsx
import { Button } from '@/components/atoms/button'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-24">
      <h1 className="text-4xl font-bold">Instagram Audit Dashboard</h1>

      <div className="flex gap-4">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
      </div>

      <div className="flex gap-4">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>

      <Button loading>Loading...</Button>
    </main>
  )
}
```

**Rodar servidor:**
```bash
npm run dev
```

Abrir http://localhost:3000 e verificar se os botões aparecem corretamente.

---

## Implementação: Dia 2-3

### 1. Layout com Sidebar

```typescript
// src/components/organisms/sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Plus, BarChart3, GitCompare, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Nova', href: '/dashboard/new', icon: Plus },
  { name: 'Perfis', href: '/dashboard/profiles', icon: BarChart3 },
  { name: 'Comparar', href: '/dashboard/comparisons', icon: GitCompare },
  { name: 'Config', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-neutral-900 border-r border-neutral-800">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-neutral-800 px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">IA</span>
          </div>
          <span className="text-lg font-semibold text-neutral-50">Instagram Audit</span>
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
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
```

```typescript
// src/components/templates/dashboard-layout.tsx
import { Sidebar } from '@/components/organisms/sidebar'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
```

```typescript
// src/app/dashboard/layout.tsx
import { DashboardLayout } from '@/components/templates/dashboard-layout'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>
}
```

```typescript
// src/app/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-neutral-400 mt-2">
        Sistema de auditoria de perfis do Instagram
      </p>
    </div>
  )
}
```

---

### 2. Card Component

```typescript
// src/components/atoms/card.tsx
import * as React from 'react'
import { cn } from '@/lib/utils'

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-lg border border-neutral-700 bg-neutral-800 shadow-sm',
        className
      )}
      {...props}
    />
  )
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-2xl font-semibold leading-none tracking-tight', className)} {...props} />
  )
)
CardTitle.displayName = 'CardTitle'

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

export { Card, CardHeader, CardTitle, CardContent }
```

---

## Implementação: Dia 4-7

### ProfileCard Component

```typescript
// src/types/index.ts
export interface Profile {
  username: string
  fullName: string
  followers: number
  profilePicUrl?: string
  verified?: boolean
}

export interface LastAudit {
  score: number
  classification: 'CRÍTICO' | 'BOM' | 'EXCELENTE'
  date: string
}
```

```typescript
// src/components/molecules/profile-card.tsx
import { Card } from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { formatNumber } from '@/lib/format'
import { CheckCircle } from 'lucide-react'
import type { Profile, LastAudit } from '@/types'

interface ProfileCardProps {
  profile: Profile
  lastAudit?: LastAudit
  onClick?: () => void
}

export function ProfileCard({ profile, lastAudit, onClick }: ProfileCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-success-500'
    if (score >= 50) return 'text-warning-500'
    return 'text-error-500'
  }

  return (
    <Card className="p-6 hover:shadow-lg hover:border-primary-500/50 transition-all cursor-pointer" onClick={onClick}>
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="h-16 w-16 rounded-full bg-neutral-700 shrink-0" />

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold">{profile.fullName}</h3>
            {profile.verified && <CheckCircle className="h-4 w-4 text-info-500" />}
          </div>
          <p className="text-sm text-neutral-400">@{profile.username}</p>
          <p className="text-xs text-neutral-500 mt-0.5">
            {formatNumber(profile.followers)} seguidores
          </p>
        </div>

        {/* Score */}
        {lastAudit && (
          <div className="flex flex-col items-end gap-2">
            <div className={`text-2xl font-bold ${getScoreColor(lastAudit.score)}`}>
              {lastAudit.score}
            </div>
            <div className="text-xs text-neutral-500">{lastAudit.date}</div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 shrink-0">
          <Button variant="ghost" size="sm">Comparar</Button>
          <Button variant="secondary" size="sm">Ver →</Button>
        </div>
      </div>
    </Card>
  )
}
```

**Usar no Dashboard:**

```typescript
// src/app/dashboard/page.tsx
import { ProfileCard } from '@/components/molecules/profile-card'

export default function DashboardPage() {
  const mockProfile = {
    username: 'frankcosta',
    fullName: 'Frank Costa',
    followers: 128400,
    verified: true,
  }

  const mockAudit = {
    score: 72,
    classification: 'BOM' as const,
    date: 'Há 5 dias',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-neutral-400 mt-2">
          Sistema de auditoria de perfis do Instagram
        </p>
      </div>

      <div className="grid gap-4">
        <ProfileCard profile={mockProfile} lastAudit={mockAudit} />
        <ProfileCard profile={{ ...mockProfile, username: 'rodrigogunter' }} />
      </div>
    </div>
  )
}
```

---

## Checklist de Progresso

### Setup (Dia 1)
- [x] Next.js 15 instalado
- [x] Tailwind configurado
- [x] Fontes configuradas
- [x] Dependências instaladas
- [x] Estrutura de diretórios criada
- [x] Utility functions (cn, format)
- [x] Button component

### Layout (Dia 2-3)
- [ ] Sidebar component
- [ ] DashboardLayout template
- [ ] PageHeader component
- [ ] Mobile navigation
- [ ] Breadcrumbs

### Componentes Base (Dia 4-7)
- [ ] Badge
- [ ] Card (completo)
- [ ] Input
- [ ] Progress
- [ ] Skeleton
- [ ] ProfileCard
- [ ] ScoreCard

### Páginas (Dia 8-14)
- [ ] Dashboard Home
- [ ] Nova Análise
- [ ] Perfil Overview
- [ ] Auditoria
- [ ] Comparação
- [ ] Posts

---

## Comandos Úteis

```bash
# Rodar dev server
npm run dev

# Build production
npm run build

# Lint
npm run lint

# Type check
npx tsc --noEmit

# Adicionar componente shadcn
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
```

---

## Troubleshooting

### Erro: Module not found
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Tailwind não aplicando estilos
```bash
# Verificar tailwind.config.js content paths
# Reiniciar dev server
```

### TypeScript errors
```bash
# Verificar tsconfig.json
# Adicionar tipos: npm install -D @types/node @types/react
```

---

## Recursos

- **Documentação:** [Design System](./ui-ux-design-system.md)
- **Wireframes:** [Wireframes](./wireframes.md)
- **Components:** [Component Specs](./component-specs.md)
- **Tailwind:** https://tailwindcss.com/docs
- **Next.js:** https://nextjs.org/docs
- **shadcn/ui:** https://ui.shadcn.com

---

**Status:** Pronto para começar!
**Tempo estimado:** 2-3 semanas para MVP completo
