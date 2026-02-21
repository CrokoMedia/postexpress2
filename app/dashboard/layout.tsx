import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createServerSupabase } from '@/lib/supabase-server'
import { getUserRole } from '@/lib/auth'
import { DashboardProviders } from './providers'

export default async function Layout({ children }: { children: React.ReactNode }) {
  // Rotas públicas sinaladas pelo middleware não exigem auth
  const headersList = await headers()
  if (headersList.get('x-public-route') === 'true') {
    return (
      <div className="relative flex min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors duration-300">
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    )
  }

  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const roleData = await getUserRole(user.id)

  if (!roleData) {
    redirect('/login')
  }

  return (
    <DashboardProviders role={roleData.role} profileIds={roleData.profile_ids}>
      {children}
    </DashboardProviders>
  )
}
