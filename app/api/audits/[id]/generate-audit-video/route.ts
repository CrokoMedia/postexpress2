import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { getRemotionBundle } from '@/lib/remotion-bundle'
import { renderMedia, selectComposition } from '@remotion/renderer'
import cloudinary from 'cloudinary'
import path from 'path'
import fs from 'fs'

// Permitir ate 5 minutos para renderizacao do video
export const maxDuration = 300

// Configuracao Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Bundle management moved to @/lib/remotion-bundle

/**
 * Extrai os top 3 insights do raw_json da auditoria.
 * Tenta diferentes campos na estrutura do JSON.
 */
function extractInsights(audit: Record<string, unknown>): string[] {
  const rawJson = audit.raw_json as Record<string, unknown> | null
  const insights: string[] = []

  // Tentar top_strengths primeiro (campo mais comum)
  const topStrengths = (rawJson?.top_strengths ?? audit.top_strengths) as Array<Record<string, unknown>> | null
  if (Array.isArray(topStrengths) && topStrengths.length > 0) {
    for (const strength of topStrengths.slice(0, 2)) {
      const text = (strength.title as string) || (strength.description as string) || ''
      if (text) insights.push(text)
    }
  }

  // Adicionar quick_wins se necessario
  const quickWins = (rawJson?.quick_wins ?? audit.quick_wins) as Array<Record<string, unknown> | string> | null
  if (Array.isArray(quickWins) && insights.length < 3) {
    for (const win of quickWins.slice(0, 3 - insights.length)) {
      const text = typeof win === 'string' ? win : ((win as Record<string, unknown>).title as string) || ((win as Record<string, unknown>).description as string) || ''
      if (text) insights.push(text)
    }
  }

  // Adicionar critical_problems se necessario
  const problems = (rawJson?.critical_problems ?? audit.critical_problems) as Array<Record<string, unknown>> | null
  if (Array.isArray(problems) && insights.length < 3) {
    for (const problem of problems.slice(0, 3 - insights.length)) {
      const title = (problem.title as string) || (problem.description as string) || ''
      if (title) insights.push(`Atenção: ${title}`)
    }
  }

  // Fallback: insights genericos baseados nos scores
  if (insights.length === 0) {
    const overallScore = audit.score_overall as number | null
    if (overallScore !== null && overallScore !== undefined) {
      if (overallScore >= 75) {
        insights.push('Perfil com excelente performance geral')
      } else if (overallScore >= 50) {
        insights.push('Perfil com boa base, oportunidades de melhoria')
      } else {
        insights.push('Perfil com grande potencial de crescimento')
      }
    }
    insights.push('Analise baseada em 5 frameworks cientificos')
    insights.push('Kahneman, Schwartz, Hormozi, Cagan e Paul Graham')
  }

  return insights.slice(0, 3)
}

/**
 * POST - Gera video animado (MP4) com o resultado da auditoria usando Remotion
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = getServerSupabase()

    // 1. Buscar dados da auditoria com perfil
    const { data: audit, error: auditError } = await supabase
      .from('audits')
      .select(`
        *,
        profile:instagram_profiles(*)
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (auditError || !audit) {
      return NextResponse.json(
        { error: 'Auditoria não encontrada' },
        { status: 404 }
      )
    }

    const profile = audit.profile as Record<string, unknown>
    const username = (profile?.username as string) || 'perfil'
    const profileImageUrl =
      (profile?.profile_pic_cloudinary_url as string) ||
      (profile?.profile_pic_url_hd as string) ||
      ''

    // 2. Montar scores
    const scores = {
      behavior: (audit.score_behavior as number) || 0,
      copy: (audit.score_copy as number) || 0,
      offers: (audit.score_offers as number) || 0,
      metrics: (audit.score_metrics as number) || 0,
      anomalies: (audit.score_anomalies as number) || 0,
      overall: (audit.score_overall as number) || 0,
    }

    // 3. Extrair insights
    const insights = extractInsights(audit as Record<string, unknown>)

    console.log(`Gerando video de auditoria para @${username} (score: ${scores.overall})...`)

    // 4. Montar props do Remotion
    const inputProps = {
      username,
      profileImageUrl,
      scores,
      insights,
    }

    // 5. Bundle Remotion (cached)
    const bundleLocation = await getRemotionBundle()

    // 6. Selecionar composicao
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'AuditResult',
      inputProps,
    })

    console.log(
      `Composicao: ${composition.durationInFrames} frames (${(composition.durationInFrames / 30).toFixed(1)}s)`
    )

    // 7. Renderizar MP4 em /tmp
    const tempDir = path.join('/tmp', 'audit-videos', id)
    fs.mkdirSync(tempDir, { recursive: true })
    const outputPath = path.join(tempDir, `audit-${username}.mp4`)

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps,
      onProgress: ({ progress }) => {
        if (Math.round(progress * 100) % 25 === 0) {
          console.log(`Rendering audit video: ${Math.round(progress * 100)}%`)
        }
      },
    })

    console.log(`Video renderizado: ${outputPath}`)

    // 8. Upload para Cloudinary
    const uploadResult = await cloudinary.v2.uploader.upload(outputPath, {
      folder: `audit-videos/${id}`,
      public_id: `audit-${username}`,
      resource_type: 'video',
      overwrite: true,
    })

    console.log(`Upload Cloudinary: ${uploadResult.secure_url}`)

    // 9. Limpar arquivo temporario
    try {
      fs.unlinkSync(outputPath)
      fs.rmdirSync(tempDir)
    } catch {
      // Diretorio pode nao estar vazio ou ja removido
    }

    // 10. Salvar URL no Supabase (campo audit_video_url no raw_json)
    const existingRawJson = (audit.raw_json as Record<string, unknown>) || {}
    const updatedRawJson = {
      ...existingRawJson,
      audit_video_url: uploadResult.secure_url,
      audit_video_generated_at: new Date().toISOString(),
    }

    await supabase
      .from('audits')
      .update({ raw_json: updatedRawJson })
      .eq('id', id)

    console.log(`Video de auditoria gerado com sucesso para @${username}`)

    return NextResponse.json({
      success: true,
      videoUrl: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id,
      duration: composition.durationInFrames / 30,
      scores,
      insights,
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    console.error('Erro ao gerar video de auditoria:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar video de auditoria', details: errorMessage },
      { status: 500 }
    )
  }
}
