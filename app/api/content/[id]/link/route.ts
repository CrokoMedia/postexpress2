import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'

/**
 * POST /api/content/[id]/link
 * Vincula um conteúdo a outro perfil
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getServerSupabase()
    const { id: contentId } = await params
    const body = await request.json()

    const {
      profile_id,
      link_type = 'shared',
      notes = null
    } = body

    // Validação
    if (!profile_id) {
      return NextResponse.json(
        { error: 'profile_id is required' },
        { status: 400 }
      )
    }

    // Verificar se conteúdo existe
    const { data: content, error: contentError } = await supabase
      .from('content_suggestions')
      .select('id, profile_id, content_json')
      .eq('id', contentId)
      .single()

    if (contentError || !content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      )
    }

    // Verificar se perfil destino existe
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('id', profile_id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Verificar se já não está vinculado
    const { data: existingLink } = await supabase
      .from('content_profile_links')
      .select('id, deleted_at')
      .eq('content_id', contentId)
      .eq('profile_id', profile_id)
      .maybeSingle()

    // Se já existe e não foi deletado
    if (existingLink && !existingLink.deleted_at) {
      return NextResponse.json(
        { error: 'Content already linked to this profile' },
        { status: 409 }
      )
    }

    // Criar vinculação (ou restaurar se foi deletada)
    const { data: link, error: linkError } = await supabase
      .from('content_profile_links')
      .upsert({
        content_id: contentId,
        profile_id: profile_id,
        link_type,
        notes,
        deleted_at: null, // Restaura se estava deletado
        linked_at: new Date().toISOString()
      }, {
        onConflict: 'content_id,profile_id'
      })
      .select()
      .single()

    if (linkError) throw linkError

    return NextResponse.json({
      success: true,
      link,
      message: `Conteúdo vinculado a @${profile.username} com sucesso!`
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error linking content:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to link content' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/content/[id]/link
 * Remove vínculo de um conteúdo com um perfil
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getServerSupabase()
    const { id: contentId } = await params
    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get('profile_id')

    if (!profileId) {
      return NextResponse.json(
        { error: 'profile_id query param is required' },
        { status: 400 }
      )
    }

    // Soft delete do vínculo
    const { error } = await supabase
      .from('content_profile_links')
      .update({ deleted_at: new Date().toISOString() })
      .eq('content_id', contentId)
      .eq('profile_id', profileId)
      .is('deleted_at', null)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Vínculo removido com sucesso'
    })

  } catch (error: any) {
    console.error('Error unlinking content:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to unlink content' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/content/[id]/link
 * Lista todos os perfis vinculados a um conteúdo
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getServerSupabase()
    const { id: contentId } = await params

    // Buscar todos os vínculos ativos
    const { data: links, error } = await supabase
      .from('content_profile_links')
      .select(`
        id,
        link_type,
        linked_at,
        notes,
        profile:profiles (
          id,
          username,
          full_name,
          profile_pic_url_hd
        )
      `)
      .eq('content_id', contentId)
      .is('deleted_at', null)
      .order('linked_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      content_id: contentId,
      linked_profiles: links || [],
      total: links?.length || 0
    })

  } catch (error: any) {
    console.error('Error fetching linked profiles:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch linked profiles' },
      { status: 500 }
    )
  }
}
