import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'

type Params = {
  params: Promise<{
    id: string
  }>
}

// GET /api/schedules/[id] - Buscar agendamento específico
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const supabase = getServerSupabase()

    const { data, error } = await supabase
      .from('content_generation_schedules')
      .select(`
        *,
        profiles:profile_id (username, full_name),
        audits:audit_id (audit_date, score_overall),
        content_suggestions:content_suggestion_id (*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erro ao buscar agendamento:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ schedule: data })
  } catch (err: any) {
    console.error('Erro ao buscar agendamento:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PATCH /api/schedules/[id] - Atualizar agendamento
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const body = await req.json()
    const { scheduledAt, quantity, customTheme, status } = body

    const supabase = getServerSupabase()

    // Buscar agendamento atual
    const { data: current, error: fetchError } = await supabase
      .from('content_generation_schedules')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !current) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      )
    }

    // Não permitir editar agendamentos já processados
    if (['completed', 'processing'].includes(current.status)) {
      return NextResponse.json(
        { error: 'Não é possível editar agendamentos em processamento ou concluídos' },
        { status: 400 }
      )
    }

    // Preparar dados para atualização
    const updateData: any = {}

    if (scheduledAt) {
      const scheduledDate = new Date(scheduledAt)
      const now = new Date()
      if (scheduledDate <= now) {
        return NextResponse.json(
          { error: 'A data agendada deve ser no futuro' },
          { status: 400 }
        )
      }
      updateData.scheduled_at = scheduledAt
    }

    if (quantity) {
      if (quantity < 1 || quantity > 20) {
        return NextResponse.json(
          { error: 'Quantidade deve estar entre 1 e 20' },
          { status: 400 }
        )
      }
      updateData.quantity = quantity
    }

    if (customTheme !== undefined) {
      updateData.custom_theme = customTheme
    }

    if (status) {
      updateData.status = status
    }

    // Atualizar
    const { data, error } = await supabase
      .from('content_generation_schedules')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        profiles:profile_id (username, full_name),
        audits:audit_id (audit_date, score_overall)
      `)
      .single()

    if (error) {
      console.error('Erro ao atualizar agendamento:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('✅ Agendamento atualizado:', id)

    return NextResponse.json({ schedule: data })
  } catch (err: any) {
    console.error('Erro ao atualizar agendamento:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE /api/schedules/[id] - Cancelar agendamento
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const supabase = getServerSupabase()

    // Buscar agendamento atual
    const { data: current, error: fetchError } = await supabase
      .from('content_generation_schedules')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !current) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      )
    }

    // Não permitir cancelar agendamentos já processados
    if (current.status === 'completed') {
      return NextResponse.json(
        { error: 'Não é possível cancelar agendamentos concluídos' },
        { status: 400 }
      )
    }

    // Marcar como cancelado ao invés de deletar
    const { error } = await supabase
      .from('content_generation_schedules')
      .update({ status: 'cancelled' })
      .eq('id', id)

    if (error) {
      console.error('Erro ao cancelar agendamento:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('✅ Agendamento cancelado:', id)

    return NextResponse.json({ message: 'Agendamento cancelado com sucesso' })
  } catch (err: any) {
    console.error('Erro ao cancelar agendamento:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
