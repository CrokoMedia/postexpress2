# Playbook de Clonagem de Mentes
## Setup Synkra AIOS + MMOS Squad + ETL Data Collector

> Guia operacional completo para clonar qualquer mente com 94% de fidelidade.
> Específico para este ambiente: postexpress2 + nossas APIs configuradas.

---

## 🏗️ Infraestrutura Disponível

### APIs Configuradas
| API | Finalidade | Plano | Limite |
|-----|-----------|-------|--------|
| `ANTHROPIC_API_KEY` | Análise cognitiva (Claude) | Pago | Ilimitado |
| `GOOGLE_API_KEY` | Análise Gemini | Pago | Ilimitado |
| `ASSEMBLYAI_API_KEY` | Transcrição de áudio | **Grátis** | 185h pré-gravado |
| `APIFY_API_TOKEN` | Scraping de blogs/sites | Pago | Por compute unit |
| `EXA_API_KEY` | Descoberta de fontes web | Pago | Ilimitado |
| `OPENAI_API_KEY` | Fallback de transcrição | Pago | Por token |

### Componentes Instalados
| Componente | Localização | Função |
|-----------|------------|--------|
| MMOS Squad | `mmos-squad/` | 10 agentes de clonagem cognitiva |
| ETL Data Collector | `expansion-packs/etl-data-collector/` | Coleta automática de fontes |
| Mentes clonadas | `minds/` | 27 mentes já prontas + novas |
| Squad Creator | `squads/squad-creator/` | Criar novos squads |

---

## 📋 Processo Completo — 6 Fases

### FASE 1 — Viabilidade (30-60 min)

**Quando:** Antes de qualquer coleta. Evita desperdício de recursos.

**Comando:**
```
@mind-mapper
*map {nome_da_pessoa}
```

**O que avalia (APEX Score):**
- Volume de conteúdo público disponível
- Profundidade e consistência do pensamento
- Cobertura temporal (evolução ao longo do tempo)
- Singularidade da voz
- Acessibilidade das fontes
- Relevância para o caso de uso

**Saída:**
```
minds/{slug}/viability/viability-output.yaml  ← score APEX
minds/{slug}/viability/prd.md                ← PRD se GO
```

**Critério GO:** APEX ≥ 50/100 e ICP match ≥ 70%

---

### FASE 2 — Pesquisa e Coleta (2-6 horas)

**Quando:** Após GO da viabilidade.

#### Passo 1 — Descobrir fontes
```
@research-specialist
*discover {nome_da_pessoa}
```
O agente usa EXA (via Docker MCP) para mapear fontes disponíveis.

#### Passo 2 — Criar batch file
Criar manualmente ou gerado pelo agente:
```yaml
# minds/{slug}/sources/tier1_batch.yaml
mind: {slug}
name: tier1
sources:
  - id: "001"
    type: youtube       # youtube | blog | pdf | audio | podcast
    video_id: "xxxxx"  # ou url: / path: / audio_url:
    title: "Título"
    tier: 1             # 1=crítico | 2=importante | 3=complementar
```

#### Passo 3 — Executar coleta
```bash
node expansion-packs/etl-data-collector/run-collection.js \
  minds/{slug}/sources/tier1_batch.yaml \
  minds/{slug}/sources \
  expansion-packs/etl-data-collector/config/download-rules.yaml
```

#### Passo 4 — Validar estrutura
```bash
node expansion-packs/etl-data-collector/validate-log-locations.js minds/{slug}
```

**Mínimos obrigatórios:**
- ≥ 15 fontes coletadas com sucesso
- ≥ 5 fontes Tier 1
- ≥ 3 tipos de fonte diferentes
- Cobertura de todas as 8 camadas DNA Mental

**Saídas:**
```
minds/{slug}/sources/sources_master.yaml
minds/{slug}/docs/logs/{timestamp}-collection-report.yaml
```

---

### FASE 3 — Análise Cognitiva (4-8 horas)

**Quando:** Após coleta validada (sources_master.yaml gerado).

**Comando:**
```
@cognitive-analyst
*analyze {slug}
```

**DNA Mental 8 Camadas:**
| Layer | Análise | Task |
|-------|---------|------|
| L1 Essência Central | Identidade fundamental, motivações raiz | `core-essence-extraction` |
| L2 Comunicação | Voz, vocabulário, frases signature | `signature-phrases-mining` |
| L3 Modelos Mentais | Frameworks e heurísticas | `frameworks-identifier-analysis` |
| L4 Valores | Hierarquia de prioridades | `values-hierarchy-analysis` |
| L5 Obsessões | Temas recorrentes | `identity-analyst` |
| L6 Singularidade | O que diferencia dos outros | `identity-analyst` |
| L7 Paradoxos | Contradições que definem autenticidade | `contradictions-synthesis` |

**L7 Paradoxos é o mais importante** — é o que torna o clone indistinguível do original.

**Saída:**
```
minds/{slug}/artifacts/dna-mental-analysis.md
```

---

### FASE 4 — Síntese da Knowledge Base (2-3 horas)

**Quando:** Após análise cognitiva completa.

**Comando:**
```
@charlie-synthesis-expert
*synthesize {slug}
```

**O que gera:**
- KB chunkeada por camada DNA Mental
- Pares P&R para fine-tuning (opcional)
- Templates de comunicação
- Anti-padrões (o que a pessoa NUNCA diria)

**Saída:**
```
minds/{slug}/kb/{slug}_kb.md
minds/{slug}/kb/qa_dataset.jsonl   (opcional, para fine-tuning)
```

---

### FASE 5 — System Prompt / COGNITIVE_OS (1-2 horas)

