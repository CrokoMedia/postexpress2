# /mission - MISSION CONTROL COMMAND

> **Sistema:** JARVIS Mission Control v3.0
> **Arquivos:** `/.claude/mission-control/`
> **Executor:** `/.claude/mission-control/jarvis_mission.py`

---

## SINTAXE

```
/mission [subcomando] [args]
```

---

## SUBCOMANDOS

### PRINCIPAIS

| Comando | Ação |
|---------|------|
| `/mission status` | Mostrar status completo da missão atual |
| `/mission status compact` | Status resumido (uma linha) |
| `/mission resume` | Continuar de onde parou |
| `/mission pause` | Pausar após batch atual |
| `/mission new [planilha_id]` | Iniciar nova missão com planilha Google Sheets |
| `/mission sync-source [planilha_id]` | Sincronizar source com INBOX (read + compare + download) |
| `/mission validate-source` | Validar completude da source atual |
| `/mission report` | Gerar relatório final |

### CONTROLE DE FASE

| Comando | Ação |
|---------|------|
| `/mission phase 1` | Ir para Fase 1: Inventário |
| `/mission phase 2` | Ir para Fase 2: Download |
| `/mission phase 3` | Ir para Fase 3: Organização |
| `/mission phase 4` | Ir para Fase 4: Pipeline Jarvis |
| `/mission phase 5` | Ir para Fase 5: Alimentação |

### CONTROLE DE BATCH

| Comando | Ação |
|---------|------|
| `/mission batch status` | Status do batch atual |
| `/mission batch skip [file]` | Pular arquivo específico |
| `/mission batch retry [file]` | Retry arquivo com erro |
| `/mission batch next` | Forçar próximo batch |

### DEBUG

| Comando | Ação |
|---------|------|
| `/mission logs` | Ver logs detalhados |
| `/mission errors` | Ver erros e quarentena |
| `/mission validate` | Validar integridade |
| `/mission export` | Exportar relatório |

---

## EXECUÇÃO

Ao receber este comando:

### SE `/mission status`:

1. Verificar se existe `/.claude/mission-control/MISSION-STATE.json`
2. SE existe:
   - Ler estado completo
   - Mostrar status visual formatado (template abaixo)
3. SE NÃO existe:
   - Informar que nenhuma missão está ativa
   - Sugerir: `/mission new [planilha]`

### SE `/mission resume`:

1. Carregar MISSION-STATE.json
2. Identificar `resume_point`
3. Continuar da fase/batch indicado
4. Processar UM batch apenas
5. Atualizar checkpoint
6. Mostrar status pós-batch
7. Aguardar próximo comando

### SE `/mission new [planilha]`:

1. SE missão ativa existe e não está COMPLETED:
   - Perguntar se quer arquivar
2. Criar nova missão com ID `MISSION-YYYY-NNN`
3. Iniciar Fase 1 automaticamente
4. Mostrar status inicial

---

## TEMPLATE DE STATUS

```
🧠 MEGA BRAIN - MISSION CONTROL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mission: [MISSION_ID]
Fonte:   [SOURCE_FILE]
Status:  [STATUS]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 PROGRESSO POR FASE

[STATUS] Fase 1: Inventário     [BARRA] [PERCENT]%
[STATUS] Fase 2: Download       [BARRA] [PERCENT]%
[STATUS] Fase 3: Organização    [BARRA] [PERCENT]%
[STATUS] Fase 4: Pipeline       [BARRA] [PERCENT]%
[STATUS] Fase 5: Alimentação    [BARRA] [PERCENT]%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 PONTO DE RETOMADA
• Fase: [PHASE_NUMBER] - [PHASE_NAME]
• Batch: [BATCH_ID]
• Arquivos pendentes: [COUNT]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 MÉTRICAS ACUMULADAS

│ Arquivos processados │ [X] / [TOTAL] ([PERCENT]%)
│ Chunks criados       │ [COUNT]
│ Insights extraídos   │ [COUNT] ([HIGH] H, [MED] M, [LOW] L)
│ Heurísticas ★★★★★    │ [COUNT]
│ Agentes atualizados  │ [LIST]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 PRÓXIMO PASSO: [SUGGESTED_COMMAND]
```

---

## AS 5 FASES

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              5 FASES DO PIPELINE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  FASE 1: INVENTÁRIO                                                         │
│  └── Mapeia planilha fonte vs inbox existente                               │
│      Output: INVENTORY.json                                                 │
│                                                                             │
│  FASE 2: DOWNLOAD                                                           │
│  └── Baixa/transcreve materiais novos                                       │
│      Output: DOWNLOAD-LOG.json                                              │
│                                                                             │
│  FASE 3: ORGANIZAÇÃO                                                        │
│  └── Estrutura pastas e renomeia arquivos                                   │
│      Output: ORG-LOG.json                                                   │
│                                                                             │
│  FASE 4: PIPELINE JARVIS (em batches de 8)                                  │
│  └── Chunking → Entity Resolution → Insights → Narratives → Dossiers       │
│      Output: BATCH-LOG.json (por batch)                                     │
│                                                                             │
│  FASE 5: ALIMENTAÇÃO                                                        │
│  └── Atualiza agentes, souls, memories, temas                               │
│      Output: FEED-LOG.json                                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ÍCONES DE STATUS

```
✅  Completo        🔄  Em andamento       ⏳  Pendente
❌  Erro            ⏭️  Pulado             ⚠️  Alerta
★★★★★  Heurística   📍  Próximo passo      📊  Métricas
```

---

## BARRAS DE PROGRESSO

```
░░░░░░░░░░░░░░░░░░░░  0%      ██████████░░░░░░░░░░  50%
████░░░░░░░░░░░░░░░░  20%     ████████████████░░░░  80%
████████░░░░░░░░░░░░  40%     ████████████████████  100%
```

