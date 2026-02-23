'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { ColorPicker } from '@/components/atoms/color-picker'
import { FontSelector } from '@/components/atoms/font-selector'
import { TagInput } from '@/components/atoms/tag-input'
import { X, Upload, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

// ============================================
// TYPES (temporários até Task #2 finalizar)
// ============================================

interface ToneOfVoice {
  characteristics?: string[]
  examples?: string[]
  avoid?: string[]
}

interface BrandKit {
  id: string
  profile_id: string
  brand_name: string
  is_default: boolean
  primary_color: string | null
  secondary_color: string | null
  accent_color: string | null
  background_color: string | null
  text_color: string | null
  logo_url: string | null
  logo_public_id: string | null
  primary_font: string | null
  secondary_font: string | null
  tone_of_voice: ToneOfVoice | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

interface BrandKitFormData {
  brand_name: string
  // Visual Identity
  logo_url: string | null
  logo_public_id: string | null
  primary_color: string
  secondary_color: string
  accent_color: string
  primary_font: string
  secondary_font: string
  color_palette: Array<{ name: string; color: string }>
  // Verbal Identity
  tone_of_voice: string[]
  keywords: string[]
  mission: string
  target_audience: string
  // Business Info
  nicho: string
  website: string
  instagram: string
  linktree: string
  default_ctas: string[]
}

interface BrandKitFormModalProps {
  isOpen: boolean
  onClose: () => void
  profileId: string
  editingKit?: BrandKit | null
  onSuccess?: () => void
}

// ============================================
// SIMPLE PREVIEW (mockup temporário)
// ============================================

function SimplePreview({ formData }: { formData: BrandKitFormData }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
        Preview
      </h3>

      {/* Logo Preview */}
      {formData.logo_url && (
        <div className="flex justify-center p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
          <img
            src={formData.logo_url}
            alt="Logo preview"
            className="max-h-20 object-contain"
          />
        </div>
      )}

      {/* Color Palette */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Cores</p>
        <div className="flex gap-2">
          {formData.primary_color && (
            <div
              className="w-12 h-12 rounded-lg border-2 border-neutral-300 dark:border-neutral-600"
              style={{ backgroundColor: formData.primary_color }}
              title="Primary"
            />
          )}
          {formData.secondary_color && (
            <div
              className="w-12 h-12 rounded-lg border-2 border-neutral-300 dark:border-neutral-600"
              style={{ backgroundColor: formData.secondary_color }}
              title="Secondary"
            />
          )}
          {formData.accent_color && (
            <div
              className="w-12 h-12 rounded-lg border-2 border-neutral-300 dark:border-neutral-600"
              style={{ backgroundColor: formData.accent_color }}
              title="Accent"
            />
          )}
        </div>
      </div>

      {/* Fonts Preview */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Fontes</p>
        {formData.primary_font && (
          <p
            className="text-lg font-semibold text-neutral-900 dark:text-neutral-100"
            style={{ fontFamily: formData.primary_font }}
          >
            {formData.primary_font}
          </p>
        )}
        {formData.secondary_font && (
          <p
            className="text-sm text-neutral-700 dark:text-neutral-300"
            style={{ fontFamily: formData.secondary_font }}
          >
            {formData.secondary_font}
          </p>
        )}
      </div>

      {/* Brand Info */}
      {formData.brand_name && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Nome da Marca</p>
          <p className="text-sm text-neutral-900 dark:text-neutral-100">{formData.brand_name}</p>
        </div>
      )}

      {formData.tone_of_voice.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Tom de Voz</p>
          <p className="text-xs text-neutral-700 dark:text-neutral-300">{formData.tone_of_voice.join(', ')}</p>
        </div>
      )}
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export function BrandKitFormModal({
  isOpen,
  onClose,
  profileId,
  editingKit,
  onSuccess,
}: BrandKitFormModalProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Accordion state
  const [expandedSections, setExpandedSections] = useState({
    visual: true,
    verbal: false,
    business: false,
  })

  // Form data
  const [formData, setFormData] = useState<BrandKitFormData>({
    brand_name: '',
    logo_url: null,
    logo_public_id: null,
    primary_color: '#6366f1',
    secondary_color: '#8b5cf6',
    accent_color: '#ec4899',
    primary_font: 'Inter',
    secondary_font: 'Roboto',
    color_palette: [],
    tone_of_voice: [],
    keywords: [],
    mission: '',
    target_audience: '',
    nicho: '',
    website: '',
    instagram: '',
    linktree: '',
    default_ctas: [],
  })

  // Load editing kit data
  useEffect(() => {
    if (editingKit) {
      setFormData({
        brand_name: editingKit.brand_name,
        logo_url: editingKit.logo_url,
        logo_public_id: editingKit.logo_public_id,
        primary_color: editingKit.primary_color || '#6366f1',
        secondary_color: editingKit.secondary_color || '#8b5cf6',
        accent_color: editingKit.accent_color || '#ec4899',
        primary_font: editingKit.primary_font || 'Inter',
        secondary_font: editingKit.secondary_font || 'Roboto',
        color_palette: [],
        tone_of_voice: editingKit.tone_of_voice?.characteristics || [],
        keywords: [],
        mission: '',
        target_audience: '',
        nicho: '',
        website: '',
        instagram: '',
        linktree: '',
        default_ctas: [],
      })
    }
  }, [editingKit])

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Logo upload handlers
  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 5MB.')
      return
    }

    setIsUploadingLogo(true)

    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('folder', `post-express/brand-kits/${profileId}`)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      })

      if (!response.ok) {
        throw new Error('Erro ao fazer upload da imagem')
      }

      const data = await response.json()

      setFormData((prev) => ({
        ...prev,
        logo_url: data.secure_url,
        logo_public_id: data.public_id,
      }))

      toast.success('Logo enviada com sucesso!')
    } catch (error) {
      console.error('Erro no upload:', error)
      toast.error('Erro ao enviar logo')
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  // Form submission
  const handleSubmit = async () => {
    // Validações client-side
    if (!formData.brand_name.trim()) {
      toast.error('Nome da marca é obrigatório')
      return
    }

    setIsSaving(true)

    try {
      const payload = {
        profile_id: profileId,
        brand_name: formData.brand_name,
        primary_color: formData.primary_color,
        secondary_color: formData.secondary_color,
        accent_color: formData.accent_color,
        logo_url: formData.logo_url,
        logo_public_id: formData.logo_public_id,
        primary_font: formData.primary_font,
        secondary_font: formData.secondary_font,
        tone_of_voice: {
          characteristics: formData.tone_of_voice,
          examples: [],
          avoid: [],
        },
      }

      const url = editingKit
        ? `/api/brand-kits/${editingKit.id}`
        : '/api/brand-kits'

      const method = editingKit ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao salvar Brand Kit')
      }

      toast.success(editingKit ? 'Brand Kit atualizado!' : 'Brand Kit criado!')
      onSuccess?.()
      onClose()
    } catch (error: any) {
      console.error('Erro ao salvar:', error)
      toast.error(error.message || 'Erro ao salvar Brand Kit')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full h-[80vh] max-w-7xl mx-4 bg-white dark:bg-neutral-900 rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            {editingKit ? 'Editar Brand Kit' : 'Novo Brand Kit'}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col lg:flex-row h-[calc(80vh-140px)] overflow-hidden">
          {/* Form (60%) */}
          <div className="w-full lg:w-3/5 p-6 overflow-y-auto">
            <div className="space-y-4">
              {/* Brand Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Nome da Marca *
                </label>
                <input
                  type="text"
                  value={formData.brand_name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, brand_name: e.target.value }))
                  }
                  placeholder="Ex: Minha Marca"
                  className="flex h-10 w-full rounded-input border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500 transition-colors duration-400"
                />
              </div>

              {/* 1. Visual Identity */}
              <Card>
                <button
                  type="button"
                  onClick={() => toggleSection('visual')}
                  className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                    1. Visual Identity
                  </h3>
                  {expandedSections.visual ? (
                    <ChevronUp className="h-5 w-5 text-neutral-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-neutral-500" />
                  )}
                </button>

                {expandedSections.visual && (
                  <CardContent className="space-y-4 pt-0">
                    {/* Logo Upload */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        Logo
                      </label>
                      <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                          'flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
                          isDragging
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 hover:border-primary-500 dark:hover:border-primary-400'
                        )}
                      >
                        {isUploadingLogo ? (
                          <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
                        ) : formData.logo_url ? (
                          <img
                            src={formData.logo_url}
                            alt="Logo"
                            className="max-h-32 object-contain"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <Upload className="h-8 w-8 text-neutral-400" />
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                              Arraste ou clique para enviar
                            </p>
                            <p className="text-xs text-neutral-500">
                              PNG, JPG até 5MB
                            </p>
                          </div>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileSelect(file)
                        }}
                        className="hidden"
                      />
                    </div>

                    {/* Colors */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <ColorPicker
                        label="Cor Primária"
                        value={formData.primary_color}
                        onChange={(value) =>
                          setFormData((prev) => ({ ...prev, primary_color: value }))
                        }
                      />
                      <ColorPicker
                        label="Cor Secundária"
                        value={formData.secondary_color}
                        onChange={(value) =>
                          setFormData((prev) => ({ ...prev, secondary_color: value }))
                        }
                      />
                      <ColorPicker
                        label="Cor de Destaque"
                        value={formData.accent_color}
                        onChange={(value) =>
                          setFormData((prev) => ({ ...prev, accent_color: value }))
                        }
                      />
                    </div>

                    {/* Fonts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FontSelector
                        label="Fonte Principal"
                        value={formData.primary_font}
                        onChange={(value) =>
                          setFormData((prev) => ({ ...prev, primary_font: value }))
                        }
                      />
                      <FontSelector
                        label="Fonte Secundária"
                        value={formData.secondary_font}
                        onChange={(value) =>
                          setFormData((prev) => ({ ...prev, secondary_font: value }))
                        }
                      />
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* 2. Verbal Identity */}
              <Card>
                <button
                  type="button"
                  onClick={() => toggleSection('verbal')}
                  className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                    2. Verbal Identity
                  </h3>
                  {expandedSections.verbal ? (
                    <ChevronUp className="h-5 w-5 text-neutral-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-neutral-500" />
                  )}
                </button>

                {expandedSections.verbal && (
                  <CardContent className="space-y-4 pt-0">
                    <TagInput
                      value={formData.tone_of_voice}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, tone_of_voice: value }))
                      }
                      placeholder="Ex: informal, educativo, inspirador..."
                    />

                    <TagInput
                      value={formData.keywords}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, keywords: value }))
                      }
                      placeholder="Palavras-chave da marca..."
                    />

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        Missão
                      </label>
                      <textarea
                        value={formData.mission}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, mission: e.target.value }))
                        }
                        placeholder="Qual é a missão da sua marca?"
                        rows={3}
                        className="flex w-full rounded-input border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500 transition-colors duration-400 resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        Público-Alvo
                      </label>
                      <textarea
                        value={formData.target_audience}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, target_audience: e.target.value }))
                        }
                        placeholder="Quem é seu público-alvo?"
                        rows={3}
                        className="flex w-full rounded-input border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500 transition-colors duration-400 resize-none"
                      />
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* 3. Business Info */}
              <Card>
                <button
                  type="button"
                  onClick={() => toggleSection('business')}
                  className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                    3. Business Info
                  </h3>
                  {expandedSections.business ? (
                    <ChevronUp className="h-5 w-5 text-neutral-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-neutral-500" />
                  )}
                </button>

                {expandedSections.business && (
                  <CardContent className="space-y-4 pt-0">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        Nicho
                      </label>
                      <input
                        type="text"
                        value={formData.nicho}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, nicho: e.target.value }))
                        }
                        placeholder="Ex: Marketing Digital"
                        className="flex h-10 w-full rounded-input border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500 transition-colors duration-400"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          Website
                        </label>
                        <input
                          type="url"
                          value={formData.website}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, website: e.target.value }))
                          }
                          placeholder="https://..."
                          className="flex h-10 w-full rounded-input border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500 transition-colors duration-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          Instagram
                        </label>
                        <input
                          type="text"
                          value={formData.instagram}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, instagram: e.target.value }))
                          }
                          placeholder="@username"
                          className="flex h-10 w-full rounded-input border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500 transition-colors duration-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        Linktree
                      </label>
                      <input
                        type="url"
                        value={formData.linktree}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, linktree: e.target.value }))
                        }
                        placeholder="https://linktr.ee/..."
                        className="flex h-10 w-full rounded-input border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500 transition-colors duration-400"
                      />
                    </div>

                    <TagInput
                      value={formData.default_ctas}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, default_ctas: value }))
                      }
                      placeholder="CTAs padrão (Ex: Compre agora, Saiba mais...)"
                    />
                  </CardContent>
                )}
              </Card>
            </div>
          </div>

          {/* Preview (40%) - Desktop only */}
          <div className="hidden lg:block w-2/5 p-6 border-l border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 overflow-y-auto">
            <SimplePreview formData={formData} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200 dark:border-neutral-800">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Salvando...
              </>
            ) : (
              'Salvar'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
