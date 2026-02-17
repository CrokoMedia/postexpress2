# Plano de Execução — Clone de Gary Vaynerchuk

> Roadmap completo para clonar a mente do Gary Vaynerchuk com 94% de fidelidade.
> Pipeline: Viabilidade → Pesquisa → Análise → Síntese → System Prompt → Teste

---

## 🎯 Objetivo

Criar um clone cognitivo do GaryVee capaz de:
- Dar conselhos de marketing de conteúdo com o estilo e framework dele
- Responder questões sobre atenção, consistência e personal branding como ele responderia
- Gerar ideias de conteúdo com o mindset de "atenção como commoditiy"

**Uso no Post Express:** Agente consultor de conteúdo para creators

---

## 📊 Status do Pipeline

| Fase | Status | Responsável | Concluído em |
|------|--------|-------------|-------------|
| 1. Viabilidade | ⬜ Pendente | @mind-mapper | — |
| 2. Pesquisa / Coleta | ⬜ Pendente | ETL Data Collector | — |
| 3. Análise Cognitiva | ⬜ Pendente | @cognitive-analyst | — |
| 4. Síntese KB | ⬜ Pendente | @charlie-synthesis-expert | — |
| 5. System Prompt | ⬜ Pendente | @system-prompt-architect | — |
| 6. Teste de Fidelidade | ⬜ Pendente | @debate + @emulator | — |

---

## FASE 1 — Viabilidade

**Agente:** `@mind-mapper`
**Comando:** `*map gary_vaynerchuk`
**Tempo estimado:** 30-45 min

### Checklist
- [ ] Executar APEX scoring (6 dimensões)
- [ ] Verificar ICP match ≥ 70%
- [ ] Gerar `viability/viability-output.yaml`
- [ ] Gerar `viability/prd.md`
- [ ] Decisão GO/NO-GO

### APEX — Dimensões a avaliar para GaryVee
| Dimensão | Expectativa |
|----------|------------|
| Volume de fontes | ALTO — 4k+ vídeos, 4 livros, blog extenso |
| Profundidade de pensamento | ALTO — frameworks consistentes |
| Consistência ao longo do tempo | ALTO — 15+ anos de conteúdo |
| Singularidade / diferenciação | ALTO — voz muito distinta |
| Acessibilidade das fontes | ALTO — quase tudo público e gratuito |
| Relevância para o ICP | ALTO — criadores de conteúdo |

**Previsão:** GO com score ≥ 85/100

---

## FASE 2 — Pesquisa e Coleta

**Ferramenta:** ETL Data Collector
**Comando:**
```bash
node expansion-packs/etl-data-collector/run-collection.js \
  minds/gary_vaynerchuk/sources/tier1_batch.yaml \
  minds/gary_vaynerchuk/sources \
  expansion-packs/etl-data-collector/config/download-rules.yaml
```
**Tempo estimado:** 2-4 horas (coleta paralela)

### Fontes Planejadas por Tier

#### TIER 1 — Crítico (coletar primeiro)
| # | Tipo | Fonte | Notas |
|---|------|-------|-------|
| 1 | Livro | *Crush It!* (2009) | PDF disponível |
| 2 | Livro | *Jab, Jab, Jab, Right Hook* (2013) | PDF disponível |
| 3 | Livro | *#AskGaryVee* (2016) | PDF disponível |
| 4 | Livro | *Crushing It!* (2018) | PDF disponível |
| 5 | YouTube | GaryVee — Top 50 vídeos mais assistidos | Legenda automática |
| 6 | Blog | garyvaynerchuk.com — todos os posts | HTTP direto |
| 7 | Podcast | GaryVee Audio Experience — top 20 eps | AssemblyAI |

#### TIER 2 — Importante
| # | Tipo | Fonte | Notas |
|---|------|-------|-------|
| 8 | YouTube | Keynotes e palestras longas | Legenda automática |
| 9 | Podcast | The GaryVee Audio Experience (100+ eps) | AssemblyAI |
| 10 | YouTube | Entrevistas no Lex Fridman, Tim Ferriss | Legenda automática |
| 11 | Blog | Medium posts | HTTP direto |
| 12 | Social | Twitter/X — threads substanciais | Manual / Apify |

#### TIER 2 — Social Media (alto volume, frases concentradas)
| # | Tipo | Fonte | Handle | Meta | API |
|---|------|-------|--------|------|-----|
| 8 | TikTok | @garyvee | garyvee | 100+ vídeos | Apify |
| 9 | Instagram | @garyvee | garyvee | 100 posts | Apify |
| 10 | Twitter | @garyvee | garyvee | 200 tweets | Apify |
| 11 | LinkedIn | @garyvaynerchuk | garyvaynerchuk | 50 posts | Apify |

#### TIER 3 — Complementar
| # | Tipo | Fonte | Notas |
|---|------|-------|-------|
| 12 | YouTube | Daily Vlog (DailyVee) | Legenda automática |
| 13 | YouTube | Wine Library TV (early career) | Legenda automática — voz jovem |
| 14 | Entrevista | Documentário "Don't Scale" | AssemblyAI se disponível |

