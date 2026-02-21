# Code Snippets - Refatoração Content Creation

Exemplos de código prontos para usar durante a implementação.

---

## 🔌 APIs DELETE

### 1. DELETE Carrossel

**Arquivo:** `/app/api/content/[id]/carousels/[carouselIndex]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; carouselIndex: string } }
) {
  try {
    const { id: audit_id, carouselIndex } = params
    const index = parseInt(carouselIndex, 10)

    if (isNaN(index)) {
      return NextResponse.json(
        { error: 'Índice inválido' },
        { status: 400 }
      )
    }

    const supabase = getServerSupabase()

    // Buscar content_suggestions
    const { data: existing, error: fetchError } = await supabase
      .from('content_suggestions')
      .select('id, content_json')
      .eq('audit_id', audit_id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Conteúdo não encontrado' },
        { status: 404 }
      )
    }

    const contentJson = existing.content_json as any

    if (!contentJson?.carousels || index >= contentJson.carousels.length || index < 0) {
      return NextResponse.json(
        { error: 'Carrossel não encontrado' },
        { status: 404 }
      )
    }

    // Remover carrossel do array
    const deletedCarousel = contentJson.carousels.splice(index, 1)[0]

    // Atualizar no Supabase
    const { error: updateError } = await supabase
      .from('content_suggestions')
      .update({
        content_json: contentJson,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)

    if (updateError) {
      console.error('Erro ao atualizar Supabase:', updateError)
      throw new Error('Erro ao atualizar banco de dados')
    }

    console.log(`✅ Carrossel ${index} deletado: "${deletedCarousel.titulo}"`)

    return NextResponse.json({
      success: true,
      message: `Carrossel "${deletedCarousel.titulo}" deletado`,
      remainingCarousels: contentJson.carousels.length
    })

  } catch (error: any) {
    console.error('❌ Erro ao deletar carrossel:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar carrossel' },
      { status: 500 }
    )
  }
}
```

---

### 2. DELETE Slides

**Arquivo:** `/app/api/content/[id]/slides/[carouselIndex]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { v2 as cloudinary } from 'cloudinary'

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; carouselIndex: string } }
) {
  try {
    const { id: audit_id, carouselIndex } = params
    const index = parseInt(carouselIndex, 10)

    if (isNaN(index)) {
      return NextResponse.json(
        { error: 'Índice inválido' },
        { status: 400 }
      )
    }

    const supabase = getServerSupabase()

    // Buscar content_suggestions
    const { data: existing, error: fetchError } = await supabase
      .from('content_suggestions')
      .select('id, slides_json')
      .eq('audit_id', audit_id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Conteúdo não encontrado' },
        { status: 404 }
      )
    }

    const slidesJson = existing.slides_json as any

    if (!slidesJson?.carousels) {
      return NextResponse.json(
        { error: 'Nenhum slide gerado ainda' },
        { status: 404 }
      )
    }

    // Encontrar carrossel
    const carouselToDelete = slidesJson.carousels.find(
      (c: any) => c.carouselIndex === index
    )

    if (!carouselToDelete) {
      return NextResponse.json(
        { error: 'Slides deste carrossel não encontrados' },
        { status: 404 }
      )
    }

    // Extrair public_ids do Cloudinary
    const publicIds = carouselToDelete.slides.map(
      (s: any) => s.cloudinaryPublicId
    )

    console.log(`🗑️ Deletando ${publicIds.length} slides do Cloudinary...`)

    // Deletar do Cloudinary em batch
    const deletePromises = publicIds.map((publicId: string) =>
      cloudinary.uploader.destroy(publicId, { resource_type: 'image' })
        .catch(err => {
          console.warn(`⚠️ Erro ao deletar ${publicId}:`, err.message)
          return { result: 'error', error: err.message }
        })
    )

    const cloudinaryResults = await Promise.allSettled(deletePromises)
    const deletedCount = cloudinaryResults.filter(
      r => r.status === 'fulfilled' && (r.value as any).result === 'ok'
    ).length

    console.log(`✅ Deletados ${deletedCount}/${publicIds.length} slides do Cloudinary`)

    // Remover do slides_json
    slidesJson.carousels = slidesJson.carousels.filter(
      (c: any) => c.carouselIndex !== index
    )

    // Atualizar summary
    slidesJson.summary = {
      totalCarousels: slidesJson.carousels.length,
      totalSlides: slidesJson.carousels.reduce(
        (acc: number, c: any) => acc + c.slides.length,
        0
      )
    }

    // Atualizar no Supabase (null se vazio)
    const { error: updateError } = await supabase
      .from('content_suggestions')
      .update({
        slides_json: slidesJson.carousels.length > 0 ? slidesJson : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)

    if (updateError) {
      console.error('Erro ao atualizar Supabase:', updateError)
      throw new Error('Erro ao atualizar banco de dados')
    }

    return NextResponse.json({
      success: true,
      message: `Slides do carrossel ${index} deletados`,
      deletedImages: publicIds.length,
      cloudinaryDeleted: deletedCount,
      cloudinaryFailed: publicIds.length - deletedCount
    })

  } catch (error: any) {
    console.error('❌ Erro ao deletar slides:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar slides' },
      { status: 500 }
    )
  }
}
```

