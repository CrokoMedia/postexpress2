# Story 9.4: Voiceover Automático via TTS

**Epic:** [EPIC-009 - Remotion Expansion](../epics/EPIC-009-remotion-expansion.md)
**Status:** ✅ Concluído
**Priority:** P2 (Medium)
**Estimate:** 3 dias
**Owner:** @dev
**Sprint:** Sprint 3 - Semana 3-4
**Depende de:** Story 9.1 (renderStill), Story 9.2 (multi-formato)

---

## Descrição

Adicionar narração automática aos reels usando TTS (Text-to-Speech). O texto dos slides (já gerado pelo Claude) é convertido em áudio, e o Remotion sincroniza a duração de cada slide com o tempo do áudio. Reels com voz performam 3x melhor que mudos no Instagram.

---

## Acceptance Criteria

- [ ] Módulo `lib/tts.ts` criado com wrapper para API de TTS
- [ ] Suporte a pelo menos 1 provider: OpenAI TTS ou ElevenLabs
- [ ] Áudio gerado em pt-BR com voz natural
- [ ] Upload do áudio para Cloudinary (ou storage temporário)
- [ ] Duração de cada slide se adapta ao tempo do áudio (não fixo 3s)
- [ ] Remotion sincroniza `<Audio>` com transições de slides
- [ ] Toggle "Adicionar narração" no dashboard (opt-in)
- [ ] Custo por reel: < $0.05 (OpenAI TTS)
- [ ] Reel com áudio renderiza corretamente em MP4

---

## Tarefas Técnicas

### 1. Criar Módulo TTS (`lib/tts.ts`)
- [ ] Interface unificada para providers:
  ```typescript
  interface TTSProvider {
    generateSpeech(text: string, options: TTSOptions): Promise<Buffer>
  }

  interface TTSOptions {
    voice: string        // 'alloy', 'nova', etc.
    language: 'pt-BR'
    speed?: number       // 0.8 - 1.2
    format?: 'mp3' | 'wav'
  }
  ```
- [ ] Implementar OpenAI TTS provider (principal)
- [ ] Implementar ElevenLabs provider (premium, opcional)
- [ ] Error handling + retry com backoff
- [ ] Logs de custo por chamada

### 2. Geração de Áudio por Slide
- [ ] Para cada slide, gerar áudio do texto (título + corpo)
- [ ] Concatenar ou manter separado (1 arquivo por slide)
- [ ] Upload para Cloudinary com tag `audio` e `audit_id`
- [ ] Retornar URLs e durações

### 3. Adaptar Composição Remotion
- [ ] Modificar `CarouselReel.tsx` para aceitar `audioUrls[]`
- [ ] Usar `getAudioDurationInSeconds()` para calcular duração de cada slide:
  ```tsx
  const audioDuration = await getAudioDurationInSeconds(audioUrl)
  const durationInFrames = Math.ceil(audioDuration * fps) + PADDING_FRAMES
  ```
- [ ] Adicionar `<Audio>` component do Remotion sincronizado por slide
- [ ] Transições se adaptam à duração variável dos slides
- [ ] Fallback: se sem áudio, manter duração fixa (comportamento atual)

### 4. Atualizar API generate-reel
- [ ] Modificar `app/api/content/[id]/generate-reel/route.ts`
- [ ] Aceitar `voiceover: boolean` no body
- [ ] Se `voiceover: true`:
  1. Gerar áudio para cada slide via TTS
  2. Upload áudios
  3. Passar URLs para composição Remotion
  4. Render com áudio embutido
- [ ] Se `voiceover: false`: comportamento atual (mudo)

### 5. UI — Toggle de Narração
- [ ] Adicionar switch "Adicionar narração" no dashboard
- [ ] Seletor de voz (3-4 opções pré-definidas)
- [ ] Indicador de custo estimado
- [ ] Preview de voz (snippet de 5s) — nice to have

### 6. Variáveis de Ambiente
- [ ] Adicionar `OPENAI_TTS_API_KEY` (ou reutilizar `OPENAI_API_KEY`)
- [ ] Adicionar `ELEVENLABS_API_KEY` (opcional)
- [ ] Atualizar `.env.example`

---

## Arquivos

### Criar
| Arquivo | Descrição |
|---------|-----------|
| `lib/tts.ts` | Wrapper unificado para TTS providers |

### Modificar
| Arquivo | Mudança |
|---------|---------|
| `remotion/compositions/CarouselReel.tsx` | Adicionar `<Audio>`, duração dinâmica |
| `remotion/types.ts` | Adicionar `audioUrls`, `voiceover` ao schema |
| `app/api/content/[id]/generate-reel/route.ts` | Fluxo de geração de áudio |
| `app/dashboard/audits/[id]/create-content/slides/page.tsx` | Toggle narração |
| `.env.example` | Novas variáveis TTS |

---

## Custos

| Provider | Custo/1000 chars | Custo/reel (7 slides, ~1200 chars) | Qualidade |
|----------|-----------------|-----------------------------------|-----------|
| OpenAI TTS | $0.015 | ~$0.02 | Boa |
| ElevenLabs | $0.03/reel | ~$0.03 | Excelente |

**Total estimado por reel com voz:** ~$0.40 (fal.ai + TTS + Cloudinary)

---

## Definition of Done

- [ ] Áudio gerado automaticamente a partir do texto dos slides
- [ ] Duração dos slides sincronizada com o áudio
- [ ] MP4 renderizado com áudio embutido
- [ ] Toggle funcional no dashboard
- [ ] Custo por reel documentado
- [ ] Code review aprovado

---

**Criado por**: 👑 Orion (aios-master)
**Data**: 2026-02-20
