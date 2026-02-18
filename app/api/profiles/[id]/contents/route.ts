import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'

/**
 * GET - Buscar todos os conteúdos gerados para um perfil
 * Inclui: conteúdos originais + conteúdos vinculados de outros perfis
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = getServerSupabase()

    // 1. Buscar conteúdos vinculados a este perfil via content_profile_links
    const { data: linkedContent, error: linkError } = await supabase
      .from('content_profile_links')
      .select(`
        id,
        link_type,
        linked_at,
        notes,
        content:content_suggestions (
          id,
          content_json,
          slides_json,
          generated_at,
          profile_id,
          original_profile:profiles!content_suggestions_profile_id_fkey (
            id,
            username,
            full_name
          ),
          audit:audits (
            id,
            audit_date,
            score_overall,
            classification,
            posts_analyzed
          )
        )
      `)
      .eq('profile_id', id)
      .is('deleted_at', null)
      .order('linked_at', { ascending: false })

    if (linkError) throw linkError

    // Formatar dados para estrutura consistente
    // Filtrar conteúdos onde a auditoria foi deletada (soft delete) ou está ausente
    const formattedContents = (linkedContent || [])
      .filter((link: any) => {
        const audit = link.content?.audit
        // Supabase pode retornar audit como array (relação ambígua) ou objeto
        if (Array.isArray(audit)) return audit.length > 0 && audit[0]?.id
        return audit?.id
      })
      .map((link: any) => {
        const rawAudit = link.content.audit
        const audit = Array.isArray(rawAudit) ? rawAudit[0] : rawAudit
        return {
          id: link.content.id,
          content_json: link.content.content_json,
          slides_json: link.content.slides_json,
          generated_at: link.content.generated_at,
          audit,
          // Metadados de vinculação
          link_type: link.link_type,
          linked_at: link.linked_at,
          link_notes: link.notes,
          is_original: link.content.profile_id === id,
          original_profile: link.content.original_profile
        }
      })

    return NextResponse.json({
      contents: formattedContents,
      total: formattedContents.length,
      breakdown: {
        original: formattedContents.filter((c: any) => c.is_original).length,
        shared: formattedContents.filter((c: any) => !c.is_original).length
      }
    })

  } catch (error: any) {
    console.error('Erro ao buscar conteúdos do perfil:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar conteúdos', details: error.message },
      { status: 500 }
    )
  }
}