---

### 3. DELETE Reel

**Arquivo:** `/app/api/content/[id]/reels/[reelIndex]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; reelIndex: string } }
) {
  try {
    const { id: audit_id, reelIndex } = params
    const index = parseInt(reelIndex, 10)

    if (isNaN(index)) {
      return NextResponse.json(
        { error: 'Índice inválido' },
        { status: 400 }
      )
    }

    const supabase = getServerSupabase()

    // Buscar content_suggestions
    const { data: existing, error: fetchError } = await supabase
      .from('content_suggestions')
      .select('id, reel_videos_json')
      .eq('audit_id', audit_id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Conteúdo não encontrado' },
        { status: 404 }
      )
    }

    const reelVideosJson = existing.reel_videos_json as any

    if (!reelVideosJson?.videos || index >= reelVideosJson.videos.length || index < 0) {
      return NextResponse.json(
        { error: 'Reel não encontrado' },
        { status: 404 }
      )
    }

    // Extrair public_id do Cloudinary
    const reelToDelete = reelVideosJson.videos[index]
    const publicId = reelToDelete.cloudinaryPublicId

    console.log(`🗑️ Deletando reel do Cloudinary: ${publicId}`)

    // Deletar do Cloudinary (tipo video)
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'video'
      })
      console.log(`✅ Reel deletado do Cloudinary:`, result)
    } catch (cloudErr: any) {
      console.warn('⚠️ Erro ao deletar do Cloudinary:', cloudErr.message)
      // Continua mesmo se falhar (pode já ter sido deletado manualmente)
    }

    // Remover do array
    const deletedReel = reelVideosJson.videos.splice(index, 1)[0]

    // Atualizar no Supabase (null se vazio)
    const { error: updateError } = await supabase
      .from('content_suggestions')
      .update({
        reel_videos_json: reelVideosJson.videos.length > 0 ? reelVideosJson : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)

    if (updateError) {
      console.error('Erro ao atualizar Supabase:', updateError)
      throw new Error('Erro ao atualizar banco de dados')
    }

    return NextResponse.json({
      success: true,
      message: 'Reel deletado',
      deletedTitle: deletedReel.title,
      cloudinaryDeleted: publicId
    })

  } catch (error: any) {
    console.error('❌ Erro ao deletar reel:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar reel' },
      { status: 500 }
    )
  }
}
```

---

## 🧩 Componentes

### Modal de Confirmação DELETE (Reutilizável)

**Arquivo:** `/components/molecules/delete-confirmation-modal.tsx`

