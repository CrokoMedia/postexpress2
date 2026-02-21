# Story 10.5: Efeitos de Texto Dinâmicos

**Epic:** [EPIC-010 - Reel Quality Pro](../epics/EPIC-010-reel-quality-pro.md)
**Status:** ✅ Concluído
**Priority:** P1 (High)
**Estimate:** 1.5 dias
**Owner:** @dev
**Wave:** 2 - Polish & Engagement
**Depende de:** Story 9.1 (SlideFrame base)

---

## Descrição

Adicionar efeitos de texto avançados ao SlideFrame para tornar os títulos e corpo mais dinâmicos e "nativos" do formato reel. Efeitos: typewriter (letra por letra), scale bounce (palavras-chave crescem), gradient text (gradiente animado), e highlight marker (marca-texto passando sob o texto).

---

## Acceptance Criteria

- [ ] 4 efeitos de texto implementados como componentes Remotion
- [ ] Typewriter: texto aparece letra por letra
- [ ] Scale Bounce: palavras-chave crescem e voltam (spring)
- [ ] Gradient Text: texto com gradiente animado (cor muda progressivamente)
- [ ] Highlight Marker: efeito de marca-texto amarelo passando sob palavras-chave
- [ ] Seletor de efeito no dashboard
- [ ] Efeitos aplicados ao título e/ou corpo do slide
- [ ] Suporta todos os formatos e templates
- [ ] Performance: não impactar rendering time significativamente

---

## Tarefas Técnicas

### 1. Criar Componente TypewriterText
- [ ] `remotion/components/TypewriterText.tsx`
- [ ] Texto aparece caractere por caractere
- [ ] Cursor piscando (|) no final durante digitação
- [ ] Velocidade: ~30 chars/segundo
- [ ] Usar `useCurrentFrame()` para calcular quantos chars mostrar

### 2. Criar Componente ScaleBounceText
- [ ] `remotion/components/ScaleBounceText.tsx`
- [ ] Detectar palavras-chave no texto (entre **negrito** ou palavras de poder)
- [ ] Palavras-chave: scale spring de 1.0 → 1.3 → 1.0
- [ ] Timing: sequencial, cada palavra bounce 0.3s após a anterior
- [ ] Cor diferenciada para palavras com bounce (accent color do template)

### 3. Criar Componente GradientText
- [ ] `remotion/components/GradientText.tsx`
- [ ] Texto com `background-clip: text` e gradiente CSS
- [ ] Gradiente anima horizontalmente (shift de posição)
- [ ] Cores: baseadas no template (accent → secondary)

### 4. Criar Componente HighlightMarker
- [ ] `remotion/components/HighlightMarker.tsx`
- [ ] Background amarelo (#FACC15) passa da esquerda para direita sob o texto
- [ ] Efeito de marca-texto manual (slightly tilted, organic)
- [ ] Aplicado a palavras-chave ou título inteiro
- [ ] Usa `interpolate()` para animar width do highlight

### 5. Integrar no SlideFrame
- [ ] Adicionar prop `textEffect: 'none' | 'typewriter' | 'bounce' | 'gradient' | 'marker'`
- [ ] Aplicar efeito ao título (principal)
- [ ] Corpo mantém animação atual (fade-in)

### 6. UI — Seletor de Efeito
- [ ] Seletor de efeito de texto no dashboard
- [ ] 5 opções: Nenhum, Typewriter, Bounce, Gradiente, Marca-texto
- [ ] Preview visual de cada efeito

---

## Arquivos

### Criar
| Arquivo | Descrição |
|---------|-----------|
| `remotion/components/TypewriterText.tsx` | Efeito typewriter |
| `remotion/components/ScaleBounceText.tsx` | Efeito scale bounce |
| `remotion/components/GradientText.tsx` | Efeito gradient text |
| `remotion/components/HighlightMarker.tsx` | Efeito highlight marker |

### Modificar
| Arquivo | Mudança |
|---------|---------|
| `remotion/components/SlideFrame.tsx` | Prop textEffect, aplicar efeitos |
| `remotion/types.ts` | textEffect no schema |
| `app/api/content/[id]/generate-reel/route.ts` | Passar textEffect |
| `app/dashboard/audits/[id]/create-content/slides/page.tsx` | Seletor de efeito |

---

## Definition of Done

- [ ] 4 efeitos de texto funcionais
- [ ] Seletor no dashboard
- [ ] Efeitos fluidos em 30fps
- [ ] Suporta todos os templates e formatos
- [ ] Build sem erros

---

**Criado por**: 👑 Orion (aios-master)
**Data**: 2026-02-20
