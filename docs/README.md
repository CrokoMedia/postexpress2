# 📚 Post Express - Documentação de Desenvolvimento

Bem-vindo à documentação técnica do Post Express! Aqui você encontra epics, stories e guias de desenvolvimento.

---

## 🗂️ Estrutura

```
docs/
├── README.md                           # Este arquivo
├── epics/                              # Epics de alto nível
│   ├── EPIC-001-twitter-stream-api.md  # Twitter Stream API Integration
│   └── EPIC-001-CHECKLIST.md           # Checklist executivo
└── stories/                            # Stories detalhadas
    ├── STORY-1.1-twitter-setup-credentials.md
    ├── STORY-1.2-supabase-schema-twitter.md
    ├── STORY-1.3-twitter-rules-library.md
    └── STORY-2.1-stream-worker-24-7.md
```

---

## 🎯 Epics Ativas

### [EPIC-001: Twitter Stream API Integration](./epics/EPIC-001-twitter-stream-api.md)
**Status:** 🟡 In Progress (8% completo)
**Timeline:** 19 Fev - 17 Mar 2026

Implementar monitoramento em tempo real de experts do Twitter usando Filtered Stream API.

**Quick Links:**
- 📋 [Checklist Executivo](./epics/EPIC-001-CHECKLIST.md)
- 📖 [Story 1.1 - Setup Credenciais](./stories/STORY-1.1-twitter-setup-credentials.md) ✅ DONE
- 📖 [Story 1.2 - Schema Supabase](./stories/STORY-1.2-supabase-schema-twitter.md) 📋 TO DO
- 📖 [Story 1.3 - Biblioteca de Regras](./stories/STORY-1.3-twitter-rules-library.md) 📋 TO DO
- 📖 [Story 2.1 - Worker Stream 24/7](./stories/STORY-2.1-stream-worker-24-7.md) 📋 TO DO

---

## 🚀 Quick Start

### Para Desenvolvedores

1. **Ler o CLAUDE.md** (contexto completo do projeto)
   ```bash
   cat /Users/macbook-karla/postexpress2/CLAUDE.md
   ```

2. **Escolher uma Story** para trabalhar
   - Ver [EPIC-001-CHECKLIST.md](./epics/EPIC-001-CHECKLIST.md)
   - Começar por Stories "TO DO" de prioridade P0

3. **Seguir o fluxo da Story**
   - Ler Acceptance Criteria
   - Implementar Tarefas Técnicas
   - Executar testes
   - Marcar checkboxes conforme avança

4. **Commitar seguindo convenções**
   ```bash
   git commit -m "feat: implement twitter rules library [Story 1.3]"
   ```

---

## 📖 Convenções de Documentação

### Formato de Epic
```markdown
# EPIC-XXX: Título

**Status:** 📋 Planning | 🟡 In Progress | ✅ Done
**Priority:** Low | Medium | High | Critical
**Owner:** Team/Person
**Timeline:** Data início - Data fim

## Visão Geral
[Contexto de negócio e técnico]

## Objetivos
[O que queremos alcançar]

## Stories
[Lista de stories quebradas]

## Métricas de Sucesso
[Como medimos o sucesso]
```

### Formato de Story
```markdown
# Story X.Y: Título

**Epic:** EPIC-XXX
**Status:** 📋 To Do | 🔄 In Progress | ✅ Done | 🚫 Blocked
**Priority:** P0 | P1 | P2 | P3
**Estimate:** Xh
**Owner:** Dev/Team

## Descrição
[O que precisa ser feito]

## Acceptance Criteria
- [ ] Critério 1
- [ ] Critério 2

## Tarefas Técnicas
[Passos detalhados]

## Arquivos Afetados
[Lista de arquivos criados/modificados]

## Como Testar
[Instruções de teste]

## Definition of Done
[Checklist final]
```

---

## 🏷️ Labels & Status

### Status de Epic
- 📋 **Planning** - Em fase de planejamento
- 🟡 **In Progress** - Em desenvolvimento
- ✅ **Done** - Completa e em produção
- 🚫 **Blocked** - Bloqueada por dependência externa

