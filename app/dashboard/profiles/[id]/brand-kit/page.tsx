'use client'

import { useState, useEffect } from 'react'
import { Palette, Plus, ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/molecules/page-header'
import { Button } from '@/components/atoms/button'
import { BrandKitCard } from '@/components/molecules/brand-kit-card'
import { BrandKitFormModal } from '@/components/organisms/brand-kit-form-modal'
import { useBrandKits } from '@/hooks/use-brand-kits'
import { toast } from 'sonner'
import type { BrandKit } from '@/types/database'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ProfileBrandKitPage() {
  const params = useParams()
  const router = useRouter()
  const profileId = params.id as string

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingKit, setEditingKit] = useState<BrandKit | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [profileData, setProfileData] = useState<any>(null)

  // Buscar dados do perfil
  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch(`/api/profiles/${profileId}`)
        const data = await response.json()
        setProfileData(data.profile)
      } catch (error) {
        console.error('Erro ao buscar perfil:', error)
        toast.error('Erro ao carregar perfil')
      }
    }

    if (profileId) fetchProfile()
  }, [profileId])

  // Usar hook para buscar brand kits
  const { brandKits, defaultKit, isLoading, isError, mutate } = useBrandKits(profileId)

  // Handlers
  const handleCreate = () => {
    setEditingKit(null)
    setIsModalOpen(true)
  }

  const handleEdit = (kitId: string) => {
    const kit = brandKits.find(k => k.id === kitId)
    if (kit) {
      setEditingKit(kit)
      setIsModalOpen(true)
    }
  }

  const handleDelete = async (kitId: string) => {
    const confirmed = window.confirm('Tem certeza que deseja excluir este Brand Kit?')
    if (!confirmed) return

    try {
      setIsDeleting(kitId)
      const response = await fetch(`/api/brand-kits/${kitId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir brand kit')
      }

      mutate()
      toast.success('Brand Kit excluído com sucesso')
    } catch (error) {
      console.error('Erro ao excluir brand kit:', error)
      toast.error('Erro ao excluir brand kit')
    } finally {
      setIsDeleting(null)
    }
  }

  const handleSetDefault = async (kitId: string) => {
    try {
      const response = await fetch(`/api/brand-kits/${kitId}/set-default`, {
        method: 'PATCH',
      })

      if (!response.ok) {
        throw new Error('Erro ao definir brand kit padrão')
      }

      mutate()
      toast.success('Brand Kit definido como padrão')
    } catch (error) {
      console.error('Erro ao definir brand kit padrão:', error)
      toast.error('Erro ao definir brand kit padrão')
    }
  }

  const handleSuccess = () => {
    setIsModalOpen(false)
    setEditingKit(null)
    mutate()
    toast.success(editingKit ? 'Brand Kit atualizado com sucesso' : 'Brand Kit criado com sucesso')
  }

  // Mostrar erro se houver
  useEffect(() => {
    if (isError) {
      toast.error('Erro ao carregar brand kits')
    }
  }, [isError])

  // Loading state
  if (isLoading || !profileData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-9 w-48 bg-neutral-800 rounded animate-pulse" />
            <div className="h-5 w-96 bg-neutral-800 rounded mt-2 animate-pulse" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 animate-pulse">
              <div className="h-6 w-32 bg-neutral-800 rounded mb-4" />
              <div className="flex gap-2 mb-4">
                {[1, 2, 3].map(j => (
                  <div key={j} className="h-8 w-8 rounded-full bg-neutral-800" />
                ))}
              </div>
              <div className="h-4 w-full bg-neutral-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Estado vazio
  if (!brandKits || brandKits.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href={`/dashboard/profiles/${profileId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-500/10">
              <Palette className="h-10 w-10 text-primary-500" />
            </div>

            <h2 className="text-2xl font-bold text-neutral-50 mb-2">
              Nenhum Brand Kit criado
            </h2>

            <p className="text-neutral-400 mb-2">
              Crie o Brand Kit para <span className="font-semibold text-neutral-300">@{profileData.username}</span>
            </p>

            <p className="text-neutral-500 text-sm mb-6">
              Defina cores, fontes, logo e tom de voz para manter a identidade visual consistente.
            </p>

            <Button onClick={handleCreate} size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Criar Primeiro Brand Kit
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Com kits
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/dashboard/profiles/${profileId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
      </div>

      <PageHeader
        title={`Brand Kits - @${profileData.username}`}
        description="Gerencie a identidade visual deste perfil"
        action={
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Brand Kit
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {brandKits.map(kit => (
          <BrandKitCard
            key={kit.id}
            brandKit={kit}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSetDefault={handleSetDefault}
          />
        ))}
      </div>

      {/* Modal de criação/edição */}
      {profileId && (
        <BrandKitFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingKit(null)
          }}
          onSuccess={handleSuccess}
          editingKit={editingKit}
          profileId={profileId}
        />
      )}
    </div>
  )
}
