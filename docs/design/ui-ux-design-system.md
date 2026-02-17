# UI/UX Design System - Instagram Audit Dashboard

**Versão:** 1.0
**Data:** 2026-02-16
**Autor:** @ux-design-expert

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Design Tokens](#design-tokens)
3. [Componentes Base](#componentes-base)
4. [Componentes Compostos](#componentes-compostos)
5. [Layout System](#layout-system)
6. [Responsividade](#responsividade)
7. [Acessibilidade](#acessibilidade)
8. [Animações e Transições](#animações-e-transições)

---

## Visão Geral

### Filosofia de Design

Sistema clean e moderno focado em **clareza de dados** e **ação imediata**. Inspirado em dashboards profissionais (Vercel, Linear, Stripe) mas com personalidade única.

**Princípios:**
- **Respiração**: Whitespace generoso (24px entre seções)
- **Hierarquia Clara**: Tipografia forte para guiar o olho
- **Feedback Visual**: Estados visíveis e responsivos
- **Dark-First**: Dark mode como padrão (light mode opcional)
- **Data-Dense sem Overwhelm**: Muita informação, pouca ansiedade

---

## Design Tokens

### Cores (Dark Theme Default)

```javascript
// Primary - Accent (Purple/Violet)
primary: {
  50:  '#faf5ff',  // Hover backgrounds
  100: '#f3e8ff',
  200: '#e9d5ff',
  300: '#d8b4fe',
  400: '#c084fc',
  500: '#a855f7',  // PRIMARY - CTA buttons
  600: '#9333ea',  // Hover states
  700: '#7e22ce',
  800: '#6b21a8',
  900: '#581c87',
}

// Neutrals (Dark Mode)
neutral: {
  50:  '#fafafa',  // Text on dark
  100: '#f5f5f5',
  200: '#e5e5e5',
  300: '#d4d4d4',
  400: '#a3a3a3',  // Subtle text
  500: '#737373',  // Placeholder
  600: '#525252',  // Borders
  700: '#404040',  // Hover backgrounds
  800: '#262626',  // Card backgrounds
  900: '#171717',  // Main background
  950: '#0a0a0a',  // Deep background
}

// Semantic Colors
success: {
  500: '#10b981',  // EXCELENTE (green)
  600: '#059669',
}

warning: {
  500: '#f59e0b',  // BOM (amber)
  600: '#d97706',
}

error: {
  500: '#ef4444',  // CRÍTICO (red)
  600: '#dc2626',
}

info: {
  500: '#3b82f6',  // Info badges
  600: '#2563eb',
}

// Score Gradient (for radar charts)
scoreGradient: {
  0:   '#ef4444',  // Red (0-30)
  30:  '#f59e0b',  // Amber (30-60)
  60:  '#10b981',  // Green (60-100)
  100: '#10b981',
}
```

### Tipografia

```javascript
fontFamily: {
  sans: ['Inter Variable', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'Menlo', 'monospace'],
}

fontSize: {
  xs:   ['0.75rem', { lineHeight: '1rem' }],     // 12px
  sm:   ['0.875rem', { lineHeight: '1.25rem' }], // 14px
  base: ['1rem', { lineHeight: '1.5rem' }],      // 16px
  lg:   ['1.125rem', { lineHeight: '1.75rem' }], // 18px
  xl:   ['1.25rem', { lineHeight: '1.75rem' }],  // 20px
  '2xl': ['1.5rem', { lineHeight: '2rem' }],     // 24px
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }],  // 36px
  '5xl': ['3rem', { lineHeight: '1' }],          // 48px
}

fontWeight: {
  normal:  400,
  medium:  500,
  semibold: 600,
  bold:    700,
}
```

### Espaçamento

```javascript
spacing: {
  0:   '0px',
  1:   '0.25rem',  // 4px
  2:   '0.5rem',   // 8px
  3:   '0.75rem',  // 12px
  4:   '1rem',     // 16px
  5:   '1.25rem',  // 20px
  6:   '1.5rem',   // 24px
  8:   '2rem',     // 32px
  10:  '2.5rem',   // 40px
  12:  '3rem',     // 48px
  16:  '4rem',     // 64px
  20:  '5rem',     // 80px
  24:  '6rem',     // 96px
}
```

### Bordas e Raios

```javascript
borderRadius: {
  none: '0',
  sm:   '0.25rem',  // 4px - badges
  DEFAULT: '0.5rem', // 8px - buttons, inputs
  md:   '0.75rem',  // 12px - cards
  lg:   '1rem',     // 16px - modals
  xl:   '1.5rem',   // 24px - hero cards
  full: '9999px',   // pills
}

borderWidth: {
  DEFAULT: '1px',
  2: '2px',
  4: '4px',
}
```

### Sombras

```javascript
boxShadow: {
  sm:  '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md:  '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg:  '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl:  '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  glow: '0 0 20px rgb(168 85 247 / 0.3)', // Purple glow for focus
}
```

---

## Componentes Base

### Button

```typescript
type ButtonProps = {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger'
  size: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  icon?: ReactNode
  children: ReactNode
}

// Variants
primary: {
  bg: 'primary-500',
  hover: 'primary-600',
  text: 'neutral-50',
  active: 'shadow-glow',
}

secondary: {
  bg: 'neutral-800',
  hover: 'neutral-700',
  border: 'neutral-600',
  text: 'neutral-50',
}

ghost: {
  bg: 'transparent',
  hover: 'neutral-800',
  text: 'neutral-300',
}

danger: {
  bg: 'error-500',
  hover: 'error-600',
  text: 'neutral-50',
}

// Sizes
sm:  'px-3 py-1.5 text-sm',
md:  'px-4 py-2 text-base',
lg:  'px-6 py-3 text-lg',
```

**Exemplo Visual:**
```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Nova Análise   │  │   Comparar      │  │    Cancelar     │
│  (Primary)      │  │  (Secondary)    │  │    (Ghost)      │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

### Badge

```typescript
type BadgeProps = {
  variant: 'success' | 'warning' | 'error' | 'info' | 'neutral'
  size: 'sm' | 'md'
  dot?: boolean
  children: ReactNode
}

// Variants
success:  'bg-success-500/10 text-success-500 border-success-500/20',
warning:  'bg-warning-500/10 text-warning-500 border-warning-500/20',
error:    'bg-error-500/10 text-error-500 border-error-500/20',
info:     'bg-info-500/10 text-info-500 border-info-500/20',
neutral:  'bg-neutral-700 text-neutral-300 border-neutral-600',
```

**Exemplo Visual:**
```
●  EXCELENTE    ●  BOM    ●  CRÍTICO    ●  Verificado
```

---

### Card

```typescript
type CardProps = {
  variant: 'default' | 'highlight' | 'glass'
  padding: 'sm' | 'md' | 'lg'
  hoverable?: boolean
  children: ReactNode
}

// Variants
default: {
  bg: 'neutral-800',
  border: 'neutral-700',
  shadow: 'sm',
}

highlight: {
  bg: 'gradient-to-br from-primary-900/20 to-neutral-800',
  border: 'primary-500/20',
  shadow: 'glow',
}

glass: {
  bg: 'neutral-800/50',
  backdrop: 'blur-xl',
  border: 'neutral-700/50',
}
```

**Exemplo Visual:**
```
┌──────────────────────────────────────┐
│  Card Header                         │
│  ──────────────────────────────────  │
│                                      │
│  Card content goes here with         │
│  proper spacing and alignment        │
│                                      │
└──────────────────────────────────────┘
```

---

### Input

```typescript
type InputProps = {
  size: 'sm' | 'md' | 'lg'
  error?: string
  helperText?: string
  icon?: ReactNode
  disabled?: boolean
}

// States
default: {
  bg: 'neutral-800',
  border: 'neutral-700',
  text: 'neutral-50',
  placeholder: 'neutral-500',
}

focus: {
  border: 'primary-500',
  ring: 'primary-500/20',
}

error: {
  border: 'error-500',
  text: 'error-500',
}

disabled: {
  bg: 'neutral-900',
  text: 'neutral-600',
  cursor: 'not-allowed',
}
```

**Exemplo Visual:**
```
┌──────────────────────────────────────┐
│  @ frankcosta                    [x] │
└──────────────────────────────────────┘
    Digite o username do Instagram
```

---

### Progress Bar

```typescript
type ProgressProps = {
  value: number  // 0-100
  size: 'sm' | 'md' | 'lg'
  variant: 'default' | 'gradient'
  showLabel?: boolean
}

// Visual
default: {
  bg: 'neutral-800',
  fill: 'primary-500',
}

gradient: {
  bg: 'neutral-800',
  fill: 'gradient-to-r from-primary-500 to-info-500',
}
```

**Exemplo Visual:**
```
Analisando posts... 65%
[████████████████─────────────] 65/100
```

---

### Skeleton Loader

```typescript
type SkeletonProps = {
  variant: 'text' | 'circle' | 'rect'
  width?: string
  height?: string
  animate?: boolean
}

// Animation
animate: 'animate-pulse bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800',
```

**Exemplo Visual:**
```
┌──────────────────────────────────────┐
│  ▓▓▓▓▓▓▓▓▓▓▓▓                        │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓      │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                   │
└──────────────────────────────────────┘
```

---

## Componentes Compostos

### ProfileCard (Lista de Perfis)

```typescript
type ProfileCardProps = {
  profile: {
    username: string
    fullName: string
    followers: number
    profilePicUrl: string
    verified: boolean
  }
  lastAudit?: {
    score: number
    classification: 'CRÍTICO' | 'BOM' | 'EXCELENTE'
    date: string
  }
  onClick: () => void
}

// Visual Structure
┌────────────────────────────────────────────────────────┐
│  [IMG]  Rodrigo Gunter          ●  EXCELENTE          │
│         @rodrigogunter_             Score: 87         │
│         56.3K seguidores            2 dias atrás      │
└────────────────────────────────────────────────────────┘
    ↑         ↑                      ↑        ↑
  Avatar   Metadata               Badge    Score
```

**Props Visuais:**
- Avatar: 48px × 48px, rounded-full
- Nome: text-base font-semibold
- Username: text-sm text-neutral-400
- Badge: variant baseado em classification
- Score: text-2xl font-bold com cor dinâmica
- Hover: scale-[1.01] + shadow-lg

---

### ScoreCard (Score + Radar Chart)

```typescript
type ScoreCardProps = {
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
}

// Visual Structure
┌────────────────────────────────────────────────────────┐
│                       87                               │
│                   EXCELENTE                            │
│                                                        │
│          ┌───────────────────────┐                    │
│          │      Radar Chart      │                    │
│          │    (5 dimensions)     │                    │
│          │                       │                    │
│          └───────────────────────┘                    │
│                                                        │
│  Comportamento  85    Copy        90                  │
│  Ofertas        82    Métricas    88                  │
│  Anomalias      89                                    │
└────────────────────────────────────────────────────────┘
```

**Especificações:**
- Score: text-5xl font-bold, cor dinâmica (red/amber/green)
- Classification: Badge grande (lg)
- Radar: Canvas 300×300, 5 pontos, gradient fill
- Dimension bars: Mini progress bars (h-2)

---

### AuditorSection (Análise de um Auditor)

```typescript
type AuditorSectionProps = {
  auditor: {
    name: string
    icon: string
    specialization: string
  }
  score: number
  strengths: string[]
  problems: string[]
  recommendations: string[]
  expanded?: boolean
}

// Visual Structure
┌────────────────────────────────────────────────────────┐
│  🎯 Auditor de Comportamento                      85   │
│     Especialista em engajamento e autenticidade        │
│  ───────────────────────────────────────────────────   │
│                                                        │
│  ✅ Pontos Fortes:                                     │
│  • Engajamento consistente (4.5%)                     │
│  • Respostas rápidas aos comentários                  │
│  • Conteúdo autêntico e pessoal                       │
│                                                        │
│  ⚠️  Problemas Identificados:                          │
│  • Falta de CTA em 60% dos posts                      │
│  • Horários inconsistentes de publicação              │
│                                                        │
│  💡 Recomendações:                                     │
│  • Adicionar CTAs claros em todos os posts            │
│  • Definir calendário de publicação fixo              │
│  • Testar diferentes horários por 2 semanas           │
└────────────────────────────────────────────────────────┘
```

**Estados:**
- Collapsed: Mostra apenas header + score
- Expanded: Mostra análise completa
- Transição: smooth collapse/expand (300ms)

---

### ProgressTracker (Análise em Tempo Real)

```typescript
type ProgressTrackerProps = {
  phases: {
    name: string
    status: 'pending' | 'in_progress' | 'completed' | 'error'
    duration?: number
  }[]
  currentPhase: number
}

// Visual Structure
┌────────────────────────────────────────────────────────┐
│  Análise em Andamento...                              │
│  ───────────────────────────────────────────────────   │
│                                                        │
│  ✅  1. Scraping do perfil              (2.3s)        │
│  ✅  2. Coleta de posts                 (5.1s)        │
│  ⏳  3. Análise de auditores             ...          │
│  ⏺   4. Geração de relatório            -             │
│                                                        │
│  [████████████████─────────────] 65%                  │
└────────────────────────────────────────────────────────┘
```

**Ícones:**
- Pending: ⏺ (neutral-600)
- In Progress: ⏳ (primary-500, animate-spin)
- Completed: ✅ (success-500)
- Error: ❌ (error-500)

---

### ComparisonChart (Before/After)

```typescript
type ComparisonChartProps = {
  before: {
    date: string
    score: number
    followers: number
    engagement: number
  }
  after: {
    date: string
    score: number
    followers: number
    engagement: number
  }
  metrics: string[]
}

// Visual Structure
┌────────────────────────────────────────────────────────┐
│  Comparação Temporal                                   │
│  12 Jan 2026  →  12 Fev 2026 (30 dias)                │
│  ───────────────────────────────────────────────────   │
│                                                        │
│  Score Geral                                           │
│  ┌────────┐                    ┌────────┐             │
│  │   72   │  ──────────→        │   87   │  +15 pts  │
│  │  BOM   │                    │EXCELENTE│            │
│  └────────┘                    └────────┘             │
│                                                        │
│  Seguidores       56.3K  →  58.1K   +3.2% ↑          │
│  Engajamento      4.2%   →  5.1%    +21.4% ↑          │
│  Posts/Semana     3      →  5       +66.7% ↑          │
│                                                        │
│  [Line Chart: Score Evolution]                        │
└────────────────────────────────────────────────────────┘
```

**Charts:**
- Line Chart: Recharts/Chart.js, gradient fill
- Growth Indicators: ↑ (green) / ↓ (red) / → (neutral)
- Delta: Sempre mostrar percentual + absoluto

---

### QuickWinsList (Ações Imediatas)

```typescript
type QuickWinsListProps = {
  wins: {
    id: string
    title: string
    description: string
    impact: 'low' | 'medium' | 'high'
    effort: 'low' | 'medium' | 'high'
    completed?: boolean
  }[]
  onToggle: (id: string) => void
}

// Visual Structure
┌────────────────────────────────────────────────────────┐
│  🚀 Quick Wins - Ações Imediatas                      │
│  ───────────────────────────────────────────────────   │
│                                                        │
│  ☐  Adicionar bio mais clara             🟢 🟡       │
│     Bio atual muito vaga, dificulta conversão         │
│     Impacto: Alto  •  Esforço: Baixo                  │
│                                                        │
│  ☑  Criar highlights de depoimentos      🟢 🟢       │
│     Aumenta social proof e conversões                 │
│     Impacto: Alto  •  Esforço: Médio                  │
│                                                        │
│  ☐  Fixar post com oferta principal      🟢 🟡       │
│     Visitantes veem oferta imediatamente              │
│     Impacto: Médio  •  Esforço: Baixo                 │
└────────────────────────────────────────────────────────┘
```

**Elementos:**
- Checkbox: Interactive, marca como concluído
- Impact/Effort: Dots coloridos (🟢 high, 🟡 medium, 🔴 low)
- Completed: opacity-50 + line-through

---

### PostGrid (Galeria com OCR)

```typescript
type PostGridProps = {
  posts: {
    id: string
    imageUrl: string
    caption: string
    likes: number
    comments: number
    ocrText?: string
    hasOffer?: boolean
  }[]
  columns: 2 | 3 | 4
  onPostClick: (id: string) => void
}

// Visual Structure (Grid 3 colunas)
┌──────────────────────────────────────────────────────┐
│  Posts Analisados (10)            🔍 Buscar         │
│  ─────────────────────────────────────────────────   │
│                                                      │
│  ┌────────┐  ┌────────┐  ┌────────┐                │
│  │ [IMG]  │  │ [IMG]  │  │ [IMG]  │                │
│  │        │  │        │  │        │                │
│  │ 💰OCR  │  │        │  │ 💰OCR  │                │
│  └────────┘  └────────┘  └────────┘                │
│   4.6K ❤️     3.2K ❤️     5.1K ❤️                   │
│   86 💬       45 💬       120 💬                     │
│                                                      │
│  ┌────────┐  ┌────────┐  ┌────────┐                │
│  │ [IMG]  │  │ [IMG]  │  │ [IMG]  │                │
│  └────────┘  └────────┘  └────────┘                │
└──────────────────────────────────────────────────────┘
```

**Features:**
- Lazy Loading: Intersection Observer
- OCR Badge: Mostra se detectou texto (💰 para ofertas)
- Hover: Scale + overlay com caption preview
- Modal: Click abre modal com detalhes completos

---

### CommentCategories (Análise de Comentários)

```typescript
type CommentCategoriesProps = {
  categories: {
    questions: number
    praise: number
    doubts: number
    buying_intent: number
  }
  topComments: {
    text: string
    category: string
    sentiment: 'positive' | 'neutral' | 'negative'
  }[]
}

// Visual Structure
┌────────────────────────────────────────────────────────┐
│  📊 Análise de Comentários (2.341 total)              │
│  ───────────────────────────────────────────────────   │
│                                                        │
│  Perguntas                856  ██████████░░  36.6%   │
│  Elogios                  634  ███████░░░░░  27.1%   │
│  Dúvidas                  512  ██████░░░░░░  21.9%   │
│  Intenção de Compra       339  ████░░░░░░░░  14.5%   │
│                                                        │
│  💬 Comentários em Destaque:                          │
│  ─────────────────────────────────────────────────────│
│  😊  "Como faço pra entrar no seu mentorado?"         │
│      Categoria: Intenção de Compra                    │
│                                                        │
│  😊  "Parabéns pelo trabalho, muito inspirador!"      │
│      Categoria: Elogios                               │
└────────────────────────────────────────────────────────┘
```

---

## Layout System

### Grid Structure

```typescript
// Desktop (> 1024px)
layout: {
  sidebar: 'w-64 fixed',
  main: 'ml-64 px-8 py-6',
  content: 'max-w-7xl mx-auto',
}

// Tablet (768-1024px)
layout: {
  sidebar: 'w-20 fixed', // Collapsed
  main: 'ml-20 px-6 py-4',
}

// Mobile (< 768px)
layout: {
  sidebar: 'hidden',
  main: 'px-4 py-3',
  mobileNav: 'fixed bottom-0',
}
```

### Sidebar Navigation

```
┌────────────────┐
│  [LOGO]        │
│                │
│  🏠 Dashboard  │
│  ➕ Nova       │
│  📊 Perfis     │
│  🔄 Comparar   │
│  ⚙️  Config    │
│                │
│                │
│  [USER]        │
│  @username     │
└────────────────┘
```

**Features:**
- Active state: bg-primary-500/10 + border-l-2 border-primary-500
- Hover: bg-neutral-800
- Collapsible: Toggle para w-20 (apenas ícones)
- Tooltip: Mostrar label quando collapsed

---

### Page Headers

```typescript
type PageHeaderProps = {
  title: string
  subtitle?: string
  actions?: ReactNode
  breadcrumbs?: { label: string; href: string }[]
}

// Visual
┌────────────────────────────────────────────────────────┐
│  Home > Perfis > @frankcosta                          │
│                                                        │
│  Auditoria - @frankcosta                [Comparar]    │
│  Análise completa de 12 Fev 2026        [Download]    │
└────────────────────────────────────────────────────────┘
```

---

### Container Sizes

```typescript
containerSizes: {
  sm:  'max-w-2xl',   // 672px - Formulários
  md:  'max-w-4xl',   // 896px - Conteúdo simples
  lg:  'max-w-6xl',   // 1152px - Dashboard
  xl:  'max-w-7xl',   // 1280px - Wide layouts
  full: 'max-w-full',
}
```

---

## Responsividade

### Breakpoints

```typescript
screens: {
  sm:  '640px',
  md:  '768px',
  lg:  '1024px',
  xl:  '1280px',
  '2xl': '1536px',
}
```

### Mobile Adaptations

```typescript
// ProfileCard
desktop: 'flex-row items-center',
mobile:  'flex-col items-start',

// ScoreCard
desktop: 'grid grid-cols-2',  // Score + Radar
mobile:  'flex flex-col',      // Stack vertical

// PostGrid
desktop: 'grid-cols-4',
tablet:  'grid-cols-3',
mobile:  'grid-cols-2',

// Sidebar
desktop: 'w-64 fixed',
tablet:  'w-20 fixed',
mobile:  'hidden', // Bottom tab bar
```

### Mobile Navigation (Bottom Tab Bar)

```
┌────────────────────────────────────────────────────────┐
│  [Content Area]                                        │
│                                                        │
│                                                        │
└────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────┐
│  🏠         ➕         📊         🔄         👤        │
│  Home      Nova      Perfis    Comparar   Perfil      │
└────────────────────────────────────────────────────────┘
```

---

## Acessibilidade

### Contraste (WCAG AA)

```typescript
// Mínimo 4.5:1 para texto normal
textContrast: {
  'neutral-50 on neutral-900':  '18.5:1',  // ✅
  'neutral-400 on neutral-900': '6.2:1',   // ✅
  'primary-500 on neutral-900': '7.8:1',   // ✅
}

// Mínimo 3:1 para texto grande (18px+)
largeTextContrast: {
  'neutral-500 on neutral-900': '4.1:1',   // ✅
}
```

### Focus States

```typescript
focusRing: {
  // Sempre visível (não usar outline-none sem substituir)
  DEFAULT: 'ring-2 ring-primary-500 ring-offset-2 ring-offset-neutral-900',
  error:   'ring-2 ring-error-500 ring-offset-2 ring-offset-neutral-900',
}

// Keyboard navigation
keyboardOnly: 'focus-visible:ring-2',
```

### ARIA Labels

```typescript
// Sempre adicionar em:
- Ícones sem texto: aria-label="Nova Análise"
- Links: aria-current="page" para active
- Botões: aria-busy="true" para loading
- Inputs: aria-invalid="true" + aria-describedby="error-id"
- Modals: role="dialog" + aria-modal="true"
- Tabs: role="tablist" + aria-selected="true"
```

### Keyboard Navigation

```typescript
// Tab order natural (sem tabindex > 0)
// Esc fecha modals/dropdowns
// Enter/Space ativa botões
// Arrow keys navegam entre tabs/radio groups
```

### Screen Readers

```typescript
// Usar sr-only para contexto extra
<span className="sr-only">Score:</span>
<span aria-label="87 pontos">87</span>

// Loading states
<div role="status" aria-live="polite">
  Carregando análise...
</div>
```

---

## Animações e Transições

### Duração

```typescript
transitionDuration: {
  fast:    '150ms',  // Hover, focus
  normal:  '300ms',  // Page transitions, modals
  slow:    '500ms',  // Complex animations
}
```

### Easing

```typescript
transitionTimingFunction: {
  DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',  // Ease
  in:      'cubic-bezier(0.4, 0, 1, 1)',
  out:     'cubic-bezier(0, 0, 0.2, 1)',
  bounce:  'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
}
```

### Microinterações

```typescript
// Button Click
onClick: {
  transform: 'scale(0.98)',
  transition: 'transform 150ms',
}

// Card Hover
hover: {
  transform: 'translateY(-2px)',
  boxShadow: 'lg',
  transition: 'all 300ms',
}

// Modal Enter
enter: {
  opacity: '0 → 1',
  scale: '0.95 → 1',
  transition: 'all 300ms ease-out',
}

// Progress Bar
progress: {
  width: 'transition-all 500ms ease-out',
  background: 'animate-gradient',
}

// Skeleton Loading
skeleton: {
  animation: 'pulse 2s ease-in-out infinite',
  background: 'linear-gradient(90deg, neutral-800 0%, neutral-700 50%, neutral-800 100%)',
  backgroundSize: '200% 100%',
}
```

### Page Transitions

```typescript
// Next.js App Router (framer-motion)
pageTransition: {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
}
```

### Loading States

```typescript
// Spinner
<div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-700 border-t-primary-500" />

// Skeleton
<div className="animate-pulse bg-neutral-800 rounded-md h-4 w-full" />

// Progress Bar com Gradient Animado
<div className="relative h-2 bg-neutral-800 rounded-full overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-info-500 animate-gradient" style={{ width: '65%' }} />
</div>
```

---

## Implementação (Tailwind CSS)

### Config File

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { /* ... */ },
        neutral: { /* ... */ },
        success: { /* ... */ },
        warning: { /* ... */ },
        error: { /* ... */ },
        info: { /* ... */ },
      },
      fontFamily: {
        sans: ['Inter Variable', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      animation: {
        gradient: 'gradient 3s ease infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

---

## Bibliotecas Recomendadas

```json
{
  "ui": "shadcn/ui (headless components)",
  "charts": "recharts (composable charts)",
  "icons": "lucide-react (consistent icon set)",
  "animations": "framer-motion (page transitions)",
  "forms": "react-hook-form + zod (validation)",
  "toasts": "sonner (notifications)",
  "modals": "radix-ui/dialog (accessible modals)",
  "tooltips": "radix-ui/tooltip (accessible tooltips)"
}
```

---

## Checklist de Implementação

### Fase 1: Fundação
- [ ] Configurar Tailwind com design tokens
- [ ] Instalar shadcn/ui base components
- [ ] Criar componentes base (Button, Badge, Card, Input)
- [ ] Setup dark mode (next-themes)

### Fase 2: Layout
- [ ] Criar AppLayout (Sidebar + Main)
- [ ] Implementar PageHeader component
- [ ] Mobile Navigation (Bottom Tab Bar)
- [ ] Responsive breakpoints

### Fase 3: Componentes Específicos
- [ ] ProfileCard
- [ ] ScoreCard com Radar Chart
- [ ] AuditorSection
- [ ] ProgressTracker
- [ ] ComparisonChart
- [ ] QuickWinsList
- [ ] PostGrid com lazy loading

### Fase 4: Páginas
- [ ] Dashboard Home
- [ ] Nova Análise (Form + Progress)
- [ ] Perfil (Overview)
- [ ] Auditoria (Score + Análise)
- [ ] Comparação (Before/After)
- [ ] Posts (Gallery)

### Fase 5: Polish
- [ ] Loading states (Skeleton)
- [ ] Error states (Empty, Error)
- [ ] Toasts (Success, Error, Info)
- [ ] Page transitions (Framer Motion)
- [ ] Acessibilidade (ARIA, Focus, Keyboard)

---

**Próximo Passo:** Ver wireframes detalhados em `wireframes.md`
