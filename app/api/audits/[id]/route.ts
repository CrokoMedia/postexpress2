import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getServerSupabase()
    const { id } = await params

    // Verificar se a auditoria existe
    const { data: audit, error: fetchError } = await supabase
      .from('audits')
      .select('id, profile_id')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (fetchError || !audit) {
      return NextResponse.json(
        { error: 'Auditoria não encontrada' },
        { status: 404 }
      )
    }

    // Soft delete
    const { error } = await supabase
      .from('audits')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ message: 'Auditoria excluída com sucesso', audit_id: id })
  } catch (error: any) {
    console.error('Error deleting audit:', error)
    return NextResponse.json(
      { error: error.message || 'Falha ao excluir auditoria' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getServerSupabase()
    const { id } = await params

    // Buscar auditoria completa com perfil e posts
    const { data: audit, error } = await supabase
      .from('audits')
      .select(`
        *,
        profile:profiles(*),
        posts:posts(*)
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error) throw error
    if (!audit) {
      return NextResponse.json(
        { error: 'Audit not found' },
        { status: 404 }
      )
    }

    // Ordenar posts por timestamp (mais recente primeiro)
    const sortedPosts = audit.posts
      ?.filter((p: any) => !p.deleted_at)
      ?.sort((a: any, b: any) => {
        if (!a.post_timestamp) return 1
        if (!b.post_timestamp) return -1
        return new Date(b.post_timestamp).getTime() - new Date(a.post_timestamp).getTime()
      }) || []

    return NextResponse.json({
      audit: {
        ...audit,
        posts: sortedPosts
      }
    })
  } catch (error: any) {
    console.error('Error fetching audit:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch audit' },
      { status: 500 }
    )
  }
}
