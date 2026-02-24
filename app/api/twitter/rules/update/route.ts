/**
 * API Route: Update Expert Themes
 * POST /api/twitter/rules/update
 *
 * Atualiza temas de um expert e recria a regra no Twitter
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateExpertThemes } from '@/lib/twitter-rules';

export async function POST(request: NextRequest) {
  try {
    const { expertId, themes } = await request.json();

    // Validar input
    if (!expertId || !themes || !Array.isArray(themes) || themes.length === 0) {
      return NextResponse.json(
        { error: 'expertId and themes array are required' },
        { status: 400 }
      );
    }

    // Validar número de temas (max 30 para não exceder limite de OR)
    if (themes.length > 30) {
      return NextResponse.json(
        { error: 'Too many themes (max 30)' },
        { status: 400 }
      );
    }

    // Atualizar temas
    await updateExpertThemes(expertId, themes);

    return NextResponse.json({
      success: true,
      message: 'Expert themes updated successfully'
    });

  } catch (error) {
    console.error('Error updating themes:', error);
    return NextResponse.json(
      {
        error: 'Failed to update themes',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
