# Story 11.2: Glitch Text Hook (Primeiros 2s)

**Epic:** [EPIC-011 - Visual Effects Pro](../epics/EPIC-011-visual-effects-pro.md)
**Status:** Concluido
**Priority:** P0 (Critical)
**Estimate:** 1 dia
**Owner:** @dev
**Wave:** 1 - Core Visual Upgrade
**Depende de:** Story 10.3 (HookIntro já implementado)

---

## Descrição

Adicionar estilo "Glitch" como opção de hook visual nos primeiros 2 segundos do reel. Inspirado no efeito Glitch Text do reactvideoeditor.com — texto com distorção, separação RGB, barras horizontais e "tremor" digital. Muito mais impactante que o spring scale atual para prender atenção.

---

## Acceptance Criteria

- [x] Novo estilo de hook: `glitch` (ao lado do existente `spring`)
- [x] Efeito glitch no texto: offset horizontal randômico, separação RGB (red/cyan)
- [x] Barras de "scan lines" semi-transparentes sobre o texto
- [x] "Tremor" rápido (jitter) nos primeiros 40 frames, estabiliza nos últimos 20
- [x] Background com noise/static sutil
- [x] Seletor de estilo do hook no dashboard (Spring vs Glitch)
- [x] Manter compatibilidade com hook existente (spring permanece como opção)

---

## Tarefas Técnicas

### 1. Criar Componente GlitchHookIntro
- [x] Criar `remotion/components/GlitchHookIntro.tsx`
- [x] Texto principal com 3 layers (normal + red offset + cyan offset)
- [x] `useCurrentFrame()` para timing dos glitches
- [x] Frames 0-10: texto aparece com glitch forte (offset 5-15px)
- [x] Frames 10-40: glitch intermitente (a cada 3-5 frames, offset aleatório)
- [x] Frames 40-50: glitch diminui, texto estabiliza
- [x] Frames 50-60: fade-out suave
- [x] Pseudo-random via `Math.sin(frame * seed)` (determinístico para reprodutibilidade)

### 2. Efeitos Visuais
- [x] Separação RGB: layer vermelho com translateX(+N), layer ciano com translateX(-N)
- [x] Barras horizontais: `clip-path` com retângulos finos aleatórios
- [x] Background noise: padrão sutil de pixels (CSS grain effect)
- [x] Texto branco bold com text-shadow forte

### 3. Integrar com HookIntro Existente
- [x] Adicionar `hookIntroStyle` prop: 'spring' | 'glitch'
- [x] Se 'spring': comportamento atual (HookIntro)
- [x] Se 'glitch': renderizar GlitchHookIntro
- [x] Atualizar schema com hookIntroStyle
- [x] Default: 'spring' (backward compatible)

### 4. UI — Seletor de Estilo
- [x] Ao lado do toggle Hook Visual, adicionar seletor de estilo
- [x] 2 cards: "Suave (Spring)" e "Impacto (Glitch)"
- [x] Glitch com badge "Novo"

---

## Arquivos

### Criar
| Arquivo | Descrição |
|---------|-----------|
| `remotion/components/GlitchHookIntro.tsx` | Hook intro com efeito glitch |

### Modificar
| Arquivo | Mudança |
|---------|---------|
| `remotion/types.ts` | hookIntroStyle no schema |
| `remotion/compositions/CarouselReel.tsx` | Renderizar GlitchHookIntro quando hookIntroStyle='glitch' |
| `remotion/compositions/StoryReel.tsx` | Idem |
| `remotion/compositions/SquareReel.tsx` | Idem |
| `app/api/content/[id]/generate-reel/route.ts` | Aceitar hookIntroStyle |
| `app/dashboard/audits/[id]/create-content/slides/page.tsx` | Seletor UI |

---

## Definition of Done

- [x] Glitch hook funcional e impactante
- [x] Seletor Spring vs Glitch no dashboard
- [x] Backward compatible (spring continua default)
- [x] Build sem erros

---

**Criado por**: Orion (aios-master)
**Data**: 2026-02-20
**Implementado por**: @dev
**Data de conclusao**: 2026-02-20
