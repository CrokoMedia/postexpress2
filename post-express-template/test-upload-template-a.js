/**
 * Upload Template A no Cloudinary para comparação
 */

require('dotenv').config({ path: '../.env' });
const cloudinary = require('cloudinary').v2;
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadTemplateA() {
  console.log('🚀 Upload Template A no Cloudinary\n');

  try {
    const imagePath = path.join(__dirname, 'output-template-a/slide_1.png');

    console.log('📸 Fazendo upload...\n');

    const result = await cloudinary.uploader.upload(imagePath, {
      folder: 'post-express/comparacao-templates',
      public_id: 'template_a_slide_1',
      overwrite: true,
      resource_type: 'image'
    });

    console.log('✅ Upload concluído!\n');
    console.log('🔗 URL Template A:');
    console.log(`   ${result.secure_url}\n`);
    console.log(`📊 Tamanho: ${(result.bytes / 1024).toFixed(2)} KB`);
    console.log(`📐 Dimensões: ${result.width}x${result.height}\n`);

    console.log('📋 COMPARAÇÃO DE TEMPLATES:\n');
    console.log('Template Corrigido (anterior):');
    console.log('https://res.cloudinary.com/dwkothqfw/image/upload/v1771196029/post-express/teste-espacamento/slide_espacamento_35px.png\n');
    console.log('Template A (novo):');
    console.log(`${result.secure_url}\n`);

    console.log('💡 Diferenças:');
    console.log('   Template Corrigido: Suporta temas (dark/highlight)');
    console.log('   Template A: Sempre branco, mais limpo\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  }
}

uploadTemplateA().catch(console.error);
