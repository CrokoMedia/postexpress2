# Story 11.3: Animated Backgrounds (Loop)

**Epic:** [EPIC-011 - Visual Effects Pro](../epics/EPIC-011-visual-effects-pro.md)
**Status:** Concluido
**Priority:** P0 (Critical)
**Estimate:** 2 dias
**Owner:** @dev
**Wave:** 1 - Core Visual Upgrade
**Depende de:** EPIC-009 (SlideFrame ja implementado)

---

## Descricao

Criar backgrounds animados em loop para slides que nao tem imagem (fal.ai) nem B-Roll video. Inspirado no Background Template do remotiontemplates.dev. Patterns geometricos, gradientes em movimento e particulas flutuantes que dao vida ao fundo sem depender de APIs externas.

---

## Acceptance Criteria

- [x] 4 backgrounds animados: gradient-flow, geometric-grid, particles-float, wave-mesh
- [x] Gradient Flow: gradiente que muda de cor suavemente em loop
- [x] Geometric Grid: grid de formas (circulos) com rotacao sutil
- [x] Particles Float: particulas pequenas flutuando para cima com parallax
- [x] Wave Mesh: malha de ondas senoidais que se movem
- [x] Backgrounds se adaptam ao tema do template (cores do template)
- [x] Loop seamless (sem "corte" perceptivel no loop)
- [x] Seletor de background no dashboard (+ opcao "Nenhum")
- [x] Nao conflitar com B-Roll video (se B-Roll ativo, background desabilitado)
- [x] Performance: renderizar a 30fps sem lag

---

## Tarefas Tecnicas

### 1. Criar Componentes de Background
- [x] Criar `remotion/backgrounds/GradientFlow.tsx`
  - 3 cores do template interpoladas via `interpolate()`
  - `backgroundPosition` animado em loop (sin/cos)
  - Linear gradient a 135deg, backgroundSize 200%x200%
- [x] Criar `remotion/backgrounds/GeometricGrid.tsx`
  - Grid 6x6 de SVG circles
  - Rotacao sutil do grid (`rotate(frame * 0.15deg)`)
  - Opacidade pulsante em cada shape via sin()
  - Cores do template (accent + background)
- [x] Criar `remotion/backgrounds/ParticlesFloat.tsx`
  - 25 particulas (divs pequenos)
  - Posicao Y: sobe progressivamente (`translateY(-frame * speed)`)
  - Posicao X: oscilacao sinusoidal sutil
  - Tamanhos (2-6px) e velocidades variados
  - Reset suave quando sai do frame (wrap vertical)
  - Particulas geradas deterministicamente (sem Math.random())
- [x] Criar `remotion/backgrounds/WaveMesh.tsx`
  - 4 ondas senoidais sobrepostas
  - SVG `<path>` com `d` recalculado a cada frame
  - Frequencia e amplitude diferentes por onda
  - Cores semi-transparentes do template

### 2. Registry de Backgrounds
- [x] Criar `remotion/backgrounds/index.ts`
- [x] `getAnimatedBackground(style, template)` -- retorna React element
- [x] Adaptar cores automaticamente do template ativo
- [x] `resolveAutoStyle()` mapeia template -> estilo recomendado

### 3. Integrar no SlideFrame
- [x] Renderizar background animado como layer z-index 0 (atras de tudo)
- [x] So quando: sem backgroundVideoUrl E (sem imagem editorial ou explicitamente habilitado)
- [x] Ou quando explicitamente habilitado (override)
- [x] Overlay gradient por cima (para legibilidade do texto)

### 4. Schema & API
- [x] Adicionar `AnimatedBackgroundStyleSchema` ao types.ts (enum: none, gradient-flow, geometric, particles, wave-mesh, auto)
- [x] 'auto': escolhe baseado no template via AUTO_STYLE_MAP
- [x] API route aceita `animatedBackground` e passa para inputProps
- [x] Prop propagada em CarouselReel, StoryReel, SquareReel -> SlideFrame

### 5. UI -- Seletor
- [x] Grid de 6 cards (auto, none, gradient, geometric, particles, wave)
- [x] Preview com nome e descricao curta
- [x] Desabilitado quando B-Roll ativo (com mensagem explicando)
- [x] Card com opacity-60 quando B-Roll esta ativo
- [x] Integrado no reelPayload e batchPayload

---

## Arquivos

### Criados
| Arquivo | Descricao |
|---------|-----------|
| `remotion/backgrounds/GradientFlow.tsx` | Gradiente animado com 3 cores |
| `remotion/backgrounds/GeometricGrid.tsx` | Grid 6x6 de circulos com rotacao e pulso |
| `remotion/backgrounds/ParticlesFloat.tsx` | 25 particulas flutuantes deterministicas |
| `remotion/backgrounds/WaveMesh.tsx` | 4 ondas senoidais SVG sobrepostas |
| `remotion/backgrounds/index.ts` | Registry com getAnimatedBackground() e resolveAutoStyle() |

### Modificados
| Arquivo | Mudanca |
|---------|---------|
| `remotion/types.ts` | AnimatedBackgroundStyleSchema + type + campo no CarouselReelSchema |
| `remotion/components/SlideFrame.tsx` | Import backgrounds, prop animatedBackground, render layer z-0 + overlay |
| `remotion/compositions/CarouselReel.tsx` | Desestruturar e propagar animatedBackground para SlideFrame |
| `remotion/compositions/StoryReel.tsx` | Desestruturar e propagar animatedBackground para SlideFrame |
| `remotion/compositions/SquareReel.tsx` | Desestruturar e propagar animatedBackground para SlideFrame |
| `app/api/content/[id]/generate-reel/route.ts` | Aceitar animatedBackground no body e adicionar a inputProps |
| `app/dashboard/audits/[id]/create-content/slides/page.tsx` | Estado selectedAnimatedBg, card seletor UI, payload integration |

---

## Definition of Done

- [x] 4 backgrounds animados funcionais em loop
- [x] Adaptacao automatica as cores do template
- [x] Seletor no dashboard
- [x] Performance OK a 30fps (animacoes frame-based deterministicas)
- [x] Build sem erros (tsc --noEmit + next lint --quiet = zero errors)

---

**Criado por**: Orion (aios-master)
**Data**: 2026-02-20
**Implementado por**: @dev
**Data implementacao**: 2026-02-20
