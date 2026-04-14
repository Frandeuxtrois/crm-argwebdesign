import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getWorkspaceId } from '@/lib/workspace'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { editarPago } from '../actions'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

const estadoConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline'; className?: string }> = {
  pendiente: { label: 'Pendiente', variant: 'secondary' },
  pagado:    { label: 'Pagado',    variant: 'outline' },
  vencido:   { label: 'Vencido',   variant: 'default', className: 'bg-red-500 text-white border-transparent' },
}

function formatARS(monto: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(monto)
}

export default async function PagoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const workspaceId = await getWorkspaceId()

  const { data: pago } = await supabase
    .from('pagos')
    .select('*, proyectos(nombre, clientes(nombre, marca))')
    .eq('id', id)
    .eq('workspace_id', workspaceId)
    .is('deleted_at', null)
    .single()

  if (!pago) notFound()

  const proyecto = pago.proyectos as { nombre: string; clientes: { nombre: string; marca: string } | null } | null
  const editarConId = editarPago.bind(null, id)
  const config = estadoConfig[pago.estado] ?? estadoConfig.pendiente

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/pagos" className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold text-gray-900">{formatARS(pago.monto)}</h2>
            <Badge variant={config.variant} className={config.className}>{config.label}</Badge>
          </div>
          <p className="text-sm text-gray-500">
            {proyecto?.clientes?.marca} — {proyecto?.nombre}
          </p>
        </div>
      </div>

      <form action={editarConId} className="bg-white rounded-lg border p-6 space-y-5">

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="tipo">Tipo *</Label>
            <Select name="tipo" defaultValue={pago.tipo} required>
              <SelectTrigger id="tipo"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="seña">Seña</SelectItem>
                <SelectItem value="saldo">Saldo</SelectItem>
                <SelectItem value="total">Total</SelectItem>
                <SelectItem value="extra">Extra</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="monto">Monto (ARS) *</Label>
            <Input id="monto" name="monto" type="number" min="0" step="100" required defaultValue={pago.monto} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="estado">Estado</Label>
          <Select name="estado" defaultValue={pago.estado}>
            <SelectTrigger id="estado"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="pagado">Pagado</SelectItem>
              <SelectItem value="vencido">Vencido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="fecha_emision">Fecha de emisión</Label>
            <Input id="fecha_emision" name="fecha_emision" type="date" defaultValue={pago.fecha_emision ?? ''} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fecha_pago">Fecha de cobro</Label>
            <Input id="fecha_pago" name="fecha_pago" type="date" defaultValue={pago.fecha_pago ?? ''} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="metodo_pago">Método de pago</Label>
          <Input id="metodo_pago" name="metodo_pago" placeholder="Transferencia, efectivo, MP..." defaultValue={pago.metodo_pago ?? ''} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notas">Notas</Label>
          <Textarea id="notas" name="notas" rows={2} defaultValue={pago.notas ?? ''} />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link href="/pagos" className={cn(buttonVariants({ variant: 'outline' }))}>Cancelar</Link>
          <Button type="submit">Guardar cambios</Button>
        </div>
      </form>
    </div>
  )
}
