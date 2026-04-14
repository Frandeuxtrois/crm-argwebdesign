'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getWorkspaceId } from '@/lib/workspace'

// ─── Crear proyecto ──────────────────────────────────────────
export async function crearProyecto(formData: FormData) {
  const supabase = await createClient()
  const workspaceId = await getWorkspaceId()

  const { data: proyecto, error } = await supabase
    .from('proyectos')
    .insert({
      workspace_id:  workspaceId,
      cliente_id:    formData.get('cliente_id') as string,
      nombre:        formData.get('nombre') as string,
      plan:          formData.get('plan') as string,
      precio_total:  parseFloat(formData.get('precio_total') as string),
      fecha_inicio:  formData.get('fecha_inicio') || null,
      fecha_entrega: formData.get('fecha_entrega') || null,
      estado:        'onboarding',
      progreso:      0,
      notas:         formData.get('notas') || null,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/proyectos')
  redirect(`/proyectos/${proyecto.id}`)
}

// ─── Editar proyecto ─────────────────────────────────────────
export async function editarProyecto(id: string, formData: FormData) {
  const supabase = await createClient()
  const workspaceId = await getWorkspaceId()

  const { error } = await supabase
    .from('proyectos')
    .update({
      nombre:        formData.get('nombre') as string,
      plan:          formData.get('plan') as string,
      precio_total:  parseFloat(formData.get('precio_total') as string),
      fecha_inicio:  formData.get('fecha_inicio') || null,
      fecha_entrega: formData.get('fecha_entrega') || null,
      estado:        formData.get('estado') as string,
      url_proyecto:  formData.get('url_proyecto') || null,
      notas:         formData.get('notas') || null,
    })
    .eq('id', id)
    .eq('workspace_id', workspaceId)

  if (error) throw new Error(error.message)

  revalidatePath(`/proyectos/${id}`)
  revalidatePath('/proyectos')
}

// ─── Agregar item al checklist ───────────────────────────────
export async function agregarChecklistItem(proyectoId: string, formData: FormData) {
  const supabase = await createClient()
  const workspaceId = await getWorkspaceId()

  // Calcular el siguiente orden
  const { count } = await supabase
    .from('checklist_items')
    .select('*', { count: 'exact', head: true })
    .eq('proyecto_id', proyectoId)
    .eq('workspace_id', workspaceId)

  const { error } = await supabase
    .from('checklist_items')
    .insert({
      workspace_id: workspaceId,
      proyecto_id:  proyectoId,
      titulo:       formData.get('titulo') as string,
      categoria:    formData.get('categoria') as string,
      orden:        count ?? 0,
    })

  if (error) throw new Error(error.message)

  revalidatePath(`/proyectos/${proyectoId}`)
}

// ─── Togglear item del checklist ─────────────────────────────
export async function toggleChecklistItem(itemId: string, proyectoId: string, completadoActual: boolean) {
  const supabase = await createClient()
  const workspaceId = await getWorkspaceId()

  const nuevoEstado = !completadoActual

  await supabase
    .from('checklist_items')
    .update({
      completado:       nuevoEstado,
      fecha_completado: nuevoEstado ? new Date().toISOString() : null,
    })
    .eq('id', itemId)
    .eq('workspace_id', workspaceId)

  // Recalcular progreso del proyecto
  const { data: items } = await supabase
    .from('checklist_items')
    .select('completado')
    .eq('proyecto_id', proyectoId)
    .eq('workspace_id', workspaceId)
    .is('deleted_at', null)

  if (items && items.length > 0) {
    const completados = items.filter(i => i.completado).length
    const progreso = Math.round((completados / items.length) * 100)

    await supabase
      .from('proyectos')
      .update({ progreso })
      .eq('id', proyectoId)
      .eq('workspace_id', workspaceId)
  }

  revalidatePath(`/proyectos/${proyectoId}`)
}

// ─── Eliminar item del checklist (soft delete) ───────────────
export async function eliminarChecklistItem(itemId: string, proyectoId: string) {
  const supabase = await createClient()
  const workspaceId = await getWorkspaceId()

  await supabase
    .from('checklist_items')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', itemId)
    .eq('workspace_id', workspaceId)

  revalidatePath(`/proyectos/${proyectoId}`)
}
