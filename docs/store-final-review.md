# Revisão Final - Novos Requisitos do Store

**Data:** 2026-02-24
**Revisor:** @analyzer
**Arquivo:** `store/content-creation-expanded.ts.draft`
**Contexto:** Validação dos requisitos adicionados por @dev-migration (Tasks #20, #23, #26)

---

## 📊 SUMÁRIO EXECUTIVO

**Status:** ✅ **2/3 REQUISITOS IMPLEMENTADOS**

| Requisito | Status | Linha |
|-----------|--------|-------|
| 1. Estados de Clipboard (Task #23) | ✅ **COMPLETO** | 84-86, 877-928 |
| 2. Custom Theme (Task #26) | ✅ **COMPLETO** | 28, 213, 306, 308-315 |
| 3. useAudit Integration (Task #20) | ❌ **FALTA IMPLEMENTAR** | - |

---

## ✅ REQUISITO 1: ESTADOS DE CLIPBOARD (Task #23)

### Status: ✅ **COMPLETO E CORRETO**

### Estados Implementados

**Linha 84-86:**
```typescript
copiedIndex: number | null
copiedCaption: number | null
copiedHashtags: number | null
```
✅ Todos os 3 estados presentes

**Linha 248-250 (initialState):**
```typescript
copiedIndex: null,
copiedCaption: null,
copiedHashtags: null,
```
✅ Inicialização correta

### Actions Implementadas

**Linha 185-187 (interface):**
```typescript
copyCarousel: (carouselIndex: number) => void
copyCaption: (carouselIndex: number) => void
copyHashtags: (carouselIndex: number) => void
```
✅ Assinaturas corretas

**Linha 877-908 (copyCarousel):**
```typescript
copyCarousel: (carouselIndex) => {
  const { carousels } = get()
  const carousel = carousels[carouselIndex]
  if (!carousel) return

  const text = `
${carousel.titulo}
${carousel.tipo.toUpperCase()} | ${carousel.objetivo}

${carousel.slides.map((slide: any) => `
SLIDE ${slide.numero}:
${slide.titulo}
${slide.corpo}
`).join('\n')}

CAPTION:
${carousel.caption}

HASHTAGS:
${carousel.hashtags.join(' ')}

CTA: ${carousel.cta}
  `.trim()

  navigator.clipboard.writeText(text)
  set({ copiedIndex: carouselIndex })
  setTimeout(() => set({ copiedIndex: null }), 2000)  // ✅ Timeout correto
}
```
✅ Implementação completa e idêntica à página original (linha 202-224)

**Linha 910-918 (copyCaption):**
```typescript
copyCaption: (carouselIndex) => {
  const { carousels } = get()
  const carousel = carousels[carouselIndex]
  if (!carousel) return

  navigator.clipboard.writeText(carousel.caption)
  set({ copiedCaption: carouselIndex })
  setTimeout(() => set({ copiedCaption: null }), 2000)
}
```
✅ Implementação correta

**Linha 920-928 (copyHashtags):**
```typescript
copyHashtags: (carouselIndex) => {
  const { carousels } = get()
  const carousel = carousels[carouselIndex]
  if (!carousel) return

  const hashtagsText = carousel.hashtags.map((tag: string) => `#${tag}`).join(' ')
  navigator.clipboard.writeText(hashtagsText)
  set({ copiedHashtags: carouselIndex })
  setTimeout(() => set({ copiedHashtags: null }), 2000)
}
```
✅ Implementação correta (adiciona `#` antes de cada hashtag)

### Validação Completa

- [x] ✅ Estados `copiedIndex`, `copiedCaption`, `copiedHashtags`
- [x] ✅ Inicialização com `null`
- [x] ✅ Actions `copyCarousel()`, `copyCaption()`, `copyHashtags()`
- [x] ✅ Timeout de 2 segundos (feedback visual)
- [x] ✅ Formatação correta (hashtags com `#`, carrossel completo)
- [x] ✅ Validação de carousel existente (`if (!carousel) return`)

**RESULTADO:** ✅ **REQUISITO COMPLETO - NENHUMA ALTERAÇÃO NECESSÁRIA**

---

## ✅ REQUISITO 2: CUSTOM THEME (Task #26)

### Status: ✅ **COMPLETO E CORRETO**

### Estado Implementado

**Linha 28:**
```typescript
customTheme: string
```
✅ Estado presente

**Linha 213 (initialState):**
```typescript
customTheme: '',
```
✅ Inicialização correta (string vazia)

**Linha 1057 (persist):**
```typescript
customTheme: state.customTheme,
```
✅ Persistido no localStorage

### Action Implementada

**Linha 123 (interface):**
```typescript
setCustomTheme: (theme: string) => void
```
✅ Assinatura correta

**Linha 306:**
```typescript
setCustomTheme: (theme) => set({ customTheme: theme }),
```
✅ Setter simples e correto

### Integração com API

**Linha 308-315 (generateContent):**
```typescript
generateContent: async (auditId: string, customTheme?: string) => {
  set({ generating: true, error: null })

  try {
    const response = await fetch(`/api/audits/${auditId}/generate-content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ custom_theme: customTheme || null }),  // ✅
    })
