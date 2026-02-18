'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Plus, BarChart3, GitCompare, Settings, ListChecks, Users, LogOut, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/lib/auth'

const adminNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Nova Análise', href: '/dashboard/new', icon: Plus },
  { name: 'Fila de Análises', href: '/dashboard/queue', icon: ListChecks },
  { name: 'Perfis', href: '/dashboard/profiles', icon: BarChart3 },
  { name: 'Comparações', href: '/dashboard/comparisons', icon: GitCompare },
  { name: 'Configurações', href: '/dashboard/settings', icon: Settings },
  { name: 'Gerenciar Usuários', href: '/dashboard/admin/users', icon: Users },
]

interface SidebarProps {
  role: UserRole
  profileIds: string[]
}

export function Sidebar({ role, profileIds }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  // Navegação para clientes
  const clientNavigation = profileIds.length === 1
    ? [{ name: 'Meu Perfil', href: `/dashboard/profiles/${profileIds[0]}`, icon: BarChart3 }]
    : profileIds.length > 1
    ? [{ name: 'Meus Perfis', href: '/dashboard/meus-perfis', icon: Layers }]
    : [{ name: 'Dashboard', href: '/dashboard', icon: Home }]

  const navigation = role === 'admin' ? adminNavigation : clientNavigation

  async function handleSignOut() {
    await fetch('/api/auth/signout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-neutral-800 px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
            <span className="text-white font-bold text-sm">PE</span>
          </div>
          <span className="text-lg font-semibold text-neutral-50">Post Express</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary-500/10 text-primary-500 border-l-2 border-primary-500 pl-[10px]'
                  : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-50'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-neutral-800 p-4 space-y-3">
        {role === 'admin' && (
          <div className="text-xs text-primary-500/70 font-medium px-1">Admin</div>
        )}
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-400 hover:bg-neutral-800 hover:text-neutral-50 transition-all"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span>Sair</span>
        </button>
        <div className="text-xs text-neutral-500 text-center">
          v1.0.0 · Pazos Media
        </div>
      </div>
    </aside>
  )
}
