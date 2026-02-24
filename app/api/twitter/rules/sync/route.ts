/**
 * API Route: Sync Twitter Stream Rules
 * POST /api/twitter/rules/sync
 *
 * Sincroniza regras entre Twitter API e Supabase
 * Remove regras órfãs do Twitter
 */

import { NextResponse } from 'next/server';
import { syncRules } from '@/lib/twitter-rules';

export async function POST() {
  try {
    await syncRules();

    return NextResponse.json({
      success: true,
      message: 'Rules synchronized successfully'
    });

  } catch (error) {
    console.error('Error syncing rules:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync rules',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
