/**
 * Upload Template 1080x1350 no Cloudinary
 */

require('dotenv').config({ path: '../.env' });
const cloudinary = require('cloudinary').v2;
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadTemplate1080() {
  console.log('🚀 Upload Template 1080x1350 no Cloudinary\n');

  try {
    const imagePath = path.join(__dirname, 'output-1080x1350/slide_1.png');

    console.log('📸 Fazendo upload do slide 1 (Hook)...\n');

    const result = await cloudinary.uploader.upload(imagePath, {
      folder: 'post-express/comparacao-templates',
      public_id: 'template_1080x1350_slide_1',
      overwrite: true,
      resource_type: 'image'
    });

    console.log('✅ Upload concluído!\n');
    console.log('🔗 URL:');
    console.log(`   ${result.secure_url}\n`);
    console.log(`📊 Tamanho: ${(result.bytes / 1024).toFixed(2)} KB`);
    console.log(`📐 Dimensões: ${result.width}x${result.height}\n`);

    console.log('═══════════════════════════════════════════════\n');
    console.log('📋 COMPARAÇÃO DOS 3 TEMPLATES:\n');

    console.log('1️⃣  Template Corrigido (espaçamento 35px):');
    console.log('    https://res.cloudinary.com/dwkothqfw/image/upload/v1771196029/post-express/teste-espacamento/slide_espacamento_35px.png\n');

    console.log('2️⃣  Template A (espaçamento 32px):');
    console.log('    https://res.cloudinary.com/dwkothqfw/image/upload/v1771196388/post-express/comparacao-templates/template_a_slide_1.png\n');

    console.log('3️⃣  Template 1080x1350 (espaçamento 40px):');
    console.log(`    ${result.secure_url}\n`);

    console.log('═══════════════════════════════════════════════\n');
    console.log('💡 Diferenças:\n');
    console.log('   Corrigido:   Temas (dark/highlight) + 35px');
    console.log('   Template A:  Sempre branco + 32px (mais compacto)');
    console.log('   1080x1350:   Sempre branco + 40px + line-height 1.45\n');

    console.log('🎯 Qual ficou melhor? Compare visualmente nos links acima!\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  }
}

uploadTemplate1080().catch(console.error);
