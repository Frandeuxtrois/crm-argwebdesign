import { createClient } from '@supabase/supabase-js'

// Cliente simple con anon key, sin manejo de cookies.
// Solo para páginas públicas que no necesitan sesión de usuario.
export function createAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
