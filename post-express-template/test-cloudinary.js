/**
 * Post Express - Teste Cloudinary
 *
 * Testa upload de 1 imagem no Cloudinary
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

async function testCloudinaryUpload() {
  console.log('🚀 Testando upload no Cloudinary\n');

  // Verificar configuração
  console.log('📋 Configuração:');
  console.log(`   Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
  console.log(`   API Key: ${process.env.CLOUDINARY_API_KEY?.substring(0, 6)}...`);
  console.log('');

  try {
    // Caminho da imagem de teste (slide 1 do template corrigido)
    const imagePath = path.join(__dirname, 'output-corrigido/slide_1.png');

    console.log(`📸 Fazendo upload: ${imagePath}\n`);

    // Upload
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: 'post-express/carrossel-07',
      public_id: 'teste_slide_1',
      overwrite: true,
      resource_type: 'image'
    });

    console.log('✅ Upload concluído!\n');
    console.log('📊 Resultado:');
    console.log(`   URL: ${result.secure_url}`);
    console.log(`   Public ID: ${result.public_id}`);
    console.log(`   Formato: ${result.format}`);
    console.log(`   Tamanho: ${result.width}x${result.height}`);
    console.log(`   Bytes: ${(result.bytes / 1024).toFixed(2)} KB`);
    console.log(`   Created: ${result.created_at}`);
    console.log('');

    // URL otimizada (Instagram size)
    const optimizedUrl = cloudinary.url(result.public_id, {
      width: 1080,
      height: 1350,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto'
    });

    console.log('🎨 URL Otimizada:');
    console.log(`   ${optimizedUrl}`);
    console.log('');

    console.log('🎉 Teste concluído com sucesso!');
    console.log('💡 Próximo passo: Upload em lote de todos os slides');

  } catch (error) {
    console.error('❌ Erro ao fazer upload:', error.message);
    if (error.http_code) {
      console.error(`   HTTP Code: ${error.http_code}`);
    }
    throw error;
  }
}

// Executa
testCloudinaryUpload().catch(console.error);
