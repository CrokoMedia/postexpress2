# Checklist de Melhorias - Sistema Croko Lab
**Data:** 2026-02-25
**Status:** Planejamento
**Equipe:** Multi-agent collaboration

---

## 🐛 Bug Fixes (Prioridade Alta)

### BUG-001: Brandkit - Criar Primeiro Brand Kit não funciona
- [ ] **Investigação:** Reproduzir erro e identificar causa raiz
- [ ] **Fix:** Corrigir lógica de criação do primeiro brand kit
- [ ] **Teste:** Validar fluxo completo de criação
- **Agente responsável:** @dev
- **Dependências:** Nenhuma
- **Estimativa:** 2-3h
- **Arquivos envolvidos:**
  - `app/dashboard/brand-kit/page.tsx` (ou similar)
  - API route correspondente

### BUG-002: Página Comparações não está funcionando
- [ ] **Investigação:** Identificar erro (404, crash, dados não carregam?)
- [ ] **Fix:** Corrigir implementação da página
- [ ] **Teste:** Validar comparações com dados reais
- **Agente responsável:** @dev
- **Dependências:** Nenhuma
- **Estimativa:** 2-4h
- **Arquivos envolvidos:**
  - `app/dashboard/comparisons/[id]/page.tsx`
  - `/api/comparisons/[id]/route.ts`

---

## ✨ Features Novas (Prioridade Média)

### FEAT-001: Scraping de Reels do Instagram ⏸️ **BACKLOG**
- [ ] **Análise:** Pesquisar suporte Apify para Reels
- [ ] **Design:** Estrutura de dados para armazenar Reels
- [ ] **Implementação:** Integrar coleta de Reels no scraper
- [ ] **Auditoria:** Adaptar análise para formato vídeo
- [ ] **Teste:** Validar com perfis reais
- **Status:** ⏸️ **MOVIDO PARA BACKLOG** (prioridade baixa)
- **Agentes responsáveis:**
  - @analyst (pesquisa Apify)
  - @data-engineer (schema)
  - @dev (implementação)
- **Dependências:** Análise de dados do scraping atual
- **Estimativa:** 8-12h
- **Arquivos envolvidos:**
  - `scripts/instagram-scraper-with-comments.js`
  - `database/schema-updates.sql` (nova tabela `reels`?)
  - `squad-auditores/` (adaptação de análise)

### FEAT-002: Botão "Voltar ao Perfil" em todas as páginas ✅ **CONCLUÍDO**
- [x] **Design:** Definir posicionamento (header? sidebar?)
- [x] **Implementação:** Adicionar componente ao layout
- [x] **Teste:** Validar navegação em todas as rotas
- **Agentes responsáveis:**
  - @ux-design-expert (design) ✅
  - @dev (implementação) ✅
- **Dependências:** Nenhuma
- **Estimativa:** 1-2h ✅ **Realizado em 45min**
- **Arquivos modificados:**
  - `components/molecules/page-header.tsx` (breadcrumb)
  - 5 páginas atualizadas com breadcrumb
- **Status:** ✅ **CONCLUÍDO** - Sistema de breadcrumb implementado

### FEAT-003: Vincular perfis a usuários (Gerenciar Usuários)
- [ ] **Autenticação:** ✅ CONFIRMADO - Supabase Auth já implementado
- [ ] **Schema:** Adicionar relacionamento user ↔ profiles (via user_id FK)
- [ ] **API:** CRUD para vincular/desvincular perfis
- [ ] **UI:** Interface de vinculação na página de usuário
- [ ] **Permissões:** RLS policies para acesso por usuário
- [ ] **Teste:** Validar multi-tenancy
- **Agentes responsáveis:**
  - @data-engineer (schema + RLS)
  - @dev (API + UI)
  - @qa (testes de permissão)
- **Dependências:** Nenhuma (auth já existe)
- **Estimativa:** 6-8h
- **Arquivos envolvidos:**
  - `database/schema-updates.sql` (FK user_id em profiles + RLS policies)
  - `/api/users/[id]/profiles/route.ts` (novo)
  - `app/dashboard/users/[id]/page.tsx`

### FEAT-004: Reposicionar imagem e texto nos Carrosséis (Content Squad)
- [ ] **Clarificação:** ✅ RESOLVIDO - Aplicar em slides de carrosséis
- [ ] **Design:** UI para drag-and-drop ou inputs de posição
- [ ] **Implementação:** Lógica de reposicionamento em slides
- [ ] **Teste:** Validar preview em tempo real
- **Agentes responsáveis:**
  - @ux-design-expert (UX de reposicionamento)
  - @dev (implementação)
