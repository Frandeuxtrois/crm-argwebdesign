import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getWorkspaceId } from '@/lib/workspace'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PlusCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const estadoConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline'; className?: string }> = {
  pendiente: { label: 'Pendiente', variant: 'secondary' },
  pagado:    { label: 'Pagado',    variant: 'outline' },
  vencido:   { label: 'Vencido',   variant: 'default', className: 'bg-red-500 text-white border-transparent' },
}

const tipoLabel: Record<string, string> = {
  seña:  'Seña',
  saldo: 'Saldo',
  total: 'Total',
  extra: 'Extra',
}

function formatARS(monto: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(monto)
}

export default async function PagosPage() {
  const supabase = await createClient()
  const workspaceId = await getWorkspaceId()

  const { data: pagos } = await supabase
    .from('pagos')
    .select('*, proyectos(nombre, clientes(marca))')
    .eq('workspace_id', workspaceId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const totalCobrado  = pagos?.filter(p => p.estado === 'pagado').reduce((s, p) => s + p.monto, 0) ?? 0
  const totalPendiente = pagos?.filter(p => p.estado === 'pendiente').reduce((s, p) => s + p.monto, 0) ?? 0
  const totalVencido  = pagos?.filter(p => p.estado === 'vencido').reduce((s, p) => s + p.monto, 0) ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Pagos</h2>
          <p className="text-sm text-gray-500 mt-1">{pagos?.length ?? 0} registros</p>
        </div>
        <Link href="/pagos/nuevo" className={cn(buttonVariants())}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Nuevo pago
        </Link>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Cobrado', monto: totalCobrado,   color: 'text-green-600' },
          { label: 'Pendiente', monto: totalPendiente, color: 'text-amber-600' },
          { label: 'Vencido',  monto: totalVencido,   color: 'text-red-600' },
        ].map(({ label, monto, color }) => (
          <div key={label} className="bg-white rounded-lg border p-4">
            <p className="text-xs text-gray-500">{label}</p>
            <p className={cn('text-xl font-semibold mt-1', color)}>{formatARS(monto)}</p>
          </div>
        ))}
      </div>

      {!pagos || pagos.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center text-gray-400">
          <p className="text-sm">Todavía no hay pagos registrados.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente / Proyecto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Emisión</TableHead>
                <TableHead>Cobrado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagos.map((pago) => {
                const proyecto = pago.proyectos as { nombre: string; clientes: { marca: string } | null } | null
                const config = estadoConfig[pago.estado] ?? estadoConfig.pendiente
                return (
                  <TableRow key={pago.id}>
                    <TableCell>
                      <p className="font-medium text-sm">{proyecto?.clientes?.marca ?? '—'}</p>
                      <p className="text-xs text-gray-400">{proyecto?.nombre ?? '—'}</p>
                    </TableCell>
                    <TableCell className="text-sm">{tipoLabel[pago.tipo] ?? pago.tipo}</TableCell>
                    <TableCell className="font-medium">{formatARS(pago.monto)}</TableCell>
                    <TableCell>
                      <Badge variant={config.variant} className={config.className}>
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {pago.fecha_emision ? new Date(pago.fecha_emision).toLocaleDateString('es-AR') : '—'}
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {pago.fecha_pago ? new Date(pago.fecha_pago).toLocaleDateString('es-AR') : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/pagos/${pago.id}`} className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
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
