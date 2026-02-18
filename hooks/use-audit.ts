'use client'

import useSWR from 'swr'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return data
}

export function useAudit(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/audits/${id}` : null,
    fetcher
  )

  return {
    audit: data?.audit,
    isLoading,
    isError: error,
    mutate
  }
}
