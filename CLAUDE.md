# CLAUDE.md - Croko Lab

> Contexto completo do projeto para o Claude Code.
> Leia este arquivo antes de qualquer tarefa no repositório.

---

## 🎯 O QUE É O CROKO LAB

**Croko Lab é o laboratório de conteúdo científico da Agência Croko.**

Não é um "app", não é "software", não é "SaaS", não é "ferramenta de IA". É um **serviço que transforma creators de achistas em estrategistas data-driven**.

### O que entregamos:
1. **Croko Audit** - Análise profunda de qualquer perfil do Instagram em 3 minutos
2. **Perguntas do público** - Exatamente o que a audiência pergunta nos comentários (= ideias infinitas de conteúdo)
3. **Leitura dos slides** - Extraímos o texto completo de carrosséis dos concorrentes (ninguém mais faz isso)
4. **5 frameworks científicos** - Hormozi, Schwartz, Kahneman, Cagan, Paul Graham aplicados ao conteúdo

### Transformação entregue:
- **ANTES:** "Não sei o que postar, fico 4 horas travado sem ideia"
- **DEPOIS:** "Tenho 20 ideias acionáveis em 3 minutos, baseadas no que meu público realmente quer"

### Desenvolvido por:
**Agência Croko** | Versão 1.0 | Fevereiro 2026

---

## 🗣️ LINGUAGEM & POSICIONAMENTO

### ⛔ PALAVRAS PROIBIDAS (nunca usar em marketing/copy)
| Proibido | Usar no lugar |
|----------|--------------|
| IA / Inteligência Artificial | "análise avançada", "método científico" |
| OCR | "leitura dos slides", "extração de texto" |
| Scraping | "coleta de dados", "análise de perfil" |
| SaaS / Software / App / Ferramenta | "serviço", "auditoria", "método" |
| API / Backend / Pipeline | (nunca mencionar) |
| Automatizado / Robô | (nunca mencionar) |
| Machine Learning | (nunca mencionar) |
| Big Data / Analytics | "análise de dados", "insights" |

### ✅ PALAVRAS PODEROSAS (sempre priorizar)
- "Descubra exatamente"
- "Em 3 minutos"
- "Perguntas do seu público"
- "Texto dos slides dos concorrentes"
- "Nunca mais fique sem ideia"
- "De achista para estrategista"
- "Baseado em Hormozi / Kahneman"
- "Mesma auditoria que consultores cobram R$ 2.000"

### 🎯 Frase de posicionamento
> "Croko Lab: Laboratório de conteúdo científico que transforma creators de achistas em estrategistas. Descubra exatamente o que seu público pergunta, o que seus concorrentes fazem que funciona, e como replicar o sucesso deles — em 3 minutos."

---

## 👥 AVATARES (quem compramos)

| Avatar | Quem é | Dor Principal | CTA Certo |
|--------|--------|--------------|-----------|
| **Creator Solo** | 25-45 anos, 1k-100k seguidores, vende infoproduto ou mentoria | "Não sei o que postar, trava toda semana" | "Teste grátis, 3 auditorias" |
| **Agência Boutique** | 3-15 pessoas, atende creators e marcas | "Cliente pede resultado, demora 3 dias entregar auditoria" | "Entregue em 3 min o que levava 3 dias" |
| **Consultor de Conteúdo** | Freelancer que vende consultoria | "Quero cobrar R$ 500-2.000 por auditoria mas não tenho dados pra justificar" | "Venda auditoria por R$ 500 que custa centavos" |

---

## 🏆 OS 5 AUDITORES (frameworks do sistema)

| Auditor | Base | O que analisa |
|---------|------|--------------|
| **Kahneman** | Thinking Fast and Slow (Nobel Economia) | Comportamento da audiência, vieses, gatilhos emocionais |
| **Schwartz** | Breakthrough Advertising | Copy, hooks, awareness stages, linguagem |
| **Hormozi** | $100M Offers / $100M Leads | CTAs, ofertas, value equation |
| **Cagan** | Inspired (Silicon Valley) | Métricas que importam vs vanity metrics |
| **Paul Graham** | Y Combinator Essays | Padrões contraintuitivos, anomalias, insights escondidos |

---

## 📁 ESTRUTURA DO PROJETO

