'use client'

import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card'
import { Badge } from '@/components/atoms/badge'
import { Eye, Info } from 'lucide-react'
import type { TemplateId } from '@/remotion/templates'
import type { LayoutFormat } from '@/remotion/types'

interface CarouselPreviewGalleryProps {
  auditId: string
  carousels: Array<{
    carousel: any
    originalIndex: number
  }>
  templateId: TemplateId
  format: LayoutFormat
  theme: 'light' | 'dark'
}

export function CarouselPreviewGallery({
  auditId,
  carousels,
  templateId,
  format,
  theme,
}: CarouselPreviewGalleryProps) {
  if (carousels.length === 0) return null

  return (
    <Card className="border-info-500/30 bg-info-500/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Preview dos Slides
            </CardTitle>
            <CardDescription>
              Visualize como ficarão os slides antes de gerar (sem imagens IA)
            </CardDescription>
          </div>
          <Badge variant="info" className="text-xs">
            Preview Rápido
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Info Alert */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-info-500/10 border border-info-500/30 mb-6">
          <Info className="w-4 h-4 text-info-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-info-300">
            <strong>Este é apenas um preview rápido.</strong> As imagens serão geradas com IA
            quando você clicar em &quot;Gerar Slides&quot;. O preview mostra layout e texto.
          </p>
        </div>

        {/* Galeria de Previews por Carrossel */}
        <div className="space-y-8">
          {carousels.map(({ carousel, originalIndex }) => (
            <div key={originalIndex}>
              <div className="mb-4">
                <h4 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-1">{carousel.titulo}</h4>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      carousel.tipo === 'educacional'
                        ? 'info'
                        : carousel.tipo === 'vendas'
                        ? 'success'
                        : carousel.tipo === 'autoridade'
                        ? 'warning'
                        : 'neutral'
                    }
                    className="text-xs"
                  >
                    {carousel.tipo}
                  </Badge>
                  <span className="text-xs text-neutral-500">
                    {carousel.slides.length} slides
                  </span>
                </div>
              </div>

              {/* Grid de Slides */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {carousel.slides.map((slide: any, slideIndex: number) => {
                  // Gerar URL de preview
                  const previewUrl = `/api/content/${auditId}/preview-carousel?carouselIndex=${originalIndex}&slideIndex=${slideIndex}&templateId=${templateId}&format=${format}&theme=${theme}`

                  console.log('🎨 Preview URL:', previewUrl)

                  return (
                    <div key={slideIndex} className="relative group">
                      {/* Preview SVG */}
                      <div className="relative aspect-[4/5] rounded-lg border-2 border-dashed border-info-500/50 overflow-hidden bg-neutral-900/50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={previewUrl}
                          alt={`Preview Slide ${slideIndex + 1}`}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        />
                        {/* Overlay com número do slide */}
                        <div className="absolute top-2 left-2 bg-neutral-900/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                          {slideIndex + 1}
                        </div>
                        {/* Badge "Preview" no hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
                          <Badge variant="info" className="text-[10px]">
                            Preview
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
