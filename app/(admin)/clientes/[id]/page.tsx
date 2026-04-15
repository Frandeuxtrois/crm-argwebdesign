import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getWorkspaceId } from '@/lib/workspace'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { editarCliente, archivarCliente, eliminarCliente } from '../actions'
import { ArrowLeft, Mail, Phone, FolderKanban, CreditCard, CalendarClock, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

function formatARS(monto: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(monto)
}

const estadoProyecto: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  onboarding:    { label: 'Onboarding',    variant: 'secondary' },
  en_desarrollo: { label: 'En desarrollo', variant: 'default' },
  revision:      { label: 'Revisión',      variant: 'secondary' },
  entregado:     { label: 'Entregado',     variant: 'outline' },
  pausado:       { label: 'Pausado',       variant: 'outline' },
}

export default async function ClienteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const workspaceId = await getWorkspaceId()

  const [
    { data: cliente },
    { data: proyectos },
    { data: pagos },
    { data: vencimientos },
  ] = await Promise.all([
    supabase.from('clientes').select('*').eq('id', id).eq('workspace_id', workspaceId).is('deleted_at', null).single(),
    supabase.from('proyectos').select('id, nombre, estado, progreso, fecha_entrega').eq('cliente_id', id).eq('workspace_id', workspaceId).is('deleted_at', null).order('created_at', { ascending: false }),
    supabase.from('pagos').select('id, monto, estado, tipo, fecha_emision, proyecto_id, proyectos(nombre)').eq('workspace_id', workspaceId).is('deleted_at', null).order('created_at', { ascending: false }),
    supabase.from('vencimientos').select('id, tipo, descripcion, fecha_vencimiento, estado, monto').eq('cliente_id', id).eq('workspace_id', workspaceId).is('deleted_at', null).order('fecha_vencimiento', { ascending: true }),
  ])

  if (!cliente) notFound()

  // Filtrar pagos que pertenecen a proyectos de este cliente
  const proyectoIds = new Set(proyectos?.map(p => p.id) ?? [])
  const pagosCliente = (pagos ?? []).filter(p => proyectoIds.has((p as unknown as { proyecto_id: string }).proyecto_id))

  // Métricas rápidas
  const totalCobrado = pagosCliente.filter(p => p.estado === 'pagado').reduce((s, p) => s + p.monto, 0)
  const totalPendiente = pagosCliente.filter(p => p.estado === 'pendiente').reduce((s, p) => s + p.monto, 0)
  const hoy = Date.now()

  const editarConId = editarCliente.bind(null, id)
  const archivarConId = archivarCliente.bind(null, id)
  const eliminarConId = eliminarCliente.bind(null, id)

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/clientes" className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold text-gray-900">{cliente.marca}</h2>
            <Badge variant={cliente.estado === 'activo' ? 'default' : 'outline'}>
              {cliente.estado === 'activo' ? 'Activo' : cliente.estado === 'inactivo' ? 'Inactivo' : 'Archivado'}
            </Badge>
          </div>
          <p className="text-sm text-gray-500">{cliente.nombre}</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`mailto:${cliente.email}`}
            className={cn(buttonVariants({ variant: 'outline', size: 'icon' }))}
            title={cliente.email}
          >
            <Mail className="h-4 w-4" />
          </a>
          <a
            href={`https://wa.me/${cliente.whatsapp?.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: 'outline', size: 'icon' }))}
            title={cliente.whatsapp}
          >
            <Phone className="h-4 w-4" />
          </a>
          <form action={eliminarConId}>
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="text-red-400 hover:text-red-600 hover:bg-red-50"
              title="Eliminar cliente"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Proyectos</p>
          <p className="text-2xl font-bold text-gray-900">{proyectos?.length ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Cobrado</p>
          <p className="text-lg font-bold text-green-600">{formatARS(totalCobrado)}</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Pendiente</p>
          <p className="text-lg font-bold text-amber-600">{formatARS(totalPendiente)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Columna izquierda: form de edición */}
        <form action={editarConId} className="lg:col-span-2 bg-white rounded-lg border p-5 space-y-4 self-start">
          <p className="text-sm font-semibold text-gray-700">Datos del cliente</p>

          <div className="space-y-1.5">
            <Label htmlFor="nombre">Nombre y apellido *</Label>
            <Input id="nombre" name="nombre" required defaultValue={cliente.nombre} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="marca">Marca / Negocio *</Label>
            <Input id="marca" name="marca" required defaultValue={cliente.marca} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" name="email" type="email" required defaultValue={cliente.email} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="whatsapp">WhatsApp *</Label>
            <Input id="whatsapp" name="whatsapp" required defaultValue={cliente.whatsapp} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="descripcion_negocio">Descripción del negocio</Label>
            <Textarea id="descripcion_negocio" name="descripcion_negocio" rows={2} defaultValue={cliente.descripcion_negocio ?? ''} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="datos_fiscales">Datos fiscales</Label>
            <Input id="datos_fiscales" name="datos_fiscales" defaultValue={cliente.datos_fiscales ?? ''} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notas">Notas internas</Label>
            <Textarea id="notas" name="notas" rows={2} defaultValue={cliente.notas ?? ''} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="estado">Estado</Label>
            <Select name="estado" defaultValue={cliente.estado}>
              <SelectTrigger id="estado"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="inactivo">Inactivo</SelectItem>
                <SelectItem value="archivado">Archivado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between items-center pt-1">
            {cliente.estado !== 'archivado' && (
              <Button formAction={archivarConId} type="submit" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 text-xs px-2">
                Archivar
              </Button>
            )}
            <Button type="submit" className="ml-auto">Guardar</Button>
          </div>
        </form>

        {/* Columna derecha: proyectos, pagos, vencimientos */}
        <div className="lg:col-span-3 space-y-4">

          {/* Proyectos */}
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FolderKanban className="h-4 w-4 text-gray-400" />
                Proyectos
              </div>
              <Link
                href={`/proyectos/nuevo`}
                className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'text-xs h-7')}
              >
                <Plus className="h-3 w-3 mr-1" />
                Nuevo
              </Link>
            </div>
            {!proyectos?.length ? (
              <p className="px-4 py-6 text-sm text-gray-400 text-center">Sin proyectos</p>
            ) : (
              <div className="divide-y">
                {proyectos.map((p) => {
                  const est = estadoProyecto[p.estado] ?? estadoProyecto.onboarding
                  return (
                    <Link key={p.id} href={`/proyectos/${p.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{p.nombre}</p>
                        {p.fecha_entrega && (
                          <p className="text-xs text-gray-400">Entrega: {new Date(p.fecha_entrega).toLocaleDateString('es-AR')}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1.5 w-20">
                          <Progress value={p.progreso} className="h-1.5 flex-1" />
                          <span className="text-xs text-gray-400 w-6 text-right">{p.progreso}%</span>
                        </div>
                        <Badge variant={est.variant} className="text-xs">{est.label}</Badge>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Pagos */}
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <CreditCard className="h-4 w-4 text-gray-400" />
                Pagos
              </div>
              <Link
                href="/pagos/nuevo"
                className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'text-xs h-7')}
              >
                <Plus className="h-3 w-3 mr-1" />
                Nuevo
              </Link>
            </div>
            {!pagosCliente.length ? (
              <p className="px-4 py-6 text-sm text-gray-400 text-center">Sin pagos registrados</p>
            ) : (
              <div className="divide-y">
                {pagosCliente.slice(0, 5).map((p) => {
                  const proy = (Array.isArray(p.proyectos) ? p.proyectos[0] : p.proyectos) as { nombre: string } | null
                  return (
                    <Link key={p.id} href={`/pagos/${p.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-gray-900 capitalize">{p.tipo}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[180px]">{proy?.nombre ?? '—'}</p>
                      </div>
                      <div className="text-right">
                        <p className={cn('text-sm font-semibold', p.estado === 'pagado' ? 'text-green-600' : p.estado === 'vencido' ? 'text-red-500' : 'text-amber-600')}>
                          {formatARS(p.monto)}
                        </p>
                        <p className="text-xs text-gray-400 capitalize">{p.estado}</p>
                      </div>
                    </Link>
                  )
                })}
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
              <Link
                href="/vencimientos/nuevo"
                className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'text-xs h-7')}
              >
                <Plus className="h-3 w-3 mr-1" />
                Nuevo
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
      </div>
    </div>
  )
}
