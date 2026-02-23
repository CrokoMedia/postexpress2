'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { Badge } from '@/components/atoms/badge'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TemplateId, LayoutFormat, ThemeMode } from '@/types/content-creation'

interface AdvancedConfigFormProps {
  auditId: string
  onSubmit: (config: AdvancedConfig) => void
  onBack: () => void
}

interface AdvancedConfig {
  template: TemplateId
  format: LayoutFormat
  theme: ThemeMode
  customTheme?: string
}

const templates: { id: TemplateId; name: string; emoji: string }[] = [
  { id: 'minimalist', name: 'Minimalista', emoji: '📄' },
  { id: 'bold-gradient', name: 'Bold Gradiente', emoji: '🎨' },
  { id: 'professional', name: 'Profissional', emoji: '💼' },
  { id: 'gradient', name: 'Gradiente', emoji: '🌈' },
]

const formats: { id: LayoutFormat; name: string; ratio: string; description: string }[] = [
  { id: 'feed', name: 'Feed', ratio: '4:5', description: 'Ideal para carrosséis tradicionais' },
  { id: 'story', name: 'Story', ratio: '9:16', description: 'Formato vertical para Reels' },
  { id: 'square', name: 'Quadrado', ratio: '1:1', description: 'Versátil para múltiplas plataformas' },
]

const themes: { id: ThemeMode; name: string; description: string }[] = [
  { id: 'light', name: 'Claro', description: 'Fundo claro, texto escuro' },
  { id: 'dark', name: 'Escuro', description: 'Fundo escuro, texto claro' },
]

export function AdvancedConfigForm({ auditId, onSubmit, onBack }: AdvancedConfigFormProps) {
  const [config, setConfig] = useState<AdvancedConfig>({
    template: 'minimalist',
    format: 'feed',
    theme: 'light',
  })

  const handleSubmit = () => {
    onSubmit(config)
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Modo Avançado</h2>
          <p className="text-muted-foreground">
            Configure cada detalhe dos seus carrosséis
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Template Visual */}
        <Card>
          <CardHeader>
            <CardTitle>1. Template Visual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setConfig({ ...config, template: template.id })}
                  className={cn(
                    'p-4 rounded-lg border-2 transition-all duration-200',
                    'hover:shadow-hover',
                    config.template === template.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-primary-300'
                  )}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{template.emoji}</div>
                    <p className="text-sm font-medium text-foreground">{template.name}</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Formato do Layout */}
        <Card>
          <CardHeader>
            <CardTitle>2. Formato do Layout</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {formats.map((format) => (
                <button
                  key={format.id}
                  onClick={() => setConfig({ ...config, format: format.id })}
                  className={cn(
                    'p-4 rounded-lg border-2 transition-all duration-200 text-left',
                    'hover:shadow-hover',
                    config.format === format.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-primary-300'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{format.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {format.ratio}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{format.description}</p>
                    </div>
                    {config.format === format.id && (
                      <Sparkles className="h-5 w-5 text-primary-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tema de Cores */}
        <Card>
          <CardHeader>
            <CardTitle>3. Tema de Cores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setConfig({ ...config, theme: theme.id })}
                  className={cn(
                    'p-4 rounded-lg border-2 transition-all duration-200 text-left',
                    'hover:shadow-hover',
                    config.theme === theme.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-primary-300'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{theme.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">{theme.description}</p>
                    </div>
                    {config.theme === theme.id && (
                      <Sparkles className="h-5 w-5 text-primary-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Resumo da Configuração */}
        <Card className="bg-info-50 dark:bg-info-900/20 border-info-200 dark:border-info-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-info-100 dark:bg-info-900/40">
                <Sparkles className="h-5 w-5 text-info-600 dark:text-info-400" />
              </div>
              <div>
                <p className="font-medium text-info-900 dark:text-info-100 mb-2">
                  Configuração Atual:
                </p>
                <ul className="space-y-1 text-sm text-info-700 dark:text-info-300">
                  <li>
                    <strong>Template:</strong>{' '}
                    {templates.find((t) => t.id === config.template)?.name}
                  </li>
                  <li>
                    <strong>Formato:</strong>{' '}
                    {formats.find((f) => f.id === config.format)?.name} (
                    {formats.find((f) => f.id === config.format)?.ratio})
                  </li>
                  <li>
                    <strong>Tema:</strong> {themes.find((t) => t.id === config.theme)?.name}
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-center pt-4">
          <Button variant="primary" size="lg" onClick={handleSubmit} className="min-w-[300px]">
            Gerar Carrosséis com esta Configuração
          </Button>
        </div>
      </div>
    </div>
  )
}
