# ETL Data Collector

> Coleta paralela de fontes para o MMOS Mind Mapper.
> Extrai blogs, transcrições do YouTube, PDFs e podcasts para alimentar o pipeline de clonagem cognitiva.

---

## Visão Geral

O ETL Data Collector é o pack responsável pela **Fase 2 (Research)** do pipeline MMOS. Ele coleta automaticamente as fontes identificadas pelo `@research-specialist` e as organiza para análise pelo `@cognitive-analyst`.

**Performance:** Coleta paralela reduz o tempo em ~60% vs coleta sequencial.

---

## APIs Utilizadas

| API | Uso | Custo | Chave |
|-----|-----|-------|-------|
| `youtube-transcript` | Legendas automáticas do YouTube | Grátis | Não |
| `AssemblyAI` | Transcrição de podcasts/áudios | 185h grátis | `ASSEMBLYAI_API_KEY` |
| `Apify` | Scraping de blogs com JS pesado | Por compute unit | `APIFY_API_TOKEN` |
| `pdf-parse` | Leitura de PDFs locais | Grátis | Não |

---

## Uso

### Chamado pelo MMOS (automático)

```bash
node expansion-packs/etl-data-collector/run-collection.js \
  minds/gary_vaynerchuk/sources/tier1_batch.yaml \
  minds/gary_vaynerchuk/sources \
  expansion-packs/etl-data-collector/config/download-rules.yaml
```

### Chamado manualmente

```bash
# Do diretório do projeto
node expansion-packs/etl-data-collector/run-collection.js <batch.yaml> <output_dir>

# Validar estrutura de diretórios
node expansion-packs/etl-data-collector/validate-log-locations.js minds/gary_vaynerchuk
```

---

## Formato do Batch File

```yaml
# minds/gary_vaynerchuk/sources/tier1_batch.yaml
mind: gary_vaynerchuk
name: tier1

sources:
  - id: "gv_001"
    type: youtube
    video_id: "dQw4w9WgXcQ"
    title: "GaryVee - How to Build a Personal Brand"
    tier: 1

  - id: "gv_002"
    type: blog
    url: "https://garyvaynerchuk.com/patience-is-key/"
    title: "Patience Is Key"
    tier: 1

  - id: "gv_003"
    type: pdf
    path: "./sources/pdf/crush-it.pdf"
    title: "Crush It! - Gary Vaynerchuk"
    tier: 1

  - id: "gv_004"
    type: podcast
    audio_url: "https://example.com/episode.mp3"
    title: "GaryVee Podcast Episode 500"
    tier: 2
```

---

## Estrutura de Output

```
minds/{name}/
├── sources/
│   ├── sources_master.yaml          ← inventário gerado
│   ├── blogs/
│   │   └── patience-is-key.md       ← blog coletado
│   ├── youtube/
│   │   └── garyvee-personal-brand/
│   │       ├── transcript.md        ← transcrição
│   │       └── metadata.json
│   ├── pdf/
│   │   └── crush-it/
│   │       ├── text.md
│   │       ├── text.txt
│   │       └── metadata.json
│   └── audio/
│       └── garyvee-podcast-500/
│           ├── transcript.md
│           └── metadata.json
└── docs/
    └── logs/
        └── {timestamp}-collection-report.yaml
```

---

## Inventário de Coletas

Todas as coletas são registradas em:
```
expansion-packs/etl-data-collector/data/COLLECTION-INVENTORY.md
```

Inclui: consumo de horas AssemblyAI, histórico de fontes coletadas, guia de migração para plano pago.

---

## Instalação

```bash
cd expansion-packs/etl-data-collector
npm install
```

---

## Tipos de Fonte Suportados

| Tipo | Alias | Método | Fallback |
|------|-------|--------|----------|
| `youtube` | — | Legenda automática | AssemblyAI |
| `blog` | `article` | HTTP + Cheerio | Apify |
| `pdf` | `document` | pdf-parse | — |
| `audio` | `podcast` | AssemblyAI | — |

---

*Versão: 1.0.0 | Compatível com: mmos-squad >= 3.0.0*
