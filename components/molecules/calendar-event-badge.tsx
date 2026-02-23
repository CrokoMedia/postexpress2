'use client'

type Schedule = {
  id: string
  scheduled_at: string
  quantity: number
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  custom_theme: string | null
  profiles: {
    username: string
    full_name: string
  }
}

type CalendarEventBadgeProps = {
  schedule: Schedule
  onClick: () => void
}

const statusConfig = {
  pending: {
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/30',
    text: 'text-yellow-300',
    dot: 'bg-yellow-500',
    shadow: 'shadow-yellow-500/30',
  },
  processing: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    text: 'text-blue-300',
    dot: 'bg-blue-500',
    shadow: 'shadow-blue-500/30',
  },
  completed: {
    bg: 'bg-green-500/20',
    border: 'border-green-500/30',
    text: 'text-green-300',
    dot: 'bg-green-500',
    shadow: 'shadow-green-500/30',
  },
  failed: {
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
    text: 'text-red-300',
    dot: 'bg-red-500',
    shadow: 'shadow-red-500/30',
  },
  cancelled: {
    bg: 'bg-neutral-600/20',
    border: 'border-neutral-600/30',
    text: 'text-neutral-600 dark:text-neutral-400',
    dot: 'bg-neutral-500',
    shadow: '',
  },
}

export default function CalendarEventBadge({ schedule, onClick }: CalendarEventBadgeProps) {
  const config = statusConfig[schedule.status]
  const time = new Date(schedule.scheduled_at).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-2.5 py-1.5 rounded-lg border ${config.bg} ${config.border} ${config.text} hover:shadow-lg ${config.shadow} transition-all duration-200 hover:scale-[1.02] text-xs`}
    >
      <div className="flex items-center gap-1.5">
        {/* Dot colorido */}
        <div className={`w-2 h-2 rounded-full ${config.dot} shadow-sm flex-shrink-0`}></div>

        {/* Horário e quantidade */}
        <span className="font-bold truncate">
          {time} • {schedule.quantity}x
        </span>
      </div>

      {/* Username (opcional, se couber) */}
      {schedule.profiles?.username && (
        <div className="text-[10px] opacity-80 truncate mt-0.5 ml-3.5">
          @{schedule.profiles.username}
        </div>
      )}
    </button>
  )
}
