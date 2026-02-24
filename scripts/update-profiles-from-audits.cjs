require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  console.log('🔄 Atualizando perfis com dados dos audits...\n');

  // Buscar todos os audits com raw_json
  const { data: audits } = await supabase
    .from('audits')
    .select('profile_id, raw_json')
    .not('raw_json', 'is', null)
    .order('created_at', { ascending: false });

  console.log(`📊 Audits com dados: ${audits.length}\n`);

  // Agrupar por profile_id (pegar o mais recente)
  const profileData = {};

  for (const audit of audits) {
    const profileId = audit.profile_id;

    if (!profileData[profileId] && audit.raw_json?.profile) {
      const profile = audit.raw_json.profile;
      profileData[profileId] = profile;
    }
  }

  console.log(`✅ Perfis únicos encontrados: ${Object.keys(profileData).length}\n`);

  let updated = 0;
  let skipped = 0;

  for (const [profileId, data] of Object.entries(profileData)) {
    // Buscar perfil atual
    const { data: currentProfile } = await supabase
      .from('instagram_profiles')
      .select('username')
      .eq('id', profileId)
      .single();

    if (!currentProfile) {
      console.log(`⚠️  Profile ${profileId.substring(0, 8)}... não encontrado`);
      skipped++;
      continue;
    }

    // Preparar update
    const updateData = {
      username: data.username || currentProfile.username,
      full_name: data.full_name || null,
      biography: data.biography || null,
      followers_count: data.followers_count || 0,
      following_count: data.following_count || 0,
      posts_count: data.posts_count || 0,
      is_verified: data.is_verified || false,
      is_business_account: data.is_business_account || false,
    };

    // Só atualizar se username for unknown_*
    if (currentProfile.username.startsWith('unknown_') || !currentProfile.username) {
      const { error } = await supabase
        .from('instagram_profiles')
        .update(updateData)
        .eq('id', profileId);

      if (error) {
        console.log(`❌ @${data.username} - Erro: ${error.message}`);
      } else {
        console.log(`✨ @${data.username.padEnd(20)} - atualizado (${data.followers_count} seguidores)`);
        updated++;
      }
    } else {
      // Atualizar só os dados que mudaram
      const { error } = await supabase
        .from('instagram_profiles')
        .update({
          full_name: updateData.full_name,
          biography: updateData.biography,
        })
        .eq('id', profileId);

      if (!error) {
        console.log(`✅ @${currentProfile.username.padEnd(20)} - dados complementares atualizados`);
        updated++;
      }
    }
  }

  console.log(`\n📊 Resultado:`);
  console.log(`   ✅ Atualizados: ${updated}`);
  console.log(`   ⏭️  Ignorados: ${skipped}`);
  console.log(`\n✅ Atualização concluída!`);
})();
