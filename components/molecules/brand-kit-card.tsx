'use client'

import { useState } from 'react'
import { Card } from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { Badge } from '@/components/atoms/badge'
import { Pencil, Trash2, Star } from 'lucide-react'
import Image from 'next/image'
import type { BrandKit } from '@/types/database'

interface BrandKitCardProps {
  brandKit: BrandKit
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onSetDefault?: (id: string) => void
}

export function BrandKitCard({
  brandKit,
  onEdit,
  onDelete,
  onSetDefault
}: BrandKitCardProps) {
  const [imageError, setImageError] = useState(false)

  const logoUrl = brandKit.logo_url
  const hasLogo = logoUrl && !imageError

  // Pegar até 4 cores para preview
  const previewColors = [
    brandKit.primary_color,
    brandKit.secondary_color,
    brandKit.accent_color,
    brandKit.background_color
  ].filter(Boolean) as string[]

  return (
    <Card className="p-6 cursor-pointer group hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-4">
        {/* Logo thumbnail */}
        <div className="relative h-20 w-20 rounded-lg bg-neutral-100 dark:bg-neutral-700 shrink-0 overflow-hidden border-2 border-neutral-200 dark:border-neutral-600 group-hover:border-primary-500 transition-all duration-400">
          {hasLogo ? (
            <Image
              src={logoUrl}
              alt={brandKit.brand_name}
              fill
              className="object-contain p-2"
              onError={() => {
                console.error(`[ERROR] Erro ao carregar logo do brand kit ${brandKit.id}:`, logoUrl)
                setImageError(true)
              }}
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-600 dark:text-neutral-300 text-2xl font-bold bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-700 dark:to-neutral-800">
              {brandKit.brand_name[0]?.toUpperCase() || 'B'}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold truncate text-foreground">
              {brandKit.brand_name}
            </h3>
            {brandKit.is_default && (
              <Badge variant="success" className="shrink-0">
                Padrão
              </Badge>
            )}
          </div>

          {/* Preview de cores */}
          {previewColors.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground">Cores:</span>
              <div className="flex gap-1.5">
                {previewColors.slice(0, 4).map((color, index) => (
                  <div
                    key={index}
                    className="h-6 w-6 rounded-full border-2 border-neutral-300 dark:border-neutral-600 shadow-sm"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
                {previewColors.length > 4 && (
                  <div className="h-6 w-6 rounded-full bg-neutral-200 dark:bg-neutral-700 border-2 border-neutral-300 dark:border-neutral-600 flex items-center justify-center">
                    <span className="text-[10px] text-neutral-600 dark:text-neutral-300 font-medium">
                      +{previewColors.length - 4}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-1">
            Criado em {new Date(brandKit.created_at).toLocaleDateString('pt-BR')}
          </p>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Set as Default */}
          {!brandKit.is_default && onSetDefault && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onSetDefault(brandKit.id)
              }}
              className="h-9 w-9 p-0 hover:text-warning-600 hover:bg-warning-50 dark:hover:bg-warning-900/20"
              title="Marcar como padrão"
            >
              <Star className="h-4 w-4" />
            </Button>
          )}

          {/* Edit */}
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(brandKit.id)
              }}
              className="h-9 w-9 p-0 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20"
              title="Editar"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}

          {/* Delete */}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(brandKit.id)
              }}
              className="h-9 w-9 p-0 hover:text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20"
              title="Excluir"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
