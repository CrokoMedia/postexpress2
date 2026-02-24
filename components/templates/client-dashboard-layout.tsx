'use client'

import { Sidebar } from '@/components/organisms/sidebar'
import type { UserRole } from '@/lib/auth'

interface ClientDashboardLayoutProps {
  children: React.ReactNode
  role: UserRole
  profileIds: string[]
}

export function ClientDashboardLayout({ children, role, profileIds }: ClientDashboardLayoutProps) {
  return (
    <div className="relative flex min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors duration-300">
      <Sidebar role={role} profileIds={profileIds} />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
