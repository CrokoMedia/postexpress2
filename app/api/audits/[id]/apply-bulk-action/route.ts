import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'

// ============================================
// TYPES
// ============================================

type ImageMode = 'auto' | 'no_image' | 'custom_prompt' | 'upload'
type BulkActionType = 'auto' | 'no_image' | 'custom_prompt' | 'upload' | 'copy_from'

interface BulkActionRequest {
  carouselIndex: number
  action: BulkActionType
  targetSlides: number[] | 'all'
  data?: {
    customPrompt?: string
    uploadUrl?: string
    uploadPublicId?: string
    sourceCarouselIndex?: number
  }
}

interface SlideImageConfig {
  mode: ImageMode
  customPrompt?: string
  uploadUrl?: string
  uploadPublicId?: string
}

// ============================================
// VALIDATION HELPERS
// ============================================

function validateBulkActionRequest(body: any): { valid: boolean; error?: string } {
  // Validar carouselIndex
  if (typeof body.carouselIndex !== 'number' || body.carouselIndex < 0) {
    return { valid: false, error: 'carouselIndex deve ser um número >= 0' }
  }

  // Validar action
  const validActions: BulkActionType[] = ['auto', 'no_image', 'custom_prompt', 'upload', 'copy_from']
  if (!validActions.includes(body.action)) {
    return { valid: false, error: `action deve ser um de: ${validActions.join(', ')}` }
  }

  // Validar targetSlides
  if (body.targetSlides !== 'all' && !Array.isArray(body.targetSlides)) {
    return { valid: false, error: 'targetSlides deve ser "all" ou um array de números' }
  }

  if (Array.isArray(body.targetSlides)) {
    if (body.targetSlides.length === 0) {
      return { valid: false, error: 'targetSlides array não pode estar vazio' }
    }

    if (!body.targetSlides.every((s) => typeof s === 'number' && s >= 0)) {
      return { valid: false, error: 'targetSlides deve conter apenas números >= 0' }
    }
  }

  // Validações específicas por ação
  if (body.action === 'custom_prompt') {
    if (!body.data?.customPrompt || typeof body.data.customPrompt !== 'string') {
      return { valid: false, error: 'custom_prompt requer data.customPrompt (string)' }
    }

    if (body.data.customPrompt.trim().length === 0) {
      return { valid: false, error: 'customPrompt não pode estar vazio' }
    }

    if (body.data.customPrompt.length > 500) {
      return { valid: false, error: 'customPrompt muito longo (máximo 500 caracteres)' }
    }
  }

  if (body.action === 'upload') {
    if (!body.data?.uploadUrl || typeof body.data.uploadUrl !== 'string') {
      return { valid: false, error: 'upload requer data.uploadUrl (string)' }
    }

    if (!body.data.uploadUrl.startsWith('http')) {
      return { valid: false, error: 'uploadUrl deve ser uma URL válida (http/https)' }
    }

    // uploadPublicId é opcional mas recomendado
    if (body.data.uploadPublicId && typeof body.data.uploadPublicId !== 'string') {
      return { valid: false, error: 'uploadPublicId deve ser uma string' }
    }
  }

  if (body.action === 'copy_from') {
    if (typeof body.data?.sourceCarouselIndex !== 'number' || body.data.sourceCarouselIndex < 0) {
      return { valid: false, error: 'copy_from requer data.sourceCarouselIndex (número >= 0)' }
    }

    if (body.data.sourceCarouselIndex === body.carouselIndex) {
      return { valid: false, error: 'sourceCarouselIndex não pode ser igual ao carouselIndex atual' }
    }
  }

  return { valid: true }
}

