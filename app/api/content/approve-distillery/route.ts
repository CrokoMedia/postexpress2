import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { profile_id, audit_id, carousel, source_mode, source_identifier } = body

    if (!profile_id) {
      return NextResponse.json(
        { error: 'profile_id é obrigatório' },
        { status: 400 }
      )
    }

    if (!carousel) {
      return NextResponse.json(
        { error: 'carousel é obrigatório' },
        { status: 400 }
      )
    }

    const supabase = getServerSupabase()

    // Se não tiver audit_id, precisamos usar a auditoria mais recente deste perfil
    // ou criar uma entrada sem audit_id (para conteúdo vindo de YouTube)
    let finalAuditId = audit_id

    if (!finalAuditId) {
      // Buscar auditoria mais recente deste perfil
      const { data: recentAudit, error: auditError } = await supabase
        .from('audits')
        .select('id')
        .eq('profile_id', profile_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (recentAudit) {
        finalAuditId = recentAudit.id
      }
    }

    if (!finalAuditId) {
      return NextResponse.json(
        { error: 'Nenhuma auditoria encontrada para este perfil. Crie uma auditoria primeiro.' },
        { status: 404 }
      )
    }

    // Verificar se já existe content_suggestion para este audit_id
    const { data: existingContent } = await supabase
      .from('content_suggestions')
      .select('id, content_json')
      .eq('audit_id', finalAuditId)
      .single()

    // Formatar o carrossel no formato esperado pela página de criar conteúdo
    const contentToSave = {
      carousels: [carousel], // Array com apenas o carrossel aprovado
      source: 'distillery',
      source_mode,
      source_identifier,
      approved_at: new Date().toISOString()
    }

    let savedContent: any

    if (existingContent) {
      // Se já existe, adicionar o novo carrossel ao array existente
      const currentContent = existingContent.content_json || {}
      const currentCarousels = currentContent.carousels || []

      const updatedContent = {
        ...currentContent,
        carousels: [...currentCarousels, carousel],
        source: 'distillery',
        source_mode,
        source_identifier,
        updated_at: new Date().toISOString()
      }

      const { data, error: updateError } = await supabase
        .from('content_suggestions')
        .update({
          content_json: updatedContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingContent.id)
        .select()
        .single()

      if (updateError) {
        console.error('Erro ao atualizar content_suggestions:', updateError)
        throw new Error('Erro ao salvar conteúdo aprovado')
      }

      savedContent = data
    } else {
      // Se não existe, criar novo
      const { data, error: insertError } = await supabase
        .from('content_suggestions')
        .insert({
          audit_id: finalAuditId,
          profile_id: profile_id,
          content_json: contentToSave,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError) {
        console.error('Erro ao inserir content_suggestions:', insertError)
        throw new Error('Erro ao salvar conteúdo aprovado')
      }

      savedContent = data
    }

    return NextResponse.json({
      success: true,
      audit_id: finalAuditId,
      content_suggestion_id: savedContent.id,
      message: 'Carrossel aprovado e salvo com sucesso'
    })
  } catch (error: any) {
    console.error('Erro em approve-distillery:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao processar aprovação' },
      { status: 500 }
    )
  }
}
