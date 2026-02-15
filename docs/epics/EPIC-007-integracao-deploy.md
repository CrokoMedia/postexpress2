# EPIC 007: Integração & Deploy

**Status**: ⏳ Pendente
**Prioridade**: 🔴 Crítica
**Duração Estimada**: 1 semana (Semana 8)
**Agente Responsável**: @dev + @devops

---

## 🎯 OBJETIVO
Integrar todos os componentes (Apify → Supabase → Squads → Cloudinary → Portal) e fazer deploy em produção.

---

## 📊 CONTEXTO
**Dependências**: EPIC-002, EPIC-003, EPIC-004, EPIC-005, EPIC-006
**Bloqueia**: EPIC-008 (Beta)

---

## 📋 TAREFAS

### Task 7.1: Fluxo End-to-End (@dev)
**Duração**: 3 dias

Integrar:
```javascript
// src/workflows/end-to-end.js
async function processCliente(clienteId) {
  // 1. Trigger scraping (semanal/manual)
  // 2. Apify → Supabase
  // 3. Squad Auditores → Score Card
  // 4. Squad Criação → Carrossel
  // 5. Cloudinary → Imagens
  // 6. Notificar cliente (email)
  // 7. Portal: aprovação
}
```

**Entregáveis**:
- [ ] `src/workflows/end-to-end.js`
- [ ] Scheduler (cron jobs)
- [ ] Sistema de notificações (email)

---

### Task 7.2: Deploy Produção (@devops)
**Duração**: 2 dias

Deploy:
- Backend: Railway/Render
- Frontend: Vercel
- DB: Supabase (production tier)
- Cloudinary: Production tier
- CI/CD: GitHub Actions
- Monitoring: Sentry

**Entregáveis**:
- [ ] Produção deployada
- [ ] CI/CD configurado
- [ ] Monitoring ativo

---

## 🚦 GATE DE QUALIDADE (Gate 3)

- [ ] Fluxo end-to-end funciona
- [ ] 0 erros críticos
- [ ] Performance aceitável
- [ ] 3 clientes fake testados

---

## 🎯 PRÓXIMO PASSO
→ **EPIC-008: Beta & Validação**

**Criado por**: @pm (Morgan)
**Data**: 2026-02-16
