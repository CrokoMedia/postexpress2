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
