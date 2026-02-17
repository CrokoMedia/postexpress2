'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

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
