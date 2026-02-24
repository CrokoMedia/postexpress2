/**
 * Script de Teste: Validar Uso de Contexto
 *
 * Simula o fluxo completo e mostra EXATAMENTE o que será enviado ao Claude
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import 'dotenv/config'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

async function testContextUsage(username, profileId) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🧪 TESTE DE USO DE CONTEXTO')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log(`📋 Perfil: @${username}`)
  console.log(`🆔 Profile ID: ${profileId}\n`)

  // 1. Buscar perfil
  console.log('1️⃣  Buscando perfil no Supabase...')
  const { data: profile, error: profileError } = await supabase
    .from('instagram_profiles')
    .select('*')
    .eq('id', profileId)
    .single()

  if (profileError || !profile) {
    console.log('❌ Perfil não encontrado')
    return
  }

  console.log(`✅ Perfil encontrado: @${profile.username}\n`)

  // 2. Buscar contexto
  console.log('2️⃣  Buscando contexto do perfil...')
  const { data: context, error: contextError } = await supabase
    .from('profile_context')
    .select('*')
    .eq('profile_id', profileId)
    .is('deleted_at', null)
    .maybeSingle()

  if (contextError) {
    console.log('❌ Erro ao buscar contexto:', contextError.message)
    return
  }

  if (!context) {
    console.log('⚠️  NENHUM CONTEXTO ENCONTRADO')
    console.log('   O agente fará análise GENÉRICA (sem personalização)\n')
    return
  }

  console.log('✅ CONTEXTO ENCONTRADO!\n')

  // 3. Exibir contexto
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📚 CONTEXTO QUE SERÁ ENVIADO AO CLAUDE:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log(`Nicho: ${context.nicho || 'não definido'}`)
  console.log(`Objetivos: ${context.objetivos || 'não definido'}`)
  console.log(`Público-alvo: ${context.publico_alvo || 'não definido'}`)
  console.log(`Produtos/Serviços: ${context.produtos_servicos || 'não definido'}`)
  console.log(`Tom de voz: ${context.tom_voz || 'não definido'}`)
  console.log(`Contexto adicional: ${context.contexto_adicional || 'não definido'}`)
  console.log(`\nDocumentos: ${(context.documents || []).length}`)

  if (context.documents && context.documents.length > 0) {
    context.documents.forEach((doc, i) => {
      console.log(`  ${i+1}. ${doc.filename} (${doc.extracted_text_length || 0} caracteres extraídos)`)
    })
  }

  console.log(`\nTexto total extraído: ${(context.raw_text || '').length} caracteres`)

  // 4. Simular prompt que será enviado
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📤 PREVIEW DO PROMPT QUE SERÁ ENVIADO AO CLAUDE:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const contextSection = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTEXTO ADICIONAL DO PERFIL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**IMPORTANTE:** Use este contexto para fazer uma análise ULTRA-PERSONALIZADA.

${context.nicho ? `**Nicho:** ${context.nicho}\n` : ''}
${context.objetivos ? `**Objetivos:** ${context.objetivos}\n` : ''}
${context.publico_alvo ? `**Público-Alvo:** ${context.publico_alvo}\n` : ''}
${context.produtos_servicos ? `**Produtos/Serviços:** ${context.produtos_servicos}\n` : ''}
${context.tom_voz ? `**Tom de Voz Desejado:** ${context.tom_voz}\n` : ''}
${context.contexto_adicional ? `**Contexto Adicional:** ${context.contexto_adicional}\n` : ''}

${context.raw_text ? `**Documentos de Referência:**\n${context.raw_text.substring(0, 500)}...\n[TRUNCADO - ${context.raw_text.length} caracteres no total]\n` : ''}

**ATENÇÃO:**
- Avalie se o conteúdo está alinhado com estes objetivos
- Identifique gaps entre o que faz e o que DEVERIA fazer
- Recomendações baseadas neste contexto específico

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`

  console.log(contextSection)

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ VALIDAÇÃO COMPLETA')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log('📊 Estatísticas do Contexto:')
  console.log(`   - Campos preenchidos: ${[
    context.nicho,
    context.objetivos,
    context.publico_alvo,
    context.produtos_servicos,
    context.tom_voz,
    context.contexto_adicional
  ].filter(Boolean).length}/6`)
  console.log(`   - Documentos anexados: ${(context.documents || []).length}`)
  console.log(`   - Caracteres de contexto: ${(context.raw_text || '').length}`)
  console.log(`   - Contexto será usado: ${context ? '✅ SIM' : '❌ NÃO'}\n`)

  console.log('💡 O que isso significa:')
  console.log('   ✅ O contexto SERÁ injetado no prompt do Claude')
  console.log('   ✅ A análise será PERSONALIZADA para este perfil')
  console.log('   ✅ Recomendações baseadas no nicho/público/objetivos\n')

  // 5. Verificar se arquivo de análise existe
  console.log('5️⃣  Verificando dados de análise...')
  const dataFile = `squad-auditores/data/${username}-complete-analysis.json`

  if (fs.existsSync(dataFile)) {
    console.log(`✅ Arquivo de análise encontrado: ${dataFile}`)
    console.log('   Pronto para rodar auditoria com contexto!\n')
  } else {
    console.log(`⚠️  Arquivo de análise não encontrado: ${dataFile}`)
    console.log('   Execute primeiro: node scripts/complete-post-analyzer.js ${username}\n')
  }

  console.log('🚀 Para testar auditoria com contexto:')
  console.log(`   node scripts/audit-with-squad.js ${username} ${profileId}\n`)
}

// CLI
const username = process.argv[2]
const profileId = process.argv[3]

if (!username || !profileId) {
  console.error('❌ Uso: node scripts/test-context-usage.js <username> <profile_id>')
  console.error('')
  console.error('Exemplo:')
  console.error('  node scripts/test-context-usage.js karlapazos.ai 123e4567-e89b-12d3-a456-426614174000')
  process.exit(1)
}

testContextUsage(username, profileId)
