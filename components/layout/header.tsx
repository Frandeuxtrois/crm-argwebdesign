'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

interface HeaderProps {
  userEmail: string
}

export function Header({ userEmail }: HeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  // Obtener iniciales del email para el avatar
  const initials = userEmail.slice(0, 2).toUpperCase()

  return (
    <header className="h-14 border-b bg-white flex items-center justify-between px-6">
      {/* Lado izquierdo — vacío por ahora, aquí irá el breadcrumb */}
      <div />

      {/* Lado derecho — usuario + logout */}
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs bg-gray-100">{initials}</AvatarFallback>
        </Avatar>
        <span className="text-sm text-gray-600 hidden sm:block">{userEmail}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          title="Cerrar sesión"
          className="h-8 w-8"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
