import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { FloatingThemeToggle } from '@/components/layout/floating-theme-toggle'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Segunda línea de defensa (el middleware es la primera)
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-[#E2E7ED] dark:bg-[#0a0a0a] transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header userEmail={user.email ?? ''} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
      <FloatingThemeToggle />
    </div>
  )
}
