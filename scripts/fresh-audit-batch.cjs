#!/usr/bin/env node

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function triggerFreshAudit(profileId, username) {
  try {
    console.log(`\n🔄 Iniciando fresh audit de @${username}...`);

    const response = await fetch(`http://localhost:3001/api/profiles/${profileId}/fresh-audit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ Erro ao auditar @${username}:`, error);
      return { success: false, username, error };
    }

    const result = await response.json();
    console.log(`✅ Fresh audit de @${username} concluído!`);
    return { success: true, username, result };
  } catch (error) {
    console.error(`❌ Erro ao auditar @${username}:`, error.message);
    return { success: false, username, error: error.message };
  }
}

(async () => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔄 FRESH AUDIT EM LOTE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Buscar perfis sem Cloudinary URL
  const { data: profiles, error } = await supabase
    .from('instagram_profiles')
    .select('id, username')
    .is('profile_pic_cloudinary_url', null)
    .order('username');

  if (error) {
    console.error('❌ Erro ao buscar perfis:', error);
    process.exit(1);
  }

  console.log(`📋 ${profiles.length} perfis para auditar:\n`);
  profiles.forEach((p, i) => {
    console.log(`   ${i + 1}. @${p.username} (ID: ${p.id})`);
  });

  console.log('\n⏳ Aguarde... Este processo pode levar alguns minutos.\n');

  // Executar fresh audits sequencialmente (para não sobrecarregar)
  const results = [];
  for (const profile of profiles) {
    const result = await triggerFreshAudit(profile.id, profile.username);
    results.push(result);

    // Aguardar 5 segundos entre audits para não sobrecarregar
    if (profile !== profiles[profiles.length - 1]) {
      console.log('⏸️  Aguardando 5 segundos...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  // Resumo
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 RESUMO DO FRESH AUDIT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`   ✅ Sucesso: ${successful.length}`);
  console.log(`   ❌ Falhas: ${failed.length}`);
  console.log(`   📊 Total: ${results.length}\n`);

  if (successful.length > 0) {
    console.log('✅ Perfis atualizados com sucesso:');
    successful.forEach(r => console.log(`   - @${r.username}`));
    console.log();
  }

  if (failed.length > 0) {
    console.log('❌ Perfis com falha:');
    failed.forEach(r => console.log(`   - @${r.username}: ${r.error}`));
    console.log();
  }

  console.log('🎉 Processo concluído!\n');
})();
