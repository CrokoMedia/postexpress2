# Story 11.5: Particle & Highlight Effects

**Epic:** [EPIC-011 - Visual Effects Pro](../epics/EPIC-011-visual-effects-pro.md)
**Status:** 🔵 Planejado
**Priority:** P1 (High)
**Estimate:** 1.5 dias
**Owner:** @dev
**Wave:** 2 - Premium Polish
**Depende de:** EPIC-009 (SlideFrame)

---

## Descrição

Adicionar efeitos de destaque visual para keywords, CTAs e momentos-chave nos slides. Inspirado nos efeitos Particle Explosion e Zoom Pulse do reactvideoeditor.com. Partículas explodem ao redor de palavras importantes, zoom pulse destaca números/métricas.

---

## Acceptance Criteria

- [ ] Componente `ParticleBurst` — explosão de partículas ao redor de um elemento
- [ ] Componente `ZoomPulse` — zoom-in rápido + pulse em um elemento
- [ ] Componente `GlowHighlight` — brilho pulsante ao redor de texto
- [ ] Aplicados automaticamente em: primeiro slide (título), slides com CTA, números/métricas
- [ ] Partículas: 10-20 dots que se espalham radialmente e desaparecem
- [ ] Zoom Pulse: scale 1.0→1.15→1.0 com spring
- [ ] Glow: box-shadow animado (expand/contract)
- [ ] Não poluir visualmente — efeitos sutis, curta duração (15-20 frames)

---

## Tarefas Técnicas

### 1. Criar Componentes de Efeito
- [ ] Criar `remotion/effects/ParticleBurst.tsx`
  - N partículas (10-20) posicionadas no centro
  - Cada partícula: direção radial aleatória, velocidade variada
  - Fade out ao final
  - Cores do template
  - Trigger: a partir de um frame específico
- [ ] Criar `remotion/effects/ZoomPulse.tsx`
  - Wrapper que aplica scale com spring
  - 1.0→1.15→1.0 em ~20 frames
  - Opcional: subtle glow durante o pulse
- [ ] Criar `remotion/effects/GlowHighlight.tsx`
  - box-shadow animado (0→spread→0)
  - Cor do template com opacity
  - 2-3 pulses durante a duração do slide

### 2. Integrar no SlideFrame
- [ ] ParticleBurst: no título do primeiro slide (acompanha o texto)
- [ ] ZoomPulse: em slides que contêm CTA ou "número" no título
- [ ] GlowHighlight: em keywords detectadas no corpo
- [ ] Detecção simples: regex para números, palavras-chave de CTA

### 3. Schema & API
- [ ] Adicionar `particleEffects: boolean` ao schema (default: true quando animated)
- [ ] API aceita `particleEffects`

### 4. UI
- [ ] Toggle "Efeitos de Destaque" no dashboard
- [ ] Info: "Adiciona partículas e brilho em momentos-chave"

---

## Arquivos

### Criar
| Arquivo | Descrição |
|---------|-----------|
| `remotion/effects/ParticleBurst.tsx` | Explosão de partículas |
| `remotion/effects/ZoomPulse.tsx` | Zoom pulse |
| `remotion/effects/GlowHighlight.tsx` | Brilho pulsante |
| `remotion/effects/index.ts` | Registry de efeitos |

### Modificar
| Arquivo | Mudança |
|---------|---------|
| `remotion/types.ts` | particleEffects no schema |
| `remotion/components/SlideFrame.tsx` | Aplicar efeitos |
| `app/api/content/[id]/generate-reel/route.ts` | Aceitar particleEffects |
| `app/dashboard/audits/[id]/create-content/slides/page.tsx` | Toggle UI |

---

## Definition of Done

- [ ] 3 efeitos de destaque funcionais
- [ ] Aplicação automática em momentos-chave
- [ ] Toggle no dashboard
- [ ] Build sem erros

---

**Criado por**: 👑 Orion (aios-master)
**Data**: 2026-02-20
