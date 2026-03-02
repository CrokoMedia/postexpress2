# PHASE-4-VERIFICATION-CHECKPOINT

> **Versão:** 1.0.0
> **Criado:** 2026-01-05
> **Status:** OBRIGATÓRIO - NUNCA PULAR

---

## 🚨 ORIGEM DESTE PROTOCOLO

Este checkpoint foi criado após erro crítico na MISSION-2026-001:
- 32 batches processados SEM verificação de integridade
- Fontes marcadas como "COMPLETE" sem validação arquivo-por-arquivo
- Discrepâncias descobertas tardiamente (176 arquivos faltantes)

**ESTE ERRO NUNCA DEVE SE REPETIR.**

---

## ✅ CHECKLIST OBRIGATÓRIO PRÉ-PHASE-4

Antes de iniciar QUALQUER batch da Phase 4, VERIFICAR:

### 1. Inventário Completo

```
□ PLANILHA-COMPLETE-LIST.json está atualizado?
□ Todas as abas da planilha foram lidas?
□ Contagem total de itens conhecida?
```

### 2. Mapeamento Arquivo-por-Arquivo

```
□ DE-PARA-VERIFICACAO.md existe?
□ Para CADA fonte na planilha:
  □ Pasta correspondente existe no INBOX?
  □ Contagem de arquivos .txt verificada?
  □ Delta calculado (esperado vs disponível)?
```

### 3. Critérios de Continuação

```
┌─────────────────────────────────────────────────────────────────────┐
│  REGRA DE MATCH RATE                                                │
├─────────────────────────────────────────────────────────────────────┤
│  Match Rate >= 80%:  ✅ PROSSEGUIR                                  │
│  Match Rate 50-79%:  ⚠️ PROSSEGUIR COM RESSALVA (documentar)       │
│  Match Rate < 50%:   ❌ PARAR - Resolver discrepâncias primeiro     │
└─────────────────────────────────────────────────────────────────────┘
```

### 4. Decisões Explícitas

```
□ Decisão sobre arquivos FALTANTES documentada?
  - Baixar? → Voltar para Phase 2
  - Ignorar? → Registrar motivo

□ Decisão sobre arquivos EXTRAS documentada?
  - Processar? → Adicionar ao inventário
  - Ignorar? → Registrar motivo

□ Arquivos _UNKNOWN classificados?
```

### 5. Atualização de Estado

```
□ MISSION-STATE.json atualizado com:
  □ verification_status: "VERIFIED"
  □ verification_timestamp: YYYY-MM-DDTHH:MM:SS
  □ match_rate: X%
  □ discrepancies_acknowledged: true
  □ decisions_documented: true
```

---

## 🔒 BLOQUEIO AUTOMÁTICO

Se este checklist NÃO estiver completo:

```
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║   ⛔ PHASE 4 BLOQUEADA                                            ║
║                                                                   ║
║   Motivo: Verificação de integridade incompleta                   ║
║   Ação: Completar DE-PARA e verificações acima                    ║
║                                                                   ║
║   JARVIS não pode processar sem verificação.                      ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
```

---

## 📋 TEMPLATE DE VERIFICAÇÃO

Usar este formato ao verificar:

```markdown
## VERIFICAÇÃO PRÉ-PHASE-4

**Data:** YYYY-MM-DD HH:MM
**Missão:** MISSION-XXXX-NNN
**Verificador:** JARVIS

### Resultado da Verificação

| Check | Status | Nota |
|-------|--------|------|
| Inventário atualizado | ✅/❌ | |
| DE-PARA existe | ✅/❌ | |
| Match rate calculado | X% | |
| Decisão faltantes | DOC/PEND | |
| Decisão extras | DOC/PEND | |
| MISSION-STATE atualizado | ✅/❌ | |

### Decisão Final

[ ] ✅ APROVADO - Prosseguir com Phase 4
[ ] ❌ BLOQUEADO - Resolver pendências

**Justificativa:** [texto]
```

---

## 🔄 INTEGRAÇÃO COM JARVIS

Este checkpoint é executado automaticamente por JARVIS antes de:
- Iniciar nova missão Phase 4
- Retomar missão pausada
- Processar novo batch

JARVIS deve:
1. Verificar existência de DE-PARA-VERIFICACAO.md
2. Verificar verification_status em MISSION-STATE.json
3. Se falhar em qualquer check → BLOQUEAR e reportar

---

*Este protocolo é INQUEBRÁVEL. Nenhuma exceção permitida.*
