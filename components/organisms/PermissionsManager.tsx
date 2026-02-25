'use client'

import { useState } from 'react'
import { Check, X, Shield, Lock, Unlock, AlertCircle } from 'lucide-react'
import { Switch } from '@/components/atoms/switch'
import { Button } from '@/components/atoms/button'

// Lista completa de permissões disponíveis
const AVAILABLE_PERMISSIONS = [
  {
    id: 'view_audits',
    label: 'Ver Auditorias',
    description: 'Permite visualizar auditorias completas dos perfis',
    icon: Shield,
    category: 'Visualização',
  },
  {
    id: 'create_content',
    label: 'Criar Conteúdo',
    description: 'Permite criar novos carrosséis e posts',
    icon: Unlock,
    category: 'Conteúdo',
  },
  {
    id: 'edit_content',
    label: 'Editar Conteúdo',
    description: 'Permite editar conteúdos existentes',
    icon: Unlock,
    category: 'Conteúdo',
  },
  {
    id: 'delete_content',
    label: 'Deletar Conteúdo',
    description: 'Permite deletar conteúdos permanentemente',
    icon: Lock,
    category: 'Conteúdo',
  },
  {
    id: 'export_drive',
    label: 'Exportar Google Drive',
    description: 'Permite exportar conteúdos para o Google Drive',
    icon: Unlock,
    category: 'Exportação',
  },
  {
    id: 'export_zip',
    label: 'Exportar ZIP',
    description: 'Permite baixar conteúdos em formato ZIP',
    icon: Unlock,
    category: 'Exportação',
  },
  {
    id: 'view_comparisons',
    label: 'Ver Comparações',
    description: 'Permite visualizar comparações temporais de auditorias',
    icon: Shield,
    category: 'Visualização',
  },
  {
    id: 'manage_profiles',
    label: 'Gerenciar Perfis',
    description: 'Permite adicionar e remover perfis do Instagram',
    icon: Lock,
    category: 'Administração',
  },
] as const

export interface PermissionsManagerProps {
  userId: string
  currentPermissions: string[]
  onSave: (permissions: string[]) => Promise<void>
  disabled?: boolean
}

export function PermissionsManager({
  userId,
  currentPermissions,
  onSave,
  disabled = false,
}: PermissionsManagerProps) {
  const [permissions, setPermissions] = useState<string[]>(currentPermissions)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  function togglePermission(permissionId: string) {
    if (disabled || saving) return

    setPermissions((prev) => {
      const newPermissions = prev.includes(permissionId)
        ? prev.filter((p) => p !== permissionId)
        : [...prev, permissionId]

      setHasChanges(JSON.stringify(newPermissions.sort()) !== JSON.stringify(currentPermissions.sort()))
      return newPermissions
    })
  }

  async function handleSave() {
    if (!hasChanges || saving) return

    setSaving(true)
    setError(null)

    try {
      await onSave(permissions)
      setHasChanges(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar permissões'
      setError(errorMessage)
      console.error('Erro ao salvar permissões:', err)
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setPermissions(currentPermissions)
    setHasChanges(false)
    setError(null)
  }

  // Agrupar permissões por categoria
  const permissionsByCategory = AVAILABLE_PERMISSIONS.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = []
    }
    acc[perm.category].push(perm)
    return acc
  }, {} as Record<string, Array<(typeof AVAILABLE_PERMISSIONS)[number]>>)

  const categories = Object.keys(permissionsByCategory).sort()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary-500/10 p-2">
            <Shield className="h-5 w-5 text-primary-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-50">Permissões</h3>
            <p className="text-sm text-neutral-400">
              Configure o acesso granular para este usuário
            </p>
          </div>
        </div>

        {hasChanges && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={saving}
            >
              <X className="h-4 w-4" />
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              loading={saving}
              disabled={!hasChanges}
            >
              <Check className="h-4 w-4" />
              Salvar Alterações
            </Button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-400">Erro ao salvar permissões</p>
              <p className="text-sm text-red-400/80 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Permissions List by Category */}
      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category}>
            {/* Category Header */}
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-neutral-300 uppercase tracking-wide">
                {category}
              </h4>
            </div>

            {/* Permissions in Category */}
            <div className="space-y-2">
              {permissionsByCategory[category].map((permission) => {
                const Icon = permission.icon
                const isEnabled = permissions.includes(permission.id)

                return (
                  <div
                    key={permission.id}
                    className={`
                      rounded-lg border transition-all duration-200
                      ${isEnabled
                        ? 'border-primary-500/30 bg-primary-500/5'
                        : 'border-neutral-800 bg-neutral-900/50'
                      }
                      ${disabled || saving ? 'opacity-60' : ''}
                    `}
                  >
                    <label
                      className={`
                        flex items-center justify-between p-4 cursor-pointer
                        ${disabled || saving ? 'cursor-not-allowed' : 'hover:bg-neutral-800/30'}
                      `}
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`
                          rounded p-2 transition-colors
                          ${isEnabled
                            ? 'bg-primary-500/10 text-primary-400'
                            : 'bg-neutral-800 text-neutral-500'
                          }
                        `}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-neutral-50">
                              {permission.label}
                            </p>
                          </div>
                          <p className="text-xs text-neutral-400 mt-1">
                            {permission.description}
                          </p>
                        </div>
                      </div>

                      <Switch
                        checked={isEnabled}
                        onChange={() => togglePermission(permission.id)}
                        disabled={disabled || saving}
                        className="ml-4"
                      />
                    </label>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Stats */}
      <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-400">
            Permissões habilitadas
          </span>
          <span className="font-semibold text-neutral-50">
            {permissions.length} de {AVAILABLE_PERMISSIONS.length}
          </span>
        </div>
      </div>
    </div>
  )
}
