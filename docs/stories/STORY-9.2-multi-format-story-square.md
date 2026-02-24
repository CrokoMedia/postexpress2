# Story 9.2: Multi-formato — Stories (9:16) + Square (1:1)

**Epic:** [EPIC-009 - Remotion Expansion](../epics/EPIC-009-remotion-expansion.md)
**Status:** ✅ Concluído
**Priority:** P1 (High)
**Estimate:** 2 dias
**Owner:** @dev
**Sprint:** Sprint 1 - Semana 1
**Depende de:** Story 9.1 (SlideFrame com prop `animated`)

---

## Descrição

Adicionar composições Remotion para formatos Story/Shorts (1080x1920, 9:16) e Square (1080x1080, 1:1), reutilizando o `SlideFrame` com layouts adaptativos. Um carrossel gera conteúdo para 3 plataformas diferentes.

---

## Acceptance Criteria

- [ ] Composição `StoryReel.tsx` (1080x1920) renderiza corretamente
- [ ] Composição `SquareReel.tsx` (1080x1080) renderiza corretamente
- [ ] `SlideFrame.tsx` aceita prop `layout: 'feed' | 'story' | 'square'`
- [ ] Layouts adaptam tamanhos de fonte, imagem e espaçamento por formato
- [ ] API aceita parâmetro `format` para escolher formato de output
- [ ] UI oferece seleção de formato antes de gerar (dropdown ou botões)
- [ ] PNGs (renderStill) e MP4s (renderMedia) funcionam para todos os formatos

---

## Tarefas Técnicas

### 1. Adaptar SlideFrame para Multi-Layout
- [ ] Adicionar prop `layout: 'feed' | 'story' | 'square'` ao `SlideFrame`
- [ ] Configuração por layout:

| Prop | Feed (4:5) | Story (9:16) | Square (1:1) |
|------|-----------|-------------|--------------|
| Dimensões | 1080x1350 | 1080x1920 | 1080x1080 |
| Título font | 42px | 44px | 36px |
| Corpo font | 28px | 30px | 24px |
| Imagem | 956x500 | 956x700 | 956x400 |
| Corpo visível | Sim | Sim (mais linhas) | Não (só título + imagem) |

- [ ] Criar objeto `LAYOUT_CONFIG` com todas as medidas
- [ ] Aplicar config dinâmica no SlideFrame

### 2. Criar Composições de Vídeo
- [ ] Criar `remotion/compositions/StoryReel.tsx` (1080x1920, 9:16)
  - TransitionSeries como CarouselReel, mas com dimensões adaptadas
- [ ] Criar `remotion/compositions/SquareReel.tsx` (1080x1080, 1:1)
  - Layout compacto: título + imagem, sem corpo
- [ ] Registrar ambas no `remotion/index.tsx`

### 3. Criar Composições Still (PNG)
- [ ] Adicionar variantes story/square ao `CarouselStill.tsx` (ou composições separadas)
- [ ] Garantir que `renderStill()` funciona para todos os formatos

### 4. Atualizar API generate-reel
- [ ] Modificar `app/api/content/[id]/generate-reel/route.ts`
- [ ] Aceitar `format: 'reel' | 'story' | 'square'` no body
- [ ] Selecionar composição e dimensões baseado no formato
- [ ] Default: `'reel'` (comportamento atual preservado)

### 5. Atualizar API generate-slides-v3
- [ ] Aceitar `format` no body da rota v3
- [ ] Gerar PNGs no formato selecionado

### 6. UI — Seleção de Formato
- [ ] Adicionar seletor de formato na página de slides
- [ ] 3 opções visuais com ícones:
  - 📱 Feed (4:5) — Instagram, LinkedIn
  - 📲 Story (9:16) — Stories, Shorts, TikTok
  - ⬜ Square (1:1) — Instagram, Twitter
- [ ] Preview do aspect ratio selecionado
- [ ] Passar formato para as APIs de geração

---

## Arquivos

### Criar
| Arquivo | Descrição |
|---------|-----------|
| `remotion/compositions/StoryReel.tsx` | Composição 9:16 |
| `remotion/compositions/SquareReel.tsx` | Composição 1:1 |

### Modificar
| Arquivo | Mudança |
|---------|---------|
| `remotion/components/SlideFrame.tsx` | Prop `layout` + LAYOUT_CONFIG |
| `remotion/index.tsx` | Registrar novas composições |
| `remotion/types.ts` | Adicionar `format` ao schema Zod |
| `app/api/content/[id]/generate-reel/route.ts` | Parâmetro `format` |
| `app/api/content/[id]/generate-slides-v3/route.ts` | Parâmetro `format` |
| `app/dashboard/audits/[id]/create-content/slides/page.tsx` | Seletor de formato |

---

## Definition of Done

- [ ] 3 formatos de output funcionando (feed, story, square)
- [ ] UI de seleção de formato integrada no dashboard
- [ ] PNGs e MP4s gerados corretamente para cada formato
- [ ] Layout responsivo comprovado por screenshots comparativos
- [ ] Zero regressões no formato feed existente
- [ ] Code review aprovado

---

**Criado por**: 👑 Orion (aios-master)
**Data**: 2026-02-20
