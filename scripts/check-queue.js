#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data, error } = await supabase
  .from('analysis_queue')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(10);

if (error) {
  console.error('❌ Erro:', error);
  process.exit(1);
}

console.log(`\n📊 Análises na fila: ${data.length}\n`);

if (data.length === 0) {
  console.log('✅ Nenhuma análise pendente');
} else {
  data.forEach((item, i) => {
    console.log(`\n${i + 1}. @${item.username}`);
    console.log(`   ID: ${item.id}`);
    console.log(`   Status: ${item.status}`);
    console.log(`   Progress: ${item.progress}%`);
    console.log(`   Fase: ${item.current_phase || 'N/A'}`);
    console.log(`   Criado em: ${new Date(item.created_at).toLocaleString('pt-BR')}`);
    if (item.error_message) {
      console.log(`   ❌ Erro: ${item.error_message}`);
    }
  });
}

console.log('\n');
