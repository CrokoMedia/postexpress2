import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { detectGender } from '@/lib/gender-detector'

/**
 * POST /api/profiles/[id]/detect-gender
 * Detecta automaticamente o gênero de um perfil
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getServerSupabase()
    const { id } = await params

    // Buscar perfil
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('id, username, full_name, biography')
      .eq('id', id)
      .single()

    if (fetchError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Detectar gênero
    const detection = await detectGender(
      profile.full_name,
      profile.biography,
      profile.username
    )

    // Atualizar perfil com detecção
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        gender: detection.gender,
        gender_auto_detected: true,
        gender_confidence: detection.confidence
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: `Failed to update profile: ${updateError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Gender detected successfully',
      profile: updatedProfile,
      detection: {
        gender: detection.gender,
        confidence: detection.confidence,
        reasoning: detection.reasoning
      }
    })

  } catch (error: any) {
    console.error('Error detecting gender:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to detect gender' },
      { status: 500 }
    )
  }
}
