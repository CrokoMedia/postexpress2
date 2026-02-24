# Story 9.5: Legendas Animadas (Estilo CapCut/Hormozi)

**Epic:** [EPIC-009 - Remotion Expansion](../epics/EPIC-009-remotion-expansion.md)
**Status:** ✅ Concluído
**Priority:** P2 (Medium)
**Estimate:** 3 dias
**Owner:** @dev
**Sprint:** Sprint 3 - Semana 3-4
**Depende de:** Story 9.4 (Voiceover — precisa do áudio para sincronizar)

---

## Descrição

Adicionar legendas animadas word-by-word (estilo viral CapCut/Hormozi) aos reels. A palavra atual é destacada em tempo real, sincronizada com o voiceover. Usando `@remotion/captions` para extração de timestamps por palavra.

---

## Acceptance Criteria

- [ ] Pacote `@remotion/captions` instalado e configurado
- [ ] Componente `AnimatedCaptions.tsx` criado
- [ ] Legendas exibem palavra por palavra sincronizadas com áudio
- [ ] Estilo "highlight": palavra atual com fundo colorido (amarelo/branco)
- [ ] Legendas posicionadas na parte inferior do vídeo (safe area)
- [ ] Toggle "Adicionar legendas" no dashboard (opt-in, requer voiceover)
- [ ] Suporte para todos os formatos (feed, story, square)
- [ ] Renderização correta em MP4

---

## Tarefas Técnicas

### 1. Instalar @remotion/captions
- [ ] `npm install @remotion/captions --legacy-peer-deps`
- [ ] Verificar compatibilidade com versão do Remotion

### 2. Gerar Timestamps de Palavras
- [ ] Integrar com OpenAI Whisper (ou transcription da API TTS)
- [ ] Alternativa: usar `@remotion/install-whisper` para local
- [ ] Output: array de `{ word, startMs, endMs }` por slide
- [ ] Armazenar timestamps junto com dados do áudio

### 3. Criar Componente AnimatedCaptions
- [ ] Criar `remotion/components/AnimatedCaptions.tsx`
- [ ] Props:
  ```typescript
  interface AnimatedCaptionsProps {
    captions: CaptionWord[]
    style: 'highlight' | 'karaoke' | 'bounce'
    position: 'bottom' | 'center'
    fontSize?: number
    highlightColor?: string
  }
  ```
- [ ] Estilos de animação:
  - **highlight**: palavra atual com background colorido
  - **karaoke**: texto muda de cor progressivamente
  - **bounce**: palavra atual com scale spring
- [ ] Safe area: margem inferior para não cobrir controles do player
- [ ] Adaptação por formato:
  - Feed: fonte 28px, 2 linhas max
  - Story: fonte 32px, 3 linhas max
  - Square: fonte 24px, 2 linhas max

### 4. Integrar nas Composições
- [ ] Modificar `CarouselReel.tsx` para incluir `<AnimatedCaptions>`
- [ ] Somente quando `captions: true` nos props
- [ ] Legendas sincronizadas com `<Audio>` da Story 9.4
- [ ] Z-index acima do conteúdo, abaixo de overlays

### 5. Atualizar API
- [ ] Modificar rota generate-reel para aceitar `captions: boolean`
- [ ] Se `captions: true` (e `voiceover: true`):
  1. Gerar áudio (Story 9.4)
  2. Extrair timestamps por palavra (Whisper ou similar)
  3. Passar timestamps para composição Remotion
  4. Render com legendas

### 6. UI — Toggle de Legendas
- [ ] Adicionar switch "Legendas animadas" no dashboard
- [ ] Desabilitado se voiceover está desligado (dependency)
- [ ] Seletor de estilo (highlight, karaoke, bounce)
- [ ] Preview de estilo no Player (Story 9.3)

---

## Arquivos

### Criar
| Arquivo | Descrição |
|---------|-----------|
| `remotion/components/AnimatedCaptions.tsx` | Legendas word-by-word |

### Modificar
| Arquivo | Mudança |
|---------|---------|
| `remotion/compositions/CarouselReel.tsx` | Integrar legendas |
| `remotion/types.ts` | Adicionar `captions` ao schema |
| `app/api/content/[id]/generate-reel/route.ts` | Fluxo de legendas |
| `app/dashboard/audits/[id]/create-content/slides/page.tsx` | Toggle legendas |
| `package.json` | Adicionar `@remotion/captions` |

---

## Estilos de Legenda (Referência Visual)

### Highlight (Recomendado)
```
┌────────────────────────────┐
│                            │
│     [Conteúdo do slide]    │
│                            │
│  como criar ████████ que   │
│        convertem           │
└────────────────────────────┘
(palavra "conteúdo" com fundo amarelo)
```

### Karaoke
```
Palavra por palavra muda de branco para amarelo progressivamente
```

### Bounce
```
Palavra atual sobe com spring animation e volta
```

---

## Definition of Done

- [ ] Legendas word-by-word sincronizadas com áudio
- [ ] Pelo menos 1 estilo de animação funcional (highlight)
- [ ] Funciona em todos os 3 formatos
- [ ] Toggle no dashboard com dependency no voiceover
- [ ] MP4 renderizado com legendas corretas
- [ ] Code review aprovado

---

**Criado por**: 👑 Orion (aios-master)
**Data**: 2026-02-20
