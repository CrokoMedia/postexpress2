# Story 11.4: Typography Motion Graphics

**Epic:** [EPIC-011 - Visual Effects Pro](../epics/EPIC-011-visual-effects-pro.md)
**Status:** 🔵 Planejado
**Priority:** P1 (High)
**Estimate:** 1.5 dias
**Owner:** @dev
**Wave:** 2 - Premium Polish
**Depende de:** Story 10.5 (text effects já implementados)

---

## Descrição

Adicionar efeitos de tipografia de nível motion graphics inspirados no Typography Template do remotiontemplates.dev e nos efeitos Slide Text, Animated Text e Pulsing Text do reactvideoeditor.com. Estes são mais sofisticados que os efeitos atuais (typewriter, bounce, gradient, marker).

---

## Acceptance Criteria

- [ ] 3 novos efeitos de texto: split-reveal, wave-text, cinematic-fade
- [ ] Split Reveal: texto aparece com máscara deslizante (esquerda→direita), cada linha com delay
- [ ] Wave Text: cada caractere oscila verticalmente como onda (sine wave propagante)
- [ ] Cinematic Fade: texto aparece word-by-word com fade + tracking (letter-spacing se fecha)
- [ ] Todos integrados no seletor existente de text effects
- [ ] Funcionam tanto para títulos quanto para corpo
- [ ] Performance OK: sem lag no Player preview

---

## Tarefas Técnicas

### 1. Criar Componentes
- [ ] Criar `remotion/components/SplitRevealText.tsx`
  - Texto splitado por linhas
  - Cada linha com `clip-path: inset(0 100% 0 0)` → `inset(0 0% 0 0)`
  - Delay de 8 frames entre linhas
  - Spring timing para movimento suave
- [ ] Criar `remotion/components/WaveText.tsx`
  - Cada caractere é um `<span>` individual
  - `translateY(sin(frame * 0.3 + charIndex * 0.5) * amplitude)`
  - Amplitude diminui ao longo do tempo (amortecimento)
  - Efeito de "onda mexicana" no texto
- [ ] Criar `remotion/components/CinematicFadeText.tsx`
  - Texto splitado por palavras
  - Cada palavra: opacity 0→1 + letterSpacing 8px→0px
  - Delay de 6 frames entre palavras
  - Blur 4px→0px simultâneo

### 2. Integrar no SlideFrame
- [ ] Adicionar ao `renderTitleContent()` existente
- [ ] Novos cases: 'split-reveal', 'wave', 'cinematic'
- [ ] Manter todos os efeitos anteriores funcionando

### 3. Atualizar Schema
- [ ] Expandir TextEffectSchema com novos valores
- [ ] API aceita os novos efeitos

### 4. UI — Expandir Seletor
- [ ] Adicionar 3 cards ao grid existente
- [ ] Badge "Novo" nos 3 novos efeitos

---

## Arquivos

### Criar
| Arquivo | Descrição |
|---------|-----------|
| `remotion/components/SplitRevealText.tsx` | Efeito split reveal |
| `remotion/components/WaveText.tsx` | Efeito wave text |
| `remotion/components/CinematicFadeText.tsx` | Efeito cinematic fade |

### Modificar
| Arquivo | Mudança |
|---------|---------|
| `remotion/types.ts` | Expandir TextEffectSchema |
| `remotion/components/SlideFrame.tsx` | Novos cases em renderTitleContent |
| `app/api/content/[id]/generate-reel/route.ts` | Aceitar novos efeitos |
| `app/dashboard/audits/[id]/create-content/slides/page.tsx` | 3 cards novos |

---

## Definition of Done

- [ ] 3 novos efeitos de tipografia funcionais
- [ ] Integrados no seletor existente
- [ ] Build sem erros

---

**Criado por**: 👑 Orion (aios-master)
**Data**: 2026-02-20
