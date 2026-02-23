import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'

/**
 * PATCH /api/brand-kits/[id]/set-default
 * Marca um Brand Kit como padrão (is_default = true)
 * Trigger do DB automaticamente desmarca outros kits do mesmo perfil
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: brandKitId } = await params
    const supabase = getServerSupabase()

    // Verificar se brand kit existe
    const { data: existingKit, error: fetchError } = await supabase
      .from('brand_kits')
      .select('id, profile_id, brand_name')
      .eq('id', brandKitId)
      .is('deleted_at', null)
      .single()

    if (fetchError || !existingKit) {
      return NextResponse.json(
        { error: 'Brand Kit not found' },
        { status: 404 }
      )
    }

    // Marcar como padrão (trigger do DB desmarca automaticamente outros)
    const { data: updatedKit, error: updateError } = await supabase
      .from('brand_kits')
      .update({
        is_default: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', brandKitId)
      .select()
      .single()

    if (updateError) {
      console.error('[Brand Kit] Erro ao marcar como padrão:', updateError)
      return NextResponse.json(
        { error: 'Failed to set brand kit as default' },
        { status: 500 }
      )
    }

    console.log(`[Brand Kit ${brandKitId}] Marcado como padrão para profile ${existingKit.profile_id}`)

    return NextResponse.json({
      success: true,
      brand_kit: updatedKit,
    })

  } catch (error: any) {
    console.error('[Brand Kit] Erro ao marcar como padrão:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to set brand kit as default' },
      { status: 500 }
      )
  }
}
