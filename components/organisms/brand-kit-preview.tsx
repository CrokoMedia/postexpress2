'use client'

import { Card } from '@/components/atoms/card'
import Image from 'next/image'
import type { BrandKit } from '@/types/database'

interface BrandKitPreviewProps {
  brandKit: Partial<BrandKit>
}

export function BrandKitPreview({ brandKit }: BrandKitPreviewProps) {
  // Cores padrão caso não estejam definidas
  const primaryColor = brandKit.primary_color || '#8B5CF6'
  const secondaryColor = brandKit.secondary_color || '#EC4899'
  const accentColor = brandKit.accent_color || '#F59E0B'
  const backgroundColor = brandKit.background_color || '#FFFFFF'
  const textColor = brandKit.text_color || '#1F2937'

  // Fontes padrão
  const primaryFont = brandKit.primary_font || 'Inter'
  const secondaryFont = brandKit.secondary_font || 'Inter'

  // Verificar se há gradiente (primary + secondary)
  const hasGradient = brandKit.primary_color && brandKit.secondary_color
  const backgroundStyle = hasGradient
    ? { background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }
    : { backgroundColor: primaryColor }

  return (
    <Card className="p-6 max-w-sm w-full border border-neutral-200 dark:border-neutral-700">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground mb-1">Preview do Brand Kit</h3>
        <p className="text-xs text-muted-foreground">
          Visualização em tempo real do seu slide Instagram
        </p>
      </div>

      {/* Mockup do Slide Instagram (1080x1080) */}
      <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-lg">
        {/* Background com cor ou gradiente */}
        <div
          className="absolute inset-0 transition-all duration-300"
          style={backgroundStyle}
        />

        {/* Conteúdo do Slide */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-8 text-center">
          {/* Logo (se fornecido) */}
          {brandKit.logo_url && (
            <div className="mb-6 relative w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center overflow-hidden">
              <Image
                src={brandKit.logo_url}
                alt="Logo"
                width={64}
                height={64}
                className="object-contain"
                unoptimized
              />
            </div>
          )}

          {/* Heading principal */}
          <h1
            className="text-3xl font-bold mb-4 transition-all duration-300"
            style={{
              fontFamily: primaryFont,
              color: backgroundColor,
            }}
          >
            {brandKit.brand_name || 'Sua Marca'}
          </h1>

          {/* Texto de destaque com accent color */}
          <p
            className="text-lg font-semibold mb-3 transition-all duration-300"
            style={{
              fontFamily: secondaryFont,
              color: accentColor,
            }}
          >
            Transforme seu conteúdo
          </p>

          {/* Body text */}
          <p
            className="text-sm leading-relaxed max-w-xs transition-all duration-300"
            style={{
              fontFamily: secondaryFont,
              color: backgroundColor,
              opacity: 0.9,
            }}
          >
            Este é um exemplo de como seu brand kit ficará aplicado aos conteúdos gerados pelos squads.
          </p>

          {/* CTA Badge */}
          <div
            className="mt-6 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all duration-300"
            style={{
              backgroundColor: accentColor,
              color: textColor,
            }}
          >
            Saiba Mais
          </div>
        </div>

        {/* Overlay sutil para melhorar legibilidade */}
        <div className="absolute inset-0 bg-black/5" />
      </div>

      {/* Legenda de cores */}
      <div className="mt-4 grid grid-cols-5 gap-2">
        {brandKit.primary_color && (
          <div className="flex flex-col items-center gap-1">
            <div
              className="w-8 h-8 rounded-md border border-neutral-300 dark:border-neutral-600 transition-all duration-300"
              style={{ backgroundColor: primaryColor }}
            />
            <span className="text-[10px] text-muted-foreground">Primary</span>
          </div>
        )}
        {brandKit.secondary_color && (
          <div className="flex flex-col items-center gap-1">
            <div
              className="w-8 h-8 rounded-md border border-neutral-300 dark:border-neutral-600 transition-all duration-300"
              style={{ backgroundColor: secondaryColor }}
            />
            <span className="text-[10px] text-muted-foreground">Secondary</span>
          </div>
        )}
        {brandKit.accent_color && (
          <div className="flex flex-col items-center gap-1">
            <div
              className="w-8 h-8 rounded-md border border-neutral-300 dark:border-neutral-600 transition-all duration-300"
              style={{ backgroundColor: accentColor }}
            />
            <span className="text-[10px] text-muted-foreground">Accent</span>
          </div>
        )}
        {brandKit.background_color && (
          <div className="flex flex-col items-center gap-1">
            <div
              className="w-8 h-8 rounded-md border border-neutral-300 dark:border-neutral-600 transition-all duration-300"
              style={{ backgroundColor }}
            />
            <span className="text-[10px] text-muted-foreground">BG</span>
          </div>
        )}
        {brandKit.text_color && (
          <div className="flex flex-col items-center gap-1">
            <div
              className="w-8 h-8 rounded-md border border-neutral-300 dark:border-neutral-600 transition-all duration-300"
              style={{ backgroundColor: textColor }}
            />
            <span className="text-[10px] text-muted-foreground">Text</span>
          </div>
        )}
      </div>

      {/* Info de fontes */}
      {(brandKit.primary_font || brandKit.secondary_font) && (
        <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            {brandKit.primary_font && (
              <div className="flex justify-between">
                <span>Heading:</span>
                <span className="font-semibold">{brandKit.primary_font}</span>
              </div>
            )}
            {brandKit.secondary_font && (
              <div className="flex justify-between">
                <span>Body:</span>
                <span className="font-semibold">{brandKit.secondary_font}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}
