/**
 * API Route: List Twitter Stream Rules
 * GET /api/twitter/rules/list
 */

import { NextResponse } from 'next/server';
import { listRules, getRuleCount } from '@/lib/twitter-rules';
import { createClient } from '@/lib/supabase';

export async function GET() {
  try {
    // 1. Listar regras do Twitter API
    const twitterRules = await listRules();

    // 2. Buscar regras do Supabase para enriquecer dados
    const supabase = createClient();
    const { data: supabaseRules } = await supabase
      .from('twitter_stream_rules')
      .select('*, twitter_experts(twitter_username, display_name)')
      .eq('is_active', true);

    // 3. Combinar dados
    const enrichedRules = twitterRules.map(tr => {
      const supabaseRule = supabaseRules?.find(sr => sr.twitter_rule_id === tr.id);
      return {
        ...tr,
        supabaseId: supabaseRule?.id,
        expertId: supabaseRule?.expert_id,
        expert: supabaseRule?.twitter_experts,
        lastSynced: supabaseRule?.last_synced_at
      };
    });

    // 4. Verificar limite
    const count = await getRuleCount();
    const BASIC_PLAN_LIMIT = 25;

    return NextResponse.json({
      success: true,
      rules: enrichedRules,
      count,
      limit: BASIC_PLAN_LIMIT,
      remaining: BASIC_PLAN_LIMIT - count
    });

  } catch (error) {
    console.error('Error listing rules:', error);
    return NextResponse.json(
      {
        error: 'Failed to list rules',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
