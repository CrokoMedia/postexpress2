'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/atoms/dialog'
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 max-w-md">
        {/* Header */}
        <DialogHeader className="flex-row items-start gap-4 space-y-0">
          <div className="shrink-0 h-12 w-12 rounded-full bg-error-500/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-error-500" />
          </div>
          <div className="flex-1 space-y-1.5">
            <DialogTitle className="text-xl text-neutral-900 dark:text-neutral-100">
              Deletar Perfil
            </DialogTitle>
            <DialogDescription className="text-neutral-600 dark:text-neutral-400">
              Esta ação não pode ser desfeita
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="space-y-4">
          <p className="text-neutral-700 dark:text-neutral-300">
            Você está prestes a deletar <span className="font-semibold text-error-600 dark:text-error-400">PERMANENTEMENTE</span> o perfil{' '}
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">@{username}</span>{' '}
            e <span className="font-semibold">TODOS os dados associados</span>.
          </p>

          <div className="bg-error-50 dark:bg-error-900/20 border-2 border-error-500/30 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-semibold text-error-600 dark:text-error-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Será deletado permanentemente:
            </h4>
            <ul className="text-sm text-error-700 dark:text-error-300 space-y-1 list-disc list-inside ml-2">
              <li><strong>Perfil do Instagram</strong> (@{username})</li>
              <li><strong>TODAS as auditorias</strong> deste perfil</li>
              <li><strong>TODOS os posts</strong> dessas auditorias</li>
              <li><strong>TODOS os comentários</strong> desses posts</li>
              <li><strong>TODAS as comparações</strong> deste perfil</li>
              <li><strong>Contexto e documentos</strong> (se houver)</li>
            </ul>
          </div>

          <div className="bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700/50 rounded-lg p-3">
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              ⚠️ <strong>Esta ação NÃO pode ser desfeita.</strong> Todos os dados serão apagados permanentemente do banco de dados.
            </p>
          </div>

          {/* Confirmação */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Digite <span className="font-semibold text-neutral-900 dark:text-neutral-100">{username}</span> para confirmar:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={username}
              disabled={isDeleting}
              className="w-full bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-neutral-900 dark:text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
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
            variant="danger"
            onClick={handleDelete}
            disabled={confirmText !== username || isDeleting}
            loading={isDeleting}
            className="flex-1"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Deletar Perfil
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
