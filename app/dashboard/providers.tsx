'use client'

import { ThemeProvider } from '@/app/providers/theme-provider'
import { ClientDashboardLayout } from '@/components/templates/client-dashboard-layout'
import type { UserRole } from '@/lib/auth'

interface DashboardProvidersProps {
  children: React.ReactNode
  role: UserRole
  profileIds: string[]
}

export function DashboardProviders({ children, role, profileIds }: DashboardProvidersProps) {
  return (
    <ThemeProvider>
      <ClientDashboardLayout role={role} profileIds={profileIds}>
        {children}
      </ClientDashboardLayout>
    </ThemeProvider>
  )
}
