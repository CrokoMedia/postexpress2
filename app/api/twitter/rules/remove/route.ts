/**
 * API Route: Remove Twitter Stream Rule
 * POST /api/twitter/rules/remove
 */

import { NextRequest, NextResponse } from 'next/server';
import { removeRule } from '@/lib/twitter-rules';
import { createClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { expertId, ruleId } = await request.json();

    // Opção 1: Remover por ruleId direto
    if (ruleId) {
      await removeRule(ruleId);
      return NextResponse.json({
        success: true,
        message: 'Rule removed successfully'
      });
    }

    // Opção 2: Remover por expertId (busca regra ativa)
    if (expertId) {
      const supabase = createClient();
      const { data: rule, error } = await supabase
        .from('twitter_stream_rules')
        .select('id')
        .eq('expert_id', expertId)
        .eq('is_active', true)
        .single();

      if (error || !rule) {
        return NextResponse.json(
          { error: 'No active rule found for this expert' },
          { status: 404 }
        );
      }

      await removeRule(rule.id);
      return NextResponse.json({
        success: true,
        message: 'Rule removed successfully'
      });
    }

    return NextResponse.json(
      { error: 'Either ruleId or expertId is required' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error removing rule:', error);
    return NextResponse.json(
      {
        error: 'Failed to remove rule',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
