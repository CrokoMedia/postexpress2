// Types para Content Creation Flow
// Referência: docs/ux/content-creation-flow-optimization.md

export type QuickStartMode = 'smart' | 'template' | 'advanced'
export type TemplateId = 'minimalist' | 'bold-gradient' | 'professional' | 'modern' | 'clean' | 'gradient'
export type LayoutFormat = 'feed' | 'story' | 'square'
export type ThemeMode = 'light' | 'dark'

export interface SlideImageConfig {
  mode: 'auto' | 'custom_prompt' | 'upload' | 'no_image'
  customPrompt?: string
  uploadUrl?: string
}

export interface Slide {
  numero: number
  tipo: SlideType
  titulo: string
  corpo: string
  notas_design?: string
}

export type SlideType = 'hook' | 'conteudo' | 'contexto' | 'ponto' | 'aplicacao' | 'cta' | 'closer'

export interface Carousel {
  titulo: string
  tipo: string
  objetivo: string
  baseado_em: string
  slides: Slide[]
  caption: string
  hashtags: string[]
  cta: string
  approved?: boolean
}

export interface QuickStartOption {
  id: QuickStartMode
  title: string
  description: string
  estimatedTime: string
  features: string[]
  recommended?: boolean
}

export interface ContentCreationConfig {
  template: TemplateId
  format: LayoutFormat
  theme: ThemeMode
  customTheme?: string
  imageStrategy: Record<number, Record<number, SlideImageConfig>>
}

export interface ProgressStep {
  id: number
  title: string
  status: 'pending' | 'current' | 'completed'
}
