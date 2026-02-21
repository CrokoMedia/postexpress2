# Story 9.8: Vídeo Animado da Auditoria (Resultado Visual Postável)

**Epic:** [EPIC-009 - Remotion Expansion](../epics/EPIC-009-remotion-expansion.md)
**Status:** ✅ Concluído
**Priority:** P3 (Medium-Low)
**Estimate:** 4 dias
**Owner:** @dev
**Sprint:** Sprint 3 - Semana 3-4
**Depende de:** Story 9.1 (renderStill base), Story 9.2 (multi-formato)

---

## Descrição

Gerar um vídeo de 15-30 segundos com os resultados da auditoria animados: gráfico radar dos 5 scores, destaques em texto animado e CTA do Post Express. O creator posta o resultado → marketing viral orgânico.

---

## Acceptance Criteria

- [ ] Composição `AuditResult.tsx` criada com 4 seções animadas
- [ ] Gráfico radar animado com os 5 scores dos auditores
- [ ] Scores animados com contagem crescente
- [ ] Top 3 insights exibidos em texto animado
- [ ] CTA final com branding Post Express
- [ ] Vídeo de 15-30s renderizado via Remotion
- [ ] Upload automático para Cloudinary
- [ ] Botão "Gerar Vídeo da Auditoria" na página de resultado
- [ ] Suporta formato 1:1 (ideal para compartilhar) e 9:16 (stories)

---

## Tarefas Técnicas

### 1. Criar Componente RadarChart
- [ ] Criar `remotion/components/RadarChart.tsx`
- [ ] SVG com 5 eixos (um por auditor):
  - Kahneman (comportamento)
  - Schwartz (copy)
  - Hormozi (ofertas)
  - Cagan (métricas)
  - Paul Graham (anomalias)
- [ ] Animação spring: polígono cresce do centro (0) até os scores
- [ ] Labels nos eixos com nome do auditor
- [ ] Cores: cada eixo com cor do auditor (purple, blue, green, orange, red)

### 2. Criar Componente ScoreBar
- [ ] Criar `remotion/components/ScoreBar.tsx`
- [ ] Barra horizontal com score (0-10) + label
- [ ] Animação: barra cresce da esquerda com spring
- [ ] Número conta de 0 até o score real
- [ ] Cor muda conforme score (vermelho < 5, amarelo 5-7, verde > 7)

### 3. Criar Composição AuditResult
- [ ] Criar `remotion/compositions/AuditResult.tsx`
- [ ] Estrutura do vídeo (30fps):

| Seção | Duração | Frames | Conteúdo |
|-------|---------|--------|----------|
| Intro | 2s | 0-60 | Logo Post Express + "Auditoria de @username" |
| Radar | 8s | 60-300 | RadarChart animado + ScoreBars |
| Insights | 5s | 300-450 | Top 3 insights com typewriter |
| CTA | 3s | 450-540 | "Faça sua auditoria em postexpress.com" |

- [ ] Total: ~18s (540 frames @ 30fps)
- [ ] Transições suaves entre seções (fade)

### 4. Criar Rota API
- [ ] Criar `app/api/audits/[id]/generate-audit-video/route.ts`
- [ ] Fluxo:
  1. Buscar dados da auditoria (scores + insights)
  2. Bundle Remotion
  3. `renderMedia()` → MP4
  4. Upload para Cloudinary
  5. Salvar URL no Supabase (campo `audit_video_url` em `audits`)
- [ ] Aceitar `format: 'square' | 'story'`

### 5. Atualizar Schema do Banco
- [ ] Adicionar campo `audit_video_url` na tabela `audits` (nullable)
- [ ] Migration SQL

### 6. UI — Botão de Geração
- [ ] Adicionar botão "Gerar Vídeo da Auditoria" em `app/dashboard/audits/[id]/page.tsx`
- [ ] Loading state durante renderização (~30s)
- [ ] Player para preview após geração
- [ ] Botão de download direto

---

## Arquivos

### Criar
| Arquivo | Descrição |
|---------|-----------|
| `remotion/components/RadarChart.tsx` | Gráfico radar animado SVG |
| `remotion/components/ScoreBar.tsx` | Barra de score animada |
| `remotion/compositions/AuditResult.tsx` | Composição do vídeo |
| `app/api/audits/[id]/generate-audit-video/route.ts` | Rota API |

### Modificar
| Arquivo | Mudança |
|---------|---------|
| `remotion/index.tsx` | Registrar AuditResult |
| `remotion/types.ts` | Schema AuditVideoProps |
| `app/dashboard/audits/[id]/page.tsx` | Botão + player |
| `database/` | Migration para `audit_video_url` |

---

## Referências do Skill Remotion

- `rules/charts.md` — Bar charts animados
- `rules/text-animations.md` — Typewriter, word highlight
- `rules/spring-animations.md` — Spring para o radar

---

## Definition of Done

- [ ] Vídeo de auditoria renderiza com radar + scores + insights + CTA
- [ ] Animações fluidas em 30fps
- [ ] Upload automático para Cloudinary
- [ ] Botão funcional na página de auditoria
- [ ] Suporta formatos 1:1 e 9:16
- [ ] Migration aplicada
- [ ] Code review aprovado

---

**Criado por**: 👑 Orion (aios-master)
**Data**: 2026-02-20
