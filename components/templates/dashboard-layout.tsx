import { Sidebar } from '@/components/organisms/sidebar'
import type { UserRole } from '@/lib/auth'

interface DashboardLayoutProps {
  children: React.ReactNode
  role: UserRole
  profileIds: string[]
}

export function DashboardLayout({ children, role, profileIds }: DashboardLayoutProps) {
  return (
    <div className="relative flex min-h-screen">
      <Sidebar role={role} profileIds={profileIds} />
      <main className="flex-1 ml-64 p-8 bg-neutral-950">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