```
postexpress2/
├── app/                          # Next.js 15 App Router
│   ├── api/                      # API Routes (profiles, audits, analysis, queue)
│   └── dashboard/                # Interface do usuário
│       ├── page.tsx              # Home - lista de perfis
│       ├── new/                  # Nova análise
│       ├── profiles/[id]/        # Perfil detalhado
│       ├── audits/[id]/          # Auditoria completa
│       └── queue/                # Fila de análises
├── components/                   # Design System (Atomic Design)
│   ├── atoms/                    # Button, Badge, Card, Input, Progress, Skeleton
│   ├── molecules/                # ProfileCard, ScoreCard, PostCard, PageHeader
│   ├── organisms/                # Sidebar, AuditorSection
│   └── templates/                # DashboardLayout
├── scripts/                      # Scripts Node.js de análise
│   ├── complete-post-analyzer.js # Pipeline completo (recomendado)
│   ├── instagram-scraper-with-comments.js
│   ├── ocr-gemini-analyzer.js
│   └── ocr-mistral-analyzer.js
├── squad-auditores/              # Sistema de auditoria
│   ├── BRIEFING-TEMPLATE.md      # Template de briefing de clientes
│   ├── briefing-croko-lab.md   # Briefing do Croko Lab preenchido
│   ├── DNA-CONTEUDO-SPEC.md      # Especificação técnica do DNA
│   ├── SQUAD-DNA-CONTEUDO.md     # Composição do squad
│   ├── data/                     # JSONs de análises realizadas
│   └── output/                   # Relatórios gerados (.md)
├── database/                     # Schema SQL e migrações
│   └── optimized-schema.sql
├── worker/                       # Worker de processamento (em desenvolvimento)
├── hooks/                        # Custom React Hooks
├── lib/                          # Utilities (supabase, utils, format)
└── types/                        # TypeScript types
```

---

## 🛠️ STACK TÉCNICA

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Linguagem:** TypeScript (strict mode)
- **Estilo:** Tailwind CSS 3.4 + Design Tokens próprios
- **Dados:** SWR para data fetching
- **Animações:** Framer Motion
- **Gráficos:** Recharts
- **Ícones:** Lucide React
- **Toasts:** Sonner

### Backend / Database
- **BaaS:** Supabase (PostgreSQL)
- **Imagens:** Cloudinary (upload e CDN)

### Scripts de Análise (Node.js)
- **Scraping:** Apify Client (Instagram Profile Scraper)
- **OCR Primário:** Google Gemini Vision API
- **OCR Secundário:** Mistral API
- **OCR Local:** Tesseract.js (offline, gratuito)
- **IA:** Anthropic Claude SDK

### Variáveis de Ambiente necessárias
```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
APIFY_API_TOKEN=
ANTHROPIC_API_KEY=
GOOGLE_AI_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## 🔄 FLUXO DE ANÁLISE

```
Usuário digita @ do perfil
        ↓
POST /api/analysis → cria entrada na fila (analysis_queue)
        ↓
Worker processa:
  1. Scraping do perfil (Apify)
  2. Extração de comentários (Apify)
  3. OCR dos slides (Gemini/Mistral/Tesseract)
  4. Análise com 5 auditores
  5. Geração do relatório
        ↓
Resultado salvo no Supabase
        ↓
Frontend detecta via polling (2s)
        ↓
Redireciona para /dashboard/audits/[id]
```

**Tempo total:** ~3 minutos para 10 posts com OCR

**Custo por análise:** ~R$ 0,55 (Apify + APIs)

---

## 📊 BANCO DE DADOS (Supabase/PostgreSQL)

### Tabelas principais:
| Tabela | Propósito |
|--------|-----------|
| `profiles` | Perfis do Instagram analisados |
| `audits` | Resultado das auditorias (com scores dos 5 auditores) |
| `posts` | Posts individuais analisados |
| `analysis_queue` | Fila de análises em andamento |
| `comparisons` | Comparações temporais (antes/depois) |

### Campos importantes em `audits`:
- `behavior_score` → Kahneman
- `copy_score` → Schwartz
- `offers_score` → Hormozi
- `metrics_score` → Cagan
- `anomalies_score` → Paul Graham
- `overall_score` → Média ponderada

---

## 🎨 DESIGN SYSTEM

### Cores (tokens)
- **Primary:** Purple (cor principal da marca)
- **Success:** Green
- **Warning:** Yellow/Amber
- **Error:** Red
- **Neutral:** Grays

### Tipografia
- **Sans:** Inter
- **Mono:** JetBrains Mono

### Componentes (Atomic Design)
- **Atoms:** Button (4 variants), Badge (5 variants), Card, Input, Progress, Skeleton
- **Molecules:** ProfileCard, ScoreCard, PostCard, PageHeader
- **Organisms:** Sidebar, AuditorSection
- **Templates:** DashboardLayout

---

## 🚀 COMANDOS ÚTEIS

```bash
# Desenvolvimento
npm run dev          # Inicia servidor Next.js
npm run build        # Build de produção
npm run lint         # Verifica estilo de código
npm run typecheck    # Verifica tipos TypeScript

