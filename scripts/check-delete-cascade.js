#!/usr/bin/env node

/**
 * Verifica se as Foreign Keys têm ON DELETE CASCADE
 * para garantir que ao deletar perfil, tudo seja apagado
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

// Carregar .env
const envLocalPath = path.join(process.cwd(), '.env.local')
const envPath = path.join(process.cwd(), '.env')

if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath })
} else if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function main() {
  console.log('═══════════════════════════════════════════════════════')
  console.log('  🔍 VERIFICAR DELETE CASCADE')
  console.log('═══════════════════════════════════════════════════════\n')

  console.log('Execute no SQL Editor do Supabase:\n')
  console.log('```sql')
  console.log(`-- Ver todas as Foreign Keys e suas regras de DELETE
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('audits', 'posts', 'comments', 'comparisons')
ORDER BY tc.table_name, kcu.column_name;`)
  console.log('```\n')

  console.log('─────────────────────────────────────────────────────\n')
  console.log('📋 Resultado esperado:\n')
  console.log('| table_name  | column_name | foreign_table_name  | delete_rule |')
  console.log('|-------------|-------------|---------------------|-------------|')
  console.log('| audits      | profile_id  | instagram_profiles  | CASCADE     |')
  console.log('| posts       | audit_id    | audits              | CASCADE     |')
  console.log('| comments    | post_id     | posts               | CASCADE     |')
  console.log('| comparisons | profile_id  | instagram_profiles  | CASCADE     |\n')

  console.log('Se delete_rule NÃO for CASCADE, execute:\n')
  console.log('```sql')
  console.log(`-- Exemplo para corrigir FK sem CASCADE:
ALTER TABLE audits
DROP CONSTRAINT audits_profile_id_fkey;

ALTER TABLE audits
ADD CONSTRAINT audits_profile_id_fkey
FOREIGN KEY (profile_id)
REFERENCES instagram_profiles(id)
ON DELETE CASCADE;`)
  console.log('```\n')

  console.log('═══════════════════════════════════════════════════════')
  console.log('  🗑️ COMO DELETAR PERFIL + TODO HISTÓRICO')
  console.log('═══════════════════════════════════════════════════════\n')

  console.log('Opção 1: Soft Delete (recomendado)\n')
  console.log('```sql')
  console.log(`-- Marcar perfil como deletado (preserva histórico)
UPDATE instagram_profiles
SET deleted_at = NOW()
WHERE username = 'crokolabs';`)
  console.log('```\n')

  console.log('Opção 2: Hard Delete (apaga tudo!)\n')
  console.log('```sql')
  console.log(`-- CUIDADO: Apaga perfil + auditorias + posts + comentários
DELETE FROM instagram_profiles
WHERE username = 'crokolabs';

-- Se CASCADE estiver configurado, vai apagar automaticamente:
-- - Todas as auditorias deste perfil
-- - Todos os posts dessas auditorias
-- - Todos os comentários desses posts
-- - Todas as comparações deste perfil`)
  console.log('```\n')

  console.log('Opção 3: Via API (cria endpoint)\n')
  console.log('Arquivo: app/api/profiles/[id]/route.ts\n')
  console.log('```typescript')
  console.log(`export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = getServerSupabase()

  // Soft delete (recomendado)
  const { error } = await supabase
    .from('instagram_profiles')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}`)
  console.log('```\n')

  console.log('─────────────────────────────────────────────────────\n')
  console.log('💡 RECOMENDAÇÃO:\n')
  console.log('Use SOFT DELETE (deleted_at) em vez de hard delete.')
  console.log('Isso permite:\n')
  console.log('- Recuperar dados se deletar por engano')
  console.log('- Manter histórico para análise futura')
  console.log('- Compliance com LGPD (auditoria de exclusões)\n')
}

main().catch(console.error)
