require('dotenv').config({ path: '../.env' });
const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadCarrossel9() {
  console.log('🚀 Upload Carrossel #9 no Cloudinary\n');

  const outputDir = path.join(__dirname, 'output-carrossel-9');
  const urls = [];

  try {
    for (let i = 1; i <= 5; i++) {
      const filePath = path.join(outputDir, `slide_${i}.png`);

      console.log(`📸 Upload slide ${i}/5...`);

      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'post-express/carrossel-9',
        public_id: `slide_${i}`,
        overwrite: true,
        resource_type: 'image'
      });

      urls.push(result.secure_url);
      console.log(`   ✅ ${result.secure_url}`);
      console.log(`   📊 ${(result.bytes / 1024).toFixed(2)} KB\n`);
    }

    console.log('═══════════════════════════════════════\n');
    console.log('🎉 CARROSSEL #9 NO CLOUDINARY!\n');
    console.log('📋 URLs dos 5 slides:\n');

    urls.forEach((url, i) => {
      console.log(`Slide ${i + 1}: ${url}`);
    });

    console.log('\n💡 Copie os links e veja no navegador!');
    console.log('✅ Dimensões: 1080×1350px (Safe Area)\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  }
}

uploadCarrossel9().catch(console.error);
