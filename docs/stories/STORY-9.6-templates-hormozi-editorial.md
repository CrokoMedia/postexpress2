# Story 9.6: Templates Visuais — Hormozi (Dark Bold) + Editorial Magazine

**Epic:** [EPIC-009 - Remotion Expansion](../epics/EPIC-009-remotion-expansion.md)
**Status:** ✅ Concluído
**Priority:** P3 (Medium-Low)
**Estimate:** 3 dias
**Owner:** @dev + @ux-design-expert
**Sprint:** Sprint 2 - Semana 2
**Depende de:** Story 9.1 (SlideFrame adaptável)

---

## Descrição

Criar os 2 primeiros templates visuais alternativos para carrosséis, expandindo de 1 template (V2 branco) para 3. Cada template é uma variante do `SlideFrame` com props de estilo diferentes. Inclui migração do template Editorial que já existe em HTML.

---

## Acceptance Criteria

- [ ] Diretório `remotion/templates/` criado com sistema de templates
- [ ] Template "Hormozi" (Dark Bold) funcional em PNG e MP4
- [ ] Template "Editorial Magazine" funcional em PNG e MP4
- [ ] Ambos suportam todos os formatos (feed, story, square)
- [ ] `templateId` adicionado ao schema Zod (`CarouselReelSchema`)
- [ ] UI: galeria de templates com preview visual no dashboard
- [ ] Creator pode selecionar template antes de gerar
- [ ] Template "Minimalista" = template V2 atual (refatorado como variante)

---

## Tarefas Técnicas

### 1. Criar Sistema de Templates
- [ ] Criar `remotion/templates/` com estrutura:
  ```
  remotion/templates/
  ├── index.ts              # Registry de templates
  ├── types.ts              # TemplateConfig interface
  ├── minimalist.ts         # Template V2 atual (refatorado)
  ├── hormozi-dark.ts       # Novo: Dark Bold
  └── editorial-magazine.ts # Novo: migração do HTML
  ```
- [ ] Interface `TemplateConfig`:
  ```typescript
  interface TemplateConfig {
    id: string
    name: string
    description: string
    thumbnail: string  // URL para preview
    colors: {
      background: string
      title: string
      body: string
      accent: string
    }
    typography: {
      titleSize: number
      titleWeight: number
      bodySize: number
    }
    layout: {
      showImage: boolean
      showBody: boolean
      imageOverlay?: boolean
      imagePosition: 'right' | 'background' | 'none'
    }
  }
  ```

### 2. Template "Hormozi" (Dark Bold)
- [ ] Especificações:
  - Fundo: `#1a1a2e` (dark navy)
  - Título: `#ffd700` (gold) bold 48px
  - Corpo: `#ffffff` contraste alto, 26px
  - Sem imagem — foco 100% no texto
  - Accent: `#ffd700` para bordas/separadores
- [ ] Ideal para: vendas, ofertas, CTAs
- [ ] Animações: fade-in mais agressivo, text scale no título

### 3. Template "Editorial Magazine"
- [ ] Migrar do HTML existente (`lib/slide-templates/editorial-cover.ts`)
- [ ] Especificações:
  - Imagem full-bleed (background)
  - Gradient overlay (bottom→top, dark→transparent)
  - Título bold em branco, sobre o gradient
  - Sem corpo separado (texto sobre imagem)
- [ ] Ideal para: storytelling, cases, depoimentos
- [ ] Animações: parallax na imagem, slide-up no texto

### 4. Refatorar V2 como "Minimalista"
- [ ] Extrair estilos atuais do `SlideFrame.tsx` para `minimalist.ts`
- [ ] `SlideFrame` lê configuração do template selecionado
- [ ] Comportamento atual preservado (backward compatible)

### 5. Adaptar SlideFrame
- [ ] Adicionar prop `templateId: string` ao SlideFrame
- [ ] Carregar config do template via registry
- [ ] Aplicar cores, tipografia e layout dinamicamente
- [ ] Manter suporte a todos os formatos (feed/story/square)

### 6. Atualizar Schema e API
- [ ] Adicionar `templateId` ao `CarouselReelSchema` (Zod)
- [ ] Atualizar rotas generate-slides-v3 e generate-reel
- [ ] Default: `'minimalist'` (comportamento atual)

### 7. UI — Galeria de Templates
- [ ] Criar componente de seleção de template no dashboard
- [ ] Cards com thumbnail, nome e descrição
- [ ] Preview no Player (Story 9.3) ao selecionar
- [ ] Indicador visual do template selecionado

---

## Arquivos

### Criar
| Arquivo | Descrição |
|---------|-----------|
| `remotion/templates/index.ts` | Registry de templates |
| `remotion/templates/types.ts` | Interface TemplateConfig |
| `remotion/templates/minimalist.ts` | Template V2 refatorado |
| `remotion/templates/hormozi-dark.ts` | Template Dark Bold |
| `remotion/templates/editorial-magazine.ts` | Template Editorial |

### Modificar
| Arquivo | Mudança |
|---------|---------|
| `remotion/components/SlideFrame.tsx` | Prop `templateId`, config dinâmica |
| `remotion/types.ts` | `templateId` no schema Zod |
| `app/api/content/[id]/generate-slides-v3/route.ts` | Aceitar templateId |
| `app/api/content/[id]/generate-reel/route.ts` | Aceitar templateId |
| `app/dashboard/audits/[id]/create-content/slides/page.tsx` | Galeria de templates |

### Referência
| Arquivo | Uso |
|---------|-----|
| `lib/slide-templates/editorial-cover.ts` | Base para migração do Editorial |

---

## Definition of Done

- [ ] 3 templates funcionais (Minimalista, Hormozi, Editorial)
- [ ] Todos suportam PNG e MP4 em 3 formatos
- [ ] Galeria de seleção no dashboard
- [ ] Template V2 atual preservado como "Minimalista" (zero regressão)
- [ ] Schema atualizado com templateId
- [ ] Code review aprovado

---

**Criado por**: 👑 Orion (aios-master)
**Data**: 2026-02-20
