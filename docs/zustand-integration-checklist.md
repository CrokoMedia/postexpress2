# Checklist de Integração Zustand - Por Arquivo

> Documento de execução da Task #11
> Especialista: dev-zustand
> Data: 2026-02-24

---

## 📋 Estados a Adicionar no Store

### Estados Novos Necessários:

```typescript
// UI State
currentView: 'selector' | 'template-gallery' | 'advanced-form' | null
lightboxImage: string | null

// Loading States (Fase 1)
generatingContent: boolean
generatingError: string | null

// Loading States (Fase 2)
loadingCarousels: boolean
carouselsError: string | null

// Loading States (Fase 3)
downloadingZip: boolean
downloadingCarouselZip: number | null
sendingToDrive: boolean
driveMessage: string | null
driveError: string | null

// Agendamento
showScheduleModal: boolean
schedulesRefreshKey: number

// Config temporária (Advanced Mode)
advancedConfig: {
  template: TemplateId
  format: LayoutFormat
  theme: ThemeMode
  customTheme?: string
} | null
```

---

## 🔧 Arquivo 1: `/store/content-creation.ts`

### Adicionar ao State Interface:
```typescript
// UI & Navigation
currentView: 'selector' | 'template-gallery' | 'advanced-form' | null
lightboxImage: string | null

// Loading & Errors
generatingContent: boolean
generatingError: string | null
loadingCarousels: boolean
carouselsError: string | null

// Export
downloadingZip: boolean
downloadingCarouselZip: number | null
sendingToDrive: boolean
driveMessage: string | null
driveError: string | null

// Scheduling
showScheduleModal: boolean
schedulesRefreshKey: number

// Advanced Config
advancedConfig: {
  template: TemplateId
  format: LayoutFormat
  theme: ThemeMode
  customTheme?: string
} | null
```

### Adicionar Actions:
```typescript
// View navigation
setView: (view: 'selector' | 'template-gallery' | 'advanced-form' | null) => void

// Lightbox
openLightbox: (imageUrl: string) => void
closeLightbox: () => void

// Content generation (async)
generateSmartContent: (auditId: string) => Promise<void>
loadCarousels: (auditId: string) => Promise<void>

// Export (async)
downloadAllZip: (auditId: string, username: string) => Promise<void>
downloadCarouselZip: (auditId: string, carouselIndex: number, title: string) => Promise<void>
exportToDrive: (auditId: string) => Promise<void>

// Scheduling
openScheduleModal: () => void
closeScheduleModal: () => void
refreshSchedules: () => void

// Advanced config
setAdvancedConfig: (config: typeof advancedConfig) => void
generateWithAdvancedConfig: (auditId: string) => Promise<void>
```

**Status:** ✅ Draft pronto em `content-creation-expanded.ts.draft`

---

## 📝 Arquivo 2: `phase-1-criar.tsx`

### Mudanças:

#### ❌ Remover:
```typescript
const [view, setView] = useState<'selector' | 'template-gallery' | 'advanced-form'>('selector')
const [isLoading, setIsLoading] = useState(false)
```

#### ✅ Adicionar do store:
```typescript
const {
  currentView,
  setView,
  generatingContent,
  generateSmartContent,
  advancedConfig,
  setAdvancedConfig,
  generateWithAdvancedConfig,
  nextPhase,
} = useContentCreation()
```

#### 🔄 Refatorar:
- `handleSmartGeneration()` → chamar `generateSmartContent(auditId)`
- `handleGenerateWithTemplate()` → chamar `generateWithAdvancedConfig(auditId)`
- `handleAdvancedSubmit()` → chamar `generateWithAdvancedConfig(auditId)`
- Substituir `isLoading` por `generatingContent`
- Substituir `setView()` por `setView()` do store

**Linhas a modificar:** 18-19, 24-61, 80-105, 108-136, 139-157, 160-195

---

## 📝 Arquivo 3: `phase-2-refinar.tsx`

### Mudanças:

#### ❌ Remover:
```typescript
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)
```

#### ✅ Adicionar do store:
```typescript
const {
  loadingCarousels,
  carouselsError,
  loadCarousels,
  // ... resto já está sendo usado
} = useContentCreation()
```

#### 🔄 Refatorar:
- Remover `useEffect` que carrega carrosséis (linhas 40-71)
- Chamar `loadCarousels(auditId)` no `useEffect` simplificado
- Substituir `loading` por `loadingCarousels`
- Substituir `error` por `carouselsError`

**Linhas a modificar:** 36-37, 40-71, 145-157, 160-177

---

## 📝 Arquivo 4: `phase-3-exportar.tsx`

### Mudanças:

#### ❌ Remover:
```typescript
const [lightboxImage, setLightboxImage] = useState<string | null>(null)
const [downloadingZip, setDownloadingZip] = useState(false)
const [downloadingCarouselZip, setDownloadingCarouselZip] = useState<number | null>(null)
const [sendingToDrive, setSendingToDrive] = useState(false)
const [driveMessage, setDriveMessage] = useState<string | null>(null)
const [driveError, setDriveError] = useState<string | null>(null)
const [showScheduleModal, setShowScheduleModal] = useState(false)
const [schedulesRefreshKey, setSchedulesRefreshKey] = useState(0)
```

