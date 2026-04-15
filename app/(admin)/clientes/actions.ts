'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getWorkspaceId } from '@/lib/workspace'

// ─── Crear cliente ───────────────────────────────────────────
export async function crearCliente(formData: FormData) {
  const supabase = await createClient()
  const workspaceId = await getWorkspaceId()

  const datos = {
    workspace_id:        workspaceId,
    nombre:              formData.get('nombre') as string,
    marca:               formData.get('marca') as string,
    email:               formData.get('email') as string,
    whatsapp:            formData.get('whatsapp') as string,
    descripcion_negocio: formData.get('descripcion_negocio') as string || null,
    datos_fiscales:      formData.get('datos_fiscales') as string || null,
    notas:               formData.get('notas') as string || null,
    estado:              'activo',
  }

  const { error } = await supabase.from('clientes').insert(datos)

  if (error) throw new Error(error.message)

  revalidatePath('/clientes')
  redirect('/clientes')
}

// ─── Editar cliente ──────────────────────────────────────────
export async function editarCliente(id: string, formData: FormData) {
  const supabase = await createClient()
  const workspaceId = await getWorkspaceId()

  const datos = {
    nombre:              formData.get('nombre') as string,
    marca:               formData.get('marca') as string,
    email:               formData.get('email') as string,
    whatsapp:            formData.get('whatsapp') as string,
    descripcion_negocio: formData.get('descripcion_negocio') as string || null,
    datos_fiscales:      formData.get('datos_fiscales') as string || null,
    notas:               formData.get('notas') as string || null,
    estado:              formData.get('estado') as string,
  }

  const { error } = await supabase
    .from('clientes')
    .update(datos)
    .eq('id', id)
    .eq('workspace_id', workspaceId) // doble seguridad además del RLS

  if (error) throw new Error(error.message)

  revalidatePath('/clientes')
  revalidatePath(`/clientes/${id}`)
  redirect('/clientes')
}

// ─── Archivar cliente (soft delete de estado) ────────────────
export async function archivarCliente(id: string) {
  const supabase = await createClient()
  const workspaceId = await getWorkspaceId()

  const { error } = await supabase
    .from('clientes')
    .update({ estado: 'archivado' })
    .eq('id', id)
    .eq('workspace_id', workspaceId)

  if (error) throw new Error(error.message)

  revalidatePath('/clientes')
  redirect('/clientes')
}

// ─── Eliminar cliente (soft delete con deleted_at) ────────────
export async function eliminarCliente(id: string) {
  const supabase = await createClient()
  const workspaceId = await getWorkspaceId()

  const { error } = await supabase
    .from('clientes')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('workspace_id', workspaceId)

  if (error) throw new Error(error.message)

  revalidatePath('/clientes')
  redirect('/clientes')
}
