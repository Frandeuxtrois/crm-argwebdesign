import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getWorkspaceId } from '@/lib/workspace'
import { buttonVariants } from '@/components/ui/button'
import { ActionButton } from '@/components/ui/action-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { crearProyecto } from '../actions'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

const planes = [
  { value: 'express',          label: 'Web Express' },
  { value: 'landing',          label: 'Landing Page' },
  { value: 'economica',        label: 'Económica' },
  { value: 'autogestionable',  label: 'Auto-Gestionable' },
  { value: 'ecommerce_basico', label: 'E-commerce Básico' },
  { value: 'ecommerce_full',   label: 'E-commerce Full' },
  { value: 'personalizada',    label: 'Personalizada' },
]

export default async function NuevoProyectoPage() {
  const supabase = await createClient()
  const workspaceId = await getWorkspaceId()

  const { data: clientes } = await supabase
    .from('clientes')
    .select('id, nombre, marca')
    .eq('workspace_id', workspaceId)
    .eq('estado', 'activo')
    .is('deleted_at', null)
    .order('marca')

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/proyectos" className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Nuevo proyecto</h2>
          <p className="text-sm text-gray-500">Completá los datos del proyecto</p>
        </div>
      </div>

      <form action={crearProyecto} className="bg-white rounded-lg border p-6 space-y-5">

        <div className="space-y-1.5">
          <Label htmlFor="cliente_id">Cliente *</Label>
          <Select name="cliente_id" required>
            <SelectTrigger id="cliente_id">
              <SelectValue placeholder="Seleccioná un cliente..." />
            </SelectTrigger>
            <SelectContent>
              {clientes?.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.marca} — {c.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!clientes?.length && (
            <p className="text-xs text-red-500">
              No hay clientes activos. <Link href="/clientes/nuevo" className="underline">Creá uno primero.</Link>
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="nombre">Nombre del proyecto *</Label>
          <Input id="nombre" name="nombre" required placeholder="Web institucional" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="plan">Plan *</Label>
            <Select name="plan" required>
              <SelectTrigger id="plan">
                <SelectValue placeholder="Elegí el plan..." />
              </SelectTrigger>
              <SelectContent>
                {planes.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="precio_total">Precio total (ARS) *</Label>
            <Input id="precio_total" name="precio_total" type="number" min="0" step="100" required placeholder="150000" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="fecha_inicio">Fecha de inicio</Label>
            <Input id="fecha_inicio" name="fecha_inicio" type="date" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fecha_entrega">Fecha de entrega</Label>
            <Input id="fecha_entrega" name="fecha_entrega" type="date" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notas">Notas internas</Label>
          <Textarea id="notas" name="notas" rows={3} placeholder="Notas sobre el proyecto..." />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link href="/proyectos" className={cn(buttonVariants({ variant: 'outline' }))}>
            Cancelar
          </Link>
          <ActionButton>Crear proyecto</ActionButton>
        </div>
      </form>
    </div>
  )
}
