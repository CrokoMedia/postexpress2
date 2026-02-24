'use client'

import { useState } from 'react'
import CalendarEventBadge from './calendar-event-badge'
import EventDetailPopover from './event-detail-popover'

type Schedule = {
  id: string
  scheduled_at: string
  quantity: number
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  custom_theme: string | null
  content_suggestion_id?: string | null
  audit_id?: string
  error_message?: string | null
  profiles: {
    username: string
    full_name: string
  }
}

type CalendarDayCellProps = {
  date: Date
  isCurrentMonth: boolean
  schedules: Schedule[]
  onRefresh?: () => void
}

export default function CalendarDayCell({
  date,
  isCurrentMonth,
  schedules,
  onRefresh,
}: CalendarDayCellProps) {
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null)

  const isToday =
    new Date().toDateString() === date.toDateString()

  const dayNumber = date.getDate()

  return (
    <>
      <div
        className={`min-h-[110px] border rounded-xl p-3 transition-all duration-200 ${
          isCurrentMonth
            ? 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-600 hover:border-primary-500 hover:shadow-lg hover:shadow-primary-500/10'
            : 'bg-neutral-100 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700'
        } ${isToday ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-neutral-50 dark:ring-offset-neutral-900 shadow-xl shadow-primary-500/20' : ''}`}
      >
        {/* Número do dia */}
        <div className="flex items-center justify-between mb-2">
          <div
            className={`text-sm font-bold ${
              isCurrentMonth ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-500 dark:text-neutral-600'
            } ${isToday ? 'text-primary-600 dark:text-primary-400' : ''}`}
          >
            {dayNumber}
          </div>
          {schedules.length > 0 && (
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary-600 text-white text-xs font-bold">
              {schedules.length}
            </div>
          )}
        </div>

        {/* Lista de eventos (máximo 3 visíveis) */}
        <div className="space-y-1.5">
          {schedules.slice(0, 3).map((schedule) => (
            <CalendarEventBadge
              key={schedule.id}
              schedule={schedule}
              onClick={() => setSelectedSchedule(schedule)}
            />
          ))}

          {/* Indicador de mais eventos */}
          {schedules.length > 3 && (
            <button
              onClick={() => setSelectedSchedule(schedules[0])}
              className="text-xs text-primary-400 hover:text-primary-300 font-medium transition-colors"
            >
              +{schedules.length - 3} mais
            </button>
          )}
        </div>
      </div>

      {/* Popover com detalhes do evento */}
      {selectedSchedule && (
        <EventDetailPopover
          schedule={selectedSchedule}
          onClose={() => setSelectedSchedule(null)}
          onRefresh={onRefresh}
        />
      )}
    </>
  )
}
