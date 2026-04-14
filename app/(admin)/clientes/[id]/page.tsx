import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getWorkspaceId } from '@/lib/workspace'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { editarCliente, archivarCliente } from '../actions'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const workspaceId = await getWorkspaceId()

  const { data: cliente } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', id)
    .eq('workspace_id', workspaceId)
    .is('deleted_at', null)
    .single()

  if (!cliente) notFound()

  const editarConId = editarCliente.bind(null, id)
  const archivarConId = archivarCliente.bind(null, id)

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/clientes" className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">{cliente.nombre}</h2>
          <p className="text-sm text-gray-500">{cliente.marca}</p>
        </div>
      </div>

      <form action={editarConId} className="bg-white rounded-lg border p-6 space-y-5">

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="nombre">Nombre y apellido *</Label>
            <Input id="nombre" name="nombre" required defaultValue={cliente.nombre} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="marca">Marca / Negocio *</Label>
            <Input id="marca" name="marca" required defaultValue={cliente.marca} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" name="email" type="email" required defaultValue={cliente.email} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="whatsapp">WhatsApp *</Label>
            <Input id="whatsapp" name="whatsapp" required defaultValue={cliente.whatsapp} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="descripcion_negocio">Descripción del negocio</Label>
          <Textarea
            id="descripcion_negocio"
            name="descripcion_negocio"
            rows={3}
            defaultValue={cliente.descripcion_negocio ?? ''}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="datos_fiscales">Datos fiscales</Label>
          <Input
            id="datos_fiscales"
            name="datos_fiscales"
            defaultValue={cliente.datos_fiscales ?? ''}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notas">Notas internas</Label>
          <Textarea
            id="notas"
            name="notas"
            rows={3}
            defaultValue={cliente.notas ?? ''}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="estado">Estado</Label>
          <Select name="estado" defaultValue={cliente.estado}>
            <SelectTrigger id="estado">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="activo">Activo</SelectItem>
              <SelectItem value="inactivo">Inactivo</SelectItem>
              <SelectItem value="archivado">Archivado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-between items-center pt-2">
          {cliente.estado !== 'archivado' && (
            <form action={archivarConId}>
              <Button type="submit" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                Archivar cliente
              </Button>
            </form>
          )}
          <div className="flex gap-3 ml-auto">
            <Link href="/clientes" className={cn(buttonVariants({ variant: 'outline' }))}>
              Cancelar
            </Link>
            <Button type="submit">Guardar cambios</Button>
          </div>
        </div>
      </form>
    </div>
  )
}
