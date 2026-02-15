# EPIC 001: Fundação & Setup

**Status**: ⏳ Pendente
**Prioridade**: 🔴 Crítica
**Duração Estimada**: 1 semana (Semana 1)
**Agente Responsável**: @devops (Gage) + @architect (Aria)

---

## 🎯 OBJETIVO

Configurar ambiente de desenvolvimento completo e estrutura base do projeto Post Express seguindo padrão AIOS-Core.

---

## 📊 CONTEXTO

Este é o **primeiro épico** do projeto Post Express. Estabelece a fundação técnica sobre a qual todos os outros componentes serão construídos.

**Dependências**:
- Nenhuma (épico inicial)

**Bloqueia**:
- EPIC-002 (Pipeline de Dados)
- EPIC-003 (Squads de IA)
- EPIC-005 (Portal do Cliente)

---

## 📋 TAREFAS

### Task 1.1: Setup AIOS-Core & Docker MCP
**Responsável**: @devops (Gage)
**Duração**: 1 dia

**Descrição**:
Configurar ambiente AIOS-Core e Docker MCP com integração Apify.

**Comandos**:
```bash
@devops *setup-mcp-docker
@devops *add-mcp apify
```

**Critérios de Aceitação**:
- [ ] `npx aios-core init post-express` executa sem erros
- [ ] Docker MCP configurado e rodando
- [ ] `docker mcp tools ls` lista Apify como disponível
- [ ] Apify MCP autenticado e funcional
- [ ] Ambiente de desenvolvimento documentado

**Entregáveis**:
- [ ] `.aios/config.yaml` configurado
- [ ] `~/.docker/mcp/catalogs/docker-mcp.yaml` com Apify
- [ ] `docs/setup/development-environment.md`

**Validação**:
```bash
# Testar Apify MCP
docker mcp tools ls | grep apify
# Deve listar: search-actors, call-actor, etc.
```

---

### Task 1.2: Estrutura de Pastas AIOS-Core
**Responsável**: @architect (Aria)
**Duração**: 2 horas

**Descrição**:
Criar estrutura de pastas seguindo padrão AIOS-Core para brownfield projects.

**Prompt para @architect**:
```
Crie a estrutura de pastas do Post Express seguindo padrão AIOS-Core:

Estrutura necessária:
- squads/
  - auditores/ (5 mentes: Kahneman, Schwartz, Hormozi, Cagan, Graham)
  - criacao/ (5 mentes: Schwartz, Godin, Hormozi, Finch, De Marqui)
- docs/
  - epics/ (este arquivo e outros)
  - stories/ (stories detalhadas)
  - architecture/ (ADRs, schemas, diagramas)
- src/
  - etl/ (Apify → Supabase)
  - squads/ (orquestradores)
  - visual/ (Cloudinary)
  - workflows/ (end-to-end)
  - db/ (migrations, queries)
- portal/ (Next.js app - separado)
- scripts/ (automações, helpers)
- .aios/ (configurações AIOS)

Cada pasta deve ter README.md explicando seu propósito.
```

**Critérios de Aceitação**:
- [ ] Todas as pastas criadas
- [ ] README.md em cada pasta principal
- [ ] `.gitignore` configurado
- [ ] Estrutura documentada em `docs/architecture/project-structure.md`

**Entregáveis**:
- [ ] Estrutura de pastas completa
- [ ] `docs/architecture/project-structure.md`
- [ ] `.gitignore` (node_modules, .env, .aios/sessions/, etc.)

---

### Task 1.3: Schema do Banco de Dados
**Responsável**: @architect (Aria)
**Duração**: 4 horas

**Descrição**:
Refinar e expandir schema Supabase definido no PRD, adicionando tabelas faltantes e otimizações.

