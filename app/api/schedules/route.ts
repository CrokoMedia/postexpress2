import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'

// GET /api/schedules - Listar agendamentos
export async function GET(req: NextRequest) {
  try {
    const supabase = getServerSupabase()
    const { searchParams } = new URL(req.url)
    const auditId = searchParams.get('auditId')
    const status = searchParams.get('status')

    let query = supabase
      .from('content_generation_schedules')
      .select(`
        *,
        profiles:profile_id (username, full_name),
        audits:audit_id (audit_date, score_overall)
      `)
      .order('scheduled_at', { ascending: true })

    if (auditId) {
      query = query.eq('audit_id', auditId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erro ao buscar agendamentos:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ schedules: data || [] })
  } catch (err: any) {
    console.error('Erro ao listar agendamentos:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/schedules - Criar novo agendamento
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { auditId, profileId, scheduledAt, quantity, customTheme } = body

    // Validações
    if (!auditId || !profileId || !scheduledAt || !quantity) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: auditId, profileId, scheduledAt, quantity' },
        { status: 400 }
      )
    }

    if (quantity < 1 || quantity > 20) {
      return NextResponse.json(
        { error: 'Quantidade deve estar entre 1 e 20' },
        { status: 400 }
      )
    }

    // Validar que a data está no futuro
    const scheduledDate = new Date(scheduledAt)
    const now = new Date()
    if (scheduledDate <= now) {
      return NextResponse.json(
        { error: 'A data agendada deve ser no futuro' },
        { status: 400 }
      )
    }

    const supabase = getServerSupabase()

    // Criar agendamento
    const { data, error } = await supabase
      .from('content_generation_schedules')
      .insert({
        audit_id: auditId,
        profile_id: profileId,
        scheduled_at: scheduledAt,
        quantity: quantity,
        custom_theme: customTheme || null,
        status: 'pending',
      })
      .select(`
        *,
        profiles:profile_id (username, full_name),
        audits:audit_id (audit_date, score_overall)
      `)
      .single()

    if (error) {
      console.error('Erro ao criar agendamento:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('✅ Agendamento criado:', {
      id: data.id,
      scheduledAt: data.scheduled_at,
      quantity: data.quantity,
    })

    return NextResponse.json({ schedule: data }, { status: 201 })
  } catch (err: any) {
    console.error('Erro ao criar agendamento:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
