'use client'

import useSWR from 'swr'
import type { BrandKit } from '@/types/database'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useBrandKits(profileId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    profileId ? `/api/brand-kits?profile_id=${profileId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 30000, // Refresh every 30s
    }
  )

  return {
    brandKits: (data?.brand_kits || []) as BrandKit[],
    defaultKit: (data?.default_kit || null) as BrandKit | null,
    isLoading,
    isError: error,
    mutate
  }
}
