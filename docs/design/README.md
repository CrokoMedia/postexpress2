# Design Documentation - Instagram Audit Dashboard

Sistema completo de UI/UX para dashboard de auditoria de perfis do Instagram.

---

## Documentação Disponível

### 1. [UI/UX Design System](./ui-ux-design-system.md)
**O que é:** Especificação completa do design system (cores, tipografia, componentes base)

**Conteúdo:**
- Design Tokens (cores, tipografia, espaçamento)
- Componentes Base (Button, Badge, Card, Input, Progress, Skeleton)
- Componentes Compostos (ProfileCard, ScoreCard, AuditorSection, etc.)
- Layout System (Grid, Sidebar, Container)
- Responsividade (Breakpoints, Adaptações Mobile)
- Acessibilidade (WCAG 2.1 AA)
- Animações e Transições

**Quando usar:** Referência para todas as decisões de design visual

---

### 2. [Wireframes](./wireframes.md)
**O que é:** Wireframes ASCII de todas as páginas do dashboard

**Conteúdo:**
- Dashboard Home (lista de perfis)
- Nova Análise (formulário + progresso em tempo real)
- Perfil Overview (visão geral + histórico)
- Auditoria Completa (score + auditores + quick wins)
- Comparação Temporal (before/after)
- Galeria de Posts (grid com OCR)
- Mobile Views (responsive)

**Quando usar:** Entender layout e estrutura das páginas

---

### 3. [User Flows](./user-flows.md)
**O que é:** Fluxos de usuário, microinterações e casos de uso

**Conteúdo:**
- Fluxo Principal: Nova Análise (jornada completa)
- Fluxo Secundário: Explorar Auditoria
- Fluxo Terciário: Comparação Temporal
- Microinterações (hover, loading, transitions)
- Estados e Feedbacks (loading, empty, error, success)
- Casos de Uso (4 personas diferentes)
- Métricas de UX (performance, engagement, satisfaction)
- Testes de Usabilidade

**Quando usar:** Entender comportamento e interações do usuário

---

### 4. [Component Specifications](./component-specs.md)
**O que é:** Especificações técnicas de componentes React/TypeScript

**Conteúdo:**
- Convenções de Código (naming, structure, imports)
- Atoms (Button, Badge, Card, Progress, Skeleton)
- Molecules (ProfileCard, ScoreCard, ProgressTracker)
- Organisms (Sidebar)
- Utilities (formatters, helpers)
- TypeScript Types (Profile, Audit, Post, Comment, Comparison)

**Quando usar:** Implementar componentes no código

---

## Quick Start

### Para Designers

1. **Leia primeiro:** [UI/UX Design System](./ui-ux-design-system.md)
   - Entenda design tokens e componentes base
   - Veja paleta de cores e tipografia

2. **Explore layouts:** [Wireframes](./wireframes.md)
   - Visualize estrutura de cada página
   - Entenda hierarquia de informação

3. **Valide fluxos:** [User Flows](./user-flows.md)
   - Teste jornadas de usuário
   - Identifique pontos de decisão

### Para Desenvolvedores

1. **Setup inicial:**
   ```bash
   # Install dependencies
   npm install

   # Setup Tailwind CSS (já configurado)
   # Setup shadcn/ui
   npx shadcn-ui@latest init

   # Install component dependencies
   npm install framer-motion recharts lucide-react
   ```

2. **Siga especificações:** [Component Specs](./component-specs.md)
   - Copie código dos componentes base
   - Use convenções de naming
   - Implemente types TypeScript

3. **Implemente páginas:** [Wireframes](./wireframes.md)
   - Siga layout exato dos wireframes
   - Use componentes já criados
   - Mantenha responsividade

### Para Product Managers

1. **Entenda valor:** [User Flows](./user-flows.md)
   - Veja casos de uso reais
   - Identifique quick wins
   - Valide métricas de sucesso

2. **Planeje roadmap:** [Wireframes](./wireframes.md)
   - Priorize features por página
   - Defina MVPs
   - Estime esforço

---

## Stack Tecnológico

