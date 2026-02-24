'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { Badge } from '@/components/atoms/badge'
import { Calendar, Clock, Trash2, RefreshCw, Loader2, AlertCircle } from 'lucide-react'

interface Schedule {
  id: string
  scheduled_at: string
  quantity: number
  custom_theme: string | null
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  created_at: string
  error_message: string | null
  profiles: {
    username: string
    full_name: string | null
  }
}

interface ScheduledContentListProps {
  auditId: string
  onRefresh?: () => void
}

export function ScheduledContentList({ auditId, onRefresh }: ScheduledContentListProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [tableExists, setTableExists] = useState(true)

  const loadSchedules = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/schedules?auditId=${auditId}`)

      // Se erro de rede ou timeout, não quebrar
      if (!response) {
        console.warn('⚠️ Erro de rede ao carregar agendamentos')
        setTableExists(false)
        setSchedules([])
        setLoading(false)
        return
      }

      const data = await response.json().catch(() => ({}))

      // Se a tabela não existir, ocultar componente silenciosamente
      if (!response.ok) {
        console.warn('⚠️ Erro ao carregar agendamentos:', data.error?.message || response.statusText)
        setTableExists(false)
        setSchedules([])
        setLoading(false)
        return
      }

      setSchedules(data.schedules || [])
      setTableExists(true)
    } catch (err) {
      console.warn('⚠️ Erro ao carregar agendamentos (não crítico):', err)
      setTableExists(false)
      setSchedules([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Tentar carregar, mas não bloquear se falhar
    loadSchedules().catch((err) => {
      console.warn('⚠️ Falha ao carregar agendamentos (componente desabilitado):', err)
      setTableExists(false)
    })

    // Refresh a cada 30 segundos para ver status atualizado (apenas se tabela existir)
    const interval = setInterval(() => {
      if (tableExists) {
        loadSchedules()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [auditId])

  const handleCancel = async (scheduleId: string) => {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) {
      return
    }

    setCancelling(scheduleId)
    try {
      const response = await fetch(`/api/schedules/${scheduleId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }

      // Remover da lista ou atualizar status
      setSchedules((prev) =>
        prev.map((s) => (s.id === scheduleId ? { ...s, status: 'cancelled' as const } : s))
      )

      onRefresh?.()
    } catch (err: any) {
      alert(`Erro ao cancelar: ${err.message}`)
    } finally {
      setCancelling(null)
    }
  }

  const getStatusBadge = (status: Schedule['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Agendado</Badge>
      case 'processing':
        return (
          <Badge variant="info" className="flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Processando
          </Badge>
        )
      case 'completed':
        return <Badge variant="success">Concluído</Badge>
      case 'failed':
        return <Badge variant="error">Falhou</Badge>
      case 'cancelled':
        return <Badge variant="neutral">Cancelado</Badge>
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date()
  }

  // Se a tabela não existir, não renderizar nada
  if (!tableExists) {
    return null
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin text-primary-600" />
          <p className="text-sm text-muted-foreground">Carregando agendamentos...</p>
        </CardContent>
      </Card>
    )
  }

  if (schedules.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-600" />
            Agendamentos ({schedules.length})
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={loadSchedules}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className={`border-2 rounded-lg p-4 transition-all ${
                schedule.status === 'completed'
                  ? 'border-success-200 bg-success-50/50'
                  : schedule.status === 'failed'
                  ? 'border-error-200 bg-error-50/50'
                  : schedule.status === 'cancelled'
                  ? 'border-neutral-200 bg-neutral-50/50 opacity-60'
                  : schedule.status === 'processing'
                  ? 'border-info-200 bg-info-50/50 animate-pulse'
                  : 'border-warning-200 bg-warning-50/50'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  {/* Status e Quantidade */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {getStatusBadge(schedule.status)}
                    <Badge variant="neutral" className="flex items-center gap-1">
                      <span className="font-bold">{schedule.quantity}</span>
                      <span className="text-xs">
                        {schedule.quantity === 1 ? 'carrossel' : 'carrosséis'}
                      </span>
                    </Badge>
                  </div>

                  {/* Data e Hora */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-foreground">
                      <Calendar className="w-4 h-4 text-primary-600" />
                      <span className="font-medium">{formatDateTime(schedule.scheduled_at)}</span>
                    </div>
                    {isUpcoming(schedule.scheduled_at) && schedule.status === 'pending' && (
                      <Badge variant="warning" className="text-xs">
                        Em breve
                      </Badge>
                    )}
                  </div>

                  {/* Tema Personalizado */}
                  {schedule.custom_theme && (
                    <p className="text-xs text-muted-foreground italic">
                      Tema: {schedule.custom_theme.length > 80
                        ? schedule.custom_theme.substring(0, 80) + '...'
                        : schedule.custom_theme}
                    </p>
                  )}

                  {/* Erro */}
                  {schedule.status === 'failed' && schedule.error_message && (
                    <div className="flex items-start gap-2 bg-error-100 dark:bg-error-950/20 border border-error-200 rounded p-2">
                      <AlertCircle className="w-4 h-4 text-error-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-error-700 dark:text-error-300">
                        {schedule.error_message}
                      </p>
                    </div>
                  )}

                  {/* Criado em */}
                  <p className="text-xs text-muted-foreground">
                    Criado em: {formatDateTime(schedule.created_at)}
                  </p>
                </div>

                {/* Ações */}
                <div className="flex flex-col gap-2">
                  {(schedule.status === 'pending' || schedule.status === 'failed') && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleCancel(schedule.id)}
                      disabled={cancelling === schedule.id}
                    >
                      {cancelling === schedule.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
