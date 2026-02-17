'use client'

import { PageHeader } from '@/components/molecules/page-header'
import { Button } from '@/components/atoms/button'
import { ProfileCard } from '@/components/molecules/profile-card'
import { Skeleton } from '@/components/atoms/skeleton'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useProfiles } from '@/hooks/use-profiles'

export default function DashboardPage() {
  const { profiles, isLoading, isError } = useProfiles()
  const router = useRouter()

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Sistema de auditoria de perfis do Instagram"
        action={
          <Link href="/dashboard/new">
            <Button variant="primary" icon={<Plus className="h-4 w-4" />}>
              Nova Análise
            </Button>
          </Link>
        }
      />

      <div className="space-y-4">
        {isLoading && (
          <>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </>
        )}

        {isError && (
          <div className="text-error-500 text-center py-12">
            Erro ao carregar perfis. Verifique sua conexão com o Supabase.
          </div>
        )}

        {!isLoading && !isError && profiles && profiles.length === 0 && (
          <div className="text-neutral-400 text-center py-12">
            Nenhum perfil encontrado. Crie sua primeira análise!
          </div>
        )}

        {!isLoading && !isError && profiles && profiles.length > 0 && (
          profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              lastAudit={profile.latest_audit}
              onClick={() => router.push(`/dashboard/profiles/${profile.id}`)}
            />
          ))
        )}
      </div>
    </div>
  )
}
