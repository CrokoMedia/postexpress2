/**
 * Gera slide HTML a partir dos dados extraídos do Instagram
 *
 * Uso:
 *   node scripts/gerar-slide-perfil.js [username]
 *
 * Exemplo:
 *   node scripts/gerar-slide-perfil.js umantoniodasilva
 */

import fs from 'fs';
import path from 'path';
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

/**
 * Baixa imagem de uma URL e salva localmente
 */
async function baixarImagem(url, destino) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destino);

    https.get(url, (response) => {
      // Seguir redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        return baixarImagem(response.headers.location, destino)
          .then(resolve)
          .catch(reject);
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Falha ao baixar imagem: ${response.statusCode}`));
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

async function gerarSlide(username) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎨 GERADOR DE SLIDES - POST EXPRESS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`🎯 Perfil: @${username}\n`);

  try {
    // 1. Ler dados extraídos do scraper
    const dataFile = `squad-auditores/data/${username}-teste-scraper.json`;

    if (!fs.existsSync(dataFile)) {
      throw new Error(`Arquivo não encontrado: ${dataFile}\n\n💡 Execute primeiro: node scripts/test-instagram-scraper.js ${username}`);
    }

    console.log(`📂 Lendo dados: ${dataFile}`);
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));

    // Pegar o primeiro item (perfil)
    const profile = Array.isArray(data) ? data[0] : data;

    console.log(`✅ Dados carregados!\n`);

    // 2. Extrair campos necessários
    const nome = profile.fullName || profile.name || username;
    const usernameFormatado = profile.username || username;
    const fotoUrl = profile.profilePicUrlHD || profile.profilePicUrl || '';
    const biografia = profile.biography || 'Sem biografia';
    const verificado = profile.verified || false;

    console.log('📊 DADOS DO PERFIL:');
    console.log(`   Nome: ${nome}`);
    console.log(`   Username: @${usernameFormatado}`);
    console.log(`   Verificado: ${verificado ? '✅' : '❌'}`);
    console.log(`   Foto URL: ${fotoUrl ? '✅ Encontrada' : '❌ Não encontrada'}`);
    console.log(`   Biografia: ${biografia.substring(0, 50)}...\n`);

    if (!fotoUrl) {
      console.warn('⚠️  AVISO: Foto de perfil não encontrada nos dados extraídos!\n');
    }

    // 2.5. Baixar foto de perfil localmente
    let fotoLocal = '';
    let fotoCloudinary = '';

    if (fotoUrl) {
      console.log('📥 Baixando foto de perfil...');

      // Criar diretório para fotos se não existir
      const fotosDir = 'assets/fotos-perfil';
      if (!fs.existsSync(fotosDir)) {
        fs.mkdirSync(fotosDir, { recursive: true });
      }

      // Extensão da imagem
      const ext = fotoUrl.includes('.png') ? 'png' : 'jpg';
      fotoLocal = `${fotosDir}/${username}.${ext}`;

      try {
        await baixarImagem(fotoUrl, fotoLocal);
        console.log(`✅ Foto salva localmente: ${fotoLocal}\n`);

        // Upload para Cloudinary
        console.log('☁️  Fazendo upload para Cloudinary...');
        const resultado = await uploadParaCloudinary(fotoLocal, username);

        // URL otimizada do Cloudinary
        fotoCloudinary = resultado.secure_url.replace('/upload/', '/upload/w_320,h_320,c_fill,g_face/');

        console.log(`✅ Upload Cloudinary concluído!`);
        console.log(`   URL: ${fotoCloudinary}\n`);

        // Salvar mapeamento
        const mappingFile = 'assets/fotos-perfil/cloudinary-urls.json';
        let mapping = {};

        if (fs.existsSync(mappingFile)) {
          mapping = JSON.parse(fs.readFileSync(mappingFile, 'utf-8'));
        }

        mapping[username] = {
          cloudinary_url: resultado.secure_url,
          cloudinary_url_optimized: fotoCloudinary,
          cloudinary_public_id: resultado.public_id,
          uploaded_at: new Date().toISOString(),
          local_path: fotoLocal,
          original_url: fotoUrl
        };

        fs.writeFileSync(mappingFile, JSON.stringify(mapping, null, 2));

      } catch (error) {
        console.warn(`⚠️  Erro ao processar foto: ${error.message}`);
        console.warn(`   Usando foto local (se disponível)\n`);
        fotoCloudinary = fotoLocal || fotoUrl; // Fallback
      }
    }

    // 3. Ler template
    const templateFile = 'templateagoravai.html';

    if (!fs.existsSync(templateFile)) {
      throw new Error(`Template não encontrado: ${templateFile}`);
    }

    console.log(`📄 Lendo template: ${templateFile}`);
    let template = fs.readFileSync(templateFile, 'utf-8');

    // 4. Substituir placeholders
    console.log(`🔄 Substituindo placeholders...`);

    // Prioridade: Cloudinary > Local > URL original
    const fotoParaUsar = fotoCloudinary || fotoLocal || fotoUrl;

    template = template.replace('{{FOTO_URL}}', fotoParaUsar);
    template = template.replace('{{NOME}}', nome);
    template = template.replace('{{USERNAME}}', usernameFormatado);
    template = template.replace('{{TEXTO}}', formatarBiografia(biografia));

    // Atualizar o title
    template = template.replace(
      '<title>Template A — Só Texto (1080x1350)</title>',
      `<title>Slide — @${usernameFormatado}</title>`
    );

    // 5. Salvar slide gerado
    const outputFile = `slide-${username}.html`;
    fs.writeFileSync(outputFile, template);

    console.log(`\n✅ Slide gerado com sucesso!`);
    console.log(`📁 Arquivo: ${outputFile}\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 GERAÇÃO CONCLUÍDA!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('💡 Para visualizar:');
    console.log(`   open ${outputFile}\n`);

    return {
      success: true,
      outputFile,
      profile: {
        nome,
        username: usernameFormatado,
        fotoUrl,
        verificado
      }
    };

  } catch (error) {
    console.error('\n❌ ERRO AO GERAR SLIDE:\n');
    console.error(error.message);
    console.log('\n');

    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Formata biografia para HTML com quebras de linha e negrito
 */
function formatarBiografia(bio) {
  // Quebrar linhas
  const linhas = bio.split('\n');

  // Aplicar negrito em palavras em CAPS
  const linhasFormatadas = linhas.map(linha => {
    // Regex para palavras em CAPS (2+ letras maiúsculas seguidas)
    const comNegrito = linha.replace(/\b([A-ZÀ-Ú]{2,})\b/g, '<strong>$1</strong>');
    return `<p>${comNegrito}</p>`;
  });

  return linhasFormatadas.join('\n        ');
}

// Executar
const username = process.argv[2];

if (!username) {
  console.error('❌ Erro: Username não fornecido\n');
  console.log('📖 Uso: node scripts/gerar-slide-perfil.js [username]\n');
  console.log('📝 Exemplo:');
  console.log('   node scripts/gerar-slide-perfil.js umantoniodasilva\n');
  process.exit(1);
}

// Executar de forma assíncrona
(async () => {
  await gerarSlide(username);
})();
