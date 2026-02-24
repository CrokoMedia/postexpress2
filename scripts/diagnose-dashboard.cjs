#!/usr/bin/env node

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Variáveis de ambiente não configuradas');
  console.log('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.log('   SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅' : '❌');
  process.exit(1);
}

async function diagnose() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🔍 Diagnóstico do Dashboard - Perfis não aparecem\n');
  console.log('=' .repeat(60));

  // 1. Verificar se tabela instagram_profiles existe
  console.log('\n1️⃣ Verificando tabela instagram_profiles...');
  const { count: instagramCount, error: ie } = await supabase
    .from('instagram_profiles')
    .select('*', { count: 'exact', head: true });

  if (ie) {
    console.log('   ❌ ERRO:', ie.message);
    console.log('\n   🔧 SOLUÇÃO: Executar migração:');
    console.log('   database/migration-create-instagram-profiles.sql');
    return;
  } else {
    console.log('   ✅ Tabela existe com', instagramCount, 'registros');
  }

  // 2. Verificar analysis_queue
  console.log('\n2️⃣ Verificando analysis_queue...');
  const { count: queueCount } = await supabase
    .from('analysis_queue')
    .select('*', { count: 'exact', head: true });
  console.log('   ✅', queueCount, 'análises na fila');

  const { data: queue } = await supabase
    .from('analysis_queue')
    .select('username, status, profile_id, audit_id, error_message')
    .order('created_at', { ascending: false })
    .limit(10);

  console.log('\n   📋 Últimas 10 análises:');
  queue?.forEach((q, i) => {
    const profileStatus = q.profile_id ? '✅' : '❌';
    const auditStatus = q.audit_id ? '✅' : '❌';
    console.log(`   ${i+1}. @${q.username} - ${q.status}`);
    console.log(`      profile_id: ${profileStatus} | audit_id: ${auditStatus}`);
    if (q.error_message) {
      console.log(`      erro: ${q.error_message.substring(0, 60)}...`);
    }
  });

  // 3. Verificar audits
  console.log('\n3️⃣ Verificando audits...');
  const { count: auditsCount } = await supabase
    .from('audits')
    .select('*', { count: 'exact', head: true });
  console.log('   ✅', auditsCount, 'auditorias');

  // 4. Testar JOIN entre instagram_profiles e audits
  console.log('\n4️⃣ Testando JOIN instagram_profiles + audits...');
  const { data: profiles, error: joinError } = await supabase
    .from('instagram_profiles')
    .select(`
      id,
      username,
      audits (
        id,
        audit_date,
        score_overall
      )
    `)
    .limit(5);

  if (joinError) {
    console.log('   ❌ ERRO no JOIN:', joinError.message);
    console.log('\n   🔧 SOLUÇÃO: Foreign Key precisa ser corrigida');
    console.log('   Execute: database/migration-fix-audits-foreign-key.sql');

    // Mostrar detalhes da constraint atual
    const { data: constraints } = await supabase.rpc('get_table_constraints', { table_name: 'audits' }).select('*');
    console.log('\n   📋 Constraints atuais da tabela audits:');
    if (constraints) {
      constraints.forEach(c => {
        console.log(`      - ${c.constraint_name}: ${c.constraint_type}`);
      });
    }
  } else {
    console.log('   ✅ JOIN funcionando!');
    console.log('   📋 Perfis com auditorias:');
    profiles?.forEach(p => {
      console.log(`      @${p.username} - ${p.audits?.length || 0} auditorias`);
    });
  }

  // 5. Testar API
  console.log('\n5️⃣ Testando API /api/profiles...');
  try {
    const response = await fetch('http://localhost:3001/api/profiles');
    const data = await response.json();

    if (data.error) {
      console.log('   ❌ ERRO na API:', data.error);
    } else {
      console.log('   ✅ API funcionando!');
      console.log('   📊 Total de perfis:', data.total);
    }
  } catch (e) {
    console.log('   ⚠️  Não foi possível testar API (servidor não está rodando?)');
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Diagnóstico completo!\n');
}

diagnose().catch(console.error);
