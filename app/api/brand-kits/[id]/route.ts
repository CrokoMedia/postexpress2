import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { v2 as cloudinary } from 'cloudinary'
import type { BrandKit, UpdateBrandKitPayload } from '@/types/database'

// ============================================
// Configurar Cloudinary
// ============================================

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// ============================================
// VALIDATION HELPERS
// ============================================

function isValidHexColor(color: string | null | undefined): boolean {
  if (!color) return true
  return /^#[0-9A-Fa-f]{6}$/.test(color)
}

function validateUpdatePayload(payload: any): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // brand_name (se fornecido, deve ser válido)
  if (payload.brand_name !== undefined) {
    if (typeof payload.brand_name !== 'string') {
      errors.push('brand_name deve ser uma string')
    } else if (payload.brand_name.trim().length === 0) {
      errors.push('brand_name não pode ser vazio')
    } else if (payload.brand_name.length > 100) {
      errors.push('brand_name não pode ter mais de 100 caracteres')
    }
  }

  // Validar cores (formato HEX)
  const colorFields = [
    'primary_color',
    'secondary_color',
    'accent_color',
    'background_color',
    'text_color',
  ]

  for (const field of colorFields) {
    const color = payload[field]
    if (color !== undefined && color !== null && !isValidHexColor(color)) {
      errors.push(`${field} deve estar no formato HEX (#RRGGBB). Exemplo: #FF5733`)
    }
  }

  // Validar tone_of_voice (se fornecido, deve ser objeto)
  if (payload.tone_of_voice !== undefined && payload.tone_of_voice !== null) {
    if (typeof payload.tone_of_voice !== 'object') {
      errors.push('tone_of_voice deve ser um objeto')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// ============================================
// GET /api/brand-kits/[id] - Buscar kit específico
// ============================================

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getServerSupabase()
    const params = await context.params
    const kitId = params.id

    // Buscar brand kit por ID (não deletado)
    const { data: brandKit, error: fetchError } = await supabase
      .from('brand_kits')
      .select('*')
      .eq('id', kitId)
      .is('deleted_at', null)
      .single()

    if (fetchError || !brandKit) {
      return NextResponse.json(
        {
          success: false,
          error: 'Brand kit não encontrado',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      brand_kit: brandKit,
    })
  } catch (error: any) {
    console.error('Erro ao buscar brand kit:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno ao buscar brand kit',
        details: error?.message || 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}

// ============================================
// PATCH /api/brand-kits/[id] - Atualizar kit
// ============================================

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getServerSupabase()
    const params = await context.params
    const kitId = params.id

    // Parse request body
    const payload: UpdateBrandKitPayload = await request.json()

    // Validar payload
    const validation = validateUpdatePayload(payload)
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados inválidos',
          details: validation.errors,
        },
        { status: 400 }
      )
    }

    // Verificar se kit existe
    const { data: existingKit, error: fetchError } = await supabase
      .from('brand_kits')
      .select('*')
      .eq('id', kitId)
      .is('deleted_at', null)
      .single()

    if (fetchError || !existingKit) {
      return NextResponse.json(
        {
          success: false,
          error: 'Brand kit não encontrado',
        },
        { status: 404 }
      )
    }

    // Atualizar apenas campos fornecidos
    const updateData: any = {}

    if (payload.brand_name !== undefined) updateData.brand_name = payload.brand_name
    if (payload.is_default !== undefined) updateData.is_default = payload.is_default
    if (payload.primary_color !== undefined) updateData.primary_color = payload.primary_color
    if (payload.secondary_color !== undefined) updateData.secondary_color = payload.secondary_color
    if (payload.accent_color !== undefined) updateData.accent_color = payload.accent_color
    if (payload.background_color !== undefined) updateData.background_color = payload.background_color
    if (payload.text_color !== undefined) updateData.text_color = payload.text_color
    if (payload.primary_font !== undefined) updateData.primary_font = payload.primary_font
    if (payload.secondary_font !== undefined) updateData.secondary_font = payload.secondary_font
    if (payload.tone_of_voice !== undefined) updateData.tone_of_voice = payload.tone_of_voice

    // Atualizar no banco
    const { data: updatedKit, error: updateError } = await supabase
      .from('brand_kits')
      .update(updateData)
      .eq('id', kitId)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar brand kit:', updateError)
      return NextResponse.json(
        {
          success: false,
          error: 'Erro ao atualizar brand kit',
          details: updateError.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      brand_kit: updatedKit,
    })
  } catch (error: any) {
    console.error('Erro ao atualizar brand kit:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno ao atualizar brand kit',
        details: error?.message || 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}

// ============================================
// DELETE /api/brand-kits/[id] - Soft delete
// ============================================

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getServerSupabase()
    const params = await context.params
    const kitId = params.id

    // Buscar brand kit
    const { data: brandKit, error: fetchError } = await supabase
      .from('brand_kits')
      .select('*')
      .eq('id', kitId)
      .is('deleted_at', null)
      .single()

    if (fetchError || !brandKit) {
      return NextResponse.json(
        {
          success: false,
          error: 'Brand kit não encontrado',
        },
        { status: 404 }
      )
    }

    // Verificar se é o último kit do perfil
    const { data: allKits, error: countError } = await supabase
      .from('brand_kits')
      .select('id')
      .eq('profile_id', brandKit.profile_id)
      .is('deleted_at', null)

    if (countError) {
      console.error('Erro ao contar kits:', countError)
      return NextResponse.json(
        {
          success: false,
          error: 'Erro ao verificar kits do perfil',
        },
        { status: 500 }
      )
    }

    // Impedir delete do último kit
    if (allKits && allKits.length <= 1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Não é possível deletar o último brand kit do perfil',
        },
        { status: 409 }
      )
    }

    // Se tem logo, deletar do Cloudinary
    if (brandKit.logo_public_id) {
      try {
        await cloudinary.uploader.destroy(brandKit.logo_public_id, {
          resource_type: 'image',
        })
        console.log(`Logo deletado do Cloudinary: ${brandKit.logo_public_id}`)
      } catch (cloudinaryError: any) {
        console.error('Erro ao deletar logo do Cloudinary:', cloudinaryError)
        // Não bloquear delete se Cloudinary falhar
      }
    }

    // Soft delete
    const { error: deleteError } = await supabase
      .from('brand_kits')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', kitId)

    if (deleteError) {
      console.error('Erro ao deletar brand kit:', deleteError)
      return NextResponse.json(
        {
          success: false,
          error: 'Erro ao deletar brand kit',
          details: deleteError.message,
        },
        { status: 500 }
      )
    }

    // Se era o kit padrão, trigger do DB auto-promove outro
    // Nada a fazer aqui

    return NextResponse.json({
      success: true,
      message: 'Brand kit deletado com sucesso',
    })
  } catch (error: any) {
    console.error('Erro ao deletar brand kit:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno ao deletar brand kit',
        details: error?.message || 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
