/**
 * Croko Labs - Teste Cloudinary Comparação
 *
 * Upload de 2 versões para comparar espaçamento
 */

require('dotenv').config({ path: '../.env' });
const cloudinary = require('cloudinary').v2;
const path = require('path');

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadComparison() {
  console.log('🚀 Comparando Espaçamento no Cloudinary\n');

  try {
    // Versão NOVA (espaçamento reduzido 35px)
    const newVersionPath = path.join(__dirname, 'output-corrigido/slide_2.png');

    console.log('📸 Upload versão OTIMIZADA (espaçamento 35px)...\n');

    const resultNew = await cloudinary.uploader.upload(newVersionPath, {
      folder: 'post-express/teste-espacamento',
      public_id: 'slide_espacamento_35px',
      overwrite: true,
      resource_type: 'image'
    });

    console.log('✅ Versão otimizada enviada!\n');
    console.log('📊 Comparação:\n');
    console.log('🆕 NOVA (35px - otimizado):');
    console.log(`   ${resultNew.secure_url}`);
    console.log(`   Tamanho: ${(resultNew.bytes / 1024).toFixed(2)} KB\n`);

    console.log('─────────────────────────────────────────────\n');
    console.log('💡 O que mudou:');
    console.log('   ❌ Antes: margin-bottom: 60px (muito espaço)');
    console.log('   ✅ Agora: margin-bottom: 35px (otimizado)');
    console.log('');
    console.log('📐 Redução: 25px menos de espaço branco');
    console.log('🎨 Visual: Mais compacto e profissional\n');

    console.log('🎉 Teste concluído!');
    console.log('💡 Veja a comparação nos links acima');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  }
}

uploadComparison().catch(console.error);
