# Story 10.1: ElevenLabs TTS + Sound Effects

**Epic:** [EPIC-010 - Reel Quality Pro](../epics/EPIC-010-reel-quality-pro.md)
**Status:** ✅ Concluído
**Priority:** P0 (Critical)
**Estimate:** 1 dia
**Owner:** @dev
**Wave:** 1 - Core Quality
**Depende de:** EPIC-009 Story 9.4 (TTS base implementado)

---

## Descrição

Substituir o OpenAI TTS (`tts-1`) pelo ElevenLabs como provider principal de narração. A qualidade da voz em pt-BR é drasticamente superior — entonação natural, pausas orgânicas, emoção. Também integrar a Sound Effects API do ElevenLabs para gerar whoosh/pop/ding nas transições.

---

## Acceptance Criteria

- [ ] ElevenLabs provider implementado em `lib/tts.ts`
- [ ] Vozes multilíngues pt-BR disponíveis (mínimo 4 vozes)
- [ ] Sound Effects API integrada (`lib/sound-effects.ts`)
- [ ] Sound effects gerados para transições (whoosh, pop, ding)
- [ ] Fallback automático para OpenAI TTS se ElevenLabs falhar
- [ ] UI: seletor de provider (ElevenLabs / OpenAI) no dashboard
- [ ] UI: seletor de vozes ElevenLabs com nomes descritivos
- [ ] Áudio renderizado com qualidade superior comprovada
- [ ] `.env.example` atualizado com `ELEVENLABS_API_KEY`

---

## Tarefas Técnicas

### 1. Implementar ElevenLabs TTS Provider
- [ ] Adicionar ElevenLabs ao `lib/tts.ts`
- [ ] API: `POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}`
- [ ] Model: `eleven_turbo_v2_5` (rápido + multilíngue)
- [ ] Vozes recomendadas para pt-BR:
  - Rachel (feminina, profissional)
  - Adam (masculino, autoridade)
  - Antoni (masculino, casual)
  - Bella (feminina, amigável)
- [ ] Parâmetros: `stability: 0.5`, `similarity_boost: 0.75`, `style: 0.3`
- [ ] Output: mp3 128kbps
- [ ] Retry com backoff (rate limit ElevenLabs: 2-3 req/s)

### 2. Criar Sound Effects Module
- [ ] Criar `lib/sound-effects.ts`
- [ ] API: `POST https://api.elevenlabs.io/v1/sound-generation`
- [ ] Gerar 4 efeitos base:
  - `transition-whoosh` — "smooth cinematic whoosh transition"
  - `pop-highlight` — "short UI pop notification sound"
  - `ding-reveal` — "soft bell ding reveal sound"
  - `swoosh-enter` — "quick swoosh text entrance"
- [ ] Cache em Cloudinary (gerar uma vez, reusar sempre)
- [ ] Retornar URLs dos efeitos

### 3. Integrar Sound Effects no Remotion
- [ ] Modificar `CarouselReel.tsx` para aceitar `soundEffectUrls`
- [ ] Adicionar `<Audio>` com whoosh em cada transição (volume 0.6)
- [ ] Adicionar pop quando legenda destaca palavra (se captions ativo)
- [ ] Volume: efeitos em 0.5-0.7, não competir com voz

### 4. Atualizar lib/tts.ts — Multi-provider
- [ ] Interface `TTSProvider` com `generate()` method
- [ ] `openai` provider (existente, refatorar)
- [ ] `elevenlabs` provider (novo)
- [ ] Seleção por env var ou parâmetro
- [ ] Fallback automático: ElevenLabs → OpenAI

### 5. UI — Seletor de Provider e Vozes
- [ ] Adicionar seletor "Provider de Voz" no dashboard
- [ ] Se ElevenLabs selecionado, mostrar vozes ElevenLabs
- [ ] Se OpenAI selecionado, mostrar vozes OpenAI (atual)
- [ ] Indicador de qualidade (ElevenLabs: "Natural", OpenAI: "Padrão")
- [ ] Toggle "Sound Effects nas transições" (on/off)

### 6. Variáveis de Ambiente
- [ ] Adicionar `ELEVENLABS_API_KEY` ao `.env.example`
- [ ] Detectar se key existe: se não, usar OpenAI como fallback

---

## Arquivos

### Criar
| Arquivo | Descrição |
|---------|-----------|
| `lib/sound-effects.ts` | Module de sound effects via ElevenLabs |

### Modificar
| Arquivo | Mudança |
|---------|---------|
| `lib/tts.ts` | Multi-provider (ElevenLabs + OpenAI) |
| `remotion/compositions/CarouselReel.tsx` | Sound effects nas transições |
| `remotion/compositions/StoryReel.tsx` | Sound effects |
| `remotion/compositions/SquareReel.tsx` | Sound effects |
| `remotion/types.ts` | Adicionar `soundEffectUrls` ao schema |
| `app/api/content/[id]/generate-reel/route.ts` | Provider selection + SFX |
| `app/dashboard/audits/[id]/create-content/slides/page.tsx` | Seletor provider/vozes |
| `.env.example` | `ELEVENLABS_API_KEY` |

---

## Definition of Done

- [ ] ElevenLabs TTS funcional com narração natural em pt-BR
- [ ] Sound effects nas transições do reel
- [ ] Fallback automático para OpenAI se ElevenLabs indisponível
- [ ] UI com seletor de provider e vozes
- [ ] Build sem erros
- [ ] Code review aprovado

---

**Criado por**: 👑 Orion (aios-master)
**Data**: 2026-02-20
