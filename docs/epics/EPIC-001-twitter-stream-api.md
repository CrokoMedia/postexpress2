# EPIC-001: Twitter Stream API Integration

**Status:** 📋 Planning
**Priority:** High
**Owner:** Development Team
**Created:** 2026-02-19
**Target:** Sprint 1

---

## 📋 Visão Geral

Implementar monitoramento em tempo real de experts do Twitter usando a **Twitter Filtered Stream API**, permitindo que o Post Express detecte instantaneamente quando experts publicam conteúdo relevante sobre temas específicos.

---

## 🎯 Objetivos de Negócio

### Problema
Atualmente, o Post Express só monitora Instagram. Experts também compartilham insights valiosos no Twitter/X, mas não temos forma de capturar esse conteúdo em tempo real.

### Solução
Integrar Twitter Filtered Stream API para:
- ✅ Detectar tweets de experts **instantaneamente** (1-5 segundos)
- ✅ Filtrar por temas relevantes (marketing, vendas, frameworks, etc.)
- ✅ Salvar no Supabase para análise posterior
- ✅ Notificar usuários quando conteúdo novo é detectado

### Impacto Esperado
- **+40% mais fontes de conteúdo** (experts que postam mais no Twitter que Instagram)
- **Tempo real** (vs. scraping com delay de horas)
- **Menor custo** que scraping ($100/mês vs. custos variáveis de Apify)
- **Diferencial competitivo** (concorrentes não monitoram Twitter em tempo real)

---

## 🏗️ Arquitetura Técnica

### Stack
- **API:** Twitter Filtered Stream API (plano Basic - $100/mês)
- **Backend:** Next.js 15 API Routes + Node.js Stream Reader
- **Database:** Supabase (tabelas novas para tweets)
- **Infra:** Vercel (webhooks) + Railway/Render (stream worker 24/7)
- **Notificações:** Slack webhook (interno) + Email (clientes futuro)

### Fluxos Principais

#### 1. Configuração Inicial (uma vez)
```
Admin configura experts → Define temas → Cria regras no Twitter API →
Subscreve ao stream
```

#### 2. Monitoramento Contínuo (24/7)
```
Expert twitta → Twitter Stream detecta (1-5s) → Worker processa →
Salva no Supabase → Notifica Slack → Dashboard atualiza
```

#### 3. Gestão de Regras (admin)
```
Admin adiciona/remove experts → Atualiza regras via API →
Stream reconecta com novas regras
```

---

## 📊 Métricas de Sucesso

| Métrica | Target | Como Medir |
|---------|--------|------------|
| **Latência de detecção** | < 10 segundos | Timestamp tweet vs. timestamp detecção |
| **Uptime do stream** | > 99% | Logs de conexão/desconexão |
| **Custo mensal** | ≤ $100 | Fatura Twitter API |
| **Tweets capturados** | > 500/mês | COUNT em `twitter_content_updates` |
| **False positives** | < 5% | Revisão manual de amostra |

---

## 🗂️ Stories (Quebra de Trabalho)

### **Phase 1: Setup & Infrastructure** (Sprint 1 - Semana 1)
- [ ] **Story 1.1:** Setup Twitter Developer Account & Credenciais
- [ ] **Story 1.2:** Schema Supabase para Twitter Monitoring
- [ ] **Story 1.3:** Biblioteca de Gerenciamento de Regras

### **Phase 2: Core Stream Implementation** (Sprint 1 - Semana 2)
- [ ] **Story 2.1:** Worker de Stream 24/7 (Railway/Render)
- [ ] **Story 2.2:** Processamento e Salvamento de Tweets
- [ ] **Story 2.3:** Sistema de Notificações (Slack)

### **Phase 3: Admin Interface** (Sprint 2 - Semana 1)
- [ ] **Story 3.1:** Dashboard de Gerenciamento de Experts
- [ ] **Story 3.2:** Interface de Configuração de Temas
- [ ] **Story 3.3:** Visualização de Tweets Capturados

