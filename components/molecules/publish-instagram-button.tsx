'use client'

import { useState } from 'react'
import { Button } from '@/components/atoms/button'
import { Instagram, Loader2, Calendar, Send, CheckCircle, XCircle } from 'lucide-react'

interface PublishInstagramButtonProps {
  auditId: string
  carouselIndex: number
  carouselTitle: string
  disabled?: boolean
  hasSlides?: boolean
}

export function PublishInstagramButton({
  auditId,
  carouselIndex,
  carouselTitle,
  disabled,
  hasSlides
}: PublishInstagramButtonProps) {
  const [publishing, setPublishing] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handlePublishNow = async () => {
    if (!hasSlides) {
      setMessage({ type: 'error', text: 'Gere os slides visuais antes de publicar' })
      return
    }

    setPublishing(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/content/${auditId}/publish-instagram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carousel_index: carouselIndex
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao publicar')
      }

      setMessage({
        type: 'success',
        text: data.message || 'Publicado com sucesso!'
      })

      // Abrir permalink se disponível
      if (data.permalink) {
        window.open(data.permalink, '_blank')
      }
    } catch (err: any) {
      console.error('Erro ao publicar:', err)
      setMessage({
        type: 'error',
        text: err.message || 'Erro ao publicar no Instagram'
      })
    } finally {
      setPublishing(false)
    }
  }

  const handleSchedule = async () => {
    if (!hasSlides) {
      setMessage({ type: 'error', text: 'Gere os slides visuais antes de agendar' })
      return
    }

    if (!scheduleDate || !scheduleTime) {
      setMessage({ type: 'error', text: 'Preencha data e horário' })
      return
    }

    const scheduleDateTime = new Date(`${scheduleDate}T${scheduleTime}:00`)
    const now = new Date()
    const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000)

    if (scheduleDateTime < tenMinutesFromNow) {
      setMessage({
        type: 'error',
        text: 'Agende para pelo menos 10 minutos no futuro'
      })
      return
    }

    setPublishing(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/content/${auditId}/publish-instagram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carousel_index: carouselIndex,
          schedule_time: scheduleDateTime.toISOString()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao agendar')
      }

      setMessage({
        type: 'success',
        text: data.message || 'Agendado com sucesso!'
      })

      setShowScheduleModal(false)
      setScheduleDate('')
      setScheduleTime('')
    } catch (err: any) {
      console.error('Erro ao agendar:', err)
      setMessage({
        type: 'error',
        text: err.message || 'Erro ao agendar publicação'
      })
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={handlePublishNow}
          disabled={disabled || publishing || !hasSlides}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600"
        >
          {publishing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Instagram className="w-4 h-4" />
          )}
          Publicar Agora
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowScheduleModal(true)}
          disabled={disabled || publishing || !hasSlides}
          className="flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          Agendar
        </Button>
      </div>

      {/* Mensagens de feedback */}
      {message && (
        <div
          className={`text-sm p-2 rounded-md flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-success-100 text-success-700 border border-success-200'
              : 'bg-error-100 text-error-700 border border-error-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          {message.text}
        </div>
      )}

      {/* Modal de Agendamento */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Agendar Publicação</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Data
                </label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Horário
                </label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="text-xs text-neutral-600 dark:text-neutral-400">
                ⏰ Mínimo: 10 minutos no futuro
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                variant="primary"
                onClick={handleSchedule}
                disabled={publishing}
                className="flex-1"
              >
                {publishing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Agendando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Agendar
                  </>
                )}
              </Button>

              <Button
                variant="secondary"
                onClick={() => {
                  setShowScheduleModal(false)
                  setMessage(null)
                }}
                disabled={publishing}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
