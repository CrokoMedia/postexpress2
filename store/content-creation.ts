import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type {
  QuickStartMode,
  TemplateId,
  LayoutFormat,
  ThemeMode,
  Carousel,
  SlideImageConfig,
} from '@/types/content-creation'

export interface ContentCreationState {
  // ===================
  // NAVEGAÇÃO
  // ===================
  currentPhase: 1 | 2 | 3

  // ===================
  // FASE 1: CRIAR
  // ===================
  quickStartMode: QuickStartMode | null
  selectedTemplate: TemplateId | null
  selectedFormat: LayoutFormat
  selectedTheme: ThemeMode
  customTheme: string

  // Geração de conteúdo
  generating: boolean
  content: any | null
  error: string | null
  usedTheme: string | null

  // useAudit integration
  audit: any | null
  isLoadingAudit: boolean
  auditError: any | null

  // ===================
  // FASE 2: REFINAR
  // ===================
  carousels: Carousel[]
  currentCarouselIndex: number
  slideImageConfigs: Map<number, Map<number, SlideImageConfig>>
  approvedCarousels: Set<number>

  // Configurações de imagens
  uploadingImage: { carouselIndex: number; slideIndex: number } | null

  // Seleção de slides
  selectedForSlides: Set<number>
  selectedSlides: Map<number, Set<number>>

  // Edição de carrosséis
  editingIndex: number | null
  editInstructions: string
  editedCarousel: any | null
  refining: boolean
  saving: boolean

  // Outras operações
  approvingCarousel: number | null
  deletingCarousel: number | null
  deletingSlides: number | null
  generatingVariations: number | null

  // ===================
  // FASE 3: EXPORTAR
  // ===================
  // Slides V1 (template padrão)
  generatingSlides: boolean
  slides: any | null
  slidesError: string | null
  generatingSingleV1: number | null

  // Slides V2 (fal.ai)
  isGenerating: boolean
  generatedSlides: any | null
  slidesV2Error: string | null
  generatingSingleV2: number | null

  // Reels (Remotion MP4)
  reelVideos: any[] | null
  reelError: string | null

  // Copy/Download/Export (clipboard já existente)
  copiedIndex: number | null
  copiedCaption: number | null
  copiedHashtags: number | null
  downloadingZip: boolean
  downloadingCarouselZip: number | null
  sendingToDrive: boolean
  driveMessage: string | null
  driveError: string | null

  // Agendamento
  showScheduleModal: boolean
  schedulesRefreshKey: number

  // ===================
  // ACTIONS - NAVEGAÇÃO
  // ===================
  goToPhase: (phase: 1 | 2 | 3) => void
  nextPhase: () => void
  previousPhase: () => void

  // ===================
  // ACTIONS - FASE 1
  // ===================
  setQuickStartMode: (mode: QuickStartMode | null) => void
  setTemplate: (template: TemplateId | null) => void
  setFormat: (format: LayoutFormat) => void
  setTheme: (theme: ThemeMode) => void
  setCustomTheme: (theme: string) => void
  setGenerating: (generating: boolean) => void
  setContent: (content: any) => void
  setError: (error: string | null) => void
  setUsedTheme: (theme: string | null) => void

  // useAudit integration
  loadAudit: (auditId: string) => Promise<void>

  // ===================
  // ACTIONS - FASE 2
  // ===================
  setCarousels: (carousels: Carousel[]) => void
  setCurrentCarouselIndex: (index: number) => void
  updateSlideImageConfig: (
    carouselIndex: number,
    slideIndex: number,
    config: SlideImageConfig
  ) => void
  updateCarousel: (index: number, changes: Partial<Carousel>) => void
  approveCarousel: (auditId: string, index: number) => Promise<void>
  rejectCarousel: (auditId: string, index: number) => Promise<void>

  // Configurações de imagens
  setUploadingImage: (uploading: { carouselIndex: number; slideIndex: number } | null) => void

  // Seleção de slides
  toggleSlide: (carouselIndex: number, slideIndex: number) => void
  toggleAllSlides: (carouselIndex: number) => void
  selectCarouselForSlides: (carouselIndex: number) => void
  deselectCarouselForSlides: (carouselIndex: number) => void

  // Edição
  setEditingIndex: (index: number | null) => void
  setEditInstructions: (instructions: string) => void
  setEditedCarousel: (carousel: any | null) => void
  setRefining: (refining: boolean) => void
  setSaving: (saving: boolean) => void

