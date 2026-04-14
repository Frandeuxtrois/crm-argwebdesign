import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Retorna el workspace_id del usuario autenticado.
// Si no hay sesión o no tiene workspace, redirige al login.
export async function getWorkspaceId(): Promise<string> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data, error } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .single()

  if (error || !data) redirect('/login')

  return data.workspace_id
}
