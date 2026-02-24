require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  console.log('🔄 Reconstruindo perfis na tabela instagram_profiles...\n');

  // 1. Buscar todos os profile_ids únicos das auditorias
  const { data: audits } = await supabase
    .from('audits')
    .select(`
      profile_id,
      snapshot_followers,
      snapshot_following,
      snapshot_posts_count,
      created_at
    `)
    .order('created_at', { ascending: false });

  const profileIds = [...new Set(audits.map(a => a.profile_id))];
  console.log(`📊 Encontrados ${profileIds.length} perfis únicos\n`);

  let created = 0;
  let skipped = 0;

  for (const profileId of profileIds) {
    // Buscar username na analysis_queue
    const { data: queueData } = await supabase
      .from('analysis_queue')
      .select('username')
      .eq('profile_id', profileId)
      .limit(1)
      .single();

    if (!queueData) {
      console.log(`⚠️  Profile ${profileId.substring(0, 8)}... - username não encontrado`);
      skipped++;
      continue;
    }

    const username = queueData.username;

    // Buscar última auditoria deste perfil para pegar snapshot
    const { data: lastAudit } = await supabase
      .from('audits')
      .select('snapshot_followers, snapshot_following, snapshot_posts_count, created_at')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Verificar se já existe
    const { data: existing } = await supabase
      .from('instagram_profiles')
      .select('id')
      .eq('id', profileId)
      .single();

    if (existing) {
      console.log(`✅ @${username.padEnd(20)} - já existe`);
      skipped++;
      continue;
    }

    // Criar perfil
    const { error } = await supabase
      .from('instagram_profiles')
      .insert({
        id: profileId,
        username: username,
        followers_count: lastAudit?.snapshot_followers || 0,
        following_count: lastAudit?.snapshot_following || 0,
        posts_count: lastAudit?.snapshot_posts_count || 0,
        last_scraped_at: lastAudit?.created_at || new Date().toISOString(),
        first_scraped_at: lastAudit?.created_at || new Date().toISOString(),
      });

    if (error) {
      console.log(`❌ @${username} - Erro: ${error.message}`);
    } else {
      console.log(`✨ @${username.padEnd(20)} - criado (${lastAudit?.snapshot_followers || 0} seguidores)`);
      created++;
    }
  }

  console.log(`\n📊 Resultado:`);
  console.log(`   ✅ Criados: ${created}`);
  console.log(`   ⏭️  Ignorados: ${skipped}`);
  console.log(`\n✅ Migração concluída!`);
})();
