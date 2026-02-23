'use client'

import { useState } from 'react'
import { Card } from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { Badge } from '@/components/atoms/badge'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TemplateId } from '@/types/content-creation'

interface Template {
  id: TemplateId
  name: string
  description: string
  preview: string
  objective: string
  ideal_for: string[]
  colors: string[]
  recommended?: boolean
}

const templates: Template[] = [
  {
    id: 'minimalist',
    name: 'Minimalista',
    description: 'Foco no conteúdo, texto legível, sem distrações',
    preview: '📄',
    objective: 'Educacional',
    ideal_for: ['Texto + Ícones', 'Frameworks', 'Listas', 'Passo a passo'],
    colors: ['Branco', 'Cinza', 'Preto'],
    recommended: true,
  },
  {
    id: 'bold-gradient',
    name: 'Bold Gradiente',
    description: 'Visual impactante com gradientes vibrantes',
    preview: '🎨',
    objective: 'Vendas',
    ideal_for: ['CTAs fortes', 'Ofertas', 'Lançamentos', 'Alta conversão'],
    colors: ['Roxo', 'Rosa', 'Laranja'],
  },
  {
    id: 'professional',
    name: 'Profissional',
    description: 'Clean, sério, transmite credibilidade',
    preview: '💼',
    objective: 'Autoridade',
    ideal_for: ['B2B', 'Consultoria', 'Cases', 'Resultados'],
    colors: ['Azul escuro', 'Cinza', 'Branco'],
  },
  {
    id: 'gradient',
    name: 'Gradiente Vibrante',
    description: 'Cores chamativas para maximizar paradas de scroll',
    preview: '🌈',
    objective: 'Viral',
    ideal_for: ['Alta retenção', 'Stories', 'Hooks', 'Engajamento'],
    colors: ['Múltiplas cores', 'Gradientes'],
  },
]

interface TemplateGalleryProps {
  onSelect: (templateId: TemplateId) => void
  onBack: () => void
}

export function TemplateGallery({ onSelect, onBack }: TemplateGalleryProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId | null>(null)

  const handleSelect = (templateId: TemplateId) => {
    setSelectedTemplate(templateId)
  }

  const handleConfirm = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate)
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Escolha um Template</h2>
          <p className="text-muted-foreground">
            Selecione o template visual ideal para seus carrosséis
          </p>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {templates.map((template) => {
          const isSelected = selectedTemplate === template.id

          return (
            <Card
              key={template.id}
              className={cn(
                'relative p-6 cursor-pointer transition-all duration-400',
                'hover:shadow-hover hover:scale-[1.02]',
                isSelected && 'ring-2 ring-primary-500 shadow-hover',
                template.recommended && 'border-2 border-primary-500'
              )}
              onClick={() => handleSelect(template.id)}
            >
              {/* Recommended badge */}
              {template.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="primary" className="shadow-sm">
                    RECOMENDADO
                  </Badge>
                </div>
              )}

              {/* Preview Icon */}
              <div className="text-center mb-4">
                <div className="text-6xl mb-2">{template.preview}</div>
                <h3 className="text-xl font-semibold text-foreground">{template.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
              </div>

              {/* Objective */}
              <div className="mb-4">
                <Badge variant="secondary" className="w-full justify-center">
                  {template.objective}
                </Badge>
              </div>

              {/* Ideal For */}
              <div className="mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase">
                  Ideal para:
                </p>
                <ul className="space-y-1">
                  {template.ideal_for.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-success-600" />
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Colors */}
              <div className="mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase">
                  Paleta de cores:
                </p>
                <div className="flex flex-wrap gap-2">
                  {template.colors.map((color, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {color}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Select Button */}
              <Button
                variant={isSelected ? 'primary' : 'secondary'}
                size="md"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation()
                  handleSelect(template.id)
                }}
              >
                {isSelected ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Selecionado
                  </>
                ) : (
                  'Selecionar'
                )}
              </Button>
            </Card>
          )
        })}
      </div>

      {/* Confirm Button */}
      {selectedTemplate && (
        <div className="flex justify-center pt-4">
          <Button
            variant="primary"
            size="lg"
            onClick={handleConfirm}
            className="min-w-[300px]"
          >
            Gerar Carrosséis com este Template
          </Button>
        </div>
      )}
    </div>
  )
}
