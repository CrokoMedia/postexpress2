# Plano de Integração Zustand - Content Creation

> Documento de planejamento para Task #11 - Integração completa com Zustand store
> Especialista: dev-zustand
> Data: 2026-02-24

## 📋 Status Atual

### ✅ Já Implementado
- Store base em `/store/content-creation.ts`
- Interface `ContentCreationState` com estrutura para 3 fases
- Actions básicas de navegação e carrosséis
- `page-v2.tsx` usando `useContentCreation()`

### ⏳ Aguardando
- Task #7: Implementar Fase 1 - Criar
- Task #9: Implementar Fase 3 - Exportar
- Task #10: Migrar funcionalidades existentes

---

## 🎯 Objetivos da Integração

1. **Single Source of Truth**: Todo estado gerenciado pelo Zustand
2. **Performance**: Selectors otimizados, evitar re-renders desnecessários
3. **Sincronização**: Persist key states + sync com Supabase
4. **DevTools**: Debug facilitado com Zustand DevTools
5. **Type Safety**: TypeScript strict em todo o store

---

## 📦 Estados a Adicionar no Store

### 1. Geração de Conteúdo (Fase 1)
```typescript
// Estado
content: any | null
generating: boolean
error: string | null
loadingExisting: boolean
usedTheme: string | null

// Actions
generateContent: (auditId: string, customTheme?: string) => Promise<void>
loadExistingContent: (auditId: string) => Promise<void>
```

### 2. Slides (3 versões)
```typescript
// Estado V1 (Template padrão)
slides: any | null
generatingSlides: boolean
slidesError: string | null
generatingSingleV1: number | null

// Estado V2 (fal.ai)
slidesV2: any | null
generatingSlidesV2: boolean
slidesV2Error: string | null
generatingSingleV2: number | null

// Estado Reels (Remotion MP4)
reelVideos: any[] | null
generatingReel: boolean
reelError: string | null

// Actions
generateSlidesV1: (auditId: string, carouselIndices?: number[]) => Promise<void>
generateSlidesV2: (auditId: string, carouselIndices?: number[]) => Promise<void>
generateReels: (auditId: string) => Promise<void>
generateSingleSlideV1: (auditId: string, carouselIndex: number) => Promise<void>
generateSingleSlideV2: (auditId: string, carouselIndex: number) => Promise<void>
```

### 3. Seleção de Slides
```typescript
// Estado
selectedForSlides: Set<number>
selectedSlides: Map<number, Set<number>>

// Actions (já existem parcialmente, melhorar)
toggleSlide: (carouselIndex: number, slideIndex: number) => void
toggleAllSlides: (carouselIndex: number) => void
selectCarouselForSlides: (carouselIndex: number) => void
deselectCarouselForSlides: (carouselIndex: number) => void
```

### 4. Edição de Carrosséis
```typescript
// Estado
editingIndex: number | null
editInstructions: string
editedCarousel: any | null
refining: boolean
saving: boolean

// Actions
startEditing: (carouselIndex: number) => void
cancelEditing: () => void
setEditInstructions: (instructions: string) => void
refineCarousel: (auditId: string, carouselIndex: number, instructions: string) => Promise<void>
saveEditedCarousel: (auditId: string, carouselIndex: number) => Promise<void>
```

### 5. Upload de Imagens
```typescript
// Estado
uploadingImage: { carouselIndex: number; slideIndex: number } | null

// Actions
uploadSlideImage: (auditId: string, carouselIndex: number, slideIndex: number, file: File) => Promise<void>
```

### 6. Copy/Download/Export
```typescript
// Estado
copiedIndex: number | null
copiedCaption: number | null
copiedHashtags: number | null
downloadingZip: boolean
downloadingCarouselZip: number | null
sendingToDrive: boolean
driveMessage: string | null
driveError: string | null

// Actions
copyCarousel: (carouselIndex: number) => void
copyCaption: (carouselIndex: number) => void
copyHashtags: (carouselIndex: number) => void
downloadJSON: () => void
downloadAllZip: (auditId: string) => Promise<void>
downloadCarouselZip: (auditId: string, carouselIndex: number) => Promise<void>
exportToDrive: (auditId: string) => Promise<void>
```

### 7. Exclusão e Variações
```typescript
// Estado
deletingCarousel: number | null
generatingVariations: number | null

// Actions
deleteCarousel: (auditId: string, carouselIndex: number) => Promise<void>
generateVariations: (auditId: string, carouselIndex: number) => Promise<void>
```

### 8. Agendamento
```typescript
// Estado
showScheduleModal: boolean
schedulesRefreshKey: number

// Actions
openScheduleModal: () => void
closeScheduleModal: () => void
refreshSchedules: () => void
```

---

## 🔧 Melhorias Necessárias no Store

### 1. Adicionar Middleware de Logging (dev mode)
```typescript
import { devtools } from 'zustand/middleware'

export const useContentCreation = create<ContentCreationState>()(
  devtools(
    (set, get) => ({
      // ... state e actions
    }),
    { name: 'ContentCreationStore' }
  )
)
```

### 2. Adicionar Persist (localStorage)
```typescript
import { persist } from 'zustand/middleware'

// Persist apenas estados críticos (não loadings)
persist(
  (set, get) => ({ /* ... */ }),
  {
    name: 'content-creation-storage',
    partialize: (state) => ({
      currentPhase: state.currentPhase,
      quickStartMode: state.quickStartMode,
      selectedTemplate: state.selectedTemplate,
      selectedFormat: state.selectedFormat,
      selectedTheme: state.selectedTheme,
      customTheme: state.customTheme,
      // NÃO persiste: loadings, errors, states temporários
    })
  }
)
```

