# 📦 Arquivos e Pastas Essenciais - Post Express

> Lista completa de arquivos necessários para deploy em produção

---

## ✅ ARQUIVOS OBRIGATÓRIOS (Root)

```
postexpress2/
├── package.json ✅ CRÍTICO - Dependências e scripts
├── package-lock.json ✅ CRÍTICO - Versões exatas (npm ci)
├── tsconfig.json ✅ CRÍTICO - Configuração TypeScript
├── next.config.mjs ✅ CRÍTICO - Configuração Next.js
├── tailwind.config.ts ✅ CRÍTICO - Configuração Tailwind
├── postcss.config.js ✅ CRÍTICO - Configuração PostCSS
├── Dockerfile ✅ CRÍTICO - Build do container
└── .dockerignore ✅ CRÍTICO - Otimiza build Docker
```

---

## 📁 PASTAS OBRIGATÓRIAS

### `app/` - Next.js App Router ✅ CRÍTICO
```
app/
├── layout.tsx ✅ Layout raiz
├── page.tsx ✅ Home page
├── globals.css ✅ Estilos globais
├── api/ ✅ API Routes
│   ├── whatsapp/ ✅ Integração WhatsApp
│   │   ├── webhook/route.ts ✅ Receber mensagens
│   │   └── send/route.ts ✅ Enviar mensagens
│   ├── content/ ✅ Gestão de conteúdo
│   │   └── [id]/
│   │       ├── route.ts ✅ CRUD conteúdo
│   │       ├── approve/route.ts ✅ Aprovação
│   │       ├── generate-slides-v3/route.ts ✅ Gerar slides (Puppeteer)
│   │       ├── preview-carousel/route.ts ✅ Preview
│   │       ├── export-zip/route.ts ✅ Download ZIP
│   │       └── export-drive/route.ts ✅ Google Drive
│   ├── profiles/route.ts ✅ CRUD perfis
│   ├── audits/route.ts ✅ CRUD auditorias
│   └── health/route.ts ✅ Health check
└── dashboard/ ✅ Interface usuário
    ├── page.tsx ✅ Dashboard principal
    ├── new/page.tsx ✅ Nova análise
    ├── profiles/[id]/page.tsx ✅ Perfil detalhado
    └── audits/[id]/page.tsx ✅ Auditoria completa
```

### `components/` - Design System ✅ CRÍTICO
```
components/
├── atoms/ ✅ Componentes básicos
│   ├── Button.tsx
│   ├── Badge.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Progress.tsx
│   └── Skeleton.tsx
├── molecules/ ✅ Componentes compostos
│   ├── ProfileCard.tsx
│   ├── ScoreCard.tsx
│   ├── PostCard.tsx
│   └── PageHeader.tsx
├── organisms/ ✅ Componentes complexos
│   ├── Sidebar.tsx
│   └── AuditorSection.tsx
└── templates/ ✅ Layouts
    └── DashboardLayout.tsx
```

### `lib/` - Utilities ✅ CRÍTICO
```
lib/
├── supabase.ts ✅ Cliente Supabase
├── cloudinary.ts ✅ Upload Cloudinary
├── google-drive.ts ✅ Google Drive API
├── puppeteer-renderer.ts ✅ CRÍTICO - Renderização de slides
├── claude-api.ts ✅ Anthropic Claude SDK
├── utils.ts ✅ Helpers gerais
└── format.ts ✅ Formatação de dados
```

### `types/` - TypeScript Types ✅ CRÍTICO
```
types/
├── database.types.ts ✅ Tipos Supabase (gerado)
├── content.ts ✅ Tipos de conteúdo
└── api.ts ✅ Tipos de API
```

### `templates/` - Templates Visuais ✅ CRÍTICO
```
templates/
└── puppeteer/ ✅ Templates HTML/CSS para slides
    ├── minimalist/ ✅ Design minimalista
    │   ├── feed.html
    │   ├── story.html
    │   └── square.html
    ├── hormozi-dark/ ✅ Design Hormozi
    │   ├── feed.html
    │   ├── story.html
    │   └── square.html
    ├── neon-social/ ✅ Design neon
    ├── editorial-magazine/ ✅ Design editorial
    └── data-driven/ ✅ Design data-driven
```

### `remotion/` - Remotion Compositions ✅ CRÍTICO
```
remotion/
├── Root.tsx ✅ Composição raiz
├── compositions/ ✅ Cenas Remotion
│   ├── CarouselSlide.tsx
│   ├── HormoziSlide.tsx
│   └── MinimalistSlide.tsx
└── utils/ ✅ Helpers Remotion
    └── constants.ts
```

### `public/` - Assets Públicos ✅ CRÍTICO
```
public/
├── fonts/ ✅ Fontes customizadas
│   ├── inter/
│   ├── jetbrains-mono/
│   └── space-grotesk/
└── images/ ✅ Imagens estáticas
    └── placeholder-avatar.png
```

### `hooks/` - Custom React Hooks ✅
```
hooks/
├── useDebounce.ts ✅ Debounce
└── useToast.ts ✅ Toast notifications
```

---

