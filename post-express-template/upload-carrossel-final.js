/**
 * Upload Carrossel Final no Cloudinary
 *
 * Uso: node upload-carrossel-final.js [numero-carrossel]
 * Exemplo: node upload-carrossel-final.js 9
 */

require('dotenv').config({ path: '../.env' });
const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');

// Obter número do carrossel do argumento
const numeroCarrossel = process.argv[2] || '9';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadCarrossel() {
  console.log(`🚀 Upload Carrossel #${numeroCarrossel} no Cloudinary\n`);

  const outputDir = path.join(__dirname, `output-carrossel-${numeroCarrossel}-final`);

  if (!fs.existsSync(outputDir)) {
    console.error(`❌ Pasta não encontrada: ${outputDir}`);
    console.log(`💡 Primeiro gere o carrossel: node gerar-carrossel-final.js ${numeroCarrossel}`);
    process.exit(1);
  }

  const urls = [];

  try {
    // Contar quantos slides existem
    const files = fs.readdirSync(outputDir).filter(f => f.startsWith('slide_') && f.endsWith('.png'));
    const totalSlides = files.length;

    console.log(`📊 ${totalSlides} slides encontrados\n`);

    for (let i = 1; i <= totalSlides; i++) {
      const filePath = path.join(outputDir, `slide_${i}.png`);

      console.log(`📸 Upload slide ${i}/${totalSlides}...`);

      const result = await cloudinary.uploader.upload(filePath, {
        folder: `post-express/carrossel-${numeroCarrossel}`,
        public_id: `slide_${i}`,
        overwrite: true,
        resource_type: 'image'
      });

      urls.push(result.secure_url);
      console.log(`   ✅ ${result.secure_url}`);
      console.log(`   📊 ${(result.bytes / 1024).toFixed(2)} KB\n`);
    }

    console.log('═══════════════════════════════════════\n');
    console.log(`🎉 CARROSSEL #${numeroCarrossel} NO CLOUDINARY!\n`);
    console.log(`📋 URLs dos ${totalSlides} slides:\n`);

    urls.forEach((url, i) => {
      console.log(`Slide ${i + 1}: ${url}`);
    });

    console.log('\n💡 Copie os links e veja no navegador!');
    console.log('✅ Dimensões: 1080×1350px (Instagram Safe Area)');
    console.log('✅ Fonte: 44px (estilo Twitter/X)');
    console.log('✅ Sem emojis\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  }
}

uploadCarrossel().catch(console.error);
