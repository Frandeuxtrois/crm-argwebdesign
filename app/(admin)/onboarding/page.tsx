import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getWorkspaceId } from '@/lib/workspace'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

export default async function OnboardingAdminPage() {
  const supabase = await createClient()
  const workspaceId = await getWorkspaceId()

  const { data: entradas } = await supabase
    .from('onboarding')
    .select('id, respuestas, procesado, created_at')
    .eq('workspace_id', workspaceId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const pendientes = entradas?.filter(e => !e.procesado).length ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Onboarding</h2>
        <p className="text-sm text-gray-500 mt-1">
          {pendientes > 0
            ? `${pendientes} formulario${pendientes !== 1 ? 's' : ''} sin procesar`
            : 'Todos los formularios procesados'}
        </p>
      </div>

      {!entradas || entradas.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center text-gray-400">
          <p className="text-sm">Todavía no hay formularios enviados.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entradas.map((entrada) => {
                const r = entrada.respuestas as Record<string, unknown>
                return (
                  <TableRow key={entrada.id}>
                    <TableCell className="font-medium">{r.nombre as string}</TableCell>
                    <TableCell>{r.marca as string}</TableCell>
                    <TableCell className="capitalize">{(r.plan as string)?.replace('_', ' ')}</TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {new Date(entrada.created_at).toLocaleDateString('es-AR')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={entrada.procesado ? 'secondary' : 'default'}>
                        {entrada.procesado ? 'Procesado' : 'Pendiente'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/onboarding/${entrada.id}`}
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
