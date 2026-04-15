'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getWorkspaceId } from '@/lib/workspace'

export async function subirDocumento(proyectoId: string, clienteId: string | null, formData: FormData) {
  const supabase = await createClient()
  const workspaceId = await getWorkspaceId()

  const archivo = formData.get('archivo') as File
  if (!archivo || archivo.size === 0) throw new Error('No se seleccionó ningún archivo.')

  const extension = archivo.name.split('.').pop()
  const nombreLimpio = archivo.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const ruta = `${workspaceId}/${proyectoId}/${Date.now()}-${nombreLimpio}`

  const bytes = await archivo.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const { error: storageError } = await supabase.storage
    .from('documentos')
    .upload(ruta, buffer, { contentType: archivo.type })

  if (storageError) throw new Error(storageError.message)

  const { error: dbError } = await supabase.from('documentos').insert({
    workspace_id: workspaceId,
    proyecto_id:  proyectoId,
    cliente_id:   clienteId,
    nombre:       archivo.name,
    ruta,
    tipo:         archivo.type,
    tamaño:       archivo.size,
  })

  if (dbError) {
    // Si falla la DB, borrar el archivo subido
    await supabase.storage.from('documentos').remove([ruta])
    throw new Error(dbError.message)
  }

  revalidatePath(`/proyectos/${proyectoId}`)
}

export async function eliminarDocumento(id: string, ruta: string, proyectoId: string) {
  const supabase = await createClient()
  const workspaceId = await getWorkspaceId()

  await supabase.storage.from('documentos').remove([ruta])

  await supabase
    .from('documentos')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('workspace_id', workspaceId)

  revalidatePath(`/proyectos/${proyectoId}`)
}

export async function descargarDocumento(ruta: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.storage
    .from('documentos')
    .createSignedUrl(ruta, 300) // 5 minutos

  if (error || !data?.signedUrl) throw new Error('No se pudo generar el link de descarga.')

  redirect(data.signedUrl)
}
