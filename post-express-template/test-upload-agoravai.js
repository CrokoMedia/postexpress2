require('dotenv').config({ path: '../.env' });
const cloudinary = require('cloudinary').v2;
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadAgoraVai() {
  console.log('🚀 Upload Template "Agora Vai" no Cloudinary\n');

  try {
    const imagePath = path.join(__dirname, 'output-agoravai/slide_1.png');

    console.log('📸 Fazendo upload...\n');

    const result = await cloudinary.uploader.upload(imagePath, {
      folder: 'post-express/comparacao-templates',
      public_id: 'template_agoravai_slide_1',
      overwrite: true,
      resource_type: 'image'
    });

    console.log('✅ Upload concluído!\n');
    console.log('🔗 URL:');
    console.log(`   ${result.secure_url}\n`);
    console.log(`📊 Tamanho: ${(result.bytes / 1024).toFixed(2)} KB`);
    console.log(`📐 Dimensões: ${result.width}x${result.height}\n`);

    console.log('═══════════════════════════════════════════════\n');
    console.log('📋 COMPARAÇÃO FINAL - TODOS OS TEMPLATES:\n');

    console.log('1️⃣  Template Corrigido (temas, 35px):');
    console.log('    https://res.cloudinary.com/dwkothqfw/image/upload/v1771196029/post-express/teste-espacamento/slide_espacamento_35px.png\n');

    console.log('2️⃣  Template A (32px):');
    console.log('    https://res.cloudinary.com/dwkothqfw/image/upload/v1771196388/post-express/comparacao-templates/template_a_slide_1.png\n');

    console.log('3️⃣  Template 1080x1350 (40px):');
    console.log('    https://res.cloudinary.com/dwkothqfw/image/upload/v1771197545/post-express/comparacao-templates/template_1080x1350_slide_1.png\n');

    console.log('4️⃣  Template Agora Vai (elementos menores, texto 36px):');
    console.log(`    ${result.secure_url}\n`);

    console.log('═══════════════════════════════════════════════\n');
    console.log('💡 Diferenças do "Agora Vai":\n');
    console.log('   ✓ Avatar 80px (vs 100px dos outros)');
    console.log('   ✓ Texto 36px (vs 42px - cabe mais conteúdo)');
    console.log('   ✓ Padding 100px 110px (otimizado)');
    console.log('   ✓ Nome/username menores (mais discretos)');
    console.log('   ✓ Arquivos menores (~90KB)\n');

    console.log('🎯 Esse é o mais compacto de todos!\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  }
}

uploadAgoraVai().catch(console.error);
