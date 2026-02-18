'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BarChart3, TrendingUp } from 'lucide-react'

interface Profile {
  id: string
  username: string
  full_name: string | null
  profile_pic_url: string | null
  follower_count: number | null
  overall_score: number | null
}

export default function MeusPerfilsPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(async ({ profile_ids }) => {
        if (!profile_ids?.length) { setLoading(false); return }

        const results = await Promise.all(
          profile_ids.map((id: string) =>
            fetch(`/api/profiles/${id}`).then(r => r.json())
          )
        )

        setProfiles(results.map(r => {
          const p = r.profile
          const lastAudit = p.audits?.[0]
          return {
            id: p.id,
            username: p.username,
            full_name: p.full_name,
            profile_pic_url: p.profile_pic_url,
            follower_count: p.follower_count,
            overall_score: lastAudit?.overall_score ?? null,
          }
        }))
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-neutral-50">Meus Perfis</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2].map(i => (
            <div key={i} className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 animate-pulse">
              <div className="h-10 w-10 rounded-full bg-neutral-800 mb-3" />
              <div className="h-4 w-32 bg-neutral-800 rounded mb-2" />
              <div className="h-3 w-20 bg-neutral-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-50">Meus Perfis</h1>
        <p className="text-neutral-400 text-sm mt-1">Selecione o perfil que deseja visualizar</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {profiles.map(profile => (
          <Link
            key={profile.id}
            href={`/dashboard/profiles/${profile.id}`}
            className="group rounded-xl border border-neutral-800 bg-neutral-900 p-6 hover:border-primary-500/50 hover:bg-neutral-800/50 transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              {profile.profile_pic_url ? (
                <img
                  src={profile.profile_pic_url}
                  alt={profile.username}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-primary-500/20 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-primary-400" />
                </div>
              )}
              <div>
                <p className="font-semibold text-neutral-50">@{profile.username}</p>
                {profile.full_name && (
                  <p className="text-xs text-neutral-400">{profile.full_name}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              {profile.follower_count != null && (
                <span className="text-neutral-400">
                  {profile.follower_count.toLocaleString('pt-BR')} seguidores
                </span>
              )}
              {profile.overall_score != null && (
                <span className="flex items-center gap-1 text-primary-400 font-medium">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {profile.overall_score}/10
                </span>
              )}
            </div>

            <div className="mt-3 text-xs text-primary-500 group-hover:text-primary-400 transition font-medium">
              Ver auditoria →
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
