import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

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

    // Soft delete: marcar deleted_at
    const { error: deleteError } = await supabase
      .from('profiles')
      .update({ deleted_at: new Date().toISOString() })
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
