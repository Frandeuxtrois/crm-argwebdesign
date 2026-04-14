import { createBrowserClient } from '@supabase/ssr'

// Cliente para usar en componentes del browser (Client Components)
// Se crea una sola instancia por sesión
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