#### ✅ Adicionar do store:
```typescript
const {
  lightboxImage,
  openLightbox,
  closeLightbox,
  downloadingZip,
  downloadingCarouselZip,
  sendingToDrive,
  driveMessage,
  driveError,
  showScheduleModal,
  schedulesRefreshKey,
  openScheduleModal,
  closeScheduleModal,
  refreshSchedules,
  downloadAllZip,
  downloadCarouselZip,
  exportToDrive,
  generatedSlides,
  isGenerating,
  approvedCarousels,
  carousels,
} = useContentCreation()
```

#### 🔄 Refatorar:
- `handleDownloadZip()` → chamar `downloadAllZip(auditId, username)`
- `handleDownloadCarouselZip()` → chamar `downloadCarouselZip(auditId, index, title)`
- `handleSendToDrive()` → chamar `exportToDrive(auditId)`
- Substituir todos `setLightboxImage` por `openLightbox` / `closeLightbox`
- Substituir `setShowScheduleModal` por `openScheduleModal` / `closeScheduleModal`

**Linhas a modificar:** 58-65, 92-122, 124-157, 159-183

---

## 📝 Arquivo 5: `template-gallery.tsx`

### Mudanças:

#### ❌ Remover:
```typescript
const [selectedTemplate, setSelectedTemplate] = useState<TemplateId | null>(null)
```

#### ✅ Adicionar do store:
```typescript
const { selectedTemplate, setTemplate } = useContentCreation()
```

#### 🔄 Refatorar:
- `handleSelect()` → chamar `setTemplate(templateId)` do store
- Remover `selectedTemplate` local
- Usar `selectedTemplate` do store no render

**Linhas a modificar:** 68, 70-72, 100

---

## 📝 Arquivo 6: `advanced-config-form.tsx`

### Mudanças:

#### ❌ Remover:
```typescript
const [config, setConfig] = useState<AdvancedConfig>({
  template: 'minimalist',
  format: 'feed',
  theme: 'light',
})
```

#### ✅ Adicionar do store:
```typescript
const {
  selectedTemplate,
  selectedFormat,
  selectedTheme,
  setTemplate,
  setFormat,
  setTheme,
  advancedConfig,
  setAdvancedConfig,
} = useContentCreation()
```

#### 🔄 Refatorar:
- Usar `selectedTemplate`, `selectedFormat`, `selectedTheme` do store
- Atualizar cada campo diretamente no store (não acumular em objeto local)
- `handleSubmit()` → criar config temporário e passar para `onSubmit()`

**Linhas a modificar:** 43-47, 49-51, 82, 110, 148, 163, 188-198

---

## ✅ Ordem de Execução

1. **[ ] Substituir store** (`content-creation.ts` → aplicar draft expandido)
2. **[ ] Atualizar Phase3Exportar** (mais simples, testa actions de export)
3. **[ ] Atualizar Template Gallery** (mais simples)
4. **[ ] Atualizar Advanced Config Form**
5. **[ ] Atualizar Phase2Refinar** (testar loading de carrosséis)
6. **[ ] Atualizar Phase1Criar** (mais complexo, múltiplos fluxos)
7. **[ ] Testar fluxo completo** (Smart → Refinar → Exportar)
8. **[ ] Habilitar DevTools** e testar state management
9. **[ ] Verificar performance** (React DevTools Profiler)
10. **[ ] Marcar Task #11 como completa**

---

## 🧪 Testes Necessários

### Fluxo 1: Smart Generation
1. Clicar em "Smart" → deve gerar carrosséis
2. Verificar que estado persiste entre fases
3. Aprovar carrosséis na Fase 2
4. Gerar slides na Fase 3
5. Baixar ZIP

### Fluxo 2: Template Selection
1. Clicar em "Template"
2. Selecionar template
3. Verificar que `selectedTemplate` persiste
4. Gerar carrosséis
5. Navegar entre fases

### Fluxo 3: Advanced Mode
1. Clicar em "Advanced"
2. Configurar template, format, theme
3. Verificar que configs persistem
4. Gerar carrosséis
5. Voltar e verificar que estado mantém

### Fluxo 4: Export
1. Baixar ZIP de todos os carrosséis
2. Baixar ZIP de carrossel individual
3. Enviar para Google Drive
4. Verificar loading states
5. Verificar mensagens de sucesso/erro

### Fluxo 5: Lightbox
1. Clicar em slide gerado
2. Abrir lightbox
3. Fechar lightbox
4. Verificar que imagem carrega corretamente

---

## 📊 Métricas de Sucesso

- ✅ **0 duplicações de estado** (tudo no Zustand)
- ✅ **DevTools funcionando** (histórico de ações visível)
- ✅ **Persist funcionando** (reload mantém estado)
- ✅ **Performance OK** (< 16ms por render crítico)
- ✅ **Type-safe** (0 erros TypeScript)
- ✅ **Todos os fluxos funcionando** (5/5 testes passando)

---

**Status Atual:** 🟡 Aguardando confirmação do team lead para iniciar
**Próximo Passo:** Aplicar store expandido e começar pelas mudanças mais simples (Phase3, Template Gallery)
