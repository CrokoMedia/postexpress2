# Story 10.6: B-Roll com Vídeo

**Epic:** [EPIC-010 - Reel Quality Pro](../epics/EPIC-010-reel-quality-pro.md)
**Status:** ✅ Concluído
**Priority:** P2 (Medium)
**Estimate:** 3 dias
**Owner:** @dev
**Wave:** 3 - Differentiators
**Depende de:** Story 9.2 (multi-formato)

---

## Descrição

Substituir imagens estáticas (fal.ai) por clipes de vídeo curtos (3-5s) como background dos slides. Usar a Pexels API (gratuita) para buscar stock videos relevantes por keyword do slide. O Remotion suporta `<OffthreadVideo>` nativamente para renderizar vídeos dentro de composições.

---

## Acceptance Criteria

- [ ] Módulo `lib/stock-video.ts` criado com integração Pexels API
- [ ] Busca de vídeos por keyword do slide (título + imagePrompt)
- [ ] Download e cache local do vídeo (ou URL direta se Pexels permitir)
- [ ] `SlideFrame` aceita `backgroundVideoUrl` como alternativa a `contentImageUrl`
- [ ] Vídeo renderiza como background com overlay gradient (como editorial)
- [ ] Texto animado sobre o vídeo em movimento
- [ ] Toggle "B-Roll Vídeo" no dashboard (off por default)
- [ ] Fallback: se vídeo não encontrado, usar imagem fal.ai (atual)
- [ ] `.env.example` atualizado com `PEXELS_API_KEY`

---

## Tarefas Técnicas

### 1. Criar Módulo Stock Video
- [ ] Criar `lib/stock-video.ts`
- [ ] API: `GET https://api.pexels.com/videos/search?query={keyword}&per_page=1`
- [ ] Selecionar vídeo HD (1920x1080 mín)
- [ ] Extrair URL do arquivo de vídeo (mp4, qualidade HD)
- [ ] Cache: salvar em /tmp ou Cloudinary para reusar
- [ ] Retry + fallback para null se não encontrar

### 2. Adaptar SlideFrame para Vídeo Background
- [ ] Adicionar prop `backgroundVideoUrl?: string`
- [ ] Se `backgroundVideoUrl` fornecido:
  - Renderizar `<OffthreadVideo>` do Remotion como background
  - Gradient overlay (similar ao editorial)
  - Vídeo em loop (se slide > vídeo)
  - Muted (áudio do vídeo stock desligado)
- [ ] Se não fornecido: comportamento atual (imagem estática)

### 3. Atualizar API generate-reel
- [ ] Aceitar `brollVideo: boolean` no body
- [ ] Se ativado, para cada slide:
  1. Buscar vídeo via Pexels API usando imagePrompt/título como keyword
  2. Se encontrar: usar como backgroundVideoUrl
  3. Se não: gerar imagem via fal.ai (fallback)
- [ ] Controle de concorrência (Pexels rate limit: 200 req/h)

### 4. UI — Toggle B-Roll
- [ ] Toggle "B-Roll Vídeo (beta)" no dashboard
- [ ] Aviso: "Busca vídeos stock relevantes para cada slide"
- [ ] Indicador de que aumenta tempo de renderização

---

## Arquivos

### Criar
| Arquivo | Descrição |
|---------|-----------|
| `lib/stock-video.ts` | Integração Pexels API para stock video |

### Modificar
| Arquivo | Mudança |
|---------|---------|
| `remotion/components/SlideFrame.tsx` | Prop backgroundVideoUrl, `<OffthreadVideo>` |
| `remotion/types.ts` | backgroundVideoUrl no schema |
| `app/api/content/[id]/generate-reel/route.ts` | B-Roll video flow |
| `app/dashboard/audits/[id]/create-content/slides/page.tsx` | Toggle B-Roll |
| `.env.example` | `PEXELS_API_KEY` |

---

## Definition of Done

- [ ] B-Roll com stock video funcional
- [ ] Vídeos relevantes por keyword do slide
- [ ] Texto sobre vídeo com overlay legível
- [ ] Fallback para imagem quando vídeo não disponível
- [ ] Toggle no dashboard
- [ ] Build sem erros

---

**Criado por**: 👑 Orion (aios-master)
**Data**: 2026-02-20
