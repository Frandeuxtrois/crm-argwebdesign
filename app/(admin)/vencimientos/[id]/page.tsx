import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getWorkspaceId } from '@/lib/workspace'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { editarVencimiento } from '../actions'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

export default async function VencimientoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const workspaceId = await getWorkspaceId()

  const { data: v } = await supabase
    .from('vencimientos')
    .select('*, clientes(nombre, marca)')
    .eq('id', id)
    .eq('workspace_id', workspaceId)
    .is('deleted_at', null)
    .single()

  if (!v) notFound()

  const cliente = (Array.isArray(v.clientes) ? v.clientes[0] : v.clientes) as { nombre: string; marca: string } | null
  const editarConId = editarVencimiento.bind(null, id)

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/vencimientos" className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold text-gray-900">
              {v.tipo.charAt(0).toUpperCase() + v.tipo.slice(1)} — {cliente?.marca}
            </h2>
            <Badge variant={v.estado === 'activo' ? 'default' : 'outline'}>
              {v.estado === 'activo' ? 'Activo' : v.estado === 'renovado' ? 'Renovado' : 'Cancelado'}
            </Badge>
          </div>
          <p className="text-sm text-gray-500">{cliente?.nombre}</p>
        </div>
      </div>

      <form action={editarConId} className="bg-white rounded-lg border p-6 space-y-5">

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="tipo">Tipo *</Label>
            <Select name="tipo" defaultValue={v.tipo}>
              <SelectTrigger id="tipo"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="hosting">Hosting</SelectItem>
                <SelectItem value="dominio">Dominio</SelectItem>
                <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                <SelectItem value="ssl">SSL</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="estado">Estado</Label>
            <Select name="estado" defaultValue={v.estado}>
              <SelectTrigger id="estado"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="renovado">Renovado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="descripcion">Descripción</Label>
          <Input id="descripcion" name="descripcion" defaultValue={v.descripcion ?? ''} placeholder="Ej: Hosting SiteGround — plan GrowBig" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="fecha_vencimiento">Fecha de vencimiento *</Label>
            <Input id="fecha_vencimiento" name="fecha_vencimiento" type="date" required defaultValue={v.fecha_vencimiento} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="monto">Monto (ARS)</Label>
            <Input id="monto" name="monto" type="number" min="0" step="100" defaultValue={v.monto ?? ''} />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link href="/vencimientos" className={cn(buttonVariants({ variant: 'outline' }))}>Cancelar</Link>
          <Button type="submit">Guardar cambios</Button>
        </div>
      </form>
    </div>
  )
}
