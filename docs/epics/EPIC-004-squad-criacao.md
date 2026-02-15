# EPIC 004: Squad Criação de Conteúdo

**Status**: ⏳ Pendente
**Prioridade**: 🔴 Alta
**Duração Estimada**: 1 semana (Semana 4)
**Agente Responsável**: @dev + MMOS-Squad (Mind Mapper)

---

## 🎯 OBJETIVO
Implementar Squad Criação com 5 mentes para geração automatizada de carrosséis de alta conversão.

---

## 📊 CONTEXTO
**Dependências**: EPIC-003 (insights da auditoria)
**Bloqueia**: EPIC-005 (Cloudinary precisa do copy gerado)

---

## 📋 TAREFAS

### Task 4.1: Expandir Alex Hormozi (Mind Mapper)
**Duração**: 5h

- Ler $100M Offers completo
- Extrair Value Equation, urgência/escassez
- Criar system prompt v2.0
- Validar com exemplos de vendas

**Entregáveis**:
- [ ] System prompt v2.0
- [ ] Value Equation completa
- [ ] Templates de oferta

---

### Task 4.2: Construir/Validar Thiago Finch (@analyst)
**Duração**: 6h

Pesquisar Thiago Finch OU Pedro Valério:
- Conteúdo público disponível?
- Padrões de linguagem BR
- Gatilhos mentais BR

**Decisão**: Finch vs Valério vs Construir persona do zero

**Entregáveis**:
- [ ] System prompt da mente escolhida
- [ ] Validação de localização BR

---

### Task 4.3: Orquestrador do Squad (@dev)
**Duração**: 3 dias

Implementar workflow de 7 fases:
```javascript
// src/squads/criacao/orchestrator.js
async function createCarousel(briefing) {
  // Fase 1: BRIEFING
  // Fase 2: ESTRATÉGIA (Seth Godin)
  // Fase 3: COPY (Eugene Schwartz)
  // Fase 4: OTIMIZAÇÃO (Alex Hormozi)
  // Fase 5: LOCALIZAÇÃO (Thiago Finch)
  // Fase 6: VISUAL (Adriano De Marqui)
  // Fase 7: REVIEW
  // Output: JSON + Markdown
}
```

**Entregáveis**:
- [ ] `src/squads/criacao/orchestrator.js`
- [ ] `src/squads/criacao/formula-selector.js`
- [ ] Testes: gerar 10 carrosséis

---

## 🚦 GATE DE QUALIDADE

- [ ] 20 carrosséis gerados
- [ ] Qualidade de copy aprovada (>80% satisfação interna)
- [ ] Tempo médio < 15 min
- [ ] Fórmulas aplicadas corretamente

---

## 🎯 PRÓXIMO PASSO
→ **EPIC-005: Geração Visual (Cloudinary)**

**Criado por**: @pm (Morgan)
**Data**: 2026-02-16
