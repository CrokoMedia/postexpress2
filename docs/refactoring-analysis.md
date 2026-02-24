# Análise de Refatoração - Content Creation Page

**Arquivo analisado:** `app/dashboard/audits/[id]/create-content/page.tsx` (1.878 linhas)

**Data da análise:** 2026-02-24

---

## 📋 Sumário Executivo

A página atual (`create-content/page.tsx`) é um **componente monolítico de 1.878 linhas** que gerencia todo o fluxo de criação de conteúdo de carrosséis. Contém 86 estados locais (useState), 40+ funções de handler e integra com 15+ APIs diferentes.

**Decisão estratégica:** Refatorar para **arquitetura de páginas separadas por fase** com **state management centralizado (Zustand)**.

---

## ✅ O QUE MANTER (Funcionalidades Críticas)

### 1. Geração de Conteúdo Textual (Carrosséis)
- ✅ **API:** `POST /api/audits/[id]/generate-content`
- ✅ **Funcionalidade:** Gera 3 carrosséis via Claude API baseado na auditoria
- ✅ **Estado local:** `content` (estrutura com carousels, estrategia_geral, proximos_passos)
- ✅ **Custom theme:** Campo de tema personalizado (customTheme, usedTheme)
- ✅ **Carregamento automático:** useEffect que busca conteúdo existente ao abrir a página
- ✅ **Linha:** 124-200 (handleGenerateContent)

**Contexto:** Esta é a funcionalidade CORE do produto. O Content Squad gera carrosséis únicos baseados em:
- Auditoria dos 5 frameworks
- Profile context (pilares, tom de voz, produtos, DNA)
- Tema personalizado opcional
- Termos a evitar (jargões técnicos)

### 2. Sistema de Aprovação de Carrosséis
- ✅ **API:** `PUT /api/content/[id]/approve`
- ✅ **Funcionalidade:** Marca carrossel como approved=true/false
- ✅ **Estado local:** `approvingCarousel` (loading state por índice)
- ✅ **Sincronização:** Ao aprovar, seleciona automaticamente para geração de slides
- ✅ **Linha:** 311-362 (handleApproveCarousel)

**Contexto:** Aprovação = validação manual antes de gerar slides visuais. Crucial para o fluxo.

### 3. Sistema de Edição de Carrosséis
- ✅ **API (IA):** `POST /api/content/[id]/refine-carousel` (regenera com instruções)
- ✅ **API (Manual):** `PUT /api/content/[id]/refine-carousel` (salva edições diretas)
- ✅ **Painel inline:** Edita título, slides (titulo+corpo), caption, CTA, hashtags
- ✅ **Estado local:** `editingIndex`, `editedCarousel`, `editInstructions`, `refining`, `saving`
- ✅ **Linha:** 745-812 (handleOpenEdit, handleSaveDirectEdits, handleRegenerateCarousel)

**Contexto:** Permite edição manual (PUT) ou regeneração via IA com instruções (POST). Ambos limpam slides gerados para forçar regeneração.

### 4. Seleção Granular de Slides
- ✅ **Funcionalidade:** Checkboxes para selecionar/desselecionar slides individuais de cada carrossel
- ✅ **Estado local:** `selectedSlides` (Map<carouselIndex, Set<slideIndex>>)
- ✅ **Controles:** Selecionar todos de um carrossel, selecionar todos globalmente
- ✅ **Linha:** 365-431 (handleToggleSlide, handleToggleAllSlides, handleToggleAllSlidesGlobal)

**Contexto:** Permite gerar apenas os slides desejados (ex: slide 1, 3, 5 de um carrossel de 7).