# Scripts de análise
node scripts/complete-post-analyzer.js <username> --limit=10
node scripts/complete-post-analyzer.js <username> --limit=5 --skip-ocr
node scripts/instagram-scraper-with-comments.js <username> --limit=20
node scripts/ocr-gemini-analyzer.js <username>

# Banco de dados
# Execute no SQL Editor do Supabase:
# database/optimized-schema.sql
```

---

## 🤖 SQUADS & AGENTES DISPONÍVEIS

### Squad Auditores (`/squad-auditores`)
**Quando usar:** Auditar perfis do Instagram, analisar concorrentes, gerar auditorias

### Content Creation Squad (`/content-creation-squad`)
**Quando usar:** Criar carrosséis, posts, copy de vendas, conteúdo de lançamento

### Content Distillery Squad (`/content-distillery`)
**Quando usar:** Transformar livestreams longos do YouTube em frameworks, modelos mentais e 60+ peças de conteúdo multiplataforma
**Pasta:** `content-distillery/` (na raiz do projeto)
**Comandos:**
- `*distill <URL>` → Pipeline completo (6 fases)
- `*extract <URL>` → Só extrair frameworks
- `*derive <path>` → Derivar conteúdo de frameworks existentes
- `*compare <pathA> <pathB>` → Comparar duas fontes

### AIOS Master (`@aios-master`)
**Quando usar:** Orchestrar agentes, criar stories de desenvolvimento

### Agentes de Desenvolvimento
- `@dev` → Implementar código
- `@architect` → Decisões de arquitetura
- `@qa` → Testes e qualidade
- `@pm` → Roadmap e priorização
- `@analyst` → Análise de dados

---

## ✅ TAREFAS PENDENTES (Estado Atual do MVP)

### Implementado (90%):
- [x] Next.js 15 + TypeScript + Tailwind
- [x] Supabase client e types
- [x] Design system completo (Atomic Design)
- [x] Layout e navegação (Sidebar)
- [x] API Routes (profiles, audits, analysis, comparisons)
- [x] Páginas: Dashboard, Nova Análise, Perfil, Auditoria
- [x] Scripts de análise (scraping + comentários + OCR)
- [x] Integração Cloudinary para fotos de perfil
- [x] Upload de documentos e soft delete

### Pendente:
- [ ] Worker de processamento (`worker/analysis-worker.ts`)
- [ ] Página de Comparações (`/dashboard/comparisons/[id]`)
- [ ] Loading states e error boundaries completos
- [ ] Autenticação (Supabase Auth)
- [ ] Testes unitários e E2E

---

## 📋 BRIEFINGS E DOCUMENTAÇÃO

| Arquivo | Conteúdo |
|---------|----------|
| `squad-auditores/BRIEFING-TEMPLATE.md` | Template para briefing de clientes |
| `squad-auditores/briefing-croko-lab.md` | Briefing completo do Croko Lab (produto) |
| `squad-auditores/DNA-CONTEUDO-SPEC.md` | Especificação técnica do DNA de Conteúdo |
| `README-APP.md` | Documentação técnica da aplicação |
| `FLUXO-COMPLETO-SISTEMA.md` | Fluxo detalhado do sistema de análise |
| `SISTEMA-ANALISE-INSTAGRAM.md` | Documentação dos scripts de análise |
| `IMPLEMENTACAO-COMPLETA.md` | Status de implementação do MVP |

---

## 🎯 REGRAS PARA O CLAUDE

### Ao escrever código:
1. Seguir padrões existentes (Next.js 15 App Router, TypeScript strict)
2. Usar os componentes do Design System existente (não criar do zero)
3. Manter português nos comentários e documentação
4. Nomes de variáveis/funções em inglês (padrão do código)
5. Sempre tipar com TypeScript (sem `any`)

### Ao gerar conteúdo/marketing:
1. **NUNCA** usar as palavras proibidas (IA, OCR, SaaS, etc.)
2. **SEMPRE** falar de transformação, não de features
3. Focar no avatar (Creator Solo como principal)
4. Usar frameworks dos 5 auditores como credencial
5. Ancoragem de preço: "mesma auditoria que consultores cobram R$ 2.000"

### Ao tomar decisões de arquitetura:
1. Preferir soluções simples que resolvam o problema atual
2. Não over-engineer para casos hipotéticos futuros
3. Reutilizar componentes e utilidades existentes
4. Manter consistência com o stack já escolhido (Next.js + Supabase)

### Ao fazer debugging:
1. Verificar variáveis de ambiente primeiro
2. Consultar `database/optimized-schema.sql` para questões de banco
3. Scripts de análise têm logs detalhados no console
4. Cloudinary handles fotos de perfil (não URLs diretas do Instagram - CORS)

---

*Última atualização: 2026-02-17*
*Versão: 1.0*
