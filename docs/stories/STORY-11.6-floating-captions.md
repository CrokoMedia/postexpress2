# Story 11.6: Floating Captions Premium

**Epic:** [EPIC-011 - Visual Effects Pro](../epics/EPIC-011-visual-effects-pro.md)
**Status:** 🔵 Planejado
**Priority:** P1 (High)
**Estimate:** 1 dia
**Owner:** @dev
**Wave:** 2 - Premium Polish
**Depende de:** Story 9.5 (AnimatedCaptions já implementado)

---

## Descrição

Adicionar novo estilo de legenda "floating-chips" inspirado nos efeitos Floating Text Chip e Bubble Pop Text do reactvideoeditor.com. Palavras aparecem como chips/pills flutuantes com animação de entrada e saída, estilo premium de TikTok/Instagram profissional.

---

## Acceptance Criteria

- [ ] Novo estilo de caption: `floating-chips`
- [ ] Cada palavra aparece como pill/chip individual que "flutua" para a posição
- [ ] Animação de entrada: spring de baixo para cima + scale 0→1
- [ ] Palavra ativa: destaque com cor, scale maior, shadow
- [ ] Palavras passadas: diminuem levemente e ficam mais transparentes
- [ ] Layout: palavras se organizam em "nuvem" centralizada
- [ ] Transição suave entre janelas de palavras
- [ ] Integrado no seletor de legendas existente

---

## Tarefas Técnicas

### 1. Criar Componente
- [ ] Criar `remotion/components/FloatingChipsCaptions.tsx`
- [ ] Cada palavra é um chip independente com posição calculada
- [ ] Entrada: `spring()` com `translateY(20→0)` + `scale(0.5→1.0)`
- [ ] Ativa: `scale(1.1)`, cor de destaque, `boxShadow` glow
- [ ] Passada: `opacity(0.5)`, `scale(0.9)`
- [ ] Layout flexbox com `gap` e `flexWrap`
- [ ] Animação de saída: `opacity→0` + `translateY(-10)`

### 2. Integrar com AnimatedCaptions
- [ ] Adicionar case `floating-chips` no CaptionWordSpan ou criar renderFloatingChips
- [ ] Compartilhar lógica de janela de contexto (CONTEXT_WINDOW_SIZE)
- [ ] Manter compatibilidade com todos os estilos anteriores

### 3. Schema & UI
- [ ] Expandir CaptionStyleSchema com 'floating-chips'
- [ ] Adicionar card no seletor de legendas
- [ ] Badge "Premium" no card

---

## Arquivos

### Criar/Modificar
| Arquivo | Mudança |
|---------|---------|
| `remotion/components/AnimatedCaptions.tsx` | Novo estilo floating-chips |
| `remotion/types.ts` | Expandir CaptionStyleSchema |
| `app/dashboard/audits/[id]/create-content/slides/page.tsx` | Card no seletor |

---

## Definition of Done

- [ ] Floating chips funcional e visualmente premium
- [ ] Integrado no seletor de legendas
- [ ] Build sem erros

---

**Criado por**: 👑 Orion (aios-master)
**Data**: 2026-02-20