### 5. Geração de Slides Visuais (V1 e V2/V3)
- ✅ **API V1:** `POST /api/content/[id]/generate-slides` (Puppeteer + template padrão)
- ✅ **API V2:** `POST /api/content/[id]/generate-slides-v2` (Puppeteer + fal.ai)
- ✅ **API V3:** `POST /api/content/[id]/generate-slides-v3` (Remotion renderStill + fal.ai)
- ✅ **Fallback:** V3 → V2 se falhar
- ✅ **Estado local:** `generatingSlides`, `generatingSlidesV2`, `slides`, `slidesV2`
- ✅ **Linha:** 433-575 (handleGenerateSlides, handleGenerateSlidesV2)

**Contexto:** V3 (Remotion) é o padrão atual, com fallback para V2 (Puppeteer). V1 é legado.

### 6. Configuração de Imagens por Slide
- ✅ **Funcionalidade:** Escolher fonte de imagem para cada slide (auto, custom_prompt, upload)
- ✅ **API:** `POST /api/content/[id]/upload-slide-image` (upload de imagem customizada)
- ✅ **Estado local:** `slideImageOptions` (Map<carouselIndex, Map<slideIndex, config>>)
- ✅ **Linha:** 252-309 (handleUpdateSlideImageOption, handleUploadSlideImage)

**Contexto:** Permite personalizar imagens individuais (AI prompt ou upload manual).

### 7. Geração de Variações (Content Repurposing)
- ✅ **API:** `POST /api/content/[id]/generate-variations`
- ✅ **Funcionalidade:** Gera 2 carrosséis + 2 reels derivados de um carrossel aprovado
- ✅ **Estado local:** `generatingVariations`
- ✅ **Linha:** 814-841 (handleGenerateVariations)

**Contexto:** "Multiplica" conteúdo aprovado explorando novos ângulos do mesmo tema.

### 8. Geração de Reels Animados (Remotion MP4)
- ✅ **API:** `POST /api/content/[id]/generate-reel`
- ✅ **Funcionalidade:** Gera vídeo MP4 animado (4:5) dos slides aprovados
- ✅ **Estado local:** `generatingReel`, `reelVideos`, `reelError`
- ✅ **Linha:** 579-624 (handleGenerateReel)

**Contexto:** Transforma carrossel estático em vídeo animado para Reels/Stories.

### 9. Download e Exportação
- ✅ **Download ZIP (global):** `POST /api/content/[id]/export-zip` (todos os carrosséis aprovados)
- ✅ **Download ZIP (individual):** `POST /api/content/[id]/carousels/[carouselIndex]/export-zip`
- ✅ **Google Drive:** `POST /api/content/[id]/export-drive` (estrutura: @username/Carrossel-N)
- ✅ **Download JSON:** Exporta conteúdo textual completo
- ✅ **Linha:** 240-249 (JSON), 843-915 (ZIP)

**Contexto:** ZIPs baixam PNGs do Cloudinary e empacotam. Drive usa Service Account.

### 10. Exclusão de Conteúdo
- ✅ **Deletar carrossel textual:** `DELETE /api/content/[id]/carousels/[carouselIndex]`
- ✅ **Deletar slides visuais:** `DELETE /api/content/[id]/slides/[carouselIndex]`
- ✅ **Estado local:** `deletingCarousel`
- ✅ **Linha:** 918-996 (handleDeleteCarousel, handleDeleteSlideCarousel)

**Contexto:** Permite remover carrosséis reprovados ou limpar slides para regenerar.

### 11. Publicação no Instagram
- ✅ **Componente:** `<PublishInstagramButton>` (integração com Instagram Graph API)
- ✅ **Linha:** 1496-1506

**Contexto:** Publicação direta no feed do Instagram (só aparece se carrossel aprovado).

### 12. Agendamento de Geração
- ✅ **Modal:** `<ScheduleContentModal>` (agendar geração futura)
- ✅ **Lista:** `<ScheduledContentList>` (mostra agendamentos pendentes)
- ✅ **Estado local:** `showScheduleModal`, `schedulesRefreshKey`
- ✅ **Linha:** 1864-1874, 1107-1113

**Contexto:** Permite agendar geração de conteúdo para data/hora específica.

