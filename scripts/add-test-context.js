import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

async function addTestContext(profileId, username) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📝 ADICIONANDO CONTEXTO DE TESTE')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log(`Perfil: @${username}`)
  console.log(`ID: ${profileId}\n`)

  // Contexto de teste rico
  const contextoTeste = {
    nicho: 'IA & Automação para Creators de Conteúdo',
    objetivos: 'Vender 10 consultorias de IA por mês e construir autoridade no nicho de automação com IA para criadores de conteúdo',
    publico_alvo: 'Creators de conteúdo (Instagram, YouTube, TikTok) que passam 4-6 horas criando 1 post e querem reduzir para 30 minutos usando IA',
    produtos_servicos: 'Consultoria de IA (R$ 500-2000), Curso de Automação de Conteúdo com IA, Mentorias em grupo',
    tom_voz: 'Técnico mas acessível - usa termos de IA mas explica de forma simples. Prático e orientado a resultados, sem enrolação.',
    contexto_adicional: `
Dores do público:
- Passa horas criando 1 post e não consegue escalar
- Não sabe usar IA além do ChatGPT básico
- Tem medo de perder a autenticidade usando IA
- Quer automatizar mas não sabe por onde começar

Diferenciais:
- Foco em vibe coding (código + intuição)
- Ensina a criar sistemas, não só usar ferramentas
- Abordagem prática com resultados em minutos
- Combina IA com estratégia de conteúdo

Resultados prometidos:
- Reduzir tempo de criação de 4h para 30min
- Manter autenticidade mesmo usando IA
- Criar sistema de conteúdo que roda sozinho
- Escalar produção sem perder qualidade
    `.trim()
  }

  console.log('📋 Contexto que será salvo:\n')
  Object.entries(contextoTeste).forEach(([key, value]) => {
    console.log(`${key}:`)
    console.log(`${value}\n`)
  })

  // Verificar se já existe contexto
  const { data: existing } = await supabase
    .from('profile_context')
    .select('id')
    .eq('profile_id', profileId)
    .is('deleted_at', null)
    .maybeSingle()

  let result

  if (existing) {
    console.log('⚠️  Contexto já existe, atualizando...\n')
    const { data, error } = await supabase
      .from('profile_context')
      .update(contextoTeste)
      .eq('profile_id', profileId)
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao atualizar:', error.message)
      return
    }
    result = data
  } else {
    console.log('✨ Criando novo contexto...\n')
    const { data, error } = await supabase
      .from('profile_context')
      .insert({
        profile_id: profileId,
        ...contextoTeste
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao criar:', error.message)
      return
    }
    result = data
  }

  console.log('✅ CONTEXTO SALVO COM SUCESSO!\n')

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🧪 PRÓXIMO PASSO: VALIDAR')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log(`node scripts/test-context-usage.js ${username} ${profileId}`)
  console.log('')
}

// CLI
const profileId = process.argv[2]
const username = process.argv[3]

if (!profileId || !username) {
  console.error('❌ Uso: node scripts/add-test-context.js <profile_id> <username>')
  console.error('')
  console.error('Exemplo:')
  console.error('  node scripts/add-test-context.js d7e4899a-ef35-458f-8645-ec46b8ed27a3 karlapazos.ai')
  process.exit(1)
}

addTestContext(profileId, username)
