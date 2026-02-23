'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/atoms/dialog'
import { Button } from '@/components/atoms/button'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/format'

interface DeleteAuditModalProps {
  auditId: string
  auditDate: string
  isOpen: boolean
  onClose: () => void
  onDeleteSuccess?: () => void
}

export function DeleteAuditModal({
  auditId,
  auditDate,
  isOpen,
  onClose,
  onDeleteSuccess
}: DeleteAuditModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/audits/${auditId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao excluir auditoria')
      }

      toast.success('Auditoria excluída com sucesso')

      if (onDeleteSuccess) {
        onDeleteSuccess()
      }

      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir auditoria')
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
              Excluir Auditoria
            </DialogTitle>
            <DialogDescription className="text-neutral-600 dark:text-neutral-400">
              Esta ação não pode ser desfeita
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="space-y-4">
          <p className="text-neutral-700 dark:text-neutral-300">
            Você está prestes a excluir a auditoria de{' '}
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">{formatDate(auditDate)}</span>.
            Os dados dos posts analisados serão mantidos, mas a auditoria não aparecerá mais no histórico.
          </p>

          <div className="bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700/50 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-300">
              O que será excluído:
            </h4>
            <ul className="text-sm text-neutral-700 dark:text-neutral-400 space-y-1 list-disc list-inside">
              <li>Resultados e scores da auditoria</li>
              <li>Relatório e recomendações gerados</li>
              <li>Visibilidade no histórico do perfil</li>
            </ul>
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
            disabled={isDeleting}
            loading={isDeleting}
            className="flex-1"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir Auditoria
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
