import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

async function listProfiles() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📋 PERFIS DISPONÍVEIS PARA TESTE')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const { data: profiles, error } = await supabase
    .from('instagram_profiles')
    .select('id, username, full_name, followers_count')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('❌ Erro:', error.message)
    return
  }

  if (!profiles || profiles.length === 0) {
    console.log('⚠️  Nenhum perfil encontrado')
    console.log('   Crie uma análise primeiro via dashboard\n')
    return
  }

  console.log(`Encontrados ${profiles.length} perfis:\n`)

  profiles.forEach((p, i) => {
    console.log(`${i + 1}. @${p.username}`)
    console.log(`   Nome: ${p.full_name || 'N/A'}`)
    console.log(`   Seguidores: ${p.followers_count || 0}`)
    console.log(`   ID: ${p.id}`)
    console.log('')
  })

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🧪 PRÓXIMO PASSO:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log('Escolha um perfil e copie o ID, depois:')
  console.log('')
  console.log('1. Abra o dashboard:')
  console.log('   http://localhost:3000/dashboard/profiles/[ID]')
  console.log('')
  console.log('2. Clique em "Adicionar Contexto"')
  console.log('')
  console.log('3. Preencha os campos + faça upload de um PDF')
  console.log('')
  console.log('4. Depois rode:')
  console.log('   node scripts/test-context-usage.js <username> <profile_id>')
  console.log('')
}

listProfiles()
