# Relatório de Revisão - Zustand Store Expandido

**Arquivo revisado:** `store/content-creation-expanded.ts.draft`
**Data da revisão:** 2026-02-24
**Revisor:** @analyzer
**Especificação base:** `/docs/refactoring-analysis.md` (linhas 96-168)

---

## 📊 SUMÁRIO EXECUTIVO

**Status geral:** ✅ **APROVADO COM RECOMENDAÇÕES**

O store expandido implementa **todas as funcionalidades críticas** da especificação com arquitetura sólida. Encontrei **6 problemas menores** e **8 sugestões de melhoria** que devem ser ajustadas antes da integração.

**Métricas:**
- ✅ 52 estados implementados (vs 30+ esperados) - **COMPLETO**
- ✅ 43 actions implementadas (vs 20+ esperados) - **COMPLETO**
- ✅ DevTools e Persist configurados
- ✅ Selectors otimizados
- ⚠️ 6 problemas de endpoints/lógica
- 💡 8 sugestões de melhoria

---

## ✅ O QUE ESTÁ PERFEITO

### 1. Arquitetura de Fases ⭐
```typescript
currentPhase: 1 | 2 | 3
goToPhase: (phase) => void
nextPhase: () => void
previousPhase: () => void
```
✅ Navegação entre fases bem implementada

### 2. Computed Values com Getters ⭐
```typescript
get computed() {
  const state = get()
  return {
    hasContent: !!state.content,
    approvedCount: state.approvedCarousels.size,
    // ...
  }
}
```
✅ Pattern correto com `get()` para valores derivados

### 3. Tipagem TypeScript ⭐
```typescript
interface ContentCreationState {
  currentPhase: 1 | 2 | 3  // Union types corretos
  slideImageConfigs: Map<number, Map<number, SlideImageConfig>>  // Maps tipados
  approvedCarousels: Set<number>  // Sets tipados
  // ...
}
```
✅ Tipos precisos, Maps e Sets corretamente tipados

### 4. Sincronização Aprovação → Seleção ⭐
```typescript
approveCarousel: async (auditId, index) => {
  // ...
  const newSelectedForSlides = new Set(state.selectedForSlides)
  newSelectedForSlides.add(index)  // ✅ Auto-seleciona

  const newSelectedSlides = new Map(state.selectedSlides)
  newSelectedSlides.set(
    index,
    new Set(carousel.slides.map((_: any, i: number) => i))
  )  // ✅ Seleciona todos os slides
  // ...
}
```
✅ Comportamento esperado conforme especificação (linha 335-353 do page.tsx)

### 5. Clipboard com Timeout ⭐
```typescript
copyCarousel: (carouselIndex) => {
  // ...
  set({ copiedIndex: carouselIndex })
  setTimeout(() => set({ copiedIndex: null }), 2000)  // ✅ 2s timeout
}
```
✅ Timeout de 2 segundos conforme especificação

### 6. Persist Seletivo ⭐
```typescript
persist(
  (set, get) => ({ ... }),
  {
    name: 'content-creation-storage',
    partialize: (state) => ({
      currentPhase: state.currentPhase,
      selectedTemplate: state.selectedTemplate,
      // Não persiste loadings/errors ✅
    }),
  }
)
```
✅ Só persiste estados essenciais (não loadings/errors)

### 7. DevTools Habilitado ⭐
```typescript
devtools(
  persist(...),
  { name: 'ContentCreationStore' }
)
```
✅ Facilita debug

### 8. Selectors Otimizados ⭐
```typescript
export const useCurrentPhase = () => useContentCreation((state) => state.currentPhase)
export const useApprovedCarousels = () => {
  const carousels = useCarousels()
  const approvedSet = useContentCreation((state) => state.approvedCarousels)
  return carousels.filter((_, index) => approvedSet.has(index))
}
```
✅ Selectors reutilizáveis reduzem re-renders

---