```
✅ Parâmetro `custom_theme` enviado corretamente para API

**Linha 332:**
```typescript
set({
  content: data.content,
  carousels: data.content.carousels,
  usedTheme: customTheme || null,  // ✅ Salva tema usado
})
```
✅ Estado `usedTheme` atualizado após geração

### Validação Completa

- [x] ✅ Estado `customTheme` (string)
- [x] ✅ Inicialização vazia
- [x] ✅ Persistido no localStorage
- [x] ✅ Action `setCustomTheme()`
- [x] ✅ Passado para API via `custom_theme`
- [x] ✅ Estado `usedTheme` atualizado

**RESULTADO:** ✅ **REQUISITO COMPLETO - NENHUMA ALTERAÇÃO NECESSÁRIA**

---

## ❌ REQUISITO 3: useAudit INTEGRATION (Task #20)

### Status: ❌ **NÃO IMPLEMENTADO**

### Estados Faltando

**Esperado (conforme hook useAudit):**
```typescript
// Estados de auditoria
audit: any | null
isLoadingAudit: boolean
auditError: any | null
```

**Atual:** ❌ Não existem no store

### Problema

O store atual **não integra com o hook `useAudit`** que é usado na página original:

**Página original (linha 22):**
```typescript
const { audit, isLoading, isError } = useAudit(id)
```

**Hook useAudit (`/hooks/use-audit.ts`):**
```typescript
export function useAudit(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/audits/${id}` : null,
    fetcher
  )

  return {
    audit: data?.audit,
    isLoading,
    isError: error,
    mutate
  }
}
```

### Impacto

Sem integração com `useAudit`:
1. ❌ Não carrega dados completos da auditoria
2. ❌ Não tem `audit.profile` necessário para geração de slides
3. ❌ Não tem loading/error states de auditoria
4. ❌ Actions de geração de slides vão falhar (precisam de `profile`)

### Onde Adicionar

**1. Adicionar estados à interface (após linha 35):**
```typescript
// Dados da auditoria
audit: any | null
isLoadingAudit: boolean
auditError: any | null
```

**2. Inicializar no initialState (após linha 218):**
```typescript
// Auditoria
audit: null,
isLoadingAudit: false,
auditError: null,
```

**3. Adicionar action para carregar auditoria (interface, após linha 125):**
```typescript
loadAudit: (auditId: string) => Promise<void>
```

**4. Implementar action (após linha 366):**
```typescript
loadAudit: async (auditId: string) => {
  set({ isLoadingAudit: true, auditError: null })

  try {
    const response = await fetch(`/api/audits/${auditId}`)

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || `Erro ${response.status}`)
    }

    const data = await response.json()

    set({
      audit: data.audit,
      isLoadingAudit: false,
    })

    console.log('✅ Auditoria carregada')
  } catch (error: any) {
    console.error('Erro ao carregar auditoria:', error)
    set({
      auditError: error,
      isLoadingAudit: false,
    })
  }
}
```

**5. Chamar `loadAudit` antes de `loadExistingContent` (linha 342):**
```typescript
loadExistingContent: async (auditId: string) => {
  // Carregar auditoria primeiro
  await get().loadAudit(auditId)  // ✅ Novo

  set({ loadingExisting: true })
  // ... resto do código
}
```

**6. Usar `audit.profile` em geração de slides:**

**Exemplo: `generateSlidesV1` (linha 741):**
```typescript
generateSlidesV1: async (auditId, carouselIndices) => {
  const { audit, content } = get()  // ✅ Pega audit do store

  if (!audit?.profile) {
    set({ slidesError: 'Auditoria não carregada' })
    return
  }

  // Preparar carousels
  const carouselsToGenerate = content.carousels.map((c: any, i: number) => {
    // ... lógica de filtro
  })

  const response = await fetch(`/api/content/${auditId}/generate-slides`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      carousels: carouselsToGenerate,
      profile: audit.profile  // ✅ Usa profile do store
    })
  })
  // ...
}
```

**Aplicar mesma correção em:**
- `generateSlidesV2` (linha 798)
- `generateSingleSlideV1` (linha 768)
- `generateSingleSlideV2` (linha 825)

### Validação Necessária

- [ ] ❌ Estados `audit`, `isLoadingAudit`, `auditError`
- [ ] ❌ Action `loadAudit()`
- [ ] ❌ Chamada em `loadExistingContent`
- [ ] ❌ Uso de `audit.profile` em geração de slides (4 métodos)

**RESULTADO:** ❌ **REQUISITO FALTANDO - ALTERAÇÕES NECESSÁRIAS**

---

## 🎯 CONFLITOS E DUPLICAÇÕES

### ✅ Não Há Conflitos

Verifiquei:
- ✅ Estados de clipboard não conflitam com nada
- ✅ `customTheme` não conflita com `usedTheme` (propósitos diferentes)
- ✅ Adicionar `audit` não conflita com `content` (dados diferentes)

### ✅ Não Há Duplicações

- ✅ Cada estado tem propósito único
- ✅ Actions não duplicam funcionalidades
- ✅ Clipboard states são independentes (index, caption, hashtags)

---

## 📋 CHECKLIST FINAL

### Requisitos Implementados
- [x] ✅ **Requisito 1:** Estados de clipboard (Task #23)
  - [x] Estados `copiedIndex`, `copiedCaption`, `copiedHashtags`
  - [x] Actions `copyCarousel()`, `copyCaption()`, `copyHashtags()`
  - [x] Timeout 2s para feedback visual
  - [x] Formatação correta

- [x] ✅ **Requisito 2:** Custom theme (Task #26)
  - [x] Estado `customTheme`
  - [x] Persistido no localStorage
  - [x] Action `setCustomTheme()`
  - [x] Integração com API (`custom_theme`)
  - [x] Estado `usedTheme` atualizado

### Requisitos Faltando
- [ ] ❌ **Requisito 3:** useAudit integration (Task #20)
  - [ ] Estados `audit`, `isLoadingAudit`, `auditError`
  - [ ] Action `loadAudit()`
  - [ ] Chamada em `loadExistingContent`
  - [ ] Uso de `audit.profile` em 4 métodos

### Conflitos/Duplicações
- [x] ✅ Sem conflitos identificados
- [x] ✅ Sem duplicações identificadas

---

## 🚨 AÇÃO REQUERIDA

### Para @dev-zustand

**ANTES de aplicar o store:**

1. **Adicionar estados de auditoria** (4 linhas)
   - Interface: `audit`, `isLoadingAudit`, `auditError`
   - InitialState: valores iniciais

2. **Adicionar action `loadAudit`** (~20 linhas)
   - Busca `/api/audits/${auditId}`
   - Atualiza estados de loading/error
   - Salva `audit` no store

3. **Integrar com `loadExistingContent`** (1 linha)
   - Chamar `await get().loadAudit(auditId)` antes do resto

4. **Corrigir geração de slides** (4 métodos)
   - Pegar `audit.profile` do store
   - Validar que `audit` existe antes de gerar
   - Passar `profile` no body da API

**Tempo estimado:** 10-15 minutos

---

## ✅ DECISÃO FINAL

**Status:** 🟡 **APROVADO APÓS CORREÇÕES**

**Score de Requisitos:** 2/3 (66%)

**Requisitos atendidos:**
- ✅ Clipboard (100%)
- ✅ Custom Theme (100%)
- ❌ useAudit Integration (0%)

**Após adicionar useAudit integration:**
- Store estará 100% alinhado com requisitos
- Pronto para merge e aplicação
- @dev-migration pode prosseguir

---

**Revisor:** @analyzer
**Data:** 2026-02-24
**Próximo passo:** @dev-zustand adiciona useAudit → @analyzer valida → Merge aprovado
