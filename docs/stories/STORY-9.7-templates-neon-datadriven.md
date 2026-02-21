# Story 9.7: Templates Visuais — Neon Social + Data Driven

**Epic:** [EPIC-009 - Remotion Expansion](../epics/EPIC-009-remotion-expansion.md)
**Status:** ✅ Concluído
**Priority:** P3 (Low)
**Estimate:** 2 dias
**Owner:** @dev + @ux-design-expert
**Sprint:** Sprint 4 - Semana 5
**Depende de:** Story 9.6 (sistema de templates criado)

---

## Descrição

Expandir a biblioteca de templates com 2 templates adicionais: "Neon Social" (gradientes vibrantes, glow effects) e "Data Driven" (números animados, barras). Com isso, o Post Express oferece 5 templates visuais distintos.

---

## Acceptance Criteria

- [ ] Template "Neon Social" funcional em PNG e MP4
- [ ] Template "Data Driven" funcional em PNG e MP4
- [ ] Ambos suportam todos os formatos (feed, story, square)
- [ ] Registrados no template registry (Story 9.6)
- [ ] Galeria atualizada com 5 templates no dashboard
- [ ] Animações específicas por template funcionam no vídeo

---

## Tarefas Técnicas

### 1. Template "Neon Social"
- [ ] Criar `remotion/templates/neon-social.ts`
- [ ] Especificações:
  - Fundo: gradiente vibrante (`#7c3aed` → `#ec4899` ou `#3b82f6` → `#06b6d4`)
  - Texto: branco com text-shadow glow
  - Elementos decorativos: linhas/círculos animados em neon
  - Imagem com border-radius arredondado + sombra colorida
- [ ] Ideal para: virais, trends, lifestyle, creators jovens
- [ ] Animações vídeo: gradiente shift, glow pulse nos decorativos

### 2. Template "Data Driven"
- [ ] Criar `remotion/templates/data-driven.ts`
- [ ] Especificações:
  - Fundo: branco ou `#f8fafc` (clean, corporativo)
  - Números grandes (`72px`) com animação de contagem
  - Barras de progresso animadas
  - Cores corporativas (azul/verde)
  - Layout focado em dados e métricas
- [ ] Ideal para: resultados, métricas, comparações, ROI
- [ ] Animações vídeo:
  - Contagem crescente nos números (useCurrentFrame interpolation)
  - Barras que crescem da esquerda
  - Fade-in sequencial dos data points

### 3. Componentes Auxiliares (se necessário)
- [ ] `remotion/components/CountUpNumber.tsx` — animação de contagem
- [ ] `remotion/components/AnimatedBar.tsx` — barra de progresso animada
- [ ] `remotion/components/GlowText.tsx` — texto com efeito glow
- [ ] Reutilizáveis entre templates e no vídeo de auditoria (Story 9.8)

### 4. Registrar no Template Registry
- [ ] Adicionar `neon-social` e `data-driven` ao registry
- [ ] Thumbnails para galeria (renderStill do slide 1 de cada)

### 5. Atualizar Galeria no Dashboard
- [ ] Adicionar os 2 novos templates à galeria (Story 9.6)
- [ ] Total: 5 templates disponíveis

---

## Arquivos

### Criar
| Arquivo | Descrição |
|---------|-----------|
| `remotion/templates/neon-social.ts` | Config Neon Social |
| `remotion/templates/data-driven.ts` | Config Data Driven |
| `remotion/components/CountUpNumber.tsx` | Animação de contagem |
| `remotion/components/AnimatedBar.tsx` | Barra animada |

### Modificar
| Arquivo | Mudança |
|---------|---------|
| `remotion/templates/index.ts` | Registrar novos templates |
| `app/dashboard/audits/[id]/create-content/slides/page.tsx` | Galeria com 5 templates |

---

## Definition of Done

- [ ] 5 templates funcionais no total
- [ ] Animações específicas corretas no vídeo
- [ ] Todos funcionam em PNG e MP4, nos 3 formatos
- [ ] Galeria completa no dashboard
- [ ] Code review aprovado

---

**Criado por**: 👑 Orion (aios-master)
**Data**: 2026-02-20
