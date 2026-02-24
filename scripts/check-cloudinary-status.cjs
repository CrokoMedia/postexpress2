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

(async () => {
  const { data: profiles, error } = await supabase
    .from('instagram_profiles')
    .select('id, username, profile_pic_cloudinary_url, profile_pic_url_hd, profile_pic_url')
    .order('username');

  if (error) {
    console.error('Erro:', error);
    process.exit(1);
  }

  const semCloudinary = profiles.filter(p => !p.profile_pic_cloudinary_url);
  const comCloudinary = profiles.filter(p => p.profile_pic_cloudinary_url);

  console.log('\n📊 STATUS DAS FOTOS DE PERFIL\n');
  console.log(`✅ COM Cloudinary: ${comCloudinary.length} perfis`);
  console.log(`❌ SEM Cloudinary: ${semCloudinary.length} perfis\n`);

  if (semCloudinary.length > 0) {
    console.log('❌ Perfis sem Cloudinary (usando URLs do Instagram que expiram):');
    semCloudinary.forEach(p => {
      const hasInstagramUrl = !!(p.profile_pic_url_hd || p.profile_pic_url);
      const status = hasInstagramUrl ? '⚠️  tem URL Instagram (pode expirar)' : '🚫 SEM URL nenhuma';
      console.log(`   @${p.username.padEnd(25)} ${status}`);
    });

    console.log(`\n💡 SOLUÇÃO: Execute o script de upload para o Cloudinary:`);
    console.log(`   node scripts/upload-profile-pics-to-cloudinary.js\n`);
  } else {
    console.log('✅ Todos os perfis têm fotos no Cloudinary!\n');
  }
})();
