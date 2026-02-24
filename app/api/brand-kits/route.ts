import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'

// ============================================
// TYPES (temporários até Task #2 finalizar)
// ============================================

interface ToneOfVoice {
  characteristics?: string[]
  examples?: string[]
  avoid?: string[]
}

interface CreateBrandKitPayload {
  profile_id: string
  brand_name: string
  primary_color?: string | null
  secondary_color?: string | null
  accent_color?: string | null
  background_color?: string | null
  text_color?: string | null
  logo_url?: string | null
  logo_public_id?: string | null
  primary_font?: string | null
  secondary_font?: string | null
  tone_of_voice?: ToneOfVoice | null
}

interface BrandKit {
  id: string
  profile_id: string
  brand_name: string
  is_default: boolean
  primary_color: string | null
  secondary_color: string | null
  accent_color: string | null
  background_color: string | null
  text_color: string | null
  logo_url: string | null
  logo_public_id: string | null
  primary_font: string | null
  secondary_font: string | null
  tone_of_voice: ToneOfVoice | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Valida formato HEX de cor (#RRGGBB)
 */
function isValidHexColor(color: string | null | undefined): boolean {
  if (!color) return true // null/undefined é válido (campo opcional)
  return /^#[0-9A-Fa-f]{6}$/.test(color)
}

/**
 * Valida payload de criação de brand kit
 */
function validateCreatePayload(payload: any): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // profile_id obrigatório
  if (!payload.profile_id || typeof payload.profile_id !== 'string') {
    errors.push('profile_id é obrigatório e deve ser uma string')
  }

  // brand_name obrigatório e não vazio
  if (!payload.brand_name || typeof payload.brand_name !== 'string') {
    errors.push('brand_name é obrigatório e deve ser uma string')
  } else if (payload.brand_name.trim().length === 0) {
    errors.push('brand_name não pode ser vazio')
  } else if (payload.brand_name.length > 100) {
    errors.push('brand_name não pode ter mais de 100 caracteres')
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
// GET /api/brand-kits - Listar brand kits
// ============================================

export async function GET(request: NextRequest) {
  try {
    const supabase = getServerSupabase()

    // Extrair profile_id dos query params
    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get('profile_id')

    // Validar profile_id obrigatório
    if (!profileId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Query param profile_id é obrigatório',
        },
        { status: 400 }
      )
    }

    // Buscar todos os kits do perfil (não deletados)
    const { data: brandKits, error: fetchError } = await supabase
      .from('brand_kits')
      .select('*')
      .eq('profile_id', profileId)
      .is('deleted_at', null)
      .order('is_default', { ascending: false }) // Default primeiro
      .order('created_at', { ascending: false }) // Mais recente primeiro

    if (fetchError) {
      console.error('Erro ao buscar brand kits:', fetchError)
      return NextResponse.json(
        {
          success: false,
          error: 'Erro ao buscar brand kits',
          details: fetchError.message,
        },
        { status: 500 }
      )
    }

    // Identificar o kit padrão (is_default = TRUE)
    const defaultKit = brandKits?.find((kit) => kit.is_default === true) || null

    // Sucesso
    return NextResponse.json(
      {
        success: true,
        brand_kits: (brandKits || []) as BrandKit[],
        default_kit: defaultKit as BrandKit | null,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro inesperado no GET /api/brand-kits:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}

// ============================================
// POST /api/brand-kits - Criar brand kit
// ============================================

export async function POST(request: NextRequest) {
  try {
    const supabase = getServerSupabase()

    // Parse do body
    let body: CreateBrandKitPayload
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payload inválido. Esperado JSON válido.',
        },
        { status: 400 }
      )
    }

    // Validar payload
    const validation = validateCreatePayload(body)
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validação falhou',
          details: validation.errors,
        },
        { status: 400 }
      )
    }

    // Verificar se profile existe
    const { data: profileExists, error: profileError } = await supabase
      .from('instagram_profiles')
      .select('id')
      .eq('id', body.profile_id)
      .is('deleted_at', null)
      .maybeSingle()

    if (profileError) {
      console.error('Erro ao verificar profile:', profileError)
      return NextResponse.json(
        {
          success: false,
          error: 'Erro ao verificar perfil',
          details: profileError.message,
        },
        { status: 500 }
      )
    }

    if (!profileExists) {
      return NextResponse.json(
        {
          success: false,
          error: 'Perfil não encontrado',
        },
        { status: 404 }
      )
    }

    // Preparar dados para insert (com defaults)
    const insertData = {
      profile_id: body.profile_id,
      brand_name: body.brand_name.trim(),
      primary_color: body.primary_color || null,
      secondary_color: body.secondary_color || null,
      accent_color: body.accent_color || null,
      background_color: body.background_color || null,
      text_color: body.text_color || null,
      logo_url: body.logo_url || null,
      logo_public_id: body.logo_public_id || null,
      primary_font: body.primary_font || null,
      secondary_font: body.secondary_font || null,
      tone_of_voice: body.tone_of_voice || null,
      // is_default será definido automaticamente pelo trigger
      // (primeiro kit é sempre default)
    }

    // Inserir no banco
    const { data: brandKit, error: insertError } = await supabase
      .from('brand_kits')
      .insert(insertData)
      .select()
      .single()

    if (insertError) {
      console.error('Erro ao criar brand kit:', insertError)
      return NextResponse.json(
        {
          success: false,
          error: 'Erro ao criar brand kit',
          details: insertError.message,
        },
        { status: 500 }
      )
    }

    // Sucesso
    return NextResponse.json(
      {
        success: true,
        brand_kit: brandKit as BrandKit,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro inesperado no POST /api/brand-kits:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
