require('dotenv').config({ path: '../.env' });
const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadProducao() {
  console.log('🚀 Upload Templates de PRODUÇÃO no Cloudinary\n');

  try {
    const outputDir = path.join(__dirname, 'output-producao');

    // Upload Template A
    console.log('📸 Upload Template A (só texto)...');
    const resultA = await cloudinary.uploader.upload(
      path.join(outputDir, 'template_A_slide.png'),
      {
        folder: 'post-express/templates-producao',
        public_id: 'template_A_producao',
        overwrite: true,
        resource_type: 'image'
      }
    );
    console.log(`   ✅ ${resultA.secure_url}`);
    console.log(`   📊 ${(resultA.bytes / 1024).toFixed(2)} KB\n`);

    // Upload Template B
    console.log('📸 Upload Template B (texto + imagem)...');
    const resultB = await cloudinary.uploader.upload(
      path.join(outputDir, 'template_B_slide.png'),
      {
        folder: 'post-express/templates-producao',
        public_id: 'template_B_producao',
        overwrite: true,
        resource_type: 'image'
      }
    );
    console.log(`   ✅ ${resultB.secure_url}`);
    console.log(`   📊 ${(resultB.bytes / 1024).toFixed(2)} KB\n`);

    console.log('═══════════════════════════════════════════════\n');
    console.log('📋 TEMPLATES DE PRODUÇÃO:\n');

    console.log('🅰️  Template A - Só Texto:');
    console.log(`   ${resultA.secure_url}`);
    console.log('   • Texto: 33px');
    console.log('   • Safe Area: 150/120/200/120px');
    console.log('   • Área útil: 840×1000px');
    console.log('   • Uso: Carrosséis educacionais\n');

    console.log('🅱️  Template B - Texto + Imagem:');
    console.log(`   ${resultB.secure_url}`);
    console.log('   • Texto: 31px');
    console.log('   • Imagem: max 460px');
    console.log('   • Safe Area: 150/120/200/120px');
    console.log('   • Uso: Carrosséis visuais, cases\n');

    console.log('═══════════════════════════════════════════════\n');
    console.log('💡 Instagram Safe Area:');
    console.log('   Garante que nada importante seja cortado');
    console.log('   pelos botões/barras do Instagram\n');

    console.log('✅ Dimensões: 1080×1350px (ambos)\n');
    console.log('🎯 Esses são os templates FINAIS de produção!\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  }
}

uploadProducao().catch(console.error);