  // Outras operações
  setApprovingCarousel: (index: number | null) => void
  setGeneratingVariations: (index: number | null) => void
  deleteCarousel: (auditId: string, index: number) => Promise<void>
  deleteSlides: (auditId: string, index: number) => Promise<void>

  // ===================
  // ACTIONS - FASE 3
  // ===================
  // Slides V1
  setGeneratingSlides: (generating: boolean) => void
  setSlides: (slides: any | null) => void
  setSlidesError: (error: string | null) => void
  setGeneratingSingleV1: (index: number | null) => void

  // Slides V2 (isGenerating já definido na Fase 1)
  setGeneratedSlides: (slides: any) => void
  setSlidesV2Error: (error: string | null) => void
  setGeneratingSingleV2: (index: number | null) => void

  // Reels
  setReelVideos: (videos: any[] | null) => void
  setReelError: (error: string | null) => void

  // Copy/Download/Export
  copyCarousel: (index: number) => void
  copyCaption: (index: number) => void
  copyHashtags: (index: number) => void
  setDownloadingZip: (downloading: boolean) => void
  setDownloadingCarouselZip: (index: number | null) => void
  setSendingToDrive: (sending: boolean) => void
  setDriveMessage: (message: string | null) => void
  setDriveError: (error: string | null) => void

  // Agendamento
  setShowScheduleModal: (show: boolean) => void
  refreshSchedules: () => void

  // ===================
  // ACTIONS - GERAL
  // ===================
  reset: () => void
}

const initialState = {
  // Navegação
  currentPhase: 1 as 1 | 2 | 3,

  // Fase 1: Criar
  quickStartMode: null,
  selectedTemplate: null,
  selectedFormat: 'feed' as LayoutFormat,
  selectedTheme: 'light' as ThemeMode,
  customTheme: '',
  generating: false,
  content: null,
  error: null,
  usedTheme: null,
  audit: null,
  isLoadingAudit: false,
  auditError: null,

  // Fase 2: Refinar
  carousels: [],
  currentCarouselIndex: 0,
  slideImageConfigs: new Map(),
  approvedCarousels: new Set<number>(),
  uploadingImage: null,
  selectedForSlides: new Set<number>(),
  selectedSlides: new Map(),
  editingIndex: null,
  editInstructions: '',
  editedCarousel: null,
  refining: false,
  saving: false,
  approvingCarousel: null,
  deletingCarousel: null,
  deletingSlides: null,
  generatingVariations: null,

  // Fase 3: Exportar
  generatingSlides: false,
  slides: null,
  slidesError: null,
  generatingSingleV1: null,
  isGenerating: false,
  generatedSlides: null,
  slidesV2Error: null,
  generatingSingleV2: null,
  reelVideos: null,
  reelError: null,
  copiedIndex: null,
  copiedCaption: null,
  copiedHashtags: null,
  downloadingZip: false,
  downloadingCarouselZip: null,
  sendingToDrive: false,
  driveMessage: null,
  driveError: null,
  showScheduleModal: false,
  schedulesRefreshKey: 0,
}

