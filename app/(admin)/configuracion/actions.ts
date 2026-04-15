'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getWorkspaceId } from '@/lib/workspace'

export async function guardarConfiguracion(formData: FormData) {
  const supabase = await createClient()
  const workspaceId = await getWorkspaceId()

  const { error } = await supabase
    .from('workspaces')
    .update({
      nombre:    formData.get('nombre') as string,
      email:     formData.get('email') || null,
      whatsapp:  formData.get('whatsapp') || null,
      sitio_web: formData.get('sitio_web') || null,
    })
    .eq('id', workspaceId)

  if (error) throw new Error(error.message)

  revalidatePath('/configuracion')
}