- **Dependências:** Nenhuma
- **Estimativa:** 6-8h
- **Arquivos envolvidos:**
  - `content-creation-squad/` (geração de carrosséis)
  - Componente de preview/edição de slides

---

## 🔧 Melhorias Técnicas (Prioridade Média)

### 🆕 NOVO: Melhorias de Scraping (baseado na auditoria)

#### IMPROVE-003: Extrair hashtags e mentions do caption
- [ ] **Análise:** Criar regex para extrair hashtags (#tag)
- [ ] **Análise:** Criar regex para extrair mentions (@user)
- [ ] **Implementação:** Adicionar parsing no script
- [ ] **Schema:** Garantir campos `hashtags` e `mentions` no DB
- [ ] **Teste:** Validar extração em posts reais
- **Agente responsável:** @dev
- **Dependências:** IMPROVE-001 (auditoria) ✅
- **Estimativa:** 2-3h
- **Prioridade:** 🔴 **ALTA** - Impacta Framework de Copy
- **Arquivos envolvidos:**
  - `scripts/instagram-scraper-with-comments.js`

#### IMPROVE-004: Coletar externalUrl e isPinned
- [ ] **Implementação:** Adicionar coleta de `externalUrl` do perfil
- [ ] **Implementação:** Adicionar coleta de `isPinned` dos posts
- [ ] **Schema:** Verificar campos no DB
- [ ] **Teste:** Validar dados coletados
- **Agente responsável:** @dev
- **Dependências:** IMPROVE-001 (auditoria) ✅
- **Estimativa:** 1h
- **Prioridade:** 🔴 **ALTA** - Impacta Framework de Ofertas
- **Arquivos envolvidos:**
  - `scripts/instagram-scraper-with-comments.js`

#### IMPROVE-005: Mapear threads de comentários
- [ ] **Análise:** Identificar estrutura de threads no Apify
- [ ] **Schema:** Adicionar campo `parent_comment_id` (FK)
- [ ] **Implementação:** Modificar coleta de comentários
- [ ] **Teste:** Validar hierarquia de threads
- **Agente responsável:** @data-engineer + @dev
- **Dependências:** IMPROVE-001 (auditoria) ✅
- **Estimativa:** 4-6h
- **Prioridade:** 🟡 **MÉDIA** - Impacta análise contextual
- **Arquivos envolvidos:**
  - `scripts/instagram-scraper-with-comments.js`
  - `database/schema-updates.sql`

---

## 🔧 Melhorias Técnicas (Prioridade Média)

### IMPROVE-001: Verificar dados extraídos no scraping ✅ **CONCLUÍDO**
- [x] **Auditoria:** Mapear todos os campos extraídos atualmente
- [x] **Documentação:** Criar tabela de campos disponíveis
- [x] **Validação:** Verificar completude dos dados
- [x] **Recomendação:** Sugerir campos adicionais úteis
- **Agente responsável:** @analyst
- **Dependências:** Nenhuma
- **Estimativa:** 2-3h ✅ **Realizado**
- **Deliverable:** ✅ `docs/scraping-data-audit.md` (completo)
- **Status:** ✅ **CONCLUÍDO** - 49 campos mapeados, 8 gaps identificados

### IMPROVE-002: Substituir emojis por SVG icons no PDF de auditoria ✅ **CONCLUÍDO**
- [x] **Investigação:** Identificar onde emojis são usados
- [x] **Design:** Selecionar/criar SVG icons equivalentes
- [x] **Implementação:** Substituir emojis por SVGs
- [x] **Teste:** Validar renderização em PDF
- **Agentes responsáveis:**
  - @ux-design-expert (seleção de icons) ✅
  - @dev (implementação) ✅
- **Dependências:** Nenhuma
- **Estimativa:** 3-4h ✅ **Realizado em 1h**
- **Arquivos modificados:**
  - `app/api/audits/[id]/pdf/route.ts` (11 emojis → SVG)
- **Status:** ✅ **CONCLUÍDO** - Lucide React icons implementados

---

## 📋 Plano de Execução Paralela

### 🚀 Sprint 1: Bug Fixes + Análise (Dia 1-2)
**Execução simultânea:**

| Agente | Tarefa | Tempo |
|--------|--------|-------|
| @dev | BUG-001: Fix Brandkit | 2-3h |
| @dev | BUG-002: Fix Comparações | 2-4h |
| @analyst | IMPROVE-001: Auditoria de dados scraping | 2-3h |

**Total:** ~8h (paralelo)

---

### 🎨 Sprint 2: Features de UX (Dia 3-4)
**Execução simultânea:**

| Agente | Tarefa | Tempo |
|--------|--------|-------|
| @ux-design-expert + @dev | FEAT-002: Botão voltar ao perfil | 1-2h |
| @ux-design-expert | IMPROVE-002: Design SVG icons | 1h |
| @dev | IMPROVE-002: Implementar SVG no PDF | 2-3h |
| @ux-design-expert | FEAT-004: Clarificar contexto de reposicionamento | 1h |

**Total:** ~4h (paralelo)

---

### 🏗️ Sprint 3: Features complexas (Dia 5-7)
**Execução sequencial (dependências):**

**FEAT-003: Vincular perfis (6-10h)**
1. @data-engineer: Schema (2h)
2. @architect: Design de permissões (1h)
3. @dev: API + UI (3-5h)
4. @qa: Testes (1-2h)

**FEAT-001: Scraping de Reels (8-12h)**
1. @analyst: Pesquisa Apify (2h)
2. @data-engineer: Schema (1h)
3. @dev: Implementação scraper (3-4h)
4. @dev: Integração com auditoria (2-3h)
5. @qa: Testes (2h)

---

## 🎯 Resumo de Priorização

### 🔴 **Alta Prioridade** (Sprint 1 - fazer primeiro)
1. BUG-001: Brandkit não funciona
2. BUG-002: Comparações não funciona
3. IMPROVE-001: Auditoria de dados scraping

### 🟡 **Média Prioridade** (Sprint 2-3)
4. FEAT-002: Botão voltar ao perfil
5. IMPROVE-002: SVG icons no PDF
6. FEAT-003: Vincular perfis a usuários

### 🟢 **Baixa Prioridade** (Sprint 3+)
7. FEAT-001: Scraping de Reels (complexo)
8. FEAT-004: Reposicionamento (aguarda clarificação)

---

## ⚠️ Questões Pendentes → ✅ RESOLVIDAS

1. ✅ **FEAT-004 (Reposicionamento):** Carrosséis (Content Squad) - slides gerados
2. ✅ **FEAT-001 (Reels):** Movido para backlog (prioridade baixa)
3. ✅ **FEAT-003 (Vincular perfis):** Supabase Auth já implementado

---

## 🚀 PLANO DE EXECUÇÃO AJUSTADO

### Fase 1: Sprint 2 - UX Features (INICIAR AGORA) ⚡

**Execução simultânea:**

| Agente | Tarefa | Tempo | Status |
|--------|--------|-------|--------|
| @ux-design-expert + @dev | FEAT-002: Botão "Voltar ao Perfil" | 1-2h | ⏳ Pronto para iniciar |
| @ux-design-expert | IMPROVE-002: Selecionar SVG icons | 1h | ⏳ Pronto para iniciar |
| @dev | IMPROVE-002: Implementar SVG no PDF | 2-3h | ⏳ Pronto para iniciar |

**Total:** ~4h (paralelo)

**Outputs esperados:**
- ✅ Botão de navegação funcionando em todas as páginas
- ✅ PDF de auditoria com SVG icons (sem emojis)

---

### Fase 2: Bugs Críticos (PENDENTE - RECOMENDADO)

⚠️ **ATENÇÃO:** Bugs críticos ainda não resolvidos!

| Agente | Tarefa | Tempo | Status |
|--------|--------|-------|--------|
| @dev | BUG-001: Fix Brandkit | 2-3h | ⚠️ Aguardando |
| @dev | BUG-002: Fix Comparações | 2-4h | ⚠️ Aguardando |
| @analyst | IMPROVE-001: Auditoria scraping | 2-3h | ⚠️ Aguardando |

**Recomendação:** Resolver bugs antes de features complexas.

---

### Fase 3: Features Complexas (APÓS SPRINT 2)

**FEAT-003: Vincular perfis a usuários (6-8h)**
1. @data-engineer: Schema + RLS (2h)
2. @dev: API (2h)
3. @dev: UI (2-3h)
4. @qa: Testes (1-2h)

**FEAT-004: Reposicionamento em Carrosséis (6-8h)**
1. @ux-design-expert: Design UX (2h)
2. @dev: Implementação (4-5h)
3. @qa: Testes (1h)

---

## 📊 Métricas de Progresso

- **Total de tarefas:** 8
- **Bugs:** 2
- **Features:** 4
- **Melhorias:** 2
- **Estimativa total:** 28-42h
- **Com trabalho paralelo:** ~15-20h (economia de 40%)

---

**Próximos passos:**
1. ✅ Aprovar este checklist
2. 🚀 Iniciar Sprint 1 (bugs + análise)
3. 📋 Esclarecer FEAT-004 (reposicionamento)
4. 🔄 Criar issues no GitHub (opcional)