---

## REGRAS INVIOLÁVEIS

```
❌ NUNCA processar sem checkpoint anterior salvo
❌ NUNCA avançar fase sem aprovação do humano
❌ NUNCA omitir chunk_id de insight
❌ NUNCA batch com mais de 10 arquivos
❌ NUNCA modificar MISSION-STATE.json sem backup

✅ SEMPRE mostrar status visual após operação
✅ SEMPRE checkpoint após cada batch
✅ SEMPRE aguardar comando explícito
✅ SEMPRE JSON válido nos outputs
```

---

## ARQUIVOS GERADOS

```
/.claude/mission-control/
├── MISSION-STATE.json      ← Estado central (CRÍTICO)
├── INVENTORY.json          ← Mapeamento fonte vs inbox
├── DOWNLOAD-LOG.json       ← Log de downloads
├── ORG-LOG.json            ← Log de organização
├── BATCH-LOGS/
│   └── BATCH-NNN.json
├── SESSION-LOGS/
│   └── SESSION-YYYY-MM-DD-NNN.json
└── ERROR-QUARANTINE/
    └── [arquivos com problema]
```

---

## INTEGRAÇÃO COM PYTHON

### Comandos de Alto Nível (via /mission)

```bash
# Status
python .claude/mission-control/jarvis_mission.py status

# Nova missão
python .claude/mission-control/jarvis_mission.py new <spreadsheet_id>

# Continuar
python .claude/mission-control/jarvis_mission.py resume

# Sincronizar source (read + compare + download)
python .claude/mission-control/jarvis_mission.py sync-source <spreadsheet_id>

# Validar completude
python .claude/mission-control/jarvis_mission.py validate-source
```

### Scripts Internos (chamados automaticamente)

**FASE 1-3: Source Synchronization (6-step pipeline)**

```bash
# Step 1: Read complete source (bypasses MCP limitations)
python scripts/read_planilha_complete.py <spreadsheet_id> --auto
# Output: PLANILHA-COMPLETE-LIST.json

# Step 2: Compare source vs INBOX (arquivo por arquivo)
python scripts/compare_source_vs_inbox.py PLANILHA-COMPLETE-LIST.json
# Output: COMPARISON-REPORT.json

# Step 3: Download ONLY missing files from source
python scripts/download_missing_from_source.py COMPARISON-REPORT.json

# Step 4: Auto-organize (protocolo oficial CLAUDE.md)
python scripts/inbox_auto_organize.py --execute

# Step 5: Reorganize by planilha (ajuste fino por source)
python scripts/reorganize_by_planilha.py --execute

# Step 6: Clean duplicates
python scripts/clean_duplicates.py --execute
```

**FASE 4: Identify New Files (evita leitura dupla)**

```bash
# Identifica quais arquivos do INBOX são NOVOS (não processados)
python scripts/identify_new_files.py --output NEW-FILES-TO-PROCESS.json
```

**Comando único que executa TUDO (6 steps):**
```bash
python scripts/mission_sync_source.py <spreadsheet_id>
```

**Todos os scripts são reutilizáveis para QUALQUER planilha/source nova.**

### Scripts de Download

```bash
# Download all courses from inventory
python scripts/download_all_transcriptions.py --all --resume

# Download specific course
python scripts/download_all_transcriptions.py --course JEREMY_HAYNES

# List available courses
python scripts/download_all_transcriptions.py --list
```

---

## STATUS VISUAL POR FASE

Cada fase possui um formato visual detalhado e específico.

> **Protocolo completo:** `/.claude/mission-control/PHASE-VISUAL-PROTOCOL.md`

### Scripts de Status Visual

| Fase | Script | Comando |
|------|--------|---------|
| GERAL | `mission_status_all_phases.py` | `python scripts/mission_status_all_phases.py` |
| 3 | `org_log_generator.py` | `python scripts/org_log_generator.py` |
| 4 | `mission_status_enhanced.py` | `python scripts/mission_status_enhanced.py` |

### Estrutura Visual Padrão

**TODAS as fases DEVEM exibir:**

1. Header da Missão (ID, Source, Status, Timestamp)
2. Barra de Progresso Geral (5 fases com ícones ✅🔄⏳)
3. ASCII Art da Fase Ativa (FASE 1, FASE 2, etc.)
4. Corpo Detalhado (específico por fase)
5. Footer com Próximo Passo

### Fase 3: Organização (Detalhes)

O log da Fase 3 inclui:

- **Resumo Executivo:** arquivos processados, movidos, renomeados, duplicatas
- **Distribuição por Destino:** quantidade por pasta com barras visuais
- **Fluxo de Movimentação:** top 10 origem → destino
- **Ações de Renomeação:** tipos + exemplos antes/depois
- **Limpeza de Duplicatas:** critérios + espaço liberado
- **Sankey Visual:** fluxo geral simplificado
- **Estrutura Final:** árvore do INBOX final

```bash
# Gerar log completo da Fase 3
python scripts/org_log_generator.py

# Salvar em arquivo
python scripts/org_log_generator.py --save
```

---

## REFERÊNCIAS

- **Documentação completa:** `/.claude/mission-control/MISSION-CONTROL-MASTER.md`
- **Protocolo Visual:** `/.claude/mission-control/PHASE-VISUAL-PROTOCOL.md`
- **Prompt JARVIS:** `/.claude/mission-control/JARVIS-EXECUTOR-PROMPT.md`
- **Quick Reference:** `/.claude/mission-control/QUICK-REFERENCE-CARD.md`
- **Templates JSON:** `/.claude/mission-control/JSON-TEMPLATES.md`
