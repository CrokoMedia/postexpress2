/**
 * Upload de imagem de conteúdo para Cloudinary
 *
 * Uso:
 *   node scripts/upload-imagem-conteudo-cloudinary.js [caminho-da-imagem] [nome-publico]
 *
 * Exemplo:
 *   node scripts/upload-imagem-conteudo-cloudinary.js ./imagem.jpg alex-hormozi-launch
 */

import cloudinary from 'cloudinary';
import 'dotenv/config';
import path from 'path';

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
        folder: 'instagram-conteudo',
        public_id: publicId,
        overwrite: true,
        transformation: [
          { width: 980, quality: 'auto:best' }
        ]
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

async function processarImagemConteudo(caminhoImagem, publicId) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('☁️  UPLOAD IMAGEM CONTEÚDO - CLOUDINARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`📸 Imagem: ${caminhoImagem}`);
  console.log(`🏷️  ID: ${publicId}\n`);

  try {
    // Upload para Cloudinary
    console.log('☁️  Fazendo upload para Cloudinary...');
    const resultado = await uploadParaCloudinary(caminhoImagem, publicId);

    console.log(`✅ Upload concluído!\n`);

    // Exibir resultado
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RESULTADO DO UPLOAD');
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
    console.log('🎉 UPLOAD CONCLUÍDO COM SUCESSO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

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
const caminhoImagem = process.argv[2];
const publicId = process.argv[3] || path.basename(caminhoImagem, path.extname(caminhoImagem));

if (!caminhoImagem) {
  console.error('❌ Erro: Caminho da imagem não fornecido\n');
  console.log('📖 Uso: node scripts/upload-imagem-conteudo-cloudinary.js [caminho] [id-publico]\n');
  console.log('📝 Exemplo:');
  console.log('   node scripts/upload-imagem-conteudo-cloudinary.js ./imagem.jpg alex-hormozi\n');
  process.exit(1);
}

(async () => {
  const resultado = await processarImagemConteudo(caminhoImagem, publicId);
  console.log('\n📋 Resultado JSON:');
  console.log(JSON.stringify(resultado, null, 2));
})();