## 🚨 PROBLEMAS CRÍTICOS (6)

### 1. ❌ Endpoints de API Incorretos

**Linha 598:** `refineCarousel`
```typescript
const response = await fetch(`/api/content/${auditId}/refine`, {  // ❌ ERRADO
```

**Correto:**
```typescript
const response = await fetch(`/api/content/${auditId}/refine-carousel`, {  // ✅
```

**Impacto:** Chamada de API vai falhar (404)

---

**Linha 631:** `saveEditedCarousel`
```typescript
const response = await fetch(`/api/content/${auditId}/update-carousel`, {  // ❌ ERRADO
```

**Correto:**
```typescript
const response = await fetch(`/api/content/${auditId}/refine-carousel`, {  // ✅
  method: 'PUT',  // ✅ PUT para salvar edições diretas
```

**Impacto:** Chamada de API vai falhar (404)
**Referência:** `/docs/refactoring-analysis.md` linha 159-165

---

**Linha 671:** `deleteCarousel`
```typescript
const response = await fetch(`/api/content/${auditId}/delete-carousel`, {  // ❌ ERRADO
```

**Correto:**
```typescript
const response = await fetch(`/api/content/${auditId}/carousels/${carouselIndex}`, {  // ✅
  method: 'DELETE',
```

**Impacto:** Chamada de API vai falhar (404)
**Referência:** `/docs/refactoring-analysis.md` linha 321 (API DELETE)

---

**Linha 707:** `generateVariations`
```typescript
const response = await fetch(`/api/content/${auditId}/variations`, {  // ❌ ERRADO
```

**Correto:**
```typescript
const response = await fetch(`/api/content/${auditId}/generate-variations`, {  // ✅
```

**Impacto:** Chamada de API vai falhar (404)
**Referência:** `/docs/refactoring-analysis.md` linha 325

---

**Linha 855:** `generateReels`
```typescript
const response = await fetch(`/api/content/${auditId}/generate-reels`, {  // ❌ ERRADO
```

**Correto:**
```typescript
const response = await fetch(`/api/content/${auditId}/generate-reel`, {  // ✅
```

**Impacto:** Chamada de API vai falhar (404)
**Referência:** `/docs/refactoring-analysis.md` linha 329

---

### 2. ❌ Lógica de Geração de Slides Incorreta

**Linha 741-744:** `generateSlidesV1`
```typescript
const response = await fetch(`/api/content/${auditId}/generate-slides`, {
  method: 'POST',
  body: JSON.stringify({ version: 'v1', carouselIndices }),  // ❌ ERRADO
})
```

**Problema:** API `/api/content/[id]/generate-slides` NÃO aceita parâmetro `version`.

**Correto (conforme página atual linha 467-474):**
```typescript
// Preparar carousels com filtros (approved=true/false)
const carouselsToGenerate = content.carousels.map((c: any, i: number) => {
  if (!selectedForSlides.has(i)) return { ...c, approved: false }
  const slideSel = selectedSlides.get(i)
  const filteredSlides = slideSel
    ? c.slides.filter((_: any, si: number) => slideSel.has(si))
    : c.slides
  return { ...c, approved: true, slides: filteredSlides }
})

const response = await fetch(`/api/content/${auditId}/generate-slides`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    carousels: carouselsToGenerate,
    profile: audit.profile  // ⚠️ Precisa do profile
  })
})
```

**Impacto:** Geração de slides vai falhar. API espera `carousels` array completo + `profile`.

**Mesma correção para:**
- `generateSlidesV2` (linha 798)
- `generateSingleSlideV1` (linha 768)
- `generateSingleSlideV2` (linha 825)

---

## ⚠️ PROBLEMAS MENORES (Não Bloqueadores)

### 1. ⚠️ Falta `approvingCarousel` State

**Especificação (linha 113):**
```typescript
approvingCarousel: number | null
```

**Atual:** Não existe no store.

