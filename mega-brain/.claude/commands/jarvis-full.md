---
description: Executa pipeline completo (ingest + process + enrich) sem paradas
argument-hint: [URL or path] [--verbose] [--dry-run] [--person "Name"]
---

# /jarvis-full - Execução Completa do Pipeline

> **Versão:** 1.1.0
> **Alias:** /jf
> **Escrita:** Aplica `NARRATIVE-METABOLISM-PROTOCOL.md` automaticamente

---

## DESCRIÇÃO

Executa o pipeline completo desde ingestão até enrichment, sem paradas humanas.
Combina `/ingest` + `/process-jarvis --auto-enrich` em um único comando.

---

## SINTAXE

```
/jarvis-full [URL ou PATH] [FLAGS]
```

| Flag | Descrição |
|------|-----------|
| (nenhuma) | Progresso mínimo + FULL PIPELINE REPORT ao final |
| `--verbose` | Todos os logs aparecem durante execução |
| `--dry-run` | Mostra o que faria sem executar |
| `--person "Nome"` | Define pessoa manualmente |
| `--type TIPO` | Define tipo (PODCAST, MASTERCLASS, COURSE) |

---

## COMPORTAMENTO

### Step 1: Ingest (se URL/Path novo)
```
IF input is URL:
  EXECUTE /ingest [URL]
  WAIT for transcript

IF input is local file:
  COPY to inbox/{PERSON}/{TYPE}/
  GENERATE Source ID
```

### Step 2: Pipeline Jarvis (auto-enrich)
```
EXECUTE /process-jarvis "{SOURCE_ID}" --auto-enrich

# 📖 NARRATIVE METABOLISM é aplicado AUTOMATICAMENTE em Phase 6
# Ver: /agents/protocols/NARRATIVE-METABOLISM-PROTOCOL.md
# Estrutura: TL;DR → Filosofia → Modus Operandi → Arsenal → Armadilhas → Citações → Metadados
# Voz PERSONS: 1ª pessoa | Voz THEMES: Narrador neutro | Densidade: ◯-◐

SHOW minimal progress:
  ⏳ Phase 1: Initialization... ✅
  ⏳ Phase 2: Chunking ({N} chunks)... ✅
  ⏳ Phase 3: Entity Resolution... ✅
  ⏳ Phase 4: Insight Extraction ({N} insights)... ✅
  ⏳ Phase 5: Narrative Synthesis... ✅
  ⏳ Phase 6: Dossier Compilation (Narrative Metabolism)... ✅
  ⏳ Phase 7: Agent Enrichment... ✅
  ⏳ Phase 8: Finalization... ✅
```

### Step 3: Full Pipeline Report
```
GENERATE FULL PIPELINE REPORT (LOG 7)
SAVE to /logs/FULL/FULL-{SOURCE_ID}-{TIMESTAMP}.md
DISPLAY report
```

---

## OUTPUT

### Durante Execução (modo padrão)
```
═══════════════════════════════════════════════════════════════════════════════
                         JARVIS FULL AUTO
                         {SOURCE_ID} - {PERSON_NAME}
═══════════════════════════════════════════════════════════════════════════════

⏳ Ingerindo material... ✅
⏳ Phase 1: Initialization... ✅
⏳ Phase 2: Chunking (28 chunks)... ✅
⏳ Phase 3: Entity Resolution... ✅
⏳ Phase 4: Insight Extraction (14 insights)... ✅
⏳ Phase 5: Narrative Synthesis... ✅
⏳ Phase 6: Dossier Compilation... ✅
⏳ Phase 7: Agent Enrichment... ✅
⏳ Phase 8: Finalization... ✅

✅ COMPLETO em 3m 42s

[FULL PIPELINE REPORT segue abaixo]
```

### Ao Final
```
[FULL PIPELINE REPORT - LOG 7 completo]
```

---

## EQUIVALENTE A

```bash
# Comando único
/jarvis-full https://youtube.com/watch?v=abc123

# É equivalente a:
/ingest https://youtube.com/watch?v=abc123
/process-jarvis "{PATH_GERADO}" --auto-enrich
```

---

## EXEMPLOS

```bash
# YouTube video
/jarvis-full https://youtube.com/watch?v=abc123

# YouTube com pessoa definida
/jarvis-full https://youtube.com/watch?v=abc123 --person "Cole Gordon"

# Arquivo local
/jarvis-full "/path/to/transcript.txt" --person "Jeremy Haynes" --type PODCAST

# Dry run (preview)
/jarvis-full https://youtube.com/watch?v=abc123 --dry-run

# Verbose (todos os logs)
/jarvis-full https://youtube.com/watch?v=abc123 --verbose
```

---

## QUANDO USAR

| Situação | Comando |
|----------|---------|
| Quer controle total | `/ingest` + `/process-jarvis` |
| Quer revisar antes de enriquecer | `/process-jarvis` (checkpoint em Phase 6) |
| **Quer automação total** | `/jarvis-full` ✅ |
| Múltiplos arquivos | `/process-inbox --all --auto-enrich` |

---

## LOGS GERADOS

| Log | Localização |
|-----|-------------|
| INGEST REPORT | Exibido durante execução |
| EXECUTION REPORT | `/logs/EXECUTION/` |
| AGENT ENRICHMENT | Incluído no FULL PIPELINE REPORT |
| **FULL PIPELINE REPORT** | `/logs/FULL/FULL-{SOURCE_ID}-{TIMESTAMP}.md` |

---

## ERROS COMUNS

| Erro | Causa | Solução |
|------|-------|---------|
| "Pessoa não identificada" | URL sem metadata clara | Usar `--person "Nome"` |
| "Transcrição falhou" | Vídeo privado ou indisponível | Verificar URL, tentar local |
| "Source ID já existe" | Material já processado | Verificar `/inbox` ou forçar novo ID |

---

## CHANGELOG

| Versão | Data | Mudança |
|--------|------|---------|
| 1.1.0 | 2025-12-20 | Integração automática com NARRATIVE-METABOLISM-PROTOCOL |
| 1.0.0 | 2025-12-19 | Criação inicial |
