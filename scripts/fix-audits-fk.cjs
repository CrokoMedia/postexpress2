require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  console.log('🔧 Corrigindo foreign key de audits...\n');

  // Executar SQL diretamente via RPC ou usar a API admin
  const migrations = [
    `ALTER TABLE audits DROP CONSTRAINT IF EXISTS audits_profile_id_fkey;`,
    `ALTER TABLE audits DROP CONSTRAINT IF EXISTS fk_audits_profile;`,
    `ALTER TABLE audits DROP CONSTRAINT IF EXISTS audits_profile_id_profiles_id_fk;`,
    `ALTER TABLE audits
     ADD CONSTRAINT audits_profile_id_fkey
     FOREIGN KEY (profile_id)
     REFERENCES instagram_profiles(id)
     ON DELETE CASCADE;`
  ];

  for (const sql of migrations) {
    console.log('Executando:', sql.substring(0, 60) + '...');
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error && !error.message.includes('does not exist')) {
      console.log('  ⚠️  Aviso:', error.message);
    } else {
      console.log('  ✅ OK');
    }
  }

  console.log('\n✅ Migração concluída!');
  console.log('\n📋 Próximo passo:');
  console.log('   Reinicie o servidor Next.js: npm run dev');
})();
