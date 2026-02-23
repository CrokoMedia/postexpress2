import { create } from 'zustand'
import type {
  QuickStartMode,
  TemplateId,
  LayoutFormat,
  ThemeMode,
  Carousel,
  SlideImageConfig,
} from '@/types/content-creation'

export interface ContentCreationState {
  // Navegação
  currentPhase: 1 | 2 | 3

  // Fase 1: Criar
  quickStartMode: QuickStartMode | null
  selectedTemplate: TemplateId | null
  selectedFormat: LayoutFormat
  selectedTheme: ThemeMode
  customTheme: string

  // Fase 2: Refinar
  carousels: Carousel[]
  currentCarouselIndex: number
  slideImageConfigs: Map<number, Map<number, SlideImageConfig>>
  approvedCarousels: Set<number>

  // Fase 3: Exportar
  generatedSlides: any | null
  isGenerating: boolean

  // Ações de Navegação
  goToPhase: (phase: 1 | 2 | 3) => void
  nextPhase: () => void
  previousPhase: () => void

  // Ações
  setQuickStartMode: (mode: QuickStartMode | null) => void
  setTemplate: (template: TemplateId | null) => void
  setFormat: (format: LayoutFormat) => void
  setTheme: (theme: ThemeMode) => void
  setCustomTheme: (theme: string) => void
  setCarousels: (carousels: Carousel[]) => void
  setCurrentCarouselIndex: (index: number) => void
  updateSlideImageConfig: (
    carouselIndex: number,
    slideIndex: number,
    config: SlideImageConfig
  ) => void
  updateCarousel: (index: number, changes: Partial<Carousel>) => void
  approveCarousel: (index: number) => void
  rejectCarousel: (index: number) => void
  setGeneratedSlides: (slides: any) => void
  setGenerating: (isGenerating: boolean) => void
  reset: () => void
}

const initialState = {
  currentPhase: 1 as 1 | 2 | 3,
  quickStartMode: null,
  selectedTemplate: null,
  selectedFormat: 'feed' as LayoutFormat,
  selectedTheme: 'light' as ThemeMode,
  customTheme: '',
  carousels: [],
  currentCarouselIndex: 0,
  slideImageConfigs: new Map(),
  approvedCarousels: new Set<number>(),
  generatedSlides: null,
  isGenerating: false,
}

export const useContentCreation = create<ContentCreationState>((set) => ({
  ...initialState,

  // Navegação entre fases
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

  // Implementações das ações
  setQuickStartMode: (mode) => set({ quickStartMode: mode }),

  setTemplate: (template) => set({ selectedTemplate: template }),

  setFormat: (format) => set({ selectedFormat: format }),

  setTheme: (theme) => set({ selectedTheme: theme }),

  setCustomTheme: (theme) => set({ customTheme: theme }),

  setCarousels: (carousels) => set({ carousels }),

  setCurrentCarouselIndex: (index) => set({ currentCarouselIndex: index }),

  updateSlideImageConfig: (carouselIndex, slideIndex, config) =>
    set((state) => {
      const newConfigs = new Map(state.slideImageConfigs)
      if (!newConfigs.has(carouselIndex)) {
        newConfigs.set(carouselIndex, new Map())
      }
      newConfigs.get(carouselIndex)!.set(slideIndex, config)
      return { slideImageConfigs: newConfigs }
    }),

  updateCarousel: (index, changes) =>
    set((state) => {
      const newCarousels = [...state.carousels]
      newCarousels[index] = { ...newCarousels[index], ...changes }
      return { carousels: newCarousels }
    }),

  approveCarousel: (index) =>
    set((state) => {
      const newApproved = new Set(state.approvedCarousels)
      newApproved.add(index)

      // Atualizar também a flag approved no carrossel
      const newCarousels = [...state.carousels]
      if (newCarousels[index]) {
        newCarousels[index] = { ...newCarousels[index], approved: true }
      }

      return {
        approvedCarousels: newApproved,
        carousels: newCarousels,
      }
    }),

  rejectCarousel: (index) =>
    set((state) => {
      const newApproved = new Set(state.approvedCarousels)
      newApproved.delete(index)

      // Atualizar também a flag approved no carrossel
      const newCarousels = [...state.carousels]
      if (newCarousels[index]) {
        newCarousels[index] = { ...newCarousels[index], approved: false }
      }

      return {
        approvedCarousels: newApproved,
        carousels: newCarousels,
      }
    }),

  setGeneratedSlides: (slides) => set({ generatedSlides: slides }),

  setGenerating: (isGenerating) => set({ isGenerating }),

  reset: () => set(initialState),
}))
