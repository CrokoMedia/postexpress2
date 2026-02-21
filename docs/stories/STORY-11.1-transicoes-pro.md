# Story 11.1: Transições Pro (Pixel, Liquid, Glitch)

**Epic:** [EPIC-011 - Visual Effects Pro](../epics/EPIC-011-visual-effects-pro.md)
**Status:** Done
**Priority:** P0 (Critical)
**Estimate:** 2 dias
**Owner:** @dev
**Wave:** 1 - Core Visual Upgrade
**Depende de:** EPIC-009 (TransitionSeries já implementado)

---

## Descrição

Substituir as transições básicas (fade/slide alternando) por transições cinematográficas inspiradas nos efeitos do reactvideoeditor.com. Criar componentes Remotion custom usando `@remotion/transitions` presentations API. O usuário escolhe o estilo de transição no dashboard.

---

## Acceptance Criteria

- [x] 6 transições disponíveis: fade (existente), slide (existente), pixel, liquid-wave, glitch, zoom-blur
- [x] Cada transição é um `TransitionPresentation` compatível com `@remotion/transitions`
- [x] Pixel: dissolução em blocos pixelados (grid 8x8 que aparece progressivamente)
- [x] Liquid Wave: distorção ondulada horizontal que revela o próximo slide
- [x] Glitch: cortes rápidos com offset RGB + barras horizontais
- [x] Zoom Blur: zoom-in com blur radial que faz fade para o próximo
- [x] Seletor de transição no dashboard (grid de 6 opções com preview do nome)
- [x] Opção "Aleatório" que mistura transições entre slides
- [x] Fallback: se transição custom falhar, usa fade

---

## Tarefas Técnicas

### 1. Criar Componentes de Transição
- [x] Criar `remotion/transitions/PixelTransition.tsx`
  - Grid de blocos (tamanho configurável)
  - Cada bloco aparece com delay baseado em posição (espiral ou random)
  - Usar `spring()` para timing de cada bloco
- [x] Criar `remotion/transitions/LiquidWaveTransition.tsx`
  - Distorção sinusoidal horizontal
  - Wave progressiva de cima para baixo
  - CSS `clip-path` ou SVG filter para efeito wave
- [x] Criar `remotion/transitions/GlitchTransition.tsx`
  - 3-5 "cortes" rápidos com offset horizontal
  - Separação RGB (red/green/blue com offset diferente)
  - Barras horizontais aleatórias
  - Duração curta (10-15 frames)
- [x] Criar `remotion/transitions/ZoomBlurTransition.tsx`
  - Scale up (1.0→1.3) + blur (0→8px) no slide saindo
  - Scale down (0.7→1.0) + blur (8→0) no slide entrando

### 2. Registrar como TransitionPresentation
- [x] Cada transição exporta função compatível com `<TransitionSeries.Transition presentation={...}>`
- [x] Seguir API do `@remotion/transitions`: `{ Presentation, presentationDirection }`

### 3. Atualizar Composições
- [x] Criar `remotion/transitions/index.ts` — registry de todas as transições
- [x] `getTransitionForStyle(style, index)` — retorna presentation baseado no estilo
- [x] Se "random": ciclar entre todas as transições
- [x] Atualizar CarouselReel, StoryReel, SquareReel para usar transição dinâmica

### 4. Schema & API
- [x] Adicionar `transitionStyle` ao schema (enum: fade, slide, pixel, liquid, glitch, zoom-blur, random)
- [x] API `generate-reel` aceita `transitionStyle`
- [x] Default: 'random' (para variedade visual)

### 5. UI — Seletor de Transição
- [x] Grid de 6+1 cards (6 estilos + random)
- [x] Cada card com nome e ícone representativo
- [x] "Aleatório" como default selecionado

---

## Arquivos

### Criar
| Arquivo | Descrição |
|---------|-----------|
| `remotion/transitions/PixelTransition.tsx` | Transição pixel dissolve |
| `remotion/transitions/LiquidWaveTransition.tsx` | Transição liquid wave |
| `remotion/transitions/GlitchTransition.tsx` | Transição glitch |
| `remotion/transitions/ZoomBlurTransition.tsx` | Transição zoom blur |
| `remotion/transitions/index.ts` | Registry de transições |

### Modificar
| Arquivo | Mudança |
|---------|---------|
| `remotion/types.ts` | transitionStyle no schema |
| `remotion/compositions/CarouselReel.tsx` | Transição dinâmica |
| `remotion/compositions/StoryReel.tsx` | Transição dinâmica |
| `remotion/compositions/SquareReel.tsx` | Transição dinâmica |
| `app/api/content/[id]/generate-reel/route.ts` | Aceitar transitionStyle |
| `app/dashboard/audits/[id]/create-content/slides/page.tsx` | Seletor UI |

---

## Definition of Done

- [x] 6 transições funcionais no Remotion Player
- [x] Seletor no dashboard
- [x] Modo aleatório funcional
- [x] Build sem erros

---

**Criado por**: Orion (aios-master)
**Data**: 2026-02-20
**Implementado por**: @dev
**Data de conclusão**: 2026-02-20