export const useContentCreation = create<ContentCreationState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        // ===================
        // NAVEGAÇÃO
        // ===================
        goToPhase: (phase) => set({ currentPhase: phase }),

        nextPhase: () =>
          set((state) => {
            const nextPhase = Math.min(3, state.currentPhase + 1) as 1 | 2 | 3
            return { currentPhase: nextPhase }
          }),

        previousPhase: () =>
          set((state) => {
            const prevPhase = Math.max(1, state.currentPhase - 1) as 1 | 2 | 3
            return { currentPhase: prevPhase }
          }),

        // ===================
        // FASE 1: CRIAR
        // ===================
        setQuickStartMode: (mode) => set({ quickStartMode: mode }),
        setTemplate: (template) => set({ selectedTemplate: template }),
        setFormat: (format) => set({ selectedFormat: format }),
        setTheme: (theme) => set({ selectedTheme: theme }),
        setCustomTheme: (theme) => set({ customTheme: theme }),
        setGenerating: (generating) => set({ generating }),
        setContent: (content) => set({ content }),
        setError: (error) => set({ error }),
        setUsedTheme: (theme) => set({ usedTheme: theme }),

        // useAudit integration
        loadAudit: async (auditId: string) => {
          set({ isLoadingAudit: true, auditError: null })

          try {
            const response = await fetch(`/api/audits/${auditId}`)
            if (!response.ok) throw new Error('Failed to load audit')

            const data = await response.json()

            set({
              audit: data.audit,
              isLoadingAudit: false,
            })
          } catch (error) {
            set({
              auditError: error,
              isLoadingAudit: false,
            })
          }
        },

        // ===================
        // FASE 2: REFINAR
        // ===================
        setCarousels: (carousels) => set({ carousels }),
        setCurrentCarouselIndex: (index) => set({ currentCarouselIndex: index }),

  updateSlideImageConfig: (carouselIndex, slideIndex, config) =>
    set((state) => {
      const newConfigs = new Map(state.slideImageConfigs)
      if (!newConfigs.has(carouselIndex)) {
        newConfigs.set(carouselIndex, new Map())
      }
      const carouselMap = new Map(newConfigs.get(carouselIndex)!)
      carouselMap.set(slideIndex, config)
      newConfigs.set(carouselIndex, carouselMap)
      return { slideImageConfigs: newConfigs }
    }),

  updateCarousel: (index, changes) =>
    set((state) => {
      const newCarousels = [...state.carousels]
      newCarousels[index] = { ...newCarousels[index], ...changes }
      return { carousels: newCarousels }
    }),

  approveCarousel: async (auditId, index) => {
    set({ approvingCarousel: index })

    try {
      const response = await fetch(`/api/content/${auditId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carouselIndex: index, approved: true }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao aprovar carrossel')
      }

      set((state) => {
        const newApproved = new Set(state.approvedCarousels)
        newApproved.add(index)

        const newCarousels = [...state.carousels]
        if (newCarousels[index]) {
          newCarousels[index] = { ...newCarousels[index], approved: true }
        }

        // Auto-selecionar para geração de slides
        const newSelectedForSlides = new Set(state.selectedForSlides)
        newSelectedForSlides.add(index)

        // Auto-selecionar todos os slides do carrossel
        const newSelectedSlides = new Map(state.selectedSlides)
        const carousel = newCarousels[index]
        if (carousel?.slides) {
          newSelectedSlides.set(
            index,
            new Set(carousel.slides.map((_: any, i: number) => i))
          )
        }

        return {
          approvedCarousels: newApproved,
          carousels: newCarousels,
          selectedForSlides: newSelectedForSlides,
          selectedSlides: newSelectedSlides,
        }
      })

      console.log(`✅ Carrossel ${index} aprovado`)
    } catch (error: any) {
      console.error('Erro ao aprovar carrossel:', error)
      throw error
    } finally {
      set({ approvingCarousel: null })
    }
  },

  rejectCarousel: async (auditId, index) => {
    set({ approvingCarousel: index })

    try {
      const response = await fetch(`/api/content/${auditId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carouselIndex: index, approved: false }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao rejeitar carrossel')
      }

      set((state) => {
        const newApproved = new Set(state.approvedCarousels)
        newApproved.delete(index)

        const newCarousels = [...state.carousels]
        if (newCarousels[index]) {
          newCarousels[index] = { ...newCarousels[index], approved: false }
        }

        // Remover da seleção de slides
        const newSelectedForSlides = new Set(state.selectedForSlides)
        newSelectedForSlides.delete(index)

        const newSelectedSlides = new Map(state.selectedSlides)
        newSelectedSlides.delete(index)

        return {
          approvedCarousels: newApproved,
          carousels: newCarousels,
          selectedForSlides: newSelectedForSlides,
          selectedSlides: newSelectedSlides,
        }
      })

      console.log(`✅ Carrossel ${index} rejeitado`)
    } catch (error: any) {
      console.error('Erro ao rejeitar carrossel:', error)
      throw error
    } finally {
      set({ approvingCarousel: null })
    }
  },

  // Configurações de imagens
  setUploadingImage: (uploading) => set({ uploadingImage: uploading }),

  // Seleção de slides
  toggleSlide: (carouselIndex, slideIndex) =>
    set((state) => {
      const newSelectedSlides = new Map(state.selectedSlides)
      const carouselSet = newSelectedSlides.get(carouselIndex) || new Set()
      const newSet = new Set(carouselSet)

      if (newSet.has(slideIndex)) {
        newSet.delete(slideIndex)
      } else {
        newSet.add(slideIndex)
      }

      newSelectedSlides.set(carouselIndex, newSet)
      return { selectedSlides: newSelectedSlides }
    }),

  toggleAllSlides: (carouselIndex) =>
    set((state) => {
      const carousel = state.carousels[carouselIndex]
      if (!carousel) return state

      const newSelectedSlides = new Map(state.selectedSlides)
      const currentSet = newSelectedSlides.get(carouselIndex) || new Set()

      // Se todos estão selecionados, desseleciona todos. Senão, seleciona todos.
      if (currentSet.size === carousel.slides?.length) {
        newSelectedSlides.set(carouselIndex, new Set())
      } else {
        newSelectedSlides.set(
          carouselIndex,
          new Set(carousel.slides?.map((_: any, i: number) => i) || [])
        )
      }

      return { selectedSlides: newSelectedSlides }
    }),

  selectCarouselForSlides: (carouselIndex) =>
    set((state) => {
      const newSet = new Set(state.selectedForSlides)
      newSet.add(carouselIndex)
      return { selectedForSlides: newSet }
    }),

  deselectCarouselForSlides: (carouselIndex) =>
    set((state) => {
      const newSet = new Set(state.selectedForSlides)
      newSet.delete(carouselIndex)
      return { selectedForSlides: newSet }
    }),

  // Edição
  setEditingIndex: (index) => set({ editingIndex: index }),
  setEditInstructions: (instructions) => set({ editInstructions: instructions }),
  setEditedCarousel: (carousel) => set({ editedCarousel: carousel }),
  setRefining: (refining) => set({ refining }),
  setSaving: (saving) => set({ saving }),

  // Outras operações
  setApprovingCarousel: (index) => set({ approvingCarousel: index }),
  setGeneratingVariations: (index) => set({ generatingVariations: index }),

  // ===================
  // FASE 3: EXPORTAR
  // ===================
  // Slides V1
  setGeneratingSlides: (generating) => set({ generatingSlides: generating }),
  setSlides: (slides) => set({ slides }),
  setSlidesError: (error) => set({ slidesError: error }),
  setGeneratingSingleV1: (index) => set({ generatingSingleV1: index }),

  // Slides V2 (compatibilidade com generatedSlides, isGenerating na Fase 1)
  setGeneratedSlides: (slides) =>
    set({ generatedSlides: slides, isGenerating: false }),
  setSlidesV2Error: (error) => set({ slidesV2Error: error }),
  setGeneratingSingleV2: (index) => set({ generatingSingleV2: index }),

  // Reels
  setReelVideos: (videos) => set({ reelVideos: videos }),
  setReelError: (error) => set({ reelError: error }),

  // Copy/Download/Export (mantém funções existentes de copy*)
  setDownloadingZip: (downloading) => set({ downloadingZip: downloading }),
  setDownloadingCarouselZip: (index) => set({ downloadingCarouselZip: index }),
  setSendingToDrive: (sending) => set({ sendingToDrive: sending }),
  setDriveMessage: (message) => set({ driveMessage: message }),
  setDriveError: (error) => set({ driveError: error }),

  // Agendamento
  setShowScheduleModal: (show) => set({ showScheduleModal: show }),
  refreshSchedules: () =>
    set((state) => ({
      schedulesRefreshKey: state.schedulesRefreshKey + 1,
    })),

  copyCarousel: (index) => {
    const carousel = useContentCreation.getState().carousels[index]
    if (!carousel) return

    // Montar texto completo do carrossel
    let text = `📝 ${carousel.titulo}\n\n`

    carousel.slides.forEach((slide: any, i: number) => {
      text += `${i + 1}. ${slide.titulo}\n${slide.corpo}\n\n`
    })

    if (carousel.caption) {
      text += `📄 Caption:\n${carousel.caption}\n\n`
    }

    if (carousel.hashtags && carousel.hashtags.length > 0) {
      text += `#️⃣ Hashtags:\n${carousel.hashtags.map((h: string) => `#${h}`).join(' ')}\n\n`
    }

    if (carousel.cta) {
      text += `👉 CTA: ${carousel.cta}`
    }

    navigator.clipboard.writeText(text)

    set({ copiedIndex: index })
    setTimeout(() => set({ copiedIndex: null }), 2000)
  },

  copyCaption: (index) => {
    const carousel = useContentCreation.getState().carousels[index]
    if (!carousel?.caption) return

    navigator.clipboard.writeText(carousel.caption)

    set({ copiedCaption: index })
    setTimeout(() => set({ copiedCaption: null }), 2000)
  },

  copyHashtags: (index) => {
    const carousel = useContentCreation.getState().carousels[index]
    if (!carousel?.hashtags || carousel.hashtags.length === 0) return

    const text = carousel.hashtags.map((h: string) => `#${h}`).join(' ')
    navigator.clipboard.writeText(text)

    set({ copiedHashtags: index })
    setTimeout(() => set({ copiedHashtags: null }), 2000)
  },

  // Delete operations
  deleteCarousel: async (auditId: string, index: number) => {
    set({ deletingCarousel: index })
    try {
      const response = await fetch(`/api/content/${auditId}/carousels/${index}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao deletar carrossel')
      }

      // Remover carrossel e reindexar todos os Maps/Sets
      const state = useContentCreation.getState()
      const newCarousels = state.carousels.filter((_, i) => i !== index)

      // Reindexar approvedCarousels
      const newApproved = new Set<number>()
      state.approvedCarousels.forEach((idx) => {
        if (idx < index) newApproved.add(idx)
        else if (idx > index) newApproved.add(idx - 1)
      })

      // Reindexar selectedSlides
      const newSelectedSlides = new Map<number, Set<number>>()
      state.selectedSlides.forEach((slides, idx) => {
        if (idx < index) newSelectedSlides.set(idx, slides)
        else if (idx > index) newSelectedSlides.set(idx - 1, slides)
      })

      // Reindexar slideImageConfigs
      const newConfigs = new Map<number, Map<number, SlideImageConfig>>()
      state.slideImageConfigs.forEach((config, idx) => {
        if (idx < index) newConfigs.set(idx, config)
        else if (idx > index) newConfigs.set(idx - 1, config)
      })

      // Reindexar selectedForSlides
      const newSelectedFor = new Set<number>()
      state.selectedForSlides.forEach((idx) => {
        if (idx < index) newSelectedFor.add(idx)
        else if (idx > index) newSelectedFor.add(idx - 1)
      })

      set({
        carousels: newCarousels,
        approvedCarousels: newApproved,
        selectedSlides: newSelectedSlides,
        slideImageConfigs: newConfigs,
        selectedForSlides: newSelectedFor,
      })
    } catch (error) {
      console.error('Erro ao deletar carrossel:', error)
      throw error
    } finally {
      set({ deletingCarousel: null })
    }
  },

  deleteSlides: async (auditId: string, index: number) => {
    set({ deletingSlides: index })
    try {
      const response = await fetch(`/api/content/${auditId}/carousels/${index}/slides`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao deletar slides')
      }

      // Limpar slides do carrossel no estado local
      const state = useContentCreation.getState()
      const newCarousels = [...state.carousels]
      if (newCarousels[index]) {
        newCarousels[index] = { ...newCarousels[index], slides: [] }
        set({ carousels: newCarousels })
      }
    } catch (error) {
      console.error('Erro ao deletar slides:', error)
      throw error
    } finally {
      set({ deletingSlides: null })
    }
  },

  reset: () => set(initialState),
      }),
      {
        name: 'content-creation-storage',
        partialize: (state) => ({
          // Persist apenas estados essenciais (não loadings/errors)
          currentPhase: state.currentPhase,
          quickStartMode: state.quickStartMode,
          selectedTemplate: state.selectedTemplate,
          selectedFormat: state.selectedFormat,
          selectedTheme: state.selectedTheme,
          customTheme: state.customTheme,
        }),
      }
    ),
    { name: 'ContentCreationStore' }
  )
)

// ===================
// SELECTORS OTIMIZADOS
// ===================
export const useCurrentPhase = () => useContentCreation((state) => state.currentPhase)
export const useCarousels = () => useContentCreation((state) => state.carousels)
export const useCurrentCarousel = () => {
  const carousels = useCarousels()
  const currentIndex = useContentCreation((state) => state.currentCarouselIndex)
  return carousels[currentIndex]
}
export const useApprovedCarousels = () => {
  const carousels = useCarousels()
  const approvedSet = useContentCreation((state) => state.approvedCarousels)
  return carousels.filter((_, index) => approvedSet.has(index))
}
export const useIsCarouselApproved = (index: number) =>
  useContentCreation((state) => state.approvedCarousels.has(index))
