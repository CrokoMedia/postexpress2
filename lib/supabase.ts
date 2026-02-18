import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Client para browser (usa anon key, sem persistência — compatibilidade legado)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
})

// Server-only client com service role (para API routes e worker)
export function getServerSupabase() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey || !supabaseUrl) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  }

  return createClient(supabaseUrl as string, serviceRoleKey as string, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

/**
 * Client para o browser com suporte a cookies (autenticação SSR)
 * Usar em Client Components
 */
export function createClientSupabase() {
  return createBrowserClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL)!,
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY)!
  )
}
