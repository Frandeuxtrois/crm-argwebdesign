import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getWorkspaceId } from '@/lib/workspace'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { buttonVariants } from '@/components/ui/button'
import { Users, FolderKanban, CreditCard, CalendarClock, ArrowRight, Link2, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CopyFormLink } from '@/components/dashboard/copy-form-link'
import { Clock } from '@/components/dashboard/clock'

function formatARS(monto: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(monto)
}

const estadoLabel: Record<string, string> = {
  onboarding:    'Onboarding',
  en_desarrollo: 'En desarrollo',
  revision:      'Revisión',
  entregado:     'Entregado',
  pausado:       'Pausado',
}

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export default async function DashboardPage() {
  const supabase = await createClient()
  const workspaceId = await getWorkspaceId()

  const now = new Date()
  const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const inicioAno = new Date(now.getFullYear(), 0, 1).toISOString()

  const [
    { data: clientes },
    { data: proyectos },
    { data: pagos },
    { data: vencimientos },
    { data: onboardings },
  ] = await Promise.all([
    supabase.from('clientes').select('id, estado').eq('workspace_id', workspaceId).is('deleted_at', null),
    supabase.from('proyectos').select('id, nombre, estado, progreso, fecha_entrega, clientes(marca)').eq('workspace_id', workspaceId).is('deleted_at', null).order('created_at', { ascending: false }),
    supabase.from('pagos').select('id, monto, estado, fecha_emision, fecha_pago, proyectos(nombre, clientes(marca))').eq('workspace_id', workspaceId).is('deleted_at', null).order('created_at', { ascending: false }),
    supabase.from('vencimientos').select('id, tipo, descripcion, fecha_vencimiento, estado, clientes(marca)').eq('workspace_id', workspaceId).is('deleted_at', null).order('fecha_vencimiento', { ascending: true }),
    supabase.from('onboarding').select('id').eq('workspace_id', workspaceId).eq('procesado', false).is('deleted_at', null),
  ])

  // ── Métricas base ───────────────────────────────────────────
  const clientesActivos    = clientes?.filter(c => c.estado === 'activo').length ?? 0
  const proyectosEnCurso   = proyectos?.filter(p => ['onboarding', 'en_desarrollo', 'revision'].includes(p.estado)).length ?? 0
  const hoy                = Date.now()
  const vencimientosProximos = vencimientos?.filter(v => {
    if (v.estado !== 'activo') return false
    const dias = Math.ceil((new Date(v.fecha_vencimiento).getTime() - hoy) / 86400000)
    return dias <= 30
  }) ?? []
  const onboardingsPendientes = onboardings?.length ?? 0

  // ── Métricas financieras ────────────────────────────────────
  const pagados = pagos?.filter(p => p.estado === 'pagado') ?? []

  const cobradoMes = pagados
    .filter(p => p.fecha_pago && p.fecha_pago >= inicioMes)
    .reduce((s, p) => s + p.monto, 0)

  const cobradoAno = pagados
    .filter(p => p.fecha_pago && p.fecha_pago >= inicioAno)
    .reduce((s, p) => s + p.monto, 0)

  const totalPendiente = pagos?.filter(p => p.estado === 'pendiente').reduce((s, p) => s + p.monto, 0) ?? 0

  // ── Últimos 6 meses (para el gráfico) ──────────────────────
  const ultimos6: { mes: string; monto: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const inicio = d.toISOString().split('T')[0]
    const fin = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString().split('T')[0]
    const monto = pagados
      .filter(p => p.fecha_pago && p.fecha_pago >= inicio && p.fecha_pago < fin)
      .reduce((s, p) => s + p.monto, 0)
    ultimos6.push({ mes: MESES[d.getMonth()], monto })
  }
  const maxMonto = Math.max(...ultimos6.map(m => m.monto), 1)

  // ── Listas para las tablas ──────────────────────────────────
  const proyectosActivos = proyectos?.filter(p => ['onboarding', 'en_desarrollo', 'revision'].includes(p.estado)).slice(0, 5) ?? []
  const ultimosPagos     = pagos?.filter(p => p.estado === 'pendiente').slice(0, 5) ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">Resumen general</p>
        </div>
        <Clock fechaServidor={now.toISOString()} />
      </div>

      {/* Fila 1: métricas operativas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/clientes" className="bg-white rounded-lg border p-5 hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">Clientes activos</p>
            <Users className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{clientesActivos}</p>
        </Link>

        <Link href="/proyectos" className="bg-white rounded-lg border p-5 hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">Proyectos en curso</p>
            <FolderKanban className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{proyectosEnCurso}</p>
        </Link>

        <Link href="/vencimientos" className="bg-white rounded-lg border p-5 hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">Vencimientos próximos</p>
            <CalendarClock className="h-4 w-4 text-gray-400" />
          </div>
          <p className={cn('text-3xl font-bold', vencimientosProximos.length > 0 ? 'text-red-500' : 'text-gray-900')}>
            {vencimientosProximos.length}
          </p>
        </Link>

        <Link href="/pagos" className="bg-white rounded-lg border p-5 hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">Cobros pendientes</p>
            <CreditCard className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{formatARS(totalPendiente)}</p>
        </Link>
      </div>

      {/* Fila 2: métricas financieras */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-5">
          <p className="text-sm text-gray-500 mb-1">Cobrado este mes</p>
          <p className="text-2xl font-bold text-green-600">{formatARS(cobradoMes)}</p>
          <p className="text-xs text-gray-400 mt-1">{MESES[now.getMonth()]} {now.getFullYear()}</p>
        </div>

        <div className="bg-white rounded-lg border p-5">
          <p className="text-sm text-gray-500 mb-1">Cobrado este año</p>
          <p className="text-2xl font-bold text-blue-600">{formatARS(cobradoAno)}</p>
          <p className="text-xs text-gray-400 mt-1">Enero — {MESES[now.getMonth()]} {now.getFullYear()}</p>
        </div>

        <div className="bg-white rounded-lg border p-5">
          <p className="text-sm text-gray-500 mb-1">Total facturado histórico</p>
          <p className="text-2xl font-bold text-gray-900">{formatARS(pagados.reduce((s, p) => s + p.monto, 0))}</p>
          <p className="text-xs text-gray-400 mt-1">{pagados.length} pago{pagados.length !== 1 ? 's' : ''} cobrado{pagados.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Gráfico últimos 6 meses */}
      <div className="bg-white rounded-lg border p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-gray-400" />
          <p className="text-sm font-semibold text-gray-700">Ingresos — últimos 6 meses</p>
        </div>
        <div className="flex items-end gap-3 h-24">
          {ultimos6.map((m, i) => {
            const altura = maxMonto > 0 ? Math.round((m.monto / maxMonto) * 100) : 0
            const esMesActual = i === 5
            return (
              <div key={m.mes} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-xs text-gray-500">{m.monto > 0 ? formatARS(m.monto).replace('$\u00a0', '$').replace(/\.000$/, 'k') : ''}</span>
                <div className="w-full flex items-end" style={{ height: '56px' }}>
                  <div
                    className={cn('w-full rounded-t transition-all', esMesActual ? 'bg-blue-500' : 'bg-gray-200')}
                    style={{ height: `${Math.max(altura, m.monto > 0 ? 4 : 0)}%` }}
                  />
                </div>
                <span className={cn('text-xs', esMesActual ? 'font-semibold text-gray-700' : 'text-gray-400')}>{m.mes}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Link del formulario de onboarding */}
      <div className="bg-white rounded-lg border px-5 py-4 space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Link2 className="h-4 w-4 text-gray-400" />
          Link para enviar a nuevos clientes
        </div>
        <CopyFormLink workspaceId={workspaceId} />
      </div>

      {/* Alerta onboardings pendientes */}
      {onboardingsPendientes > 0 && (
        <Link
          href="/onboarding"
          className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-5 py-3 hover:bg-amber-100 transition-colors"
        >
          <p className="text-sm font-medium text-amber-800">
            {onboardingsPendientes} formulario{onboardingsPendientes !== 1 ? 's' : ''} de onboarding sin procesar
          </p>
          <ArrowRight className="h-4 w-4 text-amber-600" />
        </Link>
      )}

      {/* Tablas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Proyectos activos */}
        <div className="bg-white rounded-lg border">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <p className="text-sm font-semibold text-gray-700">Proyectos activos</p>
            <Link href="/proyectos" className="text-xs text-gray-400 hover:text-gray-600">Ver todos</Link>
          </div>
          {proyectosActivos.length === 0 ? (
            <p className="px-5 py-8 text-sm text-gray-400 text-center">Sin proyectos activos</p>
          ) : (
            <div className="divide-y">
              {proyectosActivos.map((p) => {
                const cliente = (Array.isArray(p.clientes) ? p.clientes[0] : p.clientes) as { marca: string } | null
                return (
                  <Link key={p.id} href={`/proyectos/${p.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.nombre}</p>
                      <p className="text-xs text-gray-400">{cliente?.marca ?? '—'}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1.5 w-24">
                        <Progress value={p.progreso} className="h-1.5 flex-1" />
                        <span className="text-xs text-gray-400 w-7 text-right">{p.progreso}%</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {estadoLabel[p.estado] ?? p.estado}
                      </Badge>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Panel derecho */}
        <div className="space-y-6">
          {/* Vencimientos próximos */}
          <div className="bg-white rounded-lg border">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <p className="text-sm font-semibold text-gray-700">Vencimientos próximos</p>
              <Link href="/vencimientos" className="text-xs text-gray-400 hover:text-gray-600">Ver todos</Link>
            </div>
            {vencimientosProximos.length === 0 ? (
              <p className="px-5 py-8 text-sm text-gray-400 text-center">Sin vencimientos en 30 días</p>
            ) : (
              <div className="divide-y">
                {vencimientosProximos.slice(0, 4).map((v) => {
                  const cliente = (Array.isArray(v.clientes) ? v.clientes[0] : v.clientes) as { marca: string } | null
                  const dias = Math.ceil((new Date(v.fecha_vencimiento).getTime() - hoy) / 86400000)
                  return (
                    <Link key={v.id} href={`/vencimientos/${v.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{cliente?.marca ?? '—'}</p>
                        <p className="text-xs text-gray-400 capitalize">{v.tipo}{v.descripcion ? ` — ${v.descripcion}` : ''}</p>
                      </div>
                      <span className={cn('text-xs font-semibold', dias < 0 ? 'text-red-500' : dias <= 7 ? 'text-red-500' : 'text-amber-500')}>
                        {dias < 0 ? 'Vencido' : dias === 0 ? 'Hoy' : `${dias}d`}
                      </span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Cobros pendientes */}
          <div className="bg-white rounded-lg border">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <p className="text-sm font-semibold text-gray-700">Cobros pendientes</p>
              <Link href="/pagos" className="text-xs text-gray-400 hover:text-gray-600">Ver todos</Link>
            </div>
            {ultimosPagos.length === 0 ? (
              <p className="px-5 py-8 text-sm text-gray-400 text-center">Sin cobros pendientes</p>
            ) : (
              <div className="divide-y">
                {ultimosPagos.map((p) => {
                  const _proy = (Array.isArray(p.proyectos) ? p.proyectos[0] : p.proyectos) as { nombre: string; clientes: unknown } | null
                  const proyecto = _proy ? { nombre: _proy.nombre, clientes: (Array.isArray(_proy.clientes) ? _proy.clientes[0] : _proy.clientes) as { marca: string } | null } : null
                  return (
                    <Link key={p.id} href={`/pagos/${p.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{proyecto?.clientes?.marca ?? '—'}</p>
                        <p className="text-xs text-gray-400">{proyecto?.nombre ?? '—'}</p>
                      </div>
                      <span className="text-sm font-semibold text-amber-600">{formatARS(p.monto)}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
