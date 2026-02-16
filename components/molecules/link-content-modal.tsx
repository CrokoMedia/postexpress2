'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/atoms/dialog'
import { Button } from '@/components/atoms/button'
import { Badge } from '@/components/atoms/badge'
import { Input } from '@/components/atoms/input'
import { toast } from 'sonner'
import { Link2, Search, Check, X } from 'lucide-react'

interface Profile {
  id: string
  username: string
  full_name: string | null
  profile_pic_url_hd: string | null
}

interface LinkContentModalProps {
  contentId: string
  currentProfileId: string
  currentProfileUsername: string
  isOpen: boolean
  onClose: () => void
  onLinked?: () => void
}

export function LinkContentModal({
  contentId,
  currentProfileId,
  currentProfileUsername,
  isOpen,
  onClose,
  onLinked
}: LinkContentModalProps) {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [linkedProfiles, setLinkedProfiles] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [linking, setLinking] = useState<string | null>(null)

  // Carregar perfis disponíveis e vínculos existentes
  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen, contentId])

  const loadData = async () => {
    setLoading(true)
    try {
      // 1. Carregar todos os perfis
      const profilesRes = await fetch('/api/profiles')
      const profilesData = await profilesRes.json()

      // Filtrar perfil atual
      const availableProfiles = (profilesData.profiles || []).filter(
        (p: Profile) => p.id !== currentProfileId
      )
      setProfiles(availableProfiles)

      // 2. Carregar vínculos existentes
      const linksRes = await fetch(`/api/content/${contentId}/link`)
      const linksData = await linksRes.json()

      const linkedIds = new Set<string>(
        (linksData.linked_profiles || []).map((lp: any) => lp.profile.id as string)
      )
      setLinkedProfiles(linkedIds)

    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar perfis')
    } finally {
      setLoading(false)
    }
  }

  const handleLink = async (profileId: string, username: string) => {
    setLinking(profileId)
    try {
      const res = await fetch(`/api/content/${contentId}/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: profileId,
          link_type: 'shared'
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Erro ao vincular')
      }

      toast.success(`Conteúdo vinculado a @${username}!`)
      setLinkedProfiles(prev => new Set([...prev, profileId]))
      onLinked?.()

    } catch (error: any) {
      toast.error(error.message || 'Erro ao vincular conteúdo')
    } finally {
      setLinking(null)
    }
  }

  const handleUnlink = async (profileId: string, username: string) => {
    setLinking(profileId)
    try {
      const res = await fetch(
        `/api/content/${contentId}/link?profile_id=${profileId}`,
        { method: 'DELETE' }
      )

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Erro ao desvincular')
      }

      toast.success(`Vínculo removido de @${username}`)
      setLinkedProfiles(prev => {
        const newSet = new Set(prev)
        newSet.delete(profileId)
        return newSet
      })
      onLinked?.()

    } catch (error: any) {
      toast.error(error.message || 'Erro ao desvincular conteúdo')
    } finally {
      setLinking(null)
    }
  }

  const filteredProfiles = profiles.filter(p =>
    p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Vincular Conteúdo a Outros Perfis
          </DialogTitle>
          <DialogDescription>
            Este conteúdo foi criado para <strong>@{currentProfileUsername}</strong>.
            Vincule-o a outros perfis para reutilizá-lo.
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <Input
            type="text"
            placeholder="Buscar perfil..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Profile List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-neutral-400">
              Carregando perfis...
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="text-center py-8 text-neutral-400">
              {searchQuery ? 'Nenhum perfil encontrado' : 'Nenhum outro perfil disponível'}
            </div>
          ) : (
            filteredProfiles.map((profile) => {
              const isLinked = linkedProfiles.has(profile.id)
              const isProcessing = linking === profile.id

              return (
                <div
                  key={profile.id}
                  className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-lg border border-neutral-700 hover:border-neutral-600 transition-all"
                >
                  <div className="flex items-center gap-3">
                    {profile.profile_pic_url_hd ? (
                      <img
                        src={profile.profile_pic_url_hd}
                        alt={profile.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {profile.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}

                    <div>
                      <div className="font-medium">@{profile.username}</div>
                      {profile.full_name && (
                        <div className="text-sm text-neutral-400">
                          {profile.full_name}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isLinked && (
                      <Badge variant="success" className="text-xs">
                        <Check className="w-3 h-3 mr-1" />
                        Vinculado
                      </Badge>
                    )}

                    {isLinked ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleUnlink(profile.id, profile.username)}
                        loading={isProcessing}
                        disabled={isProcessing}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Desvincular
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleLink(profile.id, profile.username)}
                        loading={isProcessing}
                        disabled={isProcessing}
                      >
                        <Link2 className="w-4 h-4 mr-1" />
                        Vincular
                      </Button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer Info */}
        <div className="pt-4 border-t border-neutral-800 text-sm text-neutral-400">
          <p>💡 <strong>Dica:</strong> Conteúdos vinculados aparecem na lista de conteúdos de ambos os perfis.</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
