#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const queueId = process.argv[2];

if (!queueId) {
  console.error('❌ Uso: node scripts/reset-analysis.js <queue_id>');
  process.exit(1);
}

console.log(`🔄 Resetando análise ${queueId}...\n`);

const { data, error } = await supabase
  .from('analysis_queue')
  .update({
    status: 'pending',
    progress: 0,
    current_phase: null,
    error_message: null,
    retry_count: 0,
    started_at: null
  })
  .eq('id', queueId)
  .select()
  .single();

if (error) {
  console.error('❌ Erro:', error);
  process.exit(1);
}

console.log('✅ Análise resetada:');
console.log(`   Username: @${data.username}`);
console.log(`   Status: ${data.status}`);
console.log(`   Progress: ${data.progress}%`);
console.log('\n⏳ Worker vai processar em até 5 segundos...\n');
