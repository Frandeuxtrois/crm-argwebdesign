import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getWorkspaceId } from '@/lib/workspace'
import { buttonVariants } from '@/components/ui/button'
import { ActionButton } from '@/components/ui/action-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { crearPago } from '../actions'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

export default async function NuevoPagoPage() {
  const supabase = await createClient()
  const workspaceId = await getWorkspaceId()

  const { data: proyectos } = await supabase
    .from('proyectos')
    .select('id, nombre, clientes(marca)')
    .eq('workspace_id', workspaceId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/pagos" className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Nuevo pago</h2>
          <p className="text-sm text-gray-500">Registrá un cobro o cuota</p>
        </div>
      </div>

      <form action={crearPago} className="bg-white rounded-lg border p-6 space-y-5">

        <div className="space-y-1.5">
          <Label htmlFor="proyecto_id">Proyecto *</Label>
          <Select name="proyecto_id" required>
            <SelectTrigger id="proyecto_id">
              <SelectValue placeholder="Seleccioná un proyecto..." />
            </SelectTrigger>
            <SelectContent>
              {proyectos?.map((p) => {
                const cliente = (Array.isArray(p.clientes) ? p.clientes[0] : p.clientes) as { marca: string } | null
                return (
                  <SelectItem key={p.id} value={p.id}>
                    {cliente?.marca ?? '—'} — {p.nombre}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="tipo">Tipo *</Label>
            <Select name="tipo" required>
              <SelectTrigger id="tipo"><SelectValue placeholder="Tipo de pago..." /></SelectTrigger>
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
            <Input id="monto" name="monto" type="number" min="0" step="100" required placeholder="50000" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="fecha_emision">Fecha de emisión</Label>
          <Input id="fecha_emision" name="fecha_emision" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notas">Notas</Label>
          <Textarea id="notas" name="notas" rows={2} placeholder="Ej: 50% de seña según presupuesto" />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link href="/pagos" className={cn(buttonVariants({ variant: 'outline' }))}>Cancelar</Link>
          <ActionButton>Registrar pago</ActionButton>
        </div>
      </form>
    </div>
  )
}
