require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { ApifyClient } = require('apify-client');
const https = require('https');
const { promisify } = require('util');
const stream = require('stream');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const apifyClient = new ApifyClient({ token: process.env.APIFY_API_TOKEN });

// Cloudinary upload
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(imageUrl, username) {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: 'profile-pics',
      public_id: username,
      overwrite: true,
    });
    return result.secure_url;
  } catch (error) {
    console.log(`  ⚠️  Erro ao fazer upload para Cloudinary: ${error.message}`);
    return null;
  }
}

(async () => {
  console.log('📸 Buscando fotos de perfil via Apify...\n');

  // Buscar perfis sem foto
  const { data: profiles } = await supabase
    .from('instagram_profiles')
    .select('id, username')
    .is('profile_pic_cloudinary_url', null)
    .limit(10); // Limitar para não gastar muito crédito

  console.log(`📊 Perfis sem foto: ${profiles.length}\n`);

  for (const profile of profiles) {
    console.log(`🔄 Processando @${profile.username}...`);

    try {
      // Scraping simples do perfil
      const run = await apifyClient.actor('apify/instagram-profile-scraper').call({
        usernames: [profile.username],
        resultsLimit: 1,
      });

      const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

      if (items && items.length > 0) {
        const data = items[0];

        // Upload para Cloudinary
        let cloudinaryUrl = null;
        if (data.profilePicUrlHD || data.profilePicUrl) {
          const imageUrl = data.profilePicUrlHD || data.profilePicUrl;
          cloudinaryUrl = await uploadToCloudinary(imageUrl, profile.username);
        }

        // Atualizar perfil
        const { error } = await supabase
          .from('instagram_profiles')
          .update({
            profile_pic_url: data.profilePicUrl || null,
            profile_pic_url_hd: data.profilePicUrlHD || null,
            profile_pic_cloudinary_url: cloudinaryUrl,
            full_name: data.fullName || null,
            biography: data.biography || null,
            followers_count: data.followersCount || 0,
          })
          .eq('id', profile.id);

        if (error) {
          console.log(`  ❌ Erro ao atualizar: ${error.message}`);
        } else {
          console.log(`  ✅ Foto salva! (${data.followersCount || 0} seguidores)`);
        }
      } else {
        console.log(`  ⚠️  Perfil não encontrado no Instagram`);
      }

      // Aguardar 2s entre requests para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      console.log(`  ❌ Erro: ${error.message}`);
    }
  }

  console.log('\n✅ Concluído!');
})();