**Problema:** Página atual usa `approvingCarousel` para loading state durante aprovação (linha 34, 311).

**Solução:** Adicionar ao store:
```typescript
approvingCarousel: number | null

// Em approveCarousel:
set({ approvingCarousel: index })
// ...finally
set({ approvingCarousel: null })
```

---

### 2. ⚠️ Falta Validação de Slides Selecionados

**Linha 737:** `generateSlidesV1`

**Problema:** Não valida se há slides selecionados antes de gerar.

**Página atual (linha 444-451):**
```typescript
// Validar se há pelo menos 1 slide selecionado em cada carrossel aprovado
for (const carouselIndex of selectedForSlides) {
  const slideSel = selectedSlides.get(carouselIndex)
  if (!slideSel || slideSel.size === 0) {
    setSlidesError(`Selecione pelo menos 1 slide no Carrossel ${carouselIndex + 1}`)
    return
  }
}
```

**Solução:** Adicionar validação antes de chamar API.

---

### 3. ⚠️ Falta Fallback V3 → V2

**Especificação (linha 491-575):** Página atual tenta V3 (Remotion) primeiro, com fallback para V2 (Puppeteer) se falhar.

**Store atual:** Só implementa V1 e V2, sem mencionar V3.

**Problema:** V3 é o padrão atual do sistema.

**Solução:** Renomear `generateSlidesV2` → `generateSlidesV3` e implementar fallback:
```typescript
generateSlidesV3: async (auditId, carouselIndices) => {
  set({ generatingSlidesV2: true, slidesV2Error: null })

  try {
    // Tentar V3 (Remotion)
    console.log('🎨 Tentando gerar slides via V3 (Remotion)...')
    const v3Response = await fetch(`/api/content/${auditId}/generate-slides-v3`, {
      method: 'POST',
      body: JSON.stringify({ ... }),
    })

    if (v3Response.ok) {
      const data = await v3Response.json()
      set({ slidesV2: data })
      return
    }

    // Fallback V2 (Puppeteer)
    console.warn('⚠️ V3 falhou, usando fallback V2 (Puppeteer)...')
    const v2Response = await fetch(`/api/content/${auditId}/generate-slides-v2`, {
      method: 'POST',
      body: JSON.stringify({ ... }),
    })

    if (!v2Response.ok) throw new Error('Erro ao gerar slides')
    const data = await v2Response.json()
    set({ slidesV2: data })
  } catch (error: any) {
    set({ slidesV2Error: error.message })
  } finally {
    set({ generatingSlidesV2: false })
  }
}
```

---

### 4. ⚠️ Body Ausente em `refineCarousel`

**Linha 600:** `refineCarousel`
```typescript
body: JSON.stringify({ carouselIndex, instructions }),  // ❌ Falta carousel
```

**Correto (conforme API linha 19):**
```typescript
body: JSON.stringify({
  carouselIndex,
  carousel: state.carousels[carouselIndex],  // ✅ Precisa do carousel atual
  instructions
}),
```

**Impacto:** API vai rejeitar (400 - carousel obrigatório).

---

### 5. ⚠️ Resposta de `refineCarousel` Incorreta

**Linha 612:**
```typescript
set({ editedCarousel: data.refinedCarousel })  // ❌ Campo errado
```

**Correto (conforme API linha 143-146):**
```typescript
set({ editedCarousel: data.carousel })  // ✅ Campo correto
```

---

### 6. ⚠️ Atualização de `carousels` após `generateVariations`

**Linha 721:**
```typescript
set((state) => ({
  carousels: [...state.carousels, ...data.variations],  // ❌ Campo errado
}))
```

**Correto (conforme API linha 271-274):**
```typescript
set((state) => ({
  carousels: [...state.carousels, ...data.new_carousels],  // ✅ Campo correto
}))
```

**API retorna:** `new_carousels` e `new_reels`, não `variations`.

---

## 💡 SUGESTÕES DE MELHORIA (8)

