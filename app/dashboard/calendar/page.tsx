import { Metadata } from 'next'
import { Suspense } from 'react'
import ContentCalendar from '@/components/organisms/content-calendar'
import { Skeleton } from '@/components/atoms/skeleton'
import { Calendar } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Calendário de Conteúdo | Croko Lab',
  description: 'Visualize e gerencie seus agendamentos de geração de conteúdo',
}

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                Calendário de Conteúdo
              </h1>
              <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                Gerencie seus agendamentos de forma visual
              </p>
            </div>
          </div>
        </div>

        {/* Calendário */}
        <Suspense
          fallback={
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 p-8">
              <Skeleton className="h-96 w-full" />
            </div>
          }
        >
          <ContentCalendar />
        </Suspense>
      </div>
    </div>
  )
}
