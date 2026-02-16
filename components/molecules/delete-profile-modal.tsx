'use client'

import { useState } from 'react'
import { Button } from '@/components/atoms/button'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface DeleteProfileModalProps {
  profileId: string
  username: string
  isOpen: boolean
  onClose: () => void
  onDeleteSuccess?: () => void
}

export function DeleteProfileModal({
  profileId,
  username,
  isOpen,
  onClose,
  onDeleteSuccess
}: DeleteProfileModalProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  if (!isOpen) return null

  const handleDelete = async () => {
    if (confirmText !== username) {
      toast.error('Nome de usuário não corresponde')
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/profiles/${profileId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao deletar perfil')
      }

      toast.success(`Perfil @${username} deletado com sucesso`)

      // Callback
      if (onDeleteSuccess) {
        onDeleteSuccess()
      } else {
        // Redirecionar para dashboard
        router.push('/dashboard')
      }

      onClose()

    } catch (error: any) {
      toast.error(error.message || 'Erro ao deletar perfil')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="shrink-0 h-12 w-12 rounded-full bg-error-500/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-error-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-neutral-100">
              Deletar Perfil
            </h3>
            <p className="text-sm text-neutral-400 mt-1">
              Esta ação não pode ser desfeita
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <p className="text-neutral-300">
            Você está prestes a deletar o perfil{' '}
            <span className="font-semibold text-neutral-100">@{username}</span>.
            Todas as auditorias, posts e comentários associados serão mantidos,
            mas o perfil não aparecerá mais nas listagens.
          </p>

          <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-medium text-neutral-300">
              O que será deletado:
            </h4>
            <ul className="text-sm text-neutral-400 space-y-1 list-disc list-inside">
              <li>Perfil do Instagram</li>
              <li>Visibilidade nas listagens</li>
            </ul>
          </div>

          <div className="bg-warning-500/10 border border-warning-500/20 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-medium text-warning-500">
              O que será mantido:
            </h4>
            <ul className="text-sm text-warning-400 space-y-1 list-disc list-inside">
              <li>Auditorias (histórico)</li>
              <li>Posts e comentários (dados)</li>
              <li>Documentos uploadados</li>
            </ul>
          </div>

          {/* Confirmação */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Digite <span className="font-semibold text-neutral-100">{username}</span> para confirmar:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={username}
              disabled={isDeleting}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-200 placeholder:text-neutral-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            variant="error"
            onClick={handleDelete}
            disabled={confirmText !== username || isDeleting}
            loading={isDeleting}
            className="flex-1"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Deletar Perfil
          </Button>
        </div>
      </div>
    </div>
  )
}
