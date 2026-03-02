---
paths:
  - "logs/**/*"
  - "*.log"
  - "**/BATCH-*.md"
  - "**/SESSION-*.md"
---

# Regras de Logging

## 📋 Princípio

Todo processamento gera log. Sem exceções.

## 📁 Dual-Location (sempre ambos)

| Tipo | Human-readable | Machine-readable |
|------|----------------|------------------|
| Batch | `/logs/batches/BATCH-NNN.md` | `/.claude/mission-control/batch-logs/BATCH-NNN.json` |
| Session | `/logs/sessions/SESSION-*.md` | `/.claude/mission-control/SESSION-LOGS/SESSION-*.json` |
| Source | `/logs/sources/SOURCE-XX.md` | - |
| Phase | `/logs/phases/PHASE-X.md` | - |
| Handoff | `/logs/handoffs/HANDOFF-*.md` | - |

## 📝 Campos obrigatórios em logs

```yaml
timestamp: ISO 8601 (2026-01-08T14:30:00Z)
mission_code: MISSION-2026-001
session_id: SESSION-2026-01-08-001
phase: 1-5
batch: NNN
source: XX (código da fonte)
```

## 📊 Métricas obrigatórias

Sempre mostrar DUAS colunas:
- **Acumulado:** Total desde início da missão
- **Esta sessão:** Apenas o que foi feito agora

## ⚡ Triggers automáticos

| Evento | Ação |
|--------|------|
| Batch completo | Criar BATCH-NNN.md + .json |
| Source completa | Criar SOURCE-XX-COMPLETE.md |
| Fase completa | Criar PHASE-X-COMPLETE.md |
| Sessão encerra | Criar HANDOFF-LATEST.md |

## 🔗 Referência

Para templates completos: `@/reference/JARVIS-LOGGING-SYSTEM-V3.md`
