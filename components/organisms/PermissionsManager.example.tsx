/**
 * Exemplo de uso do componente PermissionsManager
 *
 * Este arquivo demonstra como integrar o componente na página de administração
 */

'use client'

import { useState } from 'react'
import { PermissionsManager } from './PermissionsManager'

export function PermissionsManagerExample() {
  const [currentPermissions, setCurrentPermissions] = useState<string[]>([
    'view_audits',
    'create_content',
    'edit_content',
    'export_zip',
  ])

  async function handleSavePermissions(permissions: string[]) {
    // Exemplo de chamada à API
    const response = await fetch(`/api/admin/users/user-123/permissions`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ permissions }),
    })

    if (!response.ok) {
      throw new Error('Erro ao salvar permissões')
    }

    // Atualizar estado local após sucesso
    setCurrentPermissions(permissions)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <PermissionsManager
        userId="user-123"
        currentPermissions={currentPermissions}
        onSave={handleSavePermissions}
      />
    </div>
  )
}

/**
 * INTEGRAÇÃO NA PÁGINA DE ADMIN
 *
 * Em /app/dashboard/admin/users/[id]/permissions/page.tsx:
 *
 * ```tsx
 * 'use client'
 *
 * import { useState, useEffect } from 'react'
 * import { useParams } from 'next/navigation'
 * import { PermissionsManager } from '@/components/organisms/PermissionsManager'
 *
 * export default function UserPermissionsPage() {
 *   const params = useParams()
 *   const userId = params.id as string
 *   const [permissions, setPermissions] = useState<string[]>([])
 *   const [loading, setLoading] = useState(true)
 *
 *   useEffect(() => {
 *     async function fetchPermissions() {
 *       const res = await fetch(`/api/admin/users/${userId}/permissions`)
 *       const data = await res.json()
 *       setPermissions(data.permissions || [])
 *       setLoading(false)
 *     }
 *     fetchPermissions()
 *   }, [userId])
 *
 *   async function handleSave(newPermissions: string[]) {
 *     const res = await fetch(`/api/admin/users/${userId}/permissions`, {
 *       method: 'PATCH',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify({ permissions: newPermissions }),
 *     })
 *
 *     if (!res.ok) {
 *       throw new Error('Erro ao salvar permissões')
 *     }
 *
 *     setPermissions(newPermissions)
 *   }
 *
 *   if (loading) return <div>Carregando...</div>
 *
 *   return (
 *     <div className="space-y-6">
 *       <div>
 *         <h1 className="text-2xl font-bold text-neutral-50">Gerenciar Permissões</h1>
 *         <p className="text-neutral-400 text-sm mt-1">
 *           Configure as permissões de acesso do usuário
 *         </p>
 *       </div>
 *
 *       <PermissionsManager
 *         userId={userId}
 *         currentPermissions={permissions}
 *         onSave={handleSave}
 *       />
 *     </div>
 *   )
 * }
 * ```
 */
