'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getWorkspaceId } from '@/lib/workspace'

// Convierte una entrada de onboarding en un cliente real
export async function procesarOnboarding(id: string) {
  const supabase = await createClient()
  const workspaceId = await getWorkspaceId()

  // Traer la entrada de onboarding
  const { data: entrada, error: fetchError } = await supabase
    .from('onboarding')
    .select('*')
    .eq('id', id)
    .eq('workspace_id', workspaceId)
    .single()

  if (fetchError || !entrada) throw new Error('Entrada no encontrada.')
  if (entrada.procesado) throw new Error('Esta entrada ya fue procesada.')

  const r = entrada.respuestas as Record<string, unknown>

  // Crear el cliente con los datos del formulario
  const { data: nuevoCliente, error: clienteError } = await supabase
    .from('clientes')
    .insert({
      workspace_id:        workspaceId,
      nombre:              r.nombre as string,
      marca:               r.marca as string,
      email:               r.email as string,
      whatsapp:            r.whatsapp as string,
      descripcion_negocio: r.descripcion_negocio as string ?? null,
      estado:              'activo',
    })
    .select('id')
    .single()

  if (clienteError || !nuevoCliente) throw new Error(clienteError?.message ?? 'Error al crear cliente.')

  // Marcar el onboarding como procesado y vincular al cliente
  await supabase
    .from('onboarding')
    .update({ procesado: true, cliente_id: nuevoCliente.id })
    .eq('id', id)

  revalidatePath('/onboarding')
  redirect(`/clientes/${nuevoCliente.id}`)
}