### 1. 💡 Adicionar `auditId` ao Estado

**Motivação:** Muitas actions recebem `auditId` como parâmetro. Melhor armazená-lo no store.

**Sugestão:**
```typescript
interface ContentCreationState {
  auditId: string | null  // ✅ Adicionar
  // ...
}

// Setter
setAuditId: (id: string) => set({ auditId: id })

// Nas actions:
approveCarousel: async (index: number) => {  // ✅ Não precisa mais do auditId
  const { auditId } = get()
  if (!auditId) throw new Error('auditId não definido')
  // ...
}
```

**Benefício:** Menos prop drilling, código mais limpo.

---

### 2. 💡 Adicionar Error Boundary nos Handlers

**Motivação:** Errors não estão sendo tratados consistentemente.

**Sugestão:** Criar helper para wrapping:
```typescript
const withErrorHandling = async (
  action: () => Promise<void>,
  errorSetter: (error: string) => void
) => {
  try {
    await action()
  } catch (error: any) {
    console.error('Erro:', error)
    errorSetter(error.message || 'Erro desconhecido')
  }
}
```

---

### 3. 💡 Adicionar `audit` e `profile` ao Estado

**Motivação:** APIs de geração de slides precisam de `profile`. Melhor carregar uma vez.

**Sugestão:**
```typescript
interface ContentCreationState {
  audit: any | null
  profile: any | null
  // ...
}

loadExistingContent: async (auditId: string) => {
  // ...
  // Buscar audit completo
  const auditResponse = await fetch(`/api/audits/${auditId}`)
  const auditData = await auditResponse.json()

  set({
    audit: auditData.audit,
    profile: auditData.audit.profile,
    // ...
  })
}
```

---

### 4. 💡 Separar Errors por Contexto

**Atual:**
```typescript
error: string | null  // ❌ Genérico demais
```

**Sugestão:**
```typescript
generateError: string | null
approveError: string | null
editError: string | null
exportError: string | null
```

**Benefício:** Errors não sobrescrevem uns aos outros.

---

### 5. 💡 Adicionar `toggleAllSlidesGlobal`

**Especificação (linha 404-431):** Página atual tem botão "Selecionar Todos" global.

**Sugestão:**
```typescript
toggleAllSlidesGlobal: () =>
  set((state) => {
    const allSelected = state.carousels.every((carousel, index) => {
      if (!carousel.approved) return true
      const slideSel = state.selectedSlides.get(index)
      return slideSel && slideSel.size === carousel.slides.length
    })

    const newSelectedSlides = new Map(state.selectedSlides)

    state.carousels.forEach((carousel, index) => {
      if (!carousel.approved) return

      if (allSelected) {
        newSelectedSlides.set(index, new Set())  // Desselecionar
      } else {
        newSelectedSlides.set(index, new Set(carousel.slides.map((_, i) => i)))  // Selecionar
      }
    })

    return { selectedSlides: newSelectedSlides }
  })
```

---

### 6. 💡 Adicionar `deleteSlides` (Slides Visuais)

**Especificação (linha 955-996):** Página atual permite deletar slides VISUAIS (Cloudinary) sem deletar carrossel textual.

**API:** `DELETE /api/content/[id]/slides/[carouselIndex]`

**Sugestão:**
```typescript
deleteSlides: async (auditId: string, carouselIndex: number) => {
  set({ deletingCarousel: carouselIndex })

  try {
    const response = await fetch(`/api/content/${auditId}/slides/${carouselIndex}`, {
      method: 'DELETE',
    })

    if (!response.ok) throw new Error('Erro ao deletar slides')

    // Atualizar estado removendo slides
    set((state) => {
      const newSlides = { ...state.slides }
      newSlides.carousels = newSlides.carousels?.filter(
        (c: any) => c.carouselIndex !== carouselIndex
      )
      return { slides: newSlides }
    })
  } catch (error: any) {
    set({ error: error.message })
  } finally {
    set({ deletingCarousel: null })
  }
}
```

