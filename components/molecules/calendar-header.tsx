'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Play } from 'lucide-react'
import { Button } from '@/components/atoms/button'

type CalendarHeaderProps = {
  currentDate: Date
  onPreviousMonth: () => void
  onNextMonth: () => void
  onToday: () => void
  selectedStatus: string | null
  onStatusChange: (status: string | null) => void
  onRefresh?: () => void
}

export default function CalendarHeader({
  currentDate,
  onPreviousMonth,
  onNextMonth,
  onToday,
  selectedStatus,
  onStatusChange,
  onRefresh,
}: CalendarHeaderProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const monthYear = currentDate.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })

  const statusOptions = [
    { value: null, label: 'Todos' },
    { value: 'pending', label: 'Pendentes' },
    { value: 'processing', label: 'Processando' },
    { value: 'completed', label: 'Concluídos' },
    { value: 'failed', label: 'Falhados' },
  ]

  const handleProcessSchedules = async () => {
    if (isProcessing) return

    const confirmed = confirm(
      'Processar agendamentos pendentes agora?\n\n' +
      'Isso irá gerar conteúdo para todos os agendamentos que já passaram da hora programada.'
    )

    if (!confirmed) return

    setIsProcessing(true)
    try {
      const res = await fetch('/api/cron/process-schedules', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'dev-secret-change-in-production'}`
        }
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao processar agendamentos')
      }

      alert(
        `✅ Processamento concluído!\n\n` +
        `Processados: ${data.processed}\n` +
        `Sucesso: ${data.succeeded}\n` +
        `Falhas: ${data.failed}`
      )

      onRefresh?.()
    } catch (error: any) {
      console.error('Erro ao processar agendamentos:', error)
      alert('❌ Erro ao processar agendamentos: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="border-b border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-6 py-5">
      <div className="flex flex-col gap-4">
        {/* Primeira linha: Navegação do mês + Botão de Processar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onPreviousMonth}
              aria-label="Mês anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white capitalize min-w-[220px] text-center">
              {monthYear}
            </h2>

            <Button
              variant="ghost"
              size="sm"
              onClick={onNextMonth}
              aria-label="Próximo mês"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={onToday}
              className="ml-2"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Hoje
            </Button>
          </div>

          {/* Botão de Processar Agendamentos */}
          <Button
            variant="success"
            size="sm"
            onClick={handleProcessSchedules}
            disabled={isProcessing}
            className="flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            {isProcessing ? 'Processando...' : 'Processar Agendamentos'}
          </Button>
        </div>

        {/* Segunda linha: Filtros de status */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mr-2">Filtrar:</span>
          {statusOptions.map((option) => (
            <button
              key={option.value || 'all'}
              onClick={() => onStatusChange(option.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                selectedStatus === option.value
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                  : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
