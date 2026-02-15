# EPIC 006: Portal do Cliente

**Status**: ⏳ Pendente
**Prioridade**: 🔴 Alta
**Duração Estimada**: 2 semanas (Semanas 6-7)
**Agente Responsável**: @ux-design-expert + @architect + @dev

---

## 🎯 OBJETIVO
Desenvolver portal web para clientes visualizarem e aprovarem carrosséis.

---

## 📊 CONTEXTO
**Dependências**: EPIC-002 (Supabase), EPIC-005 (imagens geradas)
**Bloqueia**: EPIC-007 (integração end-to-end)

---

## 📋 TAREFAS

### Task 6.1: Wireframes (@ux-design-expert)
**Duração**: 1 dia

Criar wireframes:
- Login (magic link)
- Dashboard (lista de carrosséis)
- Visualização de carrossel (galeria)
- Aprovação/rejeição/ajustes

**Entregáveis**:
- [ ] Wireframes (Figma/Excalidraw)
- [ ] User flows documentados

---

### Task 6.2: Stack Frontend (@architect)
**Duração**: 2h

Decidir:
- Framework: Next.js 14 ou Remix?
- UI: Shadcn/ui + Tailwind
- Auth: Supabase Auth (magic link)
- Deploy: Vercel

**Entregáveis**:
- [ ] `docs/architecture/frontend-stack.md`
- [ ] ADR (Architecture Decision Record)

---

### Task 6.3: Implementação (@dev)
**Duração**: 5 dias

Desenvolver:
- Setup Next.js + Supabase Auth
- Telas: login, dashboard, visualização, aprovação
- Sistema de status (pendente/aprovado/ajustes)
- Comentários/feedback

**Entregáveis**:
- [ ] `portal/` (código Next.js)
- [ ] Testes E2E (Playwright)
- [ ] Deploy staging

---

## 🚦 GATE DE QUALIDADE

- [ ] Funcionalidades testadas
- [ ] Mobile-responsive
- [ ] Auth funcionando
- [ ] 3 usuários teste aprovados

---

## 🎯 PRÓXIMO PASSO
→ **EPIC-007: Integração & Deploy**

**Criado por**: @pm (Morgan)
**Data**: 2026-02-16
