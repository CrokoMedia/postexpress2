/**
 * Upload de foto de perfil para Cloudinary
 *
 * Uso:
 *   node scripts/upload-foto-cloudinary.js [username]
 *
 * Exemplo:
 *   node scripts/upload-foto-cloudinary.js umantoniodasilva
 */

import fs from 'fs';
import https from 'https';
import cloudinary from 'cloudinary';
import 'dotenv/config';

// Configurar Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Baixa imagem de uma URL
 */
async function baixarImagem(url, destino) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destino);

    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return baixarImagem(response.headers.location, destino)
          .then(resolve)
          .catch(reject);
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Falha ao baixar: ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve(destino);
      });

      file.on('error', (err) => {
        fs.unlink(destino, () => {});
        reject(err);
      });
    }).on('error', (err) => {
      fs.unlink(destino, () => {});
      reject(err);
    });
  });
}

/**
 * Upload para Cloudinary
 */
async function uploadParaCloudinary(caminhoLocal, username) {
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload(
      caminhoLocal,
      {
        folder: 'instagram-perfis',
        public_id: username,
        overwrite: true,
        transformation: [
          { width: 320, height: 320, crop: 'fill', gravity: 'face' },
          { quality: 'auto:best' }
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

async function processarFotoPerfil(username) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('☁️  UPLOAD FOTO PERFIL - CLOUDINARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`🎯 Perfil: @${username}\n`);

  try {
    // 1. Ler dados do scraper
    const dataFile = `squad-auditores/data/${username}-teste-scraper.json`;

    if (!fs.existsSync(dataFile)) {
      throw new Error(
        `Dados não encontrados: ${dataFile}\n\n` +
        `💡 Execute primeiro: node scripts/test-instagram-scraper.js ${username}`
      );
    }

    console.log(`📂 Lendo dados: ${dataFile}`);
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
    const profile = Array.isArray(data) ? data[0] : data;

    const fotoUrl = profile.profilePicUrlHD || profile.profilePicUrl;

    if (!fotoUrl) {
      throw new Error('URL da foto não encontrada nos dados!');
    }

    console.log(`✅ URL da foto encontrada\n`);

    // 2. Baixar foto localmente (temporário)
    console.log('📥 Baixando foto do Instagram...');

    const tempDir = 'temp';
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFile = `${tempDir}/${username}.jpg`;
    await baixarImagem(fotoUrl, tempFile);

    console.log(`✅ Foto baixada: ${tempFile}\n`);

    // 3. Upload para Cloudinary
    console.log('☁️  Fazendo upload para Cloudinary...');
    const resultado = await uploadParaCloudinary(tempFile, username);

    console.log(`✅ Upload concluído!\n`);

    // 4. Limpar arquivo temporário
    fs.unlinkSync(tempFile);
    console.log(`🗑️  Arquivo temporário removido\n`);

    // 5. Exibir resultado
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RESULTADO DO UPLOAD');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✅ Informações:');
    console.log(`   Public ID: ${resultado.public_id}`);
    console.log(`   Formato: ${resultado.format}`);
    console.log(`   Dimensões: ${resultado.width}x${resultado.height}px`);
    console.log(`   Tamanho: ${(resultado.bytes / 1024).toFixed(2)} KB\n`);

    console.log('🔗 URLs do Cloudinary:\n');
    console.log('📸 URL Original (segura):');
    console.log(`   ${resultado.secure_url}\n`);

    console.log('📸 URL Otimizada (320x320):');
    const urlOtimizada = resultado.secure_url.replace('/upload/', '/upload/w_320,h_320,c_fill,g_face/');
    console.log(`   ${urlOtimizada}\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 UPLOAD CONCLUÍDO COM SUCESSO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 6. Salvar mapeamento
    const mappingFile = 'assets/fotos-perfil/cloudinary-urls.json';
    let mapping = {};

    if (fs.existsSync(mappingFile)) {
      mapping = JSON.parse(fs.readFileSync(mappingFile, 'utf-8'));
    }

    mapping[username] = {
      cloudinary_url: resultado.secure_url,
      cloudinary_url_optimized: urlOtimizada,
      cloudinary_public_id: resultado.public_id,
      uploaded_at: new Date().toISOString(),
      original_url: fotoUrl
    };

    fs.writeFileSync(mappingFile, JSON.stringify(mapping, null, 2));

    console.log('💾 Mapeamento salvo em:');
    console.log(`   ${mappingFile}\n`);

    return {
      success: true,
      username,
      cloudinary_url: resultado.secure_url,
      cloudinary_url_optimized: urlOtimizada,
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
const username = process.argv[2];

if (!username) {
  console.error('❌ Erro: Username não fornecido\n');
  console.log('📖 Uso: node scripts/upload-foto-cloudinary.js [username]\n');
  console.log('📝 Exemplo:');
  console.log('   node scripts/upload-foto-cloudinary.js umantoniodasilva\n');
  process.exit(1);
}

(async () => {
  await processarFotoPerfil(username);
})();
