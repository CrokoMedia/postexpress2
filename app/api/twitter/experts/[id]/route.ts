/**
 * API Route: Twitter Expert Management
 * PATCH /api/twitter/experts/[id] - Update expert
 * GET /api/twitter/experts/[id] - Get expert details
 * DELETE /api/twitter/experts/[id] - Delete expert
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { updateExpertThemes } from '@/lib/twitter-rules';

const supabase = createClient();

// GET: Obter detalhes do expert
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data, error } = await supabase
      .from('twitter_experts')
      .select('*, twitter_stream_rules(*)')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Expert not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      expert: data
    });

  } catch (error) {
    console.error('Error fetching expert:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch expert',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PATCH: Atualizar expert (temas, display_name, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json();
    const { themes, display_name, is_active } = body;

    // Atualizar no Supabase
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };

    if (themes !== undefined) {
      updateData.themes = themes;
    }
    if (display_name !== undefined) {
      updateData.display_name = display_name;
    }
    if (is_active !== undefined) {
      updateData.is_active = is_active;
    }

    const { error } = await supabase
      .from('twitter_experts')
      .update(updateData)
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update expert: ${error.message}`);
    }

    // Se temas foram atualizados, atualizar regra no Twitter
    if (themes && Array.isArray(themes) && themes.length > 0) {
      await updateExpertThemes(id, themes);
    }

    return NextResponse.json({
      success: true,
      message: 'Expert updated successfully'
    });

  } catch (error) {
    console.error('Error updating expert:', error);
    return NextResponse.json(
      {
        error: 'Failed to update expert',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE: Deletar expert (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Marcar como inativo
    const { error } = await supabase
      .from('twitter_experts')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete expert: ${error.message}`);
    }

    // Remover regra do Twitter (CASCADE vai marcar regra como inativa)
    const { data: rule } = await supabase
      .from('twitter_stream_rules')
      .select('id')
      .eq('expert_id', id)
      .eq('is_active', true)
      .single();

    if (rule) {
      const { removeRule } = await import('@/lib/twitter-rules');
      await removeRule(rule.id);
    }

    return NextResponse.json({
      success: true,
      message: 'Expert deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting expert:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete expert',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
