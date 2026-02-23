import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'
import { detectGender, type Gender } from '@/lib/gender-detector'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getServerSupabase()
    const { id } = await params

    // Buscar perfil com todas as auditorias
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        *,
        audits:audits(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Ordenar auditorias por data (mais recente primeira)
    const sortedAudits = profile.audits
      ?.filter((a: any) => !a.deleted_at)
      ?.sort((a: any, b: any) =>
        new Date(b.audit_date).getTime() - new Date(a.audit_date).getTime()
      ) || []

    return NextResponse.json({
      profile: {
        ...profile,
        audits: sortedAudits
      }
    })
  } catch (error: any) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(request)
  if (authResult instanceof NextResponse) return authResult

  try {
    const supabase = getServerSupabase()
    const { id } = await params
    const body = await request.json()

    // Campos permitidos para atualização
    const allowedFields = ['gender', 'full_name', 'biography']
    const updates: any = {}

    // Filtrar apenas campos permitidos
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field]
      }
    }

    // Se o gênero foi definido manualmente, marcar como não-auto-detectado
    if ('gender' in updates) {
      updates.gender_auto_detected = false
      updates.gender_confidence = 1.0 // 100% de confiança (manual)
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Atualizar perfil
    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update error:', error)
      return NextResponse.json(
        { error: `Failed to update profile: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile
    })

  } catch (error: any) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(request)
  if (authResult instanceof NextResponse) return authResult

  try {
    const supabase = getServerSupabase()
    const { id } = await params

    // Verificar se perfil existe
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('id', id)
      .single()

    if (fetchError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Hard delete: apagar fisicamente (CASCADE vai deletar audits, posts, comments, etc.)
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json(
        { error: `Failed to delete profile: ${deleteError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: `Profile @${profile.username} deleted successfully`,
      profile_id: id
    })

  } catch (error: any) {
    console.error('Error deleting profile:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete profile' },
      { status: 500 }
    )
  }
}
