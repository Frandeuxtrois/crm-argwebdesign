import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getWorkspaceId } from '@/lib/workspace'
import { buttonVariants } from '@/components/ui/button'
import { ActionButton } from '@/components/ui/action-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { crearVencimiento } from '../actions'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

export default async function NuevoVencimientoPage() {
  const supabase = await createClient()
  const workspaceId = await getWorkspaceId()

  const { data: clientes } = await supabase
    .from('clientes')
    .select('id, nombre, marca')
    .eq('workspace_id', workspaceId)
    .is('deleted_at', null)
    .order('marca')

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/vencimientos" className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Nuevo vencimiento</h2>
          <p className="text-sm text-gray-500">Hosting, dominio, SSL o mantenimiento</p>
        </div>
      </div>

      <form action={crearVencimiento} className="bg-white rounded-lg border p-6 space-y-5">

        <div className="space-y-1.5">
          <Label htmlFor="cliente_id">Cliente *</Label>
          <Select name="cliente_id" required>
            <SelectTrigger id="cliente_id">
              <SelectValue placeholder="Seleccioná un cliente..." />
            </SelectTrigger>
            <SelectContent>
              {clientes?.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.marca} — {c.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="tipo">Tipo *</Label>
            <Select name="tipo" required>
              <SelectTrigger id="tipo"><SelectValue placeholder="Tipo..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="hosting">Hosting</SelectItem>
                <SelectItem value="dominio">Dominio</SelectItem>
                <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                <SelectItem value="ssl">SSL</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fecha_vencimiento">Fecha de vencimiento *</Label>
            <Input id="fecha_vencimiento" name="fecha_vencimiento" type="date" required />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="descripcion">Descripción</Label>
          <Input id="descripcion" name="descripcion" placeholder="Ej: Hosting SiteGround — plan GrowBig" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="monto">Monto (ARS, opcional)</Label>
          <Input id="monto" name="monto" type="number" min="0" step="100" placeholder="12000" />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link href="/vencimientos" className={cn(buttonVariants({ variant: 'outline' }))}>Cancelar</Link>
          <ActionButton>Guardar</ActionButton>
        </div>
      </form>
    </div>
  )
}