---

### 7. 💡 Adicionar Computed `hasSlides` e `hasReels`

**Sugestão:**
```typescript
get computed() {
  const state = get()
  return {
    // ...
    hasSlides: !!(state.slides || state.slidesV2),
    hasReels: !!(state.reelVideos && state.reelVideos.length > 0),
  }
}
```

**Benefício:** Simplifica condições na UI.

---

### 8. 💡 Adicionar Jsdoc nos Métodos Críticos

**Sugestão:**
```typescript
/**
 * Aprova um carrossel e auto-seleciona todos os seus slides para geração.
 * Sincroniza com o backend via PUT /api/content/[id]/approve.
 * @param auditId - ID da auditoria (usado como [id] na API)
 * @param index - Índice do carrossel no array
 */
approveCarousel: async (auditId: string, index: number) => {
  // ...
}
```

**Benefício:** Facilita manutenção futura.

---

## 📋 CHECKLIST DE VALIDAÇÃO

### Estados Críticos
- [x] ✅ currentPhase (1 | 2 | 3)
- [x] ✅ content (JSON completo)
- [x] ✅ carousels (array)
- [x] ✅ slides / slidesV2 (V1 e V2)
- [x] ✅ reelVideos
- [ ] ⚠️ approvingCarousel (falta)
- [x] ✅ generating, generatingSlides, generatingSlidesV2, generatingReel
- [x] ✅ error, slidesError, slidesV2Error, reelError, driveError
- [x] ✅ selectedSlides (Map<number, Set<number>>)
- [x] ✅ slideImageConfigs (Map<number, Map<number, SlideImageConfig>>)
- [x] ✅ editingIndex, editedCarousel, editInstructions
- [x] ✅ copiedIndex, copiedCaption, copiedHashtags (timeout 2s)
- [x] ✅ downloadingZip, downloadingCarouselZip, sendingToDrive
- [x] ✅ showScheduleModal, schedulesRefreshKey

### Actions - Fase 1 (Criar)
- [x] ✅ generateContent
- [x] ✅ loadExistingContent
- [x] ✅ setCustomTheme

### Actions - Fase 2 (Refinar)
- [x] ✅ approveCarousel (mas falta approvingCarousel state)
- [x] ✅ rejectCarousel
- [ ] ❌ refineCarousel (endpoint errado)
- [ ] ❌ saveEditedCarousel (endpoint errado)
- [ ] ❌ deleteCarousel (endpoint errado)
- [ ] ❌ generateVariations (endpoint errado)
- [x] ✅ toggleSlide
- [x] ✅ toggleAllSlides
- [ ] 💡 toggleAllSlidesGlobal (sugestão)
- [x] ✅ updateSlideImageConfig
- [x] ✅ uploadSlideImage

### Actions - Fase 3 (Exportar)
- [ ] ⚠️ generateSlidesV1 (lógica incorreta)
- [ ] ⚠️ generateSlidesV2 (lógica incorreta, falta fallback V3)
- [ ] ❌ generateReels (endpoint errado)
- [x] ✅ copyCarousel (com timeout correto)
- [x] ✅ copyCaption (com timeout correto)
- [x] ✅ copyHashtags (com timeout correto)
- [x] ✅ downloadJSON
- [x] ✅ downloadAllZip
- [x] ✅ downloadCarouselZip
- [x] ✅ exportToDrive
- [ ] 💡 deleteSlides (sugestão)

### DevTools & Persist
- [x] ✅ DevTools habilitado
- [x] ✅ Persist configurado
- [x] ✅ Partialize seletivo (não persiste loadings/errors)

### Selectors
- [x] ✅ useCurrentPhase
- [x] ✅ useCarousels
- [x] ✅ useCurrentCarousel
- [x] ✅ useApprovedCarousels
- [x] ✅ useIsCarouselApproved
- [x] ✅ useComputedValues