```typescript
'use client'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/atoms/dialog'
import { Button } from '@/components/atoms/button'
import { Loader2, Trash2, AlertTriangle } from 'lucide-react'

interface DeleteConfirmationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  itemCount?: number
  warning?: string
  onConfirm: () => void
  loading?: boolean
}

export function DeleteConfirmationModal({
  open,
  onOpenChange,
  title,
  description,
  itemCount,
  warning,
  onConfirm,
  loading = false
}: DeleteConfirmationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-error-500" />
            {title}
          </DialogTitle>
          <DialogDescription className="space-y-2 pt-2">
            <p className="text-foreground">{description}</p>

            {itemCount !== undefined && (
              <p className="font-semibold text-foreground">
                {itemCount} {itemCount === 1 ? 'item' : 'itens'} {itemCount === 1 ? 'será deletado' : 'serão deletados'}
              </p>
            )}

            {warning && (
              <div className="flex items-start gap-2 bg-warning-500/10 border border-warning-500/30 rounded-lg p-3 mt-3">
                <AlertTriangle className="w-4 h-4 text-warning-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-warning-700">{warning}</p>
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-3">
              Esta ação não pode ser desfeita.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deletando...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Deletar Permanentemente
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

---

## 📄 Páginas

### Hub de Navegação

**Arquivo:** `/app/dashboard/audits/[id]/create-content/page.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAudit } from '@/hooks/use-audit'
import { PageHeader } from '@/components/molecules/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { Skeleton } from '@/components/atoms/skeleton'
import { ArrowLeft, Image as ImageIcon, Video, FileText } from 'lucide-react'

