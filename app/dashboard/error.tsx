'use client'

import { useEffect } from 'react'
import { Button } from '@/components/atoms/button'
import { AlertTriangle } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 p-8 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-neutral-100 mb-2">
          Algo deu errado
        </h2>
        <p className="text-neutral-400 max-w-md">
          {error.message || 'Ocorreu um erro inesperado. Tente novamente.'}
        </p>
      </div>
      <Button variant="primary" onClick={reset}>
        Tentar novamente
      </Button>
    </div>
  )
}
