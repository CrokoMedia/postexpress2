'use client'

import { useState } from 'react'
import { Button } from '@/components/atoms/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card'
import { Calendar, Clock, Hash, X, Loader2, CheckCircle, Lightbulb } from 'lucide-react'

interface ScheduleContentModalProps {
  auditId: string
  profileId: string
  onClose: () => void
  onSuccess?: () => void
}

export function ScheduleContentModal({
  auditId,
  profileId,
  onClose,
  onSuccess,
}: ScheduleContentModalProps) {
  const [quantity, setQuantity] = useState(5)
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [customTheme, setCustomTheme] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSchedule = async () => {
    setError(null)
    setLoading(true)

    try {
      // Validar campos
      if (!scheduledDate || !scheduledTime) {
        throw new Error('Por favor, preencha data e horário')
      }

      // Combinar data e hora
      const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}:00`)

      // Validar que está no futuro
      const now = new Date()
      if (scheduledAt <= now) {
        throw new Error('A data/hora deve ser no futuro')
      }

      // Criar agendamento via API
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auditId,
          profileId,
          scheduledAt: scheduledAt.toISOString(),
          quantity,
          customTheme: customTheme.trim() || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao criar agendamento')
      }

      const data = await response.json()
      console.log('✅ Agendamento criado:', data.schedule)

      setSuccess(true)
      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 1500)
    } catch (err: any) {
      console.error('Erro ao agendar:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Obter data/hora mínima (agora + 5 minutos)
  const getMinDateTime = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() + 5)
    return {
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5),
    }
  }

  const minDateTime = getMinDateTime()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-600" />
                Agendar Geração de Conteúdo
              </CardTitle>
              <CardDescription className="mt-1">
                Programe a criação automática de carrosséis para uma data e horário específicos
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Quantidade */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Hash className="w-4 h-4 text-primary-600" />
              Quantidade de Carrosséis
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="20"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
              <div className="w-16 text-center">
                <div className="bg-primary-100 text-primary-700 font-bold rounded-lg py-2 px-3">
                  {quantity}
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Mínimo: 1 | Máximo: 20 carrosséis
            </p>
          </div>

          {/* Data e Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary-600" />
                Data
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={minDateTime.date}
                className="w-full bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-600" />
                Horário
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Preview da data agendada */}
          {scheduledDate && scheduledTime && (
            <div className="bg-primary-50 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-800 rounded-lg p-3">
              <p className="text-sm text-primary-700 dark:text-primary-300">
                <strong>Agendado para:</strong>{' '}
                {new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString('pt-BR', {
                  dateStyle: 'full',
                  timeStyle: 'short',
                })}
              </p>
            </div>
          )}

          {/* Tema Personalizado */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tema Personalizado <span className="text-muted-foreground">(opcional)</span>
            </label>
            <textarea
              value={customTheme}
              onChange={(e) => setCustomTheme(e.target.value)}
              placeholder="Ex: Carrosséis sobre como aumentar engajamento no Instagram Reels..."
              rows={3}
              maxLength={500}
              className="w-full bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
            <div className="flex justify-between items-center text-xs mt-1">
              <span className="text-muted-foreground">
                Deixe vazio para gerar baseado na auditoria
              </span>
              <span className={`font-mono ${
                customTheme.length > 450 ? 'text-warning-500' : 'text-muted-foreground'
              }`}>
                {customTheme.length}/500
              </span>
            </div>
          </div>

          {/* Erro */}
          {error && (
            <div className="bg-error-50 dark:bg-error-950/20 border border-error-200 dark:border-error-800 rounded-lg p-3">
              <p className="text-sm text-error-700 dark:text-error-300">{error}</p>
            </div>
          )}

          {/* Sucesso */}
          {success && (
            <div className="bg-success-50 dark:bg-success-950/20 border border-success-200 dark:border-success-800 rounded-lg p-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success-600" />
              <p className="text-sm text-success-700 dark:text-success-300 font-medium">
                Agendamento criado com sucesso!
              </p>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSchedule}
              disabled={loading || success || !scheduledDate || !scheduledTime}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Agendando...
                </>
              ) : success ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Agendado!
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Confirmar Agendamento
                </>
              )}
            </Button>
          </div>

          {/* Info adicional */}
          <div className="bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-lg p-3">
            <p className="text-xs text-muted-foreground flex items-start gap-2">
              <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Como funciona:</strong> No horário agendado, o sistema irá gerar automaticamente {quantity} {quantity === 1 ? 'carrossel' : 'carrosséis'} e notificar você quando estiver pronto.
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
