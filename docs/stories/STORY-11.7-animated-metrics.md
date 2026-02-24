# Story 11.7: Animated Metrics & Charts

**Epic:** [EPIC-011 - Visual Effects Pro](../epics/EPIC-011-visual-effects-pro.md)
**Status:** 🔵 Planejado
**Priority:** P2 (Medium)
**Estimate:** 1.5 dias
**Owner:** @dev
**Wave:** 3 - Differentiators
**Depende de:** EPIC-009 (SlideFrame)

---

## Descrição

Adicionar componentes de métricas animadas inspirados nos efeitos Circular Progress e Chart Animation do reactvideoeditor.com. Quando o conteúdo do slide contém números, scores ou estatísticas, animar visualmente com contadores crescentes, barras de progresso e arcos circulares.

---

## Acceptance Criteria

- [ ] Componente `AnimatedCounter` — número que conta de 0 até N
- [ ] Componente `CircularProgress` — arco SVG que preenche progressivamente
- [ ] Componente `AnimatedBar` — barra horizontal que cresce
- [ ] Detecção automática de métricas no texto do slide (regex: números, %, scores)
- [ ] Quando detecta "85/100" → renderiza CircularProgress com valor 85
- [ ] Quando detecta "3.5%" → renderiza AnimatedCounter
- [ ] Cores adaptadas ao template
- [ ] Animação com spring para feeling orgânico

---

## Tarefas Técnicas

### 1. Criar Componentes
- [ ] Criar `remotion/components/AnimatedCounter.tsx`
  - Interpola de 0 até targetValue ao longo de N frames
  - `interpolate(frame, [startFrame, endFrame], [0, targetValue])`
  - Formato: inteiro ou 1 decimal
  - Sufixo configurável (%, /100, k, etc.)
  - Font size e cor configuráveis
- [ ] Criar `remotion/components/CircularProgress.tsx`
  - SVG `<circle>` com `strokeDasharray` e `strokeDashoffset` animados
  - Arco de 0° a (value/max * 360)°
  - Número central animado
  - Cor do template para o arco, cinza para background
  - Spring timing
- [ ] Criar `remotion/components/AnimatedBar.tsx`
  - Barra horizontal com width animada (0→value%)
  - Label no topo com valor
  - Spring timing
  - Cor do template

### 2. Detecção de Métricas
- [ ] Criar `remotion/utils/metric-detector.ts`
  - Regex patterns: `\d+/\d+`, `\d+%`, `\d+k`, `\d+\.?\d*`
  - Retorna `{ type: 'score' | 'percentage' | 'number', value, max?, suffix? }`
  - Usado pelo SlideFrame para decidir se renderiza componente de métrica

### 3. Integrar no SlideFrame
- [ ] Quando corpo do slide tem métrica detectada:
  - Renderizar componente de métrica abaixo/ao lado do texto
  - Não substituir o texto, adicionar visualização
- [ ] Tipo 'score' (X/100) → CircularProgress
- [ ] Tipo 'percentage' → AnimatedBar
- [ ] Tipo 'number' → AnimatedCounter inline

### 4. Schema & UI
- [ ] Adicionar `animatedMetrics: boolean` ao schema (default: true)
- [ ] Toggle no dashboard

---

## Arquivos

### Criar
| Arquivo | Descrição |
|---------|-----------|
| `remotion/components/AnimatedCounter.tsx` | Contador animado |
| `remotion/components/CircularProgress.tsx` | Progresso circular SVG |
| `remotion/components/AnimatedBar.tsx` | Barra animada |
| `remotion/utils/metric-detector.ts` | Detecção de métricas |

### Modificar
| Arquivo | Mudança |
|---------|---------|
| `remotion/types.ts` | animatedMetrics no schema |
| `remotion/components/SlideFrame.tsx` | Renderizar métricas |
| `app/api/content/[id]/generate-reel/route.ts` | Aceitar animatedMetrics |
| `app/dashboard/audits/[id]/create-content/slides/page.tsx` | Toggle UI |

---

## Definition of Done

- [ ] 3 componentes de métrica animada funcionais
- [ ] Detecção automática no texto
- [ ] Toggle no dashboard
- [ ] Build sem erros

---

**Criado por**: 👑 Orion (aios-master)
**Data**: 2026-02-20
