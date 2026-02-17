/**
 * OCR Image Analyzer usando Mistral AI Pixtral
 *
 * Extrai texto de imagens de posts do Instagram usando Mistral AI Pixtral
 *
 * Uso:
 *   node scripts/ocr-mistral-analyzer.js <username> [--source=posts-with-comments]
 *
 * Exemplos:
 *   node scripts/ocr-mistral-analyzer.js rodrigogunter_
 *   node scripts/ocr-mistral-analyzer.js frankcosta --source=posts-with-comments
 *
 * Saída:
 *   squad-auditores/data/{username}-ocr-mistral-analysis.json
 */

import { Mistral } from '@mistralai/mistralai';
import fs from 'fs';
import 'dotenv/config';

// Inicializar Mistral
const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

/**
 * Baixa imagem da URL e converte para base64
 */
async function fetchImageAsBase64(imageUrl) {
  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');

    return base64;
  } catch (error) {
    throw new Error(`Falha ao baixar imagem: ${error.message}`);
  }
}

/**
 * Analisa uma única imagem usando Mistral Pixtral
 */
async function analyzeImage(imageUrl, context = {}) {
  try {
    console.log(`   📥 Baixando imagem...`);
    const base64Image = await fetchImageAsBase64(imageUrl);

    console.log(`   🤖 Analisando com Mistral Pixtral...`);

    // Prompt estruturado para extração de texto
    const prompt = `Você é um especialista em análise de conteúdo visual de redes sociais, especialmente carrosséis do Instagram.

Analise esta imagem de carrossel e extraia TODAS as informações de texto visíveis.

Retorne um JSON estruturado no seguinte formato:
{
  "texto_completo": "todo o texto extraído concatenado",
  "titulo_principal": "título principal ou headline (se houver)",
  "subtitulos": ["subtítulo 1", "subtítulo 2"],
  "bullets": ["bullet point 1", "bullet point 2"],
  "cta": "call-to-action (se houver, ex: 'Saiba mais', 'Clique no link')",
  "numeros_destaque": ["números em destaque como estatísticas"],
  "estrutura": "descrição breve da hierarquia visual (ex: 'título + 3 bullets + cta')",
  "cores_predominantes": ["cor principal", "cor secundária"],
  "tipo_conteudo": "educacional|vendas|autoridade|viral|outros",
  "elementos_especiais": ["emojis", "ícones", "badges", "selos"]
}

IMPORTANTE:
- Capture TODO o texto, incluindo pequenos detalhes
- Identifique a hierarquia visual (o que é título vs corpo)
- Detecte o tipo de conteúdo baseado no copy e estrutura
- Para tipo_conteudo, use: "educacional" (como fazer, dicas), "vendas" (CTA de compra/conversão), "autoridade" (credenciais, cases), "viral" (storytelling, emoção)
- Retorne APENAS o JSON, sem markdown ou explicações extras`;

    const result = await client.chat.complete({
      model: 'pixtral-12b-2409',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image_url',
              imageUrl: `data:image/jpeg;base64,${base64Image}`
            }
          ]
        }
      ]
    });

    const text = result.choices[0].message.content;

    // Extrair JSON da resposta (remover markdown se houver)
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '').trim();
    }

    const analysis = JSON.parse(jsonText);

    return {
      success: true,
      imageUrl,
      analysis,
      rawResponse: text,
      model: 'pixtral-12b-2409',
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
      console.log(`      Tipo: ${result.analysis.tipo_conteudo}`);
      console.log(`      Texto: ${result.analysis.texto_completo?.substring(0, 80)}...`);
      imageAnalysis.push(result);
    } else {
      console.log(`   ❌ Falha na análise`);
      imageAnalysis.push(result);
    }

    // Rate limiting (evitar sobrecarga da API)
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
  console.log('🔍 OCR IMAGE ANALYZER - Mistral AI Pixtral');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`🎯 Perfil: @${username}\n`);

  const startTime = Date.now();

  try {
    // Validar API Key
    if (!process.env.MISTRAL_API_KEY) {
      throw new Error('MISTRAL_API_KEY não configurada no .env');
    }

    // Carregar dados dos posts
    const dataDir = 'squad-auditores/data';
    let inputFile = sourceFile;

    if (!inputFile) {
      // Tentar encontrar arquivo automaticamente
      const possibleFiles = [
        `${dataDir}/${username}-posts-with-comments.json`,
        `${dataDir}/${username}-complete-analysis.json`,
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
    console.log('🔍 INICIANDO ANÁLISE OCR COM MISTRAL AI...\n');

    const postsWithOCR = [];

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      const processedPost = await processPost(post, i, posts.length);
      postsWithOCR.push(processedPost);
    }

    // Salvar resultados
    const outputFile = `${dataDir}/${username}-ocr-mistral-analysis.json`;

    fs.writeFileSync(outputFile, JSON.stringify(postsWithOCR, null, 2));

    // Estatísticas finais
    const totalImages = postsWithOCR.reduce((sum, p) => sum + (p.ocr?.totalImages || 0), 0);
    const analyzedImages = postsWithOCR.reduce((sum, p) => sum + (p.ocr?.analyzed || 0), 0);
    const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

    // Estatísticas por tipo de conteúdo
    const tipoStats = {};
    postsWithOCR.forEach(post => {
      post.ocr?.images?.forEach(img => {
        if (img.success && img.analysis?.tipo_conteudo) {
          const tipo = img.analysis.tipo_conteudo;
          tipoStats[tipo] = (tipoStats[tipo] || 0) + 1;
        }
      });
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📈 RESUMO DA ANÁLISE OCR - MISTRAL AI');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`✅ Posts processados: ${postsWithOCR.length}`);
    console.log(`🖼️  Total de imagens: ${totalImages}`);
    console.log(`🔍 Imagens analisadas: ${analyzedImages}`);
    console.log(`⏱️  Tempo decorrido: ${elapsed} minutos`);

    console.log(`\n📊 Tipos de conteúdo detectados:`);
    Object.entries(tipoStats).forEach(([tipo, count]) => {
      console.log(`   ${tipo}: ${count} imagens`);
    });

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
      tipoStats,
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
const username = args[0];

if (!username) {
  console.error('❌ Erro: Username é obrigatório');
  console.log('\nUso: node scripts/ocr-mistral-analyzer.js <username> [--source=arquivo]');
  console.log('\nExemplos:');
  console.log('  node scripts/ocr-mistral-analyzer.js rodrigogunter_');
  console.log('  node scripts/ocr-mistral-analyzer.js frankcosta --source=posts-with-comments');
  process.exit(1);
}

const options = {};
args.forEach(arg => {
  if (arg.startsWith('--source=')) {
    const source = arg.split('=')[1];
    options.sourceFile = `squad-auditores/data/${username}-${source}.json`;
  }
});

analyzePostImages(username, options);
