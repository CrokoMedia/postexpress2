'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/atoms/button'
import { Input } from '@/components/atoms/input'
import { Textarea } from '@/components/atoms/textarea'
import { Badge } from '@/components/atoms/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/atoms/accordion'
import { LiveSlidePreview } from '@/components/molecules/live-slide-preview'
import { CarouselNavigator } from '@/components/molecules/carousel-navigator'
import {
  CheckCircle,
  XCircle,
  Pencil,
  Save,
  X,
  Image as ImageIcon,
  Wand2,
  Upload,
  ImageOff,
  Copy
} from 'lucide-react'
import type { Carousel, CarouselSlide } from '@/types/database'
import type {
  TemplateId,
  LayoutFormat,
  ThemeMode,
  SlideImageConfig
} from '@/types/content-creation'

interface SplitPreviewEditorProps {
  auditId: string
  carousels: Carousel[]
  currentIndex: number
  template: TemplateId
  format: LayoutFormat
  theme: ThemeMode
  slideImageConfigs: Map<number, Map<number, SlideImageConfig>>
  approvedCarousels: Set<number>
  onNavigate: (direction: 'prev' | 'next') => void
  onGoToCarousel: (index: number) => void
  onApprove: (index: number) => void
  onReject: (index: number) => void
  onEdit: (carouselIndex: number, slideIndex: number, changes: Partial<CarouselSlide>) => void
  onUpdateImageConfig: (carouselIndex: number, slideIndex: number, config: SlideImageConfig) => void
  onApplyBulkAction?: (carouselIndex: number, action: 'auto' | 'no_image' | 'custom_prompt' | 'upload') => void
}

