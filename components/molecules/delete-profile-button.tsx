'use client'

import { useState } from 'react'
import { Button } from '@/components/atoms/button'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface DeleteProfileButtonProps {
  profileId: string
  username: string
  variant?: 'danger' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function DeleteProfileButton({
  profileId,
  username,
  variant = 'danger',
  size = 'md',
  showLabel = true
}: DeleteProfileButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!showConfirm) {
      setShowConfirm(true)
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/profiles/${profileId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao deletar perfil')
      }

      toast.success(`Perfil @${username} deletado com sucesso!`)

      // Aguardar 1 segundo antes de redirecionar
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 1000)

    } catch (error: any) {
      console.error('Erro ao deletar:', error)
      toast.error(error.message || 'Erro ao deletar perfil')
      setShowConfirm(false)
      setIsDeleting(false)
    }
  }

  const handleCancel = () => {
    setShowConfirm(false)
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm text-error-600 font-medium">
          Tem certeza? Isso apagará TUDO!
        </div>
        <Button
          variant="danger"
          size="sm"
          onClick={handleDelete}
          loading={isDeleting}
          disabled={isDeleting}
        >
          Sim, deletar
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCancel}
          disabled={isDeleting}
        >
          Cancelar
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDelete}
      disabled={isDeleting}
      className="gap-2"
    >
      <Trash2 className="h-4 w-4" />
      {showLabel && 'Deletar Perfil'}
    </Button>
  )
}
