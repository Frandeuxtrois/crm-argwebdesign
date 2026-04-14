import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getWorkspaceId } from '@/lib/workspace'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FolderPlus } from 'lucide-react'
import { cn } from '@/lib/utils'

const estadoConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  onboarding:    { label: 'Onboarding',    variant: 'secondary' },
  en_desarrollo: { label: 'En desarrollo', variant: 'default' },
  revision:      { label: 'Revisión',      variant: 'secondary' },
  entregado:     { label: 'Entregado',     variant: 'outline' },
  pausado:       { label: 'Pausado',       variant: 'outline' },
}

const planLabel: Record<string, string> = {
  express:          'Express',
  landing:          'Landing',
  economica:        'Económica',
  autogestionable:  'Autogestionable',
  ecommerce_basico: 'E-commerce Básico',
  ecommerce_full:   'E-commerce Full',
  personalizada:    'Personalizada',
}

export default async function ProyectosPage() {
  const supabase = await createClient()
  const workspaceId = await getWorkspaceId()

  const { data: proyectos } = await supabase
    .from('proyectos')
    .select('id, nombre, plan, estado, progreso, fecha_entrega, clientes(nombre, marca)')
    .eq('workspace_id', workspaceId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Proyectos</h2>
          <p className="text-sm text-gray-500 mt-1">
            {proyectos?.length ?? 0} proyecto{proyectos?.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/proyectos/nuevo" className={cn(buttonVariants())}>
          <FolderPlus className="h-4 w-4 mr-2" />
          Nuevo proyecto
        </Link>
      </div>

      {!proyectos || proyectos.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center text-gray-400">
          <p className="text-sm">Todavía no hay proyectos. ¡Creá el primero!</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proyecto</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Progreso</TableHead>
                <TableHead>Entrega</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proyectos.map((p) => {
                const estado = estadoConfig[p.estado] ?? estadoConfig.onboarding
                const cliente = (Array.isArray(p.clientes) ? p.clientes[0] : p.clientes) as { nombre: string; marca: string } | null
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.nombre}</TableCell>
                    <TableCell className="text-gray-500">{cliente?.marca ?? '—'}</TableCell>
                    <TableCell className="text-gray-500 text-sm">{planLabel[p.plan] ?? p.plan}</TableCell>
                    <TableCell>
                      <Badge variant={estado.variant}>{estado.label}</Badge>
                    </TableCell>
                    <TableCell className="w-32">
                      <div className="flex items-center gap-2">
                        <Progress value={p.progreso} className="h-1.5 flex-1" />
                        <span className="text-xs text-gray-400 w-8 text-right">{p.progreso}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {p.fecha_entrega
                        ? new Date(p.fecha_entrega).toLocaleDateString('es-AR')
                        : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/proyectos/${p.id}`}
                        className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
                      >
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
