/**
 * API Route: Add Twitter Stream Rule
 * POST /api/twitter/rules/add
 */

import { NextRequest, NextResponse } from 'next/server';
import { addRule, canAddRule } from '@/lib/twitter-rules';

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

    // Verificar limite de regras
    const canAdd = await canAddRule();
    if (!canAdd) {
      return NextResponse.json(
        { error: 'Rule limit reached (max 25 for Basic plan)' },
        { status: 403 }
      );
    }

    // Adicionar regra
    const ruleId = await addRule(expertId, themes);

    return NextResponse.json({
      success: true,
      ruleId,
      message: 'Rule added successfully'
    });

  } catch (error) {
    console.error('Error adding rule:', error);
    return NextResponse.json(
      {
        error: 'Failed to add rule',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
