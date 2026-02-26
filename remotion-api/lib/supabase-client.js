/**
 * Supabase Client (Railway version)
 *
 * Cliente Supabase usando service role key (sem cookies/autenticação do Next.js)
 */

import { createClient } from '@supabase/supabase-js'

let supabaseInstance = null

/**
 * Retorna instância singleton do Supabase client
 */
export function getSupabase() {
  if (supabaseInstance) {
    return supabaseInstance
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Variáveis SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias'
    )
  }

  supabaseInstance = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  return supabaseInstance
}
