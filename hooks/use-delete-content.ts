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
