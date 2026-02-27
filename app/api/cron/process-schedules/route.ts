import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { generateWithSquad } from '@/lib/content-squad-generator'

/**
 * CRON Worker - Processa agendamentos de geração de conteúdo
 *
 * IMPORTANTE: Configurar no Vercel (vercel.json)
 * Roda a cada 5 minutos
 *
 * Ou executar manualmente via:
 * curl -X POST https://seu-dominio.vercel.app/api/cron/process-schedules
 *   -H "Authorization: Bearer SEU_CRON_SECRET"
 */

// Validar que é uma chamada autorizada (Vercel Cron ou manual com secret)
function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET || 'dev-secret-change-in-production'

  // Vercel Cron envia header especial
  if (req.headers.get('x-vercel-cron')) {
    return true
  }

  // Manual com Bearer token
  if (authHeader === `Bearer ${cronSecret}`) {
    return true
  }

  return false
}

export async function POST(req: NextRequest) {
  try {
    // Validar autorização
    if (!isAuthorized(req)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = getServerSupabase()
    const now = new Date().toISOString()

    console.log('🔄 Iniciando processamento de agendamentos...', { now })

    // Buscar agendamentos pendentes que já passaram da hora
    const { data: schedules, error: fetchError } = await supabase
      .from('content_generation_schedules')
      .select(`
        *,
        instagram_profiles:profile_id (id, username, full_name),
        audits:audit_id (id, profile_id, score_overall)
      `)
      .eq('status', 'pending')
      .lte('scheduled_at', now)
      .lt('attempts', 3) // Máximo 3 tentativas
      .order('scheduled_at', { ascending: true })
      .limit(10) // Processar no máximo 10 por vez

    if (fetchError) {
      console.error('❌ Erro ao buscar agendamentos:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!schedules || schedules.length === 0) {
      console.log('✅ Nenhum agendamento pendente para processar')
      return NextResponse.json({
        message: 'Nenhum agendamento pendente',
        processed: 0,
      })
    }

    console.log(`📋 Encontrados ${schedules.length} agendamentos para processar`)

    const results = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: [] as string[],
    }

    // Processar cada agendamento
    for (const schedule of schedules) {
      results.processed++

      try {
        console.log(`🎯 Processando agendamento ${schedule.id}...`)

        // Marcar como processando
        await supabase
          .from('content_generation_schedules')
          .update({
            status: 'processing',
            processing_started_at: new Date().toISOString(),
            attempts: schedule.attempts + 1,
          })
          .eq('id', schedule.id)

        // Gerar conteúdo via Content Creation Squad
        const contentJson = await generateWithSquad({
          audit: schedule.audits,
          profile: schedule.instagram_profiles,
          quantity: schedule.quantity,
          customTheme: schedule.custom_theme,
        })

        // Salvar conteúdo no banco
        const { data: contentSuggestion, error: saveError } = await supabase
          .from('content_suggestions')
          .insert({
            audit_id: schedule.audit_id,
            profile_id: schedule.profile_id,
            content_json: contentJson,
            created_by_schedule: true,
          })
          .select()
          .single()

        if (saveError) throw saveError

        // Marcar agendamento como concluído
        await supabase
          .from('content_generation_schedules')
          .update({
            status: 'completed',
            content_suggestion_id: contentSuggestion.id,
            processing_completed_at: new Date().toISOString(),
          })
          .eq('id', schedule.id)

        results.succeeded++
        console.log(`✅ Agendamento ${schedule.id} processado com sucesso`)
      } catch (err: any) {
        console.error(`❌ Erro ao processar agendamento ${schedule.id}:`, err)

        // Marcar como falho se excedeu tentativas
        const newStatus = schedule.attempts + 1 >= 3 ? 'failed' : 'pending'

        await supabase
          .from('content_generation_schedules')
          .update({
            status: newStatus,
            error_message: err.message || String(err),
            processing_completed_at: new Date().toISOString(),
          })
          .eq('id', schedule.id)

        results.failed++
        results.errors.push(`${schedule.id}: ${err.message}`)
      }
    }

    console.log('✅ Processamento concluído:', results)

    return NextResponse.json({
      message: 'Processamento concluído',
      ...results,
    })
  } catch (err: any) {
    console.error('❌ Erro geral no worker:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

/**
 * NOTA: generateContent() foi substituído por generateWithSquad()
 * em /lib/content-squad-generator.ts
 *
 * O novo sistema usa o Content Creation Squad completo com:
 * - 6 Mentes Milionárias (Schwartz, Godin, Hormozi, Finch, De Marqui, Vaynerchuk)
 * - 4 Fórmulas comprovadas de carrossel
 * - Workflows de batch production
 * - Checklist de qualidade
 * - Templates profissionais
 */

// Permitir GET para teste manual (apenas em dev)
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
  }

  return POST(req)
}