## 📄 ARQUIVOS DE CONFIGURAÇÃO

### TypeScript
```
tsconfig.json ✅ Configuração TypeScript
```

### Next.js
```
next.config.mjs ✅ Configuração Next.js
```

### Tailwind CSS
```
tailwind.config.ts ✅ Design tokens
postcss.config.js ✅ PostCSS plugins
```

### Docker
```
Dockerfile ✅ Build multi-stage
.dockerignore ✅ Otimização build
```

### Git
```
.gitignore ✅ Arquivos ignorados
```

---

## ❌ ARQUIVOS/PASTAS QUE **NÃO** VÃO PARA PRODUÇÃO

### Dados Locais (gitignored)
```
❌ minds/ - Dados de ETL local
❌ temp/ - Arquivos temporários
❌ squad-auditores/data/ - Análises locais
❌ squad-auditores/output/ - Relatórios locais
❌ content-creation-squad/generated/ - Conteúdos gerados localmente
❌ content-distillery/ - Destilações locais
❌ expansion-packs/ - Ferramentas de desenvolvimento
❌ post-express-template/ - Templates de teste
```

### Frameworks de Desenvolvimento (gitignored)
```
❌ .aios-core/ - AIOS Framework
❌ .claude/ - Claude Code settings
❌ .cursor/ - Cursor IDE
❌ .gemini/ - Gemini settings
❌ .agent/ - Agent configs
❌ .agents/ - Agents data
❌ .antigravity/ - Antigravity configs
```

### Build Outputs (gerados no container)
```
❌ node_modules/ - Dependências (npm ci no build)
❌ .next/ - Build Next.js (gerado no build)
❌ out/ - Export estático
❌ dist/ - Build output
❌ .remotion-bundle/ - Bundle Remotion (gerado no build)
```

### Testing & Development
```
❌ __tests__/ - Testes unitários
❌ coverage/ - Coverage reports
❌ test-results/ - Resultados Playwright
❌ playwright-report/ - Relatórios Playwright
```

### IDE & OS
```
❌ .vscode/ - VS Code settings
❌ .idea/ - JetBrains settings
❌ .DS_Store - macOS metadata
```

### Documentação (útil, mas não crítica em runtime)
```
❌ README.md
❌ README-APP.md
❌ CLAUDE.md
❌ DEPLOY-DIGITAL-OCEAN.md
❌ docs/ - Documentação completa
❌ design/ - Assets de design
❌ SobreCrokolabs/ - Briefings
```

### Environment & Secrets
```
❌ .env - Variáveis locais (configuradas no Digital Ocean)
❌ .env.local - Desenvolvimento local
❌ .env.production - Produção local
❌ SECRETS-*.txt - Chaves secretas
```

---

## 📊 Tamanho do Build Context

### SEM .dockerignore
```
Build context: ~850 MB
Inclui: node_modules, .git, minds/, temp/, .next/, etc.
Tempo de upload: 3-5 minutos
```

### COM .dockerignore ✅
```
Build context: ~15 MB
Inclui: apenas código-fonte necessário
Tempo de upload: 10-20 segundos
```

**Redução:** ~98% menor! 🚀

---

## 🔍 Como Verificar Tamanho

### Localmente
```bash
# Simular build Docker
docker build -t postexpress-test .

# Ver tamanho do context
docker image ls postexpress-test

# Ver arquivos que vão para o build
docker build --no-cache -t test . 2>&1 | grep "Sending build context"
```

### Digital Ocean
```bash
# Via doctl
doctl apps create-deployment <app-id> --verbose
```

Os logs mostrarão:
```
Step 1/X : FROM node:18
Sending build context to Docker daemon: 15.2 MB ✅
```

---

## ✅ Checklist de Verificação

Antes do deploy, garanta que tem:

- [ ] `Dockerfile` testado localmente
- [ ] `.dockerignore` criado e otimizado
- [ ] `package.json` e `package-lock.json` commitados
- [ ] `app/`, `components/`, `lib/`, `types/` completos
- [ ] `templates/puppeteer/` com todos os designs
- [ ] `remotion/` com composições
- [ ] `public/fonts/` com fontes necessárias
- [ ] `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts` configurados
- [ ] `.env.example` atualizado com todas as variáveis
- [ ] Variáveis de ambiente preparadas para Digital Ocean

---

## 🎯 Resumo Executivo

### Arquivos CRÍTICOS (não funciona sem)
1. `Dockerfile` ← Build do container
2. `package.json` + `package-lock.json` ← Dependências
3. `app/` ← Next.js App Router
4. `lib/puppeteer-renderer.ts` ← Renderização de slides
5. `templates/puppeteer/` ← Templates visuais
6. `components/` ← Design System
7. `tsconfig.json` + `next.config.mjs` + `tailwind.config.ts` ← Configurações

### Tamanho Total (código-fonte)
```
~15 MB (sem node_modules, .next, .git)
```

### Tamanho Final (container pronto)
```
~800 MB (com node_modules instalado e Next.js buildado)
```

---

*Lista atualizada em 2026-02-28*
*Post Express v1.0 - Croko Lab*
