'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getWorkspaceId } from '@/lib/workspace'

export async function crearVencimiento(formData: FormData) {
  const supabase = await createClient()
  const workspaceId = await getWorkspaceId()

  const { error } = await supabase.from('vencimientos').insert({
    workspace_id:     workspaceId,
    cliente_id:       formData.get('cliente_id') as string,
    proyecto_id:      formData.get('proyecto_id') || null,
    tipo:             formData.get('tipo') as string,
    descripcion:      formData.get('descripcion') || null,
    fecha_vencimiento: formData.get('fecha_vencimiento') as string,
    monto:            formData.get('monto') ? parseFloat(formData.get('monto') as string) : null,
    estado:           'activo',
  })

  if (error) throw new Error(error.message)

  revalidatePath('/vencimientos')
  redirect('/vencimientos')
}

export async function eliminarVencimiento(id: string) {
  const supabase = await createClient()
  const workspaceId = await getWorkspaceId()

  const { error } = await supabase
    .from('vencimientos')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('workspace_id', workspaceId)

  if (error) throw new Error(error.message)

  revalidatePath('/vencimientos')
  redirect('/vencimientos')
}

export async function editarVencimiento(id: string, formData: FormData) {
  const supabase = await createClient()
  const workspaceId = await getWorkspaceId()

  const { error } = await supabase
    .from('vencimientos')
    .update({
      tipo:              formData.get('tipo') as string,
      descripcion:       formData.get('descripcion') || null,
      fecha_vencimiento: formData.get('fecha_vencimiento') as string,
      monto:             formData.get('monto') ? parseFloat(formData.get('monto') as string) : null,
      estado:            formData.get('estado') as string,
    })
    .eq('id', id)
    .eq('workspace_id', workspaceId)

  if (error) throw new Error(error.message)

  revalidatePath('/vencimientos')
  redirect('/vencimientos')
}
