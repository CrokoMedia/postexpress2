import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Client para Server Components (lê cookies do Next.js)
 * APENAS para uso em Server Components e layouts
 */
export async function createServerSupabase() {
  const cookieStore = await cookies()

  return createServerClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL)!,
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY)!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component não pode setar cookies — ignorar
          }
        },
      },
    }
  )
}
