# Story 10.7: Batch Generation

**Epic:** [EPIC-010 - Reel Quality Pro](../epics/EPIC-010-reel-quality-pro.md)
**Status:** ✅ Concluído
**Priority:** P2 (Medium)
**Estimate:** 1.5 dias
**Owner:** @dev
**Wave:** 3 - Differentiators
**Depende de:** Nenhuma (melhoria de fluxo)

---

## Descrição

Permitir gerar múltiplos reels em paralelo a partir de todos os carrosséis aprovados de uma auditoria. Hoje o fluxo é 1 reel por vez. Com batch, o creator clica "Gerar Todos" e recebe 5-7 reels de uma vez, podendo exportar como ZIP ou galeria.

---

## Acceptance Criteria

- [ ] Botão "Gerar Todos os Reels" no dashboard
- [ ] Geração em paralelo de múltiplos reels (max 3 simultâneos)
- [ ] Progress bar por reel individual + progress geral
- [ ] Cada reel pode ter template/formato diferente (variação automática)
- [ ] Galeria de resultados com player individual por reel
- [ ] Export ZIP com todos os reels gerados
- [ ] Estimativa de tempo exibida antes de iniciar

---

## Tarefas Técnicas

### 1. API — Batch Generate
- [ ] Criar `app/api/content/[id]/generate-reels-batch/route.ts`
- [ ] Aceitar array de configurações por carrossel:
  ```typescript
  interface BatchConfig {
    carouselIndex: number
    templateId: string
    format: string
    voiceover: boolean
    voice?: string
  }
  ```
- [ ] Processar em paralelo com `Promise.allSettled()` (max 3 concorrentes)
- [ ] Retornar resultados parciais (reels que deram certo + erros)

### 2. Auto-variação
- [ ] Se o creator não especificar, variar automaticamente:
  - Reel 1: minimalist + feed
  - Reel 2: hormozi-dark + story
  - Reel 3: neon-social + square
  - Reel 4: editorial + feed
  - etc.
- [ ] Rotacionar templates e formatos ciclicamente

### 3. UI — Batch Controls
- [ ] Botão "Gerar Todos os Reels" (ao lado do individual)
- [ ] Modal de confirmação com:
  - Quantidade de reels a gerar
  - Estimativa de tempo
  - Opção: variação automática ou mesmo template para todos
- [ ] Progress: cards por reel com status (aguardando/gerando/pronto/erro)
- [ ] Progress bar geral (X/Y concluídos)

### 4. Galeria de Resultados
- [ ] Grid de vídeos gerados com thumbnail
- [ ] Player individual por reel (click to play)
- [ ] Botão download individual + "Download Todos (ZIP)"
- [ ] Reusar lógica do export-zip existente

### 5. Export ZIP
- [ ] Reusar `jszip` já instalado no projeto
- [ ] Baixar todos os MP4s do Cloudinary
- [ ] Empacotar em ZIP com nomes descritivos
- [ ] `carrossel-1-minimalist-feed.mp4`, etc.

---

## Arquivos

### Criar
| Arquivo | Descrição |
|---------|-----------|
| `app/api/content/[id]/generate-reels-batch/route.ts` | API batch generation |

### Modificar
| Arquivo | Mudança |
|---------|---------|
| `app/dashboard/audits/[id]/create-content/slides/page.tsx` | Batch UI + galeria |

---

## Definition of Done

- [ ] Batch generation funcional (múltiplos reels em paralelo)
- [ ] Progress tracking por reel
- [ ] Galeria de resultados com player
- [ ] Export ZIP com todos os reels
- [ ] Build sem erros

---

**Criado por**: 👑 Orion (aios-master)
**Data**: 2026-02-20
