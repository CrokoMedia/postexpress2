'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import CalendarHeader from '@/components/molecules/calendar-header'
import CalendarDayCell from '@/components/molecules/calendar-day-cell'
import { Skeleton } from '@/components/atoms/skeleton'

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

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ContentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

  // Buscar todos os agendamentos
  const { data, error, isLoading, mutate } = useSWR<{ schedules: Schedule[] }>(
    '/api/schedules',
    fetcher,
    { refreshInterval: 30000 } // Refresh a cada 30s
  )

  // Gerar dias do mês
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    const daysInMonth = lastDay.getDate()
    const startDayOfWeek = firstDay.getDay()

    // Dias do mês anterior para preencher início
    const prevMonthDays = []
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      prevMonthDays.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      })
    }

    // Dias do mês atual
    const currentMonthDays = []
    for (let i = 1; i <= daysInMonth; i++) {
      currentMonthDays.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      })
    }

    // Dias do próximo mês para preencher final
    const totalDays = prevMonthDays.length + currentMonthDays.length
    const remainingDays = 42 - totalDays // Sempre mostrar 6 semanas (42 dias)
    const nextMonthDays = []
    for (let i = 1; i <= remainingDays; i++) {
      nextMonthDays.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      })
    }

    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays]
  }

  // Agrupar agendamentos por dia
  const getSchedulesForDay = (date: Date): Schedule[] => {
    if (!data?.schedules) return []

    return data.schedules.filter((schedule) => {
      const scheduleDate = new Date(schedule.scheduled_at)
      return (
        scheduleDate.getFullYear() === date.getFullYear() &&
        scheduleDate.getMonth() === date.getMonth() &&
        scheduleDate.getDate() === date.getDate() &&
        (selectedStatus === null || schedule.status === selectedStatus)
      )
    })
  }

  const days = getDaysInMonth(currentDate)
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  // Navegar entre meses
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 p-8 text-center">
        <p className="text-error-600 dark:text-error-400">Erro ao carregar agendamentos: {error.message}</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 p-8">
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      {/* Header com navegação e filtros */}
      <CalendarHeader
        currentDate={currentDate}
        onPreviousMonth={goToPreviousMonth}
        onNextMonth={goToNextMonth}
        onToday={goToToday}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        onRefresh={mutate}
      />

      {/* Grid do calendário */}
      <div className="p-6 bg-neutral-50 dark:bg-neutral-900">
        {/* Dias da semana */}
        <div className="grid grid-cols-7 gap-3 mb-3">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-bold text-neutral-600 dark:text-neutral-400 py-2 uppercase tracking-wide"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Dias do mês */}
        <div className="grid grid-cols-7 gap-3">
          {days.map((day, index) => (
            <CalendarDayCell
              key={index}
              date={day.date}
              isCurrentMonth={day.isCurrentMonth}
              schedules={getSchedulesForDay(day.date)}
              onRefresh={mutate}
            />
          ))}
        </div>
      </div>

      {/* Legenda de status */}
      <div className="border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-6 py-4">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="font-semibold text-neutral-700 dark:text-neutral-300">Legenda:</span>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/30"></div>
            <span className="text-neutral-600 dark:text-neutral-400">Pendente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/30"></div>
            <span className="text-neutral-600 dark:text-neutral-400">Processando</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/30"></div>
            <span className="text-neutral-600 dark:text-neutral-400">Concluído</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/30"></div>
            <span className="text-neutral-600 dark:text-neutral-400">Falhou</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-neutral-500"></div>
            <span className="text-neutral-600 dark:text-neutral-400">Cancelado</span>
          </div>
        </div>
      </div>
    </div>
  )
}