**Quando:** KB compilada e revisada.

**Comando:**
```
@system-prompt-architect
*create-prompt {slug}
```

**O system prompt inclui obrigatoriamente:**
- Identidade e essência (L1)
- Voz e vocabulário (L2) — com `always_use` e `never_use`
- Modelos mentais ativos (L3)
- Valores hierarquizados (L4)
- Obsessões codificadas (L5-L6)
- Paradoxos produtivos (L7) ← diferencial de fidelidade
- Anti-padrões explícitos

**Saída:**
```
minds/{slug}/system_prompts/COGNITIVE_OS.md
```

---

### FASE 6 — Teste de Fidelidade (1-2 horas)

**Quando:** System prompt gerado e revisado humanamente.

**Ativar clone:**
```
@emulator *activate {slug}
```

**Protocolo de teste:**
1. Aplicar 20 perguntas benchmark nas áreas de especialidade
2. Comparar respostas com respostas reais documentadas
3. Testar casos extremos (perguntas que ele nunca respondeu)
4. Debate com outro clone (opcional): `@debate *debate {slug} {outro_slug} "tema"`

**Score mínimo:** 94% de fidelidade

**Saída:**
```
minds/{slug}/docs/logs/fidelity-test-results.yaml
```

---

## ⏱️ Estimativas de Tempo por Perfil

| Perfil | Volume de Conteúdo | Tempo Total |
|--------|-------------------|-------------|
| Figura pública prolífica (GaryVee, Hormozi) | Alto (4k+ conteúdos) | 20-30h |
| Figura pública moderada (Paul Graham) | Médio (500+ textos) | 12-18h |
| Expert de nicho com menos conteúdo | Baixo (<200 conteúdos) | 6-12h |
| Pessoa específica (não pública) | Depende do material fornecido | 4-8h |

---

## 💰 Custo por Clone (estimativa)

| API | Uso típico | Custo estimado |
|-----|-----------|---------------|
| Anthropic Claude | Análise + síntese + system prompt | R$ 5-15 |
| AssemblyAI | 10-20h de áudio | Grátis (plano free) |
| Apify | 50-100 páginas de blog | R$ 2-5 |
| Google Gemini | Análise complementar | R$ 1-3 |
| **Total por clone** | | **R$ 8-23** |

---

## 🚨 Erros Comuns e Soluções

| Problema | Causa | Solução |
|----------|-------|---------|
| Legenda YouTube vazia | Vídeo sem legenda automática | Usar AssemblyAI com `audio_url` |
| Blog não coletado | Site com JS pesado | Apify fallback automático |
| Score de fidelidade < 94% | L7 (paradoxos) incompleto | Revisar `contradictions-synthesis` |
| AssemblyAI falha | Sem `ASSEMBLYAI_API_KEY` | Verificar `.env` |
| PDF não parseia | Arquivo corrompido ou protegido | Usar versão alternativa do PDF |

---

## 📊 Rastreamento de Mentes

**Inventário de coletas:** `expansion-packs/etl-data-collector/data/COLLECTION-INVENTORY.md`
- Consumo de horas AssemblyAI
- Log cronológico de todas as coletas
- Status de cada mente

**Mentes já clonadas (27):**
```
alex_hormozi    eugene_schwartz  paul_graham
daniel_kahneman seth_godin       sam_altman
steve_jobs      elon_musk        marty_cagan
andrej_karpathy ray_kurzweil     napoleon_hill
don_norman      brad_frost       kent_beck
mitchell_hashimoto guillermo_rauch kapil_gupta
jeff_patton     cagan_patton     jesus_cristo
thiago_finch    adriano_de_marqui alan_nicolas
joao_lozano     jose_amorim      pedro_valerio
```

---

## ✅ Checklist Rápido para Nova Mente

```
PRÉ-CLONAGEM
[ ] Nome confirmado e slug definido (ex: gary_vaynerchuk)
[ ] mkdir -p minds/{slug}/{sources,docs/logs,kb,artifacts,system_prompts,metadata}
[ ] Criar metadata.yaml
[ ] Criar PLANO-EXECUCAO.md específico

FASE 1 — VIABILIDADE
[ ] @mind-mapper → *map {slug}
[ ] APEX ≥ 50 e ICP match ≥ 70 → GO
[ ] viability-output.yaml e prd.md gerados

FASE 2 — COLETA
[ ] tier1_batch.yaml criado com fontes mapeadas
[ ] ETL run-collection.js executado
[ ] ≥ 15 fontes coletadas
[ ] validate-log-locations.js passou
[ ] sources_master.yaml gerado

FASE 3 — ANÁLISE
[ ] @cognitive-analyst → análise completa 8 camadas
[ ] L7 paradoxos documentados (crítico para fidelidade)
[ ] dna-mental-analysis.md gerado

FASE 4 — SÍNTESE
[ ] @charlie-synthesis-expert → KB compilada
[ ] Anti-padrões identificados
[ ] kb.md e qa_dataset.jsonl gerados

FASE 5 — SYSTEM PROMPT
[ ] @system-prompt-architect → COGNITIVE_OS gerado
[ ] Revisão humana do system prompt
[ ] Anti-padrões incluídos explicitamente

FASE 6 — TESTES
[ ] @emulator *activate {slug}
[ ] 20 perguntas benchmark aplicadas
[ ] Score fidelidade ≥ 94%
[ ] COLLECTION-INVENTORY.md atualizado
[ ] metadata.yaml status → completed
```

---

*Criado: 2026-02-17 | Versão: 1.0*
*Ambiente: postexpress2 | MMOS Squad v3.0.1 | ETL Data Collector v1.0.0*
