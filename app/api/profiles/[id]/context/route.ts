import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import type { UserProfile } from '@/types/database'

// GET - Buscar contexto do perfil
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = getServerSupabase()

    const { data, error } = await supabase
      .from('profile_context')
      .select('*')
      .eq('profile_id', id)
      .is('deleted_at', null)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = not found (não é erro)
      throw error
    }

    return NextResponse.json({
      context: data || null
    })
  } catch (error: any) {
    console.error('Error fetching profile context:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch context' },
      { status: 500 }
    )
  }
}

// POST - Criar/atualizar contexto
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = getServerSupabase()
    const body = await request.json()

    // Detectar se é a nova estrutura UserProfile ou campos legados
    const isNewStructure = body.identity || body.credibility || body.philosophy || body.contentStyle || body.contentPillars || body.business || body.dna

    // Verificar se perfil existe
    const { data: profile, error: profileError } = await supabase
      .from('instagram_profiles')
      .select('id')
      .eq('id', id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Verificar se já existe contexto
    const { data: existing } = await supabase
      .from('profile_context')
      .select('id')
      .eq('profile_id', id)
      .is('deleted_at', null)
      .single()

    let result

    if (isNewStructure) {
      // Nova estrutura UserProfile
      const userProfile: UserProfile = body

      const contextData = {
        identity: userProfile.identity,
        credibility: userProfile.credibility,
        philosophy: userProfile.philosophy,
        content_style: userProfile.contentStyle,
        content_pillars: userProfile.contentPillars,
        business: userProfile.business,
        dna: userProfile.dna
      }

      if (existing) {
        // Atualizar
        const { data, error } = await supabase
          .from('profile_context')
          .update(contextData)
          .eq('id', existing.id)
          .select()
          .single()

        if (error) throw error
        result = data
      } else {
        // Criar novo
        const { data, error } = await supabase
          .from('profile_context')
          .insert({
            profile_id: id,
            ...contextData
          })
          .select()
          .single()

        if (error) throw error
        result = data
      }
    } else {
      // Estrutura legada (manter retrocompatibilidade)
      const {
        nicho,
        objetivos,
        publico_alvo,
        produtos_servicos,
        tom_voz,
        contexto_adicional,
        files
      } = body

      if (existing) {
        // Atualizar
        const { data, error } = await supabase
          .from('profile_context')
          .update({
            nicho,
            objetivos,
            publico_alvo,
            produtos_servicos,
            tom_voz,
            contexto_adicional,
            files: files || []
          })
          .eq('id', existing.id)
          .select()
          .single()

        if (error) throw error
        result = data
      } else {
        // Criar novo
        const { data, error } = await supabase
          .from('profile_context')
          .insert({
            profile_id: id,
            nicho,
            objetivos,
            publico_alvo,
            produtos_servicos,
            tom_voz,
            contexto_adicional,
            files: files || []
          })
          .select()
          .single()

        if (error) throw error
        result = data
      }
    }

    return NextResponse.json({
      success: true,
      context: result
    })

  } catch (error: any) {
    console.error('Error saving profile context:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save context' },
      { status: 500 }
    )
  }
}

// DELETE - Remover contexto
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = getServerSupabase()

    const { error } = await supabase
      .from('profile_context')
      .update({ deleted_at: new Date().toISOString() })
      .eq('profile_id', id)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Context deleted'
    })

  } catch (error: any) {
    console.error('Error deleting context:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete context' },
      { status: 500 }
    )
  }
}
