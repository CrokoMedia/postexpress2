/**
 * Health Check API + Environment Diagnostics
 *
 * Usado pelo Railway/Docker para verificar se o servidor está rodando
 * Também mostra status das variáveis de ambiente
 *
 * Acesse: https://seu-app.railway.app/api/health
 */

import { NextResponse } from 'next/server'

export async function GET() {
  // Verificar variáveis públicas (cliente)
  const publicVarsOk = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  // Verificar variáveis privadas (servidor)
  const privateVarsOk = !!(
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const issues: string[] = []

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    issues.push('❌ NEXT_PUBLIC_SUPABASE_URL não configurada')
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    issues.push('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY não configurada')
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    issues.push('⚠️ SUPABASE_SERVICE_ROLE_KEY não configurada')
  }

  const status = publicVarsOk && privateVarsOk ? 'ok' : 'error'

  return NextResponse.json({
    status,
    timestamp: new Date().toISOString(),
    service: 'postexpress2',
    environment: process.env.NODE_ENV,

    // Diagnóstico de variáveis
    env: {
      // Público (cliente) - seguro mostrar preview
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30)}...`
        : '❌ NOT_SET',
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...`
        : '❌ NOT_SET',

      // Privado (servidor) - só mostrar se existe
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
      hasGoogleAiKey: !!process.env.GOOGLE_AI_API_KEY,
      hasApifyToken: !!process.env.APIFY_API_TOKEN,
      hasCloudinary: !!(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
      ),
    },

    // Checklist de configuração
    checks: {
      publicVarsConfigured: publicVarsOk,
      privateVarsConfigured: privateVarsOk,
      allCriticalVarsOk: publicVarsOk && privateVarsOk,
    },

    // Problemas encontrados
    issues: issues.length > 0 ? issues : null,

    // Mensagem de ajuda
    message:
      status === 'ok'
        ? '✅ Todas as variáveis críticas estão configuradas'
        : '❌ Variáveis de ambiente críticas não configuradas. Veja "issues" para detalhes.',
  }, { status: status === 'ok' ? 200 : 500 })
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
