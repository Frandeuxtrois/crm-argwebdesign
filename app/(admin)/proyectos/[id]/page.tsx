import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getWorkspaceId } from '@/lib/workspace'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChecklistItem } from '@/components/proyectos/checklist-item'
import { editarProyecto, agregarChecklistItem } from '../actions'
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

const estados = [
  { value: 'onboarding',    label: 'Onboarding' },
  { value: 'en_desarrollo', label: 'En desarrollo' },
  { value: 'revision',      label: 'Revisión' },
  { value: 'entregado',     label: 'Entregado' },
  { value: 'pausado',       label: 'Pausado' },
]

const categorias = [
  { value: 'diseño',      label: 'Diseño' },
  { value: 'desarrollo',  label: 'Desarrollo' },
  { value: 'contenido',   label: 'Contenido' },
  { value: 'deploy',      label: 'Deploy' },
]

const categoriaColor: Record<string, string> = {
  diseño:     'text-purple-600 bg-purple-50',
  desarrollo: 'text-blue-600 bg-blue-50',
  contenido:  'text-amber-600 bg-amber-50',
  deploy:     'text-green-600 bg-green-50',
}

export default async function ProyectoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const workspaceId = await getWorkspaceId()

  const { data: proyecto } = await supabase
    .from('proyectos')
    .select('*, clientes(nombre, marca, email)')
    .eq('id', id)
    .eq('workspace_id', workspaceId)
    .is('deleted_at', null)
    .single()

  if (!proyecto) notFound()

  const { data: items } = await supabase
    .from('checklist_items')
    .select('*')
    .eq('proyecto_id', id)
    .eq('workspace_id', workspaceId)
    .is('deleted_at', null)
    .order('orden')

  const cliente = proyecto.clientes as { nombre: string; marca: string; email: string } | null
  const editarConId = editarProyecto.bind(null, id)
  const agregarItemConId = agregarChecklistItem.bind(null, id)

  // Agrupar items por categoría
  const itemsPorCategoria = categorias.map((cat) => ({
    ...cat,
    items: items?.filter((i) => i.categoria === cat.value) ?? [],
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/proyectos" className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold text-gray-900">{proyecto.nombre}</h2>
          </div>
          <p className="text-sm text-gray-500">{cliente?.marca} — {cliente?.nombre}</p>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="bg-white rounded-lg border p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Progreso general</span>
          <span className="text-sm font-semibold text-gray-900">{proyecto.progreso}%</span>
        </div>
        <Progress value={proyecto.progreso} className="h-2" />
        <div className="flex items-center gap-3">
          <Badge variant={
            proyecto.estado === 'entregado' ? 'outline' :
            proyecto.estado === 'en_desarrollo' ? 'default' : 'secondary'
          }>
            {estados.find(e => e.value === proyecto.estado)?.label ?? proyecto.estado}
          </Badge>
          {proyecto.fecha_entrega && (
            <span className="text-xs text-gray-400">
              Entrega: {new Date(proyecto.fecha_entrega).toLocaleDateString('es-AR')}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Info del proyecto (editable) */}
        <form action={editarConId} className="bg-white rounded-lg border p-5 space-y-4">
          <p className="text-sm font-semibold text-gray-700">Datos del proyecto</p>

          <div className="space-y-1.5">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" name="nombre" defaultValue={proyecto.nombre} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="plan">Plan</Label>
              <Select name="plan" defaultValue={proyecto.plan}>
                <SelectTrigger id="plan"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {planes.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="estado">Estado</Label>
              <Select name="estado" defaultValue={proyecto.estado}>
                <SelectTrigger id="estado"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {estados.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="precio_total">Precio total (ARS)</Label>
            <Input id="precio_total" name="precio_total" type="number" defaultValue={proyecto.precio_total} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="fecha_inicio">Inicio</Label>
              <Input id="fecha_inicio" name="fecha_inicio" type="date" defaultValue={proyecto.fecha_inicio ?? ''} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fecha_entrega">Entrega</Label>
              <Input id="fecha_entrega" name="fecha_entrega" type="date" defaultValue={proyecto.fecha_entrega ?? ''} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="url_proyecto">URL del proyecto</Label>
            <Input id="url_proyecto" name="url_proyecto" type="url" placeholder="https://..." defaultValue={proyecto.url_proyecto ?? ''} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notas">Notas</Label>
            <Textarea id="notas" name="notas" rows={3} defaultValue={proyecto.notas ?? ''} />
          </div>

          <Button type="submit" className="w-full">Guardar cambios</Button>
        </form>

        {/* Checklist */}
        <div className="space-y-4">
          {itemsPorCategoria.map((cat) => (
            <div key={cat.value} className="bg-white rounded-lg border overflow-hidden">
              <div className={cn('px-4 py-2.5 text-xs font-semibold uppercase tracking-wider', categoriaColor[cat.value])}>
                {cat.label} ({cat.items.filter(i => i.completado).length}/{cat.items.length})
              </div>

              <div className="divide-y">
                {cat.items.length === 0 ? (
                  <p className="px-4 py-3 text-xs text-gray-400">Sin tareas</p>
                ) : (
                  cat.items.map((item) => (
                    <ChecklistItem
                      key={item.id}
                      item={item}
                      proyectoId={id}
                    />
                  ))
                )}
              </div>

              {/* Agregar item */}
              <form action={agregarItemConId} className="border-t p-3 flex gap-2">
                <input type="hidden" name="categoria" value={cat.value} />
                <Input
                  name="titulo"
                  placeholder={`Agregar tarea de ${cat.label.toLowerCase()}...`}
                  className="h-7 text-xs"
                  required
                />
                <Button type="submit" size="sm" variant="outline" className="h-7 text-xs shrink-0">
                  +
                </Button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
