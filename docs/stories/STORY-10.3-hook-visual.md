# Story 10.3: Hook Visual (Primeiros 2 Segundos)

**Epic:** [EPIC-010 - Reel Quality Pro](../epics/EPIC-010-reel-quality-pro.md)
**Status:** ✅ Concluído
**Priority:** P1 (High)
**Estimate:** 1 dia
**Owner:** @dev
**Wave:** 2 - Polish & Engagement
**Depende de:** Story 10.2 (hook text no conteúdo)

---

## Descrição

O Instagram decide se mostra o reel baseado nos primeiros 2 segundos. Criar um componente `HookIntro` que adiciona uma intro animada antes do primeiro slide: texto grande impactante com animação dramática (zoom, scale, glow), opcionalmente com logo/marca do creator.

---

## Acceptance Criteria

- [ ] Componente `HookIntro.tsx` criado no Remotion
- [ ] Intro de 2s (60 frames @30fps) antes do primeiro slide
- [ ] Texto do hook ocupa 80% da tela (fonte grande, impactante)
- [ ] Animação de entrada: zoom-in + fade ou scale bounce
- [ ] Background: gradiente dark ou imagem blurred do primeiro slide
- [ ] Opcional: logo/marca do creator (se disponível)
- [ ] Toggle "Adicionar Hook" no dashboard (on por default)
- [ ] `durationInFrames` total atualizado (+60 frames)
- [ ] Suporta todos os formatos (feed/story/square)

---

## Tarefas Técnicas

### 1. Criar Componente HookIntro
- [ ] Criar `remotion/components/HookIntro.tsx`
- [ ] Props: `hookText`, `backgroundImageUrl?`, `format`
- [ ] Layout: texto centralizado, fonte 64-80px, bold
- [ ] Animações (2s = 60 frames):
  - Frame 0-10: fade in do background
  - Frame 5-25: texto aparece com scale spring (0.7 → 1.0)
  - Frame 25-40: texto estável
  - Frame 40-55: zoom-in sutil (1.0 → 1.05) para criar momentum
  - Frame 55-60: fade out para transição ao slide 1

### 2. Integrar nas Composições
- [ ] Modificar CarouselReel/StoryReel/SquareReel
- [ ] Se `hookEnabled`, adicionar HookIntro como primeiro Sequence
- [ ] Duração extra: 60 frames (2s)
- [ ] Transição do hook para slide 1: fade suave

### 3. Atualizar Schema e API
- [ ] Adicionar `hookEnabled`, `hookText` ao schema Zod
- [ ] API generate-reel: extrair hook do primeiro slide se não fornecido
- [ ] Hook text = título do slide 1 (ou customizável)

### 4. UI — Toggle Hook
- [ ] Adicionar toggle "Hook Visual (2s)" no dashboard
- [ ] Campo de texto editável para hook (pré-preenchido com título do slide 1)
- [ ] Preview no Player

---

## Arquivos

### Criar
| Arquivo | Descrição |
|---------|-----------|
| `remotion/components/HookIntro.tsx` | Intro animada de 2s |

### Modificar
| Arquivo | Mudança |
|---------|---------|
| `remotion/compositions/CarouselReel.tsx` | HookIntro antes dos slides |
| `remotion/compositions/StoryReel.tsx` | HookIntro |
| `remotion/compositions/SquareReel.tsx` | HookIntro |
| `remotion/types.ts` | hookEnabled, hookText |
| `app/api/content/[id]/generate-reel/route.ts` | Hook params |
| `app/dashboard/audits/[id]/create-content/slides/page.tsx` | Toggle hook |

---

## Definition of Done

- [ ] Hook visual de 2s funcional antes do primeiro slide
- [ ] Animação fluida e profissional
- [ ] Suporta 3 formatos
- [ ] Toggle no dashboard
- [ ] Build sem erros

---

**Criado por**: 👑 Orion (aios-master)
**Data**: 2026-02-20
