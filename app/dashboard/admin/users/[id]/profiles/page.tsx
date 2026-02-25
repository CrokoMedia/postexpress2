'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, RefreshCw, ArrowLeft, Instagram } from 'lucide-react'

interface Profile {
  id: string
  username: string
  full_name: string | null
  followers_count: number | null
  profile_pic_url_hd: string | null
  is_verified: boolean
  total_audits: number
  last_scraped_at: string | null
  linked_at: string
}

interface AvailableProfile {
  id: string
  username: string
  full_name: string | null
  followers_count: number | null
  is_verified: boolean
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function UserProfilesPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const userId = resolvedParams.id
  const router = useRouter()

  const [profiles, setProfiles] = useState<Profile[]>([])
  const [availableProfiles, setAvailableProfiles] = useState<AvailableProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedProfileId, setSelectedProfileId] = useState<string>('')
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProfiles()
    fetchAvailableProfiles()
  }, [userId])

  async function fetchProfiles() {
    setLoading(true)
    try {
      const res = await fetch(`/api/users/${userId}/profiles`)
      const data = await res.json()
      if (res.ok) {
        setProfiles(data.profiles || [])
      } else {
        setError(data.error || 'Erro ao carregar perfis')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function fetchAvailableProfiles() {
    try {
      const res = await fetch('/api/profiles')
      const data = await res.json()
      if (res.ok) {
        setAvailableProfiles(data.profiles || [])
      }
    } catch (err) {
      console.error('Failed to fetch available profiles:', err)
    }
  }

  async function handleAddProfile() {
    if (!selectedProfileId) {
      setError('Selecione um perfil')
      return
    }

    setWorking(true)
    setError('')

    try {
      const res = await fetch(`/api/users/${userId}/profiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: selectedProfileId }),
      })

      const data = await res.json()

      if (res.ok) {
        setShowAddModal(false)
        setSelectedProfileId('')
        await fetchProfiles()
      } else {
        setError(data.error || 'Erro ao vincular perfil')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setWorking(false)
    }
  }

  async function handleRemoveProfile(profileId: string, username: string) {
    if (!confirm(`Desvincular perfil @${username}?`)) return

    setWorking(true)
    setError('')

    try {
      const res = await fetch(`/api/users/${userId}/profiles?profile_id=${profileId}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (res.ok) {
        await fetchProfiles()
      } else {
        setError(data.error || 'Erro ao desvincular perfil')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setWorking(false)
    }
  }

  // Filtrar perfis disponíveis (excluir já vinculados)
  const linkedIds = profiles.map(p => p.id)
  const filteredAvailable = availableProfiles.filter(p => !linkedIds.includes(p.id))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="rounded-lg border border-neutral-700 p-2 text-neutral-400 hover:text-neutral-50 hover:border-neutral-600 transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-50">Perfis Vinculados</h1>
            <p className="text-neutral-400 text-sm mt-1">
              Gerencie os perfis do Instagram vinculados a este usuário
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchProfiles}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-neutral-700 px-3 py-2 text-sm text-neutral-400 hover:text-neutral-50 hover:border-neutral-600 transition disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-lg bg-primary-500 hover:bg-primary-600 px-4 py-2 text-sm font-medium text-white transition"
          >
            <Plus className="h-4 w-4" />
            Vincular Perfil
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Profiles grid */}
      {loading ? (
        <div className="text-center py-12 text-neutral-500">Carregando...</div>
      ) : profiles.length === 0 ? (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-12 text-center">
          <Instagram className="h-12 w-12 text-neutral-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-400 mb-2">
            Nenhum perfil vinculado
          </h3>
          <p className="text-sm text-neutral-500 mb-6">
            Vincule perfis do Instagram para que o usuário possa acessá-los
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="rounded-lg bg-primary-500 hover:bg-primary-600 px-4 py-2 text-sm font-medium text-white transition"
          >
            Vincular Primeiro Perfil
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map(profile => (
            <div
              key={profile.id}
              className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 hover:border-neutral-700 transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {profile.profile_pic_url_hd ? (
                    <img
                      src={profile.profile_pic_url_hd}
                      alt={profile.username}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-neutral-800 flex items-center justify-center">
                      <Instagram className="h-6 w-6 text-neutral-600" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-neutral-50">
                        @{profile.username}
                      </span>
                      {profile.is_verified && (
                        <svg className="h-4 w-4 text-blue-500" viewBox="0 0 22 22" fill="currentColor">
                          <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"></path>
                        </svg>
                      )}
                    </div>
                    {profile.full_name && (
                      <p className="text-xs text-neutral-500">{profile.full_name}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveProfile(profile.id, profile.username)}
                  disabled={working}
                  className="rounded p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition disabled:opacity-50"
                  title="Desvincular perfil"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-neutral-800">
                <div>
                  <p className="text-xs text-neutral-500">Seguidores</p>
                  <p className="text-sm font-medium text-neutral-300">
                    {profile.followers_count?.toLocaleString('pt-BR') || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Auditorias</p>
                  <p className="text-sm font-medium text-neutral-300">
                    {profile.total_audits || 0}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-neutral-800">
                <p className="text-xs text-neutral-500">
                  Vinculado em {new Date(profile.linked_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Profile Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-neutral-50 mb-4">
              Vincular Perfil
            </h2>

            {filteredAvailable.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-neutral-500">
                  Nenhum perfil disponível para vincular
                </p>
                <p className="text-sm text-neutral-600 mt-2">
                  Todos os perfis já estão vinculados a este usuário
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Selecione um perfil
                  </label>
                  <select
                    value={selectedProfileId}
                    onChange={e => setSelectedProfileId(e.target.value)}
                    className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-neutral-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">-- Selecione --</option>
                    {filteredAvailable.map(profile => (
                      <option key={profile.id} value={profile.id}>
                        @{profile.username}
                        {profile.full_name && ` - ${profile.full_name}`}
                        {profile.is_verified && ' ✓'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleAddProfile}
                    disabled={!selectedProfileId || working}
                    className="flex-1 rounded-lg bg-primary-500 hover:bg-primary-600 disabled:opacity-50 px-4 py-2 text-sm font-medium text-white transition"
                  >
                    {working ? 'Vinculando...' : 'Vincular'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddModal(false)
                      setSelectedProfileId('')
                      setError('')
                    }}
                    disabled={working}
                    className="flex-1 rounded-lg border border-neutral-700 px-4 py-2 text-sm text-neutral-400 hover:text-neutral-50 transition disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
