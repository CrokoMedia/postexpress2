/**
 * API Route: Twitter Experts - Create
 * POST /api/twitter/experts - Adicionar novo expert
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase';

// POST: Adicionar novo expert
export async function POST(request: NextRequest) {
  try {
    const supabase = getServerSupabase();
    const body = await request.json();
    const { twitter_username, display_name, themes, profile_id } = body;

    // Validações
    if (!twitter_username) {
      return NextResponse.json(
        { error: 'twitter_username é obrigatório' },
        { status: 400 }
      );
    }

    const cleanUsername = twitter_username.trim().replace('@', '');

    if (!/^[A-Za-z0-9_]{1,15}$/.test(cleanUsername)) {
      return NextResponse.json(
        { error: 'Username inválido (apenas letras, números e _ até 15 caracteres)' },
        { status: 400 }
      );
    }

    if (!themes || !Array.isArray(themes) || themes.length === 0) {
      return NextResponse.json(
        { error: 'Adicione pelo menos 1 tema' },
        { status: 400 }
      );
    }

    if (themes.length > 30) {
      return NextResponse.json(
        { error: 'Máximo de 30 temas por expert (limite do Twitter API)' },
        { status: 400 }
      );
    }

    // 1. Verificar se expert já existe (para este perfil, se profileId fornecido)
    let existingQuery = supabase
      .from('twitter_experts')
      .select('id')
      .eq('twitter_username', cleanUsername);

    if (profile_id) {
      existingQuery = existingQuery.eq('profile_id', profile_id);
    }

    const { data: existing } = await existingQuery.maybeSingle();

    if (existing) {
      return NextResponse.json(
        {
          error: `Expert @${cleanUsername} já está sendo monitorado${profile_id ? ' para este perfil' : ''}`
        },
        { status: 409 }
      );
    }

    // 2. Criar expert no Supabase (com service_role - bypass RLS)
    const { data: expert, error: insertError } = await supabase
      .from('twitter_experts')
      .insert({
        twitter_username: cleanUsername,
        display_name: display_name?.trim() || null,
        themes,
        is_active: true,
        profile_id: profile_id || null
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      throw new Error(`Falha ao criar expert: ${insertError.message}`);
    }

    return NextResponse.json({
      success: true,
      expert
    });

  } catch (error) {
    console.error('Error adding expert:', error);
    return NextResponse.json(
      {
        error: 'Erro ao adicionar expert',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
