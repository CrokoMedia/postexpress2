import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import fs from 'fs/promises'
import path from 'path'

/**
 * GET /api/debug/audit-prompt/[id]
 *
 * Retorna o prompt COMPLETO que seria enviado ao Claude
 * sem executar a análise (para debug/validação)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getServerSupabase()
    const { id: auditId } = await params

    // Buscar audit
    const { data: audit, error: auditError } = await supabase
      .from('audits')
      .select('*, profiles(*)')
      .eq('id', auditId)
      .single()

    if (auditError || !audit) {
      return NextResponse.json(
        { error: 'Audit not found' },
        { status: 404 }
      )
    }

    const profile = audit.profiles
    const username = profile.username

    // Buscar contexto do perfil
    const { data: context } = await supabase
      .from('profile_context')
      .select('*')
      .eq('profile_id', profile.id)
      .is('deleted_at', null)
      .maybeSingle()

    // Ler dados da análise completa (se existir)
    const dataFilePath = path.join(
      process.cwd(),
      'squad-auditores/data',
      `${username}-complete-analysis.json`
    )

    let analysisDataExists = false
    let analysisPreview = null

    try {
      const analysisData = await fs.readFile(dataFilePath, 'utf-8')
      const parsed = JSON.parse(analysisData)
      analysisDataExists = true
      analysisPreview = {
        username: parsed.username,
        posts_count: parsed.posts?.length || 0,
        metrics: parsed.metrics
      }
    } catch (error) {
      // Arquivo não existe ainda
    }

    // Construir prompt (igual ao do audit-with-squad.js)
    let promptPreview = `[INÍCIO DO PROMPT]\n\n`
    promptPreview += `Você é o líder de um squad de 5 auditores especialistas...\n\n`

    if (context) {
      promptPreview += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
      promptPreview += `CONTEXTO ADICIONAL DO PERFIL\n`
      promptPreview += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
      promptPreview += `**IMPORTANTE:** Use este contexto para fazer uma análise ULTRA-PERSONALIZADA.\n\n`

      if (context.nicho) promptPreview += `**Nicho:** ${context.nicho}\n`
      if (context.objetivos) promptPreview += `**Objetivos:** ${context.objetivos}\n`
      if (context.publico_alvo) promptPreview += `**Público-Alvo:** ${context.publico_alvo}\n`
      if (context.produtos_servicos) promptPreview += `**Produtos/Serviços:** ${context.produtos_servicos}\n`
      if (context.tom_voz) promptPreview += `**Tom de Voz Desejado:** ${context.tom_voz}\n`
      if (context.contexto_adicional) promptPreview += `**Contexto Adicional:** ${context.contexto_adicional}\n`

      if (context.raw_text) {
        promptPreview += `\n**Documentos de Referência:**\n`
        promptPreview += `${context.raw_text.substring(0, 500)}...\n`
        promptPreview += `[TRUNCADO - ${context.raw_text.length} caracteres no total]\n`
      }

      promptPreview += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
    }

    promptPreview += `**DADOS DO INSTAGRAM:**\n`
    promptPreview += `\`\`\`json\n${JSON.stringify(analysisPreview, null, 2)}\n\`\`\`\n\n`
    promptPreview += `[FIM DO PROMPT]`

    return NextResponse.json({
      audit_id: auditId,
      profile: {
        id: profile.id,
        username: profile.username
      },
      has_context: !!context,
      context_summary: context ? {
        nicho: context.nicho || null,
        objetivos: context.objetivos || null,
        publico_alvo: context.publico_alvo || null,
        produtos_servicos: context.produtos_servicos || null,
        tom_voz: context.tom_voz || null,
        documents_count: (context.documents || []).length,
        raw_text_length: (context.raw_text || '').length
      } : null,
      analysis_data_exists: analysisDataExists,
      prompt_preview: promptPreview,
      warning: !context ? 'Nenhum contexto encontrado - análise será genérica' : null
    })

  } catch (error: any) {
    console.error('Error generating debug prompt:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate debug prompt' },
      { status: 500 }
    )
  }
}
