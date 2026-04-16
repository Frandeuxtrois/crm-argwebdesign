'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getWorkspaceId } from '@/lib/workspace'

const planLabel: Record<string, string> = {
  express:          'Web Express',
  landing:          'Landing Page',
  economica:        'Económica',
  autogestionable:  'Auto-Gestionable',
  ecommerce_basico: 'E-commerce Básico',
  ecommerce_full:   'E-commerce Full',
  personalizada:    'Personalizada',
}

// Crea cliente nuevo + proyecto (email no existe en el workspace)
export async function procesarOnboarding(id: string) {
  const supabase = await createClient()
  const workspaceId = await getWorkspaceId()

  const { data: entrada, error: fetchError } = await supabase
    .from('onboarding')
    .select('*')
    .eq('id', id)
    .eq('workspace_id', workspaceId)
    .single()

  if (fetchError || !entrada) throw new Error('Entrada no encontrada.')
  if (entrada.procesado) throw new Error('Esta entrada ya fue procesada.')

  const r = entrada.respuestas as Record<string, unknown>

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

  await crearProyectoYCerrar(supabase, workspaceId, id, nuevoCliente.id, r, entrada.created_at)
}

// Ignora el formulario (lo marca como procesado sin crear nada)
export async function ignorarOnboarding(id: string) {
  const supabase = await createClient()
  const workspaceId = await getWorkspaceId()

  await supabase
    .from('onboarding')
    .update({ procesado: true })
    .eq('id', id)
    .eq('workspace_id', workspaceId)

  revalidatePath('/onboarding')
  redirect('/onboarding')
}

// Asocia el onboarding a un cliente existente y crea solo el proyecto
export async function asociarOnboarding(id: string, clienteId: string) {
  const supabase = await createClient()
  const workspaceId = await getWorkspaceId()

  const { data: entrada, error: fetchError } = await supabase
    .from('onboarding')
    .select('*')
    .eq('id', id)
    .eq('workspace_id', workspaceId)
    .single()

  if (fetchError || !entrada) throw new Error('Entrada no encontrada.')
  if (entrada.procesado) throw new Error('Esta entrada ya fue procesada.')

  const r = entrada.respuestas as Record<string, unknown>

  await crearProyectoYCerrar(supabase, workspaceId, id, clienteId, r, entrada.created_at)
}

// Helper compartido: crea el proyecto y cierra el onboarding
async function crearProyectoYCerrar(
  supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>,
  workspaceId: string,
  onboardingId: string,
  clienteId: string,
  r: Record<string, unknown>,
  createdAt: string,
) {
  const plan = r.plan as string
  const nombreProyecto = `${r.marca} — ${planLabel[plan] ?? plan}`
  const fechaInicio = createdAt
    ? new Date(createdAt).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0]

  const { data: nuevoProyecto, error: proyectoError } = await supabase
    .from('proyectos')
    .insert({
      workspace_id: workspaceId,
      cliente_id:   clienteId,
      nombre:       nombreProyecto,
      plan:         plan,
      fecha_inicio: fechaInicio,
      estado:       'onboarding',
      progreso:     0,
    })
    .select('id')
    .single()

  if (proyectoError || !nuevoProyecto) throw new Error(proyectoError?.message ?? 'Error al crear proyecto.')

  await supabase
    .from('onboarding')
    .update({ procesado: true, cliente_id: clienteId })
    .eq('id', onboardingId)

  revalidatePath('/onboarding')
  revalidatePath('/proyectos')
  redirect(`/proyectos/${nuevoProyecto.id}`)
}
