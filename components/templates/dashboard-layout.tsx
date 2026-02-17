import { Sidebar } from '@/components/organisms/sidebar'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 bg-neutral-950">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
