# Revisão Final Urgente - Estados de Deleção

**Data:** 2026-02-24
**Revisor:** @analyzer
**Contexto:** Validação de estados de deleção adicionados por @dev-migration (Task #24)
**Arquivo:** `store/content-creation-expanded.ts.draft`

---

## 🚨 SUMÁRIO EXECUTIVO - CRÍTICO

**Status:** ❌ **INCOMPLETO - FALTA deleteSlides**

| Requisito | Status | Presente no Store |
|-----------|--------|-------------------|
| 1. `deletingCarousel` state | ✅ PRESENTE | Linha 60, 233, 668, 699 |
| 2. `deletingSlides` state | ❌ **FALTANDO** | Não encontrado |
| 3. `deleteCarousel()` action | ✅ PRESENTE | Linha 167, 667-701 |
| 4. `deleteSlides()` action | ❌ **FALTANDO** | Não encontrado |

**Score:** 2/4 (50%)

---

## ✅ REQUISITOS IMPLEMENTADOS (2/4)

### 1. ✅ Estado `deletingCarousel`

**Linha 60 (interface):**
```typescript
deletingCarousel: number | null
```

**Linha 233 (initialState):**
```typescript
deletingCarousel: null,
```

**Uso nas actions:**
- Linha 668: `set({ deletingCarousel: carouselIndex })`
- Linha 699: `set({ deletingCarousel: null })`

✅ **COMPLETO E CORRETO**

---

### 2. ✅ Action `deleteCarousel()`

**Linha 167 (interface):**
```typescript
deleteCarousel: (auditId: string, carouselIndex: number) => Promise<void>
```

**Linha 667-701 (implementação):**
```typescript
deleteCarousel: async (auditId, carouselIndex) => {
  set({ deletingCarousel: carouselIndex })

  try {
    const response = await fetch(`/api/content/${auditId}/delete-carousel`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ carouselIndex }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Erro ao deletar')
    }

    // Remover do estado
    set((state) => {
      const newCarousels = state.carousels.filter((_, i) => i !== carouselIndex)
      const newApproved = new Set(state.approvedCarousels)
      newApproved.delete(carouselIndex)

      return {
        carousels: newCarousels,
        approvedCarousels: newApproved,
      }
    })

    console.log('✅ Carrossel deletado')
  } catch (error: any) {
    console.error('Erro ao deletar:', error)
    set({ error: error.message })
  } finally {
    set({ deletingCarousel: null })
  }
}
```

### ⚠️ PROBLEMA CRÍTICO NO ENDPOINT

**Linha 671:**
```typescript
const response = await fetch(`/api/content/${auditId}/delete-carousel`, {  // ❌ ENDPOINT ERRADO
```

**Correto (conforme /docs/store-review-report.md linha 292):**
```typescript
const response = await fetch(`/api/content/${auditId}/carousels/${carouselIndex}`, {  // ✅
  method: 'DELETE',
})
```

**Impacto:** API vai retornar 404.

**Referência:** `/docs/refactoring-analysis.md` linha 321

### ⚠️ PROBLEMA DE REINDEXAÇÃO

**Problema:** Após deletar um carrossel, os índices dos carrosséis seguintes mudam, mas:
- `approvedCarousels` (Set<number>) não é reindexado
- `selectedSlides` (Map<number, Set<number>>) não é reindexado
- `slideImageConfigs` não é reindexado

**Exemplo:**
```
Antes: carousels = [A, B, C]
        approvedCarousels = Set([0, 2])  // A e C aprovados

Deleta índice 0 (A):

Depois: carousels = [B, C]
        approvedCarousels = Set([2])  // ❌ Ainda referencia índice 2, mas agora C está no índice 1!
```

**Correção necessária (linha 683-691):**
```typescript
set((state) => {
  const newCarousels = state.carousels.filter((_, i) => i !== carouselIndex)

  // Reindexar approvedCarousels
  const newApproved = new Set<number>()
  state.approvedCarousels.forEach(idx => {
    if (idx < carouselIndex) {
      newApproved.add(idx)  // Antes do deletado, mantém índice
    } else if (idx > carouselIndex) {
      newApproved.add(idx - 1)  // Depois do deletado, reduz 1
    }
    // Se idx === carouselIndex, não adiciona (foi deletado)
  })

  // Reindexar selectedSlides
  const newSelectedSlides = new Map<number, Set<number>>()
  state.selectedSlides.forEach((slideSet, idx) => {
    if (idx < carouselIndex) {
      newSelectedSlides.set(idx, slideSet)
    } else if (idx > carouselIndex) {
      newSelectedSlides.set(idx - 1, slideSet)
    }
  })

  // Reindexar slideImageConfigs
  const newSlideImageConfigs = new Map()
  state.slideImageConfigs.forEach((configMap, idx) => {
    if (idx < carouselIndex) {
      newSlideImageConfigs.set(idx, configMap)
    } else if (idx > carouselIndex) {
      newSlideImageConfigs.set(idx - 1, configMap)
    }
  })

  // Reindexar selectedForSlides
  const newSelectedForSlides = new Set<number>()
  state.selectedForSlides.forEach(idx => {
    if (idx < carouselIndex) {
      newSelectedForSlides.add(idx)
    } else if (idx > carouselIndex) {
      newSelectedForSlides.add(idx - 1)
    }
  })

  return {
    carousels: newCarousels,
    approvedCarousels: newApproved,
    selectedSlides: newSelectedSlides,
    slideImageConfigs: newSlideImageConfigs,
    selectedForSlides: newSelectedForSlides,
  }
})
```

✅ **PRESENTE MAS COM 2 PROBLEMAS CRÍTICOS**

---

## ❌ REQUISITOS FALTANDO (2/4)

### 3. ❌ Estado `deletingSlides`

**Esperado pelo team lead:**
```typescript
deletingSlides: string[]  // Array de IDs dos carrosséis cujos slides estão sendo deletados
```

**Ou alternativa mais simples:**
```typescript
deletingSlides: number | null  // Índice do carrossel cujos slides estão sendo deletados
```

**Atual:** ❌ Não existe no store

**Impacto:** Sem loading state para deleção de slides visuais.

---

### 4. ❌ Action `deleteSlides()`

**Esperado (conforme especificação original linha 955-996):**

API existente: `DELETE /api/content/[id]/slides/[carouselIndex]`

**Action necessária:**
```typescript
deleteSlides: async (auditId: string, carouselIndex: number) => {
  set({ deletingSlides: carouselIndex })

  try {
    const response = await fetch(`/api/content/${auditId}/slides/${carouselIndex}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Erro ao deletar slides')
    }

    const data = await response.json()

    // Atualizar estado removendo slides VISUAIS (não o carrossel textual)
    set((state) => {
      // Remover de slides V1
      const newSlides = state.slides ? {
        ...state.slides,
        carousels: state.slides.carousels?.filter(
          (c: any) => c.carouselIndex !== carouselIndex
        ) || []
      } : null

      // Remover de slides V2
      const newSlidesV2 = state.slidesV2 ? {
        ...state.slidesV2,
        carousels: state.slidesV2.carousels?.filter(
          (c: any) => c.carouselIndex !== carouselIndex
        ) || []
      } : null

      return {
        slides: newSlides,
        slidesV2: newSlidesV2,
      }
    })

    console.log(`✅ Slides do carrossel ${carouselIndex} deletados (${data.cloudinaryDeleted} imagens)`)
  } catch (error: any) {
    console.error('Erro ao deletar slides:', error)
    set({ error: error.message })
  } finally {
    set({ deletingSlides: null })
  }
}
```

**Atual:** ❌ Não existe no store

**Impacto:** Impossível deletar slides visuais sem deletar o carrossel textual.

---

## 📊 VALIDAÇÃO COMPLETA

### Estados
- [x] ✅ `deletingCarousel: number | null` (presente)
- [ ] ❌ `deletingSlides: number | null` (faltando)

### Actions - Carrosséis Textuais
- [x] ⚠️ `deleteCarousel()` (presente mas com 2 problemas)
  - [ ] ❌ Endpoint incorreto (`/delete-carousel` → `/carousels/${index}`)
  - [ ] ❌ Não reindexar Sets/Maps após deleção

### Actions - Slides Visuais
- [ ] ❌ `deleteSlides()` (faltando completamente)

### Conflitos/Duplicações
- [x] ✅ Sem conflitos identificados
- [x] ✅ Sem duplicações identificadas

---

## 🎯 AÇÕES REQUERIDAS - URGENTE

### CRÍTICO 1: Corrigir Endpoint de `deleteCarousel`

**Linha 671:**
```typescript
// ❌ ERRADO
const response = await fetch(`/api/content/${auditId}/delete-carousel`, {

// ✅ CORRETO
const response = await fetch(`/api/content/${auditId}/carousels/${carouselIndex}`, {
```

---

### CRÍTICO 2: Corrigir Reindexação em `deleteCarousel`

**Linha 683-691:** Substituir por:
```typescript
set((state) => {
  const newCarousels = state.carousels.filter((_, i) => i !== carouselIndex)

  // Reindexar approvedCarousels
  const newApproved = new Set<number>()
  state.approvedCarousels.forEach(idx => {
    if (idx < carouselIndex) newApproved.add(idx)
    else if (idx > carouselIndex) newApproved.add(idx - 1)
  })

  // Reindexar selectedSlides
  const newSelectedSlides = new Map<number, Set<number>>()
  state.selectedSlides.forEach((slideSet, idx) => {
    if (idx < carouselIndex) newSelectedSlides.set(idx, slideSet)
    else if (idx > carouselIndex) newSelectedSlides.set(idx - 1, slideSet)
  })

  // Reindexar slideImageConfigs
  const newSlideImageConfigs = new Map()
  state.slideImageConfigs.forEach((configMap, idx) => {
    if (idx < carouselIndex) newSlideImageConfigs.set(idx, configMap)
    else if (idx > carouselIndex) newSlideImageConfigs.set(idx - 1, configMap)
  })

  // Reindexar selectedForSlides
  const newSelectedForSlides = new Set<number>()
  state.selectedForSlides.forEach(idx => {
    if (idx < carouselIndex) newSelectedForSlides.add(idx)
    else if (idx > carouselIndex) newSelectedForSlides.add(idx - 1)
  })

  return {
    carousels: newCarousels,
    approvedCarousels: newApproved,
    selectedSlides: newSelectedSlides,
    slideImageConfigs: newSlideImageConfigs,
    selectedForSlides: newSelectedForSlides,
  }
})
```

---

### CRÍTICO 3: Adicionar Estado `deletingSlides`

**Após linha 60:**
```typescript
deletingCarousel: number | null
deletingSlides: number | null  // ✅ ADICIONAR
generatingVariations: number | null
```

**Linha 233 (initialState):**
```typescript
deletingCarousel: null,
deletingSlides: null,  // ✅ ADICIONAR
```

---

### CRÍTICO 4: Adicionar Action `deleteSlides`

**Interface (após linha 167):**
```typescript
deleteCarousel: (auditId: string, carouselIndex: number) => Promise<void>
deleteSlides: (auditId: string, carouselIndex: number) => Promise<void>  // ✅ ADICIONAR
generateVariations: (auditId: string, carouselIndex: number) => Promise<void>
```

**Implementação (após linha 701):**
```typescript
deleteSlides: async (auditId, carouselIndex) => {
  set({ deletingSlides: carouselIndex })

  try {
    const response = await fetch(`/api/content/${auditId}/slides/${carouselIndex}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Erro ao deletar slides')
    }

    const data = await response.json()

    // Remover slides visuais (não o carrossel textual)
    set((state) => {
      const newSlides = state.slides ? {
        ...state.slides,
        carousels: state.slides.carousels?.filter(
          (c: any) => c.carouselIndex !== carouselIndex
        ) || []
      } : null

      const newSlidesV2 = state.slidesV2 ? {
        ...state.slidesV2,
        carousels: state.slidesV2.carousels?.filter(
          (c: any) => c.carouselIndex !== carouselIndex
        ) || []
      } : null

      return {
        slides: newSlides,
        slidesV2: newSlidesV2,
      }
    })

    console.log(`✅ ${data.deletedImages} slides deletados do Cloudinary`)
  } catch (error: any) {
    console.error('Erro ao deletar slides:', error)
    set({ error: error.message })
  } finally {
    set({ deletingSlides: null })
  }
},
```

---

## 📋 CHECKLIST FINAL

### Validações Atuais
- [x] ✅ Estado `deletingCarousel` presente
- [ ] ❌ Estado `deletingSlides` faltando
- [x] ⚠️ Action `deleteCarousel` presente (mas com problemas)
- [ ] ❌ Action `deleteSlides` faltando

### Correções Necessárias
- [ ] Corrigir endpoint de `deleteCarousel` (linha 671)
- [ ] Corrigir reindexação em `deleteCarousel` (linha 683-691)
- [ ] Adicionar estado `deletingSlides` (linha 60, 233)
- [ ] Adicionar action `deleteSlides` (interface + implementação)

### Conflitos/Duplicações
- [x] ✅ Sem conflitos
- [x] ✅ Sem duplicações

---

## 🚨 DECISÃO FINAL

**Status:** ❌ **NÃO APROVADO PARA MERGE**

**Motivos Bloqueadores:**

1. **CRÍTICO:** Endpoint incorreto em `deleteCarousel` (404)
2. **CRÍTICO:** Falta reindexação (corrupção de estado)
3. **CRÍTICO:** Falta estado `deletingSlides`
4. **CRÍTICO:** Falta action `deleteSlides`

**Score:** 2/4 requisitos (50%)

**Impacto:**
- Deleção de carrosséis vai falhar (404)
- Após deletar carrossel, índices corrompem estado
- Impossível deletar slides visuais

---

## ✅ APÓS CORREÇÕES

Quando todas as 4 correções forem aplicadas:
- ✅ Score: 4/4 (100%)
- ✅ Deleção de carrosséis funcionando
- ✅ Reindexação correta
- ✅ Deleção de slides visuais funcionando
- ✅ **APROVADO PARA MERGE**

---

**Revisor:** @analyzer
**Data:** 2026-02-24
**Tempo estimado correções:** 20-30 minutos
**Bloqueio:** Task #12 (testes finais) aguardando aprovação
