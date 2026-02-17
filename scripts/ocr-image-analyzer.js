/**
 * OCR Image Analyzer usando Claude Vision API
 *
 * Extrai texto de imagens de posts do Instagram usando Claude Vision
 *
 * Uso:
 *   node scripts/ocr-image-analyzer.js <username> [--source=posts-with-comments]
 *
 * Exemplos:
 *   node scripts/ocr-image-analyzer.js rodrigogunter_
 *   node scripts/ocr-image-analyzer.js frankcosta --source=posts-with-comments
 *
 * Saída:
 *   squad-auditores/data/{username}-ocr-analysis.json
 */

import Tesseract from 'tesseract.js';
import fs from 'fs';
import 'dotenv/config';

/**
 * Analisa uma única imagem usando Tesseract.js
 */
async function analyzeImage(imageUrl, context = {}) {
  try {
    // Usar Tesseract.js para OCR
    const { data: { text } } = await Tesseract.recognize(
      imageUrl,
      'por', // Português
      {
        logger: () => {} // Desabilitar logs verbosos
      }
    );

    // Processar texto extraído
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const titulo = lines[0] || '';
    const bullets = lines.filter(line => /^[•\-\d]/.test(line.trim()));
    const cta = lines[lines.length - 1] || '';

    // Detectar tipo de conteúdo
    const tipo = detectarTipo(text);

    const analysis = {
      texto_completo: text.trim(),
      titulo_principal: titulo,
      subtitulos: [],
      bullets: bullets,
      cta: cta,
      estrutura: lines.length > 0 ? 'texto estruturado' : 'sem texto',
      cores_predominantes: [],
      tipo_conteudo: tipo,
      elementos_especiais: []
    };

    return {
      success: true,
      imageUrl,
      analysis,
      rawResponse: text,
    };

  } catch (error) {
    console.error(`   ⚠️  Erro ao analisar imagem: ${error.message}`);
    return {
      success: false,
      imageUrl,
      error: error.message,
    };
  }
}

function detectarTipo(texto) {
  const lower = texto.toLowerCase();

  if (lower.match(/(comprar|compre|desconto|oferta|promoção|garanta|aproveite)/)) {
    return 'vendas';
  }
  if (lower.match(/(aprenda|descubra|saiba|entenda|passo|dica|como)/)) {
    return 'educacional';
  }
  if (lower.match(/(anos de experiência|especialista|líder|referência|autoridade)/)) {
    return 'autoridade';
  }

  return 'outros';
}

/**
 * Processa todas as imagens de um post
 */
async function processPost(post, index, total) {
  console.log(`\n📸 [${index + 1}/${total}] Processando post: ${post.url || post.shortCode}`);
  console.log(`   Tipo: ${post.type}`);

  const images = [];

  // Coletar todas as imagens do post
  if (post.type === 'Image' && post.displayUrl) {
    images.push(post.displayUrl);
  } else if (post.type === 'Sidecar' && post.images) {
    images.push(...post.images);
  } else if (post.displayUrl) {
    images.push(post.displayUrl);
  }

  console.log(`   🖼️  ${images.length} imagem(ns) encontrada(s)`);

  const imageAnalysis = [];

  for (let i = 0; i < images.length; i++) {
    const imageUrl = images[i];
    console.log(`   [${i + 1}/${images.length}] Analisando imagem...`);

    const result = await analyzeImage(imageUrl, { postIndex: index, imageIndex: i });

    if (result.success) {
      console.log(`   ✅ Texto extraído com sucesso`);
      imageAnalysis.push(result);
    } else {
      console.log(`   ❌ Falha na análise`);
      imageAnalysis.push(result);
    }

    // Rate limiting (Claude tem limites de requisições)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return {
    ...post,
    ocr: {
      totalImages: images.length,
      analyzed: imageAnalysis.filter(a => a.success).length,
      images: imageAnalysis,
    },
  };
}

/**
 * Pipeline principal de OCR
 */
async function analyzePostImages(username, options = {}) {
  const { sourceFile = null } = options;

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 OCR IMAGE ANALYZER - Claude Vision API');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`🎯 Perfil: @${username}\n`);

  const startTime = Date.now();

  try {
    // Carregar dados dos posts
    const dataDir = 'squad-auditores/data';
    let inputFile = sourceFile;

    if (!inputFile) {
      // Tentar encontrar arquivo automaticamente
      const possibleFiles = [
        `${dataDir}/${username}-posts-with-comments.json`,
        `${dataDir}/${username}-instagram-scraper.json`,
        `${dataDir}/${username}-teste-scraper.json`,
      ];

      inputFile = possibleFiles.find(f => fs.existsSync(f));

      if (!inputFile) {
        throw new Error(`Nenhum arquivo de dados encontrado para @${username}`);
      }
    }

    console.log(`📂 Carregando dados: ${inputFile}\n`);

    const posts = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));

    if (!Array.isArray(posts) || posts.length === 0) {
      throw new Error('Arquivo não contém posts válidos');
    }

    console.log(`✅ ${posts.length} posts carregados\n`);

    // Processar posts
    console.log('🔍 INICIANDO ANÁLISE OCR...\n');

    const postsWithOCR = [];

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      const processedPost = await processPost(post, i, posts.length);
      postsWithOCR.push(processedPost);
    }

    // Salvar resultados
    const outputFile = `${dataDir}/${username}-ocr-analysis.json`;

    fs.writeFileSync(outputFile, JSON.stringify(postsWithOCR, null, 2));

    // Estatísticas finais
    const totalImages = postsWithOCR.reduce((sum, p) => sum + (p.ocr?.totalImages || 0), 0);
    const analyzedImages = postsWithOCR.reduce((sum, p) => sum + (p.ocr?.analyzed || 0), 0);
    const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📈 RESUMO DA ANÁLISE OCR');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`✅ Posts processados: ${postsWithOCR.length}`);
    console.log(`🖼️  Total de imagens: ${totalImages}`);
    console.log(`🔍 Imagens analisadas: ${analyzedImages}`);
    console.log(`⏱️  Tempo decorrido: ${elapsed} minutos`);
    console.log(`\n💾 Arquivo salvo: ${outputFile}\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 ANÁLISE OCR CONCLUÍDA!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return {
      success: true,
      posts: postsWithOCR.length,
      totalImages,
      analyzedImages,
      outputFile,
    };

  } catch (error) {
    console.error('\n❌ ERRO:\n', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// CLI
const args = process.argv.slice(2);
const username = args[0] || 'frankcosta';

const options = {};
args.forEach(arg => {
  if (arg.startsWith('--source=')) {
    const source = arg.split('=')[1];
    options.sourceFile = `squad-auditores/data/${username}-${source}.json`;
  }
});

analyzePostImages(username, options);
