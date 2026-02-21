import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

async function test() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔍 TESTANDO PROFILE CONTEXT INTEGRATION')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // Test 1: Verificar tabela profile_context
  console.log('1️⃣  Verificando tabela profile_context...')
  const { data: contextData, error: contextError } = await supabase
    .from('profile_context')
    .select('*')
    .limit(1)

  if (contextError && contextError.code === '42P01') {
    console.log('❌ Tabela profile_context não existe')
    console.log('   Execute: database/migrations/006_profile_context.sql\n')
    return
  }

  console.log('✅ Tabela profile_context existe!\n')

  // Test 2: Verificar view profiles_with_context
  console.log('2️⃣  Verificando view profiles_with_context...')
  const { data: viewData, error: viewError } = await supabase
    .from('profiles_with_context')
    .select('username, has_context, nicho, objetivos')
    .limit(5)

  if (viewError) {
    console.log('⚠️  View profiles_with_context não existe')
    console.log('   Rode o SQL completo da migration\n')
  } else {
    console.log('✅ View profiles_with_context ativa!')
    console.log(`   Encontrados ${viewData.length} perfis:\n`)
    viewData.forEach(p => {
      console.log(`   • @${p.username}`)
      console.log(`     Contexto: ${p.has_context ? '✅ SIM' : '❌ NÃO'}`)
      if (p.has_context) {
        console.log(`     Nicho: ${p.nicho || 'não definido'}`)
        console.log(`     Objetivos: ${p.objetivos || 'não definido'}`)
      }
      console.log('')
    })
  }

  // Test 3: Verificar função increment_context_usage
  console.log('3️⃣  Verificando função increment_context_usage...')
  const { error: funcError } = await supabase.rpc('increment_context_usage', {
    p_profile_id: '00000000-0000-0000-0000-000000000000', // UUID fake
    p_usage_type: 'audit'
  })

  if (funcError && funcError.message.includes('does not exist')) {
    console.log('⚠️  Função increment_context_usage não existe')
    console.log('   Rode o SQL completo da migration\n')
  } else {
    console.log('✅ Função increment_context_usage existe!\n')
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ TESTES CONCLUÍDOS')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log('📋 Próximos passos:')
  console.log('   1. Adicione contexto em um perfil via UI')
  console.log('   2. Rode uma análise para testar integração')
  console.log('   3. Verifique se o contexto aparece nos logs\n')
}

test()
