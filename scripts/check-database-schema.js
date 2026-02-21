import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

async function check() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔍 VERIFICANDO SCHEMA DO BANCO DE DADOS')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const tables = [
    'profiles',
    'audits',
    'posts',
    'comments',
    'profile_context',
    'analysis_queue',
    'content_suggestions'
  ]

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('count')
      .limit(1)

    if (error) {
      console.log(`❌ ${table.padEnd(25)} - ${error.message}`)
    } else {
      console.log(`✅ ${table.padEnd(25)} - Existe`)
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

check()
