# Post Express - Web Application

Aplicação Next.js 15 completa para o sistema de auditoria de perfis do Instagram.

## Stack Técnica

- **Framework**: Next.js 15 (App Router)
- **TypeScript**: Strict mode
- **Styling**: Tailwind CSS 3.4
- **UI Components**: Custom Design System (Atomic Design)
- **Database**: Supabase (PostgreSQL)
- **Data Fetching**: SWR
- **State Management**: React Hooks
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **Toasts**: Sonner

## Instalação

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Preencha as seguintes variáveis obrigatórias:

```env
# Supabase (obrigatório)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Next.js Public
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000

# APIs externas (para integração com scripts)
APIFY_API_TOKEN=apify_api_xxxxxxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx
GOOGLE_AI_API_KEY=xxxxxxxxxxxxxxxx

# Cloudinary (para imagens)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxxxxxxxxx
```

### 3. Configurar Banco de Dados Supabase

Execute o schema SQL no seu projeto Supabase:

```bash
# Acesse o SQL Editor no Supabase Dashboard
# Cole e execute o conteúdo de: database/optimized-schema.sql
```

Ou via CLI:

```bash
supabase db push
```

### 4. Rodar em Desenvolvimento

```bash
npm run dev
```

Acesse http://localhost:3000

### 5. Build de Produção

```bash
npm run build
npm start
```

## Estrutura do Projeto

```
postexpress2/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── profiles/             # Perfis
│   │   ├── audits/               # Auditorias
│   │   ├── analysis/             # Iniciar análise
│   │   └── comparisons/          # Comparações
│   ├── dashboard/                # Páginas do Dashboard
│   │   ├── page.tsx              # Home (listagem)
│   │   ├── new/                  # Nova Análise
│   │   ├── profiles/[id]/        # Perfil detalhado
│   │   ├── audits/[id]/          # Auditoria completa
│   │   └── comparisons/[id]/     # Comparação temporal
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Redirect to dashboard
│   └── globals.css               # Global styles
├── components/
│   ├── atoms/                    # Componentes básicos
│   │   ├── button.tsx
│   │   ├── badge.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── progress.tsx
│   │   └── skeleton.tsx
│   ├── molecules/                # Componentes compostos
│   │   ├── profile-card.tsx
│   │   ├── score-card.tsx
│   │   ├── post-card.tsx
│   │   └── page-header.tsx
│   ├── organisms/                # Componentes complexos
│   │   ├── sidebar.tsx
│   │   └── auditor-section.tsx
│   └── templates/                # Templates de página
│       └── dashboard-layout.tsx
├── hooks/                        # Custom React Hooks
│   ├── use-profiles.ts
│   ├── use-audit.ts
│   └── use-analysis-status.ts
├── lib/                          # Utilities
│   ├── supabase.ts               # Supabase client
│   ├── utils.ts                  # Utility functions
│   └── format.ts                 # Formatters
├── types/                        # TypeScript types
│   └── database.ts               # Database types
├── scripts/                      # Node.js scripts (backend)
│   ├── complete-post-analyzer.js
│   ├── ocr-gemini-analyzer.js
│   └── instagram-scraper-apify.js
├── database/                     # Database schemas
│   └── optimized-schema.sql
└── docs/                         # Documentação
    └── design/                   # Design system docs
```

## Páginas Implementadas

### 1. Dashboard Home (`/dashboard`)
- Lista todos os perfis analisados
- Mostra última auditoria de cada perfil
- Quick actions (ver perfil, ver auditoria)

### 2. Nova Análise (`/dashboard/new`)
- Formulário para iniciar análise
- Configurações: username, quantidade de posts, skip OCR
- Progress bar em tempo real
- Polling de status (2s interval)

### 3. Perfil (`/dashboard/profiles/[id]`)
- Informações do perfil (bio, foto, stats)
- Histórico de auditorias
- Comparações temporais

### 4. Auditoria (`/dashboard/audits/[id]`)
- Score geral e classificação
- 5 dimensões (Behavior, Copy, Offers, Metrics, Anomalies)
- Análise detalhada de cada auditor
- Estatísticas de engajamento
- Posts analisados (grid)

### 5. Comparação (`/dashboard/comparisons/[id]`) - TODO
- Antes vs Depois
- Crescimento de métricas
- Melhoria de scores
- ROI summary

