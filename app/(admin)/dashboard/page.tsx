import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">
          Bienvenido, {user?.email}
        </p>
      </div>

      {/* Placeholder — Sprint 7 agregará métricas reales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {['Clientes activos', 'Proyectos en curso', 'Cobros pendientes', 'Vencimientos próximos'].map((label) => (
          <div
            key={label}
            className="bg-white rounded-lg border p-5 space-y-2"
          >
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-3xl font-semibold text-gray-300">—</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border p-6 text-center text-gray-400 text-sm">
        Las métricas reales se agregan en el Sprint 7.
      </div>
    </div>
  )
}
