import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

// Acessar variáveis de ambiente diretamente (Next.js substitui em build time)
function getSupabaseUrl(): string {
  // No client, usar NEXT_PUBLIC_*; no server, pode usar ambas
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  if (!url) {
    throw new Error('Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL environment variable')
  }
  return url
}

function getSupabaseAnonKey(): string {
  // No client, usar NEXT_PUBLIC_*; no server, pode usar ambas
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  if (!key) {
    throw new Error('Missing SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
  }
  return key
}

// Client para browser (usa anon key, sem persistência — compatibilidade legado)
// Lazy initialization para evitar erro em build time
let _supabaseClient: ReturnType<typeof createClient> | null = null

function getSupabaseClient() {
  if (!_supabaseClient) {
    _supabaseClient = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
      auth: {
        persistSession: false,
      },
    })
  }
  return _supabaseClient
}

// Export com Proxy para manter compatibilidade com código existente
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(target, prop) {
    const client = getSupabaseClient()
    return (client as any)[prop]
  }
})

// Server-only client com service role (para API routes e worker)
export function getServerSupabase() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const url = getSupabaseUrl()

  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  }

  return createClient(url, serviceRoleKey, {
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
    getSupabaseUrl(),
    getSupabaseAnonKey()
  )
}

// Alias para compatibilidade
export { createClientSupabase as createClient }
