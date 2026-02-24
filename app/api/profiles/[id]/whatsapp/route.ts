import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

/**
 * POST /api/profiles/[id]/whatsapp
 * Vincular número de WhatsApp ao perfil
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerSupabase()
    const { phone, name } = await request.json()

    if (!phone || !name) {
      return NextResponse.json(
        { error: 'Telefone e nome são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar formato do telefone (apenas números)
    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return NextResponse.json(
        { error: 'Formato de telefone inválido (use apenas números, 10-15 dígitos)' },
        { status: 400 }
      )
    }

    // Verificar se o perfil existe
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, whatsapp_phone')
      .eq('id', id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Perfil não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o telefone já está em uso por outro perfil
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('whatsapp_phone', cleanPhone)
      .neq('id', id)
      .single()

    if (existingProfile) {
      return NextResponse.json(
        { error: `Telefone já vinculado ao perfil @${existingProfile.username}` },
        { status: 409 }
      )
    }

    // Criar ou atualizar usuário do WhatsApp
    const { error: whatsappUserError } = await supabase
      .from('whatsapp_users')
      .upsert({
        phone: cleanPhone,
        name: name,
        active_profile_id: id,
        authorized: true,
      }, {
        onConflict: 'phone'
      })

    if (whatsappUserError) {
      console.error('Erro ao criar whatsapp_user:', whatsappUserError)
      return NextResponse.json(
        { error: 'Erro ao registrar usuário WhatsApp' },
        { status: 500 }
      )
    }

    // Vincular telefone ao perfil
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ whatsapp_phone: cleanPhone })
      .eq('id', id)

    if (updateError) {
      console.error('Erro ao vincular WhatsApp:', updateError)
      return NextResponse.json(
        { error: 'Erro ao vincular WhatsApp ao perfil' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'WhatsApp vinculado com sucesso',
      phone: cleanPhone,
    })

  } catch (error: any) {
    console.error('Erro na API /whatsapp:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/profiles/[id]/whatsapp
 * Desvincular número de WhatsApp do perfil
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerSupabase()

    // Buscar perfil atual
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, whatsapp_phone')
      .eq('id', id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Perfil não encontrado' },
        { status: 404 }
      )
    }

    if (!profile.whatsapp_phone) {
      return NextResponse.json(
        { error: 'Perfil não possui WhatsApp vinculado' },
        { status: 400 }
      )
    }

    // Remover active_profile_id do whatsapp_users
    await supabase
      .from('whatsapp_users')
      .update({ active_profile_id: null })
      .eq('phone', profile.whatsapp_phone)

    // Desvincular do perfil
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ whatsapp_phone: null })
      .eq('id', id)

    if (updateError) {
      console.error('Erro ao desvincular WhatsApp:', updateError)
      return NextResponse.json(
        { error: 'Erro ao desvincular WhatsApp' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'WhatsApp desvinculado com sucesso',
    })

  } catch (error: any) {
    console.error('Erro na API DELETE /whatsapp:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
