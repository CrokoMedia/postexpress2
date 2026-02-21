# EPIC 010: Reel Quality Pro — De Carrossel Animado a Reel Viral

**Status**: ✅ Concluído (8/8 stories)
**Prioridade**: 🔴 Alta
**Duração Estimada**: 3 semanas (3 waves)
**Agente Responsável**: @dev + @architect
**Depende de**: EPIC-009 (Remotion Expansion — concluída)

---

## Objetivo

Transformar os reels de "carrosséis animados com voz robótica" em **conteúdo com qualidade de produção profissional**: narração natural (ElevenLabs), sound effects, background music, hooks visuais de 2 segundos, B-Roll com vídeo, efeitos de texto dinâmicos e geração em batch.

---

## Contexto

**Estado Atual (pós EPIC-009):**
- Reels com slides animados (spring transitions)
- 5 templates visuais, 3 formatos (feed/story/square)
- Voiceover via OpenAI TTS (`tts-1`) — robótico, especialmente em pt-BR
- Legendas animadas (highlight/karaoke/bounce)
- Imagens estáticas geradas por fal.ai
- Sem background music
- Sem hook visual nos primeiros 2s
- Conteúdo gerado com prompt genérico (otimizado para leitura, não para vídeo)

**Problemas Identificados:**
1. Narração soa como GPS/robô — OpenAI `tts-1` é fraco em pt-BR
2. Reels sem música parecem inacabados
3. Prompt de conteúdo gera texto para ler, não para ouvir
4. Sem hook visual → baixa retenção nos primeiros 2s
5. Imagens estáticas → menos dinâmico que concorrentes com vídeo

---

## Métricas de Sucesso

| Métrica | Baseline (EPIC-009) | Target (EPIC-010) |
|---------|---------------------|-------------------|
| Qualidade de narração | Robótica (OpenAI tts-1) | Natural (ElevenLabs) |
| Background music | Nenhuma | 10+ tracks selecionáveis |
| Hook visual | Nenhum | Intro 2s com texto impactante |
| Texto por slide | 30-50 palavras | 10-20 palavras (otimizado p/ vídeo) |
| Sound effects | Nenhum | Whoosh, pop, ding nas transições |
| B-Roll vídeo | 0% slides | Opcional (Pexels stock video) |
| Geração batch | 1 reel/vez | 7+ reels paralelos |
| Voice cloning | Não disponível | Opcional (voz do creator) |

---

## Stories

### Wave 1 — Core Quality (P0, paralelo)

| Story | Título | Prioridade | Status |
|-------|--------|------------|--------|
| [10.1](../stories/STORY-10.1-elevenlabs-tts.md) | ElevenLabs TTS + Sound Effects | P0 | ✅ Concluído |
| [10.2](../stories/STORY-10.2-prompt-reel-otimizado.md) | Prompt Otimizado para Reels | P0 | ✅ Concluído |

### Wave 2 — Polish & Engagement (P1, paralelo)

| Story | Título | Prioridade | Status |
|-------|--------|------------|--------|
| [10.3](../stories/STORY-10.3-hook-visual.md) | Hook Visual (Primeiros 2s) | P1 | ✅ Concluído |
| [10.4](../stories/STORY-10.4-background-music.md) | Background Music | P1 | ✅ Concluído |
| [10.5](../stories/STORY-10.5-text-effects.md) | Efeitos de Texto Dinâmicos | P1 | ✅ Concluído |

### Wave 3 — Differentiators (P2-P3, paralelo)

| Story | Título | Prioridade | Status |
|-------|--------|------------|--------|
| [10.6](../stories/STORY-10.6-broll-video.md) | B-Roll com Vídeo | P2 | ✅ Concluído |
| [10.7](../stories/STORY-10.7-batch-generation.md) | Batch Generation | P2 | ✅ Concluído |
| [10.8](../stories/STORY-10.8-voice-cloning.md) | Voice Cloning | P3 | ✅ Concluído |

---

## Custos & APIs Externas

| API | Uso | Custo/mês (100 reels) |
|-----|-----|-----------------------|
| ElevenLabs TTS | Narração natural | ~$5-11 |
| ElevenLabs SFX | Sound effects | Incluso no plano |
| Pexels API | Stock video B-Roll | Grátis |
| fal.ai (Flux) | Imagens (já usado) | ~$10 |
| OpenAI TTS | Fallback (já implementado) | ~$2 |

### Variáveis de Ambiente Novas
```env
ELEVENLABS_API_KEY=
PEXELS_API_KEY=
```

---

## Gate de Qualidade

- [x] Narração natural em pt-BR (ElevenLabs)
- [x] Sound effects nas transições
- [x] Background music com controle de volume
- [x] Hook visual de 2s nos reels
- [x] Texto otimizado para formato vídeo
- [x] B-Roll com stock video funcional
- [x] Batch generation de múltiplos reels
- [x] Zero regressões nas features EPIC-009
- [x] Build sem erros

---

**Criado por**: 👑 Orion (aios-master)
**Data**: 2026-02-20
**Fonte**: Análise de gaps pós EPIC-009
