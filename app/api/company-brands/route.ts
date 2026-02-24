import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { saveCompanyBrandManually, getCompanyBrandFromCache } from '@/lib/company-analyzer'

/**
 * GET /api/company-brands
 * Lista todas as marcas cadastradas
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getServerSupabase()
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain')

    // Buscar marca específica por domínio
    if (domain) {
      const brand = await getCompanyBrandFromCache(domain)
      if (!brand) {
        return NextResponse.json({ error: 'Marca não encontrada' }, { status: 404 })
      }
      return NextResponse.json({ brand })
    }

    // Listar todas as marcas
    const { data, error } = await supabase
      .from('company_brands')
      .select('*')
      .order('analyzed_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ brands: data || [] })
  } catch (error: any) {
    console.error('❌ Erro ao buscar marcas:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar marcas' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/company-brands
 * Cadastra uma nova marca manualmente
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validação
    if (!body.domain || !body.name || !body.colors || !body.primary_color) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: domain, name, colors, primary_color' },
        { status: 400 }
      )
    }

    // Salvar marca
    const brand = await saveCompanyBrandManually({
      domain: body.domain,
      name: body.name,
      colors: body.colors,
      primary_color: body.primary_color,
      secondary_color: body.secondary_color,
      accent_color: body.accent_color,
      visual_style: body.visual_style,
      industry: body.industry,
      description: body.description,
      logo_url: body.logo_url,
    })

    return NextResponse.json({ success: true, brand })
  } catch (error: any) {
    console.error('❌ Erro ao salvar marca:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao salvar marca' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/company-brands?domain=nike.com
 * Remove uma marca do cache
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain')

    if (!domain) {
      return NextResponse.json({ error: 'Parâmetro domain é obrigatório' }, { status: 400 })
    }

    const supabase = getServerSupabase()
    const { error } = await supabase
      .from('company_brands')
      .delete()
      .eq('domain', domain)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, message: `Marca ${domain} removida com sucesso` })
  } catch (error: any) {
    console.error('❌ Erro ao remover marca:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao remover marca' },
      { status: 500 }
    )
  }
}
