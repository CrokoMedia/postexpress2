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

function gerarSlide(username) {
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

    // 3. Ler template
    const templateFile = 'templateagoravai.html';

    if (!fs.existsSync(templateFile)) {
      throw new Error(`Template não encontrado: ${templateFile}`);
    }

    console.log(`📄 Lendo template: ${templateFile}`);
    let template = fs.readFileSync(templateFile, 'utf-8');

    // 4. Substituir placeholders
    console.log(`🔄 Substituindo placeholders...`);

    template = template.replace('{{FOTO_URL}}', fotoUrl);
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

gerarSlide(username);
