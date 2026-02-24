require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  console.log('🔧 Criando perfis órfãos...\n');

  // Buscar todos os profile_ids das auditorias
  const { data: audits } = await supabase
    .from('audits')
    .select('profile_id, snapshot_followers, snapshot_following, snapshot_posts_count, created_at')
    .order('created_at', { ascending: false });

  const allProfileIds = [...new Set(audits.map(a => a.profile_id))];
  console.log(`📊 Total de profile_ids nas auditorias: ${allProfileIds.length}\n`);

  // Buscar quais já existem em instagram_profiles
  const { data: existing } = await supabase
    .from('instagram_profiles')
    .select('id');

  const existingIds = new Set(existing.map(p => p.id));
  const orphanIds = allProfileIds.filter(id => !existingIds.has(id));

  console.log(`✅ Já existem: ${existingIds.size}`);
  console.log(`⚠️  Órfãos: ${orphanIds.length}\n`);

  if (orphanIds.length === 0) {
    console.log('✅ Nenhum perfil órfão encontrado!');
    return;
  }

  console.log('Criando perfis órfãos...\n');

  let created = 0;

  for (const profileId of orphanIds) {
    // Buscar última auditoria para pegar snapshot
    const audit = audits.find(a => a.profile_id === profileId);

    // Criar username genérico baseado no ID
    const shortId = profileId.split('-')[0];
    const username = `unknown_${shortId}`;

    const { error } = await supabase
      .from('instagram_profiles')
      .insert({
        id: profileId,
        username: username,
        followers_count: audit?.snapshot_followers || 0,
        following_count: audit?.snapshot_following || 0,
        posts_count: audit?.snapshot_posts_count || 0,
        last_scraped_at: audit?.created_at || new Date().toISOString(),
        first_scraped_at: audit?.created_at || new Date().toISOString(),
      });

    if (error) {
      console.log(`❌ ${username} - Erro: ${error.message}`);
    } else {
      console.log(`✨ ${username.padEnd(20)} - criado (${audit?.snapshot_followers || 0} seguidores)`);
      created++;
    }
  }

  console.log(`\n📊 Resultado:`);
  console.log(`   ✅ Criados: ${created} perfis órfãos`);
  console.log(`\n✅ Agora você pode executar a SQL de foreign key no Supabase!`);
})();