### TypeScript
- [x] ✅ Strict mode compatível
- [x] ✅ Maps e Sets tipados
- [x] ✅ Union types corretos (1 | 2 | 3)
- [x] ✅ Nullability apropriada

---

## 🎯 AÇÕES RECOMENDADAS (Prioridade)

### 🚨 CRÍTICO (Bloqueia integração)

1. **Corrigir 5 endpoints de API**
   - `refineCarousel`: `/api/content/${auditId}/refine` → `/api/content/${auditId}/refine-carousel`
   - `saveEditedCarousel`: `/api/content/${auditId}/update-carousel` → `/api/content/${auditId}/refine-carousel` (PUT)
   - `deleteCarousel`: `/api/content/${auditId}/delete-carousel` → `/api/content/${auditId}/carousels/${carouselIndex}` (DELETE)
   - `generateVariations`: `/api/content/${auditId}/variations` → `/api/content/${auditId}/generate-variations`
   - `generateReels`: `/api/content/${auditId}/generate-reels` → `/api/content/${auditId}/generate-reel`

2. **Corrigir lógica de geração de slides**
   - Remover parâmetro `version: 'v1' / 'v2'`
   - Enviar array `carousels` completo com `approved: true/false`
   - Adicionar `profile: audit.profile` ao body
   - Implementar fallback V3 → V2

3. **Adicionar `approvingCarousel` state**
   - Estado: `approvingCarousel: number | null`
   - Setar antes de chamar API
   - Limpar no finally

### ⚠️ IMPORTANTE (Corrigir antes do deploy)

4. **Corrigir body de `refineCarousel`**
   - Adicionar `carousel: state.carousels[carouselIndex]` ao body

5. **Corrigir campo de resposta**
   - `data.refinedCarousel` → `data.carousel`
   - `data.variations` → `data.new_carousels`

6. **Adicionar validações**
   - Validar slides selecionados antes de gerar
   - Validar `auditId` não-nulo nas actions

### 💡 DESEJÁVEL (Melhoria de qualidade)

7. **Armazenar `auditId` no store**
8. **Separar errors por contexto**
9. **Adicionar `toggleAllSlidesGlobal`**
10. **Adicionar `deleteSlides` action**
11. **Adicionar computed `hasSlides` e `hasReels`**
12. **Adicionar JSDoc nos métodos**

---

## 📊 SCORE FINAL

| Categoria | Score | Observação |
|-----------|-------|------------|
| **Completude** | 9/10 | Todas as funcionalidades, mas falta `approvingCarousel` |
| **Tipagem** | 10/10 | Excelente uso de TypeScript |
| **Arquitetura** | 10/10 | Fases, computed values, selectors perfeitos |
| **APIs** | 5/10 | 5 endpoints errados, lógica de slides incorreta |
| **Error Handling** | 7/10 | Básico, pode melhorar |
| **Performance** | 9/10 | Selectors otimizados, persist seletivo |

**SCORE GERAL: 8.3/10** 🟡

---

## ✅ APROVAÇÃO CONDICIONAL

**Status:** ✅ **APROVADO PARA INTEGRAÇÃO** após correções críticas.

**Condições:**
1. Corrigir os **5 endpoints de API** (CRÍTICO)
2. Corrigir **lógica de geração de slides** (CRÍTICO)
3. Adicionar **`approvingCarousel` state** (CRÍTICO)
4. Corrigir **body e respostas de APIs** (IMPORTANTE)

**Após correções:**
- Store estará **100% alinhado** com a especificação
- Pronto para **integração em Fase 1, 2 e 3**
- DevTools e Persist funcionando

**Próximo passo:** @dev-zustand implementa correções → @analyzer valida novamente → @dev-migration pode iniciar Task #10.

---

**Revisado por:** @analyzer
**Data:** 2026-02-24
**Aprovação:** ✅ Condicional (após correções)
