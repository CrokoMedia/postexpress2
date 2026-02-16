'use client'

import { useState } from 'react'
import { Card } from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { Badge } from '@/components/atoms/badge'
import { formatNumber, getScoreClassification } from '@/lib/format'
import { CheckCircle, TrendingUp, TrendingDown } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { Profile, Audit } from '@/types/database'

interface ProfileCardProps {
  profile: Profile
  lastAudit?: Audit | null
  onClick?: () => void
}

export function ProfileCard({ profile, lastAudit, onClick }: ProfileCardProps) {
  const [imageError, setImageError] = useState(false)

  const classification = lastAudit?.score_overall
    ? getScoreClassification(lastAudit.score_overall)
    : null

  const profilePicUrl = profile.profile_pic_cloudinary_url || profile.profile_pic_url_hd
  const hasProfilePic = profilePicUrl && !imageError

  return (
    <Card
      className="p-6 hover:shadow-lg hover:border-primary-500/50 transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative h-16 w-16 rounded-full bg-neutral-700 shrink-0 overflow-hidden ring-2 ring-neutral-700 group-hover:ring-primary-500/50 transition-all">
          {hasProfilePic ? (
            <Image
              src={profilePicUrl}
              alt={profile.username}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-500 text-2xl font-bold">
              {profile.username[0].toUpperCase()}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold truncate">{profile.full_name || profile.username}</h3>
            {profile.is_verified && <CheckCircle className="h-4 w-4 text-info-500 shrink-0" />}
          </div>
          <p className="text-sm text-neutral-400">@{profile.username}</p>
          <p className="text-xs text-neutral-500 mt-0.5">
            {formatNumber(profile.followers_count || 0)} seguidores
          </p>
        </div>

        {/* Score */}
        {lastAudit && classification && (
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className={`text-3xl font-bold ${classification.color}`}>
              {lastAudit.score_overall}
            </div>
            <Badge
              variant={
                lastAudit.score_overall! >= 75 ? 'success' :
                lastAudit.score_overall! >= 50 ? 'warning' :
                'error'
              }
            >
              {classification.label}
            </Badge>
            <div className="text-xs text-neutral-500">
              {new Date(lastAudit.audit_date).toLocaleDateString('pt-BR')}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 shrink-0">
          <Link href={`/dashboard/profiles/${profile.id}`}>
            <Button variant="secondary" size="sm" className="w-full">
              Ver Perfil →
            </Button>
          </Link>
          {lastAudit && (
            <Link href={`/dashboard/audits/${lastAudit.id}`}>
              <Button variant="ghost" size="sm" className="w-full">
                Ver Auditoria
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Card>
  )
}
