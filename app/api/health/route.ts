/**
 * Health Check API + Environment Diagnostics
 *
 * Usado pelo Render.com/Railway/Docker para verificar se o servidor está rodando
 * Também mostra status das variáveis de ambiente e dependências críticas
 *
 * Acesse: https://seu-app.onrender.com/api/health
 */

import { NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase-server'

export async function GET() {
  const startTime = Date.now()
  const issues: string[] = []

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

  // Verificar Cloudinary
  const cloudinaryOk = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  )

  // Verificar Puppeteer/Chromium
  const puppeteerOk = process.env.PUPPETEER_EXECUTABLE_PATH === '/usr/bin/chromium'

  // Verificar IA APIs
  const aiApisOk = !!(
    process.env.ANTHROPIC_API_KEY &&
    process.env.GOOGLE_AI_API_KEY
  )

  // Adicionar issues se houver problemas
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    issues.push('❌ NEXT_PUBLIC_SUPABASE_URL não configurada')
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    issues.push('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY não configurada')
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    issues.push('⚠️ SUPABASE_SERVICE_ROLE_KEY não configurada')
  }
  if (!cloudinaryOk) {
    issues.push('⚠️ Cloudinary não configurado completamente')
  }
  if (!puppeteerOk) {
    issues.push('⚠️ Puppeteer/Chromium não configurado corretamente')
  }
  if (!aiApisOk) {
    issues.push('⚠️ IA APIs (Anthropic ou Google AI) não configuradas')
  }

  // Teste de conexão Supabase (opcional, apenas se vars configuradas)
  let supabaseConnectionOk = false
  if (publicVarsOk && privateVarsOk) {
    try {
      const supabase = await getServerSupabase()
      const { error } = await supabase
        .from('instagram_profiles')
        .select('id')
        .limit(1)

      supabaseConnectionOk = !error
      if (error) {
        issues.push(`⚠️ Supabase connection error: ${error.message}`)
      }
    } catch (error) {
      issues.push(`❌ Supabase connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Determinar status geral
  const allCriticalOk = publicVarsOk && privateVarsOk && cloudinaryOk && puppeteerOk && aiApisOk
  const status = allCriticalOk && supabaseConnectionOk ? 'ok' : (allCriticalOk ? 'degraded' : 'error')

  return NextResponse.json({
    status,
    timestamp: new Date().toISOString(),
    service: 'Post Express - Croko Lab',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
    responseTime: Date.now() - startTime,

    // Checklist de configuração
    checks: {
      supabase: publicVarsOk && privateVarsOk ? (supabaseConnectionOk ? 'ok' : 'error') : 'not_configured',
      cloudinary: cloudinaryOk ? 'ok' : 'not_configured',
      puppeteer: puppeteerOk ? 'ok' : 'not_configured',
      aiApis: aiApisOk ? 'ok' : 'not_configured',
      uazapi: !!(process.env.UAZAPI_INSTANCE_ID && process.env.UAZAPI_TOKEN) ? 'ok' : 'not_configured',
      apify: !!process.env.APIFY_API_TOKEN ? 'ok' : 'not_configured',
      googleDrive: !!(process.env.GOOGLE_DRIVE_CLIENT_EMAIL && process.env.GOOGLE_DRIVE_PRIVATE_KEY) ? 'ok' : 'not_configured',
    },

    // Diagnóstico de variáveis (sem expor valores)
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
      hasMistralKey: !!process.env.MISTRAL_API_KEY,
      hasApifyToken: !!process.env.APIFY_API_TOKEN,
      hasUAZapiConfig: !!(process.env.UAZAPI_INSTANCE_ID && process.env.UAZAPI_TOKEN),
      hasCloudinaryConfig: cloudinaryOk,
      puppeteerPath: process.env.PUPPETEER_EXECUTABLE_PATH || '❌ NOT_SET',
    },

    // Problemas encontrados
    issues: issues.length > 0 ? issues : null,

    // Mensagem de ajuda
    message:
      status === 'ok'
        ? '✅ Todas as dependências estão configuradas e funcionando'
        : status === 'degraded'
        ? '⚠️ Sistema operacional mas com algumas dependências não configuradas'
        : '❌ Variáveis de ambiente críticas não configuradas. Veja "issues" para detalhes.',
  }, { status: status === 'ok' ? 200 : (status === 'degraded' ? 200 : 503) })
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