export default function ContentCreationHub() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { audit, isLoading, isError } = useAudit(id)

  const [stats, setStats] = useState({
    carouselsCount: 0,
    approvedCarouselsCount: 0,
    slidesCount: 0,
    reelsCount: 0,
    loading: true
  })

  useEffect(() => {
    const loadStats = async () => {
      if (!id) return

      try {
        const res = await fetch(`/api/audits/${id}/content`)
        if (res.ok) {
          const data = await res.json()

          const carouselsCount = data.content?.carousels?.length || 0
          const approvedCarouselsCount = data.content?.carousels?.filter(
            (c: any) => c.approved === true
          ).length || 0
          const slidesCount = data.slides?.summary?.totalSlides || 0
          const reelsCount = data.reel_videos?.videos?.length || 0

          setStats({
            carouselsCount,
            approvedCarouselsCount,
            slidesCount,
            reelsCount,
            loading: false
          })
        }
      } catch (err) {
        console.error('Erro ao carregar estatísticas:', err)
        setStats(prev => ({ ...prev, loading: false }))
      }
    }

    loadStats()
  }, [id])

  if (isLoading || stats.loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    )
  }

  if (isError || !audit) {
    return (
      <div>
        <PageHeader title="Erro" />
        <p className="text-error-500">Auditoria não encontrada</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => router.push(`/dashboard/audits/${id}`)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Auditoria
        </Button>

        <PageHeader
          title={`Criar Conteúdo - @${audit.profile.username}`}
          description="Escolha o tipo de conteúdo que deseja gerenciar"
        />
      </div>

      {/* Grid de Módulos */}
      <div className="grid grid-cols-3 gap-6">
        {/* Card Carrosséis */}
        <Card className="hover:border-primary-500 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-600" />
              Carrosséis
            </CardTitle>
            <CardDescription>
              Sugestões de conteúdo em formato de texto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-4xl font-bold text-primary-600">
                {stats.carouselsCount}
              </div>
              <p className="text-sm text-muted-foreground">
                {stats.approvedCarouselsCount} aprovado{stats.approvedCarouselsCount !== 1 ? 's' : ''}
              </p>
            </div>
            <Button
              onClick={() => router.push(`/dashboard/audits/${id}/create-content/carousels`)}
              className="w-full"
            >
              Gerenciar Carrosséis
            </Button>
          </CardContent>
        </Card>

        {/* Card Slides */}
        <Card className="hover:border-info-500 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-info-600" />
              Slides Visuais
            </CardTitle>
            <CardDescription>
              Imagens PNG dos carrosséis aprovados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-4xl font-bold text-info-600">
                {stats.slidesCount}
              </div>
              <p className="text-sm text-muted-foreground">slides gerados</p>
            </div>
            <Button
              onClick={() => router.push(`/dashboard/audits/${id}/create-content/slides`)}
              disabled={stats.approvedCarouselsCount === 0}
              className="w-full"
              variant={stats.approvedCarouselsCount === 0 ? 'secondary' : 'primary'}
            >
              Gerenciar Slides
            </Button>
            {stats.approvedCarouselsCount === 0 && (
              <p className="text-xs text-muted-foreground text-center">
                Aprove carrosséis primeiro
              </p>
            )}
          </CardContent>
        </Card>

        {/* Card Reels */}
        <Card className="hover:border-warning-500 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5 text-warning-600" />
              Reels Animados
            </CardTitle>
            <CardDescription>
              Vídeos MP4 para Instagram
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-4xl font-bold text-warning-600">
                {stats.reelsCount}
              </div>
              <p className="text-sm text-muted-foreground">vídeos MP4</p>
            </div>
            <Button
              onClick={() => router.push(`/dashboard/audits/${id}/create-content/reels`)}
              disabled={stats.approvedCarouselsCount === 0}
              className="w-full"
              variant={stats.approvedCarouselsCount === 0 ? 'secondary' : 'primary'}
            >
              Gerenciar Reels
            </Button>
            {stats.approvedCarouselsCount === 0 && (
              <p className="text-xs text-muted-foreground text-center">
                Aprove carrosséis primeiro
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

---

## 🎯 Funções Úteis

### Hook para DELETE com Toast

```typescript
// hooks/use-delete-content.ts

import { useState } from 'react'
import { toast } from 'sonner'

interface UseDeleteContentOptions {
  onSuccess?: () => void
}

export function useDeleteContent(options?: UseDeleteContentOptions) {
  const [deleting, setDeleting] = useState(false)

  const deleteCarousel = async (auditId: string, carouselIndex: number) => {
    setDeleting(true)
    try {
      const res = await fetch(
        `/api/content/${auditId}/carousels/${carouselIndex}`,
        { method: 'DELETE' }
      )

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao deletar')
      }

      const data = await res.json()
      toast.success(data.message)
      options?.onSuccess?.()
      return data

    } catch (err: any) {
      toast.error(`Erro: ${err.message}`)
      throw err
    } finally {
      setDeleting(false)
    }
  }

  const deleteSlides = async (auditId: string, carouselIndex: number) => {
    setDeleting(true)
    try {
      const res = await fetch(
        `/api/content/${auditId}/slides/${carouselIndex}`,
        { method: 'DELETE' }
      )

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao deletar')
      }

      const data = await res.json()
      toast.success(`${data.deletedImages} slides deletados`)
      options?.onSuccess?.()
      return data

    } catch (err: any) {
      toast.error(`Erro: ${err.message}`)
      throw err
    } finally {
      setDeleting(false)
    }
  }

  const deleteReel = async (auditId: string, reelIndex: number) => {
    setDeleting(true)
    try {
      const res = await fetch(
        `/api/content/${auditId}/reels/${reelIndex}`,
        { method: 'DELETE' }
      )

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao deletar')
      }

      const data = await res.json()
      toast.success(data.message)
      options?.onSuccess?.()
      return data

    } catch (err: any) {
      toast.error(`Erro: ${err.message}`)
      throw err
    } finally {
      setDeleting(false)
    }
  }

  return {
    deleting,
    deleteCarousel,
    deleteSlides,
    deleteReel
  }
}
```

### Uso do Hook

```typescript
// Exemplo: /carousels/page.tsx

import { useDeleteContent } from '@/hooks/use-delete-content'

export default function CarouselsPage() {
  const [content, setContent] = useState<any>(null)

  const { deleting, deleteCarousel } = useDeleteContent({
    onSuccess: () => {
      // Recarregar dados ou atualizar estado local
    }
  })

  const handleDelete = async (index: number) => {
    try {
      await deleteCarousel(id, index)

      // Atualizar estado local
      setContent((prev: any) => {
        const next = { ...prev }
        next.carousels.splice(index, 1)
        return next
      })
    } catch (err) {
      // Erro já tratado pelo hook (toast)
    }
  }

  return (
    // ...
    <Button onClick={() => handleDelete(index)} disabled={deleting}>
      <Trash2 className="w-4 h-4 mr-2" />
      Deletar
    </Button>
  )
}
```

---

**Última Atualização:** 2026-02-21
**Status:** ✅ Snippets Prontos para Uso
