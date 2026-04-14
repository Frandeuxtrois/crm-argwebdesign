import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getWorkspaceId } from '@/lib/workspace'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PlusCircle, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

const tipoLabel: Record<string, string> = {
  hosting:      'Hosting',
  dominio:      'Dominio',
  mantenimiento: 'Mantenimiento',
  ssl:          'SSL',
}

function getAlertClass(fechaStr: string, estado: string) {
  if (estado !== 'activo') return 'text-gray-400'
  const hoy = new Date()
  const fecha = new Date(fechaStr)
  const dias = Math.ceil((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
  if (dias < 0)  return 'text-red-600 font-semibold'
  if (dias <= 30) return 'text-amber-600 font-semibold'
  return 'text-gray-700'
}

function diasLabel(fechaStr: string, estado: string) {
  if (estado !== 'activo') return null
  const hoy = new Date()
  const fecha = new Date(fechaStr)
  const dias = Math.ceil((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
  if (dias < 0)   return `Vencido hace ${Math.abs(dias)}d`
  if (dias === 0) return 'Vence hoy'
  if (dias <= 30) return `Vence en ${dias}d`
  return null
}

export default async function VencimientosPage() {
  const supabase = await createClient()
  const workspaceId = await getWorkspaceId()

  const { data: vencimientos } = await supabase
    .from('vencimientos')
    .select('*, clientes(nombre, marca)')
    .eq('workspace_id', workspaceId)
    .is('deleted_at', null)
    .order('fecha_vencimiento', { ascending: true })

  const proximos = vencimientos?.filter(v => {
    if (v.estado !== 'activo') return false
    const dias = Math.ceil((new Date(v.fecha_vencimiento).getTime() - Date.now()) / 86400000)
    return dias <= 30
  }).length ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Vencimientos</h2>
          <p className="text-sm text-gray-500 mt-1">
            {proximos > 0
              ? <span className="flex items-center gap-1 text-amber-600"><AlertTriangle className="h-3.5 w-3.5" />{proximos} vencimiento{proximos !== 1 ? 's' : ''} en los próximos 30 días</span>
              : `${vencimientos?.length ?? 0} registros`}
          </p>
        </div>
        <Link href="/vencimientos/nuevo" className={cn(buttonVariants())}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Nuevo vencimiento
        </Link>
      </div>

      {!vencimientos || vencimientos.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center text-gray-400">
          <p className="text-sm">No hay vencimientos registrados.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vencimientos.map((v) => {
                const cliente = (Array.isArray(v.clientes) ? v.clientes[0] : v.clientes) as { nombre: string; marca: string } | null
                const alerta = diasLabel(v.fecha_vencimiento, v.estado)
                return (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{cliente?.marca ?? '—'}</TableCell>
                    <TableCell className="text-sm">{tipoLabel[v.tipo] ?? v.tipo}</TableCell>
                    <TableCell className="text-gray-500 text-sm">{v.descripcion ?? '—'}</TableCell>
                    <TableCell>
                      <p className={cn('text-sm', getAlertClass(v.fecha_vencimiento, v.estado))}>
                        {new Date(v.fecha_vencimiento).toLocaleDateString('es-AR')}
                      </p>
                      {alerta && <p className="text-xs text-amber-600">{alerta}</p>}
                    </TableCell>
                    <TableCell className="text-sm">
                      {v.monto ? new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(v.monto) : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={v.estado === 'activo' ? 'default' : 'outline'}>
                        {v.estado === 'activo' ? 'Activo' : v.estado === 'renovado' ? 'Renovado' : 'Cancelado'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/vencimientos/${v.id}`} className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
                        Ver
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