### Frontend Framework
```json
{
  "framework": "Next.js 15 (App Router)",
  "language": "TypeScript 5.x",
  "styling": "Tailwind CSS 3.x",
  "components": "shadcn/ui (Radix UI)",
  "animations": "Framer Motion",
  "charts": "Recharts",
  "icons": "Lucide React",
  "forms": "React Hook Form + Zod",
  "state": "Zustand (opcional)",
  "data-fetching": "SWR ou TanStack Query"
}
```

### UI Libraries
```json
{
  "ui": "shadcn/ui",
  "toast": "sonner",
  "modals": "@radix-ui/dialog",
  "tooltips": "@radix-ui/tooltip",
  "dropdowns": "@radix-ui/dropdown-menu",
  "tabs": "@radix-ui/tabs"
}
```

### Development Tools
```json
{
  "storybook": "Component development",
  "playwright": "E2E testing",
  "vitest": "Unit testing",
  "eslint": "Code linting",
  "prettier": "Code formatting",
  "chromatic": "Visual regression testing"
}
```

---

## Estrutura de Diretórios

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/
│   │   ├── page.tsx        # Dashboard Home
│   │   ├── new/
│   │   │   └── page.tsx    # Nova Análise
│   │   ├── profiles/
│   │   │   ├── page.tsx    # Lista Perfis
│   │   │   └── [username]/
│   │   │       ├── page.tsx         # Perfil Overview
│   │   │       ├── audits/
│   │   │       │   └── [id]/
│   │   │       │       └── page.tsx # Auditoria
│   │   │       └── posts/
│   │   │           └── page.tsx     # Posts
│   │   └── comparisons/
│   │       ├── page.tsx    # Lista Comparações
│   │       └── [id]/
│   │           └── page.tsx         # Comparação
│   └── layout.tsx          # Root Layout
│
├── components/
│   ├── ui/                 # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── atoms/              # Atomic components
│   │   ├── badge.tsx
│   │   ├── progress.tsx
│   │   └── skeleton.tsx
│   ├── molecules/          # Molecule components
│   │   ├── profile-card.tsx
│   │   ├── score-card.tsx
│   │   └── progress-tracker.tsx
│   ├── organisms/          # Organism components
│   │   ├── sidebar.tsx
│   │   ├── page-header.tsx
│   │   └── auditor-section.tsx
│   └── templates/          # Page templates
│       ├── dashboard-layout.tsx
│       └── page-layout.tsx
│
├── lib/
│   ├── utils.ts            # Utility functions
│   ├── format.ts           # Format helpers
│   └── cn.ts               # Class name merger
│
├── hooks/
│   ├── use-toast.ts
│   ├── use-media-query.ts
│   └── use-profile-data.ts
│
├── types/
│   └── index.ts            # Shared types
│
├── styles/
│   └── globals.css         # Global styles
│
└── config/
    └── site.ts             # Site config
```

---

## Fases de Implementação

### Fase 1: Fundação (3-5 dias)
**Objetivo:** Setup completo do projeto

```
[ ] Configurar Next.js 15 + TypeScript
[ ] Setup Tailwind CSS com design tokens
[ ] Instalar shadcn/ui base components
[ ] Configurar dark mode (next-themes)
[ ] Setup Supabase client
[ ] Criar AppLayout (Sidebar + Main)
[ ] Implementar Sidebar responsiva
[ ] Mobile Navigation (Bottom Tabs)
```

**Critério de Sucesso:**
- Dark mode funcionando
- Sidebar responsiva (desktop/tablet/mobile)
- Design tokens aplicados

---

### Fase 2: Componentes Base (5-7 dias)
**Objetivo:** Biblioteca de componentes reutilizáveis

```
Atoms:
[ ] Button (4 variants, 3 sizes, loading state)
[ ] Badge (5 variants, dot option)
[ ] Card (3 variants, hoverable)
[ ] Input (validation, error states)
[ ] Progress (2 variants, label option)
[ ] Skeleton (3 variants)

Molecules:
[ ] ProfileCard
[ ] ScoreCard (com Radar Chart)
[ ] ProgressTracker
[ ] QuickWinItem
[ ] AuditorHeader
```

**Critério de Sucesso:**
- Todos os componentes no Storybook
- Testes unitários passando
- Acessibilidade validada

---

### Fase 3: Páginas Principais (10-14 dias)
**Objetivo:** Implementar todas as páginas

```
[ ] Dashboard Home
    - Lista de perfis
    - Stats cards
    - Filtros e busca