// ============================================
// MAIN API HANDLER
// ============================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body: BulkActionRequest = await request.json()

    console.log('⚡ [bulk-action] Iniciando ação em massa:', {
      audit_id: id,
      action: body.action,
      carouselIndex: body.carouselIndex,
      targetSlides: body.targetSlides,
    })

    // 1. Validar request
    const validation = validateBulkActionRequest(body)
    if (!validation.valid) {
      console.error('❌ [bulk-action] Validação falhou:', validation.error)
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const supabase = getServerSupabase()

    // 2. Buscar content_suggestion
    const { data: contentSuggestion, error: fetchError } = await supabase
      .from('content_suggestions')
      .select('id, content_json')
      .eq('audit_id', id)
      .single()

    if (fetchError || !contentSuggestion) {
      console.error('❌ [bulk-action] Conteúdo não encontrado:', id)
      return NextResponse.json({ error: 'Conteúdo não encontrado' }, { status: 404 })
    }

    const contentJson = contentSuggestion.content_json as any

    if (!contentJson?.carousels) {
      console.error('❌ [bulk-action] Estrutura inválida: sem carrosséis')
      return NextResponse.json({ error: 'Conteúdo sem carrosséis' }, { status: 404 })
    }

    // 3. Validar carouselIndex
    const carousel = contentJson.carousels[body.carouselIndex]
    if (!carousel) {
      console.error('❌ [bulk-action] Carrossel não encontrado:', body.carouselIndex)
      return NextResponse.json(
        { error: `Carrossel no índice ${body.carouselIndex} não encontrado` },
        { status: 404 }
      )
    }

    // 4. Determinar slides alvo
    let targetSlideIndices: number[]
    if (body.targetSlides === 'all') {
      targetSlideIndices = carousel.slides.map((_: any, idx: number) => idx)
    } else {
      targetSlideIndices = body.targetSlides

      // Validar que todos os índices existem
      const invalidIndices = targetSlideIndices.filter((idx) => idx >= carousel.slides.length)
      if (invalidIndices.length > 0) {
        return NextResponse.json(
          { error: `Índices de slide inválidos: ${invalidIndices.join(', ')}` },
          { status: 400 }
        )
      }
    }

    console.log(`📝 [bulk-action] Aplicando ${body.action} em ${targetSlideIndices.length} slide(s)`)

    // 5. Preparar configuração baseada na ação
    let config: SlideImageConfig

    switch (body.action) {
      case 'auto':
        config = { mode: 'auto' }
        break

      case 'no_image':
        config = { mode: 'no_image' }
        break

      case 'custom_prompt':
        config = {
          mode: 'custom_prompt',
          customPrompt: body.data!.customPrompt!.trim(),
        }
        break

      case 'upload':
        config = {
          mode: 'upload',
          uploadUrl: body.data!.uploadUrl!,
          uploadPublicId: body.data?.uploadPublicId,
        }
        break

      case 'copy_from': {
        // Buscar config do carrossel fonte
        const sourceCarousel = contentJson.carousels[body.data!.sourceCarouselIndex!]
        if (!sourceCarousel) {
          return NextResponse.json(
            { error: `Carrossel fonte no índice ${body.data!.sourceCarouselIndex} não encontrado` },
            { status: 404 }
          )
        }

        // Copiar config do primeiro slide do carrossel fonte (como referência)
        // Em uma implementação mais sofisticada, poderia copiar slide-a-slide
        const sourceSlide = sourceCarousel.slides[0]
        if (sourceSlide?.imageConfig) {
          config = { ...sourceSlide.imageConfig }
        } else {
          // Se não houver config no fonte, usar auto como fallback
          config = { mode: 'auto' }
        }
        break
      }

      default:
        return NextResponse.json({ error: 'Ação não suportada' }, { status: 400 })
    }

    // 6. Aplicar configuração aos slides alvo
    const updatedConfig: Record<number, SlideImageConfig> = {}

    targetSlideIndices.forEach((slideIndex) => {
      // Adicionar/atualizar imageConfig no slide
      if (!carousel.slides[slideIndex].imageConfig) {
        carousel.slides[slideIndex].imageConfig = {}
      }

      carousel.slides[slideIndex].imageConfig = config
      updatedConfig[slideIndex] = config
    })

    // 7. Salvar no banco
    const { error: updateError } = await supabase
      .from('content_suggestions')
      .update({
        content_json: contentJson,
        updated_at: new Date().toISOString(),
      })
      .eq('id', contentSuggestion.id)

    if (updateError) {
      console.error('❌ [bulk-action] Erro ao salvar no banco:', updateError)
      return NextResponse.json(
        { error: 'Erro ao salvar configuração', details: updateError.message },
        { status: 500 }
      )
    }

    console.log('✅ [bulk-action] Configuração aplicada com sucesso')
    console.log(`   - ${Object.keys(updatedConfig).length} slides atualizados`)

    // 8. Retornar resposta
    return NextResponse.json({
      success: true,
      message: `Ação ${body.action} aplicada em ${targetSlideIndices.length} slide(s)`,
      updatedConfig,
      carouselIndex: body.carouselIndex,
      targetSlides: targetSlideIndices,
    })
  } catch (error: any) {
    console.error('❌ [bulk-action] Erro fatal:', error)
    return NextResponse.json(
      { error: 'Erro ao aplicar ação em massa', details: error.message },
      { status: 500 }
    )
  }
}

// ============================================
// GET - Retorna configurações atuais
// ============================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const carouselIndexParam = searchParams.get('carouselIndex')

    if (!carouselIndexParam) {
      return NextResponse.json({ error: 'carouselIndex é obrigatório' }, { status: 400 })
    }

    const carouselIndex = parseInt(carouselIndexParam, 10)
    if (isNaN(carouselIndex) || carouselIndex < 0) {
      return NextResponse.json({ error: 'carouselIndex deve ser um número >= 0' }, { status: 400 })
    }

    const supabase = getServerSupabase()

    // Buscar content_suggestion
    const { data: contentSuggestion, error: fetchError } = await supabase
      .from('content_suggestions')
      .select('content_json')
      .eq('audit_id', id)
      .single()

    if (fetchError || !contentSuggestion) {
      return NextResponse.json({ error: 'Conteúdo não encontrado' }, { status: 404 })
    }

    const contentJson = contentSuggestion.content_json as any
    const carousel = contentJson?.carousels?.[carouselIndex]

    if (!carousel) {
      return NextResponse.json(
        { error: `Carrossel no índice ${carouselIndex} não encontrado` },
        { status: 404 }
      )
    }

    // Extrair configurações de imagem de todos os slides
    const configs: Record<number, SlideImageConfig> = {}
    carousel.slides.forEach((slide: any, idx: number) => {
      if (slide.imageConfig) {
        configs[idx] = slide.imageConfig
      } else {
        // Default: auto
        configs[idx] = { mode: 'auto' }
      }
    })

    return NextResponse.json({
      success: true,
      carouselIndex,
      carouselTitle: carousel.titulo,
      totalSlides: carousel.slides.length,
      configs,
    })
  } catch (error: any) {
    console.error('❌ [bulk-action GET] Erro:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar configurações', details: error.message },
      { status: 500 }
    )
  }
}