### Meta de Coleta
- **Mínimo:** 15 fontes (5 Tier1, 6 Tier2, 4 Tier3)
- **Ideal:** 30+ fontes cobrindo todas as 8 camadas DNA Mental
- **Cobertura temporal:** 2006 (Wine Library) → 2026 (atual)

### Checklist Fase 2
- [ ] Criar `sources/tier1_batch.yaml` com as fontes acima
- [ ] Executar ETL Data Collector
- [ ] Validar: `node validate-log-locations.js minds/gary_vaynerchuk`
- [ ] Verificar `sources_master.yaml` gerado
- [ ] Confirmar cobertura de todas as 8 camadas DNA Mental
- [ ] Aprovar para Fase 3

---

## FASE 3 — Análise Cognitiva (DNA Mental 8 Camadas)

**Agente:** `@cognitive-analyst`
**Tempo estimado:** 4-6 horas

### DNA Mental — Foco por Camada para GaryVee

| Camada | O que buscar | Fontes primárias |
|--------|-------------|-----------------|
| **L1 Essência** | Imigrante → empreendedor → dono de atenção | Biografias, entrevistas primárias |
| **L2 Comunicação** | "Day trading attention", "patience", "cloud and dirt" | Livros, YouTube |
| **L3 Modelos Mentais** | Jab x Right Hook, Attention Arbitrage, Legacy > Currency | Livros, palestras |
| **L4 Valores** | Família, legado, autenticidade, long game | Entrevistas profundas |
| **L5 Frases Signature** | "Stop doing shit you hate", "macro patience micro speed" | Social, YouTube |
| **L6 Obsessões** | Atenção, gratidão, self-awareness, eliminar ego | Podcasts, vlogs |
| **L7 Singularidade** | Combina humildade + agressividade + gratidão | Análise comparativa |
| **L8 Paradoxos** | "Não me importo com dinheiro" mas é multimilionário | Análise profunda |

### Checklist Fase 3
- [ ] Análise L1-L3 (`core-essence-extraction`)
- [ ] Análise L4-L5 (`values-hierarchy-analysis`)
- [ ] Análise L6-L8 (`identity-analyst`) ← O OURO
- [ ] Extração de frases signature (`signature-phrases-mining`)
- [ ] Identificação de frameworks (`frameworks-identifier-analysis`)
- [ ] Mapeamento de paradoxos (`contradictions-synthesis`)
- [ ] Gerar `artifacts/dna-mental-analysis.md`

---

## FASE 4 — Síntese da Knowledge Base

**Agente:** `@charlie-synthesis-expert`
**Tempo estimado:** 2-3 horas

### Checklist Fase 4
- [ ] Chunking de todas as fontes (`knowledge-base-chunking`)
- [ ] Extrair templates de comunicação (`communication-templates-extraction`)
- [ ] Compilar KB por camada DNA Mental
- [ ] Gerar `kb/gary_vaynerchuk_kb.md`
- [ ] Gerar `kb/qa_dataset.jsonl` (pares P&R para fine-tuning)

---

## FASE 5 — System Prompt (COGNITIVE_OS)

**Agente:** `@system-prompt-architect`
**Tempo estimado:** 1-2 horas

### Checklist Fase 5
- [ ] Compilar identidade em COGNITIVE_OS
- [ ] Definir voz, vocabulário, restrições
- [ ] Codificar paradoxos e nuances (L8)
- [ ] Incluir anti-padrões (o que GaryVee NUNCA diria)
- [ ] Gerar `system_prompts/COGNITIVE_OS.md`
- [ ] Revisão humana do system prompt

---

## FASE 6 — Teste de Fidelidade

**Agentes:** `@debate` + `@emulator`
**Tempo estimado:** 1-2 horas

### Checklist Fase 6
- [ ] Ativar clone: `@emulator *activate gary_vaynerchuk`
- [ ] Aplicar 20 perguntas de benchmark
- [ ] Comparar respostas com respostas reais do GaryVee
- [ ] Score de fidelidade ≥ 94%
- [ ] Debate com outro clone para testar autenticidade
- [ ] Aprovação final e deploy

---

## 🗓️ Cronograma Estimado

| Fase | Duração | Quando |
|------|---------|--------|
| 1. Viabilidade | 1h | Sessão 1 |
| 2. Coleta | 3-4h | Sessão 1-2 |
| 3. Análise | 4-6h | Sessão 2-3 |
| 4. Síntese KB | 2-3h | Sessão 3 |
| 5. System Prompt | 2h | Sessão 4 |
| 6. Testes | 2h | Sessão 4 |
| **TOTAL** | **~20h** | **4 sessões** |

---

## 📁 Estrutura Final Esperada

```
minds/gary_vaynerchuk/
├── metadata.yaml
├── PLANO-EXECUCAO.md        ← este arquivo
├── sources/
│   ├── sources_master.yaml
│   ├── blogs/               ← artigos coletados
│   ├── youtube/             ← transcrições
│   ├── pdf/                 ← livros
│   └── audio/               ← podcasts
├── docs/
│   └── logs/                ← relatórios de coleta
├── kb/
│   ├── gary_vaynerchuk_kb.md
│   └── qa_dataset.jsonl
├── artifacts/
│   └── dna-mental-analysis.md
└── system_prompts/
    └── COGNITIVE_OS.md      ← produto final
```

---

*Criado: 2026-02-17 | Versão: 1.0*
