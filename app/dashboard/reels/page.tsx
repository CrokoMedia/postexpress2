'use client'

import { useRouter } from 'next/navigation'
import { useProfiles } from '@/hooks/use-profiles'
import { PageHeader } from '@/components/molecules/page-header'
import { Card, CardContent } from '@/components/atoms/card'
import { Skeleton } from '@/components/atoms/skeleton'
import { Video, ChevronRight } from 'lucide-react'

export default function ReelsHubPage() {
  const { profiles, isLoading, isError } = useProfiles()
  const router = useRouter()

  return (
    <div>
      <PageHeader
        title="Reel Production"
        description="Selecione um perfil para produzir reels a partir de carrosséis aprovados"
      />

      <div className="space-y-3">
        {isLoading && (
          <>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </>
        )}

        {isError && (
          <div className="text-error-500 text-center py-12">
            Erro ao carregar perfis.
          </div>
        )}

        {!isLoading && !isError && profiles && profiles.length === 0 && (
          <Card>
            <CardContent className="py-16 text-center">
              <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-300 mb-2">Nenhum perfil encontrado</h3>
              <p className="text-sm text-muted-foreground">
                Crie uma análise primeiro para produzir reels.
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && profiles && profiles.map((profile) => (
          <button
            key={profile.id}
            onClick={() => router.push(`/dashboard/profiles/${profile.id}/reels`)}
            className="w-full text-left"
          >
            <Card className="hover:border-info-500/50 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center gap-4">
                {profile.profile_pic_cloudinary_url || profile.profile_pic_url_hd ? (
                  <img
                    src={profile.profile_pic_cloudinary_url || profile.profile_pic_url_hd || ''}
                    alt={profile.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-neutral-700 flex items-center justify-center">
                    <span className="text-neutral-400 font-bold text-lg">
                      {profile.username?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-neutral-100 truncate">
                    {profile.full_name || profile.username}
                  </h3>
                  <p className="text-sm text-neutral-400">@{profile.username}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-9 h-9 rounded-lg bg-info-500/20 flex items-center justify-center">
                    <Video className="w-4 h-4 text-info-400" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>
    </div>
  )
}