### Status de Story
- 📋 **To Do** - Não iniciada
- 🔄 **In Progress** - Em desenvolvimento ativo
- 👀 **Review** - Em code review
- 🧪 **Testing** - Em testes
- ✅ **Done** - Completa e merged
- 🚫 **Blocked** - Bloqueada

### Prioridades
- **P0** - Blocker (não dá pra continuar sem isso)
- **P1** - High (importante para o MVP)
- **P2** - Medium (nice to have)
- **P3** - Low (backlog)

---

## 📊 Métricas de Progresso

Acompanhe o progresso no [Checklist Executivo](./epics/EPIC-001-CHECKLIST.md):

```
EPIC-001: Twitter Stream API
▓░░░░░░░░░ 8% (1/12 stories)

Phase 1: Setup & Infrastructure    ▓▓▓░░░░░░░  33% (1/3)
Phase 2: Core Stream               ░░░░░░░░░░   0% (0/3)
Phase 3: Admin Interface           ░░░░░░░░░░   0% (0/3)
Phase 4: Quality & Monitoring      ░░░░░░░░░░   0% (0/3)
```

---

## 🔗 Links Úteis

### Documentação do Projeto
- [CLAUDE.md](../CLAUDE.md) - Contexto completo do projeto
- [README.md](../README.md) - Setup e instalação
- [Database Schema](../database/optimized-schema.sql) - Schema atual

### Documentação Externa
- [Twitter API Docs](https://developer.twitter.com/en/docs/twitter-api)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js 15 Docs](https://nextjs.org/docs)

### Tools
- [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Railway](https://railway.app) | [Render](https://render.com)

---

## 🤝 Como Contribuir

1. **Criar nova Story:**
   ```bash
   # Copiar template
   cp docs/stories/STORY-TEMPLATE.md docs/stories/STORY-X.Y-titulo.md

   # Editar e preencher
   # Adicionar ao checklist da Epic
   ```

2. **Atualizar progresso:**
   - Marcar checkboxes na Story conforme avança
   - Atualizar status no checklist da Epic
   - Commitar mudanças de documentação separadamente

3. **Finalizar Story:**
   - Garantir que todos os Acceptance Criteria foram atendidos
   - Rodar testes
   - Marcar como ✅ Done
   - Atualizar progresso no checklist da Epic

---

## 📝 Templates

### Story Template
```markdown
# Story X.Y: [Título]

**Epic:** EPIC-XXX
**Status:** 📋 To Do
**Priority:** P1
**Estimate:** Xh
**Owner:** [Nome]

## Descrição
[O que precisa ser feito]

## Acceptance Criteria
- [ ] Item 1
- [ ] Item 2

## Tarefas Técnicas
1. [ ] Tarefa 1
2. [ ] Tarefa 2

## Arquivos Afetados
- `path/to/file.ts` - CRIADO/MODIFICADO

## Como Testar
[Instruções]

## Definition of Done
- [ ] Código implementado
- [ ] Testes passando
- [ ] Code review aprovado
- [ ] Documentação atualizada
```

---

## 🎯 Roadmap

### Sprint 1 (19-25 Fev) - Setup
- [x] Story 1.1: Credenciais Twitter ✅
- [ ] Story 1.2: Schema Supabase
- [ ] Story 1.3: Biblioteca de Regras

### Sprint 2 (26 Fev - 3 Mar) - Core Stream
- [ ] Story 2.1: Worker 24/7
- [ ] Story 2.2: Processamento de Tweets
- [ ] Story 2.3: Notificações

### Sprint 3 (4-10 Mar) - Admin Interface
- [ ] Story 3.1: Dashboard de Experts
- [ ] Story 3.2: Configuração de Temas
- [ ] Story 3.3: Visualização de Tweets

### Sprint 4 (11-17 Mar) - Quality
- [ ] Story 4.1: Health Check
- [ ] Story 4.2: Logs e Métricas
- [ ] Story 4.3: Testes E2E

---

## 📞 Suporte

- **Dúvidas técnicas:** Verificar [CLAUDE.md](../CLAUDE.md) ou stories relacionadas
- **Issues:** Criar issue no GitHub (se aplicável)
- **Discussões:** Slack #dev-postexpress (se aplicável)

---

**Última atualização:** 2026-02-19
**Mantenedores:** Equipe de Desenvolvimento Post Express
