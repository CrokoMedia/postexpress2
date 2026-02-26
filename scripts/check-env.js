#!/usr/bin/env node

/**
 * Script de diagnóstico de variáveis de ambiente
 *
 * Uso:
 *   node scripts/check-env.js
 *
 * Verifica se todas as variáveis críticas estão configuradas
 */

const requiredVars = {
  'Supabase (Cliente - OBRIGATÓRIO)': [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ],
  'Supabase (Servidor - OBRIGATÓRIO)': [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ],
  'APIs de IA (OBRIGATÓRIO)': [
    'ANTHROPIC_API_KEY',
    'GOOGLE_AI_API_KEY',
  ],
  'Scraping (OBRIGATÓRIO)': [
    'APIFY_API_TOKEN',
  ],
  'Cloudinary (OBRIGATÓRIO)': [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
  ],
  'WhatsApp (OPCIONAL)': [
    'UAZAPI_INSTANCE_ID',
    'UAZAPI_TOKEN',
    'UAZAPI_WEBHOOK_URL',
  ],
  'Google Drive (OPCIONAL)': [
    'GOOGLE_DRIVE_CLIENT_EMAIL',
    'GOOGLE_DRIVE_PRIVATE_KEY',
    'GOOGLE_DRIVE_FOLDER_ID',
  ],
}

console.log('\n🔍 Verificando variáveis de ambiente...\n')

let hasErrors = false
let hasWarnings = false

for (const [category, vars] of Object.entries(requiredVars)) {
  const isOptional = category.includes('OPCIONAL')
  console.log(`\n📦 ${category}`)

  for (const varName of vars) {
    const value = process.env[varName]
    const isDefined = !!value

    if (!isDefined) {
      if (isOptional) {
        console.log(`   ⚠️  ${varName}: não configurada (opcional)`)
        hasWarnings = true
      } else {
        console.log(`   ❌ ${varName}: FALTANDO (obrigatório)`)
        hasErrors = true
      }
    } else {
      const preview = value.length > 20
        ? `${value.substring(0, 20)}...`
        : value
      console.log(`   ✅ ${varName}: ${preview}`)
    }
  }
}

console.log('\n' + '='.repeat(60))

if (hasErrors) {
  console.log('\n❌ ERRO: Variáveis obrigatórias não configuradas!')
  console.log('\nSiga as instruções em RAILWAY-ENV-SETUP.md para configurar.')
  process.exit(1)
}

if (hasWarnings) {
  console.log('\n⚠️  ATENÇÃO: Algumas features opcionais não estão disponíveis.')
  console.log('   (WhatsApp, Google Drive)')
}

console.log('\n✅ Todas as variáveis obrigatórias estão configuradas!\n')
process.exit(0)