### 3. Adicionar Selectors Otimizados
```typescript
// Selectors separados para evitar re-renders
export const useCurrentPhase = () => useContentCreation(state => state.currentPhase)
export const useCarousels = () => useContentCreation(state => state.carousels)
export const useCurrentCarousel = () => {
  const carousels = useCarousels()
  const currentIndex = useContentCreation(state => state.currentCarouselIndex)
  return carousels[currentIndex]
}
export const useApprovedCarousels = () => {
  const carousels = useCarousels()
  return carousels.filter(c => c.approved)
}
```

### 4. Adicionar Computed Values
```typescript
// Dentro do store
get computedValues() {
  const state = get()
  return {
    hasContent: !!state.content,
    approvedCount: state.approvedCarousels.size,
    totalCarousels: state.carousels.length,
    canProceedToPhase2: state.carousels.length > 0,
    canProceedToPhase3: state.approvedCarousels.size > 0,
    selectedSlidesCount: Array.from(state.selectedSlides.values())
      .reduce((sum, set) => sum + set.size, 0),
  }
}
```

---

## 🔄 Sincronização com Supabase

### Momentos de Save no Banco:
1. **Após gerar conteúdo** → salvar carrosséis
2. **Após aprovar/rejeitar** → atualizar approved flag
3. **Após editar carrossel** → salvar versão editada
4. **Após gerar slides** → salvar URLs das imagens
5. **Após configurar imagens** → salvar configs

### Actions Assíncronas:
```typescript
// Exemplo
generateContent: async (auditId: string, customTheme?: string) => {
  set({ generating: true, error: null })
  try {
    const response = await fetch(`/api/audits/${auditId}/generate-content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ custom_theme: customTheme })
    })

    if (!response.ok) throw new Error('Erro na API')

    const data = await response.json()
    set({
      content: data.content,
      carousels: data.content.carousels,
      usedTheme: customTheme || null
    })
  } catch (error: any) {
    set({ error: error.message })
  } finally {
    set({ generating: false })
  }
}
```

---

## 🎨 Performance: Memoização

### Componentes que precisam React.memo:
- `CarouselCard` (re-render só se carrossel específico mudar)
- `SlidePreview` (re-render só se slide específico mudar)
- `ImageConfigPanel` (re-render só se config mudar)

### Exemplo:
```typescript
import { memo } from 'react'

export const CarouselCard = memo(({
  carousel,
  index
}: {
  carousel: Carousel
  index: number
}) => {
  // Usar selector específico
  const isApproved = useContentCreation(state =>
    state.approvedCarousels.has(index)
  )

  // ...
})
```

---

## 📝 Checklist de Integração

### Fase 1: Auditoria
- [ ] Mapear TODOS os useState() da página antiga
- [ ] Identificar duplicações de estado
- [ ] Documentar dependências entre estados

### Fase 2: Adicionar ao Store
- [ ] Adicionar todos os estados faltantes
- [ ] Implementar todas as actions assíncronas
- [ ] Adicionar computed values
- [ ] Implementar selectors otimizados

### Fase 3: Middleware & DevTools
- [ ] Adicionar devtools middleware
- [ ] Configurar persist middleware
- [ ] Adicionar logging em dev mode
- [ ] Testar DevTools no browser

### Fase 4: Migração de Componentes
- [ ] Substituir useState por useContentCreation em Phase1Criar
- [ ] Substituir useState por useContentCreation em Phase2Refinar
- [ ] Substituir useState por useContentCreation em Phase3Exportar
- [ ] Adicionar React.memo onde necessário
- [ ] Remover props drilling (passar store context)

### Fase 5: Testes & Validação
- [ ] Verificar que TODOS os componentes usam store
- [ ] Testar navegação entre fases
- [ ] Testar geração de conteúdo
- [ ] Testar aprovação/edição
- [ ] Testar geração de slides
- [ ] Testar export/download
- [ ] Verificar que não há estados duplicados
- [ ] Verificar performance (React DevTools Profiler)

---

## 🐛 Problemas Conhecidos a Corrigir

1. **Map/Set no Zustand**: Zustand não detecta mutações diretas. Sempre criar novos Map/Set:
   ```typescript
   // ❌ Errado
   state.slideImageConfigs.get(idx)!.set(slideIdx, config)

   // ✅ Certo
   const newConfigs = new Map(state.slideImageConfigs)
   if (!newConfigs.has(idx)) newConfigs.set(idx, new Map())
   const carouselMap = new Map(newConfigs.get(idx)!)
   carouselMap.set(slideIdx, config)
   newConfigs.set(idx, carouselMap)
   return { slideImageConfigs: newConfigs }
   ```

2. **Nested objects**: Sempre usar spread operator para criar novos objetos:
   ```typescript
   // ❌ Errado
   state.carousels[idx].approved = true

   // ✅ Certo
   const newCarousels = [...state.carousels]
   newCarousels[idx] = { ...newCarousels[idx], approved: true }
   return { carousels: newCarousels }
   ```

---

## 📚 Referências

- [Zustand Docs](https://github.com/pmndrs/zustand)
- [Zustand DevTools](https://github.com/pmndrs/zustand#devtools)
- [Zustand Persist](https://github.com/pmndrs/zustand#persist-middleware)
- [React.memo](https://react.dev/reference/react/memo)
- [React DevTools Profiler](https://react.dev/learn/react-developer-tools)

---

**Status:** 📋 Aguardando Tasks #7, #9, #10
**Próximo passo:** Iniciar Fase 1 da integração assim que tasks anteriores terminarem
