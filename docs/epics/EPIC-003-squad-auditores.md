# EPIC 003: Squad Auditores

**Status**: ⏳ Pendente
**Prioridade**: 🔴 Alta
**Duração Estimada**: 1 semana (Semana 3)
**Agente Responsável**: @dev + MMOS-Squad (Mind Mapper)

---

## 🎯 OBJETIVO
Implementar Squad Auditores com 5 mentes para análise automatizada de conteúdo e geração de Score Card.

---

## 📊 CONTEXTO
**Dependências**: EPIC-002 (dados do Apify disponíveis)
**Bloqueia**: EPIC-004 (Squad Criação usa insights da auditoria)

---

## 📋 TAREFAS

### Task 3.1: Mapear Marty Cagan (Mind Mapper)
**Duração**: 4h

- Ler INSPIRED (principais capítulos sobre métricas)
- Extrair frameworks: Outcomes vs Outputs, Leading/Lagging indicators
- Criar `squad-auditores/minds/marty_cagan/system_prompts/v1.0.md`
- Validar fidelidade (>70%)

**Entregáveis**:
- [ ] System prompt Marty Cagan
- [ ] Frameworks de métricas documentados
- [ ] Testes de validação

---

### Task 3.2: Orquestrador do Squad (@ dev)
**Duração**: 3 dias

Implementar:
```javascript
// src/squads/auditores/orchestrator.js
async function runAudit(clienteId) {
  // 1. Buscar dados do Supabase
  // 2. Fase COMPORTAMENTO (Kahneman)
  // 3. Fase COPY (Schwartz)
  // 4. Fase OFERTAS (Hormozi)
  // 5. Fase MÉTRICAS (Cagan)
  // 6. Fase ANOMALIAS (Graham)
  // 7. Agregar scores (pesos)
  // 8. Gerar Score Card
  // 9. Salvar em auditorias
}
```

**Entregáveis**:
- [ ] `src/squads/auditores/orchestrator.js`
- [ ] `src/squads/auditores/score-aggregator.js`
- [ ] `src/squads/auditores/score-card-generator.js`
- [ ] Testes (coverage > 80%)

---

## 🚦 GATE DE QUALIDADE

- [ ] Score Card gerado corretamente
- [ ] 5 mentes funcionando (fidelidade >70%)
- [ ] Benchmark: 10 contas auditadas sem erros
- [ ] Scores fazem sentido (validação manual)

---

## 🎯 PRÓXIMO PASSO
→ **EPIC-004: Squad Criação**

**Criado por**: @pm (Morgan)
**Data**: 2026-02-16
