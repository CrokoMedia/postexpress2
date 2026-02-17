'use client'

import useSWR from 'swr'
import type { ProfileWithLatestAudit } from '@/types/database'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useProfiles(limit = 20, offset = 0) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/profiles?limit=${limit}&offset=${offset}`,
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 30000, // Refresh every 30s
    }
  )

  return {
    profiles: data?.profiles as ProfileWithLatestAudit[] | undefined,
    total: data?.total,
    isLoading,
    isError: error,
    mutate
  }
}

export function useProfile(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/profiles/${id}` : null,
    fetcher
  )

  return {
    profile: data?.profile,
    isLoading,
    isError: error,
    mutate
  }
}
