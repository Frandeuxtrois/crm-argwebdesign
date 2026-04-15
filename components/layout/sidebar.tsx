'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CreditCard,
  CalendarClock,
  ClipboardList,
  FileText,
  MessageCircle,
  Share2,
  Settings,
} from 'lucide-react'

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Clientes',
    href: '/clientes',
    icon: Users,
  },
  {
    label: 'Proyectos',
    href: '/proyectos',
    icon: FolderKanban,
  },
  {
    label: 'Pagos',
    href: '/pagos',
    icon: CreditCard,
  },
  {
    label: 'Vencimientos',
    href: '/vencimientos',
    icon: CalendarClock,
  },
  {
    label: 'Onboarding',
    href: '/onboarding',
    icon: ClipboardList,
  },
]

const comingSoonItems = [
  {
    label: 'Documentos',
    icon: FileText,
    sprint: 'Sprint 8',
  },
  {
    label: 'WhatsApp',
    icon: MessageCircle,
    sprint: 'Sprint 9',
  },
  {
    label: 'Redes Sociales',
    icon: Share2,
    sprint: 'Sprint 10',
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      {/* Logo / título */}
      <div className="px-6 py-5 border-b border-gray-700">
        <h1 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Argentina Webdesign
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">Panel admin</p>
      </div>

      {/* Navegación principal */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          General
        </p>

        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-gray-700 text-white font-medium'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}

        {/* Próximamente */}
        <div className="pt-4">
          <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Próximamente
          </p>

          {comingSoonItems.map((item) => {
            const Icon = item.icon

            return (
              <div
                key={item.label}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-600 cursor-not-allowed"
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                <Badge
                  variant="outline"
                  className="text-xs border-gray-700 text-gray-600 px-1.5 py-0"
                >
                  {item.sprint}
                </Badge>
              </div>
            )
          })}
        </div>
      </nav>

      {/* Footer del sidebar */}
      <div className="px-3 py-4 border-t border-gray-700">
        <Link
          href="/configuracion"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
            pathname === '/configuracion'
              ? 'bg-gray-700 text-white font-medium'
              : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
          )}
        >
          <Settings className="h-4 w-4 shrink-0" />
          Configuración
        </Link>
      </div>
    </aside>
  )
}
