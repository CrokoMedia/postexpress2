require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  console.log('🔍 Diagnosticando perfis perdidos...\n');

  // 1. Buscar audits com profile_id
  console.log('📊 1. Buscando auditorias...');
  const { data: audits, error: auditsError } = await supabase
    .from('audits')
    .select('id, profile_id, snapshot_followers, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (auditsError) {
    console.log('❌ Erro ao buscar audits:', auditsError.message);
    return;
  }

  console.log(`✅ Encontradas ${audits.length} auditorias\n`);

  // 2. Para cada audit, buscar posts para descobrir username
  console.log('📋 2. Extraindo usernames dos posts...\n');

  for (const audit of audits) {
    // Buscar post desta auditoria
    const { data: posts } = await supabase
      .from('posts')
      .select('post_url, caption')
      .eq('audit_id', audit.id)
      .limit(1);

    if (posts && posts.length > 0) {
      const url = posts[0].post_url;
      // Extrair username da URL do Instagram
      // Formato: https://www.instagram.com/p/SHORTCODE/ ou /USERNAME/p/SHORTCODE/
      let username = 'desconhecido';

      // Tentar extrair do caption ou URL
      const captionMatch = posts[0].caption?.match(/@([a-zA-Z0-9._]+)/);
      if (captionMatch) {
        username = captionMatch[1];
      }

      console.log(`Audit ${audit.id.substring(0, 8)}...`);
      console.log(`  Profile ID: ${audit.profile_id}`);
      console.log(`  Username provável: @${username}`);
      console.log(`  Seguidores (snapshot): ${audit.snapshot_followers || 'N/A'}`);
      console.log(`  Data: ${new Date(audit.created_at).toLocaleDateString()}`);
      console.log();
    }
  }

  console.log('💡 Próximo passo:');
  console.log('   Precisamos recriar os perfis na tabela instagram_profiles');
  console.log('   com os dados disponíveis das auditorias.');
})();