**Prompt para @architect**:
```
Refine o schema Supabase do PRD localizado em PostExpress_PRD.txt:

Tarefas:
1. Expandir tabela "clientes":
   - Adicionar: tom_voz JSONB
   - Adicionar: preferencias_visuais JSONB
   - Adicionar: plataformas TEXT[] (Instagram, LinkedIn, etc.)
   - Adicionar: status TEXT (ativo, pausado, cancelado)

2. Expandir tabela "conteudos":
   - Definir schema JSONB completo para campo "slides"
   - Adicionar: score_qualidade INTEGER
   - Adicionar: historico_versoes JSONB
   - Adicionar: cloudinary_urls JSONB

3. CRIAR tabela "auditorias":
   - id UUID
   - cliente_id UUID FK
   - data_auditoria TIMESTAMP
   - score_comportamento INTEGER (0-100)
   - score_copy INTEGER (0-100)
   - score_ofertas INTEGER (0-100)
   - score_metricas INTEGER (0-100)
   - score_anomalias INTEGER (0-100)
   - score_geral INTEGER (0-100)
   - insights JSONB (red flags, green flags, recomendações)
   - dados_brutos JSONB (output do scraper)

4. CRIAR tabela "scraping_logs":
   - id UUID
   - cliente_id UUID FK
   - plataforma TEXT
   - actor_id TEXT
   - status TEXT (success, error, timeout)
   - creditos_usados INTEGER
   - erro_mensagem TEXT
   - timestamp TIMESTAMP

5. Row Level Security (RLS):
   - Políticas para isolar dados por cliente
   - Admin bypass

6. Índices:
   - cliente_id em todas as tabelas
   - created_at em conteudos e auditorias
   - status em conteudos

7. Foreign Keys com ON DELETE CASCADE onde apropriado

Gere:
- Schema SQL completo
- Migrations numeradas (001_, 002_, etc.)
- Documentação do schema
```

**Critérios de Aceitação**:
- [ ] Schema completo documentado
- [ ] Migrations SQL geradas
- [ ] RLS policies definidas
- [ ] Índices otimizados
- [ ] Schema reviewed por @qa
- [ ] Supabase (dev) configurado e testado

**Entregáveis**:
- [ ] `docs/architecture/database-schema.md`
- [ ] `src/db/migrations/001_initial_schema.sql`
- [ ] `src/db/migrations/002_rls_policies.sql`
- [ ] `src/db/migrations/003_indexes.sql`
- [ ] Supabase project criado (dev environment)

**Validação por @qa**:
- [ ] Schema reviewed (tipos corretos, constraints)
- [ ] RLS policies testadas (isolamento entre clientes)
- [ ] Performance de queries testada (EXPLAIN ANALYZE)

---

## 🚦 GATE DE QUALIDADE

**Critérios para considerar EPIC-001 completo**:

### Técnicos:
- [ ] AIOS-Core rodando sem erros
- [ ] Docker MCP + Apify funcionando
- [ ] Estrutura de pastas completa e documentada
- [ ] Supabase configurado com schema completo
- [ ] Migrations aplicadas e testadas
- [ ] RLS policies funcionando

### Documentação:
- [ ] `docs/setup/development-environment.md` completo
- [ ] `docs/architecture/project-structure.md` completo
- [ ] `docs/architecture/database-schema.md` completo
- [ ] README.md em cada pasta principal

### Validação:
- [ ] @devops confirma: ambiente replicável
- [ ] @architect confirma: schema aprovado
- [ ] @qa valida: RLS policies isolam corretamente

---

## 📊 MÉTRICAS DE SUCESSO

| Métrica | Meta | Como Medir |
|---------|------|------------|
| Tempo de setup ambiente | < 2 horas | Doc setup completo |
| Migrations sem erro | 100% | `psql` execução |
| Coverage de documentação | 100% | Todas as pastas com README |

---

## 🔗 DEPENDÊNCIAS EXTERNAS

### Ferramentas Necessárias:
- Node.js 18+
- Docker Desktop
- Supabase CLI
- GitHub CLI (gh)
- AIOS-Core

### Contas Necessárias:
- Supabase (free tier para dev)
- Apify (free tier ou trial)
- Cloudinary (setup posterior)

---

## 📝 NOTAS

- Este épico é **bloqueante** para todos os outros
- Recomenda-se alocar 1 desenvolvedor full-time
- @devops e @architect devem trabalhar em paralelo quando possível
- Validação por @qa é obrigatória antes de marcar completo

---

## 🎯 PRÓXIMO PASSO

Após completar EPIC-001:
→ **EPIC-002: Pipeline de Dados (Apify → Supabase)**

---

**Criado por**: @pm (Morgan)
**Data**: 2026-02-16
**Versão**: 1.0