### **Phase 4: Quality & Monitoring** (Sprint 2 - Semana 2)
- [ ] **Story 4.1:** Health Check & Auto-Recovery
- [ ] **Story 4.2:** Logs e Métricas de Performance
- [ ] **Story 4.3:** Testes de Integração e E2E

---

## 🔐 Segurança & Compliance

### Dados Sensíveis
- ✅ Bearer Token no `.env` (nunca commitar)
- ✅ Supabase service_role_key protegido
- ✅ Rate limiting nas APIs públicas

### Compliance Twitter
- ✅ Respeitar Developer Agreement
- ✅ Não redistribuir tweets brutos (só análises)
- ✅ Não fazer scraping além do permitido
- ✅ Incluir attribution quando exibir conteúdo

### LGPD/GDPR
- ✅ Tweets são dados públicos (não PII)
- ✅ Usuários podem solicitar remoção (via support)
- ✅ Logs anonimizados após 30 dias

---

## 🚧 Riscos & Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| **Custo inesperado** (> $100/mês) | Baixa | Alto | Alertas de uso + cap de regras |
| **API instável** (downtime Twitter) | Média | Médio | Retry logic + fallback polling |
| **Rate limits excedidos** | Baixa | Médio | Monitoring + backoff exponencial |
| **Stream disconnect** | Alta | Baixo | Auto-reconnect + heartbeat check |
| **Mudança de preços Twitter** | Média | Alto | Budget approval + plan B (polling) |

---

## 📦 Dependências Externas

- ✅ Twitter Developer Account (aprovado)
- ✅ Twitter API Bearer Token (obtido)
- ⏳ Plano Basic Twitter API ($100/mês) - **precisa assinar**
- ⏳ Railway/Render account (para worker 24/7) - **criar**
- ✅ Supabase (já temos)
- ✅ Vercel (já temos)

---

## 📅 Timeline

```
Semana 1 (19-25 Fev):
├── Setup completo (credenciais, schema, infra)
├── Worker básico funcionando (teste local)
└── Primeira regra testada (1 expert)

Semana 2 (26 Fev - 3 Mar):
├── Stream em produção (Railway)
├── Notificações Slack funcionando
└── Dashboard básico (visualizar tweets)

Semana 3 (4-10 Mar):
├── Admin interface completa
├── Health checks + auto-recovery
└── Testes E2E

Semana 4 (11-17 Mar):
├── Documentação completa
├── Monitoramento em produção
└── Feedback loop com usuários
```

---

## ✅ Definition of Done (Epic)

- [ ] Stream rodando 24/7 com uptime > 99%
- [ ] Pelo menos 5 experts monitorados
- [ ] Tweets salvos no Supabase em < 10s
- [ ] Notificações Slack funcionando
- [ ] Dashboard de admin funcional
- [ ] Documentação técnica completa
- [ ] Testes E2E passando
- [ ] Custo mensal ≤ $100
- [ ] Logs e métricas configurados
- [ ] Aprovação do PO/Cliente

---

## 📚 Referências

- Twitter Filtered Stream Docs: https://developer.twitter.com/en/docs/twitter-api/tweets/filtered-stream/introduction
- Twitter API Pricing: https://developer.twitter.com/en/products/twitter-api
- Post Express CLAUDE.md: `/CLAUDE.md`
- Supabase Schema: `/database/optimized-schema.sql`

---

## 📝 Notas

### Decisões Arquiteturais
- **Por que Railway/Render?** Vercel serverless tem timeout de 10s (não serve para stream contínuo)
- **Por que Filtered Stream?** Tempo real (1-5s) vs. Search API (delay de 15 min + limite de 1.500 tweets/mês free)
- **Por que Slack?** Simples, grátis, webhook nativo (email para clientes vem depois)

### Alternativas Descartadas
- ❌ Polling via Search API (não é tempo real + limite baixo no free tier)
- ❌ Scraping com Apify (viola TOS do Twitter + caro)
- ❌ WebSub para Twitter (não existe - só YouTube tem)

---

**Última atualização:** 2026-02-19
**Próxima revisão:** 2026-02-26