## API Routes

### GET `/api/profiles`
Lista todos os perfis com última auditoria

**Query params:**
- `limit`: número de resultados (default: 20)
- `offset`: paginação (default: 0)

### GET `/api/profiles/[id]`
Busca perfil específico com todas auditorias

### GET `/api/audits/[id]`
Busca auditoria completa com posts e perfil

### POST `/api/analysis`
Inicia nova análise

**Body:**
```json
{
  "username": "frankcosta",
  "post_limit": 10,
  "skip_ocr": false,
  "audit_type": "express"
}
```

**Response:**
```json
{
  "queue_id": "uuid",
  "status": "queued",
  "message": "Analysis queued successfully",
  "estimated_time": "20 seconds"
}
```

### GET `/api/analysis/[id]`
Busca status da análise (polling)

**Response:**
```json
{
  "id": "uuid",
  "status": "processing",
  "progress": 65,
  "current_phase": "ocr",
  "username": "frankcosta",
  "result": null | { audit data }
}
```

### POST `/api/comparisons`
Cria comparação entre duas auditorias

### GET `/api/comparisons`
Lista comparações (opcional: filtro por profile_id)

## Integração com Scripts Existentes

A aplicação Next.js **não substitui** os scripts existentes em `scripts/`. Ela apenas:

1. **Chama os scripts** via API routes
2. **Salva resultados** no Supabase
3. **Exibe dados** na interface

### Fluxo de Análise:

```
1. Usuário clica "Nova Análise"
2. POST /api/analysis cria entrada em analysis_queue
3. Worker (TODO Task #8) pega item da fila
4. Worker executa scripts em ordem:
   - scripts/instagram-scraper-apify.js
   - scripts/ocr-gemini-analyzer.js (se !skip_ocr)
   - scripts/complete-post-analyzer.js
5. Worker salva resultado no Supabase
6. Frontend detecta conclusão via polling
7. Redireciona para /dashboard/audits/[id]
```

## Design System

Seguindo Atomic Design:

### Tokens
- **Colors**: Primary (purple), Neutrals, Semantic (success, warning, error)
- **Typography**: Inter (sans), JetBrains Mono (mono)
- **Spacing**: 4px grid (1-24)
- **Radius**: sm (4px), default (8px), md (12px), lg (16px)

### Componentes
- **Atoms**: Button, Badge, Card, Input, Progress, Skeleton
- **Molecules**: ProfileCard, ScoreCard, PostCard, PageHeader
- **Organisms**: Sidebar, AuditorSection
- **Templates**: DashboardLayout

### Variantes
- **Button**: primary, secondary, ghost, danger
- **Badge**: success, warning, error, info, neutral
- **Sizes**: sm, md, lg

## Testing

```bash
# Type check
npm run typecheck

# Lint
npm run lint

# Build (verifica erros)
npm run build
```

## Deployment

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Configurar environment variables no dashboard da Vercel.

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Troubleshooting

### Erro: Module not found
```bash
rm -rf node_modules package-lock.json .next
npm install
```

### Supabase connection error
- Verifique se as URLs e keys estão corretas
- Confirme que RLS policies estão configuradas
- Teste conexão via Supabase Dashboard

### Tailwind não aplicando estilos
- Verifique `tailwind.config.ts` content paths
- Reinicie dev server (`npm run dev`)
- Limpe cache: `rm -rf .next`

### TypeScript errors
```bash
npm run typecheck
```

## Próximos Passos (Pendentes)

- [ ] Implementar worker/analysis-worker.ts (Task #8)
- [ ] Criar página de Comparações (`/dashboard/comparisons/[id]`)
- [ ] Adicionar filtros e busca no Dashboard
- [ ] Implementar paginação na listagem
- [ ] Adicionar autenticação (Supabase Auth)
- [ ] Criar testes unitários (Jest + React Testing Library)
- [ ] Adicionar E2E tests (Playwright)
- [ ] Otimizar imagens (next/image optimization)
- [ ] Adicionar error boundaries
- [ ] Implementar skeleton states para SSR
- [ ] Adicionar analytics (Vercel Analytics)

## Suporte

Para questões técnicas, consulte:
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

**Desenvolvido por:** Pazos Media
**Versão:** 1.0.0
**Data:** Fevereiro 2026
