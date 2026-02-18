import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import { getUserRole } from '@/lib/auth'
import { DashboardLayout } from '@/components/templates/dashboard-layout'

export default async function Layout({ children }: { children: React.ReactNode }) {
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
    <DashboardLayout role={roleData.role} profileIds={roleData.profile_ids}>
      {children}
    </DashboardLayout>
  )
}
