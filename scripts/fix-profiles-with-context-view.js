import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

async function fixView() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔧 CORRIGINDO VIEW PROFILES_WITH_CONTEXT')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // SQL da view
  const viewSQL = `
CREATE OR REPLACE VIEW profiles_with_context AS
SELECT
  p.*,
  pc.nicho,
  pc.objetivos,
  pc.publico_alvo,
  pc.produtos_servicos,
  pc.tom_voz,
  pc.contexto_adicional,
  pc.documents,
  pc.raw_text,
  pc.usage_count as context_usage_count,
  pc.last_used_in_audit_at,
  pc.last_used_in_content_at,
  (pc.id IS NOT NULL) as has_context
FROM profiles p
LEFT JOIN profile_context pc ON p.id = pc.profile_id
WHERE p.deleted_at IS NULL;
`

  console.log('📝 SQL da view preparado\n')
  console.log('⚠️  A API do Supabase não permite CREATE VIEW via JavaScript')
  console.log('📋 Você precisa executar no SQL Editor:\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(viewSQL.trim())
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log('🌐 Acesse: https://supabase.com/dashboard')
  console.log('   1. Abra seu projeto')
  console.log('   2. Vá em "SQL Editor"')
  console.log('   3. Cole o SQL acima')
  console.log('   4. Clique em "Run"\n')

  console.log('💡 ALTERNATIVA: Sistema funciona SEM a view!')
  console.log('   A view é apenas conveniência - todas APIs funcionam sem ela\n')
}

fixView()
