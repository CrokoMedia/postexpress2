# Story 9.1: renderStill() Substitui Puppeteer para Geração de PNGs

**Epic:** [EPIC-009 - Remotion Expansion](../epics/EPIC-009-remotion-expansion.md)
**Status:** ✅ Concluído
**Priority:** P0 (Critical Path)
**Estimate:** 3 dias
**Owner:** @dev
**Sprint:** Sprint 1 - Semana 1

---

## Descrição

Substituir a geração de PNGs via Puppeteer + HTML template literals (~1400 linhas) por `renderStill()` do `@remotion/renderer`, reutilizando o componente `SlideFrame.tsx` que já gera os vídeos. Um componente React = PNG + MP4.

---

## Acceptance Criteria

- [ ] Nova rota `POST /api/content/[id]/generate-slides-v3` funcional
- [ ] PNGs gerados via `renderStill()` com qualidade igual ou superior ao Puppeteer
- [ ] Componente `SlideFrame.tsx` reutilizado (sem duplicação de design)
- [ ] Composição `CarouselStill.tsx` criada para renderização estática
- [ ] Imagens do fal.ai geradas corretamente (reutiliza `generateContentImage`)
- [ ] Upload para Cloudinary funcionando
- [ ] Resultado salvo em `slides_v3_json` (ou `slides_json` atualizado)
- [ ] Performance: < 5s por slide
- [ ] Rotas v1 e v2 marcadas como deprecated (não removidas ainda)
- [ ] Testes manuais: gerar carrossel completo (7-10 slides) com sucesso

---

## Tarefas Técnicas

### 1. Criar Composição Still (`CarouselStill.tsx`)
- [ ] Criar `remotion/compositions/CarouselStill.tsx`
- [ ] Usar `<Still>` em vez de `<Composition>` para frame estático
- [ ] Receber props: slide data, dimensões, sem animações
- [ ] Registrar no `remotion/index.tsx`

### 2. Adaptar SlideFrame para modo Still
- [ ] Adicionar prop `animated: boolean` ao `SlideFrame.tsx` (default: true)
- [ ] Quando `animated: false`: sem spring/fade, posições finais diretas
- [ ] Manter 100% compatibilidade com o modo animado (vídeo)

### 3. Criar Rota generate-slides-v3
- [ ] Criar `app/api/content/[id]/generate-slides-v3/route.ts`
- [ ] Fluxo por slide:
  1. Gerar imagem via fal.ai (`generateContentImage` de `lib/fal-image.ts`)
  2. Bundle do Remotion (cachear bundle entre slides)
  3. `renderStill({ composition: 'CarouselStill', inputProps })` → Buffer PNG
  4. Upload PNG para Cloudinary
  5. Coletar URLs
- [ ] Salvar array de URLs no Supabase (`slides_json` ou `slides_v3_json`)
- [ ] Retornar JSON com URLs dos slides gerados

### 4. Otimização de Performance
- [ ] Cachear o Remotion bundle (não re-bundlar para cada slide)
- [ ] Paralelizar geração de imagens fal.ai quando possível
- [ ] Log de tempo por etapa (fal.ai, renderStill, upload)

### 5. Deprecar Rotas Anteriores
- [ ] Adicionar header `X-Deprecated: true` nas rotas v1 e v2
- [ ] Adicionar comentário `// DEPRECATED: use generate-slides-v3` no topo
- [ ] Manter funcionando para backward compatibility

### 6. Atualizar Frontend
- [ ] Modificar `app/dashboard/audits/[id]/create-content/slides/page.tsx`
- [ ] Apontar botão "Gerar Slides" para rota v3
- [ ] Manter fallback para v2 se v3 falhar

---

## Arquivos

### Criar
| Arquivo | Descrição |
|---------|-----------|
| `remotion/compositions/CarouselStill.tsx` | Composição Still para PNGs |
| `app/api/content/[id]/generate-slides-v3/route.ts` | Nova rota de geração |

### Modificar
| Arquivo | Mudança |
|---------|---------|
| `remotion/components/SlideFrame.tsx` | Adicionar prop `animated` |
| `remotion/index.tsx` | Registrar `CarouselStill` |
| `app/dashboard/audits/[id]/create-content/slides/page.tsx` | Apontar para v3 |

### Deprecar (manter funcionando)
| Arquivo | Status |
|---------|--------|
| `app/api/content/[id]/generate-slides/route.ts` | Deprecated |
| `app/api/content/[id]/generate-slides-v2/route.ts` | Deprecated |

### Candidatos a remoção futura
| Arquivo | Motivo |
|---------|--------|
| `lib/emoji-utils.ts` | Hack de emojis desnecessário com Remotion |
| `lib/browser.ts` | Puppeteer launcher não mais necessário |

---

## Riscos e Mitigações

| Risco | Probabilidade | Mitigação |
|-------|--------------|-----------|
| renderStill() mais lento que Puppeteer | Baixa | Bundle cacheado, benchmark antes |
| Fonts não carregam no renderStill | Média | Usar `@remotion/fonts` (já em `fonts.ts`) |
| Qualidade visual diferente | Baixa | Comparar side-by-side antes de deprecar |

---

## Definition of Done

- [ ] PNGs gerados via renderStill() com qualidade visual aprovada
- [ ] Rota v3 integrada no dashboard
- [ ] Performance < 5s/slide documentada
- [ ] Rotas v1/v2 marcadas deprecated
- [ ] Zero regressões nos fluxos existentes (export ZIP, export Drive)
- [ ] Code review aprovado

---

**Criado por**: 👑 Orion (aios-master)
**Data**: 2026-02-20
