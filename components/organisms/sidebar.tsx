'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Plus, BarChart3, GitCompare, Settings, ListChecks } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Nova Análise', href: '/dashboard/new', icon: Plus },
  { name: 'Fila de Análises', href: '/dashboard/queue', icon: ListChecks },
  { name: 'Perfis', href: '/dashboard/profiles', icon: BarChart3 },
  { name: 'Comparações', href: '/dashboard/comparisons', icon: GitCompare },
  { name: 'Configurações', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-neutral-900 border-r border-neutral-800">
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
      <nav className="flex-1 space-y-1 px-3 py-4">
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
      <div className="border-t border-neutral-800 p-4">
        <div className="text-xs text-neutral-500 text-center">
          v1.0.0 · Pazos Media
        </div>
      </div>
    </aside>
  )
}
