'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getWorkspaceId } from '@/lib/workspace'

export async function crearPago(formData: FormData) {
  const supabase = await createClient()
  const workspaceId = await getWorkspaceId()

  const { error } = await supabase.from('pagos').insert({
    workspace_id:   workspaceId,
    proyecto_id:    formData.get('proyecto_id') as string,
    tipo:           formData.get('tipo') as string,
    monto:          parseFloat(formData.get('monto') as string),
    estado:         'pendiente',
    fecha_emision:  formData.get('fecha_emision') || null,
    notas:          formData.get('notas') || null,
  })

  if (error) throw new Error(error.message)

  revalidatePath('/pagos')
  redirect('/pagos')
}

export async function editarPago(id: string, formData: FormData) {
  const supabase = await createClient()
  const workspaceId = await getWorkspaceId()

  const estado = formData.get('estado') as string

  const { error } = await supabase
    .from('pagos')
    .update({
      tipo:           formData.get('tipo') as string,
      monto:          parseFloat(formData.get('monto') as string),
      estado,
      fecha_emision:  formData.get('fecha_emision') || null,
      fecha_pago:     estado === 'pagado' ? (formData.get('fecha_pago') || new Date().toISOString().split('T')[0]) : null,
      metodo_pago:    formData.get('metodo_pago') || null,
      notas:          formData.get('notas') || null,
    })
    .eq('id', id)
    .eq('workspace_id', workspaceId)

  if (error) throw new Error(error.message)

  revalidatePath('/pagos')
  revalidatePath(`/pagos/${id}`)
  redirect('/pagos')
}