export function SplitPreviewEditor({
  auditId,
  carousels,
  currentIndex,
  template,
  format,
  theme,
  slideImageConfigs,
  approvedCarousels,
  onNavigate,
  onGoToCarousel,
  onApprove,
  onReject,
  onEdit,
  onUpdateImageConfig,
  onApplyBulkAction
}: SplitPreviewEditorProps) {
  const [expandedSlides, setExpandedSlides] = useState<string[]>([])
  const [editingSlide, setEditingSlide] = useState<number | null>(null)
  const [editBuffer, setEditBuffer] = useState<Partial<CarouselSlide>>({})
  const [previewSlideIndex, setPreviewSlideIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [activeTab, setActiveTab] = useState<'content' | 'preview'>('content')

  const currentCarousel = carousels[currentIndex]
  const carouselTitles = carousels.map(c => c.titulo)
  const currentSlideConfigs = slideImageConfigs.get(currentIndex) || new Map()

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        onNavigate('prev')
      } else if (e.key === 'ArrowRight' && currentIndex < carousels.length - 1) {
        onNavigate('next')
      } else if (e.key === 'Enter' && !approvedCarousels.has(currentIndex)) {
        onApprove(currentIndex)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, carousels.length, approvedCarousels, onNavigate, onApprove])

  // Start editing slide
  const startEditing = useCallback((slideIndex: number) => {
    setEditingSlide(slideIndex)
    setEditBuffer(currentCarousel.slides[slideIndex])
  }, [currentCarousel])

  // Save slide edits
  const saveEdits = useCallback(() => {
    if (editingSlide !== null && editBuffer) {
      onEdit(currentIndex, editingSlide, editBuffer)
      setEditingSlide(null)
      setEditBuffer({})
    }
  }, [editingSlide, editBuffer, currentIndex, onEdit])

  // Cancel editing
  const cancelEditing = useCallback(() => {
    setEditingSlide(null)
    setEditBuffer({})
  }, [])

  // Toggle accordion item
  const toggleSlide = useCallback((slideId: string) => {
    setExpandedSlides(prev =>
      prev.includes(slideId)
        ? prev.filter(id => id !== slideId)
        : [...prev, slideId]
    )
  }, [])

  // Update image config
  const updateImageConfig = useCallback((slideIndex: number, mode: SlideImageConfig['mode']) => {
    onUpdateImageConfig(currentIndex, slideIndex, { mode })
  }, [currentIndex, onUpdateImageConfig])

  // Render content panel (left side)
  const renderContentPanel = () => (
    <div className="h-full overflow-y-auto p-6 space-y-4">
      {/* Bulk actions */}
      {onApplyBulkAction && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Ações em Massa</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onApplyBulkAction(currentIndex, 'auto')}
              className="gap-2"
            >
              <Wand2 className="w-4 h-4" />
              IA em todos
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onApplyBulkAction(currentIndex, 'no_image')}
              className="gap-2"
            >
              <ImageOff className="w-4 h-4" />
              Sem imagem
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onApplyBulkAction(currentIndex, 'upload')}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload em todos
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Slides accordion */}
      <Accordion
        type="multiple"
        value={expandedSlides}
        onValueChange={setExpandedSlides}
        className="space-y-2"
      >
        {currentCarousel.slides.map((slide, slideIndex) => {
          const slideId = `slide-${slideIndex}`
          const isEditing = editingSlide === slideIndex
          const imageConfig = currentSlideConfigs.get(slideIndex) || { mode: 'auto' }

          return (
            <AccordionItem key={slideId} value={slideId} className="border rounded-lg">
              <AccordionTrigger
                onClick={() => {
                  toggleSlide(slideId)
                  setPreviewSlideIndex(slideIndex)
                }}
                className="px-4"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Badge variant="neutral">
                    Slide {slideIndex + 1}
                  </Badge>
                  <span className="text-left truncate">{slide.titulo}</span>
                  <Badge variant="neutral" className="ml-auto">
                    {slide.tipo}
                  </Badge>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-4 pb-4 space-y-4">
                {/* Slide content editor */}
                <div className="space-y-3">
                  {/* Title */}
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Título
                    </label>
                    {isEditing ? (
                      <Input
                        value={editBuffer.titulo || ''}
                        onChange={(e) => setEditBuffer({ ...editBuffer, titulo: e.target.value })}
                        placeholder="Título do slide"
                      />
                    ) : (
                      <p className="text-sm p-2 bg-neutral-50 dark:bg-neutral-900 rounded">
                        {slide.titulo}
                      </p>
                    )}
                  </div>

                  {/* Body */}
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Corpo
                    </label>
                    {isEditing ? (
                      <Textarea
                        value={editBuffer.corpo || ''}
                        onChange={(e) => setEditBuffer({ ...editBuffer, corpo: e.target.value })}
                        placeholder="Conteúdo do slide"
                        rows={4}
                      />
                    ) : (
                      <p className="text-sm p-2 bg-neutral-50 dark:bg-neutral-900 rounded whitespace-pre-wrap">
                        {slide.corpo}
                      </p>
                    )}
                  </div>

                  {/* Image config */}
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Configuração de Imagem
                    </label>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={imageConfig.mode === 'auto' ? 'default' : 'outline'}
                        onClick={() => updateImageConfig(slideIndex, 'auto')}
                        className="gap-2"
                      >
                        <Wand2 className="w-3 h-3" />
                        Auto
                      </Button>
                      <Button
                        size="sm"
                        variant={imageConfig.mode === 'custom_prompt' ? 'default' : 'outline'}
                        onClick={() => updateImageConfig(slideIndex, 'custom_prompt')}
                        className="gap-2"
                      >
                        <Pencil className="w-3 h-3" />
                        Custom
                      </Button>
                      <Button
                        size="sm"
                        variant={imageConfig.mode === 'upload' ? 'default' : 'outline'}
                        onClick={() => updateImageConfig(slideIndex, 'upload')}
                        className="gap-2"
                      >
                        <Upload className="w-3 h-3" />
                        Upload
                      </Button>
                      <Button
                        size="sm"
                        variant={imageConfig.mode === 'no_image' ? 'default' : 'outline'}
                        onClick={() => updateImageConfig(slideIndex, 'no_image')}
                        className="gap-2"
                      >
                        <ImageOff className="w-3 h-3" />
                        Sem
                      </Button>
                    </div>

                    {imageConfig.mode === 'custom_prompt' && (
                      <Input
                        className="mt-2"
                        placeholder="Descreva a imagem que deseja..."
                        value={imageConfig.customPrompt || ''}
                        onChange={(e) => onUpdateImageConfig(currentIndex, slideIndex, {
                          mode: 'custom_prompt',
                          customPrompt: e.target.value
                        })}
                      />
                    )}
                  </div>

                  {/* Edit/Save buttons */}
                  <div className="flex gap-2 pt-2">
                    {isEditing ? (
                      <>
                        <Button
                          size="sm"
                          onClick={saveEdits}
                          className="gap-2"
                        >
                          <Save className="w-3 h-3" />
                          Salvar
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={cancelEditing}
                          className="gap-2"
                        >
                          <X className="w-3 h-3" />
                          Cancelar
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => startEditing(slideIndex)}
                        className="gap-2"
                      >
                        <Pencil className="w-3 h-3" />
                        Editar
                      </Button>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>

      {/* Caption & Hashtags */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Caption & Hashtags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Caption</label>
            <p className="text-sm p-2 bg-neutral-50 dark:bg-neutral-900 rounded whitespace-pre-wrap">
              {currentCarousel.caption}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Hashtags</label>
            <div className="flex flex-wrap gap-1">
              {currentCarousel.hashtags.map((tag, i) => (
                <Badge key={i} variant="neutral" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Render preview panel (right side)
  const renderPreviewPanel = () => (
    <div className="h-full overflow-y-auto p-6 bg-neutral-50 dark:bg-neutral-900">
      <div className="max-w-md mx-auto space-y-4">
        {/* Preview controls */}
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Preview ao Vivo</h4>
          <div className="flex gap-2">
            {currentCarousel.slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setPreviewSlideIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === previewSlideIndex
                    ? 'w-6 bg-primary-500'
                    : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
                title={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Live preview */}
        <LiveSlidePreview
          slide={currentCarousel.slides[previewSlideIndex]}
          slideIndex={previewSlideIndex}
          template={template}
          format={format}
          theme={theme}
          imageConfig={currentSlideConfigs.get(previewSlideIndex) || { mode: 'auto' }}
        />

        {/* Slide info */}
        <div className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
          Slide {previewSlideIndex + 1} de {currentCarousel.slides.length} • {template} • {format}
        </div>
      </div>
    </div>
  )

  return (
    <div className="h-full flex flex-col">
      {/* Header with navigator */}
      <div className="border-b p-4 bg-white dark:bg-neutral-950">
        <CarouselNavigator
          currentIndex={currentIndex}
          total={carousels.length}
          carouselTitles={carouselTitles}
          approvedIndices={approvedCarousels}
          onNavigate={onNavigate}
          onGoTo={onGoToCarousel}
        />

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          {approvedCarousels.has(currentIndex) ? (
            <Button
              variant="secondary"
              onClick={() => onReject(currentIndex)}
              className="gap-2"
            >
              <XCircle className="w-4 h-4" />
              Remover Aprovação
            </Button>
          ) : (
            <>
              <Button
                onClick={() => onApprove(currentIndex)}
                className="gap-2 flex-1"
              >
                <CheckCircle className="w-4 h-4" />
                Aprovar Carrossel
              </Button>
              <Button
                variant="secondary"
                onClick={() => onReject(currentIndex)}
                className="gap-2"
              >
                <XCircle className="w-4 h-4" />
                Rejeitar
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Split view / Mobile tabs */}
      <div className="flex-1 overflow-hidden">
        {isMobile ? (
          // Mobile: Tabs
          <div className="h-full flex flex-col">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('content')}
                className={`flex-1 py-3 text-sm font-medium ${
                  activeTab === 'content'
                    ? 'border-b-2 border-primary-500 text-primary-500'
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                📝 Conteúdo
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex-1 py-3 text-sm font-medium ${
                  activeTab === 'preview'
                    ? 'border-b-2 border-primary-500 text-primary-500'
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                👁️ Preview
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {activeTab === 'content' ? renderContentPanel() : renderPreviewPanel()}
            </div>
          </div>
        ) : (
          // Desktop: Split view 50/50
          <div className="h-full flex">
            <div className="w-1/2 border-r overflow-hidden">
              {renderContentPanel()}
            </div>
            <div className="w-1/2 overflow-hidden">
              {renderPreviewPanel()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
