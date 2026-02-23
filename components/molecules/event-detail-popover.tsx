'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Calendar, Hash, User, Clock, AlertCircle, CheckCircle, XCircle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/atoms/button'
import { Badge } from '@/components/atoms/badge'

type Schedule = {
  id: string
  scheduled_at: string
  quantity: number
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  custom_theme: string | null
  error_message?: string | null
  content_suggestion_id?: string | null
  audit_id?: string
  profiles: {
    username: string
    full_name: string
  }
}

type EventDetailPopoverProps = {
  schedule: Schedule
  onClose: () => void
  onRefresh?: () => void
}

const statusConfig = {
  pending: { variant: 'warning' as const, label: 'Agendado', icon: Clock },
  processing: { variant: 'info' as const, label: 'Processando', icon: Clock },
  completed: { variant: 'success' as const, label: 'Concluído', icon: CheckCircle },
  failed: { variant: 'error' as const, label: 'Falhou', icon: XCircle },
  cancelled: { variant: 'neutral' as const, label: 'Cancelado', icon: XCircle },
}

export default function EventDetailPopover({
  schedule,
  onClose,
  onRefresh,
}: EventDetailPopoverProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const config = statusConfig[schedule.status]
  const StatusIcon = config.icon

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleCancel = async () => {
    if (!confirm('Deseja realmente cancelar este agendamento?')) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/schedules/${schedule.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Erro ao cancelar agendamento')

      onRefresh?.()
      onClose()
    } catch (error) {
      console.error('Erro ao cancelar:', error)
      alert('Erro ao cancelar agendamento')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-neutral-800 rounded-xl shadow-2xl border border-neutral-700 max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-700 bg-gradient-to-r from-neutral-800 to-neutral-750 p-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <StatusIcon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              <h3 className="text-xl font-bold text-white">
                Detalhes do Agendamento
              </h3>
            </div>
            <Badge variant={config.variant}>{config.label}</Badge>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-5">
          {/* Data/Hora */}
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-primary-400 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Data e Horário</div>
              <div className="text-base text-white font-semibold">{formatDate(schedule.scheduled_at)}</div>
            </div>
          </div>

          {/* Perfil */}
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-primary-400 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Perfil</div>
              <div className="text-base text-white font-semibold">
                @{schedule.profiles.username}
              </div>
              {schedule.profiles.full_name && (
                <div className="text-sm text-neutral-600 dark:text-neutral-400">{schedule.profiles.full_name}</div>
              )}
            </div>
          </div>

          {/* Quantidade */}
          <div className="flex items-start gap-3">
            <Hash className="w-5 h-5 text-primary-400 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Quantidade de Carrosséis</div>
              <div className="text-base text-white font-semibold">{schedule.quantity}</div>
            </div>
          </div>

          {/* Tema (opcional) */}
          {schedule.custom_theme && (
            <div className="bg-neutral-750 rounded-lg p-4 border border-neutral-600">
              <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Tema Personalizado</div>
              <div className="text-sm text-neutral-900 dark:text-neutral-100">{schedule.custom_theme}</div>
            </div>
          )}

          {/* Mensagem de erro (se falhou) */}
          {schedule.status === 'failed' && schedule.error_message && (
            <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/30">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-red-300 mb-1">Erro</div>
                  <div className="text-sm text-red-400">{schedule.error_message}</div>
                </div>
              </div>
            </div>
          )}

          {/* Link para conteúdo gerado (se concluído) */}
          {schedule.status === 'completed' && schedule.audit_id && (
            <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-green-300 mb-1 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Conteúdo Gerado
                  </div>
                  <div className="text-sm text-green-400">
                    {schedule.quantity} carrosséis foram criados com sucesso
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    router.push(`/dashboard/audits/${schedule.audit_id}/create-content`)
                    onClose()
                  }}
                  className="flex items-center gap-2"
                >
                  Ver Conteúdo
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="border-t border-neutral-700 bg-neutral-800 p-6 flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Fechar
          </Button>

          {schedule.status === 'pending' && (
            <Button
              variant="danger"
              onClick={handleCancel}
              disabled={isDeleting}
              className="flex-1"
            >
              {isDeleting ? 'Cancelando...' : 'Cancelar Agendamento'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
