require('dotenv').config({ path: '../.env' });
const cloudinary = require('cloudinary').v2;
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadSafeArea() {
  console.log('🚀 Upload Template Safe Area no Cloudinary\n');

  try {
    const outputDir = path.join(__dirname, 'output-safe-area');

    // Upload Slide 1
    console.log('📸 Upload Slide 1 (Hook)...');
    const result1 = await cloudinary.uploader.upload(
      path.join(outputDir, 'slide_1.png'),
      {
        folder: 'post-express/safe-area',
        public_id: 'safe_area_slide_1',
        overwrite: true,
        resource_type: 'image'
      }
    );
    console.log(`   ✅ ${result1.secure_url}`);
    console.log(`   📊 ${(result1.bytes / 1024).toFixed(2)} KB`);
    console.log(`   📐 ${result1.width}×${result1.height}px\n`);

    // Upload Slide 2
    console.log('📸 Upload Slide 2 (CTA)...');
    const result2 = await cloudinary.uploader.upload(
      path.join(outputDir, 'slide_2.png'),
      {
        folder: 'post-express/safe-area',
        public_id: 'safe_area_slide_2',
        overwrite: true,
        resource_type: 'image'
      }
    );
    console.log(`   ✅ ${result2.secure_url}`);
    console.log(`   📊 ${(result2.bytes / 1024).toFixed(2)} KB`);
    console.log(`   📐 ${result2.width}×${result2.height}px\n`);

    console.log('═══════════════════════════════════════════════\n');
    console.log('📋 TEMPLATE INSTAGRAM SAFE AREA:\n');

    console.log('🔗 Slide 1 (Hook):');
    console.log(`   ${result1.secure_url}\n`);

    console.log('🔗 Slide 2 (CTA):');
    console.log(`   ${result2.secure_url}\n`);

    console.log('═══════════════════════════════════════════════\n');
    console.log('📐 ESPECIFICAÇÕES:\n');
    console.log('   Dimensões totais:     1080×1350px ✅');
    console.log('   Padding superior:     150px');
    console.log('   Padding lateral:      120px (cada lado)');
    console.log('   Padding inferior:     200px');
    console.log('   Área útil:            840×1000px\n');
    console.log('💡 Benefícios:');
    console.log('   • Texto NUNCA cortado no feed');
    console.log('   • Visual profissional em qualquer dispositivo');
    console.log('   • Safe para compressão do Instagram');
    console.log('   • Funciona no grid do perfil\n');

    console.log('🎯 Teste essas imagens no Instagram agora!\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  }
}

uploadSafeArea().catch(console.error);
