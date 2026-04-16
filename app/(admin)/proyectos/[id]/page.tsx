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
import { DocumentosPanel } from '@/components/proyectos/documentos-panel'
import { editarProyecto, agregarChecklistItem, eliminarProyecto } from '../actions'
import { ActionButton } from '@/components/ui/action-button'
import { ArrowLeft, CreditCard, CalendarClock, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

function formatARS(monto: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(monto)
}

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

  const [
    { data: proyecto },
    { data: items },
    { data: pagos },
    { data: vencimientos },
    { data: documentos },
  ] = await Promise.all([
    supabase.from('proyectos').select('*, clientes(id, nombre, marca, email)').eq('id', id).eq('workspace_id', workspaceId).is('deleted_at', null).single(),
    supabase.from('checklist_items').select('*').eq('proyecto_id', id).eq('workspace_id', workspaceId).is('deleted_at', null).order('orden'),
    supabase.from('pagos').select('id, monto, estado, tipo').eq('proyecto_id', id).eq('workspace_id', workspaceId).is('deleted_at', null).order('created_at', { ascending: false }),
    supabase.from('vencimientos').select('id, tipo, descripcion, fecha_vencimiento, estado, monto').eq('proyecto_id', id).eq('workspace_id', workspaceId).is('deleted_at', null).order('fecha_vencimiento', { ascending: true }),
    supabase.from('documentos').select('*').eq('proyecto_id', id).eq('workspace_id', workspaceId).is('deleted_at', null).order('created_at', { ascending: false }),
  ])

  if (!proyecto) notFound()

  const hoy = Date.now()
  const totalCobrado = pagos?.filter(p => p.estado === 'pagado').reduce((s, p) => s + p.monto, 0) ?? 0
  const totalPendiente = pagos?.filter(p => p.estado === 'pendiente').reduce((s, p) => s + p.monto, 0) ?? 0

  const cliente = proyecto.clientes as { id: string; nombre: string; marca: string; email: string } | null
  const editarConId = editarProyecto.bind(null, id)
  const agregarItemConId = agregarChecklistItem.bind(null, id)
  const eliminarConId = eliminarProyecto.bind(null, id)

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
          {cliente ? (
            <Link href={`/clientes/${cliente.id}`} className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
              {cliente.marca} — {cliente.nombre}
            </Link>
          ) : (
            <p className="text-sm text-gray-500">Sin cliente</p>
          )}
        </div>
        <form action={eliminarConId}>
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="text-red-400 hover:text-red-600 hover:bg-red-50"
            title="Eliminar proyecto"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </form>
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

          <ActionButton className="w-full">Guardar cambios</ActionButton>
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

      {/* Pagos y vencimientos del proyecto */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Pagos */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <CreditCard className="h-4 w-4 text-gray-400" />
              Pagos
              {pagos && pagos.length > 0 && (
                <span className="text-xs font-normal text-gray-400 ml-1">
                  {formatARS(totalCobrado)} cobrado · {formatARS(totalPendiente)} pendiente
                </span>
              )}
            </div>
            <Link href="/pagos/nuevo" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'text-xs h-7')}>
              <Plus className="h-3 w-3 mr-1" />Nuevo
            </Link>
          </div>
          {!pagos?.length ? (
            <p className="px-4 py-6 text-sm text-gray-400 text-center">Sin pagos registrados</p>
          ) : (
            <div className="divide-y">
              {pagos.map((p) => (
                <Link key={p.id} href={`/pagos/${p.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                  <p className="text-sm font-medium text-gray-900 capitalize">{p.tipo}</p>
                  <div className="text-right">
                    <p className={cn('text-sm font-semibold', p.estado === 'pagado' ? 'text-green-600' : p.estado === 'vencido' ? 'text-red-500' : 'text-amber-600')}>
                      {formatARS(p.monto)}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">{p.estado}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Vencimientos */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <CalendarClock className="h-4 w-4 text-gray-400" />
              Vencimientos
            </div>
            <Link href="/vencimientos/nuevo" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'text-xs h-7')}>
              <Plus className="h-3 w-3 mr-1" />Nuevo
            </Link>
          </div>
          {!vencimientos?.length ? (
            <p className="px-4 py-6 text-sm text-gray-400 text-center">Sin vencimientos</p>
          ) : (
            <div className="divide-y">
              {vencimientos.map((v) => {
                const dias = Math.ceil((new Date(v.fecha_vencimiento).getTime() - hoy) / 86400000)
                return (
                  <Link key={v.id} href={`/vencimientos/${v.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-gray-900 capitalize">{v.tipo}</p>
                      <p className="text-xs text-gray-400">{v.descripcion ?? new Date(v.fecha_vencimiento).toLocaleDateString('es-AR')}</p>
                    </div>
                    <div className="text-right">
                      {v.monto && <p className="text-sm font-medium text-gray-700">{formatARS(v.monto)}</p>}
                      <p className={cn('text-xs font-semibold', v.estado !== 'activo' ? 'text-gray-400' : dias < 0 ? 'text-red-500' : dias <= 7 ? 'text-red-500' : dias <= 30 ? 'text-amber-500' : 'text-gray-400')}>
                        {v.estado !== 'activo' ? v.estado : dias < 0 ? 'Vencido' : dias === 0 ? 'Hoy' : `${dias}d`}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

      </div>

      {/* Documentos */}
      <DocumentosPanel
        proyectoId={id}
        clienteId={cliente?.id ?? null}
        documentos={documentos ?? []}
      />

    </div>
  )
}