### 13. Cópia de Conteúdo (Clipboard)
- ✅ **Copiar tudo:** Carrossel completo (título, slides, caption, hashtags, CTA)
- ✅ **Copiar caption:** Só a caption
- ✅ **Copiar hashtags:** Hashtags formatadas (#tag)
- ✅ **Estado local:** `copiedIndex`, `copiedCaption`, `copiedHashtags`
- ✅ **Linha:** 202-238 (handleCopyCarousel, handleCopyCaption, handleCopyHashtags)

**Contexto:** Feedback visual temporário (2s) após cópia.

### 14. Navegação entre Carrosséis e Reels
- ✅ **Tabs:** Carrosséis (atual) / Reels
- ✅ **Link:** `/dashboard/audits/${id}/create-content/reels`
- ✅ **Linha:** 1091-1104

**Contexto:** Sistema de tabs para alternar entre tipos de conteúdo.

### 15. Navegação para Slides Gerados
- ✅ **Botão:** "Ver Slides Gerados" → `/dashboard/audits/${id}/slides`
- ✅ **Condicional:** Só aparece se slides existem
- ✅ **Linha:** 1056-1065

**Contexto:** Visualização galeria de slides finais.

---

## ❌ O QUE REMOVER (Duplicações e Lógica Antiga)

### 1. Geração Individual de Slides (Deprecated)
- ❌ **Funções:** `handleGenerateSingleSlideV1`, `handleGenerateSingleSlideV2`
- ❌ **Estado local:** `generatingSingleV1`, `generatingSingleV2`
- ❌ **Linha:** 627-743
- ❌ **Motivo:** Funcionalidade substituída por geração em lote na página de slides

### 2. Seleção de Carrosséis para Slides (Deprecated)
- ❌ **Estado local:** `selectedForSlides` (Set<number>)
- ❌ **Linha:** 63
- ❌ **Motivo:** Lógica movida para `/slides` page. Aprovação já indica intenção de gerar slides.

### 3. Controle Global de Seleção (Complexo)
- ❌ **Card:** "Seleção de Slides" com contador total
- ❌ **Linha:** 1342-1391
- ❌ **Motivo:** Melhor implementado na página dedicada de slides

### 4. Botões de Geração de Slides Inline (Deprecated)
- ❌ **Botões:** "Gerar Slides V1/V2" dentro de cada card de carrossel
- ❌ **Linha:** 1408-1438 (botões inline)
- ❌ **Motivo:** Geração movida para `/slides` page

### 5. CTA "Configurar e Gerar Slides" (Redundante)
- ❌ **Card:** Call to action com gradiente
- ❌ **Linha:** 1304-1328
- ❌ **Motivo:** Substituído por fluxo natural (aprovar → navegar para /slides)

---

## 🔄 O QUE MIGRAR (para Zustand)

### Store: `useContentCreationStore`

```typescript
interface ContentCreationState {
  // Dados centrais
  auditId: string | null
  content: ContentJSON | null // { carousels, estrategia_geral, proximos_passos }
  slides: SlidesJSON | null // V1
  slidesV2: SlidesJSON | null // V2/V3
  reelVideos: ReelVideo[] | null

  // Loading states
  generating: boolean
  generatingSlides: boolean
  generatingSlidesV2: boolean
  generatingReel: boolean
  generatingVariations: number | null // índice do carrossel gerando variações
  approvingCarousel: number | null
  deletingCarousel: number | null
  downloadingZip: boolean
  sendingToDrive: boolean

  // Errors
  error: string | null
  slidesError: string | null
  slidesV2Error: string | null
  reelError: string | null
  driveError: string | null

  // Messages
  driveMessage: string | null

  // Configurações
  customTheme: string
  usedTheme: string | null

  // Seleção de slides
  selectedSlides: Map<number, Set<number>> // carouselIndex → slideIndexes
  slideImageOptions: Map<number, Map<number, SlideImageConfig>>

  // Edição inline
  editingIndex: number | null
  editedCarousel: any | null
  editInstructions: string
  refining: boolean
  saving: boolean

  // Upload
  uploadingImage: { carouselIndex: number; slideIndex: number } | null

  // Clipboard
  copiedIndex: number | null
  copiedCaption: number | null
  copiedHashtags: number | null

  // Agendamento
  showScheduleModal: boolean
  schedulesRefreshKey: number

  // Actions
  setAuditId: (id: string) => void
  loadExistingContent: () => Promise<void>
  generateContent: (customTheme?: string) => Promise<void>
  approveCarousel: (index: number, approved: boolean) => Promise<void>
  editCarousel: (index: number, carousel: any) => void
  saveCarouselEdits: () => Promise<void>
  regenerateCarousel: (instructions: string) => Promise<void>
  closeEdit: () => void
  generateVariations: (carouselIndex: number) => Promise<void>
  deleteCarousel: (carouselIndex: number) => Promise<void>
  deleteSlides: (carouselIndex: number) => Promise<void>
  downloadZip: () => Promise<void>
  downloadCarouselZip: (carouselIndex: number, title: string) => Promise<void>
  sendToDrive: () => Promise<void>
  generateReel: () => Promise<void>
  toggleSlide: (carouselIndex: number, slideIndex: number) => void
  toggleAllSlides: (carouselIndex: number) => void
  updateSlideImageOption: (carouselIndex: number, slideIndex: number, config: SlideImageConfig) => void
  uploadSlideImage: (carouselIndex: number, slideIndex: number, file: File) => Promise<void>
  copyCarousel: (carousel: any, index: number) => void
  copyCaption: (carousel: any, index: number) => void
  copyHashtags: (carousel: any, index: number) => void
  downloadJSON: () => void
  reset: () => void
}
```

**Motivação:**
- Eliminar prop drilling
- Estado compartilhado entre páginas (Criar → Slides → Exportar)
- Facilitar debug (DevTools)
- Performance (re-renders seletivos)

---

## 📋 LISTA DE APIs USADAS

### Geração de Conteúdo
1. **POST** `/api/audits/[id]/generate-content` - Gera carrosséis via Claude
2. **POST** `/api/content/[id]/generate-variations` - Gera variações (2 carrosséis + 2 reels)
3. **POST** `/api/content/[id]/refine-carousel` - Regenera carrossel com instruções IA
4. **PUT** `/api/content/[id]/refine-carousel` - Salva edições manuais
5. **POST** `/api/content/[id]/generate-reel` - Gera vídeo MP4 animado

### Geração de Slides
6. **POST** `/api/content/[id]/generate-slides` - V1 (Puppeteer padrão)
7. **POST** `/api/content/[id]/generate-slides-v2` - V2 (Puppeteer + fal.ai)
8. **POST** `/api/content/[id]/generate-slides-v3` - V3 (Remotion + fal.ai) **[ATUAL]**

### Aprovação
9. **PUT** `/api/content/[id]/approve` - Aprova/rejeita carrossel
10. **POST** `/api/content/[id]/approve` - Aprova múltiplos carrosséis

### Upload e Assets
11. **POST** `/api/content/[id]/upload-slide-image` - Upload de imagem customizada

### Exportação
12. **POST** `/api/content/[id]/export-zip` - ZIP global (todos os carrosséis)
13. **POST** `/api/content/[id]/carousels/[carouselIndex]/export-zip` - ZIP individual
14. **POST** `/api/content/[id]/export-drive` - Envia para Google Drive

### Exclusão
15. **DELETE** `/api/content/[id]/carousels/[carouselIndex]` - Deleta carrossel textual
16. **DELETE** `/api/content/[id]/slides/[carouselIndex]` - Deleta slides visuais (Cloudinary)

### Leitura
17. **GET** `/api/audits/[id]/content` - Busca conteúdo existente (useEffect linha 90)
18. **GET** `/api/audits/[id]` - Hook useAudit (busca auditoria completa)

### Publicação
19. **POST** `/api/content/[id]/publish-instagram` - Publica no Instagram (via componente)

---

## 🎯 PONTOS DE ATENÇÃO

### 1. Parâmetro [id] nas APIs ⚠️
**CRÍTICO:** O parâmetro `[id]` nas rotas `/api/content/[id]/*` é o **audit_id**, NÃO o `content_suggestions.id`.

**Exemplo:**
```typescript
// ✅ Correto
fetch(`/api/content/${auditId}/approve`, { ... })

// ❌ ERRADO
fetch(`/api/content/${contentSuggestionId}/approve`, { ... })
```

**Linha de referência:** 94, 135, 315, 467, 542, 597, 647

### 2. Limpeza de Slides ao Editar ⚠️
Quando um carrossel é editado (manual ou IA), os **slides gerados são deletados** para forçar regeneração.

**APIs afetadas:**
- `PUT /api/content/[id]/refine-carousel` (linha 196-203)
- `POST /api/content/[id]/refine-carousel` (linha 119-126)

**Razão:** Slides visuais não se atualizam automaticamente ao editar texto.

### 3. Sincronização Aprovação → Seleção ⚠️
Ao aprovar um carrossel:
1. `approved = true` salvo no JSON
2. Carrossel adicionado automaticamente em `selectedForSlides`
3. Todos os slides do carrossel marcados como selecionados

**Linha:** 335-353 (handleApproveCarousel)

**Impacto:** Ao desaprovar, remove seleção.

### 4. Fallback V3 → V2 ⚠️
A geração de slides tenta V3 primeiro, com fallback automático para V2 se falhar.

**Linha:** 541-575 (handleGenerateSlidesV2)

**Logs:**
```javascript
console.log('🎨 Tentando gerar slides via V3 (Remotion)...')
console.warn('⚠️ V3 falhou, usando fallback V2 (Puppeteer)...')
```

### 5. Estado de Upload Global vs Local ⚠️
`uploadingImage` é um objeto `{ carouselIndex, slideIndex }`, não um Map.

**Linha:** 74-75

**Uso:**
```typescript
uploadingImage?.carouselIndex === idx && uploadingImage?.slideIndex === si
```

### 6. Timeout de Cópia (2s) ⚠️
Estados de clipboard (copiedIndex, copiedCaption, copiedHashtags) são resetados após 2 segundos.

**Linha:** 223, 230, 237

**Implementação:**
```typescript
setCopiedIndex(index)
setTimeout(() => setCopiedIndex(null), 2000)
```

### 7. Sanitização Unicode ⚠️
Dados de scraping podem conter surrogates Unicode inválidos que causam erro 400 na Anthropic API.

**Função:** `sanitizeString` e `sanitizeDeep` (linha 10-25 em generate-content/route.ts)

**Aplicado:** Antes de enviar auditData para Claude (linha 336)

### 8. slugify Consistente ⚠️
Função `slugify` deve ser idêntica no frontend e backend para manter estrutura de pastas.

**Linha:** 998-1007 (page.tsx)

**Backends:** export-zip/route.ts (linha 116), export-drive/route.ts (linha 153)

### 9. Estrutura de Variações ⚠️
Variações geradas têm metadados especiais:

**Campos:**
- `is_variation: true`
- `variation_source: { type: "carousel"|"reel", title: string }`

**Linha:** 1532-1539 (Badge de variação)

### 10. Modal de Agendamento com Refresh Key ⚠️
`schedulesRefreshKey` é incrementado ao criar novo agendamento para forçar re-render da lista.

**Linha:** 86, 1109, 1871

**Pattern:**
```typescript
onSuccess={() => setSchedulesRefreshKey(prev => prev + 1)}
```

---

## 🏗️ ARQUITETURA PROPOSTA (Nova Estrutura)

```
app/dashboard/audits/[id]/create-content/
├── page.tsx              # Fase 1: Criar (geração de conteúdo textual)
├── slides/
│   └── page.tsx          # Fase 2: Refinar (configurar e gerar slides visuais)
└── export/
    └── page.tsx          # Fase 3: Exportar (download, Drive, Instagram)
```

### Fase 1: Criar (`page.tsx`)
**Responsabilidades:**
- Gerar carrosséis via Claude
- Aprovar/rejeitar carrosséis
- Editar carrosséis (inline)
- Gerar variações
- Deletar carrosséis rejeitados
- Navegação para `/slides`

**Removido:**
- Geração de slides (movido para Fase 2)
- Configuração de imagens (movido para Fase 2)
- Exportação (movido para Fase 3)

### Fase 2: Refinar (`slides/page.tsx`)
**Responsabilidades:**
- Listar carrosséis aprovados
- Seleção granular de slides
- Configuração de imagens por slide (auto/custom/upload)
- Geração de slides V3/V2 (batch)
- Preview de slides gerados
- Navegação para `/export` ou voltar para `/create-content`

**Novo:**
- Interface dedicada para configurar imagens
- Preview antes de gerar
- Regeneração individual de carrosséis

### Fase 3: Exportar (`export/page.tsx`)
**Responsabilidades:**
- Visualizar galeria de slides finais
- Download ZIP (global ou individual)
- Enviar para Google Drive
- Publicar no Instagram
- Gerar Reel animado (MP4)
- Agendamento de publicação

**Novo:**
- Interface dedicada para ações de distribuição
- Status de publicação
- Histórico de exportações

---

## 📊 MÉTRICAS DE COMPLEXIDADE

| Métrica | Antes (Atual) | Depois (Refatorado) |
|---------|---------------|---------------------|
| **Linhas por arquivo** | 1.878 | ~600 / ~400 / ~300 |
| **Estados locais (useState)** | 86 | ~30 / ~20 / ~15 |
| **Funções de handler** | 40+ | ~15 / ~10 / ~8 |
| **APIs chamadas** | 19 | ~8 / ~5 / ~6 |
| **Componentes filhos** | 15+ | ~8 / ~6 / ~5 |

**Redução de complexidade:** ~60% por página

---

## 🔄 FLUXO DE MIGRAÇÃO PROPOSTO

### Sprint 1: Arquitetura Base
1. ✅ Criar Zustand store (`useContentCreationStore`)
2. ✅ Criar componentes compartilhados (CarouselCard, SlideSelector, etc.)
3. ✅ Criar páginas `/slides` e `/export` (estrutura básica)

### Sprint 2: Migrar Fase 1 (Criar)
1. Migrar lógica de geração de conteúdo
2. Migrar aprovação de carrosséis
3. Migrar edição inline
4. Migrar variações
5. Remover código deprecated

### Sprint 3: Implementar Fase 2 (Refinar)
1. Implementar seleção granular de slides
2. Implementar configuração de imagens
3. Implementar geração de slides V3/V2
4. Implementar preview

### Sprint 4: Implementar Fase 3 (Exportar)
1. Implementar download ZIP
2. Implementar Google Drive
3. Implementar publicação Instagram
4. Implementar geração de Reels

### Sprint 5: Testes e Polish
1. Testes E2E do fluxo completo
2. Ajustes de UX/UI
3. Performance optimization
4. Documentação

---

## 🚨 RISCOS E MITIGAÇÕES

### Risco 1: Perda de Estado ao Navegar Entre Páginas
**Impacto:** Alto
**Probabilidade:** Média
**Mitigação:** Zustand persiste estado automaticamente. Implementar hydration do store ao carregar cada página.

### Risco 2: Incompatibilidade de Contratos de API
**Impacto:** Alto
**Probabilidade:** Baixa
**Mitigação:** APIs já existem e foram documentadas. Não alterar contratos durante refatoração.

### Risco 3: Funcionalidades Esquecidas
**Impacto:** Médio
**Probabilidade:** Média
**Mitigação:** Este documento lista TODAS as funcionalidades. Usar como checklist.

### Risco 4: Performance Degradation
**Impacto:** Médio
**Probabilidade:** Baixa
**Mitigação:** Zustand é mais performático que useState. Implementar React.memo seletivamente.

### Risco 5: Complexidade do Zustand Store
**Impacto:** Baixo
**Probabilidade:** Média
**Mitigação:** Dividir store em slices se necessário (createSlice pattern).

---

## ✅ CHECKLIST DE VALIDAÇÃO PÓS-REFATORAÇÃO

### Funcionalidades Core
- [ ] Gerar carrosséis com tema personalizado
- [ ] Aprovar/rejeitar carrosséis
- [ ] Editar carrossel (manual e IA)
- [ ] Gerar variações
- [ ] Deletar carrosséis e slides
- [ ] Copiar conteúdo (clipboard)

### Geração de Slides
- [ ] Selecionar slides individuais
- [ ] Configurar imagens (auto/custom/upload)
- [ ] Gerar slides V3 (fallback V2)
- [ ] Preview de slides

### Exportação
- [ ] Download ZIP global
- [ ] Download ZIP individual
- [ ] Enviar para Google Drive
- [ ] Publicar no Instagram
- [ ] Gerar Reel animado

### Agendamento
- [ ] Abrir modal de agendamento
- [ ] Listar agendamentos pendentes
- [ ] Refresh automático

### UX/UI
- [ ] Loading states visuais
- [ ] Mensagens de erro claras
- [ ] Feedback de sucesso (toasts)
- [ ] Navegação entre fases fluida
- [ ] Responsividade mobile

### Performance
- [ ] Tempo de carregamento < 2s
- [ ] Re-renders otimizados
- [ ] Sem memory leaks
- [ ] Batch API calls quando possível

---

## 📚 REFERÊNCIAS TÉCNICAS

### Hooks Customizados
- `useAudit(id)` → `/hooks/use-audit.ts` (SWR wrapper para `/api/audits/[id]`)

### Componentes Reutilizáveis
- `<PublishInstagramButton>` → `/components/molecules/publish-instagram-button.tsx`
- `<ScheduleContentModal>` → `/components/molecules/schedule-content-modal.tsx`
- `<ScheduledContentList>` → `/components/molecules/scheduled-content-list.tsx`
- `<SafeScheduledListWrapper>` → `/components/molecules/safe-scheduled-list-wrapper.tsx`

### Bibliotecas Externas
- `lucide-react` → Ícones
- `next/navigation` → Router (useParams, useRouter)
- `swr` → Data fetching (useAudit)
- `jszip` → Geração de ZIPs
- `googleapis` → Google Drive

### Environment Variables
```env
ANTHROPIC_API_KEY         # Claude API
CLOUDINARY_*              # Upload e CDN de imagens
GOOGLE_DRIVE_*            # Service Account para Drive
SUPABASE_*                # Database
```

---

## 🎯 CONCLUSÃO

A página atual é **funcional mas insustentável**. Com 1.878 linhas e 86 estados, qualquer mudança gera risco de regressão.

**Benefícios da refatoração:**
1. **Manutenibilidade:** 3 páginas de ~500 linhas vs 1 página de 1.878
2. **Testabilidade:** Store isolado facilita testes unitários
3. **Escalabilidade:** Adicionar features sem tocar em código existente
4. **UX:** Fluxo guiado (Criar → Refinar → Exportar) é mais intuitivo
5. **Performance:** Zustand + code splitting = menos re-renders

**Próximos passos:**
1. Aprovar arquitetura proposta
2. Criar Zustand store
3. Implementar páginas Fase 1, 2, 3 sequencialmente
4. Testar e validar com checklist

---

**Documento criado por:** Claude Sonnet 4.5 (Analyzer)
**Data:** 2026-02-24
**Aprovação pendente:** Team Lead