[ ] Nova Análise
    - Formulário
    - Validação em tempo real
    - Progress tracker
    - Success/Error states

[ ] Perfil Overview
    - Header com avatar
    - Histórico de auditorias
    - Gráfico de evolução

[ ] Auditoria Completa
    - Score Card
    - Quick Wins (checkable)
    - Auditores (collapsible)
    - Download PDF

[ ] Comparação Temporal
    - Seleção de auditorias
    - Before/After cards
    - Gráficos de evolução
    - Insights

[ ] Galeria de Posts
    - Grid responsivo
    - Filtros (OCR, Ofertas)
    - Modal de detalhes
    - Lazy loading
```

**Critério de Sucesso:**
- Todas as páginas navegáveis
- Responsivas (mobile/tablet/desktop)
- Loading states implementados

---

### Fase 4: Integrações (7-10 dias)
**Objetivo:** Conectar com backend e APIs

```
[ ] Setup Supabase client
[ ] Implementar queries (SWR/TanStack Query)
[ ] CRUD de perfis
[ ] CRUD de auditorias
[ ] Real-time updates (análise em progresso)
[ ] Upload de imagens (Cloudinary)
[ ] Geração de PDF (relatórios)
```

**Critério de Sucesso:**
- Dados reais carregando
- Mutations funcionando
- Real-time updates ativos

---

### Fase 5: Polish & Testes (5-7 dias)
**Objetivo:** Refinamento e qualidade

```
[ ] Animações e transições (Framer Motion)
[ ] Empty states (todas as páginas)
[ ] Error states (404, 500, network)
[ ] Success feedbacks (toasts)
[ ] Acessibilidade (ARIA, Focus, Keyboard)
[ ] Testes E2E (Playwright)
[ ] Performance optimization (Core Web Vitals)
[ ] SEO (meta tags, OG images)
```

**Critério de Sucesso:**
- Lighthouse Score > 90
- Acessibilidade WCAG AA
- E2E tests passando
- Zero console errors

---

## Métricas de Qualidade

### Performance
```
✅ Lighthouse Performance: > 90
✅ First Contentful Paint: < 1.5s
✅ Time to Interactive: < 2.5s
✅ Cumulative Layout Shift: < 0.1
```

### Acessibilidade
```
✅ WCAG 2.1 Level AA
✅ Lighthouse Accessibility: > 95
✅ Keyboard navigation: 100%
✅ Screen reader support: Completo
```

### Code Quality
```
✅ TypeScript: Strict mode
✅ ESLint: Zero errors
✅ Test coverage: > 80%
✅ Bundle size: < 500KB (gzipped)
```

---

## Recursos Adicionais

### Design
- **Figma:** (criar protótipo de alta fidelidade)
- **Storybook:** Component library interativa
- **Chromatic:** Visual regression testing

### Documentação
- **Design Tokens:** Tailwind config
- **Component API:** Storybook docs
- **User Flows:** Miro/FigJam boards

### Testes
- **Unit:** Vitest + React Testing Library
- **E2E:** Playwright
- **Visual:** Chromatic
- **Performance:** Lighthouse CI

---

## Contribuindo

### Guidelines
1. Sempre seguir design system (cores, tipografia, espaçamento)
2. Criar componentes reutilizáveis (DRY)
3. Manter acessibilidade (ARIA labels, focus states)
4. Escrever testes (unit + E2E)
5. Documentar no Storybook

### Pull Request Checklist
```
[ ] Design system respeitado
[ ] Responsivo (mobile/tablet/desktop)
[ ] Acessível (keyboard + screen reader)
[ ] Testado (unit + E2E)
[ ] Documentado (Storybook)
[ ] Performance OK (Lighthouse)
```

---

## Contatos

**Design Lead:** @ux-design-expert
**Frontend Lead:** @dev
**Product Owner:** @po

---

## Changelog

### v1.0 (2026-02-16)
- Design system completo
- Wireframes de todas as páginas
- User flows mapeados
- Component specs (React/TypeScript)
- Documentação inicial

---

**Próximos Passos:**
1. Criar protótipo de alta fidelidade no Figma
2. Implementar componentes base (Atoms)
3. Construir páginas principais
4. Setup Storybook
5. Testes E2E
