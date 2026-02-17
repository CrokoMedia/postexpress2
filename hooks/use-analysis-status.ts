'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useAnalysisStatus(id: string) {
  const { data, error, isLoading } = useSWR(
    id ? `/api/analysis/${id}` : null,
    fetcher,
    {
      refreshInterval: (data) => {
        // Poll every 2s if processing, stop if completed/failed
        if (data?.status === 'processing' || data?.status === 'pending') {
          return 2000
        }
        return 0
      }
    }
  )

  return {
    status: data?.status,
    progress: data?.progress,
    currentPhase: data?.current_phase,
    result: data?.result,
    error: data?.error_message,
    isLoading,
    isError: error,
  }
}
