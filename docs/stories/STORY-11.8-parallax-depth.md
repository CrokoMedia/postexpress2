# Story 11.8: Parallax & Depth Effects

**Epic:** [EPIC-011 - Visual Effects Pro](../epics/EPIC-011-visual-effects-pro.md)
**Status:** 🔵 Planejado
**Priority:** P2 (Medium)
**Estimate:** 1 dia
**Owner:** @dev
**Wave:** 3 - Differentiators
**Depende de:** EPIC-009 (SlideFrame)

---

## Descrição

Adicionar efeito de profundidade/parallax nos slides inspirado no efeito Parallax Pan do reactvideoeditor.com. Diferentes camadas do slide (background, imagem, texto) se movem a velocidades diferentes, criando sensação de profundidade 3D. Faz o reel parecer produção de estúdio.

---

## Acceptance Criteria

- [ ] Efeito parallax com 3 camadas de profundidade
- [ ] Camada 0 (fundo): move lento (0.3x velocidade)
- [ ] Camada 1 (imagem/vídeo): move médio (0.6x)
- [ ] Camada 2 (texto): move rápido (1.0x) ou fica estático
- [ ] Direção do pan: horizontal sutil (esquerda→direita ao longo do slide)
- [ ] Amplitude máxima: 30px (sutil, não nauseante)
- [ ] Toggle on/off no dashboard
- [ ] Funciona com todos os templates
- [ ] Compatível com B-Roll vídeo e backgrounds animados

---

## Tarefas Técnicas

### 1. Criar Componente Parallax
- [ ] Criar `remotion/effects/ParallaxContainer.tsx`
  - Wrapper que aplica transform em children baseado na layer
  - `translateX(interpolate(frame, [0, totalFrames], [startX, endX]) * layerSpeed)`
  - `layerSpeed`: 0.3 (fundo), 0.6 (meio), 1.0 (frente)
  - Overflow hidden para não vazar conteúdo

### 2. Integrar no SlideFrame
- [ ] Envolver background/imagem em `<ParallaxContainer layer={0}>`
- [ ] Envolver content area em `<ParallaxContainer layer={1}>`
- [ ] Texto pode ficar estático (mais legível) ou com layer 2
- [ ] Ativado via prop `motionEffects.parallax`

### 3. Depth Blur (Bonus)
- [ ] Background com blur sutil (2-3px) para enfatizar profundidade
- [ ] Apenas quando parallax ativo
- [ ] Não aplicar no texto (manter sharp)

### 4. Schema & UI
- [ ] Expandir `motionEffects` com `parallax: boolean`
- [ ] Toggle "Parallax 3D" no dashboard
- [ ] Info: "Adiciona profundidade com camadas em velocidades diferentes"

---

## Arquivos

### Criar
| Arquivo | Descrição |
|---------|-----------|
| `remotion/effects/ParallaxContainer.tsx` | Container parallax |

### Modificar
| Arquivo | Mudança |
|---------|---------|
| `remotion/types.ts` | motionEffects.parallax |
| `remotion/components/SlideFrame.tsx` | Aplicar parallax layers |
| `app/api/content/[id]/generate-reel/route.ts` | Aceitar parallax |
| `app/dashboard/audits/[id]/create-content/slides/page.tsx` | Toggle UI |

---

## Definition of Done

- [ ] Parallax funcional com 3 camadas
- [ ] Toggle no dashboard
- [ ] Compatível com todos os templates e backgrounds
- [ ] Build sem erros

---

**Criado por**: 👑 Orion (aios-master)
**Data**: 2026-02-20
