/**
 * Gera imagem do template com imagem e faz upload para Cloudinary
 *
 * Uso:
 *   node scripts/gerar-e-upload-template-imagem.js
 */

import { readFile } from 'fs/promises';
import { htmlToImage } from '../content-creation-squad/engines/image-generator/lib/screenshot-engine.js';
import cloudinary from 'cloudinary';
import 'dotenv/config';

// Configurar Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload para Cloudinary
 */
async function uploadParaCloudinary(caminhoLocal, publicId) {
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload(
      caminhoLocal,
      {
        folder: 'instagram-templates',
        public_id: publicId,
        overwrite: true,
        quality: 'auto:best'
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
  });
}

async function gerarEUploadTemplate() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📸 GERAR TEMPLATE COM IMAGEM E UPLOAD');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // 1. Ler HTML do template
    console.log('📂 Lendo template HTML...');
    const htmlPath = 'content-creation-squad/templates/slide-branco-com-imagem.html';
    const html = await readFile(htmlPath, 'utf-8');
    console.log('✅ Template lido com sucesso\n');

    // 2. Gerar imagem PNG
    console.log('🖼️  Gerando imagem PNG (1080x1080)...');
    const outputPath = 'temp/template-com-imagem-teste.png';

    await htmlToImage(
      html,
      outputPath,
      { width: 1080, height: 1080 },
      2 // escala 2x para alta qualidade
    );

    console.log(`✅ Imagem gerada: ${outputPath}\n`);

    // 3. Upload para Cloudinary
    console.log('☁️  Fazendo upload para Cloudinary...');
    const resultado = await uploadParaCloudinary(outputPath, 'exemplo-template-com-imagem');
    console.log('✅ Upload concluído!\n');

    // 4. Exibir resultado
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RESULTADO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✅ Informações:');
    console.log(`   Public ID: ${resultado.public_id}`);
    console.log(`   Formato: ${resultado.format}`);
    console.log(`   Dimensões: ${resultado.width}x${resultado.height}px`);
    console.log(`   Tamanho: ${(resultado.bytes / 1024).toFixed(2)} KB\n`);

    console.log('🔗 URL do Cloudinary:\n');
    console.log('📸 URL Segura:');
    console.log(`   ${resultado.secure_url}\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 PROCESSO CONCLUÍDO COM SUCESSO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('👀 Visualize a imagem aqui:');
    console.log(`   ${resultado.secure_url}\n`);

    return {
      success: true,
      cloudinary_url: resultado.secure_url,
      public_id: resultado.public_id,
      width: resultado.width,
      height: resultado.height,
      size_kb: (resultado.bytes / 1024).toFixed(2)
    };

  } catch (error) {
    console.error('\n❌ ERRO:\n');
    console.error(error.message);
    console.log('\n');

    return {
      success: false,
      error: error.message
    };
  }
}

// Executar
(async () => {
  await gerarEUploadTemplate();
})();
