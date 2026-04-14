import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getWorkspaceId } from '@/lib/workspace'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'

const estadoBadge: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  activo:    { label: 'Activo',    variant: 'default' },
  inactivo:  { label: 'Inactivo',  variant: 'secondary' },
  archivado: { label: 'Archivado', variant: 'outline' },
}

export default async function ClientesPage() {
  const supabase = await createClient()
  const workspaceId = await getWorkspaceId()

  const { data: clientes } = await supabase
    .from('clientes')
    .select('id, nombre, marca, email, whatsapp, estado, created_at')
    .eq('workspace_id', workspaceId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Clientes</h2>
          <p className="text-sm text-gray-500 mt-1">
            {clientes?.length ?? 0} cliente{clientes?.length !== 1 ? 's' : ''} registrado{clientes?.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/clientes/nuevo" className={cn(buttonVariants())}>
          <UserPlus className="h-4 w-4 mr-2" />
          Nuevo cliente
        </Link>
      </div>

      {!clientes || clientes.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center text-gray-400">
          <p className="text-sm">Todavía no hay clientes. ¡Agregá el primero!</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientes.map((cliente) => {
                const badge = estadoBadge[cliente.estado] ?? estadoBadge.activo
                return (
                  <TableRow key={cliente.id}>
                    <TableCell className="font-medium">{cliente.nombre}</TableCell>
                    <TableCell>{cliente.marca}</TableCell>
                    <TableCell className="text-gray-500">{cliente.email}</TableCell>
                    <TableCell className="text-gray-500">{cliente.whatsapp}</TableCell>
                    <TableCell>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/clientes/${cliente.id}`}
                        className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
                      >
                        Ver / Editar
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
